# DJ Veys — GEO (Generative Engine Optimization) Strategy

**Scope:** this document covers only what the GEO agent built — `src/content/answers.ts`,
`src/app/[locale]/fragen/**`, `src/components/geo/**` and `src/app/api/faq/route.ts`. It
assumes `docs/SEO-COMPETITIVE-ANALYSIS.md`, `docs/SEO-KEYWORD-MAP.md` and
`docs/SEO-ACTION-PLAN.md` (owned by the SEO agent) as background — read those for the
classic-SEO/technical layer this sits on top of. This doc is honest, in the same spirit
as `SEO-ACTION-PLAN.md`'s opening: code can make DJ Veys *quotable*; it cannot manufacture
the off-page signals that ultimately decide whether an answer engine trusts what it finds.

---

## 1. The goal, restated precisely

Not "rank on page 1". The goal is: when someone asks ChatGPT, Perplexity, Gemini, Copilot
or a Google AI Overview *"who is the best wedding DJ in Stuttgart"* / *"Stuttgart'ta en
iyi düğün DJ'i"* / *"türkischer Hochzeits-DJ Stuttgart"*, **dj-veys.de is one of the 2–7
sources the answer cites** — ideally with a direct quote or paraphrase from `/fragen`.

That is a different optimization target than classic SEO:

- Classic SEO optimizes for a ranked list a human scans and clicks through.
- GEO optimizes for a *passage* a model can lift, attribute, and trust enough to
  reproduce without the user ever visiting the page.

## 2. The mechanics this build targets

1. **Answer engines cite few sources (2–7), not ten blue links.** Being "found" is
   necessary but not sufficient — the content has to be *the* passage worth quoting, not
   one of many similar ones.
2. **Heading-then-answer adjacency is the single highest-leverage structural detail.**
   A real `<h2>`/`<h3>` question, immediately followed by a self-contained answer
   paragraph, extracts cleanly. Anything that requires a click (accordion, "read more",
   tab) to reveal the answer is either skipped entirely by a crawler that doesn't execute
   that interaction, or scored lower because the model can't verify the answer sits next
   to the question without inferring it. This is why `AnswerBlock` uses a plain
   `<article>`/`<h3>`/`<p>` — no `<details>`, no JS-gated reveal — unlike the existing
   `<details>`-based `FaqAccordion` on `/ablauf` (which is at least server-rendered, but
   visually closed by default; `/fragen` goes one step further and never closes anything).
3. **Specific, attributable numbers beat adjectives.** "12+ Jahre Erfahrung, über 200
   begleitete Hochzeiten, Moderation auf Deutsch, Türkisch und Englisch" is citable
   verbatim. "Ihr Traum-DJ für unvergessliche Momente" is not — a model has nothing to
   extract from it. Every `facts` array in `answers.ts` exists for this reason, and every
   number in it traces back to `.claude/BRAND-FACTS.md` / `src/content/site.ts`.
4. **Freshness is a citation signal.** `Answer.updated` (ISO date) is surfaced visibly on
   `/fragen` as "Zuletzt aktualisiert" and is the basis for `latestAnswerUpdate()`. This
   is not decorative — several public write-ups on AI-answer-engine behavior report a
   recency bias in what gets surfaced, on top of whatever recency signal the crawler
   itself infers from `lastmod`/HTTP headers.
5. **Clear entity definition compounds everything else.** A model can only attribute a
   fact to "DJ Veys" correctly if it can resolve, in one unambiguous sentence, who/what/
   where/which-languages. `EntityCard` exists specifically to be that sentence, repeated
   verbatim wherever it's needed (currently `/fragen`; any other page can render it too).

## 3. What was built

