import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getPathname } from '@/i18n/navigation';
import { type Locale } from '@/i18n/routing';
import { buildMetadata, siteBaseUrl } from '@/lib/seo';
import { site } from '@/content/site';
import { BLOG_LOCALES, type BlogLocaleContent, type BlogPost } from '@/content/blog';

/**
 * Metadata plumbing for `/ratgeber` and `/ratgeber/[slug]`, built on top of
 * the shared `buildMetadata()` (`@/lib/seo`, owned by the SEO agent). That
 * builder now registers both routes (`messageNamespaceByPathname['/ratgeber']`
 * / `['/ratgeber/[slug]']` → `'blog.meta'`, and `/ratgeber/[slug]` is in its
 * `DynamicPathname` union) with an explicit comment: the index reads
 * `blog.meta.*` directly, and the article route's `blog.meta` entry is "just
 * a harmless fallback, never the real source" — each post carries its own
 * `BlogSeo.metaTitle`/`.metaDescription` (`src/content/blog/types.ts`), which
 * `buildRatgeberPostMetadata()` below overrides onto the base result, exactly
 * as that comment prescribes.
 */

export function ratgeberIndexUrl(locale: Locale): string {
  return new URL(getPathname({ href: '/ratgeber', locale }), siteBaseUrl()).toString();
}

export function ratgeberPostUrl(locale: Locale, slug: string): string {
  const path = getPathname({ href: { pathname: '/ratgeber/[slug]', params: { slug } }, locale });
  return new URL(path, siteBaseUrl()).toString();
}

/**
 * `/ratgeber` renders (via `<BlogEmptyState>`) in all seven locales, because
 * `routing.pathnames['/ratgeber']` registers a slug for every one — but only
 * `de`/`tr`/`en` (`BLOG_LOCALES`) currently have real articles. hreflang and
 * the sitemap should not claim seven equivalent, indexable translations of a
 * page that is a genuine 15-article index in three languages and an empty
 * shell in the other four. `postCount` gates `noIndex` (empty shell →
 * `noindex`) and `availableLocales` is restricted to `BLOG_LOCALES` plus the
 * current locale, so the page always at least self-references in hreflang.
 * See the final report for the full "exclude ku/nl/fr/es from hreflang and
 * the sitemap" reasoning this implements.
 */
export async function buildRatgeberIndexMetadata(locale: Locale, postCount: number): Promise<Metadata> {
  const hasArticles = postCount > 0;
  const availableLocales = Array.from(new Set<Locale>([...BLOG_LOCALES, locale]));

  const base = await buildMetadata({
    locale,
    pathname: '/ratgeber',
    values: { count: postCount },
    availableLocales,
    noIndex: !hasArticles,
  });

  if (hasArticles) return base;

  // `blog.meta.description` (read above) always reads as "{count} guides…" —
  // wrong when count is 0. Swap in the "coming soon" copy for the empty-shell
  // locales instead, everything else about `base` (canonical, hreflang,
  // robots: noindex, images) stays as `buildMetadata()` computed it.
  const t = await getTranslations({ locale, namespace: 'blog.index.meta' });
  const description = t('emptyDescription');

  return {
    ...base,
    description,
    openGraph: base.openGraph ? { ...base.openGraph, description } : base.openGraph,
    twitter: base.twitter ? { ...base.twitter, description } : base.twitter,
  };
}

/**
 * Per-post metadata. `title`/`description` (and their OG/Twitter mirrors)
 * come from `content.seo` — real content, not UI chrome — overridden onto
 * `buildMetadata()`'s base result. `openGraph.type` is upgraded to
 * `'article'` with `publishedTime`/`modifiedTime`/`authors`/`tags`, which the
 * shared builder's generic `'website'` type doesn't set.
 */
export async function buildRatgeberPostMetadata(
  locale: Locale,
  post: BlogPost,
  content: BlogLocaleContent,
  availableLocales: Locale[]
): Promise<Metadata> {
  const base = await buildMetadata({
    locale,
    pathname: '/ratgeber/[slug]',
    params: { slug: post.slug },
    availableLocales,
  });

  const title = content.seo.metaTitle;
  const description = content.seo.metaDescription;

  return {
    ...base,
    title,
    description,
    openGraph: {
      ...base.openGraph,
      type: 'article',
      title,
      description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [site.name],
      tags: post.tags,
    },
    twitter: base.twitter ? { ...base.twitter, title, description } : base.twitter,
  };
}
