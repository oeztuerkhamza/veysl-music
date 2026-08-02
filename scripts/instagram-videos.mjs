/**
 * Holt Videos aus dem eigenen Instagram-Konto auf die Platte — als Quelle für
 * Aftermovie-Schnipsel, Showreel-Standbilder und die Social-Strips.
 *
 * ZWEI BETRIEBSARTEN, und die Reihenfolge ist eine Empfehlung, keine Willkür:
 *
 *   --export <ordner>   Verarbeitet den offiziellen Instagram-Datenexport.
 *                       Funktioniert immer, liefert die ORIGINALDATEIEN und
 *                       braucht weder Anmeldung noch Creator-Konto.
 *
 *   --urls <datei>      Lädt einzelne Beiträge direkt über ihre öffentliche
 *                       Adresse. Das ist der Weg, den Dienste wie savefrom
 *                       gehen. Er kann jederzeit an der Anmeldeschranke
 *                       scheitern — siehe „Grenzen“ unten.
 *
 * WAS DIESES SKRIPT BEWUSST NICHT TUT: keine Anmeldedaten, keine
 * Sitzungscookies, keine Proxy-Rotation, keine Umgehung von Ratenbegrenzung.
 * Genau diese drei Dinge sind es, die ein Konto kosten können, und sie sind
 * für das Ziel — die eigenen Videos auf der eigenen Platte — nicht nötig.
 * Zwischen zwei Anfragen wartet es standardmäßig fünf Sekunden.
 *
 * GRENZEN von `--urls`, damit die Fehlermeldung später niemanden überrascht:
 * Instagram liefert öffentliche Beitragsseiten zunehmend nur noch an
 * angemeldete Sitzungen aus. Trifft das Skript auf diese Schranke, sagt es das
 * klar und bricht ab, statt Stunden lang gegen eine Wand zu laufen. Die
 * Antwort darauf ist dann nicht mehr Technik, sondern `--export`: derselbe
 * Inhalt, in besserer Qualität, ohne Schranke.
 *
 * QUALITÄT, der eigentliche Grund für die Reihenfolge oben: Über eine
 * Beitragsseite kommt die für die App transkodierte Fassung. Der Export
 * enthält die Datei so, wie sie hochgeladen wurde. Bei dunklen Hochzeitsvideos
 * ist das ein sichtbarer Unterschied, kein akademischer.
 *
 * BEISPIELE
 *   node scripts/instagram-videos.mjs --export ~/Downloads/instagram-export
 *   node scripts/instagram-videos.mjs --urls beitraege.txt --out .cache/ig
 *   node scripts/instagram-videos.mjs --urls beitraege.txt --delay 8000
 */
import { mkdir, readdir, readFile, stat, writeFile, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const DEFAULT_OUT = '.cache/instagram-videos';
const DEFAULT_DELAY_MS = 5000;

/** Ein normaler Browser-Kennstring. Kein Tarnversuch — ohne ihn antwortet Instagram gar nicht erst. */
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

// ---------------------------------------------------------------------------
// Argumente
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = { out: DEFAULT_OUT, delay: DEFAULT_DELAY_MS };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    const value = argv[i + 1];
    if (flag === '--export') { args.exportDir = value; i++; }
    else if (flag === '--urls') { args.urlsFile = value; i++; }
    else if (flag === '--out') { args.out = value; i++; }
    else if (flag === '--delay') { args.delay = Number(value); i++; }
    else if (flag === '--help' || flag === '-h') { args.help = true; }
  }
  return args;
}

function usage() {
  console.log(`
Instagram-Videos holen

  node scripts/instagram-videos.mjs --export <ordner>   Offizieller Datenexport (empfohlen)
  node scripts/instagram-videos.mjs --urls <datei>      Einzelne Beitrags-URLs, eine pro Zeile

Optionen
  --out <ordner>    Zielordner (Standard: ${DEFAULT_OUT})
  --delay <ms>      Pause zwischen Anfragen bei --urls (Standard: ${DEFAULT_DELAY_MS})

Den Datenexport bekommst du in der App unter:
  Einstellungen → Kontenübersicht → Deine Informationen und Berechtigungen
  → Deine Informationen herunterladen  (Format JSON, Qualität „Hoch")
`);
}

// ---------------------------------------------------------------------------
// Betriebsart 1: offizieller Datenexport
// ---------------------------------------------------------------------------

async function walk(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await walk(full)));
    else found.push(full);
  }
  return found;
}

