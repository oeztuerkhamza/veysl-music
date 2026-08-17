import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Mic, Music, Route, type LucideIcon } from 'lucide-react';
import { absoluteUrl, buildMetadata } from '@/lib/seo';
import { JsonLd } from '@/lib/json-ld';
import {
  breadcrumbSchema,
  faqPageSchema,
  localBusinessSchema,
  localizedTurkishServiceType,
} from '@/lib/schema';
import {
  TURKISH_DJ_SUPPORTED_LOCALES,
  isTurkishDjLocale,
  turkishDjDePillars,
  type TurkishDjDePillarIcon,
} from '@/content/turkish-dj';
import { site } from '@/content/site';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { PageHero } from '@/components/pages/page-hero';
import { AnswerBlock } from '@/components/geo/answer-block';

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export function generateStaticParams() {
  return TURKISH_DJ_SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isTurkishDjLocale(locale)) return {};

  return buildMetadata({
    locale,
    pathname: '/tuerkischer-dj-deutschland',
    availableLocales: [...TURKISH_DJ_SUPPORTED_LOCALES],
  });
}

const ICONS: Record<TurkishDjDePillarIcon, LucideIcon> = { Route, Music, Mic };

/**
 * Ländername für den Country-`areaServed`-Knoten, je Nischen-Sprache — dem
 * Muster von `region-json-ld.ts` folgend, das seine Ländernamen ebenfalls
 * lokalisiert übergibt.
 */
const COUNTRY_NAME: Partial<Record<Locale, string>> = {
  de: 'Deutschland',
  tr: 'Almanya',
  en: 'Germany',
};

interface FaqItem {
  q: string;
  a: string;
}

interface MetroItem {
  metro: string;
  towns: string;
}

/**
 * Bundes-Seite „Türkischer DJ Deutschland" — Ziel der nackten Kopfabfrage
 * („türkischer dj") und von „türk dj almanya". Warum es sie gibt und warum
 * es bewusst KEINE Stadtseiten für München & Co. gibt, steht bei der Route
 * in `src/i18n/routing.ts`.
 *
 * Faktenrahmen: durchgehend Buchbarkeit („deutschlandweit buchbar",
 * `site.germanyCities` — „Schwerpunkt Ballungsräume"), niemals eine
 * Auftritts-Referenz für eine Stadt, die `verifiedInternational`/
 * BRAND-FACTS nicht deckt. Der `Service` trägt deshalb einen
 * `Country`-Knoten (dem Muster von `region-json-ld.ts` folgend), nicht die
 * City-Liste der Kernregion: Das Markup selbst sagt, dass dies keine
 * Local-Pack-Seite ist.
 */
export default async function TurkishDjGermanyPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isTurkishDjLocale(locale)) notFound();

  setRequestLocale(locale);

  const t = await getTranslations('turkishDjDe');
  const tNav = await getTranslations('nav');

  const pageUrl = absoluteUrl('/tuerkischer-dj-deutschland', locale);
  const faqItems = t.raw('faq.items') as FaqItem[];
  const metroItems = t.raw('metros.items') as MetroItem[];

  const statValues = {
    years: site.stats.yearsExperience,
    events: site.stats.eventsCompleted,
  };

  const business = localBusinessSchema(locale);
  const nationalService = {
    '@context': 'https://schema.org' as const,
    '@type': 'Service' as const,
    serviceType: localizedTurkishServiceType(locale),
    name: t('hero.title'),
    description: t('meta.description'),
    url: pageUrl,
    provider: { '@id': business['@id'] },
    areaServed: { '@type': 'Country' as const, name: COUNTRY_NAME[locale] ?? 'Deutschland' },
  };

  const asRecord = (value: object): Record<string, unknown> => value as Record<string, unknown>;
  const jsonLd = [
    business,
    breadcrumbSchema([
      { name: tNav('home'), url: absoluteUrl('/', locale) },
      { name: t('hero.title'), url: pageUrl },
    ]),
    nationalService,
    faqPageSchema(faqItems.map((item) => ({ q: item.q, a: item.a }))),
  ].map(asRecord);

  return (
    <>
      <JsonLd data={jsonLd} />

      <PageHero eyebrow={t('hero.eyebrow')} title={t('hero.title')} subtitle={t('hero.subtitle', statValues)}>
        <p className="mt-4 text-sm text-ink-faint">{site.germanyCities.join(' · ')}</p>
      </PageHero>

      <Section>
        <Container size="narrow">
          <Reveal>
            <SectionHeading eyebrow={t('intro.eyebrow')} title={t('intro.title')} />
            <p className="mt-6 leading-relaxed text-ink-muted">{t('intro.body', statValues)}</p>
          </Reveal>
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal>
            <SectionHeading eyebrow={t('pillars.eyebrow')} title={t('pillars.title')} />
          </Reveal>
          <ul className="mt-12 grid gap-8 sm:grid-cols-3">
            {turkishDjDePillars.map((pillar) => {
              const Icon = ICONS[pillar.icon];
              return (
                <li key={pillar.id} className="rounded-lg border border-line bg-surface p-6">
                  <Icon className="size-6 text-gold" aria-hidden />
                  <h3 className="mt-4 font-display text-xl text-ink">{t(`pillars.items.${pillar.id}.title`)}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    {t(`pillars.items.${pillar.id}.text`)}
                  </p>
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>

      {/* Ballungsraum-Überblick als Text, nicht als Links — es gibt bewusst
          keine Stadtseiten außerhalb der Kernregion (Doorway-Regel, siehe
          Routing-Kommentar). Diese eine Seite nennt die Räume, für die die
          Buchbarkeits-Zusage aus site.germanyCities gilt. */}
      <Section>
        <Container>
          <Reveal>
            <SectionHeading eyebrow={t('metros.eyebrow')} title={t('metros.title')} lead={t('metros.lead')} />
          </Reveal>
          <dl className="mt-10 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {metroItems.map((item) => (
              <div key={item.metro} className="rounded-lg border border-line bg-surface p-5">
                <dt className="font-display text-lg text-ink">{item.metro}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-ink-muted">{item.towns}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-sm text-ink-faint">{t('metros.note')}</p>
          {/* Eine Ebene hinunter: das Land mit echten Stadtseiten und die
              Heimatstadt — die beiden Orte, an denen die Nische lokale
              Substanz hat. */}
          <p className="mt-3 text-sm text-ink-faint">
            <Link
              href="/tuerkischer-dj-baden-wuerttemberg"
              className="underline decoration-gold/50 underline-offset-4 transition-colors hover:text-gold"
            >
              {t('metros.bwLink')}
            </Link>
          </p>
          <p className="mt-3 text-sm text-ink-faint">
            <Link
              href="/tuerkischer-dj-stuttgart"
              className="underline decoration-gold/50 underline-offset-4 transition-colors hover:text-gold"
            >
              {t('metros.stuttgartLink')}
            </Link>
          </p>
        </Container>
      </Section>

      <Section>
        <Container size="narrow">
          <Reveal>
            <SectionHeading eyebrow={t('faq.eyebrow')} title={t('faq.title')} />
          </Reveal>
          <div className="mt-8">
            {faqItems.map((item, index) => (
              <AnswerBlock key={item.q} id={`turkish-dj-de-faq-${index + 1}`} question={item.q} answer={item.a} />
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal>
            <div className="rounded-lg border border-line bg-surface px-6 py-12 sm:px-12">
              <SectionHeading align="center" eyebrow={t('cta.eyebrow')} title={t('cta.title')} lead={t('cta.subtitle')} />
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
