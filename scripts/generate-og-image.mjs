/**
 * Erzeugt public/og-image.png — das Standard-Share-Bild für OpenGraph und
 * Twitter, referenziert von src/lib/seo.ts.
 *
 * Warum ein Skript und keine Laufzeit-Generierung: der naheliegende Weg wäre
 * `ImageResponse` aus `next/og` gewesen, mit einem Bild pro Seitentitel. Das
 * scheitert in diesem Projekt reproduzierbar — im Dev-Server wie im
 * Production-Build — an der Rasterisierung:
 *
 *   GLib-GObject-CRITICAL: value "32" ... invalid for property 'space'
 *                          of type 'VipsInterpretation'
 *   Error: colourspace: parameter space not set
 *
 * Das ist eine Unverträglichkeit zwischen der Pipeline von `next/og` und
 * sharp 0.35.3 / libvips 8.18.3, nicht ein Fehler im JSX: auch ein minimales
 * `<div>hello</div>` bricht identisch ab. Da dieselbe sharp-Version im
 * Container läuft, wäre die Route auf dem Server mit hoher Wahrscheinlichkeit
 * genauso kaputt — und dann läge auf *jeder* Seite ein og:image, das 500
 * liefert. Ein statisches, hier nachweislich erzeugtes Bild ist die
 * ehrlichere Lösung.
 *
 * sharp selbst funktioniert einwandfrei, inklusive SVG-Rasterisierung — genau
 * darauf baut dieses Skript.
 *
 * Neu erzeugen nach Änderungen an Marke oder Claim:
 *   node scripts/generate-og-image.mjs
 */
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

// Muss den Tokens des dunklen Themes in src/app/globals.css entsprechen.
const BG = '#08080a';
const GOLD = '#d6b36a';
const INK = '#f6f3ed';
const INK_MUTED = '#a6a19a';

const WIDTH = 1200;
const HEIGHT = 630;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="glow" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0%" stop-color="${GOLD}" stop-opacity="0.14"/>
      <stop offset="55%" stop-color="${GOLD}" stop-opacity="0.03"/>
      <stop offset="100%" stop-color="${GOLD}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="${BG}"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>

  <!-- Wortmarke, gesperrt gesetzt wie im Header der Website -->
  <text x="80" y="132" font-family="Georgia, 'Times New Roman', serif"
        font-size="46" letter-spacing="14" fill="${INK}">DJ Veys</text>
  <rect x="80" y="158" width="72" height="2" fill="${GOLD}"/>

  <!-- Claim -->
  <text x="80" y="332" font-family="Georgia, 'Times New Roman', serif"
        font-size="72" fill="${INK}">Der Sound, an den sich</text>
  <text x="80" y="418" font-family="Georgia, 'Times New Roman', serif"
        font-size="72" fill="${INK}">alle erinnern.</text>

  <rect x="80" y="470" width="120" height="3" fill="${GOLD}"/>

  <!-- Leistungen und Domain -->
  <text x="80" y="552" font-family="Helvetica, Arial, sans-serif"
        font-size="26" letter-spacing="2" fill="${INK_MUTED}">Hochzeits-DJ · Live-Musik · Moderation</text>
  <text x="1120" y="552" text-anchor="end" font-family="Helvetica, Arial, sans-serif"
        font-size="26" letter-spacing="2" fill="${GOLD}">dj-veys.de</text>
</svg>`;

const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
await writeFile(new URL('../public/og-image.png', import.meta.url), png);

const meta = await sharp(png).metadata();
console.log(`public/og-image.png — ${meta.width}x${meta.height}, ${(png.length / 1024).toFixed(1)} kB`);
