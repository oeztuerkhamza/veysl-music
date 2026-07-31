/**
 * Erzeugt public/logo.png, public/icons/* und src/app/favicon.ico aus der
 * echten Wort-/Bildmarke — den Dateien, die Schema, Manifest und der
 * Favicon-Konvention von Next bereits referenzieren:
 *
 *   src/lib/schema.ts    → organizationSchema().logo = '/logo.png'
 *   src/app/manifest.ts  → icons: /icons/icon-{192,512}[-maskable].png
 *   src/app/favicon.ico  → automatisch als <link rel="icon"> ausgeliefert
 *
 * Bis hierher war das eine TYPOGRAFISCHE Ersatz-Wortmarke: mit Georgia
 * gesetztes „DJ Veys“ plus goldener Strich. Sie hat nur die 404er geschlossen
 * und die PWA installierbar gemacht. Seit der Kunde echte Grafik geliefert hat
 * (public/brand/logo-veys.png), leitet dieses Skript alle Größen daraus ab —
 * genau der im alten Kopf angekündigte Fall, weshalb sich an keinem Pfad und
 * an keiner Zeile Anwendungscode etwas ändern musste.
 *
 * Quelle ist bewusst eingecheckt: public/brand/logo-veys.png ist das Master
 * (1254×1254, schwarzer Hintergrund eingebrannt, kein Alpha). Ohne Master im
 * Repo wären die abgeleiteten Dateien nicht reproduzierbar.
 *
 * ⚠️ Was hier NICHT lösbar ist: die Vorlage hat einen deckend schwarzen
 * Hintergrund und keine Vektorfassung. Für helle Flächen (Print, hellem Theme,
 * Rechnungen) braucht es eine transparente bzw. SVG-Variante vom Gestalter.
 * Der Header setzt die Wortmarke deshalb weiterhin typografisch (site.name),
 * nicht als Bild — das bleibt in beiden Themes korrekt und kostet kein Byte.
 *
 * Zwei Zuschnitte, ein Master:
 *   logo.png  — die vollständige Lockup (Monogramm + VEYS + Claim). Sichtbar
 *               nur in Kontexten mit viel Platz (schema.org, Suchergebnis).
 *   icon-*    — nur das Monogramm. Die Lockup ist bei 192 px — und erst recht
 *               als 32-px-Favicon — unlesbar; der DJ-Kreis bleibt es.
 *
 * Neu erzeugen:
 *   node scripts/generate-brand-assets.mjs
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// sharp nimmt Pfade oder Buffer, aber keine URL-Objekte — anders als fs/promises.
const SOURCE = fileURLToPath(new URL('../public/brand/logo-veys.png', import.meta.url));

/**
 * Hintergrund der Vorlage ist reines Schwarz (gemessen, nicht geraten). Die
 * Ränder werden mit demselben Wert aufgefüllt, damit keine Kante sichtbar
 * wird — deshalb hier #000 und nicht das Theme-Token #08080a.
 */
const BG = { r: 0, g: 0, b: 0, alpha: 1 };

/**
 * Inhaltsrahmen im Master, in Master-Pixeln. Ermittelt über das
 * Helligkeitsprofil der Vorlage (Schwelle 40/255), nicht nach Augenmaß:
 *
 *   lockup    x 195…1061, y 123…1084  — Monogramm + „VEYS“ + Zierlinie + Claim
 *   monogram  x 255… 903, y 123… 717  — Wellenform + verschränktes DJ im Kreis
 *
 * Die äußerste Pixelspalte des Masters (x = 1253) ist ein grünstichiger
 * Kompressionsartefakt; sie liegt außerhalb beider Rahmen und fällt damit
 * beim Zuschnitt weg.
 */
const CROP = {
  lockup: { left: 195, top: 123, width: 867, height: 962 },
  monogram: { left: 255, top: 123, width: 649, height: 595 },
};

/**
 * Anteil der Kantenlänge, den der Inhalt einnehmen darf.
 *
 * `maskable` ist der einzige nicht frei wählbare Wert: Android beschneidet
 * maskierbare Icons auf eine Form, von der garantiert nur der mittlere Kreis
 * mit 80 % Durchmesser übrig bleibt. Bei 0.56 misst die Diagonale des
 * Monogramm-Rahmens √(0.56² + 0.51²) ≈ 0.76 — bleibt also auch in der Ecke
 * innerhalb des Kreises.
 */
const FIT = { logo: 0.84, icon: 0.72, maskable: 0.56 };

/** Zuschnitt aus dem Master, auf `size` skaliert und mittig auf Schwarz gesetzt. */
async function derive(crop, size, fit) {
  const box = Math.round(size * fit);
  const content = await sharp(SOURCE)
    .extract(crop)
    .resize(box, box, { fit: 'inside', kernel: 'lanczos3' })
    .toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: content, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function emit(png, path) {
  await writeFile(new URL(`../${path}`, import.meta.url), png);
  const meta = await sharp(png).metadata();
  console.log(`${path} — ${meta.width}x${meta.height}, ${(png.length / 1024).toFixed(1)} kB`);
}

/**
 * ICO-Container um fertige PNGs. sharp kann kein .ico schreiben, und ein
 * zusätzliches Paket lohnt für 22 Byte Header pro Eintrag nicht. PNG-im-ICO
 * ist seit Vista bzw. IE 11 überall verstanden; die Alternative (BMP mit
 * AND-Maske) wäre deutlich mehr Code für dieselbe Darstellung.
 */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserviert
  header.writeUInt16LE(1, 2); // Typ 1 = Icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, png }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // 0 bedeutet 256
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2); // Farbpalette: keine
    e.writeUInt8(0, 3); // reserviert
    e.writeUInt16LE(1, 4); // Farbebenen
    e.writeUInt16LE(32, 6); // Bit pro Pixel
    e.writeUInt32LE(png.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += png.length;
    return e;
  });

  return Buffer.concat([header, ...entries, ...images.map((i) => i.png)]);
}

await mkdir(new URL('../public/icons/', import.meta.url), { recursive: true });

await emit(await derive(CROP.lockup, 512, FIT.logo), 'public/logo.png');
await emit(await derive(CROP.monogram, 192, FIT.icon), 'public/icons/icon-192.png');
await emit(await derive(CROP.monogram, 512, FIT.icon), 'public/icons/icon-512.png');
await emit(await derive(CROP.monogram, 192, FIT.maskable), 'public/icons/icon-192-maskable.png');
await emit(await derive(CROP.monogram, 512, FIT.maskable), 'public/icons/icon-512-maskable.png');

// 16 px trägt der Browser aus 32 px selbst herunter; 48 px braucht Windows für
// die Taskleiste, wenn die Seite als Verknüpfung angelegt wird.
const favicon = ico(
  await Promise.all(
    [32, 48].map(async (size) => ({ size, png: await derive(CROP.monogram, size, FIT.icon) }))
  )
);
await writeFile(new URL('../src/app/favicon.ico', import.meta.url), favicon);
console.log(`src/app/favicon.ico — 32+48, ${(favicon.length / 1024).toFixed(1)} kB`);
