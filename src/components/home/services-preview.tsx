import { getTranslations } from 'next-intl/server';
import { Heart, Gem, PartyPopper, Building2 } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';

const ICONS = {
  wedding: Heart,
  engagement: Gem,
  afterparty: PartyPopper,
  corporate: Building2,
} as const;

const KEYS = ['wedding', 'engagement', 'afterparty', 'corporate'] as const;

/**
 * Renders the full `text` description (not just the tagline) for each service —
 * real, crawlable prose in the initial HTML, since thin hero-plus-cards homepages
 * lose on "Hochzeits-DJ Stuttgart"-type searches.
 */
export async function ServicesPreview() {
  const t = await getTranslations('home.services');
  const tItems = await getTranslations('services.items');

  return (
    <Section id="leistungen">
      <Container>
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} lead={t('subtitle')} />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {KEYS.map((key) => {
            const Icon = ICONS[key];
            return (
              <Reveal key={key}>
                <Card className="flex h-full flex-col p-6">
                  <Icon className="h-7 w-7 text-gold" aria-hidden="true" />
                  <h3 className="mt-5 font-display text-2xl text-ink">{tItems(`${key}.title`)}</h3>
                  <p className="mt-1 text-sm uppercase tracking-[0.1em] text-gold">
                    {tItems(`${key}.tagline`)}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                    {tItems(`${key}.text`)}
                  </p>
                </Card>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-10">
          <Button href="/hochzeit-events" variant="secondary" size="md">
            {t('cta')}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
