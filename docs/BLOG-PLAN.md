# VEYSL — Blog Editorial Plan (`src/content/blog/`)

**Scope:** this document covers the content built in this pass — 15 evergreen guide
articles + 2 real-wedding recap templates in `src/content/blog/`, and the demo
testimonial seed data in `src/content/testimonials-seed.ts`. It assumes
`docs/SEO-KEYWORD-MAP.md`, `docs/SEO-COMPETITIVE-ANALYSIS.md`, `docs/SEO-CITY-STRATEGY.md`
and `docs/GEO-STRATEGY.md` as background — read those for the page-level SEO/GEO layer
this content sits alongside. **No pages or routes were built in this pass** — a
`/ratgeber/[slug]` route (or similar) still needs to be wired up by whichever agent owns
`src/app/[locale]/*/page.tsx`, per `.claude/CONTRACT.md`'s file-ownership table. This
content is structured so that agent (or a future CMS import) can consume it directly —
see the design notes in `src/content/blog/types.ts`.

---

## 1. What exists today

| # | Slug | Category | Type / Status |
|---|---|---|---|
| 1 | `hochzeits-dj-checkliste` | planung | guide / published |
| 2 | `was-kostet-ein-hochzeits-dj` | kosten | guide / published |
| 3 | `tuerkische-hochzeit-ablauf-musik-timing` | tuerkische-hochzeit | guide / published |
| 4 | `kina-gecesi-henna-abend-planen` | tuerkische-hochzeit | guide / published |
| 5 | `eroeffnungstanz-songauswahl` | musik | guide / published |
| 6 | `dj-live-band-oder-beides` | musik | guide / published |
| 7 | `musikwuensche-no-go-liste` | musik | guide / published |
| 8 | `dramaturgie-hochzeitsabend` | planung | guide / published |
| 9 | `laermschutz-sperrzeiten-baden-wuerttemberg` | recht | guide / published |
| 10 | `freie-trauung-beschallung-mikrofone-wetter` | technik | guide / published |
| 11 | `deutsch-tuerkische-hochzeit-zwei-familien` | tuerkische-hochzeit | guide / published |
| 12 | `hochzeits-timeline-musterablauf` | planung | guide / published |
| 13 | `location-akustik-checkliste` | technik | guide / published |
| 14 | `davul-zurna-halay-roman-havasi` | tuerkische-hochzeit | guide / published |
| 15 | `destination-wedding-dj-buchen` | international | guide / published |
| 16 | `echte-hochzeit-vorlage-grosse-feier` | real-wedding | recap / **template** |
| 17 | `echte-hochzeit-vorlage-kina-abend` | real-wedding | recap / **template** |

`status: 'published'` means **content-complete and fact-checked against
`.claude/BRAND-FACTS.md`**, not "live on the site" — no blog route exists yet. The two
`status: 'template'` posts must never render publicly as-is; see §5.

---

## 2. Primary/secondary keywords and search intent

| Slug | Primary keyword (DE) | Secondary | Intent |
|---|---|---|---|
| `hochzeits-dj-checkliste` | hochzeits-dj checkliste | hochzeits-dj auswählen worauf achten, dj vergleichen | Informational, top-of-funnel |
| `was-kostet-ein-hochzeits-dj` | was kostet ein hochzeits-dj | hochzeits-dj kosten baden-württemberg, dj preise vergleichen | Informational/market-overview — **deliberately not** transactional, see §4 |
| `tuerkische-hochzeit-ablauf-musik-timing` | türkische hochzeit ablauf deutschland | nişan kına gecesi ablauf, deutsch-türkische hochzeit planen | Informational |
| `kina-gecesi-henna-abend-planen` | kına gecesi planen | henna abend ablauf, kına gecesi musik | Informational, planning-stage |
| `eroeffnungstanz-songauswahl` | eröffnungstanz lied auswählen | hochzeitstanz songauswahl, erster tanz song | Informational |
| `dj-live-band-oder-beides` | hochzeit dj oder live band | dj orchester hochzeit, live-musik hochzeit | Informational, decision-stage |
| `musikwuensche-no-go-liste` | musikwünsche hochzeit liste erstellen | no-go liste hochzeit dj | Informational |
| `dramaturgie-hochzeitsabend` | ablauf hochzeitsabend zeitplan | dramaturgie hochzeitsfeier, peaktime hochzeit | Informational |
| `laermschutz-sperrzeiten-baden-wuerttemberg` | sperrstunde hochzeit baden-württemberg | lärmschutz hochzeitsfeier, sperrzeitverkürzung hochzeit | Informational, legal-adjacent |
| `freie-trauung-beschallung-mikrofone-wetter` | freie trauung beschallung | mikrofon freie trauung, freie trauung im freien technik | Informational |
| `deutsch-tuerkische-hochzeit-zwei-familien` | deutsch-türkische hochzeit planen | zwei familien hochzeit, bikulturelle hochzeit | Informational |
| `hochzeits-timeline-musterablauf` | hochzeit zeitplan muster | hochzeits-timeline vorlage, ablauf hochzeitstag | Informational |
| `location-akustik-checkliste` | hochzeitslocation akustik checkliste | akustik saal hochzeit, location besichtigung | Informational |
| `davul-zurna-halay-roman-havasi` | davul zurna halay hochzeit | roman havası hochzeit, türkische hochzeitsmusik | Informational |
| `destination-wedding-dj-buchen` | destination wedding dj buchen ausland | hochzeits-dj ausland, dj mitnehmen hochzeit | Informational, high intent for a small segment |

