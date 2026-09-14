// Prueft, was ueber das Tempo entscheidet: Takt, Streuung und die Altersangabe
// in der Meldung.
import { strict as assert } from 'node:assert';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createChecker } from './helpers.mjs';

const BASE = new URL('../src/', import.meta.url).href;
const { parsePostedAt } = await import(BASE + 'kleinanzeigen.mjs');
const { describeAge, Telegram } = await import(BASE + 'telegram.mjs');
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

console.log('\n== Takt ==');
const dir = mkdtempSync(join(tmpdir(), 'kaw-tempo-'));
const pfad = join(dir, 'w.json');

check('die Untergrenze liegt bei 15 s', () => assert.equal(MIN_INTERVAL_SECONDS, 15));
await (async () => {
  const { watch } = await addWatch(pfad, URL_BULLS, { intervalSeconds: 15 });
  check('15 s werden angenommen', () => assert.equal(watch.intervalSeconds, 15));
  await assert.rejects(() => updateWatch(pfad, watch.id, { intervalSeconds: 14 }), /zu kurz/);
  check('14 s nicht mehr', () => true);
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

rmSync(dir, { recursive: true, force: true });
await check.summary();
