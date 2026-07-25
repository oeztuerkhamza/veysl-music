/**
 * ⚠️ Instagram's old Basic Display API — the simple "personal access token,
 * read your own media" flow — was shut down by Meta in December 2024. It no
 * longer exists; do not build against it, and don't be fooled by tutorials
 * that still reference it.
 *
 * The only remaining path to a programmatic Instagram feed is the
 * **Instagram Graph API**, which requires:
 *   1. The Instagram account converted to a **Business or Creator** account.
 *   2. That account linked to a **Facebook Page** (Meta ties Instagram
 *      Graph API access to a Page, not the Instagram account alone).
 *   3. A **Meta app** created in the Meta Developer console, added to a
 *      **Meta Business** account, with the Instagram Graph API product
 *      enabled.
 *   4. A **long-lived access token** (~60 days, renewable before expiry) for
 *      a user with `instagram_basic` permission on that Page/IG account.
 *
 * Full click-by-click steps: docs/SOCIAL-FEED.md. None of this exists yet
 * for @dj_veys — this class is written to work the moment
 * `INSTAGRAM_ACCESS_TOKEN` + `INSTAGRAM_BUSINESS_ACCOUNT_ID` are set, and to
 * return an empty list (never throw, never fake data) until then.
 */
import { cacheRemoteImage } from './media-cache';
import type { SocialPost, SocialProvider } from './types';

const GRAPH_API_VERSION = 'v21.0';
const REVALIDATE_SECONDS = 60 * 60;

interface RawInstagramMedia {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
}

interface RawInstagramMediaResponse {
  data?: RawInstagramMedia[];
  error?: { message: string };
}

function mapMediaType(type: RawInstagramMedia['media_type']): SocialPost['type'] {
  switch (type) {
    case 'VIDEO':
      return 'reel';
    case 'CAROUSEL_ALBUM':
      return 'carousel';
    case 'IMAGE':
    default:
      return 'image';
  }
}

async function toSocialPost(media: RawInstagramMedia): Promise<SocialPost> {
  // Video posts only expose a still via `thumbnail_url`; `media_url` on a
  // video is the video file itself, not usable as a grid thumbnail.
  const remoteThumbnail = media.media_type === 'VIDEO' ? media.thumbnail_url : media.media_url;

  return {
    id: `instagram-${media.id}`,
    platform: 'instagram',
    permalink: media.permalink,
    type: mapMediaType(media.media_type),
    caption: media.caption?.trim() || null,
    thumbnailUrl: await cacheRemoteImage(remoteThumbnail),
    postedAt: media.timestamp,
  };
}

export class InstagramGraphProvider implements SocialProvider {
  async fetchPosts(limit: number): Promise<SocialPost[]> {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN;
    const businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
    if (!token || !businessAccountId) return [];

    const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
    const url =
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${encodeURIComponent(businessAccountId)}/media` +
      `?fields=${fields}&limit=${limit}&access_token=${encodeURIComponent(token)}`;

    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) {
      console.warn(`[social] Instagram Graph API responded ${res.status}`);
      return [];
    }

    const body = (await res.json()) as RawInstagramMediaResponse;
    if (body.error) {
      console.warn('[social] Instagram Graph API error', body.error.message);
      return [];
    }
    if (!body.data) return [];

    return Promise.all(body.data.slice(0, limit).map(toSocialPost));
  }
}
