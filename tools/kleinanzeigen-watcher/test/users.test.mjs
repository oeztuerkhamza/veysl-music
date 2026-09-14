// Prueft, wer den Bot bedienen darf und was er darf.
import { strict as assert } from 'node:assert';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createChecker, stubKleinanzeigen } from './helpers.mjs';

const BASE = new URL('../src/', import.meta.url).href;
const { handleUpdate } = await import(BASE + 'commands.mjs');
const { listUsers, listWatches } = await import(BASE + 'manage.mjs');
const { parseRights, describeRights, resolveActor, may } = await import(BASE + 'users.mjs');

// handleAdd macht intern einen Probeabruf — der soll nicht bei kleinanzeigen.de
// landen, nur weil hier Rechte geprueft werden.
const restoreFetch = stubKleinanzeigen();
const check = createChecker();

const OWNER = '6903649187';
const HELFER = '111222333';
const FREMDER = '999888777';
const URL_BULLS = 'https://www.kleinanzeigen.de/s-fahrraeder/freiburg/bulls/k0c217l9354r20';

const dir = mkdtempSync(join(tmpdir(), 'kaw-users-'));
const pfad = join(dir, 'watches.json');

function neuAufsetzen(users = []) {
  writeFileSync(
    pfad,
    JSON.stringify({
      telegram: { chatId: OWNER, ...(users.length ? { users } : {}) },
      watches: [{ id: 'bulls', label: 'Bulls', url: URL_BULLS, intervalSeconds: 60 }],
    }),
  );
}

/** Attrappe: sammelt, was gesendet worden waere — je Chat. */
function fakeTelegram() {
  const gesendet = [];
  const beantwortet = [];
  return {
    chatId: OWNER,
    gesendet,
    beantwortet,
    async sendText(text, o) {
      gesendet.push({ chatId: String(o?.chatId ?? OWNER), text, buttons: o?.buttons });
    },
    async editText(id, text, o) {
      gesendet.push({ chatId: String(o?.chatId ?? OWNER), text, edit: id });
    },
    async answerCallback(id, text) {
      beantwortet.push({ id, text });
    },
    letzte() {
      return gesendet.at(-1)?.text ?? '';
    },
  };
}

const nachricht = (von, text) => ({
  message: { text, chat: { id: Number(von) }, from: { id: Number(von), first_name: 'Test' } },
});
const tastendruck = (von, data) => ({
  callback_query: {
    id: 'cb1',
    data,
    from: { id: Number(von) },
    message: { chat: { id: Number(von) }, message_id: 7 },
  },
});

const laufen = async (tg, update) => {
  const meldungen = [];
  const geaendert = await handleUpdate(update, {
    telegram: tg,
    configPath: pfad,
    timeoutMs: 5000,
    log: (m) => meldungen.push(m),
  });
  return { geaendert, meldungen };
};

console.log('== Rechte lesen und schreiben ==');
check('"alle" ergibt jedes Recht', () =>
  assert.deepEqual(parseRights('alle'), ['list', 'edit', 'remove']));
check('deutsche und englische Worte gemischt', () =>
  assert.deepEqual(parseRights('ansehen, remove'), ['list', 'remove']));
check('Reihenfolge ist immer dieselbe', () =>
  assert.deepEqual(parseRights('loeschen,ansehen'), ['list', 'remove']));
check('ein Tippfehler ergibt null statt stillschweigend weniger Rechte', () =>
  assert.equal(parseRights('anshen'), null));
check('leere Angabe ergibt null', () => assert.equal(parseRights('  '), null));
check('lesbar beschrieben', () =>
  assert.equal(describeRights(['remove', 'list']), 'ansehen, loeschen'));
check('ohne Rechte wird das auch gesagt', () => assert.equal(describeRights([]), 'keine Rechte'));

console.log('\n== Wer ist das ==');
check('der Besitzer hat immer alles', () => {
  const a = resolveActor({ ownerChatId: OWNER, users: [], fromId: OWNER, chatId: OWNER });
  assert.ok(a.isOwner && may(a, 'remove') && may(a, 'edit') && may(a, 'list'));
});
check('ein Fremder ist niemand', () =>
  assert.equal(resolveActor({ ownerChatId: OWNER, users: [], fromId: FREMDER, chatId: FREMDER }), null));
