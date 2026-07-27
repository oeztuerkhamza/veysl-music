import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

export type SectionTone = 'paper' | 'raised' | 'night';
export type SectionSize = 'default' | 'tight' | 'tall';

export interface SectionProps extends ComponentPropsWithoutRef<'section'> {
  /**
   * `paper` — the ivory ground, the default voice of the page.
   * `raised` — a slightly warmer plane, for sections that should feel inset.
   * `night` — a deliberate dark interlude (dancefloor, after-hours, closing
   *   call to action). Applies `.band-night`, which re-declares the colour
   *   tokens on this subtree, so children keep using `text-ink` / `border-line`
   *   and simply come out dark. See globals.css.
   */
  tone?: SectionTone;
  size?: SectionSize;
}

const toneStyles: Record<SectionTone, string> = {
  paper: '',
  raised: 'bg-surface-2',
  night: 'band-night',
};

/**
 * Vertical rhythm for editorial page sections. The three sizes exist so that
 * consecutive sections do not all breathe identically — a page where every
 * block has the same height and the same padding reads as generated, however
 * good each individual block is.
 */
const sizeStyles: Record<SectionSize, string> = {
  tight: 'py-14 sm:py-16',
  default: 'py-20 sm:py-28 lg:py-32',
  tall: 'py-28 sm:py-36 lg:py-44',
};

export function Section({
  id,
  tone = 'paper',
  size = 'default',
  className,
  children,
  ...rest
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn('relative', sizeStyles[size], toneStyles[tone], className)}
      {...rest}
    >
      {children}
    </section>
  );
}
