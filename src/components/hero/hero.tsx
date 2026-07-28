import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Reveal } from '@/components/motion/reveal';
import { site } from '@/content/site';
import { HeroAftermovie } from './hero-aftermovie';
import { HeroBackdrop } from './hero-backdrop';
import { ScrollCue } from './scroll-cue';

/**
 * Editorial opener on warm paper. The headline is the LCP element — real text
 * painted straight from the server; every layer beneath it (candle glow,
 * optional video) is decorative and never blocks or shifts it.
 *
 * No photography by design: the only existing photos are an empty-room DJ-booth
 * shot and an unlicensed stock image, neither usable for a wedding hero. What
 * carries the page instead is the thing an empty hero usually lacks — a second
 * column of *verified* facts (`site.stats`), set as editorial marginalia. It
 * gives the composition asymmetry and density, and it is all provable.
 *
 * The WebGL particle drift that used to live here has moved to <MusicBand>:
 * it renders with additive blending, which is invisible on an ivory ground, so
 * on this hero it was pure cost. In the night band it actually reads.
 */
export async function Hero() {
  const t = await getTranslations('home.hero');
  const tStats = await getTranslations('home.stats');
  const tCta = await getTranslations('cta');
  const tCommon = await getTranslations('common');

  const facts = [
    { value: `${site.stats.yearsExperience}+`, label: tStats('years') },
    { value: `${site.stats.eventsCompleted}+`, label: tStats('events') },
    {
      value: site.stats.hostingLanguages.map((lang) => lang.toUpperCase()).join(' · '),
      label: tStats('languagesLabel'),
    },
  ];

  return (
    <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-bg">
      {/* Nothing until a photo is assigned to `home.hero.background` — see HeroBackdrop. */}
      <HeroBackdrop />
      {/* Candle glow — warm light pooling in from the upper right, so the
          composition has a light source instead of a flat gradient wash. */}
      <div
        className="absolute inset-0 opacity-70 bg-[radial-gradient(ellipse_70%_55%_at_78%_12%,var(--color-glow),transparent_62%)]"
        aria-hidden="true"
      />
      {/* Second, tighter pool low on the left — two sources read as lit, one reads as a filter. */}
      <div
        className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_45%_40%_at_8%_88%,var(--color-glow),transparent_65%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-bg"
        aria-hidden="true"
      />

      {/* TODO(kunde): pass `src`/`poster` once the real aftermovie file exists — no refactor needed here. */}
      <HeroAftermovie />

      <Container size="wide" className="relative z-10 pb-24 pt-40 sm:pb-32">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-8">
            <Reveal y={16}>
              <p className="text-label text-clay">{t('eyebrow')}</p>
            </Reveal>

            <Reveal delay={0.08} y={20}>
              {/* One <h1> per page (CONTRACT §3). The accent clause is set in
                  Cormorant italic rather than a second font — same hand-made
                  warmth, no extra request, no wedding-clipart risk. */}
              <h1 className="text-display-1 mt-7 max-w-[16ch] font-medium text-ink">
                {t('title')} <span className="accent-phrase">{t('titleAccent')}</span>
              </h1>
            </Reveal>

            <Reveal delay={0.16} y={20}>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-muted">{t('subtitle')}</p>
            </Reveal>

            <Reveal delay={0.24} y={20}>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button href="/anfrage" variant="clay" size="lg">
                  {tCta('primary')}
                </Button>
                <Button href="/musik" variant="secondary" size="lg">
                  {tCta('listen')}
                </Button>
              </div>
            </Reveal>

            <Reveal delay={0.32} y={16}>
              <p className="mt-8 flex items-center gap-3 text-sm text-ink-faint">
                <span aria-hidden="true" className="h-px w-8 bg-clay/50" />
                {t('availability', { year: site.season.year })}
              </p>
            </Reveal>
          </div>

          {/* Editorial marginalia. On large screens it hangs off the right of
              the headline block and gives the hero its asymmetry; below `lg`
              it becomes a horizontal rail rather than disappearing. */}
          <Reveal delay={0.4} y={24} className="lg:col-span-4 lg:self-end">
            <dl className="flex gap-8 border-t border-line pt-6 sm:gap-12 lg:flex-col lg:gap-7 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              {/* `dt` before `dd` in the DOM, reversed visually with
                  flex-col-reverse. HTML requires the term to precede its
                  definition; emitting the number first would have screen
                  readers announce the definition before the term it belongs
                  to. The visual order — figure large, label beneath — is a
                  layout concern and belongs in CSS, not in the markup. */}
              {facts.map((fact) => (
                <div key={fact.label} className="flex flex-col-reverse">
                  <dt className="text-label mt-2.5 max-w-[18ch] leading-[1.5] text-ink-faint">
                    {fact.label}
                  </dt>
                  <dd className="font-display text-3xl font-medium leading-none text-gold sm:text-4xl">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </Container>

      <ScrollCue label={tCommon('scroll')} />
    </section>
  );
}
