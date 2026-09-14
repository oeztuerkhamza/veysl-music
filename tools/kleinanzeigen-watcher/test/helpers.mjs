// Gemeinsames Werkzeug der Tests.
//
// Alle Tests laufen offline. Das ist kein Selbstzweck: liefe die Testreihe bei
// jedem Commit gegen kleinanzeigen.de, wuerde ausgerechnet dieses Projekt die
// Seite regelmaessig abrufen, ohne dass jemand eine Anzeige sucht. Statt dessen
// antwortet ein Abfang mit einem echten, auf drei Anzeigen gekuerzten
// Seitenausschnitt (fixture-suchseite.html).
//
// Den echten Abruf prueft `live.test.mjs`, und der laeuft nur auf Zuruf.

import { readFileSync } from 'node:fs';

export const FIXTURE = readFileSync(
  new URL('./fixture-suchseite.html', import.meta.url),
  'utf8',
);

/**
 * Faengt Abrufe von kleinanzeigen.de ab und liefert den Ausschnitt zurueck.
 * Gibt eine Funktion zum Aufraeumen zurueck.
 */
export function stubKleinanzeigen({ status = 200, body = FIXTURE } = {}) {
  const original = globalThis.fetch;
  let aufrufe = 0;

  globalThis.fetch = async (url, options) => {
    const target = String(url);
    if (!target.includes('kleinanzeigen.de')) return original(url, options);
    aufrufe++;
    return {
      ok: status >= 200 && status < 300,
      status,
      text: async () => body,
      json: async () => ({}),
    };
  };

  const restore = () => {
    globalThis.fetch = original;
  };
  restore.aufrufe = () => aufrufe;
  return restore;
}

/** Faengt Telegram ab und sammelt, was gesendet worden waere. */
export function stubTelegramApi() {
  const original = globalThis.fetch;
  const gesendet = [];

  globalThis.fetch = async (url, options) => {
    const target = String(url);
    if (!target.includes('api.telegram.org')) return original(url, options);
    gesendet.push({
      method: target.split('/').pop(),
      body: options?.body ? JSON.parse(options.body) : null,
      at: Date.now(),
    });
    return { json: async () => ({ ok: true, result: {} }) };
  };

  const restore = () => {
    globalThis.fetch = original;
  };
  restore.gesendet = gesendet;
  return restore;
}

/**
 * Kleiner Zaehler, damit jede Datei dasselbe Ergebnisformat ausgibt.
 *
 * Nimmt auch asynchrone Pruefungen an. Das ist keine Bequemlichkeit: eine
 * `async`-Pruefung, die niemand abwartet, gilt sonst als bestanden und die
 * Ausnahme taucht viel spaeter als unbehandelte Zurueckweisung auf — ein Test,
 * der gruen meldet und trotzdem nichts geprueft hat, ist schlimmer als keiner.
 * `summary()` wartet deshalb auf alles Offene.
 */
export function createChecker() {
  let pass = 0;
  const fail = [];
  const offen = [];

  const merken = (name, err) => {
    if (err) {
      fail.push(name);
      console.log('  FAIL ' + name + ' -> ' + err.message);
    } else {
      pass++;
      console.log('  ok   ' + name);
    }
  };

  const check = (name, fn) => {
    let ergebnis;
    try {
      ergebnis = fn();
    } catch (err) {
      merken(name, err);
      return;
    }
    if (ergebnis && typeof ergebnis.then === 'function') {
      const p = ergebnis.then(
        () => merken(name, null),
        (err) => merken(name, err),
      );
      offen.push(p);
      return p;
    }
    merken(name, null);
  };

  check.summary = async () => {
    await Promise.all(offen);
    console.log(`\n=========  ${pass} ok, ${fail.length} fehlgeschlagen  =========`);
    if (fail.length) {
      console.log(fail.map((f) => '  - ' + f).join('\n'));
      process.exitCode = 1;
    }
    return { pass, fail: fail.length };
  };
  return check;
}
