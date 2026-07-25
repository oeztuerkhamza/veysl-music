# VEYSL — SEO Action Plan

Sequenced, ruthless, and honest about what code can and can't do. Read
`docs/SEO-COMPETITIVE-ANALYSIS.md`, `docs/SEO-KEYWORD-MAP.md` and
`docs/SEO-CITY-STRATEGY.md` first — this doc assumes their findings.

**The headline honesty check, up front:** on-page and technical SEO can make VEYSL
*findable and convincing* once someone searches. It cannot manufacture the ~30 Google
reviews a top Turkish-niche competitor appears to have, the 25 years of brand
recognition "DJ Serkan" has built since 2000, or the backlinks a 2023-founded portal
(hochzeit.click) has already accumulated. Anyone who tells the client that a good
website alone will out-rank those in month one is overselling. Section (c) below is
where the real leverage against those specific gaps lives — and it's the one section
only the client can execute.

---

## (a) Technical / on-page work — build agents, do this now

### Blocking dependency: `meta.cityLanding` doesn't exist yet
`src/lib/seo.ts` already flags this in a comment: the `/hochzeits-dj/[stadt]` route
needs a `meta.cityLanding.title` / `.description` key with a `{city}` placeholder added
to **all three** `messages/{de,en,tr}.json` files before `buildMetadata()` can render
metadata for a single city page. This is on the critical path for the entire city-page
initiative in `docs/SEO-CITY-STRATEGY.md` — flag it to the orchestrator immediately, not
as a later cleanup item.

### Homepage title is 4 characters over budget
`messages/de.json` → `meta.home.title` renders at **64 characters** with `{city}` =
"Stuttgart" substituted — over the practical ~60-char SERP limit. A 56-character
alternative that keeps the keyword front-loaded is in `docs/SEO-KEYWORD-MAP.md` §1. This
is a free CTR fix, not a content project — do it whenever the orchestrator next touches
`messages/de.json`.

### Schema markup — build to at least eventzone.de's level, honestly
`docs/SEO-COMPETITIVE-ANALYSIS.md` §4 found eventzone.de running full JSON-LD
(`PerformingGroup`, `MusicGroup`, `AggregateRating`, `PriceSpecification`, location
data). `src/lib/schema.ts` (owned by the `seo` agent) should implement, at minimum:

- `LocalBusiness` (or `Organization` + `Place`, per what fits Next.js's data model) with
  NAP fields sourced only from `site.ts` — never hardcode a second copy of the address/phone.
- `PerformingGroup` with `additionalType` covering DJ, musician and event-host roles —
  this schema-level three-in-one framing directly supports the
  DJ+Musiker+Moderator differentiator called out in the competitive analysis §6.
- `Service` entries per package on `/pakete`, with `priceSpecification` **only** once
  real prices exist — per `CONTRACT.md`'s "no fabricated data" rule, a placeholder
  "Preis auf Anfrage" state must render without a fake `Offer` schema block underneath it.
- **No `AggregateRating` schema until `site.reviews.isPublishable` is `true`.** This is
  already the explicit rule in `src/content/site.ts` — don't let schema work
  accidentally reintroduce a rating value the brand-facts file says isn't verified yet.
  A fabricated `AggregateRating` is also a Google Rich Results policy violation (review
  snippet spam), not just an internal inconsistency — real risk, not just a style issue.
- `FAQPage` schema on `/ablauf` — legitimate SERP-real-estate play for a page that's
  otherwise low-volume (see keyword map).
- `BreadcrumbList` on city pages so `/hochzeits-dj/{stadt}` visibly nests under the
  site, reinforcing they're not disconnected doorway pages.

### hreflang / i18n — architecture is already correct, verify it stays that way
`src/i18n/routing.ts` already defines distinct, keyword-appropriate slugs per locale
(`/pakete` / `/packages` / `/paketler`, etc.) and `src/lib/seo.ts`'s `buildMetadata`
already emits reciprocal `alternates.languages` plus `x-default`. This matches the
skill's multilingual-SEO checklist almost exactly out of the box — the main risk is
**future pages skipping the `buildMetadata()` wrapper** and hand-rolling metadata, which
would silently break the hreflang set for that one page. Enforce via code review, not
retroactively.

### Image SEO for `/galerie` and city pages
Per `CONTRACT.md`, `next/image` is already mandated. Add on top of that:
- Descriptive, keyword-natural filenames before upload (`hochzeit-dj-stuttgart-daenzflaeche.jpg`, not `IMG_4021.jpg`) — this cannot be fixed after the fact without breaking existing URLs, so get it right at ingest.
- Alt text that describes the real photo content (per `CONTRACT.md` — meaningful `alt` on every image), naturally including venue/city name where accurate, never keyword-stuffed.
- Once city-specific event photos exist, that's real Google Images traffic (see keyword map §1, `/galerie` row) — currently zero competitors were found doing this well.

### Internal linking network for city pages
Per `docs/SEO-CITY-STRATEGY.md` §5, city pages need to link to each other by real
geographic proximity (Esslingen ↔ Stuttgart ↔ Ludwigsburg, etc.), not just up to the
homepage. Build this as a small shared data structure in `src/content/cities.ts` (e.g. a
`nearbyCities` array per city) so the pages-agent doesn't have to hand-wire it per page.

### Sitemap / robots
`src/app/sitemap.ts` and `src/app/robots.ts` (owned by `seo` agent) should include every
locale variant of every static route plus every published city page, and exclude
`/anfrage`'s thank-you/confirmation states and legal pages from priority weighting (they
can stay indexable, just low-priority). Cross-check against the 301 map in §(d) once the
old domain's URLs are known — see below, only 5 old URLs exist, all thin.

