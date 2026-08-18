'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoFacadeProps {
  videoUrl: string;
  /**
   * Vorschaubild. Optional, weil nicht jede Quelle eines liefert — ein
   * YouTube-Vorschaubild wird serverseitig geholt (`media-cache.ts`), und
   * das kann fehlschlagen. Ohne Bild bleibt die Abspielfläche bestehen,
   * nur eben auf einem ruhigen Verlauf statt auf einem Foto.
   */
  posterSrc?: string;
  posterAlt: string;
  width: number;
  height: number;
  playLabel: string;
  className?: string;
}

/**
 * Click-to-load video facade: a static poster + play affordance until
 * clicked, only then does an iframe mount. Never ships a third-party embed
 * on first paint (protects LCP/INP) and never autoplays.
 */
export function VideoFacade({ videoUrl, posterSrc, posterAlt, width, height, playLabel, className }: VideoFacadeProps) {
  const [loaded, setLoaded] = useState(false);

  if (loaded) {
    return (
      <div
        className={cn('relative w-full overflow-hidden rounded-lg bg-black', className)}
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <iframe
          src={videoUrl}
          title={posterAlt}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setLoaded(true)}
      className={cn('group relative block w-full overflow-hidden rounded-lg', className)}
      style={posterSrc ? undefined : { aspectRatio: `${width} / ${height}` }}
    >
      {posterSrc ? (
        <Image src={posterSrc} alt={posterAlt} width={width} height={height} className="h-full w-full object-cover" />
      ) : (
        <span className="block h-full w-full bg-gradient-to-br from-surface-2 to-surface" />
      )}
      <span className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
        <span
          aria-hidden="true"
          className="flex h-14 w-14 items-center justify-center rounded-full border border-white/70 text-white"
        >
          <Play className="h-6 w-6" />
        </span>
        <span className="sr-only">{playLabel}</span>
      </span>
    </button>
  );
}
