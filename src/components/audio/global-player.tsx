'use client';

import { useId } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronUp, Music2, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAudio } from './audio-provider';
import { formatTime } from './format-time';
import { AudioReactive } from './audio-reactive';
import { TrackCard } from './track-card';

/**
 * The persistent bottom bar. Renders nothing until a track has been started —
 * no empty chrome on first paint. Mounted once via <AudioDock> above the page
 * tree, so it survives client-side route changes.
 */
export function GlobalPlayer() {
  const {
    current,
    queue,
    isPlaying,
    position,
    duration,
    volume,
    muted,
    expanded,
    toggle,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    close,
    setExpanded,
    toggleExpanded,
  } = useAudio();

  const t = useTranslations('music.player');
  const tMoments = useTranslations('music.moments');

  const progressId = useId();
  const panelId = useId();

  // Hooks above this line only — the early return must come after every hook.
  if (!current) return null;

  const disabled = !current.src;
  const progressPercent = duration > 0 ? Math.min(100, (position / duration) * 100) : 0;
  const playLabel = disabled
    ? t('comingSoon')
    : isPlaying
      ? t('pauseTrack', { title: current.title })
      : t('playTrack', { title: current.title });

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && expanded) {
      event.preventDefault();
      setExpanded(false);
      return;
    }
    const target = event.target as HTMLElement;
    const isFormControl = target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.getAttribute('role') === 'slider';
    if ((event.key === ' ' || event.code === 'Space') && !isFormControl) {
      event.preventDefault();
      toggle();
    }
  };

  const handleProgressKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        seek(Math.min(position + 5, duration || position + 5));
        break;
      case 'ArrowLeft':
        event.preventDefault();
        seek(Math.max(position - 5, 0));
        break;
      case 'Home':
        event.preventDefault();
        seek(0);
        break;
      case 'End':
        event.preventDefault();
        seek(duration || 0);
        break;
      default:
        break;
    }
  };

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    seek(ratio * duration);
  };

  return (
    <div
      role="region"
      aria-label={t('regionLabel')}
      onKeyDown={handleKeyDown}
      className={cn(
        'fixed inset-x-0 z-40 border-t border-line bg-surface/95 backdrop-blur',
        'supports-[backdrop-filter]:bg-surface/80',
        // Sits above the sticky mobile CTA bar on small screens; layout can
        // override the offset via --mobile-cta-height if that bar's height differs.
        'bottom-[var(--mobile-cta-height,4rem)] md:bottom-0'
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative shrink-0">
            <AudioReactive className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-16 w-16 -translate-x-1/2 -translate-y-1/2 opacity-60 blur-xl motion-reduce:hidden" />
            {current.coverSrc ? (
              <Image
                src={current.coverSrc}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 rounded-md object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-surface-2" aria-hidden="true">
                <Music2 className="h-5 w-5 text-ink-faint" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-base text-ink sm:text-lg">{current.title}</p>
            <p className="truncate text-xs uppercase tracking-[0.15em] text-gold">
              {tMoments(current.moment)}
              {disabled && <span className="ms-2 normal-case tracking-normal text-ink-faint">· {t('comingSoon')}</span>}
            </p>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {queue.length > 1 && (
              <button
                type="button"
                onClick={previous}
                aria-label={t('previous')}
                className="hidden h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:flex"
              >
                <SkipBack className="h-4 w-4" aria-hidden="true" />
              </button>
            )}

            <button
              type="button"
              onClick={toggle}
              disabled={disabled}
              aria-label={playLabel}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-full border border-gold text-gold transition-colors',
                'hover:bg-gold hover:text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
                disabled && 'cursor-not-allowed opacity-40 hover:bg-transparent hover:text-gold'
              )}
            >
              {isPlaying ? <Pause className="h-5 w-5" aria-hidden="true" /> : <Play className="h-5 w-5" aria-hidden="true" />}
            </button>

            {queue.length > 1 && (
              <button
                type="button"
                onClick={next}
                aria-label={t('next')}
                className="hidden h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:flex"
              >
                <SkipForward className="h-4 w-4" aria-hidden="true" />
              </button>
            )}

            <button
              type="button"
              onClick={toggleExpanded}
              aria-expanded={expanded}
              aria-controls={panelId}
              aria-label={expanded ? t('collapse') : t('expand')}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              {expanded ? <ChevronDown className="h-4 w-4" aria-hidden="true" /> : <ChevronUp className="h-4 w-4" aria-hidden="true" />}
            </button>

            <button
              type="button"
              onClick={close}
              aria-label={t('close')}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-9 shrink-0 text-end text-xs tabular-nums text-ink-faint">{formatTime(position)}</span>
          <div
            id={progressId}
            role="slider"
            tabIndex={0}
            aria-label={t('progress')}
            aria-valuemin={0}
            aria-valuemax={duration || 0}
            aria-valuenow={position}
            aria-valuetext={t('progressValue', { current: formatTime(position), duration: formatTime(duration) })}
            onKeyDown={handleProgressKeyDown}
            onClick={handleProgressClick}
            className="group relative h-1.5 flex-1 cursor-pointer rounded-full bg-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <div
              className="absolute inset-y-0 start-0 rounded-full bg-gold motion-reduce:transition-none"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="w-9 shrink-0 text-xs tabular-nums text-ink-faint">{formatTime(duration)}</span>
        </div>

        <div
          id={panelId}
          className={cn(
            'grid transition-[grid-template-rows] duration-300 ease-[var(--ease-out-expo)] motion-reduce:transition-none',
            expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          )}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-4 pt-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={muted || volume === 0 ? t('unmute') : t('mute')}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  {muted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Volume2 className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={muted ? 0 : volume}
                  aria-label={t('volume')}
                  onChange={(event) => setVolume(Number(event.target.value))}
                  className="h-1.5 w-28 accent-gold"
                />
              </div>

              {queue.length > 1 && (
                <div className="w-full sm:max-w-xs">
                  <p className="mb-2 text-xs uppercase tracking-[0.15em] text-ink-faint">{t('queueTitle')}</p>
                  <ul className="max-h-40 space-y-1 overflow-y-auto">
                    {queue.map((mix) => (
                      <li key={mix.id}>
                        <TrackCard mix={mix} queue={queue} variant="compact" />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
