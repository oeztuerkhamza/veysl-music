#!/usr/bin/env node
/**
 * Search-Console-Export gegen die echte Website prüfen und sortieren:
 * „Absicht" oder „Fehler"?
 *
 *   node scripts/gsc-triage.mjs urls.csv
 *   node scripts/gsc-triage.mjs urls.csv --base http://localhost:3000 --out bericht.csv
 *
 * Eingabe: der Export eines Berichts unter Search Console → Seitenindexierung →
 * (Grund anklicken) → Export. CSV oder TXT, die URLs dürfen irgendwo in der
 * Zeile stehen; eine Zeile ohne URL wird ignoriert.
 *
 * Warum es das braucht: Der Bericht zählt Seiten (273 × 404, 22 × Weiterleitung,
 * 16 × robots.txt, 20 × noindex …), sagt aber nicht, welche davon gewollt sind.
 * Auf dieser Website ist das meiste gewollt — Sprachvarianten, die es nie gab,
 * alte Slugs mit 301, Impressum und Datenschutz mit noindex, API-Pfade in
 * robots.txt. Gebraucht wird die Liste der wenigen Ausnahmen. Das Skript ruft
 * jede URL ab und bewertet sie:
 *
 *   erwartet   — die Antwort der Website ist richtig, die Meldung ist Rauschen
 *   PRÜFEN     — eine echte Seite fehlt, eine Weiterleitung endet im Leeren,
 *                eine Seite aus der Sitemap trägt noindex, …
 *   offen      — die Seite ist live und indexierbar; Google hat sie nur (noch)
 *                nicht aufgenommen. Das ist eine Qualitäts-/Crawl-Frage, kein
 *                technischer Fehler.
 *
 * `--origin` (Standard https://dj-veys.de) ist die Adresse in der Eingabe,
 * `--base` die Adresse, die tatsächlich abgefragt wird. Gleiche Adresse =
 * gegen die Live-Seite; `--base http://localhost:3000` prüft einen lokalen Build
 * mit den Adressen aus dem Export.
 *
 * Keine Abhängigkeiten, Node >= 18.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
const file = args.find((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'));
if (!file) {
  console.error('Aufruf: node scripts/gsc-triage.mjs <urls.csv> [--origin https://dj-veys.de] [--base http://localhost:3000] [--out bericht.csv]');
  process.exit(2);
}
const ORIGIN = new URL(flag('--origin', 'https://dj-veys.de'));
const BASE = new URL(flag('--base', ORIGIN.origin));
const OUT = flag('--out', null);

/** Sprachen, in denen Inhaltsseiten (Stadt, Region, Ratgeber, Landesseiten) nie ausgespielt wurden. */
const UNSHIPPED_LOCALES = new Set(['ku', 'ar', 'nl', 'fr', 'es']);
const ALL_LOCALES = new Set(['de', 'tr', 'ku', 'ar', 'en', 'nl', 'fr', 'es']);

const text = readFileSync(file, 'utf8');
const found = new Set();
for (const m of text.matchAll(/https?:\/\/[^\s",;<>]+|(?<=^|[\s",;])\/[^\s",;<>]*/gm)) {
  let u = m[0].replace(/[)\].]+$/, '');
  try {
    const url = new URL(u, ORIGIN);
    url.hash = '';
    found.add(url.toString());
  } catch {
    /* keine URL */
  }
}
const urls = [...found];
if (urls.length === 0) {
  console.error('Keine URLs in der Datei gefunden.');
  process.exit(2);
}

const normPath = (p) => (p.length > 1 ? p.replace(/\/+$/, '') : p) || '/';
const get = (path) => fetch(new URL(path, BASE), { redirect: 'manual', headers: { 'user-agent': 'gsc-triage' } });

// Sitemap und robots.txt der Seite selbst.
const sitemapRes = await get('/sitemap.xml').catch(() => null);
if (!sitemapRes?.ok) {
  console.error(`sitemap.xml unter ${BASE.origin} nicht erreichbar — läuft der Server?`);
  process.exit(2);
}
const sitemap = new Set(
  [...(await sitemapRes.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => normPath(new URL(m[1]).pathname)),
);

// Alle Slugs, die irgendeine Sprache für irgendeine Seite hat — aus den
// hreflang-Alternativen der Sitemap. Eine 404-Adresse, deren letztes Segment
// hier vorkommt, aber unter dem falschen Sprachpfad steht, ist ein Slug aus
// einer anderen Sprache (siehe `language-switcher.tsx`).
const sitemapXml = await get('/sitemap.xml').then((r) => r.text());
const knownSlugs = new Set(
  [...sitemapXml.matchAll(/href="([^"]+)"/g)].map((m) => {
    try {
      return new URL(m[1]).pathname.split('/').filter(Boolean).pop();
    } catch {
      return undefined;
    }
  }).filter(Boolean),
);

