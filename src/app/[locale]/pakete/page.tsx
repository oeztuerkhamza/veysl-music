import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo';
import { packages } from '@/content/packages';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { PageHero } from '@/components/pages/page-hero';
import { PackageCard } from '@/components/pages/package-card';
import { FinalCta } from '@/components/pages/final-cta';

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({ locale, pathname: '/pakete' });
}

export default async function PaketePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('packages');

  return (
    <>
      <PageHero eyebrow={t('hero.eyebrow')} title={t('hero.title')} subtitle={t('hero.subtitle')} />

      <Section>
        <Container>
          <div className="grid items-stretch gap-6 lg:grid-cols-3">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal>
            <div className="flex flex-col items-start gap-4 rounded-lg border border-line bg-surface-2 p-8 sm:p-10">
              <h2 className="font-display text-3xl text-ink">{t('customTitle')}</h2>
              <p className="max-w-xl leading-relaxed text-ink-muted">{t('customText')}</p>
              <Button href="/anfrage" variant="gold" size="lg">
                {t('customCta')}
              </Button>
              <p className="text-xs text-ink-faint">{t('note')}</p>
            </div>
          </Reveal>
        </Container>
      </Section>

      <FinalCta compact />
    </>
  );
}
