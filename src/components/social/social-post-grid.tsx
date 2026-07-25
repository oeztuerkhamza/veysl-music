import type { ComponentType } from 'react';
import { Reveal } from '@/components/motion/reveal';
import type { SocialIconProps } from '@/components/ui/social-icons';
import type { SocialPost } from '@/lib/social/types';
import { SocialEmptyState } from './social-empty-state';
import { SocialPostCard, type SocialCardLabels } from './social-post-card';

interface SocialPostGridProps {
  posts: SocialPost[];
  labels: SocialCardLabels;
  locale: string;
  columns?: 3 | 4 | 6;
  emptyIcon: ComponentType<SocialIconProps>;
  emptyTitle: string;
  emptyText: string;
  emptyCtaLabel: string;
  emptyCtaHref: string;
}

const COLUMN_CLASS: Record<NonNullable<SocialPostGridProps['columns']>, string> = {
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
};

/**
 * The bare responsive grid, no heading — shared by `<SocialGrid>` and the
 * two strips so the card markup exists in exactly one place. Zero layout
 * shift: every tile is a fixed `aspect-square` regardless of whether the
 * image has loaded yet.
 */
export function SocialPostGrid({
  posts,
  labels,
  locale,
  columns = 4,
  emptyIcon,
  emptyTitle,
  emptyText,
  emptyCtaLabel,
  emptyCtaHref,
}: SocialPostGridProps) {
  if (posts.length === 0) {
    return (
      <SocialEmptyState icon={emptyIcon} title={emptyTitle} text={emptyText} ctaLabel={emptyCtaLabel} ctaHref={emptyCtaHref} />
    );
  }

  return (
    <div className={`grid gap-4 ${COLUMN_CLASS[columns]}`}>
      {posts.map((post) => (
        <Reveal key={post.id}>
          <SocialPostCard post={post} labels={labels} locale={locale} />
        </Reveal>
      ))}
    </div>
  );
}
