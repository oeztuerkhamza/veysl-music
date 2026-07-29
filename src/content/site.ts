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
  name: 'DJ Veys',

  /**
   * Eingetragene Firmierung fürs Impressum — `null`, weil keine existiert.
   *
   * § 5 DDG verlangt den Namen des Anbieters. Bei einem Einzelunternehmen
   * ohne Handelsregistereintrag ist das der **bürgerliche Name der Person**,
   * nicht eine Fantasiebezeichnung: `owner` unten erfüllt die Pflicht, und
   * „VeysTunesOfficial" hier zu führen wäre die Angabe einer Firmierung, die
   * es so nicht gibt.
   *
   * ⚠️ Sollte doch ein Handelsregister- oder Gewerbeeintrag auf einen
   * abweichenden Namen laufen, MUSS dieser hier eingetragen werden — dann ist
   * er die Pflichtangabe und `owner` allein genügt nicht.
   */
  legalName: null as string | null,
  owner: 'Veysel Durmuş',

  /**
   * Frühere Namen — ausschließlich für technische Kontinuität:
   * schema.org alternateName/sameAs, 301-Weiterleitungen und die
   * Search-Console-Adressänderung. So finden bestehende Follower und
   * Bewertungen die neue Domain.
   * ⚠️ Erscheinen NICHT in sichtbarer Copy. Die Marke heißt DJ Veys.
   *
   * Enthält bewusst **kein** „VEYSL": dieser Name war zwischenzeitlich als
   * Marke vorgesehen, ist aber nie öffentlich geworden — veysl.de stand bis
   * zuletzt auf der Parkseite, es gibt keinen Follower, keine Bewertung und
   * keinen Link, der ihn kennt. Ihn als alternateName auszuspielen würde
   * Suchmaschinen einen Namen als Synonym anbieten, unter dem die Marke
   * nirgends existiert.
   */
  previousNames: ['VeysTunesOfficial'] as const,
  domain: 'dj-veys.de',
  url: 'https://dj-veys.de',
  /*
   * `legacyUrl: 'https://www.veystunesofficial.de'` stand hier und ist im Juli
   * 2026 entfallen: Die alte Domain wurde als Registrierung gekündigt. Damit
   * sind beide Zwecke des Feldes weg — die 301-Weiterleitung kann nicht mehr
   * greifen (siehe docs/DEPLOYMENT.md → "Domain migration"), und als
   * `sameAs`-Signal wäre der Eintrag nach dem Auslaufen sogar schädlich, weil
   * die Domain dann von Dritten neu registriert werden kann
   * (Begründung ausführlich in src/lib/schema.ts → `businessSameAs`).
   *
   * Bewusst als Kommentar dokumentiert statt spurlos gelöscht: Das Feld taucht
   * in docs/ und in der Migrationsplanung auf, und "warum fehlt das?" ist sonst
   * eine Frage, die sich nur über die Git-History beantworten lässt.
   *
   * Die Marke selbst bleibt bestehen — `previousNames` unten sowie die
   * YouTube-/Instagram-Konten `@veystunesofficial` sind davon nicht berührt.
   */

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
    // Geschäftsadresse für Kundenkontakt, Impressum und Google Business Profile.
    // Postfach läuft auf dem selbst gehosteten Mailserver — siehe
    // docs/MAIL-SELFHOSTED.md. Der automatische Versand nutzt bewusst eine
    // andere Adresse (no-reply@), damit deren Reputation die persönliche
    // Korrespondenz nicht beschädigen kann.
    email: 'info@dj-veys.de',
    phone: '+49 176 64844815',
    phoneHref: 'tel:+4917664844815',
    /** Nur Ziffern inkl. Ländercode — für wa.me-Links. */
    whatsapp: '4917664844815',
  },

  /**
   * Ladungsfähige Anschrift — Pflichtangabe nach § 5 DDG, vom Betreiber
   * bestätigt und identisch mit der Adresse im Google-Unternehmensprofil.
   * Diese Deckungsgleichheit ist kein Zufall, sondern der Punkt: Google
   * gleicht NAP-Daten (Name, Adresse, Telefon) zwischen Website, Impressum
   * und Profil ab, und Abweichungen kosten lokale Sichtbarkeit.
   *
   * Füllt gleichzeitig `streetAddress`/`postalCode` in `businessAddress()`
   * (src/lib/schema.ts), die bis hierher leer bleiben mussten.
   */
  address: {
    street: 'Asangstraße 98',
    postalCode: '70329',
    city: 'Stuttgart-Obertürkheim',
  },

  /**
   * Rechtliche Pflichtangaben. Alle drei sind ab jetzt im Adminpanel pflegbar
   * (site-settings → „Rechtliche Angaben"), damit der Betreiber sie ohne
   * Deploy nachtragen kann. Die Werte hier sind nur der Fallback, solange im
   * CMS nichts steht — und sie bleiben absichtlich leer: eine erfundene
   * USt-IdNr. oder Anschrift wäre schlimmer als ein sichtbarer Platzhalter.
   */
  vatId: '', // TODO(kunde)
  /** § 19 UStG — Alternative zur USt-IdNr., nicht zusätzlich dazu. */
  smallBusinessExempt: false, // TODO(kunde)
  professionalInsurance: '', // TODO(kunde)

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
   * Das Google-Unternehmensprofil — **ausschließlich zur sichtbaren Anzeige
   * mit Quellenangabe**, niemals als strukturierte Bewertung dieser Website.
   *
   * Beide Werte sind am öffentlichen Profil abgelesen (Knowledge Panel zu
   * `kgmid=/g/11xp06nh71`, Stand Juli 2026): „5,0 · 31 Rezensionen".
   * `isPublishable` schaltet damit den sichtbaren Badge und den
   * Rezensionsabschnitt frei — und sonst nichts.
   *
   * ⚠️ Diese Zahlen dürfen NICHT in `aggregateRatingSchema()` landen.
   * Googles Review-Snippet-Richtlinien verlangen, dass eine ausgezeichnete
   * Bewertung von den eigenen Nutzern der Seite stammt, und untersagen
   * ausdrücklich, die Aggregation einer anderen Plattform zu übernehmen —
   * Googles eigenen Schnitt als eigenes `aggregateRating` zurückzuspielen
   * ist ein dokumentierter Weg in eine manuelle Maßnahme. Genau das ist hier
   * schon einmal passiert und wurde zurückgebaut; die Trennung steht
   * ausführlich in docs/GOOGLE-BUSINESS-PROFILE.md §12.
   *
   *   Google-Bewertungen  → sichtbarer Abschnitt, mit Attribution und Link
   *   Eigene Stimmen      → `aggregateRating`-Schema, Stern-Rich-Snippet
   *
   * Die zweite Zeile ist noch leer: `src/content/testimonials.ts` enthält
   * bewusst keine Einträge, solange keine freigegebenen Zitate vorliegen.
   *
   * Die Regel für die Zahlen selbst bleibt streng: **niemals eine Zahl
   * eintragen, die nicht am Profil steht.** Sobald `GOOGLE_PLACES_API_KEY`
   * auf dem Server gesetzt ist, liefert `src/lib/reviews/google-places.ts`
   * beide täglich live und diese Werte sind nur noch der Fallback.
   */
  reviews: {
    /**
     * Die Google-Place-ID des Profils. Nicht geraten: aus dem CID-Paar im
     * Maps-Link dieses Eintrags (`0xa8532d8d440d6fa9:0xb83556b975766939`)
     * kodiert und durch Rück-Dekodierung auf dasselbe Paar geprüft. Dass es
     * derselbe Eintrag ist, bestätigt die Knowledge-Graph-ID `/g/11xp06nh71`,
     * die sowohl im alten Maps-Link als auch im aktuellen Profil steht — es
     * wurde also kein zweiter Eintrag angelegt, der bestehende wurde nur
     * umbenannt (die 5,0 und die 31 Rezensionen sind deshalb noch da).
     *
     * Endgültig bestätigt ist sie erst, wenn der Places-Aufruf mit gesetztem
     * API-Key echte Rezensionen zurückgibt; bis dahin ist der einzige
     * Fehlerfall „keine Live-Reviews", nicht „fremde Live-Reviews", weil
     * jeder fehlschlagende Aufruf in `google-places.ts` zu `null` degradiert.
     */
    googlePlaceId: 'ChIJqW8NRI0tU6gROWl2dblWNbg',
    rating: 5.0,
    count: 31,
    profileUrl: 'https://maps.app.goo.gl/YCLDDHtrZfQEbhd48',
    /**
     * Der Kurzlink, den Google dem Inhaber im Unternehmensprofil selbst
     * ausgibt („Rezensionen anfordern"). Überschreibt die aus der Place ID
     * abgeleitete Variante in `writeReviewUrl()`.
     *
     * Beide landen im selben Dialog — dieser hier löst nachweislich auf
     * `search.google.com/local/writereview?placeid=ChIJqW8NRI0tU6gROWl2dblWNbg`
     * auf, was nebenbei die abgeleitete Place ID unabhängig bestätigt hat.
     * Zwei Gründe trotzdem für diesen:
     *
     * 1. Er ist kurz genug, um ihn einem Paar per WhatsApp zu schicken, ohne
     *    dass die Nachricht nach einem Tracking-Link aussieht — und genau so
     *    wird er eingesetzt (docs/GOOGLE-BUSINESS-PROFILE.md: eine Anfrage
     *    pro Paar, direkt nach der Feier, nie als Rundmail).
     * 2. Google hängt beim Auflösen `laa=nmx-review-solicitation-ia2` an,
     *    kennzeichnet die Rezension also als vom Inhaber angefragt. Das ist
     *    der legitime, dokumentierte Weg, um Rezensionen zu bitten.
     */
    writeReviewUrl: 'https://g.page/r/CTlpdnW5VjW4EBM/review',
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
