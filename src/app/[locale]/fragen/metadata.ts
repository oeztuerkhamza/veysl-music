import type { Metadata } from 'next';
import { absoluteUrl, buildMetadata } from '@/lib/seo';
import { answers, getReadyLocalesForAnswers } from '@/content/answers';
import type { Locale } from '@/i18n/routing';

/**
 * `/fragen` ist inzwischen in `routing.pathnames` registriert, deshalb läuft
 * die Metadata über den gemeinsamen `buildMetadata()`-Builder.
 *
 * Die frühere lokale `FRAGEN_SLUG`-Tabelle war ein Provisorium aus der Zeit,
 * als die Route dort noch fehlte — und genau die Duplizierung, vor der ihr
 * eigener Kommentar gewarnt hatte: beim Hinzufügen des `nl`-Locales lief sie
 * aus dem Takt und hat den Production-Build blockiert. Einzige Quelle der
 * Wahrheit für URLs ist ab jetzt `routing.pathnames`.
 */
/**
 * Nur die Locales, in denen der Antwortkorpus wirklich geschrieben ist
 * (heute de/tr/en) — siehe `getReadyLocalesForAnswers()`. Steuert hreflang,
 * die Sitemap (src/app/sitemap.ts liest dieselbe Funktion) und den
 * `noindex`-Schalter unten, damit alle drei nie auseinanderlaufen können.
 */
export function fragenReadyLocales(): Locale[] {
  return getReadyLocalesForAnswers();
}

export async function buildFragenMetadata(locale: Locale): Promise<Metadata> {
  const readyLocales = fragenReadyLocales();

  return buildMetadata({
    locale,
    pathname: '/fragen',
    // answers.meta.description enthält {count}
    values: { count: answers.length },
    // Ohne diese beiden Zeilen behauptete die Seite hreflang für alle sieben
    // Sprachen und stand in allen sieben indexierbar in der Sitemap — obwohl
    // ku/nl/fr/es Wort für Wort den deutschen Text ausliefern (der Fallback in
    // `resolveAnswerText()`). Für Besucher ist dieser Fallback richtig, für
    // Suchmaschinen ist es eine Übersetzung, die es nicht gibt: deshalb bleibt
    // die Seite dort erreichbar und verlinkt, aber sie wird weder als
    // Sprachvariante ausgezeichnet noch indexiert.
    availableLocales: readyLocales,
    noIndex: !readyLocales.includes(locale),
  });
}

/** Absolute URL der Fragen-Seite je Sprache — für JSON-LD und Verlinkung. */
export function fragenUrl(locale: Locale): string {
  return absoluteUrl('/fragen', locale);
}
