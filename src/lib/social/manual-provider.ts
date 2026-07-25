/**
 * Default provider — works today with zero credentials. Reads the curated
 * list in `src/content/social.ts`, the only place this project hand-picks
 * which Instagram/YouTube content is "wedding site" material versus the
 * hiking photos and personal posts also on @dj_veys's profile (see
 * BRAND-FACTS.md). Ships empty until the client supplies verified entries —
 * see that file's header.
 */
import { curatedSocialPosts } from '@/content/social';
import { cacheRemoteImage } from './media-cache';
import type { SocialPlatform, SocialPost, SocialProvider } from './types';

export class ManualProvider implements SocialProvider {
  /** Restrict to one platform (used by the per-platform strips); omit for the combined feed. */
  constructor(private readonly platform?: SocialPlatform) {}

  async fetchPosts(limit: number): Promise<SocialPost[]> {
    const source = this.platform
      ? curatedSocialPosts.filter((post) => post.platform === this.platform)
      : curatedSocialPosts;

    return Promise.all(source.slice(0, limit).map(resolveThumbnail));
  }
}

/** A curated entry may already point at a local `public/…` asset — only remote URLs need caching. */
async function resolveThumbnail(post: SocialPost): Promise<SocialPost> {
  if (!post.thumbnailUrl || post.thumbnailUrl.startsWith('/')) return post;
  return { ...post, thumbnailUrl: await cacheRemoteImage(post.thumbnailUrl) };
}
