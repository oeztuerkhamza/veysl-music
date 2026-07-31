/**
 * Struktur-Daten der Landingpage `/islamische-hochzeit`.
 *
 * Wie überall in `src/content/`: hier stehen **keine Texte**. Die eigentlichen
 * Überschriften, Absätze und Programmpunkte kommen ausschließlich aus
 * `messages/*.json` → Namespace `islamic`. Diese Datei liefert nur stabile,
 * sprachneutrale IDs und die Reihenfolge — damit ein Umbenennen im Deutschen
 * keine sechs anderen Sprachdateien kaputt macht.
 *
 * Faktenlage: Der Kunde hat am 2026-07-30 bestätigt, dass Kur’an-Rezitation,
 * Dua, İlahi (live), Türk Sanat Müziği und eine optionale After-Wedding-Party
 * zum bestehenden Angebot gehören, und am 2026-07-31, dass er **die Tilawet
 * selbst rezitiert**. Beides steht in `.claude/BRAND-FACTS.md`; nichts hier
 * geht darüber hinaus.
 */

import type { Locale } from '@/i18n/routing';

/**
 * Nur die drei Sprachen, in denen echte, geschriebene Inhalte vorliegen —
 * dieselbe Regel wie beim Europa-Hub (`HUB_SUPPORTED_LOCALES`), beim Blog
 * (`BLOG_LOCALES`) und beim Antwort-Korpus (`getReadyLocalesForAnswers()`).
 *
 * Der Grund ist nicht Bequemlichkeit: hreflang für eine Sprache zu behaupten,
 * in der nur eine maschinelle Übersetzung stünde, ist schlechter als sie
 * wegzulassen — und bei einem religiösen Thema ist eine schiefe Übersetzung
 * nicht nur ein SEO-Problem, sondern ein Glaubwürdigkeitsproblem.
 */
export const ISLAMIC_SUPPORTED_LOCALES: readonly Locale[] = ['de', 'tr', 'en'];

export function isIslamicLocale(locale: Locale): boolean {
  return ISLAMIC_SUPPORTED_LOCALES.includes(locale);
}

/**
 * Die Bausteine des Abends, in Reihenfolge des tatsächlichen Ablaufs —
 * nicht nach Wichtigkeit sortiert. Ein Paar liest die Seite als Zeitachse.
 *
 * `optional` steuert nur ein sichtbares Label; die Programmpunkte selbst sind
 * frei kombinierbar und werden im Planungsgespräch festgelegt.
 */
export interface IslamicProgramItem {
  /** Stabile ID — mappt 1:1 auf messages `islamic.program.items.<id>`. */
  id: string;
  /** lucide-react Icon-Name, aufgelöst über eine lokale Map in der Seite. */
  icon: 'BookOpen' | 'HandHeart' | 'Mic2' | 'Music3' | 'Disc3' | 'PartyPopper';
  optional?: boolean;
}

export const islamicProgram: IslamicProgramItem[] = [
  { id: 'tilawet', icon: 'BookOpen' },
  { id: 'dua', icon: 'HandHeart' },
  { id: 'ilahi', icon: 'Mic2' },
  { id: 'tsm', icon: 'Music3' },
  { id: 'djset', icon: 'Disc3' },
  { id: 'afterparty', icon: 'PartyPopper', optional: true },
];

/**
 * Beispielhafter Abendablauf. Bewusst mit Uhrzeiten, weil genau das die
 * Frage ist, die hinter „geht das überhaupt zusammen?“ steckt — und weil
 * konkrete Zeitangaben zitierbar sind, während „wir planen das individuell“
 * es nicht ist (siehe docs/GEO-STRATEGY.md §2, Mechanik 3).
 *
 * ⚠️ Die Uhrzeiten sind ein **Muster**, kein Versprechen; die Seite sagt das
 * im Fließtext auch ausdrücklich. Die Texte stehen in
 * `islamic.timeline.steps.<id>`.
 */
export interface IslamicTimelineStep {
  id: string;
  /** Nur Anzeige — bewusst als String, nicht als Date: es ist ein Muster, keine Uhrzeit eines echten Termins. */
  time: string;
}

export const islamicTimeline: IslamicTimelineStep[] = [
  { id: 'welcome', time: '18:30' },
  { id: 'tilawet', time: '19:00' },
  { id: 'dua', time: '19:10' },
  { id: 'dinner', time: '19:30' },
  { id: 'ilahi', time: '20:30' },
  { id: 'entrance', time: '21:00' },
  { id: 'dance', time: '21:30' },
  { id: 'close', time: '00:00' },
];
