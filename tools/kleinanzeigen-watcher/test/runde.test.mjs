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
function stubSeite(anzahl, kopfe = {}) {
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
    return {
      ok: true,
      status: 200,
      headers: { get: (name) => kopfe[name.toLowerCase()] ?? null },
      text: async () => html,
      json: async () => ({}),
    };
  };
  return () => {
    globalThis.fetch = original;
  };
}

/** Eine Runde gegen eine vorgegebene Seite, mit gesammelten Meldungen. */
async function runde(anzahl, { maxAlertsPerCycle = 3, runtime, datei, kopfe, state: vorhanden, watchId = 'w', config = {} } = {}) {
  const gesendet = [];
  const state = vorhanden ?? (await State.load(join(dir, datei)));
  // Die Suche muss als "schon gelaufen" gelten, sonst merkt sich die erste
  // Runde nur den Bestand und meldet absichtlich nichts.
  state.remember(watchId, ['platzhalter']);

  const watch = {
    id: watchId,
    label: 'Meine Suche',
    url: 'https://www.kleinanzeigen.de/s-fahrraeder/k0c217',
    intervalSeconds: 60,
    maxAlertsPerCycle,
    filters: withFilterDefaults({}),
  };

  const restore = stubSeite(anzahl, kopfe);
  try {
    await runCycle(watch, {
      state,
      runtime,
      dryRun: false,
      config: { requestTimeoutMs: 5000, messageTemplate: null, ...config },
      telegram: {
        async sendAd(ad, label, vorlage, optionen) {
          gesendet.push({
            id: ad.id,
            pollGapMs: optionen?.pollGapMs ?? null,
            cacheMs: optionen?.cacheMs ?? 0,
          });
        },
        async sendText() {},
      },
    });
  } finally {
    restore();
  }
  gesendet.state = state;
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

console.log('\n== Das Senden verschiebt den Takt nicht ==');
{
  // Nachgebaut: das Senden dauert laenger als eine Sekunde je Anzeige. Der
  // naechste Abruf muss trotzdem am Beginn des letzten haengen.
  const { tickWatchFuerTest } = await import(BASE + 'watcher.mjs').then((m) => ({
    tickWatchFuerTest: m.tickWatch,
  }));
  const runtime = { backoff: 1, blockedNotified: false, nextRunAt: 0, running: false };
  const state = await State.load(join(dir, 'takt.json'));
  state.remember('w', ['platzhalter']);

  const watch = {
    id: 'w',
    label: 'Meine Suche',
    url: 'https://www.kleinanzeigen.de/s-fahrraeder/k0c217',
    intervalSeconds: 10,
    jitterSeconds: 0,
    maxAlertsPerCycle: 8,
    filters: withFilterDefaults({}),
  };

  const restore = stubSeite(3);
  const begonnen = Date.now();
  try {
    await tickWatchFuerTest(watch, runtime, {
      state,
      dryRun: false,
      config: { requestTimeoutMs: 5000, messageTemplate: null },
      telegram: {
        // Jede Sendung kostet 400 ms — zusammen mehr als eine Sekunde.
        async sendAd() {
          await new Promise((r) => setTimeout(r, 400));
        },
        async sendText() {},
      },
    });
  } finally {
    restore();
  }

  const abstand = runtime.nextRunAt - begonnen;
  check('der naechste Abruf steht rund einen Takt nach dem letzten an', () =>
    assert.ok(abstand >= 9500 && abstand <= 10500, `war ${abstand} ms`));
  check('und nicht erst nach dem Senden', () => assert.ok(abstand < 11000));
}

console.log('\n== Dieselbe Anzeige nicht zweimal, nur weil zwei Suchen sie finden ==');
{
  // Der echte Fall: eine Anzeige "Bulls cube" trifft die Suche nach "bulls"
  // und die nach "cube". Frueher kam sie zweimal an — und die zweite Nachricht
  // hielt, wegen Telegrams Sekundentakt, die naechste echte Meldung auf.
  const state = await State.load(join(dir, 'dedupe.json'));
  const ersteSuche = await runde(2, { state, watchId: 'cube', datei: 'dedupe.json' });
  const zweiteSuche = await runde(2, { state, watchId: 'bulls', datei: 'dedupe.json' });

  check('die erste Suche meldet beide', () => assert.equal(ersteSuche.length, 2));
  check('die zweite meldet nichts mehr davon', () => assert.equal(zweiteSuche.length, 0));
}
{
  // Abschaltbar, falls jemand die Meldung wirklich je Suche will.
  const state = await State.load(join(dir, 'dedupe2.json'));
  await runde(2, { state, watchId: 'cube', datei: 'dedupe2.json' });
  const zweite = await runde(2, {
    state,
    watchId: 'bulls',
    datei: 'dedupe2.json',
    config: { dedupeAcrossWatches: false },
  });
  check('mit dedupeAcrossWatches:false kommt sie wieder doppelt', () =>
    assert.equal(zweite.length, 2));
}
{
  // Nach dem Fenster ist eine Anzeige kein Rennen mehr — und der Block darf
  // nicht ewig wachsen.
  const state = await State.load(join(dir, 'dedupe3.json'));
  const laengstVorbei = Date.now() - 2 * 60 * 60 * 1000;
  state.meldungGemerkt('42', laengstVorbei);
  check('eine alte Meldung sperrt nicht mehr', () => assert.equal(state.wurdeGemeldet('42'), false));
  state.meldungGemerkt('43');
  check('eine frische schon', () => assert.equal(state.wurdeGemeldet('43'), true));
  check('und die alte ist beim Aufraeumen rausgeflogen', () =>
    assert.equal(state.wurdeGemeldet('42'), false));
}

rmSync(dir, { recursive: true, force: true });
await check.summary();
