// Prueft, was ueber das Tempo entscheidet: Takt, Streuung und die Altersangabe
// in der Meldung.
import { strict as assert } from 'node:assert';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createChecker } from './helpers.mjs';

const BASE = new URL('../src/', import.meta.url).href;
const { parsePostedAt } = await import(BASE + 'kleinanzeigen.mjs');
const { describeAge, describeDelay, Telegram } = await import(BASE + 'telegram.mjs');
const { loadConfig } = await import(BASE + 'config.mjs');
const { MIN_INTERVAL_SECONDS, addWatch, updateWatch } = await import(BASE + 'manage.mjs');

const check = createChecker();
const URL_BULLS = 'https://www.kleinanzeigen.de/s-fahrraeder/freiburg/bulls/k0c217l9354r20';

console.log('== Einstellzeit lesen ==');
const jetzt = new Date('2026-09-14T14:35:20');
check('"Heute, 14:34" ist 80 s her', () =>
  assert.equal((jetzt - parsePostedAt('Heute, 14:34', jetzt)) / 1000, 80));
check('"Gestern" zaehlt einen Tag zurueck', () =>
  assert.equal(parsePostedAt('Gestern, 14:34', jetzt), parsePostedAt('Heute, 14:34', jetzt) - 86400000));
check('ein blosses Datum hilft nicht und ergibt null', () =>
  assert.equal(parsePostedAt('18.08.2026', jetzt), null));
check('Unsinn ergibt null', () => assert.equal(parsePostedAt('bald', jetzt), null));
check('leer ergibt null', () => assert.equal(parsePostedAt('', jetzt), null));
{
  // Kurz nach Mitternacht steht bei einer Anzeige von gestern Abend noch
  // "Heute" — ohne Korrektur laege sie knapp 24 h in der Zukunft.
  const mitternacht = new Date('2026-09-14T00:02:00');
  const alter = (mitternacht - parsePostedAt('Heute, 23:58', mitternacht)) / 60000;
  check('"Heute, 23:58" um 00:02 ist 4 min her, nicht negativ', () => assert.equal(alter, 4));
}

console.log('\n== Alter in Worten ==');
const now = Date.now();
check('frisch in Sekunden', () => assert.equal(describeAge(now - 25_000, now), '25 s alt'));
check('ab anderthalb Minuten in Minuten', () => assert.equal(describeAge(now - 120_000, now), '2 min alt'));
check('ohne Zeitstempel keine Angabe', () => assert.equal(describeAge(null, now), null));
check('aelter als eine Stunde sagt nichts mehr aus', () =>
  assert.equal(describeAge(now - 7200_000, now), null));
check('ein Zeitpunkt in der Zukunft wird verschwiegen', () =>
  assert.equal(describeAge(now + 60_000, now), null));

console.log('\n== Die Meldung zeigt das Alter ==');
{
  const tg = new Telegram('t', '1');
  let text = '';
  tg.sendText = async (s) => {
    text = s;
  };
  await tg.sendAd(
    {
      id: '1',
      title: 'Bulls Rad',
      url: 'https://www.kleinanzeigen.de/s-anzeige/bulls-rad/123-217-45',
      price: '200 €',
      location: 'Freiburg',
      postedAt: 'Heute, 14:34',
      postedAtMs: Date.now() - 30_000,
    },
    'Meine Suche',
  );
  check('das Alter steht drin', () => assert.match(text, /⏱ 30 s alt/));
  check('die nackte Uhrzeit nicht mehr', () => assert.ok(!text.includes('14:34')));
}
{
  // Ohne verwertbare Einstellzeit bleibt die Uhrzeit besser als gar nichts.
  const tg = new Telegram('t', '1');
  let text = '';
  tg.sendText = async (s) => {
    text = s;
  };
  await tg.sendAd(
    {
      id: '1',
      title: 'Bulls Rad',
      url: 'https://www.kleinanzeigen.de/s-anzeige/bulls-rad/123-217-45',
      price: '200 €',
      postedAt: '18.08.2026',
      postedAtMs: null,
    },
    'Meine Suche',
  );
  check('faellt auf die Angabe der Seite zurueck', () => assert.match(text, /🕒 18\.08\.2026/));
}

