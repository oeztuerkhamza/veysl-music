#!/usr/bin/env node
/**
 * Mail-Diagnose: prüft den *tatsächlich konfigurierten* Versandweg, ohne den
 * Umweg über das Formular.
 *
 * Warum es das gibt: schlägt der Versand im laufenden Betrieb fehl, sieht man
 * davon fast nichts. `POST /api/anfrage` speichert die Anfrage zuerst und
 * antwortet dann mit `200`, und die Auto-Antwort an das Paar ist bewusst
 * "best effort" — ihr Fehler landet in einem `console.warn` und sonst
 * nirgends. Genau der Fall ("die Anfrage kommt an, die Bestätigung an den
 * Kunden nicht") ist damit unsichtbar. Dieses Skript macht ihn sichtbar und
 * gibt die *echte* SMTP-Fehlermeldung aus statt einer verschluckten.
 *
 * Aufruf:
 *   node scripts/mail-test.mjs --to kunde@gmail.com
 *   node scripts/mail-test.mjs --verify-only      # nur Verbindung + Login
 *
 * Auf dem Server im laufenden Container:
 *   docker exec -it veysl-app node scripts/mail-test.mjs --to kunde@gmail.com
 *
 * ---------------------------------------------------------------------------
 * WICHTIG — was dieses Skript beweisen kann und was nicht:
 *
 * Bei `BOOKING_TRANSPORT=smtp` gegen den *eigenen* Postfix heißt ein Erfolg
 * hier NUR: "Postfix hat die Mail zur Zustellung angenommen." Nicht: "die Mail
 * ist beim Empfänger angekommen." Postfix nimmt an, stellt in die Queue und
 * liefert danach selbst aus — schlägt *das* fehl (klassisch: der VPS-Anbieter
 * hat ausgehendes TCP/25 gesperrt, siehe docs/MAIL-SELFHOSTED.md,
 * Voraussetzung 1), sieht die Anwendung davon nichts.
 *
 * Das erklärt das Fehlerbild "an mich kommt sie, an den Kunden nicht" exakt:
 * `info@dj-veys.de` liegt als Postfach auf demselben Postfix und wird lokal
 * zugestellt, ohne je Port 25 nach außen zu benutzen. Die Adresse des Kunden
 * (gmail.com, gmx.de, web.de) verlangt genau diesen Weg nach außen.
 *
 * Die Queue ist deshalb die zweite, entscheidende Prüfung — auf dem Server:
 *   docker exec mailserver postqueue -p        # hängt hier etwas: nicht ausgeliefert
 *   docker exec mailserver nc -zv gmail-smtp-in.l.google.com 25
 *   docker exec mailserver tail -n 200 /var/log/mail.log
 * ---------------------------------------------------------------------------
 */
import { createTransport } from 'nodemailer';

// .env.local (Entwicklung) bzw. .env (Server) einlesen, falls die Werte nicht
// ohnehin schon in der Umgebung stehen — im Container tun sie das, dort ist
// `env_file:` in docker-compose.yml zuständig und beide Dateien fehlen.
for (const file of ['.env.local', '.env']) {
  try {
    process.loadEnvFile(file);
  } catch {
    // Datei existiert nicht — kein Fehler, siehe oben.
  }
}

function arg(name) {
  const i = process.argv.indexOf(name);
  return i === -1 ? undefined : process.argv[i + 1];
}
const has = (name) => process.argv.includes(name);

const to = arg('--to');
const verifyOnly = has('--verify-only');

/** Geheimnisse nie vollständig ausgeben — dieses Skript läuft auch in Logs. */
function mask(value) {
  if (!value) return '(nicht gesetzt)';
  if (value.length <= 4) return '*'.repeat(value.length);
  return `${value.slice(0, 2)}${'*'.repeat(Math.max(value.length - 4, 3))}${value.slice(-2)} (${value.length} Zeichen)`;
}

const transport = process.env.BOOKING_TRANSPORT ?? 'console';

console.log('\n=== Mail-Diagnose ===\n');
console.log(`BOOKING_TRANSPORT    = ${transport}`);
console.log(`BOOKING_NOTIFY_EMAIL = ${process.env.BOOKING_NOTIFY_EMAIL ?? '(nicht gesetzt)'}`);

