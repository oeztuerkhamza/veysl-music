# Eigener Mailserver für dj-veys.de (Postfix / Dovecot / Roundcube)

Selbst gehostetes Postfach `info@dj-veys.de` mit Roundcube als Weboberfläche,
plus die vollständige Konfiguration für Zustellbarkeit — damit ausgehende Mails
nicht im Spam landen.

Das ist die Alternative zum gehosteten Anbieter aus `docs/MAIL-SETUP.md`.
Bewusste Entscheidung des Betreibers; dieses Dokument setzt sie um.

---

## Vor dem Anfangen: drei harte Voraussetzungen

Diese drei entscheiden, ob das Vorhaben überhaupt funktioniert. Keine davon
lässt sich durch Konfiguration umgehen.

### 1. Ausgehender Port 25 muss freigeschaltet sein

VPS-Anbieter — netcup eingeschlossen — blocken ausgehendes TCP/25
standardmäßig, um Spam aus gekaperten Servern zu verhindern. **Ohne
Freischaltung kann der Server keine einzige Mail ausliefern.** Port 587 ist
kein Ersatz: 587 ist die *Einlieferung* durch eigene Clients, 25 ist die
Zustellung von Server zu Server.

Freischaltung per Support-Ticket beantragen, mit Verwendungszweck (eigene
Domain, kein Massenversand). Bei neuen Kunden wird das gelegentlich abgelehnt
oder erst nach einiger Laufzeit gewährt. **Diesen Punkt zuerst klären**, bevor
Zeit in die Installation geht.

### 2. rDNS / PTR-Eintrag

Der PTR-Eintrag der Server-IP muss auf `mail.dj-veys.de` zeigen — einzustellen im
netcup **SCP** (Server → Netzwerk → rDNS). Das ist der wichtigste einzelne
Faktor für Zustellbarkeit: Empfänger prüfen, ob der Name, mit dem sich der
Server meldet, zur IP passt. Fehlt der PTR oder passt er nicht, landen Mails
bei Gmail, GMX und Web.de verlässlich im Spam oder werden ganz abgewiesen.

Es muss in **beide** Richtungen stimmen (Forward-confirmed reverse DNS):

```
mail.dj-veys.de.        A     <SERVER_IPV4>
<SERVER_IPV4>         PTR   mail.dj-veys.de.
```

### 3. Arbeitsspeicher

Der vorhandene VPS hat **4 GB RAM und 2 vCPU** und betreibt zusätzlich die
Website (Next.js + Payload + nginx). Der Mailstack unten braucht ~1–1,5 GB.
Das geht auf, ist aber knapp — `deploy/server-setup.sh` legt 2 GB Swap an, was
Spitzen abfedert. Mailcow wurde deshalb **nicht** gewählt: es verlangt
realistisch ~6 GB und würde diesen Server überfahren.

Wenn Mail langfristig wichtig wird, gehört sie auf einen **eigenen kleinen
VPS** — getrennte Reputation, getrennte Ausfalldomäne, und ein Neustart der
Website reißt nicht das Postfach mit.

---

## Architektur

| Komponente | Rolle |
|---|---|
| **docker-mailserver** | Postfix (SMTP), Dovecot (IMAP), Rspamd (Spamfilter), OpenDKIM, Fail2ban — ein Container, konfiguriert über Dateien |
| **Roundcube** | Weboberfläche, erreichbar unter `https://mail.dj-veys.de` |
| **nginx** | Reverse Proxy für Roundcube, bestehende Instanz aus `docker-compose.yml` |
| **certbot** | TLS für `mail.dj-veys.de` — dieselbe Instanz, nur eine weitere Domain |

Postfächer:

| Adresse | Zweck |
|---|---|
| `info@dj-veys.de` | Echtes Postfach. Impressum, Google Business Profile, Kundenkontakt |
| `no-reply@dj-veys.de` | Nur Versand — die automatische Anfragebestätigung |
| `postmaster@dj-veys.de` | Alias auf `info@` — **Pflicht** nach RFC 2142 |
| `abuse@dj-veys.de` | Alias auf `info@` — Pflicht, und Empfänger prüfen es teils |

Die Trennung von `info@` und `no-reply@` ist Absicht: wird der automatische
Versand einmal als Massenmail eingestuft, beschädigt das nur die Reputation
dieser einen Adresse, nicht die persönliche Korrespondenz.

---

## DNS-Einträge — die vollständige Liste gegen Spam

Alle in der netcup-DNS-Zone, Panel **CCP** → Domains → dj-veys.de → DNS-Einträge
(siehe `docs/DNS-RECORDS.md`). Die Zone liegt auf netcups eigenen Nameservern
(`netcup.firstns.cc` + 4 weitere) — **es ist kein Cloudflare im Spiel.** Eine
frühere Fassung dieses Abschnitts sprach von Cloudflare und der „grauen Wolke";
das traf nie auf dieses Setup zu und ist hier gegenstandslos. (Sollte die Zone
später doch zu Cloudflare wandern, gilt dort: Proxy für `mail` zwingend aus,
denn Cloudflare proxyt kein SMTP.)

