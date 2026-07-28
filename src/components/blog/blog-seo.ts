import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getPathname } from '@/i18n/navigation';
import { defaultLocale, type Locale } from '@/i18n/routing';
import { buildMetadata, siteBaseUrl } from '@/lib/seo';
import { site } from '@/content/site';
import { BLOG_LOCALES, getPostSlug, type BlogLocaleContent, type BlogPost } from '@/content/blog';

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

/** Absolute URL of one article in one locale. `post` (not a raw slug) so the per-locale slug is always resolved via `getPostSlug()`. */
export function ratgeberPostUrl(locale: Locale, post: BlogPost): string {
  const path = getPathname({
    href: { pathname: '/ratgeber/[slug]', params: { slug: getPostSlug(post, locale) } },
    locale,
  });
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

  const rawBase = await buildMetadata({
    locale,
    pathname: '/ratgeber',
    values: { count: postCount },
    availableLocales,
    noIndex: !hasArticles,
  });

  // RSS discovery. `<link rel="alternate" type="application/rss+xml">` on the
  // index is how readers, newsletter tools and several answer-engine
  // ingestion pipelines find a feed at all — an unadvertised feed is a feed
  // nobody subscribes to. The route lives at `/feed.xml` (see its own file for
  // why it cannot sit under the localized `/ratgeber` path) and takes the
  // locale as a query parameter for anything but German.
  const feedHref = `/feed.xml${locale === defaultLocale ? '' : `?locale=${locale}`}`;
  const base: Metadata = {
    ...rawBase,
    alternates: {
      ...rawBase.alternates,
      types: { 'application/rss+xml': [{ url: feedHref, title: `${site.name} — Ratgeber` }] },
    },
  };

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
    params: { slug: getPostSlug(post, locale) },
    // Each language's alternate has to point at that language's own slug —
    // `/en/guide/wedding-dj-checklist`, not the German slug under an English
    // prefix. Built for every locale this post exists in, so hreflang, the
    // canonical and the sitemap all agree.
    paramsByLocale: Object.fromEntries(
      availableLocales.map((l) => [l, { slug: getPostSlug(post, l) }]),
    ) as Partial<Record<Locale, { slug: string }>>,
    availableLocales,
  });

  const title = content.seo.metaTitle;
  const description = content.seo.metaDescription;

  return {
    ...base,
    // `absolute`, for the same reason `buildMetadata()` uses it: every
    // `seo.metaTitle` in the corpus already ends in "| DJ Veys", and a plain
    // string here would run it through the layout's `%s | DJ Veys` template
    // again — putting the brand in twice on all 45 article URLs, which is
    // exactly the bug that was fixed everywhere else. Overriding `title` on a
    // spread of `base` silently discards base's `{ absolute }` wrapper, so the
    // fix has to be repeated at every override site, and this is the only one.
    title: { absolute: title },
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