### Core Web Vitals reminder
Nothing found in this research changes `CONTRACT.md`'s existing CWV/WCAG bars — but
worth noting competitively: none of the competitor sites fetched in
`docs/SEO-COMPETITIVE-ANALYSIS.md` showed any sign of being SSR/statically optimized
Next.js builds (mostly WordPress, Wix, or template-network sites). A genuinely fast,
CWV-passing site is itself a differentiator in this niche, not just a compliance box —
worth mentioning in the client's own sales conversations with venues/planners, if not on
the site itself.

---

## (b) Content work

Ordered by what unlocks the most SEO value per hour of client/writer time:

1. **Tier-1 city pages first** (Esslingen, Ludwigsburg, Böblingen, Heilbronn,
   Reutlingen, Pforzheim, Karlsruhe) — per `docs/SEO-CITY-STRATEGY.md` §1, each needs the
   minimum-unique-content elements in §5 of that doc before it ships. This is the
   single highest-leverage content project on the list because it's the one uncontested
   format-plus-niche combination found anywhere in the competitive research.
2. **`/echte-hochzeiten` real testimonials and photos** — currently blocked on the
   client supplying real names/quotes/venue partners (`.claude/BRAND-FACTS.md`: "client
   testimonials and names... still unknown — do NOT invent"). This page's entire SEO and
   conversion value depends on real material existing; chase this from the client in
   parallel with the city pages, don't let it become the last thing built.
3. **`/musik` audio sets** — per the keyword map, this is a near-uncontested content
   format (embedded audio sets are not something any competitor site was found doing).
   Use the click-to-load facade already mandated in `CONTRACT.md` for the embed.
4. **`/pakete` real pricing** — `docs/SEO-COMPETITIVE-ANALYSIS.md` found that almost no
   competitor publishes real prices except lakeloveevents.com (from €900/3h). Getting
   real package prices from the client (even as ranges) is a bigger differentiator than
   any copywriting on that page — chase this input specifically.
5. **`/epk`** — lower SEO priority (B2B utility page per keyword map) but cheap to
   finish once the client supplies a bio, press photos and a technical rider; useful for
   the venue-backlink outreach in §(c).
6. **Tier-2 city pages** (Tübingen, Mannheim, Heidelberg, Ulm, Göppingen, Freiburg,
   Aalen, Schwäbisch Gmünd) once Tier-1 is live and (ideally) showing early impressions
   in GSC — confirm with the client he'll realistically travel/market to each before
   publishing, since a city page is an implicit local-availability claim.
7. **TR-locale content review** — draft-then-native-review per the multilingual
   guidance; do not ship TR copy that's only machine-translated German, especially for
   the Kına/Nişan/davul-zurna terminology in the keyword map §3, where regional Turkish
   phrasing genuinely varies.

---

## (c) Off-page work — only the client can do this

This is where the honest answer to "how do we outrank everyone in 200 km" mostly lives.
No amount of code ships a review or a backlink.

### 1. Google Business Profile — highest single lever
- Confirm the profile linked in `site.social.googleMaps` is claimed and fully verified
  under the client's control.
- **Get the real review count and rating verified and entered into `site.reviews`** —
  this unblocks `site.reviews.isPublishable`, the review badge, and `AggregateRating`
  schema across the whole site. This is the single most consequential unblock in this
  entire plan — see the competitive analysis §6, point 1.
- Fill every GBP field per the skill's local-SEO reference: primary category (most
  specific match — likely "DJ" or "Wedding Service" over a generic "Entertainment"
  category), service area, 750-character description written for humans first, weekly
  photo/post activity.
