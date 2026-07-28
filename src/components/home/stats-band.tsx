import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { Reveal } from '@/components/motion/reveal';
import { site } from '@/content/site';

const STAT_KEYS = ['years', 'events', 'languages'] as const;

/**
 * Compact proof band between the trust strip and the services preview — verified
 * numbers from `site.stats`, not generic claims. Deliberately not wrapped in the
 * shared `<Section>` primitive: this is meant to read as a slim divider band, not
 * a full-height section.
 */
export async function StatsBand() {
  const t = await getTranslations('home.stats');

  const values: Record<(typeof STAT_KEYS)[number], string> = {
    years: `${site.stats.yearsExperience}+`,
    events: `${site.stats.eventsCompleted}+`,
    languages: site.stats.hostingLanguages.map((lang) => lang.toUpperCase()).join(' · '),
  };

  const labels: Record<(typeof STAT_KEYS)[number], string> = {
    years: t('years'),
    events: t('events'),
    languages: t('languagesLabel'),
  };

  return (
    <section id="fakten" className="border-y border-line bg-surface py-10">
      <Container>
        <Reveal>
          <dl className="grid gap-8 text-center sm:grid-cols-3">
            {/* `dt` before `dd`, reversed visually — HTML requires the term to
                precede its definition. See the same note in hero.tsx. */}
            {STAT_KEYS.map((key) => (
              <div key={key} className="flex flex-col-reverse items-center">
                <dt className="mt-2 text-sm uppercase tracking-[0.1em] text-ink-muted">
                  {labels[key]}
                </dt>
                <dd className="font-display text-4xl text-gold sm:text-5xl">{values[key]}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </section>
  );
}