/**
 * Sammelt Zeitstempel und Bildunterschriften aus den `*.json`-Dateien des
 * Exports, damit die Zieldateien nach Datum benannt werden können statt nach
 * Instagrams internen Kürzeln. Fehlt die Zuordnung, ist das kein Fehler — die
 * Datei behält dann einfach ihren Originalnamen.
 */
async function readExportMetadata(files) {
  const byBasename = new Map();
  for (const file of files.filter((f) => f.endsWith('.json'))) {
    let parsed;
    try {
      parsed = JSON.parse(await readFile(file, 'utf8'));
    } catch {
      continue; // Keine Metadaten, kein Drama.
    }
    const stack = [parsed];
    while (stack.length) {
      const node = stack.pop();
      if (Array.isArray(node)) { stack.push(...node); continue; }
      if (!node || typeof node !== 'object') continue;
      if (typeof node.uri === 'string' && node.uri.includes('.')) {
        byBasename.set(path.basename(node.uri), {
          takenAt: node.creation_timestamp ?? node.taken_at ?? null,
          title: typeof node.title === 'string' ? node.title : null,
        });
      }
      stack.push(...Object.values(node));
    }
  }
  return byBasename;
}

async function runExport(exportDir, outDir) {
  if (!existsSync(exportDir)) {
    console.error(`Ordner nicht gefunden: ${exportDir}`);
    process.exit(1);
  }

  const files = await walk(exportDir);
  const videos = files.filter((f) => /\.(mp4|mov|m4v)$/i.test(f));

  if (videos.length === 0) {
    console.error(
      'Keine Videodateien im Export gefunden.\n' +
        'Ist das der ENTPACKTE Exportordner? Die ZIP-Datei selbst wird nicht gelesen.'
    );
    process.exit(1);
  }

  const meta = await readExportMetadata(files);
  await mkdir(outDir, { recursive: true });

  const manifest = [];
  for (const source of videos) {
    const base = path.basename(source);
    const info = meta.get(base);
    const stamp = info?.takenAt ? new Date(info.takenAt * 1000).toISOString().slice(0, 10) : null;
    const target = path.join(outDir, stamp ? `${stamp}-${base}` : base);

    await copyFile(source, target);
    const { size } = await stat(target);
    manifest.push({ file: path.basename(target), source: base, takenAt: stamp, title: info?.title ?? null, bytes: size });
    console.log(`${String(Math.round(size / 1024 / 1024)).padStart(4)} MB  ${path.basename(target)}`);
  }

  await writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`\n${manifest.length} Videos in ${outDir} (Originalqualität). manifest.json geschrieben.`);
}

// ---------------------------------------------------------------------------
// Betriebsart 2: einzelne Beitrags-URLs
// ---------------------------------------------------------------------------

const SHORTCODE = /instagram\.com\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Zieht die Video-Adresse aus einer öffentlich ausgelieferten Beitragsseite.
 *
 * Zwei Wege, beide auf Daten, die Instagram von sich aus in die Seite legt,
 * damit ein Browser bzw. eine Einbettung sie darstellen kann:
 *
 *   1. `og:video` — das Meta-Tag, mit dem jede Vorschau in WhatsApp, Slack
 *      oder Facebook arbeitet.
 *   2. Die Einbettungsseite `/embed/captioned/`, die es genau dafür gibt,
 *      Beiträge auf fremden Seiten zu zeigen.
 *
 * Beides ist der dokumentierte Vorschau-/Einbettungspfad, nicht ein privater
 * API-Endpunkt. Wenn Instagram beide hinter die Anmeldung schiebt, ist hier
 * Schluss — und das ist dann auch die richtige Antwort, nicht der Anlass für
 * einen Trick.
 */
