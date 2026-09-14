// Prueft die Telegram-Bedienung ohne einen einzigen echten API-Aufruf.
import { strict as assert } from 'node:assert';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = new URL('../src/', import.meta.url).href;
const { handleUpdate, parseOptions } = await import(BASE + 'commands.mjs');
const { listWatches } = await import(BASE + 'manage.mjs');

import { stubKleinanzeigen } from './helpers.mjs';

// Kein echter Abruf aus der Testreihe heraus: handleAdd macht intern einen
// Probeabruf, und der soll nicht bei jedem Commit bei kleinanzeigen.de landen.
const restoreFetch = stubKleinanzeigen();

const URL_BULLS = 'https://www.kleinanzeigen.de/s-fahrraeder/freiburg-im-breisgau/bulls/k0c217l9354r20';
const OWNER = '6903649187';
const STRANGER = '111222333';

let pass = 0;
const fail = [];
const check = (name, fn) => {
  try {
    fn();
    pass++;
    console.log('  ok   ' + name);
  } catch (e) {
    fail.push(name);
    console.log('  FAIL ' + name + ' -> ' + e.message);
  }
};

// Attrappe: sammelt, was gesendet worden waere.
function fakeTelegram() {
  const sent = [];
  const answered = [];
  const edited = [];
  return {
    chatId: OWNER,
    sent, answered, edited,
    async sendText(t, o) { sent.push({ text: t, buttons: o?.buttons }); },
    async answerCallback(id, t) { answered.push({ id, text: t }); },
    async editText(id, t) { edited.push({ id, text: t }); },
    last() { return sent.at(-1)?.text ?? ''; },
  };
}

const dir = mkdtempSync(join(tmpdir(), 'kaw-cmd-'));
const configPath = join(dir, 'watches.json');
writeFileSync(configPath, JSON.stringify({ telegram: { chatId: OWNER }, watches: [] }, null, 2));

const msg = (text, chatId = OWNER) => ({ update_id: 1, message: { text, chat: { id: chatId } } });
const cb = (data, chatId = OWNER, messageId = 42) => ({
  update_id: 2,
  callback_query: { id: 'cb1', data, message: { message_id: messageId, chat: { id: chatId } } },
});

console.log('\n== Zusaetze hinter der URL ==');
check('max 300', () => assert.equal(parseOptions('url max 300').maxPrice, 300));
check('maximal 300 (langform)', () => assert.equal(parseOptions('url maximal 300').maxPrice, 300));
check('min 50', () => assert.equal(parseOptions('url min 50').minPrice, 50));
check('privat', () => assert.equal(parseOptions('url privat').privateOnly, true));
check('ohne-Liste', () =>
  assert.deepEqual(parseOptions('url ohne defekt, bastler').exclude, ['defekt', 'bastler']));
check('kombiniert', () => {
  const o = parseOptions('url max 300 privat ohne defekt');
  assert.equal(o.maxPrice, 300);
  assert.equal(o.privateOnly, true);
  assert.deepEqual(o.exclude, ['defekt']);
});
check('Zahlen in der URL zaehlen nicht als Preis', () =>
  assert.equal(parseOptions(URL_BULLS).maxPrice, undefined));
check('ohne Zusaetze leer', () => assert.deepEqual(parseOptions(URL_BULLS), {}));

console.log('\n== Fremde Chats ==');
{
  const tg = fakeTelegram();
  const ctx = { telegram: tg, configPath, timeoutMs: 20000, log: () => {} };
  await handleUpdate(msg(URL_BULLS, STRANGER), ctx);
  check('Nachricht eines Fremden wird ignoriert', () => assert.equal(tg.sent.length, 0));
  await handleUpdate(cb('rm:egal', STRANGER), ctx);
  check('Tastendruck eines Fremden wird ignoriert', () => assert.equal(tg.answered.length, 0));
  check('nichts angelegt', async () => assert.equal((await listWatches(configPath)).length, 0));
}

console.log('\n== Hilfe ==');
{
  const tg = fakeTelegram();
  await handleUpdate(msg('/start'), { telegram: tg, configPath, log: () => {} });
  check('/start erklaert sich', () => assert.match(tg.last(), /Such-URL/));
  await handleUpdate(msg('/help'), { telegram: tg, configPath, log: () => {} });
  check('/help ebenso', () => assert.match(tg.last(), /\/list/));
}

console.log('\n== Unverstaendliches ==');
{
  const tg = fakeTelegram();
  await handleUpdate(msg('hallo bot'), { telegram: tg, configPath, log: () => {} });
  check('freundliche Rueckfrage', () => assert.match(tg.last(), /kleinanzeigen\.de/));
}

