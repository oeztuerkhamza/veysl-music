/**
 * Erzeugt public/logo.png und public/icons/* — die fünf Bilddateien, die
 * Schema und Manifest bereits referenzieren, die es aber nie gab:
 *
 *   src/lib/schema.ts    → organizationSchema().logo = '/logo.png'
 *   src/app/manifest.ts  → icons: /icons/icon-{192,512}[-maskable].png
 *
 * Beide Referenzen waren tote Links. Google verwirft ein `logo`, das 404
 * liefert, wortlos — die Organisation stand damit ohne Logo im Index. Und ein
 * Manifest, dessen sämtliche Icons fehlen, macht die Seite nicht
 * installierbar: Chrome verlangt mindestens ein auflösbares Icon ≥ 192 px,
 * Lighthouse meldet „Installable" als Fehler.
 *
 * Schwesterskript zu `generate-og-image.mjs` — gleiche Entscheidung, gleiche
 * Begründung: statisch mit sharp aus SVG gerastert, nicht zur Laufzeit über
 * `next/og` (dessen Rasterisierung in diesem Projekt reproduzierbar bricht,
 * siehe den Kopf jenes Skripts). Farben und Wortmarke sind identisch zum
 * OG-Bild, damit Share-Karte, Logo und App-Icon dieselbe Marke zeigen.
 *
 * ⚠️ Das hier ist eine TYPOGRAFISCHE Wortmarke, kein gestaltetes Logo. Sie
 * schließt die fünf 404er und macht die PWA installierbar — sie ersetzt keine
 * Designarbeit. Liegt echte Grafik vom Kunden vor, werden diese Dateien
 * einfach überschrieben; kein Code muss sich ändern (das ist der Grund, warum
 * die Pfade schon vorher so hießen).
 *
 * Neu erzeugen:
 *   node scripts/generate-brand-assets.mjs
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

// Muss den Tokens des dunklen Themes in src/app/globals.css entsprechen —
// dieselben Werte wie in generate-og-image.mjs.
const BG = '#08080a';
const GOLD = '#d6b36a';
const INK = '#f6f3ed';

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = 'Helvetica, Arial, sans-serif';

/**
 * App-Icon: Monogramm statt Wortmarke. „DJ Veys" ausgeschrieben ist bei 192 px
 * — und erst recht als 48-px-Favicon auf dem Homescreen — nicht mehr lesbar;
 * ein einzelnes V mit dem goldenen Strich der Marke bleibt es.
 *
 * `scale` steuert die Safe Zone: Android beschneidet maskierbare Icons auf
 * eine Form, von der garantiert nur der mittlere Kreis mit 80 % Durchmesser
 * übrig bleibt. Deshalb bekommt die maskierbare Variante ein kleineres
 * Monogramm auf randfüllendem Hintergrund (0.52), die normale darf größer
 * stehen (0.68).
 */
function iconSvg(size, scale) {
  const c = size / 2;
  const glyph = size * scale;
  // Optische Mitte: Versalien sitzen mit ihrer Grundlinie tiefer als die
  // geometrische Mitte, sonst wirkt das V nach oben gerutscht.
  const baseline = c + glyph * 0.35;
  const ruleWidth = glyph * 0.46;
  const ruleY = baseline + glyph * 0.2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="glow" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0%" stop-color="${GOLD}" stop-opacity="0.18"/>
      <stop offset="60%" stop-color="${GOLD}" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="${GOLD}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="${BG}"/>
  <rect width="${size}" height="${size}" fill="url(#glow)"/>
  <text x="${c}" y="${baseline}" text-anchor="middle" font-family="${SERIF}"
        font-size="${glyph}" fill="${INK}">V</text>
  <rect x="${c - ruleWidth / 2}" y="${ruleY}" width="${ruleWidth}" height="${Math.max(2, size * 0.012)}" fill="${GOLD}"/>
</svg>`;
}

/** Logo für schema.org `Organization.logo` — quadratisch, Wortmarke mit Luft am Rand. */
function logoSvg(size) {
  const c = size / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="glow" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0%" stop-color="${GOLD}" stop-opacity="0.16"/>
      <stop offset="60%" stop-color="${GOLD}" stop-opacity="0.03"/>
      <stop offset="100%" stop-color="${GOLD}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="${BG}"/>
  <rect width="${size}" height="${size}" fill="url(#glow)"/>
  <text x="${c}" y="${c - size * 0.04}" text-anchor="middle" font-family="${SERIF}"
        font-size="${size * 0.155}" letter-spacing="${size * 0.028}" fill="${INK}">DJ Veys</text>
  <rect x="${c - size * 0.09}" y="${c + size * 0.035}" width="${size * 0.18}" height="${Math.max(2, size * 0.008)}" fill="${GOLD}"/>
  <text x="${c}" y="${c + size * 0.155}" text-anchor="middle" font-family="${SANS}"
        font-size="${size * 0.052}" letter-spacing="${size * 0.012}" fill="${GOLD}">dj-veys.de</text>
</svg>`;
}

async function render(svg, path) {
  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
  await writeFile(new URL(`../public/${path}`, import.meta.url), png);
  const meta = await sharp(png).metadata();
  console.log(`public/${path} — ${meta.width}x${meta.height}, ${(png.length / 1024).toFixed(1)} kB`);
}

await mkdir(new URL('../public/icons/', import.meta.url), { recursive: true });

await render(logoSvg(512), 'logo.png');
await render(iconSvg(192, 0.68), 'icons/icon-192.png');
await render(iconSvg(512, 0.68), 'icons/icon-512.png');
await render(iconSvg(192, 0.52), 'icons/icon-192-maskable.png');
await render(iconSvg(512, 0.52), 'icons/icon-512-maskable.png');
