// Der Parser gegen einen echten, gekuerzten Seitenausschnitt.
//
// Das ist der Test, der am ehesten einmal ausschlagen wird: Kleinanzeigen
// aendert die Seite, und der Watcher findet nichts mehr. Bisher fiel so etwas
// erst dadurch auf, dass tagelang keine Meldung kam.

import { strict as assert } from 'node:assert';
import { createChecker, stubKleinanzeigen, FIXTURE } from './helpers.mjs';

const { fetchAds, normalizeSearchUrl, BlockedError } = await import('../src/kleinanzeigen.mjs');
const check = createChecker();

const URL_SUCHE = 'https://www.kleinanzeigen.de/s-fahrraeder/k0c217';

console.log('\n== Anzeigen aus dem JSON der Seite ==');
{
  const restore = stubKleinanzeigen();
  const ads = await fetchAds(normalizeSearchUrl(URL_SUCHE));
  restore();

  check('drei Anzeigen gefunden', () => assert.equal(ads.length, 3));
  check('jede hat eine numerische id', () => ads.every((a) => assert.match(a.id, /^\d+$/)));
  check('jede hat eine absolute Anzeigen-URL', () =>
    ads.every((a) => assert.ok(a.url.startsWith('https://www.kleinanzeigen.de/s-anzeige/'), a.url)));
  check('Titel sind gefuellt', () => ads.every((a) => assert.ok(a.title.length > 3, a.id)));

  const top = ads.find((a) => a.isTopAd);
  check('bezahlte Top-Anzeige wird erkannt', () => assert.ok(top, 'keine topAd im Ausschnitt'));
  check('Top-Anzeige ist gewerblich', () => assert.equal(top.isCommercial, true));
  check('Top-Anzeige hat den Preis', () => assert.equal(top.price, '2.999 €'));

  const privat = ads.filter((a) => !a.isCommercial);
  check('private Anzeigen werden unterschieden', () => assert.ok(privat.length >= 2));
  check('Ort wird gelesen', () => assert.ok(privat[0].location.length > 0, privat[0].location));
  check('Datum wird gelesen', () => assert.ok(privat[0].postedAt.length > 0));
  check('Versandkennzeichen wird gelesen', () => assert.ok(ads.some((a) => a.shipping)));
  check('ids sind eindeutig', () => assert.equal(new Set(ads.map((a) => a.id)).size, ads.length));
}

console.log('\n== Rueckfall, wenn das JSON verschwindet ==');
{
  // Genau der Fall, fuer den es den zweiten Parser gibt: Kleinanzeigen liefert
  // die Astro-Insel nicht mehr, die <article>-Elemente aber schon.
  const ohneInsel = FIXTURE.replace(/<astro-island[\s\S]*?<\/astro-island>/, '');
  const restore = stubKleinanzeigen({ body: ohneInsel });
  const ads = await fetchAds(normalizeSearchUrl(URL_SUCHE));
  restore();

  check('findet die Anzeigen trotzdem', () => assert.equal(ads.length, 3));
  check('id und URL stimmen — nur die entscheiden ueber "neu"', () =>
    ads.every((a) => {
      assert.match(a.id, /^\d+$/);
      assert.ok(a.url.includes('/s-anzeige/'));
    }));
  check('Titel kommt auch ohne JSON an', () => ads.every((a) => assert.ok(a.title.length > 3)));
  check('Preis wird aus dem Markup gelesen', () => assert.ok(ads.some((a) => a.price.includes('€'))));
}

console.log('\n== Wenn die Seite nichts Brauchbares liefert ==');
{
  const restore = stubKleinanzeigen({ body: '<html><body>Bitte Captcha loesen</body></html>' });
  await assert.rejects(() => fetchAds(URL_SUCHE), BlockedError);
  restore();
  check('Captcha-Seite gilt als Sperre, nicht als "keine Treffer"', () => true);
}
{
  const restore = stubKleinanzeigen({ status: 429, body: '' });
  await assert.rejects(() => fetchAds(URL_SUCHE), BlockedError);
  restore();
  check('HTTP 429 wird als Sperre gemeldet', () => true);
}
{
  const restore = stubKleinanzeigen({ body: '<html><body><p>Keine Anzeigen gefunden</p></body></html>' });
  const ads = await fetchAds(URL_SUCHE);
  restore();
  check('echte Nulltreffer sind kein Fehler', () => assert.deepEqual(ads, []));
}

await check.summary();
