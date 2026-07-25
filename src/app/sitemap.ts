import type { MetadataRoute } from 'next';
import { locales, defaultLocale, localeTags, type Locale } from '@/i18n/routing';
import { absoluteUrl, type StaticPathname, type DynamicPathname } from '@/lib/seo';

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
 * Every plain static route from `routing.pathnames` gets an explicit
 * priority/changeFrequency here. Typed as
 * `Record<Exclude<StaticPathname, '/hochzeits-dj-europa' | '/ratgeber'>, …>`
 * so a new route added to routing.ts fails to compile here until it's
 * classified — the sitemap can't silently miss it. Legal pages are
 * deliberately low priority/low frequency.
 *
 * Two exclusions, both on purpose:
 * - `/hochzeits-dj-europa` (the Europe reach hub): NOT available in all seven
 *   locales, unlike every other entry here — see `HUB_ROUTE_CONFIG` and
 *   `loadRegionsData()` below.
 * - `/ratgeber` (blog index): verified live (curled 2026-07-25) that
 *   `src/app/[locale]/ratgeber/` does not exist yet — only the content module
 *   (`src/content/blog/`) has landed. Emitting it now would reintroduce
 *   exactly the "sitemap lists URLs that 404" bug this file was already fixed
 *   for once. See `BLOG_ROUTES_LIVE` below — flip that one flag once the page
 *   routes ship and both this index and the article cluster switch on
 *   together.
 */
const staticRoutes: Record<Exclude<StaticPathname, '/hochzeits-dj-europa' | '/ratgeber'>, RouteSeoConfig> = {
  '/': { changeFrequency: 'weekly', priority: 1 },
  '/hochzeit-events': { changeFrequency: 'monthly', priority: 0.8 },
  '/pakete': { changeFrequency: 'monthly', priority: 0.9 },
  '/echte-hochzeiten': { changeFrequency: 'monthly', priority: 0.8 },
  '/musik': { changeFrequency: 'monthly', priority: 0.7 },
  '/ablauf': { changeFrequency: 'monthly', priority: 0.7 },
  '/anfrage': { changeFrequency: 'monthly', priority: 0.9 },
  '/galerie': { changeFrequency: 'monthly', priority: 0.6 },
  // GEO answer hub — ~40 Q&As, FAQPage-marked, deliberately the most citable,
  // most content-dense page on the site. Weekly since it's expected to grow.
  '/fragen': { changeFrequency: 'weekly', priority: 0.9 },
  '/epk': { changeFrequency: 'monthly', priority: 0.4 },
  '/kontakt': { changeFrequency: 'yearly', priority: 0.5 },
  '/impressum': { changeFrequency: 'yearly', priority: 0.1 },
  '/datenschutz': { changeFrequency: 'yearly', priority: 0.1 },
};

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
  slug: string;
  /** Locales this specific entry actually has real, translated content for — never a blanket fallback to all seven. */
  locales: readonly Locale[];
}

/**
 * `src/content/cities.ts` (owned by the city-pages agent) is the single
 * source of truth for BOTH questions this needs answered — do not
 * re-implement either check here:
 * - `getAllCities()` already filters out `priority: 3` (withheld) cities, so
 *   only genuinely published pages are considered.
 * - `getReadyLocalesForCity()` computes, per city, which locales actually
 *   have real intro/angle/FAQ prose (`hasCityProse()`) — currently de/tr/en
 *   for every city, NOT all seven. This is what stops the sitemap from
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
 * only de/en/nl today, NOT all seven, because the `regions` message
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
 * in src/content/blog/types.ts), never all seven. Same guard as cities/regions.
 */
async function loadPublishedBlogPosts(): Promise<LocalizedEntry[]> {
  try {
    const { getPublishedGuides, getReadyLocalesForPost } = await import('@/content/blog');
    return getPublishedGuides().map((post) => ({
      slug: post.slug,
      locales: getReadyLocalesForPost(post),
    }));
  } catch {
    return [];
  }
}

/** Shared hreflang-map builder: `urlFor` resolves one locale's URL, `x-default` prefers German when it's included. */
function buildLanguages(urlFor: (locale: Locale) => string, forLocales: readonly Locale[]): Record<string, string> {
  const byTag = Object.fromEntries(forLocales.map((locale) => [localeTags[locale], urlFor(locale)]));
  const xDefaultLocale = forLocales.includes(defaultLocale) ? defaultLocale : forLocales[0];
  return { ...byTag, 'x-default': byTag[localeTags[xDefaultLocale]] };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // Plain static routes — every configured locale.
  for (const [pathname, config] of Object.entries(staticRoutes) as Array<
    [Exclude<StaticPathname, '/hochzeits-dj-europa' | '/ratgeber'>, RouteSeoConfig]
  >) {
    const languages = buildLanguages((locale) => absoluteUrl(pathname, locale), locales);
    for (const locale of locales) {
      entries.push({
        url: absoluteUrl(pathname, locale),
        lastModified,
        changeFrequency: config.changeFrequency,
        priority: config.priority,
        alternates: { languages },
      });
    }
  }

  // City cluster — one entry per (city, ready locale), never a fallback to all seven.
  const cities = await loadPublishedCities();
  for (const city of cities) {
    if (city.locales.length === 0) continue;
    const languages = buildLanguages((locale) => absoluteUrl(CITY_PATHNAME, locale, { stadt: city.slug }), city.locales);
    for (const locale of city.locales) {
      entries.push({
        url: absoluteUrl(CITY_PATHNAME, locale, { stadt: city.slug }),
        lastModified,
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
        lastModified,
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
        lastModified,
        changeFrequency: REGION_COUNTRY_ROUTE_CONFIG.changeFrequency,
        priority: REGION_COUNTRY_ROUTE_CONFIG.priority,
        alternates: { languages },
      });
    }
  }

  // Ratgeber/Blog index + articles — withheld until the page routes exist, see `BLOG_ROUTES_LIVE`.
  if (BLOG_ROUTES_LIVE) {
    const blogIndexLanguages = buildLanguages((locale) => absoluteUrl('/ratgeber', locale), locales);
    for (const locale of locales) {
      entries.push({
        url: absoluteUrl('/ratgeber', locale),
        lastModified,
        changeFrequency: BLOG_INDEX_ROUTE_CONFIG.changeFrequency,
        priority: BLOG_INDEX_ROUTE_CONFIG.priority,
        alternates: { languages: blogIndexLanguages },
      });
    }

    // 15 published guides, template recaps excluded (see `loadPublishedBlogPosts()`).
    const posts = await loadPublishedBlogPosts();
    for (const post of posts) {
      if (post.locales.length === 0) continue;
      const languages = buildLanguages(
        (locale) => absoluteUrl(BLOG_ARTICLE_PATHNAME, locale, { slug: post.slug }),
        post.locales,
      );
      for (const locale of post.locales) {
        entries.push({
          url: absoluteUrl(BLOG_ARTICLE_PATHNAME, locale, { slug: post.slug }),
          lastModified,
          changeFrequency: BLOG_ARTICLE_ROUTE_CONFIG.changeFrequency,
          priority: BLOG_ARTICLE_ROUTE_CONFIG.priority,
          alternates: { languages },
        });
      }
    }
  }

  return entries;
}
