'use client';

import { useMemo, useState } from 'react';
import { Images } from 'lucide-react';
import type { GalleryItem, GalleryMediaType } from '@/content/gallery';
import { cn } from '@/lib/utils';
import { GalleryGrid } from './gallery-grid';
import { EmptyState } from './empty-state';

type Filter = 'all' | GalleryMediaType;

interface GalleryExplorerProps {
  items: GalleryItem[];
  labels: {
    all: string;
    photo: string;
    video: string;
    empty: string;
    playLabel: string;
    ctaLabel: string;
  };
}

/**
 * Filter shell + grid in one. `items` is empty right now (see
 * src/content/gallery.ts) so this renders the designed empty state; once
 * real photos/video land, the exact same component starts filtering without
 * any changes here.
 */
export function GalleryExplorer({ items, labels }: GalleryExplorerProps) {
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(
    () => (filter === 'all' ? items : items.filter((item) => item.type === filter)),
    [items, filter]
  );

  if (items.length === 0) {
    return <EmptyState message={labels.empty} icon={Images} ctaLabel={labels.ctaLabel} ctaHref="/anfrage" />;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-2">
        {(['all', 'photo', 'video'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
            className={cn(
              'rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
              filter === key ? 'border-gold bg-gold text-bg' : 'border-line text-ink-muted hover:border-gold hover:text-gold'
            )}
          >
            {key === 'all' ? labels.all : key === 'photo' ? labels.photo : labels.video}
          </button>
        ))}
      </div>
      <GalleryGrid items={filtered} playLabel={labels.playLabel} />
    </div>
  );
}
