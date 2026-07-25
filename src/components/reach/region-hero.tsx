import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { site } from '@/content/site';
import { resolveLocalized, type PublishedRegion } from '@/content/regions';
import type { Locale } from '@/i18n/routing';
import { RegionBreadcrumbs } from './region-breadcrumbs';
import { RegionAvailabilityBadge } from './region-availability-badge';

export function RegionHero({ region, locale }: { region: PublishedRegion; locale: Locale }) {
  const t = useTranslations('regions.country');
  const tCta = useTranslations('cta');
  const tStats = useTranslations('home.stats');
  const countryName = resolveLocalized(region.name, locale) ?? region.name.de;
  const intro = resolveLocalized(region.intro, locale) ?? region.intro.de;

  return (
    <Section>
      <Container>
        <RegionBreadcrumbs region={region} locale={locale} />
        <Reveal>
          <SectionHeading
            as="h1"
            className="mt-6 max-w-3xl"
            eyebrow={t('eyebrow')}
            title={t('hero.title', { country: countryName })}
            lead={intro}
          />

          <div className="mt-6">
            <RegionAvailabilityBadge region={region} locale={locale} />
          </div>

          {/* Same three brand-wide facts as the city hero — never city/country
              -specific prose, so it's never repeated as if it were unique to
              this country (coordinator's instruction, mirrored from city-hero.tsx). */}
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-3">
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-gold">{tStats('years')}</dt>
              <dd className="mt-1 font-display text-2xl text-ink">{site.stats.yearsExperience}+</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-gold">{tStats('events')}</dt>
              <dd className="mt-1 font-display text-2xl text-ink">{site.stats.eventsCompleted}+</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-gold">{tStats('languagesLabel')}</dt>
              <dd className="mt-1 font-display text-2xl text-ink">{site.stats.hostingLanguages.length}</dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button href="/anfrage" variant="gold" size="lg">
              {tCta('primary')}
            </Button>
            <Button href={site.contact.phoneHref} variant="ghost" size="lg">
              {tCta('call')}
            </Button>
          </div>
          <p className="mt-4 text-sm text-ink-faint">{t('hero.ctaNote')}</p>
        </Reveal>
      </Container>
    </Section>
  );
}
