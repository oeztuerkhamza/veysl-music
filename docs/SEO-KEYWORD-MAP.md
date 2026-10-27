# DJ Veys — Keyword Map (DE / TR / EN)

Maps every existing route (`src/i18n/routing.ts`) to one primary keyword, a secondary
set, search intent, and a ready-to-use title/meta description in German. Character
counts are exact (JS `[...string].length`, so umlauts count as one character each — this
matches how German copy actually measures, not a byte count).

**Measured volumes now exist — see §00 below.** The rest of this map was written
pre-launch without any volume tool; figures labelled **"estimate"** in §1–§5 are a
qualitative read from SERP crowding (see `docs/SEO-COMPETITIVE-ANALYSIS.md`). Where §00
contradicts an estimate, §00 wins. Difficulty is rated Easy/Medium/Hard per the method
in the skill's `keyword-research.md` reference (SERP domain quality + content depth +
review density), not a tool score.

---

## 00. Google Keyword Planner data (Okt 2025 – Sep 2026, DE, German)

Source: Keyword Planner export "Keyword Stats 2026-10-27 at 12_38_37" (seed: wedding-DJ
Stuttgart, 423 keywords). Planner shows bucketed volumes (50 / 500 / 5 000 / 50 000), so
read these as orders of magnitude, not exact counts. Bids are top-of-page, EUR.
**The export contains no Turkish, Kurdish or English keywords** — §3, §4 and §5 remain
unmeasured.

### Clusters → owning URL

| Cluster (variants Planner groups together) | Ø / month | Competition | Bid | Owner | Status |
|---|---|---|---|---|---|
| `dj hochzeit`, `hochzeit dj`, `hochzeits dj` | 5 000 each | Mittel | 1,0–2,6 € | `/` | Nationwide head term. Title already says "Hochzeits-DJ"; description now opens with "DJ für Ihre Hochzeit" to cover the reversed word order. |
| `hochzeits dj kosten`, `kosten dj für hochzeit`, `dj kosten für hochzeit` | 5 000 each | Mittel | 0,6–1,6 € | Ratgeber `was-kostet-ein-hochzeits-dj` | **10× bigger than "preise"** — biggest correction to the old map. Blog metaTitle now front-loads "Hochzeits-DJ Kosten". |
| `hochzeits dj preise`, `dj hochzeit preise`, `dj für hochzeit preise`, `preise dj hochzeit` | 500 each | Mittel | 0,6–1,6 € | `/pakete` | Unchanged ("Hochzeits-DJ Preise & Pakete Stuttgart"). Pakete keeps "Preise", the blog keeps "Kosten" — one head word each, no cannibalization. |
| `hochzeits dj stuttgart`, `dj stuttgart`, `dj aus stuttgart` | 500 each | Mittel | 0,9–3,1 € | `/` | Confirmed as the local primary. `dj hochzeit stuttgart` / `dj stuttgart hochzeit` only 50. |
| `dj buchen hochzeit`, `dj für hochzeit buchen`, `dj buchen für hochzeit` | 500 each | Mittel (66) | 1,0–2,9 € | `/anfrage` | Was untargeted ("Termin prüfen & Angebot anfragen"). Now "Hochzeits-DJ buchen – …"; `/ablauf` drops its claim on "buchen". |
| `dj für hochzeit finden`, `hochzeits dj finden`, `dj finden hochzeit` | 500 each | Hoch | 1,0–2,9 € | `/anfrage`, `/` | Same intent as "buchen"; covered by description copy. |
| `hochzeits dj in der nähe`, `dj umgebung` | 500 / 50 | Hoch | 0,8–2,8 € | Google Business Profile, `/` | "Near me" is won by Maps, not by a title — see `docs/GOOGLE-BUSINESS-PROFILE.md`. Home H2 "für Stuttgart und Umgebung" stays. |
| `party dj` | 500 | Niedrig | 0,9–5,1 € | `/hochzeit-events` | Title now "Party- & Event-DJ Stuttgart". "event dj" itself does not appear in the export. |
| `musik hochzeit`, `musik für (die) hochzeit`, `hochzeit musik`, `musik bei/auf hochzeit` | 500 each | Mittel | 0,7–1,8 € | Ratgeber `musik-fuer-die-hochzeit-lieder` | Was the only cluster with volume and no page. Closed 2026-10-27: song lists per wedding culture (türkisch / kurdisch / deutsch), metaTitle "Hochzeitslieder: …". Also targets `lieder bei hochzeit` (5 000, Niedrig) and `hochzeit party lieder` (500). **Song lists still need Veysel's check against his own sets.** |
| `ablauf hochzeit`, `ablauf einer hochzeit`, `ablauf hochzeitsfeier` | 500 each | Hoch | 0,5–2,4 € | Ratgeber `hochzeits-timeline-musterablauf` | metaTitle now "Ablauf einer Hochzeit mit DJ – Muster-Timeline". |
| `dj esslingen`, `hochzeits dj esslingen` | 50 each | Mittel | 0,5–2,8 € | `/hochzeits-dj/esslingen` | Exists. |
| `dj hochzeit baden württemberg` | 50 | Hoch | 0,8–1,2 € | `/hochzeits-dj-baden-wuerttemberg` | Exists, low volume — keep, don't expand. |
| `karaoke hochzeit`, `dj silberhochzeit`, `dj für familienfeier` | 50 each | — | — | none | Too small for a page; answer in `/fragen` only if Veysel actually offers it (check `.claude/BRAND-FACTS.md` first). |

