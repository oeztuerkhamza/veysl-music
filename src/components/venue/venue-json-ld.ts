import { breadcrumbSchema, localBusinessSchema } from '@/lib/schema';
import { defaultLocale, localeTags, type Locale } from '@/i18n/routing';
import { absoluteUrl } from '@/lib/seo';
import { site } from '@/content/site';
import type { VenueReference } from '@/lib/venues';

interface BuildVenueJsonLdArgs {
  venue: VenueReference;
  locale: Locale;
  pageUrl: string;
  homeLabel: string;
  weddingsLabel: string;
}

const asRecord = (value: object): Record<string, unknown> => value as Record<string, unknown>;

/**
 * JSON-LD für `/hochzeitslocation/<slug>`: unser Unternehmen, die Location als
 * `Place` und die Seite als `WebPage`, die von dieser Location handelt.
 *
 * Bewusst kein `Event`: Es gibt keinen datierten, öffentlich zugänglichen
 * Termin, und ein erfundenes Datum wäre ungültiges Markup. Bewusst auch kein
 * `Review`/`AggregateRating` für die Location — Bewertungen von Dritten
 * gehören nicht in unser Schema (siehe `site.reviews`).
 *
 * Die Anschrift wird nur ausgegeben, wenn der Betreiber sie eingetragen hat;
 * `addressLocality` ist immer die Stadt aus dem Datensatz.
 */
export function buildVenueJsonLd({ venue, locale, pageUrl, homeLabel, weddingsLabel }: BuildVenueJsonLdArgs): Record<string, unknown>[] {
  const homeUrl = absoluteUrl('/', defaultLocale);

  const place = {
    '@context': 'https://schema.org' as const,
    '@type': 'Place' as const,
    '@id': `${pageUrl}#venue`,
    name: venue.name,
    ...(venue.website && { url: venue.website }),
    address: {
      '@type': 'PostalAddress' as const,
      ...(venue.address && { streetAddress: venue.address }),
      addressLocality: venue.city,
      addressCountry: site.country,
    },
  };

  const page = {
    '@context': 'https://schema.org' as const,
    '@type': 'WebPage' as const,
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: venue.name,
    inLanguage: localeTags[locale],
    isPartOf: { '@id': `${homeUrl}#website` },
    about: { '@id': place['@id'] },
    mainEntity: { '@id': place['@id'] },
  };

  const breadcrumb = breadcrumbSchema([
    { name: homeLabel, url: absoluteUrl('/', locale) },
    { name: weddingsLabel, url: absoluteUrl('/echte-hochzeiten', locale) },
    { name: venue.name, url: pageUrl },
  ]);

  return [asRecord(localBusinessSchema(locale)), place, page, asRecord(breadcrumb)];
}
