import type { Locale } from '@/i18n/routing';

/**
 * Locations, in denen DJ Veys gespielt hat — die Daten liegen im CMS
 * (Collection `venues`, siehe `src/payload/collections/venues.ts`), nicht
 * mehr hier.
 *
 * Diese Datei war eine leere Liste mit einem `TODO(kunde)`: Eine Location als
 * Referenz zu nennen braucht deren Einverständnis, und jeder Eintrag hätte
 * einen Deploy gebraucht. Beides löst die Collection: das Einverständnis als
 * Pflicht-Häkchen vor der Veröffentlichung, das Befüllen ohne Deploy.
 */

/**
 * Sprachen, in denen es Location-Seiten gibt. Der „DJ-Blick" ist redaktioneller
 * Text, kein Datenfeld — in nl/fr/es/ku/ar würde die Seite auf Deutsch
 * zurückfallen und mit der deutschen Seite konkurrieren. Gleiche Regel wie
 * beim Blog, den Stadtseiten und der Türkisch-Nische.
 */
export const VENUE_SUPPORTED_LOCALES: readonly Locale[] = ['de', 'tr', 'en'];

export function isVenueLocale(locale: Locale): boolean {
  return VENUE_SUPPORTED_LOCALES.includes(locale);
}

/**
 * Vergleichsform für Namen aus dem CMS: Hochzeiten tragen die Location als
 * Freitext (`weddings.venue`), die Collection `venues` als eigenen Datensatz.
 * Verbunden werden beide über den Namen — „Schloss Karlsburg" und
 * „schloss  karlsburg " sollen dieselbe Location sein, ohne dass der
 * Betreiber ein Verknüpfungsfeld pflegen muss.
 */
export function normalizeVenueName(name: string | null | undefined): string {
  return (name ?? '').normalize('NFKC').toLocaleLowerCase('de-DE').replace(/\s+/g, ' ').trim();
}
