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
  // Nur in tr/ku/ar vorhanden (ISLAMIC_SUPPORTED_LOCALES). In den übrigen fünf
  // Sprachen fehlt der Key, `t()` würde die Rohbezeichnung ausgeben — deshalb
  // filtert die Fragen-Seite diesen Link dort heraus, statt ihn zu übersetzen.
  '/islamische-hochzeit': 'nav.islamicWedding',
  // Nur in de/tr/en (TURKISH_DJ_SUPPORTED_LOCALES) — gleiche Filter-Mechanik
  // in der Fragen-Seite wie beim islamischen Eintrag darüber.
  '/tuerkischer-dj-stuttgart': 'nav.turkishDj',
  '/tuerkischer-dj-baden-wuerttemberg': 'nav.turkishDjBw',
  '/pakete': 'nav.packages',
  '/echte-hochzeiten': 'nav.weddings',
  '/ablauf': 'nav.process',
  '/anfrage': 'nav.booking',
  '/galerie': 'nav.gallery',
  '/epk': 'nav.epk',
  '/kontakt': 'nav.contact',
  '/datenschutz': 'footer.privacy',
};
