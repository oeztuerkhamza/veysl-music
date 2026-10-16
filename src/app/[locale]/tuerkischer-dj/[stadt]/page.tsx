import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Check } from 'lucide-react';
import { absoluteUrl, buildMetadata } from '@/lib/seo';
import { JsonLd } from '@/lib/json-ld';
import {
  DESTINATION_LOCALES,
  destinationCountries,
  getDestinationCities,
  getDestinationCity,
  getRelatedDestinationCities,
  isDestinationLocale,
} from '@/content/destination-cities';
import { getRegionBySlug } from '@/content/regions';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { PageHero } from '@/components/pages/page-hero';
import { AnswerBlock } from '@/components/geo/answer-block';
import { GuideLinks, GUIDE_LINKS_BY_PAGE } from '@/components/blog/guide-links';
import { buildDestinationJsonLd } from '@/components/destination/destination-json-ld';

interface PageProps {
  params: Promise<{ locale: Locale; stadt: string }>;
}

export function generateStaticParams() {
  return getDestinationCities().flatMap((city) => DESTINATION_LOCALES.map((locale) => ({ locale, stadt: city.slug })));
}

function messageValues(city: NonNullable<ReturnType<typeof getDestinationCity>>, locale: (typeof DESTINATION_LOCALES)[number]) {
  return {
    city: city.name[locale],
    country: destinationCountries[city.country].name[locale],
    km: city.distanceKm,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, stadt } = await params;
  if (!isDestinationLocale(locale)) return {};
  const city = getDestinationCity(stadt);
  if (!city) return {};

  return buildMetadata({
    locale,
    pathname: '/tuerkischer-dj/[stadt]',
    params: { stadt: city.slug },
    values: messageValues(city, locale),
    availableLocales: [...DESTINATION_LOCALES],
  });
}

/**
 * Zielstadt-Seite „Türkischer DJ {Stadt}". Warum es diese Seitenfamilie gibt,
 * welche Regeln für ihre Texte gelten und wie man sie wieder abschaltet,
 * steht in `src/content/destination-cities.ts` und bei der Route in
 * `src/i18n/routing.ts`.
 */
