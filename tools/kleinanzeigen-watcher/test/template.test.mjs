import { strict as assert } from 'node:assert';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = new URL('../src/', import.meta.url).href;
const { Telegram, bridgeLink, renderMessage } = await import(BASE + 'telegram.mjs');
const { loadConfig } = await import(BASE + 'config.mjs');

let pass = 0;
const fail = [];
const check = (n, f) => {
  try { f(); pass++; console.log('  ok   ' + n); }
  catch (e) { fail.push(n); console.log('  FAIL ' + n + ' -> ' + e.message); }
};

const AD = {
  id: '1',
  title: 'Bulls Mountainbike 26zoll',
  url: 'https://www.kleinanzeigen.de/s-anzeige/bulls-mountainbike-26zoll/3508984201-217-9366',
  price: '80 € VB',
  location: '79115 Freiburg',
  postedAt: 'Heute, 14:34',
  isTopAd: false, isCommercial: false, shipping: false,
};
const SITE = 'https://dj-veys.de';
const TPL = 'Hallo, ist "{title}" noch verfügbar? Ich hätte Interesse und könnte es kurzfristig abholen. Viele Grüße';

console.log('\n== Platzhalter ==');
check('{title} wird gesetzt', () =>
  assert.ok(renderMessage(TPL, AD).includes('"Bulls Mountainbike 26zoll"')));
check('{price} wird gesetzt', () =>
  assert.equal(renderMessage('Preis: {price}', AD), 'Preis: 80 € VB'));
check('{location} wird gesetzt', () =>
  assert.equal(renderMessage('Ort: {location}', AD), 'Ort: 79115 Freiburg'));
check('{url} wird gesetzt', () => assert.ok(renderMessage('{url}', AD).includes('/s-anzeige/')));
check('mehrere Platzhalter', () =>
  assert.equal(renderMessage('{title} für {price}', AD), 'Bulls Mountainbike 26zoll für 80 € VB'));
check('unbekannter Platzhalter bleibt stehen', () =>
  assert.equal(renderMessage('Hallo {name}', AD), 'Hallo {name}'));
check('leere Vorlage ergibt nichts', () => assert.equal(renderMessage('', AD), null));
check('null ergibt nichts', () => assert.equal(renderMessage(null, AD), null));
check('nur Leerzeichen ergibt nichts', () => assert.equal(renderMessage('   ', AD), null));
check('fehlender Preis wird zu leer, nicht zu undefined', () =>
  assert.equal(renderMessage('[{price}]', { ...AD, price: undefined }), '[]'));

console.log('\n== Vorlage landet im Brückenlink ==');
check('als ?m= angehängt', () => {
  const u = new URL(bridgeLink(AD.url, SITE, AD.title, renderMessage(TPL, AD)));
  assert.ok(u.searchParams.get('m').startsWith('Hallo, ist "Bulls'));
});
check('ohne Vorlage kein ?m=', () => {
  const u = new URL(bridgeLink(AD.url, SITE, AD.title, null));
  assert.equal(u.searchParams.get('m'), null);
});
check('sehr lange Vorlage wird gekappt', () => {
  const u = new URL(bridgeLink(AD.url, SITE, null, 'x'.repeat(2000)));
  assert.equal(u.searchParams.get('m').length, 600);
});
check('Sonderzeichen werden kodiert, nicht roh eingesetzt', () => {
  const link = bridgeLink(AD.url, SITE, null, 'A & B <c> "d"');
  assert.ok(!link.includes('<c>'), link);
  assert.equal(new URL(link).searchParams.get('m'), 'A & B <c> "d"');
});

console.log('\n== Nachricht im Chat ==');
{
  const tg = new Telegram('t', '1', { bridgeBaseUrl: SITE });
  let text = '';
  tg.sendText = async (s) => { text = s; };
  await tg.sendAd(AD, 'Meine Suche', TPL);
  check('Link heißt "Text kopieren & in der App oeffnen"', () =>
    assert.ok(text.includes('Text kopieren &amp; in der App oeffnen')));
  check('Brückenlink trägt m=', () => assert.ok(text.includes('m=Hallo')));
  // Der Browser-Link ist weg: er fuehrte in Telegrams eingebauten Browser,
  // also dorthin, wo man sich erst einloggen muss.
  check('kein direkter Link daneben', () => assert.ok(!text.includes(`href="${AD.url}"`)));
}
{
  const tg = new Telegram('t', '1', { bridgeBaseUrl: SITE });
  let text = '';
  tg.sendText = async (s) => { text = s; };
  await tg.sendAd(AD, 'Meine Suche', null);
  check('ohne Vorlage heißt der Link wieder "In der App oeffnen"', () =>
    assert.ok(text.includes('>In der App oeffnen</a>')));
}

console.log('\n== Konfiguration ==');
const dir = mkdtempSync(join(tmpdir(), 'kaw-tpl-'));
const p = join(dir, 'w.json');
await (async () => {
  writeFileSync(p, JSON.stringify({
    telegram: { chatId: '1' },
    watches: [{ id: 'a', url: 'https://www.kleinanzeigen.de/s-fahrraeder/k0c217' }],
  }));
  const cfg = await loadConfig(p);
  check('Standardvorlage vorhanden', () => assert.ok(cfg.messageTemplate.includes('{title}')));
  check('Standardvorlage fragt nach Verfügbarkeit', () =>
    assert.match(cfg.messageTemplate, /verfügbar/i));
  check('Standardvorlage feilscht nicht', () =>
    assert.ok(!/preis|günstiger|handeln|VB/i.test(cfg.messageTemplate), cfg.messageTemplate));
  check('Suche erbt (kein eigener Wert)', () => assert.equal(cfg.watches[0].messageTemplate, null));

  writeFileSync(p, JSON.stringify({
    telegram: { chatId: '1' },
    messageTemplate: 'Global {title}',
    watches: [
      { id: 'a', url: 'https://www.kleinanzeigen.de/s-fahrraeder/k0c217' },
      { id: 'b', url: 'https://www.kleinanzeigen.de/s-notebooks/k0c278', messageTemplate: 'Eigen {title}' },
      { id: 'c', url: 'https://www.kleinanzeigen.de/s-auto/k0c216', messageTemplate: '' },
    ],
  }));
  const cfg2 = await loadConfig(p);
  check('globale Vorlage wird übernommen', () => assert.equal(cfg2.messageTemplate, 'Global {title}'));
  check('Suche mit eigener Vorlage', () => assert.equal(cfg2.watches[1].messageTemplate, 'Eigen {title}'));
  check('leerer String heißt "keine Vorlage", nicht "erben"', () =>
    assert.equal(cfg2.watches[2].messageTemplate, ''));
})();

rmSync(dir, { recursive: true, force: true });
console.log(`\n=========  ${pass} ok, ${fail.length} fehlgeschlagen  =========`);
if (fail.length) process.exit(1);
