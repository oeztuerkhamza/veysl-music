# VEYSL — Keyword Map (DE / TR / EN)

Maps every existing route (`src/i18n/routing.ts`) to one primary keyword, a secondary
set, search intent, and a ready-to-use title/meta description in German. Character
counts are exact (JS `[...string].length`, so umlauts count as one character each — this
matches how German copy actually measures, not a byte count).

**No search-volume tool was used for this map** (no Ahrefs/Semrush/GSC access to this
domain — it's pre-launch). Every volume figure below is explicitly labelled
**"estimate"** and is a qualitative read from SERP crowding (see
`docs/SEO-COMPETITIVE-ANALYSIS.md`), never a measured number. Difficulty is rated
Easy/Medium/Hard per the method in the skill's `keyword-research.md` reference (SERP
domain quality + content depth + review density), not a tool score.

Each row's **meta key** is the exact key from `src/lib/seo.ts` /
`messages/{de,en,tr}.json` `meta.*` namespace — so this table can be pasted straight into
the message files by whichever agent owns them.

---

## 0. One flag before the table: current homepage title is over budget

`messages/de.json` → `meta.home.title` is currently:

> `Hochzeits-DJ {city} — Premium DJ für Hochzeit & Event | VEYSL`

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
- **Recommended title** (56 chars): `Hochzeits-DJ Stuttgart – DJ, Musiker & Moderator | VEYSL`
- **Recommended description** (144 chars): `DJ, Musiker (Saz & Gitarre) und Moderator für deutsch-türkische & multikulturelle Hochzeiten in Stuttgart. Live auf Deutsch, Türkisch, Englisch.`

### `/hochzeit-events` — meta key: `services`

- **Primary keyword:** `dj für hochzeit und events stuttgart`
- **Secondary:** `dj verlobung stuttgart`, `dj kına gecesi stuttgart`, `dj firmenfeier stuttgart`, `hochzeits-dj leistungen`, `ton- und lichttechnik mieten hochzeit`, `dj moderation hochzeit`
- **Intent:** Commercial investigation (what exactly is included)
- **Volume:** estimate — lower than the head term; long-tail service queries are typically 10–30% of the head term's volume in this niche. **Not measured.**
- **Difficulty:** Easy-Medium — most competitor "services" pages found were thin (a bullet list), easy to out-depth with genuine specifics (equipment brands, what a Kına-night set actually includes).
- **H1:** "Leistungen für Hochzeit & Events"
- **Recommended title** (42 chars): `DJ für Hochzeit & Events Stuttgart | VEYSL`
- **Recommended description** (138 chars): `DJ für Hochzeit, Verlobung, Kına Gecesi, After-Party und Firmenevent in Stuttgart. Leistungen, Technik und Moderation transparent erklärt.`

### `/pakete` — meta key: `packages`

- **Primary keyword:** `hochzeits-dj preise stuttgart`
- **Secondary:** `was kostet ein hochzeits-dj`, `dj hochzeit kosten`, `hochzeits-dj pakete baden-württemberg`, `dj angebot hochzeit`
- **Intent:** Transactional / commercial investigation — high buying intent
- **Volume:** estimate — "preis"/"kosten" modifiers are a well-documented high-intent long-tail pattern; exact number not measured.
- **Difficulty:** Easy — very few competitors publish real numbers (lakeloveevents.com is the only one found doing so, from €900/3h). **Price transparency is itself the differentiator here**, more than the keyword targeting — see `docs/SEO-ACTION-PLAN.md`.
- **H1:** "Pakete & Preise für deinen Hochzeits-DJ"
- **Recommended title** (46 chars): `Hochzeits-DJ Preise & Pakete Stuttgart | VEYSL`
- **Recommended description** (136 chars): `Was kostet ein Hochzeits-DJ in Stuttgart? Drei Pakete mit Umfang, Stunden und Technik im Überblick. Individuelles Angebot in 24 Stunden.`

### `/echte-hochzeiten` — meta key: `weddings`

