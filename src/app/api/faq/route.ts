import { NextRequest, NextResponse } from 'next/server';
import { locales, type Locale } from '@/i18n/routing';
import { site } from '@/content/site';
import {
  answers,
  ANSWER_CATEGORIES,
  getVisibleAnswers,
  isReligiousAnswer,
  resolveAnswerText,
  latestAnswerUpdate,
  type AnswerCategory,
  type LocalizedAnswerText,
} from '@/content/answers';

/**
 * GET /api/faq[?locale=xx][&category=yy]
 *
 * Machine-readable feed of the GEO answer corpus (`@/content/answers`) — the
 * same content rendered on `/fragen`, exposed as stable JSON for anything
 * that would rather fetch structured data than parse HTML (answer-engine
 * crawlers, other internal tools, a future CMS migration check). Note for
 * whoever owns `public/llms.txt` (the SEO agent): that file should link here
 * so crawlers reading it know a structured feed exists — see the GEO agent's
 * report for the exact line to add.
 *
 * - No `?locale=`: returns every entry with ALL of its actually-authored
 *   translations (only the locales that really exist per entry — German and
 *   Turkish are guaranteed, others are included only where written). This is
 *   the "raw corpus" view.
 * - `?locale=xx`: returns each entry resolved to that locale (falling back
 *   to German for any entry without a translation for `xx`), as flat
 *   `question`/`answer` strings — the convenience view. Restricted to the
 *   entries that locale actually publishes: outside tr/ku/ar the nine
 *   religiously framed entries are absent, exactly as on `/fragen`.
 * - `?category=yy`: filters either shape to one category. An unknown value
 *   is ignored rather than erroring, so a probing crawler always gets a
 *   valid (if unfiltered) response.
 */
export const dynamic = 'force-dynamic';

function isKnownLocale(value: string | null): value is Locale {
  return value !== null && (locales as readonly string[]).includes(value);
}

function isKnownCategory(value: string | null): value is AnswerCategory {
  return value !== null && (ANSWER_CATEGORIES as readonly string[]).includes(value);
}

/** Only the locale keys actually present on this entry's `q` — never pads with fallback values. */
function authoredLocales(text: LocalizedAnswerText): string[] {
  return Object.keys(text);
}

export async function GET(request: NextRequest) {
  const localeParam = request.nextUrl.searchParams.get('locale');
  const categoryParam = request.nextUrl.searchParams.get('category');

  const locale = isKnownLocale(localeParam) ? localeParam : undefined;
  const category = isKnownCategory(categoryParam) ? categoryParam : undefined;

  /**
   * With `?locale=`, the feed must show exactly what that locale's `/fragen`
   * shows — otherwise this endpoint becomes the back door through which the
   * religiously framed layer reaches a German or English answer engine after
   * it was deliberately taken off the German and English site
   * (src/content/islamic.ts). Without `?locale=` this stays the documented
   * "raw corpus" view and keeps every entry; the `religious` flag below tells
   * a consumer which ones are locale-restricted rather than leaving it to be
   * inferred from the category name.
   */
  const scoped = locale ? getVisibleAnswers(locale) : answers;
  const filtered = category ? scoped.filter((answer) => answer.category === category) : scoped;

  const items = locale
    ? filtered.map((answer) => ({
        id: answer.id,
        category: answer.category,
        question: resolveAnswerText(answer.q, locale),
        answer: resolveAnswerText(answer.a, locale),
        facts: answer.facts ?? [],
        related: answer.related ?? [],
        updated: answer.updated,
      }))
    : filtered.map((answer) => ({
        id: answer.id,
        category: answer.category,
        question: answer.q,
        answer: answer.a,
        availableLocales: authoredLocales(answer.q),
        religious: isReligiousAnswer(answer),
        facts: answer.facts ?? [],
        related: answer.related ?? [],
        updated: answer.updated,
      }));

  /** Category list narrowed to what actually has items in this response. */
  const visibleCategories = ANSWER_CATEGORIES.filter((name) =>
    scoped.some((answer) => answer.category === name),
  );

  const body = {
    source: `${site.url}/fragen`,
    site: site.name,
    generatedAt: new Date().toISOString(),
    corpusUpdated: latestAnswerUpdate(),
    resolvedLocale: locale ?? null,
    category: category ?? null,
    count: items.length,
    categories: visibleCategories,
    items,
  };

  return NextResponse.json(body, {
    status: 200,
    headers: {
      // Content changes only when this agent edits answers.ts by hand — safe
      // to cache generously at the CDN while staying reasonably fresh in
      // browsers. `stale-while-revalidate` keeps a crawler from ever seeing
      // a slow response once the cache is warm.
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
