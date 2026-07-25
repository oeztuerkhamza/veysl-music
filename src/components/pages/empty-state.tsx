import type { LucideIcon } from 'lucide-react';
import { Sparkles } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  /** Already-translated message, e.g. t('empty') from the calling page's own namespace. */
  message: string;
  icon?: LucideIcon;
  ctaLabel?: string;
  ctaHref?: '/anfrage' | '/kontakt';
}

/**
 * Designed "nothing here yet" state — used while weddings/gallery/testimonial
 * content is still pending real client material. Deliberately editorial
 * (gold hairline, serif message, icon badge) rather than a grey placeholder
 * box: these panels are expected to stay live for a while, see
 * .claude/BRAND-FACTS.md.
 */
export function EmptyState({ message, icon: Icon = Sparkles, ctaLabel, ctaHref = '/anfrage' }: EmptyStateProps) {
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
          {message}
        </p>
        {ctaLabel ? (
          <div className="mt-8 flex justify-center">
            <Button href={ctaHref} variant="secondary" size="md">
              {ctaLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </Reveal>
  );
}