| # | Typ | Name | Wert | Warum |
|---|---|---|---|---|
| 1 | A | `mail` | `<SERVER_IPV4>` | Der Mailhost. Proxy **aus** |
| 2 | AAAA | `mail` | `<SERVER_IPV6>` | Nur setzen, wenn IPv6 wirklich sendet — ein AAAA ohne passenden PTR ist schlimmer als keins |
| 3 | MX | `@` | `mail.dj-veys.de` (Prio 10) | Wohin Post für `@dj-veys.de` geht |
| 4 | TXT | `@` | `v=spf1 a:mail.dj-veys.de -all` | Nur dieser Host darf senden. `-all` = hard fail |
| 5 | TXT | `mail._domainkey` | `v=DKIM1; k=rsa; p=<KEY>` | Signatur. Key erzeugt der Container (unten) |
| 6 | TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:info@dj-veys.de; pct=100` | Berichte einsammeln, **erst später verschärfen** |
| 7 | TXT | `_mta-sts` | `v=STSv1; id=2026072601` | Erzwingt TLS für eingehende Mail |
| 8 | TXT | `_smtp._tls` | `v=TLSRPTv1; rua=mailto:info@dj-veys.de` | Berichte über fehlgeschlagene TLS-Verbindungen |
| 9 | CNAME | `mta-sts` | `dj-veys.de` | Hostet die MTA-STS-Policy (siehe unten) |
| 10 | CAA | `@` | `0 issue "letsencrypt.org"` | Nur Let's Encrypt darf Zertifikate ausstellen |

Nur **ein** SPF-Eintrag pro Domain. Wird zusätzlich Resend genutzt, gehört es
in dieselbe Zeile: `v=spf1 a:mail.dj-veys.de include:_spf.resend.com -all`.

### MTA-STS-Policy als Datei

Punkt 7 und 9 brauchen eine erreichbare Policy-Datei unter
`https://mta-sts.dj-veys.de/.well-known/mta-sts.txt`:

```
version: STSv1
mode: enforce
mx: mail.dj-veys.de
max_age: 604800
```

Erst `mode: testing` fahren, Berichte beobachten, dann auf `enforce`. Sonst
lehnen fremde Server die Zustellung ab, wenn das Zertifikat mal nicht passt.

### DANE / TLSA — optional

Bringt zusätzliches Vertrauen, verlangt aber **DNSSEC auf der Zone**. Die Zone
liegt bei netcup und wandert nirgendwohin — eine frühere Fassung sprach hier
von einem Umzug zu Cloudflare, den es nie gab. DNSSEC ist bei netcup im CCP
aktivierbar; das ist ein Schritt für später, nicht für den ersten Aufbau.

---

## Installation

Alles auf dem Server, im Repo-Verzeichnis `/opt/veysl/app`.

### 1. Stack starten

```bash
cd /opt/veysl/app
docker compose -f deploy/mail/docker-compose.mail.yml up -d
```

### 2. Postfächer anlegen

```bash
docker exec -it mailserver setup email add info@dj-veys.de
docker exec -it mailserver setup email add no-reply@dj-veys.de
docker exec -it mailserver setup alias add postmaster@dj-veys.de info@dj-veys.de
docker exec -it mailserver setup alias add abuse@dj-veys.de info@dj-veys.de
```

Passwörter werden interaktiv abgefragt — lange, zufällige nehmen und in den
Passwortmanager, **nicht** in `.env` oder ins Repo.

### 3. DKIM-Schlüssel erzeugen

```bash
docker exec -it mailserver setup config dkim keysize 2048 domain dj-veys.de
```

Der Befehl gibt aus, wohin er den öffentlichen Teil geschrieben hat — der Pfad
hängt davon ab, dass hier **Rspamd** signiert und nicht OpenDKIM (siehe die
`ENABLE_RSPAMD`-Kommentare in der Compose-Datei). Den Pfad aus der Ausgabe
übernehmen, Datei auslesen, und den `p=`-Wert in DNS-Eintrag 5 eintragen. Nicht
raten: ein falscher DKIM-Eintrag ist schlechter als keiner, weil die Prüfung
dann aktiv fehlschlägt statt zu fehlen.

