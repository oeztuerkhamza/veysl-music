import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { absoluteUrl, buildMetadata } from '@/lib/seo';
import { JsonLd } from '@/lib/json-ld';
import { cities, getCityBySlug } from '@/content/cities';
import type { Locale } from '@/i18n/routing';
import { CityHero } from '@/components/city/city-hero';
import { CityOffer } from '@/components/city/city-offer';
import { CityBicultural } from '@/components/city/city-bicultural';
import { CityVenues } from '@/components/city/city-venues';
import { CityTravel } from '@/components/city/city-travel';
import { CityTrust } from '@/components/city/city-trust';
import { CityFaq } from '@/components/city/city-faq';
import { CityNearby } from '@/components/city/city-nearby';
import { CityCta } from '@/components/city/city-cta';
import { buildCityJsonLd } from '@/components/city/city-json-ld';

interface PageProps {
  params: Promise<{ locale: Locale; stadt: string }>;
}

/**
 * `cities` is already the published, locale-enriched list (see
 * `src/content/cities.ts`) — this is the exact same set `src/app/sitemap.ts`
 * reads, so static generation, hreflang and the sitemap can never disagree.
 */
export function generateStaticParams() {
  return cities.flatMap((city) => city.locales.map((locale) => ({ locale, stadt: city.slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, stadt } = await params;
  const city = getCityBySlug(stadt);
  if (!city || !city.locales.includes(locale)) return {};

  return buildMetadata({
    locale,
    pathname: '/hochzeits-dj/[stadt]',
    params: { stadt: city.slug },
    values: { city: city.name },
    availableLocales: city.locales,
  });
}

export default async function CityPage({ params }: PageProps) {
  const { locale, stadt } = await params;
  const city = getCityBySlug(stadt);
  if (!city) notFound();
  if (!city.locales.includes(locale)) notFound();

  setRequestLocale(locale);

  const pageUrl = absoluteUrl('/hochzeits-dj/[stadt]', locale, { stadt: city.slug });
  const homeUrl = absoluteUrl('/', locale);
  const jsonLd = buildCityJsonLd({ city, locale, pageUrl, homeUrl });

  return (
    <>
      <JsonLd data={jsonLd} />

      <CityHero city={city} locale={locale} />
      <CityOffer city={city} />
      <CityBicultural city={city} locale={locale} />
      <CityVenues city={city} locale={locale} />
      <CityTravel city={city} locale={locale} />
      <CityTrust city={city} />
      <CityFaq city={city} locale={locale} />
      <CityNearby city={city} />
      <CityCta city={city} />
    </>
  );
}
