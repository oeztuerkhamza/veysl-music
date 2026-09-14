// Takt und Erstnachricht einer bestehenden Suche per Telegram aendern.
import { strict as assert } from 'node:assert';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createChecker, stubKleinanzeigen } from './helpers.mjs';

const { handleUpdate, parseOptions } = await import('../src/commands.mjs');
const { addWatch, listWatches, updateWatch } = await import('../src/manage.mjs');
const { loadConfig } = await import('../src/config.mjs');

const restoreFetch = stubKleinanzeigen();
const check = createChecker();

const OWNER = '6903649187';
const URL_BULLS =
  'https://www.kleinanzeigen.de/s-fahrraeder/freiburg-im-breisgau/bulls/k0c217l9354r20';

const dir = mkdtempSync(join(tmpdir(), 'kaw-edit-'));
const cfg = join(dir, 'watches.json');
writeFileSync(cfg, JSON.stringify({ telegram: { chatId: OWNER }, watches: [] }, null, 2));
const { watch: angelegt } = await addWatch(cfg, URL_BULLS, {});
const ID = angelegt.id;

function fakeTelegram() {
  const sent = [];
  const answered = [];
  const edited = [];
  return {
    chatId: OWNER,
    sent,
    answered,
    edited,
    async sendText(text, o) {
      sent.push({ text, buttons: o?.buttons, forceReply: o?.forceReply });
    },
    async answerCallback(id, text) {
      answered.push({ id, text });
    },
    async editText(id, text, o) {
      edited.push({ id, text, buttons: o?.buttons });
    },
    last() {
      return sent.at(-1)?.text ?? '';
    },
  };
}
const msg = (text, extra = {}) => ({
  update_id: 1,
  message: { text, chat: { id: OWNER }, ...extra },
});
const cb = (data) => ({
  update_id: 2,
  callback_query: { id: 'c1', data, message: { message_id: 7, chat: { id: OWNER } } },
});
const ctx = (tg) => ({ telegram: tg, configPath: cfg, timeoutMs: 20000, log: () => {} });

console.log('\n== Takt beim Anlegen ==');
check('"takt 30" wird gelesen', () => assert.equal(parseOptions('url takt 30').intervalSeconds, 30));
check('"alle 90" ebenso', () => assert.equal(parseOptions('url alle 90').intervalSeconds, 90));
check('"takt 45 sekunden"', () =>
  assert.equal(parseOptions('url takt 45 sekunden').intervalSeconds, 45));
check('ohne Angabe kein Takt', () => assert.equal(parseOptions('url max 300').intervalSeconds, undefined));
check('Preis wird nicht als Takt gelesen', () =>
  assert.equal(parseOptions('url max 300').intervalSeconds, undefined));

console.log('\n== Takt per Taste ==');
{
  const tg = fakeTelegram();
  await handleUpdate(cb(`takt:${ID}`), ctx(tg));
  const auswahl = tg.edited.at(-1);
  check('Auswahl erscheint in derselben Nachricht', () => assert.ok(auswahl));
  check('fünf Vorschläge plus zurück', () => assert.equal(auswahl.buttons.length, 2));
  check('30 s ist dabei', () =>
    assert.ok(auswahl.buttons[0].some((b) => b.callback_data === `takt:${ID}:30`)));
  check('der aktuelle Takt ist markiert', () =>
    assert.ok(auswahl.buttons[0].some((b) => b.text.startsWith('•'))));
  check('zurück führt zur Karte', () =>
    assert.equal(auswahl.buttons[1][0].callback_data, `card:${ID}`));
}
{
  const tg = fakeTelegram();
  const changed = await handleUpdate(cb(`takt:${ID}:30`), ctx(tg));
  check('meldet Konfigurationsaenderung', () => assert.equal(changed, true));
  const nachTaste = (await listWatches(cfg))[0];
  check('in der Datei angekommen', () => assert.equal(nachTaste.intervalSeconds, 30));
  check('Karte zeigt den neuen Takt', () => assert.match(tg.edited.at(-1).text, /alle 30s/));
  check('Taste wurde bestaetigt', () => assert.match(tg.answered[0].text, /30/));
}
{
  const liste = await listWatches(cfg);
  check('30 s steht wirklich in der Datei', () => assert.equal(liste[0].intervalSeconds, 30));
}

console.log('\n== Zu kurzer Takt wird abgelehnt ==');
await assert.rejects(() => updateWatch(cfg, ID, { intervalSeconds: 5 }), /zu kurz/);
check('5 s abgelehnt', () => true);
await assert.rejects(() => updateWatch(cfg, ID, { intervalSeconds: 'abc' }), /ganze Zahl/);
check('Text als Sekunden abgelehnt', () => true);
await assert.rejects(() => addWatch(cfg, 'https://www.kleinanzeigen.de/s-notebooks/k0c278', { intervalSeconds: 5 }), /zu kurz/);
check('auch beim Anlegen abgelehnt', () => true);
const nachAblehnung = await loadConfig(cfg);
check('die Datei blieb unveraendert gueltig', () => assert.equal(nachAblehnung.watches[0].intervalSeconds, 30));