console.log('\n== Suche per URL anlegen (mit echtem Probeabruf) ==');
{
  const tg = fakeTelegram();
  const ctx = { telegram: tg, configPath, timeoutMs: 20000, log: () => {} };
  const changed = await handleUpdate(msg(URL_BULLS + ' max 400 privat'), ctx);
  check('meldet Konfigurationsaenderung', () => assert.equal(changed, true));
  const list = await listWatches(configPath);
  check('Suche liegt in der Datei', () => assert.equal(list.length, 1));
  check('Filter uebernommen', () => {
    assert.equal(list[0].filters.maxPrice, 400);
    assert.equal(list[0].filters.skipCommercial, true);
  });
  check('Bestaetigung nennt den Filter', () => assert.match(tg.last(), /bis 400 €/));
  check('Probeabruf im Text', () => assert.match(tg.last(), /Seite 1: \d+ Anzeigen/));
  check('sagt, dass Altbestand nicht gemeldet wird', () => assert.match(tg.last(), /nicht/));
}

console.log('\n== Dieselbe URL zweimal ==');
{
  const tg = fakeTelegram();
  const changed = await handleUpdate(msg(URL_BULLS), { telegram: tg, configPath, timeoutMs: 20000, log: () => {} });
  check('wird abgelehnt', () => assert.equal(changed, false));
  check('mit Begruendung', () => assert.match(tg.last(), /bereits/));
  check('keine zweite Suche', async () => assert.equal((await listWatches(configPath)).length, 1));
}

console.log('\n== /list mit Loeschtaste ==');
{
  const tg = fakeTelegram();
  await handleUpdate(msg('/list'), { telegram: tg, configPath, log: () => {} });
  check('Kopfzeile plus eine Nachricht je Suche', () => assert.equal(tg.sent.length, 2));
  const entry = tg.sent[1];
  check('Loeschtaste vorhanden', () => {
    assert.ok(entry.buttons, 'keine Tasten');
    assert.match(entry.buttons[0][0].callback_data, /^rm:/);
  });
  check('Taste zeigt auf die richtige Suche', () =>
    assert.equal(entry.buttons[0][0].callback_data, 'rm:freiburg-im-breisgau-bulls'));
}

console.log('\n== Loeschen per Taste ==');
{
  const tg = fakeTelegram();
  const changed = await handleUpdate(cb('rm:freiburg-im-breisgau-bulls'), {
    telegram: tg, configPath, log: () => {},
  });
  check('meldet Konfigurationsaenderung', () => assert.equal(changed, true));
  check('Suche ist weg', async () => assert.equal((await listWatches(configPath)).length, 0));
  check('Taste wurde bestaetigt', () => assert.equal(tg.answered[0].text, 'Gelöscht'));
  check('Nachricht durchgestrichen', () => assert.match(tg.edited[0].text, /<s>/));
}

console.log('\n== Loeschen, was es nicht gibt ==');
{
  const tg = fakeTelegram();
  const changed = await handleUpdate(cb('rm:gibtsnicht'), { telegram: tg, configPath, log: () => {} });
  check('meldet keine Aenderung', () => assert.equal(changed, false));
  check('Nutzer wird informiert', () => assert.match(tg.last(), /Keine Suche/));
}

console.log('\n== Leere Liste ==');
{
  const tg = fakeTelegram();
  await handleUpdate(msg('/list'), { telegram: tg, configPath, log: () => {} });
  check('Hinweis statt leerer Liste', () => assert.match(tg.last(), /Noch keine Suche/));
}

console.log('\n== Kaputte URL ==');
{
  const tg = fakeTelegram();
  writeFileSync(configPath, JSON.stringify({ telegram: { chatId: OWNER }, watches: [] }, null, 2));
  await handleUpdate(msg('https://www.ebay.de/sch/fahrrad'), { telegram: tg, configPath, log: () => {} });
  check('fremde Seite wird nicht angenommen', () => assert.match(tg.last(), /kleinanzeigen\.de/));
  check('nichts angelegt', async () => assert.equal((await listWatches(configPath)).length, 0));
}

rmSync(dir, { recursive: true, force: true });
restoreFetch();
console.log(`\n=========  ${pass} ok, ${fail.length} fehlgeschlagen  =========`);
if (fail.length) {
  console.log(fail.map((f) => '  - ' + f).join('\n'));
  process.exit(1);
}
