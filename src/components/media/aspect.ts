import type { SlotAspect } from '@/content/site-images';

export type { SlotAspect };

/** Symbolic ratio → CSS `aspect-ratio` value. Applied via inline `style` (not a Tailwind utility) so every media component guarantees zero CLS regardless of whether the arbitrary-value class happens to be present in the build. */
export const ASPECT_RATIO_CSS: Record<SlotAspect, string> = {
  '16/9': '16 / 9',
  '4/5': '4 / 5',
  '1/1': '1 / 1',
  '3/2': '3 / 2',
  '21/9': '21 / 9',
};

const ASPECT_RATIO_VALUE: Record<SlotAspect, number> = {
  '16/9': 16 / 9,
  '4/5': 4 / 5,
  '1/1': 1,
  '3/2': 3 / 2,
  '21/9': 21 / 9,
};

/**
 * Snaps an arbitrary `width`/`height` pair to the nearest of the five
 * supported symbolic ratios, so every image on the site — CMS-driven or
 * per-item editorial content — stays within one small aspect-ratio
 * vocabulary instead of accumulating one-off values. Defaults to `3/2`
 * (the most neutral "photo" ratio) when dimensions are unknown.
 */
export function deriveAspect(width?: number, height?: number): SlotAspect {
  if (!width || !height) return '3/2';
  const ratio = width / height;
  let best: SlotAspect = '3/2';
  let bestDelta = Number.POSITIVE_INFINITY;
  for (const [aspect, value] of Object.entries(ASPECT_RATIO_VALUE) as [SlotAspect, number][]) {
    const delta = Math.abs(value - ratio);
    if (delta < bestDelta) {
      best = aspect;
      bestDelta = delta;
    }
  }
  return best;
}
