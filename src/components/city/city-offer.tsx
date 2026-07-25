import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Card } from '@/components/ui/card';
import { Reveal } from '@/components/motion/reveal';
import type { City } from '@/content/cities';

/**
 * Leads with the live-orchestra differentiator (coordinator's instruction —
 * this is the hardest-to-copy advantage vs. solo-DJ competitors), then the
 * rest of `site.capabilities`. Reuses `booking.services.*` labels (already
 * translated in de/tr/en) rather than duplicating them under `city.*`.
 */
export function CityOffer({ city }: { city: City }) {
  const t = useTranslations('city');
  const tServices = useTranslations('booking.services');

  const items = [
    t('offer.orchestraLabel'),
    tServices('dj'),
    tServices('hosting'),
    tServices('liveMusic'),
    tServices('avRental'),
  ];

  return (
    <Section>
      <Container>
        <Reveal>
          <SectionHeading eyebrow={t('offer.eyebrow')} title={t('offer.title', { city: city.name })} />
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((label) => (
            <Reveal key={label}>
              <Card className="flex h-full items-center">
                <p className="font-display text-lg text-ink">{label}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
