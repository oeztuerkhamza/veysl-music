'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Music2, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Mix } from '@/content/mixes';
import { useAudio } from './audio-provider';
import { formatTime } from './format-time';

const EXTERNAL_PLATFORMS = [
  { key: 'spotify', label: 'Spotify' },
  { key: 'soundcloud', label: 'SoundCloud' },
  { key: 'mixcloud', label: 'Mixcloud' },
  { key: 'youtube', label: 'YouTube' },
] as const;

interface TrackCardProps {
  mix: Mix;
  /** Playback queue to hand to play() — typically the (filtered) list this card renders in. */
  queue?: Mix[];
  /** 'compact' is used inside the player's own queue panel; 'default' on the music page. */
  variant?: 'default' | 'compact';
  className?: string;
}

export function TrackCard({ mix, queue, variant = 'default', className }: TrackCardProps) {
  const { current, isPlaying, play, toggle } = useAudio();
  const t = useTranslations('music.player');
  const tMoments = useTranslations('music.moments');
  const tGenres = useTranslations('music.genres');

  const isCurrent = current?.id === mix.id;
  const isThisPlaying = isCurrent && isPlaying;
  const disabled = !mix.src;

  const handlePlay = () => {
    if (disabled) return;
    if (isCurrent) {
      toggle();
    } else {
      play(mix, queue);
    }
  };

  const label = disabled ? t('comingSoon') : isThisPlaying ? t('pauseTrack', { title: mix.title }) : t('playTrack', { title: mix.title });

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handlePlay}
        disabled={disabled}
        aria-current={isCurrent ? 'true' : undefined}
        aria-label={label}
        className={cn(
          'flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-start transition-colors',
          'hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
          isCurrent && 'bg-surface-2',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        <span aria-hidden="true" className="text-gold">
          {isThisPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm text-ink">{mix.title}</span>
        {isCurrent && <span className="shrink-0 text-xs uppercase tracking-[0.15em] text-gold">{t('nowPlaying')}</span>}
      </button>
    );
  }

  const externalLinks = mix.external
    ? EXTERNAL_PLATFORMS.filter(({ key }) => Boolean(mix.external?.[key]))
    : [];

  return (
    <article
      className={cn(
        'flex flex-col gap-4 rounded-lg border border-line bg-surface p-5 transition-colors',
        isCurrent && 'border-gold/60',
        className
      )}
    >
      <div className="flex items-center gap-4">
        {mix.coverSrc ? (
          <Image src={mix.coverSrc} alt="" width={64} height={64} className="h-16 w-16 shrink-0 rounded-md object-cover" />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-surface-2" aria-hidden="true">
            <Music2 className="h-6 w-6 text-ink-faint" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg text-ink">{mix.title}</p>
          <p className="text-xs uppercase tracking-[0.15em] text-gold">{tMoments(mix.moment)}</p>
        </div>

        <button
          type="button"
          onClick={handlePlay}
          disabled={disabled}
          aria-label={label}
          aria-current={isCurrent ? 'true' : undefined}
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold text-gold transition-colors',
            'hover:bg-gold hover:text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
            disabled && 'cursor-not-allowed opacity-40 hover:bg-transparent hover:text-gold'
          )}
        >
          {isThisPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
        {mix.genres.map((genre) => (
          <span key={genre} className="rounded-full border border-line px-2 py-0.5">
            {tGenres(genre)}
          </span>
        ))}
        {mix.durationSec != null && <span className="tabular-nums">{formatTime(mix.durationSec)}</span>}
        {mix.bpm != null && <span className="tabular-nums">{mix.bpm} BPM</span>}
        {disabled && <span className="text-ink-faint">{t('comingSoon')}</span>}
      </div>

      {externalLinks.length > 0 && (
        <div className="flex flex-wrap gap-3 border-t border-line pt-3 text-xs text-ink-muted">
          {externalLinks.map(({ key, label: platformLabel }) => (
            <a
              key={key}
              href={mix.external?.[key]}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('listenOn', { platform: platformLabel })}
              className="underline decoration-line underline-offset-4 transition-colors hover:text-gold"
            >
              {platformLabel}
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
