import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Drum, Mic, Music, type LucideIcon } from 'lucide-react';
import { absoluteUrl, buildMetadata } from '@/lib/seo';
import { JsonLd } from '@/lib/json-ld';
import { breadcrumbSchema, faqPageSchema, localBusinessSchema, localizedServiceType, serviceSchema } from '@/lib/schema';
import {
  TURKISH_DJ_SUPPORTED_LOCALES,
  isTurkishDjLocale,
  turkishDjPillars,
  type TurkishDjPillarIcon,
} from '@/content/turkish-dj';
import { getAllCities, hasCityProse } from '@/content/cities';
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
    pathname: '/tuerkischer-dj-stuttgart',
    availableLocales: [...TURKISH_DJ_SUPPORTED_LOCALES],
  });
}

const ICONS: Record<TurkishDjPillarIcon, LucideIcon> = { Music, Drum, Mic };

interface FaqItem {
  q: string;
  a: string;
}

/**
 * Nischen-Landingpage „Türkischer DJ Stuttgart".
 *
 * Warum es sie gibt, steht bei der Route in `src/i18n/routing.ts` und im
 * Dateikopf von `src/content/turkish-dj.ts`. Kurz: Die Abfragegruppe
 * „türkischer dj (stuttgart)" ist ein dokumentiertes Keyword-Map-Ziel, kam
 * aber in keinem Titel und keiner H1 der Website vor — während sie das
 * Kerngeschäft beschreibt.
 *
 * Inhaltlich bewusst NICHT die Startseite mit ausgetauschtem Adjektiv: Hier
 * geht es ausschließlich um das, was an türkisch und deutsch-türkisch
 * geprägten Feiern anders ist — doppeltes Repertoire, Traditionen mit eigener
 * Dramaturgie (Gelin Çıkarma, Davul Zurna, Kına Gecesi), zweisprachige
 * Moderation. Alle Fakten stammen aus `site.ts`/BRAND-FACTS.md
 * (`capabilities`, `stats`), nichts ist erfunden.
 */
export default async function TurkishDjPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isTurkishDjLocale(locale)) notFound();

  setRequestLocale(locale);

  const t = await getTranslations('turkishDj');
  const tNav = await getTranslations('nav');

  // Zwei Filter, zwei Gründe.
  //
  // `hasCityProse`: Nur Städte, deren Seite es in DIESER Sprache gibt — die
  // Stadtroute liefert sonst `notFound()`. `cities.ts` verlangt nur die
  // deutsche Prosa; ohne den Filter würde die erste nur deutsch geschriebene
  // Stadt hier tr/en-seitig in einen 404 verlinken.
  //
  // `distanceKm`: Die Überschrift dieses Abschnitts verspricht „Stuttgart und
  // die Region". Seit das Städte-Cluster bis an den Bodensee und in den
  // Breisgau reicht, wäre eine ungefilterte Liste eine andere Aussage —
  // Freiburg (131 km) oder Konstanz (124 km) unter dieser Überschrift
  // behaupten einen regionalen Türkisch-DJ-Fußabdruck, den die verlinkten
  // Seiten selbst bewusst nicht erheben. Die Grenze liegt beim Radius, den
  // `site.serviceAreas` als Kernregion führt.
  const REGION_RADIUS_KM = 100;
  const cities = getAllCities().filter(
    (city) => hasCityProse(city, locale) && city.distanceKm <= REGION_RADIUS_KM,
  );
  const pageUrl = absoluteUrl('/tuerkischer-dj-stuttgart', locale);
  const faqItems = t.raw('faq.items') as FaqItem[];

  const statValues = {
    years: site.stats.yearsExperience,
    events: site.stats.eventsCompleted,
  };

  const asRecord = (value: object): Record<string, unknown> => value as Record<string, unknown>;
  const jsonLd = [
    localBusinessSchema(locale),
    breadcrumbSchema([
      { name: tNav('home'), url: absoluteUrl('/', locale) },
      { name: t('hero.title'), url: pageUrl },
    ]),
    // `serviceType` bleibt die kurze Kategorie; die H1 ist der `name`. Ein
    // ganzer Überschriftensatz im Kategorie-Feld dupliziert nur den Namen.
    ...serviceSchema(
      [
        {
          name: t('hero.title'),
          serviceType: localizedServiceType(locale),
          description: t('meta.description'),
          url: pageUrl,
        },
      ],
      locale,
    ),
    faqPageSchema(faqItems.map((item) => ({ q: item.q, a: item.a }))),
  ].map(asRecord);

  return (
    <>
      <JsonLd data={jsonLd} />

      <PageHero eyebrow={t('hero.eyebrow')} title={t('hero.title')} subtitle={t('hero.subtitle', statValues)}>
        <p className="mt-4 text-sm text-ink-faint">{site.serviceAreas.join(' · ')}</p>
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
            {turkishDjPillars.map((pillar) => {
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

      <Section>
        <Container>
          <Reveal>
            <SectionHeading eyebrow={t('cities.eyebrow')} title={t('cities.title')} lead={t('cities.lead')} />
          </Reveal>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {cities.map((city) => (
              <li key={city.slug}>
                <Link
                  href={{ pathname: '/hochzeits-dj/[stadt]', params: { stadt: city.slug } }}
                  className="flex h-full flex-col rounded-md border border-line bg-surface px-4 py-3 transition-colors hover:border-gold"
                >
                  <span className="font-display text-lg text-ink">{city.name}</span>
                  <span className="text-xs text-ink-faint">{city.distanceKm} km</span>
                </Link>
              </li>
            ))}
          </ul>
          {/* Cluster-Elternseite: von hier aus geht es eine Ebene hoch zur
              Landesseite — dieselbe Abfrage-Familie, breiterer Radius. */}
          <p className="mt-6 text-sm text-ink-faint">
            <Link href="/hochzeits-dj-baden-wuerttemberg" className="underline decoration-gold/50 underline-offset-4 transition-colors hover:text-gold">
              {t('cities.bwLink')}
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
              <AnswerBlock key={item.q} id={`turkish-dj-faq-${index + 1}`} question={item.q} answer={item.a} />
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
