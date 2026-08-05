import { Amiri, Cormorant_Garamond, IBM_Plex_Sans_Arabic, Inter } from 'next/font/google';

/**
 * Display serif for headings. Loaded as the full variable-weight instance
 * (300–700) so fluid clamp() type can lean on any weight without extra
 * static-weight requests.
 */
export const fontDisplay = Cormorant_Garamond({
  weight: 'variable',
  style: ['normal', 'italic'],
  subsets: ['latin', 'latin-ext'], // latin-ext covers German umlauts + Turkish ı/ş/ğ
  display: 'swap',
  variable: '--font-display',
});

/** Body / UI sans, variable weight. */
export const fontSans = Inter({
  weight: 'variable',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-sans',
});

/**
 * ── Arabisch ────────────────────────────────────────────────────────────────
 *
 * Cormorant Garamond und Inter enthalten **kein** arabisches Schriftbild. Ohne
 * eigenes Paar fiele `/ar` auf die Systemschrift des jeweiligen Geräts zurück:
 * auf einem iPhone Geeza Pro, unter Windows Segoe UI, unter Android Noto — drei
 * verschiedene Auftritte, keiner davon der dieser Marke, und Überschriften in
 * einer Serifenlosen, wo überall sonst eine Serife steht.
 *
 * Deshalb dieselben CSS-Variablen, andere Familien. Das Layout kennt weiterhin
 * nur `--font-display` und `--font-sans`; welches Paar dahinter liegt,
 * entscheidet `[locale]/layout.tsx` anhand der Schreibrichtung — und damit lädt
 * eine deutsche Seite auch keine arabischen Schriftdateien mit.
 *
 * Amiri ist eine klassische Naskh-Schrift und der Standard für arabischen
 * Werksatz. Für eine Marke, deren lateinisches Gesicht eine Garamond ist und
 * deren wichtigste arabische Seite die religiös geprägte Hochzeit ist, ist das
 * die naheliegende Entsprechung — nicht eine geometrische Displayschrift, die
 * neben einer Kur’an-Rezitation deplatziert wirkte.
 */
export const fontDisplayArabic = Amiri({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-display',
});

/** Arabisches Gegenstück zu Inter — neutral, gut lesbar in kleinen Größen. */
export const fontSansArabic = IBM_Plex_Sans_Arabic({
  weight: ['400', '500', '600', '700'],
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-sans',
});
