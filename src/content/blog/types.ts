/**
 * Blog content types — shared by every post module in `src/content/blog/`.
 *
 * Design goals (see the brief this was built against, and `.claude/CONTRACT.md` §6):
 *
 * 1. **CMS-ready.** `id` and `slug` are stable and locale-independent so a future
 *    headless CMS (Sanity, per CONTRACT.md) can import each post as one document with
 *    per-locale translation fields, without renaming keys. Nothing here is JSX.
 * 2. **One canonical slug per post, with per-locale overrides.** `BlogPost.slug` stays
 *    stable and locale-independent so a future headless CMS still sees one document per
 *    article; `BlogLocaleContent.slug` overrides the URL for a given language.
 *
 *    This started out deliberately unlocalized, on the reasoning that a blog with a
 *    translation backlog is a different shape of content from the hand-maintained
 *    navigation pages in `src/i18n/routing.ts`. In practice that left every Turkish and
 *    English article on a German URL — `/tr/rehber/was-kostet-ein-hochzeits-dj` — which
 *    is the one place in the whole site where the URL contradicted the language of the
 *    page, and it cost exactly the long-tail keyword the article was written to win.
 *    The extension point this comment already described is now taken: resolve slugs with
 *    `getPostSlug(post, locale)` and look posts up with `getPostBySlugForLocale()`.
 *    A locale with no override simply falls back to `slug`, so ku/fr/es stay unaffected
 *    until someone translates them.
 * 3. **No hardcoded hrefs inside body prose.** Internal links live in the structured
 *    `links` / `relatedAnswers` / `relatedCities` / `relatedPosts` arrays, exactly like
 *    `src/content/answers.ts` already does with its own `links?: StaticPathname[]`. The
 *    markdown `body` mentions a related page by name in prose ("die Paketübersicht"),
 *    never as a raw `/pakete` link — because the real slug depends on locale
 *    (`/pakete` vs `/packages` vs `/paketler`) and only `getPathname()` from
 *    `@/i18n/navigation` may resolve that (CONTRACT.md §5: "never build URLs by hand").
 *    A future renderer reads the structured arrays and injects real `<Link>`s, typically
 *    as a "Weiterführende Links" block.
 * 4. **Markdown, not JSX.** `body` is a plain MDX-ready markdown string: `##`/`###`
 *    headings, `-`/`1.` lists, GFM tables, `**bold**`. No inline code spans are used
 *    anywhere in this corpus specifically so post bodies can be safely written as
 *    JS template literals without escaping backticks.
 */

import type { Locale } from '@/i18n/routing';
import type { StaticPathname } from '@/lib/seo';

/**
 * Locales the Ratgeber can appear in at all.
 *
 * Listing a locale here does **not** claim every article exists in it.
 * `getReadyLocalesForPost()` filters per post, and `resolveBlogLocale()`
 * returns `null` rather than falling back to German — so a half-translated
 * language shows exactly the articles that are really translated and nothing
 * else, in the index, in hreflang and in the sitemap alike. That is what makes
 * it safe to open nl/fr/es before all seventeen posts are done.
 *
 * `ku` is deliberately absent, and not because of effort. The Kurmancî
 * articles need a native speaker: `src/i18n/routing.ts` already flags even the
 * Kurdish *slugs* as awaiting a translator, and a fifteen-thousand-word corpus
 * nobody on this project can proofread would be exactly the machine-translated
 * filler this codebase refuses everywhere else. The moment real Kurmancî copy
 * exists, adding `'ku'` here and one `ku:` block per post is the whole change.
 */
export const BLOG_LOCALES = ['de', 'tr', 'en', 'nl', 'fr', 'es'] as const;
export type BlogLocale = (typeof BLOG_LOCALES)[number];

/**
 * Editorial buckets — used for the future `/ratgeber` index/filter UI and to keep an
 * eye on keyword cannibalization (one primary keyword per post, see docs/BLOG-PLAN.md).
 * `real-wedding` is reserved for the two recap templates in (5) and is never used by a
 * `type: 'guide'` post.
 */
export type BlogCategory =
  | 'planung'
  | 'kosten'
  | 'musik'
  | 'tuerkische-hochzeit'
  /**
   * Religiös geprägte Hochzeiten — bewusst neben `tuerkische-hochzeit`, nicht
   * darin. Die Suchintention dahinter ist religiös, nicht ethnisch: „islamische
   * Hochzeit mit DJ" tippen arabische und bosnische Paare genauso wie türkische.
   * In `tuerkische-hochzeit` einsortiert wäre der Cluster für genau jene
   * Leserinnen und Leser unsichtbar, für die er geschrieben ist.
   * Siehe docs/SEO-KEYWORD-MAP.md §5 und src/content/islamic.ts.
   */
  | 'islamische-hochzeit'
  | 'technik'
  | 'recht'
  | 'international'
  | 'real-wedding';

/**
 * `guide` = evergreen advice content (the 15 articles in Part 1).
 * `recap` = a real-event write-up. DJ Veys has zero verified real-wedding details right
 * now (see `.claude/BRAND-FACTS.md` — no couple names, venues or dates are confirmed),
 * so every `recap` currently ships as `status: 'template'`: real structure and prompts,
 * blanks left for the owner to fill in once he has a couple's written permission.
 */
export type BlogPostType = 'guide' | 'recap';

