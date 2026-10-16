import type { Locale } from '@/i18n/routing';

/**
 * Struktur der drei Kultur-Landingpages:
 *
 *   /deutsch-tuerkische-hochzeit  →  messages `weddingCulture.germanTurkish`
 *   /tuerkische-hochzeit          →  messages `weddingCulture.turkish`
 *   /kurdische-hochzeit           →  messages `weddingCulture.kurdish`
 *
 * Wie überall in `src/content/`: keine Texte hier. Überschriften, Absätze,
 * Programmpunkte und FAQ stehen in `messages/*.json`; diese Datei liefert nur
 * stabile IDs, den Sprachumfang und die Zuordnung zur Route.
 *
 * Warum drei Seiten: Paare suchen nicht nur nach dem Ort („DJ Stuttgart"),
 * sondern nach der Art der Feier („DJ deutsch-türkische Hochzeit", „kurdische
 * Hochzeit DJ"). Die Türkisch-Nische (`src/content/turkish-dj.ts`) deckt
 * Ort/Reichweite ab, `/islamische-hochzeit` die religiöse Ebene — diese Seiten
 * decken die Feierart ab. Search Console (Juli–Oktober 2026) zeigte
 * Impressionen für „deutsch türkische hochzeit", „hochzeits dj deutsch
 * türkisch" und „dj türkische hochzeit", aber keine passende Landingpage.
 *
 * Faktenlage — nichts hier geht über `.claude/BRAND-FACTS.md` und die
 * veröffentlichten Antworten hinaus:
 * - Moderation: Deutsch, Türkisch, Englisch (`site.stats.hostingLanguages`).
 *   **Keine** Moderation auf Kurdisch behauptet.
 * - Kurdisches Repertoire: ausdrücklich Teil des Angebots laut Antwort
 *   `kurdish-arabic` in `src/content/answers.ts`.
 * - Davul Zurna, Gelin Çıkarma, Bando, Live-Orchester: `site.capabilities`.
 * Kulturelle Beschreibungen (Ablauf, Begriffe) sind allgemein bekannte
 * Bräuche, formuliert als „typisch", nie als Behauptung über einzelne Familien.
 */

/**
 * Nur die drei Sprachen mit echtem, geschriebenem Inhalt — dieselbe Regel wie
 * bei der Türkisch-Nische. Kurdisch (`ku`) fehlt bewusst: Eine kurdische
 * Fassung braucht einen Muttersprachler, der den Text prüft.
 */
export const WEDDING_CULTURE_SUPPORTED_LOCALES: readonly Locale[] = ['de', 'tr', 'en'];

export function isWeddingCultureLocale(locale: Locale): boolean {
  return WEDDING_CULTURE_SUPPORTED_LOCALES.includes(locale);
}

export const weddingCultures = [
  { id: 'germanTurkish', pathname: '/deutsch-tuerkische-hochzeit', navKey: 'germanTurkishWedding' },
  { id: 'turkish', pathname: '/tuerkische-hochzeit', navKey: 'turkishWedding' },
  { id: 'kurdish', pathname: '/kurdische-hochzeit', navKey: 'kurdishWedding' },
] as const;

export type WeddingCultureId = (typeof weddingCultures)[number]['id'];
export type WeddingCulturePathname = (typeof weddingCultures)[number]['pathname'];

/** Anzahl der Unterpunkte je Abschnitt — die messages-Arrays müssen genau so lang sein. */
export const WEDDING_CULTURE_PILLAR_COUNT = 3;
