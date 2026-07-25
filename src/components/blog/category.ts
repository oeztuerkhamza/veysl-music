import type { BlogCategory } from '@/content/blog';

/**
 * Editorial reading order for the `/ratgeber` index's category sections —
 * top-of-funnel planning first, niche/legal-adjacent topics last. NOT
 * alphabetical, mirrors the grouping logic of `docs/BLOG-PLAN.md`.
 *
 * `real-wedding` is deliberately excluded from this list: `getPublishedGuides()`
 * (from `@/content/blog`) never returns a post in that category — it's
 * reserved for the two `type: 'recap'` templates, which this route excludes
 * entirely (see `src/content/blog/types.ts`).
 */
export const BLOG_CATEGORY_ORDER: Exclude<BlogCategory, 'real-wedding'>[] = [
  'planung',
  'kosten',
  'musik',
  'tuerkische-hochzeit',
  'technik',
  'recht',
  'international',
];
