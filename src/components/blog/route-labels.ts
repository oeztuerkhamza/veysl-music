import type { Locale } from '@/i18n/routing';
import type { StaticPathname } from '@/lib/seo';
import { BW_SUPPORTED_LOCALES } from '@/content/region-bw';
import { TURKISH_DJ_SUPPORTED_LOCALES } from '@/content/turkish-dj';

/**
 * Maps a static route (as referenced by `BlogPost.links` in
 * `@/content/blog/types.ts`) to the dotted key of an ALREADY translated label
 * used for that same route elsewhere on the site (nav/footer/the `/fragen`
 * page's own H1) — so a blog post never invents new link copy, it just
 * reuses what the rest of the site already says. Resolve with a root-level
 * translator, e.g. `getTranslations()` with no namespace, then
 * `t(BLOG_ROUTE_LABEL_KEY[path])`.
 *
 * Mirrors `src/app/[locale]/fragen/route-labels.ts` (same idea, same
 * shape) — kept as a local copy rather than importing across a route
 * boundary, since this task's ownership is `src/components/blog/**` only.
 */
export const BLOG_ROUTE_LABEL_KEY: Partial<Record<StaticPathname, string>> = {
  '/hochzeit-events': 'nav.services',
  // Beide Cluster-Geldseiten tragen keyword-haltige Nav-Labels
  // („Hochzeits-DJ Baden-Württemberg" / „Türkischer DJ Stuttgart") — genau
  // die Anker, die der Blog an sie weitergeben soll. Beide Seiten gibt es nur
  // auf de/tr/en, die Artikel inzwischen auch auf nl/fr/es — siehe
  // `BLOG_ROUTE_LOCALES` unten.
  '/hochzeits-dj-baden-wuerttemberg': 'nav.badenWuerttemberg',
  '/tuerkischer-dj-stuttgart': 'nav.turkishDj',
  '/pakete': 'nav.packages',
  '/echte-hochzeiten': 'nav.weddings',
  '/ablauf': 'nav.process',
  '/anfrage': 'nav.booking',
  '/galerie': 'nav.gallery',
  '/epk': 'nav.epk',
  '/kontakt': 'nav.contact',
  // No `nav.*` entry exists for `/fragen` — reuse that page's own eyebrow copy.
  '/fragen': 'answers.hero.eyebrow',
  '/datenschutz': 'footer.privacy',
};

/**
 * Routes from `BLOG_ROUTE_LABEL_KEY` that exist in only some locales. A
 * nl/fr/es article linked `/tuerkischer-dj-stuttgart` to a page that 404s in
 * those languages, with a raw `nav.turkishDj` as its anchor (seo check,
 * 2026-10-23) — the link is dropped there instead. Routes not listed exist in
 * every locale.
 */
export const BLOG_ROUTE_LOCALES: Partial<Record<StaticPathname, readonly Locale[]>> = {
  '/hochzeits-dj-baden-wuerttemberg': BW_SUPPORTED_LOCALES,
  '/tuerkischer-dj-stuttgart': TURKISH_DJ_SUPPORTED_LOCALES,
};
