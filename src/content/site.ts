/**
 * Zentrale Projekt-Konfiguration.
 *
 * Die Daten stammen aus der bestehenden Website veystunesofficial.de
 * (Impressum + Über-uns, Stand Juli 2026) und sind damit belastbar.
 * Offene Punkte sind mit TODO(kunde) markiert.
 */

export const site = {
  /**
   * DIE Marke. Einzige Wortmarke des Projekts — vom Kunden festgelegt.
   * Überall sichtbar: Header, Footer, Seitentitel, Copy, Social.
   */
  name: 'VEYSL',

  /**
   * Firmierung fürs Impressum. Pflichtangabe nach § 5 DDG — die eingetragene
   * Bezeichnung muss dort stehen, unabhängig von der Wortmarke.
   * ⚠️ Nicht als Marke verwenden, nirgends im Marketing-Text.
   */
  legalName: 'VeysTunesOfficial',
  owner: 'Veysel Durmuş',

  /**
   * Frühere Namen — ausschließlich für technische Kontinuität:
   * schema.org alternateName/sameAs, 301-Weiterleitungen und die
   * Search-Console-Adressänderung. So finden bestehende Follower und
   * Bewertungen die neue Domain.
   * ⚠️ Erscheinen NICHT in sichtbarer Copy. Die Marke heißt VEYSL.
   */
  previousNames: ['DJ Veys', 'VeysTunesOfficial'] as const,
  domain: 'veysl.de',
  url: 'https://veysl.de',
  /** Alte Domain — für 301-Weiterleitungen und sameAs-Signale. */
  legacyUrl: 'https://www.veystunesofficial.de',

  /** Alle sechs Locales — siehe routing.ts. Kein Fallback nötig. */
  tagline: {
    de: 'Hochzeits-DJ, Musiker & Moderator',
    tr: 'Düğün DJ’i, Müzisyen & Sunucu',
    ku: 'DJ’yê dawetê, muzîkjen û pêşkêşvan',
    en: 'Wedding DJ, Musician & Host',
    nl: 'Bruiloft-DJ, muzikant & presentator',
    fr: 'DJ de mariage, musicien & animateur',
    es: 'DJ de bodas, músico y presentador',
  },

  // Standort & Einzugsgebiet — steuert LocalBusiness-Schema und Local SEO
  city: 'Stuttgart',
  district: 'Obertürkheim',
  region: 'Baden-Württemberg',
  country: 'DE',
  /**
   * Einzugsgebiet in drei Stufen. Die Staffelung ist bewusst:
   * Google bewertet lokale Relevanz nach Spezifität. Wer überall behauptet
   * zu arbeiten, rankt nirgends. Die Kernregion trägt das Local SEO, die
   * weiteren Stufen zeigen die tatsächliche Reichweite.
   */

  /** Stufe 1 — Kernregion. Basis für die Städte-Landingpages und Local SEO. */
  serviceAreas: [
    'Stuttgart',
    'Esslingen',
    'Ludwigsburg',
    'Böblingen',
    'Heilbronn',
    'Reutlingen',
    'Pforzheim',
    'Karlsruhe',
  ],

  /** Stufe 2 — deutschlandweit buchbar, Schwerpunkt Ballungsräume. */
  germanyCities: [
    'München',
    'Frankfurt',
    'Mannheim',
    'Nürnberg',
    'Köln',
    'Düsseldorf',
    'Hamburg',
    'Berlin',
  ],

  /**
   * Stufe 3 — europaweit buchbar.
   * ⚠️ Formulierung beachten: „buchbar in", nicht „regelmäßig gebucht in".
   * Belegt ist bisher nur Wien (siehe verifiedInternational).
   */
  europeCountries: [
    'Österreich',
    'Schweiz',
    'Niederlande',
    'Belgien',
    'Luxemburg',
    'Frankreich',
    'Italien',
    'Spanien',
    'Dänemark',
    'Schweden',
    'Norwegen',
  ],

  /** Nachweislich bespielt — nur belegte Auftritte. TODO(kunde): ergänzen. */
  verifiedInternational: ['Wien'],
  /** Über die Region hinaus: deutschlandweit und europaweit buchbar. */
  reach: {
    de: 'Stuttgart · Baden-Württemberg · deutschlandweit · europaweit',
    tr: 'Stuttgart · Baden-Württemberg · Almanya geneli · Avrupa geneli',
    ku: 'Stuttgart · Baden-Württemberg · li seranserê Almanyayê · li seranserê Ewropayê',
    en: 'Stuttgart · Baden-Württemberg · Germany-wide · Europe-wide',
    nl: 'Stuttgart · Baden-Württemberg · heel Duitsland · heel Europa',
    fr: 'Stuttgart · Bade-Wurtemberg · toute l’Allemagne · toute l’Europe',
    es: 'Stuttgart · Baden-Wurtemberg · toda Alemania · toda Europa',
  },

  contact: {
    email: 'veyseldurmus92@gmail.com', // TODO(kunde): auf booking@veysl.de umstellen
    phone: '+49 176 64844815',
    phoneHref: 'tel:+4917664844815',
    /** Nur Ziffern inkl. Ländercode — für wa.me-Links. */
    whatsapp: '4917664844815',
  },

  address: {
    street: '', // TODO(kunde): vollständige Anschrift fürs Impressum (Pflichtangabe in DE)
    postalCode: '', // TODO(kunde)
    city: 'Stuttgart-Obertürkheim',
  },

  /** USt-IdNr. war im alten Impressum nicht ausgefüllt. */
  vatId: '', // TODO(kunde)

  social: {
    /** Hauptkanal — mit Abstand stärkster Social Proof des Projekts. */
    instagram: 'https://www.instagram.com/dj_veys/',
    instagramHandle: '@dj_veys',
    /** Zweitkonto unter der alten Marke. */
    instagramLegacy: 'https://www.instagram.com/veystunesofficial/',
    youtube: 'https://www.youtube.com/@veystunesofficial',
    googleMaps: 'https://maps.app.goo.gl/YCLDDHtrZfQEbhd48',
    tiktok: '', // TODO(kunde)
    spotify: '', // TODO(kunde)
    soundcloud: '', // TODO(kunde)
    mixcloud: '', // TODO(kunde)
  },

  /**
   * Belegbare Eckdaten. Quellen: Impressum + Über-uns auf veystunesofficial.de
   * und das Instagram-Profil @dj_veys (Stand Juli 2026).
   */
  stats: {
    yearsExperience: 12,
    /**
     * 200+ laut Instagram-Bio ("Müzik + Enerji + Sahne = 200+ Org.") —
     * vom Kunden bestätigt. Die alte Website nannte noch 100+ und ist damit
     * veraltet.
     */
    eventsCompleted: 200,
    hostingLanguages: ['de', 'tr', 'en'] as const,
    /** Instagram-Follower — verifiziert, öffentlich sichtbar, stärkstes Trust-Signal. */
    instagramFollowers: 63000,
    /** YouTube-Kanal @VeysTunesOfficial, Stand Juli 2026. */
    youtubeSubscribers: 800,
    youtubeVideos: 265,
  },

  /** Leistungsspektrum laut Impressum und Instagram-Profil. */
  capabilities: [
    'wedding-dj',
    'event-dj',
    'host', // Moderation DE/TR/EN
    'live-music', // Saz & Gitarre
    'orchestra', // "DJ & Orkestra" — Live-Band inkl. Bläser
    'traditional-turkish', // Gelin Çıkarma, Bando, Davul Zurna
    'av-rental', // Ton-, Licht- und Veranstaltungstechnik
  ] as const,

  /**
   * Auf seinen eigenen Beiträgen sichtbare Partner. Vor Veröffentlichung
   * bestätigen lassen — Logos/Nennung brauchen Einverständnis. TODO(kunde).
   */
  partnersUnconfirmed: [
    'Liebe Events — Kına & Wedding',
    'Alpina Löwen',
    'ArslanEvent',
    'AuraEvent',
  ],

  /**
   * Social Proof. Das Google-Profil zeigt 5,0 Sterne; die Anzahl der
   * Bewertungen ist noch nicht verifiziert. `isPublishable` bleibt deshalb
   * false — Badge und AggregateRating-Schema werden erst gerendert, wenn
   * beide Werte belegt sind. Erfundene Bewertungszahlen sind tabu.
   */
  reviews: {
    /**
     * TODO(kunde): echte place_id (Format "ChIJ…") aus der Google Places API
     * oder dem Place-ID-Finder eintragen. Aus dem Maps-Link ließen sich nur
     * diese Kennungen ablesen — als Ausgangspunkt für die Suche, nicht als
     * fertige place_id verwendbar:
     *   CID  0xa8532d8d440d6fa9:0xb83556b975766939
     *   KG   /g/11xp06nh71
     */
    googlePlaceId: '',
    rating: 5.0,
    count: 0, // TODO(kunde): echte Anzahl aus dem Google-Profil eintragen
    profileUrl: 'https://maps.app.goo.gl/YCLDDHtrZfQEbhd48',
    get isPublishable() {
      return this.count > 0 && this.rating > 0;
    },
  },

  /** Aktuelle Buchungssaison — für Verfügbarkeits-Hinweise (nur echte Daten). */
  season: {
    year: 2026,
  },
} as const;

export type Site = typeof site;
