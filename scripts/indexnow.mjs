#!/usr/bin/env node
/**
 * IndexNow-Ping für Bing (und damit Copilot / ChatGPT-Suche, Yandex, Naver …).
 * Google nutzt IndexNow nicht.
 *
 *   npm run indexnow                    # alle URLs aus https://dj-veys.de/sitemap.xml
 *   npm run indexnow -- --dry-run       # nur anzeigen, nichts senden
 *   npm run indexnow -- /tr/blog/x /de  # nur diese Pfade (oder volle URLs)
 *
 * Voraussetzung: Die Schlüsseldatei `public/<key>.txt` ist deployt und unter
 * https://dj-veys.de/<key>.txt erreichbar. Ihr Inhalt ist der Schlüssel selbst.
 * Der Schlüssel ist kein Geheimnis — er wird absichtlich öffentlich ausgeliefert.
 *
 * Bewusst manuell, nicht Teil von deploy.sh: ein Ping nach jedem Deploy meldet
 * auch unveränderte URLs, und Bing wertet wiederholte Pings ohne Änderung
 * als Rauschen. Nach neuen oder geänderten Seiten ausführen.
 * Keine Abhängigkeiten: Node >= 18 genügt.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ORIGIN = 'https://dj-veys.de';
const ENDPOINT = 'https://api.indexnow.org/IndexNow';
const MAX_URLS = 10000; // Limit pro Anfrage laut indexnow.org

const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

// Schlüsseldatei finden: genau eine 32-stellige Hex-Datei in public/.
const keyFiles = readdirSync(publicDir).filter((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (keyFiles.length !== 1) {
  console.error(`Erwartet genau eine Schlüsseldatei public/<32 hex>.txt, gefunden: ${keyFiles.length}`);
  process.exit(1);
}
const key = keyFiles[0].replace(/\.txt$/, '');
if (readFileSync(path.join(publicDir, keyFiles[0]), 'utf8').trim() !== key) {
  console.error('Inhalt der Schlüsseldatei stimmt nicht mit ihrem Dateinamen überein.');
  process.exit(1);
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const explicit = args.filter((a) => !a.startsWith('--'));

let urls;
if (explicit.length > 0) {
  urls = explicit.map((a) => (a.startsWith('http') ? a : `${ORIGIN}${a.startsWith('/') ? '' : '/'}${a}`));
} else {
  const res = await fetch(`${ORIGIN}/sitemap.xml`);
  if (!res.ok) {
    console.error(`sitemap.xml nicht erreichbar (HTTP ${res.status}).`);
    process.exit(1);
  }
  urls = [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&'));
}

urls = [...new Set(urls)].filter((u) => new URL(u).host === new URL(ORIGIN).host);
if (urls.length === 0 || urls.length > MAX_URLS) {
  console.error(`Ungültige URL-Anzahl: ${urls.length} (erlaubt 1–${MAX_URLS}).`);
  process.exit(1);
}

console.log(`${urls.length} URLs, Schlüssel ${key.slice(0, 6)}…${dryRun ? ' (dry-run)' : ''}`);
if (dryRun) {
  urls.slice(0, 5).forEach((u) => console.log('  ', u));
  if (urls.length > 5) console.log(`   … und ${urls.length - 5} weitere`);
  process.exit(0);
}

const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: new URL(ORIGIN).host,
    key,
    keyLocation: `${ORIGIN}/${key}.txt`,
    urlList: urls,
  }),
});

// 200/202 = angenommen. 403 = Schlüssel nicht gefunden/ungültig, 422 = URLs gehören nicht zum Host.
console.log(`IndexNow: HTTP ${res.status} ${res.statusText}`);
process.exit(res.status === 200 || res.status === 202 ? 0 : 1);
