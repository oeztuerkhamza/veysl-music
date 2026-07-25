import { getTranslations } from 'next-intl/server';
import { Check } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { cn } from '@/lib/utils';

const TIERS = ['essential', 'signature', 'prestige'] as const;

/**
 * Renders every feature line per tier (not a truncated preview) — real, crawlable
 * text in the initial HTML rather than content hidden behind a tab or accordion.
 */
export async function PackagesPreview() {
  const t = await getTranslations('home.packages');
  const tItems = await getTranslations('packages.items');
  const tCommon = await getTranslations('common');

  return (
    <Section id="pakete">
      <Container>
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} lead={t('subtitle')} />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {TIERS.map((tier) => {
            const isSignature = tier === 'signature';
            const features = tItems.raw(`${tier}.features`) as string[];

            return (
              <Reveal key={tier}>
                <Card
                  className={cn('flex h-full flex-col p-8', isSignature && 'border-gold ring-1 ring-gold')}
                >
                  {isSignature && (
                    <span className="mb-4 inline-flex w-fit items-center rounded-full bg-gold/10 px-3 py-1 text-xs uppercase tracking-[0.15em] text-gold">
                      {tCommon('mostBooked')}
                    </span>
                  )}

                  <h3 className="font-display text-2xl text-ink">{tItems(`${tier}.name`)}</h3>
                  <p className="mt-1 text-sm uppercase tracking-[0.1em] text-gold">
                    {tItems(`${tier}.tagline`)}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                    {tItems(`${tier}.description`)}
                  </p>

                  <ul className="mt-6 space-y-3">
                    {features.map((feature, index) => (
                      <li key={`${tier}-${index}`} className="flex items-start gap-2 text-sm text-ink-muted">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-8 font-display text-xl text-ink">{tCommon('onRequest')}</p>

                  <Button
                    href="/pakete"
                    variant={isSignature ? 'gold' : 'secondary'}
                    size="md"
                    className="mt-6"
                  >
                    {tCommon('readMore')}
                  </Button>
                </Card>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Button href="/pakete" variant="ghost" size="md">
            {t('cta')}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
