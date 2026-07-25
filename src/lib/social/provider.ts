/**
 * Provider selection — mirrors the pattern in
 * `src/app/api/anfrage/_lib/transport.ts`: callers (components, the
 * `/api/social` route) only ever talk to the `SocialProvider` interface via
 * the functions below; which concrete implementation(s) answer is decided
 * here, by environment, in one place.
 *
 * Resolution order per platform, per the client's "I want to hand-pick what
 * shows up" requirement: `CmsProvider` (admin-curated) first, falling back
 * to `ManualProvider` (the zero-credential `src/content/social.ts` list),
 * falling back to the fully automatic feed — YouTube's free RSS always,
 * Instagram's Graph API only once a token exists. The first provider in the
 * chain that returns at least one post wins; every step fails soft, so a
 * half-built admin panel, an empty curation list, or a missing token all
 * degrade quietly to the next step instead of an error.
 */
import { CmsProvider } from './cms-provider';
import { InstagramGraphProvider } from './instagram-graph-provider';
import { ManualProvider } from './manual-provider';
import type { SocialPost, SocialProvider, SocialProviderFetchOptions } from './types';
import { YouTubeRssProvider } from './youtube-rss-provider';

export const DEFAULT_FEED_LIMIT = 9;
export const MAX_FEED_LIMIT = 24;

/** Tries each provider in order; returns the first non-empty result. Every step is individually fail-soft. */
class FallbackSocialProvider implements SocialProvider {
  constructor(
    private readonly providers: SocialProvider[],
    private readonly label: string
  ) {}

  async fetchPosts(limit: number, options?: SocialProviderFetchOptions): Promise<SocialPost[]> {
    for (const provider of this.providers) {
      const posts = await safeFetchOne(provider, limit, options, this.label);
      if (posts.length > 0) return posts;
    }
    return [];
  }
}

async function safeFetchOne(
  provider: SocialProvider,
  limit: number,
  options: SocialProviderFetchOptions | undefined,
  label: string
): Promise<SocialPost[]> {
  try {
    return await provider.fetchPosts(limit, options);
  } catch (err) {
    console.warn(`[social] a ${label} provider step failed, trying the next fallback`, err instanceof Error ? err.message : err);
    return [];
  }
}

/** CMS-curated → zero-cred curated list → Instagram Graph API once a token + business account id exist. */
export function getInstagramProvider(): SocialProvider {
  const providers: SocialProvider[] = [new CmsProvider('instagram'), new ManualProvider('instagram')];
  if (process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID) {
    providers.push(new InstagramGraphProvider());
  }
  return new FallbackSocialProvider(providers, 'instagram');
}

/** CMS-curated → zero-cred curated list → YouTube's free RSS feed (always available, no credentials needed). */
export function getYouTubeProvider(): SocialProvider {
  return new FallbackSocialProvider([new CmsProvider('youtube'), new ManualProvider('youtube'), new YouTubeRssProvider()], 'youtube');
}

export async function getInstagramPosts(limit: number = DEFAULT_FEED_LIMIT, options?: SocialProviderFetchOptions): Promise<SocialPost[]> {
  return sortPosts(await safeFetchOne(getInstagramProvider(), limit, options, 'instagram'));
}

export async function getYouTubePosts(limit: number = DEFAULT_FEED_LIMIT, options?: SocialProviderFetchOptions): Promise<SocialPost[]> {
  return sortPosts(await safeFetchOne(getYouTubeProvider(), limit, options, 'youtube'));
}

/** Combined feed for `<SocialGrid>` — featured pins and `sortOrder` first (curated posts), then newest first. */
export async function getSocialFeed(limit: number = DEFAULT_FEED_LIMIT, options?: SocialProviderFetchOptions): Promise<SocialPost[]> {
  const [instagram, youtube] = await Promise.all([getInstagramPosts(limit, options), getYouTubePosts(limit, options)]);
  return sortPosts([...instagram, ...youtube]).slice(0, limit);
}

function sortPosts(posts: SocialPost[]): SocialPost[] {
  return [...posts].sort((a, b) => {
    if (Boolean(a.featured) !== Boolean(b.featured)) return a.featured ? -1 : 1;
    if (a.sortOrder != null && b.sortOrder != null && a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    if (a.sortOrder != null && b.sortOrder == null) return -1;
    if (a.sortOrder == null && b.sortOrder != null) return 1;
    return b.postedAt.localeCompare(a.postedAt);
  });
}
