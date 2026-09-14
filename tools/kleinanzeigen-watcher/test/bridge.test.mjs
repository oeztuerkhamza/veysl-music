import { strict as assert } from 'node:assert';
const BASE = new URL('../src/', import.meta.url).href;
const { Telegram, bridgeLink } = await import(BASE + 'telegram.mjs');

let pass = 0;
const fail = [];
const check = (n, f) => {
  try { f(); pass++; console.log('  ok   ' + n); }
  catch (e) { fail.push(n); console.log('  FAIL ' + n + ' -> ' + e.message); }
};

const AD = 'https://www.kleinanzeigen.de/s-anzeige/bulls-mountainbike-26zoll/3508984201-217-9366';
const SITE = 'https://dj-veys.de';

console.log('\n== Brückenlink bauen ==');
check('Pfad landet unter /api/ka', () =>
  assert.equal(
    bridgeLink(AD, SITE, null),
    'https://dj-veys.de/api/ka/bulls-mountainbike-26zoll/3508984201-217-9366',
  ));
check('Titel wird als ?t angehängt', () => {
  const u = new URL(bridgeLink(AD, SITE, 'Bulls Rad'));
  assert.equal(u.searchParams.get('t'), 'Bulls Rad');
});
check('langer Titel wird gekürzt', () => {
  const u = new URL(bridgeLink(AD, SITE, 'x'.repeat(500)));
  assert.equal(u.searchParams.get('t').length, 120);
});
check('Sonderzeichen im Titel werden kodiert', () => {
  const u = new URL(bridgeLink(AD, SITE, 'Rad & "Zubehör" <b>'));
  assert.equal(u.searchParams.get('t'), 'Rad & "Zubehör" <b>');
  assert.ok(!u.toString().includes('<b>'), 'roh im String: ' + u.toString());
});
check('Basis mit Schrägstrich am Ende', () =>
  assert.equal(bridgeLink(AD, SITE + '/', null), bridgeLink(AD, SITE, null)));
check('ohne Basis kein Brückenlink', () => assert.equal(bridgeLink(AD, null, null), null));
check('fremder Host bekommt keinen Brückenlink', () =>
  assert.equal(bridgeLink('https://www.ebay.de/x/y', SITE, null), null));
check('Nicht-Anzeigenpfad wird abgelehnt', () =>
  assert.equal(bridgeLink('https://www.kleinanzeigen.de/s-fahrraeder/k0c217', SITE, null), null));
check('Unsinn stürzt nicht ab', () => assert.equal(bridgeLink('keine-url', SITE, null), null));
check('Query der Anzeige stört nicht', () =>
  assert.ok(bridgeLink(AD + '?utm=x', SITE, null).endsWith('/3508984201-217-9366')));

const ad = {
  id: '1', title: 'Bulls Rad', url: AD, price: '200 €',
  location: 'Freiburg', postedAt: 'Heute, 14:34',
  isTopAd: false, isCommercial: false, shipping: false,
};

console.log('\n== Nachricht mit Brücke ==');
{
  const tg = new Telegram('t', '1', { bridgeBaseUrl: SITE });
  let text = '';
  tg.sendText = async (s) => { text = s; };
  await tg.sendAd(ad, 'Meine Suche');
  check('Brückenlink enthalten', () => assert.ok(text.includes('dj-veys.de/api/ka/'), text));
  check('direkter Link daneben', () => assert.ok(text.includes(`href="${AD}"`)));
  check('App zuerst', () => assert.ok(text.indexOf('In der App') < text.indexOf('Browser')));
  check('Titel und Preis weiterhin da', () =>
    assert.ok(text.includes('Bulls Rad') && text.includes('200 €')));
}

console.log('\n== Ohne Brücke (unverändertes Verhalten) ==');
{
  const tg = new Telegram('t', '1');
  let text = '';
  tg.sendText = async (s) => { text = s; };
  await tg.sendAd(ad, 'Meine Suche');
  check('kein /api/ka', () => assert.ok(!text.includes('/api/ka')));
  check('einzelner Link wie bisher', () => assert.ok(text.includes('>Anzeige oeffnen</a>')));
}

console.log(`\n=========  ${pass} ok, ${fail.length} fehlgeschlagen  =========`);
if (fail.length) process.exit(1);
