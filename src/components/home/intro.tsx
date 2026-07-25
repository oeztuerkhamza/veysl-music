import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Reveal } from '@/components/motion/reveal';
import { site } from '@/content/site';

/**
 * Entity-clarity paragraph for search crawlers and AI/GEO answer engines: states
 * plainly who Veysel is, what he does, where, and in which languages — as real
 * server-rendered prose directly beneath the hero, not hidden behind any client-only
 * rendering.
 */
export async function Intro() {
  const t = await getTranslations('home');

  return (
    <Section>
      <Container>
        <Reveal>
          <p className="mx-auto max-w-3xl text-center font-display text-xl leading-relaxed text-ink sm:text-2xl">
            {t('intro', {
              name: site.owner,
              city: site.city,
              years: site.stats.yearsExperience,
            })}
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}
