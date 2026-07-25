import type { StaticPathname } from '@/lib/seo';

/**
 * Maps a static route (as referenced by `Answer.links` in
 * `@/content/answers`) to the dotted key of an ALREADY translated label used
 * for that same route elsewhere on the site (nav/footer) — so this page
 * never invents new copy for a link, it just reuses what the header/footer
 * already say. Resolve with a root-level translator, e.g. `getTranslations()`
 * with no namespace, then `t(ROUTE_LABEL_KEY[path])`.
 */
export const ROUTE_LABEL_KEY: Partial<Record<StaticPathname, string>> = {
  '/hochzeit-events': 'nav.services',
  '/pakete': 'nav.packages',
  '/echte-hochzeiten': 'nav.weddings',
  '/musik': 'nav.music',
  '/ablauf': 'nav.process',
  '/anfrage': 'nav.booking',
  '/galerie': 'nav.gallery',
  '/epk': 'nav.epk',
  '/kontakt': 'nav.contact',
  '/datenschutz': 'footer.privacy',
};