console.log('\n== Takt per Befehl ==');
{
  const tg = fakeTelegram();
  await handleUpdate(msg(`/takt ${ID} 120`), ctx(tg));
  const nachBefehl = (await listWatches(cfg))[0];
  check('gesetzt', () => assert.equal(nachBefehl.intervalSeconds, 120));
  check('Rueckmeldung nennt den Wert', () => assert.match(tg.last(), /120s/));
}
{
  const tg = fakeTelegram();
  await handleUpdate(msg('/takt'), ctx(tg));
  check('ohne id kommt die Anleitung mit den ids', () => {
    assert.match(tg.last(), /\/takt/);
    assert.ok(tg.last().includes(ID), 'id fehlt in der Hilfe');
  });
}
{
  const tg = fakeTelegram();
  await handleUpdate(msg('/takt gibtsnicht 60'), ctx(tg));
  check('unbekannte id wird gemeldet', () => assert.match(tg.last(), /Keine Suche/));
}

console.log('\n== Erstnachricht per Antwort ==');
let frage = '';
{
  const tg = fakeTelegram();
  await handleUpdate(cb(`text:${ID}`), ctx(tg));
  // Telegram liefert den zitierten Text OHNE Formatierung; die <i>-Tags sind
  // dort schon weg. Genau so muss der Test ihn weiterreichen.
  frage = tg.sent.at(-1).text.replace(/<[^>]+>/g, '');
  check('Frage wird gestellt', () => assert.match(frage, /Neuer Text/));
  check('als Antwort-Aufforderung', () => assert.equal(tg.sent.at(-1).forceReply, true));
  check('die id steckt in der Frage', () => assert.ok(frage.includes('#' + ID), frage));
  check('Platzhalter werden erklaert', () => assert.match(frage, /\{title\}/));
}
{
  const tg = fakeTelegram();
  const changed = await handleUpdate(
    msg('Hallo, ist {title} noch da? Ich hole es heute ab.', {
      reply_to_message: { text: frage },
    }),
    ctx(tg),
  );
  check('meldet Konfigurationsaenderung', () => assert.equal(changed, true));
  await check('Vorlage gespeichert', async () =>
    assert.match((await listWatches(cfg))[0].messageTemplate, /^Hallo, ist \{title\}/));
  check('Karte zeigt die Vorlage', () => assert.match(tg.sent.at(-1).text, /✏️/));
}
{
  // Eine URL in der Vorlage darf keine neue Suche anlegen.
  const tg = fakeTelegram();
  const vorher = (await listWatches(cfg)).length;
  await handleUpdate(
    msg('Siehe https://www.kleinanzeigen.de/s-anzeige/x/1-2-3 — noch da?', {
      reply_to_message: { text: frage },
    }),
    ctx(tg),
  );
  await check('Antwort mit URL legt keine Suche an', async () =>
    assert.equal((await listWatches(cfg)).length, vorher));
  await check('sondern setzt die Vorlage', async () =>
    assert.match((await listWatches(cfg))[0].messageTemplate, /^Siehe https/));
}
{
  const tg = fakeTelegram();
  await handleUpdate(msg('-', { reply_to_message: { text: frage } }), ctx(tg));
  await check('"-" schaltet den Kopiertext ab', async () =>
    assert.equal((await listWatches(cfg))[0].messageTemplate, ''));
  check('und sagt es', () => assert.match(tg.sent[0].text, /aus/));
}
{
  const tg = fakeTelegram();
  await handleUpdate(msg('*', { reply_to_message: { text: frage } }), ctx(tg));
  await check('"*" stellt den allgemeinen wieder her', async () =>
    assert.equal((await listWatches(cfg))[0].messageTemplate, undefined));
}

console.log('\n== Erstnachricht per Befehl ==');
{
  const tg = fakeTelegram();
  await handleUpdate(msg(`/text ${ID} Moin, ist {title} noch zu haben?`), ctx(tg));
  await check('gesetzt', async () =>
    assert.equal((await listWatches(cfg))[0].messageTemplate, 'Moin, ist {title} noch zu haben?'));
  check('bestaetigt', () => assert.match(tg.last(), /gesetzt/));
}
await assert.rejects(() => updateWatch(cfg, ID, { messageTemplate: 'x'.repeat(700) }), /600/);
check('zu lange Vorlage abgelehnt', () => true);

console.log('\n== Vorlage wirkt bis in die Konfiguration ==');
{
  const c = await loadConfig(cfg);
  check('Suche traegt ihre eigene Vorlage', () =>
    assert.equal(c.watches[0].messageTemplate, 'Moin, ist {title} noch zu haben?'));
  check('Takt ebenfalls uebernommen', () => assert.equal(c.watches[0].intervalSeconds, 120));
}

restoreFetch();
rmSync(dir, { recursive: true, force: true });
await check.summary();
