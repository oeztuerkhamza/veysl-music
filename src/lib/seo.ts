import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getPathname } from '@/i18n/navigation';
import { locales, defaultLocale, hreflangTags, ogLocales, type AppPathname, type Locale } from '@/i18n/routing';
import { site } from '@/content/site';

/**
 * The dynamic routes currently registered in `routing.pathnames`. If another
 * dynamic segment is added later, extend this union and `RouteParamsMap`
 * below — `StaticPathname`/the various `Record<StaticPathname, …>` maps in
 * this file will then fail to compile until the new route is wired up
 * everywhere, which is the point.
 */
export type DynamicPathname = '/hochzeits-dj/[stadt]' | '/hochzeits-dj-europa/[land]' | '/ratgeber/[slug]';
export type StaticPathname = Exclude<AppPathname, DynamicPathname>;

interface RouteParamsMap {
  '/hochzeits-dj/[stadt]': { stadt: string };
  '/hochzeits-dj-europa/[land]': { land: string };
  '/ratgeber/[slug]': { slug: string };
}

/**
 * Full `next-intl` message namespace to read `title`/`description` from, per
 * route. Typed as `Record<AppPathname, string>` so a new route added to
 * routing.ts is a compile error here until classified — the mapping can't
 * silently miss a route.
 *
 * The plain static routes each get their own `meta.<key>` namespace. Content-
 * owning agents' routes (city, GEO-answers, regions, blog) deliberately do
 * NOT get a duplicated `meta.*` entry: each of those owns its own
 * `<namespace>.meta.title` / `.description` directly in messages/*.json —
 * duplicating those strings here would only let the two copies drift apart,
 * so this map just points at theirs.
 */
const messageNamespaceByPathname: Record<AppPathname, string> = {
  '/': 'meta.home',
  '/hochzeit-events': 'meta.services',
  '/pakete': 'meta.packages',
  '/echte-hochzeiten': 'meta.weddings',
  '/ablauf': 'meta.process',
  '/anfrage': 'meta.booking',
  '/hochzeits-dj/[stadt]': 'city.meta',
  // Landesseite Baden-Württemberg — eigener Namespace, wie die Cluster oben.
  '/hochzeits-dj-baden-wuerttemberg': 'bw.meta',
  // Nischen-Landingpage „Türkischer DJ Stuttgart" — de/tr/en, siehe
  // TURKISH_DJ_SUPPORTED_LOCALES in src/content/turkish-dj.ts.
  '/tuerkischer-dj-stuttgart': 'turkishDj.meta',
  // Landesseite der Türkisch-Nische — gleicher Sprachumfang wie die
  // Stuttgart-Seite, eigener Namespace (die Stuttgart-Texte sind ortsgebunden
  // und dürfen nicht für die Landes-Abfrage recycelt werden).
  '/tuerkischer-dj-baden-wuerttemberg': 'turkishDjBw.meta',
  // Bundes-Seite derselben Nische — Kopfabfrage „türkischer dj" /
  // „türk dj almanya", eigener Namespace aus demselben Grund.
  '/tuerkischer-dj-deutschland': 'turkishDjDe.meta',
  // Europe reach cluster — owned by the regions agent (src/content/regions.ts).
  '/hochzeits-dj-europa': 'regions.hub.meta',
  '/hochzeits-dj-europa/[land]': 'regions.country.meta',
  '/galerie': 'meta.gallery',
  // Islamische Hochzeit — own `islamic.meta` namespace, same pattern as the
  // city/regions/blog clusters: the page owns its copy, this map only points.
  '/islamische-hochzeit': 'islamic.meta',
  // GEO answer hub — owned by the answers/GEO agent, same pattern as `city.meta`:
  // read their `answers.meta.title` / `.description` directly, no duplicate namespace.
  '/fragen': 'answers.meta',
  // Ratgeber/Blog — owned by the blog agent. The index reads `blog.meta.*`
  // directly. The article route only needs a valid namespace to satisfy the
  // `Record<AppPathname, string>` type; each post carries its own literal
  // `BlogSeo.metaTitle`/`.metaDescription` (src/content/blog/types.ts) and the
  // page overrides `title`/`description` on the returned object with those —
  // `blog.meta` here is just a harmless fallback, never the real source.
  '/ratgeber': 'blog.meta',
  '/ratgeber/[slug]': 'blog.meta',
  '/epk': 'meta.epk',
  '/kontakt': 'meta.contact',
  '/impressum': 'meta.imprint',
  '/datenschutz': 'meta.privacy',
};