### Not ours — negative-keyword list for Google Ads

High-volume rows in the export that a wedding DJ should never bid on or write for:
anniversary years (`hochzeiten jahre`, `10 jahren hochzeit`, `70 jahre hochzeit` …),
`hoch zeit` (50 000, a typo cluster), attire (`hochzeitsanzug`, `hochzeitskleider`,
`rock hochzeit`), venues (`location für hochzeit`, `weingut hochzeit`), photo/video
(`hochzeitsfotos stuttgart`, `hochzeitsvideo stuttgart`), cards and texts
(`willkommen zur hochzeit`, `hochzeitssprüche …`, `speisekarten hochzeit`), guest games
(`hochzeitsspiel gäste`), and other DJs' names (`dj andy`, `dj rene`, `dj alex`).

Each row's **meta key** is the exact key from `src/lib/seo.ts` /
`messages/{de,en,tr}.json` `meta.*` namespace — so this table can be pasted straight into
the message files by whichever agent owns them.

---

## 0. One flag before the table: current homepage title is over budget

`messages/de.json` → `meta.home.title` is currently:

> `Hochzeits-DJ {city} — Premium DJ für Hochzeit & Event | DJ Veys`

With `{city}` = "Stuttgart" substituted, that's **64 characters** — over the ~60-char
practical limit, meaning Google will likely truncate it mid-word in the SERP. Not mine to
edit (owned by the orchestrator), but flagged here since it's a quick, free CTR win. See
the `home` row below for a 56-character alternative that keeps the keyword front-loaded.

---

## 1. Core routes (German, default locale)

### `/` — meta key: `home`

- **Primary keyword:** `hochzeits-dj stuttgart`
- **Secondary:** `dj musiker moderator hochzeit`, `deutsch-türkische hochzeit dj`, `türkischer hochzeits-dj stuttgart`, `hochzeits-dj baden-württemberg`, `mehrsprachiger dj hochzeit`, `dj saz gitarre hochzeit`
- **Intent:** Mixed navigational (brand, once established) + local commercial
- **Volume:** estimate only — `hochzeits dj stuttgart` sits in the "dozens of competing sites, no dominant brand" bracket (see competitive analysis §1), consistent with low-hundreds/month at the city level, nationwide "hochzeits dj" terms are higher. **Not measured.**
- **Difficulty:** Medium — no single dominant competitor, but 2 strong directories (eventpeppers.com, hochzeit.click) sit on page 1.
- **H1:** "Hochzeits-DJ, Musiker & Moderator in Stuttgart — für deutsch-türkische und multikulturelle Hochzeiten"
- **Recommended title** (56 chars): `Hochzeits-DJ Stuttgart – DJ, Musiker & Moderator | DJ Veys`
- **Recommended description** (144 chars): `DJ, Musiker (Saz & Gitarre) und Moderator für deutsch-türkische & multikulturelle Hochzeiten in Stuttgart. Live auf Deutsch, Türkisch, Englisch.`

