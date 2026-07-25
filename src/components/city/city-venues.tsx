import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Card } from '@/components/ui/card';
import { Reveal } from '@/components/motion/reveal';
import { resolveLocalized, type City } from '@/content/cities';
import type { Locale } from '@/i18n/routing';

export function CityVenues({ city, locale }: { city: City; locale: Locale }) {
  const t = useTranslations('city');
  const tKind = useTranslations('city.venueKind');

  return (
    <Section id="locations">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={t('venues.eyebrow')} title={t('venues.title', { city: city.name })} />
        </Reveal>

        {city.venues.length > 0 ? (
          <>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {city.venues.map((venue) => {
                const note = resolveLocalized(venue.note, locale);
                return (
                  <Reveal key={venue.name}>
                    <Card>
                      <p className="text-xs uppercase tracking-[0.2em] text-gold">{tKind(venue.kind)}</p>
                      <p className="mt-2 font-display text-xl text-ink">{venue.name}</p>
                      {note ? <p className="mt-2 text-sm leading-relaxed text-ink-muted">{note}</p> : null}
                    </Card>
                  </Reveal>
                );
              })}
            </div>
            {/* Neutral by design — never implies a partnership with, or prior gigs
                at, these venues. See BRAND-FACTS.md "venue partners... do NOT invent". */}
            <p className="mt-6 max-w-2xl text-sm text-ink-faint">{t('venues.note')}</p>
          </>
        ) : (
          <p className="mt-8 max-w-2xl text-ink-muted">{t('venues.empty', { city: city.name })}</p>
        )}
      </Container>
    </Section>
  );
}