if (transport === 'console') {
  console.log(`
FEHLER: Der Transport steht auf "console".

Dann wird *keine einzige* Mail wirklich verschickt — der Text wird nur ins
Server-Log geschrieben. Weder die Benachrichtigung an dich noch die Bestätigung
an den Kunden verlässt die Maschine.

Zu setzen (auf dem Server in /opt/veysl/app/.env, lokal in .env.local):

  BOOKING_TRANSPORT=smtp
  SMTP_HOST=mail.dj-veys.de
  SMTP_PORT=587
  SMTP_USER=no-reply@dj-veys.de
  SMTP_PASS=<Passwort des Postfachs>
  SMTP_FROM_EMAIL=DJ Veys <no-reply@dj-veys.de>

Danach:  docker compose up -d app     (kein Rebuild nötig — Laufzeit-Variable)
`);
  process.exit(1);
}

if (transport === 'resend') {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  console.log(`RESEND_API_KEY       = ${mask(key)}`);
  console.log(`RESEND_FROM_EMAIL    = ${from ?? '(nicht gesetzt)'}`);
  if (!key || !from) {
    console.error('\nFEHLER: RESEND_API_KEY und RESEND_FROM_EMAIL müssen beide gesetzt sein.\n');
    process.exit(1);
  }
  if (verifyOnly || !to) {
    console.log('\nHinweis: Resend hat keinen eigenen Verbindungstest. Für einen echten Test:  --to <adresse>\n');
    process.exit(to ? 0 : 1);
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject: 'DJ Veys — Test', text: 'Testmail aus scripts/mail-test.mjs.' }),
    signal: AbortSignal.timeout(15_000),
  });
  const body = await response.text();
  if (!response.ok) {
    console.error(`\nFEHLGESCHLAGEN — Resend antwortete ${response.status}:\n${body}\n`);
    // Der mit Abstand häufigste Fall bei Resend, und er trifft *nur* die
    // Kundenadresse: ohne verifizierte Domain darf ausschließlich an die
    // eigene Konto-Adresse gesendet werden. Die Mail an dich kommt an, die an
    // den Kunden nicht — dasselbe Fehlerbild wie beim gesperrten Port 25.
    if (response.status === 403 || body.includes('verify')) {
      console.error('Sehr wahrscheinlich: die Domain ist in Resend nicht verifiziert. Ohne Verifizierung');
      console.error('erlaubt Resend nur den Versand an die eigene Konto-Adresse.\n');
    }
    process.exit(1);
  }
  console.log(`\nOK — Resend hat die Mail angenommen:\n${body}\n`);
  process.exit(0);
}

if (transport !== 'smtp') {
  console.error(`\nFEHLER: Unbekannter BOOKING_TRANSPORT "${transport}" — erlaubt sind console, resend, smtp.\n`);
  process.exit(1);
}

const host = process.env.SMTP_HOST;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM_EMAIL;
const port = Number(process.env.SMTP_PORT ?? 587);

console.log(`SMTP_HOST            = ${host ?? '(nicht gesetzt)'}`);
console.log(`SMTP_PORT            = ${port}`);
console.log(`SMTP_USER            = ${user ?? '(nicht gesetzt)'}`);
console.log(`SMTP_PASS            = ${mask(pass)}`);
console.log(`SMTP_FROM_EMAIL      = ${from ?? '(nicht gesetzt)'}`);

const missing = [
  ['SMTP_HOST', host],
  ['SMTP_USER', user],
  ['SMTP_PASS', pass],
  ['SMTP_FROM_EMAIL', from],
].filter(([, v]) => !v).map(([k]) => k);

if (missing.length > 0) {
  console.error(`\nFEHLER: Nicht gesetzt: ${missing.join(', ')}\n`);
  process.exit(1);
}

// Dieselbe Prüfung wie in SmtpMailSender. Ohne sie wählte dieses Skript bei
// leerem SMTP_PORT den Port 0 (`Number('')` ist 0, und `??` greift bei einem
// leeren String nicht), lief in einen Verbindungsfehler und meldete "Host nicht
// erreichbar" — während die Anwendung an derselben Konfiguration mit einer
// klaren Konfigurationsmeldung scheitert. Ein Diagnosewerkzeug, das eine andere
// Ursache nennt als der Code, den es diagnostizieren soll, ist schlimmer als
// keins.
if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  console.error(`
FEHLER: SMTP_PORT ist kein gültiger Port: "${process.env.SMTP_PORT ?? ''}"

Ein leerer Wert (SMTP_PORT= ohne Zahl) wird zu 0. Für authentifizierte
Einlieferung gehört hier 587 hin, für implizites TLS 465.
`);
  process.exit(1);
}

