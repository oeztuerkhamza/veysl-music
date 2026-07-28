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
import { buildPackagesJsonLd } from '@/components/pages/page-json-ld';
import { JsonLd } from '@/lib/json-ld';
import { absoluteUrl } from '@/lib/seo';

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
  const tRoot = await getTranslations();

  // Names and descriptions come straight from the already-translated
  // `packages.items.<id>` namespace — the same strings <PackageCard> renders,
  // so the structured data can never describe a package differently from the
  // card next to it.
  const services = packages.map((pkg) => ({
    name: t(`items.${pkg.id}.name`),
    description: t(`items.${pkg.id}.description`),
    url: absoluteUrl('/pakete', locale),
  }));

  return (
    <>
      <JsonLd
        data={buildPackagesJsonLd({
          locale,
          homeLabel: tRoot('nav.home'),
          pageLabel: tRoot('nav.packages'),
          services,
        })}
      />

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