const robotsText = await get('/robots.txt').then((r) => r.text()).catch(() => '');
const rules = [];
{
  let applies = false;
  for (const line of robotsText.split('\n')) {
    const l = line.split('#')[0].trim();
    const [k, ...rest] = l.split(':');
    const v = rest.join(':').trim();
    if (/^user-agent$/i.test(k)) applies = v === '*';
    else if (applies && /^(dis)?allow$/i.test(k) && v) rules.push({ allow: /^allow$/i.test(k), path: v });
  }
}
/** Längste passende Regel gewinnt, bei Gleichstand Allow — wie bei Google. */
function robotsBlocked(path) {
  let best = null;
  for (const r of rules) {
    if (path.startsWith(r.path) && (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow))) best = r;
  }
  return best ? !best.allow : false;
}

const localeOf = (path) => {
  const first = path.split('/')[1];
  return ALL_LOCALES.has(first) ? first : 'de';
};

async function triage(raw) {
  const url = new URL(raw);
  const path = normPath(decodeURIComponent(url.pathname));
  const sameHost = url.host === ORIGIN.host && url.protocol === ORIGIN.protocol;
  const row = { url: raw, status: '', verdict: '', note: '', bucket: '' };

  if (robotsBlocked(path)) {
    row.bucket = 'robots.txt';
    row.verdict = path.startsWith('/api/') || path.startsWith('/admin') ? 'erwartet' : 'PRÜFEN';
    row.note =
      row.verdict === 'erwartet'
        ? 'API-/Admin-Pfad, bewusst gesperrt'
        : 'durch eine robots.txt-Regel gesperrt, die keine API-/Admin-Regel ist';
    return row;
  }

  let res;
  try {
    res = await get(url.pathname + url.search);
  } catch (e) {
    return { ...row, status: 'Fehler', verdict: 'PRÜFEN', note: `nicht abrufbar: ${e.message}` };
  }
  row.status = String(res.status);

  if (res.status >= 300 && res.status < 400) {
    row.bucket = 'Weiterleitung';
    const location = res.headers.get('location') ?? '';
    const target = new URL(location, BASE);
    let hop;
    try {
      hop = await get(target.pathname + target.search);
    } catch {
      hop = null;
    }
    const targetPath = normPath(target.pathname);
    if (!hop || hop.status >= 300) {
      row.verdict = 'PRÜFEN';
      row.note = `Weiterleitung auf ${targetPath}, das selbst ${hop ? 'weiterleitet' : 'nicht antwortet'} (Kette)`;
    } else if (hop.status !== 200) {
      row.verdict = 'PRÜFEN';
      row.note = `Weiterleitung auf ${targetPath}, das ${hop.status} liefert`;
    } else {
      row.verdict = 'erwartet';
      row.note = `→ ${targetPath}${sitemap.has(targetPath) ? ' (steht in der Sitemap)' : ''}`;
    }
    return row;
  }

  if (res.status === 404 || res.status === 410) {
    row.bucket = '404';
    const locale = localeOf(path);
    if (path.startsWith('/api/')) {
      row.verdict = 'erwartet';
      row.note = path.startsWith('/api/social/media/')
        ? 'Vorschaubild aus dem Server-Cache (inhaltsadressiert); fehlt der Cache-Eintrag, gibt es kein Bild — keine Seite'
        : 'API-Adresse, keine Seite';
    } else if (path.startsWith('/_next/static/')) {
      row.verdict = 'erwartet';
      row.note = 'Datei eines früheren Builds (Hash im Namen ändert sich bei jedem Deploy)';
    } else if (url.hostname.endsWith(`.${ORIGIN.hostname}`) && !url.hostname.startsWith('www.')) {
      row.verdict = 'erwartet';
      row.note = `Subdomain ${url.hostname} (z. B. mta-sts) — gehört zur Domain-Property, ist keine Seite`;
    } else if (url.searchParams.has('_rsc')) {
      row.verdict = 'erwartet';
      row.note = 'Next.js-Prefetch-Adresse (?_rsc=), keine echte Seite';
    } else if (!sitemap.has(path) && knownSlugs.has(path.split('/').filter(Boolean).pop())) {
      row.verdict = 'erwartet';
      row.note = `Slug aus einer anderen Sprache unter dem Pfad von „${locale}" — erzeugte der frühere Sprachumschalter (behoben)`;
    } else if (UNSHIPPED_LOCALES.has(locale)) {
      row.verdict = 'erwartet';
      row.note = `diese Seite gibt es in „${locale}" nicht (Stadt-, Regions- und Landesseiten existieren nur in de/tr/en, Ratgeber nur teilweise)`;
    } else if (!sameHost) {
      row.verdict = 'PRÜFEN';
      row.note = 'andere Host-/Protokollvariante liefert 404 statt Weiterleitung';
    } else {
      row.verdict = 'PRÜFEN';
      row.note = `404 in einer ausgespielten Sprache (${locale}) — alte Adresse? Wenn ja, 301 auf das Ziel ergänzen (next.config.ts)`;
    }
    return row;
  }

  if (res.status >= 500) {
    row.bucket = 'Serverfehler';
    row.verdict = 'PRÜFEN';
    row.note = `Serverfehler ${res.status}`;
    return row;
  }

  if (res.status === 200) {
    const body = await res.text();
    const noindex = /<meta name="robots" content="[^"]*noindex/i.test(body);
    const inSitemap = sitemap.has(path);
    if (noindex) {
      row.bucket = 'noindex';
      row.verdict = inSitemap ? 'PRÜFEN' : 'erwartet';
      row.note = inSitemap
        ? 'noindex, steht aber in der Sitemap — Widerspruch'
        : 'noindex und nicht in der Sitemap (z. B. Impressum, Datenschutz, FAQ in Sprachen ohne Antworten)';
    } else {
      row.bucket = 'live';
      row.verdict = 'offen';
      row.note = inSitemap
        ? 'live, indexierbar, in der Sitemap — Google hat sie (noch) nicht aufgenommen'
        : 'live und indexierbar, aber nicht in der Sitemap';
    }
    return row;
  }

  row.verdict = 'PRÜFEN';
  row.note = `Status ${res.status}`;
  return row;
}

