import { useTranslations } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { Link } from '@/i18n/navigation';
import { resolveLocalized, getAllRegions } from '@/content/regions';
import type { Locale } from '@/i18n/routing';

/**
 * The five dedicated country pages, as cards — the hub's main content.
 * Deliberately shows only countries with real prose for the current
 * `locale` (`region.locales`), same discipline as `ServiceAreas`
 * (`src/components/home/service-areas.tsx`) only linking cities it has
 * genuine prose for.
 */
export function RegionGrid({ locale }: { locale: Locale }) {
  const t = useTranslations('regions.country');
  const tHub = useTranslations('regions.hub.countries');
  const tAvailability = useTranslations('regions.country.availability');
  const regions = getAllRegions().filter((r) => r.locales.includes(locale));

  return (
    <Section id="laender">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={tHub('eyebrow')} title={tHub('title')} lead={tHub('subtitle')} />
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {regions.map((region) => {
            const name = resolveLocalized(region.name, locale) ?? region.name.de;
            const intro = resolveLocalized(region.intro, locale) ?? region.intro.de;
            return (
              <Reveal key={region.slug}>
                <Link
                  href={{ pathname: '/hochzeits-dj-europa/[land]', params: { land: region.slug } }}
                  className="group flex h-full flex-col gap-3 rounded-lg border border-line bg-surface p-6 shadow-soft transition-[transform,box-shadow] duration-300 ease-out-expo hover:-translate-y-1 hover:border-gold/40 hover:shadow-lift"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-display text-xl text-ink">{name}</p>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-gold opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    />
                  </div>
                  <p className="text-xs uppercase tracking-[0.15em] text-gold">
                    {region.verified
                      ? tAvailability('verifiedTitle')
                      : tAvailability('availableTitle', { country: name })}
                  </p>
                  <p className="line-clamp-3 text-sm leading-relaxed text-ink-muted">{intro}</p>
                  <p className="mt-auto text-xs text-ink-faint">
                    {t('distance.label', { km: region.distanceKm, city: region.referenceCity })}
                  </p>
                </Link>
              </Reveal>
            );
          })}
        </div>
        {/* Not wrapped in Card on purpose: Card's own hover lift would fight
            with the Link's own lift/border transition above. */}
      </Container>
    </Section>
  );
}