No two posts share a primary keyword, and none duplicate the primary keyword of an
existing static page from `docs/SEO-KEYWORD-MAP.md` — see §4 for the one deliberate
near-overlap and why it's safe.

---

## 3. Why these 15 topics, not the brief's list verbatim

The brief's suggested topic list is followed closely; the one adjustment is splitting
"Vom Sektempfang bis zur Peaktime" (post 8, the evening's dramaturgy) clearly apart from
"Die Hochzeits-Timeline" (post 12, a concrete example schedule) — the brief lists both,
and they read as near-duplicates on paper. They're kept distinct on purpose: post 8 is
about *why* energy should rise and fall the way it does (the reasoning), post 12 is a
*worked example* with actual clock times. Cross-linked to each other (`relatedPosts`) so
a reader gets both the "why" and the "how", without one cannibalizing the other's
keyword (`dramaturgie hochzeitsfeier` vs. `hochzeit zeitplan muster` are genuinely
different queries).

---

## 4. Deliberate near-overlap: `was-kostet-ein-hochzeits-dj` vs. `/pakete`

`/pakete` (meta key `packages` in `docs/SEO-KEYWORD-MAP.md`) already targets
`hochzeits-dj preise stuttgart` — **transactional** intent, aimed at someone comparing
VEYSL's own three package tiers. The blog post targets `was kostet ein hochzeits-dj` —
**informational** intent, aimed at someone who hasn't found VEYSL yet and is researching
the market in general. This is a standard, defensible content pattern (a "how much does
X cost" educational post feeding a transactional pricing page), not cannibalization,
provided the two pages stay genuinely different in depth and framing — which they do:
the blog post cites only externally-sourced market ranges (see the file header comment
in `was-kostet-ein-hochzeits-dj.ts` for the exact search basis) and explicitly never
states a VEYSL price, while `/pakete` is where his own "Preis auf Anfrage" packages
live. The blog post's internal link to `/pakete` is the funnel between the two.

---

## 5. The two recap templates — how they get used

`echte-hochzeit-vorlage-grosse-feier.ts` and `echte-hochzeit-vorlage-kina-abend.ts` are
fill-in-the-blank skeletons, not drafts. Each uses two placeholder conventions inside
`body`:

- `{{TOKEN}}` — a blank matched 1:1 to that post's `templateFields` array. Replace with
  a real, couple-approved fact.
- `[ANLEITUNG: ...]` — an editing instruction for whoever fills the template in. **Delete
  the line entirely** once you've written the real paragraph it's asking for; never
  publish the instruction itself.

**Before either can go from `status: 'template'` to a real, publishable post:**

1. Get the couple's (and, for the henna template, specifically the bride's family's)
   written permission to publish first names, month/year, venue or general location, and
   any photos — the same consent bar as the testimonial HOW-TO in §7.
2. Confirm the venue name is real and the couple is happy to have it named (compare
   `src/content/venues.ts` and `src/content/cities.ts`, which apply the identical rule).
3. Fill every `{{TOKEN}}`, delete every `[ANLEITUNG]` line, and only then flip
   `status` to `'published'` and `type` stays `'recap'`.
4. If no photographer credit/permission exists, delete the `*Fotos: {{PHOTO_CREDIT}}*`
   line rather than leaving a placeholder in a published post.

Two templates, not one, because the wedding-day recap and the Kına Gecesi recap have
genuinely different structures (see post 3 and post 4 in §1) — reusing one template with
swapped labels would produce an awkward henna-night post shaped like a wedding write-up.

---

## 6. Publishing order and cadence

Cadence: **roughly one post every 3–4 days**, grouped in pairs/trios by theme so
`relatedPosts` links always have a live target to point at from day one, rather than
linking forward to something not yet published. `publishedAt` dates in the content
modules already reflect this schedule, starting shortly after this content pass:

| Wave | Date | Posts | Why this grouping |
|---|---|---|---|
| 1 | 2026-08-04 | `hochzeits-dj-checkliste`, `was-kostet-ein-hochzeits-dj` | Highest-intent, top-of-funnel pair — get these live first since they're the most likely entry point for someone who hasn't decided on VEYSL yet |
| 2 | 2026-08-11 | `tuerkische-hochzeit-ablauf-musik-timing`, `kina-gecesi-henna-abend-planen` | Core differentiator content — per `docs/SEO-COMPETITIVE-ANALYSIS.md` §5, nobody in the Stuttgart SERP runs a genuine trilingual site with this depth on Turkish wedding content |
| 3 | 2026-08-18 | `eroeffnungstanz-songauswahl`, `dj-live-band-oder-beides` | Music-decision content, feeds `/musik` |
| 4 | 2026-08-25 | `musikwuensche-no-go-liste`, `dramaturgie-hochzeitsabend` | Planning-stage content, feeds `/ablauf` |
| 5 | 2026-09-01 | `laermschutz-sperrzeiten-baden-wuerttemberg`, `freie-trauung-beschallung-mikrofone-wetter` | Technical/legal-adjacent pair, lower search volume but strong E-E-A-T signal and near-zero competing content found in research |
| 6 | 2026-09-08 | `deutsch-tuerkische-hochzeit-zwei-familien`, `hochzeits-timeline-musterablauf` | Ties waves 2 and 4 together |
| 7 | 2026-09-15 | `location-akustik-checkliste`, `davul-zurna-halay-roman-havasi` | Niche-but-uncontested technical/cultural explainers |
| 8 | 2026-09-22 | `destination-wedding-dj-buchen` | Smallest addressable segment, published last on purpose |

The two recap templates (`echte-hochzeit-vorlage-*`) are dated `2026-07-25` (today) only
because they need a `publishedAt` value for the type system — **they are not scheduled to
publish and must stay `status: 'template'`** until §5's conditions are met.

**Before any of wave 1 actually goes live:** confirm the blog route exists
(`/ratgeber/[slug]` or equivalent — not built in this pass) and re-verify each meta
title/description still fits inside 60/155 characters once real interpolation (if any)
is applied — all were counted by hand against the current copy and should be re-checked
if edited.

---

## 7. HOW-TO: collecting real testimonials

For `src/content/testimonials.ts` (owned by the pages agent, currently and correctly an
empty array) to ever contain real content, and to replace every row in
`src/content/testimonials-seed.ts` (this pass's demo-only fixture — see that file's
header comment) with genuine quotes:

1. **When to ask:** 2–3 days after the event, once the couple has had time to enjoy the
   photos/first impressions but before the day fades from memory. Asking during the
   event itself gets an inflated, in-the-moment answer; waiting weeks gets a vague one.
2. **How to ask:** a short, personal WhatsApp message (matches the existing
   `site.contact.whatsapp` channel) — not a generic mass email. Ask two things
   separately: (a) whether they'd be willing to share a few sentences about the evening,
   and (b) explicit permission to publish their first names, the month/year, and the
   venue name on the website. Don't bundle these into one vague "is it okay if we use
   your feedback?" question — each of the three data points (quote, names, venue) needs
   its own clear yes, in writing (a WhatsApp "yes, that's fine" counts, but keep the
   message).
3. **What to actually ask for:** avoid a generic "how was it?" — it produces generic
   answers. Better prompts: "Was hat sich für euch am meisten wie 'genau richtig'
   angefühlt?", "Gab es einen Moment, der euch besonders in Erinnerung geblieben ist?",
   "Würdet ihr uns weiterempfehlen, und was würdet ihr anderen Paaren sagen?" — these
   produce quotable, specific answers instead of "war schön, danke".
4. **Written permission, specifically:** German/EU consumer-protection law treats a
   published customer quote as an implicit claim that it's genuine and
   permission-granted (see the fake-review note in `testimonials-seed.ts`'s header). Get
   the "yes, you can publish this with our first names" confirmation in writing — a saved
   WhatsApp message is sufficient, a verbal "sure, go ahead" at the wedding is not enough
   to rely on months later.
5. **Replacing seed rows:** once a real testimonial is approved, add it to
   `testimonials.ts` (not this file) with `status`/whatever field the CMS-building agent
   settles on for "published", and delete the corresponding `testimonials-seed.ts` demo
   row it's replacing — don't let the two lists drift into having 30 combined entries
   with no clear "which one is real" signal.
6. **Target from `HANDOVER.md` §6:** 3–5 real testimonials before `/echte-hochzeiten`
   goes live, 30–50 within a year (matches the Google-reviews target in the same
   handover doc — the two efforts should run in parallel, since a couple willing to
   leave a Google review is also a good candidate to ask for a site testimonial in the
   same message).

---

## 8. Internal-linking map

Every post links to at least one static page (`links: StaticPathname[]`) and, where
relevant, to specific GEO answers (`relatedAnswers`, ids from `src/content/answers.ts`)
and city pages (`relatedCities`, slugs from `src/content/cities.ts`) — never as raw
hrefs inside the markdown body (see `types.ts` file header point 3 for why). Summary of
where link equity flows:

- **`/pakete`**: `hochzeits-dj-checkliste`, `was-kostet-ein-hochzeits-dj`,
  `eroeffnungstanz-songauswahl`, `dramaturgie-hochzeitsabend`, `hochzeits-timeline-musterablauf`,
  `location-akustik-checkliste`
- **`/musik`**: `tuerkische-hochzeit-ablauf-musik-timing`, `kina-gecesi-henna-abend-planen`,
  `eroeffnungstanz-songauswahl`, `dj-live-band-oder-beides`, `musikwuensche-no-go-liste`,
  `freie-trauung-beschallung-mikrofone-wetter`, `davul-zurna-halay-roman-havasi`
- **`/hochzeit-events`**: `tuerkische-hochzeit-ablauf-musik-timing`,
  `kina-gecesi-henna-abend-planen`, `laermschutz-sperrzeiten-baden-wuerttemberg`,
  `freie-trauung-beschallung-mikrofone-wetter`, `deutsch-tuerkische-hochzeit-zwei-familien`,
  `location-akustik-checkliste`, `davul-zurna-halay-roman-havasi`, both recap templates
- **`/ablauf`**: `dramaturgie-hochzeitsabend`, `hochzeits-timeline-musterablauf`
- **`/fragen`**: `hochzeits-dj-checkliste`, `was-kostet-ein-hochzeits-dj`,
  `tuerkische-hochzeit-ablauf-musik-timing`, `musikwuensche-no-go-liste`,
  `deutsch-tuerkische-hochzeit-zwei-familien`
- **`/anfrage`**: `was-kostet-ein-hochzeits-dj`, `destination-wedding-dj-buchen`, both
  recap templates (every post also mentions `/anfrage` in prose as the closing CTA,
  per the brief's requirement, even where it isn't in the structured `links` array)
- **`/epk`**: `dj-live-band-oder-beides`, `destination-wedding-dj-buchen`
- **`/echte-hochzeiten`**: both recap templates only (the only posts genuinely about a
  specific event, once real)
- **City pages** (`relatedCities`): spread across `esslingen`, `boeblingen`,
  `karlsruhe`, `heilbronn`, `pforzheim`, `reutlingen`, `stuttgart`, `ludwigsburg`,
  `mannheim` — rotated per post rather than always the same 2 cities, so link equity
  doesn't concentrate on one page (see `docs/SEO-CITY-STRATEGY.md`'s doorway-page
  guardrail, which this respects the spirit of even though these are blog→city links,
  not city→city).

---

## 9. Translation backlog: ku / fr / es

**Not translated in this pass, by design** — the brief explicitly says to state this
rather than machine-translate content that may still change. Every post ships with only
`de` (required, primary), `tr` (required, confirmed bicultural core market per
`.claude/BRAND-FACTS.md`) and `en` (required, per the brief). `BlogTranslations` in
`types.ts` types `ku`/`fr`/`es` as optional specifically so this backlog can be filled in
later without a breaking change — see the same pattern already used for `LocalizedAnswerText`
in `answers.ts` and `LocalizedProse` in `cities.ts`.

**Why wait:** translating 15 long-form articles into 3 more languages now would mean
translating a moving target — this content hasn't been reviewed by the client yet
(especially the `laermschutz-sperrzeiten-baden-wuerttemberg` post, which touches
regulatory specifics that deserve a native-speaker/local check regardless of language),
and per `docs/SEO-KEYWORD-MAP.md` §4, `ku`/`fr`/`es` aren't even confirmed to have real
search demand for this content type the way `tr` is. Translating now risks redoing the
work twice.

**Suggested order once content is stable and approved:**

1. **`fr`** first, but only for the 2–3 posts most relevant to the Alsace/France border
   audience already served by the `fr` locale elsewhere on the site (per
   `src/i18n/routing.ts`, `fr` exists specifically for "Grenzregion Elsass/Frankreich"):
   `destination-wedding-dj-buchen`, `hochzeits-dj-checkliste`, `was-kostet-ein-hochzeits-dj`.
   These are the posts least dependent on Turkish-specific cultural nuance, so a
   competent French translation (not machine translation) is lower-risk.
2. **`ku`** next, prioritizing the `tuerkische-hochzeit-*` and `davul-zurna-*` cluster —
   Kurdish-speaking families in Baden-Württemberg are explicitly named as a real,
   underserved segment in `HANDOVER.md` §8 ("ein erheblicher Teil der Hochzeiten...
   betrifft kurdischsprachige Familien"), so these specific posts (not the generic
   planning ones) are where a Kurdish translation earns its cost fastest. **Do not**
   translate `laermschutz-sperrzeiten-baden-wuerttemberg` or other DE-legal-specific
   content into `ku` first — start with the culturally-specific posts.
3. **`es`** last — per the keyword map, `es` has the least evidence of real demand of
   any locale on this site; treat it as a long-term, low-priority pass once `fr` and
   `ku` are done and (ideally) once Search Console data exists for the German and
   Turkish posts to confirm this content format actually performs before investing
   further translation budget.

Whoever does this translation pass: follow the same rule already established in
`docs/SEO-KEYWORD-MAP.md` §3 for the TR locale — draft, then have a native speaker
review before publishing. A machine-translated blog post reads worse to both humans and
AI answer engines than simply not having that locale yet.

---

## 10. What the client must supply before any of this goes live

1. **A blog route.** Nothing in `src/content/blog/` is wired into `src/app/**` — that's
   explicitly out of scope for this content pass (see `.claude/CONTRACT.md` file
   ownership) and needs a page-building agent.
2. **Fact-check pass on `laermschutz-sperrzeiten-baden-wuerttemberg`.** The Sperrzeit
   figures cited (regular 3–6am, 5–6am on nights before Sat/Sun, per § 9 GastVO
   Baden-Württemberg) come from a live web search across independent sources in July
   2026, not from Veysel's own legal knowledge — worth a quick confirmation given the
   state's Gaststättenrechts-Reform took effect 1 January 2026 and procedural details may
   keep shifting.
3. **Real material for both recap templates** — see §5's consent checklist. Zero events
   currently qualify; the two templates exist so the first two that do can go from event
   to published post quickly.
4. **Real testimonials** — see §7. Both `testimonials.ts` (live) and
   `testimonials-seed.ts` (demo-only, must never go live) depend on this.
5. **Confirmation that `was-kostet-ein-hochzeits-dj`'s market-range framing is
   acceptable** — it deliberately never states VEYSL's own price (per
   `.claude/BRAND-FACTS.md`), which is correct per the brief, but the client should see
   how the page frames the *absence* of his own pricing before it goes live, since it's a
   visible editorial choice, not just a technical default.
