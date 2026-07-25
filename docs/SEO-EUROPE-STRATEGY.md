# VEYSL — Europe-Wide Reach Strategy (`/hochzeits-dj-europa`)

Extends VEYSL's search footprint from "Stuttgart region" to Germany-wide and Europe-wide
**without touching the local SEO that already works.** Read this alongside
`docs/SEO-COMPETITIVE-ANALYSIS.md`, `docs/SEO-KEYWORD-MAP.md`, `docs/SEO-CITY-STRATEGY.md`
and `docs/SEO-ACTION-PLAN.md` — this doc assumes their findings and does not repeat the
Stuttgart-region argument.

---

## 1. Why country-level beats city-level here — the honest argument

A Stuttgart-based business cannot rank in Oslo's or Amsterdam's Google local pack. Local
(map-pack) results are driven by proximity signals and a verified Google Business Profile
**in that area** — VEYSL has neither for any country outside Germany, Vienna's confirmed
booking notwithstanding (a single event does not create local relevance). Mass-producing
`Hochzeits-DJ <city>` pages across Europe — the exact pattern `docs/SEO-COMPETITIVE-ANALYSIS.md`
§2 already found done badly by `tuerkischerdj.com` (one long, unstructured list of ~35
cities, no dedicated pages) — is the textbook definition of a **doorway page** under
Google's spam policies: pages built to rank for similar searches that funnel users to one
destination, with no genuine per-page value. The penalty for that pattern is **domain-wide**,
not page-by-page — it would put the genuinely winnable `/hochzeits-dj/[stadt]` cluster
(Stuttgart + Baden-Württemberg, `docs/SEO-CITY-STRATEGY.md`) at risk for a payoff (foreign
city rankings VEYSL cannot realistically achieve) that was never going to materialize.

Six pages — five countries plus one hub — each earning its existence with real, specific,
non-templated content, is the opposite bet: it cannot win a local-pack query, but it can
legitimately rank for **country-qualified** and **non-geographic intent** queries where being
based in Stuttgart is a logistics detail, not a disqualifier.

**What this route family does NOT do, on purpose:**

- No European city pages. Not one.
- No page targets `Hochzeits-DJ Stuttgart` or any of the seven Tier-1 city keywords from
  `docs/SEO-CITY-STRATEGY.md`. Check `src/content/cities.ts` before adding any new keyword
  to this route family — if it's already a primary keyword there, it does not belong here.
- No internal link from `/hochzeits-dj-europa/**` into `/hochzeits-dj/[stadt]/**`, or vice
  versa. Two clusters, two jobs: one is local authority for Stuttgart/BW, the other is
  reach. Cross-linking them would blur that signal for Google, not reinforce it.
- No claim of "regularly booked" for any country except Austria/Vienna. Every other
  country is phrased as **availability** — see §4.

---

## 2. What was actually built

| Route | Content | Locales live now |
|---|---|---|
| `/hochzeits-dj-europa` | Hub: non-geographic intent Q&A, the five country cards, remaining-countries chips (reads `site.europeCountries` live), hosting-language honesty note, general destination-wedding FAQ | de, en, nl |
| `/hochzeits-dj-europa/oesterreich` | Austria — the one **verified** booking (Wien) | de, en |
| `/hochzeits-dj-europa/schweiz` | Switzerland — closest destination, only non-EU-customs-union country in the set | de, en |
| `/hochzeits-dj-europa/niederlande` | Netherlands — diaspora-led case, real Dutch (`nl`) prose | de, en, nl |
| `/hochzeits-dj-europa/belgien` | Belgium — split Flanders(`nl`)/Wallonia(`fr`) framing | de, en, nl |
| `/hochzeits-dj-europa/frankreich` | France — Alsace-adjacent vs. rest-of-France logistics split | de, en |

