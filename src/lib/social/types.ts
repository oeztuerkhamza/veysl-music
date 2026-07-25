/**
 * The social-feed data contract. This is the seam the admin-panel/database
 * agent builds against: `CmsProvider` (see `cms-provider.ts`) reads a
 * Payload collection instead of the filesystem/RSS/Graph API, but is a
 * drop-in implementation of the exact same interface, selected in
 * `provider.ts` exactly like the other three — no component or route
 * changes required.
 *
 * Kept deliberately small and platform-agnostic. Do not add
 * platform-specific fields here (e.g. Instagram's `media_type` raw string,
 * a raw YouTube video ID) — normalize those into this shape inside each
 * provider instead, so every consumer downstream only ever deals with one
 * shape regardless of source.
 */

import type { Locale } from '@/i18n/routing';

export type SocialPlatform = 'instagram' | 'youtube';

export type SocialPostType = 'image' | 'video' | 'carousel' | 'reel';

/**
 * Which surface a curated post should appear on. Only `CmsProvider` honours
 * this — it's the point of the `placement` field on the `curated-posts`
 * collection (see docs/SOCIAL-FEED.md §9). Automatic feeds and the legacy
 * `ManualProvider` list are placement-agnostic and ignore it.
 */
export const socialPlacements = ['home', 'gallery', 'contact'] as const;
export type SocialPlacement = (typeof socialPlacements)[number];

export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  permalink: string;
  type: SocialPostType;
  caption: string | null;
  /**
   * Always a first-party URL (a local `/…` asset, a Payload-served
   * `/api/media/…` upload, or a path served by `/api/social/media/[id]`, see
   * `media-cache.ts`) — never a raw instagram.com/ytimg.com/fbcdn.net URL.
   * `null` means no usable image could be resolved; consumers must render a
   * designed placeholder, not an error or a broken `<img>`.
   */
  thumbnailUrl: string | null;
  /**
   * ISO 8601. For CMS-curated posts this is when the entry was added to the
   * curation list, not necessarily the original post's real publish date —
   * see docs/SOCIAL-FEED.md §9 for why that isn't derivable from a bare
   * permalink.
   */
  postedAt: string;
  /** Admin-curated pin — sorts first when present and `true`. */
  featured?: boolean;
  /**
   * Manual curation order (lower = earlier), meaningful only among posts
   * that both set it. Automatic-feed posts never set this and keep sorting
   * by `postedAt`.
   */
  sortOrder?: number;
}

export interface SocialProviderFetchOptions {
  placement?: SocialPlacement;
  /**
   * Locale to resolve localized fields in (currently only `CmsProvider`'s
   * `captionOverride`). Defaults to the German default locale when omitted.
   *
   * Bewusst `Locale` und nicht `string`: Payloads `find()` erwartet die
   * exakte Locale-Union, ein loses `string` bricht dort den Build.
   */
  locale?: Locale;
}

export interface SocialProvider {
  fetchPosts(limit: number, options?: SocialProviderFetchOptions): Promise<SocialPost[]>;
}
