import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

export type ContainerSize = 'default' | 'narrow' | 'wide';

export interface ContainerProps extends ComponentPropsWithoutRef<'div'> {
  size?: ContainerSize;
}

const sizeStyles: Record<ContainerSize, string> = {
  default: 'max-w-6xl',
  narrow: 'max-w-3xl',
  wide: 'max-w-[90rem]',
};

export function Container({ size = 'default', className, children, ...rest }: ContainerProps) {
  return (
    <div className={cn('mx-auto w-full px-6 sm:px-8 lg:px-12', sizeStyles[size], className)} {...rest}>
      {children}
    </div>
  );
}
