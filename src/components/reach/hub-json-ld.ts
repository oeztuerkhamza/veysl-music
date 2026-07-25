import { breadcrumbSchema, faqPageSchema, localBusinessSchema, type FaqItem } from '@/lib/schema';
import { getAllRegions, resolveLocalized } from '@/content/regions';
import type { Locale } from '@/i18n/routing';

interface BuildHubJsonLdArgs {
  locale: Locale;
  /** Absolute canonical URL of the hub page. */
  pageUrl: string;
  homeUrl: string;
  hubName: string;
  /** Already-localized FAQ items read from `regions.hub.intent.items` + `regions.hub.faq.items` (both server-rendered `t.raw()` arrays). */
  faqItems: FaqItem[];
}

/**
 * Composes the hub page's JSON-LD from the shared `@/lib/schema` builders,
 * same pattern as `region-json-ld.ts`/`city-json-ld.ts`. Adds one hub-only
 * piece neither of those needs: an `ItemList` of the five country `Service`
 * entries, so the hub's role as a genuine index page (not a thin link farm)
 * is explicit in the markup too.
 */
export function buildHubJsonLd({ locale, pageUrl, homeUrl, hubName, faqItems }: BuildHubJsonLdArgs) {
  const business = localBusinessSchema(locale);

  const breadcrumb = breadcrumbSchema([
    { name: business.name, url: homeUrl },
    { name: hubName, url: pageUrl },
  ]);

  const asRecord = (value: object) => value as Record<string, unknown>;

  const itemList = {
    '@context': 'https://schema.org' as const,
    '@type': 'ItemList' as const,
    name: hubName,
    itemListElement: getAllRegions()
      .filter((region) => region.locales.includes(locale))
      .map((region, index) => ({
        '@type': 'ListItem' as const,
        position: index + 1,
        name: resolveLocalized(region.name, locale) ?? region.name.de,
      })),
  };

  const graph: Record<string, unknown>[] = [asRecord(business), asRecord(breadcrumb), itemList];
  if (faqItems.length > 0) graph.push(asRecord(faqPageSchema(faqItems)));

  return graph;
}
