/**
 * Country-level "reach" landing pages — Europe-wide availability, deliberately
 * NOT city-level. Route: `/hochzeits-dj-europa` (hub) and
 * `/hochzeits-dj-europa/[land]` (country pages) — see src/i18n/routing.ts.
 *
 * WHY COUNTRY-LEVEL, NOT CITY-LEVEL (see docs/SEO-EUROPE-STRATEGY.md for the
 * full argument): a Stuttgart-based business cannot rank in a foreign city's
 * Google local pack — that requires proximity and a Google Business Profile
 * there, neither of which exists. Mass-producing "Hochzeits-DJ <Oslo/
 * Amsterdam/…>" pages would be a textbook doorway-page pattern under Google's
 * spam policies, and the penalty is domain-wide — it would drag down the
 * genuinely winnable `/hochzeits-dj/[stadt]` cluster with it. Five countries,
 * each with real, differentiated substance, beats twenty templated ones.
 *
 * HARD RULES (mirrors src/content/cities.ts's discipline exactly):
 *
 *  - `verified` is `true` for EXACTLY ONE entry: Österreich/Wien — the one
 *    international booking confirmed in `.claude/BRAND-FACTS.md`
 *    (`site.verifiedInternational`). Every other country is phrased as
 *    AVAILABILITY ("buchbar in …", "wir reisen an"), never as track record
 *    ("regelmäßig gebucht in …"). Do not flip a second country to `verified`
 *    without the client confirming a real, nameable event.
 *  - No invented venues, past events, partners or diaspora statistics. Where
 *    this file makes a diaspora claim, it is deliberately qualitative
 *    ("one of the larger Turkish communities in Western Europe") and never a
 *    fabricated number — there is no per-country research doc analogous to
 *    docs/SEO-CITY-STRATEGY.md's cited Statistisches-Landesamt figures for
 *    these five countries, so inventing a percentage here would violate
 *    CONTRACT.md §3 "No fabricated data" the same way a fake review count
 *    would.
 *  - `languagesNote` must say, on every single country page, that live
 *    hosting is German/Turkish/English ONLY (`site.stats.hostingLanguages`).
 *    Never claim French, Dutch or any other live-hosting language — see
 *    HANDOVER.md §8: the French page exists so Alsace/Wallonia readers can
 *    read and enquire, NOT because moderation happens in French. Follow that
 *    exact distinction for Niederlande (Dutch) too.
 *
 * LOCALES: `de` is mandatory for every field. `en` and `tr` are written for
 * all five countries (destination-wedding search + the bicultural core
 * audience). `fr` is written ONLY for Frankreich and Belgien, matching
 * routing.ts's own stated intent ("fr — Grenzregion Elsass/Frankreich,
 * außerdem Wallonien (Belgien)") — writing thin machine-filler French for
 * Österreich/Schweiz/Niederlande would be worse than not shipping it, per
 * the same instruction cities.ts already follows for ku/fr/es. `ku` is
 * deliberately NOT written yet for any country, despite the genuine
 * Kurdish-diaspora relevance of Niederlande/Belgien (see `kurdishDiaspora`)
 * — flagged in docs/SEO-EUROPE-STRATEGY.md as the most promising follow-up,
 * pending a qualified Kurmancî writer rather than a rushed draft. `es` is
 * skipped entirely: no established relevance to any of these five countries.
 */

import type { Locale } from '@/i18n/routing';

/**
 * Localized freeform text: German is mandatory, every other locale is
 * optional. A locale with nothing written here simply doesn't render that
 * block — never a German paragraph on an English/Turkish/French page. Same
 * type as `src/content/cities.ts`'s `LocalizedProse`, intentionally
 * duplicated (not imported) so this module has no dependency on a file
 * another agent owns.
 */
export type LocalizedProse = { de: string } & Partial<Record<Locale, string>>;

export interface RegionFaqEntry {
  question: LocalizedProse;
  answer: LocalizedProse;
}

export interface Region {
  /** URL-safe, lowercase, no umlauts — e.g. 'oesterreich'. */
  slug: string;
  /** Localized country name — country names are NOT the same string across locales (unlike city names). */
  name: LocalizedProse;
  /** The city used as the headline distance anchor (e.g. 'Wien', 'Zürich'). */
  referenceCity: string;
  /**
   * Straight-line Stuttgart → `referenceCity`, km. General-knowledge
   * approximation, same discipline as the smaller/less-precisely-sourced
   * entries in `docs/SEO-CITY-STRATEGY.md` — verify via luftlinie.org before
   * publishing an exact number on the live site.
   */
  distanceKm: number;
  /**
   * `true` for exactly one entry (Österreich). Drives "bereits gespielt in"
   * vs. "buchbar in" wording — see the file-level doc comment.
   */
  verified: boolean;
  verifiedCity?: string;
  /** Gates the diaspora section's emphasis — kept explicit per country rather than assumed. */
  turkishDiaspora: boolean;
  kurdishDiaspora: boolean;
  /** Why this country, in this couple's own words — never a template with the name swapped. */
  intro: LocalizedProse;
  /** Travel logistics from Stuttgart and how it's quoted (see `messages.packages.note`: itemised, not padded). */
  logistics: LocalizedProse;
  /** What changes abroad: equipment shipped vs. rented locally, power standard, venue noise rules. */
  whatChanges: LocalizedProse;
  /** The Turkish/Kurdish diaspora angle — the genuine, honest advantage abroad. */
  diaspora: LocalizedProse;
  /** Explicit hosting-language honesty note — DE/TR/EN only, every time, no exceptions. */
  languagesNote: LocalizedProse;
  /** 2–3 country-specific FAQ pairs. Does not duplicate the shared FAQ on /ablauf or the hub's own FAQ. */
  faq: RegionFaqEntry[];
}

/** Resolves a `LocalizedProse` field for one locale — WITHOUT falling back to German. */
export function resolveLocalized(text: LocalizedProse | undefined, locale: Locale): string | undefined {
  return text?.[locale];
}

/**
 * Locales this module is currently ALLOWED to render, independent of how
 * much real prose is written below.
 *
 * ⚠️ Deliberately capped at `['de', 'en']` for now — NOT `['de', 'en', 'tr']`
 * / `[…, 'fr']` — even though full German, English, Turkish (and French for
 * Frankreich/Belgien) prose is already written for every country. Reason:
 * the UI chrome for this route family (`regions.*` in `messages/*.json`) has
 * only been added to `de.json`/`en.json` so far — `tr.json`, `ku.json`,
 * `fr.json` and `es.json` don't have the namespace yet (pending the
 * orchestrator's translator sync pass, see docs/SEO-EUROPE-STRATEGY.md).
 * `useTranslations('regions...')` throws on a missing namespace, and
 * `generateStaticParams` would otherwise happily declare `{ locale: 'tr',
 * land: 'oesterreich' }` as a param to prerender — which would break `next
 * build`, not just render untranslated. Unlike `city.*` (already present in
 * all six locale files before per-city prose was added), `regions.*` is a
 * brand-new namespace, so there is no existing safety net to lean on here.
 *
 * ✅ ERLEDIGT (August 2026): Der Übersetzungs-Sync ist durch. Der `regions`-
 * Namespace liegt inzwischen in ALLEN acht Sprachdateien vollständig vor
 * (`regions.hub` und `regions.country` je 8 bzw. 12 Schlüssel, nachgeprüft).
 * Damit ist die oben beschriebene Sperre gegenstandslos geworden — sie hat
 * aber weiter gegriffen und die fertig geschriebene türkische Prosa aller
 * fünf Länder sowie die französische für Frankreich und Belgien
 * unveröffentlicht gehalten.
 *
 * `tr` ist hier die teuerste Auslassung gewesen, nicht irgendeine: Die
 * türkischsprachige Zielgruppe ist laut .claude/BRAND-FACTS.md der Kernmarkt,
 * und Zürich, Basel und Straßburg liegen näher an Stuttgart als manche
 * deutsche Großstadt.
 *
 * Die eigentliche Inhaltsprüfung macht ohnehin `hasRegionProse()` weiter
 * unten — ein Land ohne echte Prosa in einer Sprache fällt dort heraus,
 * unabhängig davon, was hier steht. Diese Liste sagt nur noch, welche
 * Sprachen überhaupt in Frage kommen.
 */
const BASE_SUPPORTED_LOCALES: readonly Locale[] = ['de', 'en', 'tr'];

