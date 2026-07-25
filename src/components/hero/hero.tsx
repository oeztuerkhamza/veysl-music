import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { site } from '@/content/site';
import { HeroAftermovie } from './hero-aftermovie';
import { HeroScene } from './hero-scene';
import { ScrollCue } from './scroll-cue';

/**
 * Cinematic full-viewport opener. The headline is the LCP element — real text
 * painted straight from the server. Every layer beneath it (gradient, optional
 * video, WebGL) is purely decorative and never blocks or shifts that text.
 *
 * No photography is used here by design: the client's only existing photos are
 * an empty-room DJ-booth shot and an unlicensed stock image, neither suitable
 * for a premium wedding hero. This relies entirely on typography, gold accents
 * and motion until real event photography exists.
 */
export async function Hero() {
  const t = await getTranslations('home.hero');
  const tCta = await getTranslations('cta');
  const tCommon = await getTranslations('common');

  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden bg-bg">
      {/* Guaranteed fallback — a token-based gradient that renders with zero JS. */}
      <div className="absolute inset-0 bg-bg" aria-hidden="true" />
      <div
        className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_50%_10%,var(--color-gold-deep),transparent_55%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-surface-2/30 to-bg"
        aria-hidden="true"
      />

      {/* TODO(kunde): pass `src`/`poster` once the real aftermovie file exists — no refactor needed here. */}
      <HeroAftermovie />

      {/* WebGL particle drift — gated client-side, skipped entirely under reduced motion / low-power devices. */}
      <HeroScene />

      {/* Scrim so the headline stays legible over the video/canvas layers. */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent"
        aria-hidden="true"
      />

      <Container className="relative z-10 pb-24 pt-40 sm:pb-32">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">{t('eyebrow')}</p>

        <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.75rem,6vw,5.5rem)] leading-[1.05] text-ink">
          {t('title')} <span className="text-gold">{t('titleAccent')}</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted sm:text-xl">
          {t('subtitle')}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button href="/anfrage" variant="gold" size="lg">
            {tCta('primary')}
          </Button>
          <Button href="/musik" variant="secondary" size="lg">
            {tCta('listen')}
          </Button>
        </div>

        <p className="mt-8 text-sm text-ink-muted">
          {t('availability', { year: site.season.year })}
        </p>
      </Container>

      <ScrollCue label={tCommon('scroll')} />
    </section>
  );
}
