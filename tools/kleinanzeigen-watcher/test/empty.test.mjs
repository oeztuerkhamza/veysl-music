// Die Falle, die den Container in einen Neustart-Kreis geschickt hat:
// letzte Suche per Telegram geloescht -> "watches ist leer" -> Absturz ->
// keine neue Suche mehr moeglich, weil der Bot mit gestorben ist.
import { strict as assert } from 'node:assert';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = new URL('../src/', import.meta.url).href;
const { loadConfig } = await import(BASE + 'config.mjs');
const { handleUpdate } = await import(BASE + 'commands.mjs');
const { listWatches } = await import(BASE + 'manage.mjs');

import { stubKleinanzeigen } from './helpers.mjs';

// Kein echter Abruf aus der Testreihe heraus: handleAdd macht intern einen
// Probeabruf, und der soll nicht bei jedem Commit bei kleinanzeigen.de landen.
const restoreFetch = stubKleinanzeigen();

const OWNER = '6903649187';
const URL_BULLS = 'https://www.kleinanzeigen.de/s-fahrraeder/freiburg-im-breisgau/bulls/k0c217l9354r20';

let pass = 0;
const fail = [];
const check = (n, f) => {
  try { f(); pass++; console.log('  ok   ' + n); }
  catch (e) { fail.push(n); console.log('  FAIL ' + n + ' -> ' + e.message); }
};

const dir = mkdtempSync(join(tmpdir(), 'kaw-empty-'));
const cfgPath = join(dir, 'watches.json');

// Exakt der Stand, der auf dem Server lag, als der Container im Kreis lief.
writeFileSync(cfgPath, JSON.stringify({ telegram: { chatId: OWNER }, watches: [] }, null, 2));

console.log('\n== Leere Liste ist kein Fehler mehr ==');
let cfg;
await (async () => {
  cfg = await loadConfig(cfgPath);
  check('Konfiguration laedt', () => assert.ok(cfg));
  check('null Suchen', () => assert.equal(cfg.watches.length, 0));
  check('chatId bleibt erhalten', () => assert.equal(cfg.telegram.chatId, OWNER));
})();

console.log('\n== Kein Array bleibt ein Fehler ==');
writeFileSync(cfgPath, JSON.stringify({ telegram: { chatId: OWNER }, watches: 'nein' }));
await assert.rejects(() => loadConfig(cfgPath), /Liste/);
check('watches als String wird abgewiesen', () => true);
writeFileSync(cfgPath, JSON.stringify({ telegram: { chatId: OWNER } }));
await assert.rejects(() => loadConfig(cfgPath), /Liste/);
check('fehlendes watches wird abgewiesen', () => true);

console.log('\n== Der Weg zurueck: aus dem Leerlauf per Telegram ==');
writeFileSync(cfgPath, JSON.stringify({ telegram: { chatId: OWNER }, watches: [] }, null, 2));
await (async () => {
  const sent = [];
  const tg = {
    chatId: OWNER,
    async sendText(t) { sent.push(t); },
    async answerCallback() {},
    async editText() {},
  };
  const ctx = { telegram: tg, configPath: cfgPath, timeoutMs: 20000, log: () => {} };

  await handleUpdate({ update_id: 1, message: { text: '/list', chat: { id: OWNER } } }, ctx);
  check('/list sagt hoeflich, dass nichts da ist', () =>
    assert.match(sent.at(-1), /Noch keine Suche/));

  const changed = await handleUpdate(
    { update_id: 2, message: { text: URL_BULLS + ' max 400', chat: { id: OWNER } } },
    ctx,
  );
  check('URL per Bot legt die Suche an', () => assert.equal(changed, true));
  check('Datei enthaelt sie', async () => assert.equal((await listWatches(cfgPath)).length, 1));

  const after = await loadConfig(cfgPath);
  check('Konfiguration laedt danach mit einer Suche', () => assert.equal(after.watches.length, 1));
  check('Filter uebernommen', () => assert.equal(after.watches[0].filters.maxPrice, 400));
})();

console.log('\n== Und wieder loeschen fuehrt nicht in den Absturz ==');
await (async () => {
  const tg = {
    chatId: OWNER,
    sent: [],
    async sendText(t) { this.sent.push(t); },
    async answerCallback() {},
    async editText() {},
  };
  const ctx = { telegram: tg, configPath: cfgPath, log: () => {} };
  const list = await listWatches(cfgPath);
  await handleUpdate(
    { update_id: 3, callback_query: { id: 'c', data: 'rm:' + list[0].id, message: { message_id: 1, chat: { id: OWNER } } } },
    ctx,
  );
  check('Suche geloescht', async () => assert.equal((await listWatches(cfgPath)).length, 0));
  const empty = await loadConfig(cfgPath);
  check('Konfiguration laedt weiterhin', () => assert.equal(empty.watches.length, 0));
  check('Datei ist gueltiges JSON geblieben', () =>
    assert.ok(JSON.parse(readFileSync(cfgPath, 'utf8')).telegram.chatId));
})();

rmSync(dir, { recursive: true, force: true });
restoreFetch();
console.log(`\n=========  ${pass} ok, ${fail.length} fehlgeschlagen  =========`);
if (fail.length) process.exit(1);
