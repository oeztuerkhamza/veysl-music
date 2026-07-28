/**
 * ============================================================================
 *  DEMO / LAYOUT DATA ONLY — DO NOT PUBLISH — DO NOT TREAT AS REAL REVIEWS
 * ============================================================================
 *
 * WHY THIS FILE EXISTS AND WHY IT IS SEPARATE FROM `testimonials.ts`:
 *
 * The client asked for 15 testimonials on the site. DJ Veys has **zero verified,
 * permission-granted customer testimonials today** — see `.claude/BRAND-FACTS.md`
 * ("client testimonials and names... still unknown — do NOT invent"). Publishing
 * invented quotes attributed to invented couples would be a fabricated/fake-review
 * problem under German UWG (§ 5 Abs. 1 Nr. 4 — Vortäuschen einer Kundenmeinung)
 * and the EU Unfair Commercial Practices Directive, not just a trust problem.
 *
 * `src/content/testimonials.ts` (owned by the pages agent, per `.claude/CONTRACT.md`)
 * is therefore correctly an EMPTY array. It is the live data source and must stay
 * empty until the client supplies real, permission-granted quotes.
 *
 * THIS file is a different thing entirely: fixture/seed data for the admin panel
 * and database another agent is building concurrently, so that:
 *   1. the admin UI's testimonial-management screens (list, card, form, rating
 *      display, long/short quote wrapping) can be built and visually reviewed
 *      before a single real testimonial exists, and
 *   2. the CMS/database schema has realistic-shaped rows to migrate against.
 *
 * HARD RULES ENFORCED BELOW — do not weaken these when adding/editing entries:
 *
 *   - Every entry has `status: 'draft'` AND `isDemo: true`. Any consuming code
 *     (public site, sitemap, schema.org Review/AggregateRating markup) MUST
 *     filter on both before rendering anything to a visitor. A future admin/DB
 *     agent should enforce this server-side too — don't rely on the flag alone.
 *   - Every `authorName` is an unmistakable placeholder (`[Vorname] & [Vorname]`,
 *     `Muster-Brautpaar N`, …). Never a name realistic enough to be mistaken for
 *     an actual person — that would recreate the exact problem this file exists
 *     to avoid.
 *   - Every `venue` is bracketed as a placeholder — no real Baden-Württemberg
 *     venue name is attached to an invented quote, ever (see `venues.ts` and
 *     `cities.ts` for why real venue names are handled so carefully elsewhere
 *     in this project).
 *   - Quotes are generic on purpose: realistic in length/rhythm so the design
 *     can be judged (short pull-quotes AND long-form paragraphs are both
 *     represented), but deliberately free of any specific, checkable detail
 *     (no real date, no real place, no story only one couple could have told).
 *
 * See `docs/BLOG-PLAN.md` → "HOW-TO: collecting real testimonials" for the
 * process to replace every one of these 15 rows with a genuine, permission-
 * granted quote — that replacement is a prerequisite for launch, not a
 * nice-to-have (see `HANDOVER.md` §6).
 */

export type TestimonialDemoEventType = 'wedding' | 'engagement' | 'henna' | 'afterparty' | 'corporate';

export interface TestimonialSeed {
  /** Stable, locale-independent id — safe to use as a CMS/DB primary key during migration. */
  id: string;
  /** Always 'draft' in this file — see file header. A real, approved testimonial becomes 'published' in `testimonials.ts`'s eventual CMS-backed successor, never here. */
  status: 'draft';
  /** Always true in this file — belt-and-braces alongside `status`, so a filter bug on one field still gets caught by the other. */
  isDemo: true;
  quote: string;
  /** Obvious placeholder — see file header. Never a realistic full name. */
  authorName: string;
  role?: string;
  eventType: TestimonialDemoEventType;
  /** Bracketed placeholder — never a real venue name. */
  venue: string;
  /** `null` on purpose — a fabricated year would itself be a small fabricated fact. */
  year: null;
  /** 1–5, for testing star-rating layout only. Not a real rating — see file header. */
  ratingForLayoutOnly: number;
  /** Rough word count of `quote` — lets the admin UI's seed script build a spread of short/medium/long cards without re-parsing text. */
  lengthHint: 'short' | 'medium' | 'long';
}