### `/hochzeit-events` — meta key: `services`

- **Primary keyword:** `event-dj stuttgart`
- **Secondary:** `dj firmenfeier stuttgart`, `dj weihnachtsfeier stuttgart`, `dj gala stuttgart`, `live-musik event stuttgart`, `dj mit live-musiker`, `dj und live-band firmenevent`
- **Intent:** Commercial investigation (what exactly is included)
- **Volume:** estimate — lower than the head term; long-tail service queries are typically 10–30% of the head term's volume in this niche. **Not measured.**
- **Difficulty:** Easy-Medium — most competitor "services" pages found were thin (a bullet list), easy to out-depth with genuine specifics (equipment, live line-up, what a corporate run-of-show includes).
- **H1:** "Leistungen für Hochzeit & Events"
- **Title** (50 chars, live since 2026-10-27): `Party- & Event-DJ Stuttgart: Firmenfeier | DJ Veys` — `party dj` is measured at 500/month, `event dj` does not appear in the Planner export at all (§00).
- **Description** (live): `Party- und Event-DJ für Firmenfeier, Gala, Sommerfest und After-Party in Stuttgart – mit Saz, Gitarre oder Live-Orchester, moderiert in drei Sprachen.`
- **Refocus (Oktober 2026):** The previous title `DJ für Hochzeit & Events Stuttgart` sat too close to the homepage's `Hochzeits-DJ Stuttgart` and split the wedding intent across two URLs. The wedding head term now belongs to `/` alone; Kına Gecesi and Nişan moved to `/tuerkischer-dj-stuttgart`, whose title already carries them. This page takes the event, corporate and live-music intent the rest of the site leaves open. The H1 and the four service blocks (wedding included) are unchanged — only the SERP targeting moved. TR/EN follow the same split (`meta.services` in `messages/{tr,en}.json`).

### `/pakete` — meta key: `packages`

- **Primary keyword:** `hochzeits-dj preise stuttgart`
- **Secondary:** `was kostet ein hochzeits-dj`, `dj hochzeit kosten`, `hochzeits-dj pakete baden-württemberg`, `dj angebot hochzeit`
- **Intent:** Transactional / commercial investigation — high buying intent
- **Volume:** estimate — "preis"/"kosten" modifiers are a well-documented high-intent long-tail pattern; exact number not measured.
- **Difficulty:** Easy — very few competitors publish real numbers (lakeloveevents.com is the only one found doing so, from €900/3h). **Price transparency is itself the differentiator here**, more than the keyword targeting — see `docs/SEO-ACTION-PLAN.md`.
- **H1:** "Pakete & Preise für deinen Hochzeits-DJ"
- **Recommended title** (46 chars): `Hochzeits-DJ Preise & Pakete Stuttgart | DJ Veys`
- **Recommended description** (136 chars): `Was kostet ein Hochzeits-DJ in Stuttgart? Drei Pakete mit Umfang, Stunden und Technik im Überblick. Individuelles Angebot in 24 Stunden.`

### `/echte-hochzeiten` — meta key: `weddings`

