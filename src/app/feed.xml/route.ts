import { NextRequest, NextResponse } from 'next/server';
import { getPublishedGuides, getPostSlug, isBlogLocale, resolveBlogLocale, latestBlogUpdate } from '@/content/blog';
import { defaultLocale, localeTags, locales, type Locale } from '@/i18n/routing';
import { absoluteUrl, siteBaseUrl } from '@/lib/seo';
import { site } from '@/content/site';

/**
 * GET /feed.xml[?locale=xx] — RSS 2.0 for the Ratgeber/Blog.
 *
 * Sits at the app root, not under `[locale]`, on purpose: the proxy matcher
 * (`src/proxy.ts`) deliberately skips any path containing a dot, so a
 * `/ratgeber/feed.xml` would never get next-intl's locale rewrite and would
 * 404. One root route with a `?locale=` switch is the shape that actually
 * works here, and it keeps a single canonical feed URL to hand out.
 *
 * Why a feed at all, for a wedding DJ: it is the cheapest possible
 * syndication surface. Feed readers, newsletter tools and several answer
 * engines' ingestion pipelines all consume RSS directly, and unlike the
 * sitemap it carries the actual text of each article's opening paragraph —
 * the passage `BlogLocaleContent.excerpt` is written to be lifted verbatim
 * (see its doc comment and docs/GEO-STRATEGY.md).
 *
 * Only `BLOG_LOCALES` (de/tr/en) resolve; anything else falls back to German
 * rather than emitting an empty channel, matching what `/ratgeber` itself
 * does for those locales.
 */
export const dynamic = 'force-dynamic';

/**
 * XML has five predefined entities and no others. Article titles and excerpts
 * are hand-written prose containing `&`, quotes and the occasional `<` — one
 * unescaped ampersand makes the whole document unparseable for every reader,
 * which is why this is not optional and not a regex over a single character.
 */
function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** RFC 822 date — the format RSS 2.0 requires, which is not ISO 8601. */
function rfc822(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toUTCString();
}

function resolveLocale(raw: string | null): Locale {
  if (raw && (locales as readonly string[]).includes(raw) && isBlogLocale(raw as Locale)) {
    return raw as Locale;
  }
  return defaultLocale;
}

export async function GET(request: NextRequest) {
  const locale = resolveLocale(request.nextUrl.searchParams.get('locale'));
  const indexUrl = absoluteUrl('/ratgeber', locale);
  const feedUrl = new URL(`/feed.xml${locale === defaultLocale ? '' : `?locale=${locale}`}`, siteBaseUrl()).toString();

  const items = getPublishedGuides()
    .map((post) => ({ post, content: resolveBlogLocale(post, locale) }))
    .filter((entry): entry is { post: (typeof entry)['post']; content: NonNullable<(typeof entry)['content']> } =>
      entry.content !== null,
    )
    // Newest first — the order every feed reader expects.
    .sort((a, b) => (a.post.publishedAt > b.post.publishedAt ? -1 : 1))
    .map(({ post, content }) => {
      const url = absoluteUrl('/ratgeber/[slug]', locale, { slug: getPostSlug(post, locale) });
      return [
        '    <item>',
        `      <title>${xmlEscape(content.title)}</title>`,
        `      <link>${xmlEscape(url)}</link>`,
        // Permanent, never-reused identifier. `isPermaLink="false"` because the
        // post id is a CMS key, not a URL — claiming otherwise makes readers
        // try to fetch it.
        `      <guid isPermaLink="false">${xmlEscape(post.id)}</guid>`,
        `      <pubDate>${rfc822(post.publishedAt)}</pubDate>`,
        `      <description>${xmlEscape(content.excerpt)}</description>`,
        '    </item>',
      ].join('\n');
    });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${xmlEscape(`${site.name} — Ratgeber`)}</title>`,
    `    <link>${xmlEscape(indexUrl)}</link>`,
    `    <description>${xmlEscape(site.tagline[locale] ?? site.tagline.de)}</description>`,
    `    <language>${xmlEscape(localeTags[locale])}</language>`,
    `    <lastBuildDate>${rfc822(latestBlogUpdate())}</lastBuildDate>`,
    // Self-reference: lets a reader that was handed the file re-find its source.
    `    <atom:link href="${xmlEscape(feedUrl)}" rel="self" type="application/rss+xml"/>`,
    ...items,
    '  </channel>',
    '</rss>',
  ].join('\n');

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      // Same reasoning as /api/faq: the content only changes when someone
      // edits src/content/blog by hand.
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