console.log('\n== Rueckstand aufteilen ==');
// Die Anzeige stand in der vorigen Runde noch nicht auf Seite 1. Der eigene
// Takt kann also hoechstens den Rundenabstand gekostet haben; alles darueber
// gehoert der Seite.
{
  const d = describeDelay(180_000, 60_000);
  check('3 min alt bei 60 s Takt: 2 min gehoeren der Seite', () =>
    assert.equal(d.seiteMs, 120_000));
  check('und hoechstens 60 s dem Takt', () => assert.equal(d.taktMs, 60_000));
  check('und das wird auch gesagt', () => assert.match(d.text, /2 min .*Seite 1.*60 s/s));
}
{
  // Innerhalb eines Takts gefunden: es gibt nichts aufzuteilen, und eine Zeile
  // darueber waere blosses Rauschen.
  const d = describeDelay(40_000, 60_000);
  check('40 s alt bei 60 s Takt: die Seite hat nicht gebremst', () => assert.equal(d.seiteMs, 0));
  check('der Takt bekommt die vollen 40 s', () => assert.equal(d.taktMs, 40_000));
  check('keine Zusatzzeile', () => assert.equal(d.text, null));
}
check('unter einer halben Minute ist die Aufteilung Rauschen', () =>
  assert.equal(describeDelay(75_000, 60_000).text, null));
check('ohne bekannten Rundenabstand wird nichts behauptet', () =>
  assert.equal(describeDelay(180_000, null), null));
check('ohne Alter auch nicht', () => assert.equal(describeDelay(NaN, 60_000), null));
check('ein langer Takt schluckt den ganzen Rueckstand', () =>
  assert.equal(describeDelay(180_000, 300_000).seiteMs, 0));

console.log('\n== Eine Seite aus dem Zwischenspeicher zaehlt nicht der Seite an ==');
{
  // 3 min alt, 60 s Takt, und die Seite lag 60 s im Zwischenspeicher: dann
  // gehoeren der Seite nur noch 60 s statt 120 s. Ohne diese Verrechnung
  // bekaeme Kleinanzeigen die Schuld fuer unsere eigene alte Kopie.
  const d = describeDelay(180_000, 60_000, 60_000);
  check('der Zwischenspeicher wird abgezogen', () => assert.equal(d.seiteMs, 60_000));
  check('und benannt', () => assert.equal(d.puffer, 60_000));
  check('die Zeile sagt es dazu', () => assert.match(d.text, /Zwischenspeicher/));
}
check('ohne Zwischenspeicher bleibt die Rechnung wie vorher', () =>
  assert.equal(describeDelay(180_000, 60_000, 0).seiteMs, 120_000));
check('ein Puffer groesser als das Alter wird gedeckelt', () =>
  assert.equal(describeDelay(60_000, 60_000, 999_000).seiteMs, 0));
{
  // Erklaert der Zwischenspeicher alles, bleibt fuer die Seite nichts uebrig
  // und die 🐢-Zeile verschwindet.
  const d = describeDelay(150_000, 60_000, 100_000);
  check('deckt der Zwischenspeicher den Rest, faellt die Zeile weg', () =>
    assert.equal(d.text, null));
}

console.log('\n== Die Zusatzzeile in der Meldung ==');
{
  const tg = new Telegram('t', '1');
  let text = '';
  tg.sendText = async (s) => {
    text = s;
  };
  const ad = {
    id: '1',
    title: 'Bulls Rad',
    url: 'https://www.kleinanzeigen.de/s-anzeige/bulls-rad/123-217-45',
    price: '200 €',
    postedAtMs: Date.now() - 180_000,
  };
  await tg.sendAd(ad, 'Meine Suche', null, { pollGapMs: 60_000 });
  check('die Meldung erklaert den Rueckstand', () => assert.match(text, /lag sie schon eingestellt/));
  await tg.sendAd(ad, 'Meine Suche', null, { pollGapMs: 600_000 });
  check('bei langem Takt erklaert sie nichts — da war der Takt schuld', () =>
    assert.ok(!/lag sie schon eingestellt/.test(text)));
  await tg.sendAd(ad, 'Meine Suche', null);
  check('ohne Rundenabstand ebenfalls nicht', () =>
    assert.ok(!/lag sie schon eingestellt/.test(text)));
}

