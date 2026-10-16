import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Music, Users, Mic, type LucideIcon } from 'lucide-react';
import { absoluteUrl } from '@/lib/seo';
import { JsonLd } from '@/lib/json-ld';
import { breadcrumbSchema, faqPageSchema, localBusinessSchema, serviceSchema } from '@/lib/schema';
import { weddingCultures, type WeddingCultureId, type WeddingCulturePathname } from '@/content/wedding-cultures';
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
import { GuideLinks, GUIDE_LINKS_BY_PAGE } from '@/components/blog/guide-links';

/** Drei neutrale Symbole in Reihenfolge der Säulen: Musik, Menschen/Tradition, Moderation. */
const PILLAR_ICONS: LucideIcon[] = [Music, Users, Mic];

interface TitledItem {
  title: string;
  text: string;
}

interface FaqItem {
  q: string;
  a: string;
}

interface CultureWeddingPageProps {
  locale: Locale;
  cultureId: WeddingCultureId;
  pathname: WeddingCulturePathname;
}

/**
 * Gemeinsame Darstellung der Kultur-Landingpages. Die drei Route-Dateien
 * (`/deutsch-tuerkische-hochzeit`, `/tuerkische-hochzeit`,
 * `/kurdische-hochzeit`) sind dünne Hüllen darum; alle Texte kommen aus dem
 * Namespace `weddingCulture.<cultureId>`.
 *
 * Aufbau bewusst wie die Türkisch-Nischenseiten: Hero → Einleitung → drei
 * Unterschiede → Ablauf/Bräuche → FAQ (mit FAQPage-Schema) → Ratgeber → CTA.
 * Dazu ein Block mit den beiden Schwesterseiten, damit sich die drei Seiten
 * gegenseitig verlinken statt zu kannibalisieren.
 */
export async function CultureWeddingPage({ locale, cultureId, pathname }: CultureWeddingPageProps) {
  setRequestLocale(locale);

  const t = await getTranslations(`weddingCulture.${cultureId}`);
  const tNav = await getTranslations('nav');

  const pageUrl = absoluteUrl(pathname, locale);
  const pillars = t.raw('pillars.items') as TitledItem[];
  const customs = t.raw('customs.items') as TitledItem[];
  const faqItems = t.raw('faq.items') as FaqItem[];
  const siblings = weddingCultures.filter((culture) => culture.id !== cultureId);

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
    ...serviceSchema(
      [
        {
          name: t('hero.title'),
          serviceType: t('serviceType'),
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

      <PageHero eyebrow={t('hero.eyebrow')} title={t('hero.title')} subtitle={t('hero.subtitle', statValues)} />

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
            {pillars.map((pillar, index) => {
              const Icon = PILLAR_ICONS[index % PILLAR_ICONS.length];
              return (
                <li key={pillar.title} className="rounded-lg border border-line bg-surface p-6">
                  <Icon className="size-6 text-gold" aria-hidden />
                  <h3 className="mt-4 font-display text-xl text-ink">{pillar.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">{pillar.text}</p>
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>

      <Section>
        <Container size="narrow">
          <Reveal>
            <SectionHeading eyebrow={t('customs.eyebrow')} title={t('customs.title')} lead={t('customs.lead')} />
          </Reveal>
          <ol className="mt-10 space-y-6">
            {customs.map((item, index) => (
              <li key={item.title} className="flex gap-4">
                <span
                  className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-gold/50 text-sm text-gold"
                  aria-hidden
                >
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-display text-lg text-ink">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section>
        <Container size="narrow">
          <Reveal>
            <SectionHeading eyebrow={t('faq.eyebrow')} title={t('faq.title')} />
          </Reveal>
          <div className="mt-8">
            {faqItems.map((item, index) => (
              <AnswerBlock key={item.q} id={`${cultureId}-faq-${index + 1}`} question={item.q} answer={item.a} />
            ))}
          </div>
        </Container>
      </Section>

      <GuideLinks ids={GUIDE_LINKS_BY_PAGE[cultureId]} locale={locale} />

      <Section>
        <Container>
          <Reveal>
            <SectionHeading eyebrow={t('related.eyebrow')} title={t('related.title')} />
          </Reveal>
          <ul className="mt-8 grid gap-3 sm:grid-cols-3">
            {siblings.map((culture) => (
              <li key={culture.id}>
                <Link
                  href={culture.pathname}
                  className="flex h-full rounded-md border border-line bg-surface px-4 py-3 font-display text-lg text-ink transition-colors hover:border-gold"
                >
                  {tNav(culture.navKey)}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/tuerkischer-dj-stuttgart"
                className="flex h-full rounded-md border border-line bg-surface px-4 py-3 font-display text-lg text-ink transition-colors hover:border-gold"
              >
                {tNav('turkishDj')}
              </Link>
            </li>
          </ul>
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
