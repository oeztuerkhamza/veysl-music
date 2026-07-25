import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Eyebrow } from './eyebrow';

export interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
}

const sizeByLevel: Record<NonNullable<SectionHeadingProps['as']>, string> = {
  h1: 'text-display-1',
  h2: 'text-display-2',
  h3: 'text-display-3',
};

export function SectionHeading({ eyebrow, title, lead, align = 'left', as = 'h2', className }: SectionHeadingProps) {
  const Heading = as;

  return (
    <div className={cn('flex flex-col gap-4', align === 'center' && 'items-center text-center', className)}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Heading className={cn('font-display font-medium text-ink', sizeByLevel[as])}>{title}</Heading>
      {lead ? <p className="max-w-2xl text-lg leading-relaxed text-ink-muted">{lead}</p> : null}
    </div>
  );
}
