'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

interface ShowreelFacadeProps {
  playLabel: string;
  /** TODO(kunde): swap in the real aftermovie embed URL once it exists. */
  embedUrl?: string;
}

/**
 * Click-to-load video facade — no iframe/video is requested until the visitor
 * actually clicks play, so the section never taxes LCP/INP on first load.
 *
 * Default state is a designed gradient placeholder (token-based, no photo/poster
 * file referenced) — the client's only existing photos are unsuitable for a
 * premium wedding site, so this must look finished without any image asset.
 */
export function ShowreelFacade({ playLabel, embedUrl }: ShowreelFacadeProps) {
  const [loaded, setLoaded] = useState(false);

  if (loaded && embedUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-surface-2">
        <iframe
          src={embedUrl}
          title={playLabel}
          className="absolute inset-0 h-full w-full"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setLoaded(true)}
      className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-line bg-[radial-gradient(ellipse_at_50%_40%,var(--color-glow)_0%,var(--color-surface-2)_60%,var(--color-surface)_100%)]"
      aria-label={playLabel}
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold text-bg shadow-lift transition-transform group-hover:scale-105 motion-reduce:transition-none">
        <Play className="h-6 w-6 translate-x-0.5" fill="currentColor" aria-hidden="true" />
      </span>
      <span className="sr-only">{playLabel}</span>
    </button>
  );
}
