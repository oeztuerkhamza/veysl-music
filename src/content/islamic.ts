/**
 * Struktur-Daten der Landingpage `/islamische-hochzeit`.
 *
 * Wie überall in `src/content/`: hier stehen **keine Texte**. Die eigentlichen
 * Überschriften, Absätze und Programmpunkte kommen ausschließlich aus
 * `messages/*.json` → Namespace `islamic`. Diese Datei liefert nur stabile,
 * sprachneutrale IDs und die Reihenfolge — damit ein Umbenennen im Deutschen
 * keine sieben anderen Sprachdateien kaputt macht.
 *
 * Faktenlage: Der Kunde hat am 2026-07-30 bestätigt, dass Kur’an-Rezitation,
 * Dua, İlahi (live), Türk Sanat Müziği und eine optionale After-Wedding-Party
 * zum bestehenden Angebot gehören, und am 2026-07-31, dass er **die Tilawet
 * selbst rezitiert**. Beides steht in `.claude/BRAND-FACTS.md`; nichts hier
 * geht darüber hinaus.
 */

import type { Locale } from '@/i18n/routing';

/**
 * Die Sprachen, in denen die religiös geprägte Ebene der Website überhaupt
 * erscheint — die Landingpage `/islamische-hochzeit`, ihr Navigationseintrag,
 * die Antwortkategorie `islamisch` auf `/fragen` und der Ratgeber-Artikel
 * `islamische-hochzeit-planen`.
 *
 * **Türkisch, Kurdisch, Arabisch. Sonst nichts.**
 *
 * Das ist eine Kundenentscheidung vom 2026-08-05 und kehrt die vorherige
 * Richtung um: Die Liste stand auf allen sieben Sprachen, Deutsch als
 * Hauptmarkt eingeschlossen. Der Kunde will die religiöse Positionierung
 * ausdrücklich **nicht** in den deutschen Auftritt mischen — und in derselben
 * Begründung auch nicht in die englische, niederländische, französische oder
 * spanische. Die Zielgruppe dieser Seite spricht Türkisch, Kurdisch oder
 * Arabisch; für alle anderen bleibt die Website ein reiner Hochzeits-DJ ohne
 * religiöses Profil.
 *
 * Was das kostet, ist bewusst in Kauf genommen und soll hier nicht beschönigt
 * werden: Die deutschsprachige Suchintention „islamische Hochzeit DJ“ war laut
 * docs/SEO-KEYWORD-MAP.md §5 die einzige im ganzen Keyword-Map, für die es im
 * deutschen Markt praktisch kein Angebot gibt — ein unbesetztes Feld, das
 * dieses Projekt hätte besetzen können. Diese Chance wird hier abgegeben. Der
 * Text dafür bleibt vollständig im Repository (`messages/de.json` behält den
 * `islamic`-Namensraum nicht, wohl aber der Ratgeber-Artikel seinen deutschen
 * Body), sodass die Entscheidung ohne Neuschreiben rückgängig zu machen ist:
 * Es genügt, hier ein Locale wieder einzutragen.
 *
 * ⚠️ `ku` steht auf ausdrücklichen Kundenwunsch hier und trägt denselben
 * Vorbehalt wie die kurdischen Slugs in `src/i18n/routing.ts`: **zur Prüfung
 * durch einen Muttersprachler markiert.** Die religiösen Begriffe selbst
 * (Tilawet, Dua, Îlahî) sind arabische Lehnwörter und in kurdischsprachigen
 * muslimischen Gemeinden identisch gebräuchlich — das Risiko liegt im Satzbau,
 * nicht in der Terminologie.
 *
 * ⚠️ `ar` ist mit derselben Entscheidung neu dazugekommen und trägt den
 * Vorbehalt ebenfalls. Für Arabisch ist diese Seite nicht eine Seite unter
 * vielen, sondern der Grund, warum es das Locale gibt.
 */
export const ISLAMIC_SUPPORTED_LOCALES: readonly Locale[] = ['tr', 'ku', 'ar'];

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