const results = [];
let next = 0;
await Promise.all(
  Array.from({ length: 8 }, async () => {
    while (next < urls.length) results[next] = await triage(urls[next++]);
  }),
);

const count = (list, key) => list.reduce((m, r) => m.set(r[key], (m.get(r[key]) ?? 0) + 1), new Map());
console.log(`${results.length} URLs gegen ${BASE.origin} geprüft.\n`);
console.log('Verdikt            Anzahl');
for (const [verdict, n] of [...count(results, 'verdict')].sort()) console.log(`${verdict.padEnd(18)} ${n}`);
console.log('\nNach Fundort:');
const byBucket = new Map();
for (const r of results) {
  const k = `${r.bucket || '—'} / ${r.verdict}`;
  byBucket.set(k, (byBucket.get(k) ?? 0) + 1);
}
for (const [k, n] of [...byBucket].sort()) console.log(`  ${k.padEnd(32)} ${n}`);

const attention = results.filter((r) => r.verdict === 'PRÜFEN');
if (attention.length) {
  console.log(`\nPRÜFEN (${attention.length}):`);
  for (const r of attention.slice(0, 60)) console.log(`  ${r.status || '—'}  ${r.url}\n        ${r.note}`);
  if (attention.length > 60) console.log(`  … und ${attention.length - 60} weitere (siehe --out).`);
}

if (OUT) {
  const esc = (s) => `"${String(s).replaceAll('"', '""')}"`;
  writeFileSync(
    OUT,
    ['url,status,fundort,verdikt,hinweis', ...results.map((r) => [r.url, r.status, r.bucket, r.verdict, r.note].map(esc).join(','))].join('\n') + '\n',
  );
  console.log(`\nBericht geschrieben: ${OUT}`);
}
process.exit(attention.length > 0 ? 1 : 0);
