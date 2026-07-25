import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { resolveLocalized, type PublishedRegion } from '@/content/regions';
import type { Locale } from '@/i18n/routing';

export function RegionCta({ region, locale }: { region: PublishedRegion; locale: Locale }) {
  const t = useTranslations('regions.country');
  const countryName = resolveLocalized(region.name, locale) ?? region.name.de;

  return (
    <Section id="anfrage">
      <Container>
        <Reveal>
          <div className="rounded-lg border border-line bg-surface px-6 py-12 sm:px-12">
            <SectionHeading
              align="center"
              eyebrow={t('cta.eyebrow')}
              title={t('cta.title', { country: countryName })}
              lead={t('cta.subtitle', { country: countryName })}
            />
            <div className="mt-8 flex justify-center">
              <Button href="/anfrage" variant="gold" size="lg">
                {t('cta.button', { country: countryName })}
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