/**
 * For the hub page (`/hochzeits-dj-europa/page.tsx`), which has no
 * per-country locale set of its own to derive readiness from — it guards
 * itself with `if (!HUB_SUPPORTED_LOCALES.includes(locale)) notFound();`
 * before calling `useTranslations('regions.hub')`, same reasoning as
 * `BASE_SUPPORTED_LOCALES` above. Includes `nl`: `messages/nl.json`'s
 * `regions.hub.*` block is complete (verified directly), and the hub itself
 * has no per-country content gate to worry about.
 *
 * `tr` und `fr` sind im August 2026 dazugekommen — beide haben den
 * vollständigen `regions.hub`-Block, und beide haben ab jetzt auch
 * Länderseiten, auf die der Hub verlinken kann (tr: alle fünf, fr:
 * Frankreich und Belgien). Ein Hub ohne Ziele wäre eine leere Seite; das
 * ist der Grund, warum diese Liste nicht einfach alle acht Sprachen führt.
 */
export const HUB_SUPPORTED_LOCALES: readonly Locale[] = ['de', 'en', 'nl', 'tr', 'fr'];

/** True if `region` has real, complete prose (all six prose fields + full FAQ) for `locale`. */
export function hasRegionProse(region: Region, locale: Locale): boolean {
  if (locale === 'de') return true; // mandatory — every listed country has German prose.
  const proseFields: LocalizedProse[] = [
    region.intro,
    region.logistics,
    region.whatChanges,
    region.diaspora,
    region.languagesNote,
  ];
  const hasProse = proseFields.every((field) => Boolean(field[locale]));
  const hasFaq = region.faq.length > 0 && region.faq.every((f) => Boolean(f.question[locale] && f.answer[locale]));
  return hasProse && hasFaq;
}

/**
 * Per-country candidate locale sets — MESSAGE-FILE readiness, not content
 * readiness (content readiness is `hasRegionProse`'s job, applied below).
 *
 *  - `de`, `en`, `tr`: überall (via `BASE_SUPPORTED_LOCALES`). Türkisch kam
 *    im August 2026 dazu, nachdem der Übersetzungs-Sync alle acht
 *    Sprachdateien mit dem vollständigen `regions`-Namespace versorgt hatte;
 *    die türkische Prosa lag für alle fünf Länder längst geschrieben vor.
 *  - `nl`: nur `niederlande` und `belgien` — dort und nur dort existiert
 *    niederländische Prosa (Niederlande + Flandern, siehe
 *    `src/i18n/routing.ts`).
 *  - `fr`: `frankreich` und `belgien` — die beiden Länder mit französischer
 *    Prosa (Frankreich selbst und die Wallonie). Für Frankreich ist das
 *    zugleich die einzige Sprache, in der die Zielgruppe dort tatsächlich
 *    sucht; Straßburg liegt rund 110 km von Stuttgart.
 *  - `ku`, `es`, `ar`: weiterhin nirgends. Der Namespace ist zwar da, die
 *    Prosa in diesem File ist es nicht — `hasRegionProse()` würde sie
 *    ohnehin herausfiltern, sie hier zu führen wäre nur irreführend.
 */
const CANDIDATE_LOCALES_BY_SLUG: Record<string, readonly Locale[]> = {
  oesterreich: BASE_SUPPORTED_LOCALES,
  schweiz: BASE_SUPPORTED_LOCALES,
  niederlande: ['de', 'en', 'nl', 'tr'],
  belgien: ['de', 'en', 'nl', 'tr', 'fr'],
  frankreich: ['de', 'en', 'tr', 'fr'],
};

export function getReadyLocalesForRegion(region: Region): Locale[] {
  const candidates = CANDIDATE_LOCALES_BY_SLUG[region.slug] ?? BASE_SUPPORTED_LOCALES;
  return candidates.filter((locale) => hasRegionProse(region, locale));
}

/**
 * The five country pages the brief asks for — quality over coverage. The
 * remaining seven entries in `site.europeCountries` (Luxemburg, Italien,
 * Spanien, Dänemark, Schweden, Norwegen, Vereinigtes Königreich) stay
 * "buchbar" chips on the homepage (`home.serviceAreas`) and are reachable via
 * `/anfrage` — they do not get dedicated pages until real substance (a
 * booking, a specific diaspora hook, a client-confirmed travel radius)
 * exists for one of them. See docs/SEO-EUROPE-STRATEGY.md §"why five, not
 * twelve".
 */