Der private Schlüssel bleibt auf dem Server und muss ins Backup
(`deploy/backup.sh` erweitern — siehe „Offene Punkte").

### 4. TLS-Zertifikat erweitern

```bash
CERTBOT_EMAIL=info@dj-veys.de \
CERTBOT_DOMAINS="dj-veys.de www.dj-veys.de mail.dj-veys.de mta-sts.dj-veys.de" \
deploy/setup-ssl.sh
```

Aktualisiert das bestehende Zertifikat in place, ohne Ausfall.

### 5. Anwendung auf den eigenen Server umstellen

In `/opt/veysl/app/.env`:

```
BOOKING_TRANSPORT=smtp
SMTP_HOST=mail.dj-veys.de
SMTP_PORT=587
SMTP_USER=no-reply@dj-veys.de
SMTP_PASS=<Passwort aus Schritt 2>
SMTP_FROM_EMAIL=DJ Veys <no-reply@dj-veys.de>
BOOKING_NOTIFY_EMAIL=info@dj-veys.de
```

`SmtpMailSender` in `src/app/api/anfrage/_lib/transport.ts` ist implementiert;
`BOOKING_TRANSPORT=smtp` wählt ihn aus. (Eine frühere Fassung dieses Abschnitts
behauptete das Gegenteil — sie stammte aus der Zeit vor der Implementierung und
hat den Aufbau hier unnötig aufgehalten.)

### 6. Den Versandweg prüfen, bevor der erste Kunde ihn prüft

```bash
docker exec -it veysl-app node scripts/mail-test.mjs --verify-only
docker exec -it veysl-app node scripts/mail-test.mjs --to <eigene-gmail-adresse>
```

Schritt 1 trennt "Passwort falsch" (SMTP 535/EAUTH) sauber von "Server nicht
erreichbar" ab. Schritt 2 schickt eine echte Mail an eine **externe** Adresse —
und genau das ist der Weg, den die Bestätigung an das Paar nimmt und den die
Benachrichtigung an `info@dj-veys.de` **nicht** nimmt, weil sie lokal
zugestellt wird.

**Meldet das Skript „angenommen", kommt die Mail aber nie an**, hängt sie in der
Queue. Dann ist ausgehend Port 25 gesperrt (Voraussetzung 1 ganz oben):

```bash
docker exec mailserver postqueue -p                          # nicht leer = hängt
docker exec mailserver nc -zv gmail-smtp-in.l.google.com 25  # Timeout = gesperrt
docker exec mailserver tail -n 200 /var/log/mail.log
```

---

## Prüfliste vor dem ersten echten Versand

Der Reihenfolge nach abarbeiten — jeder Punkt ist ein eigener Grund, im Spam
zu landen.

- [ ] Ausgehender Port 25 durch netcup freigeschaltet und getestet:
      `nc -zv gmail-smtp-in.l.google.com 25`
- [ ] PTR zeigt auf `mail.dj-veys.de`: `dig -x <SERVER_IPV4> +short`
- [ ] Vorwärtsauflösung passt: `dig +short mail.dj-veys.de` ergibt dieselbe IP
- [ ] Postfix meldet sich mit dem richtigen Namen: `postconf myhostname`
      ergibt `mail.dj-veys.de`
- [ ] SPF, DKIM, DMARC aufgelöst:
      `dig +short dj-veys.de TXT` · `dig +short mail._domainkey.dj-veys.de TXT` ·
      `dig +short _dmarc.dj-veys.de TXT`
- [ ] **Kein offenes Relay** — von außen prüfen, sonst wird die IP innerhalb
      von Tagen auf Blocklisten stehen
- [ ] Testmail an Gmail **und** GMX/Web.de — deutsche Paare nutzen beides
- [ ] [mail-tester.com](https://www.mail-tester.com): Ziel **10/10**
- [ ] Im Gmail-Original: `SPF: PASS`, `DKIM: PASS`, `DMARC: PASS`
- [ ] IP auf Blocklisten prüfen (Spamhaus, Barracuda, SORBS)
- [ ] [Google Postmaster Tools](https://postmaster.google.com) und
      [Microsoft SNDS](https://sendersupport.olc.protection.outlook.com/snds/)
      registrieren — ohne die siehst du deine eigene Reputation nicht
- [ ] Roundcube erreichbar unter `https://mail.dj-veys.de`, Login mit `info@`

### Warmlaufen lassen

Eine frische IP hat **keine Sendehistorie**. Nicht am ersten Tag Rundmails
verschicken: erst wenige Mails täglich, über zwei bis drei Wochen steigern.
Für dieses Projekt passt das ohnehin — es geht um einzelne
Anfragebestätigungen, nicht um Kampagnen.

### DMARC stufenweise verschärfen

Start `p=none`. Nach zwei bis vier Wochen ohne Auffälligkeiten in den
Berichten auf `p=quarantine`, später `p=reject`. **Direkt auf `p=reject` zu
gehen blockiert die eigene Post**, solange SPF/DKIM noch nicht sauber sind.

---

## Offene Punkte

- **ERLEDIGT — `SmtpMailSender`**: implementiert in
  `src/app/api/anfrage/_lib/transport.ts`, auswählbar über
  `BOOKING_TRANSPORT=smtp`. Geprüft wird der Weg mit
  `node scripts/mail-test.mjs` (siehe Installationsschritt 6).
- **`deploy/backup.sh` erweitern**: Postfächer (`docker-data/dms/mail-data`)
  und vor allem die **DKIM-Schlüssel** gehören ins Backup. Ein verlorener
  privater DKIM-Schlüssel bedeutet, dass jede bereits signierte Mail nicht mehr
  verifizierbar ist und der DNS-Eintrag neu erzeugt werden muss.
- **Monitoring**: Zustellfehler landen in Postfix' Logs. Ohne Blick darauf
  merkt niemand, wenn Mails abgelehnt werden — die Anfrage ist dann still
  verloren, und genau das sollte der eigene Server verhindern.
- **DANE/TLSA**, sobald DNSSEC für die Zone im netcup-CCP aktiviert ist.
