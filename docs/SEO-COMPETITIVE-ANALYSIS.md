# VEYSL — Competitive SEO Analysis (Stuttgart + ~200 km radius)

**Method:** live Google-style web searches (via search API, July 2026) for the queries
listed in the brief, plus direct fetches of the most-recurring competitor domains to
inspect tech, schema, pricing, review counts and language coverage. This is **SERP
sampling, not a rank tracker** — the order links come back in a search-tool response is
directional, not a guaranteed live Google position. Where a review count or rating is
quoted, the source URL is given; treat anything not sourced as absent, not zero.

No search-volume tool was used (no Ahrefs/Semrush/GSC access to this niche). Any volume
language in this doc is a **qualitative competition read** (how many players, how deep
their content, how many reviews), not a number — see `docs/SEO-KEYWORD-MAP.md` for where
volumes are explicitly flagged as estimates.

---

## 1. The core Stuttgart SERP — who actually shows up

Queries: `hochzeits dj stuttgart`, `dj hochzeit stuttgart`, `hochzeits dj baden-württemberg`.

The Stuttgart wedding-DJ SERP is **crowded but not authority-dominated** — no national
brand, no Google/Amazon-scale player. It's a mix of three tiers:

1. **Solo DJs with their own site** (the majority) — [dj-stuttgart.com](https://dj-stuttgart.com/), [alexanderlorenzdj.de](https://alexanderlorenzdj.de/dj-stuttgart/), [rafaelmarcomusic.com](https://rafaelmarcomusic.com/hochzeits-dj-stuttgart/), [monicababilon.com](https://www.monicababilon.com/hochzeits-dj-stuttgart), [tjano.de](https://www.tjano.de/citys/dj-stuttgart-hochzeit/), [steve-sun.com](https://www.steve-sun.com/hochzeits-dj-stuttgart), [dj-evin.de](https://dj-evin.de/), [dj-bande.de](https://www.dj-bande.de/dj-stuttgart.html) (single-page instance of a bigger network), [deindj.net](https://www.deindj.net/), [eventdj-stuttgart.de](https://eventdj-stuttgart.de/).
2. **Exact-match-domain single operators** — [hochzeitsdjstuttgart.de](https://hochzeitsdjstuttgart.de/) and [dj-hochzeit-stuttgart.de](https://dj-hochzeit-stuttgart.de/). Domain match still carries weight in a low-authority niche like this.
3. **Directories/marketplaces** — [hochzeit.click](https://hochzeit.click/de/hochzeits-djs/stuttgart/), [hochzeitsportal-stuttgart.de](https://www.hochzeitsportal-stuttgart.de/musik-saenger-dj-band/hochzeits-dj), [eventpeppers.com](https://www.eventpeppers.com/de/browse/djs/hochzeits-dj/ort/deutschland/baden-wuerttemberg/stuttgart), [eventzone.de](https://eventzone.de/hochzeits-dj/baden-wuerttemberg), [evely.com](https://www.evely.com/dj-stuttgart.html), [weddyplace.com](https://www.weddyplace.com/de/hochzeits-dj/stuttgart/), [hochzeitsportal24.de](https://www.hochzeitsportal24.de/branchenbuch/djs/dj-stuttgart-stuttgart/). These own a disproportionate share of page-1 real estate (see §4).

**Nobody in tier 1 or 2 currently owns the Turkish/multicultural angle for Stuttgart
specifically at scale** except the "Serkan" cluster and DJ Cagatay/DJ Chatay — see §2.
That is VEYSL's opening.

---

## 2. Turkish-language and Turkish-niche competitors — the real fight

Queries: `türkischer dj stuttgart`, `türk düğün dj almanya`, `düğün dj stuttgart`,
`davul zurna dj stuttgart`, `kına gecesi dj stuttgart`, `nişan dj stuttgart`.

This is where VEYSL's actual competitive set lives. It is smaller than the general
market but more entrenched per competitor.

| Domain | Positioning | Reach claimed | Reviews found | Pricing | Languages | Tech/platform | Weakness |
|---|---|---|---|---|---|---|---|
| [tuerkischerdj.com](https://www.tuerkischerdj.com/) (DJ Serkan / Serkan Erkılınç, "das Original", est. 2000) | Turkish & Balkan weddings, Kına, Nişan, Sünnet | Explicitly names **~35 cities**: Stuttgart, Mannheim, Karlsruhe, Heilbronn, Reutlingen, Ulm, Freiburg, Böblingen, Göppingen, Aalen, Schwäbisch Gmünd, plus Frankfurt/Munich/Nuremberg/Cologne/Berlin/Hamburg, plus Austria/Switzerland/France and Istanbul/Antalya/Konya/Kocaeli | One fetch pass surfaced "5.0 · 30+ Bewertungen (96% 5★)"; a second pass didn't reproduce it — **treat as directionally true, re-verify live before quoting to the client** | Not published, quote-only | Turkish, German, English | Custom-built, not WordPress | No dedicated city landing pages despite naming ~35 cities — it's one long list on the homepage, which is a **thin/duplicate-content risk for Google**, not a strength. This is beatable with genuine per-city pages. |
| [djserkan.com](https://djserkan.com/) ("Serkan Erkılınç — Nr. 1 Hochzeits & Event DJ", Stuttgart) | Same name pattern, possibly the same person with two domains, or a second "Serkan"-branded operator — **could not confirm which** | 22+ years, 18 countries, 2,100+ events claimed | Not confirmed | Not published | Not confirmed | Not confirmed | Domain confusion between `tuerkischerdj.com` and `djserkan.com` is itself a signal that "Serkan" is the dominant name in this niche — worth monitoring, not worth copying. |
| [dj-cagatay.de](https://www.dj-cagatay.de/) (`dj-chatay.de` 301-redirects here) | Turkish & German-Turkish weddings, Kına, Nişan, Stuttgart only | Stuttgart-only, no city network | None found | Not published | German only (no TR/EN switcher found despite Turkish clientele) | **Wix** | Single-city, single-language site on a template builder — genuinely narrow. This is a beatable, direct peer. |
| [djalemserdar.de](https://djalemserdar.de/) | "Turkish, Kurdish, German-Turkish and multicultural weddings" | Nationwide + international, no city pages | None displayed | Quote-only | German primary, Turkish hosting mentioned | WordPress + Divi | Broad "internationally bookable" positioning with venue-partner references but no local landing pages — same city-page gap as the others. |
| [djorhan.de](https://www.djorhan.de/) (DJ Orhan Sentürk) | German-Turkish wedding DJ, Düğün/Nişan/Kına | 20+ years claimed | Not confirmed | Not confirmed | German/Turkish | Not confirmed | Long-standing brand name, thin site depth observed in search snippets. |
| [grupfantazi.com](https://www.grupfantazi.com/) | Turkish wedding **band** (live) that also offers DJ services | Germany + Switzerland | Not confirmed | Not confirmed | Turkish/German | Not confirmed | Competes more with VEYSL's live-music angle (saz/guitar) than pure DJ — different value prop, watch not copy. |
| [tuerkische-hochzeits-djs.de](https://www.tuerkische-hochzeits-djs.de/), [event-hochzeits-dj.de](https://www.event-hochzeits-dj.de/tuerkische-hochzeit-tuerkischer-dj-dugun-dueguen/), [firstclass-dj.de](https://www.firstclass-dj.de/dj-buchen-fuer-tuerkische-hochzeit/) | Niche directories/agencies specifically for Turkish weddings | Nationwide, Frankfurt-leaning | Varies | Some tiered | German | Directory-style | Nationwide directories, not Stuttgart-specific — they rank for the generic term but not for `stuttgart`-qualified long-tail. |
| [almanyadavulzurnaekibi.com](https://almanyadavulzurnaekibi.com/bolgeler/stuttgart) | Davul-zurna (traditional drum/horn) booking network with a **dedicated Stuttgart regional page** | Germany-wide network with per-city pages (proof the format works in this niche) | Not confirmed | Not confirmed | Turkish | Not confirmed | Narrow to davul-zurna, not full DJ/moderation/live-music — doesn't compete on VEYSL's full positioning, but does compete for the `davul zurna dj stuttgart` query specifically. |

**Reading this table honestly:** DJ Serkan / Serkan Erkılınç (whichever of the two
domains is the "real" one) is the single most dangerous competitor for VEYSL's exact
niche — same three-market position (Turkish + German + multicultural), similar
20-plus-year tenure claim, and an apparent 5.0-star review base. **If the client's own
review count turns out to be materially lower, that is the single biggest gap to close,
not a content or schema gap.**

The good news: **none of the Turkish-niche competitors run genuine per-city landing
pages.** They all use one long list-of-cities paragraph on the homepage. A real
`/hochzeits-dj/[stadt]` page — unique venues, unique local copy, per the doorway-page
rules in `docs/SEO-CITY-STRATEGY.md` — is a structural advantage no one in this specific
sub-niche currently has.

---

## 3. Non-Turkish competitors who already run city-page networks (the SEO-format threat)

These don't compete on the Turkish/multicultural angle, but they prove the **city-page
tactic itself works** in this exact niche and region — worth studying the format, not the
audience:

- **[lakeloveevents.com](https://www.lakeloveevents.com/) (DJ Celvin X)** — 9 dedicated
  regional pages found in the exact target region: Stuttgart, Bodensee, Esslingen,
  Freiburg, Heidelberg, Karlsruhe, Mannheim, Pforzheim, Heilbronn, plus a
  Baden-Württemberg hub. Transparent pricing (weddings from €900/3h), **12 reviews at
  5.0★** (self-reported on-site), solo operator, German-only. This is the clearest
  proof-of-concept that a single-operator DJ can rank across ~9 BW cities with real
  city pages — and 12 reviews is a genuinely low bar to eventually clear.
- **[djmartinmeyer.de](https://www.djmartinmeyer.de/)** — separate URLs per city
  (`/dj-hochzeit-mannheim/`, `/dj-hochzeit-heidelberg/`, `/dj-hochzeit-wuerzburg/`,
  homepage doubles as the Darmstadt page) across Mannheim, Heidelberg, Würzburg,
  Darmstadt and more. Same tactic, wider geographic spread, no Turkish/multilingual angle.
- **[dj-bande.de](https://www.dj-bande.de/)** — a 170+ DJ marketplace brand with its own
  per-city pages (`/dj-offenburg.html`, `/dj-freiburg.html`, `/djs-baden-wuerttemberg`),
  functioning as both directory and its own SEO-optimized network.
- **[rafaelmarcomusic.com](https://rafaelmarcomusic.com/)** — DJ + live singer running
  pages for Stuttgart, Karlsruhe, Mannheim, Heilbronn — same format again.

---

## 4. Aggregators and directories — who owns the top slots, and why that needs a different play

The brief is right to flag this separately: **you cannot out-content a directory the way
you out-content a peer DJ.** A directory ranks because it aggregates dozens of profiles,
runs rich schema, and Google rewards "one page, many options" for a comparison-shopping
query like `hochzeits dj stuttgart`.

| Directory | Scope | Depth found | Schema | Notes |
|---|---|---|---|---|
| [hochzeit.click](https://hochzeit.click/de/hochzeits-djs/stuttgart/) | Nationwide (DE/AT/CH), run by "TWO.HEARTS Media Group", **founded 2023** | 8+ DJs on the Stuttgart page alone, reviews shown per listing (one provider at 15 reviews) | WordPress-based, custom post types | Fast-rising newcomer — worth watching. A 2023-founded portal already ranking page-1 for a competitive city query means the format (curated directory + reviews + free-to-list) is working faster than organic peer sites can catch up. |
| [eventpeppers.com](https://www.eventpeppers.com/de/browse/djs/hochzeits-dj/ort/deutschland/baden-wuerttemberg/stuttgart) | Nationwide marketplace | **40 wedding DJs listed for Stuttgart within a 150 km radius**, review counts from 2–86 per profile, 3-tier pricing bands, ~3,000+ words of category/FAQ content | Rich, consistent profile layout (implies structured data) | The single thickest, most review-dense page found in this whole analysis. This is the one directory page that would be genuinely hard to outrank for the bare head term. |
| [hochzeitsportal-stuttgart.de](https://www.hochzeitsportal-stuttgart.de/musik-saenger-dj-band/hochzeits-dj) + sister sites (`heiraten-in-heilbronn.de`, `heiraten-in-tuebingen-reutlingen.de`, `heiraten-in-ludwigsburg.de`, `hochzeitsportal-freiburg.de`, `hochzeitsportal-bodensee.de`, `hochzeitsportal-karlsruhe.de`) | **Regional portal network, one subdomain-style site per city/region** | ~12 DJ profiles for Stuttgart, no star ratings shown, no pricing | Not confirmed | This is a template network (same "DJ-Service finden" layout, same nav pattern across cities) — it's an aggregator, not a genuine local voice. It ranks on regional relevance + directory breadth, not authority. Getting VEYSL **listed inside** these portals (a citation/backlink play, not a ranking fight) is more valuable than trying to outrank the portal itself. |
| [eventzone.de](https://eventzone.de/hochzeits-dj/baden-wuerttemberg) | Nationwide marketplace | 16 DJs shown for BW | **Full JSON-LD**: `PerformingGroup`, `MusicGroup`, `AggregateRating`, `PriceSpecification`, location data | The most technically sophisticated schema implementation found in this research. VEYSL's own schema (owned by the `seo` agent, `src/lib/schema.ts`) should match or exceed this depth once real review data exists. |
| [weddyplace.com](https://www.weddyplace.com/de/hochzeits-dj/stuttgart/), [evely.com](https://www.evely.com/dj-stuttgart.html), [hochzeitsportal24.de](https://www.hochzeitsportal24.de/branchenbuch/djs/dj-stuttgart-stuttgart/) | Nationwide portals | Price-comparison framing (`ab 199€`, `600–1200€` ranges) | Not confirmed | Same category as above — treat as citation targets, not ranking targets. |

**The honest takeaway for directories:** VEYSL will not outrank eventpeppers.com or
hochzeit.click for the bare 3-word head term `hochzeits dj stuttgart` in year one purely
through on-page work. The realistic play is (a) **get listed on the ones that matter**
(hochzeit.click, eventpeppers, hochzeitsportal-stuttgart.de, hochzeitsportal24.de) so
VEYSL shows up *inside* their results too, and (b) **win the long-tail and
Turkish-language queries where no directory has deep enough per-query content** — see
§5 and `docs/SEO-KEYWORD-MAP.md`.

---

## 5. What's under-served — the actual opening

Cross-referencing every search run for this analysis:

1. **`[query] + Stuttgart` in Turkish, with a genuine multi-page site.** Every Turkish-niche
   competitor found (§2) is either single-city-single-language (Cagatay), a long
   unstructured list of ~35 cities on one page (Serkan), or a nationwide directory with
   no Stuttgart specificity (tuerkische-hochzeits-djs.de, firstclass-dj.de). **Nobody
   combines: dedicated city pages + true DE/TR/EN trilingual site + the
   DJ-and-musician-and-Moderator three-in-one positioning.** VEYSL is structurally
   positioned to be first at that specific intersection.
2. **Genuine per-city pages in the client's own confirmed service area** (Esslingen,
   Ludwigsburg, Böblingen, Heilbronn, Reutlingen, Pforzheim, Karlsruhe — see
   `src/content/site.ts`). Competition in these smaller cities is real but shallow: mostly
   solo German-only DJs with a single generic page, no Turkish-specific competitor found
   in Esslingen, Ludwigsburg, Böblingen, or Pforzheim specifically.
3. **English-language wedding-DJ content for Stuttgart.** Zero English-specific wedding-DJ
   competitors surfaced anywhere in this research, despite Stuttgart hosting a large
   expat/corporate population (Mercedes-Benz, Porsche, Bosch HQ all here) that plausibly
   searches in English for international/destination weddings. This is a low-volume but
   near-zero-competition niche — a genuine quick structural win once the EN site exists.
4. **Frankfurt, Nürnberg and the Bodensee region already have entrenched Turkish-specific
   or city-network competitors** ([Firstclass-dj.de](https://www.firstclass-dj.de/), DJ
   Göki, DJ Michael Baumgartner for Nürnberg, and lakeloveevents/dj-brano/djbodensee for
   the Bodensee). These are lower-priority build targets — see
   `docs/SEO-CITY-STRATEGY.md` for the full tiering.

---

## 6. How we beat them — prioritised, honest

**Ranked by realistic leverage, not by what's easiest to build:**

1. **Reviews are the binding constraint, not content.** `site.reviews.isPublishable` is
   `false` because the count is unverified (`src/content/site.ts`). Meanwhile:
   lakeloveevents.com shows 12 reviews, one directory listing shows DJ Serkan at a
   reported ~30+, and eventpeppers.com profiles range up to 86. **No amount of on-page
   SEO substitutes for a visible, verified review count.** A DJ with 40 real Google
   reviews at 5.0★ and a mediocre website will out-convert and, over time, outrank a DJ
   with a flawless website and zero visible social proof — reviews are both a map-pack
   ranking factor and the #1 trust signal a couple actually reads. **This is the single
   highest-priority action, full stop** — see `docs/SEO-ACTION-PLAN.md` §(c).
2. **Ship genuine per-city pages for the 8 already-confirmed service-area cities first**
   (Stuttgart-adjacent: Esslingen, Ludwigsburg, Böblingen, Heilbronn, Reutlingen,
   Pforzheim, Karlsruhe) — this is the one tactical move proven to work by
   lakeloveevents.com and djmartinmeyer.de in this exact region, and it's currently
   uncontested in VEYSL's Turkish/trilingual niche. Each page needs real unique content
   (venue names, local character) — not a template with the city swapped; see
   `docs/SEO-CITY-STRATEGY.md` for the doorway-page guardrails.
3. **Own the Turkish-language long-tail Google isn't yet well served for.** `düğün dj
   stuttgart`, `kına gecesi dj stuttgart`, `nişan dj stuttgart`, `deutsch-türkische
   hochzeit dj stuttgart` — build TR-locale content (already planned per
   `src/i18n/routing.ts`) that no competitor currently runs as a full trilingual site,
   not a bolt-on page.
4. **Get listed inside the directories that already win the head term**, rather than
   fighting them for it: hochzeit.click, eventpeppers.com, hochzeitsportal-stuttgart.de,
   hochzeitsportal24.de, weddyplace.com. Free or low-cost profile listings, ideally with
   a link back to veysl.de — citation value plus occasional direct leads.
5. **Use the "DJ + Musiker + Moderator" three-in-one positioning as a wedge.** Every
   competitor profiled here is DJ-only, or DJ+singer (Rafael Marco, Grupfantazi), or
   DJ+band. **Nobody found in this research combines DJ, live saz/guitar performance,
   and trilingual live hosting in one act.** This is genuinely differentiated — lean on
   it in titles, H1s and schema (`PerformingGroup` with multiple `additionalType`s, per
   the eventzone.de schema pattern in §4), not just in prose.
6. **English is a nearly free win** — near-zero competition found, but also near-zero
   proven demand (no volume data available). Build it, don't over-invest content budget
   in it ahead of the German/Turkish work above.

**What on-page work cannot do:** it cannot manufacture reviews, backlinks, or the years
of brand recognition that "DJ Serkan" appears to have built since 2000. Anyone promising
that a new site alone will outrank a 25-year incumbent with 30 reviews in month one is
overselling. See `docs/SEO-ACTION-PLAN.md` for the realistic timeline.
