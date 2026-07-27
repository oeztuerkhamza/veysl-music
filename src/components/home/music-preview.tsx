import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { ParticleDrift } from '@/components/motion/particle-drift';
import { mixes, type MixMoment } from '@/content/mixes';

/** Hand-picked to show range: live instrumentation, cultural specialty, ambient dinner. */
const FEATURED_MIX_IDS = ['empfang-akustik-saz', 'peaktime-halay-arabesk', 'dinner-lounge-mix'] as const;

const MOMENT_LABEL_KEYS: Partial<Record<MixMoment, string>> = {
  reception: 'reception',
  dinner: 'dinner',
  peaktime: 'peaktime',
};

/**
 * The night interlude. This is the one place on the page where the evening
 * itself shows up: the ground drops to warm near-black, the stage haze drifts,
 * and the set titles are set large as a running order rather than as cards.
 *
 * Structurally it is the counterweight the old homepage lacked — eleven
 * sections on the same ground at the same height is what made the site read as
 * generated, however good the individual copy was.
 *
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
    <Section id="musik" tone="night" size="tall" className="overflow-hidden">
      {/* Stage light pooling up from the floor, behind the haze. */}
      <div
        className="pointer-events-none absolute inset-0 opacity-45 bg-[radial-gradient(ellipse_60%_50%_at_50%_115%,var(--color-glow),transparent_65%)]"
        aria-hidden="true"
      />
      <ParticleDrift />

      <Container className="relative z-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal y={18}>
              <Eyebrow>{t('eyebrow')}</Eyebrow>
              <h2 className="text-display-2 mt-5 font-medium text-ink">{t('title')}</h2>
              <p className="mt-6 max-w-md leading-relaxed text-ink-muted">{t('subtitle')}</p>
              <div className="mt-9">
                <Button href="/musik" variant="gold" size="md">
                  {t('cta')}
                </Button>
              </div>
            </Reveal>
          </div>

          {/* Running order, not a card grid — the set titles carry it. */}
          <ol className="lg:col-span-7">
            {featured.map((mix, index) => {
              const momentKey = MOMENT_LABEL_KEYS[mix.moment];
              return (
                <Reveal
                  key={mix.id}
                  as="li"
                  y={18}
                  delay={index * 0.06}
                  className="block border-t border-line last:border-b"
                >
                  <div className="flex items-baseline gap-6 py-7 sm:gap-10 sm:py-9">
                    <span className="text-label text-gold tabular-nums" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      {momentKey ? (
                        <span className="text-label block text-ink-faint">{tMoments(momentKey)}</span>
                      ) : null}
                      {/* Artist's own set title — never translated, per @/content/mixes. */}
                      <h3 className="text-display-3 mt-2.5 text-ink">{mix.title}</h3>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