- **Primary keyword:** `hochzeits-dj referenzen stuttgart`
- **Secondary:** `echte hochzeiten dj stuttgart`, `deutsch-türkische hochzeit beispiele`, `hochzeits-dj erfahrungen`, `hochzeitslocation partner stuttgart`
- **Intent:** Commercial investigation / trust-building (pre-purchase reassurance)
- **Volume:** estimate — lower-volume, high-conversion-value page; visitors here are usually already comparing 2–3 DJs.
- **Difficulty:** Easy — this page's ranking power will come from genuine testimonials and real venue photography, which is a content/trust problem, not a keyword problem. **Do not publish this page with fabricated names or quotes** — every reference must be real per `.claude/BRAND-FACTS.md`.
- **H1:** "Echte Hochzeiten, echte Tanzflächen"
- **Recommended title** (50 chars): `Echte Hochzeiten – Referenzen | DJ Veys Hochzeits-DJ`
- **Recommended description** (140 chars): `Echte deutsch-türkische und multikulturelle Hochzeiten aus Stuttgart und Baden-Württemberg: Stimmen von Paaren, Clips und Partner-Locations.`

### `/musik` — meta key: `music`

- **Primary keyword:** `hochzeitsmusik dj stuttgart`
- **Secondary:** `dj sets hochzeit anhören`, `türkische hochzeitsmusik dj`, `playlist hochzeit dj`, `live-musik saz gitarre hochzeit`
- **Intent:** Informational leaning commercial (auditioning the DJ's taste before booking)
- **Volume:** estimate — informational/audition-stage query, moderate volume, high time-on-page value.
- **Difficulty:** Easy — almost no competitor site found publishes embedded audio sets; this is a content-depth opportunity, not a keyword fight.
- **H1:** "Musik & Sets für deine Hochzeit"
- **Recommended title** (42 chars): `Hochzeitsmusik & DJ-Sets Stuttgart | DJ Veys`
- **Recommended description** (135 chars): `Hochzeits-Sets zum Reinhören: Sektempfang, Dinner, Peaktime. Deutsch, türkisch und international – plus Live-Musik auf Saz und Gitarre.`

### `/ablauf` — meta key: `process`

- **Primary keyword:** `hochzeits-dj ablauf buchung`
- **Secondary:** `hochzeits-dj buchen wie`, `häufige fragen hochzeits-dj`, `dj hochzeit ablauf beratung`
- **Intent:** Informational (removes booking friction, good FAQ-schema candidate)
- **Volume:** estimate — low standalone volume, but strong FAQ-rich-result candidate (`FAQPage` schema) which can win SERP real estate regardless of raw volume.
- **Difficulty:** Easy
- **H1:** "So läuft die Buchung ab"
- **Recommended title:** keep the live `Ablauf & häufige Fragen — Hochzeits-DJ | DJ Veys`. The older suggestion `Hochzeits-DJ buchen: Ablauf & FAQ` is withdrawn — "buchen" belongs to `/anfrage` since §00.
- **Recommended description** (126 chars): `Vom ersten Gespräch bis zum letzten Song: der Ablauf in vier Schritten und Antworten auf die häufigsten Fragen zur DJ-Buchung.`

### `/anfrage` — meta key: `booking`

- **Primary keyword:** `dj buchen hochzeit` (measured 500/month, plus three 500/month variants — see §00)
- **Secondary:** `dj für hochzeit finden`, `hochzeits-dj verfügbarkeit prüfen`, `hochzeits-dj angebot einholen`
- **Intent:** Transactional (the conversion page — still lean, but the "buchen" cluster is real volume with exactly this intent, so the title now carries it)
- **Difficulty:** Medium (competition index 66)
- **H1:** "Ist Ihr Datum noch frei?" (eyebrow: "Hochzeits-DJ buchen")
- **Title** (55 chars, live since 2026-10-27): `Hochzeits-DJ buchen – Termin prüfen & Angebot | DJ Veys`
- **Description** (134 chars, live): `DJ für die Hochzeit buchen: Datum eingeben, Verfügbarkeit prüfen, unverbindliches Angebot erhalten — Antwort innerhalb von 24 Stunden.`

### `/galerie` — meta key: `gallery`

- **Primary keyword:** `hochzeits-dj fotos videos stuttgart`
- **Secondary:** `dj hochzeit aftermovie`, `hochzeits-dj bilder stuttgart`
- **Intent:** Informational/trust — also an image-search opportunity (Google Images traffic is real for wedding-vendor galleries)
- **Volume:** estimate — meaningful Image-search volume; not measured on text search.
- **Difficulty:** Easy — filename + alt-text discipline is the whole game here (see `docs/SEO-ACTION-PLAN.md`).
- **H1:** "Galerie: Fotos & Videos"
- **Recommended title** (44 chars): `Galerie: Fotos & Videos Hochzeits-DJ | DJ Veys`
- **Recommended description** (107 chars): `Fotos, Aftermovies und Reels von Hochzeiten und Events mit DJ Veys – DJ, Live-Musik und Moderation in Aktion.`

### `/epk` — meta key: `epk`

- **Primary keyword:** `veysel durmuş dj biografie` (low-volume, brand-specific)
- **Secondary:** `hochzeits-dj booking presskit`, `dj rider hochzeit`, `booking anfrage veranstalter dj`
- **Intent:** Navigational/B2B — this page is for **venues, planners and press**, not couples. Optimize for people who already know the name, and for `site:` discoverability by venue partners doing due diligence, not for cold search volume.
- **Volume:** not applicable — B2B utility page.
- **Difficulty:** n/a
- **H1:** "EPK — Biografie, Presskit & Partner"
- **Recommended title** (38 chars): `EPK & Presskit – Veysel Durmuş | DJ Veys`
- **Recommended description** (97 chars): `Biografie, Pressefotos, Technical Rider und Partner-Locations für Planer und Venues zum Download.`

### `/kontakt` — meta key: `contact`

- **Primary keyword:** `hochzeits-dj stuttgart kontakt`
- **Secondary:** `dj whatsapp stuttgart`, `hochzeits-dj telefonnummer`
- **Intent:** Navigational/transactional
- **Volume:** low, mostly branded — not measured.
- **Difficulty:** n/a
- **H1:** "Kontakt"
- **Recommended title** (40 chars): `Kontakt – Hochzeits-DJ Stuttgart | DJ Veys`
- **Recommended description** (108 chars): `Hochzeits-DJ in Stuttgart direkt erreichen: WhatsApp, Telefon oder E-Mail. Antwort innerhalb von 24 Stunden.`

### `/impressum`, `/datenschutz` — meta keys: `imprint`, `privacy`

Legal pages — keep the existing minimal titles (`Impressum | DJ Veys`, `Datenschutz |
DJ Veys`), no keyword targeting needed. Do not `noindex` these; German legal pages are
routinely indexed and that's fine, but they're not a ranking priority.

---

## 2. Programmatic city pages — `/hochzeits-dj/[stadt]`

**meta key: `cityLanding`. This key does not exist yet in `messages/{de,en,tr}.json`** —
confirmed by grep. `src/lib/seo.ts` already has a comment flagging this: `cityLanding`
needs a `{city}` placeholder in title/description before the dynamic route can call
`buildMetadata()`. This is a blocking dependency for the whole city-page initiative —
see `docs/SEO-ACTION-PLAN.md` (a).

- **Primary keyword pattern:** `hochzeits-dj {stadt}`
- **Secondary pattern:** `dj hochzeit {stadt}`, `türkischer dj {stadt}`, `deutsch-türkische hochzeit dj {stadt}`, `hochzeits-dj {stadt} preise`, `hochzeitslocation {stadt} dj`
- **Intent:** Local commercial/transactional
- **H1 pattern:** "Hochzeits-DJ in {Stadt}"
- **Recommended title template** (28 chars + city name, keep total ≤60): `Hochzeits-DJ {Stadt} | DJ Veys`
- **Recommended description template** (149 chars with a short city name; re-check per city): `DJ für deutsch-türkische, türkische und multikulturelle Hochzeiten in {Stadt}. Live-Moderation auf Deutsch, Türkisch & Englisch. Termin jetzt prüfen.`

  For cities with longer names (e.g. "Schwäbisch Gmünd"), swap in a shorter description
  variant, e.g.: `Hochzeits-DJ für {Stadt} und Umgebung — deutsch-türkisch & multikulturell, live auf 3 Sprachen. Jetzt Termin sichern.` (verify length per city before shipping).

**Per-city keyword volume is not estimated here at all** — with 24+ candidate cities and
no keyword tool, presenting per-city numbers would violate the "never fabricate a
number" rule. `docs/SEO-CITY-STRATEGY.md` ranks cities by population, distance and
observed competition density instead, which is a defensible proxy without inventing
search volume.

**Doorway-page warning:** every city page must clear the uniqueness bar defined in
`docs/SEO-CITY-STRATEGY.md` §"minimum unique content" before it ships. A city page that
only swaps `{Stadt}` in a template sentence is exactly the pattern Google's spam policy
targets, and exactly the pattern most competitors in `docs/SEO-COMPETITIVE-ANALYSIS.md`
§2 already use badly (one long list-of-cities paragraph) — don't copy that mistake.

---

## 3. Turkish-language keywords (TR locale)

The client's own positioning statement — *"DJ, Musiker und Moderator für
deutsch-türkische, türkische und multikulturelle Hochzeiten"* — makes this the highest
differentiation-per-effort locale, not an afterthought. Per
`docs/SEO-COMPETITIVE-ANALYSIS.md` §2, no competitor found runs a genuine full TR site.

| Keyword | Notes | Maps to |
|---|---|---|
| `düğün dj stuttgart` | Direct TR equivalent of the head term; searched by Turkish-German couples who think in Turkish first | `/` (TR: home) |
| `türk düğün dj almanya` | Broader "Turkish wedding DJ Germany" — nationwide framing, lower local intent but high topical relevance | `/` intro copy, `reach.tr` messaging |
| `almanya düğün dj` | Variant word order of the above — Turkish search behavior often reorders noun phrases; include both, don't force one "correct" order | `/` |
| `stuttgart türk dj` | Reordered variant of `türkischer dj stuttgart` | `/hochzeits-dj/stuttgart` (TR slug) if a Stuttgart-specific city page is built, else `/` |
| `kına gecesi dj stuttgart` | Henna-night event, a distinct booking type from the wedding itself — real secondary revenue line | `/tuerkischer-dj-stuttgart` (TR: `/turk-dj-stuttgart`) — moved from `/hochzeit-events` in Oct 2026, see §1 |
| `nişan dj stuttgart` | Engagement-party DJ — same logic as Kına | `/tuerkischer-dj-stuttgart` |
| `etkinlik dj stuttgart` | TR equivalent of `event-dj stuttgart` — corporate and private events, not the wedding itself | `/hochzeit-events` (TR: `/dugun-etkinlik`) |
| `davul zurna dj stuttgart` | Traditional drum/horn act — DJ Veys doesn't necessarily perform this himself (verify with client before targeting), but the query proves demand for traditional-instrument acts alongside a modern DJ. If DJ Veys can credibly offer or partner for this, it's a nearly uncontested Stuttgart-specific query (see competitive analysis — only a nationwide network found, no Stuttgart-specific dedicated page) | `/musik` or a future dedicated section — **needs client confirmation of capability before publishing a claim** |
| `deutsch-türkische hochzeit dj stuttgart` | The exact bicultural-couple framing from the client's own copy | `/` and city pages |

**TR title/description example (`home`, TR):**

- Title (52 chars): `Düğün DJ'i Stuttgart – DJ, Müzisyen & Sunucu | DJ Veys`
- Description (125 chars): `Stuttgart'ta Türk-Alman ve çok kültürlü düğünler için DJ, müzisyen (saz & gitar) ve sunucu. Almanca, Türkçe, İngilizce sunum.`

Have a native Turkish speaker review all TR copy before publishing — per the skill's
multilingual guidance, machine-drafted copy is a starting point, not a final step, and
Turkish word order/idiom for "wedding DJ" services genuinely varies by region of Turkey
the couple's family is from.

---

## 4. English keywords (destination weddings, expat/international couples)

Per `docs/SEO-COMPETITIVE-ANALYSIS.md` §5, **zero English-specific wedding-DJ
competitors surfaced** in Stuttgart searches — this is the lowest-competition, lowest-effort
locale, but also the one with the least evidence of real demand (no volume data
available at all, not even a directional read from SERP crowding, since there was no
crowd to read).

| Keyword | Notes | Maps to |
|---|---|---|
| `wedding dj stuttgart germany` | Head term for the EN locale | `/` (EN: home) |
| `wedding dj baden-württemberg` | Regional variant | `/` |
| `german turkish wedding dj` | Matches the bicultural positioning for English-speaking family members of a Turkish-German couple | `/tuerkischer-dj-stuttgart` — moved from `/hochzeit-events` in Oct 2026, see §1 |
| `event dj stuttgart` | Corporate / expat events (company parties, galas) — the EN side of the `/hochzeit-events` refocus | `/hochzeit-events` (EN: `/weddings-events`) |
| `multilingual wedding dj germany` | Corporate-expat angle (Stuttgart hosts Mercedes-Benz, Porsche, Bosch HQs — a plausible but unverified source of English-speaking demand) | `/` |
| `destination wedding dj germany` | Lower-intent, aspirational — only worth targeting once EN content exists in depth; don't lead with it | `/musik`, `/echte-hochzeiten` |

**EN title/description example (`home`, EN):**

- Title (50 chars): `Wedding DJ Stuttgart – DJ, Musician & Host | DJ Veys`
- Description (143 chars): `Wedding DJ, live musician (saz & guitar) and host for German-Turkish & multicultural weddings in Stuttgart. Hosted in German, Turkish, English.`

**Honest framing for the client:** build EN because it's nearly free (no competitor to
beat) and it matches a real capability (English hosting is already a verified fact in
`.claude/BRAND-FACTS.md`), not because there's confirmed search demand. Treat it as a
long-term compounding asset, not a near-term lead-flow channel — re-visit priority once
GSC data exists for the EN pages (28+ days post-launch, per the GSC-analysis reference).

