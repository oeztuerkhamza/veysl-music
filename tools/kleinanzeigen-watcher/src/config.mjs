// Laden, Pruefen und Anwenden der Konfiguration.

import { readFile } from 'node:fs/promises';
import { normalizeSearchUrl } from './kleinanzeigen.mjs';

// Kleinanzeigen vertraegt haeufiges Abfragen nicht unbegrenzt: unter dieser
// Grenze steigt das Risiko einer Captcha-Sperre spuerbar, und eine Sperre
// kostet mehr Zeit, als der schnellere Takt einbringt.
//
// 10 s ist die Untergrenze, die dieser Watcher zulaesst. Die Rechnung fuer
// "wer schreibt zuerst" haengt an der halben Taktzeit: im Mittel vergeht genau
// die Haelfte, bis eine neue Anzeige ueberhaupt gesehen wird. 60 s Takt heisst
// also 30 s Rueckstand — vier Leute vor einem; 10 s heissen 5 s.
//
// Darunter aufzumachen waere unehrlich: 10 s sind bereits 360 Abrufe je Stunde
// und Suche, und die Gegenrechnung ist die Captcha-Sperre. Sie ist nicht
// endgueltig — der Watcher verdoppelt den Abstand, meldet sich und kommt von
// selbst zurueck — aber waehrend sie laeuft, sieht er gar nichts. Ein Takt
// unter 10 s verschiebt das Risiko weiter, ohne dass am Rueckstand noch viel
// zu holen waere: von 5 s auf 2,5 s Mittel gewinnt niemand ein Rennen, das
// ohnehin die Seite selbst entscheidet (siehe describeDelay).
const MIN_INTERVAL_SECONDS = 10;

const DEFAULTS = {
  intervalSeconds: 60,
  // Streuung, damit die Abfragen nicht sekundengenau im Takt laufen.
  jitterSeconds: 10,
  // ... aber hoechstens ein Viertel des Takts. Feste 10 s Streuung machten aus
  // einem 15-s-Takt im Mittel 20 s — zwei Drittel des gewonnenen Tempos gingen
  // fuer eine Massnahme drauf, die bei kurzen Takten ohnehin kaum noch etwas
  // verschleiert.
  maxJitterShare: 0.25,
  // Bremse gegen eine zu weit gefasste Suche: lieber ein paar Treffer
  // verpassen als das Telegram-Konto mit hunderten Nachrichten fluten.
  maxAlertsPerCycle: 8,
  requestTimeoutMs: 20_000,
};

/**
 * Vorlage fuer die erste Nachricht an den Verkaeufer.
 *
 * Bewusst kurz und ohne Preisverhandlung. Wer als Erster schreibt, gewinnt den
 * Artikel meist mit genau diesen zwei Saetzen: die Frage nach der
 * Verfuegbarkeit und die Zusage, schnell abzuholen. Ein Preisvorschlag in der
 * Erstnachricht kostet den Startvorteil wieder — der Verkaeufer denkt nach,
 * vergleicht mit anderen Anfragen und antwortet spaeter.
 */
const DEFAULT_MESSAGE_TEMPLATE =
  'Hallo, ist "{title}" noch verfügbar? Ich hätte Interesse und könnte es kurzfristig abholen. Viele Grüße';

