# DJ Veys — Programmatic City Page Strategy (`/hochzeits-dj/[stadt]`)

Route already exists in the routing map: `src/i18n/routing.ts` defines
`/hochzeits-dj/[stadt]` (EN: `/wedding-dj/[stadt]`, TR: `/dugun-dj/[stadt]`), and content
is expected at `src/content/cities.ts` (not yet created — this doc is the input for
whoever builds it).

**Read the doorway-page warning in §3 before building a single page.** Near-duplicate
city pages are a Google spam-policy violation, not just a weak tactic — every
competitor found in `docs/SEO-COMPETITIVE-ANALYSIS.md` who tried this badly (one
long list-of-cities paragraph, e.g. tuerkischerdj.com) is proof of the failure mode to
avoid, not a template to copy.

**Sourcing note:** population and distance figures below are cited per-city where a
specific source was found in research; a smaller number of the closest, smallest towns
use a general-knowledge approximate distance flagged as such — verify via
[luftlinie.org](https://www.luftlinie.org/) before publishing an exact number on the
site itself, since a wrong public-facing "X km from Stuttgart" claim is a small but real
credibility risk. All venue names below are either (a) **confirmed bookable wedding
venues** found via direct search with their own source, or (b) **well-known public
landmarks** noted for their photo/regional-character value but **not confirmed as
bookable event venues** (marked explicitly), or (c) marked **"needs client input"**
where nothing verifiable was found. No venue name in this document was invented.

---

## 1. Tier 1 — build first (client's own confirmed service area)

These 7 cities are already named in `src/content/site.ts` → `serviceAreas`, meaning the
client has already implicitly claimed them — building pages here carries the lowest
legitimacy risk and the strongest existing internal-linking logic (link from `/` and
`/kontakt`'s service-area mention straight to these pages first).

### Karlsruhe
- **Distance:** ~62 km (straight-line, [luftlinie.org](https://www.luftlinie.org/))
- **Population:** ~309,964 (Stadtkreis Karlsruhe, 2023/2024, [Statistisches Landesamt BW](https://www.statistik-bw.de/))
- **Competition:** Medium — several solo German DJs with dedicated Karlsruhe pages (DJ Domi N., DJ Mike Hoffmann, DJ Selecta Martin, H2O Promotions), plus DJ Zalmii covering Karlsruhe/Baden-Baden/Offenburg. No dedicated Turkish-specific Karlsruhe DJ page found.
- **Turkish community:** Medium-high (qualitative — large city in the Rhine/Neckar industrial corridor with a long Turkish-German history; BW-wide Turkish nationals are the largest foreign group at 268,730 per [Statistisches Landesamt BW, Nov 2024](https://www.statistik-bw.de/presse/pressemitteilungen/pressemitteilung/laenderinformation-tuerkei/)). Exact local share not verified — **needs client input** for real numbers.
- **Local hooks:**
  - Confirmed bookable venue: **Festsaal im Schloss Karlsburg Durlach** — 242 m², up to 140 guests, historic Barockschloss (1563) — [unserehochzeitslocation.de](https://www.unserehochzeitslocation.de/hochzeitslocation/festsaal-im-schloss-karlssburg-durlach_3009/)
  - Directory confirms real demand for Turkish wedding halls specifically: [HochzeitsCheck "Türkischer Hochzeitssaal in Karlsruhe"](https://hochzeitscheck.de/tuerkischer-hochzeitssaal-in-karlsruhe.html) — use as evidence of demand, not as a venue name (no specific hall name surfaced).
  - Regional character: Fächerstadt (fan-shaped Baroque city plan), Residenzschloss Karlsruhe as a well-known landmark (not confirmed as a bookable wedding venue — verify before using as a "we perform here" hook).

### Mannheim
- **Distance:** ~95 km (straight-line, luftlinie.org)
- **Population:** ~316,877 (Stadtkreis Mannheim, 2023/2024, [Statistisches Landesamt BW](https://www.statistik-bw.de/))
- **Competition:** Medium-high — dense DJ market (Listen2 Band, DJ JulesTonic, Warehouse Music, DJ Jan Mitchell, DJ Martin Meyer, DJ Celvin X/lakeloveevents, Dario Karkovic, DJ Mark Kiss all run Mannheim-specific pages). Highest-density non-Turkish DJ market found in this whole research set.
- **Turkish community:** High confidence — Mannheim's foreign-population share is 27.8% ([Mannheimer Morgen, citing city statistics](https://www.mannheimer-morgen.de/orte/mannheim_artikel,-mannheim-statstik-so-viele-auslaender-leben-in-mannheim-_arid,2302747.html)), and Mannheim has one of Germany's most established Turkish communities.
- **Local hooks:**
  - Confirmed, named Turkish wedding venue: **"Dügün Salonu Mannheim"**, Skalitzer Str. 130, 68161 Mannheim — [vaybee.de](https://www.vaybee.de/service/dueguen-salonu-mannheim.php). This is the single strongest concrete local hook found in this entire research pass — use it.
  - General Turkish-hall demand confirmed via [HochzeitsCheck Mannheim listing](https://www.hochzeitscheck.de/tuerkischer-hochzeitssaal-in-mannheim.html).
  - Regional character: Mannheim's grid-plan "Quadratestadt" city center, Rhine/Neckar confluence — real, well-known, low risk to reference generically.

### Heilbronn
- **Distance:** ~40 km (straight-line, luftlinie.org)
- **Population:** ~131,653 ([Statistisches Landesamt BW](https://www.statistik-bw.de/))
- **Competition:** Medium — several solo DJs run dedicated Heilbronn pages (Mike Hoffmann, DJ Celvin X, Rafael Marco, Florian Geibel, "eindj.de"). No Turkish-specific competitor found for Heilbronn specifically.
- **Turkish community:** Medium-high qualitatively (industrial Neckar-valley city, historically significant Gastarbeiter-era settlement) — **needs client input** for a real figure.
- **Local hooks:** No specific bookable venue name was verified in this research pass — **needs client input**. Regional character that is safe to reference: Neckar wine-growing region (Weinberge), "Käthchenstadt" nickname (historic old town character).

### Reutlingen
- **Distance:** ~32 km (straight-line, luftlinie.org)
- **Population:** ~118,852 (Stand 31.03.2026, [Stadt Reutlingen](https://www.reutlingen.de/de/Leben/Unsere-Stadt/Daten-Fakten/Einwohnerzahl))
- **Competition:** Medium — several solo DJs and a regional portal (`heiraten-in-tuebingen-reutlingen.de`) cover Reutlingen; no dedicated Turkish-specific Reutlingen DJ found.
- **Turkish community:** Medium-high qualitatively (Schwäbische Alb textile-industry city with a long-established Turkish-German community) — **needs client input** for a real figure.
- **Local hooks:**
  - Confirmed bookable venue: **"Alte Färberei"** — historic venue in Reutlingen, up to 200 guests (found via general venue search; verify current booking status/exact address before publishing).
  - Regional character: gateway to the Schwäbische Alb, historic textile-industry ("Deutschlands Nadelöhr") character.

### Pforzheim
- **Distance:** ~57 km (straight-line, luftlinie.org)
- **Population:** ~135,087 ([Statistisches Landesamt BW](https://www.statistik-bw.de/))
- **Competition:** Medium — several solo DJs (Domi N., Mike Hoffmann, Stefan Kietz, Andy Brix, DJ Celvin X, Bastian van Rider) run Pforzheim pages. No Turkish-specific competitor found.
- **Turkish community:** Medium qualitatively — **needs client input** for a real figure.
- **Local hooks:** No specific bookable venue verified — **needs client input**. Regional character that's safe to use: "Goldstadt" (historic jewelry/watchmaking industry), Nagoldtal.

### Esslingen (am Neckar)
- **Distance:** ~15 km, general-knowledge estimate — **verify via luftlinie.org before publishing**
- **Population:** ~96,182 (2024-12-31, [Stadt Esslingen](https://www.esslingen.de/start/buergerservice/statistik.html))
- **Competition:** Medium — many DJs list Esslingen as a secondary service area (djxter.de, event-dj-stuttgart.de, DJ Schale, Kögel und Pöbel, eindj.de) rather than a true dedicated page; genuinely thin real competition for a standalone Esslingen page.
- **Turkish community:** Medium-high qualitatively (industrial Neckar-valley city) — **needs client input**.
- **Local hooks:**
  - Confirmed bookable venue: **Esslingen Burg** (Esslingen Castle) — ceremonies with views over vineyards and the old town rooftops (found via wedding-venue search).
  - Regional character: one of Baden-Württemberg's best-preserved medieval old towns, terraced vineyards within the city itself (Esslinger Weinberge) — real, distinctive, safe to reference.

### Böblingen (bonus — already in `serviceAreas`, not in the brief's 24-city list)
- **Distance:** ~20 km, general-knowledge estimate — **verify via luftlinie.org before publishing**
- **Population:** not confirmed in this research pass — **needs client input / verify via [citypopulation.de](https://www.citypopulation.de/de/germany/badenwurttemberg/08115__b%C3%B6blingen/)** (commonly cited around ~50,000, not independently re-verified here — do not publish that number without checking the source directly)
- **Competition:** Low-medium — appeared mostly as a secondary market for Stuttgart-based DJs, no dedicated strong competitor found.
- **Turkish community:** Not verified — **needs client input**.
- **Local hooks:** No specific venue verified — **needs client input**. Regional character that's safe to use: automotive/tech corridor (Mercedes-Benz and major tech employers in the area), edge of the Schönbuch nature park.
- **Recommendation:** since it's already a confirmed service area per `site.ts` but wasn't in the brief's city list, build it in the same Tier-1 batch — the internal logic ("we already say we serve Böblingen") makes it low-risk and cheap to add alongside Karlsruhe/Esslingen/etc.

---

## 2. Tier 2 — ✅ BUILT (August 2026)

> **Status:** the operator confirmed on 2026-08-07 that he travels to and serves
> these cities — the gate this section describes. All seven ship as pages
> (`priority: 1` in `src/content/cities.ts`). Distances were recomputed before
> publishing; several were wrong, corrected inline below. `turkishCommunity`
> stays `false` everywhere: the confirmation covered travel, not the demographic
> question these entries flag as "needs client input".

Real hooks exist, competition is manageable, and each is a natural geographic/community
extension of Tier 1 — but confirm with the client that he actually wants to (and
realistically will) travel/serve here regularly before publishing, since a city page
implicitly promises local availability.

### Tübingen
- **Distance:** **~30 km** (straight-line, haversine — corrected August 2026) exact figure
- **Population:** ~93,615 (2023, [Stadt Tübingen](https://www.tuebingen.de/1370.html))
- **Competition:** Medium — university town with several dedicated DJ pages (DJemi, Suite 219, The Event DJ). No Turkish-specific competitor found.
- **Turkish community:** Not verified for this specific city — **needs client input**.
- **Local hooks:** No specific bookable wedding venue confirmed — **needs client input**. Regional character (real, safe to use): university town on the Neckar, historic Altstadt, punting (Stocherkahn) tradition — strong photo/atmosphere hook even without a named venue.

### Heidelberg
- **Distance:** **~79 km** (straight-line, haversine from city coordinates — see the "Batch August 2026" note in `src/content/cities.ts`). The ~109 km recorded in the original pass was wrong.
- **Population:** ~155,175 ([Statistisches Landesamt BW](https://www.statistik-bw.de/))
- **Competition:** Medium-high — dense DJ market (DJcall.de, Listen2 Band, Einfach Freddy, DJ Delta, H2O Promotions, DJ Martin Meyer). No Turkish-specific competitor found for Heidelberg.
- **Turkish community:** Not verified — **needs client input**.
- **Local hooks:**
  - Confirmed, highly distinctive hook: **Heidelberg Castle (Schloss Heidelberg)** has offered civil marriage ceremonies since 2009, in the "Brunnenstube" or "Liselottestube" rooms — [Stadt Heidelberg](https://www.heidelberg.de/HD/Rathaus/Trautermine.html). This is one of the most recognizable wedding-venue facts found in this entire research pass — genuinely worth leading with.

### Ulm
- **Distance:** ~73 km (straight-line, luftlinie.org)
- **Population:** ~128,998 ([Statistisches Landesamt BW](https://www.statistik-bw.de/))
- **Competition:** Medium — several dedicated Ulm DJ pages (Soundburg, Schwaben Event, DJ Matthias Leichtle, derWelle, Deejay-DK). No Turkish-specific competitor found, though DJ Serkan's homepage lists Ulm among ~35 named cities (no dedicated page).
- **Turkish community:** Medium qualitatively — **needs client input**.
- **Local hooks:** Confirmed, well-known landmark: **Ulmer Münster / historic Rathaus** — civil ceremonies take place in Ulm's town hall, described as one of the most beautiful buildings in the region with Gothic-framed windows and facade painting (found via Standesamt/wedding-venue search). Real and distinctive.

### Göppingen
- **Distance:** **~35 km** (straight-line, haversine — corrected August 2026)
- **Population:** ~58,905 (2024, [Statistisches Landesamt BW](https://www.statistik-bw.de/))
- **Competition:** Low-medium — mostly listed as a secondary market by Stuttgart/Ostalb-based DJs, no strong dedicated competitor.
- **Turkish community:** Not verified — **needs client input**.
- **Local hooks:** No specific venue verified — **needs client input**. Regional character: Filstal, foothills of the Swabian Alb.

### Freiburg (im Breisgau)
- **Distance:** ~131 km (straight-line, luftlinie.org)
- **Population:** ~236,182–236,236 (two closely matching figures found; [Statistisches Landesamt BW](https://www.statistik-bw.de/) / [Statista](https://de.statista.com/))
- **Competition:** Medium-high — largest DJ market of the smaller BW cities in this research (Christoph Scholze, JulesTonic, DJ-Bande, B.A.Sound Events, Alexander Lorenz, Felix Krüger, Andy Brix, eventpeppers listing 25 DJs). No Turkish-specific competitor found specifically for Freiburg, despite the general "Serkan" city-list including it.
- **Turkish community:** Not verified for this specific city — university/tourism city profile suggests a smaller share than the industrial Neckar-valley towns, but this is a qualitative read, not data — **needs client input**.
- **Local hooks:** Confirmed, well-known: civil ceremonies take place at **Freiburg's historic Rathaus**, and the **Historisches Kaufhaus at Münsterplatz** (red Gothic-arcade building) is described as the city's most popular wedding venue; **Schloss Ebnet** and the **Alte Wache** are also cited as special wedding locations (found via Standesamt/wedding-venue search). Strong, real, distinctive set of hooks.

### Aalen
- **Distance:** **~67 km** (straight-line, haversine — corrected August 2026)
- **Population:** ~67,697 (2024, [Statistisches Landesamt BW](https://www.statistik-bw.de/))
- **Competition:** Low — mostly Ostalbkreis-wide DJs (Laura Schaible, Oliver Kraus, D-Veranstaltungsservice) rather than Aalen-specific pages.
- **Turkish community:** Medium qualitatively (Ostalbkreis industrial towns have historic Turkish-German communities tied to local manufacturing) — **needs client input**.
- **Local hooks:** Confirmed bookable venues: **Villa Stützel** and **Freudenschmaus** (both in Aalen); **Schloss Kapfenburg** (~15 km from Aalen, Rittersaal up to 90 guests / Fürstensaal up to 120) — all found via direct wedding-venue search.

### Schwäbisch Gmünd
- **Distance:** **~45 km** (straight-line, haversine — corrected August 2026; comfortably inside the 50 km included-travel zone)
- **Population:** ~64,237 (2024, [Statistisches Landesamt BW](https://www.statistik-bw.de/))
- **Competition:** Low — a few solo DJs (Ein DJ Thomas, DJ DelL) with dedicated pages, otherwise Ostalbkreis-wide coverage.
- **Turkish community:** Medium qualitatively — **needs client input**.
- **Local hooks:** Confirmed bookable venue: **Manufaktur B26** — event space among historic classic cars, "Piazza" and "Boxengasse" areas, operating since 2016 (found via direct search).

---

## 3. Tier 3 — ✅ BUILT (August 2026)

> **Status:** shipped alongside Tier 2 after the same 2026-08-07 confirmation,
> as `priority: 2`. Same distance and `turkishCommunity` caveats as above.

Further away, and/or the client has given no signal he currently travels there
regularly. Worth building once Tier 1–2 are live and converting, not before.

### Offenburg
- **Distance:** **~97 km** (straight-line, haversine — corrected August 2026). The ~140 km estimate was self-contradictory: it cannot sit *between* Karlsruhe (62) and Freiburg (131) and also exceed both. It also contradicted `src/content/regions.ts`, which puts Strasbourg at ~110 km although Strasbourg lies further out.
- **Population:** ~62,994 (2024, [Statistisches Landesamt BW](https://www.statistik-bw.de/))
- **Competition:** Low-medium (DJ Zalmii, DJ D-ONE/events-offenburg.de, DJ-Bande, eventpeppers listing). No Turkish-specific competitor found.
- **Turkish community:** Not verified — **needs client input**.
- **Local hooks:** No specific venue verified — **needs client input**. Regional character: "Tor zum Schwarzwald" (gateway to the Black Forest) and to the Ortenau wine region, proximity to the French border/Strasbourg.

### Baden-Baden
- **Distance:** **~69 km** (straight-line, haversine — corrected August 2026; the ~100 km estimate was wrong)
- **Population:** ~56,738 (2024, [Statistisches Landesamt BW](https://www.statistik-bw.de/))
- **Competition:** Low-medium (DJ Zalmii is based here specifically, several regional DJs list it secondarily).
- **Turkish community:** Baden-Baden has one of the higher overall foreign-population shares in BW at 25.2% ([goodnews4.de, citing state statistics](https://www.goodnews4.de/nachrichten/daily-news/item/252-prozent-auslaender-in-baden-baden-platz-fuenf-in-baden-wuerttemberg)) — composition not broken down by nationality in the source found, so **do not assume this is majority-Turkish without client confirmation**.
- **Local hooks:** No wedding-specific venue verified — **needs client input**. Regional character (real, internationally known, safe to reference): historic spa town (Kurstadt), Casino Baden-Baden, Lichtentaler Allee.

### Konstanz
- **Distance:** ~125 km (straight-line, luftlinie.org)
- **Population:** ~86,845 (2024, [Statistisches Landesamt BW](https://www.statistik-bw.de/))
- **Competition:** Medium — an established Bodensee DJ cluster already covers this (DJ Brano, DJ Bodensee/Musicfactory, DJ Dany Mankau, DJ & Friends, and lakeloveevents' own Bodensee page).
- **Turkish community:** Not verified — university/tourism-driven Bodensee city, likely smaller than the industrial corridor towns — **needs client input**.
- **Local hooks:** Confirmed, nearby and genuinely usable: **Neues Schloss Meersburg**, overlooking the Bodensee, originally a Baroque residence of the Konstanz prince-bishops (found via direct search) — technically in Meersburg, not Konstanz proper, so frame it as "nearby" honestly.

### Friedrichshafen
- **Distance:** **~127 km** (straight-line, haversine — corrected August 2026)
- **Population:** ~62,798 (2024, [Statistisches Landesamt BW](https://www.statistik-bw.de/))
- **Competition:** Medium — same established Bodensee DJ cluster as Konstanz.
- **Turkish community:** Not verified — **needs client input**.
- **Local hooks:** No specific venue verified — **needs client input**. Regional character: Zeppelin/aviation heritage (Zeppelin Museum), Bodensee lakefront.

---

## 4. Tier 4 — skip for now

Either genuinely too far for a credible "local" page, or already has entrenched
competition (including Turkish-specific competition), or a language mismatch that makes
a German-slug page a weak fit.

### Frankfurt am Main
- **Distance:** ~153 km (straight-line, luftlinie.org)
- **Population:** ~776,843 (end of 2024, [Statistikportal Frankfurt](https://statistikportal.frankfurt.de/statistik_aktuell/2025/FSA_2025_04_BevoelkerungEnde2024.html))
- **Why skip for now:** Real, entrenched Turkish-specific competitors already found here — DJ Göki, [Firstclass-dj.de](https://www.firstclass-dj.de/dj-buchen-fuer-tuerkische-hochzeit/), plus a dense general DJ market (DJ Franckey, DJ Maboo, discjockey-frankfurt.de). A 153 km "local" claim is also a harder sell to a couple who can find a Frankfurt-based Turkish DJ already established there.
- **Local hook if revisited later:** the **Römer** (historic city hall/square) is an iconic, well-known Frankfurt wedding-photo backdrop — real, but not confirmed here as a bookable ceremony venue.

### Nürnberg
- **Distance:** ~157 km (straight-line, luftlinie.org)
- **Population:** ~546,397 (end of 2024, [Nürnberg city statistics office](https://www.nuernberg.de/imperia/md/statistik/dokumente/veroeffentlichungen/berichte/monatsberichte/2025/sus2025_m558_bevolkerungsvorausberechnungnurnberg2024_online.pdf))
- **Why skip for now:** Confirmed Turkish-wedding-specific competitor already active: **DJ Michael Baumgartner** runs a dedicated "Hochzeit DJ Nürnberg Türkisch" page — this is the most direct like-for-like Turkish-niche competitor found anywhere outside Stuttgart itself.
- **Local hook if revisited later:** **Nürnberger Kaiserburg** (Nuremberg Castle) — real, iconic, not confirmed as a bookable venue.

### Würzburg
- **Distance:** ~126 km (straight-line, luftlinie.org)
- **Population:** not independently re-confirmed in this research pass (commonly cited ~127,000–130,000; verify via [Statista Würzburg](https://de.statista.com/statistik/daten/studie/466945/umfrage/entwicklung-der-gesamtbevoelkerung-in-wuerzburg) before publishing)
- **Why skip for now:** Dense general DJ market with multiple multi-city operators already running dedicated Würzburg pages (Soundburg, Ebi.DJ, DJ Andy Brix, Alexander Lorenz, DJ Martin Meyer, Mister Beat). No Turkish-specific competitor found, but it's at the edge of the realistic travel radius and there's no signal the client currently serves this far north.
- **Local hook if revisited later:** the **Würzburg Residenz** (UNESCO World Heritage Baroque palace) is real and a very strong wedding-photo landmark — not confirmed here as a bookable ceremony venue.

### Darmstadt
- **Distance:** ~159 km (straight-line, luftlinie.org)
- **Population:** not independently re-confirmed in this pass (commonly cited ~160,000; verify before publishing)
- **Why skip for now:** Dense Rhein-Main DJ market already found (DJ Martin Meyer's homepage doubles as the Darmstadt page, DJErikNickel, DJ Bernd Rohr, DJ Agostino, DJ Franckey at "4.9/5 on Google" with 250+ weddings). This is functionally the same competitive zone as Frankfurt.
- **Local hook if revisited later:** **Mathildenhöhe** (UNESCO Art Nouveau/Jugendstil site) — real, distinctive, not confirmed as a bookable ceremony venue.

### Augsburg
- **Distance:** ~134 km (straight-line, luftlinie.org)
- **Population:** not independently re-confirmed in this pass (commonly cited ~300,000; verify before publishing)
- **Why skip for now:** Found mainly as a secondary market for Bavaria-wide multi-city operators (Alexander Lorenz DJ), no Turkish-specific competitor found but also no strong signal of unmet demand specifically here, and it's on the far edge of a credible "local" claim from Stuttgart.
- **Local hook if revisited later:** **Augsburger Rathaus** (Renaissance town hall) and the **Fuggerei** (world's oldest social housing complex) — both real, distinctive, neither confirmed as bookable wedding venues.

### Straßburg / Strasbourg (France)
- **Distance:** ~108 km (straight-line, luftlinie.org) — geographically the *closest* Tier 4 city, but excluded for a different reason.
- **Population:** ~291,363 city proper (2024, [INSEE via ville-data.com](https://ville-data.com/nombre-d-habitants/Strasbourg-67-67482))
- **Why skip:** Two compounding problems, not one. First, **language/market mismatch** — Strasbourg's primary wedding-services market searches in French, and the client's verified hosting languages are German, Turkish and English (`.claude/BRAND-FACTS.md`) — no French. Second, **real entrenched Turkish/oriental-DJ competition already exists there** ([DJ Ramzi](https://djramzi.com/), [organisateur-mariage-mixte.fr](http://www.organisateur-mariage-mixte.fr/accueil/)) serving exactly the Turkish/oriental-mixed-wedding niche in French. Building a German-slug `/hochzeits-dj/strassburg` page for a French-speaking market the client can't host in is a doorway-page risk in its own right (URL and content language wouldn't match visitor intent) — **skip unless the client explicitly wants to enter the French market with real French-language capability.**

---

## 5. Minimum unique content per city page (doorway-page guardrail)

Google's spam policies explicitly call out "doorway pages" — pages built to rank for
similar searches that funnel users to a single destination with no real per-page value.
A city page that's the shared template with `{Stadt}` swapped in three sentences **is**
a doorway page. Every `/hochzeits-dj/[stadt]` page must include, at minimum:

1. **A real, verified local reference** — a named venue (from this doc's confirmed list,
   or newly verified before publishing), a real regional-character fact, or a real
   distance/travel-time note. Never a generic "beautiful city X" sentence that could be
   true of any city.
2. **A distinct H1 and title** using the city name in a natural sentence position, not
   just a slot-filled template (see `docs/SEO-KEYWORD-MAP.md` §2 for the pattern).
3. **At least one piece of city-specific social proof where it genuinely exists** — a
   real testimonial or real event photo from a wedding actually held in or near that
   city, once such content exists (`.claude/BRAND-FACTS.md`: no fabricated testimonials,
   ever). Until real per-city proof exists, don't fake it — use the shared
   `/echte-hochzeiten` testimonials instead of inventing a city-specific one.
4. **A genuinely different secondary-keyword mix per page** — e.g. Mannheim's page can
   legitimately lead with the Turkish-wedding-hall angle given the confirmed "Dügün
   Salonu Mannheim" venue and 27.8% foreign-population context; Heidelberg's page can
   legitimately lead with the castle-wedding angle. Don't run the identical keyword set
   on every page — let the real local facts drive which secondary keywords each page
   earns.
5. **Working local internal links** — link each city page to/from the relevant nearby
   Tier grouping (e.g. Esslingen ↔ Stuttgart ↔ Ludwigsburg) so the pages read as a real
   regional network, not 24 isolated funnels.

**A city page with none of the above should not ship** — better to launch with 7 genuinely
distinct Tier-1 pages than 24 templated ones. Quality and distinctness beats coverage
here, and coverage without distinctness is the exact failure mode Google penalizes.