---

## 5. Religiös geprägte Hochzeiten — the cluster with no landing page yet

> **⚠️ Reopened 2026-08-27 — the 2026-08-05 restriction is lifted.**
>
> Timeline of this section, so nobody re-litigates it from half the story:
>
> 1. **2026-08-05:** the client limited the religiously framed layer to
>    Turkish, Kurdish and Arabic — explicitly not German, English, Dutch,
>    French or Spanish. The German keyword rows below stopped being targets.
> 2. **2026-08-27:** the client reopened it for **all eight languages**.
>    `ISLAMIC_SUPPORTED_LOCALES` in `src/content/islamic.ts` is still the
>    single switch (landing page, nav entry, `islamisch` answer category,
>    Ratgeber article) and now contains every locale.
>
> What that means for this section **today**: the whole table below is live
> again, German rows included — `islamische hochzeit dj`, `hochzeit mit dua`,
> `koranrezitation hochzeit`, `dj für alkoholfreie hochzeit` and the English
> `muslim wedding dj germany`, alongside the Turkish, Kurdish and Arabic rows.
>
> The reopening cost no new copy. The 2026-08-05 pass deliberately kept every
> body it withheld: the `islamic` namespace was recoverable verbatim from git
> (`f7c398b^`, schema unchanged and tr/ku/ar untouched since), the answer
> corpus carried all eight languages throughout, and the Ratgeber article's
> German, English, Dutch, French and Spanish bodies never left the file.
>
> Items 1–3 under "Not shipped" have long since **shipped** (landing page, blog
> post, nav placement). Item 4 was answered on 2026-07-31: Veysel recites the
> Tilawet himself.

