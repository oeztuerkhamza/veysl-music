import { getTranslations } from 'next-intl/server';
import { MessagesSquare, AudioLines, FileSignature, Languages } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { Reveal } from '@/components/motion/reveal';

const ICONS = {
  planning: MessagesSquare,
  tech: AudioLines,
  contract: FileSignature,
  multilingual: Languages,
} as const;

const KEYS = ['planning', 'tech', 'contract', 'multilingual'] as const;

/**
 * `home.trust` has no eyebrow key (unlike the other preview sections), so this
 * hand-rolls its own heading instead of going through `<SectionHeading>`.
 */
export async function TrustStrip() {
  const t = await getTranslations('home.trust');

  return (
    <Section id="vertrauen">
      <Container>
        <h2 className="max-w-2xl font-display text-3xl text-ink sm:text-4xl">{t('title')}</h2>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {KEYS.map((key) => {
            const Icon = ICONS[key];
            return (
              <Reveal key={key}>
                <Card className="h-full p-6">
                  <Icon className="h-6 w-6 text-gold" aria-hidden="true" />
                  <h3 className="mt-4 font-display text-xl text-ink">{t(`items.${key}.title`)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t(`items.${key}.text`)}</p>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
