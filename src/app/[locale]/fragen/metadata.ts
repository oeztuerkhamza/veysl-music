import type { Metadata } from 'next';
import { absoluteUrl, buildMetadata } from '@/lib/seo';
import { answers } from '@/content/answers';
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
export async function buildFragenMetadata(locale: Locale): Promise<Metadata> {
  return buildMetadata({
    locale,
    pathname: '/fragen',
    // answers.meta.description enthält {count}
    values: { count: answers.length },
  });
}

/** Absolute URL der Fragen-Seite je Sprache — für JSON-LD und Verlinkung. */
export function fragenUrl(locale: Locale): string {
  return absoluteUrl('/fragen', locale);
}
