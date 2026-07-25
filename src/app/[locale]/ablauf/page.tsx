import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo';
import { faqOrder } from '@/content/faq';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Reveal } from '@/components/motion/reveal';
import { PageHero } from '@/components/pages/page-hero';
import { ProcessSteps } from '@/components/pages/process-steps';
import { FaqAccordion } from '@/components/pages/faq-accordion';
import { FinalCta } from '@/components/pages/final-cta';

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({ locale, pathname: '/ablauf' });
}

const STEP_KEYS = ['one', 'two', 'three', 'four'] as const;

export default async function AblaufPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('process');

  const steps = STEP_KEYS.map((key, index) => ({
    index: index + 1,
    title: t(`steps.${key}.title`),
    text: t(`steps.${key}.text`),
  }));

  // Read directly from messages so every answer is present in the
  // server-rendered HTML (FAQ schema / AI-GEO citation) — never JS-only.
  const rawFaq = t.raw('faq') as { q: string; a: string }[];
  const faqItems = rawFaq.map((entry, index) => ({
    id: faqOrder[index]?.id ?? `faq-${index}`,
    q: entry.q,
    a: entry.a,
  }));

  return (
    <>
      <PageHero eyebrow={t('hero.eyebrow')} title={t('hero.title')} subtitle={t('hero.subtitle')} />

      <Section>
        <Container>
          <ProcessSteps steps={steps} />
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal>
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl text-ink sm:text-4xl">{t('faqTitle')}</h2>
              <p className="mt-3 text-ink-muted">{t('faqSubtitle')}</p>
            </div>
          </Reveal>
          <div className="mt-8">
            <FaqAccordion items={faqItems} />
          </div>
        </Container>
      </Section>

      <FinalCta />
    </>
  );
}
