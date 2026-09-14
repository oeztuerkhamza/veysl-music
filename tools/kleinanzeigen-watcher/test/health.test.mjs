// Die drei Stellen, an denen sich Teile des Systems gegenseitig ins Gehege
// kamen — jeweils mit dem Fall, der vorher schiefging.
import { strict as assert } from 'node:assert';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = new URL('../src/', import.meta.url).href;
const { State } = await import(BASE + 'state.mjs');
const { Telegram } = await import(BASE + 'telegram.mjs');

let pass = 0;
const fail = [];
const check = (n, f) => {
  try { f(); pass++; console.log('  ok   ' + n); }
  catch (e) { fail.push(n); console.log('  FAIL ' + n + ' -> ' + e.message); }
};

const dir = mkdtempSync(join(tmpdir(), 'kaw-health-'));

console.log('\n== 1. Gleichzeitige Sendungen halten den Abstand ein ==');
{
  const tg = new Telegram('t', '1');
  const zeiten = [];
  const t0 = Date.now();
  tg._call = null;
  // Nur die Bremse messen, nicht die API: sendText ueberschreiben geht nicht
  // (privat), also den echten Aufruf abfangen.
  const orig = globalThis.fetch;
  globalThis.fetch = async () => {
    zeiten.push(Date.now() - t0);
    return { json: async () => ({ ok: true, result: {} }) };
  };
  await Promise.all([1, 2, 3, 4, 5].map(() => tg.sendText('x')));
  globalThis.fetch = orig;
  zeiten.sort((a, b) => a - b);
  let zuDicht = 0;
  for (let i = 1; i < zeiten.length; i++) if (zeiten[i] - zeiten[i - 1] < 1000) zuDicht++;
  console.log('     Sendezeitpunkte (ms): ' + zeiten.join(', '));
  check('fuenf parallele Sendungen, keine zu dicht', () => assert.equal(zuDicht, 0));
  check('trotzdem zuegig (unter 7 s)', () => assert.ok(zeiten.at(-1) < 7000, String(zeiten.at(-1))));
}

console.log('\n== 2. Gleichzeitiges Speichern zerstoert die Datei nicht ==');
{
  const p = join(dir, 'state.json');
  const s = await State.load(p);
  let kaputt = 0;
  for (let runde = 0; runde < 40; runde++) {
    s.remember('a', Array.from({ length: 1500 }, (_, i) => 'a' + runde + '-' + i));
    s.remember('b', Array.from({ length: 1500 }, (_, i) => 'b' + runde + '-' + i));
    // Zwei Suchen werden gleichzeitig fertig — der Normalfall bei gleichem Takt.
    await Promise.all([s.flush(), s.flush()]).catch(() => { kaputt++; });
    try {
      const d = JSON.parse(readFileSync(p, 'utf8'));
      if (!d.watches || !d.watches.a || !d.watches.b) kaputt++;
    } catch { kaputt++; }
  }
  check('40 parallele Speicherpaare, kein Schaden', () => assert.equal(kaputt, 0));
  check('beide Suchen stehen drin', () => {
    const d = JSON.parse(readFileSync(p, 'utf8'));
    assert.ok(d.watches.a.seen.length > 0 && d.watches.b.seen.length > 0);
  });
  check('keine .tmp-Reste', () => {
    const rest = readdirSync(dir).filter((f) => f.endsWith('.tmp'));
    assert.deepEqual(rest, []);
  });
}

console.log('\n== 3. Kaputte Zustandsdatei toetet den Watcher nicht mehr ==');
{
  const p = join(dir, 'broken.json');
  writeFileSync(p, '{ "watches": { "a": { "seen": ["1","2"');  // abgeschnitten
  const meldungen = [];
  const s = await State.load(p, (m) => meldungen.push(m));
  check('laedt trotzdem', () => assert.ok(s));
  check('faengt leer an', () => assert.equal(s.isNew('a'), true));
  check('sagt Bescheid', () => assert.match(meldungen.join(' '), /unlesbar/));
  check('kaputte Datei bleibt zur Ansicht liegen', () => assert.ok(existsSync(p + '.kaputt')));
  s.remember('a', ['9']);
  await s.flush();
  check('danach wieder normal beschreibbar', () =>
    assert.ok(JSON.parse(readFileSync(p, 'utf8')).watches.a.seen.includes('9')));
}

console.log('\n== 4. Speichern nach einem Fehler geht weiter ==');
{
  const p = join(dir, 'sub', 'state.json'); // Verzeichnis existiert nicht
  const s = await State.load(p);
  s.remember('a', ['1']);
  await s.flush().catch(() => {});
  check('ein misslungener Schreibvorgang wirft den Zustand nicht weg', () =>
    assert.equal(s.hasSeen('a', '1'), true));
  mkdirSync(join(dir, 'sub'));
  await s.flush();
  check('bleibt als ungespeichert vorgemerkt und wird nachgeholt', () => assert.ok(existsSync(p)));
}

rmSync(dir, { recursive: true, force: true });
console.log(`\n=========  ${pass} ok, ${fail.length} fehlgeschlagen  =========`);
if (fail.length) process.exit(1);
