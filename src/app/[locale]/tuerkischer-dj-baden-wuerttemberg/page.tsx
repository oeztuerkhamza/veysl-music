import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Drum, Route, Users, type LucideIcon } from 'lucide-react';
import { absoluteUrl, buildMetadata } from '@/lib/seo';
import { JsonLd } from '@/lib/json-ld';
import {
  breadcrumbSchema,
  faqPageSchema,
  localBusinessSchema,
  localizedTurkishServiceType,
  serviceSchema,
} from '@/lib/schema';
import {
  TURKISH_DJ_SUPPORTED_LOCALES,
  isTurkishDjLocale,
  turkishDjBwPillars,
  type TurkishDjBwPillarIcon,
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
    pathname: '/tuerkischer-dj-baden-wuerttemberg',
    availableLocales: [...TURKISH_DJ_SUPPORTED_LOCALES],
  });
}

const ICONS: Record<TurkishDjBwPillarIcon, LucideIcon> = { Route, Drum, Users };

interface FaqItem {
  q: string;
  a: string;
}

interface RegionItem {
  region: string;
  towns: string;
}

/**
 * Landesseite „Türkischer DJ Baden-Württemberg".
 *
 * Warum es sie gibt, steht bei der Route in `src/i18n/routing.ts`. Kurz: Die
 * Stuttgart-Seite trägt die Stadt-Abfrage, sagt in ihrer eigenen FAQ aber
 * landesweite Buchbarkeit zu — die Landes-Abfrage („türkischer dj
 * baden-württemberg", tr „baden-württemberg türk dj") hatte trotzdem keine
 * Seite. Kein `/tuerkischer-dj/[stadt]`-Cluster daneben, mit Absicht: Die
 * Stadtseiten `/hochzeits-dj/[stadt]` behalten „türkischer dj {stadt}" als
 * Sekundärziel, und 19 Türkisch-Dubletten ohne eigenständigen Inhalt wären
 * die Doorway-Falle aus docs/SEO-CITY-STRATEGY.md §5.
 *
 * Die Städteliste ist die VOLLE `getAllCities()` — anders als auf der
 * Stuttgart-Seite (dort Radius ≤ 100 km, weil deren Überschrift „Stuttgart
 * und die Region" verspricht). Hier IST die landesweite Reichweite die
 * Aussage der Seite, und sie ist belegt: Der Betreiber hat die Anfahrt in
 * alle gelisteten Städte am 2026-08-07 bestätigt (src/content/cities.ts,
 * Dateikopf). `hasCityProse` steht trotzdem davor — eine nur deutsch
 * geschriebene Stadt darf auf tr/en nicht in einen 404 verlinken.
 */
export default async function TurkishDjBwPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isTurkishDjLocale(locale)) notFound();

  setRequestLocale(locale);

  const t = await getTranslations('turkishDjBw');
  const tNav = await getTranslations('nav');

  const cities = getAllCities().filter((city) => hasCityProse(city, locale));
  const pageUrl = absoluteUrl('/tuerkischer-dj-baden-wuerttemberg', locale);
  const faqItems = t.raw('faq.items') as FaqItem[];
  const regionItems = t.raw('regions.items') as RegionItem[];

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
    // Kurze Kategorie im `serviceType` — hier die Türkisch-Nische, nicht der
    // generische Hochzeits-Typ; das Einzugsgebiet (Städte + Bundesland) kommt
    // aus dem Default von `serviceSchema()` und ist genau die Aussage dieser
    // Seite.
    ...serviceSchema(
      [
        {
          name: t('hero.title'),
          serviceType: localizedTurkishServiceType(locale),
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
            {turkishDjBwPillars.map((pillar) => {
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
          {/* Stuttgart hat keine Stadtseite (priority 3, siehe cities.ts) —
              sein Platz im Cluster ist die eigene Türkisch-Seite, eine Ebene
              tiefer als diese. */}
          <p className="mt-6 text-sm text-ink-faint">
            <Link
              href="/tuerkischer-dj-stuttgart"
              className="underline decoration-gold/50 underline-offset-4 transition-colors hover:text-gold"
            >
              {t('cities.stuttgartLink')}
            </Link>
          </p>
          <p className="mt-3 text-sm text-ink-faint">{t('cities.note')}</p>
        </Container>
      </Section>

      {/* Long-Tail-Träger: Die Regionen des Landes mit Beispielorten, als
          Text statt Links — für „türkischer dj rottweil/kehl/ravensburg …"
          gibt es bewusst keine eigenen Seiten (Doorway-Regel), aber diese
          eine Seite nennt die Orte, für die die landesweite Zusage gilt. */}
      <Section>
        <Container>
          <Reveal>
            <SectionHeading eyebrow={t('regions.eyebrow')} title={t('regions.title')} lead={t('regions.lead')} />
          </Reveal>
          <dl className="mt-10 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {regionItems.map((item) => (
              <div key={item.region} className="rounded-lg border border-line bg-surface p-5">
                <dt className="font-display text-lg text-ink">{item.region}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-ink-muted">{item.towns}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-sm text-ink-faint">{t('regions.note')}</p>
        </Container>
      </Section>

      <Section>
        <Container size="narrow">
          <Reveal>
            <SectionHeading eyebrow={t('faq.eyebrow')} title={t('faq.title')} />
          </Reveal>
          <div className="mt-8">
            {faqItems.map((item, index) => (
              <AnswerBlock key={item.q} id={`turkish-dj-bw-faq-${index + 1}`} question={item.q} answer={item.a} />
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
