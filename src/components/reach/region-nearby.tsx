import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { Link } from '@/i18n/navigation';
import { resolveLocalized, getOtherRegions, type PublishedRegion } from '@/content/regions';
import type { Locale } from '@/i18n/routing';

/**
 * Cross-links this country page to the other published country pages plus
 * the hub — reinforcing the small Europe cluster (5 countries, no tiering
 * needed) without ever linking into the Stuttgart city cluster. Mirrors
 * `CityNearby`'s role, deliberately kept separate: the two clusters must
 * never cross-link into each other (brief's explicit instruction).
 */
export function RegionNearby({ region, locale }: { region: PublishedRegion; locale: Locale }) {
  const t = useTranslations('regions.country');
  const others = getOtherRegions(region.slug).filter((r) => r.locales.includes(locale));

  return (
    <Section>
      <Container>
        {others.length > 0 ? (
          <Reveal>
            <SectionHeading eyebrow={t('nearby.eyebrow')} title={t('nearby.title')} />
            <div className="mt-8 flex flex-wrap gap-3">
              {others.map((other) => {
                const name = resolveLocalized(other.name, locale) ?? other.name.de;
                return (
                  <Link
                    key={other.slug}
                    href={{ pathname: '/hochzeits-dj-europa/[land]', params: { land: other.slug } }}
                    className="rounded-full border border-line px-5 py-2 text-sm text-ink transition-colors hover:border-gold hover:text-gold"
                  >
                    {name}
                  </Link>
                );
              })}
              <Link
                href="/hochzeits-dj-europa"
                className="rounded-full border border-gold/40 px-5 py-2 text-sm text-gold transition-colors hover:border-gold"
              >
                {t('nearby.hubCta')}
              </Link>
            </div>
          </Reveal>
        ) : null}
      </Container>
    </Section>
  );
}
