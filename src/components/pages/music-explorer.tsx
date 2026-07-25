'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { TrackList } from '@/components/audio';
import type { Mix, MixGenre, MixMoment } from '@/content/mixes';
import { cn } from '@/lib/utils';

interface MusicExplorerProps {
  mixes: Mix[];
}

const MOMENTS: MixMoment[] = ['reception', 'dinner', 'firstdance', 'peaktime', 'afterhours'];
const GENRES: MixGenre[] = ['international', 'turkish', 'german', 'house', 'classics', 'live', 'arabesk', 'halay'];

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
        active ? 'border-gold bg-gold text-bg' : 'border-line text-ink-muted hover:border-gold hover:text-gold'
      )}
    >
      {children}
    </button>
  );
}

/**
 * Owns the moment/genre filter state and passes the current selection down
 * to the audio agent's `TrackList` (it deliberately stays "dumb" and takes
 * `moment`/`genre` as controlled props — see its own doc comment). Only
 * chips for values actually present in the catalogue are rendered.
 */
export function MusicExplorer({ mixes }: MusicExplorerProps) {
  const t = useTranslations('music');
  const tMoments = useTranslations('music.moments');
  const tGenres = useTranslations('music.genres');
  const [moment, setMoment] = useState<MixMoment | 'all'>('all');
  const [genre, setGenre] = useState<MixGenre | 'all'>('all');

  const availableMoments = useMemo(() => MOMENTS.filter((m) => mixes.some((mix) => mix.moment === m)), [mixes]);
  const availableGenres = useMemo(() => GENRES.filter((g) => mixes.some((mix) => mix.genres.includes(g))), [mixes]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <FilterChip active={moment === 'all'} onClick={() => setMoment('all')}>
            {t('filterAll')}
          </FilterChip>
          {availableMoments.map((m) => (
            <FilterChip key={m} active={moment === m} onClick={() => setMoment(m)}>
              {tMoments(m)}
            </FilterChip>
          ))}
        </div>
        {availableGenres.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            <FilterChip active={genre === 'all'} onClick={() => setGenre('all')}>
              {t('filterAll')}
            </FilterChip>
            {availableGenres.map((g) => (
              <FilterChip key={g} active={genre === g} onClick={() => setGenre(g)}>
                {tGenres(g)}
              </FilterChip>
            ))}
          </div>
        ) : null}
      </div>

      <TrackList mixes={mixes} moment={moment} genre={genre} />
    </div>
  );
}