check('in einer Gruppe zaehlt, wer getippt hat', () => {
  const users = [{ id: HELFER, rights: ['list'] }];
  const a = resolveActor({ ownerChatId: OWNER, users, fromId: HELFER, chatId: '-100777' });
  assert.ok(a && !a.isOwner && may(a, 'list'));
});
check('ein Fremder in einer erlaubten Gruppe kommt nicht durch', () =>
  assert.equal(
    resolveActor({ ownerChatId: OWNER, users: [{ id: HELFER, rights: ['list'] }], fromId: FREMDER, chatId: '-100777' }),
    null,
  ));
check('der Besitzer darf auch ohne Recht-Eintrag loeschen', () =>
  assert.ok(may({ isOwner: true, rights: [] }, 'remove')));

console.log('\n== Der Fremde bleibt draussen ==');
neuAufsetzen();
{
  const tg = fakeTelegram();
  const { meldungen } = await laufen(tg, nachricht(FREMDER, '/list'));
  check('keine Antwort an den Fremden', () => assert.equal(tg.gesendet.length, 0));
  check('die Kennung steht im Log', () => assert.ok(meldungen.join(' ').includes(FREMDER)));
  check('das Log sagt, wie man ihn aufnimmt', () =>
    assert.ok(meldungen.join(' ').includes(`/user add ${FREMDER}`)));
}
{
  const tg = fakeTelegram();
  await laufen(tg, nachricht(FREMDER, URL_BULLS));
  const suchen = await listWatches(pfad);
  check('ein Fremder kann keine Suche anlegen', () => assert.equal(suchen.length, 1));
  check('und bekommt auch dafuer keine Antwort', () => assert.equal(tg.gesendet.length, 0));
}

console.log('\n== Der Besitzer nimmt jemanden auf ==');
{
  const tg = fakeTelegram();
  await laufen(tg, nachricht(OWNER, `/user add ${HELFER} Ali`));
  const users = await listUsers(pfad);
  check('steht in der Datei', () => assert.equal(users.length, 1));
  check('mit Namen', () => assert.equal(users[0].name, 'Ali'));
  check('und darf zunaechst nur ansehen', () => assert.deepEqual(users[0].rights, ['list']));
}
{
  const tg = fakeTelegram();
  await laufen(tg, nachricht(HELFER, '/list'));
  check('er sieht die Suchen', () => assert.ok(tg.gesendet.some((g) => g.text.includes('Bulls'))));
  check('die Antwort geht in seinen Chat, nicht in den des Besitzers', () =>
    assert.ok(tg.gesendet.every((g) => g.chatId === HELFER)));
  check('ohne Tasten, weil er nichts aendern darf', () =>
    assert.ok(tg.gesendet.every((g) => g.buttons === undefined)));
}
{
  const tg = fakeTelegram();
  await laufen(tg, nachricht(HELFER, URL_BULLS + '?neu=1'));
  const suchen = await listWatches(pfad);
  check('anlegen wird abgelehnt', () => assert.ok(tg.letzte().includes('darfst keine Suchen')));
  check('und nichts geschrieben', () => assert.equal(suchen.length, 1));
}
{
  const tg = fakeTelegram();
  await laufen(tg, tastendruck(HELFER, 'rm:bulls'));
  const suchen = await listWatches(pfad);
  check('die Loeschtaste verweigert er ihm', () =>
    assert.ok(tg.beantwortet.at(-1).text.includes('Recht')));
  check('die Suche steht noch', () => assert.equal(suchen.length, 1));
}
{
  const tg = fakeTelegram();
  await laufen(tg, tastendruck(HELFER, 'takt:bulls:30'));
  const suchen = await listWatches(pfad);
  check('den Takt darf er auch nicht setzen', () =>
    assert.ok(tg.beantwortet.at(-1).text.includes('Recht')));
  check('der Takt ist unveraendert', () => assert.equal(suchen[0].intervalSeconds, 60));
}
{
  const tg = fakeTelegram();
  await laufen(tg, nachricht(HELFER, `/user add ${FREMDER}`));
  check('/user bleibt dem Besitzer vorbehalten', () =>
    assert.ok(tg.letzte().includes('Besitzer')));
  const users = await listUsers(pfad);
  check('er kann niemanden nachholen', () => assert.equal(users.length, 1));
}
{
  const tg = fakeTelegram();
  await laufen(tg, tastendruck(HELFER, `urm:${HELFER}`));
  const users = await listUsers(pfad);
  check('und auch niemanden ueber die Taste entfernen', () => assert.equal(users.length, 1));
}

