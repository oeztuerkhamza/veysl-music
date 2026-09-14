// Der einzige Test, der wirklich bei kleinanzeigen.de anfragt.
//
// Laeuft nur auf Zuruf (`node test/run.mjs --live`) und ausdruecklich nicht in
// CI: eine Testreihe, die bei jedem Commit eine fremde Seite abruft, erzeugt
// Last, die niemandem nuetzt — und ausgerechnet dieses Projekt lebt davon, dass
// Kleinanzeigen es nicht sperrt.
//
// Wofuer er da ist: der gespeicherte Ausschnitt in parser.test.mjs altert. Wenn
// Kleinanzeigen die Seite umbaut, merkt es nur dieser Test — und der Watcher im
// Betrieb ueber die Stille-Warnung.

import { strict as assert } from 'node:assert';
import { createChecker } from './helpers.mjs';

const { fetchAds, normalizeSearchUrl } = await import('../src/kleinanzeigen.mjs');
const check = createChecker();

const URL_SUCHE = 'https://www.kleinanzeigen.de/s-fahrraeder/k0c217';

console.log('\n== Echter Abruf (ein einziger) ==');
const ads = await fetchAds(normalizeSearchUrl(URL_SUCHE));

check('die Seite liefert Anzeigen', () => assert.ok(ads.length >= 10, `nur ${ads.length}`));
check('jede hat id, Titel und Anzeigen-URL', () =>
  ads.forEach((a) => {
    assert.match(a.id, /^\d+$/);
    assert.ok(a.title.length > 0, 'leerer Titel bei ' + a.id);
    assert.ok(a.url.startsWith('https://www.kleinanzeigen.de/s-anzeige/'), a.url);
  }));
check('ids sind eindeutig', () => assert.equal(new Set(ads.map((a) => a.id)).size, ads.length));
check('die meisten haben einen lesbaren Preis', () =>
  assert.ok(ads.filter((a) => /\d|verschenken/i.test(a.price)).length >= ads.length / 2));
check('Datum wird geliefert', () =>
  assert.ok(ads.filter((a) => a.postedAt).length >= ads.length / 2));
check('privat und gewerblich werden unterschieden', () =>
  assert.ok(ads.some((a) => !a.isCommercial), 'alle als gewerblich erkannt'));
check('das JSON der Seite wird noch gefunden', () =>
  // Der Rueckfall-Parser kennt weder topAd noch posterType. Kommen die Felder
  // durch, lief die bevorzugte Auswertung — genau das soll dieser Test sehen.
  assert.ok(ads.some((a) => a.postedAt && a.location), 'Rueckfall-Parser aktiv?'));

console.log(`\n  (${ads.length} Anzeigen gelesen)`);
check.summary();
