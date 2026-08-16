import type { MetadataRoute } from 'next';
import { locales, defaultLocale, hreflangTags, type Locale } from '@/i18n/routing';
import { absoluteUrl, type StaticPathname, type DynamicPathname } from '@/lib/seo';
import { ISLAMIC_SUPPORTED_LOCALES } from '@/content/islamic';
import { BW_SUPPORTED_LOCALES } from '@/content/region-bw';
import { TURKISH_DJ_SUPPORTED_LOCALES } from '@/content/turkish-dj';

const CITY_PATHNAME: DynamicPathname = '/hochzeits-dj/[stadt]';
const REGION_HUB_PATHNAME: StaticPathname = '/hochzeits-dj-europa';
const REGION_COUNTRY_PATHNAME: DynamicPathname = '/hochzeits-dj-europa/[land]';
const BLOG_ARTICLE_PATHNAME: DynamicPathname = '/ratgeber/[slug]';

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;

interface RouteSeoConfig {
  changeFrequency: ChangeFrequency;
  priority: number;
}

/**
 * Every plain static route from `routing.pathnames` that is available in all
 * eight locales AND indexable gets an explicit priority/changeFrequency here.
 * Typed as `Record<Exclude<StaticPathname, …the ones handled separately…>, …>`
 * so a new route added to routing.ts fails to compile here until it's
 * classified — the sitemap can't silently miss it.
 *
 * The excluded routes below are each excluded on purpose:
 * - `/hochzeits-dj-europa` (the Europe reach hub): NOT available in all eight
 *   locales, unlike every other entry here — see `HUB_ROUTE_CONFIG` and
 *   `loadRegionsData()` below.
 * - `/ratgeber` (blog index): real content in `BLOG_LOCALES` (de/tr/en) only;
 *   the other four locales render an empty shell that `buildRatgeberIndexMetadata()`
 *   marks `noindex`. Emitted per-locale below, not here.
 * - `/fragen` (GEO answer hub): same shape — the corpus is authored in de/tr/en
 *   and falls back to German elsewhere, so `buildFragenMetadata()` marks the
 *   other four `noindex`. Emitted per-locale below, not here.
 * - `/islamische-hochzeit`: published in tr/ku/ar only (`ISLAMIC_SUPPORTED_LOCALES`);
 *   the page itself `notFound()`s for the other five — German included —
 *   because the religiously framed layer is deliberately not part of those
 *   sites at all. Emitted per-locale below, not here.
 * - `/hochzeits-dj-baden-wuerttemberg`: same shape, de/tr/en only
 *   (`BW_SUPPORTED_LOCALES`). A state-level page exists to rank for a
 *   German-language query; a French edition of it competes for nothing.
 * - `/tuerkischer-dj-stuttgart`: same shape, de/tr/en only
 *   (`TURKISH_DJ_SUPPORTED_LOCALES`) — the niche landing page for the
 *   "türkischer DJ (Stuttgart)" query group. Emitted per-locale below.
 * - `/tuerkischer-dj-baden-wuerttemberg`: same shape and same locale
 *   constant — the state-level page of the same niche ("türkischer DJ
 *   Baden-Württemberg" / "baden-württemberg türk dj"). Emitted per-locale
 *   below, right next to its Stuttgart sibling.
 * - `/impressum` + `/datenschutz`: both pages set `noIndex: true` in their own
 *   `generateMetadata`. A sitemap entry is a request to index; pairing it with
 *   a `noindex` page is a direct contradiction that Search Console reports as
 *   "Submitted URL marked 'noindex'". They stay crawlable and footer-linked —
 *   they just no longer ask to be indexed. If either ever drops its `noIndex`
 *   flag, add it back to the map below and the type stops complaining.
 */
const staticRoutes: Record<
  Exclude<
    StaticPathname,
    | '/hochzeits-dj-europa'
    | '/ratgeber'
    | '/fragen'
    | '/islamische-hochzeit'
    | '/hochzeits-dj-baden-wuerttemberg'
    | '/tuerkischer-dj-stuttgart'
    | '/tuerkischer-dj-baden-wuerttemberg'
    | '/impressum'
    | '/datenschutz'
  >,
  RouteSeoConfig