**Why these five, not twelve:** `site.europeCountries` lists eleven "bookable" countries
(Österreich, Schweiz, Niederlande, Belgien, Luxemburg, Frankreich, Italien, Spanien,
Dänemark, Schweden, Norwegen — the United Kingdom was in scope originally and was removed
mid-build, see §6). Five get dedicated pages because five is exactly how many currently
have a *real, differentiated* story to tell: a verified booking (Austria), a diaspora
angle backed by genuine general-knowledge context (Netherlands, Belgium), a border-region
logistics story already established for the `fr` locale (France, and Belgium's Wallonia),
and the closest, most frequently plausible destination (Switzerland). The other six —
Luxemburg, Italien, Spanien, Dänemark, Schweden, Norwegen — have no comparable hook yet.
Building them as templated pages today would repeat the exact mistake this whole
initiative exists to avoid. They stay reachable as honest "buchbar, noch keine eigene
Seite" chips on the hub (`RegionMoreCountries`, reading `site.europeCountries` live) and via
`/anfrage`, and are one dedicated page away from an upgrade the day a real hook exists
(a booking, a confirmed diaspora fact, a client-confirmed travel radius) — see §7.

---

## 3. Keyword map

### 3.1 Non-geographic intent — the actual Europe-wide opportunity

Per the brief: being based in Stuttgart is irrelevant to these queries, which is exactly
why they are mapped to the **hub**, not to any single country page.

| Keyword (DE) | Intent | Where |
|---|---|---|
| `türkischer Hochzeits-DJ deutschlandweit` | Germany-wide, Turkish-niche | Hub `intent` block, item 1 |
| `Hochzeits-DJ für Destination Wedding` | Generic destination-wedding intent | Hub `intent` block, item 2 |
| `DJ für türkische Hochzeit im Ausland` | Turkish wedding, any country | Hub `intent` block, item 3 |
| `wedding DJ destination Europe` (EN) | English-market equivalent | Hub `intent` block (EN), item 2 |
| `düğün DJ'i Avrupa` (TR) | Turkish-market equivalent | **Not live yet** — the hub's `intent` items are only in `de`/`en`/`nl` right now; the Turkish-phrased version of this exact query is written and ready in `messages/en.json`'s TR-equivalent draft (see the native-review note in §8) but blocked on `messages/tr.json` receiving the `regions` namespace. This is the single most important pending item for capturing this specific keyword — Turkish is the highest-differentiation locale on this whole site (`.claude/BRAND-FACTS.md`), and this query has zero identified competition (`docs/SEO-COMPETITIVE-ANALYSIS.md` §2 found nobody running a genuine TR-language site at all). |

Each hub intent item is rendered via `AnswerBlock` (`src/components/geo/answer-block.tsx`)
— a real `<h3>` question immediately followed by its answer paragraph in the
server-rendered HTML, no accordion — the same GEO-citable pattern already proven on
`/fragen`. AI answer engines lift this shape near-verbatim; a `düğün DJ'i Avrupa` query to
an AI assistant is exactly the kind of query this pattern is built to win once the TR copy
ships.

### 3.2 Country-qualified queries

Pattern: `Hochzeits-DJ {Land}`, `Hochzeits-DJ für {Land}`, `Destination Wedding {Land}`,
plus each country's own differentiated secondary set (never the same keyword mix twice —
same discipline as `docs/SEO-CITY-STRATEGY.md` §5.4):

| Country | Secondary keywords | Differentiator driving them |
|---|---|---|
| Österreich | `Hochzeits-DJ Wien`, `DJ für Hochzeit in Österreich`, `deutsch-türkischer DJ Österreich` | The one verified booking — see §4 |
| Schweiz | `Hochzeits-DJ Schweiz`, `DJ für Hochzeit Zürich`, `ATA Carnet Musiker Schweiz` | Closest destination + only non-EU-customs-union country in the set |
| Niederlande | `türkischer DJ Niederlande`, `Kürt DJ Hollanda`, `Turkse bruiloft DJ` | Turkish/Kurdish diaspora, now with real `nl` copy |
| Belgien | `Hochzeits-DJ Brüssel`, `Turkse bruiloft DJ België`, `DJ mariage turc Belgique` | Split Flanders/Wallonia framing, both `nl` and `fr` prose written |
| Frankreich | `Hochzeits-DJ Elsass`, `DJ mariage turc Alsace`, `Hochzeits-DJ Straßburg` | Alsace-adjacent logistics distinct from rest-of-France |

No search-volume tool was available for this pass either (same constraint as
`docs/SEO-KEYWORD-MAP.md`) — treat all of the above as **keyword mapping, not volume
estimation**. Difficulty is structurally low for every one of these: `docs/SEO-COMPETITIVE-ANALYSIS.md`
found zero dedicated German-based competitors running genuine per-country destination-wedding
content in this niche.

---

## 4. Honesty framing — the load-bearing constraint

- **`site.verifiedInternational` = `['Wien']`.** Exactly one `Region` entry
  (`oesterreich`) has `verified: true`. `RegionAvailabilityBadge` renders a visually
  distinct "bereits gespielt" badge only for that entry; every other country renders
  "buchbar in {country}" — availability, never track record. This mirrors the French
  translator's already-established Alsace distinction (`HANDOVER.md` §8) exactly.