/**
 * Overridable so preview/staging deployments don't emit canonicals pointing at
 * prod. Shared by sitemap.ts / robots.ts / manifest.ts for one source of truth.
 *
 * The emptiness check is not defensive padding — it is the difference between
 * a working build and a broken one. `??` only falls back on null/undefined,
 * but a Docker `ARG` that is declared and left unset arrives as the empty
 * string, so the fallback never fired and `absoluteUrl()` called
 * `new URL('/ablauf', '')`. That throws `ERR_INVALID_URL` during
 * prerendering and aborts the entire production build, with an error that
 * names a page and looks nothing like a missing environment variable.
 */
export function siteBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return configured ? configured : site.url;
}

/**
 * Absolute, locale-correct URL for a static app route. Always resolved through
 * `getPathname` from `@/i18n/navigation` so localized slugs (`/pakete` vs
 * `/packages` vs `/paketler` vs `/paket` …) are never hand-built.
 */
export function absoluteUrl<P extends StaticPathname>(pathname: P, locale: Locale): string;
/** Absolute URL for a dynamic route — params are required and substituted identically across locales. */
export function absoluteUrl<P extends DynamicPathname>(pathname: P, locale: Locale, params: RouteParamsMap[P]): string;
export function absoluteUrl(pathname: AppPathname, locale: Locale, params?: Record<string, string>): string {
  const href = params ? { pathname, params } : pathname;
  // The cast reflects next-intl's own conditional `href` type (plain string for
  // static routes, `{ pathname, params }` for dynamic ones) — the two public
  // overloads above are what keep call sites type-safe, not this line.
  const localizedPath = getPathname({ href: href as never, locale });
  return new URL(localizedPath, siteBaseUrl()).toString();
}

/** Absolute URL for a static asset (OG image, logo, …) — not a routed page. */
export function absoluteAssetUrl(assetPath: string): string {
  return new URL(assetPath, siteBaseUrl()).toString();
}

export interface OgImage {
  url: string;
  width?: number;
  height?: number;
  alt: string;
}

/**
 * Standard-Share-Bild. Erzeugt von `scripts/generate-og-image.mjs` — dort
 * steht auch, warum es eine statische Datei ist und keine Laufzeit-Generierung
 * über `next/og` (die scheitert hier reproduzierbar an sharp/libvips).
 *
 * Vorher zeigte das hier auf `/og-image.jpg` — eine Datei, die es nie gab.
 * Jede geteilte URL lieferte damit eine kaputte Vorschau, in allen sieben
 * Sprachen.
 */
const DEFAULT_OG_IMAGE: OgImage = {
  url: '/og-image.png',
  width: 1200,
  height: 630,
  alt: `${site.name} — ${site.tagline.de}`,
};

interface BuildMetadataBase<P extends AppPathname> {
  /** Current request locale. */
  locale: Locale;
  /** The German route key from `routing.pathnames` — not the localized slug. */
  pathname: P;
  /** ICU interpolation values for the meta title/description, e.g. `{ city: cityName }`. */
  values?: Record<string, string | number>;
  /** Marks legal/utility/thank-you pages as noindex. */
  noIndex?: boolean;
  /** Per-page OG/Twitter image. Falls back to `DEFAULT_OG_IMAGE`. */
  image?: OgImage;
  /**
   * Restricts hreflang/OG alternates to locales that actually have real,
   * translated content for THIS page. Defaults to every configured locale
   * (`routing.locales`) — override this for pages (city/region/blog clusters
   * in particular) that don't ship all eight languages yet. Asserting
   * hreflang for a locale with thin or missing content is worse than
   * omitting it.
   */
  availableLocales?: Locale[];
}

/**
 * Builds a complete Next.js `Metadata` object for a static page. Every page's
 * `generateMetadata` should be a thin wrapper around this.
 */
export async function buildMetadata<P extends StaticPathname>(options: BuildMetadataBase<P>): Promise<Metadata>;
/**
 * Builds metadata for a dynamic route (`/hochzeits-dj/[stadt]`,
 * `/hochzeits-dj-europa/[land]`, or `/ratgeber/[slug]`). `params` is
 * substituted identically across every included locale's URL so hreflang
 * alternates always point at the same city/country/article, never dropping
 * the parameter for one locale.
 *
 * City example — title/description read from `city.meta.title` /
 * `city.meta.description` (owned by the city-pages agent), pass the display
 * name via `values: { city: cityName }` to fill their `{city}` placeholder:
 * ```ts
 * buildMetadata({
 *   locale, pathname: '/hochzeits-dj/[stadt]',
 *   params: { stadt: city.slug },
 *   values: { city: city.name },
 *   availableLocales: city.locales, // omit only once every locale has real copy
 * });
 * ```
 * Country pages follow the identical pattern against `regions.country.meta`
 * with `params: { land: region.slug }` and `values: { country: region.name }`.
 */
