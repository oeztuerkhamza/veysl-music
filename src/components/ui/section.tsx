import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

export type SectionProps = ComponentPropsWithoutRef<'section'>;

/** Consistent, generous vertical rhythm for editorial page sections. */
export function Section({ id, className, children, ...rest }: SectionProps) {
  return (
    <section id={id} className={cn('py-20 sm:py-28 lg:py-32', className)} {...rest}>
      {children}
    </section>
  );
}