/**
 * `draft` = not yet editorially finished.
 * `published` = content-complete and fact-checked against BRAND-FACTS.md; ready to go
 * live the moment a `/ratgeber/[slug]` route exists. This does NOT mean it is live —
 * no blog route is wired up by this content pass, see docs/BLOG-PLAN.md.
 * `template` = intentionally not a finished article — a fill-in-the-blank skeleton
 * (used only by the two `type: 'recap'` posts).
 */
export type BlogPostStatus = 'draft' | 'published' | 'template';

export interface BlogSeo {
  /** ≤ 60 characters, `[...string].length` (umlauts count as one), matches the convention in docs/SEO-KEYWORD-MAP.md. */
  metaTitle: string;
  /** ≤ 155 characters. */
  metaDescription: string;
}

export interface BlogLocaleContent {
  /**
   * Locale-specific URL slug. Omit to reuse the post's canonical `slug`.
   *
   * This is the override point that point 2 in the file header always
   * anticipated, now actually used: `/tr/rehber/dugun-dj-kontrol-listesi`
   * instead of a Turkish page sitting on a German slug. Resolve it through
   * `getPostSlug(post, locale)` — never read this field directly, or the
   * fallback to `post.slug` (which is what `de` relies on, and what any
   * future locale gets before someone writes a slug for it) is lost.
   *
   * Rules for adding one, so the cluster stays consistent:
   * - ASCII only. Turkish slugs drop the diacritics (`gürültü` → `gurultu`);
   *   a percent-encoded URL is unreadable in a SERP and in a shared link.
   * - Carry that language's primary keyword, do not transliterate the German
   *   slug. `was-kostet-ein-hochzeits-dj` becomes `dugun-dj-fiyatlari`,
   *   not `dugun-dj-ne-kadar-tutar` — the first is what people search.
   * - Never change one after launch without a redirect: the slug IS the URL.
   */
  slug?: string;
  /** The page's single H1. */
  title: string;
  /**
   * The 2–3 sentence answer-style opening paragraph. Doubles as the card teaser on a
   * future `/ratgeber` index and as the passage most likely to be lifted verbatim by an
   * AI answer engine — same rationale as `Answer.a` in `src/content/answers.ts`, see
   * `docs/GEO-STRATEGY.md` §2 ("heading-then-answer adjacency").
   */
  excerpt: string;
  /** MDX-ready markdown body. H1 is NOT repeated here — rendering owns the H1 from `title`. */
  body: string;
  seo: BlogSeo;
}

/**
 * `de`/`tr`/`en` are mandatory on every post per the brief. `ku`/`fr`/`es` are typed as
 * optional so the translation backlog in docs/BLOG-PLAN.md can be filled in later
 * without a breaking-change to this interface — mirrors the exact pattern
 * `LocalizedAnswerText` already uses in `src/content/answers.ts`.
 */
export type BlogTranslations = { de: BlogLocaleContent; tr: BlogLocaleContent; en: BlogLocaleContent } & Partial<
  Record<Exclude<Locale, 'de' | 'tr' | 'en'>, BlogLocaleContent>
>;

/**
 * One fill-in-the-blank field for a `recap` template. `key` is the token used inside
 * `body` as `{{KEY}}` — a future editor UI can render one form field per entry and
 * do a straight find-and-replace, which is what "turn a real event into a post in
 * fifteen minutes" (per the brief) actually requires.
 */
/**
 * de/tr/en are mandatory, every further blog locale optional — the same rule
 * `BlogTranslations` follows, for the same reason: a locale is added to
 * `BLOG_LOCALES` as soon as it *can* carry articles, which is long before
 * every string in it exists.
 *
 * Previously `Record<BlogLocale, string>`, which quietly coupled these editor
 * labels to the published-locale list: opening nl/fr/es to the Ratgeber turned
 * into 60 type errors in two recap templates that have nothing to do with
 * which languages readers can browse.
 */
type BlogEditorText = { de: string; tr: string; en: string } & Partial<
  Record<Exclude<BlogLocale, 'de' | 'tr' | 'en'>, string>
>;

export interface BlogTemplateField {
  key: string;
  label: BlogEditorText;
  hint: BlogEditorText;
  example?: string;
}

export interface BlogPost {
  /** Stable, locale-independent identifier — the CMS primary key. Never changes once published. */
  id: string;
  /** Stable slug, identical across every locale — see file header point 2. */
  slug: string;
  category: BlogCategory;
  type: BlogPostType;
  status: BlogPostStatus;
  /** ISO date (YYYY-MM-DD). Planned/actual go-live date — see docs/BLOG-PLAN.md for the cadence this follows. */
  publishedAt: string;
  /** ISO date (YYYY-MM-DD). Last substantive content edit. */
  updatedAt: string;
  /** Locale-independent, lowercase-kebab tags for future filtering — not display strings. */
  tags: string[];
  /** Approximate reading time in minutes, based on the German body (~200 words/min). Informational only. */
  readingTimeMinutes: number;
  /** German route keys (from `src/i18n/routing.ts` → `pathnames`) this post should link to — resolved per-locale by the renderer, never hardcoded. */
  links: StaticPathname[];
  /** Ids from `src/content/answers.ts` worth cross-linking (GEO corpus). */
  relatedAnswers?: string[];
  /** Slugs from `src/content/cities.ts` worth cross-linking (local SEO). */
  relatedCities?: string[];
  /** Ids of other posts in this corpus worth reading next. */
  relatedPosts?: string[];
  /** Only present on `type: 'recap'` posts — the fill-in-the-blank field list for `body`'s `{{TOKENS}}`. */
  templateFields?: BlogTemplateField[];
  translations: BlogTranslations;
}
