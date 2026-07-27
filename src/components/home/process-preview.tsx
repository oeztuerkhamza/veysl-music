import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';

const STEP_KEYS = ['one', 'two', 'three', 'four'] as const;

/**
 * Four steps as a drawn timeline rather than four equal columns: a hairline
 * runs through the numerals and connects them, so the block reads as a
 * sequence — which is what the content actually is — instead of as another
 * card row. The rule is drawn per item and clipped at the ends, so it stays
 * correct when the grid wraps to one column on small screens.
 */
export async function ProcessPreview() {
  const t = await getTranslations('home.process');
  const tSteps = await getTranslations('process.steps');

  return (
    <Section id="ablauf" tone="raised">
      <Container>
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} />

        <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {STEP_KEYS.map((key, index) => (
            <Reveal key={key} as="li" y={20} delay={index * 0.07} className="block">
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-6 hidden h-px w-full bg-line lg:block"
                />
                <span className="relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-full border border-line bg-bg font-display text-xl text-clay tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="mt-6 font-display text-xl text-ink">{tSteps(`${key}.title`)}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{tSteps(`${key}.text`)}</p>
            </Reveal>
          ))}
        </ol>

        <div className="mt-12">
          <Button href="/ablauf" variant="secondary" size="md">
            {t('cta')}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
