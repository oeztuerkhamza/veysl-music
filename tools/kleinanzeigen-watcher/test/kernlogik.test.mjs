// Durchlauf aller Bausteine des Watchers gegen die echte Suchseite.
import { strict as assert } from 'node:assert';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = new URL('../src/', import.meta.url).href;
const { normalizeSearchUrl } = await import(BASE + 'kleinanzeigen.mjs');
const { parsePrice, matchesFilters, withFilterDefaults, loadConfig } = await import(BASE + 'config.mjs');
const { State } = await import(BASE + 'state.mjs');
const { addWatch, listWatches, removeWatch, MIN_INTERVAL_SECONDS } = await import(BASE + 'manage.mjs');
const { Telegram } = await import(BASE + 'telegram.mjs');

const URL_BULLS =
  'https://www.kleinanzeigen.de/s-fahrraeder/freiburg-im-breisgau/bulls/k0c217l9354r20';
let pass = 0;
const fail = [];
function check(name, fn) {
  try {
    fn();
    pass++;
    console.log('  ok   ' + name);
  } catch (e) {
    fail.push(name);
    console.log('  FAIL ' + name + ' -> ' + e.message);
  }
}

console.log('\n== 1. URL-Normalisierung ==');
check('haengt SORTING_DATE an', () =>
  assert.ok(normalizeSearchUrl(URL_BULLS).includes('sortingField=SORTING_DATE')));
check('respektiert vorhandene Sortierung', () => {
  const u = normalizeSearchUrl(URL_BULLS + '?sortingField=SORTING_PRICE');
  assert.ok(u.includes('SORTING_PRICE') && !u.includes('SORTING_DATE'));
});
check('weist fremde Hosts ab', () =>
  assert.throws(() => normalizeSearchUrl('https://www.ebay.de/x')));
check('erzwingt https', () =>
  assert.ok(normalizeSearchUrl('http://kleinanzeigen.de/s-fahrraeder/k0c217').startsWith('https://www.')));

console.log('\n== 2. Preis-Auswertung ==');
for (const [input, want] of [
  ['1.234 € VB', 1234], ['350 €', 350], ['80 € VB', 80],
  ['Zu verschenken', 0], ['VB', null], ['', null], [null, null], ['2.999 €', 2999],
]) {
  check(`parsePrice(${JSON.stringify(input)}) = ${want}`, () =>
    assert.equal(parsePrice(input), want));
}

console.log('\n== 3. Filterlogik ==');
const ad = (o = {}) => ({
  id: '1', title: 'Bulls Fahrrad', url: 'u', price: '200 €', location: 'x',
  postedAt: '', isTopAd: false, isCommercial: false, shipping: false, ...o,
});
const F = (o) => withFilterDefaults(o);
check('TopAd wird per Vorgabe verworfen', () =>
  assert.equal(matchesFilters(ad({ isTopAd: true }), F({})), false));
check('gewerblich nur bei skipCommercial', () => {
  assert.equal(matchesFilters(ad({ isCommercial: true }), F({})), true);
  assert.equal(matchesFilters(ad({ isCommercial: true }), F({ skipCommercial: true })), false);
});
check('maxPrice greift', () => {
  assert.equal(matchesFilters(ad({ price: '450 €' }), F({ maxPrice: 400 })), false);
  assert.equal(matchesFilters(ad({ price: '350 €' }), F({ maxPrice: 400 })), true);
});
check('minPrice greift', () =>
  assert.equal(matchesFilters(ad({ price: '10 €' }), F({ minPrice: 50 })), false));
check('fehlender Preis wird durchgelassen', () =>
  assert.equal(matchesFilters(ad({ price: 'VB' }), F({ maxPrice: 400 })), true));
check('fehlender Preis abweisbar', () =>
  assert.equal(matchesFilters(ad({ price: 'VB' }), F({ maxPrice: 400, allowMissingPrice: false })), false));
check('titleExclude greift, Gross/Klein egal', () =>
  assert.equal(matchesFilters(ad({ title: 'Rad DEFEKT' }), F({ titleExclude: ['defekt'] })), false));
check('titleMustInclude als Oder-Liste', () => {
  assert.equal(matchesFilters(ad({ title: 'Cube Rad' }), F({ titleMustInclude: ['bulls', 'cube'] })), true);
  assert.equal(matchesFilters(ad({ title: 'Trek Rad' }), F({ titleMustInclude: ['bulls', 'cube'] })), false);
});
check('Zu verschenken faellt nicht unter minPrice=0', () =>
  assert.equal(matchesFilters(ad({ price: 'Zu verschenken' }), F({ minPrice: 0 })), true));

