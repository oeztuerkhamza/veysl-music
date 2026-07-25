import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { absoluteUrl, buildMetadata } from '@/lib/seo';
import { JsonLd } from '@/lib/json-ld';
import { site } from '@/content/site';
import { HUB_SUPPORTED_LOCALES } from '@/content/regions';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { PageHero } from '@/components/pages/page-hero';
import { RegionIntent } from '@/components/reach/region-intent';
import { RegionGrid } from '@/components/reach/region-grid';
import { RegionMoreCountries } from '@/components/reach/region-more-countries';
import { RegionHubFaq } from '@/components/reach/region-hub-faq';
import { buildHubJsonLd } from '@/components/reach/hub-json-ld';

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

/**
 * Only `HUB_SUPPORTED_LOCALES` (currently `['de', 'en']`) — see the doc
 * comment on that constant in `src/content/regions.ts` for exactly why this
 * is deliberately narrower than `routing.locales` for now.
 */
export function generateStaticParams() {
  return HUB_SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!HUB_SUPPORTED_LOCALES.includes(locale)) return {};

  return buildMetadata({
    locale,
    pathname: '/hochzeits-dj-europa',
    availableLocales: [...HUB_SUPPORTED_LOCALES],
  });
}

interface IntentOrFaqItem {
  q: string;
  a: string;
}

/**
 * "Destination Wedding Europa" — the hub for the Europe-wide reach story.
 * Deliberately NOT a directory of city pages: see docs/SEO-EUROPE-STRATEGY.md
 * for why country-level beats city-level here, and the hub's own FAQ (first
 * item) for the reader-facing version of that same argument.
 */
export default async function HochzeitsDjEuropaPage({ params }: PageProps) {
  const { locale } = await params;
  // `notFound()` BEFORE any `useTranslations`/`getTranslations('regions...')`
  // call — the parent `[locale]/layout.tsx` still declares all six locales
  // via `routing.locales`, so this page WILL be attempted for ku/fr/es/tr
  // during static generation until those message files carry the `regions`
  // namespace. This guard is what keeps that from crashing the build (same
  // technique as `/hochzeits-dj/[stadt]`'s own `notFound()` gate).
  if (!HUB_SUPPORTED_LOCALES.includes(locale)) notFound();

  setRequestLocale(locale);

  const t = await getTranslations('regions.hub');
  const tEyebrow = await getTranslations('regions');
  const tNav = await getTranslations('nav');

  const homeUrl = absoluteUrl('/', locale);
  const pageUrl = absoluteUrl('/hochzeits-dj-europa', locale);

  const faqItems: IntentOrFaqItem[] = [
    ...(t.raw('intent.items') as IntentOrFaqItem[]),
    ...(t.raw('faq.items') as IntentOrFaqItem[]),
  ];
  const jsonLd = buildHubJsonLd({ locale, pageUrl, homeUrl, hubName: t('hero.title'), faqItems });

  return (
    <>
      <JsonLd data={jsonLd} />

      <PageHero eyebrow={tEyebrow('eyebrow')} title={t('hero.title')} subtitle={t('hero.subtitle')}>
        <p className="mt-4 text-sm text-ink-faint">{site.reach[locale] ?? site.reach.de}</p>
      </PageHero>

      <RegionIntent />
      <RegionGrid locale={locale} />
      <RegionMoreCountries />

      <Section>
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={t('languages.eyebrow')}
              title={t('languages.title')}
              lead={t('languages.text')}
            />
          </Reveal>
        </Container>
      </Section>

      <RegionHubFaq />

      <Section id="anfrage">
        <Container>
          <Reveal>
            <div className="rounded-lg border border-line bg-surface px-6 py-12 sm:px-12">
              <SectionHeading
                align="center"
                eyebrow={t('cta.eyebrow')}
                title={t('cta.title')}
                lead={t('cta.subtitle')}
              />
              <div className="mt-8 flex justify-center">
                <Button href="/anfrage" variant="gold" size="lg">
                  {t('cta.button')}
                </Button>
              </div>
            </div>
          </Reveal>

          {/* Links up to the shared services/packages/process pages — never
              into the Stuttgart city cluster (brief's explicit instruction:
              the two clusters reinforce different things and must not
              cross-link into each other). */}
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/hochzeit-events" className="text-ink-muted transition-colors hover:text-ink">
              {tNav('services')}
            </Link>
            <Link href="/pakete" className="text-ink-muted transition-colors hover:text-ink">
              {tNav('packages')}
            </Link>
            <Link href="/ablauf" className="text-ink-muted transition-colors hover:text-ink">
              {tNav('process')}
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
