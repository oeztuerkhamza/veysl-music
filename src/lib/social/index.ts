// Transitively server-only (via `CmsProvider` → `@/lib/payload`) — do not
// import this barrel from a `'use client'` file. Nothing exported here is
// needed client-side today; if that changes, import the specific submodule
// instead of this barrel.
export type {
  SocialPlacement,
  SocialPlatform,
  SocialPost,
  SocialPostType,
  SocialProvider,
  SocialProviderFetchOptions,
} from './types';
export { socialPlacements } from './types';
export { cacheRemoteImage, readCachedMedia } from './media-cache';
export { parseSocialPermalink, validateSocialPermalink, type ParsedSocialPermalink } from './permalink';
export { ManualProvider } from './manual-provider';
export { YouTubeRssProvider } from './youtube-rss-provider';
export { InstagramGraphProvider } from './instagram-graph-provider';
export { CmsProvider } from './cms-provider';
export {
  DEFAULT_FEED_LIMIT,
  MAX_FEED_LIMIT,
  getInstagramProvider,
  getYouTubeProvider,
  getInstagramPosts,
  getYouTubePosts,
  getSocialFeed,
} from './provider';
export { youTubeEmbedUrl, youTubeThumbnailUrl, extractYouTubeVideoId } from './embed';
