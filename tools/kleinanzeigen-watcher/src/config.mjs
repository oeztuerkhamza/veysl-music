// Laden, Pruefen und Anwenden der Konfiguration.

import { readFile } from 'node:fs/promises';
import { normalizeSearchUrl } from './kleinanzeigen.mjs';

// Kleinanzeigen vertraegt haeufiges Abfragen nicht unbegrenzt. Unter dieser
// Grenze steigt nur das Risiko einer Captcha-Sperre — und eine Sperre kostet
// mehr Zeit, als das schnellere Abfragen je einbringt.
const MIN_INTERVAL_SECONDS = 30;

const DEFAULTS = {
  intervalSeconds: 60,
  // Streuung, damit die Abfragen nicht sekundengenau im Takt laufen.
  jitterSeconds: 10,
  // Bremse gegen eine zu weit gefasste Suche: lieber ein paar Treffer
  // verpassen als das Telegram-Konto mit hunderten Nachrichten fluten.
  maxAlertsPerCycle: 8,
  requestTimeoutMs: 20_000,
};

const DEFAULT_FILTERS = {
  minPrice: null,
  maxPrice: null,
  titleMustInclude: [],
  titleExclude: [],
  skipCommercial: false,
  skipTopAds: true,
  // Anzeigen ohne Preisangabe ("VB" ohne Zahl) werden bei gesetzter
  // Preisgrenze standardmaessig durchgelassen, statt sie stumm zu verwerfen.
  allowMissingPrice: true,
};

/**
 * Fuellt einen teilweise gesetzten Filterblock auf. `matchesFilters` erwartet
 * jedes Feld — eine handgeschriebene watches.json setzt aber meist nur zwei.
 */
export function withFilterDefaults(filters) {
  return { ...DEFAULT_FILTERS, ...(filters ?? {}) };
}

/**
 * Zieht eine Zahl aus Strings wie "1.234 € VB" oder "Zu verschenken".
 * Gibt null zurueck, wenn kein Preis erkennbar ist.
 */
export function parsePrice(raw) {
  if (!raw) return null;
  if (/verschenken/i.test(raw)) return 0;
  const match = raw.replace(/\./g, '').match(/\d+/);
  return match ? Number(match[0]) : null;
}

/** Entscheidet, ob eine Anzeige gemeldet werden soll. */
export function matchesFilters(ad, filters) {
  if (filters.skipTopAds && ad.isTopAd) return false;
  if (filters.skipCommercial && ad.isCommercial) return false;

  const title = ad.title.toLowerCase();
  if (filters.titleExclude.some((w) => title.includes(w.toLowerCase()))) return false;
  if (
    filters.titleMustInclude.length > 0 &&
    !filters.titleMustInclude.some((w) => title.includes(w.toLowerCase()))
  ) {
    return false;
  }

  const hasPriceLimit = filters.minPrice !== null || filters.maxPrice !== null;
  if (hasPriceLimit) {
    const price = parsePrice(ad.price);
    if (price === null) return filters.allowMissingPrice;
    if (filters.minPrice !== null && price < filters.minPrice) return false;
    if (filters.maxPrice !== null && price > filters.maxPrice) return false;
  }

  return true;
}

function assert(condition, message) {
  if (!condition) throw new Error(`Konfigurationsfehler: ${message}`);
}

function normalizeWatch(raw, index) {
  const where = raw?.id ? `Suche "${raw.id}"` : `Suche #${index + 1}`;
  assert(raw && typeof raw === 'object', `${where} ist kein Objekt.`);
  assert(typeof raw.id === 'string' && raw.id.trim(), `${where} braucht ein "id"-Feld.`);
  assert(typeof raw.url === 'string' && raw.url.trim(), `${where} braucht ein "url"-Feld.`);

  const interval = raw.intervalSeconds ?? DEFAULTS.intervalSeconds;
  assert(
    Number.isFinite(interval) && interval >= MIN_INTERVAL_SECONDS,
    `${where}: intervalSeconds muss mindestens ${MIN_INTERVAL_SECONDS} sein (ist ${interval}).`,
  );

  const filters = withFilterDefaults(raw.filters);
  for (const key of ['titleMustInclude', 'titleExclude']) {
    assert(Array.isArray(filters[key]), `${where}: filters.${key} muss eine Liste sein.`);
  }
  for (const key of ['minPrice', 'maxPrice']) {
    assert(
      filters[key] === null || Number.isFinite(filters[key]),
      `${where}: filters.${key} muss eine Zahl oder null sein.`,
    );
  }

  return {
    id: raw.id.trim(),
    label: raw.label?.trim() || raw.id.trim(),
    url: normalizeSearchUrl(raw.url.trim()),
    intervalSeconds: interval,
    jitterSeconds: raw.jitterSeconds ?? DEFAULTS.jitterSeconds,
    maxAlertsPerCycle: raw.maxAlertsPerCycle ?? DEFAULTS.maxAlertsPerCycle,
    filters,
  };
}

export async function loadConfig(path) {
  let raw;
  try {
    raw = JSON.parse(await readFile(path, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(
        `Keine Konfiguration unter ${path}. Kopiere watches.example.json nach watches.json.`,
      );
    }
    throw new Error(`${path} ist kein gueltiges JSON: ${err.message}`);
  }

  assert(Array.isArray(raw.watches) && raw.watches.length > 0, '"watches" ist leer.');

  const watches = raw.watches.map(normalizeWatch);
  const ids = new Set();
  for (const watch of watches) {
    assert(!ids.has(watch.id), `Die id "${watch.id}" kommt doppelt vor.`);
    ids.add(watch.id);
  }

  const chatId = raw.telegram?.chatId ?? process.env.TELEGRAM_CHAT_ID;
  assert(chatId, 'telegram.chatId fehlt (oder Umgebungsvariable TELEGRAM_CHAT_ID).');

  return {
    telegram: {
      chatId: String(chatId),
      // Der Deep Link in die App ist das iOS-Schema. Auf Android oeffnet
      // bereits die https-Adresse die App, dort waere der Zusatzlink ein
      // toter Link in jeder Meldung — deswegen abschaltbar.
      appLinks: raw.telegram?.appLinks ?? true,
    },
    requestTimeoutMs: raw.requestTimeoutMs ?? DEFAULTS.requestTimeoutMs,
    userAgent: raw.userAgent,
    watches,
  };
}
