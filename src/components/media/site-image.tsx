import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getImageSlot, resolveSlot, type ImageSlotKey } from '@/content/site-images';
import { ImagePlaceholder } from './image-placeholder';
import { ASPECT_RATIO_CSS } from './aspect';

/**
 * A slot key from the registry, OR any dynamic key composed via
 * `dynamicSlotKey()` (e.g. `city.header.background.stuttgart`). The
 * `(string & {})` union keeps editor autocomplete for the registered keys
 * while still accepting arbitrary dynamic strings — see
 * `src/content/site-images.ts`.
 */
export type SiteImageSlotKey = ImageSlotKey | (string & {});

export interface SiteImageProps {
  slot: SiteImageSlotKey;
  /** `next/image` sizes — tune per usage context (full-bleed hero vs. a fixed-width column). */
  sizes?: string;
  className?: string;
  priority?: boolean;
  /** Overrides the resolved/fallback alt text — use for genuinely per-instance context (e.g. a city name interpolated into a dynamic slot). */
  alt?: string;
  /** Forces `alt=""` regardless of any resolved/fallback alt — only for images that are truly decorative next to already-present text. */
  decorative?: boolean;
  /** Circle instead of rounded panel — for avatar-shaped slots. */
  shape?: 'panel' | 'circle';
}

/**
 * The one component every image slot in the registry renders through.
 * Resolves, in order: a CMS-uploaded image (`resolveSlot`) → the slot's
 * local `fallbackSrc` → the designed empty state (`<ImagePlaceholder>`).
 * Never renders a broken `<img>` — one of these three branches always
 * matches. Explicit `aspect-ratio` on every branch guarantees zero CLS
 * whether or not a real photo exists.
 *
 * Server Component by design (no interactivity needed to display a photo);
 * safe to render from both sync and async server components/pages.
 */
export async function SiteImage({ slot, sizes = '100vw', className, priority = false, alt, decorative = false, shape = 'panel' }: SiteImageProps) {
  const definition = getImageSlot(slot);
  const aspect = definition?.aspect ?? '4/5';
  const resolved = await resolveSlot(slot);

  const src = resolved?.src ?? definition?.fallbackSrc ?? null;
  const resolvedAlt = decorative ? '' : (alt ?? resolved?.alt ?? definition?.fallbackAlt ?? '');

  if (!src) {
    return <ImagePlaceholder aspect={aspect} shape={shape} className={className} />;
  }

  return (
    <div
      className={cn('relative w-full overflow-hidden bg-surface-2', shape === 'circle' ? 'rounded-full' : 'rounded-lg', className)}
      style={{ aspectRatio: ASPECT_RATIO_CSS[aspect] }}
    >
      <Image src={src} alt={resolvedAlt} fill sizes={sizes} priority={priority} className="h-full w-full object-cover" />
    </div>
  );
}
