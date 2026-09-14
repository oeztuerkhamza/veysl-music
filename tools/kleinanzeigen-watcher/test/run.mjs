#!/usr/bin/env node
// Fuehrt alle Testdateien aus und fasst zusammen.
//
//   node test/run.mjs          alle Tests (offline, kein fremder Server)
//   node test/run.mjs --live   zusaetzlich der echte Abruf gegen kleinanzeigen.de
//
// Jede Datei laeuft in einem eigenen Prozess: sie faengt `globalThis.fetch` ab,
// und das soll sich nicht zwischen den Dateien vermischen.

import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const live = process.argv.includes('--live');

const dateien = readdirSync(HERE)
  .filter((f) => f.endsWith('.test.mjs'))
  .filter((f) => live || f !== 'live.test.mjs')
  .sort();

let okGesamt = 0;
let fehlerGesamt = 0;
const kaputt = [];

for (const datei of dateien) {
  const res = spawnSync(process.execPath, [join(HERE, datei)], { encoding: 'utf8' });
  const ausgabe = (res.stdout ?? '') + (res.stderr ?? '');
  const treffer = ausgabe.match(/(\d+) ok, (\d+) fehlgeschlagen/);

  if (!treffer) {
    kaputt.push(datei);
    console.log(`✗ ${datei.padEnd(24)} keine Zusammenfassung — Datei ist abgestuerzt`);
    console.log(
      ausgabe
        .trim()
        .split('\n')
        .slice(-12)
        .map((l) => '    ' + l)
        .join('\n'),
    );
    continue;
  }

  const [, ok, fehler] = treffer.map(Number);
  okGesamt += ok;
  fehlerGesamt += fehler;
  if (fehler > 0 || res.status !== 0) {
    kaputt.push(datei);
    console.log(`✗ ${datei.padEnd(24)} ${ok} ok, ${fehler} fehlgeschlagen`);
    // Nur die fehlgeschlagenen Zeilen zeigen, nicht die ganze Datei.
    for (const zeile of ausgabe.split('\n')) {
      if (zeile.includes('FAIL')) console.log('    ' + zeile.trim());
    }
  } else {
    console.log(`✓ ${datei.padEnd(24)} ${ok} ok`);
  }
}

console.log('');
console.log(`${dateien.length} Dateien, ${okGesamt} Pruefungen, ${fehlerGesamt} fehlgeschlagen`);
if (!live) console.log('(ohne den echten Abruf — dafuer: node test/run.mjs --live)');

if (kaputt.length > 0) {
  console.log('\nFehlerhaft: ' + kaputt.join(', '));
  process.exit(1);
}
