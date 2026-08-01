import { defineRouting } from 'next-intl/routing';

/**
 * Sieben Sprachen. Die Reihenfolge steuert auch den Sprachumschalter.
 *
 * de — Hauptmarkt (.de-Domain, Region Stuttgart)
 * tr — türkischsprachige Paare in Deutschland (Kernzielgruppe)
 * ku — kurdischsprachige Paare (Kurmancî, lateinische Schrift)
 * en — internationale und Destination Weddings
 * nl — Niederlande und Flandern (Belgien); große türkische Community
 * fr — Grenzregion Elsass/Frankreich, außerdem Wallonien (Belgien)
 * es — spanischsprachige Paare
 *
 * Hinweis Belgien: kein eigenes Locale nötig — Flandern wird über nl,
 * Wallonien über fr und die Ostkantone über de abgedeckt.
 */
export const locales = ['de', 'tr', 'ku', 'en', 'nl', 'fr', 'es'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'de';

/** Anzeigename im Sprachumschalter — immer in der jeweiligen Sprache selbst. */
export const localeNames: Record<Locale, string> = {
  de: 'Deutsch',
  tr: 'Türkçe',
  ku: 'Kurdî',
  en: 'English',
  nl: 'Nederlands',
  fr: 'Français',
  es: 'Español',
};

/** BCP-47 für <html lang>, Intl-Formatierung und og:locale. */
export const localeTags: Record<Locale, string> = {
  de: 'de-DE',
  tr: 'tr-TR',
  ku: 'ku',
  en: 'en-GB',
  nl: 'nl-NL',
  fr: 'fr-FR',
  es: 'es-ES',
};

export const ogLocales: Record<Locale, string> = {
  de: 'de_DE',
  tr: 'tr_TR',
  ku: 'ku',
  en: 'en_GB',
  nl: 'nl_NL',
  fr: 'fr_FR',
  es: 'es_ES',
};

/**
 * Lokalisierte Slugs — jede Sprache bekommt eigene, keyword-optimierte URLs.
 * Siehe Projektplan A.8 (Mehrsprachigkeit) und A.5 (On-Page SEO).
 *
 * ⚠️ Die kurdischen Slugs sind zur Prüfung durch den Übersetzer markiert.
 */
export const pathnames = {
  '/': '/',
  '/hochzeit-events': {
    de: '/hochzeit-events',
    tr: '/dugun-etkinlik',
    ku: '/dawet-u-sahi',
    en: '/weddings-events',
    nl: '/bruiloften-events',
    fr: '/mariages-evenements',
    es: '/bodas-eventos',
  },
  '/pakete': {
    de: '/pakete',
    tr: '/paketler',
    ku: '/paket',
    en: '/packages',
    nl: '/pakketten',
    fr: '/formules',
    es: '/paquetes',
  },
  '/echte-hochzeiten': {
    de: '/echte-hochzeiten',
    tr: '/gercek-dugunler',
    ku: '/daweten-rastin',
    en: '/real-weddings',
    nl: '/echte-bruiloften',
    fr: '/vrais-mariages',
    es: '/bodas-reales',
  },
  '/musik': {
    de: '/musik',
    tr: '/muzik',
    ku: '/muzika',
    en: '/music',
    nl: '/muziek',
    fr: '/musique',
    es: '/musica',
  },
  '/ablauf': {
    de: '/ablauf',
    tr: '/nasil-calisiyoruz',
    ku: '/pevajo',
    en: '/how-it-works',
    nl: '/werkwijze',
    fr: '/deroulement',
    es: '/proceso',
  },
  '/anfrage': {
    de: '/anfrage',
    tr: '/teklif-al',
    ku: '/daxwaz',
    en: '/booking',
    nl: '/aanvraag',
    fr: '/demande',
    es: '/solicitud',
  },
  /**
   * Programmatische Local-SEO-Landingpages: eine Seite pro Stadt im
   * Einzugsgebiet (~200 km um Stuttgart). Stärkster Hebel für
   * "Hochzeits-DJ <Stadt>"-Suchanfragen. Siehe src/content/cities.ts.
   */
  '/hochzeits-dj/[stadt]': {
    de: '/hochzeits-dj/[stadt]',
    tr: '/dugun-dj/[stadt]',
    ku: '/dj-dawete/[stadt]',
    en: '/wedding-dj/[stadt]',
    nl: '/bruiloft-dj/[stadt]',
    fr: '/dj-mariage/[stadt]',
    es: '/dj-boda/[stadt]',
  },
  /**
   * Landes-Ebene: „Hochzeits-DJ Baden-Württemberg".
   *
   * Diese Suchanfrage gehört laut docs/SEO-COMPETITIVE-ANALYSIS.md §1 zu den
   * drei Kernabfragen dieses Markts — und hatte bis hierher **keine Seite**.
   * Die Startseite zielt auf Stuttgart, die Stadtseiten je auf ihre Stadt,
   * `/hochzeits-dj-europa` auf Länder außerhalb Deutschlands. Die Ebene
   * dazwischen, das eigene Bundesland, war unbesetzt; „Baden-Württemberg" kam
   * nur in Fließtext vor, in keinem Titel und keiner Überschrift.
   *
   * Sie ist zugleich der fehlende Knoten im Städte-Cluster: Die acht
   * Stadtseiten hatten keine gemeinsame Elternseite (`/hochzeits-dj` lief in
   * einen 404), verlinkten sich also nur seitwärts über `nearby`.
   */
  '/hochzeits-dj-baden-wuerttemberg': {
    de: '/hochzeits-dj-baden-wuerttemberg',
    tr: '/dugun-dj-baden-wuerttemberg',
    ku: '/dj-dawete-baden-wuerttemberg',
    en: '/wedding-dj-baden-wuerttemberg',
    nl: '/bruiloft-dj-baden-wuerttemberg',
    fr: '/dj-mariage-baden-wuerttemberg',
    es: '/dj-boda-baden-wuerttemberg',
  },
  /**
   * Reichweiten-Ebene: europaweite Buchbarkeit auf **Länder**-Ebene, bewusst
   * nicht auf Städte-Ebene. Städteseiten außerhalb der Kernregion wären
   * Doorway Pages und würden das lokale Cluster gefährden, das tatsächlich
   * rankt. Siehe src/content/regions.ts und docs/SEO-EUROPE-STRATEGY.md.
   */
  '/hochzeits-dj-europa': {
    de: '/hochzeits-dj-europa',
    tr: '/dugun-dj-avrupa',
    ku: '/dj-dawete-ewropa',
    en: '/wedding-dj-europe',
    nl: '/bruiloft-dj-europa',
    fr: '/dj-mariage-europe',
    es: '/dj-boda-europa',
  },
  '/hochzeits-dj-europa/[land]': {
    de: '/hochzeits-dj-europa/[land]',
    tr: '/dugun-dj-avrupa/[land]',
    ku: '/dj-dawete-ewropa/[land]',
    en: '/wedding-dj-europe/[land]',
    nl: '/bruiloft-dj-europa/[land]',
    fr: '/dj-mariage-europe/[land]',
    es: '/dj-boda-europa/[land]',
  },
  '/galerie': {
    de: '/galerie',
    tr: '/galeri',
    ku: '/wene-u-video',
    en: '/gallery',
    nl: '/fotos-videos',
    fr: '/galerie-photos',
    es: '/galeria',
  },
  /**
   * Islamische/religiös geprägte Hochzeiten — eigene Landingpage, weil das
   * die einzige Suchintention im ganzen Keyword-Map ist, für die es im
   * deutschsprachigen Markt praktisch kein Angebot gibt: Anbieter positionieren
   * sich entweder religiös ODER als Party-DJ, nie als beides. Genau diese
   * Kombination ist hier aber das Produkt. Inhalt: messages/*.json →
   * "islamic", Fragen aus src/content/answers.ts (Kategorie `islamisch`),
   * Begründung in docs/SEO-KEYWORD-MAP.md §5.
   *
   * Nur de/tr/en — siehe ISLAMIC_SUPPORTED_LOCALES in src/content/islamic.ts.
   */
  '/islamische-hochzeit': {
    de: '/islamische-hochzeit',
    tr: '/islami-dugun',
    ku: '/daweta-islami',
    en: '/islamic-wedding',
    nl: '/islamitische-bruiloft',
    fr: '/mariage-musulman',
    es: '/boda-islamica',
  },
  /**
   * Antwort-Hub für GEO (Generative Engine Optimization): ~40 ausführlich
   * beantwortete Fragen, server-gerendert und FAQPage-ausgezeichnet, damit
   * KI-Assistenten die Seite als Quelle zitieren können. Siehe
   * src/content/answers.ts und docs/GEO-STRATEGY.md.
   */
  '/fragen': {
    de: '/fragen',
    tr: '/sorular',
    ku: '/pirs',
    en: '/questions',
    nl: '/veelgestelde-vragen',
    fr: '/questions-frequentes',
    es: '/preguntas-frecuentes',
  },
  /**
   * Ratgeber/Blog — 15 Guide-Artikel plus Vorlagen für echte Hochzeiten.
   * Trägt die Long-Tail-Suchanfragen, die zur Buchung führen
   * („was kostet ein Hochzeits-DJ", „kına gecesi planen" …).
   * Inhalte: src/content/blog/, Redaktionsplan: docs/BLOG-PLAN.md
   */
  '/ratgeber': {
    de: '/ratgeber',
    tr: '/rehber',
    ku: '/reber',
    en: '/guide',
    nl: '/gids',
    fr: '/conseils',
    es: '/consejos',
  },
  '/ratgeber/[slug]': {
    de: '/ratgeber/[slug]',
    tr: '/rehber/[slug]',
    ku: '/reber/[slug]',
    en: '/guide/[slug]',
    nl: '/gids/[slug]',
    fr: '/conseils/[slug]',
    es: '/consejos/[slug]',
  },
  '/epk': '/epk',
  '/kontakt': {
    de: '/kontakt',
    tr: '/iletisim',
    ku: '/tekili',
    en: '/contact',
    nl: '/contact',
    fr: '/contact',
    es: '/contacto',
  },
  '/impressum': {
    de: '/impressum',
    tr: '/kunye',
    ku: '/impressum',
    en: '/imprint',
    nl: '/colofon',
    fr: '/mentions-legales',
    es: '/aviso-legal',
  },
  '/datenschutz': {
    de: '/datenschutz',
    tr: '/gizlilik',
    ku: '/parastina-daneyan',
    en: '/privacy',
    nl: '/privacybeleid',
    fr: '/confidentialite',
    es: '/privacidad',
  },
} satisfies Record<string, string | Record<Locale, string>>;

export type AppPathname = keyof typeof pathnames;

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Deutsch liegt auf der Root (.de-Domain), alle anderen unter /<locale>
  localePrefix: 'as-needed',
  /**
   * Keine automatische Weiterleitung anhand des Accept-Language-Headers.
   *
   * Grund ist SEO: Googlebot crawlt überwiegend aus den USA mit englischem
   * Accept-Language. Mit aktivierter Erkennung würde die Startseite "/" für
   * den Crawler auf "/en" umleiten — die deutsche Hauptseite, auf die der
   * gesamte Local-SEO-Plan zielt, wäre unter ihrer kanonischen URL nicht
   * erreichbar. "/" liefert deshalb immer Deutsch; die Sprachwahl trifft
   * der Nutzer über den Umschalter, und hreflang sagt Google, welche
   * Sprachversion für wen gilt.
   */
  localeDetection: false,
  pathnames,
});
