// Verwaltung der Suchen von der Kommandozeile aus.
//
// `watches.json` ist bewusst gut lesbar und darf jederzeit von Hand bearbeitet
// werden. Diese Funktionen sind nur die bequeme Abkuerzung dafuer — sie
// vergeben eine eindeutige id, pruefen die URL und lassen die Datei formatiert
// zurueck.

import { readFile, writeFile } from 'node:fs/promises';
import { normalizeSearchUrl } from './kleinanzeigen.mjs';

const CHAT_ID_PLACEHOLDER = 'HIER_DEINE_CHAT_ID';

async function readRaw(path) {
  try {
    const parsed = JSON.parse(await readFile(path, 'utf8'));
    parsed.watches ??= [];
    return parsed;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return { telegram: { chatId: CHAT_ID_PLACEHOLDER }, watches: [] };
    }
    throw new Error(`${path} ist kein gueltiges JSON: ${err.message}`);
  }
}

async function writeRaw(path, data) {
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

/**
 * Zerlegt den Pfad einer Such-URL in seine sprechenden Teile.
 * Aus `/s-fahrraeder/freiburg-im-breisgau/bulls/k0c217l9354r20` wird
 * `{ category: 'fahrraeder', terms: ['freiburg-im-breisgau', 'bulls'] }`.
 */
function describeUrl(url) {
  const segments = new URL(url).pathname.split('/').filter(Boolean);
  const first = segments[0] ?? '';
  const category = first.startsWith('s-') ? first.slice(2) : null;

  // Das letzte Segment ist der Kategorie-/Ortscode (k0c217l9354r20) und sagt
  // einem Menschen nichts.
  const last = segments.at(-1) ?? '';
  const end = /^k\d/.test(last) ? -1 : undefined;
  const terms = segments.slice(1, end);

  return { category, terms };
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function deriveId(url, taken) {
  const { category, terms } = describeUrl(url);
  const parts = terms.length > 0 ? terms : [category].filter(Boolean);
  const base = slugify(parts.slice(0, 2).join('-')) || 'suche';

  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) {
    if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
  }
}

function deriveLabel(url) {
  const { category, terms } = describeUrl(url);
  const parts = [...terms, category].filter(Boolean);
  return parts.length > 0
    ? parts.map((p) => p.replace(/-/g, ' ')).join(' · ')
    : 'Kleinanzeigen-Suche';
}

/** Haengt eine neue Suche an watches.json an. */
export async function addWatch(path, rawUrl, options = {}) {
  const url = normalizeSearchUrl(rawUrl);
  const config = await readRaw(path);

  const existing = config.watches.find((w) => normalizeSearchUrl(w.url) === url);
  if (existing) {
    throw new Error(`Diese URL wird bereits als "${existing.id}" ueberwacht.`);
  }

  const taken = new Set(config.watches.map((w) => w.id));
  const id = options.id ? slugify(options.id) : deriveId(url, taken);
  if (taken.has(id)) throw new Error(`Die id "${id}" ist schon vergeben.`);

  // Nur Filter schreiben, die auch gesetzt wurden — eine Datei voller `null`
  // ist schwerer zu lesen als eine kurze.
  const filters = {};
  if (options.minPrice != null) filters.minPrice = options.minPrice;
  if (options.maxPrice != null) filters.maxPrice = options.maxPrice;
  if (options.exclude?.length) filters.titleExclude = options.exclude;
  if (options.include?.length) filters.titleMustInclude = options.include;
  if (options.privateOnly) filters.skipCommercial = true;

  const watch = {
    id,
    label: options.label ?? deriveLabel(url),
    url,
    intervalSeconds: options.intervalSeconds ?? 60,
  };
  if (Object.keys(filters).length > 0) watch.filters = filters;

  config.watches.push(watch);
  await writeRaw(path, config);

  return { watch, needsChatId: config.telegram?.chatId === CHAT_ID_PLACEHOLDER };
}

/** Entfernt eine Suche. Der Zustand der IDs bleibt bestehen. */
export async function removeWatch(path, id) {
  const config = await readRaw(path);
  const index = config.watches.findIndex((w) => w.id === id);
  if (index === -1) {
    const known = config.watches.map((w) => w.id).join(', ') || '(keine)';
    throw new Error(`Keine Suche mit der id "${id}". Vorhanden: ${known}`);
  }
  const [removed] = config.watches.splice(index, 1);
  await writeRaw(path, config);
  return removed;
}

export async function listWatches(path) {
  return (await readRaw(path)).watches;
}