// Identisch zu SmtpMailSender in src/app/api/anfrage/_lib/transport.ts —
// wird dort etwas an den Verbindungsoptionen geändert, gehört es hierher
// gespiegelt, sonst testet dieses Skript etwas anderes als die Anwendung.
const transporter = createTransport({
  host,
  port,
  secure: port === 465,
  requireTLS: port !== 465,
  auth: { user, pass },
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 10_000,
  // Ohne das bleibt die Namensauflösung bei nodemailers Standard von 30 s und
  // läuft vor connectionTimeout — dieses Skript hinge dann dreimal so lange wie
  // die Anwendung an derselben Fehlkonfiguration.
  dnsTimeout: 10_000,
  // `pool`/`maxConnections` fehlen hier bewusst: sie sind der einzige
  // Unterschied zu SmtpMailSender und für einen einzelnen Aufruf ohne Wirkung.
  logger: has('--debug'),
  debug: has('--debug'),
});

console.log('\n--- 1. Verbindung + Login ---');
try {
  await transporter.verify();
  console.log('OK — Verbindung steht, STARTTLS ausgehandelt, Login akzeptiert.');
} catch (err) {
  console.error(`FEHLGESCHLAGEN: ${err.message}`);
  const code = err.code ?? '';
  const responseCode = err.responseCode ?? '';
  if (code === 'EAUTH' || responseCode === 535) {
    console.error(`
Das ist genau die Meldung "Passwort falsch" (SMTP 535 / EAUTH).

Benutzername und Passwort in SMTP_USER/SMTP_PASS stimmen nicht mit dem
Postfach überein. Passwort auf dem Server neu setzen:

  docker exec -it mailserver setup email update ${user}

und den neuen Wert in /opt/veysl/app/.env als SMTP_PASS eintragen, dann
  docker compose up -d app

Achtung bei Sonderzeichen: den Wert in .env in Anführungszeichen setzen,
und ein '#' im Passwort beendet die Zeile — Docker Compose liest den Rest
dann als Kommentar. Das ist die häufigste Ursache für ein Passwort, das
"eigentlich richtig" ist und trotzdem abgelehnt wird.`);
  } else if (code === 'ETIMEDOUT' || code === 'ECONNREFUSED' || code === 'ESOCKET') {
    console.error(`
Es kam gar keine Verbindung zustande (${code}). Läuft der Mailserver, und ist
Port ${port} von hier aus erreichbar?

  docker ps | grep mailserver
  docker exec mailserver ss -lntp | grep ${port}`);
  }
  console.error('');
  process.exit(1);
}

if (verifyOnly) {
  console.log('\n(--verify-only: kein Versand.)\n');
  process.exit(0);
}

if (!to) {
  console.error('\nFEHLER: --to <adresse> fehlt. Beispiel: node scripts/mail-test.mjs --to kunde@gmail.com\n');
  process.exit(1);
}

console.log(`\n--- 2. Testmail an ${to} ---`);
try {
  const info = await transporter.sendMail({
    from,
    to,
    subject: 'DJ Veys — Zustelltest',
    text: [
      'Das ist eine Testmail aus scripts/mail-test.mjs.',
      '',
      'Kommt sie an, funktioniert der Weg bis zu diesem Empfänger.',
      'Kommt sie NICHT an, obwohl dieses Skript "angenommen" meldet, hängt sie',
      'in der Postfix-Queue — dann ist ausgehend Port 25 das Problem.',
    ].join('\n'),
  });
  console.log(`Angenommen. Message-ID: ${info.messageId}`);
  console.log(`Server-Antwort: ${info.response}`);
  if (info.rejected?.length) console.log(`Abgelehnt für: ${info.rejected.join(', ')}`);

  const external = !to.endsWith('@dj-veys.de');
  console.log(`
ACHTUNG: "Angenommen" heißt nur, dass ${host} die Mail zur Zustellung
übernommen hat — nicht, dass sie beim Empfänger liegt.${external ? `

"${to}" ist eine externe Adresse. Dafür muss der Server selbst nach außen auf
Port 25 zustellen. Prüfe jetzt auf dem Server, ob das passiert ist:

  docker exec mailserver postqueue -p
      -> leer  = ausgeliefert
      -> Zeilen = hängt fest, meist "Connection timed out" auf Port 25

  docker exec mailserver nc -zv gmail-smtp-in.l.google.com 25
      -> Timeout = netcup hat ausgehendes TCP/25 gesperrt.
         Das ist Voraussetzung 1 in docs/MAIL-SELFHOSTED.md und per
         Support-Ticket freizuschalten. Ohne sie kann keine einzige Mail
         an einen externen Empfänger zugestellt werden.

  docker exec mailserver tail -n 200 /var/log/mail.log` : ''}
`);
  process.exit(0);
} catch (err) {
  console.error(`FEHLGESCHLAGEN: ${err.message}`);
  if (err.responseCode) console.error(`SMTP-Code: ${err.responseCode}`);
  if (err.response) console.error(`Server-Antwort: ${err.response}`);
  console.error('');
  process.exit(1);
}
