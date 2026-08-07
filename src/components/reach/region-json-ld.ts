import { breadcrumbSchema, faqPageSchema, localBusinessSchema, localizedServiceType, type FaqItem } from '@/lib/schema';
import { resolveLocalized, type PublishedRegion } from '@/content/regions';
import type { Locale } from '@/i18n/routing';

interface BuildRegionJsonLdArgs {
  region: PublishedRegion;
  locale: Locale;
  /** Absolute canonical URL of this country page. */
  pageUrl: string;
  /** Absolute URL of the localized homepage — first breadcrumb item. */
  homeUrl: string;
  /** Absolute URL of the hub page — second breadcrumb item. */
  hubUrl: string;
  hubName: string;
}

/**
 * Composes this page's JSON-LD from the shared `@/lib/schema` builders —
 * exactly the same pattern as `src/components/city/city-json-ld.ts` (that
 * file is the precedent this one deliberately mirrors, not a coincidence).
 * `localBusinessSchema()` already carries the "no fabricated rating" gate,
 * the orchestra/trilingual positioning and `sameAs`; only a country-scoped
 * `Service` object is composed locally, since `serviceSchema()` always scopes
 * `areaServed` to the full `site.serviceAreas` list.
 *
 * `Service.areaServed` here is `{ '@type': 'Country', name: … }`, not
 * `'City'` — the one structural signal in the markup itself that these are
 * NOT local-pack pages competing with `/hochzeits-dj/[stadt]`.
 */
export function buildRegionJsonLd({ region, locale, pageUrl, homeUrl, hubUrl, hubName }: BuildRegionJsonLdArgs) {
  const business = localBusinessSchema(locale);
  const countryName = resolveLocalized(region.name, locale) ?? region.name.de;

  const countryService = {
    '@context': 'https://schema.org' as const,
    '@type': 'Service' as const,
    serviceType: localizedServiceType(locale),
    name: `${business.name} — ${countryName}`,
    description: resolveLocalized(region.intro, locale) ?? region.intro.de,
    url: pageUrl,
    provider: { '@id': business['@id'] },
    areaServed: { '@type': 'Country' as const, name: countryName },
  };

  const breadcrumb = breadcrumbSchema([
    { name: business.name, url: homeUrl },
    { name: hubName, url: hubUrl },
    { name: countryName, url: pageUrl },
  ]);

  const faqItems: FaqItem[] = region.faq
    .map((entry) => ({
      q: resolveLocalized(entry.question, locale),
      a: resolveLocalized(entry.answer, locale),
    }))
    .filter((e): e is FaqItem => Boolean(e.q && e.a));

  // Same widening cast as city-json-ld.ts: the shared `@/lib/schema`
  // interfaces use literal `'@type'` unions with no index signature.
  const asRecord = (value: object) => value as Record<string, unknown>;

  const graph: Record<string, unknown>[] = [asRecord(business), countryService, asRecord(breadcrumb)];
  if (faqItems.length > 0) graph.push(asRecord(faqPageSchema(faqItems)));

  return graph;
}
