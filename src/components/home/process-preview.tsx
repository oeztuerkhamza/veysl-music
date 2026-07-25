import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';

const STEP_KEYS = ['one', 'two', 'three', 'four'] as const;

export async function ProcessPreview() {
  const t = await getTranslations('home.process');
  const tSteps = await getTranslations('process.steps');

  return (
    <Section id="ablauf" className="bg-surface">
      <Container>
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} />

        <ol className="mt-12 grid gap-8 lg:grid-cols-4">
          {STEP_KEYS.map((key, index) => (
            <Reveal key={key}>
              <li className="flex flex-col gap-3">
                <span className="font-display text-4xl text-gold">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-xl text-ink">{tSteps(`${key}.title`)}</h3>
                <p className="text-sm leading-relaxed text-ink-muted">{tSteps(`${key}.text`)}</p>
              </li>
            </Reveal>
          ))}
        </ol>

        <div className="mt-10">
          <Button href="/ablauf" variant="secondary" size="md">
            {t('cta')}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
