/**
 * TODO(kunde): curated Instagram/YouTube posts to feature on the site.
 *
 * The admin panel's `curated-posts` collection (see docs/SOCIAL-FEED.md §9,
 * read via `CmsProvider`) is now the primary way to hand-pick posts — this
 * file (`ManualProvider`) is a secondary, zero-credential fallback that only
 * matters if the CMS is unreachable or has nothing published yet (e.g. local
 * dev before Payload is wired up). It is intentionally curation, not a raw
 * feed dump: @dj_veys also posts hiking photos and personal content (see
 * .claude/BRAND-FACTS.md), and a premium wedding site should only show
 * wedding/event content here, not everything from the profile.
 *
 * Every entry needs a REAL permalink, caption, postedAt and thumbnail
 * supplied/verified by the client — none of the above may be invented
 * (project rule, see .claude/CONTRACT.md §3 "No fabricated data"). This
 * module therefore ships as an empty array on purpose: nothing in
 * .claude/BRAND-FACTS.md is a verifiable individual Instagram/YouTube post
 * (permalink + exact date + real thumbnail), only the *profiles* themselves
 * are verified. `<SocialGrid>`/`<InstagramStrip>`/`<YouTubeStrip>` all
 * render a designed empty state for an empty list — see
 * src/components/social/social-empty-state.tsx — so this file staying empty
 * does not break anything visually.
 *
 * How to add a real entry once the client supplies one (screenshot + link is
 * enough to fill this in by hand — no scraping tool needed for a handful of
 * picks):
 *
 *   {
 *     id: 'instagram-C1a2B3c4D5e',       // stable, derived from the post's shortcode/video id
 *     platform: 'instagram',             // or 'youtube'
 *     permalink: 'https://www.instagram.com/p/C1a2B3c4D5e/',
 *     type: 'reel',                      // 'image' | 'video' | 'carousel' | 'reel'
 *     caption: '...',                    // the post's own caption, verbatim or null
 *     thumbnailUrl: null,                // null until a real image exists — see note below
 *     postedAt: '2026-06-01T18:00:00.000Z', // the post's real publish date
 *     featured: true,                    // optional — pins it first in the combined feed
 *   },
 *
 * `thumbnailUrl` may be either:
 *   - a local asset the client provides directly, e.g. '/images/social/2026-06-01-henna.jpg'
 *     (`ManualProvider` treats any path starting with '/' as already first-party), or
 *   - a remote URL the client copies from the post — `ManualProvider` runs
 *     this through the same `cacheRemoteImage()` used by the live providers,
 *     so it still ends up served from our own origin, never hotlinked.
 *
 * `CmsProvider` (`src/lib/social/cms-provider.ts`) already exists and sits
 * ahead of this file in the fallback chain (`src/lib/social/provider.ts`) —
 * once the admin agent's `curated-posts` collection is live and has
 * published rows, this file effectively goes dormant on its own. It's safe
 * to leave it empty indefinitely rather than deleting it.
 */
import type { SocialPost } from '@/lib/social/types';

export const curatedSocialPosts: SocialPost[] = [];
