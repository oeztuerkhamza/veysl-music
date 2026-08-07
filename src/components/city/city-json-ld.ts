import { breadcrumbSchema, faqPageSchema, localBusinessSchema, localizedServiceType, type FaqItem } from '@/lib/schema';
import { resolveLocalized, type City } from '@/content/cities';
import type { Locale } from '@/i18n/routing';

interface BuildCityJsonLdArgs {
  city: City;
  locale: Locale;
  /** Absolute canonical URL of this city page. */
  pageUrl: string;
  /** Absolute URL of the localized homepage — first breadcrumb item. */
  homeUrl: string;
}

/**
 * Composes this page's JSON-LD from the shared, single-source-of-truth
 * builders in `@/lib/schema` — `localBusinessSchema()` (business identity,
 * already includes the "no fabricated rating" gate, the orchestra/
 * trilingual positioning and `sameAs`), `breadcrumbSchema()` and
 * `faqPageSchema()` — plus one small city-scoped `Service` object that
 * `serviceSchema()` there doesn't cover: it always scopes `areaServed` to
 * the *entire* `site.serviceAreas` list, whereas this page is specifically
 * about ONE city. That one object is kept local rather than forced into
 * the shared builder; everything else defers to `@/lib/schema`.
 *
 * Render the result with `<JsonLd data={...} />` from `@/lib/json-ld`
 * (handles the `<script>` tag + `<` escaping) — not a raw
 * `dangerouslySetInnerHTML` here.
 */
export function buildCityJsonLd({ city, locale, pageUrl, homeUrl }: BuildCityJsonLdArgs) {
  const business = localBusinessSchema(locale);

  const cityService = {
    '@context': 'https://schema.org' as const,
    '@type': 'Service' as const,
    serviceType: localizedServiceType(locale),
    name: `${business.name} — ${city.name}`,
    description: resolveLocalized(city.intro, locale) ?? city.intro.de,
    url: pageUrl,
    provider: { '@id': business['@id'] },
    areaServed: { '@type': 'City' as const, name: city.name },
  };

  const breadcrumb = breadcrumbSchema([
    { name: business.name, url: homeUrl },
    { name: city.name, url: pageUrl },
  ]);

  const faqItems: FaqItem[] = city.faq
    .map((entry) => ({
      q: resolveLocalized(entry.question, locale),
      a: resolveLocalized(entry.answer, locale),
    }))
    .filter((e): e is FaqItem => Boolean(e.q && e.a));

  // The shared `@/lib/schema` interfaces use literal `'@type'` string unions
  // (e.g. `'@type': ['LocalBusiness', 'MusicGroup']`), which TS won't assign
  // to `Record<string, unknown>` without a cast — they have no index
  // signature, only named properties. The runtime shape is exactly what
  // `<JsonLd>` expects (a plain JSON-serializable object); only the static
  // type needs widening here.
  const asRecord = (value: object) => value as Record<string, unknown>;

  const graph: Record<string, unknown>[] = [asRecord(business), cityService, asRecord(breadcrumb)];
  if (faqItems.length > 0) graph.push(asRecord(faqPageSchema(faqItems)));

  return graph;
}
