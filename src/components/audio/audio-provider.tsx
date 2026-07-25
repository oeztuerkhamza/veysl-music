'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useTranslations } from 'next-intl';
import { site } from '@/content/site';
import type { Mix } from '@/content/mixes';

type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'unavailable' | 'error';

interface AudioContextValue {
  /** Currently loaded track, or null if nothing has ever been started. */
  current: Mix | null;
  queue: Mix[];
  isPlaying: boolean;
  status: PlaybackStatus;
  /** Playback position in seconds. */
  position: number;
  /** Track duration in seconds (0 until metadata loads). */
  duration: number;
  /** 0–1. */
  volume: number;
  muted: boolean;
  /** Collapsed vs. expanded bar UI state. */
  expanded: boolean;
  /** The single long-lived <audio> element. Exposed so WaveformPlayer can bind
   *  wavesurfer's `media` option to it instead of creating a second audio stream. */
  audioElement: HTMLAudioElement | null;
  /** Starts (or resumes) a mix. Pass `queue` to set/replace the playback queue
   *  (e.g. the filtered track list it was played from) — omit to keep the queue as is. */
  play: (mix: Mix, queue?: Mix[]) => void;
  /** Play/pause the current track. No-op if nothing is loaded or it has no `src`. */
  toggle: () => void;
  next: () => void;
  /** Restarts the current track if more than 3s in; otherwise jumps to the previous one. */
  previous: () => void;
  seek: (seconds: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  /** Stops playback and fully resets — used by the player's close button. */
  close: () => void;
  setExpanded: (value: boolean) => void;
  toggleExpanded: () => void;
  /** Lazily creates (once, cached for the app's lifetime) an AnalyserNode wired
   *  to the shared audio element. Returns null if Web Audio isn't available. */
  getAnalyser: () => AnalyserNode | null;
}

const AudioPlayerContext = createContext<AudioContextValue | null>(null);

const VOLUME_STORAGE_KEY = 'veysl:audio:volume';
const MUTED_STORAGE_KEY = 'veysl:audio:muted';

export function AudioProvider({ children }: { children: ReactNode }) {
  const t = useTranslations('music.moments');

  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [queue, setQueue] = useState<Mix[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState<PlaybackStatus>('idle');
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [muted, setMuted] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const queueRef = useRef<Mix[]>([]);
  const indexRef = useRef<number | null>(null);
  const loadedIdRef = useRef<string | null>(null);
  const nextRef = useRef<() => void>(() => {});

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);
  useEffect(() => {
    indexRef.current = currentIndex;
  }, [currentIndex]);

  const current = useMemo<Mix | null>(
    () => (currentIndex !== null ? (queue[currentIndex] ?? null) : null),
    [queue, currentIndex]
  );

  // Create the ONE HTMLAudioElement for the whole app session. This effect runs
  // once at the root (see AudioDock) and survives client-side route changes.
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';

    const onTimeUpdate = () => setPosition(audio.currentTime);
    const onLoadedMetadata = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onPlay = () => {
      setIsPlaying(true);
      setStatus('playing');
    };
    const onPause = () => {
      setIsPlaying(false);
      setStatus((s) => (s === 'unavailable' || s === 'error' ? s : 'paused'));
    };
    const onWaiting = () => setStatus('loading');
    const onCanPlay = () => setStatus((s) => (s === 'loading' ? (audio.paused ? 'paused' : 'playing') : s));
    const onError = () => setStatus('error');
    const onEnded = () => nextRef.current();

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('error', onError);
    audio.addEventListener('ended', onEnded);

    setAudioElement(audio);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
      audio.removeAttribute('src');
    };
  }, []);

  // Restore persisted volume/mute after mount (SSR-safe: defaults match the
  // server-rendered state, this only adjusts client-side after hydration).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const storedVolume = window.localStorage.getItem(VOLUME_STORAGE_KEY);
      const storedMuted = window.localStorage.getItem(MUTED_STORAGE_KEY);
      if (storedVolume !== null) {
        const parsed = Number(storedVolume);
        if (Number.isFinite(parsed)) setVolumeState(Math.min(1, Math.max(0, parsed)));
      }
      if (storedMuted !== null) setMuted(storedMuted === 'true');
    } catch {
      // Private browsing / storage disabled — defaults stand.
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(VOLUME_STORAGE_KEY, String(volume));
    } catch {
      /* ignore */
    }
  }, [volume]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(MUTED_STORAGE_KEY, String(muted));
    } catch {
      /* ignore */
    }
  }, [muted]);

  useEffect(() => {
    if (!audioElement) return;
    audioElement.volume = volume;
    audioElement.muted = muted;
  }, [audioElement, volume, muted]);

  const play = useCallback(
    (mix: Mix, newQueue?: Mix[]) => {
      const audio = audioElement;
      if (!audio) return;

      let q = queueRef.current;
      let idx: number;

      if (newQueue && newQueue.length > 0) {
        q = newQueue;
        idx = q.findIndex((m) => m.id === mix.id);
        if (idx === -1) {
          q = [...q, mix];
          idx = q.length - 1;
        }
      } else {
        idx = q.findIndex((m) => m.id === mix.id);
        if (idx === -1) {
          q = [mix];
          idx = 0;
        }
      }

      queueRef.current = q;
      indexRef.current = idx;
      setQueue(q);
      setCurrentIndex(idx);

      if (!mix.src) {
        // No file delivered yet — reflect "coming soon" instead of erroring.
        if (loadedIdRef.current !== null) {
          audio.pause();
          audio.removeAttribute('src');
          loadedIdRef.current = null;
        }
        setIsPlaying(false);
        setStatus('unavailable');
        setPosition(0);
        setDuration(0);
        return;
      }

      if (loadedIdRef.current !== mix.id) {
        setStatus('loading');
        audio.src = mix.src;
        loadedIdRef.current = mix.id;
        audio.load();
      }
      audio.play().catch(() => setStatus('error'));
    },
    [audioElement]
  );

  const toggle = useCallback(() => {
    const audio = audioElement;
    if (!audio || !current || !current.src) return;
    if (audio.paused) {
      audio.play().catch(() => setStatus('error'));
    } else {
      audio.pause();
    }
  }, [audioElement, current]);

  const stepTo = useCallback(
    (delta: number) => {
      const q = queueRef.current;
      if (q.length === 0) return;
      const cur = indexRef.current ?? 0;
      const nextIdx = (cur + delta + q.length) % q.length;
      play(q[nextIdx], q);
    },
    [play]
  );

  const next = useCallback(() => stepTo(1), [stepTo]);

  const previous = useCallback(() => {
    const audio = audioElement;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setPosition(0);
      return;
    }
    stepTo(-1);
  }, [audioElement, stepTo]);

  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  const seek = useCallback(
    (seconds: number) => {
      const audio = audioElement;
      if (!audio || !Number.isFinite(seconds)) return;
      const max = audio.duration || duration || seconds;
      const clamped = Math.min(Math.max(seconds, 0), max);
      audio.currentTime = clamped;
      setPosition(clamped);
    },
    [audioElement, duration]
  );

  const setVolume = useCallback(
    (value: number) => {
      const clamped = Math.min(1, Math.max(0, value));
      setVolumeState(clamped);
      if (audioElement) audioElement.volume = clamped;
      if (clamped > 0 && muted) setMuted(false);
    },
    [audioElement, muted]
  );

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      if (audioElement) audioElement.muted = next;
      return next;
    });
  }, [audioElement]);

  const close = useCallback(() => {
    const audio = audioElement;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    loadedIdRef.current = null;
    queueRef.current = [];
    indexRef.current = null;
    setQueue([]);
    setCurrentIndex(null);
    setIsPlaying(false);
    setStatus('idle');
    setPosition(0);
    setDuration(0);
    setExpanded(false);
  }, [audioElement]);

  const toggleExpanded = useCallback(() => setExpanded((v) => !v), []);

  const getAnalyser = useCallback(() => {
    if (!audioElement || typeof window === 'undefined') return null;
    if (analyserRef.current) return analyserRef.current;
    try {
      const AudioCtx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      const ctx = new AudioCtx();
      const source = ctx.createMediaElementSource(audioElement);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      ctx.resume().catch(() => {});
      return analyser;
    } catch {
      return null;
    }
  }, [audioElement]);

  // Media Session — lock-screen / hardware-key controls.
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    const ms = navigator.mediaSession;

    if (!current) {
      ms.metadata = null;
      return;
    }

    if (typeof MediaMetadata !== 'undefined') {
      ms.metadata = new MediaMetadata({
        title: current.title,
        artist: site.name,
        album: t(current.moment),
        artwork: current.coverSrc ? [{ src: current.coverSrc, sizes: '512x512', type: 'image/jpeg' }] : [],
      });
    }
    ms.playbackState = isPlaying ? 'playing' : 'paused';
    ms.setActionHandler('play', () => toggle());
    ms.setActionHandler('pause', () => toggle());
    ms.setActionHandler('previoustrack', () => previous());
    ms.setActionHandler('nexttrack', () => next());
    ms.setActionHandler('seekto', (details) => {
      if (typeof details.seekTime === 'number') seek(details.seekTime);
    });

    return () => {
      ms.setActionHandler('play', null);
      ms.setActionHandler('pause', null);
      ms.setActionHandler('previoustrack', null);
      ms.setActionHandler('nexttrack', null);
      ms.setActionHandler('seekto', null);
    };
  }, [current, isPlaying, toggle, previous, next, seek, t]);

  const value = useMemo<AudioContextValue>(
    () => ({
      current,
      queue,
      isPlaying,
      status,
      position,
      duration,
      volume,
      muted,
      expanded,
      audioElement,
      play,
      toggle,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      close,
      setExpanded,
      toggleExpanded,
      getAnalyser,
    }),
    [
      current,
      queue,
      isPlaying,
      status,
      position,
      duration,
      volume,
      muted,
      expanded,
      audioElement,
      play,
      toggle,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      close,
      toggleExpanded,
      getAnalyser,
    ]
  );

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
}

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) {
    throw new Error(
      'useAudio() was called outside an <AudioProvider>. Wrap the app with <AudioDock> from "@/components/audio".'
    );
  }
  return ctx;
}
