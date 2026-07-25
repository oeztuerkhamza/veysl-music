import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ImagePlaceholder } from './image-placeholder';
import { ASPECT_RATIO_CSS, deriveAspect, type SlotAspect } from './aspect';

export interface MediaFigureProps {
  /** `null`/`undefined` renders the designed empty state instead of a broken image — the normal state for blog posts and real-wedding entries until real material exists. */
  src?: string | null;
  alt?: string;
  width?: number;
  height?: number;
  /** Overrides the ratio derived from `width`/`height` (or used directly when no `src` exists yet). */
  aspect?: SlotAspect;
  /** Visible caption below the image — e.g. a one-line description for a real-wedding photo. */
  caption?: string;
  /** Photo credit — only ever a real, confirmed name. Never fabricate a photographer credit. */
  credit?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/**
 * Image + optional caption/credit for editorial, per-item content — blog
 * post covers and real-wedding gallery entries, where each item already
 * carries its own `src`/`width`/`height` (unlike `<SiteImage>`, which
 * resolves a single fixed slot from the registry). Falls back to
 * `<ImagePlaceholder>` when `src` is absent, so a blog post without a cover
 * yet, or a wedding entry mid-import, never renders a broken image.
 */
export function MediaFigure({ src, alt = '', width, height, aspect, caption, credit, sizes = '(min-width: 1024px) 50vw, 100vw', priority = false, className }: MediaFigureProps) {
  const resolvedAspect = aspect ?? deriveAspect(width, height);

  return (
    <figure className={cn('overflow-hidden rounded-lg border border-line bg-surface', className)}>
      {src ? (
        <div className="relative w-full" style={{ aspectRatio: ASPECT_RATIO_CSS[resolvedAspect] }}>
          <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="h-full w-full object-cover" />
        </div>
      ) : (
        <ImagePlaceholder aspect={resolvedAspect} caption={caption ?? null} />
      )}
      {src && (caption || credit) ? (
        <figcaption className="flex flex-col gap-0.5 px-4 py-3 text-xs text-ink-faint">
          {caption ? <span className="text-ink-muted">{caption}</span> : null}
          {credit ? <span>{credit}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
