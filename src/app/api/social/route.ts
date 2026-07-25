/**
 * GET /api/social[?platform=instagram|youtube][&limit=1-24]
 *
 * Cached JSON feed for the client components in `src/components/social/`
 * and for anything else that would rather fetch structured data than parse
 * HTML — the same "expose the content module as stable JSON" pattern as
 * `src/app/api/faq/route.ts`, and the read path the future admin panel can
 * reuse to preview what's live without re-implementing the provider logic.
 *
 * No secrets ever reach the client: this only ever returns the normalized
 * `SocialPost` shape (see `src/lib/social/types.ts`), never a raw provider
 * response, an access token, or an upstream URL.
 */
import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_FEED_LIMIT, getInstagramPosts, getSocialFeed, getYouTubePosts, MAX_FEED_LIMIT } from '@/lib/social/provider';
import { getClientIp, isRateLimited } from '../_lib/rate-limit';

export const dynamic = 'force-dynamic';

type PlatformFilter = 'instagram' | 'youtube';

function isKnownPlatform(value: string | null): value is PlatformFilter {
  return value === 'instagram' || value === 'youtube';
}

function clampLimit(value: string | null): number {
  const parsed = value ? Number(value) : DEFAULT_FEED_LIMIT;
  if (!Number.isFinite(parsed)) return DEFAULT_FEED_LIMIT;
  return Math.min(Math.max(Math.trunc(parsed), 1), MAX_FEED_LIMIT);
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);

  // Generous read-only limit — this backs public components rendered on
  // every pageview, not a form submission; it only needs to stop abuse, not
  // normal browsing.
  if (isRateLimited(`social:${ip}`, { capacity: 60, windowMs: 60_000 })) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  const platformParam = request.nextUrl.searchParams.get('platform');
  const platform = isKnownPlatform(platformParam) ? platformParam : null;
  const limit = clampLimit(request.nextUrl.searchParams.get('limit'));

  const items =
    platform === 'instagram'
      ? await getInstagramPosts(limit)
      : platform === 'youtube'
        ? await getYouTubePosts(limit)
        : await getSocialFeed(limit);

  return NextResponse.json(
    {
      ok: true,
      generatedAt: new Date().toISOString(),
      platform,
      count: items.length,
      items,
    },
    {
      status: 200,
      headers: {
        // Matches the ~1h provider revalidate window described in docs/SOCIAL-FEED.md.
        'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
      },
    }
  );
}