> = {
  '/': { changeFrequency: 'weekly', priority: 1 },
  '/hochzeit-events': { changeFrequency: 'monthly', priority: 0.8 },
  '/pakete': { changeFrequency: 'monthly', priority: 0.9 },
  '/echte-hochzeiten': { changeFrequency: 'monthly', priority: 0.8 },
  '/ablauf': { changeFrequency: 'monthly', priority: 0.7 },
  '/anfrage': { changeFrequency: 'monthly', priority: 0.9 },
  '/galerie': { changeFrequency: 'monthly', priority: 0.6 },
  '/epk': { changeFrequency: 'monthly', priority: 0.4 },
  '/kontakt': { changeFrequency: 'yearly', priority: 0.5 },
};

/**
 * GEO answer hub — 40 Q&As, FAQPage-marked, deliberately the most citable,
 * most content-dense page on the site. Weekly since it's expected to grow.
 */
const ANSWERS_ROUTE_CONFIG: RouteSeoConfig = { changeFrequency: 'weekly', priority: 0.9 };

/**
 * Islamische Hochzeit — priority on a par with `/pakete`, deliberately above
 * the other service pages. Not because the traffic is bigger (it is almost
 * certainly smaller) but because it is the one page on this site with barely
 * any German-language competition, so an indexed URL is worth
 * disproportionately more here. See docs/SEO-KEYWORD-MAP.md §5.
 */
const ISLAMIC_ROUTE_CONFIG: RouteSeoConfig = { changeFrequency: 'monthly', priority: 0.9 };

/**
 * `/ratgeber` and `/ratgeber/[slug]` are fully wired below (loader, config,
 * hreflang) but withheld from actual sitemap output until
 * `src/app/[locale]/ratgeber/**` exists — right now every one of those URLs
 * 404s (confirmed via curl against the running dev server). Flip this to
 * `true` once the blog agent's page routes are live; nothing else in this
 * file needs to change.
 */
const BLOG_ROUTES_LIVE = true;

/** Ratgeber/Blog index — 15 articles today, expected to grow. Used once `BLOG_ROUTES_LIVE` flips on. */
const BLOG_INDEX_ROUTE_CONFIG: RouteSeoConfig = { changeFrequency: 'weekly', priority: 0.7 };

/**
 * The `/hochzeits-dj/[stadt]` cluster is the bulk of the site's indexable
 * surface (client goal: outrank every wedding-DJ competitor within ~200km of
 * Stuttgart) but each individual city page is less important than the core
 * conversion/trust pages above.
 */
const CITY_ROUTE_CONFIG: RouteSeoConfig = { changeFrequency: 'monthly', priority: 0.65 };

/** See the exclusion comment on `staticRoutes` above. */
const HUB_ROUTE_CONFIG: RouteSeoConfig = { changeFrequency: 'monthly', priority: 0.6 };

/** Five country pages — real substance each, but a smaller cluster than cities/blog. */
const REGION_COUNTRY_ROUTE_CONFIG: RouteSeoConfig = { changeFrequency: 'monthly', priority: 0.55 };

/** Long-tail guide articles — real booking-adjacent search intent. */
const BLOG_ARTICLE_ROUTE_CONFIG: RouteSeoConfig = { changeFrequency: 'monthly', priority: 0.6 };

interface LocalizedEntry {
  /** Canonical slug — used for every locale unless `slugByLocale` overrides it. */
  slug: string;
  /**
   * Per-locale slug, for clusters whose URL differs by language (blog
   * articles). Cities and countries share one slug across all locales and
   * leave this unset.
   */
  slugByLocale?: Partial<Record<Locale, string>>;
  /** Locales this specific entry actually has real, translated content for — never a blanket fallback to all eight. */
  locales: readonly Locale[];
  /** ISO date of the last substantive content edit, when the content module tracks one. See the `lastmod` policy below. */
  lastModified?: string;
}