Added 2026-07-30, after the client confirmed that Kur'an-Rezitation, Dua, İlahi (live),
Türk Sanat Müziği and an optional After-Wedding-Party are part of what he already
delivers (`.claude/BRAND-FACTS.md` → "Religiös geprägte Hochzeiten"). Until that day the
words "Dua", "İlahi", "Tilawet" and "islamisch" appeared **nowhere** in this repository —
so this section documents a gap that has only been half closed, not a shipped page.

**Why this cluster is different from every row above it.** Everywhere else in this map,
DJ Veys competes with established DJs for a crowded term. Here the German-language SERP
splits into two camps that do not overlap: religious-service providers (hoca, İlahi
groups, nasheed ensembles) and party DJs. Almost nobody is positioned as *both*, and the
couple who wants a Dua at 19:00 and a full dance floor at 22:00 has to reconcile that
themselves. The offer already reconciles it — one running order, one PA, one host — which
is why this is the strongest *content-market fit* in the whole map even though the raw
volume is certainly lower than `hochzeits-dj stuttgart`.

Same caveat as everywhere else in this document: **no volume tool was used.** The
difficulty ratings below read the SERP, not a database.

| Keyword | Intent | Difficulty | Currently served by |
|---|---|---|---|
| `islamische hochzeit dj` | Commercial investigation — "is this even allowed/possible" | Easy — SERP is religious content, not DJ services | `/fragen` only |
| `muslim wedding dj germany` (EN) | Commercial, expat/international | Easy | `/fragen` only |
| `hochzeit mit dua` | Informational, high emotional intent | Easy | `/fragen` only |
| `hochzeit mit ilahi` / `ilahili düğün` (TR) | Commercial — looking for a live performer | Easy | `/fragen` only |
| `koranrezitation hochzeit` / `kuran tilaveti düğün` (TR) | Informational, feeds the combination question | Easy | `/fragen` only |
| `dj für alkoholfreie hochzeit` | Commercial, high qualification value | Easy | `/fragen` only |
| `türk sanat müziği canlı düğün` (TR) | Commercial — live-music angle | Medium | `/fragen`, `/musik` |
| `after wedding party dj` | Commercial, add-on/upsell | Medium | `/fragen` |

