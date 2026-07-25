/**
 * Parses/validates a pasted Instagram or YouTube URL into a normalized
 * shape — the piece that makes "paste a link, done" work: the client never
 * picks a platform or types an id by hand, everything is derived from the
 * URL. Used from two places:
 *
 *   1. `CmsProvider` (this module), to turn a stored `permalink` back into
 *      `platform`/`type`/`id` at read time.
 *   2. The admin agent's `curated-posts` collection, as the `permalink`
 *      field's `validate` function — import `validateSocialPermalink` from
 *      `@/lib/social` directly rather than re-implementing URL parsing in
 *      `src/payload/collections/curated-posts.ts`. See docs/SOCIAL-FEED.md §9.
 *
 * Deliberately has no network calls — this only looks at the URL's shape.
 */
import type { SocialPlatform, SocialPostType } from './types';

export interface ParsedSocialPermalink {
  platform: SocialPlatform;
  /**
   * Best-effort content type inferred purely from the URL shape:
   *   - youtube.com/shorts/…, youtu.be/…, youtube.com/watch?v=… → always 'video' (unambiguous)
   *   - instagram.com/reel/…, /reels/… → 'reel' (unambiguous)
   *   - instagram.com/p/…, /tv/… → 'image' (a safe default; a plain permalink
   *     can't distinguish a single image from a carousel — only the
   *     Instagram Graph API metadata can. `CmsProvider` uses this default
   *     as-is; there is deliberately no separate "is this a carousel"
   *     field for the client to fill in, to keep the paste-a-link flow to
   *     one field.)
   */
  type: SocialPostType;
  /** The platform's own id extracted from the URL (Instagram shortcode or YouTube video id). */
  id: string;
  /** Canonicalized permalink (tracking params/session junk stripped) — safe to store as-is. */
  permalink: string;
}

const INSTAGRAM_HOSTS = new Set(['instagram.com', 'www.instagram.com']);
const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be']);

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const INSTAGRAM_SHORTCODE_PATTERN = /^[A-Za-z0-9_-]{5,}$/;

export function parseSocialPermalink(rawUrl: string | null | undefined): ParsedSocialPermalink | null {
  const trimmed = rawUrl?.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

  const host = url.hostname.toLowerCase();

  if (INSTAGRAM_HOSTS.has(host)) {
    return parseInstagram(url);
  }
  if (YOUTUBE_HOSTS.has(host)) {
    return parseYouTube(url, host);
  }
  return null;
}

function parseInstagram(url: URL): ParsedSocialPermalink | null {
  const match = url.pathname.match(/^\/(p|reel|reels|tv)\/([^/]+)\/?/);
  if (!match) return null;

  const [, segment, shortcode] = match;
  if (!INSTAGRAM_SHORTCODE_PATTERN.test(shortcode)) return null;

  const type: SocialPostType = segment === 'reel' || segment === 'reels' ? 'reel' : 'image';
  const canonicalSegment = segment === 'reels' ? 'reel' : segment;

  return {
    platform: 'instagram',
    type,
    id: shortcode,
    permalink: `https://www.instagram.com/${canonicalSegment}/${shortcode}/`,
  };
}

function parseYouTube(url: URL, host: string): ParsedSocialPermalink | null {
  if (host === 'youtu.be') {
    const id = url.pathname.slice(1).split('/')[0];
    if (!YOUTUBE_ID_PATTERN.test(id)) return null;
    return { platform: 'youtube', type: 'video', id, permalink: `https://youtu.be/${id}` };
  }

  const shortsMatch = url.pathname.match(/^\/shorts\/([^/]+)/);
  if (shortsMatch && YOUTUBE_ID_PATTERN.test(shortsMatch[1])) {
    const id = shortsMatch[1];
    return { platform: 'youtube', type: 'video', id, permalink: `https://www.youtube.com/shorts/${id}` };
  }

  if (url.pathname === '/watch') {
    const id = url.searchParams.get('v');
    if (!id || !YOUTUBE_ID_PATTERN.test(id)) return null;
    return { platform: 'youtube', type: 'video', id, permalink: `https://www.youtube.com/watch?v=${id}` };
  }

  return null;
}

/**
 * Payload `validate` function shape for the `curated-posts.permalink` field
 * — returns `true` on success, a human-readable (German) rejection message
 * otherwise, so a bad paste is rejected with a clear reason in the admin UI
 * instead of silently saving a dead card.
 */
export function validateSocialPermalink(value: unknown): true | string {
  if (typeof value !== 'string' || !value.trim()) {
    return 'Bitte einen Instagram- oder YouTube-Link einfügen.';
  }
  if (!parseSocialPermalink(value)) {
    return 'Dieser Link wird nicht erkannt. Unterstützt werden: instagram.com/p/…, instagram.com/reel/…, youtube.com/watch?v=…, youtube.com/shorts/… und youtu.be/….';
  }
  return true;
}
