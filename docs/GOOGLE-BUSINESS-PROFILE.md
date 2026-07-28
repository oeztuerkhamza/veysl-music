# DJ Veys — Google Business Profile (Google Maps)

Ordered, field-by-field setup for the Google Business Profile (GBP) — the single
highest-leverage off-page lever in `docs/SEO-ACTION-PLAN.md` §(c).1. Work top to
bottom: every step depends on the ones above it.

**All values in this doc come from `src/content/site.ts` and
`.claude/BRAND-FACTS.md`. Nothing here is invented.** Where a value is still
unknown it is marked `TODO(kunde)` — leave the field empty rather than guessing.
An invented address or review count is worse than an incomplete profile: it risks
a suspension that costs the 5.0 rating and the whole review history.

The customer-facing language of the profile is **German**. GBP has one primary
language per listing — the multilingual story lives on the website (7 locales),
not in the profile.

---

## 0. Before touching anything — the one rule that matters

**Do not create a new listing.** A verified profile already exists under the
previous brand name (`site.previousNames` = `VeysTunesOfficial`) and it carries
the **5.0 ★ rating and the entire review history**. Those reviews are attached to
the Place ID, not to the name — renaming the existing listing keeps them, a new
listing starts at zero and splits the local signal in two.

Identifiers read off the current Maps link (`site.social.googleMaps`):

| | |
|---|---|
| Maps short link | `https://maps.app.goo.gl/YCLDDHtrZfQEbhd48` |
| CID | `0xa8532d8d440d6fa9:0xb83556b975766939` |
| Knowledge Graph ID | `/g/11xp06nh71` |
| Place ID | `TODO(kunde)` — see step 12 |

If a duplicate listing already exists (common after a rebrand), do **not** delete
either one: report the duplicate to Google as a duplicate so the reviews get
merged into the surviving listing.

---

## 1. Claim and verify ownership

