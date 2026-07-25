import { getTranslations } from 'next-intl/server';
import { Music2 } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { mixes, type MixMoment } from '@/content/mixes';

/** Hand-picked to show range: live instrumentation, cultural specialty, ambient dinner. */
const FEATURED_MIX_IDS = ['empfang-akustik-saz', 'peaktime-halay-arabesk', 'dinner-lounge-mix'] as const;

const MOMENT_LABEL_KEYS: Partial<Record<MixMoment, string>> = {
  reception: 'reception',
  dinner: 'dinner',
  peaktime: 'peaktime',
};

/**
 * Teases real set titles from `@/content/mixes` as plain text — no player here,
 * that is the audio agent's domain. Just enough real content to earn the click
 * through to `/musik`.
 */
export async function MusicPreview() {
  const t = await getTranslations('home.music');
  const tMoments = await getTranslations('home.music.moments');

  const featured = FEATURED_MIX_IDS.map((id) => mixes.find((mix) => mix.id === id)).filter(
    (mix): mix is NonNullable<typeof mix> => mix !== undefined,
  );

  return (
    <Section id="musik" className="bg-surface">
      <Container>
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} lead={t('subtitle')} />

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {featured.map((mix) => {
            const momentKey = MOMENT_LABEL_KEYS[mix.moment];
            return (
              <Reveal key={mix.id}>
                <Card className="flex h-full flex-col gap-3 p-6">
                  <Music2 className="h-5 w-5 text-gold" aria-hidden="true" />
                  {momentKey && (
                    <span className="text-xs uppercase tracking-[0.15em] text-gold">
                      {tMoments(momentKey)}
                    </span>
                  )}
                  {/* Artist's own set title — never translated, per @/content/mixes. */}
                  <h3 className="font-display text-xl text-ink">{mix.title}</h3>
                </Card>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-10">
          <Button href="/musik" variant="secondary" size="md">
            {t('cta')}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
