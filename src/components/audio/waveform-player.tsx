'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Mix } from '@/content/mixes';
import { useAudio } from './audio-provider';
import type WaveSurfer from 'wavesurfer.js';

interface WaveformPlayerProps {
  mix: Mix;
  queue?: Mix[];
  className?: string;
}

const PLACEHOLDER_BAR_COUNT = 56;

/** Deterministic pseudo-random bar heights derived from the mix id, so the
 *  static placeholder looks like a plausible waveform and is stable across
 *  renders (and SSR — no Math.random hydration mismatch). */
function placeholderBars(seed: string, count: number): number[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    hash = (hash * 1103515245 + 12345) >>> 0;
    bars.push(0.15 + ((hash >>> 8) % 100) / 100 * 0.85);
  }
  return bars;
}

/**
 * Per-track waveform, used on the music page. Reuses the ONE shared
 * <audio> element from useAudio() via wavesurfer's `media` option — it never
 * creates a second audio stream. It only "goes live" (dynamic-imports
 * wavesurfer and draws the real, decoded waveform) while this exact mix is
 * the globally active track; otherwise it shows the static placeholder, so
 * it never decodes/fetches audio for a set nobody asked to hear, and it
 * never renders a stale waveform for a track that isn't playing.
 *
 * Keyboard seeking is provided by the persistent player's progress slider
 * (a real role="slider"); the click-to-seek on the waveform canvas itself is
 * a mouse/touch enhancement layered on top, not the only way to seek.
 */
export function WaveformPlayer({ mix, queue, className }: WaveformPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const [ready, setReady] = useState(false);
  const { current, isPlaying, audioElement, play, toggle } = useAudio();
  const { resolvedTheme } = useTheme();
  const t = useTranslations('music.player');

  const bars = useMemo(() => placeholderBars(mix.id, PLACEHOLDER_BAR_COUNT), [mix.id]);
  const isCurrent = current?.id === mix.id;
  const disabled = !mix.src;
  const isLive = isCurrent && !disabled;

  useEffect(() => {
    if (!isLive || !audioElement || !containerRef.current) return;
    let cancelled = false;
    let instance: WaveSurfer | null = null;

    const styles = getComputedStyle(document.documentElement);
    const waveColor = styles.getPropertyValue('--color-line').trim() || '#232329';
    const progressColor = styles.getPropertyValue('--color-gold').trim() || '#D6B36A';

    import('wavesurfer.js').then(({ default: WaveSurfer }) => {
      if (cancelled || !containerRef.current) return;
      instance = WaveSurfer.create({
        container: containerRef.current,
        media: audioElement,
        waveColor,
        progressColor,
        height: 64,
        barWidth: 2,
        barGap: 2,
        barRadius: 2,
        cursorWidth: 0,
        normalize: true,
        interact: true,
      });
      waveSurferRef.current = instance;
      instance.on('ready', () => {
        if (!cancelled) setReady(true);
      });
    });

    return () => {
      cancelled = true;
      instance?.destroy();
      waveSurferRef.current = null;
      setReady(false);
    };
  }, [isLive, audioElement, mix.id]);

  // Follow light/dark theme changes without recreating the instance.
  useEffect(() => {
    if (!waveSurferRef.current) return;
    const styles = getComputedStyle(document.documentElement);
    waveSurferRef.current.setOptions({
      waveColor: styles.getPropertyValue('--color-line').trim(),
      progressColor: styles.getPropertyValue('--color-gold').trim(),
    });
  }, [resolvedTheme]);

  const handleActivate = () => {
    if (disabled) return;
    if (isCurrent) {
      toggle();
    } else {
      play(mix, queue);
    }
  };

  const label = disabled ? t('comingSoon') : isCurrent && isPlaying ? t('pauseTrack', { title: mix.title }) : t('playTrack', { title: mix.title });

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <button
        type="button"
        onClick={handleActivate}
        disabled={disabled}
        aria-label={label}
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold text-gold transition-colors',
          'hover:bg-gold hover:text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
          disabled && 'cursor-not-allowed opacity-40 hover:bg-transparent hover:text-gold'
        )}
      >
        {isCurrent && isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </button>

      {/* Fixed height reserved up front — real waveform fades in over the
          placeholder later, so this never causes layout shift (CLS = 0). */}
      <div role="img" aria-label={t('waveform')} className="relative h-16 flex-1 overflow-hidden rounded-md">
        <div
          aria-hidden="true"
          className={cn(
            'absolute inset-0 flex items-center gap-[2px] transition-opacity duration-300 motion-reduce:transition-none',
            isLive && ready ? 'opacity-0' : 'opacity-100'
          )}
        >
          {bars.map((height, index) => (
            <span key={index} className="flex-1 rounded-full bg-line" style={{ height: `${Math.round(height * 100)}%` }} />
          ))}
        </div>
        <div
          ref={containerRef}
          className={cn(
            'absolute inset-0 transition-opacity duration-300 motion-reduce:transition-none',
            isLive && ready ? 'opacity-100' : 'opacity-0'
          )}
        />
      </div>
    </div>
  );
}
