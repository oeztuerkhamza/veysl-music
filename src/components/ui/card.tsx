import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

export type CardProps = ComponentPropsWithoutRef<'div'>;

/** Surface card with a hairline border and a gentle hover lift. */
export function Card({ className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-line bg-surface p-6 shadow-soft',
        'transition-[transform,box-shadow] duration-300 ease-out-expo',
        'hover:-translate-y-1 hover:shadow-lift',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
