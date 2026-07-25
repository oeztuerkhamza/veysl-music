import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { resolveLocalized, type PublishedRegion } from '@/content/regions';
import type { Locale } from '@/i18n/routing';

/** Travel logistics from Stuttgart and how it's quoted — see `Region.logistics`. */
export function RegionLogistics({ region, locale }: { region: PublishedRegion; locale: Locale }) {
  const t = useTranslations('regions.country');
  const countryName = resolveLocalized(region.name, locale) ?? region.name.de;
  const body = resolveLocalized(region.logistics, locale) ?? region.logistics.de;

  return (
    <Section>
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={t('logistics.eyebrow')}
            title={t('logistics.title', { country: countryName })}
            lead={body}
          />
          <p className="mt-3 max-w-2xl text-sm text-ink-faint">
            {t('distance.label', { km: region.distanceKm, city: region.referenceCity })}
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}
