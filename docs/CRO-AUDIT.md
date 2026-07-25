# VEYSL — CRO Audit

Owned by the CRO/analytics agent. Read `docs/ANALYTICS.md` first — several
items below depend on the event taxonomy and `data-cta` contract defined
there. Everything in §2 that touches another agent's file is a precise
instruction, not a change made here — see `.claude/CONTRACT.md`'s file
ownership table.

**Method note, honestly stated up front:** this audit is based on reading
the actual funnel and homepage source (every file listed at the top of the
brief, plus the full booking funnel, API routes, home sections, layout,
audio and social components) — not on a live site visit, a Lighthouse run,
or real analytics data (none existed before this PR). Findings are
source-grounded, not measured. Where a finding would benefit from real
traffic data to resolve (e.g. "is WhatsApp actually outperforming the
form?"), that's stated explicitly rather than guessed at — the whole point
of Part 2 of this brief is to make that data exist going forward.

---

## Top 10 findings

Ordered by expected impact. "Effort" is for THIS agent's own components
(built and ready to insert) vs. what's a one-line change in another agent's
file (documented, not applied here).

### 1. The highest-intent page on the whole site has zero trust signal
**Impact: High · Effort: Low (component built, needs insertion)**

`/anfrage` — the actual conversion page — shows no verified stat anywhere
near the form or the aside card. `/pakete`'s package cards are the same: a
visitor who has scrolled through three tiers and is about to click straight
through to `/anfrage` sees no reinforcement of *why this vendor* right at
the decision point. Every trust signal that exists today (63k followers,
12+ years, 200+ events) lives exclusively in homepage sections
(`<TrustStrip>`, `<StatsBand>`, `<InstagramStrip>`) — which a visitor
arriving directly at `/anfrage` (a shared WhatsApp link, a city-page SEO
landing, a paid ad) may never see at all.

**Fix shipped:** `src/components/cro/trust-row.tsx` — a compact, verified-
only stat strip (reads `site.stats`, excludes the Google rating per
`site.reviews.isPublishable`, matches `<StatsBand>`'s own data source
convention). Insert:

- `src/app/[locale]/anfrage/page.tsx` (booking agent) — inside the aside
  `<Card>`, between the title/text and the contact links:
  ```tsx
  import { TrustRow } from '@/components/cro';
  // …
  <TrustRow />
  ```
- `src/components/pages/package-card.tsx` (pages agent) — under the price,
  before the feature list, with a tighter subset for space: `items={['events', 'years']}`.

### 2. The "reply within 24 hours" promise is invisible at the exact moment it matters most
**Impact: High · Effort: Low (component built, needs insertion)**

The promise exists (`booking.aside.responseTime`, and again in
`cta.finalSubtitle`) — but only inside the `/anfrage` aside `<Card>`, which
sits **below** the form in source order on every viewport under `lg`
(`grid-cols-1` until the breakpoint). On mobile — this project's likely
majority of traffic — a visitor filling in step 3 and reaching the submit
button has already scrolled past the one place this reassurance lives. This
is the single strongest anxiety-reducer named in the brief, and today it's
statistically invisible at the point of decision.

**Fix shipped:** `src/components/cro/response-time-badge.tsx`. Insert:

- `src/components/booking/enquiry-form.tsx` (booking agent) — directly
  above the step 3 submit button row:
  ```tsx
  import { ResponseTimeBadge } from '@/components/cro';
  // …
  {step === TOTAL_STEPS && <ResponseTimeBadge className="justify-center sm:justify-start" />}
  <div className="flex items-center justify-between gap-4">
    {/* existing back/submit buttons */}
  </div>
  ```
- `src/components/contact/contact-form.tsx` (booking agent) — same pattern,
  above its own submit button (the general contact form makes an implicit
  reply-time promise too via `contactForm` copy; worth the same reassurance).

### 3. No real-data urgency anywhere, despite the brief explicitly wanting it
**Impact: Medium–High · Effort: Low (component built, needs insertion)**

The hero's `home.hero.availability` line ("{year} dates are filling up —
check availability now") is evergreen copy, not backed by an actual number
— it's honest (not fabricated), but it's also generic enough to read as
boilerplate. `src/content/availability.ts` already has real blocked-date
data (CMS-backed, the same source the booking calendar itself reads) that
nothing on the marketing side of the site uses yet.

**Fix shipped:** `src/components/cro/season-scarcity.tsx` — counts already-
blocked upcoming Saturdays in the current season year and renders one
honest sentence ("Bereits {count} Samstage in {year} vergeben"). Renders
**nothing** if the blocklist is empty (means "unknown", never "free" — same
rule `getAvailabilityStatus()` already follows) or if the count is zero — no
fabricated countdown, ever. Insert:

- `src/components/booking/step-date-place.tsx` (booking agent) — directly
  under the `<AvailabilityCalendar>`, as real-world context for the picker
  the visitor is already looking at:
  ```tsx
  import { SeasonScarcity } from '@/components/cro';
  // … after <AvailabilityCalendar onAnnounce={onAvailabilityAnnounce} />
  <SeasonScarcity />
  ```
- `src/components/home/final-cta.tsx` (home agent) — under the existing
  `reassurance` line, as a second, real-data-backed reason to act now.

### 4. CTA locations are completely unmeasured — nobody can currently tell which one converts
**Impact: High (unlocks every future prioritization decision) · Effort: Low**

Before this PR, there was no way to know whether the hero CTA, the sticky
mobile bar, the WhatsApp FAB, a package card, or the final-section CTA is
actually producing enquiries. `<AutoTrack>` (see `docs/ANALYTICS.md`) fires
`cta_click`/`package_interest` the instant any element carries a
`data-cta`/`data-package` attribute — zero further code needed in
`auto-track.tsx` as more locations adopt it. The attribute rollout itself
(see `docs/ANALYTICS.md` §7 for the full table) is the action item, owned by
the home/layout/pages agents.

### 5. Two WhatsApp entry points compete with the primary CTA in the same mobile thumb-zone
**Impact: Medium–High · Effort: Low to measure, Medium to redesign — data-dependent, not prescribed here**

On mobile, once a visitor scrolls past the hero, **both**
`<StickyCtaBar>` (bottom, `flex-[2]` "Termin anfragen" next to a `flex-1`
WhatsApp icon button) **and** `<WhatsAppFab>` (bottom-right, floating,
stacked above the bar) are visible at once — two WhatsApp entry points
within roughly one thumb's reach of each other, one of them sharing the same
row as the primary form CTA and taking a third of its width. This is a real
answer to the brief's own question ("is there exactly one obvious primary
action, or do WhatsApp/call/form compete?") — on mobile, no, they compete.

**Deliberately not "fixed" outright:** collapsing to a single WhatsApp
entry point could easily be the *wrong* move for this specific market —
`.claude/BRAND-FACTS.md` is explicit that bookings currently arrive via
Instagram DM and that this is a DM-native, WhatsApp-comfortable audience
(bicultural German-Turkish weddings). Removing a channel this audience may
actively prefer, on a hunch, would be exactly the kind of decision this PR's
own instrumentation exists to make correctly instead. **Recommendation:**
ship the attribute rollout in #4, let the two entry points run for 2–4 weeks
once real traffic exists, then compare `cta_click{location:"sticky-bar"}` +
`whatsapp_click` conversion-through-to-`enquiry_submitted` against the
form's own completion rate before touching the layout.

### 6. No exit path exists for a visitor who isn't ready to commit yet
**Impact: Medium · Effort: Low (component built, needs insertion)**

Beyond the `/anfrage` aside's WhatsApp/phone/email links (a reasonable
"talk to a human instead" path, already in place), there is nothing for a
visitor who wants to keep their date/interest on file without starting the
full 3-step form — no newsletter, no checklist download, no "save this
date" affordance anywhere on the site.

