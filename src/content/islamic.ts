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

import { locales, type Locale } from '@/i18n/routing';

/**
 * Die Sprachen, in denen die religiös geprägte Ebene der Website erscheint —
 * die Landingpage `/islamische-hochzeit`, ihr Navigationseintrag, die
 * Antwortkategorie `islamisch` auf `/fragen` und der Ratgeber-Artikel
 * `islamische-hochzeit-planen`.
 *
 * **Alle acht Sprachen** — Kundenentscheidung vom 2026-08-27.
 *
 * Damit ist die Einschränkung vom 2026-08-05 aufgehoben, die diese Ebene auf
 * Türkisch, Kurdisch und Arabisch begrenzt hatte. Die damalige Begründung
 * (die religiöse Positionierung nicht in den deutschen Auftritt mischen) gilt
 * nicht mehr; der Kunde hat die Öffnung für jede Sprache ausdrücklich
 * verlangt.
 *
 * Möglich war das ohne eine Zeile neuen Text, weil die damalige Umsetzung
 * genau darauf ausgelegt war: Der `islamic`-Namensraum in messages/{de,en,nl,
 * fr,es}.json wurde aus der Historie zurückgeholt (Stand f7c398b^, Schema
 * unverändert, tr/ku/ar seither wortgleich), die Antworten in
 * `src/content/answers.ts` und die Bodies des Ratgeber-Artikels lagen ohnehin
 * in allen acht Sprachen vor und waren nur gesperrt.
 *
 * Was die Öffnung inhaltlich zurückholt, steht in docs/SEO-KEYWORD-MAP.md §5:
 * „islamische Hochzeit DJ“ ist die einzige Suchintention im ganzen Keyword-Map,
 * für die es im deutschsprachigen Markt praktisch kein Angebot gibt — und die
 * Kombination aus religiösem Teil und Tanzfläche aus einer Hand ist genau das
 * Produkt.
 *
 * ⚠️ `ku` und `ar` tragen weiterhin den Vorbehalt aus den kurdischen und
 * arabischen Slugs in `src/i18n/routing.ts`: **zur Prüfung durch einen
 * Muttersprachler markiert.** Die religiösen Begriffe selbst (Tilawet, Dua,
 * Îlahî) sind arabische Lehnwörter und in kurdischsprachigen muslimischen
 * Gemeinden identisch gebräuchlich — das Risiko liegt im Satzbau, nicht in
 * der Terminologie.
 */
export const ISLAMIC_SUPPORTED_LOCALES: readonly Locale[] = [...locales];

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