- **Hosting languages.** `RegionLanguages` renders `Region.languagesNote` on every single
  country page, unconditionally (unlike `RegionDiaspora`, which can render nothing). Every
  version of that note says, explicitly: live hosting is German, Turkish and English only
  (`site.stats.hostingLanguages`) — never French, Dutch or any other language, regardless
  of which locale renders the page. For France, this is the exact `HANDOVER.md` §8
  distinction ("the French page exists so Alsace can read and enquire, not because
  moderation happens in French") applied verbatim; for the Netherlands and Belgium
  (Flanders), the same distinction was extended to Dutch once `nl` became a real site
  locale mid-build (see §6).
- **No fabricated diaspora numbers.** Every diaspora claim in `src/content/regions.ts` is
  deliberately qualitative ("one of the larger Turkish communities in Western Europe"),
  never a percentage or headcount — there is no per-country research document analogous to
  `docs/SEO-CITY-STRATEGY.md`'s cited Statistisches-Landesamt figures for these five
  countries, and inventing one would violate `CONTRACT.md` §3 the same way a fake review
  count would.
- **No invented venues, partners or past events.** None of the five country pages name a
  venue, a partner or a past event beyond the one verified Vienna booking.

---

## 5. What Europe-wide ranking can — and cannot — achieve without a local presence

Stated plainly, matching the honesty standard `docs/SEO-ACTION-PLAN.md` sets for the local
cluster:

**Can achieve:**

- Rank for country-qualified long-tail queries where no dedicated German-based competitor
  currently runs genuine content (`Hochzeits-DJ Österreich`, `türkischer DJ Niederlande`,
  etc.) — the bar here is low because almost nobody has cleared it.
- Rank for non-geographic intent queries (§3.1) regardless of physical location — these are
  intent, not local-pack, queries, and Google (and AI answer engines) do not require
  proximity to answer them.
- Be genuinely useful and conversion-ready for a couple who has *already decided* to book a
  Stuttgart-based DJ for a wedding abroad (a real, if smaller, segment: cross-border
  German-Turkish/Kurdish/French families is exactly VEYSL's stated core audience).
- Get cited by AI answer engines for exactly the intent queries in §3.1, via the same
  `AnswerBlock` pattern already proven on `/fragen`.

**Cannot achieve, and no amount of on-page work changes this:**

- A Google Maps / local-pack position in any city outside Germany. That requires a
  physical presence and a verified Google Business Profile in that specific area — neither
  exists, and pretending otherwise (via city pages) is precisely the risk this whole
  initiative is built to avoid.
- Outranking an established local provider in Vienna, Zürich, Amsterdam, Brussels or
  Strasbourg for their own **local** head terms (`Hochzeits-DJ Wien`, unqualified). This
  route family was never built to win that fight — it wins the qualified, cross-border
  version of the query instead.
- Turning "buchbar in {country}" into "regelmäßig gebucht in {country}" through copywriting
  alone. That phrase upgrade only happens when a real second, third, fourth booking exists
  — see §7.

---

## 6. Mid-build scope changes — both handled

Two changes landed in the shared files while this route family was being built; both are
reflected in the shipped code, not just noted here.

1. **United Kingdom removed from `site.europeCountries`.** Post-Brexit UK logistics for a
   touring musician are materially harder than any EU destination — equipment crossing the
   border generally needs an ATA Carnet, and performer work-permit rules are a separate
   question from EU freedom of movement entirely. Advertising UK availability without those
   logistics settled would set an expectation VEYSL can't cleanly meet, and the enquiry
   would likely die at the quote stage. No UK page was ever built; `RegionMoreCountries`
   reads `site.europeCountries` live, so the removal required zero code change on this
   agent's side.
2. **Non-EU customs union note added for Switzerland (and flagged for Norway).**
   Switzerland is the only one of the five dedicated countries outside the EU customs
   union, so `regions.schweiz.whatChanges` now explicitly names the mechanism (an **ATA
   Carnet** — the standard international customs document for temporarily exported
   professional equipment) rather than a vague "customs applies" line. Norway isn't a
   dedicated page, but the hub's `more` section and hub FAQ both call out the same
   customs-union distinction generically, so the "every European booking is equally simple"
   impression is never implied anywhere on the site.
3. **A new `nl` (Dutch) locale landed in `src/i18n/routing.ts` mid-build** — not part of
   this agent's original brief, discovered via a failing `tsc` pass. `routing.ts`'s own
   comment frames it exactly the way this brief frames `fr`: "Niederlande und Flandern
   (Belgien)" — a written/reading locale, not a hosting-language claim. Once confirmed that
   `messages/nl.json` already carried a complete, structurally matching `regions` namespace,
   real Dutch prose was added to the `niederlande` and `belgien` `Region` entries (both
   directly relevant: NL fully, BE's Flanders half) and `HUB_SUPPORTED_LOCALES` was widened
   to include it. The honesty rule extended cleanly: `languagesNote` for both countries now
   says hosting is German/Turkish/English only in **every** language the page renders in,
   including the new Dutch copy — never contradicted, never diluted.

---

## 7. How to measure this

Same discipline as `docs/SEO-ACTION-PLAN.md`'s own measurement section — don't judge a
low-volume, long-tail cluster on week-one data.

- **First 28 days:** track Impressions/average Position in GSC for the exact intent
  phrases in §3.1 (`türkischer Hochzeits-DJ deutschlandweit`, etc.) as the baseline signal
  that the hub is being crawled and understood correctly.
- **From day 28 onward:** track Clicks per country page individually — five small pages
  will not accumulate meaningful signal in week one, same caveat as the Tier-1 city pages.
- **The real trigger for expanding past five countries:** not a ranking metric, but a
  business one — the moment a second country gets a real, nameable booking (the way Vienna
  already has), that country's `Region.verified` flips to `true`, its copy upgrades from
  "buchbar" to a genuine reference, and — separately — a sixth dedicated page (Luxemburg,
  Italien, Spanien, Dänemark, Schweden or Norwegen, whichever the client actually travels
  to) becomes worth building, following the exact template this file's `Region` interface
  already defines.
- **Watch for cannibalization, not just growth.** Because the two clusters never link to
  each other and never share primary keywords, a drop in Tier-1 city-page rankings
  coinciding with this launch would be a signal something is wrong (e.g. a keyword overlap
  slipped through), not expected collateral — check `src/content/cities.ts` against any new
  copy added here before ever adding a seventh country.

---

## 8. Outstanding dependencies before this ships

Flagged with the same urgency `docs/SEO-ACTION-PLAN.md` used for `meta.cityLanding` — these
are the literal blockers between "code is correct" and "page is live":

1. **`src/i18n/routing.ts`** needs two new pathname entries (this agent does not own the
   file — exact entries given in the final report). Until they land, `buildMetadata()`
   and `<Link>` calls in this route family fail to compile (`tsc` confirms this is the
   *only* class of error left in this agent's own files).
2. **`src/lib/seo.ts`** needs `DynamicPathname`/`RouteParamsMap`/`messageNamespaceByPathname`
   extended to recognise `/hochzeits-dj-europa/[land]` (owned by the `seo` agent — exact
   diff in the final report).
3. **`src/app/sitemap.ts`** needs a `loadPublishedRegions()`-style entry mirroring
   `loadPublishedCities()`, reading `src/content/regions.ts`'s `regions` export the same
   way (owned by the `seo` agent).
4. **`messages/tr.json`, `ku.json`, `fr.json`, `es.json`** need the `regions` namespace.
   `messages/de.json` and `en.json` already have it (this agent added both, append-only).
   `messages/nl.json` already has it too (added by whatever process introduced the `nl`
   locale mid-build — verified structurally identical to this agent's `en.json` shape).
   Until `tr`/`ku`/`fr`/`es` are synced, `src/content/regions.ts`'s
   `CANDIDATE_LOCALES_BY_SLUG`/`BASE_SUPPORTED_LOCALES`/`HUB_SUPPORTED_LOCALES` deliberately
   withhold those locales — the underlying Turkish (all five countries) and French
   (Frankreich, Belgien) **prose is already written and correct**, gated off by exactly one
   shared constant per concern, widening safely the moment each message file is synced.
   This is not a cosmetic gap: `useTranslations` throws on a missing namespace, and without
   this gate `next build` would fail outright for those locale/country combinations, not
   just render untranslated.
5. **Native review recommended** for the Turkish, French and Dutch prose in
   `src/content/regions.ts`, same standard already applied to `src/content/cities.ts`'s TR
   copy (`docs/SEO-KEYWORD-MAP.md` §3: "Have a native Turkish speaker review all TR copy
   before publishing"). Machine-assisted drafting is a starting point here, not a final
   step, particularly for the Kına/Nişan/Halay-adjacent terminology and for the two
   deliberately parallel Dutch/French honesty sentences on the Belgium page.