/** Resolves one entry's slug for one locale — the shared rule for every cluster below. */
function slugFor(entry: LocalizedEntry, locale: Locale): string {
  return entry.slugByLocale?.[locale] ?? entry.slug;
}

/**
 * ── `lastmod` policy ────────────────────────────────────────────────────────
 *
 * Only routes whose content module records a real edit date get a
 * `lastModified`. Everything else omits the field.
 *
 * This file used to stamp `new Date()` — the build timestamp — onto all 179
 * URLs, which told Google that every page on the site changed at every
 * deploy, including legal pages nobody had touched in months. Google's
 * documented behaviour is to ignore `lastmod` wholesale once it judges the
 * values unreliable, so the field was not merely useless, it was actively
 * spending the site's credibility on a signal it then lost. Their guidance for
 * exactly this case is to leave the field out rather than guess.
 *
 * Who has a real date today:
 * - blog articles → `post.updatedAt` (per article, the most precise signal here)
 * - blog index    → `latestBlogUpdate()` — newest article edit in the corpus
 * - `/fragen`     → `latestAnswerUpdate()` — newest edit in the answer corpus
 *
 * Who does not, and therefore gets no `lastmod`: the plain static pages,
 * the city cluster (`src/content/cities.ts` tracks no dates) and the Europe
 * cluster (`src/content/regions.ts` likewise). If either content module grows
 * an `updatedAt`, wire it through `LocalizedEntry.lastModified` above and it
 * flows into the output with no other change.
 */

/**
 * `src/content/cities.ts` (owned by the city-pages agent) is the single
 * source of truth for BOTH questions this needs answered — do not
 * re-implement either check here:
 * - `getAllCities()` already filters out `priority: 3` (withheld) cities, so
 *   only genuinely published pages are considered.
 * - `getReadyLocalesForCity()` computes, per city, which locales actually
 *   have real intro/angle/FAQ prose (`hasCityProse()`) — currently de/tr/en
 *   for every city, NOT all eight. This is what stops the sitemap from
 *   asserting hreflang/URLs for locale variants that 404.
 *
 * Wrapped in a dynamic import + try/catch: if that module is mid-edit in a
 * parallel build (or its exports ever change shape), the sitemap degrades to
 * "no city URLs" rather than breaking every other route above.
 */
async function loadPublishedCities(): Promise<LocalizedEntry[]> {
  try {
    const { getAllCities, getReadyLocalesForCity } = await import('@/content/cities');
    return getAllCities().map((city) => ({
      slug: city.slug,
      locales: getReadyLocalesForCity(city),
    }));
  } catch {
    return [];
  }
}

interface RegionsData {
  /** Hub page's own restricted locale set — see `HUB_SUPPORTED_LOCALES` in src/content/regions.ts. */
  hubLocales: readonly Locale[];
  countries: LocalizedEntry[];
}

/**
 * `src/content/regions.ts` (owned by the regions agent) is the source of
 * truth for both: the hub's restricted locale set (`HUB_SUPPORTED_LOCALES` —
 * only de/en/nl today, NOT all eight, because the `regions` message
 * namespace hasn't synced to tr/ku/fr/es yet) and each country page's ready
 * locales (the `regions` export's `.locales`, already computed via
 * `getReadyLocalesForRegion()` inside that module). Same guard as cities.
 */
async function loadRegionsData(): Promise<RegionsData> {
  try {
    const { regions, HUB_SUPPORTED_LOCALES } = await import('@/content/regions');
    return {
      hubLocales: HUB_SUPPORTED_LOCALES,
      countries: regions.map((region) => ({ slug: region.slug, locales: region.locales })),
    };
  } catch {
    return { hubLocales: [], countries: [] };
  }
}

