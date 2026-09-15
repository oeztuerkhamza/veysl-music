// Verwaltung der Suchen von der Kommandozeile aus.
//
// `watches.json` ist bewusst gut lesbar und darf jederzeit von Hand bearbeitet
// werden. Diese Funktionen sind nur die bequeme Abkuerzung dafuer — sie
// vergeben eine eindeutige id, pruefen die URL und lassen die Datei formatiert
// zurueck.

import { readFile, writeFile } from 'node:fs/promises';
import { normalizeSearchUrl } from './kleinanzeigen.mjs';
import { DEFAULT_RIGHTS, RIGHTS } from './users.mjs';

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
 * Aus `/s-fahrraeder/79268/preis::300/c217l8903r50` wird
 * `{ category: 'fahrraeder', terms: ['79268'], priceHint: 'bis 300 €' }`.
 */
function describeUrl(url) {
  const segments = new URL(url).pathname.split('/').filter(Boolean);
  const first = segments[0] ?? '';
  const category = first.startsWith('s-') ? first.slice(2) : null;

  // Das letzte Segment ist der Kategorie-/Ortscode und sagt einem Menschen
  // nichts. Er kommt in zwei Formen vor — `k0c217l9354r20` und, ohne das
  // fuehrende k, `c217l8903r50`. Die zweite fehlte hier und landete deshalb
  // mitten im Namen der Suche.
  const last = segments.at(-1) ?? '';
  const end = /^[kc]\d/.test(last) ? -1 : undefined;
  const rest = segments.slice(1, end);

  // Segmente wie `preis::300` oder `anzeige:angebote` sind Filter, keine
  // Bezeichnung. Der Preis ist aber das Einzige, was zwei sonst gleiche
  // Suchen unterscheidet, also wandert er in den Namen.
  const terms = rest.filter((s) => !s.includes(':'));
  const price = rest.find((s) => s.startsWith('preis:'));

  let priceHint = null;
  if (price) {
    const [, min, max] = price.split(':');
    if (min && max) priceHint = `${min}–${max} €`;
    else if (max) priceHint = `bis ${max} €`;
    else if (min) priceHint = `ab ${min} €`;
  }

  return { category, terms, priceHint };
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
  const { category, terms, priceHint } = describeUrl(url);
  const parts = [...terms.map((p) => p.replace(/-/g, ' ')), priceHint, category].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : 'Kleinanzeigen-Suche';
}

/** Kleinster erlaubter Abstand — dieselbe Grenze, die loadConfig durchsetzt. */
export const MIN_INTERVAL_SECONDS = 10;

/**
 * Prueft den Abstand schon beim Anlegen.
 *
 * Ohne diese Pruefung schriebe ein „takt 5" eine Datei, die loadConfig danach
 * ablehnt — der Watcher liefe mit dem alten Stand weiter und meldete den
 * Fehler nur ins Log, wo ihn niemand sieht. Besser gleich hier sagen.
 */