### What exists today vs. what this cluster still needs

**Shipped:** eight entries in `src/content/answers.ts` (category `islamisch` plus
`tsm-live`, `after-wedding-party`, `recitation-sound`), DE/EN/TR, live on `/fragen` and
`/api/faq`, inside the existing `FAQPage` schema. That makes the cluster *citable* by
answer engines immediately — which is precisely the GEO mechanic in
`docs/GEO-STRATEGY.md` §2.

**Not shipped, in descending order of expected return:**

1. **A dedicated route** (`/islamische-hochzeit`, TR `/islami-dugun`). Eight Q&As on a
   shared hub rank far weaker for a head term than one page whose H1, title, URL and
   internal links all say the same thing. This is a real build — `src/i18n/routing.ts`,
   `src/lib/seo.ts` `MetaKey`, `sitemap.ts`, a page component and `meta.*` copy in seven
   message files — not a content edit, which is why it is listed rather than done.
2. **A blog post** in the existing `/ratgeber` cluster: "Islamische Hochzeit mit DJ
   planen — Ablauf, Dua, İlahi und moderne Feier in einem Abend". The blog architecture
   (`src/content/blog/`) already supports DE/TR/EN bodies and internal linking, so this is
   additive rather than structural.
3. **`services.items`** in `messages/*.json` currently lists four services (`wedding`,
   `engagement`, `afterparty`, `corporate`). A fifth entry for the religious offer would
   surface it on `/hochzeit-events`, where commercial intent is highest — today the offer
   is answerable on `/fragen` but invisible on the actual services page.
4. **One open question for the client, blocking the strongest copy:** who performs the
   Kur'an recitation — Veysel, a hoca, or the family? The current answers are written to
   be true either way and therefore stay slightly general. A confirmed answer allows a
   direct, first-person claim, which is what actually converts on this topic.
