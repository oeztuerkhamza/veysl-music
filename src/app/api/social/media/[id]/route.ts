/**
 * GET /api/social/media/[id]
 *
 * Serves a locally cached social-media thumbnail (see
 * `src/lib/social/media-cache.ts`). This is the only network hop a
 * visitor's browser ever makes for a feed image — it never talks to
 * Instagram's or YouTube's CDN directly. See docs/SOCIAL-FEED.md for why
 * that's the point.
 *
 * Not rate-limited like `/api/social`: a single grid legitimately fires a
 * dozen of these on one pageview (one per thumbnail), and they're
 * effectively static, immutable, content-addressed assets — the same
 * traffic profile as any other image on the page.
 */
import { NextResponse } from 'next/server';
import { readCachedMedia } from '@/lib/social/media-cache';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const cached = await readCachedMedia(id);

  if (!cached) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(new Uint8Array(cached.buffer), {
    status: 200,
    headers: {
      'Content-Type': cached.contentType,
      // The id is a hash of the source URL, so a given id's bytes never change.
      'Cache-Control': 'public, max-age=604800, immutable',
    },
  });
}