export default async function DestinationCityPage({ params }: PageProps) {
  const { locale, stadt } = await params;
  if (!isDestinationLocale(locale)) notFound();
  const city = getDestinationCity(stadt);
  if (!city) notFound();

  setRequestLocale(locale);

  const t = await getTranslations('destination');
  const tDe = await getTranslations('turkishDjDe');
  const tEu = await getTranslations('regions.hub');

  const values = messageValues(city, locale);
  const country = destinationCountries[city.country];
  const abroad = city.country !== 'de';
  const region = country.regionSlug ? getRegionBySlug(country.regionSlug) : undefined;
  const regionInLocale = region?.locales.includes(locale) ? region : undefined;

  const pageUrl = absoluteUrl('/tuerkischer-dj/[stadt]', locale, { stadt: city.slug });
  const parentUrl = abroad ? absoluteUrl('/hochzeits-dj-europa', locale) : absoluteUrl('/tuerkischer-dj-deutschland', locale);
  const parentName = abroad ? tEu('hero.title') : tDe('hero.title');

  const faqItems = [
    { q: city.faq.q[locale], a: city.faq.a[locale] },
    { q: t('faq.availabilityQ', values), a: t('faq.availabilityA', values) },
    { q: t('faq.costQ', values), a: t('faq.costA', values) },
  ];

  const jsonLd = buildDestinationJsonLd({
    city,
    locale,
    pageUrl,
    homeUrl: absoluteUrl('/', locale),
    parentUrl,
    parentName,
    description: city.intro[locale],
    faq: faqItems,
  });

  const bringItems = t.raw('bring.items') as string[];
  const related = getRelatedDestinationCities(city, 3);

  const linkClass = 'underline decoration-gold/50 underline-offset-4 transition-colors hover:text-gold';

  return (
    <>
      <JsonLd data={jsonLd} />

      <PageHero eyebrow={t('hero.eyebrow', values)} title={t('hero.title', values)} subtitle={t('hero.subtitle', values)} />

      <Section>
        <Container size="narrow">
          <Reveal>
            <SectionHeading eyebrow={t('intro.eyebrow', values)} title={t('intro.title', values)} />
            <p className="mt-6 leading-relaxed text-ink-muted">{city.intro[locale]}</p>
            {/* Belegt oder nicht — immer ausgesprochen. Nur Wien trägt die erste Variante. */}
            <div className="mt-8 rounded-lg border border-line bg-surface p-5">
              <p className="font-display text-lg text-ink">
                {city.verified ? t('status.verifiedTitle') : t('status.openTitle')}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {city.verified ? t('status.verifiedText', values) : t('status.openText', values)}
              </p>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section>
        <Container size="narrow">
          <Reveal>
            <SectionHeading eyebrow={t('travel.eyebrow')} title={t('travel.title', values)} />
            <p className="mt-6 leading-relaxed text-ink-muted">{t(`travel.${city.travel}`, values)}</p>
            <p className="mt-4 leading-relaxed text-ink-muted">{city.route[locale]}</p>
          </Reveal>
        </Container>
      </Section>

      <Section>
        <Container size="narrow">
          <Reveal>
            <SectionHeading eyebrow={t('bring.eyebrow')} title={t('bring.title')} />
            <ul className="mt-6 space-y-3">
              {bringItems.map((item) => (
                <li key={item} className="flex gap-3 text-ink-muted">
                  <Check className="mt-1 size-4 shrink-0 text-gold" aria-hidden />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm">
              <Link href="/tuerkischer-dj-deutschland" className={linkClass}>
                {t('bring.more')}
              </Link>
            </p>
            {abroad ? (
              <div className="mt-8 border-t border-line pt-6">
                <h3 className="font-display text-lg text-ink">{t('languages.title')}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t('languages.text', values)}</p>
              </div>
            ) : null}
          </Reveal>
        </Container>
      </Section>

      <Section>
        <Container size="narrow">
          <Reveal>
            <SectionHeading eyebrow={t('faq.eyebrow')} title={t('faq.title', values)} />
          </Reveal>
          <div className="mt-8">
            {faqItems.map((item, index) => (
              <AnswerBlock key={item.q} id={`destination-faq-${index + 1}`} question={item.q} answer={item.a} />
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container size="narrow">
          <Reveal>
            <SectionHeading eyebrow={t('related.eyebrow')} title={t('related.title')} />
            <ul className="mt-6 space-y-3 text-sm text-ink-muted">
              {related.map((other) => (
                <li key={other.slug}>
                  <Link
                    href={{ pathname: '/tuerkischer-dj/[stadt]', params: { stadt: other.slug } }}
                    className={linkClass}
                  >
                    {t('related.city', { city: other.name[locale] })}
                  </Link>
                </li>
              ))}
              {regionInLocale ? (
                <li>
                  <Link
                    href={{ pathname: '/hochzeits-dj-europa/[land]', params: { land: regionInLocale.slug } }}
                    className={linkClass}
                  >
                    {t('related.country', { country: country.name[locale] })}
                  </Link>
                </li>
              ) : null}
              <li>
                {abroad ? (
                  <Link href="/hochzeits-dj-europa" className={linkClass}>
                    {t('related.parentEurope')}
                  </Link>
                ) : (
                  <Link href="/tuerkischer-dj-deutschland" className={linkClass}>
                    {t('related.parentGermany')}
                  </Link>
                )}
              </li>
            </ul>
          </Reveal>
        </Container>
      </Section>

      <GuideLinks ids={GUIDE_LINKS_BY_PAGE.destination} locale={locale} />

      <Section>
        <Container>
          <Reveal>
            <div className="rounded-lg border border-line bg-surface px-6 py-12 sm:px-12">
              <SectionHeading align="center" title={t('cta.title', values)} lead={t('cta.text')} />
              <div className="mt-8 flex justify-center">
                <Button href="/anfrage" variant="gold" size="lg">
                  {t('cta.button')}
                </Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