/**
 * `src/content/blog/` (owned by the blog agent). `getPublishedGuides()`
 * already excludes the two `status: 'template'` recap posts — internal
 * fill-in-the-blank scaffolding, never public — leaving exactly the 15
 * finished guide articles. `getReadyLocalesForPost()` returns exactly the
 * locales that post has real translated content for — today always
 * `['de','tr','en']` since ku/fr/es are an explicit backlog (`BLOG_LOCALES`
 * in src/content/blog/types.ts), never all eight. Same guard as cities/regions.
 */
async function loadPublishedBlogPosts(): Promise<LocalizedEntry[]> {
  try {
    const { getPublishedGuides, getReadyLocalesForPost, getPostSlug } = await import('@/content/blog');
    return getPublishedGuides().map((post) => {
      const locales = getReadyLocalesForPost(post);
      return {
        slug: post.slug,
        // Articles are the only cluster with per-language slugs — resolved
        // through the same `getPostSlug()` the routes and hreflang use, so the
        // sitemap cannot drift into listing URLs that no longer exist.
        slugByLocale: Object.fromEntries(locales.map((l) => [l, getPostSlug(post, l)])),
        locales,
        // The one place on this site with a genuine per-URL edit date.
        lastModified: post.updatedAt,
      };
    });
  } catch {
    return [];
  }
}

/**
 * The blog INDEX's own locale set — `BLOG_LOCALES` (de/tr/en). Distinct from
 * the per-article sets above: `/ratgeber` renders in all eight locales because
 * `routing.pathnames` registers a slug for each, but the four without articles
 * render `<BlogEmptyState>` and `buildRatgeberIndexMetadata()` marks them
 * `noindex`. Listing those four here (which this file used to do, looping over
 * every locale) put four `noindex` URLs into the sitemap — exactly the
 * contradiction the comment in `src/components/blog/blog-seo.ts` warned about
 * while this file did the opposite. Same guard as the loaders above.
 */
async function loadBlogIndexLocales(): Promise<{ locales: readonly Locale[]; lastModified?: string }> {
  try {
    const { BLOG_LOCALES, latestBlogUpdate } = await import('@/content/blog');
    // An index page changes when its newest entry changes — that is a real
    // signal, unlike the build timestamp this used to carry.
    return { locales: BLOG_LOCALES, lastModified: latestBlogUpdate() };
  } catch {
    return { locales: [] };
  }
}

/**
 * The GEO hub's own locale set — the locales the answer corpus is actually
 * authored in (de/tr/en today), computed from the data by
 * `getReadyLocalesForAnswers()`. `/fragen` renders in all eight locales and
 * stays linked from the nav everywhere, but ku/nl/fr/es serve the German
 * original via `resolveAnswerText()`'s fallback, so `buildFragenMetadata()`
 * marks them `noindex` and drops them from hreflang. Reading the same function
 * here is what keeps the sitemap from contradicting the page.
 */
async function loadAnswersLocales(): Promise<{ locales: readonly Locale[]; lastModified?: string }> {
  try {
    const { getReadyLocalesForAnswers, latestAnswerUpdate } = await import('@/content/answers');
    return { locales: getReadyLocalesForAnswers(), lastModified: latestAnswerUpdate() };
  } catch {
    return { locales: [] };
  }
}