Sign in at [business.google.com](https://business.google.com) with the account
that owns the listing. If the listing isn't in that account, claim it ("Diesen
Eintrag beanspruchen") and go through the ownership-transfer flow.

- Germany + service-area business currently means **video verification** in most
  cases: a single unbroken recording showing the equipment, branded material and
  the person. Have the **Gewerbeanmeldung** ready — it is the fastest evidence.
- Add a second owner/manager account afterwards (a Google account the client
  controls personally). Losing sole access to a verified listing is a
  multi-week recovery.

Do not proceed to step 2 until the listing shows **verified**. A name change on
an unverified listing can send the whole profile back into review.

---

## 2. Business name — exactly the wordmark, nothing else

```
DJ Veys
```

That is `site.name`, and it is the entire field. **No keywords, no location, no
tagline.** "DJ Veys Hochzeits-DJ Stuttgart" violates Google's name policy and is
the most common cause of hard suspensions in this niche — competitors report it.

`VeysTunesOfficial` belongs in continuity signals only (schema `alternateName`,
301s, Search Console) — never in the GBP name field. See the entity-model note at
the top of `src/lib/schema.ts`.

A name change on a verified listing usually triggers a short re-review. Expected.

---

## 3. Business type — service-area business, address hidden

DJ Veys travels to the customer; there is no walk-in location. In GBP terms:

- Answer **"Nein"** to "Kunden an deinem Standort bedienen?" / hide the address.
- Google still asks for the real street address for verification — that is
  internal and not shown publicly once the listing is set as service-area only.
- **Never** use a virtual office, a mailbox address or a friend's address. A
  fake address is the second-most-common suspension cause after keyword stuffing.

The street address is `TODO(kunde)` in `site.address` and is **also** legally
required for the Impressum (§ 5 DDG) — the same task unblocks both. It can be
maintained in the admin panel (site-settings → "Rechtliche Angaben") without a
deploy.

---

## 4. Service areas — the Tier-1 list, not all of Europe

Enter exactly the eight cities from `site.serviceAreas`:

```
Stuttgart · Esslingen · Ludwigsburg · Böblingen
Heilbronn · Reutlingen · Pforzheim · Karlsruhe
```

GBP allows up to 20 areas. **Do not fill all 20, and do not add "Deutschland" or
European countries.** Map-pack ranking is driven by proximity to the searcher;
claiming a huge area does not extend reach, it dilutes the relevance signal for
the core region. The Germany-wide and Europe-wide reach
(`site.germanyCities`, `site.europeCountries`) is carried by the website's
region pages — `docs/SEO-EUROPE-STRATEGY.md` §"what this cannot do" says the same
thing: no verified profile, no map-pack position abroad. That is expected and fine.

---

## 5. Categories — one specific primary, a few honest secondaries

**Primary category: `DJ`.** The most specific match, and the one that competes in
"Hochzeits-DJ Stuttgart" map results. The primary category carries far more
ranking weight than all secondaries combined — do not swap it for a broad
"Unterhaltung"/"Eventagentur" category.

Secondary categories (pick from what the GBP UI actually offers — Google renames
and retires categories, so match by meaning, and add only what is true):

| Intent | German category, roughly as it appears |
|---|---|
| Weddings as core business | `Hochzeitsservice` |
| Saz/guitar, live orchestra | `Musiker` |
| Ton-/Licht-/Veranstaltungstechnik | `Verleih von audiovisuellen Geräten` (or the closest party/event-equipment rental category) |
| Engagements, corporate, birthdays | `Eventveranstalter` / `Veranstaltungsagentur` |

Keep it to **3–5 total**. Every secondary category makes the profile eligible for
more query types but slightly blurs what Google thinks the business primarily is.
Do not add "Moderator" workarounds — hosting is covered in the description and
services, where it belongs.

---

## 6. Contact data — byte-identical to the website (NAP consistency)

| Field | Value | Source |
|---|---|---|
| Telefon (primary) | `+49 176 64844815` | `site.contact.phone` |
| Website | `https://dj-veys.de/` | `site.url` |
| Termin-/Buchungslink | `https://dj-veys.de/anfrage?utm_source=google&utm_medium=organic&utm_campaign=gbp` | `/anfrage` route |
| E-Mail (where GBP asks) | `info@dj-veys.de` | `site.contact.email` |

Two deliberate choices:

- **The website field stays clean** (no UTM). It is an entity-matching signal
  that should match the canonical URL exactly. Attribution happens on the
  booking link instead, which Plausible picks up from the UTM parameters
  (`docs/ANALYTICS.md`) — so "how many enquiries came from Maps" becomes
  answerable without polluting the canonical link.
- **The phone number must be written the same way everywhere** — GBP, Impressum,
  Instagram bio, every directory in `docs/SEO-ACTION-PLAN.md` §(c).2. Google
  matches citations on exact string similarity.

Also update the old-domain references at the same time: the GBP website field is
the single most important external link that must move from
`veystunesofficial.de` to `dj-veys.de` (`docs/DEPLOYMENT.md` step 8).

---

## 7. Opening hours — contact hours, not performance hours

A wedding DJ is not "open" during a wedding. These hours tell customers **when a
call gets answered**, and Google shows a "geschlossen" badge outside them.

- `TODO(kunde)`: real reachable hours. A realistic pattern for a business run
  alongside a full-time IT job (see BRAND-FACTS "Personal story") is
  weekday evenings + Saturday, e.g. Mo–Fr 17:00–21:00, Sa 10:00–18:00, So
  geschlossen.
- **Do not set "24 Stunden geöffnet"** — it reads as spam and misleads callers.
- Set **Sonderzeiten** (special hours) for German public holidays; an unhandled
  holiday triggers Google's "Öffnungszeiten bestätigen" prompts and, worse,
  user-suggested edits.

---

## 8. Description — 750 characters, humans first

Google shows roughly the **first 250 characters** before "Mehr" — front-load the
substance. No URLs (stripped), no prices, no keyword lists, no ALL CAPS.

Draft (German, 683 characters as a single paragraph — the line breaks below are
for readability only, paste it as one block):

```
DJ Veys ist DJ, Musiker und Moderator für Hochzeiten und Events in Stuttgart,
Baden-Württemberg und deutschlandweit. Seit über 12 Jahren begleite ich
Hochzeiten, Verlobungen, Kına-Abende, Geburtstage und Firmenfeiern – über 200
Veranstaltungen. Die Besonderheit: DJ und Live-Orchester mit Bläsern aus einer
Hand, dazu Live-Musik auf Saz und Gitarre. Moderiert wird auf Deutsch, Türkisch
und Englisch – passend für deutsch-türkische und multikulturelle Feiern. Ton-,
Licht- und Veranstaltungstechnik vermiete ich ebenfalls, inklusive Aufbau und
Soundcheck vor jedem Event. Persönliche Beratung, individuelle Musikplanung und
Zuverlässigkeit vom ersten Gespräch bis zur letzten Minute.
```

Every claim in there is verified in `.claude/BRAND-FACTS.md`: 12+ Jahre, 200+
Events, DJ & Orkestra with horns, Saz/Gitarre, hosting in DE/TR/EN, AV rental,
soundcheck before every event.

---

## 9. Services ("Leistungen") — one entry per capability, no prices

Add one service per entry in `site.capabilities`, each with a short German
description. Suggested names:

| `site.capabilities` | GBP service name |
|---|---|
| `wedding-dj` | Hochzeits-DJ |
| `event-dj` | Event-DJ (Verlobung, Geburtstag, Firmenfeier) |
| `host` | Moderation auf Deutsch, Türkisch und Englisch |
| `live-music` | Live-Musik: Saz & Gitarre |
| `orchestra` | Live-Orchester mit Bläsern |
| `traditional-turkish` | Gelin Çıkarma, Bando, Davul Zurna |
| `av-rental` | Vermietung von Ton-, Licht- und Veranstaltungstechnik |

**Leave every price field empty.** No package pricing is public
(`localBusinessSchema()` omits `priceRange` for the same reason), and a number
posted here becomes the number customers hold you to.

Attributes ("Attribute"): tick only what is factually true. `Online-Termine`
and `Inhabergeführt` are safe; do not tick identity attributes unless the client
explicitly asks for them.

---

## 10. Photos and logo — and the honest blocker

Technical requirements: JPG/PNG, 10 KB–5 MB, min. 720×720 px.
Logo square (1:1), cover photo 16:9.

⚠️ **Read `.claude/BRAND-FACTS.md` §Media before uploading anything.** The 12
legacy photos contain **no real wedding photography** — no couples, no full dance
floor, no venue. Specifically:

- `05-86ab7620.jpg` is **stock** (a man at a shoreline, not Veysel) — unclear
  licence, must never be uploaded to GBP.
- `01-156b4efb.jpg` (booth in an empty white room) is acceptable **only** as a
  small "Setup/Soundcheck" photo, never as the cover.
- The logo is also still `TODO(kunde)` — `organizationSchema()` currently points
  at a placeholder `/logo.png`.

So: upload the equipment/setup shots that are genuinely presentable, and treat
**professional photos and video from real weddings as the client task it is** —
it is already flagged as the #1 launch blocker. Profiles with real event
photography convert dramatically better in this market than profiles without.

Ignore any advice about geotagging photo EXIF for ranking: Google strips EXIF on
upload. It does nothing.

---

## 11. Ongoing activity — posts, Q&A, messaging

- **Google Posts:** one per week, up to 1500 characters, each with a CTA button
  pointing at the booking link from step 6. Real content only — a photo from last
  weekend's event, an availability note for the season
  (`site.season.year`), a new guide from `/ratgeber`. Posts expire, so cadence
  beats perfection.
- **Q&A:** seed 5–8 questions from the owner account and answer them. This is
  explicitly allowed and it is free SERP real estate. Mirror the strongest
  entries from `/fragen` (`src/content/answers.ts`) — same answers, shortened.
- **Messaging (Chat):** leave it **off** unless it will genuinely be answered
  within 24 h. Google publishes the response time, and bookings currently arrive
  via Instagram DM (BRAND-FACTS) — an unanswered GBP chat is a visible negative
  signal. Funnel to phone/WhatsApp/`/anfrage` instead.

---

## 12. Place ID → the review link → the review count

This is the step that unblocks code, so do it deliberately.

1. Get the Place ID with Google's
   [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id)
   — search the business, copy the `ChIJ…` string. The CID and KG ID in step 0
   are search starting points, **not** a Place ID.
2. Enter it in `site.reviews.googlePlaceId`.
3. The review link is then `https://g.page/r/{PLACE_ID}/review` — put it in
   WhatsApp follow-ups after each event.
4. Read the **real** review count and rating off the profile and enter them in
   `site.reviews.count` / `site.reviews.rating`.

Step 4 turns on the **visible** review section: the real rating, the real
count, and the review text itself, fetched live through the Places API
(`src/lib/reviews/google-places.ts`) and shown with Google attribution.

It does **not** turn on `AggregateRating` schema, and that is deliberate.
Google's review-snippet guidelines require ratings to be sourced directly from
your own users and explicitly forbid aggregating reviews from another platform
— copying Google's own aggregate back onto your site as your `aggregateRating`
is one of the documented ways to earn a manual action. `aggregateRatingSchema()`
therefore stays gated, and the star rich snippet remains reserved for
first-party testimonials collected through this site's own form.

So the two things are separate, and mixing them up is the mistake to avoid:

| | Source | What it powers |
|---|---|---|
| Google reviews | Places API, live | Visible review section with attribution and a link to Google |
| Own testimonials | Couples, via this site | `AggregateRating` schema → star rich snippet |

**How to ask:** one client at a time, right after the event, with the direct
link. Never a batch blast — review spikes trip Google's abuse detection. Never
offer a discount or gift for a review (review gating/incentives violate policy
and can wipe the review set). Reply to every review, positive and negative,
specifically rather than from a template.

---

## 13. Search Console and the domain move

- Verify `dj-veys.de` in Google Search Console (domain property) and submit the
  sitemap.
- If `veystunesofficial.de` is still verified there, run the **Adressänderung**
  after the 301s are live — see `docs/DEPLOYMENT.md` step 8 and
  `docs/SEO-ACTION-PLAN.md` §"domain migration".
- GBP and Search Console are separate systems: the domain move does **not** move
  reviews. Reviews only survive because the listing itself survives (step 0).

---

## 14. Monthly maintenance

- **"Von Google vorgeschlagene Änderungen"** / user-suggested edits: check
  monthly. Anyone can suggest a category, hours or even an address change, and
  Google sometimes applies them silently. This is the most common way a
  well-configured profile quietly degrades.
- GBP Performance report: track calls, direction requests, website clicks,
  and which search queries surfaced the profile. Compare website clicks against
  the `utm_campaign=gbp` numbers in Plausible.
- Re-check NAP consistency whenever the phone number or address changes —
  everywhere in `docs/SEO-ACTION-PLAN.md` §(c).2 at once, not one by one.

---

## What the code is still waiting for

Data that only the GBP owner can supply, and what each item unblocks:

| Data | Goes into | Unblocks |
|---|---|---|
| Place ID (`ChIJ…`) | `site.reviews.googlePlaceId` | the whole live review section, the "write a review" link, Maps embed by Place ID |
| Places API key | `GOOGLE_PLACES_API_KEY` (server env) | live rating, count and review text — see `src/lib/reviews/google-places.ts` |
| Real review count | `site.reviews.count` | static fallback only, for when the API is unavailable. **Not** `AggregateRating` — see step 12 |
| Street + postal code | `site.address` (or admin panel) | complete Impressum, `streetAddress` in `PostalAddress` schema |
| Reachable hours | — | `openingHoursSpecification` in `localBusinessSchema()` (not yet modelled) |
| Lat/long of the service area centre | — | `geo` + `hasMap` in `localBusinessSchema()` (not yet modelled) |
| Brand logo | replaces placeholder `/logo.png` | `organizationSchema().logo`, GBP logo slot |

The last three rows are **code work that becomes possible once the data exists** —
`LocalBusinessSchema` currently models no `geo`, `hasMap` or
`openingHoursSpecification` at all. Wire them only with real values.

---

## Never do this

Each of these is a real suspension or ranking risk, not a style preference:

1. Keywords in the business name field.
2. A second listing under the new brand name.
3. A fake, virtual or borrowed street address.
4. Review incentives, review gating, or batch review requests.
5. Invented prices, invented review counts, invented service areas.
6. Stock photography presented as his own events (`05-86ab7620.jpg`).
7. "24 Stunden geöffnet" or hours nobody answers the phone in.
