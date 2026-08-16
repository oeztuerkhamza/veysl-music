import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Route, Speaker, UserCheck, type LucideIcon } from 'lucide-react';
import { absoluteUrl, buildMetadata } from '@/lib/seo';
import { JsonLd } from '@/lib/json-ld';
import { breadcrumbSchema, faqPageSchema, localBusinessSchema, localizedServiceType, serviceSchema } from '@/lib/schema';
import { BW_SUPPORTED_LOCALES, bwPillars, isBwLocale, type BwPillarIcon } from '@/content/region-bw';
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
  return BW_SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isBwLocale(locale)) return {};

  return buildMetadata({
    locale,
    pathname: '/hochzeits-dj-baden-wuerttemberg',
    availableLocales: [...BW_SUPPORTED_LOCALES],
  });
}

const ICONS: Record<BwPillarIcon, LucideIcon> = { Route, Speaker, UserCheck };

interface FaqItem {
  q: string;
  a: string;
}

/**
 * Landesseite für „Hochzeits-DJ Baden-Württemberg".
 *
 * Zwei Aufgaben, die vorher niemand hatte. Erstens die Suchanfrage selbst: Sie
 * steht in docs/SEO-COMPETITIVE-ANALYSIS.md §1 unter den drei Kernabfragen und
 * hatte keine Seite — die Startseite zielt auf Stuttgart, jede Stadtseite auf
 * ihre Stadt, `/hochzeits-dj-europa` auf Länder außerhalb Deutschlands.
 * Zweitens die Cluster-Struktur: Die acht Stadtseiten verlinkten sich nur
 * seitwärts über `nearby` und hatten keine gemeinsame Elternseite, weil
 * `/hochzeits-dj` in einen 404 lief.
 *
 * Die Städteliste kommt aus `getAllCities()` und wird nicht dupliziert. Damit
 * ist diese Seite automatisch vollständig, sobald eine Stadt dazukommt — und
 * kann nicht in den Zustand geraten, eine Stadt zu nennen, die es nicht mehr
 * gibt.
 *
 * Inhaltlich bewusst *nicht* „warum DJ Veys gut ist" (das steht auf der
 * Startseite), sondern das, was ausschließlich auf Landesebene eine Frage ist:
 * Anfahrt über Distanz, gleiche Technik unabhängig vom Ort, ein Ansprechpartner
 * statt regionaler Subunternehmer. Sonst wäre es eine Dublette der Startseite
 * mit ausgetauschter Ortsangabe — genau der Fehler, den die Wettbewerbsanalyse
 * bei `tuerkischerdj.com` als Schwäche notiert.
 */
export default async function BadenWuerttembergPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isBwLocale(locale)) notFound();

  setRequestLocale(locale);

  const t = await getTranslations('bw');
  const tNav = await getTranslations('nav');

  // `hasCityProse`, aus demselben Grund wie auf den beiden Türkisch-Seiten:
  // Die Stadtroute liefert `notFound()` für Sprachen ohne echte Prosa. Heute
  // haben alle 19 Städte de/tr/en — aber die erste nur deutsch geschriebene
  // Stadt hätte hier tr/en-seitig in einen 404 verlinkt, auf der Elternseite
  // des gesamten Clusters.
  const cities = getAllCities().filter((city) => hasCityProse(city, locale));
  const pageUrl = absoluteUrl('/hochzeits-dj-baden-wuerttemberg', locale);
  const faqItems = t.raw('faq.items') as FaqItem[];

  const asRecord = (value: object): Record<string, unknown> => value as Record<string, unknown>;
  const jsonLd = [
    localBusinessSchema(locale),
    breadcrumbSchema([
      { name: tNav('home'), url: absoluteUrl('/', locale) },
      { name: t('hero.title'), url: pageUrl },
    ]),
    // Kurze Kategorie im `serviceType`, die H1 im `name` — siehe `ServiceInput`.
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

      <PageHero eyebrow={t('hero.eyebrow')} title={t('hero.title')} subtitle={t('hero.subtitle')}>
        <p className="mt-4 text-sm text-ink-faint">{site.serviceAreas.join(' · ')}</p>
      </PageHero>

      <Section>
        <Container size="narrow">
          <Reveal>
            <SectionHeading eyebrow={t('intro.eyebrow')} title={t('intro.title')} />
            <p className="mt-6 leading-relaxed text-ink-muted">{t('intro.body')}</p>
          </Reveal>
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal>
            <SectionHeading eyebrow={t('pillars.eyebrow')} title={t('pillars.title')} />
          </Reveal>
          <ul className="mt-12 grid gap-8 sm:grid-cols-3">
            {bwPillars.map((pillar) => {
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
          <p className="mt-6 text-sm text-ink-faint">{t('cities.note')}</p>
          {/* Querverweis in die Türkisch-Nische: gleiche Landes-Ebene, andere
              Suchintention — das Gegenstück zum bwLink auf den beiden
              Türkisch-Seiten. */}
          <p className="mt-3 text-sm text-ink-faint">
            <Link href="/tuerkischer-dj-baden-wuerttemberg" className="underline decoration-gold/50 underline-offset-4 transition-colors hover:text-gold">
              {t('cities.turkishLink')}
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
              <AnswerBlock key={item.q} id={`bw-faq-${index + 1}`} question={item.q} answer={item.a} />
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
