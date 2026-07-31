import type { BlogCategory } from '@/content/blog';

/** Every category a `type: 'guide'` post can carry — see the `real-wedding` note below. */
type GuideCategory = Exclude<BlogCategory, 'real-wedding'>;

/**
 * Editorial reading order for the `/ratgeber` index's category sections —
 * top-of-funnel planning first, niche/legal-adjacent topics last. NOT
 * alphabetical, mirrors the grouping logic of `docs/BLOG-PLAN.md`.
 *
 * `real-wedding` is deliberately excluded: `getPublishedGuides()` (from
 * `@/content/blog`) never returns a post in that category — it's reserved for
 * the two `type: 'recap'` templates, which this route excludes entirely (see
 * `src/content/blog/types.ts`).
 */
const ORDER = [
  'planung',
  'kosten',
  'musik',
  'tuerkische-hochzeit',
  'islamische-hochzeit',
  'technik',
  'recht',
  'international',
] as const;

type MissingCategory = Exclude<GuideCategory, (typeof ORDER)[number]>;

/**
 * The index renders **only** what this list names: `/ratgeber` groups posts by
 * iterating it, so a category missing here is a category whose articles are
 * silently invisible — counted in the "N guides" subtitle, absent from the page.
 *
 * That is not hypothetical. Adding `islamische-hochzeit` to the `BlogCategory`
 * union shipped exactly that state: the Kurdish index announced one guide and
 * listed none, and every other locale would have hidden the same article. The
 * union grew, the array did not, and nothing complained — an array typed
 * `GuideCategory[]` is perfectly happy to be incomplete.
 *
 * Hence the conditional type below. If a category is ever added to the union
 * without being added here, the annotation resolves to a tuple `ORDER` cannot
 * satisfy, and the compiler reports it by name instead of the site quietly
 * dropping articles.
 */
export const BLOG_CATEGORY_ORDER: [MissingCategory] extends [never]
  ? readonly GuideCategory[]
  : ['BLOG_CATEGORY_ORDER is missing a category:', MissingCategory] = ORDER;
