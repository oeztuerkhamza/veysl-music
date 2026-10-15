import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ExternalLink } from 'lucide-react';
import type { Locale } from '@/i18n/routing';
import { localeTags } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { absoluteUrl, buildMetadata } from '@/lib/seo';
import { JsonLd } from '@/lib/json-ld';
import { formatDate } from '@/lib/utils';
import { getPublishedWeddings } from '@/lib/weddings';
import { getVenueBySlug, getVenueParams, weddingsAtVenue } from '@/lib/venues';
import { VENUE_SUPPORTED_LOCALES, isVenueLocale } from '@/content/venues';
import { getAllCities } from '@/content/cities';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { PageHero } from '@/components/pages/page-hero';
import { Button } from '@/components/ui/button';
import { PostBody } from '@/components/blog/post-body';
import { buildVenueJsonLd } from '@/components/venue/venue-json-ld';

interface PageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

/**
 * Veröffentlichte Locations × unterstützte Sprachen. Die Liste kommt aus dem
 * CMS; ohne Datenbank beim Build (Docker) ist sie leer, und jede Location
 * wird dann beim ersten Aufruf gerendert und gecacht — `revalidatePath`
 * aus `src/payload/revalidate.ts` räumt sie bei jeder Änderung ab.
 */
export async function generateStaticParams() {
  return getVenueParams();
}

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isVenueLocale(locale)) return {};
  const venue = await getVenueBySlug(slug, locale);
  if (!venue) return {};

  const values = { venue: venue.name, city: venue.city };
  const metadata = await buildMetadata({
    locale,
    pathname: '/hochzeitslocation/[slug]',
    params: { slug: venue.slug },
    values,
    availableLocales: [...VENUE_SUPPORTED_LOCALES],
  });

  // Location-Namen sind unberechenbar lang. Sprengt der Titel oder die
  // Beschreibung die SERP-Grenze, greift die Kurzfassung aus denselben
  // Messages — sonst kappt Google genau den Teil, der die Anfrage trägt.
  const t = await getTranslations({ locale, namespace: 'venue.meta' });
  const fullTitle = t('title', values);
  const fullDescription = t('description', values);
  const title = [...fullTitle].length > TITLE_MAX ? t('titleShort', values) : fullTitle;
  const description = [...fullDescription].length > DESCRIPTION_MAX ? t('descriptionShort', values) : fullDescription;

  return {
    ...metadata,
    title: { absolute: title },
    description,
    openGraph: { ...metadata.openGraph, title, description },
    twitter: { ...metadata.twitter, title, description },
  };
}

