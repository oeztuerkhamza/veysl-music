import type { ReactNode } from 'react';
import { AudioProvider } from './audio-provider';
import { GlobalPlayer } from './global-player';

export { useAudio } from './audio-provider';
export { TrackCard } from './track-card';
export { TrackList } from './track-list';
export { WaveformPlayer } from './waveform-player';
export { formatTime } from './format-time';

/**
 * Wraps the app with the audio context + persistent bottom bar in one go.
 * Wire this into the locale layout around `{children}` — see the audio
 * agent's report for the exact spot. Deliberately not `'use client'` itself:
 * AudioProvider/GlobalPlayer are client components, but this composition
 * shell can stay a server component so the client boundary starts as deep
 * as possible.
 */
export function AudioDock({ children }: { children: ReactNode }) {
  return (
    <AudioProvider>
      {children}
      <GlobalPlayer />
    </AudioProvider>
  );
}
