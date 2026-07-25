# Social feed — architecture, providers, GDPR reasoning

Owner: social-feed agent. Paths: `src/components/social/**`, `src/content/social.ts`,
`src/lib/social/**`, `src/app/api/social/**`, this file.

---

## 1. Why this exists, and the constraint that shaped it

@dj_veys (Instagram, 63,000 followers) and @VeysTunesOfficial (YouTube) are the strongest,
most current proof of work this brand has — stronger than the (currently unpublishable)
Google review count. The old site loads Meta's/Google's own embed widgets directly, which
means: third-party cookies get set and data leaves the visitor's browser for Meta/Google
**before** any consent decision, which under GDPR requires a consent gate in front of the
content. The result on the old site is a grey "please accept to view" box sitting where the
best material should be.

**This module never puts an Instagram or YouTube embed script on the page.** Instead:

1. A server-side provider fetches post metadata (caption, permalink, date, image URL).
2. The image itself is downloaded server-side and cached on our own origin
   (`src/lib/social/media-cache.ts`), then served back to the browser from
   `/api/social/media/[id]` — a plain, same-origin image request. The browser's *first
   paint* of the feed never talks to Meta or Google at all.
3. Every card links out to the real post on click. That click is an unambiguous,
   user-initiated action — the visitor is choosing to leave for Instagram/YouTube, which is
   materially different from the page silently loading Meta/Google content into an iframe on
   arrival.
