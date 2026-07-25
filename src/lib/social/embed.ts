/**
 * On-site YouTube embed/thumbnail helpers. The embed URL builder is used
 * only by `<YouTubeStrip>`'s click-to-load facade (see
 * components/pages/video-facade.tsx). Deliberately has no Instagram
 * equivalent: Instagram has no plain, script-free iframe embed that doesn't
 * involve loading instagram.com content into the page, so Instagram posts
 * always link out instead — see docs/SOCIAL-FEED.md.
 */
import { parseSocialPermalink } from './permalink';

/** youtube-nocookie.com avoids setting YouTube's regular-domain cookies until the visitor opts in by clicking play. */
export function youTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
}

/**
 * Stable, keyless YouTube thumbnail URL. Uses `hqdefault.jpg` (480×360,
 * guaranteed to exist for every public video) rather than `maxresdefault.jpg`:
 * the higher-res variant silently returns HTTP 200 with a tiny grey 120×90
 * placeholder image for a large share of videos (older uploads, Shorts, some
 * mobile uploads) instead of 404ing — which would otherwise get cached as a
 * "real" thumbnail with no easy way to detect it after the fact. `hqdefault`
 * trades a little resolution for never being wrong. See docs/SOCIAL-FEED.md §9.
 */
export function youTubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

/** Extracts an 11-char YouTube video id from a watch/shorts/`youtu.be` permalink. `SocialPost` only carries the permalink, not a raw id. */
export function extractYouTubeVideoId(permalink: string): string | null {
  const parsed = parseSocialPermalink(permalink);
  return parsed?.platform === 'youtube' ? parsed.id : null;
}
