/**
 * Blog content index — the single import surface for `src/content/blog/`.
 *
 * 17 posts total: 15 evergreen `type: 'guide'` articles (Part 1 of the brief) plus 2
 * `type: 'recap'` / `status: 'template'` fill-in-the-blank posts (Part 1, "Additionally
 * provide 2 Real Wedding templates"). See `docs/BLOG-PLAN.md` for the editorial plan —
 * primary/secondary keywords, publishing cadence, internal-linking map, and the ku/fr/es
 * translation backlog.
 *
 * Every post is DE + TR + EN today (`BlogTranslations` in `./types.ts`) — no post falls
 * back to a machine-translated ku/fr/es. `resolveBlogLocale()` below returns `null`
 * rather than silently rendering German prose under a non-German locale, mirroring the
 * "a missing paragraph beats a wrong-language paragraph" rule already established for
 * city pages in `src/content/cities.ts`.
 */

import type { Locale } from '@/i18n/routing';
import type { BlogCategory, BlogLocale, BlogLocaleContent, BlogPost } from './types';
import { BLOG_LOCALES } from './types';

import { hochzeitsDjChecklistePost } from './hochzeits-dj-checkliste';
import { wasKostetEinHochzeitsDjPost } from './was-kostet-ein-hochzeits-dj';
import { tuerkischeHochzeitPost } from './tuerkische-hochzeit-ablauf-musik-timing';
import { kinaGecesiPost } from './kina-gecesi-henna-abend-planen';
import { eroeffnungstanzPost } from './eroeffnungstanz-songauswahl';
import { djLiveBandPost } from './dj-live-band-oder-beides';
import { musikwuenschePost } from './musikwuensche-no-go-liste';
import { dramaturgiePost } from './dramaturgie-hochzeitsabend';
import { laermschutzPost } from './laermschutz-sperrzeiten-baden-wuerttemberg';
import { freieTrauungPost } from './freie-trauung-beschallung-mikrofone-wetter';
import { deutschTuerkischePost } from './deutsch-tuerkische-hochzeit-zwei-familien';
import { timelinePost } from './hochzeits-timeline-musterablauf';
import { akustikPost } from './location-akustik-checkliste';
import { davulZurnaPost } from './davul-zurna-halay-roman-havasi';
import { destinationPost } from './destination-wedding-dj-buchen';
import { echteHochzeitGrosseFeierPost } from './echte-hochzeit-vorlage-grosse-feier';
import { echteHochzeitKinaAbendPost } from './echte-hochzeit-vorlage-kina-abend';

export type {
  BlogPost,
  BlogLocaleContent,
  BlogTranslations,
  BlogTemplateField,
  BlogCategory,
  BlogPostType,
  BlogPostStatus,
  BlogSeo,
  BlogLocale,
} from './types';
export { BLOG_LOCALES } from './types';

/**
 * Editorial order — matches the publishing cadence in docs/BLOG-PLAN.md, oldest
 * `publishedAt` first. Re-export order intentionally mirrors reading order on a future
 * `/ratgeber` index, not import/alphabetical order.
 */
export const blogPosts: BlogPost[] = [
  hochzeitsDjChecklistePost,
  wasKostetEinHochzeitsDjPost,
  tuerkischeHochzeitPost,
  kinaGecesiPost,
  eroeffnungstanzPost,
  djLiveBandPost,
  musikwuenschePost,
  dramaturgiePost,
  laermschutzPost,
  freieTrauungPost,
  deutschTuerkischePost,
  timelinePost,
  akustikPost,
  davulZurnaPost,
  destinationPost,
  // Recap templates — status: 'template', excluded from getPublishedGuides().
  echteHochzeitGrosseFeierPost,
  echteHochzeitKinaAbendPost,
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getPostById(id: string): BlogPost | undefined {
  return blogPosts.find((post) => post.id === id);
}

export function getPostsByCategory(category: BlogCategory): BlogPost[] {
  return blogPosts.filter((post) => post.category === category);
}

export function getPostsByTag(tag: string): BlogPost[] {
  return blogPosts.filter((post) => post.tags.includes(tag));
}

/** The 15 finished, content-complete guide articles — excludes the 2 recap templates. */
export function getPublishedGuides(): BlogPost[] {
  return blogPosts.filter((post) => post.type === 'guide' && post.status === 'published');
}

/** The fill-in-the-blank real-wedding templates — never render these publicly as-is (`status: 'template'`). */
export function getRecapTemplates(): BlogPost[] {
  return blogPosts.filter((post) => post.type === 'recap');
}

/**
 * Resolves a post's localized content for `locale`. Unlike `resolveAnswerText()` in
 * `src/content/answers.ts` (which always falls back to German), this returns `null` for
 * a locale with no real translation — every post today has de/tr/en, so this only
 * matters once ku/fr/es entries start appearing per the docs/BLOG-PLAN.md backlog.
 */
export function resolveBlogLocale(post: BlogPost, locale: Locale): BlogLocaleContent | null {
  if (!isBlogLocale(locale)) return null;
  return post.translations[locale] ?? null;
}

export function isBlogLocale(locale: Locale): locale is BlogLocale {
  return (BLOG_LOCALES as readonly string[]).includes(locale);
}

/** Locales this specific post actually has real content for. */
export function getReadyLocalesForPost(post: BlogPost): BlogLocale[] {
  return BLOG_LOCALES.filter((locale) => post.translations[locale] !== undefined);
}

/** Most recent `updatedAt` across the whole corpus — ISO strings sort lexicographically. */
export function latestBlogUpdate(): string {
  return blogPosts.reduce((latest, post) => (post.updatedAt > latest ? post.updatedAt : latest), blogPosts[0].updatedAt);
}
