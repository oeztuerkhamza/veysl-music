// Die oertliche Grenze: eine Anzeige darf das angegebene Gebiet nicht
// verlassen, egal was die Suchseite liefert.
import { strict as assert } from 'node:assert';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createChecker, stubKleinanzeigen } from './helpers.mjs';

const BASE = new URL('../src/', import.meta.url).href;
const { matchesFilters, withFilterDefaults, parsePostalCode, loadConfig } = await import(
  BASE + 'config.mjs'
);
const { handleUpdate, parseOptions } = await import(BASE + 'commands.mjs');
const { addWatch, listWatches, updateWatch } = await import(BASE + 'manage.mjs');
const { State } = await import(BASE + 'state.mjs');

const restoreFetch = stubKleinanzeigen();
const check = createChecker();

const OWNER = '6903649187';
const URL_KTM = 'https://www.kleinanzeigen.de/s-fahrraeder/freiburg-im-breisgau/ktm/k0c217l9354r20';

const dir = mkdtempSync(join(tmpdir(), 'kaw-ort-'));
const cfg = join(dir, 'watches.json');
writeFileSync(cfg, JSON.stringify({ telegram: { chatId: OWNER }, watches: [] }, null, 2));

const anzeige = (location) => ({
  id: '1',
  title: 'KTM Rad',
  price: '100 €',
  location,
  isTopAd: false,
  isCommercial: false,
});

console.log('== Postleitzahl lesen ==');
check('aus "79114, Freiburg im Breisgau"', () =>
  assert.equal(parsePostalCode('79114, Freiburg im Breisgau'), '79114'));
check('aus "79224, Umkirch"', () => assert.equal(parsePostalCode('79224, Umkirch'), '79224'));
check('ohne Zahl kein Ergebnis', () => assert.equal(parsePostalCode('Freiburg'), null));
check('leer ebenfalls nicht', () => assert.equal(parsePostalCode(''), null));
check('eine Hausnummer ist keine PLZ', () => assert.equal(parsePostalCode('Hauptstr. 12'), null));

console.log('\n== Die Grenze haelt ==');
const nur79 = withFilterDefaults({ postalPrefix: ['79'] });
check('Freiburg kommt durch', () => assert.ok(matchesFilters(anzeige('79114, Freiburg'), nur79)));
check('Umkirch im Umkreis auch', () => assert.ok(matchesFilters(anzeige('79224, Umkirch'), nur79)));
check('Berlin nicht', () => assert.ok(!matchesFilters(anzeige('10115, Berlin'), nur79)));
check('Muenchen nicht', () => assert.ok(!matchesFilters(anzeige('80331, Muenchen'), nur79)));
check('eine PLZ, die nur zufaellig 79 enthaelt, nicht', () =>
  assert.ok(!matchesFilters(anzeige('12793, Irgendwo'), nur79)));
// Wer eine Grenze setzt, will sie eingehalten haben — nicht im Zweifel umgangen.
check('ohne erkennbare PLZ wird abgelehnt', () =>
  assert.ok(!matchesFilters(anzeige('Irgendwo'), nur79)));
check('mehrere Anfaenge sind erlaubt', () =>
  assert.ok(matchesFilters(anzeige('78462, Konstanz'), withFilterDefaults({ postalPrefix: ['79', '78'] }))));
check('ohne Grenze bleibt alles wie vorher', () =>
  assert.ok(matchesFilters(anzeige('10115, Berlin'), withFilterDefaults({}))));
check('eine ganze PLZ als Grenze geht auch', () =>
  assert.ok(matchesFilters(anzeige('79114, Freiburg'), withFilterDefaults({ postalPrefix: ['79114'] }))));

console.log('\n== Per Telegram setzen ==');
check('"plz 79" wird gelesen', () =>
  assert.deepEqual(parseOptions('url plz 79').postalPrefix, ['79']));
check('mehrere durch Komma', () =>
  assert.deepEqual(parseOptions('url plz 79,78').postalPrefix, ['79', '78']));
check('neben anderen Zusaetzen', () => {
  const o = parseOptions('url max 200 privat plz 79');
  assert.deepEqual(o.postalPrefix, ['79']);
  assert.equal(o.maxPrice, 200);
  assert.equal(o.privateOnly, true);
});