- Start (or continue, if already doing this) asking every real client for a Google
  review at the natural moment — right after the event, via a direct
  `https://g.page/r/{place-id}/review`-style link over WhatsApp, one at a time, never in
  a batch (batch spikes look suspicious to Google's abuse detection).
- Respond to every review, positive and negative, briefly and specifically — not a
  template.

### 2. Directory and citation listings
Per `docs/SEO-COMPETITIVE-ANALYSIS.md` §4, these directories currently own real SERP
real estate for the exact queries VEYSL wants — getting listed inside them is a
citation/backlink play, not a ranking fight:
- [hochzeit.click](https://hochzeit.click/de/hochzeits-djs/stuttgart/) — fast-rising,
  founded 2023, worth a free/low-cost profile now while it's still climbing.
- [eventpeppers.com](https://www.eventpeppers.com/) — the single thickest Stuttgart DJ
  listing page found; even appearing as #41 in that market is a real citation.
- [hochzeitsportal-stuttgart.de](https://www.hochzeitsportal-stuttgart.de/) and its
  sister network (`heiraten-in-ludwigsburg.de`, `heiraten-in-tuebingen-reutlingen.de`,
  `heiraten-in-heilbronn.de`) — regional portals matching the exact Tier-1 city list.
- [hochzeitsportal24.de](https://www.hochzeitsportal24.de/), [weddyplace.com](https://www.weddyplace.com/), [evely.com](https://www.evely.com/) — nationwide portals with Stuttgart-specific pages.
- Standard German business citations from the skill's local-SEO reference: Bing Places,
  Gelbe Seiten, Das Örtliche, 11880, Facebook/Instagram Business (Instagram already
  exists per `site.social.instagram`).
- Review-aggregator profiles seen recurring in this niche's competitor set:
  [ProvenExpert](https://www.provenexpert.com/), [Trustlocal](https://trustlocal.de/) —
  both surfaced organically for DJ-related brand searches during this research, meaning
  they carry real weight in this specific niche.

### 3. Venue and planner backlinks — real, named targets from this research
Every venue named in `docs/SEO-CITY-STRATEGY.md` is a legitimate outreach target: get
listed on a venue's "recommended vendors/Dienstleister" page (common practice for German
Hochzeitslocations) in exchange for a link back to veysl.de. Concrete starting list:
- **"Dügün Salonu Mannheim"** (Skalitzer Str. 130, Mannheim) — a Turkish-specific venue
  is the single best-fit partner found in this entire research pass; a
  DJ-recommends/venue-recommends reciprocal relationship here is worth more than a
  generic directory listing.
- **White Event Palast, Stuttgart** — explicitly positions itself for multicultural/Turkish
  weddings with no Sperrstunde; strong positioning overlap.
- **Schloss Karlsburg Durlach** (Karlsruhe), **Heidelberg Castle**'s civil-ceremony
  program, **Esslingen Burg**, **Residenzschloss Ludwigsburg**, **Manufaktur B26**
  (Schwäbisch Gmünd), **Villa Stützel** (Aalen) — all confirmed real, bookable venues
  from the city-strategy doc worth a direct outreach email once the site is live enough
  to link to.

### 4. Hochzeitsmesse (wedding fair) presence
Confirmed, real, upcoming events in the target market:
- **"Die Hochzeitsmesse Stuttgart"** and **"TrauDich! Stuttgart"** — both scheduled
  **9–10 January 2027 at the Liederhalle Stuttgart**, per
  [messen.de](https://www.messen.de/de/13619/stuttgart/wir-heiraten-stuttgart/info) and
  [messen.de](https://www.messen.de/de/14/stuttgart/traudich-stuttgart/info). A booth or
  even just attending as a visible vendor generates: direct leads, photo/video content
  for `/galerie` and `/echte-hochzeiten`, and — done right — an event-page backlink from
  the fair organizer's own exhibitor list. This is real, dated, and actionable now.
- Check [hochzeitsportal-stuttgart.de/hochzeitsmessen](https://www.hochzeitsportal-stuttgart.de/hochzeitsmessen) periodically for additional regional fair dates as they're published.

### 5. Why this section is the actual answer to "outrank everyone in 200 km"
Re-stating the honest read from the competitive analysis: the technical/content work in
(a) and (b) makes VEYSL *competitive* once found. It's sections (c)'s reviews,
citations, and venue relationships that make VEYSL *found* against a competitor with 25
years and 30 reviews. Treat (a) and (b) as the floor, not the ceiling.

---

## (d) Migration plan — `veystunesofficial.de` → `veysl.de`

### What's actually on the old domain (checked directly)
The old site's sitemap (`https://www.veystunesofficial.de/wp-sitemap-posts-page-1.xml`)
lists exactly **6 URLs**, no separate blog-post sitemap:

```
https://www.veystunesofficial.de/
https://www.veystunesofficial.de/blog-hochzeitstipps/
https://www.veystunesofficial.de/datenschutzerklaerung/
https://www.veystunesofficial.de/impressum/
https://www.veystunesofficial.de/kontakt/
https://www.veystunesofficial.de/ueber-uns/
```

This is a genuinely small, thin WordPress site — good news for migration risk (see the
timeline note below).

### 301 redirect map

| Old URL | New URL | Notes |
|---|---|---|
| `/` | `/` | Straightforward. |
| `/ueber-uns/` | `/` or `/epk` | The old "About" content maps most naturally to the new homepage's intro section or the EPK bio — check the actual old page copy before finalizing; don't blind-redirect to a page with unrelated content. |
| `/kontakt/` | `/kontakt` | Straightforward. |
| `/blog-hochzeitstipps/` | `/` (safe default) or `/musik` / `/ablauf` if the actual old content overlaps | Sitemap shows this as a single static page, not a post index — no separate blog posts to map individually. **Read the actual page content before finalizing this redirect** — if it's a real wedding-tips article with any earned links, redirecting to a topically-related new page preserves more relevance than a blanket homepage redirect. |
| `/impressum/` | `/impressum` | Straightforward — verify VAT ID / address fields are equally complete on the new page (currently `TODO(kunde)` in `site.ts`). |
| `/datenschutzerklaerung/` | `/datenschutz` | Straightforward. |

Implement as permanent (301) redirects at the edge/server level (not client-side JS
redirects, which Google treats less reliably) — likely in `next.config.ts` `redirects()`
or the hosting layer, owned by the orchestrator per `CONTRACT.md`'s file-ownership table.

### Google Search Console steps
Per Google's own current guidance (checked July 2026 — Google published a revision to
its site-move documentation on 17 June 2026 specifically clarifying this point):

1. Verify **both** domains in GSC: `veystunesofficial.de` and `veysl.de` — and, per
   Google's updated guidance, **all variants** (`www.veystunesofficial.de`,
   `veystunesofficial.de` non-www, and the equivalent `veysl.de` variants), even the ones
   not actively serving traffic.
2. Ship all 301 redirects live **before** running the Change of Address tool.
3. Run the **Change of Address tool** (Search Console → old-domain property → Settings →
   Change of Address) pointing to the new domain, for each verified old-domain variant.
4. Keep the old domain's DNS/hosting and redirects live for **at least 6–12 months**
   after the move — don't let `veystunesofficial.de` lapse or get repurposed while
   redirects are still doing work.
5. Update every external reference to the old domain you control: GBP website field,
   Instagram bio link (`site.social.instagram`), YouTube channel link, any existing
   directory listings found in §(c)(2) that predate this project.

### Preserving the 5.0★ Google profile through the move
This is the good news in this whole migration: **the Google review rating and count
live on the Google Business Profile / Place ID, not on the website.** Moving
`veystunesofficial.de` → `veysl.de` does not, by itself, touch the reviews at all — as
long as:
- The GBP's **website field** is updated to `veysl.de` (not left pointing at the dead
  domain), and
- The GBP's **name field stays consistent** (per `CONTRACT.md`, `site.brandLegacy` =
  "VeysTunesOfficial" is explicitly preserved for exactly this reason — schema `sameAs`
  and GBP continuity, not the new site's own wordmark).

**Do not create a second GBP listing under the new brand name** — that would split the
review history across two profiles, which is a far bigger risk to the 5.0★ position than
the domain move itself.

### Timeline and ranking risk — the honest version
Google's own guidance (and general SEO consensus) is that a domain migration typically
causes some ranking fluctuation for **2–4 weeks, sometimes longer**, while Google
re-crawls and re-associates signals with the new domain. **In VEYSL's specific case this
risk is unusually low**, for a reason the research in this project surfaced directly:
searching for the client's own existing brand terms during this competitive analysis did
not surface `veystunesofficial.de` ranking prominently for any generic wedding-DJ query —
the old site simply doesn't have much organic equity built up yet to lose. That's not
a reason to skip the migration steps above (skipping them risks losing the GBP link and
any citations that do exist), but it does mean **the migration itself is low-stakes
compared to a site with years of established rankings** — the bigger opportunity cost is
simply time-to-launch of the new, far more complete site, not rankings lost in transit.

**What to watch and for how long:** track **Impressions** and **average Position** for
branded queries (`veysl`, `veystunesofficial`, `veysel durmus dj`) in GSC for the new
domain over the **first 28 days** post-launch as the baseline signal that re-indexing is
proceeding normally, then track **Clicks** on the Tier-1 city-page set specifically
starting 28 days after each batch of pages goes live — city pages take longer to
accumulate signal than the homepage, so don't judge them on week-one data.
