#!/usr/bin/env node
/**
 * SEO-Prüfung für alle URLs aus der sitemap.xml.
 *
 *   npm run build && npm run start          # in einem Terminal
 *   npm run seo:check                       # im anderen (Standard: http://localhost:3000)
 *   npm run seo:check -- http://localhost:3123
 *
 * Entstanden aus der manuellen Prüfung vom Oktober 2026
 * (docs/SEO-INCELEME-EKIM-2026.md): Dieselben Kontrollen, nur wiederholbar.
 * Sie ersetzt weder Lighthouse noch die Search Console — sie fängt die
 * Fehler ab, die ein Deploy still einschleppt: ein zu langer Titel, eine
 * Seite ohne Schema, ein kaputtes hreflang-Paar, eine noindex-Seite in der
 * Sitemap.
 *
 * Fehler (rot) beenden das Skript mit Exit-Code 1, Hinweise (gelb) nicht.
 * Keine Abhängigkeiten: Node >= 18 genügt.
 */

const PROD_ORIGIN = 'https://dj-veys.de';
const base = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '');
const CONCURRENCY = 8;

const TITLE_MAX = 60;
const DESC_MIN = 70;
const DESC_MAX = 160;

const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)));

const len = (s) => [...s].length;

function attrs(tag) {
  const out = {};
  for (const m of tag.matchAll(/([a-zA-Z-:]+)\s*=\s*"([^"]*)"/g)) out[m[1].toLowerCase()] = decode(m[2]);
  return out;
}

function parse(html) {
  const title = decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').trim());
  const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => attrs(m[0]));
  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => attrs(m[0]));
  const description = metas.find((m) => m.name === 'description')?.content ?? '';
  const robots = metas.find((m) => m.name === 'robots')?.content ?? '';
  const canonicals = links.filter((l) => l.rel === 'canonical').map((l) => l.href);
  const hreflang = Object.fromEntries(
    links.filter((l) => l.rel === 'alternate' && l.hreflang).map((l) => [l.hreflang, l.href]),
  );
  const h1s = [...html.matchAll(/<h1\b/gi)].length;
  const ld = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  const ldInvalid = ld.filter((j) => {
    try {
      JSON.parse(j);
      return false;
    } catch {
      return true;
    }
  }).length;
  const imgsWithoutAlt = [...html.matchAll(/<img\b[^>]*>/gi)].filter((m) => !/\salt=/i.test(m[0])).length;
  return { title, description, robots, canonicals, hreflang, h1s, ldCount: ld.length, ldInvalid, imgsWithoutAlt };
}

const norm = (u) => u.replace(/\/$/, '');
const localPath = (u) => u.replace(PROD_ORIGIN, '') || '/';

async function pool(items, worker) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await worker(items[i]);
      }
    }),
  );
  return results;
}

const errors = [];
const warnings = [];
const err = (url, msg) => errors.push(`${localPath(url)}  ${msg}`);
const warn = (url, msg) => warnings.push(`${localPath(url)}  ${msg}`);

const sitemapRes = await fetch(`${base}/sitemap.xml`).catch(() => null);
if (!sitemapRes?.ok) {
  console.error(`sitemap.xml unter ${base} nicht erreichbar. Läuft der Server? (npm run start)`);
  process.exit(2);
}
const urls = [...(await sitemapRes.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
console.log(`${urls.length} URLs aus der Sitemap, Prüfung gegen ${base} …`);

const pages = new Map();
await pool(urls, async (url) => {
  const res = await fetch(base + localPath(url), { redirect: 'manual' }).catch(() => null);
  if (!res) return err(url, 'nicht erreichbar');
  if (res.status !== 200) return err(url, `Status ${res.status}`);
  pages.set(url, parse(await res.text()));
});

const byTitle = new Map();
const byDesc = new Map();

for (const [url, p] of pages) {
  if (/noindex/i.test(p.robots)) err(url, 'steht in der Sitemap, ist aber noindex');
  if (p.canonicals.length !== 1) err(url, `${p.canonicals.length} canonical-Tags (erwartet: 1)`);
  else if (norm(p.canonicals[0]) !== norm(url)) err(url, `canonical zeigt auf ${p.canonicals[0]}`);
  if (p.h1s !== 1) err(url, `${p.h1s} H1 (erwartet: 1)`);
  if (!p.title) err(url, 'kein <title>');
  else if (len(p.title) > TITLE_MAX) warn(url, `Titel ${len(p.title)} Zeichen (> ${TITLE_MAX}): ${p.title}`);
  if (!p.description) err(url, 'keine Meta-Description');
  else if (len(p.description) > DESC_MAX) warn(url, `Description ${len(p.description)} Zeichen (> ${DESC_MAX})`);
  else if (len(p.description) < DESC_MIN) warn(url, `Description nur ${len(p.description)} Zeichen (< ${DESC_MIN})`);
  if (p.ldCount === 0) warn(url, 'kein JSON-LD');
  if (p.ldInvalid > 0) err(url, `${p.ldInvalid} JSON-LD-Block(s) mit ungültigem JSON`);
  if (p.imgsWithoutAlt > 0) err(url, `${p.imgsWithoutAlt} Bild(er) ohne alt-Attribut`);

  byTitle.set(p.title, [...(byTitle.get(p.title) ?? []), url]);
  byDesc.set(p.description, [...(byDesc.get(p.description) ?? []), url]);

  for (const [lang, href] of Object.entries(p.hreflang)) {
    if (lang === 'x-default') continue;
    const target = [...pages.entries()].find(([u]) => norm(u) === norm(href));
    if (!target) err(url, `hreflang ${lang} → ${href} ist nicht in der Sitemap`);
    else if (!Object.values(target[1].hreflang).some((h) => norm(h) === norm(url)))
      err(url, `hreflang ${lang} → ${localPath(href)} verweist nicht zurück`);
  }
}

for (const [title, list] of byTitle) if (title && list.length > 1) warn(list[0], `Titel doppelt (${list.length}×): ${title}`);
for (const [desc, list] of byDesc) if (desc && list.length > 1) err(list[0], `Description doppelt (${list.length}×): ${desc.slice(0, 60)}…`);

const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
for (const e of errors) console.log(red('FEHLER  ') + e);
for (const w of warnings) console.log(yellow('HINWEIS ') + w);
console.log(`\n${pages.size}/${urls.length} Seiten geprüft — ${errors.length} Fehler, ${warnings.length} Hinweise.`);
process.exit(errors.length > 0 ? 1 : 0);