/** Render this in any dev/staging seed-data banner. Not used by production code — a future admin agent should wire an actual guard, this is the copy for it. */
export const TESTIMONIALS_SEED_DISCLAIMER =
  'Demo-Daten für Layout-Zwecke – keine echten Kundenstimmen. Nicht veröffentlichen.';

export const testimonialsSeed: TestimonialSeed[] = [
  {
    id: 'seed-01',
    status: 'draft',
    isDemo: true,
    quote:
      'Von der ersten Anfrage bis zum letzten Song hat sich alles genau richtig angefühlt. Die Tanzfläche war bis zum Schluss voll.',
    authorName: '[Vorname] & [Vorname]',
    role: 'Brautpaar',
    eventType: 'wedding',
    venue: '[Location einfügen]',
    year: null,
    ratingForLayoutOnly: 5,
    lengthHint: 'short',
  },
  {
    id: 'seed-02',
    status: 'draft',
    isDemo: true,
    quote:
      'Wir hatten deutsche und türkische Gäste gleichzeitig auf der Feier, und genau das war die größte Sorge im Vorfeld. Am Ende hat die Moderation beide Seiten mitgenommen, niemand saß nur höflich lächelnd am Tisch. Auch die Musikmischung aus Halay, Charts und ruhigeren Momenten beim Dinner hat perfekt zum Ablauf gepasst.',
    authorName: 'Muster-Brautpaar 2',
    role: 'Braut',
    eventType: 'wedding',
    venue: '[Location einfügen]',
    year: null,
    ratingForLayoutOnly: 5,
    lengthHint: 'long',
  },
  {
    id: 'seed-03',
    status: 'draft',
    isDemo: true,
    quote: 'Professionell, pünktlich, gute Technik. Genau das, was man sich für so einen Tag wünscht.',
    authorName: '[Vorname], Trauzeuge',
    role: 'Trauzeuge',
    eventType: 'wedding',
    venue: '[Location einfügen]',
    year: null,
    ratingForLayoutOnly: 5,
    lengthHint: 'short',
  },
  {
    id: 'seed-04',
    status: 'draft',
    isDemo: true,
    quote:
      'Der Kına-Abend hatte eine ganz eigene Stimmung, ruhig und emotional am Anfang, dann mit Live-Musik und Trommeln in die Feier übergegangen. Genau die Balance, die wir uns gewünscht hatten, ohne dass wir sie im Detail vorgeben mussten.',
    authorName: '[Vorname] & [Vorname]',
    role: 'Brautpaar',
    eventType: 'henna',
    venue: '[Location einfügen]',
    year: null,
    ratingForLayoutOnly: 5,
    lengthHint: 'medium',
  },
  {
    id: 'seed-05',
    status: 'draft',
    isDemo: true,
    quote:
      'Das Vorgespräch hat wirklich geholfen, wir wussten am Tag selbst genau, was passiert und wann. Keine Überraschungen, keine Lücken im Programm.',
    authorName: 'Muster-Brautpaar 5',
    role: 'Bräutigam',
    eventType: 'wedding',
    venue: '[Location einfügen]',
    year: null,
    ratingForLayoutOnly: 5,
    lengthHint: 'medium',
  },
  {
    id: 'seed-06',
    status: 'draft',
    isDemo: true,
    quote: 'Unsere Verlobungsfeier war kleiner als eine Hochzeit, wurde aber genauso ernst genommen. Danke dafür.',
    authorName: '[Vorname] & [Vorname]',
    role: 'Verlobtes Paar',
    eventType: 'engagement',
    venue: '[Location einfügen]',
    year: null,
    ratingForLayoutOnly: 5,
    lengthHint: 'short',
  },
  {
    id: 'seed-07',
    status: 'draft',
    isDemo: true,
    quote:
      'Die Live-Musik zwischendurch war die schönste Überraschung des Abends. Saz statt nur Playback, das haben viele Gäste danach noch angesprochen. Auch die Übergänge zwischen den ruhigeren und den lauteren Programmpunkten haben nie abrupt gewirkt, sondern sind ineinander übergegangen.',
    authorName: 'Muster-Brautpaar 7',
    role: 'Braut',
    eventType: 'wedding',
    venue: '[Location einfügen]',
    year: null,
    ratingForLayoutOnly: 5,
    lengthHint: 'long',
  },
  {
    id: 'seed-08',
    status: 'draft',
    isDemo: true,
    quote: 'Unkomplizierte Absprache im Vorfeld, zuverlässige Umsetzung am Tag selbst.',
    authorName: '[Vorname], Hochzeitsplanerin',
    role: 'Hochzeitsplanerin',
    eventType: 'wedding',
    venue: '[Location einfügen]',
    year: null,
    ratingForLayoutOnly: 5,
    lengthHint: 'short',
  },
  {
    id: 'seed-09',
    status: 'draft',
    isDemo: true,
    quote:
      'Als Firma haben wir vor allem auf saubere Technik und einen reibungslosen Ablauf ohne Aufsehen geachtet. Beides war gegeben, dazu kam eine Moderation, die für unsere internationalen Gäste genau richtig dosiert war.',
    authorName: '[Firmenname einfügen]',
    role: 'Veranstalter Sommerfest',
    eventType: 'corporate',
    venue: '[Location einfügen]',
    year: null,
    ratingForLayoutOnly: 5,
    lengthHint: 'medium',
  },
  {
    id: 'seed-10',
    status: 'draft',
    isDemo: true,
    quote: 'Auch nach Mitternacht war noch Energie auf der Tanzfläche. Genau so hatten wir uns die After-Party vorgestellt.',
    authorName: 'Muster-Brautpaar 10',
    role: 'Brautpaar',
    eventType: 'afterparty',
    venue: '[Location einfügen]',
    year: null,
    ratingForLayoutOnly: 5,
    lengthHint: 'medium',
  },
  {
    id: 'seed-11',
    status: 'draft',
    isDemo: true,
    quote:
      'Unsere Familien kommen aus zwei unterschiedlichen Musikwelten, und genau das war am Ende kein Problem, sondern ein Gewinn. Von türkischen Klassikern bis zu den Songs, die für uns beide persönlich wichtig waren, war alles vertreten, ohne dass sich eine Seite der Gästeliste zurückgesetzt fühlte.',
    authorName: '[Vorname] & [Vorname]',
    role: 'Brautpaar',
    eventType: 'wedding',
    venue: '[Location einfügen]',
    year: null,
    ratingForLayoutOnly: 5,
    lengthHint: 'long',
  },
  {
    id: 'seed-12',
    status: 'draft',
    isDemo: true,
    quote: 'Freie Trauung im Freien, spontaner Wetterumschwung, keine Panik. Es hat einfach funktioniert.',
    authorName: 'Muster-Brautpaar 12',
    role: 'Braut',
    eventType: 'wedding',
    venue: '[Location einfügen]',
    year: null,
    ratingForLayoutOnly: 5,
    lengthHint: 'short',
  },
  {
    id: 'seed-13',
    status: 'draft',
    isDemo: true,
    quote:
      'Was uns am meisten überzeugt hat: Die Musikwünsche und die No-Go-Liste wurden wirklich eingehalten, auch als am Abend spontan andere Wünsche von Gästen kamen. Man hat gemerkt, dass unsere Absprachen vorher ernst genommen wurden und nicht nur auf dem Papier standen.',
    authorName: '[Vorname] & [Vorname]',
    role: 'Brautpaar',
    eventType: 'wedding',
    venue: '[Location einfügen]',
    year: null,
    ratingForLayoutOnly: 5,
    lengthHint: 'long',
  },
  {
    id: 'seed-14',
    status: 'draft',
    isDemo: true,
    quote: 'Kurzfristige Anfrage, trotzdem ein sehr strukturiertes Angebot innerhalb eines Tages. Das hat Vertrauen geschaffen.',
    authorName: 'Muster-Brautpaar 14',
    role: 'Bräutigam',
    eventType: 'wedding',
    venue: '[Location einfügen]',
    year: null,
    ratingForLayoutOnly: 5,
    lengthHint: 'medium',
  },
  {
    id: 'seed-15',
    status: 'draft',
    isDemo: true,
    quote: 'Ein Abend, an dem wirklich nichts geplant wirkte, obwohl offensichtlich alles geplant war.',
    authorName: '[Vorname] & [Vorname]',
    role: 'Brautpaar',
    eventType: 'wedding',
    venue: '[Location einfügen]',
    year: null,
    ratingForLayoutOnly: 5,
    lengthHint: 'short',
  },
];
