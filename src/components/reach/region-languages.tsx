import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { resolveLocalized, type PublishedRegion } from '@/content/regions';
import type { Locale } from '@/i18n/routing';

/**
 * The explicit hosting-language honesty note (`Region.languagesNote`) — the
 * non-negotiable rule from the brief: never let a country page imply hosting
 * in French, Dutch or any language beyond German/Turkish/English
 * (`site.stats.hostingLanguages`). Every country page renders this section;
 * it never degrades to "nothing" the way the diaspora section can.
 */
export function RegionLanguages({ region, locale }: { region: PublishedRegion; locale: Locale }) {
  const t = useTranslations('regions.country');
  const countryName = resolveLocalized(region.name, locale) ?? region.name.de;
  const body = resolveLocalized(region.languagesNote, locale) ?? region.languagesNote.de;

  return (
    <Section>
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={t('languages.eyebrow')}
            title={t('languages.title', { country: countryName })}
            lead={body}
          />
        </Reveal>
      </Container>
    </Section>
  );
}