export default async function VenuePage({ params }: PageProps) {
  const { locale, slug } = await params;
  if (!isVenueLocale(locale)) notFound();
  setRequestLocale(locale);

  const venue = await getVenueBySlug(slug, locale);
  if (!venue) notFound();

  const t = await getTranslations('venue');
  const tCta = await getTranslations('cta');
  const tRoot = await getTranslations();

  const weddings = weddingsAtVenue(await getPublishedWeddings(locale), venue);

  // Stadtseite nur verlinken, wenn der Ortsname zu einer veröffentlichten
  // Stadtseite in dieser Sprache passt — kein Link ins Leere.
  const cityPage = getAllCities().find(
    (city) => city.name.toLocaleLowerCase('de-DE') === venue.city.toLocaleLowerCase('de-DE') && city.locales.includes(locale),
  );

  const pageUrl = absoluteUrl('/hochzeitslocation/[slug]', locale, { slug: venue.slug });
  const jsonLd = buildVenueJsonLd({
    venue,
    locale,
    pageUrl,
    homeLabel: tRoot('nav.home'),
    weddingsLabel: tRoot('nav.weddings'),
  });

  const values = { venue: venue.name, city: venue.city };

  return (
    <>
      <JsonLd data={jsonLd} />

      <PageHero eyebrow={t('hero.eyebrow')} title={t('hero.title', values)} subtitle={t('hero.subtitle', values)} />

      <Section className="pt-0">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:items-start">
            <div>
              {venue.image ? (
                <Reveal>
                  <div
                    className="relative mb-10 overflow-hidden rounded-lg bg-surface-2"
                    style={{ aspectRatio: venue.image.width && venue.image.height ? `${venue.image.width} / ${venue.image.height}` : '3 / 2' }}
                  >
                    <Image
                      src={venue.image.src}
                      alt={venue.image.alt}
                      fill
                      sizes="(min-width: 1024px) 40rem, 100vw"
                      className="object-cover"
                      priority
                    />
                  </div>
                </Reveal>
              ) : null}

              {venue.note ? (
                <Reveal>
                  <h2 className="font-display text-2xl text-ink sm:text-3xl">{t('note.title')}</h2>
                  <div className="mt-6 max-w-2xl">
                    {/* Dasselbe Markdown wie im Ratgeber und in den Hochzeits-Texten. */}
                    <PostBody body={venue.note} />
                  </div>
                </Reveal>
              ) : null}
            </div>

            <Reveal as="aside">
              <div className="rounded-lg border border-line bg-surface-2 p-6">
                <h2 className="font-display text-xl text-ink">{t('facts.title')}</h2>
                <dl className="mt-4 space-y-4 text-sm">
                  <div>
                    <dt className="text-ink-faint">{t('facts.address')}</dt>
                    <dd className="mt-1 text-ink">
                      {venue.address ? `${venue.address}, ` : ''}
                      {venue.city}
                    </dd>
                  </div>
                  {venue.website ? (
                    <div>
                      <dt className="text-ink-faint">{t('facts.website')}</dt>
                      <dd className="mt-1">
                        <a
                          href={venue.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-gold underline-offset-4 hover:underline"
                        >
                          {t('facts.visit', { venue: venue.name })}
                          <ExternalLink aria-hidden="true" className="h-4 w-4" />
                        </a>
                      </dd>
                    </div>
                  ) : null}
                </dl>
                {cityPage ? (
                  <p className="mt-6 border-t border-line pt-4 text-sm text-ink-muted">
                    {t('city.text', { city: venue.city })}{' '}
                    <Link
                      href={{ pathname: '/hochzeits-dj/[stadt]', params: { stadt: cityPage.slug } }}
                      className="text-gold underline-offset-4 hover:underline"
                    >
                      {t('city.link', { city: venue.city })}
                    </Link>
                  </p>
                ) : null}
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {weddings.length > 0 ? (
        <Section>
          <Container>
            <Reveal>
              <SectionHeading title={t('weddings.title')} lead={t('weddings.lead')} />
            </Reveal>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {weddings.map((wedding) => (
                <li key={wedding.id}>
                  <Link
                    href={{ pathname: '/echte-hochzeiten', hash: `hochzeit-${wedding.id}` }}
                    className="group flex h-full flex-col gap-2 rounded-lg border border-line bg-surface p-5 transition-colors hover:border-gold"
                  >
                    <span className="font-display text-lg text-ink transition-colors group-hover:text-gold">{wedding.coupleLabel}</span>
                    <span className="text-sm text-ink-muted">
                      {[wedding.date ? formatDate(wedding.date, localeTags[locale]) : undefined, wedding.city]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                    <span className="mt-auto pt-2 text-sm text-gold">{t('weddings.link')} →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      <Section>
        <Container>
          <Reveal>
            <div className="flex flex-col items-start gap-4 rounded-lg border border-line bg-surface p-8 sm:p-10">
              <h2 className="font-display text-[clamp(1.75rem,3vw,2.75rem)] leading-tight text-ink">{t('cta.title', values)}</h2>
              <p className="max-w-xl text-ink-muted">{t('cta.text')}</p>
              <Button href="/anfrage" variant="gold" size="lg">
                {tCta('primary')}
              </Button>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