function normalizeInterval(value) {
  if (value === undefined || value === null) return 60;
  const n = Number(value);
  if (!Number.isInteger(n)) throw new Error(`"${value}" ist keine ganze Zahl Sekunden.`);
  if (n < MIN_INTERVAL_SECONDS) {
    throw new Error(
      `${n} s ist zu kurz. Mindestens ${MIN_INTERVAL_SECONDS} s — haeufiger abzufragen ` +
        `provoziert eine Sperre, und die kostet mehr Zeit, als der schnellere Takt einbringt.`,
    );
  }
  if (n > 86400) throw new Error(`${n} s ist mehr als ein Tag.`);
  return n;
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
    intervalSeconds: normalizeInterval(options.intervalSeconds),
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

/**
 * Aendert eine vorhandene Suche.
 *
 * Prueft dieselben Grenzen wie loadConfig, damit ein Tippfehler per Telegram
 * eine gueltige Datei hinterlaesst statt einer, an der der Watcher beim
 * naechsten Neuladen scheitert.
 */
export async function updateWatch(path, id, patch) {
  const config = await readRaw(path);
  const watch = config.watches.find((w) => w.id === id);
  if (!watch) {
    const known = config.watches.map((w) => w.id).join(', ') || '(keine)';
    throw new Error(`Keine Suche mit der id "${id}". Vorhanden: ${known}`);
  }

  if (patch.intervalSeconds !== undefined) {
    const n = Number(patch.intervalSeconds);
    if (!Number.isFinite(n) || !Number.isInteger(n)) {
      throw new Error(`"${patch.intervalSeconds}" ist keine ganze Zahl.`);
    }
    if (n < MIN_INTERVAL_SECONDS) {
      throw new Error(
        `${n} s ist zu kurz. Mindestens ${MIN_INTERVAL_SECONDS} s — haeufiger abzufragen ` +
          `provoziert eine Sperre, und die kostet mehr Zeit, als der schnellere Takt einbringt.`,
      );
    }
    if (n > 86400) throw new Error(`${n} s ist mehr als ein Tag.`);
    watch.intervalSeconds = n;
  }

  if (patch.messageTemplate !== undefined) {
    // Leerer String heisst ausdruecklich "keine Vorlage fuer diese Suche" und
    // ist etwas anderes als "nimm die allgemeine" (dafuer das Feld loeschen).
    const text = patch.messageTemplate === null ? null : String(patch.messageTemplate).trim();
    if (text === null) delete watch.messageTemplate;
    else if (text.length > 600) throw new Error(`Die Vorlage ist ${text.length} Zeichen lang, erlaubt sind 600.`);
    else watch.messageTemplate = text;
  }

  if (patch.label !== undefined) watch.label = String(patch.label).trim() || watch.label;

  await writeRaw(path, config);
  return watch;
}

// --- Erlaubte Nutzer -------------------------------------------------------
//
// Dieselbe Datei, derselbe Stil: `telegram.users` ist eine Liste, die auch von
// Hand lesbar bleibt. Der Besitzer (`telegram.chatId`) steht bewusst nicht
// darin — er ergibt sich aus der Konfiguration und kann sich nicht selbst
// aussperren.

function readUsersRaw(config) {
  const list = config.telegram?.users;
  return Array.isArray(list) ? list.map(normalizeStoredUser).filter(Boolean) : [];
}

function normalizeStoredUser(raw) {
  if (typeof raw === 'number' || typeof raw === 'string') {
    return { id: String(raw).trim(), rights: [...DEFAULT_RIGHTS] };
  }
  if (!raw || typeof raw !== 'object' || !raw.id) return null;
  const rights = Array.isArray(raw.rights)
    ? RIGHTS.filter((r) => raw.rights.includes(r))
    : [...DEFAULT_RIGHTS];
  return {
    id: String(raw.id).trim(),
    ...(raw.name ? { name: String(raw.name).trim() } : {}),
    rights,
  };
}

export async function listUsers(path) {
  return readUsersRaw(await readRaw(path));
}

function assertNotOwner(config, id) {
  if (String(config.telegram?.chatId ?? '') === id) {
    throw new Error('Das bist du selbst — du hast ohnehin alle Rechte.');
  }
}

/** Nimmt eine Telegram-Kennung in die Erlaubnisliste auf. */
export async function addUser(path, rawId, { name = null, rights = DEFAULT_RIGHTS } = {}) {
  const id = String(rawId ?? '').trim();
  if (!/^-?\d+$/.test(id)) {
    throw new Error(`"${id}" ist keine Telegram-Kennung. Sie besteht nur aus Ziffern.`);
  }

  const config = await readRaw(path);
  assertNotOwner(config, id);

  const users = readUsersRaw(config);
  if (users.some((u) => u.id === id)) throw new Error(`${id} steht schon auf der Liste.`);

  const user = { id, ...(name ? { name } : {}), rights: RIGHTS.filter((r) => rights.includes(r)) };
  users.push(user);
  config.telegram ??= {};
  config.telegram.users = users;
  await writeRaw(path, config);
  return user;
}

/** Nimmt eine Kennung wieder von der Liste. */
export async function removeUser(path, rawId) {
  const id = String(rawId ?? '').trim();
  const config = await readRaw(path);
  const users = readUsersRaw(config);
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) throw new Error(`${id} steht nicht auf der Liste.`);

  const [removed] = users.splice(index, 1);
  config.telegram ??= {};
  config.telegram.users = users;
  await writeRaw(path, config);
  return removed;
}

/** Setzt die Rechte eines bereits eingetragenen Nutzers neu. */
export async function setUserRights(path, rawId, rights) {
  const id = String(rawId ?? '').trim();
  const config = await readRaw(path);
  assertNotOwner(config, id);

  const users = readUsersRaw(config);
  const user = users.find((u) => u.id === id);
  if (!user) throw new Error(`${id} steht nicht auf der Liste. Erst aufnehmen: /user add ${id}`);

  user.rights = RIGHTS.filter((r) => rights.includes(r));
  config.telegram ??= {};
  config.telegram.users = users;
  await writeRaw(path, config);
  return user;
}
