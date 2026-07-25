import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { resolveLocalized, type PublishedRegion } from '@/content/regions';
import type { Locale } from '@/i18n/routing';

const HOSTING_LANGS = ['de', 'tr', 'en'] as const;

/**
 * The Turkish/Kurdish diaspora angle — the genuine, honest advantage abroad
 * (see `Region.diaspora`). Renders nothing if no prose exists for `locale`,
 * mirroring `CityBicultural`'s "never a German fallback paragraph" rule.
 */
export function RegionDiaspora({ region, locale }: { region: PublishedRegion; locale: Locale }) {
  const t = useTranslations('regions.country');
  const tLang = useTranslations('booking.hostingLanguages');
  const countryName = resolveLocalized(region.name, locale) ?? region.name.de;
  const body = resolveLocalized(region.diaspora, locale);
  if (!body) return null;

  return (
    <Section>
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={t('diaspora.eyebrow')}
            title={t('diaspora.title', { country: countryName })}
            lead={body}
          />
          <div className="mt-8">
            <ul className="flex flex-wrap gap-3">
              {HOSTING_LANGS.map((code) => (
                <li key={code} className="rounded-full border border-line px-4 py-1.5 text-sm text-ink-muted">
                  {tLang(code)}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
