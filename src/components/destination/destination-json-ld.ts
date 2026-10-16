import { breadcrumbSchema, faqPageSchema, localBusinessSchema, localizedTurkishServiceType, type FaqItem } from '@/lib/schema';
import { destinationCountries, type DestinationCity, type DestinationLocale } from '@/content/destination-cities';

interface BuildDestinationJsonLdArgs {
  city: DestinationCity;
  locale: DestinationLocale;
  pageUrl: string;
  homeUrl: string;
  parentUrl: string;
  parentName: string;
  description: string;
  faq: FaqItem[];
}

/**
 * JSON-LD einer Zielstadt-Seite — gleiche Bausteine wie `region-json-ld.ts`.
 *
 * `areaServed` ist eine `City` mit `containedInPlace: Country`. Es gibt
 * bewusst keine Adresse und keine `geo`-Koordinaten der Stadt am
 * `LocalBusiness`: Das Markup soll sagen, dass DJ Veys dort anreist und nicht
 * dort sitzt. Die Seite ist keine Local-Pack-Seite und tut nicht so.
 */
export function buildDestinationJsonLd({
  city,
  locale,
  pageUrl,
  homeUrl,
  parentUrl,
  parentName,
  description,
  faq,
}: BuildDestinationJsonLdArgs) {
  const business = localBusinessSchema(locale);
  const cityName = city.name[locale];
  const countryName = destinationCountries[city.country].name[locale];

  const service = {
    '@context': 'https://schema.org' as const,
    '@type': 'Service' as const,
    serviceType: localizedTurkishServiceType(locale),
    name: `${business.name} — ${cityName}`,
    description,
    url: pageUrl,
    provider: { '@id': business['@id'] },
    areaServed: {
      '@type': 'City' as const,
      name: cityName,
      containedInPlace: { '@type': 'Country' as const, name: countryName },
    },
  };

  const breadcrumb = breadcrumbSchema([
    { name: business.name, url: homeUrl },
    { name: parentName, url: parentUrl },
    { name: cityName, url: pageUrl },
  ]);

  const asRecord = (value: object) => value as Record<string, unknown>;
  const graph: Record<string, unknown>[] = [asRecord(business), asRecord(service), asRecord(breadcrumb)];
  if (faq.length > 0) graph.push(asRecord(faqPageSchema(faq)));
  return graph;
}
