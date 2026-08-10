import { Amiri, Cormorant_Garamond, IBM_Plex_Sans_Arabic } from 'next/font/google';

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

/**
 * ── Kein `fontSans` mehr: Inter ist entfallen ───────────────────────────────
 *
 * Hier stand `Inter`, variabel, mit `latin` + `latin-ext` — zwei vorgeladene
 * Dateien, **48 KB und 85 KB**. Der Fließtext dieser Site kostete damit mehr
 * Bandbreite in der höchsten Prioritätsklasse als die Überschriftenschrift, die
 * das LCP-Element trägt.
 *
 * Auf lateinischen Seiten übernimmt jetzt der Systemstapel (`ui-sans-serif,
 * system-ui, sans-serif`): San Francisco auf iPhones, Roboto auf Android,
 * Segoe unter Windows. Das ist bei Inter der vertretbarste Tausch im ganzen
 * Schriftbudget — Inter ist als neutrale Interface-Grotesk gezeichnet und
 * liegt genau diesen Systemschriften ohnehin sehr nahe, während die Serife in
 * den Überschriften unangetastet bleibt und weiterhin das Gesicht der Marke
 * stellt.
 *
 * ── Zwei Messungen, die man kennen muss, bevor man das zurückdreht ──────────
 *
 * 1. **`preload: false` ist kein Ersatz für das Weglassen.** Genau das wurde
 *    zuerst versucht: Ohne Preload entdeckt der Browser die Schrift erst beim
 *    Layout, stuft sie dann aber als `VeryHigh` ein (sie setzt sichtbaren
 *    Text) und holt sie *nach* allem anderen. Ungedrosselt gemessen: letzte
 *    Schriftdatei bei 263 ms, Largest Contentful Paint bei **270 ms** — sieben
 *    Millisekunden später. Beim Wechsel von der Ersatz- auf die echte Schrift
 *    zeichnet der Browser den Text neu, und dieser Neuzeichnung folgt ein
 *    neuer LCP-Eintrag. Was das LCP-Element festhält, ist also nicht die
 *    Schrift der Überschrift, sondern die *zuletzt eintreffende* Schrift der
 *    Seite.
 *
 * 2. **Statische Schnitte bringen nichts.** `weight: ['400','500','600']`
 *    statt `'variable'` wurde gebaut und gemessen: 281 KB → 279 KB. Google
 *    liefert Inter und Cormorant Garamond nur noch als variable Dateien aus;
 *    die Gewichtsangabe ändert daran nichts.
 *
 * Wer Inter zurückholen will, holt damit 134 KB in die höchste
 * Prioritätsklasse zurück — mit offenen Augen, nicht aus Versehen.
 *
 * Wichtig für CSS-Änderungen: `--font-sans` ist auf lateinischen Seiten jetzt
 * **nicht gesetzt**. Jede `var(--font-sans)`-Referenz braucht ihren
 * Ersatzstapel *innerhalb* der Klammer — sonst wird die ganze Deklaration
 * ungültig. Die drei Stellen und die Begründung stehen in `globals.css`.
 */

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
 * entscheidet `[locale]/layout.tsx` anhand der Schreibrichtung.
 *
 * Amiri ist eine klassische Naskh-Schrift und der Standard für arabischen
 * Werksatz. Für eine Marke, deren lateinisches Gesicht eine Garamond ist und
 * deren wichtigste arabische Seite die religiös geprägte Hochzeit ist, ist das
 * die naheliegende Entsprechung — nicht eine geometrische Displayschrift, die
 * neben einer Kur’an-Rezitation deplatziert wirkte.
 *
 * ── `preload: false` — der wichtigste Performance-Schalter dieser Datei ─────
 *
 * Hier stand einmal die Behauptung, eine deutsche Seite lade „damit auch keine
 * arabischen Schriftdateien mit". Am ausgelieferten HTML nachgemessen war das
 * schlicht falsch: Die deutsche Startseite trug **14** `<link rel="preload">`
 * für Schriften, zusammen **840 KB** — darunter alle vier Amiri- und alle vier
 * IBM-Plex-Arabic-Dateien.
 *
 * Der Grund ist, dass `next/font` den Preload nicht daran festmacht, welche
 * `className` das `<html>` am Ende trägt, sondern daran, welche Font-Instanzen
 * im Modulgraph der Route vorkommen. Das Layout importiert alle vier — also
 * werden alle vier vorgeladen, in jeder Sprache. Die `className`-Weiche
 * entscheidet danach nur noch, welche davon tatsächlich *benutzt* wird; die
 * Bytes sind zu dem Zeitpunkt längst angefordert.
 *
 * Auf einem gedrosselten Mobilfunkanschluss (Lighthouse Mobile ≈ 1,6 Mbit/s)
 * sind 490 KB ungenutzte Schrift rund **2,5 Sekunden** Bandbreite in der
 * höchsten Prioritätsklasse — und zwar genau in dem Fenster, in dem die
 * Überschrift gemalt werden müsste, die auf dieser Seite das LCP-Element ist.
 *
 * `preload: false` nimmt nur den `<link rel="preload">` weg, nicht die
 * Schrift: Das `@font-face` bleibt stehen, und auf `/ar` — wo `--font-display`
 * und `--font-sans` auf dieses Paar zeigen — lädt der Browser sie ganz normal,
 * sobald er sie zum Setzen des ersten arabischen Textes braucht. Auf allen
 * lateinischen Seiten wird sie nie referenziert und deshalb nie geholt.
 *
 * Der Preis ist ehrlich zu benennen: `/ar` verliert den Vorlauf und zeigt
 * seinen Text kurz in der Systemschrift (`display: 'swap'`). Das ist der
 * richtige Tausch, solange Deutsch und Türkisch die Sprachen sind, in denen
 * diese Seite gefunden werden soll.
 */
export const fontDisplayArabic = Amiri({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['arabic'],
  display: 'swap',
  preload: false,
  variable: '--font-display',
});

/** Arabisches Gegenstück zu Inter — neutral, gut lesbar in kleinen Größen. */
export const fontSansArabic = IBM_Plex_Sans_Arabic({
  weight: ['400', '500', '600', '700'],
  subsets: ['arabic'],
  display: 'swap',
  preload: false,
  variable: '--font-sans',
});