**Fix shipped:** `src/components/cro/save-for-later.tsx` — a soft-
conversion card offering a pre-filled WhatsApp deep link and a `mailto:`
fallback, built entirely on channels the site already has (zero new
backend, zero new API route). `whatsapp_click`/`email_click` are already
covered by `<AutoTrack>`'s href-pattern detection for these links — no
extra instrumentation needed once inserted. Insert:

- `src/app/[locale]/anfrage/page.tsx` (booking agent) — below the aside
  `<Card>`, as a secondary option for a visitor who opened the page but
  hesitates: `<SaveForLater eventDateLabel={/* if a date was already picked in the form's step 1 */} />`.
- `src/app/[locale]/pakete/page.tsx` (pages agent) — near the "custom
  package" block, for a visitor who's still deciding between tiers.

**Honest limitation:** a real "download the planning checklist" or
newsletter-capture flow would need a new lightweight API route + storage,
which this agent doesn't own (`src/app/api/**` is booking-agent territory
per `.claude/CONTRACT.md`). Flagging as a genuine follow-up idea, not
building a fake version of it.

### 7. Package selection doesn't carry forward into the booking form
**Impact: Medium · Effort: Medium — booking-agent owned, not built here**

Every package card (`home/packages-preview.tsx` and `pages/package-card.tsx`)
links straight to bare `/anfrage`. A visitor who has just decided "Signature
package" is asked to re-select it from a generic dropdown in step 2 with no
memory of the choice that got them there — a small but real re-entry cost
right after the highest-intent click on the page. **Recommendation:** once
`data-package` tagging (#4) exists, have the package card link to
`/anfrage?package=signature` and have `enquiry-form.tsx` read that query
param into `enquiryDefaultValues.package` on mount. Not built here — it
touches `src/lib/booking.ts` and `enquiry-form.tsx`, both booking-agent
files — but worth flagging precisely since it directly follows from the
`data-package` work this PR already recommends.

### 8. Ad-blocked visitors were invisible in the metric that matters most
**Impact: High (data trustworthiness) · Effort: Low — shipped in this PR**

Client-side-only analytics silently under-counts the one event that
actually drives business decisions: completed bookings. Ad/tracker blockers
(uBlock Origin, Brave, iOS tracking prevention combined with some
blocklists) routinely strip Plausible's/GA4's script for a meaningful share
of visitors. `src/lib/analytics/server.ts` (`trackServerEnquirySubmitted`)
fires a server-side Plausible Events API call the moment an enquiry is
persisted, independent of the visitor's own browser — see
`docs/ANALYTICS.md` §6.4 for the exact one-line call site in
`api/anfrage/route.ts` (booking-agent owned, not wired in here).

### 9. Whether a "date already taken" result kills the funnel was previously unanswerable
**Impact: High (directly answers a question the brief asks) · Effort: Low — shipped, needs 1-line wiring**

`AvailabilityIndicator` already treats `taken` as an invitation (a waiting-
list framing, `takenHint` copy), never as a dead end — good existing
product decision. But there was no way to confirm whether that framing
actually works, i.e. whether visitors who see "taken" abandon at a higher
rate than those who see "free". `trackAvailabilityChecked(status)` (see
`docs/ANALYTICS.md` §6.2) makes this directly measurable against the
existing `enquiry_step_completed`/`enquiry_submitted` funnel once both are
wired in and a few weeks of data accumulate.

### 10. FAQ/answers content engagement was a complete blind spot
**Impact: Medium · Effort: Zero — shipped, works immediately**

`/ablauf`'s `<FaqAccordion>` and every city page's `<CityFaq>` use native
`<details>`/`<summary>` (correct, accessible, SSR-complete per
`docs/GEO-STRATEGY.md`'s own reasoning) — but nothing ever recorded whether
visitors actually open them. `faq_expanded` now fires automatically via
`<AutoTrack>`'s capture-phase `toggle` listener, with **zero** code change
needed in either component. Note: `/fragen` (the GEO answer hub,
`<AnswerBlock>`) deliberately never collapses its Q&A pairs — see that
component's own doc comment — so it will never fire this event, by design,
not by omission.

---

## Insertion summary (this agent's components)

| Component | File | Depends on |
|---|---|---|
| `TrustRow` | `src/components/cro/trust-row.tsx` | `site.stats` (static) |
| `ResponseTimeBadge` | `src/components/cro/response-time-badge.tsx` | `messages/*.json` → `cro.responseTimeBadge` |
| `SeasonScarcity` | `src/components/cro/season-scarcity.tsx` | `getBlockedDates()` (read-only import from `src/content/availability.ts`) |
| `SaveForLater` | `src/components/cro/save-for-later.tsx` | `getSite()` (read-only import) |

All four are exported from `src/components/cro/index.ts`. None are mounted
anywhere by this agent — every insertion point above is a precise
instruction for the owning agent, per `.claude/CONTRACT.md`'s file
ownership table.

---

## Part 4 — Performance (Core Web Vitals)

**No dev server or build was run for this work** (per this agent's brief).
Everything below is **inspected from source**, not measured with Lighthouse/
PageSpeed/WebPageTest — stated as inspection, not measurement, throughout.

### Hero (LCP-critical path) — inspected, looks correctly built
- The `<h1>` is real, server-rendered text (`src/components/hero/hero.tsx`)
  with no client-side dependency to paint — this is the LCP element and it
  has nothing blocking it.
- `<HeroAftermovie>` (`src/components/hero/hero-aftermovie.tsx`) renders
  `null` entirely until a real `src` prop exists — today it costs **zero**
  bytes and zero decode time. When a real aftermovie file is wired in later
  (`TODO(kunde)`), it already uses `preload="none"` — re-verify LCP at that
  point, since even a muted `autoPlay` video can add decode contention on
  low-end mobile depending on file size/codec; the props are right, the
  actual file's encoding will matter too.
- `<HeroScene>` (WebGL particles) is dynamically imported with `ssr: false`,
  gated behind `prefers-reduced-motion`, a coarse-pointer+low-core-count
  check, and deferred via `requestIdleCallback`/`setTimeout(…, 200)` so it
  never competes with first paint. `<HeroParticles>` itself caps at 260
  points, disables antialiasing, requests `powerPreference: 'low-power'`,
  and caps device-pixel-ratio at 1.5 — a deliberately cheap scene by design.
  This is a well-built pattern; no changes recommended.

### Audio player / global state — inspected, looks correctly built
- The single `<audio>` element is created imperatively in a `useEffect`
  (`src/components/audio/audio-provider.tsx`), never server-rendered, with
  `preload = 'none'` — it costs nothing until a track is actually started.
- `<GlobalPlayer>` returns `null` until `current` is set — no persistent
  bottom-bar chrome exists on first load at all, so it can't contribute to
  CLS or LCP on any page a visitor hasn't started playback on.
- `wavesurfer.js` is dynamically `import()`-ed only inside
  `<WaveformPlayer>`'s effect, and only when that exact track is the
  globally active one (`isLive`) — never bundled into the initial load, never
  decoding audio for a track nobody asked to hear.

### Social feed — inspected, looks correctly built for CLS/LCP
- `<InstagramStrip>`/`<SocialPostGrid>` are async Server Components; images
  go through `next/image` (per `.claude/CONTRACT.md`'s mandate) which
  reserves layout space — no CLS risk was found in how the grid is composed.
  Did not independently verify actual image dimensions/`sizes` attributes
  against real cached files (`docs/SOCIAL-FEED.md`'s caching layer) — that
  would need a running instance with real cached thumbnails to check.

### Showreel — inspected, correctly built
- `<ShowreelFacade>` is a genuine click-to-load facade: no `<iframe>` exists
  in the DOM until the visitor clicks play, matching `.claude/CONTRACT.md`'s
  explicit requirement. Correct as built.

### What this PR adds to the performance surface — and why it's low-risk
- `<AnalyticsRoot>` (bootstraps Plausible/GA4/Clarity, the delegated click/
  scroll/toggle listeners) and `<ConsentBanner>` are new client components
  mounted at the root. Plausible's script is `defer`, small (~1 KB), and
  the single core provider active for most visitors. GA4/Clarity scripts
  are never requested until the visitor explicitly consents — by
  construction, they cannot affect LCP/INP for the (likely majority of)
  visitors who never opt in, and for those who do, the load happens well
  after first paint (a deliberate user click, not a page-load event).
- `<AutoTrack>`'s scroll listener uses `{ passive: true }` and a
  `requestAnimationFrame` throttle — one rAF-scheduled callback per scroll
  burst, not per scroll event; its click/focus/toggle listeners are
  attached once (empty dependency array) and never re-registered on route
  change. None of this should measurably affect INP, but this is an
  inspection-based judgement, not a measured one — **recommend a real
  Lighthouse/PageSpeed pass once this PR and the booking-agent's/home-
  agent's insertion changes are both merged**, specifically checking INP on
  the `/anfrage` page (most interaction-heavy) and scroll-jank on the
  homepage (longest page, most `<Reveal>`/GSAP instances).

### Honest gaps in this performance section
- No bundle-size analysis was run (`@next/bundle-analyzer` isn't configured
  in this repo as far as this agent found).
- No real device testing (mid-tier Android in particular, the segment most
  at risk from the WebGL hero) was possible without running the app.
- Font loading (`src/lib/fonts.ts`, layout-agent owned) was not inspected —
  Cormorant Garamond + Inter both being variable fonts is a good sign for
  CLS, but this agent did not verify `font-display` strategy or preload
  hints.

---

## What conversion work can achieve vs. what depends on the client

Stated plainly, per this agent's brief:

- **Code can, and this PR does:** remove friction, add trust proximity, add
  honest urgency, add a soft exit path, and — most importantly — make every
  one of those changes *measurable* going forward, so the next round of
  prioritization is based on real visitor behaviour instead of another
  round of hypotheses.
- **Code cannot manufacture:** the 5.0★ Google rating's review *count*
  (`site.reviews.isPublishable` stays `false`, and every component built
  here correctly respects that gate — `TrustRow` never references it), real
  wedding photography (`.claude/BRAND-FACTS.md` is explicit that the
  current photo set has zero usable wedding imagery), real package prices
  (every price still renders "Preis auf Anfrage" — a fabricated number
  would violate `.claude/CONTRACT.md`'s core rule and would also be a worse
  trust signal than honestly saying "ask us", not a better one), or real
  testimonials (`testimonials.ts` stays an empty array until the client
  supplies real quotes). Every one of these is a bigger conversion lever
  than anything left to build in this codebase — see
  `docs/SEO-ACTION-PLAN.md` §(c) for the identical conclusion reached
  independently on the SEO side of this project.