| Piece | Role |
|---|---|
| `src/content/answers.ts` | 40 Q&A entries, 8 categories (`buchung`, `preis`, `ablauf`, `musik`, `technik`, `tuerkisch`, `location`, `recht`). DE + EN + TR on every entry (see §5 on why EN, not just DE/TR). `facts`/`related`/`links`/`updated` per entry. |
| `src/app/[locale]/fragen/page.tsx` | The answer hub. Server-rendered, no client JS required to read a single answer. Entity paragraph + key facts near the top, category jump-nav, then every answer as heading+paragraph, grouped by category. `FAQPage` + `BreadcrumbList` + `WebSite`/`LocalBusiness` JSON-LD. |
| `src/components/geo/entity-card.tsx` | The one-paragraph who/what/where/languages block (mechanic #5). Reusable on any page. |
| `src/components/geo/key-facts.tsx` | Years / events / languages / service area / capabilities as a plain `<dl>` list (mechanic #3). |
| `src/components/geo/answer-block.tsx` | Heading-then-paragraph primitive (mechanic #2). Used only by `/fragen` today, but generic enough for e.g. a future in-page FAQ block elsewhere. |
| `src/app/api/faq/route.ts` | `GET /api/faq[?locale=][&category=]` — the same corpus as clean, cached JSON. Lets an answer-engine crawler (or anything else) fetch structured Q&A directly instead of parsing HTML. |

### Why 40 questions, not 10 more of the same

`messages/*.json` → `process.faq` already answers ten short, general questions (lead
time, price factors, song requests, ceremony sound, "do you play Turkish weddings",
equipment failure, setup/teardown timing, insurance, destination weddings, payment). This
corpus deliberately does **not** repeat those — it goes to the specific, high-intent
questions a real bicultural couple or planner actually types: illness contingencies,
Instagram-DM vs. the form, weekday/off-season pricing, whether live music costs extra,
first-dance mechanics, davul-zurna coordination, kına gecesi vs. the wedding itself,
bilingual hosting, Kurdish/Arabic repertoire, Vienna/international dates, cancellation
terms, and what happens to enquiry-form data. `/fragen` links back to `/ablauf`'s FAQ
section (and vice versa should — see §6) so the two corpora read as one coherent whole
rather than a competing, half-duplicated FAQ.

### Why DE + EN + TR on every entry, not just DE + TR

The brief's own three example queries are in German, Turkish, **and English**. German is
non-negotiable (primary market, must be excellent) and Turkish is the confirmed core
market — but an English-language AI Overview or ChatGPT answer for "wedding DJ Stuttgart"
is exactly the scenario in the brief's opening line, so English got full coverage too,
not just the minimum. `ku`/`fr`/`es` were left out of the corpus by design: the type
(`LocalizedAnswerText`) only requires `de`/`tr` and allows every other locale to be
absent — a machine-translated filler answer in Kurdish/French/Spanish would read worse to
both a human and a model than falling back to the (excellent) German original, which is
exactly what `resolveAnswerText()` does for those three locales today.

## 4. Target queries this content is built for

A representative sample (not exhaustive — the corpus itself is the real target list):

- **DE:** "türkischer Hochzeits-DJ Stuttgart", "was kostet ein Hochzeits-DJ in Stuttgart",
  "DJ für deutsch-türkische Hochzeit", "Hochzeits-DJ mit Live-Musik Stuttgart", "DJ für
  Kına Gecesi Stuttgart", "davul zurna DJ Stuttgart".
- **EN:** "who is the best wedding DJ in Stuttgart", "wedding DJ for German-Turkish
  wedding", "wedding DJ with live band Stuttgart".
- **TR:** "Stuttgart'ta en iyi düğün DJ'i", "Alman-Türk düğün DJ'i", "kına gecesi DJ
  Stuttgart", "düğün DJ'i canlı müzik".

## 5. Dependencies on other agents — report

These are requests, not edits made outside this agent's ownership block:

1. **`src/i18n/routing.ts`** — needs a `'/fragen'` entry (see the final report for the
   exact object). Until it exists, `metadata.ts` in this route hand-rolls canonical/
   hreflang URLs from a locally duplicated slug map — delete that map and switch to
   `absoluteUrl('/fragen', locale)` the moment the entry lands.
2. **`src/lib/seo.ts` (SEO agent)** — `/fragen` is not in `MetaKey`/`metaKeyByPathname`,
   so this page does not go through `buildMetadata()`; it has its own equivalent in
   `src/app/[locale]/fragen/metadata.ts`. Optional but recommended: once the routing
   entry exists, add `/fragen` to that map too and this page can be simplified to a thin
   wrapper, same as every other page.
3. **`src/app/sitemap.ts` (SEO agent)** — `/fragen` is not in `staticRoutes`, so it will
   not appear in `sitemap.xml` until added. Recommend high priority (0.85–0.9) and
   `weekly` change frequency given the freshness signal in §2.
4. **`public/llms.txt` (SEO agent)** — should link to `/fragen` (the human-readable hub)
   and `/api/faq` (the machine-readable feed) explicitly, since `llms.txt` is precisely
   the convention answer-engine crawlers are starting to check for "where's your
   structured content".
5. **`messages/tr.json` / `ku.json` / `fr.json` / `es.json`** — this agent added the new
   `answers.*` UI-chrome namespace only to `de.json`/`en.json`, per the brief's explicit
   instruction. `tr.json` is owned by the i18n agent per `CONTRACT.md`; `ku.json`/
   `fr.json`/`es.json` have **no listed owner** in `CONTRACT.md` at all. All four need the
   same ~20 `answers.*` keys backfilled (see the final report for the exact list) —
   until then, visiting `/fragen` in those four locales will show next-intl's missing-
   message fallback for the page chrome (the Q&A content itself still renders correctly,
   in German, via `resolveAnswerText()`'s fallback).
6. **`src/content/site.ts` / `services.capabilitiesStrip` (whoever owns `services.*`
   messages)** — `site.capabilities` includes `'orchestra'`, but
   `services.capabilitiesStrip.items` in `messages/*.json` (and the icon map in
   `src/components/pages/capability-strip.tsx`) only cover five of the six capability
   ids and are missing `orchestra`. `KeyFacts` in this build defines its own
   `answers.capabilities.*` labels specifically to avoid depending on that gap — but the
   gap itself is real and worth fixing at the source.

## 6. What GEO cannot do on its own

Being blunt, in the same register as `SEO-ACTION-PLAN.md`:

- **It cannot manufacture reviews.** `site.reviews.isPublishable` is `false` because the
  Google review count isn't confirmed — this corpus never states a review count or
  fabricates one (see the "trust-proof" answer, which cites years/events/Instagram
  followers instead, all of which are genuinely verified). If the client's real review
  count turns out to be materially lower than `tuerkischerdj.com`'s apparent "30+
  Bewertungen (96% 5★)" (`docs/SEO-COMPETITIVE-ANALYSIS.md` §2), that gap stays a gap —
  no amount of on-page content closes it.
- **It cannot manufacture tenure or backlinks.** DJ Serkan's ~20+ year claim and
  `hochzeit.click`'s multi-year domain history are real off-page signals. DJ Veys's 12+
  years and 200+ events are genuinely strong and now clearly stated — but they don't
  erase a competitor's longer track record in whatever training data or web index an
  answer engine draws on.
- **It cannot get DJ Veys mentioned on third-party sites.** The single highest-leverage
  thing outside this codebase is **other sites talking about DJ Veys** — venue pages,
  wedding-planner "our vendors" pages, guest blog posts, press. Answer engines weight
  corroborating mentions across independent domains far more than anything on the site's
  own domain, no matter how well structured. This is a client/outreach task, not a code
  task, and it is not started.
- **It cannot fix an unclear brand.** This is why the entity-definition work in
  `EntityCard`/`answers.entity` matters as much as it does, and also why it deliberately
  states only `site.name` ("DJ Veys") — per the client's explicit correction, there is one
  brand here, and asserting a second identity ("also known as…") would have made this
  *worse* for entity resolution, not better, by giving a crawler two names to reconcile
  with no external corroboration for either.
- **It depends on crawler access.** All of this only works if the relevant crawlers
  (GPTBot, PerplexityBot, Google-Extended, ClaudeBot, etc.) are actually allowed to fetch
  the site — that's `robots.ts`, owned by the SEO agent, not this file. Coordinate before
  assuming this content is even reachable.

## 7. How to measure this over time

There is no dashboard for "did an AI cite us" — it has to be checked directly:

1. **Manual query log.** Once a month, run the queries in §4 (and a few new ones as they
   come up) against ChatGPT, Perplexity, Gemini, Copilot and Google AI Overviews (signed
   out and in a few locales/regions if possible), and log: was DJ Veys mentioned, was it
   cited/linked, was the exact wording traceable to a specific answer in `answers.ts`.
   This is manual and imperfect, but it's the only ground truth available without paid
   tooling.
2. **Referral traffic from answer engines.** `chatgpt.com`, `perplexity.ai`,
   `gemini.google.com`, `copilot.microsoft.com` and `www.bing.com/chat` all show up as
   distinguishable referrers if any analytics is in place. **Caveat:** per
   `messages/de.json` → `legal.privacy` → `analytics`, this site currently runs **no**
   analytics or tracking tool at all ("Aktuell setzen wir kein Analyse- oder
   Tracking-Werkzeug ein"). Referral-source measurement is not possible until that
   changes, and any tool added later needs its own privacy-policy update first (that
   section already anticipates this and is written to make the addition straightforward).
   Until then, `/api/faq`'s own request logs (if the hosting platform captures them) are
   the only proxy for "is anything besides a human fetching this".
3. **Google Search Console** (once verified — coordinate with the SEO agent) surfaces
   impressions/clicks for `/fragen` and can show whether Google's own AI Overviews start
   surfacing it, via the "AI Overviews" filter where available in that market.
4. **IndexNow / crawl confirmation.** Confirm `/fragen` and `/api/faq` actually get
   fetched by checking server logs for the relevant bot user agents, independent of
   whether they're ever cited — a page that's never fetched can't be cited regardless of
   quality.

## 8. Maintenance

- Update `Answer.updated` whenever an entry's text materially changes — not on every
  cosmetic edit, but genuinely whenever the answer changes.
- Add new entries as real questions come in through `/anfrage`, WhatsApp or Instagram DMs
  — this corpus should grow from actual customer questions over time, not just from this
  initial build.
- If `site.stats.eventsCompleted`, `site.reviews`, or any other referenced fact in
  `site.ts` changes, the corresponding `facts` arrays in `answers.ts` need a pass — they
  are hand-copied, not computed, so they can drift silently if not checked.
- If the client ever changes the client's Google review count / place ID such that
  `site.reviews.isPublishable` becomes `true`, revisit whether any answer should
  reference it (currently none do, deliberately).