function fakeTelegram() {
  const sent = [];
  return {
    chatId: OWNER,
    sent,
    async sendText(text, o) {
      sent.push({ text, buttons: o?.buttons });
    },
    async answerCallback() {},
    async editText() {},
    last() {
      return sent.at(-1)?.text ?? '';
    },
  };
}
const msg = (text) => ({
  message: { text, chat: { id: Number(OWNER) }, from: { id: Number(OWNER) } },
});
const ctx = (tg, extra = {}) => ({
  telegram: tg,
  configPath: cfg,
  timeoutMs: 20000,
  log: () => {},
  ...extra,
});

const { watch: angelegt } = await addWatch(cfg, URL_KTM, { postalPrefix: ['79'] });
const ID = angelegt.id;
check('beim Anlegen landet die Grenze in der Datei', () =>
  assert.deepEqual(angelegt.filters.postalPrefix, ['79']));

{
  const cfgGeladen = await loadConfig(cfg);
  check('und ueberlebt das Laden', () =>
    assert.deepEqual(cfgGeladen.watches[0].filters.postalPrefix, ['79']));
}
{
  const tg = fakeTelegram();
  await handleUpdate(msg(`/plz ${ID} 79,78`), ctx(tg));
  const liste = await listWatches(cfg);
  check('/plz setzt sie neu', () => assert.deepEqual(liste[0].filters.postalPrefix, ['79', '78']));
  check('und bestaetigt', () => assert.match(tg.last(), /79\/78/));
}
{
  const tg = fakeTelegram();
  await handleUpdate(msg(`/plz ${ID}`), ctx(tg));
  const liste = await listWatches(cfg);
  check('ohne Zahl faellt die Grenze weg', () =>
    assert.equal(liste[0].filters?.postalPrefix, undefined));
  check('und sagt das', () => assert.match(tg.last(), /keine oertliche Grenze/));
}
{
  const tg = fakeTelegram();
  await handleUpdate(msg(`/plz ${ID} abc`), ctx(tg));
  check('Unsinn wird abgelehnt', () => assert.match(tg.last(), /kein Anfang einer Postleitzahl/));
}
{
  await updateWatch(cfg, ID, { postalPrefix: ['79'] });
  const tg = fakeTelegram();
  await handleUpdate(msg('/list'), ctx(tg));
  check('/list zeigt die Grenze an', () =>
    assert.ok(tg.sent.some((s) => s.text.includes('nur PLZ 79'))));
}

console.log('\n== Eine kaputte Grenze faellt beim Laden auf ==');
{
  const p = join(dir, 'kaputt.json');
  writeFileSync(
    p,
    JSON.stringify({
      telegram: { chatId: OWNER },
      watches: [{ id: 'a', url: URL_KTM, filters: { postalPrefix: ['abc'] } }],
    }),
  );
  await assert.rejects(() => loadConfig(p), /Postleitzahl/);
  check('Buchstaben statt Ziffern werden abgewiesen', () => true);
}

console.log('\n== /reset leert das Gedaechtnis ==');
{
  const state = await State.load(join(dir, 'state.json'));
  state.remember('a', ['1', '2']);
  state.remember('b', ['3']);
  check('vorher ist etwas gemerkt', () => assert.ok(state.hasSeen('a', '1')));

  const tg = fakeTelegram();
  await handleUpdate(msg('/reset'), ctx(tg, { state }));

  check('danach nicht mehr', () => assert.ok(!state.hasSeen('a', '1')));
  check('und jede Suche gilt wieder als neu', () => assert.ok(state.isNew('a')));
  check('die Antwort sagt, wie viele es waren', () => assert.match(tg.last(), /2 Suche\(n\)/));
  check('und dass die Suchen bleiben', () => assert.match(tg.last(), /Suchen bleiben/));

  const liste = await listWatches(cfg);
  check('die Suchen stehen wirklich noch', () => assert.equal(liste.length, 1));
}

restoreFetch();
rmSync(dir, { recursive: true, force: true });
await check.summary();
