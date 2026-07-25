import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { site } from '@/content/site';
import { resolveLocalized, type City } from '@/content/cities';
import type { Locale } from '@/i18n/routing';
import { CityBreadcrumbs } from './city-breadcrumbs';

export function CityHero({ city, locale }: { city: City; locale: Locale }) {
  const t = useTranslations('city');
  const tCta = useTranslations('cta');
  const tStats = useTranslations('home.stats');

  // Guaranteed to exist for every locale this page is ever rendered for
  // (see `getReadyLocalesForCity`) — the `??` is a type-safety fallback
  // only, never a "German prose on a non-German page" fallback in practice.
  const intro = resolveLocalized(city.intro, locale) ?? city.intro.de;

  return (
    <Section>
      <Container>
        {/* Rendered inside this Section (not as a standalone top-of-page nav)
            so it shares the same top clearance under the fixed, transparent
            header as the H1 below it — see CityBreadcrumbs' own doc comment. */}
        <CityBreadcrumbs city={city} />
        <Reveal>
          <SectionHeading
            as="h1"
            className="mt-6 max-w-3xl"
            eyebrow={t('eyebrow')}
            title={t('hero.title', { city: city.name })}
            lead={intro}
          />

          {/* Leads with the real differentiators (coordinator's instruction) right
              under the fold: 200+ events and trilingual hosting are brand-wide facts
              from site.stats, not city-specific prose — repeating them verbatim on
              every city page is the same category as the shared trust section. */}
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