const DEFAULT_FILTERS = {
  minPrice: null,
  maxPrice: null,
  // Postleitzahl-Anfaenge, z. B. ["79"]. Leer heisst: keine oertliche Pruefung.
  postalPrefix: [],
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
 * Zieht die Postleitzahl aus einer Ortsangabe wie "79114, Freiburg im
 * Breisgau". Gibt null zurueck, wenn keine dasteht.
 */
export function parsePostalCode(location) {
  return String(location ?? '').match(/\b(\d{5})\b/)?.[1] ?? null;
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

  // Die oertliche Grenze zuerst und ohne Ausnahme.
  //
  // Der Ort steckt sonst nur im Pfad der Such-URL — also in dem, was
  // Kleinanzeigen daraus macht. Antwortet die Seite einmal anders als
  // erwartet (eine Weiterleitung, eine geaenderte Adresse, ein Umbau), kommen
  // Anzeigen aus dem ganzen Land an, und es gibt nichts, was das abfaengt.
  // Genau das ist passiert. Diese Pruefung steht deshalb hier, im eigenen
  // Code, und nicht im Vertrauen auf die Gegenseite.
  if (filters.postalPrefix.length > 0) {
    const plz = parsePostalCode(ad.location);
    // Ohne erkennbare Postleitzahl laesst sich die Grenze nicht pruefen — und
    // wer eine Grenze setzt, will sie eingehalten haben, nicht im Zweifel
    // umgangen. Im Log ist nachzulesen, wie oft das vorkommt.
    if (!plz) return false;
    if (!filters.postalPrefix.some((p) => plz.startsWith(p))) return false;
  }

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
  for (const key of ['titleMustInclude', 'titleExclude', 'postalPrefix']) {
    assert(Array.isArray(filters[key]), `${where}: filters.${key} muss eine Liste sein.`);
  }
  for (const p of filters.postalPrefix) {
    assert(
      /^\d{1,5}$/.test(String(p)),
      `${where}: "${p}" ist kein Anfang einer Postleitzahl (1 bis 5 Ziffern).`,
    );
  }
  filters.postalPrefix = filters.postalPrefix.map(String);
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
    // Leerer String heisst ausdruecklich "keine Vorlage"; undefined heisst
    // "nimm die allgemeine". Deshalb ?? und nicht ||.
    messageTemplate: raw.messageTemplate ?? null,
    intervalSeconds: interval,
    jitterSeconds: Math.min(
      raw.jitterSeconds ?? DEFAULTS.jitterSeconds,
      interval * DEFAULTS.maxJitterShare,
    ),
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

  // Eine leere Liste ist ausdruecklich erlaubt. Sie war frueher ein Fehler, und
  // das war eine Falle: wer seine letzte Suche per Telegram loescht, brachte
  // damit den Watcher zum Absturz — und konnte danach vom Telefon aus keine
  // neue mehr anlegen, weil der Bot mit gestorben war. Ohne Suchen laeuft er
  // jetzt einfach im Leerlauf weiter und hoert auf Befehle.
  assert(Array.isArray(raw.watches), '"watches" muss eine Liste sein.');

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
      // Basis der eigenen Brueckenseite, z.B. "https://dj-veys.de". Fehlt sie,
      // enthaelt die Meldung nur den gewoehnlichen Link — der Watcher laeuft
      // dann genauso, nur oeffnet ein Tipp den Browser statt der App.
      bridgeBaseUrl: raw.telegram?.bridgeBaseUrl ?? null,
    },
    messageTemplate: raw.messageTemplate ?? DEFAULT_MESSAGE_TEMPLATE,
    requestTimeoutMs: raw.requestTimeoutMs ?? DEFAULTS.requestTimeoutMs,
    userAgent: raw.userAgent,
    // Wechselnder Parameter gegen einen Zwischenspeicher — standardmaessig
    // AUS.
    //
    // Als er anging, kamen ploetzlich Anzeigen aus Orten, die in der Suche gar
    // nicht vorkommen, und eine enge oertliche Suche lief in einer einzigen
    // Runde in die Obergrenze von acht Meldungen. Beides passt dazu, dass
    // Kleinanzeigen eine Adresse mit unbekanntem Parameter anders beantwortet
    // — etwa mit einer Weiterleitung auf die Kategorie ohne die Ortsangabe aus
    // dem Pfad, der wir mit `redirect: follow` bereitwillig gefolgt waeren.
    //
    // Nachgewiesen ist das nicht (der Abruf laesst sich von hier aus nicht
    // pruefen), aber die Beweislast liegt beim Parameter, nicht beim Nutzer:
    // ein paar Sekunden Zwischenspeicher sind den Preis nicht wert, jede Runde
    // fremde Anzeigen zu bekommen. Das Messen des Age-Kopfs bleibt an, es
    // kostet nichts.
    cacheBuster: raw.cacheBuster === true,
    // Dieselbe Anzeige nur einmal melden, auch wenn mehrere Suchen sie finden.
    // `"dedupeAcrossWatches": false` schickt sie wieder je Suche einzeln.
    dedupeAcrossWatches: raw.dedupeAcrossWatches !== false,
    watches,
  };
}