console.log('\n== 4. Zustandsspeicher ==');
const dir = mkdtempSync(join(tmpdir(), 'kaw-'));
await (async () => {
  const p = join(dir, 'state.json');
  const s = await State.load(p);
  check('unbekannte Suche gilt als neu', () => assert.equal(s.isNew('w'), true));
  s.remember('w', ['a', 'b']);
  await s.flush();
  const s2 = await State.load(p);
  check('ueberlebt Neuladen', () => {
    assert.equal(s2.isNew('w'), false);
    assert.equal(s2.hasSeen('w', 'a'), true);
    assert.equal(s2.hasSeen('w', 'zzz'), false);
  });
  s2.remember('w', ['a', 'c']);
  await s2.flush();
  check('keine Dubletten', () =>
    assert.equal(JSON.parse(readFileSync(p, 'utf8')).watches.w.seen.length, 3));
  check('Suchen sind voneinander getrennt', () => assert.equal(s2.isNew('andere'), true));
})();

console.log('\n== 5. Suchen verwalten ==');
await (async () => {
  const cfg = join(dir, 'watches.json');
  const { watch } = await addWatch(cfg, URL_BULLS, { maxPrice: 400, privateOnly: true });
  check('id aus URL abgeleitet', () => assert.equal(watch.id, 'freiburg-im-breisgau-bulls'));
  check('Filter uebernommen', () => {
    assert.equal(watch.filters.maxPrice, 400);
    assert.equal(watch.filters.skipCommercial, true);
  });
  await assert.rejects(() => addWatch(cfg, URL_BULLS, {}));
  check('gleiche URL wird abgewiesen', () => true);
  await addWatch(cfg, 'https://www.kleinanzeigen.de/s-notebooks/k0c278', { });
  check('zweite Suche daneben', async () => assert.equal((await listWatches(cfg)).length, 2));
  const list = await listWatches(cfg);
  check('zwei Suchen vorhanden', () => assert.equal(list.length, 2));
  check('ids eindeutig', () => assert.equal(new Set(list.map((w) => w.id)).size, 2));
  await removeWatch(cfg, 'freiburg-im-breisgau-bulls');
  check('entfernen wirkt', async () => assert.equal((await listWatches(cfg)).length, 1));
  await assert.rejects(() => removeWatch(cfg, 'gibtsnicht'));
  check('unbekannte id wird abgewiesen', () => true);
})();

console.log('\n== 6. Konfigurationspruefung ==');
await (async () => {
  const { writeFileSync } = await import('node:fs');
  const p = join(dir, 'bad.json');
  const write = (o) => writeFileSync(p, JSON.stringify(o));
  write({ telegram: { chatId: '1' }, watches: [{ id: 'a', url: URL_BULLS, intervalSeconds: 5 }] });
  await assert.rejects(() => loadConfig(p), new RegExp(`mindestens ${MIN_INTERVAL_SECONDS}`));
  check('zu kurzes Intervall abgewiesen', () => true);
  write({ telegram: { chatId: '1' }, watches: [{ id: 'a', url: URL_BULLS }, { id: 'a', url: URL_BULLS + '?x=1' }] });
  await assert.rejects(() => loadConfig(p), /doppelt/);
  check('doppelte id abgewiesen', () => true);
  write({ watches: [{ id: 'a', url: URL_BULLS }] });
  delete process.env.TELEGRAM_CHAT_ID;
  await assert.rejects(() => loadConfig(p), /chatId/);
  check('fehlende chatId abgewiesen', () => true);
  await assert.rejects(() => loadConfig(join(dir, 'gibtsnicht.json')), /Keine Konfiguration/);
  check('fehlende Datei mit Hinweis', () => true);
})();

console.log('\n== 7. Telegram-Formatierung (ohne Versand) ==');
check('Token/chatId werden verlangt', () => {
  assert.throws(() => new Telegram('', '1'), /TELEGRAM_BOT_TOKEN/);
  assert.throws(() => new Telegram('t', ''), /chatId/);
});
await (async () => {
  const tg = new Telegram('dummy', '1');
  let sent = null;
  tg.sendText = async (t) => { sent = t; };
  await tg.sendAd(ad({ title: 'Rad <b>&</b> Zubehoer', price: '200 €', location: 'Freiburg' }), 'Meine Suche');
  check('HTML wird maskiert', () => assert.ok(sent.includes('&lt;b&gt;&amp;&lt;/b&gt;')));
  check('Preis, Ort, Link, Label enthalten', () => {
    assert.ok(sent.includes('200 €') && sent.includes('Freiburg'));
    assert.ok(sent.includes('href="u"') && sent.includes('Meine Suche'));
  });
  check('privat/gewerblich wird ausgewiesen', () => assert.ok(sent.includes('Privat')));
})();

// Der frueher hier stehende Live-Abruf ist nach parser.test.mjs gewandert.
// Dort laeuft er gegen einen gespeicherten Seitenausschnitt statt gegen die
// echte Seite — eine Testreihe soll keine fremden Server beschaeftigen.

rmSync(dir, { recursive: true, force: true });

console.log(`\n=========  ${pass} ok, ${fail.length} fehlgeschlagen  =========`);
if (fail.length) {
  console.log(fail.map((f) => '  - ' + f).join('\n'));
  process.exit(1);
}
