/**
 * YouTube publishes a public RSS/Atom feed per channel at
 * `https://www.youtube.com/feeds/videos.xml?channel_id=<ID>` — no API key,
 * no OAuth, no quota, no Google Cloud project. This provider is the one feed
 * in this module that is genuinely automatic and free.
 *
 * The one thing the feed needs that `site.ts` doesn't have yet is the
 * channel's internal `UC…` ID (the public `@handle` doesn't work as a query
 * param). Two ways to supply it:
 *   1. Set `YOUTUBE_CHANNEL_ID` — takes priority, zero runtime cost.
 *   2. Leave it unset: this provider resolves it once by fetching the
 *      public `@handle` page and scraping the `"channelId":"UC…"` string
 *      that YouTube embeds in that page's HTML, then caches the result in
 *      memory for `CHANNEL_ID_TTL_MS`. No login, no key — same trust level
 *      as a browser loading the page.
 * See docs/SOCIAL-FEED.md for operational detail.
 */
import { site } from '@/content/site';
import { youTubeThumbnailUrl } from './embed';
import { cacheRemoteImage } from './media-cache';
import type { SocialPost, SocialProvider } from './types';

const CHANNEL_ID_TTL_MS = 24 * 60 * 60 * 1000;
const FEED_REVALIDATE_SECONDS = 60 * 60; // ~1h, per the caching strategy in docs/SOCIAL-FEED.md
const HANDLE_REVALIDATE_SECONDS = 60 * 60 * 24;

let cachedChannelId: { id: string; resolvedAt: number } | null = null;

async function resolveChannelId(): Promise<string | null> {
  const override = process.env.YOUTUBE_CHANNEL_ID?.trim();
  if (override) return override;

  if (cachedChannelId && Date.now() - cachedChannelId.resolvedAt < CHANNEL_ID_TTL_MS) {
    return cachedChannelId.id;
  }

  try {
    const res = await fetch(site.social.youtube, {
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; VEYSLBot/1.0; +https://veysl.de)' },
      next: { revalidate: HANDLE_REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;

    const html = await res.text();
    const match = html.match(/"channelId":"(UC[a-zA-Z0-9_-]{10,})"/);
    if (!match) return null;

    cachedChannelId = { id: match[1], resolvedAt: Date.now() };
    return match[1];
  } catch (err) {
    console.warn('[social] YouTube channel-id resolution failed', err instanceof Error ? err.message : err);
    return null;
  }
}

interface RawEntry {
  videoId: string;
  title: string;
  published: string;
}

function matchTag(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return match ? decodeXmlEntities(match[1].trim()) : '';
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Minimal regex-based Atom parser — deliberately not a new `xml2js`/
 * `fast-xml-parser` dependency (CONTRACT.md: no heavy deps without asking).
 * YouTube's feed shape is stable and small; this only ever reads the four
 * fields below out of each `<entry>` block.
 */
function parseYouTubeFeed(xml: string): RawEntry[] {
  const entries: RawEntry[] = [];
  const entryPattern = /<entry>([\s\S]*?)<\/entry>/g;
  let match: RegExpExecArray | null;

  while ((match = entryPattern.exec(xml))) {
    const block = match[1];
    const videoId = matchTag(block, 'yt:videoId');
    if (!videoId) continue;
    entries.push({
      videoId,
      title: matchTag(block, 'title'),
      published: matchTag(block, 'published'),
    });
  }

  return entries;
}

async function toSocialPost(entry: RawEntry): Promise<SocialPost> {
  return {
    id: `youtube-${entry.videoId}`,
    platform: 'youtube',
    permalink: `https://www.youtube.com/watch?v=${entry.videoId}`,
    type: 'video',
    caption: entry.title || null,
    thumbnailUrl: await cacheRemoteImage(youTubeThumbnailUrl(entry.videoId)),
    postedAt: entry.published || new Date().toISOString(),
  };
}

export class YouTubeRssProvider implements SocialProvider {
  async fetchPosts(limit: number): Promise<SocialPost[]> {
    const channelId = await resolveChannelId();
    if (!channelId) return [];

    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
    const res = await fetch(feedUrl, { next: { revalidate: FEED_REVALIDATE_SECONDS } });
    if (!res.ok) return [];

    const xml = await res.text();
    const entries = parseYouTubeFeed(xml).slice(0, limit);
    return Promise.all(entries.map(toSocialPost));
  }
}
