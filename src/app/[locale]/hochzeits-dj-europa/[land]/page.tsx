import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { absoluteUrl, buildMetadata } from '@/lib/seo';
import { JsonLd } from '@/lib/json-ld';
import { getAllRegions, getRegionBySlug, resolveLocalized } from '@/content/regions';
import type { Locale } from '@/i18n/routing';
import { RegionHero } from '@/components/reach/region-hero';
import { RegionLogistics } from '@/components/reach/region-logistics';
import { RegionChanges } from '@/components/reach/region-changes';
import { RegionDiaspora } from '@/components/reach/region-diaspora';
import { RegionLanguages } from '@/components/reach/region-languages';
import { RegionFaq } from '@/components/reach/region-faq';
import { RegionNearby } from '@/components/reach/region-nearby';
import { RegionCta } from '@/components/reach/region-cta';
import { buildRegionJsonLd } from '@/components/reach/region-json-ld';

interface PageProps {
  params: Promise<{ locale: Locale; land: string }>;
}

/**
 * `regions` is the published, locale-enriched list (see
 * `src/content/regions.ts`) — the exact same set the sitemap should read (see
 * this agent's final report for the `src/app/sitemap.ts` diff), so static
 * generation, hreflang and the sitemap can never disagree. Only
 * `region.locales` combinations are generated — currently `['de', 'en']` for
 * every country, see `HUB_SUPPORTED_LOCALES`'s doc comment in regions.ts.
 */
export function generateStaticParams() {
  return getAllRegions().flatMap((region) => region.locales.map((locale) => ({ locale, land: region.slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, land } = await params;
  const region = getRegionBySlug(land);
  if (!region || !region.locales.includes(locale)) return {};

  const countryName = resolveLocalized(region.name, locale) ?? region.name.de;

  return buildMetadata({
    locale,
    pathname: '/hochzeits-dj-europa/[land]',
    params: { land: region.slug },
    values: { country: countryName },
    availableLocales: region.locales,
  });
}

export default async function RegionCountryPage({ params }: PageProps) {
  const { locale, land } = await params;
  const region = getRegionBySlug(land);
  if (!region) notFound();
  if (!region.locales.includes(locale)) notFound();

  setRequestLocale(locale);

  const tHub = await getTranslations('regions.hub');

  const pageUrl = absoluteUrl('/hochzeits-dj-europa/[land]', locale, { land: region.slug });
  const homeUrl = absoluteUrl('/', locale);
  const hubUrl = absoluteUrl('/hochzeits-dj-europa', locale);
  const jsonLd = buildRegionJsonLd({
    region,
    locale,
    pageUrl,
    homeUrl,
    hubUrl,
    hubName: tHub('hero.title'),
  });

  return (
    <>
      <JsonLd data={jsonLd} />

      <RegionHero region={region} locale={locale} />
      <RegionLogistics region={region} locale={locale} />
      <RegionChanges region={region} locale={locale} />
      <RegionDiaspora region={region} locale={locale} />
      <RegionLanguages region={region} locale={locale} />
      <RegionFaq region={region} locale={locale} />
      <RegionNearby region={region} locale={locale} />
      <RegionCta region={region} locale={locale} />
    </>
  );
}
