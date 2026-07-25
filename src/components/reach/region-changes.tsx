import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { resolveLocalized, type PublishedRegion } from '@/content/regions';
import type { Locale } from '@/i18n/routing';

/**
 * "What changes abroad": equipment shipped vs. rented locally, power
 * standard, venue noise rules — see `Region.whatChanges`. Deliberately its
 * own section (not folded into logistics) so it reads as genuinely different
 * substance per country, not a template with the distance swapped.
 */
export function RegionChanges({ region, locale }: { region: PublishedRegion; locale: Locale }) {
  const t = useTranslations('regions.country');
  const countryName = resolveLocalized(region.name, locale) ?? region.name.de;
  const body = resolveLocalized(region.whatChanges, locale) ?? region.whatChanges.de;

  return (
    <Section>
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={t('whatChanges.eyebrow')}
            title={t('whatChanges.title', { country: countryName })}
            lead={body}
          />
        </Reveal>
      </Container>
    </Section>
  );
}
