import type { Locale } from '@/i18n/routing';

/**
 * Struktur der Landesseite `/hochzeits-dj-baden-wuerttemberg`.
 *
 * Wie überall in `src/content/`: keine Texte hier. Überschriften und Absätze
 * stehen in `messages/*.json` → Namespace `bw`; die Städteliste kommt aus
 * `src/content/cities.ts` und wird nicht dupliziert — eine zweite Liste würde
 * genau in dem Moment veralten, in dem eine Stadt dazukommt oder wegfällt.
 *
 * Warum es diese Seite gibt, steht bei der Route in `src/i18n/routing.ts`.
 * Kurz: „Hochzeits-DJ Baden-Württemberg" ist eine der drei Kernabfragen dieses
 * Markts und hatte keine Seite, und die acht Stadtseiten hatten keine
 * gemeinsame Elternseite.
 */

/**
 * Nur die drei Sprachen mit echtem, geschriebenem Inhalt — dieselbe Regel wie
 * beim Europa-Hub, beim Blog und beim Antwort-Korpus.
 *
 * Für eine Landesseite wiegt das schwerer als anderswo: Sie existiert, um für
 * eine deutschsprachige Suchanfrage zu ranken. Eine französische Fassung
 * derselben Seite konkurriert um nichts und wäre reiner hreflang-Ballast.
 */
export const BW_SUPPORTED_LOCALES: readonly Locale[] = ['de', 'tr', 'en'];

export function isBwLocale(locale: Locale): boolean {
  return BW_SUPPORTED_LOCALES.includes(locale);
}

/**
 * Die drei Argumente, die eine Landesseite von einer Stadtseite unterscheiden.
 *
 * Bewusst nicht „warum DJ Veys gut ist" — das steht auf der Startseite. Hier
 * geht es um das, was nur auf Landesebene eine Frage ist: Anfahrt über
 * Distanz, dieselbe Technik unabhängig vom Ort, und ein Ansprechpartner statt
 * regionaler Subunternehmer. Genau diese drei Punkte sind es, bei denen ein
 * Paar aus Freiburg oder Ulm zögert.
 *
 * `id` mappt 1:1 auf `bw.pillars.items.<id>` in den messages.
 */
export const bwPillars = [
  { id: 'travel', icon: 'Route' },
  { id: 'equipment', icon: 'Speaker' },
  { id: 'oneContact', icon: 'UserCheck' },
] as const;

export type BwPillarIcon = (typeof bwPillars)[number]['icon'];
