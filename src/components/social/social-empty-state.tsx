import type { ComponentType } from 'react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import type { SocialIconProps } from '@/components/ui/social-icons';

interface SocialEmptyStateProps {
  icon: ComponentType<SocialIconProps>;
  title: string;
  text: string;
  ctaLabel: string;
  /** Always an external profile URL — Button already handles external hrefs (new tab, rel=noopener). */
  ctaHref: string;
}

/**
 * Local twin of `@/components/pages/empty-state.tsx` (same editorial
 * gold-hairline treatment, per BRAND-FACTS.md's "degrade to a designed empty
 * state, never a weak/broken one" rule) — not reused directly because that
 * component's `ctaHref` is typed to internal routes only, and this one
 * always links out to an external social profile instead.
 */
export function SocialEmptyState({ icon: Icon, title, text, ctaLabel, ctaHref }: SocialEmptyStateProps) {
  return (
    <Reveal>
      <div className="relative overflow-hidden rounded-lg border border-line bg-gradient-to-b from-surface to-surface-2 px-8 py-16 text-center sm:py-20">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent"
        />
        <div
          aria-hidden="true"
          className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 text-gold"
        >
          <Icon className="h-6 w-6" />
        </div>
        <p className="mx-auto max-w-md text-balance font-display text-xl leading-relaxed text-ink sm:text-2xl">
          {title}
        </p>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">{text}</p>
        <div className="mt-8 flex justify-center">
          <Button href={ctaHref} variant="secondary" size="md">
            {ctaLabel}
          </Button>
        </div>
      </div>
    </Reveal>
  );
}
