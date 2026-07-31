# DJ Veys — Verified Brand Facts

**Source:** the client's existing site `veystunesofficial.de` (Impressum + Über-uns),
retrieved July 2026. These facts are **verified and safe to publish**. Anything not in
this file is unknown — do not invent it.

Machine-readable values live in `src/content/site.ts`. Read them from there; this file
is the narrative context.

---

## Identity

| | |
|---|---|
| Person | **Veysel Durmuş** |
| Established brand | **VeysTunesOfficial** (Google reviews, Instagram, YouTube run under this name) |
| New domain | **dj-veys.de** — short wordmark **DJ Veys** |
| Base | **Stuttgart-Obertürkheim**, Baden-Württemberg |
| Reach | Stuttgart · Baden-Württemberg · deutschlandweit · Europa |
| Old site | WordPress on IONOS — being replaced by this project |

⚠️ The wordmark question (DJ Veys vs. keeping VeysTunes) is still with the client. Use
`site.name` for the wordmark and `site.brandLegacy` wherever continuity matters
(Impressum, Google-review references, `sameAs` schema). Never hardcode either string.

## What he actually does — broader than "DJ"

This is the key positioning insight: **DJ + Musiker + Moderator in one person.**

1. **Hochzeits-DJ** — weddings are the core business
2. **Event-DJ** — engagements, birthdays, corporate events
3. **Moderator** — live hosting **in German, Turkish and English**
4. **Musiker** — plays **Saz and guitar** since childhood; live music is a real offer,
   not a bought-in extra
5. **Vermietung von Ton-, Licht- und Veranstaltungstechnik** — owns and rents
   professional AV equipment

## Religiös geprägte Hochzeiten — confirmed by the client on 2026-07-30

Volunteered by the client directly, as an offer that **already exists** and was simply
never written down anywhere. Before this, the entire repository contained zero
occurrences of "Dua", "İlahi", "Tilawet" or "islamisch" — a real service was invisible
to both search engines and answer engines.

Part of the offer, in his own listing:

- **Kur'an Tilaveti** (Quran recitation) and **Dua** as planned parts of the running order
- **İlahi — live**, not from a playlist
- **Türk Sanat Müziği** (Turkish art music), live-capable via saz
- Live music, premium sound and lighting (already covered above)
- **After-Wedding-Party — optional**, scoped in the planning call with the couple, and it
  can sit before or after the official programme

Positioning terms he wants to be found under: *Muslim Wedding DJ Germany*, *Islamische
Hochzeit Deutschland*, *Hochzeit mit Dua*, *Hochzeit mit İlahi*.

Where this landed in code: category `islamisch` in `src/content/answers.ts` (5 entries)
plus `tsm-live`, `after-wedding-party` and `recitation-sound` in the existing categories —
all DE/EN/TR, all dated `2026-07-30`.

**RESOLVED by the client on 2026-07-31: Veysel recites the Kur'an himself.** Not a
recording, not an external hoca booked in for that slot. This is the single strongest
differentiator in the whole cluster, because it collapses what competitors split across
two suppliers — recitation, dua, İlahi, hosting and the DJ set are one person.

Published as a direct, first-person claim in the answer `who-recites`, in the sharpened
`quran-and-modern-party`, and as its own section on `/islamische-hochzeit`
(`islamic.recitation` in `messages/{de,tr,en}.json`). Everywhere else the wording stays on
the running order and the microphone, which was already true before this confirmation.

## Target audience (confirmed by his own copy)

> "DJ, Musiker und Moderator für **deutsch-türkische, türkische und multikulturelle**
> Hochzeiten und Events."

Bicultural German-Turkish couples are the primary market, alongside German and
international weddings. This validates the DE/TR/EN trilingual build and makes the
Turkish locale a revenue channel, not a nice-to-have.

## 🔥 Instagram @dj_veys — the strongest asset in the whole project

Verified from the live profile (July 2026): **63,000 followers**, 165 posts, actively
posting wedding content through July 2026.

His own bio, verbatim:
> 🎧 DJ & Orkestra | 🇩🇪🇹🇷 0711 S-Software 👨‍💻
> 💍 Hochzeit | Verlobung | Henna | All Event
> 🔥 Müzik + Enerji + Sahne = 200+ Org.
> 📩 Rezervasyon & İletişim: DM

What this changes:

1. **The brand people actually know is "DJ Veys"**, not VeysTunesOfficial and not DJ Veys.
   63K followers is the recognition anchor. Brand search volume will be "dj veys".
2. **He is "DJ & Orkestra" — not a solo DJ.** His posts show horns (trumpet/saxophone),
   i.e. a live band, alongside the DJ set. Combined with "ALLES AUS einer Hand" on his
   own graphics, the real positioning is *DJ + live orchestra + hosting + AV, from one
   supplier*. That is a genuinely strong differentiator in the Turkish/German wedding
   market and is currently under-communicated on his website.
3. **63K followers beats any Google review count as social proof** and, unlike the review
   count, it is verifiable right now. It belongs prominently on the homepage.
4. Highlights show **Vienna (Viyana)** — he works internationally, not only in Germany.
5. Bookings currently arrive by **Instagram DM**. The whole point of this site is to move
   that into a structured enquiry funnel where dates, budgets and packages get captured.

**Event count — RESOLVED by the client: use 200+.** The old website's "100+" is outdated.
`site.stats.eventsCompleted` is now `200`. Read it from there, never hardcode it.

**Wordmark — RESOLVED by the client: `DJ Veys`, and DJ Veys only.**

