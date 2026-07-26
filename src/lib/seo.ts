import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getPathname } from '@/i18n/navigation';
import { locales, defaultLocale, localeTags, ogLocales, type AppPathname, type Locale } from '@/i18n/routing';
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
  '/musik': 'meta.music',
  '/ablauf': 'meta.process',
  '/anfrage': 'meta.booking',
  '/hochzeits-dj/[stadt]': 'city.meta',
  // Europe reach cluster — owned by the regions agent (src/content/regions.ts).
  '/hochzeits-dj-europa': 'regions.hub.meta',
  '/hochzeits-dj-europa/[land]': 'regions.country.meta',
  '/galerie': 'meta.gallery',
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
 */
export function siteBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? site.url;
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
   * in particular) that don't ship all seven languages yet. Asserting
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
  options: BuildMetadataBase<P> & { params: RouteParamsMap[P] },
): Promise<Metadata>;
export async function buildMetadata(
  options: BuildMetadataBase<AppPathname> & { params?: Record<string, string> },
): Promise<Metadata> {
  const { locale, pathname, values, noIndex = false, image, params, availableLocales = locales } = options;

  const namespace = messageNamespaceByPathname[pathname];
  const t = await getTranslations({ locale, namespace });
  const title = t('title', values);
  const description = t('description', values);

  const urlFor = (forLocale: Locale): string =>
    params
      ? absoluteUrl(pathname as DynamicPathname, forLocale, params as RouteParamsMap[DynamicPathname])
      : absoluteUrl(pathname as StaticPathname, forLocale);

  const canonical = urlFor(locale);

  // The current page's own locale must always be reachable via hreflang, even
  // if a caller's `availableLocales` omits it by mistake.
  const hreflangLocales = availableLocales.includes(locale) ? availableLocales : [...availableLocales, locale];
  const languages = Object.fromEntries(hreflangLocales.map((l) => [localeTags[l], urlFor(l)]));
  const xDefaultLocale = hreflangLocales.includes(defaultLocale) ? defaultLocale : locale;

  const ogImage = image ?? DEFAULT_OG_IMAGE;
  const ogImageUrl = ogImage.url.startsWith('http') ? ogImage.url : absoluteAssetUrl(ogImage.url);

  const alternateLocale = hreflangLocales.filter((l) => l !== locale).map((l) => ogLocales[l]);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ...languages,
        // AI crawlers and Google both fall back to x-default when a user's
        // locale doesn't match any hreflang — point it at German if it's
        // among the available locales for this page, otherwise at the
        // page's own locale.
        'x-default': languages[localeTags[xDefaultLocale]],
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
      ? { index: false, follow: false }
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