console.log('\n== Rechte nachtraeglich aendern ==');
{
  const tg = fakeTelegram();
  await laufen(tg, nachricht(OWNER, `/user rechte ${HELFER} alle`));
  const users = await listUsers(pfad);
  check('jetzt hat er alles', () => assert.deepEqual(users[0].rights, ['list', 'edit', 'remove']));
}
{
  const tg = fakeTelegram();
  await laufen(tg, nachricht(HELFER, '/list'));
  check('und sieht jetzt auch die Tasten', () =>
    assert.ok(tg.gesendet.some((g) => g.buttons?.[0]?.length === 3)));
}
{
  const tg = fakeTelegram();
  const { geaendert } = await laufen(tg, tastendruck(HELFER, 'rm:bulls'));
  const suchen = await listWatches(pfad);
  check('loeschen klappt jetzt', () => assert.equal(suchen.length, 0));
  check('und meldet die Aenderung zurueck', () => assert.equal(geaendert, true));
}
{
  const tg = fakeTelegram();
  await laufen(tg, nachricht(OWNER, `/user rechte ${HELFER} anshen`));
  const users = await listUsers(pfad);
  check('ein Tippfehler aendert nichts', () =>
    assert.deepEqual(users[0].rights, ['list', 'edit', 'remove']));
  check('und wird erklaert', () => assert.ok(tg.letzte().includes('Unbekannte Rechte')));
}

console.log('\n== Wieder aussperren ==');
{
  const tg = fakeTelegram();
  await laufen(tg, nachricht(OWNER, `/user del ${HELFER}`));
  const users = await listUsers(pfad);
  check('die Liste ist leer', () => assert.equal(users.length, 0));
}
{
  const tg = fakeTelegram();
  const { meldungen } = await laufen(tg, nachricht(HELFER, '/list'));
  check('er kommt nicht mehr durch', () => assert.equal(tg.gesendet.length, 0));
  check('sondern landet im Log', () => assert.ok(meldungen.join(' ').includes(HELFER)));
}

console.log('\n== Randfaelle ==');
{
  const tg = fakeTelegram();
  await laufen(tg, nachricht(OWNER, '/user add ichbinkeinezahl'));
  check('ein Name statt einer Kennung wird abgelehnt', () =>
    assert.ok(tg.letzte().includes('keine Telegram-Kennung')));
}
{
  const tg = fakeTelegram();
  await laufen(tg, nachricht(OWNER, `/user add ${OWNER}`));
  check('sich selbst kann der Besitzer nicht aufnehmen', () =>
    assert.ok(tg.letzte().includes('du selbst')));
}
{
  const tg = fakeTelegram();
  await laufen(tg, nachricht(OWNER, `/user add ${HELFER} Ali rechte: ansehen,aendern`));
  await laufen(tg, nachricht(OWNER, `/user add ${HELFER} Ali`));
  const users = await listUsers(pfad);
  check('zweimal aufnehmen geht nicht', () => assert.ok(tg.letzte().includes('schon auf der Liste')));
  check('die Rechte aus dem ersten Aufruf stehen', () =>
    assert.deepEqual(users[0].rights, ['list', 'edit']));
}
{
  // Eine von Hand geschriebene Datei darf auch die kurze Form enthalten.
  neuAufsetzen([HELFER]);
  const tg = fakeTelegram();
  await laufen(tg, nachricht(HELFER, '/list'));
  check('eine nackte Kennung in der Datei zaehlt als Grundrecht', () =>
    assert.ok(tg.gesendet.some((g) => g.text.includes('Bulls'))));
}
{
  const tg = fakeTelegram();
  await laufen(tg, nachricht(OWNER, '/help'));
  check('der Besitzer sieht den /user-Teil der Hilfe', () => assert.ok(tg.letzte().includes('/user')));
}
{
  neuAufsetzen([{ id: HELFER, rights: ['list'] }]);
  const tg = fakeTelegram();
  await laufen(tg, nachricht(HELFER, '/help'));
  check('ein Helfer sieht ihn nicht', () => assert.ok(!tg.letzte().includes('/user')));
}

restoreFetch();
rmSync(dir, { recursive: true, force: true });
await check.summary();
