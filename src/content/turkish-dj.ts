import type { Locale } from '@/i18n/routing';

/**
 * Struktur der Nischen-Landingpage `/tuerkischer-dj-stuttgart`.
 *
 * Wie überall in `src/content/`: keine Texte hier. Überschriften und Absätze
 * stehen in `messages/*.json` → Namespace `turkishDj`; die Städteliste kommt
 * aus `src/content/cities.ts` und wird nicht dupliziert.
 *
 * Warum es diese Seite gibt, steht bei der Route in `src/i18n/routing.ts`.
 * Kurz: „türkischer DJ (Stuttgart)" ist laut docs/SEO-KEYWORD-MAP.md ein
 * dokumentiertes Sekundärziel, das bis August 2026 in keinem Titel, keiner H1
 * und auf keiner eigenen Seite vorkam — obwohl das bikulturelle Angebot laut
 * .claude/BRAND-FACTS.md der Kern des Geschäfts ist.
 *
 * Abgrenzung, damit keine Kannibalisierung entsteht:
 * - Startseite → „Hochzeits-DJ Stuttgart" (Hauptabfrage, alle Paare)
 * - diese Seite → „türkischer DJ …" (explizit türkisch geprägte Suchintention:
 *   Halay/Davul-Zurna-Repertoire, Gelin Çıkarma, Kına, zweisprachige
 *   Moderation)
 * - /islamische-hochzeit → religiös geprägte Feiern (tr/ku/ar)
 */

/**
 * Nur die drei Sprachen mit echtem, geschriebenem Inhalt — dieselbe Regel wie
 * bei der BW-Landesseite, beim Europa-Hub, beim Blog und beim Antwort-Korpus.
 * Deutsch trägt die Abfrage „türkischer DJ", Türkisch die Abfrage
 * „Stuttgart Türk DJ", Englisch „Turkish DJ Stuttgart".
 */
export const TURKISH_DJ_SUPPORTED_LOCALES: readonly Locale[] = ['de', 'tr', 'en'];

export function isTurkishDjLocale(locale: Locale): boolean {
  return TURKISH_DJ_SUPPORTED_LOCALES.includes(locale);
}

/**
 * Die drei Argumente, die diese Seite von der Startseite unterscheiden. Nicht
 * „warum DJ Veys gut ist", sondern das, was speziell an einer türkisch bzw.
 * deutsch-türkisch geprägten Feier anders ist: das doppelte Repertoire, die
 * Traditionen mit eigener Dramaturgie (Gelin Çıkarma, Davul Zurna, Kına) und
 * die Moderation, die beide Hälften des Saals mitnimmt.
 *
 * `id` mappt 1:1 auf `turkishDj.pillars.items.<id>` in den messages. Alle
 * Inhalte stützen sich auf verifizierte Fakten: `site.capabilities`
 * (`traditional-turkish`, `orchestra`, `live-music`, `host`) und
 * `site.stats.hostingLanguages`.
 */
export const turkishDjPillars = [
  { id: 'repertoire', icon: 'Music' },
  { id: 'traditions', icon: 'Drum' },
  { id: 'hosting', icon: 'Mic' },
] as const;

export type TurkishDjPillarIcon = (typeof turkishDjPillars)[number]['icon'];