There is **one brand name on this site**. Do not hedge, do not dual-brand, do not write
"DJ Veys (ehemals VeysTunesOfficial)" or "DJ Veys — DJ Veys" anywhere in visible copy.

- `site.name` = **DJ Veys** — the only name in the header, footer, titles, body copy, alt text
- `site.legalName` = **VeysTunesOfficial** — Impressum only. This is a legal requirement
  under § 5 DDG (the registered business name must appear there), not a brand statement.
  It appears on the Impressum page and nowhere else.
- `site.previousNames` = `['DJ Veys', 'VeysTunesOfficial']` — **machine-readable continuity
  only**: schema.org `alternateName`/`sameAs`, 301 redirects, Search Console address change.
  These exist so that the 63k Instagram followers and the existing Google reviews can find
  the new domain. They must never render as visible text.

**Partners visible on his own posts** (in `site.partnersUnconfirmed`): Liebe Events —
Kına & Wedding, Alpina Löwen, ArslanEvent, AuraEvent. Real names, but **do not publish
logos or partner claims without the client's confirmation** that these are current
partners and that he has permission to name them.

## Verified numbers — publishable

- **12+ years** experience as DJ & musician
- **100+** weddings and events accompanied
- **3 languages** of live hosting: German, Turkish, English
- **5.0 ★ on Google** — ⚠️ the *rating* is verified, the *review count* is not.
  `site.reviews.isPublishable` is therefore `false` and both the badge and
  `AggregateRating` schema must stay hidden until the client supplies the real count.

## Service promises he already makes (safe to reuse)

Persönliche Beratung · Individuelle Musikplanung · Professionelle Moderation ·
Premium Sound- & Lichttechnik · Modernes DJ-Setup · Zuverlässigkeit vom ersten
Gespräch bis zur letzten Minute · Soundcheck und Technikabstimmung vor jedem Event.

## Personal story — strong differentiator for the About/EPK page

Plays saz and guitar since childhood. Works full-time as an **IT specialist
(Informatiker)** and brings that precision and planning discipline to event work.
Runs marathons and competes in triathlons — often runs 10 km on the morning of a
wedding to start the evening with full energy. After the wedding season he goes
camping in the Alps to recharge.

His own framing: *"Mein Ziel ist nicht nur Musik abzuspielen. Mein Ziel ist es,
Emotionen zu schaffen."* and *"Nur wer selbst voller Energie ist, kann diese Energie
auch an andere weitergeben."*

This is genuinely distinctive material — an engineer's reliability plus a musician's
ear plus an athlete's stamina. Use it on the EPK/about page and in the trust sections
rather than generic DJ boilerplate.

## Contact (verified)

- Phone / WhatsApp: **+49 176 64844815**
- Email: **info@dj-veys.de** — the public business address, used in `site.contact.email`,
  the Impressum and the Google Business Profile. Runs on the self-hosted mailserver
  (docs/MAIL-SELFHOSTED.md). Automated sends use `no-reply@dj-veys.de` instead, on
  purpose: a send-only address whose reputation cannot damage the personal mailbox.
  The old private Gmail is no longer referenced anywhere in the app.
- Instagram: `@veystunesofficial` · YouTube: `@veystunesofficial`
- Google Maps profile: linked in `site.social.googleMaps`

## Still unknown — do NOT invent

Full street address and postcode (legally required in the Impressum), VAT ID, Google
review count and Place ID, prices for any package, client testimonials and names,
venue partners, press mentions, Spotify/SoundCloud/Mixcloud profiles.

## Media — ⚠️ READ THIS BEFORE WIRING ANY IMAGE

12 photos from the existing site are in `public/images/legacy/` (1500×2000 and up, so
resolution is fine). The client authorised reuse. **But the set has been reviewed and it
does not contain what this site needs:**

| File | What it actually shows | Usable? |
|---|---|---|
| `01-156b4efb.jpg` | Veysel at his DJ booth — but in an empty white room with grey office carpet, flat daylight | Only as a small "Setup/Soundcheck" detail. **Never as a hero.** |
| `05-86ab7620.jpg` | Generic stock photo: a man at a sunset shoreline. Not Veysel, not an event. Almost certainly leftover WordPress-theme stock. | **No. Do not use — unclear licence and zero brand relevance.** |
| `08-2ef27d08.jpg` | Veysel hiking in the Alps with a backpack — personal photo matching his bio | Only on the About/EPK page as a personal-story image |
| remaining files | mixture of personal shots and equipment/setup photos | case by case, none are wedding imagery |

**There is not a single real wedding photograph in this set** — no couples, no full dance
floor, no venue, no atmosphere, no live saz performance.

Consequences that every agent must respect:

1. **Do not place any of these in a hero, showreel or "Echte Hochzeiten" slot.** A premium
   wedding site whose hero is an empty white room loses to competitors on first impression,
   and photography is the strongest conversion driver in this market.
2. Build every image slot to degrade gracefully to a **designed empty state** (typography,
   gradient, gold accents) rather than a weak photo. The design must look finished and
   expensive with **zero photographs** — that is the actual requirement right now.
3. `gallery.ts`, `weddings.ts` and `testimonials.ts` stay **empty arrays**. Do not seed
   them with these files.
4. Never substitute stock imagery for real work. Passing off a stock couple as one of his
   weddings would be a misrepresentation, and it is exactly what the empty states exist to
   avoid.

**This is the #1 launch blocker and it is a client task, not a code task:** professional
photos and video from real weddings (couples, packed dance floor, venue, him hosting with
a microphone, him playing saz), plus one proper portrait and an aftermovie.
