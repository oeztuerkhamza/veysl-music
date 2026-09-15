// Prueft die Abfragerunde selbst: welche Anzeigen bei einem Ueberlauf uebrig
// bleiben, und ob der gemessene Rundenabstand in der Meldung ankommt.
import { strict as assert } from 'node:assert';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createChecker } from './helpers.mjs';

const BASE = new URL('../', import.meta.url).href;
const { runCycle } = await import(BASE + 'watcher.mjs');
const { State } = await import(BASE + 'src/state.mjs');
const { withFilterDefaults } = await import(BASE + 'src/config.mjs');

const check = createChecker();
const dir = mkdtempSync(join(tmpdir(), 'kaw-runde-'));

/**
 * Liefert eine Suchseite in echter Reihenfolge — neueste zuerst, so wie
 * sortingField=SORTING_DATE sie ausgibt. Die hoechste Nummer ist die juengste
 * Anzeige.
 */
function stubSeite(anzahl) {
  const original = globalThis.fetch;
  const html = Array.from({ length: anzahl }, (_, i) => anzahl - i)
    .map(
      (n) =>
        `<article data-adid="${n}" data-href="/s-anzeige/rad/${n}-217-45">` +
        `<h3><a>Rad ${n}</a></h3><span>100 €</span></article>`,
    )
    .join('\n');

  globalThis.fetch = async (url, options) => {
    if (!String(url).includes('kleinanzeigen.de')) return original(url, options);
    return { ok: true, status: 200, text: async () => html, json: async () => ({}) };
  };
  return () => {
    globalThis.fetch = original;
  };
}

/** Eine Runde gegen eine vorgegebene Seite, mit gesammelten Meldungen. */
async function runde(anzahl, { maxAlertsPerCycle = 3, runtime, datei } = {}) {
  const gesendet = [];
  const state = await State.load(join(dir, datei));
  // Die Suche muss als "schon gelaufen" gelten, sonst merkt sich die erste
  // Runde nur den Bestand und meldet absichtlich nichts.
  state.remember('w', ['platzhalter']);

  const watch = {
    id: 'w',
    label: 'Meine Suche',
    url: 'https://www.kleinanzeigen.de/s-fahrraeder/k0c217',
    intervalSeconds: 60,
    maxAlertsPerCycle,
    filters: withFilterDefaults({}),
  };

  const restore = stubSeite(anzahl);
  try {
    await runCycle(watch, {
      state,
      runtime,
      dryRun: false,
      config: { requestTimeoutMs: 5000, messageTemplate: null },
      telegram: {
        async sendAd(ad, label, vorlage, optionen) {
          gesendet.push({ id: ad.id, pollGapMs: optionen?.pollGapMs ?? null });
        },
        async sendText() {},
      },
    });
  } finally {
    restore();
  }
  return gesendet;
}

console.log('== Beim Rundenlimit bleiben die NEUESTEN uebrig ==');
{
  // 10 neue Anzeigen, Limit 3. Vorher wurde erst umgedreht und dann
  // abgeschnitten — uebrig blieben die drei AELTESTEN, bei denen laengst
  // jemand geschrieben hat. Genau verkehrt herum fuer "wer schreibt zuerst".
  const gesendet = await runde(10, { maxAlertsPerCycle: 3, datei: 's1.json' });
  check('drei Meldungen', () => assert.equal(gesendet.length, 3));
  check('und zwar die drei juengsten', () =>
    assert.deepEqual([...gesendet.map((g) => g.id)].sort((a, b) => a - b), ['8', '9', '10']));
  // Neueste zuerst raus: zwischen erster und letzter Nachricht liegt je rund
  // eine Sekunde, und die frischeste Anzeige ist die einzige, bei der das noch
  // ueber den Zuschlag entscheidet.
  check('und die juengste geht als erste raus', () =>
    assert.deepEqual(gesendet.map((g) => g.id), ['10', '9', '8']));
}
{
  const gesendet = await runde(3, { maxAlertsPerCycle: 8, datei: 's2.json' });
  check('unter dem Limit kommt alles durch', () => assert.equal(gesendet.length, 3));
  check('ebenfalls juengste zuerst', () =>
    assert.deepEqual(gesendet.map((g) => g.id), ['3', '2', '1']));
}

console.log('\n== Der Rundenabstand wird gemessen und weitergereicht ==');
{
  const runtime = { lastFetchAt: Date.now() - 45_000 };
  const gesendet = await runde(2, { runtime, datei: 's3.json' });
  check('der gemessene Abstand kommt bei der Meldung an', () =>
    assert.ok(gesendet[0].pollGapMs >= 45_000 && gesendet[0].pollGapMs < 47_000));
  check('und wird fuer die naechste Runde fortgeschrieben', () =>
    assert.ok(Date.now() - runtime.lastFetchAt < 2000));
}
{
  // Erste Runde nach einem Start: kein Vorlauf, also nichts zu behaupten.
  const gesendet = await runde(2, { runtime: { lastFetchAt: null }, datei: 's4.json' });
  check('ohne Vorrunde bleibt der Abstand leer', () => assert.equal(gesendet[0].pollGapMs, null));
}
{
  // --once laeuft ganz ohne runtime; das darf nicht abstuerzen.
  const gesendet = await runde(2, { datei: 's5.json' });
  check('ganz ohne runtime laeuft die Runde trotzdem', () => assert.equal(gesendet.length, 2));
}

rmSync(dir, { recursive: true, force: true });
await check.summary();