4. The one deliberate exception is `<YouTubeStrip>`: clicking its play button loads a
   `youtube-nocookie.com` iframe on click only (never on page load), reusing the existing
   click-to-load facade pattern from `src/components/pages/video-facade.tsx`. That click is
   the consent, exactly as it is for the Spotify/SoundCloud/Mixcloud facades already used
   elsewhere on this site (see `messages/de.json` → `legal.privacy.sections[embeds]`, which
   already documents this pattern for the site's other embeds).
5. **Instagram never gets this treatment, even on click.** There is no plain, script-free
   Instagram iframe that doesn't itself load instagram.com content into the page — every
   Instagram embed format available in 2026 either requires `platform.js` or loads a
   `instagram.com/…/embed` iframe that behaves like visiting Instagram directly. Rather than
   introduce that inconsistency, every Instagram card in this feature always links out.

Net effect: the social section renders fully, with real photos, on first paint, for every
visitor, with no consent banner in front of it — because nothing Meta- or Google-owned loads
until the visitor explicitly asks for it.

---

## 2. The provider architecture

```
SocialProvider.fetchPosts(limit, options?) → Promise<SocialPost[]>
```

`src/lib/social/types.ts` is the one contract every implementation and every consumer
depends on. Four implementations exist:

| Provider | File | Needs credentials? | Status |
|---|---|---|---|
| `CmsProvider` | `cms-provider.ts` | No (reads the app's own database) | **The client's hand-picked list.** Works the moment the admin agent's `curated-posts` collection has a published row — see §9. Empty/no-collection-yet fails soft to the next step. |
| `ManualProvider` | `manual-provider.ts` | No | Zero-credential code fallback. Ships empty (see §5). |
| `YouTubeRssProvider` | `youtube-rss-provider.ts` | No | **Works today**, fully automatic, last resort for YouTube. |
| `InstagramGraphProvider` | `instagram-graph-provider.ts` | Yes (`INSTAGRAM_ACCESS_TOKEN` + `INSTAGRAM_BUSINESS_ACCOUNT_ID`) | Real, working code — inert until those env vars exist. Last resort for Instagram. |

Selection happens in one place, `src/lib/social/provider.ts`, mirroring the transport
selection pattern already used for booking emails
(`src/app/api/anfrage/_lib/transport.ts`) — but as a **fallback chain**, not a single pick,
per the client's "I want to hand-pick what shows up" requirement:

```ts
getInstagramProvider() // → [CmsProvider('instagram'), ManualProvider('instagram'), InstagramGraphProvider?] — first non-empty wins
getYouTubeProvider()   // → [CmsProvider('youtube'), ManualProvider('youtube'), YouTubeRssProvider] — first non-empty wins
```

`FallbackSocialProvider` (in `provider.ts`) tries each step in order and returns the first
one that comes back with at least one post; every step is individually wrapped so a
half-built admin panel, a network error, or a missing token degrades quietly to the next
step instead of surfacing an error. Net effect: as soon as the client curates even one
published post for a platform, that's what the site shows for it — the automatic feed only
ever fills in while the curated list (CMS or code) is empty.

`getInstagramPosts(limit, options?)` / `getYouTubePosts(limit, options?)` /
`getSocialFeed(limit, options?)` are the only functions the rest of the app should call.
`options` is `{ placement?, locale? }` (see §9) and is only consumed by `CmsProvider` today —
every other provider ignores it.

### Switching providers

- **Curation (the client's day-to-day lever)**: publish/unpublish rows in the admin panel's
  `curated-posts` collection. No env var, no deploy.
- **Instagram automatic fallback**: set `INSTAGRAM_ACCESS_TOKEN` and
  `INSTAGRAM_BUSINESS_ACCOUNT_ID` — no code change. Only used once both the CMS and the
  code-level curated list are empty for Instagram.
- **YouTube**: works out of the box as the final fallback. Set `YOUTUBE_CHANNEL_ID` only if
  you want to skip the runtime handle-to-channel-id resolution (§4).

---

## 3. Instagram — what the client needs to do

Meta shut down the old "Basic Display API" (the simple personal-token flow) in
**December 2024**. It no longer exists. The only remaining path is the **Instagram Graph
API**, which is more involved:

1. **Convert the Instagram account to a Business or Creator account** (Instagram app →
   Settings → Account type).
2. **Create/link a Facebook Page** to that Instagram account. The Graph API is
   Page-centric — Meta does not currently offer programmatic feed access to a bare Instagram
   account without a linked Page.
3. **Create a Meta app** at [developers.facebook.com](https://developers.facebook.com/),
   add it to a **Meta Business** account (business.facebook.com — create one if it doesn't
   exist), and add the **Instagram Graph API** product to the app.
4. **Generate a long-lived access token** for a user with `instagram_basic` permission on
   that Page: get a short-lived user token via the Graph API Explorer or OAuth flow, then
   exchange it for a long-lived token (~60 days) via
   `GET /oauth/access_token?grant_type=fb_exchange_token&…`.
5. **Find the Instagram Business Account ID** linked to the Page:
   `GET /{page-id}?fields=instagram_business_account&access_token=…`.
6. Set both `INSTAGRAM_ACCESS_TOKEN` (the long-lived token) and
   `INSTAGRAM_BUSINESS_ACCOUNT_ID` (from step 5) in the environment.

**Refresh cadence**: long-lived tokens last ~60 days and must be refreshed before expiry via
`GET /oauth/access_token?grant_type=ig_refresh_token&access_token=…` (Instagram) — this
project does not currently automate that refresh; whoever owns the token needs a calendar
reminder (or a small cron script) at roughly the 50-day mark. `InstagramGraphProvider` fails
soft on an expired token (falls back to the curated list, logs a warning server-side) rather
than breaking the page, but a stale token silently means the feed goes back to only-curated
content, so it's worth actually watching for that warning in logs.

None of this exists yet for `@dj_veys` — `INSTAGRAM_ACCESS_TOKEN` /
`INSTAGRAM_BUSINESS_ACCOUNT_ID` are unset today. That's fine: Instagram curation is meant to
go through the admin panel (§9) regardless of whether this token ever gets set — the Graph
API is only the last-resort automatic fallback in `getInstagramProvider()`'s chain (§2), not
the primary path anymore.

---

## 4. YouTube — how the free RSS route works

`https://www.youtube.com/feeds/videos.xml?channel_id=<UC…>` is a public Atom feed YouTube
serves for every channel, with **no API key, no OAuth, no quota**. `YouTubeRssProvider`:

1. Resolves the channel's internal `UC…` id — either from `YOUTUBE_CHANNEL_ID` if set, or by
   fetching the public `@handle` page (`site.social.youtube`) and scraping the
   `"channelId":"UC…"` string YouTube embeds in that page's HTML. The resolved id is cached
   in memory for 24h so this only happens roughly once a day.
2. Fetches the feed XML and parses it with a small regex-based parser (deliberately not a
   new dependency — the feed shape is small and stable; see CONTRACT.md's "no heavy deps
   without asking").
3. Builds each video's thumbnail via `youTubeThumbnailUrl()` (`src/lib/social/embed.ts`) and
   runs it through the same media cache as every other image in this feature. **This exact
   helper is also what auto-derives the thumbnail for a YouTube link pasted into the admin
   panel** (§9) — there is only one YouTube-thumbnail code path in the whole feature.

This needs zero setup and will start showing real videos immediately once deployed — the
only failure mode is a network/DNS issue reaching youtube.com, which fails soft to an empty
list like everything else here.

**Why `hqdefault.jpg`, not `maxresdefault.jpg`**: the higher-resolution `maxresdefault.jpg`
is the obvious first choice, but YouTube doesn't generate it for every video — a meaningful
share of uploads (older videos, Shorts, some mobile uploads) don't have one, and instead of
404ing, YouTube returns HTTP 200 with a tiny grey 120×90 placeholder image. There's no cheap,
reliable way to detect "that response was actually the grey placeholder" after the fact, so
using `maxresdefault` risks silently caching a fake thumbnail with no error anywhere to catch
it. `hqdefault.jpg` (480×360) is guaranteed to exist for every public video — lower
resolution, but never wrong. Given this feature's whole premise is "never render something
broken, always fail soft to something honest," `hqdefault` is the right trade-off.

---

## 5. The code-level curated list — why it ships empty, and its role now

`src/content/social.ts` (`ManualProvider`) was the original zero-credential default before
the admin panel existed. It ships as an **empty array** on purpose — per CONTRACT.md's "no
fabricated data" rule, nothing in `BRAND-FACTS.md` is a verified *individual post*
(permalink + exact caption + exact date + real image), only the *profiles* are verified.

Now that `CmsProvider` (§9) exists and sits ahead of it in the fallback chain (§2),
`ManualProvider`/`src/content/social.ts` is a **secondary safety net**: it only ever matters
if the admin panel is unreachable *and* nothing is curated in it yet — e.g. local
development before Payload is wired up, or a deploy where the CMS database isn't reachable.
It's fine for this file to stay empty indefinitely; nobody needs to maintain it once the
admin panel is live.

An empty curated list at every level is not a broken state: every component renders
`SocialEmptyState` (gold-hairline, on-brand, links straight to the live Instagram profile)
for zero posts, exactly like the existing `EmptyState` pattern used for `gallery.ts` /
`weddings.ts` elsewhere in this project.

---

## 6. For the admin-panel/database agent

Full field-by-field contract: **§9**. Summary: implement a `curated-posts` Payload
collection (`src/payload/collections/curated-posts.ts`, registered in `payload.config.ts` —
both owned by the admin agent) matching the shape in §9. `CmsProvider`
(`src/lib/social/cms-provider.ts`, owned by this agent) already reads from it via Payload's
Local API (`src/lib/payload.ts` → `getPayloadClient()`) — nothing needs to change on this
side once the collection exists; `CmsProvider` currently returns an empty list (fails soft)
because the collection doesn't exist yet, and starts working the moment it does.

---

## 7. Caching strategy

| Layer | Mechanism | Duration |
|---|---|---|
| `CmsProvider` → Payload | Local API (`payload.find(...)`) — a direct DB call, not `fetch()`, so there is no HTTP cache layer to invalidate | Always current per request — deliberate: the whole point of "hand-pick from the admin panel" is that publishing a change shows up immediately, not up to an hour later |
| Provider → upstream API/RSS | `fetch(url, { next: { revalidate } })` (Next Data Cache) | ~1h (YouTube feed, Instagram Graph API); 24h (YouTube channel-id resolution) |
| Image bytes | `src/lib/social/media-cache.ts` — downloaded once, written to disk, re-checked against upstream at most every 12h | Served indefinitely from disk; browser/CDN `Cache-Control: public, max-age=604800, immutable` (content-addressed by URL hash, so this is safe) |
| `/api/social` JSON route | Response header, not Next route caching (`dynamic = 'force-dynamic'`, same pattern as `/api/faq`) | `max-age=300, s-maxage=3600, stale-while-revalidate=86400` |

`SOCIAL_MEDIA_CACHE_DIR` (see `.env.example`) should point at a persistent volume in
production so the image cache survives container restarts. On a stateless/serverless host,
swap `cacheRemoteImage`/`readCachedMedia` in `media-cache.ts` for a blob-store client
(Vercel Blob, S3, R2) — those two functions are the only seam that assumes a local disk.

---

## 8. Rate limiting

`GET /api/social` uses the existing token-bucket limiter
(`src/app/api/_lib/rate-limit.ts`), 60 requests/minute per IP — generous, since this backs a
public marketing section rendered on every relevant pageview, not a form submission; it only
needs to stop abuse. `GET /api/social/media/[id]` is intentionally **not** rate-limited: a
single grid legitimately fires a dozen of these on one pageview (one per thumbnail), and
they behave like any other static, content-addressed image on the page.

---

## 9. `curated-posts` collection — the exact contract

This is what lets the client hand-pick which YouTube videos and Instagram posts appear on
the site, from the admin panel — the new primary curation path, ahead of both the code-level
list (§5) and the automatic feeds (§3, §4) in the fallback chain (§2).

**Ownership split**: this agent (`src/lib/social/**`) owns and has already shipped
`CmsProvider` (`src/lib/social/cms-provider.ts`) plus the two shared helpers it — and the
collection's own hooks/validation — should both use: `parseSocialPermalink()` and
`validateSocialPermalink()` in `src/lib/social/permalink.ts` (exported from the
`@/lib/social` barrel too). The admin agent (`src/payload/**`) owns creating the actual
Payload collection file and registering it in `payload.config.ts`. `CmsProvider` already
compiles and runs today, against a collection that doesn't exist yet — Payload's Local API
`find()` call is wrapped in a try/catch, so until the collection is registered it just
returns an empty list (see §2's fallback chain), same as every other "not configured yet"
state in this feature.

### Collection

```ts
slug: 'curated-posts'
labels: { singular: 'Kuratierter Social-Beitrag', plural: 'Kuratierte Social-Beiträge' }
admin: {
  useAsTitle: 'permalink',
  defaultColumns: ['platform', 'placement', 'status', 'featured', 'sortOrder', 'updatedAt'],
  description: 'Handverlesene Instagram-/YouTube-Beiträge für die Website. Link einfügen — Plattform und (bei YouTube) Vorschaubild werden automatisch erkannt.',
}
access: { read: isAdmin, create: isAdmin, update: isAdmin, delete: isAdmin } // same single-owner pattern as Enquiries/Bookings — CmsProvider's Local API reads bypass this via overrideAccess: true (see src/lib/payload.ts)
```

### Fields — exact names, types and semantics `CmsProvider` expects

| Field | Type | Required | Notes |
|---|---|---|---|
| `permalink` | `text` | yes, `unique: true` | The pasted Instagram or YouTube URL. `validate: validateSocialPermalink` (import from `@/lib/social/permalink`) — rejects anything that isn't a recognizable `instagram.com/p\|reel/…` or `youtube.com/watch\|shorts/…`/`youtu.be/…` link, with a German error message, instead of silently saving a dead card. |
| `platform` | `select`, options `instagram` \| `youtube` | yes | **Not hand-picked** — set automatically by a `beforeValidate` (or `beforeChange`) collection hook: `data.platform = parseSocialPermalink(data.permalink)?.platform`. Field should be `admin: { readOnly: true }` so the client only ever touches `permalink`. Stored (not purely derived) so this can be queried/filtered/sorted at the DB level and shown as an admin list column. `CmsProvider` re-derives platform from `permalink` at read time regardless and trusts that over this column if they ever disagree (logs a warning) — `permalink` is the real source of truth. |
| `captionOverride` | `text` or `textarea`, `localized: true` | no | Shown instead of the original caption; `null`/empty means no caption (the card renders without one, not a fallback string) — see the note below on why this can't be auto-filled from Instagram/YouTube today. |
| `thumbnail` | `upload`, `relationTo: 'media'` | no | See §9.1 below — the one field whose necessity differs sharply by platform. |
| `featured` | `checkbox`, default `false` | no | Pins the post first, across both platforms, in `<SocialGrid>`'s combined feed and within its own platform's strip. |
| `sortOrder` | `number` | no | Manual ordering, ascending (lower = earlier), applied after `featured`. Leave empty to sort by `postedAt` (= the row's `createdAt`, see below) instead. |
| `status` | `select`, options `draft` \| `published`, default `draft` | yes | Only `status: 'published'` rows are ever read by `CmsProvider`. Lets the client stage a pick before it goes live. |
| `placement` | `select`, `hasMany: true`, options `home` \| `gallery` \| `contact`, default `['home']` | yes | Which surface(s) this post appears on — one curated list feeds `<InstagramStrip>`/`<YouTubeStrip>` (both request `placement: 'home'`) and `<SocialGrid>` (accepts an optional `placement` prop; omit it to ignore placement entirely). **These three string values are exact and must match `SocialPlacement` in `src/lib/social/types.ts` — don't rename them without updating that type too.** |

No `type`/`postType` field: image vs. video vs. reel vs. carousel is derived at read time by
`CmsProvider` from `permalink` (via `parseSocialPermalink`), not stored — one less field for
the client to fill in. The one inherent ambiguity (an `instagram.com/p/…` link can be a
single image or a carousel; the URL alone can't say which) defaults to `'image'`, which only
affects a small "multiple photos" badge in the UI, never anything functional.

`postedAt` on the resulting `SocialPost` is the row's own `createdAt` (Payload sets this
automatically) — i.e. *when the client curated it*, not the original post's real publish
date, which isn't derivable from a bare permalink without an API call this feature
deliberately doesn't make for curated entries. This is stated plainly here because it's a
real, visible trade-off (the `<time>` under a curated card shows the curation date, not the
Instagram/YouTube publish date) — acceptable given `sortOrder`/`featured` are the intended
ordering levers for curated content anyway, not chronology.

### 9.1 The YouTube-vs-Instagram thumbnail difference (please read this to the client)

**YouTube: fully automatic, no upload needed.** A YouTube video id is enough to derive a
real thumbnail — `youTubeThumbnailUrl()` in `src/lib/social/embed.ts` builds
`https://i.ytimg.com/vi/<id>/hqdefault.jpg` (YouTube's own stable, keyless, always-present
thumbnail URL, see §4 for why `hqdefault` specifically). `CmsProvider` downloads and caches
it through the same `media-cache.ts` machinery as the automatic YouTube feed. The client
pastes a link; the thumbnail just appears. The `thumbnail` upload field is there as an
optional override if he ever wants a custom crop, but there's no obligation to use it for
YouTube.

**Instagram: generally needs the uploaded-image field.** There is no equivalent trick for
Instagram — a bare `instagram.com/p/…`/`/reel/…` permalink contains only an opaque shortcode,
not an image URL, and there is no keyless, public way to resolve that shortcode to an image
(unlike YouTube's predictable `i.ytimg.com` pattern). The *only* API that can fetch an
Instagram post's real image is the Instagram Graph API — which needs the full token setup in
§3, not just a pasted link. Until that token exists (or if the client never sets it up),
**Instagram curated posts need the `thumbnail` field filled in by hand** — a screenshot or a
saved copy of the post's own image, uploaded once per curated post. Without it, the card
renders the designed platform-icon placeholder (`SocialPostCard`'s empty-thumbnail state),
not a broken image — but it won't look as good as a real photo, so in practice this field is
effectively required for Instagram, optional for YouTube.

The same asymmetry applies to `captionOverride`: YouTube's original video title is available
automatically via the RSS-based automatic feed (§4), but a *curated* entry doesn't reuse that
title automatically today, and Instagram's real caption isn't fetchable without the Graph API
either — for both platforms, a curated post's caption is whatever the client types into
`captionOverride`, or nothing.

### 9.2 What happens before the collection exists

Nothing breaks. `CmsProvider.fetchPosts()` catches the "unknown collection" error from
Payload's Local API and returns `[]`, exactly like any other provider failure (§2). The
fallback chain moves on to `ManualProvider` (§5, currently also empty) and then the automatic
feeds (§3, §4) — so YouTube keeps showing real videos automatically the whole time the admin
panel is being built, and Instagram shows the designed empty state until either the
collection ships or a Graph token exists.