console.log('\n== Takt ==');
const dir = mkdtempSync(join(tmpdir(), 'kaw-tempo-'));
const pfad = join(dir, 'w.json');

check('die Untergrenze liegt bei 10 s', () => assert.equal(MIN_INTERVAL_SECONDS, 10));
await (async () => {
  const { watch } = await addWatch(pfad, URL_BULLS, { intervalSeconds: MIN_INTERVAL_SECONDS });
  check('die Untergrenze wird angenommen', () =>
    assert.equal(watch.intervalSeconds, MIN_INTERVAL_SECONDS));
  await assert.rejects(
    () => updateWatch(pfad, watch.id, { intervalSeconds: MIN_INTERVAL_SECONDS - 1 }),
    /zu kurz/,
  );
  check('eine Sekunde darunter nicht mehr', () => true);
})();

console.log('\n== Streuung frisst den kurzen Takt nicht auf ==');
const schreib = (o) => writeFileSync(pfad, JSON.stringify(o));
await (async () => {
  schreib({
    telegram: { chatId: '1' },
    watches: [{ id: 'a', url: URL_BULLS, intervalSeconds: 15 }],
  });
  const cfg = await loadConfig(pfad);
  // Ohne Deckel haette die Standardstreuung von 10 s aus 15 s im Mittel 20 s
  // gemacht — zwei Drittel des gewonnenen Tempos waeren weg gewesen.
  check('bei 15 s Takt hoechstens 3,75 s Streuung', () =>
    assert.equal(cfg.watches[0].jitterSeconds, 3.75));
})();
await (async () => {
  schreib({
    telegram: { chatId: '1' },
    watches: [{ id: 'a', url: URL_BULLS, intervalSeconds: 300 }],
  });
  const cfg = await loadConfig(pfad);
  check('bei langem Takt bleibt es bei den 10 s von vorher', () =>
    assert.equal(cfg.watches[0].jitterSeconds, 10));
})();
await (async () => {
  schreib({
    telegram: { chatId: '1' },
    watches: [{ id: 'a', url: URL_BULLS, intervalSeconds: 60, jitterSeconds: 2 }],
  });
  const cfg = await loadConfig(pfad);
  check('eine eigene, kleinere Angabe bleibt unangetastet', () =>
    assert.equal(cfg.watches[0].jitterSeconds, 2));
})();

console.log('\n== Ein Alarm draengelt sich vor die Befehlsantworten ==');
await (async () => {
  const tg = new Telegram('t', '1');
  const raus = [];
  // Nur den API-Aufruf ersetzen, damit die echte Warteschlange laeuft.
  const original = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    if (!String(url).includes('api.telegram.org')) return original(url, options);
    raus.push(JSON.parse(options.body).text);
    return { json: async () => ({ ok: true, result: {} }) };
  };

  try {
    // Erst eine Antwort auf /list (drei Nachrichten), dann faellt mittendrin
    // eine Anzeige herein.
    const offen = [
      tg.sendText('Liste 1'),
      tg.sendText('Liste 2'),
      tg.sendText('Liste 3'),
    ];
    // Ein Tick spaeter, damit die drei schon in der Schlange stehen.
    await new Promise((r) => setTimeout(r, 10));
    offen.push(
      tg.sendAd(
        {
          id: '1',
          title: 'Bulls Rad',
          url: 'https://www.kleinanzeigen.de/s-anzeige/bulls-rad/123-217-45',
          price: '200 €',
          postedAtMs: null,
        },
        'Meine Suche',
      ),
    );
    await Promise.all(offen);

    check('die erste Nachricht war schon unterwegs', () => assert.match(raus[0], /Liste 1/));
    check('danach kommt die Anzeige, nicht Liste 2', () => assert.match(raus[1], /Bulls Rad/));
    check('die restlichen Antworten folgen dahinter', () =>
      assert.deepEqual(raus.slice(2), ['Liste 2', 'Liste 3']));
  } finally {
    globalThis.fetch = original;
  }
})();

rmSync(dir, { recursive: true, force: true });
await check.summary();