export async function buildMetadata<P extends DynamicPathname>(
  options: BuildMetadataBase<P> & {
    params: RouteParamsMap[P];
    /**
     * Per-locale route params, for clusters whose slug differs by language.
     *
     * Without this, hreflang substituted ONE set of params into every locale's
     * URL — correct for cities and countries (`karlsruhe` is `karlsruhe` in
     * all eight) but wrong for blog articles once they gained localized slugs:
     * the Turkish alternate would have pointed at
     * `/tr/rehber/<german-slug>`, a URL that no longer exists. Any locale
     * missing from this map falls back to `params`, so existing callers keep
     * their previous behaviour exactly.
     */
    paramsByLocale?: Partial<Record<Locale, RouteParamsMap[P]>>;
  },
): Promise<Metadata>;
export async function buildMetadata(
  options: BuildMetadataBase<AppPathname> & {
    params?: Record<string, string>;
    paramsByLocale?: Partial<Record<Locale, Record<string, string>>>;
  },
): Promise<Metadata> {
  const { locale, pathname, values, noIndex = false, image, params, paramsByLocale, availableLocales = locales } = options;

  const namespace = messageNamespaceByPathname[pathname];
  const t = await getTranslations({ locale, namespace });
  const title = t('title', values);
  const description = t('description', values);

  const urlFor = (forLocale: Locale): string => {
    const localeParams = paramsByLocale?.[forLocale] ?? params;
    return localeParams
      ? absoluteUrl(pathname as DynamicPathname, forLocale, localeParams as RouteParamsMap[DynamicPathname])
      : absoluteUrl(pathname as StaticPathname, forLocale);
  };

  const canonical = urlFor(locale);

  // The current page's own locale must always be reachable via hreflang, even
  // if a caller's `availableLocales` omits it by mistake.
  const hreflangLocales = availableLocales.includes(locale) ? availableLocales : [...availableLocales, locale];
  // `hreflangTags`, not `localeTags`: bare language codes so e.g. Turkish
  // speakers IN GERMANY (the core audience) match `tr` — `tr-TR` only matched
  // Turkey. See the map's comment in src/i18n/routing.ts.
  const languages = Object.fromEntries(hreflangLocales.map((l) => [hreflangTags[l], urlFor(l)]));
  const xDefaultLocale = hreflangLocales.includes(defaultLocale) ? defaultLocale : locale;

  const ogImage = image ?? DEFAULT_OG_IMAGE;
  const ogImageUrl = ogImage.url.startsWith('http') ? ogImage.url : absoluteAssetUrl(ogImage.url);

  const alternateLocale = hreflangLocales.filter((l) => l !== locale).map((l) => ogLocales[l]);

  return {
    // `absolute`, not a bare string: the root layout
    // (src/app/[locale]/layout.tsx) declares `title.template = '%s | DJ Veys'`,
    // and EVERY title in messages/*.json already ends in the brand
    // ("Pakete & Preise — Hochzeits-DJ | DJ Veys"). A plain string therefore
    // went through the template and shipped `… | DJ Veys | DJ Veys` on 14 of
    // 15 route families in all seven locales — only the home page escaped it.
    // Google truncates the title around 580px, so the duplicate ate the
    // keyword tail of every SERP entry. Fixing it here rather than stripping
    // the brand from 119 message strings keeps the brand in the translators'
    // hands, where the separator style (— vs |) is a per-language decision.
    // The layout's `template`/`default` still cover any route that does not
    // come through this builder.
    title: { absolute: title },
    description,
    alternates: {
      canonical,
      languages: {
        ...languages,
        // AI crawlers and Google both fall back to x-default when a user's
        // locale doesn't match any hreflang — point it at German if it's
        // among the available locales for this page, otherwise at the
        // page's own locale.
        'x-default': languages[hreflangTags[xDefaultLocale]],
      },
    },
    openGraph: {
      type: 'website',
      locale: ogLocales[locale],
      alternateLocale,
      siteName: site.name,
      url: canonical,
      title,
      description,
      images: [{ url: ogImageUrl, width: ogImage.width, height: ogImage.height, alt: ogImage.alt }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
    robots: noIndex
      ? // `follow: true`, not `nofollow`. These pages are excluded from the
        // index, not from the site: the legal pages sit in every footer and
        // the empty-shell locales of `/ratgeber` and `/fragen` link straight
        // back into the real de/tr/en content. `nofollow` told crawlers to
        // drop every one of those links, which throws away discovery paths
        // and link equity for no benefit — `noindex` alone already keeps the
        // page itself out of results, which is the whole intent.
        { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
  };
}