- **Primary keyword:** `hochzeits-dj referenzen stuttgart`
- **Secondary:** `echte hochzeiten dj stuttgart`, `deutsch-türkische hochzeit beispiele`, `hochzeits-dj erfahrungen`, `hochzeitslocation partner stuttgart`
- **Intent:** Commercial investigation / trust-building (pre-purchase reassurance)
- **Volume:** estimate — lower-volume, high-conversion-value page; visitors here are usually already comparing 2–3 DJs.
- **Difficulty:** Easy — this page's ranking power will come from genuine testimonials and real venue photography, which is a content/trust problem, not a keyword problem. **Do not publish this page with fabricated names or quotes** — every reference must be real per `.claude/BRAND-FACTS.md`.
- **H1:** "Echte Hochzeiten, echte Tanzflächen"
- **Recommended title** (50 chars): `Echte Hochzeiten – Referenzen | VEYSL Hochzeits-DJ`
- **Recommended description** (140 chars): `Echte deutsch-türkische und multikulturelle Hochzeiten aus Stuttgart und Baden-Württemberg: Stimmen von Paaren, Clips und Partner-Locations.`

### `/musik` — meta key: `music`

- **Primary keyword:** `hochzeitsmusik dj stuttgart`
- **Secondary:** `dj sets hochzeit anhören`, `türkische hochzeitsmusik dj`, `playlist hochzeit dj`, `live-musik saz gitarre hochzeit`
- **Intent:** Informational leaning commercial (auditioning the DJ's taste before booking)
- **Volume:** estimate — informational/audition-stage query, moderate volume, high time-on-page value.
- **Difficulty:** Easy — almost no competitor site found publishes embedded audio sets; this is a content-depth opportunity, not a keyword fight.
- **H1:** "Musik & Sets für deine Hochzeit"
- **Recommended title** (42 chars): `Hochzeitsmusik & DJ-Sets Stuttgart | VEYSL`
- **Recommended description** (135 chars): `Hochzeits-Sets zum Reinhören: Sektempfang, Dinner, Peaktime. Deutsch, türkisch und international – plus Live-Musik auf Saz und Gitarre.`

### `/ablauf` — meta key: `process`

- **Primary keyword:** `hochzeits-dj ablauf buchung`
- **Secondary:** `hochzeits-dj buchen wie`, `häufige fragen hochzeits-dj`, `dj hochzeit ablauf beratung`
- **Intent:** Informational (removes booking friction, good FAQ-schema candidate)
- **Volume:** estimate — low standalone volume, but strong FAQ-rich-result candidate (`FAQPage` schema) which can win SERP real estate regardless of raw volume.
- **Difficulty:** Easy
- **H1:** "So läuft die Buchung ab"
- **Recommended title** (41 chars): `Hochzeits-DJ buchen: Ablauf & FAQ | VEYSL`
- **Recommended description** (126 chars): `Vom ersten Gespräch bis zum letzten Song: der Ablauf in vier Schritten und Antworten auf die häufigsten Fragen zur DJ-Buchung.`

### `/anfrage` — meta key: `booking`

- **Primary keyword:** `hochzeits-dj verfügbarkeit prüfen`
- **Secondary:** `dj hochzeit termin anfragen stuttgart`, `hochzeits-dj angebot einholen`
- **Intent:** Transactional (the conversion page — should stay lean, not keyword-stuffed)
- **Volume:** not applicable — this page converts, it doesn't need to rank broadly; keep title/description focused on clarity, not keyword density.
- **Difficulty:** n/a
- **H1:** "Termin prüfen & Angebot anfragen"
- **Recommended title** (40 chars): `Termin prüfen & Angebot anfragen | VEYSL`
- **Recommended description** (140 chars): `Datum eingeben, Verfügbarkeit für deine Hochzeit in Stuttgart prüfen und unverbindliches Angebot erhalten. Antwort innerhalb von 24 Stunden.`

### `/galerie` — meta key: `gallery`

- **Primary keyword:** `hochzeits-dj fotos videos stuttgart`
- **Secondary:** `dj hochzeit aftermovie`, `hochzeits-dj bilder stuttgart`
- **Intent:** Informational/trust — also an image-search opportunity (Google Images traffic is real for wedding-vendor galleries)
- **Volume:** estimate — meaningful Image-search volume; not measured on text search.
- **Difficulty:** Easy — filename + alt-text discipline is the whole game here (see `docs/SEO-ACTION-PLAN.md`).
- **H1:** "Galerie: Fotos & Videos"
- **Recommended title** (44 chars): `Galerie: Fotos & Videos Hochzeits-DJ | VEYSL`
- **Recommended description** (107 chars): `Fotos, Aftermovies und Reels von Hochzeiten und Events mit VEYSL – DJ, Live-Musik und Moderation in Aktion.`

### `/epk` — meta key: `epk`

- **Primary keyword:** `veysel durmuş dj biografie` (low-volume, brand-specific)
- **Secondary:** `hochzeits-dj booking presskit`, `dj rider hochzeit`, `booking anfrage veranstalter dj`
- **Intent:** Navigational/B2B — this page is for **venues, planners and press**, not couples. Optimize for people who already know the name, and for `site:` discoverability by venue partners doing due diligence, not for cold search volume.
- **Volume:** not applicable — B2B utility page.
- **Difficulty:** n/a
- **H1:** "EPK — Biografie, Presskit & Partner"
- **Recommended title** (38 chars): `EPK & Presskit – Veysel Durmuş | VEYSL`
- **Recommended description** (97 chars): `Biografie, Pressefotos, Technical Rider und Partner-Locations für Planer und Venues zum Download.`

### `/kontakt` — meta key: `contact`

- **Primary keyword:** `hochzeits-dj stuttgart kontakt`
- **Secondary:** `dj whatsapp stuttgart`, `hochzeits-dj telefonnummer`
- **Intent:** Navigational/transactional
- **Volume:** low, mostly branded — not measured.
- **Difficulty:** n/a
- **H1:** "Kontakt"
- **Recommended title** (40 chars): `Kontakt – Hochzeits-DJ Stuttgart | VEYSL`
- **Recommended description** (108 chars): `Hochzeits-DJ in Stuttgart direkt erreichen: WhatsApp, Telefon oder E-Mail. Antwort innerhalb von 24 Stunden.`

### `/impressum`, `/datenschutz` — meta keys: `imprint`, `privacy`

Legal pages — keep the existing minimal titles (`Impressum | VEYSL`, `Datenschutz |
VEYSL`), no keyword targeting needed. Do not `noindex` these; German legal pages are
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
- **Recommended title template** (28 chars + city name, keep total ≤60): `Hochzeits-DJ {Stadt} | VEYSL`
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
| `kına gecesi dj stuttgart` | Henna-night event, a distinct booking type from the wedding itself — real secondary revenue line | `/hochzeit-events` (TR: `/dugun-etkinlik`) |
| `nişan dj stuttgart` | Engagement-party DJ — same logic as Kına | `/hochzeit-events` |
| `davul zurna dj stuttgart` | Traditional drum/horn act — VEYSL doesn't necessarily perform this himself (verify with client before targeting), but the query proves demand for traditional-instrument acts alongside a modern DJ. If VEYSL can credibly offer or partner for this, it's a nearly uncontested Stuttgart-specific query (see competitive analysis — only a nationwide network found, no Stuttgart-specific dedicated page) | `/musik` or a future dedicated section — **needs client confirmation of capability before publishing a claim** |
| `deutsch-türkische hochzeit dj stuttgart` | The exact bicultural-couple framing from the client's own copy | `/` and city pages |

**TR title/description example (`home`, TR):**

- Title (52 chars): `Düğün DJ'i Stuttgart – DJ, Müzisyen & Sunucu | VEYSL`
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
| `german turkish wedding dj` | Matches the bicultural positioning for English-speaking family members of a Turkish-German couple | `/hochzeit-events` (EN: `/weddings-events`) |
| `multilingual wedding dj germany` | Corporate-expat angle (Stuttgart hosts Mercedes-Benz, Porsche, Bosch HQs — a plausible but unverified source of English-speaking demand) | `/` |
| `destination wedding dj germany` | Lower-intent, aspirational — only worth targeting once EN content exists in depth; don't lead with it | `/musik`, `/echte-hochzeiten` |

**EN title/description example (`home`, EN):**

- Title (50 chars): `Wedding DJ Stuttgart – DJ, Musician & Host | VEYSL`
- Description (143 chars): `Wedding DJ, live musician (saz & guitar) and host for German-Turkish & multicultural weddings in Stuttgart. Hosted in German, Turkish, English.`

**Honest framing for the client:** build EN because it's nearly free (no competitor to
beat) and it matches a real capability (English hosting is already a verified fact in
`.claude/BRAND-FACTS.md`), not because there's confirmed search demand. Treat it as a
long-term compounding asset, not a near-term lead-flow channel — re-visit priority once
GSC data exists for the EN pages (28+ days post-launch, per the GSC-analysis reference).
