'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { Mix, MixGenre, MixMoment } from '@/content/mixes';
import { TrackCard } from './track-card';

interface TrackListProps {
  /** Full catalogue — filtering happens inside based on the props below. */
  mixes: Mix[];
  /** Active moment filter, owned/controlled by the page. 'all' (default) shows every moment. */
  moment?: MixMoment | 'all';
  /** Active genre filter, owned/controlled by the page. 'all' (default) shows every genre. */
  genre?: MixGenre | 'all';
  className?: string;
}

/** Dumb, filterable grid of mixes — the music page owns the filter UI/state
 *  and just passes the current selection down as props. */
export function TrackList({ mixes, moment = 'all', genre = 'all', className }: TrackListProps) {
  const t = useTranslations('music');

  const filtered = useMemo(
    () =>
      mixes.filter((mix) => {
        const momentMatch = moment === 'all' || mix.moment === moment;
        const genreMatch = genre === 'all' || mix.genres.includes(genre);
        return momentMatch && genreMatch;
      }),
    [mixes, moment, genre]
  );

  if (filtered.length === 0) {
    return <p className="text-sm text-ink-muted">{t('empty')}</p>;
  }

  return (
    <div className={className ?? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'}>
      {filtered.map((mix) => (
        <TrackCard key={mix.id} mix={mix} queue={filtered} />
      ))}
    </div>
  );
}
