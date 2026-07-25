import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Card } from '@/components/ui/card';
import { Reveal } from '@/components/motion/reveal';
import type { City } from '@/content/cities';

const TRUST_KEYS = ['planning', 'tech', 'contract', 'multilingual'] as const;

/** Same trust signals as the homepage (brief's explicit instruction) — reuses `home.trust.*` verbatim rather than forking a city-specific copy. */
export function CityTrust({ city }: { city: City }) {
  const t = useTranslations('city');
  const tTrust = useTranslations('home.trust.items');

  return (
    <Section>
      <Container>
        <Reveal>
          <SectionHeading eyebrow={t('trust.eyebrow')} title={t('trust.title', { city: city.name })} />
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {TRUST_KEYS.map((key) => (
            <Reveal key={key}>
              <Card>
                <p className="font-display text-lg text-ink">{tTrust(`${key}.title`)}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{tTrust(`${key}.text`)}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
