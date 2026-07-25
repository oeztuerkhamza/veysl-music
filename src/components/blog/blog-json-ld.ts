import { breadcrumbSchema, organizationSchema } from '@/lib/schema';
import { localeTags, type Locale } from '@/i18n/routing';
import { site } from '@/content/site';
import type { BlogLocaleContent, BlogPost } from '@/content/blog';

/**
 * `src/lib/schema.ts` (owned by the SEO agent, outside this task's
 * ownership) has no `articleSchema()`/`blogPostingSchema()` builder yet. This
 * composes the two generic builders it DOES export — `organizationSchema()`
 * for `publisher`/`author`, `breadcrumbSchema()` — with a hand-rolled
 * `BlogPosting` object kept local to this ownership block. Identical pattern
 * to `src/components/city/city-json-ld.ts`'s local `Service` object, which
 * has the same "not every page-specific schema belongs in the shared file"
 * rationale. Worth promoting a `blogPostingSchema()` into `src/lib/schema.ts`
 * later for reuse — see the final report.
 *
 * `image` is deliberately omitted: no real, non-placeholder cover photo
 * exists for any post yet (`.claude/BRAND-FACTS.md` — no fabricated/stock
 * images). Add it here once `PostCover`/`SiteImage` resolves a real photo
 * for `blog.cover.<slug>`.
 */

interface BuildPostJsonLdArgs {
  post: BlogPost;
  content: BlogLocaleContent;
  locale: Locale;
  pageUrl: string;
  indexUrl: string;
  indexLabel: string;
  homeUrl: string;
}

// The shared `@/lib/schema` interfaces use literal `'@type'` string unions
// with no index signature — widen only the static type for the array below,
// the runtime shape is exactly what `<JsonLd>` expects.
function asRecord(value: object): Record<string, unknown> {
  return value as Record<string, unknown>;
}

export function buildPostJsonLd({ post, content, locale, pageUrl, indexUrl, indexLabel, homeUrl }: BuildPostJsonLdArgs): Record<string, unknown>[] {
  const publisher = organizationSchema(locale);

  const article = {
    '@context': 'https://schema.org' as const,
    '@type': 'BlogPosting' as const,
    headline: content.title,
    description: content.excerpt,
    inLanguage: localeTags[locale],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    timeRequired: `PT${post.readingTimeMinutes}M`,
    keywords: post.tags.join(', '),
    url: pageUrl,
    mainEntityOfPage: { '@type': 'WebPage' as const, '@id': pageUrl },
    author: { '@type': 'Organization' as const, '@id': publisher['@id'], name: site.name },
    publisher: { '@id': publisher['@id'] },
  };

  const breadcrumb = breadcrumbSchema([
    { name: site.name, url: homeUrl },
    { name: indexLabel, url: indexUrl },
    { name: content.title, url: pageUrl },
  ]);

  return [asRecord(publisher), article, asRecord(breadcrumb)];
}

interface BuildIndexJsonLdArgs {
  locale: Locale;
  homeUrl: string;
  indexUrl: string;
  indexLabel: string;
}

/** Lightweight breadcrumb-only graph for `/ratgeber` — only emit when the locale actually has articles (see `blog-seo.ts`'s `hasArticles` gate); an empty-shell locale gets no JSON-LD at all. */
export function buildIndexJsonLd({ locale, homeUrl, indexUrl, indexLabel }: BuildIndexJsonLdArgs): Record<string, unknown>[] {
  const publisher = organizationSchema(locale);
  const breadcrumb = breadcrumbSchema([
    { name: site.name, url: homeUrl },
    { name: indexLabel, url: indexUrl },
  ]);

  return [asRecord(publisher), asRecord(breadcrumb)];
}