async function resolveVideoUrl(shortcode) {
  const pages = [
    `https://www.instagram.com/p/${shortcode}/`,
    `https://www.instagram.com/p/${shortcode}/embed/captioned/`,
  ];

  // Unterscheidet „Seite kam an, enthielt aber kein Video" von „Seite kam gar
  // nicht an". Ohne das meldet ein gelöschter oder vertippter Beitrag
  // „Foto-Beitrag?", und man sucht den Fehler an der falschen Stelle.
  let reached = false;

  for (const page of pages) {
    const res = await fetch(page, { headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'de,en;q=0.8' } });
    if (res.status === 429) return { error: 'rate-limited' };
    if (!res.ok) continue;
    reached = true;

    const html = await res.text();
    if (/loginForm|accounts\/login/i.test(html) && !/og:video|video_url/i.test(html)) {
      return { error: 'login-wall' };
    }

    const og = html.match(/property=["']og:video["'][^>]*content=["']([^"']+)["']/i);
    if (og) return { url: og[1].replace(/&amp;/g, '&') };

    const embedded = html.match(/"video_url":"([^"]+)"/);
    if (embedded) return { url: JSON.parse(`"${embedded[1]}"`) };
  }

  return { error: reached ? 'no-video-found' : 'not-reachable' };
}

async function runUrls(urlsFile, outDir, delayMs) {
  if (!existsSync(urlsFile)) {
    console.error(`Datei nicht gefunden: ${urlsFile}`);
    process.exit(1);
  }

  const lines = (await readFile(urlsFile, 'utf8'))
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));

  const codes = [];
  for (const line of lines) {
    const m = line.match(SHORTCODE);
    if (m) codes.push(m[1]);
    else console.warn(`übersprungen (keine Beitrags-URL): ${line}`);
  }

  if (codes.length === 0) {
    console.error('Keine verwertbaren Instagram-Beitrags-URLs in der Datei.');
    process.exit(1);
  }

  await mkdir(outDir, { recursive: true });
  console.log(`${codes.length} Beiträge, ${delayMs} ms Pause dazwischen.\n`);

  const manifest = [];
  let wall = 0;

  for (const [index, code] of codes.entries()) {
    const target = path.join(outDir, `${code}.mp4`);
    if (existsSync(target)) {
      console.log(`[${index + 1}/${codes.length}] ${code} — schon da, übersprungen`);
      continue;
    }

    const result = await resolveVideoUrl(code);

    if (result.error === 'login-wall') {
      wall++;
      console.warn(`[${index + 1}/${codes.length}] ${code} — Anmeldeschranke`);
      if (wall >= 3) {
        console.error(
          '\nInstagram liefert diese Seiten ohne Anmeldung nicht mehr aus.\n' +
            'Hier ist mit diesem Weg Schluss — und zwar unabhängig davon, wie lange man wartet.\n\n' +
            'Der Datenexport hat diese Schranke nicht und liefert zusätzlich die Originaldateien:\n' +
            '  Einstellungen → Kontenübersicht → Deine Informationen und Berechtigungen\n' +
            '  → Deine Informationen herunterladen\n\n' +
            'Danach:  node scripts/instagram-videos.mjs --export <entpackter-ordner>'
        );
        break;
      }
      await sleep(delayMs);
      continue;
    }

    if (result.error === 'rate-limited') {
      console.error(
        `\n[${index + 1}/${codes.length}] ${code} — Instagram bremst (HTTP 429).\n` +
          `Abbruch. Später mit größerem --delay erneut versuchen; die schon geladenen Dateien werden übersprungen.`
      );
      break;
    }

    if (result.error === 'not-reachable') {
      console.warn(`[${index + 1}/${codes.length}] ${code} — Beitrag nicht erreichbar (gelöscht, privat oder vertippt?)`);
      await sleep(delayMs);
      continue;
    }

    if (result.error) {
      console.warn(`[${index + 1}/${codes.length}] ${code} — kein Video im Beitrag (Foto-Beitrag?)`);
      await sleep(delayMs);
      continue;
    }

    const video = await fetch(result.url, { headers: { 'User-Agent': USER_AGENT } });
    if (!video.ok) {
      console.warn(`[${index + 1}/${codes.length}] ${code} — Download fehlgeschlagen (${video.status})`);
      await sleep(delayMs);
      continue;
    }

    const bytes = Buffer.from(await video.arrayBuffer());
    await writeFile(target, bytes);
    manifest.push({ file: path.basename(target), shortcode: code, bytes: bytes.length });
    console.log(`[${index + 1}/${codes.length}] ${code} — ${Math.round(bytes.length / 1024 / 1024)} MB`);

    if (index < codes.length - 1) await sleep(delayMs);
  }

  if (manifest.length > 0) {
    await writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  }
  console.log(`\n${manifest.length} Videos in ${outDir}.`);
  if (manifest.length > 0) {
    console.log('Hinweis: Das sind Instagrams transkodierte Fassungen, nicht die Originaldateien.');
  }
}

// ---------------------------------------------------------------------------

const args = parseArgs(process.argv.slice(2));

if (args.help || (!args.exportDir && !args.urlsFile)) {
  usage();
  process.exit(args.help ? 0 : 1);
}

if (args.exportDir) await runExport(args.exportDir, args.out);
else await runUrls(args.urlsFile, args.out, args.delay);
