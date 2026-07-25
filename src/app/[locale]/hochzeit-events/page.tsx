import { Check } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo';
import { site } from '@/content/site';
import { services } from '@/content/services';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Reveal } from '@/components/motion/reveal';
import { PageHero } from '@/components/pages/page-hero';
import { ServiceBlock } from '@/components/pages/service-block';
import { CapabilityStrip } from '@/components/pages/capability-strip';
import { FinalCta } from '@/components/pages/final-cta';

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({ locale, pathname: '/hochzeit-events' });
}

export default async function HochzeitEventsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('services');
  const includedItems = t.raw('included.items') as string[];

  return (
    <>
      <PageHero eyebrow={t('hero.eyebrow')} title={t('hero.title')} subtitle={t('hero.subtitle')}>
        <p className="mt-4 text-sm text-ink-faint">{site.reach[locale]}</p>
      </PageHero>

      <div className="flex flex-col gap-6">
        {services.map((service, index) => (
          <ServiceBlock
            key={service.id}
            icon={service.icon}
            title={t(`items.${service.id}.title`)}
            tagline={t(`items.${service.id}.tagline`)}
            text={t(`items.${service.id}.text`)}
            features={t.raw(`items.${service.id}.features`) as string[]}
            reversed={index % 2 === 1}
            imageSlot={`services.${service.id}.image`}
          />
        ))}
      </div>

      <CapabilityStrip />

      <Section>
        <Container>
          <Reveal>
            <h2 className="font-display text-3xl text-ink sm:text-4xl">{t('included.title')}</h2>
          </Reveal>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {includedItems.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-lg border border-line bg-surface p-5 text-sm text-ink"
              >
                <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <FinalCta />
    </>
  );
}