export const allRegionEntries: Region[] = [
  {
    slug: 'oesterreich',
    name: { de: 'Österreich', en: 'Austria', tr: 'Avusturya' },
    referenceCity: 'Wien',
    distanceKm: 500,
    verified: true,
    verifiedCity: 'Wien',
    turkishDiaspora: true,
    kurdishDiaspora: false,
    intro: {
      de: 'Wien ist der einzige Ort außerhalb Deutschlands, an dem DJ Veys bereits nachweislich gespielt hat – zu sehen im Instagram-Highlight „Viyana“. Österreich ist damit kein theoretisches „wir kommen überallhin“, sondern ein belegter Auftritt, der zeigt, dass Anreise, Technik-Transport und ein voller Abend im Ausland zuverlässig funktionieren.',
      en: "Vienna is the only place outside Germany where DJ Veys has a confirmed, verifiable booking — visible in the Instagram highlight 'Viyana'. Austria isn't a theoretical 'we travel anywhere' claim; it's proof that travel, equipment transport and a full night abroad already work in practice.",
      tr: "Viyana, DJ Veys'in Almanya dışında kanıtlanmış şekilde çaldığı tek yer — Instagram'daki 'Viyana' öne çıkanında görülebilir. Avusturya bu yüzden teorik bir 'her yere geliriz' vaadi değil; ulaşımın, ekipman taşımasının ve yurt dışında dolu bir gecenin gerçekten işlediğinin kanıtı.",
    },
    logistics: {
      de: 'Die Luftlinie Stuttgart–Wien liegt bei rund 500 Kilometern. Anders als bei den Städten im Kernradius ist die Anfahrt hier grundsätzlich nicht inklusive: Fahrtstrecke, gegebenenfalls ein Flug für Technik-Leichtgepäck und mindestens eine Übernachtung werden im individuellen Angebot einzeln und nachvollziehbar ausgewiesen – exakt so, wie es bereits für Ziele außerhalb des 50-km-Radius gehandhabt wird, nur mit größeren Posten.',
      en: 'The straight-line distance from Stuttgart to Vienna is roughly 500 km. Unlike the core-radius cities, travel here is never included by default: mileage, potentially a flight for lightweight gear, and at least one overnight stay are itemised individually and transparently in your quote — the same principle already used for anything outside the 50 km zone, just with larger line items.',
      tr: 'Stuttgart–Viyana arası kuş uçuşu mesafe yaklaşık 500 kilometre. Çekirdek bölgedeki şehirlerin aksine burada ulaşım varsayılan olarak dahil değildir: kilometre, gerekirse hafif ekipman için bir uçuş ve en az bir gecelik konaklama, teklifte ayrı ayrı ve şeffaf şekilde gösterilir — 50 km yarıçapının dışındaki her hedef için zaten uygulanan aynı ilke, sadece kalemler daha büyük.',
    },
    whatChanges: {
      de: 'Im Ausland ändert sich mehr als nur die Kilometerzahl. Ob die komplette Technik mitreist oder ein Teil vor Ort gemietet wird, hängt vom Veranstaltungsort ab und wird vorab geklärt – Österreich nutzt wie Deutschland Schuko-Steckdosen und 230V/50Hz, technisch also der unkomplizierteste Fall unter den fünf Ländern. Lautstärke- und Sperrstundenregelungen unterscheiden sich je nach Location und Bundesland und werden direkt mit dem Veranstaltungsort abgestimmt, nicht pauschal angenommen.',
      en: "Abroad, more changes than just the kilometre count. Whether the full setup travels or part of the equipment is rented locally depends on the venue and is clarified in advance — Austria uses the same Schuko sockets and 230V/50Hz as Germany, technically the simplest of the five countries here. Noise limits and curfew rules vary by venue and federal state and are coordinated directly with the venue, never assumed.",
      tr: "Yurt dışında sadece kilometre sayısı değişmez. Tüm ekipmanın mı taşınacağı yoksa bir kısmının yerinde mi kiralanacağı mekâna bağlıdır ve önceden netleştirilir — Avusturya, Almanya ile aynı Schuko prizlerini ve 230V/50Hz'i kullanır, bu da beş ülke arasında teknik olarak en sorunsuz olanıdır. Ses seviyesi ve saat kısıtlamaları mekâna ve eyalete göre değişir; genellemek yerine doğrudan mekânla netleştirilir.",
    },
    diaspora: {
      de: 'Österreich hat eine der größeren türkischen Communities Europas außerhalb Deutschlands, mit Schwerpunkten in Wien, Graz und Vorarlberg. Genau für diese Zielgruppe – deutsch-türkische und rein türkische Hochzeiten, oft mit Gästen aus beiden Ländern – ist ein DJ gefragt, der Halay genauso sicher spielt wie einen klassischen Discofox, und der auf Deutsch, Türkisch und Englisch durch den Abend führt.',
      en: "Austria has one of the larger Turkish communities in Europe outside Germany, concentrated around Vienna, Graz and Vorarlberg. That's exactly the audience this fits — German-Turkish and purely Turkish weddings, often with guests from both countries — where a DJ who plays Halay as confidently as a classic waltz, and hosts in German, Turkish and English, is genuinely in demand.",
      tr: "Avusturya, Almanya dışında Avrupa'nın en büyük Türk topluluklarından birine ev sahipliği yapıyor; ağırlıklı olarak Viyana, Graz ve Vorarlberg'de. Tam olarak bu kitle için — genellikle her iki ülkeden davetlilerin bulunduğu Alman-Türk ve tamamen Türk düğünleri — halayı klasik bir vals kadar özgüvenle çalan ve akşamı Almanca, Türkçe ve İngilizce yöneten bir DJ gerçekten aranıyor.",
    },
    languagesNote: {
      de: 'Live moderiert wird ausschließlich auf Deutsch, Türkisch und Englisch – das gilt für Österreich genauso wie für Stuttgart. Für ein rein deutschsprachiges Fest in Wien ändert das nichts; für eine deutsch-türkische Feier ist es meist genau die Kombination, nach der gesucht wird.',
      en: "Live hosting is German, Turkish and English only — the same in Austria as in Stuttgart. For a purely German-speaking celebration in Vienna, that changes nothing; for a German-Turkish one, it's usually exactly the combination people are looking for.",
      tr: "Canlı sunum yalnızca Almanca, Türkçe ve İngilizce yapılır — bu, Stuttgart'ta olduğu gibi Avusturya için de geçerli. Viyana'da tamamen Almanca bir kutlama için bu bir şey değiştirmez; Alman-Türk bir kutlama içinse genellikle tam da aranan kombinasyon budur.",
    },
    faq: [
      {
        question: {
          de: 'Haben Sie schon einmal in Österreich gespielt?',
          en: 'Have you played in Austria before?',
          tr: 'Daha önce Avusturya’da çaldınız mı?',
        },
        answer: {
          de: 'Ja, in Wien – der einzige nachweisliche Auftritt außerhalb Deutschlands, dokumentiert im Instagram-Highlight „Viyana“. Für andere österreichische Städte gilt: buchbar, aber noch nicht mit einem eigenen Referenz-Event belegt.',
          en: "Yes, in Vienna — the only verifiable booking outside Germany, documented in the Instagram highlight 'Viyana'. For other Austrian cities: available to book, just not yet backed by a dedicated reference event.",
          tr: "Evet, Viyana'da — Almanya dışındaki tek kanıtlanmış rezervasyon, Instagram'daki 'Viyana' öne çıkanında belgelenmiş. Diğer Avusturya şehirleri için: rezervasyona açık, ancak henüz kendine ait bir referans etkinlikle desteklenmiyor.",
        },
      },
      {
        question: {
          de: 'Was kostet eine Hochzeit in Österreich zusätzlich zum Stuttgarter Angebot?',
          en: 'What does a wedding in Austria cost on top of a Stuttgart quote?',
          tr: 'Avusturya’daki bir düğün, Stuttgart teklifine ek olarak ne kadar tutar?',
        },
        answer: {
          de: 'Anfahrt (bzw. Flug für Technik-Leichtgepäck) und Übernachtung werden im individuellen Angebot als eigene Posten ausgewiesen, transparent und vor Vertragsschluss – keine Überraschung auf der Rechnung.',
          en: 'Travel (or a flight for lightweight gear) and accommodation are itemised as separate line items in your individual quote, transparently and before any contract is signed — no surprises on the invoice.',
          tr: 'Ulaşım (ya da hafif ekipman için uçuş) ve konaklama, size özel teklifte ayrı kalemler olarak, şeffaf şekilde ve sözleşme imzalanmadan önce gösterilir — faturada sürpriz olmaz.',
        },
      },
    ],
  },
  {
    slug: 'schweiz',
    name: { de: 'Schweiz', en: 'Switzerland', tr: 'İsviçre' },
    referenceCity: 'Zürich',
    distanceKm: 200,
    verified: false,
    turkishDiaspora: true,
    kurdishDiaspora: false,
    intro: {
      de: 'Die Schweiz ist geografisch die nächstgelegene Auslandsdestination – und gleichzeitig die einzige der fünf Länder außerhalb der EU und der Eurozone. Das ändert praktische Details (Zoll für mitgeführte Technik, Abrechnung in Franken), nicht aber den Anspruch: derselbe Ablauf, dasselbe Setup, dieselbe dreisprachige Moderation wie in Stuttgart.',
      en: 'Switzerland is geographically the closest destination abroad — and, at the same time, the only one of these five countries outside the EU and the eurozone. That changes a few practical details (customs for equipment crossing the border, billing in francs), not the standard: the same process, the same setup, the same trilingual hosting as in Stuttgart.',
      tr: 'İsviçre coğrafi olarak en yakın yurt dışı hedef — aynı zamanda bu beş ülke arasında AB ve euro bölgesi dışında kalan tek ülke. Bu, bazı pratik ayrıntıları değiştirir (taşınan ekipman için gümrük, frank cinsinden faturalama), ama standardı değiştirmez: Stuttgart’takiyle aynı süreç, aynı kurulum, aynı üç dilli sunum.',
    },
    logistics: {
      de: 'Rund 200 Kilometer Luftlinie trennen Stuttgart von Zürich – oft an einem Tag machbar, ohne zwingende Übernachtung, was die Anfahrtskosten gegenüber weiter entfernten Zielen spürbar senkt. Trotzdem wird auch hier die Fahrtstrecke im individuellen Angebot offen ausgewiesen, inklusive eines Hinweises, falls für den Grenzübertritt der mitgeführten Technik zusätzliche Zeit eingeplant werden muss.',
      en: 'About 200 km of straight-line distance separates Stuttgart from Zürich — often manageable in a single day without a mandatory overnight stay, which noticeably lowers travel costs compared to further destinations. Even so, the distance is itemised openly in your individual quote, including a note if extra time needs to be planned for equipment crossing the border.',
      tr: 'Stuttgart ile Zürih arasında kuş uçuşu yaklaşık 200 kilometre var — genellikle tek günde, zorunlu bir gecelemeye gerek kalmadan halledilebilir; bu da daha uzak hedeflere kıyasla ulaşım maliyetini belirgin şekilde düşürür. Yine de mesafe teklifte açıkça belirtilir; ekipmanın sınırdan geçişi için ek zaman gerekirse bu da ayrıca not edilir.',
    },
    whatChanges: {
      de: 'Die Schweiz nutzt einen eigenen Steckertyp (Typ J) und teils andere Vorschriften für Veranstaltungstechnik als Deutschland – ob ein Adapter reicht oder Teile der Anlage vor Ort geliehen werden, wird vorab mit der Location geklärt. Größter praktischer Unterschied zu den EU-Ländern in dieser Übersicht: Die Schweiz liegt außerhalb der EU-Zollunion, mitgeführte Technik wird deshalb über ein ATA-Carnet (internationales Zolldokument für vorübergehend ausgeführte Berufsausrüstung) verzollt – ein bekanntes, planbares Verfahren, kein Hindernis, aber ein zusätzlicher Vorbereitungsschritt. Lautstärkeauflagen sind in vielen Schweizer Gemeinden strenger reguliert als in Baden-Württemberg, insbesondere bei Freiluft-Feiern; das wird nicht pauschal angenommen, sondern direkt mit dem Veranstaltungsort abgestimmt.',
      en: "Switzerland uses its own plug standard (Type J) and, in places, different regulations for event equipment than Germany — whether an adapter is enough or part of the setup needs to be rented locally is clarified with the venue in advance. The biggest practical difference from the EU countries in this overview: Switzerland sits outside the EU customs union, so equipment travelling across the border is cleared via an ATA Carnet (the international customs document for temporarily exported professional equipment) — a well-established, plannable process, not an obstacle, just an extra preparation step. Noise limits in many Swiss municipalities are stricter than in Baden-Württemberg, especially for outdoor celebrations; that's never assumed, only coordinated directly with the venue.",
      tr: 'İsviçre, Almanya’dan farklı bir priz standardı kullanır (Tip J) ve etkinlik ekipmanına dair kimi zaman farklı kurallar geçerlidir — bir adaptörün yeterli olup olmayacağı ya da kurulumun bir kısmının yerinde kiralanması gerekip gerekmediği önceden mekânla netleştirilir. Bu genel bakıştaki AB ülkelerinden en büyük pratik fark: İsviçre, AB gümrük birliğinin dışında yer alır, bu yüzden taşınan ekipman bir ATA Karnesi (geçici olarak ihraç edilen mesleki ekipman için uluslararası gümrük belgesi) ile gümrükten geçirilir — bilinen, planlanabilir bir süreç, bir engel değil, sadece ek bir hazırlık adımı. Birçok İsviçre belediyesinde ses seviyesi kısıtlamaları, özellikle açık hava kutlamalarında, Baden-Württemberg’e göre daha sıkı olabilir; bu asla varsayılmaz, doğrudan mekânla netleştirilir.',
    },
    diaspora: {
      de: 'Auch die Schweiz hat, insbesondere im Raum Zürich und Basel, eine gewachsene türkische Community. Für deutsch-türkische Paare mit Familie diesseits und jenseits der Grenze ist ein Anbieter attraktiv, der beide Sprachen und beide Feierkulturen gleichermaßen sicher bedient – ohne dass die Schweizer Seite der Familie sich mit einem rein türkischen Programm oder die türkische Seite mit einem rein deutschen Programm abfinden muss.',
      en: 'Switzerland also has a well-established Turkish community, particularly around Zürich and Basel. For German-Turkish couples with family on both sides of the border, a provider who handles both languages and both celebration styles equally confidently is genuinely appealing — neither side of the family has to settle for a programme built around only one culture.',
      tr: 'İsviçre’de de, özellikle Zürih ve Basel çevresinde, köklü bir Türk topluluğu var. Sınırın iki tarafında da ailesi olan Alman-Türk çiftler için, her iki dili ve her iki kutlama kültürünü de aynı özgüvenle sunan bir sağlayıcı gerçekten cazip — ailenin İsviçre tarafının sadece Türkçe, Türk tarafının sadece Almanca bir programa razı olması gerekmiyor.',
    },
    languagesNote: {
      de: 'Moderiert wird live auf Deutsch, Türkisch und Englisch. Für die Deutschschweiz passt das direkt; für die französisch- oder italienischsprachige Schweiz ist das offen zu sagen: Live-Moderation auf Französisch oder Italienisch bieten wir nicht an.',
      en: "Live hosting is in German, Turkish and English. That fits German-speaking Switzerland directly; for French- or Italian-speaking Switzerland, we're upfront: we don't offer live hosting in French or Italian.",
      tr: 'Canlı sunum Almanca, Türkçe ve İngilizce yapılır. Bu, Almanca konuşulan İsviçre bölgeleri için doğrudan uygundur; Fransızca veya İtalyanca konuşulan İsviçre bölgeleri için açıkça belirtmek gerekir: Fransızca veya İtalyanca canlı sunum sunmuyoruz.',
    },
    faq: [
      {
        question: {
          de: 'Ist die Schweiz trotz Nicht-EU-Land problemlos buchbar?',
          en: 'Is Switzerland straightforward to book despite not being an EU country?',
          tr: 'İsviçre, AB üyesi olmamasına rağmen sorunsuz rezerve edilebiliyor mu?',
        },
        answer: {
          de: 'Ja. Der Ablauf ist derselbe wie bei jeder anderen Auslandsanfrage – Anfahrt, Zoll für die Technik und Übernachtung (falls nötig) werden im Angebot einzeln ausgewiesen, bevor Sie sich festlegen.',
          en: 'Yes. The process is the same as any other international enquiry — travel, customs for the equipment and accommodation (if needed) are itemised in the quote before you commit.',
          tr: 'Evet. Süreç diğer her yurt dışı talebiyle aynı — ulaşım, ekipman için gümrük ve gerekiyorsa konaklama, siz karar vermeden önce teklifte ayrı ayrı gösterilir.',
        },
      },
      {
        question: {
          de: 'Spielen Sie auch in der französisch- oder italienischsprachigen Schweiz?',
          en: 'Do you also play in French- or Italian-speaking Switzerland?',
          tr: 'Fransızca veya İtalyanca konuşulan İsviçre bölgelerinde de çalıyor musunuz?',
        },
        answer: {
          de: 'Musikalisch ja, moderiert wird dort aber weiterhin auf Deutsch, Türkisch und Englisch – nicht auf Französisch oder Italienisch. Bitte vorab abklären, ob das für Ihre Feier passt.',
          en: "Musically, yes — but hosting there is still in German, Turkish and English, not French or Italian. Please confirm in advance whether that fits your celebration.",
          tr: 'Müzik açısından evet — ancak orada da sunum Almanca, Türkçe ve İngilizce yapılır, Fransızca veya İtalyanca değil. Bunun kutlamanıza uygun olup olmadığını lütfen önceden netleştirin.',
        },
      },
    ],
  },
  {
    slug: 'niederlande',
    // `nl` (Dutch) prose added below now that `src/i18n/routing.ts` ships a
    // real `nl` locale ("Niederlande und Flandern (Belgien)") with the
    // `regions` namespace already synced into `messages/nl.json` — see this
    // agent's final report for the native-review flag (same discipline as
    // the `tr`/`fr` copy elsewhere in this file).
    name: { de: 'Niederlande', en: 'Netherlands', tr: 'Hollanda', nl: 'Nederland' },
    referenceCity: 'Amsterdam',
    distanceKm: 500,
    verified: false,
    turkishDiaspora: true,
    kurdishDiaspora: true,
    intro: {
      de: 'Die Niederlande sind für viele DJs aus Deutschland Neuland – für deutsch-türkische und türkische Communities dagegen sehr vertrautes Feld: In Städten wie Rotterdam, Den Haag und Amsterdam leben seit Jahrzehnten große türkische und kurdische Communities. Genau in diesem Umfeld ist ein Anbieter gefragt, der Halay und internationale Popmusik gleichermaßen sicher mixt und auf Deutsch, Türkisch und Englisch führt.',
      en: "The Netherlands are unfamiliar ground for many Germany-based DJs — for German-Turkish and Turkish communities, though, it's very familiar territory: cities like Rotterdam, The Hague and Amsterdam have had large Turkish and Kurdish communities for decades. That's exactly the setting where a provider who mixes Halay and international pop with equal confidence, and hosts in German, Turkish and English, is in demand.",
      tr: 'Hollanda, Almanya merkezli birçok DJ için yabancı bir bölge — Alman-Türk ve Türk toplulukları içinse çok tanıdık bir alan: Rotterdam, Lahey ve Amsterdam gibi şehirlerde on yıllardır büyük Türk ve Kürt toplulukları yaşıyor. Tam olarak bu ortamda, halayı ve uluslararası pop müziği aynı özgüvenle çalan, Almanca, Türkçe ve İngilizce sunum yapan bir sağlayıcıya ihtiyaç var.',
      nl: "Nederland is voor veel dj's uit Duitsland onbekend terrein – voor Duits-Turkse en Turkse gemeenschappen juist heel vertrouwd gebied: in steden als Rotterdam, Den Haag en Amsterdam wonen al decennialang grote Turkse en Koerdische gemeenschappen. Precies in die omgeving is een aanbieder gevraagd die halay en internationale popmuziek even zeker mixt en presenteert in het Duits, Turks en Engels.",
    },
    logistics: {
      de: 'Die Luftlinie Stuttgart–Amsterdam liegt bei rund 500 Kilometern – vergleichbar mit Wien, nur in die andere Richtung. Anfahrt (meist mit dem Transporter für die komplette Technik), mindestens eine Übernachtung und gegebenenfalls Mautkosten für die Fahrtstrecke werden im individuellen Angebot einzeln ausgewiesen.',
      en: 'The straight-line distance from Stuttgart to Amsterdam is roughly 500 km — comparable to Vienna, just in the opposite direction. Travel (usually by van for the full equipment setup), at least one overnight stay, and any toll costs along the route are itemised individually in your quote.',
      tr: 'Stuttgart–Amsterdam arası kuş uçuşu yaklaşık 500 kilometre — yön farklı olsa da Viyana ile kıyaslanabilir bir mesafe. Ulaşım (genellikle tüm ekipman için bir araçla), en az bir gecelik konaklama ve güzergâh üzerindeki olası geçiş ücretleri, teklifte ayrı ayrı gösterilir.',
      nl: 'De afstand hemelsbreed tussen Stuttgart en Amsterdam is ongeveer 500 kilometer – vergelijkbaar met Wenen, maar dan de andere kant op. Reis (meestal met een busje voor de volledige apparatuur), minstens één overnachting en eventuele tolkosten onderweg worden apart vermeld in de persoonlijke offerte.',
    },
    whatChanges: {
      de: 'Die Niederlande nutzen wie Deutschland Schuko-kompatible Steckdosen und 230V/50Hz, technisch also unkompliziert. Größere Unterschiede gibt es bei den Lärmschutzauflagen: Viele niederländische Locations und Gemeinden regeln Enddauer und Maximalpegel strenger und genauer als in Baden-Württemberg üblich – das wird vorab direkt mit der Location geklärt, nicht angenommen.',
      en: "The Netherlands use Schuko-compatible sockets and 230V/50Hz like Germany, so technically it's straightforward. The bigger differences are in noise regulations: many Dutch venues and municipalities set stricter, more precisely defined end times and volume caps than is typical in Baden-Württemberg — that's clarified directly with the venue in advance, never assumed.",
      tr: 'Hollanda, Almanya gibi Schuko uyumlu prizler ve 230V/50Hz kullanır, yani teknik olarak sorunsuzdur. Daha büyük farklar gürültü kurallarında ortaya çıkar: birçok Hollanda mekânı ve belediyesi, Baden-Württemberg’de alışılandan daha sıkı ve net bitiş saatleri ile ses seviyesi sınırları belirler — bu varsayılmaz, önceden doğrudan mekânla netleştirilir.',
      nl: 'Nederland gebruikt, net als Duitsland, Schuko-compatibele stopcontacten en 230V/50Hz, technisch dus geen probleem. De grotere verschillen zitten in de geluidsvoorschriften: veel Nederlandse locaties en gemeenten hanteren strengere, preciezer omschreven eindtijden en maximale geluidsniveaus dan in Baden-Württemberg gebruikelijk is – dat wordt vooraf altijd rechtstreeks met de locatie afgestemd, nooit zomaar aangenomen.',
    },
    diaspora: {
      de: 'Die türkische und kurdische Community in den Niederlanden zählt zu den größeren in Westeuropa, mit langer Geschichte in Städten wie Rotterdam und Den Haag. Zweisprachig – oder mit kurdischen Programmpunkten dreisprachig – moderierte Hochzeiten sind hier keine Ausnahme, sondern eine reale Nachfrage, die viele lokale Anbieter nicht abdecken.',
      en: "The Turkish and Kurdish community in the Netherlands is among the larger ones in Western Europe, with a long history in cities like Rotterdam and The Hague. Bilingual — or, with Kurdish elements, trilingual — hosted weddings aren't the exception here; they're real demand that many local providers don't cover.",
      tr: 'Hollanda’daki Türk ve Kürt topluluğu, Batı Avrupa’nın daha büyük topluluklarından biri; Rotterdam ve Lahey gibi şehirlerde uzun bir geçmişe sahip. İki dilli — ya da Kürtçe unsurlarla üç dilli — sunulan düğünler burada istisna değil; birçok yerel sağlayıcının karşılamadığı gerçek bir talep.',
      nl: 'De Turkse en Koerdische gemeenschap in Nederland behoort tot de grotere in West-Europa, met een lange geschiedenis in steden als Rotterdam en Den Haag. Tweetalig – of met Koerdische elementen drietalig – gepresenteerde bruiloften zijn hier geen uitzondering, maar een reële vraag die veel lokale aanbieders niet dekken.',
    },
    languagesNote: {
      de: 'Live moderiert wird auf Deutsch, Türkisch und Englisch – Niederländisch gehört nicht dazu. Diese Seite gibt es auf Deutsch, Englisch und Türkisch, damit Paare aus den Niederlanden lesen und anfragen können; ein niederländischsprachiges Publikum sollte auf der Feier selbst keine niederländische Moderation erwarten.',
      en: "Live hosting is in German, Turkish and English — Dutch is not among them. This page exists in German, English and Turkish so couples from the Netherlands can read it and get in touch; a Dutch-speaking audience shouldn't expect Dutch hosting on the night itself.",
      tr: 'Canlı sunum Almanca, Türkçe ve İngilizce yapılır — Felemenkçe bunların arasında değil. Bu sayfa, Hollanda’dan çiftlerin okuyup iletişime geçebilmesi için Almanca, İngilizce ve Türkçe olarak sunuluyor; Felemenkçe konuşan bir davetli kitlesi, gece boyunca Felemenkçe sunum beklememeli.',
      nl: 'Live wordt er gepresenteerd in het Duits, Turks en Engels – Nederlands hoort daar niet bij. Deze pagina bestaat wél in het Nederlands, zodat u comfortabel kunt lezen en aanvragen; op de avond zelf moet u geen Nederlandstalige presentatie verwachten.',
    },
    faq: [
      {
        question: {
          de: 'Moderieren Sie auch auf Niederländisch?',
          en: 'Do you also host in Dutch?',
          tr: 'Felemenkçe sunum da yapıyor musunuz?',
          nl: 'Presenteert u ook in het Nederlands?',
        },
        answer: {
          de: 'Nein. Live moderiert wird auf Deutsch, Türkisch und Englisch. Diese Seite ist auf Deutsch, Englisch und Türkisch verfügbar, damit Sie anfragen können – die Moderation selbst bleibt bei den drei genannten Sprachen.',
          en: "No. Live hosting is in German, Turkish and English. This page is available in German, English and Turkish so you can get in touch — hosting itself stays within those three languages.",
          tr: 'Hayır. Canlı sunum Almanca, Türkçe ve İngilizce yapılır. Bu sayfa iletişime geçebilmeniz için Almanca, İngilizce ve Türkçe olarak sunuluyor — sunumun kendisi bu üç dille sınırlı kalır.',
          nl: 'Nee. Live wordt er gepresenteerd in het Duits, Turks en Engels. Deze pagina is beschikbaar in het Nederlands zodat u kunt lezen en aanvragen – de presentatie zelf blijft bij die drie talen.',
        },
      },
      {
        question: {
          de: 'Wie läuft der Techniktransport in die Niederlande ab?',
          en: 'How does equipment transport to the Netherlands work?',
          tr: 'Hollanda’ya ekipman taşıması nasıl işliyor?',
          nl: 'Hoe verloopt het techniektransport naar Nederland?',
        },
        answer: {
          de: 'Die komplette Technik reist in der Regel im eigenen Transporter mit. Details zu Auf- und Abbauzeiten und Stromanschluss werden im Vorgespräch mit Ihnen und der Location geklärt.',
          en: "The full equipment setup usually travels by van. Details on setup/teardown times and power supply are clarified in the planning call with you and the venue.",
          tr: 'Tüm ekipman genellikle bir araçla taşınır. Kurulum/toplama saatleri ve elektrik bağlantısına dair ayrıntılar, sizinle ve mekânla yapılan ön görüşmede netleştirilir.',
          nl: 'De volledige apparatuur reist meestal mee in een busje. Details over op- en afbouwtijden en stroomvoorziening worden besproken tijdens het planningsgesprek met u en de locatie.',
        },
      },
    ],
  },
  {
    slug: 'belgien',
    // `nl` covers Flanders here (per routing.ts: "nl — Niederlande und
    // Flandern (Belgien)"), `fr` covers Wallonia — same "written-language
    // reach ≠ hosting language" split already established for Frankreich.
    // `fr` is not yet enabled site-wide (see `getReadyLocalesForRegion`
    // above), but the prose stays ready for when it is.
    name: { de: 'Belgien', en: 'Belgium', tr: 'Belçika', fr: 'Belgique', nl: 'België' },
    referenceCity: 'Brüssel',
    distanceKm: 430,
    verified: false,
    turkishDiaspora: true,
    kurdishDiaspora: true,
    intro: {
      de: 'Belgien ist zweigeteilt – niederländischsprachig im Norden (Flandern), französischsprachig im Süden (Wallonien) – und ist zugleich, in Brüssel, das institutionelle Herz der EU. Für deutsch-türkische und türkische Communities ist vor allem der Großraum Brüssel und Antwerpen relevant, mit einer langen, gewachsenen Geschichte.',
      en: "Belgium is split in two — Dutch-speaking in the north (Flanders), French-speaking in the south (Wallonia) — and is also home, in Brussels, to the EU's institutional heart. For German-Turkish and Turkish communities, the greater Brussels and Antwerp areas are the most relevant, with a long, well-established history.",
      tr: 'Belçika ikiye bölünmüş bir ülke — kuzeyde Felemenkçe konuşulan Flandre, güneyde Fransızca konuşulan Valonya — ve aynı zamanda Brüksel’de AB’nin kurumsal merkezine ev sahipliği yapıyor. Alman-Türk ve Türk toplulukları için özellikle Brüksel ve Anvers çevresi, uzun ve köklü bir geçmişle öne çıkıyor.',
      fr: "La Belgique est un pays à deux visages — néerlandophone au nord (Flandre), francophone au sud (Wallonie) — et abrite, à Bruxelles, le cœur institutionnel de l'UE. Pour les communautés germano-turques et turques, ce sont surtout les régions de Bruxelles et d'Anvers qui comptent, avec une histoire longue et bien établie.",
      nl: 'België kent twee gezichten – Nederlandstalig in het noorden (Vlaanderen), Franstalig in het zuiden (Wallonië) – en is met Brussel ook het institutionele hart van de EU. Voor Duits-Turkse en Turkse gemeenschappen zijn vooral de regio’s Brussel en Antwerpen relevant, met een lange, gevestigde geschiedenis.',
    },
    logistics: {
      de: 'Rund 430 Kilometer Luftlinie liegen zwischen Stuttgart und Brüssel – die Fahrtstrecke führt größtenteils durch Deutschland und einen kurzen Abschnitt durch Belgien selbst. Anfahrt mit Transporter, Übernachtung und – bei größeren Feiern – ein zusätzlicher Auf-/Abbautag werden im Angebot transparent kalkuliert.',
      en: 'About 430 km of straight-line distance separates Stuttgart and Brussels — the route runs mostly through Germany with a short stretch through Belgium itself. Travel by van, an overnight stay, and — for larger celebrations — an extra setup/teardown day are calculated transparently in the quote.',
      tr: 'Stuttgart ile Brüksel arasında kuş uçuşu yaklaşık 430 kilometre var — güzergâhın büyük kısmı Almanya’dan, kısa bir bölümü ise Belçika’nın kendisinden geçiyor. Araçla ulaşım, gecelik konaklama ve — büyük kutlamalarda — ek bir kurulum/toplama günü, teklifte şeffaf şekilde hesaplanır.',
      fr: "Environ 430 kilomètres à vol d'oiseau séparent Stuttgart de Bruxelles — le trajet passe majoritairement par l'Allemagne, avec un court tronçon en Belgique même. Le déplacement en camionnette, la nuitée et, pour les grandes réceptions, une journée supplémentaire de montage/démontage sont calculés de façon transparente dans le devis.",
      nl: 'Ongeveer 430 kilometer hemelsbreed scheidt Stuttgart van Brussel – de route loopt grotendeels door Duitsland, met een kort stuk door België zelf. Reis met een busje, een overnachting en, bij grotere feesten, een extra dag voor op- en afbouw worden transparant berekend in de offerte.',
    },
    whatChanges: {
      de: 'Belgien nutzt, wie Deutschland, Schuko-Steckdosen und 230V/50Hz – technisch der unkomplizierte Fall. Lautstärkeauflagen und Sperrstunden unterscheiden sich stark zwischen Region, Gemeinde und Location-Typ (Saal, Schloss, Eventhalle); das wird für jede Feier einzeln mit dem Veranstaltungsort geklärt, nicht pauschal vorausgesetzt.',
      en: "Belgium uses Schuko sockets and 230V/50Hz like Germany — technically the straightforward case. Noise limits and curfews vary a lot by region, municipality and venue type (hall, château, event space); that's clarified individually for each celebration directly with the venue, never assumed as a blanket rule.",
      tr: 'Belçika, Almanya gibi Schuko prizleri ve 230V/50Hz kullanır — teknik açıdan sorunsuz bir durum. Ses seviyesi kısıtlamaları ve saat sınırlamaları bölgeye, belediyeye ve mekân tipine (salon, şato, etkinlik alanı) göre büyük ölçüde değişir; bu her kutlama için ayrı ayrı, doğrudan mekânla netleştirilir, genellenmez.',
      fr: "La Belgique utilise, comme l'Allemagne, des prises Schuko et le 230V/50Hz — techniquement le cas le plus simple. Les limites de volume sonore et les heures de couvre-feu varient fortement selon la région, la commune et le type de lieu (salle, château, espace événementiel) ; cela est clarifié individuellement pour chaque réception directement avec le lieu, jamais supposé de façon générale.",
      nl: 'België gebruikt, net als Duitsland, Schuko-stopcontacten en 230V/50Hz – technisch het eenvoudige geval. Geluidsvoorschriften en sluitingstijden verschillen sterk per regio, gemeente en type locatie (zaal, kasteel, evenementenhal); dat wordt voor elk feest apart rechtstreeks met de locatie afgestemd, nooit als algemene regel aangenomen.',
    },
    diaspora: {
      de: 'Belgien, insbesondere der Großraum Brüssel, hat eine gewachsene türkische und kurdische Community mit eigenen Vereinen, Sälen und einer langen Feierkultur. Für binationale und rein türkische bzw. kurdische Hochzeiten hier ist ein Anbieter attraktiv, der Halay und westliche Partymusik gleichermaßen kennt – nicht als Zusatzoption, sondern als Grundangebot.',
      en: "Belgium, especially greater Brussels, has a well-established Turkish and Kurdish community with its own associations, halls and a long celebration culture. For binational and purely Turkish or Kurdish weddings here, a provider who knows Halay and Western party music equally well is appealing — not as an add-on, but as the baseline offer.",
      tr: 'Belçika, özellikle Brüksel çevresi, kendi dernekleri, salonları ve uzun bir kutlama kültürüyle köklü bir Türk ve Kürt topluluğuna sahip. Burada iki uluslu ya da tamamen Türk veya Kürt düğünleri için, halayı ve batı parti müziğini aynı derecede iyi bilen bir sağlayıcı cazip — ek seçenek değil, temel teklif olarak.',
      fr: "La Belgique, en particulier la région bruxelloise, compte une communauté turque et kurde bien établie, avec ses propres associations, salles et une longue culture festive. Pour les mariages binationaux ou purement turcs ou kurdes, un prestataire maîtrisant aussi bien le halay que la musique festive occidentale est un vrai atout — pas une option, mais une base.",
      nl: 'België, vooral de regio Brussel, heeft een gevestigde Turkse en Koerdische gemeenschap met eigen verenigingen, zalen en een lange feestcultuur. Voor binationale en volledig Turkse of Koerdische bruiloften hier is een aanbieder aantrekkelijk die halay en westerse feestmuziek even goed kent – niet als extra optie, maar als basis.',
    },
    languagesNote: {
      de: 'Live moderiert wird auf Deutsch, Türkisch und Englisch. Für die deutschsprachige Gemeinschaft Belgiens passt das direkt; für Flandern und Wallonien gilt dieselbe Ehrlichkeit wie fürs Elsass: Diese Seite gibt es auf Niederländisch und Französisch, damit Sie lesen und anfragen können – moderiert wird deshalb aber weder auf Niederländisch noch auf Französisch.',
      en: "Live hosting is in German, Turkish and English. That fits Belgium's German-speaking community directly; for Flanders and Wallonia, the same honesty applies as for Alsace: this page exists in Dutch and French so you can read it and get in touch — but hosting itself is neither in Dutch nor in French.",
      tr: 'Canlı sunum Almanca, Türkçe ve İngilizce yapılır. Bu, Belçika’nın Almanca konuşan topluluğu için doğrudan uygundur; Flandre ve Valonya için de Alsace için geçerli olan aynı dürüstlük geçerlidir: bu sayfa, okuyup iletişime geçebilmeniz için Felemenkçe ve Fransızca olarak da sunuluyor — ama sunum ne Felemenkçe ne de Fransızca yapılıyor.',
      fr: "L'animation en direct se fait en allemand, en turc et en anglais. Cela convient directement à la communauté germanophone de Belgique ; pour la Flandre et la Wallonie, la même transparence que pour l'Alsace s'applique : cette page existe en néerlandais et en français pour que vous puissiez la lire et nous contacter — mais l'animation elle-même ne se fait ni en néerlandais ni en français.",
      nl: 'Live wordt er gepresenteerd in het Duits, Turks en Engels. Voor de Duitstalige gemeenschap van België past dat direct; voor Vlaanderen en Wallonië geldt dezelfde eerlijkheid als voor de Elzas: deze pagina bestaat in het Nederlands en het Frans, zodat u comfortabel kunt lezen en aanvragen – de presentatie zelf is echter noch in het Nederlands, noch in het Frans.',
    },
    faq: [
      {
        question: {
          de: 'Spielen Sie auch in Wallonien, obwohl dort nicht auf Französisch moderiert wird?',
          en: "Do you also play Wallonia, even though hosting isn't in French there?",
          tr: 'Orada sunum Fransızca yapılmasa da Valonya’da çalıyor musunuz?',
          fr: "Jouez-vous aussi en Wallonie, même si l'animation n'y est pas en français ?",
          nl: 'Speelt u ook in Wallonië, ook al wordt daar niet in het Frans gepresenteerd?',
        },
        answer: {
          de: 'Ja. Musik und Ablauf funktionieren unabhängig von der Moderationssprache; für Ansagen und Programmpunkte gilt Deutsch, Türkisch oder Englisch. Das wird vorab klar besprochen, damit es am Feiertag keine Überraschung gibt.',
          en: "Yes. Music and the overall run of the evening work independently of the hosting language; announcements and programme items are in German, Turkish or English. That's discussed clearly in advance, so there's no surprise on the day.",
          tr: 'Evet. Müzik ve akış, sunum dilinden bağımsız işler; anonslar ve program noktaları Almanca, Türkçe veya İngilizce olur. Bu, kutlama gününde sürpriz olmasın diye önceden açıkça konuşulur.',
          fr: "Oui. La musique et le déroulé fonctionnent indépendamment de la langue d'animation ; les annonces et les temps forts se font en allemand, en turc ou en anglais. Cela est clarifié à l'avance, pour qu'il n'y ait aucune surprise le jour J.",
          nl: 'Ja. Muziek en verloop werken onafhankelijk van de presentatietaal; aankondigingen en programmaonderdelen zijn in het Duits, Turks of Engels. Dat wordt vooraf duidelijk besproken, zodat er op de dag zelf geen verrassingen zijn.',
        },
      },
      {
        question: {
          de: 'Wie weit im Voraus sollte ich für Belgien anfragen?',
          en: 'How far in advance should I enquire for Belgium?',
          tr: 'Belçika için ne kadar önceden talepte bulunmalıyım?',
          fr: "Combien de temps à l'avance dois-je faire ma demande pour la Belgique ?",
          nl: 'Hoe ver van tevoren moet ik aanvragen voor België?',
        },
        answer: {
          de: 'Bei Auslandsterminen empfiehlt sich eine frühere Anfrage als für Stuttgart selbst – allein wegen der Reise- und Übernachtungsplanung. Eine erste unverbindliche Anfrage ist jederzeit möglich, auch weit im Voraus.',
          en: "For international dates, enquiring earlier than you would for Stuttgart itself is worthwhile — simply because of travel and accommodation planning. A first, no-obligation enquiry is possible at any time, even far in advance.",
          tr: 'Yurt dışı tarihler için Stuttgart’a göre daha erken talepte bulunmak faydalıdır — sadece seyahat ve konaklama planlaması nedeniyle. İlk, taahhüt gerektirmeyen talep her zaman, hatta çok önceden bile mümkündür.',
          fr: "Pour une date à l'étranger, il est utile de faire sa demande plus tôt que pour Stuttgart même — ne serait-ce que pour planifier le déplacement et l'hébergement. Une première demande sans engagement est possible à tout moment, même très en avance.",
          nl: 'Voor data in het buitenland is het verstandig eerder aan te vragen dan voor Stuttgart zelf – alleen al vanwege de reis- en overnachtingsplanning. Een eerste vrijblijvende aanvraag kan echter altijd, ook ver vooruit.',
        },
      },
    ],
  },
  {
    slug: 'frankreich',
    name: { de: 'Frankreich', en: 'France', tr: 'Fransa', fr: 'France' },
    referenceCity: 'Straßburg',
    distanceKm: 110,
    verified: false,
    turkishDiaspora: true,
    kurdishDiaspora: true,
    intro: {
      de: 'Frankreich ist kein einheitliches Ziel, sondern zwei sehr unterschiedliche Szenarien. Das Elsass, direkt jenseits der Grenze bei Karlsruhe und Straßburg, ist praktisch eine Fortsetzung der badischen Nachbarschaft – die Fahrt dorthin unterscheidet sich kaum von einer Fahrt nach Karlsruhe. Der Rest Frankreichs, allen voran der Großraum Paris, ist eine echte Auslandsreise mit entsprechend größerem Vorlauf.',
      en: "France isn't one uniform destination — it's two quite different scenarios. Alsace, right across the border from Karlsruhe and Strasbourg, is practically an extension of the neighbouring Baden region; the trip there is barely different from a trip to Karlsruhe. The rest of France, above all greater Paris, is a genuine trip abroad that needs correspondingly more lead time.",
      tr: 'Fransa tek tip bir hedef değil, iki oldukça farklı senaryo. Karlsruhe ve Strasbourg’un hemen sınır ötesindeki Alsace bölgesi, komşu Baden bölgesinin neredeyse bir devamı gibi — oraya gitmek Karlsruhe’ye gitmekten neredeyse farksız. Fransa’nın geri kalanı, başta Paris çevresi olmak üzere, daha fazla hazırlık süresi gerektiren gerçek bir yurt dışı seyahati.',
      fr: "La France n'est pas une destination uniforme, mais deux scénarios bien différents. L'Alsace, juste de l'autre côté de la frontière depuis Karlsruhe et Strasbourg, est pratiquement le prolongement du Pays de Bade voisin — le trajet n'est guère différent d'un déplacement à Karlsruhe. Le reste de la France, à commencer par la région parisienne, est un véritable déplacement à l'étranger, qui demande logiquement plus de délai.",
    },
    logistics: {
      de: 'Straßburg liegt nur rund 110 Kilometer von Stuttgart entfernt – näher als Mannheim. Paris dagegen liegt bei rund 480 Kilometern, technisch und planerisch ein anderer Fall: mehr Vorlaufzeit, mindestens eine Übernachtung, oft ein zusätzlicher Reisetag für Technik-Auf- und -abbau. In beiden Fällen wird die tatsächliche Distanz einzeln und nachvollziehbar im Angebot ausgewiesen.',
      en: 'Strasbourg is only about 110 km from Stuttgart — closer than Mannheim. Paris, on the other hand, is roughly 480 km away, a different case both technically and logistically: more lead time, at least one overnight stay, often an extra travel day for equipment setup and teardown. Either way, the actual distance is itemised individually and transparently in the quote.',
      tr: 'Strasbourg, Stuttgart’a sadece yaklaşık 110 kilometre uzaklıkta — Mannheim’dan bile daha yakın. Paris ise yaklaşık 480 kilometre uzaklıkta, hem teknik hem planlama açısından farklı bir durum: daha fazla hazırlık süresi, en az bir gecelik konaklama, çoğu zaman ekipman kurulumu ve toplanması için ek bir seyahat günü. Her iki durumda da gerçek mesafe, teklifte ayrı ayrı ve şeffaf şekilde gösterilir.',
      fr: "Strasbourg n'est qu'à environ 110 kilomètres de Stuttgart — plus proche que Mannheim. Paris, en revanche, se trouve à environ 480 kilomètres, un cas différent tant sur le plan technique que logistique : plus de délai, au moins une nuitée, souvent une journée de déplacement supplémentaire pour le montage et le démontage. Dans les deux cas, la distance réelle est indiquée individuellement et de façon transparente dans le devis.",
    },
    whatChanges: {
      de: 'Frankreich nutzt wie Deutschland Schuko-kompatible Steckdosen und 230V/50Hz – auch hier ein technisch unkomplizierter Fall. Anders als bei Kilometern und Steckdosen unterscheiden sich Lärmschutzauflagen deutlich: Viele französische Gemeinden und Locations regeln Enddauer und Lautstärke strenger als im Elsass gewohnt, besonders außerhalb der grenznahen Region – auch das wird vorab direkt mit der Location geklärt.',
      en: "France uses Schuko-compatible sockets and 230V/50Hz like Germany — technically another straightforward case. Unlike kilometres and sockets, noise regulations differ noticeably: many French municipalities and venues set stricter end times and volume limits than is typical in Alsace, especially further from the border — that's also clarified directly with the venue in advance.",
      tr: 'Fransa, Almanya gibi Schuko uyumlu prizler ve 230V/50Hz kullanır — bu açıdan da teknik olarak sorunsuz. Kilometre ve prizlerin aksine, gürültü kuralları belirgin şekilde farklılık gösterir: birçok Fransız belediyesi ve mekânı, özellikle sınırdan uzaklaştıkça, Alsace’da alışılandan daha sıkı bitiş saatleri ve ses sınırları belirler — bu da önceden doğrudan mekânla netleştirilir.',
      fr: "La France utilise, comme l'Allemagne, des prises compatibles Schuko et le 230V/50Hz — techniquement, un autre cas simple. Contrairement aux kilomètres et aux prises, la réglementation sur le bruit diffère nettement : de nombreuses communes et lieux français fixent des horaires de fin et des limites de volume plus stricts qu'en Alsace, surtout loin de la frontière — cela aussi est clarifié directement avec le lieu au préalable.",
    },
    diaspora: {
      de: 'Frankreich hat eine der größten türkischen und kurdischen Communities Westeuropas, mit historischen Zentren unter anderem im Elsass, in der Region Straßburg und im Großraum Paris. Für binationale Feiern zwischen Deutschland und Frankreich – ebenso wie für türkische und kurdische Communities beiderseits der Grenze – bringt ein DJ, der beide Feierkulturen kennt, genau das zusammen, was sonst zwei getrennte Programme bräuchte.',
      en: "France has one of Western Europe's largest Turkish and Kurdish communities, with historic centres including Alsace, the Strasbourg region and greater Paris. For binational celebrations between Germany and France — and for Turkish and Kurdish communities on both sides of the border — a DJ who knows both celebration cultures brings together what would otherwise need two separate programmes.",
      tr: 'Fransa, Batı Avrupa’nın en büyük Türk ve Kürt topluluklarından birine sahip; tarihsel merkezleri arasında Alsace, Strasbourg bölgesi ve Paris çevresi de yer alıyor. Almanya ile Fransa arasındaki iki uluslu kutlamalar için — ve sınırın iki tarafındaki Türk ve Kürt toplulukları için de — her iki kutlama kültürünü de bilen bir DJ, aksi halde iki ayrı program gerektirecek şeyi tek çatı altında birleştiriyor.',
      fr: "La France abrite l'une des plus grandes communautés turques et kurdes d'Europe de l'Ouest, avec des centres historiques notamment en Alsace, dans la région de Strasbourg et en région parisienne. Pour les célébrations binationales entre l'Allemagne et la France — tout comme pour les communautés turques et kurdes des deux côtés de la frontière — un DJ connaissant les deux cultures festives réunit ce qui nécessiterait autrement deux programmes séparés.",
    },
    languagesNote: {
      de: 'Live moderiert wird auf Deutsch, Türkisch und Englisch. Die französische Sprachversion dieser Website existiert nicht, um Französisch als Moderationssprache zu suggerieren – sie existiert, damit Paare aus dem Elsass und dem restlichen Frankreich lesen und anfragen können. Wer eine französischsprachige Moderation erwartet, sollte das vorab klären.',
      en: "Live hosting is in German, Turkish and English. The French version of this site doesn't exist to suggest French as a hosting language — it exists so couples from Alsace and the rest of France can read it and get in touch. Anyone expecting French-language hosting should clarify this in advance.",
      tr: 'Canlı sunum Almanca, Türkçe ve İngilizce yapılır. Bu sitenin Fransızca sürümü, Fransızcanın bir sunum dili olduğunu düşündürmek için değil, Alsace ve Fransa’nın geri kalanından çiftlerin okuyup iletişime geçebilmesi için var. Fransızca sunum bekleyenlerin bunu önceden netleştirmesi gerekir.',
      fr: "L'animation en direct se fait en allemand, en turc et en anglais. La version française de ce site n'existe pas pour laisser entendre que le français serait une langue d'animation — elle existe pour que les couples d'Alsace et du reste de la France puissent la lire et nous contacter. Toute personne attendant une animation en français doit le clarifier au préalable.",
    },
    faq: [
      {
        question: {
          de: 'Moderieren Sie auf Französisch?',
          en: 'Do you host in French?',
          tr: 'Fransızca sunum yapıyor musunuz?',
          fr: 'Animez-vous en français ?',
        },
        answer: {
          de: 'Nein. Live moderiert wird auf Deutsch, Türkisch und Englisch. Diese Seite ist auf Französisch verfügbar, damit Sie sie lesen und anfragen können – die Moderation selbst bleibt bei den drei genannten Sprachen.',
          en: 'No. Live hosting is in German, Turkish and English. This page is available in French so you can read it and get in touch — hosting itself stays within those three languages.',
          tr: 'Hayır. Canlı sunum Almanca, Türkçe ve İngilizce yapılır. Bu sayfa okuyup iletişime geçebilmeniz için Fransızca olarak da sunuluyor — sunumun kendisi bu üç dille sınırlı kalır.',
          fr: "Non. L'animation en direct se fait en allemand, en turc et en anglais. Cette page est disponible en français pour que vous puissiez la lire et nous contacter — l'animation elle-même reste dans ces trois langues.",
        },
      },
      {
        question: {
          de: 'Ist eine Hochzeit im Elsass genauso einfach wie in Karlsruhe?',
          en: 'Is a wedding in Alsace just as easy as one in Karlsruhe?',
          tr: 'Alsace’taki bir düğün, Karlsruhe’dekiyle aynı derecede kolay mı?',
          fr: 'Un mariage en Alsace est-il aussi simple qu\'à Karlsruhe ?',
        },
        answer: {
          de: 'Fast. Die Distanz ist vergleichbar, die Technik funktioniert identisch – einzig die Anfahrt wird für das Elsass separat im Angebot ausgewiesen, da es außerhalb der deutschen Inklusiv-Zone liegt.',
          en: "Almost. The distance is comparable and the equipment works identically — the only difference is that travel to Alsace is itemised separately in the quote, since it falls outside the German travel-included zone.",
          tr: 'Neredeyse. Mesafe kıyaslanabilir, ekipman aynı şekilde çalışır — tek fark, Alsace için ulaşımın teklifte ayrı gösterilmesi, çünkü orası Almanya’daki ücretsiz ulaşım bölgesinin dışında kalıyor.',
          fr: "Presque. La distance est comparable, le matériel fonctionne à l'identique — seule différence : le déplacement vers l'Alsace est indiqué séparément dans le devis, car elle se trouve hors de la zone de déplacement inclus en Allemagne.",
        },
      },
      {
        question: {
          de: 'Spielen Sie auch in Paris oder weiter entfernten Regionen Frankreichs?',
          en: 'Do you also play Paris or more distant regions of France?',
          tr: 'Paris’te ya da Fransa’nın daha uzak bölgelerinde de çalıyor musunuz?',
          fr: 'Jouez-vous aussi à Paris ou dans des régions plus éloignées de la France ?',
        },
        answer: {
          de: 'Ja, das ist grundsätzlich möglich. Bei rund 480 Kilometern Entfernung braucht es mehr Vorlaufzeit, eine Übernachtung und eine sorgfältige Logistikplanung – all das wird im individuellen Angebot berücksichtigt.',
          en: "Yes, that's possible in principle. At roughly 480 km, it needs more lead time, an overnight stay and careful logistics planning — all of that is accounted for in your individual quote.",
          tr: 'Evet, prensipte mümkün. Yaklaşık 480 kilometrelik mesafede daha fazla hazırlık süresi, bir gecelik konaklama ve dikkatli bir lojistik planlaması gerekir — bunların hepsi size özel teklifte dikkate alınır.',
          fr: "Oui, c'est possible en principe. À environ 480 kilomètres, cela demande plus de délai, une nuitée et une planification logistique soignée — tout cela est pris en compte dans le devis individuel.",
        },
      },
    ],
  },
];

export interface PublishedRegion extends Region {
  /** Locales this specific country page ships real, translated prose for — never `[]` (German is mandatory). */
  locales: Locale[];
}

/**
 * THE published, page/sitemap-facing region list — every entry in
 * `allRegionEntries` ships (unlike `cities.ts`, there is no tiering here:
 * these five were already selected for quality, per docs/SEO-EUROPE-STRATEGY.md).
 */
export const regions: PublishedRegion[] = allRegionEntries.map((r) => ({
  ...r,
  locales: getReadyLocalesForRegion(r),
}));

export function getAllRegions(): PublishedRegion[] {
  return regions;
}

export function getRegionBySlug(slug: string): PublishedRegion | undefined {
  return regions.find((r) => r.slug === slug);
}

/** All other published country pages except the current one — used for the small cross-linking cluster (5 countries, no tiering needed). */
export function getOtherRegions(currentSlug: string): PublishedRegion[] {
  return regions.filter((r) => r.slug !== currentSlug);
}
