'use client';

import { useState, type ReactNode } from 'react';
import { Play } from 'lucide-react';

interface ShowreelFacadeProps {
  playLabel: string;
  /** TODO(kunde): swap in the real aftermovie embed URL once it exists. */
  embedUrl?: string;
  /** The poster image, rendered on the server (see `showreel.tsx`). Absent → the designed gradient. */
  children?: ReactNode;
}

/**
 * Click-to-load video facade — no iframe/video is requested until the visitor
 * actually clicks play, so the section never taxes LCP/INP on first load.
 *
 * Three states, in this order:
 *
 * 1. **No `embedUrl`** (today): the poster alone, as a plain image. No play
 *    button. A play button here would be a promise the site cannot keep — the
 *    aftermovie does not exist yet, and the old code rendered the button
 *    anyway, so clicking it did nothing at all. Showing the still without the
 *    control is the honest version of "coming soon".
 * 2. **`embedUrl`, not yet clicked**: poster plus play button.
 * 3. **Clicked**: the embed.
 *
 * `children` carries the poster (a `<SiteImage>` resolved on the server, so no
 * image URL is hardcoded here) and is absent when no photo exists — in which
 * case the designed gradient shows through exactly as before.
 */
export function ShowreelFacade({ playLabel, embedUrl, children }: ShowreelFacadeProps) {
  const [loaded, setLoaded] = useState(false);

  if (!embedUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-line bg-[radial-gradient(ellipse_at_50%_40%,var(--color-glow)_0%,var(--color-surface-2)_60%,var(--color-surface)_100%)]">
        {children}
      </div>
    );
  }

  if (loaded) {
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
      {children}
      <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gold text-bg shadow-lift transition-transform group-hover:scale-105 motion-reduce:transition-none">
        <Play className="h-6 w-6 translate-x-0.5" fill="currentColor" aria-hidden="true" />
      </span>
      <span className="sr-only">{playLabel}</span>
    </button>
  );
}