/** Shared hreflang-map builder: `urlFor` resolves one locale's URL, `x-default` prefers German when it's included. */
function buildLanguages(urlFor: (locale: Locale) => string, forLocales: readonly Locale[]): Record<string, string> {
  // Bare language codes, identical to what `buildMetadata()` emits in the page
  // head — sitemap and page must never disagree about hreflang. Why bare and
  // not regional: see `hreflangTags` in src/i18n/routing.ts.
  const byTag = Object.fromEntries(forLocales.map((locale) => [hreflangTags[locale], urlFor(locale)]));
  const xDefaultLocale = forLocales.includes(defaultLocale) ? defaultLocale : forLocales[0];
  return { ...byTag, 'x-default': byTag[hreflangTags[xDefaultLocale]] };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Plain static routes — every configured locale. No `lastModified`: none of
  // these pages has a tracked edit date, see the `lastmod` policy above.
  for (const [pathname, config] of Object.entries(staticRoutes) as Array<
    [keyof typeof staticRoutes, RouteSeoConfig]
  >) {
    const languages = buildLanguages((locale) => absoluteUrl(pathname, locale), locales);
    for (const locale of locales) {
      entries.push({
        url: absoluteUrl(pathname, locale),
        changeFrequency: config.changeFrequency,
        priority: config.priority,
        alternates: { languages },
      });
    }
  }

  // GEO answer hub — only the locales the corpus is really written in.
  const answers = await loadAnswersLocales();
  if (answers.locales.length > 0) {
    const languages = buildLanguages((locale) => absoluteUrl('/fragen', locale), answers.locales);
    for (const locale of answers.locales) {
      entries.push({
        url: absoluteUrl('/fragen', locale),
        ...(answers.lastModified && { lastModified: answers.lastModified }),
        changeFrequency: ANSWERS_ROUTE_CONFIG.changeFrequency,
        priority: ANSWERS_ROUTE_CONFIG.priority,
        alternates: { languages },
      });
    }
  }

  // Landesseite Baden-Württemberg — de/tr/en, und mit hoher Priorität: Sie ist
  // die Elternseite des gesamten Städte-Clusters und zielt auf eine der drei
  // Kernabfragen dieses Markts.
  {
    const languages = buildLanguages(
      (locale) => absoluteUrl('/hochzeits-dj-baden-wuerttemberg', locale),
      BW_SUPPORTED_LOCALES,
    );
    for (const locale of BW_SUPPORTED_LOCALES) {
      entries.push({
        url: absoluteUrl('/hochzeits-dj-baden-wuerttemberg', locale),
        changeFrequency: 'monthly',
        priority: 0.9,
        alternates: { languages },
      });
    }
  }

  // Nischen-Landingpage „Türkischer DJ Stuttgart" — de/tr/en. Priorität auf
  // Höhe der Landesseite: Sie zielt auf die einzige Kernabfrage-Gruppe
  // (türkischer dj …), die bis August 2026 gar keine Seite hatte, und
  // beschreibt laut BRAND-FACTS.md das Kerngeschäft.
  {
    const languages = buildLanguages(
      (locale) => absoluteUrl('/tuerkischer-dj-stuttgart', locale),
      TURKISH_DJ_SUPPORTED_LOCALES,
    );
    for (const locale of TURKISH_DJ_SUPPORTED_LOCALES) {
      entries.push({
        url: absoluteUrl('/tuerkischer-dj-stuttgart', locale),
        changeFrequency: 'monthly',
        priority: 0.9,
        alternates: { languages },
      });
    }
  }

  // Landesseite der Türkisch-Nische — de/tr/en, gleiche Priorität wie ihr
  // Stuttgart-Geschwister und die Hochzeits-Landesseite: Sie zielt auf die
  // Landes-Variante derselben Kernabfrage-Gruppe („türkischer dj
  // baden-württemberg", „baden-württemberg türk dj") und ist die Elternseite,
  // über die die Türkisch-Absicht das gesamte Städte-Cluster erreicht.
  {
    const languages = buildLanguages(
      (locale) => absoluteUrl('/tuerkischer-dj-baden-wuerttemberg', locale),
      TURKISH_DJ_SUPPORTED_LOCALES,
    );
    for (const locale of TURKISH_DJ_SUPPORTED_LOCALES) {
      entries.push({
        url: absoluteUrl('/tuerkischer-dj-baden-wuerttemberg', locale),
        changeFrequency: 'monthly',
        priority: 0.9,
        alternates: { languages },
      });
    }
  }

  // Islamische Hochzeit — tr/ku/ar only, same rule as the answer hub above.
  {
    const languages = buildLanguages(
      (locale) => absoluteUrl('/islamische-hochzeit', locale),
      ISLAMIC_SUPPORTED_LOCALES,
    );
    for (const locale of ISLAMIC_SUPPORTED_LOCALES) {
      entries.push({
        url: absoluteUrl('/islamische-hochzeit', locale),
        changeFrequency: ISLAMIC_ROUTE_CONFIG.changeFrequency,
        priority: ISLAMIC_ROUTE_CONFIG.priority,
        alternates: { languages },
      });
    }
  }

  // City cluster — one entry per (city, ready locale), never a fallback to all eight.
  const cities = await loadPublishedCities();
  for (const city of cities) {
    if (city.locales.length === 0) continue;
    const languages = buildLanguages((locale) => absoluteUrl(CITY_PATHNAME, locale, { stadt: city.slug }), city.locales);
    for (const locale of city.locales) {
      entries.push({
        url: absoluteUrl(CITY_PATHNAME, locale, { stadt: city.slug }),
        changeFrequency: CITY_ROUTE_CONFIG.changeFrequency,
        priority: CITY_ROUTE_CONFIG.priority,
        alternates: { languages },
      });
    }
  }

  // Europe reach cluster — hub (restricted locales) + five country pages.
  const regionsData = await loadRegionsData();
  if (regionsData.hubLocales.length > 0) {
    const languages = buildLanguages((locale) => absoluteUrl(REGION_HUB_PATHNAME, locale), regionsData.hubLocales);
    for (const locale of regionsData.hubLocales) {
      entries.push({
        url: absoluteUrl(REGION_HUB_PATHNAME, locale),
        changeFrequency: HUB_ROUTE_CONFIG.changeFrequency,
        priority: HUB_ROUTE_CONFIG.priority,
        alternates: { languages },
      });
    }
  }
  for (const region of regionsData.countries) {
    if (region.locales.length === 0) continue;
    const languages = buildLanguages(
      (locale) => absoluteUrl(REGION_COUNTRY_PATHNAME, locale, { land: region.slug }),
      region.locales,
    );
    for (const locale of region.locales) {
      entries.push({
        url: absoluteUrl(REGION_COUNTRY_PATHNAME, locale, { land: region.slug }),
        changeFrequency: REGION_COUNTRY_ROUTE_CONFIG.changeFrequency,
        priority: REGION_COUNTRY_ROUTE_CONFIG.priority,
        alternates: { languages },
      });
    }
  }

  // Ratgeber/Blog index + articles — withheld until the page routes exist, see `BLOG_ROUTES_LIVE`.
  if (BLOG_ROUTES_LIVE) {
    const blogIndex = await loadBlogIndexLocales();
    if (blogIndex.locales.length > 0) {
      const blogIndexLanguages = buildLanguages((locale) => absoluteUrl('/ratgeber', locale), blogIndex.locales);
      for (const locale of blogIndex.locales) {
        entries.push({
          url: absoluteUrl('/ratgeber', locale),
          ...(blogIndex.lastModified && { lastModified: blogIndex.lastModified }),
          changeFrequency: BLOG_INDEX_ROUTE_CONFIG.changeFrequency,
          priority: BLOG_INDEX_ROUTE_CONFIG.priority,
          alternates: { languages: blogIndexLanguages },
        });
      }
    }

    // 15 published guides, template recaps excluded (see `loadPublishedBlogPosts()`).
    const posts = await loadPublishedBlogPosts();
    for (const post of posts) {
      if (post.locales.length === 0) continue;
      const languages = buildLanguages(
        (locale) => absoluteUrl(BLOG_ARTICLE_PATHNAME, locale, { slug: slugFor(post, locale) }),
        post.locales,
      );
      for (const locale of post.locales) {
        entries.push({
          url: absoluteUrl(BLOG_ARTICLE_PATHNAME, locale, { slug: slugFor(post, locale) }),
          ...(post.lastModified && { lastModified: post.lastModified }),
          changeFrequency: BLOG_ARTICLE_ROUTE_CONFIG.changeFrequency,
          priority: BLOG_ARTICLE_ROUTE_CONFIG.priority,
          alternates: { languages },
        });
      }
    }
  }

  return entries;
}
