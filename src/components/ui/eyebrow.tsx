import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

export type EyebrowProps = ComponentPropsWithoutRef<'p'>;

/** Gold, uppercase, letter-tracked label used above section headings. */
export function Eyebrow({ className, children, ...rest }: EyebrowProps) {
  return (
    <p
      className={cn('text-xs font-sans font-semibold uppercase tracking-[0.2em] text-gold', className)}
      {...rest}
    >
      {children}
    </p>
  );
}
