/**
 * Programmatische Local-SEO-Landingpages — eine Seite pro Stadt im
 * Einzugsgebiet um Stuttgart. Route: `/hochzeits-dj/[stadt]`
 * (siehe src/i18n/routing.ts).
 *
 * HARTE REGEL (siehe Auftrag & .claude/CONTRACT.md): Das hier sind keine
 * Doorway-Pages. Jede Stadt muss echte, unterscheidbare Substanz tragen —
 * kein Template mit ausgetauschtem Stadtnamen. Deshalb:
 *
 *  - `venues` wird NIE erfunden. Kein Venue-Name auf dieser Seite ohne
 *    hinreichende Sicherheit, dass er real existiert. Ist die Sicherheit
 *    nicht gegeben: leeres Array + `// TODO(kunde)`-Kommentar.
 *  - Laut .claude/BRAND-FACTS.md sind "venue partners" (echte
 *    Zusammenarbeit mit bestimmten Locations) NICHT verifiziert. Die
 *    hier gelisteten Venues sind deshalb bewusst als "bekannte Locations
 *    in der Stadt" formuliert, nicht als "unsere Partner-Locations" oder
 *    "wo wir schon gespielt haben" — siehe `messages/{de,en}.json` Key
 *    `city.venues.note`.
 *  - `intro`/`angle` sind pro Stadt einzeln geschriebene Prosa, kein
 *    Textbaustein mit `{city}`-Interpolation. Der jeweils *gleiche*
 *    Differenzierer (DJ & Live-Orchester aus einer Hand, 200+ Events,
 *    3 Sprachen) wird bewusst NICHT in jedem `angle` wiederholt — das
 *    wäre exakt das in `docs/SEO-CITY-STRATEGY.md` §5.4 gewarnte
 *    "identische Keyword-Set auf jeder Seite". Stattdessen trägt jede
 *    Stadt ihren eigenen lokalen Aufhänger; die geteilten
 *    Differenzierer leben in der gemeinsamen UI (Hero-Stats, Angebots-
 *    Grid) plus im `angle` der Städte, bei denen die Anfahrt NICHT
 *    inklusive ist (dort ist "warum trotzdem buchen" die naheliegende
 *    Botschaft).
 *
 * QUELLEN: `docs/SEO-CITY-STRATEGY.md` (Recherche-Agent) — Tier-Liste,
 * Distanzen (Luftlinie via luftlinie.org), Einwohnerzahlen (Statistisches
 * Landesamt BW / Stadtverwaltungen) und Venue-Verifizierung ersetzen alle
 * eigenen Annahmen aus einem früheren Entwurf dieser Datei. Wo die
 * Recherche selbst "needs client input" vermerkt, bleibt der Wert `null`
 * bzw. das Feld leer — siehe Kommentare je Stadt.
 *
 * SECHS SPRACHEN, ABER NICHT SECHSFACHE PROSA (Kurskorrektur vom
 * Koordinator): `src/i18n/routing.ts` führt de/tr/ku/en/fr/es. Deutsch
 * bleibt Pflicht, alles andere optional — echte Prosa in allen sechs
 * Sprachen wäre KI-Textbaustein-Ballast, genau das Doorway-Page-Risiko,
 * vor dem der Auftrag warnt. Reihenfolge der Priorität: de (Hauptmarkt) →
 * tr (bikulturelle Kernzielgruppe, siehe BRAND-FACTS.md) → en. ku/fr/es
 * erst, wenn dafür echte, eigenständige Prosa geschrieben werden kann —
 * siehe `LocalizedProse` und `hasCityProse()`. Die UI-Strings (Namespace
 * `city.*` in messages/*.json) sind inzwischen bereits in es/fr/ku
 * vorhanden (siehe Report) — der Flaschenhals ist ausschließlich die
 * Stadt-Prosa hier in dieser Datei, nicht mehr die Message-Infrastruktur.
 *
 * BATCH AUGUST 2026 — die elf Städte ab `tuebingen`:
 * `docs/SEO-CITY-STRATEGY.md` hatte 23 Städte recherchiert und 8 ausgespielt.
 * Der Rest hing weder an Text noch an Code, sondern an dem einen Kriterium,
 * das §2 dort formuliert: Der Betreiber muss bestätigen, dass er dort
 * tatsächlich spielt, weil eine Stadtseite lokale Verfügbarkeit verspricht.
 * Diese Bestätigung liegt seit 2026-08-07 vor.
 *
 * `distanceKm` ist in diesem Batch die per Haversine aus den Koordinaten
 * berechnete Luftlinie, nicht die Angabe der Recherche. Grund: Diese führt
 * die meisten dieser Distanzen als „general estimate — verify", und drei
 * waren deutlich falsch — Heidelberg 109 statt 79, Baden-Baden 100 statt 69,
 * Offenburg 140 statt 97. Das letzte widersprach sogar dieser Website selbst:
 * `regions.ts` gibt Straßburg mit rund 110 km an, und Straßburg liegt weiter
 * weg als Offenburg. Die Rechnung reproduziert die hier bereits stehenden
 * Werte für Reutlingen, Heilbronn, Karlsruhe und Mannheim auf ±1 km und
 * wurde deshalb vorgezogen.
 *
 * ⚠️ Wo die Recherche eine luftlinie.org-Quelle nennt (Heidelberg, Ulm,
 * Freiburg, Konstanz, Friedrichshafen), weicht dieses File bewusst ab.
 * `docs/SEO-CITY-STRATEGY.md` ist an diesen Stellen zu korrigieren — die
 * Abweichung ist kein Versehen und soll nicht „zurückgeglichen" werden.
 *
 * `turkishCommunity` steht in diesem Batch durchgängig auf `false`. Die
 * Recherche vermerkt für jede dieser Städte „needs client input"; bei drei
 * Ostalb-Städten immerhin mit qualitativer Begründung. Die Bestätigung des
 * Betreibers betraf jedoch die Anfahrt, nicht die Demografie — und beides ist
 * nicht dasselbe. Sobald er eine Stadt ausdrücklich bestätigt, kann das Feld
 * dort auf `true` und der bikulturelle Abschnitt erscheint (city-angle.tsx).
 *
 * PRIORITÄTEN — die Liste hier bewusst NICHT wiederholen, sie veraltet
 * sonst bei jeder neuen Stadt (genau das ist ihr schon einmal passiert).
 * Maßgeblich ist ausschließlich das `priority`-Feld je Eintrag:
 *
 *  - `priority: 1` — Tier 1 und Tier 2 aus `docs/SEO-CITY-STRATEGY.md`,
 *    ausgespielt.
 *  - `priority: 2` — Tier 3 dort: solide, aber schwächer belegt; wird
 *    ebenfalls ausgespielt (`cities` filtert auf `priority <= 2`).
 *  - `priority: 3` — zurückgestellt. Aktuell nur Stuttgart (siehe Kommentar
 *    beim Eintrag): Inhalt bleibt erhalten, `getAllCities()` blendet ihn nur
 *    aus, bis das Team ihn bewusst wieder aufnimmt.
 */

import type { Locale } from '@/i18n/routing';

/**
 * Lokalisierter Freitext: Deutsch ist Pflicht (Hauptmarkt), alle anderen
 * Sprachen sind optional. Fehlt ein Wert für die aktuelle Locale, rendert
 * die Seite den betroffenen Block schlicht nicht — niemals ein deutscher
 * Absatz auf einer spanischen Seite. Siehe `hasCityProse()`.
 */
export type LocalizedProse = { de: string } & Partial<Record<Locale, string>>;

export type CityVenueKind = 'saal' | 'schloss' | 'weingut' | 'hotel' | 'location';

export interface CityVenue {
  /** Echter, verifizierbarer Name — niemals erfunden. */
  name: string;
  kind: CityVenueKind;
  /**
   * Kurzer, sachlicher Hinweis. Bewusst neutral formuliert (keine
   * Behauptung einer Partnerschaft, kein "wo wir bereits gespielt haben")
   * — siehe BRAND-FACTS.md "venue partners... do NOT invent".
   */
  note?: LocalizedProse;
}

export interface CityFaqEntry {
  question: LocalizedProse;
  answer: LocalizedProse;
}

export interface City {
  /** URL-sicher, klein geschrieben, keine Umlaute — z. B. 'boeblingen'. */
  slug: string;
  /** Anzeigename inkl. Umlaute — z. B. 'Böblingen'. */
  name: string;
  region: string;
  /** Luftlinie ab Stuttgart in km (siehe `docs/SEO-CITY-STRATEGY.md`) — steuert die Anfahrts-Kommunikation. */
  distanceKm: number;
  /** Öffentlich bekannte Einwohnerzahl (Statistisches Landesamt BW / Stadt).
   *  `null`, wenn im Recherche-Pass nicht verlässlich verifiziert. */
  population: number | null;
  /** 0–4 ECHTE, verifizierbare Hochzeitslocations. Niemals erfunden. */
  venues: CityVenue[];
  /**
   * Kompletter Meta-Titel-Ersatz, NUR für Städte, deren Name das
   * `city.meta.title`-Template über die ~60-Zeichen-Grenze schiebt
   * (docs/SEO-KEYWORD-MAP.md §2 verlangt genau diese Prüfung je Stadt).
   * Ungesetzt gilt das Template; H1, Beschreibung und Fließtext behalten
   * immer den vollen Anzeigenamen.
   */
  metaTitle?: LocalizedProse;
  /** Einzigartige Prosa je Stadt — keine Textbausteine. */
  intro: LocalizedProse;
  /** Warum Paare in dieser Stadt speziell ihn buchen — lokaler Winkel. */
  angle: LocalizedProse;
  /** Gibt es eine relevante türkische Community? Steuert den bikulturellen Abschnitt. */
  turkishCommunity: boolean;
  travel: {
    /** true, wenn die Distanz innerhalb der anfahrtskostenfreien Zone liegt
     *  (vgl. `packages.note` in messages/*.json: "inkl. Anfahrt innerhalb von 50 km"). */
    included: boolean;
    /** Nur gesetzt, wenn `included` false ist — erklärt die Ausnahme transparent. */
    note?: LocalizedProse;
  };
  /** 1 = fertig, belegt & ausgespielt. 2 = solide, aber schwächer belegt.
   *  3 = zurückgestellt/nicht Teil des aktuellen Tier-1-Batches — noch
   *  NICHT ausspielen (siehe `getAllCities()`). */
  priority: 1 | 2 | 3;
  /** Slugs der 2–4 nächstgelegenen anderen (ausgespielten) Stadt-Seiten —
   *  treibt den "Auch gebucht in …"-Block und damit die interne
   *  Verlinkung des Clusters. Slugs zurückgestellter Städte werden von
   *  `getNearbyCities()` automatisch herausgefiltert. */
  nearby: string[];
  /** 2–3 stadt-spezifische FAQ-Paare. Dupliziert NICHT die große FAQ auf /ablauf. */
  faq: CityFaqEntry[];
}

/**
 * Locales this content module actually has real per-city PROSE for — not
 * "every messages/*.json file that happens to exist" (that was the bug:
 * six message files existing made `getReadyLocalesForCity()` look ready for
 * ku/fr/es too, and the sitemap/hreflang trusted it). Widen this only once
 * genuine, non-templated intro/angle/FAQ prose has been written for a city
 * in that locale — see `hasCityProse()`, which this feeds.
 */
export const CITY_PAGES_SUPPORTED_LOCALES: readonly Locale[] = ['de', 'tr', 'en'];

/** True, wenn für `locale` echte Prosa (intro + angle + vollständige FAQ) vorliegt. */
export function hasCityProse(city: City, locale: Locale): boolean {
  if (locale === 'de') return true; // Pflichtfeld — jede gelistete Stadt hat deutsche Prosa.
  const hasIntroAngle = Boolean(city.intro[locale] && city.angle[locale]);
  const hasFaq = city.faq.length > 0 && city.faq.every((f) => Boolean(f.question[locale] && f.answer[locale]));
  return hasIntroAngle && hasFaq;
}

/** Locales, für die diese Stadt tatsächlich ausgespielt werden soll. */
export function getReadyLocalesForCity(city: City): Locale[] {
  return CITY_PAGES_SUPPORTED_LOCALES.filter((locale) => hasCityProse(city, locale));
}

/**
 * Resolves a `LocalizedProse` field for one locale — WITHOUT falling back to
 * German. Returns `undefined` if nothing was written for that locale, so
 * callers can simply skip rendering the block (coordinator's instruction:
 * a missing paragraph beats a German paragraph on a Spanish page).
 */
export function resolveLocalized(text: LocalizedProse | undefined, locale: Locale): string | undefined {
  return text?.[locale];
}

/**
 * The full, hand-authored master list — includes `priority: 3` entries
 * (Stuttgart, Ludwigsburg) that are intentionally NOT shipped yet. Exported
 * for reuse (e.g. previewing a demoted city later), but nothing outside
 * this module should render pages from it directly — use `cities` below.
 */
export const allCityEntries: City[] = [
  {
    // Zurückgestellt (siehe Dateikopf): `docs/SEO-CITY-STRATEGY.md` führt
    // Stuttgart bewusst NICHT in der bestätigten Tier-1-Liste — die Stadt
    // ist bereits die Kernzielgruppe der Startseite selbst; eine eigene
    // Stadt-Seite würde deren eigenes "Hochzeits-DJ Stuttgart"-Targeting
    // kannibalisieren statt es zu ergänzen. Inhalt bleibt hier erhalten
    // (er ist solide), `priority: 3` hält ihn aus `getAllCities()` heraus.
    slug: 'stuttgart',
    name: 'Stuttgart',
    region: 'Baden-Württemberg',
    distanceKm: 0,
    population: 630000,
    priority: 3,
    turkishCommunity: true,
    nearby: ['esslingen', 'boeblingen', 'reutlingen'],
    travel: { included: true },
    venues: [
      {
        name: 'Schloss Solitude',
        kind: 'schloss',
        note: {
          de: 'Barockes Schloss über der Stadt – eine der offiziellen Trauorte des Stuttgarter Standesamts.',
          en: "A baroque palace above the city and one of Stuttgart's official civil-ceremony venues.",
          tr: 'Şehrin üzerinde barok bir saray; Stuttgart nüfus dairesinin resmi nikâh mekânlarından biri.',
        },
      },
      {
        name: 'Kursaal Bad Cannstatt',
        kind: 'saal',
        note: {
          de: 'Historischer Kuppelsaal in Bad Cannstatt, seit Jahrzehnten Bühne für Bälle und große Feiern.',
          en: 'A historic domed hall in Bad Cannstatt that has hosted balls and large celebrations for decades.',
          tr: 'Bad Cannstatt’ta tarihi kubbeli bir salon; on yıllardır balo ve büyük kutlamalara ev sahipliği yapıyor.',
        },
      },
    ],
    intro: {
      de: 'Stuttgart ist kein Einsatzgebiet, sondern Zuhause: Veysel lebt in Obertürkheim und kennt die Stadt aus dem Alltag – vom Verkehr rund um den Talkessel bis zu den Uhrzeiten, zu denen sich Technik in der Innenstadt am entspanntesten aufbauen lässt. Wer hier heiratet, bekommt keinen DJ, der zum ersten Mal anreist, sondern jemanden, der die Wege, die Locations und das Publikum der Stadt seit Jahren kennt.',
      en: "Stuttgart isn't a service area — it's home. Veysel lives in Obertürkheim and knows the city from daily life: the traffic patterns around the valley basin, the parking rules downtown, the hours when setting up sound equipment in the city centre still goes smoothly. Getting married in Stuttgart means booking someone who has known the routes, the venues and the crowd here for years, not a DJ arriving for the first time.",
      tr: 'Stuttgart sadece bir çalışma bölgesi değil, evi: Veysel Obertürkheim’da yaşıyor ve şehri günlük hayattan tanıyor — vadi çukurundaki trafik akışını, şehir merkezindeki park kurallarını, ekipman kurulumunun en sorunsuz yapılabildiği saatleri. Stuttgart’ta evlenen çiftler, ilk kez gelen bir DJ değil, şehrin yollarını, mekânlarını ve seyircisini yıllardır bilen biriyle çalışıyor.',
    },
    angle: {
      de: 'Der Heimvorteil ist doppelt: keine Anfahrtskosten und kein Unbekanntes am Hochzeitstag. Dazu kommt, wofür Stuttgart bekannt ist – eine der größten türkisch-deutschen Communities Deutschlands. Genau in dieser Mischung aus schwäbischer Direktheit und türkischer Feierkultur bewegt sich Veysel jeden Tag, und genau deshalb wird er hier besonders häufig für deutsch-türkische Hochzeiten gebucht.',
      en: "The home-turf advantage cuts both ways: no travel fee, and nothing unfamiliar on the wedding day. Add to that what Stuttgart is known for — one of Germany's largest Turkish-German communities. Veysel moves between Swabian directness and Turkish celebration culture every single day, which is exactly why he's booked so often for German-Turkish weddings here.",
      tr: 'Ev sahibi avantajı iki kat işe yarıyor: ek ulaşım ücreti yok, düğün gününde bilinmeyen bir yol yok. Buna bir de Stuttgart’ın tanındığı özellik ekleniyor: Almanya’nın en büyük Türk-Alman topluluklarından biri. Veysel her gün hem yerel Alman kültürünü hem Türk düğün geleneklerini yakından yaşıyor; tam da bu yüzden burada Alman-Türk düğünlerinde sıkça tercih ediliyor.',
    },
    faq: [
      {
        question: {
          de: 'Fällt für Stuttgart eine Anfahrtspauschale an?',
          en: 'Is there a travel surcharge for weddings in Stuttgart?',
          tr: 'Stuttgart’taki düğünler için ek ulaşım ücreti var mı?',
        },
        answer: {
          de: 'Nein. Stuttgart ist Wohn- und Arbeitsort von Veysel, Anfahrt und Ortskenntnis sind bereits in jedem Angebot enthalten.',
          en: "No. Stuttgart is where Veysel lives and works, so travel and local knowledge are already part of every quote.",
          tr: 'Hayır. Stuttgart, Veysel’in yaşadığı ve çalıştığı şehir; ulaşım ve yerel bilgi zaten her teklife dahildir.',
        },
      },
      {
        question: {
          de: 'Spielen Sie auch in kleineren, inhabergeführten Locations in Stuttgart?',
          en: 'Do you also play smaller, family-run venues in Stuttgart?',
          tr: 'Stuttgart’ta küçük, aile işletmesi mekânlarda da çalıyor musunuz?',
        },
        answer: {
          de: 'Ja. Ob großer Saal oder kleine, familiär geführte Location – Technik und Aufbau werden vorab immer persönlich mit der Location abgestimmt, damit am Tag selbst nichts überrascht.',
          en: "Yes. Whether it's a large hall or a small, owner-run venue, setup and equipment are always coordinated with the venue in advance so nothing comes as a surprise on the day.",
          tr: 'Evet. İster büyük bir salon ister küçük, aile işletmesi bir mekân olsun; kurulum ve ekipman her zaman önceden mekânla birlikte planlanır, böylece gün içinde sürpriz yaşanmaz.',
        },
      },
    ],
  },
  {
    /**
     * Seit August 2026 ausgespielt (`priority: 1`).
     *
     * Zurückgehalten war sie nie aus inhaltlichen Gründen, sondern aus
     * Verfahrensgründen: `docs/SEO-CITY-STRATEGY.md` listet sie nicht, weil
     * der Recherche-Pass sie schlicht nicht bearbeitet hat. Der alte Kommentar
     * an dieser Stelle sagte das auch — "Inhalt ist inhaltlich solide und die
     * beiden Venues sind sehr bekannte, unzweifelhaft reale Wahrzeichen".
     *
     * Nachgeprüft, bevor sie freigegeben wurde: Intro, `angle` und beide
     * FAQ-Paare liegen in de/en/tr vor, die Einwohnerzahl ist gesetzt, und die
     * Venues sind Residenzschloss Ludwigsburg und Schloss Monrepos — zwei der
     * bekanntesten Hochzeitsadressen des Landes, nicht erfunden und nicht als
     * Partnerschaft ausgegeben. Damit erfüllt der Eintrag jedes Kriterium, das
     * die übrigen Tier-1-Städte erfüllen.
     *
     * Eine fertige Seite für eine 17 km entfernte Stadt dieser Größe
     * ungenutzt liegen zu lassen, kostet mehr als das Verfahren wert ist —
     * zumal Ludwigsburg über `serviceAreas` in `site.ts` ohnehin schon als
     * Einzugsgebiet ausgewiesen wird.
     */
    slug: 'ludwigsburg',
    name: 'Ludwigsburg',
    region: 'Baden-Württemberg',
    distanceKm: 17,
    population: 93000,
    priority: 1,
    turkishCommunity: true,
    nearby: ['boeblingen', 'esslingen'],
    travel: { included: true },
    venues: [
      {
        name: 'Residenzschloss Ludwigsburg',
        kind: 'schloss',
        note: {
          de: 'Eines der größten Barockschlösser Deutschlands – Schlossgarten und Innenräume werden regelmäßig für Trauungen genutzt.',
          en: "One of Germany's largest baroque palaces — the palace garden and interior rooms are regularly used for civil ceremonies.",
          tr: 'Almanya’nın en büyük barok saraylarından biri; saray bahçesi ve iç mekânları düzenli olarak nikâh törenleri için kullanılıyor.',
        },
      },
      {
        name: 'Schloss Monrepos',
        kind: 'hotel',
        note: {
          de: 'Rokoko-Wasserschloss direkt am Monreposee, heute als Hotel mit Seeterrasse für Feiern buchbar.',
          en: 'A rococo water palace right on the Monrepos lake, today a hotel with a lakeside terrace bookable for celebrations.',
          tr: 'Monrepos Gölü kıyısında bir rokoko saray; bugün göl manzaralı terasıyla kutlamalar için kiralanabilen bir otel.',
        },
      },
    ],
    intro: {
      de: 'Ludwigsburg ist die Barockstadt vor den Toren Stuttgarts – gebaut, um zu beeindrucken, und genau deshalb bei Hochzeitspaaren so beliebt. Zwischen Residenzschloss, Blühendem Barock und den Rokoko-Mauern von Schloss Monrepos gibt es hier mehr wirklich fotogene Kulissen als in fast jeder anderen Stadt im Umkreis – drinnen wie im Freien.',
      en: 'Ludwigsburg is the baroque town just outside Stuttgart — built to impress, which is exactly why couples love it. Between the Residenz Palace, the Blühendes Barock gardens and the rococo walls of Schloss Monrepos, there are more genuinely photogenic backdrops here than in almost any other town nearby — indoors and outdoors alike.',
      tr: 'Ludwigsburg, Stuttgart’ın hemen dışındaki barok kent — etkilemek için inşa edilmiş, çiftlerin onu bu kadar sevmesinin nedeni de tam olarak bu. Residenzschloss, Blühendes Barock bahçeleri ve Schloss Monrepos’un rokoko duvarları arasında, yakın çevredeki neredeyse hiçbir kentte olmayan kadar fotojenik mekân var — hem kapalı hem açık alanda.',
    },
    angle: {
      de: 'Wer im Schlossgarten oder am Monreposee feiert, braucht Technik, die mit Steckdosen-Distanz, Wetter und offenen Flächen umgehen kann – genau dafür ist Veysels Setup ausgelegt. Und: Der Ludwigsburger Raum, insbesondere das direkt angrenzende Kornwestheim, zählt zu den Orten in der Region mit der längsten deutsch-türkischen Geschichte – viele Familien leben hier bereits in dritter Generation. Zweisprachige Moderation ist hier keine Ausnahme, sondern Erwartung.',
      en: "Celebrating in the palace gardens or by the Monrepos lake takes equipment built for distance from power outlets, weather and open spaces — exactly what Veysel's setup is designed for. The wider Ludwigsburg area, especially neighbouring Kornwestheim, is also one of the region's longest-established German-Turkish communities, with many families now in their third generation. Bilingual hosting here isn't an exception — it's expected.",
      tr: 'Saray bahçesinde ya da Monrepos Gölü kıyısında kutlama yapmak, prize uzaklığa, havaya ve açık alana dayanıklı bir ekipman gerektirir — Veysel’in kurulumu tam olarak bunun için tasarlandı. Ludwigsburg bölgesi, özellikle hemen bitişiğindeki Kornwestheim, bölgenin en köklü Alman-Türk topluluklarından birine ev sahipliği yapıyor; birçok aile artık üçüncü kuşakta. Burada iki dilli sunum istisna değil, beklenti.',
    },
    faq: [
      {
        question: {
          de: 'Spielen Sie auch open air im Schlossgarten oder am Monreposee?',
          en: 'Do you play outdoors in the palace gardens or by the Monrepos lake?',
          tr: 'Saray bahçesinde ya da Monrepos Gölü kıyısında açık havada çalıyor musunuz?',
        },
        answer: {
          de: 'Ja. Für Outdoor-Locations wird die Technik auf Wetter, Stromanschluss und Lautstärke-Auflagen der Schlossverwaltung abgestimmt – das klären wir vorab direkt mit der Location.',
          en: "Yes. For outdoor venues, equipment is adapted to weather, power supply and the palace administration's noise rules — we coordinate this directly with the venue in advance.",
          tr: 'Evet. Açık hava mekânları için ekipman hava koşullarına, elektrik bağlantısına ve saray yönetiminin gürültü kurallarına göre uyarlanır — bunu önceden doğrudan mekânla netleştiriyoruz.',
        },
      },
      {
        question: {
          de: 'Gehört Ludwigsburg zum anfahrtskostenfreien Radius?',
          en: 'Is Ludwigsburg within the travel-included radius?',
          tr: 'Ludwigsburg ücretsiz ulaşım kapsamında mı?',
        },
        answer: {
          de: 'Ja, die rund 17 Kilometer von Stuttgart liegen innerhalb der inklusive Anfahrt.',
          en: 'Yes, the roughly 17 kilometres from Stuttgart fall within the included-travel range.',
          tr: 'Evet, Stuttgart’a olan yaklaşık 17 kilometrelik mesafe ücretsiz ulaşım kapsamında.',
        },
      },
    ],
  },
  {
    slug: 'boeblingen',
    name: 'Böblingen',
    region: 'Baden-Württemberg',
    distanceKm: 20,
    // Recherche-Pass: gängig zitierter Wert ~50.000, aber nicht
    // eigenständig verifiziert — siehe docs/SEO-CITY-STRATEGY.md. Lieber
    // `null` als eine ungeprüfte Zahl veröffentlichen.
    population: null,
    priority: 1,
    turkishCommunity: true,
    nearby: ['esslingen', 'reutlingen', 'pforzheim', 'ludwigsburg'],
    travel: { included: true },
    // TODO(kunde): Konkrete Hochzeitslocation in Böblingen/Sindelfingen
    // im Recherche-Pass nicht verifiziert — siehe SEO-CITY-STRATEGY.md.
    venues: [],
    intro: {
      de: 'Böblingen und das direkt benachbarte Sindelfingen sind durch Mercedes-Benz, IBM und Jahrzehnte Technikindustrie geprägt – das bringt viele internationale und binationale Paare in die Region, oft mit Familie und Kolleginnen aus mehreren Ländern auf einer Feier. Direkt vor der Tür liegt der Schönbuch, einer der größten zusammenhängenden Wälder Baden-Württembergs, beliebt für Trauungen im Grünen.',
      en: "Böblingen and neighbouring Sindelfingen have been shaped by Mercedes-Benz, IBM and decades of tech industry — which brings many international and bicultural couples to the area, often with family and colleagues from several countries at one celebration. Right on the doorstep lies the Schönbuch, one of Baden-Württemberg's largest contiguous forests, popular for outdoor ceremonies.",
      tr: 'Böblingen ve hemen komşusu Sindelfingen; Mercedes-Benz, IBM ve on yıllardır süren teknoloji sanayisiyle şekillendi — bu da bölgeye birçok uluslararası ve iki kültürlü çifti getiriyor, çoğu zaman aynı kutlamada birden fazla ülkeden aile ve iş arkadaşlarıyla. Hemen yanı başında, Baden-Württemberg’in en büyük bitişik ormanlarından biri olan Schönbuch var; açık hava törenleri için tercih ediliyor.',
    },
    angle: {
      de: 'Wenn auf einer Feier Deutsch, Türkisch und Englisch gleichzeitig gesprochen werden, braucht es einen Moderator, der zwischen allen drei Sprachen wechseln kann, ohne dass sich eine Gästegruppe abgehängt fühlt. Genau das ist in Böblingen häufiger gefragt als anderswo – und genau das ist eine von Veysels Stärken.',
      en: "When German, Turkish and English are all spoken at the same celebration, you need a host who can switch between all three without leaving any group of guests behind. That's more common in Böblingen than almost anywhere else — and it's one of Veysel's strengths.",
      tr: 'Aynı kutlamada Almanca, Türkçe ve İngilizce bir arada konuşulduğunda, hiçbir davetli grubunu geride bırakmadan üç dil arasında geçiş yapabilen bir sunucuya ihtiyaç var. Böblingen’de bu durum başka yerlere göre çok daha sık — ve tam olarak Veysel’in güçlü yanlarından biri.',
    },
    faq: [
      {
        question: {
          de: 'Können Sie eine Feier mit deutschen, türkischen und internationalen Gästen gleichzeitig moderieren?',
          en: 'Can you host a celebration with German, Turkish and international guests at the same time?',
          tr: 'Almanca, Türkçe ve uluslararası davetlilerin bulunduğu bir kutlamayı aynı anda sunabilir misiniz?',
        },
        answer: {
          de: 'Ja, das ist in Böblingen keine Ausnahme. Moderation wechselt gezielt zwischen Deutsch, Türkisch und Englisch, abgestimmt auf die Gästemischung Ihrer Feier.',
          en: "Yes, that's routine in Böblingen. Hosting shifts deliberately between German, Turkish and English, matched to your guest mix.",
          tr: 'Evet, Böblingen’de bu sıradan bir durum. Sunum, davetli karışımınıza göre bilinçli olarak Almanca, Türkçe ve İngilizce arasında geçiş yapar.',
        },
      },
      {
        question: {
          de: 'Spielen Sie auch bei Feiern im Schönbuch oder an Locations außerhalb der Stadt?',
          en: 'Do you also play celebrations in the Schönbuch or venues outside the town?',
          tr: 'Schönbuch’ta ya da şehir dışındaki mekânlarda da çalıyor musunuz?',
        },
        answer: {
          de: 'Ja, solange die Anfahrt innerhalb der üblichen Reichweite liegt – bei Böblingen ist das durchgehend der Fall.',
          en: 'Yes, as long as travel stays within the usual range — which is consistently the case around Böblingen.',
          tr: 'Evet, ulaşım mesafesi olağan aralıkta kaldığı sürece — Böblingen çevresinde bu her zaman geçerli.',
        },
      },
    ],
  },
  {
    slug: 'esslingen',
    name: 'Esslingen',
    region: 'Baden-Württemberg',
    distanceKm: 15,
    population: 96182,
    priority: 1,
    turkishCommunity: true,
    nearby: ['boeblingen', 'reutlingen', 'heilbronn', 'ludwigsburg'],
    travel: { included: true },
    venues: [
      {
        name: 'Esslinger Burg',
        kind: 'schloss',
        note: {
          de: 'Mittelalterliche Burg über der Altstadt – Zeremonien hier bieten Ausblick über die Weinberge und die Dächer der Stadt.',
          en: 'A medieval castle above the old town — ceremonies here look out over the vineyards and the rooftops of the city.',
          tr: 'Eski şehrin üzerinde ortaçağdan kalma bir kale — burada yapılan törenler bağlar ve çatıların üzerinden manzara sunuyor.',
        },
      },
    ],
    intro: {
      de: 'Esslingen liegt so nah an Stuttgart, dass sich Anfahrt und Ortskenntnis kaum unterscheiden – nur eben mit der besonderen Kulisse der Esslinger Altstadt: enge Gassen, Fachwerk, die Burg über den Dächern. Die Stadt hat eine lange Industriegeschichte, die viele türkische Familien schon in der zweiten und dritten Generation hier verwurzelt hat. Für Veysel ist Esslingen praktisch Nachbarschaft, planerisch wie menschlich.',
      en: "Esslingen sits so close to Stuttgart that travel and local knowledge barely change — except for the backdrop, which is entirely its own: narrow lanes, half-timbered houses, a castle above the rooftops. The city's long industrial history brought many Turkish families here, now in their second and third generation. For Veysel, Esslingen is practically the neighbourhood, both logistically and personally.",
      tr: 'Esslingen, Stuttgart’a o kadar yakın ki ulaşım ve yerel bilgi neredeyse hiç değişmiyor — tek fark, tamamen kendine özgü bir manzara: dar sokaklar, ahşap kirişli evler, çatıların üzerinde bir kale. Şehrin uzun sanayi tarihi, artık ikinci ve üçüncü kuşakta olan birçok Türk aileyi buraya getirdi. Veysel için Esslingen hem plan hem de gönül olarak neredeyse komşu.',
    },
    angle: {
      de: 'Kurze Wege bedeuten mehr Zeit für das, was zählt: ein ausführliches Vorgespräch, ein Soundcheck ohne Zeitdruck, Flexibilität bei spontanen Programmänderungen am Abend. Für deutsch-türkische Feiern in Esslingen kommt dazu, dass Moderation und Musikauswahl von Anfang an zweisprachig gedacht werden – nicht als Zusatzoption, sondern als Standard.',
      en: 'Short distances mean more time for what matters: a thorough planning call, an unhurried soundcheck, flexibility for last-minute changes on the night. For German-Turkish celebrations in Esslingen, hosting and music selection are bilingual by default, not an add-on.',
      tr: 'Kısa mesafeler, önemli olan şeye daha çok zaman ayrılması demek: ayrıntılı bir ön görüşme, zaman baskısı olmayan bir ses kontrolü, akşam son anda değişen programlara esneklik. Esslingen’deki Alman-Türk kutlamalarında sunum ve müzik seçimi baştan itibaren iki dilli düşünülür — ek seçenek değil, standarttır.',
    },
    faq: [
      {
        question: {
          de: 'Spielen Sie auch in der Esslinger Altstadt, wo Technik-Transport schwieriger ist?',
          en: "Do you also play in Esslingen's old town, where equipment access is tighter?",
          tr: 'Ulaşımın zor olduğu Esslingen eski şehir merkezinde de çalıyor musunuz?',
        },
        answer: {
          de: 'Ja. Enge Zufahrten und Treppen in der Altstadt werden im Vorgespräch besprochen, damit Auf- und Abbau ohne Zeitdruck laufen – notfalls mit angepasstem, kompakterem Setup.',
          en: "Yes. Narrow access roads and stairs in the old town are discussed in advance so setup and teardown run without time pressure — with a more compact setup if needed.",
          tr: 'Evet. Eski şehirdeki dar girişler ve merdivenler önceden konuşulur; gerekirse daha kompakt bir kurulumla, zaman baskısı olmadan kurulum ve toplama yapılır.',
        },
      },
      {
        question: {
          de: 'Ist Esslingen im anfahrtskostenfreien Radius enthalten?',
          en: 'Is Esslingen within the travel-included radius?',
          tr: 'Esslingen, ek ücretsiz ulaşım kapsamında mı?',
        },
        answer: {
          de: 'Ja, die kurze Distanz zu Stuttgart liegt innerhalb der inklusive Anfahrt – keine versteckten Zuschläge.',
          en: 'Yes, the short distance from Stuttgart falls well within the included-travel range — no hidden surcharges.',
          tr: 'Evet, Stuttgart’a olan kısa mesafe ücretsiz ulaşım kapsamının rahatlıkla içinde — gizli ek ücret yok.',
        },
      },
    ],
  },
  {
    slug: 'reutlingen',
    name: 'Reutlingen',
    region: 'Baden-Württemberg',
    distanceKm: 32,
    population: 118852,
    priority: 1,
    turkishCommunity: true,
    nearby: ['tuebingen', 'esslingen', 'boeblingen', 'pforzheim'],
    travel: { included: true },
    venues: [
      {
        name: 'Alte Färberei',
        kind: 'location',
        note: {
          de: 'Historischer Veranstaltungsort in Reutlingen mit Platz für größere Feiern.',
          en: 'A historic event venue in Reutlingen with room for larger celebrations.',
          tr: 'Reutlingen’de büyük kutlamalara yer veren tarihi bir etkinlik mekânı.',
        },
      },
    ],
    intro: {
      de: 'Reutlingen ist das Tor zur Schwäbischen Alb – die Stadt selbst mit einer langen Textilindustrie-Geschichte, die schon in den 1960er- und 70er-Jahren viele türkische Familien in die Region brachte. Über der Stadt liegt die Achalm, Reutlingens Hausberg, mit Panoramablick bis zur Alb; unten in der Stadt hat sich die historische Alte Färberei zu einem beliebten Ort für größere Feiern entwickelt.',
      en: "Reutlingen is the gateway to the Swabian Alb — a city with a long textile-industry history that brought many Turkish families to the region as early as the 1960s and 70s. Above the city sits the Achalm, Reutlingen's local mountain, with panoramic views towards the Alb; down in the city itself, the historic Alte Färberei has become a popular venue for larger celebrations.",
      tr: 'Reutlingen, Schwäbische Alb’e açılan kapı — 1960’lı ve 70’li yıllarda birçok Türk aileyi bölgeye getiren uzun bir tekstil sanayisi geçmişine sahip bir şehir. Şehrin üzerinde, Reutlingen’in ev dağı Achalm, Alb’e kadar uzanan panoramik manzarasıyla yükseliyor; şehrin içinde ise tarihi Alte Färberei büyük kutlamalar için tercih edilen bir mekâna dönüştü.',
    },
    angle: {
      de: '32 Kilometer bedeuten hier keinen Kompromiss: Anfahrt ist inklusive, und die Nähe zur Alb-Landschaft macht Reutlingen für Paare interessant, die eine Trauung im Grünen mit einer Feier in der Stadt kombinieren wollen. Die lange gemeinsame Geschichte der Stadt mit ihrer türkischen Community sorgt zudem dafür, dass zweisprachige Moderation hier auf beiden Seiten selbstverständlich erwartet wird.',
      en: "32 kilometres is no compromise here: travel is included, and the proximity to the Alb landscape makes Reutlingen attractive for couples who want an outdoor ceremony combined with a celebration in the city. The city's long shared history with its Turkish community also means bilingual hosting is taken for granted on both sides.",
      tr: 'Burada 32 kilometre bir taviz anlamına gelmiyor: ulaşım dahil, Alb manzarasına yakınlık ise Reutlingen’i açık havada bir nikâh töreniyle şehirde bir kutlamayı birleştirmek isteyen çiftler için cazip kılıyor. Şehrin Türk topluluğuyla olan uzun ortak geçmişi, iki dilli sunumun her iki tarafta da doğal bir beklenti olmasını sağlıyor.',
    },
    faq: [
      {
        question: {
          de: 'Ist die Anfahrt nach Reutlingen im Preis enthalten?',
          en: 'Is travel to Reutlingen included in the price?',
          tr: 'Reutlingen’e ulaşım fiyata dahil mi?',
        },
        answer: {
          de: 'Ja, die rund 32 Kilometer von Stuttgart liegen innerhalb der inklusive Anfahrt von 50 Kilometern.',
          en: 'Yes, the roughly 32 kilometres from Stuttgart fall within the 50 km travel-included range.',
          tr: 'Evet, Stuttgart’a olan yaklaşık 32 kilometrelik mesafe, 50 km’lik ücretsiz ulaşım aralığının içinde.',
        },
      },
      {
        question: {
          de: 'Spielen Sie auch in der Alten Färberei oder anderen Locations in Reutlingen?',
          en: 'Do you also play at the Alte Färberei or other venues in Reutlingen?',
          tr: 'Alte Färberei’de ya da Reutlingen’deki diğer mekânlarda da çalıyor musunuz?',
        },
        answer: {
          de: 'Ja. Für historische Locations mit besonderem Charakter wird der Aufbau vorab mit der Location abgestimmt, damit Technik pünktlich und ohne Stress steht.',
          en: 'Yes. For historic venues with real character, setup is coordinated with the venue in advance so equipment is in place on time and without stress.',
          tr: 'Evet. Kendine has karaktere sahip tarihi mekânlar için kurulum önceden mekânla netleştirilir; böylece ekipman zamanında ve sorunsuz hazır olur.',
        },
      },
    ],
  },
  {
    slug: 'heilbronn',
    name: 'Heilbronn',
    region: 'Baden-Württemberg',
    distanceKm: 40,
    population: 131653,
    priority: 1,
    turkishCommunity: true,
    nearby: ['boeblingen', 'esslingen', 'reutlingen', 'ludwigsburg'],
    // Luftlinie laut Recherche ~40 km, damit innerhalb der 50-km-Zone —
    // anders als in einem früheren Entwurf dieser Datei (dort mit
    // geschätzter Fahrstrecke als "außerhalb" markiert). Diese Fassung
    // folgt der recherchierten Luftlinien-Distanz.
    travel: { included: true },
    // Burg Weibertreu (Weinsberg) ist real und ein bekanntes Wahrzeichen,
    // aber laut docs/SEO-CITY-STRATEGY.md nicht als buchbare Hochzeits-
    // location verifiziert — deshalb hier bewusst KEIN venues-Eintrag,
    // nur als Stimmungsbild in `intro` erwähnt. TODO(kunde): echte
    // buchbare Location für Heilbronn bestätigen.
    venues: [],
    intro: {
      de: 'Heilbronn ist Weinstadt und Neckarstadt zugleich – umgeben von Rebhängen, mit einer nach dem Wiederaufbau großzügig angelegten Innenstadt, die viel Platz für große Feiern bietet. Bis heute trägt die Stadt den Beinamen „Käthchenstadt“, nach der Sage der schönen Käthchen von Heilbronn. Wenige Kilometer entfernt, im benachbarten Weinsberg, thront zudem die sagenumwobene Burgruine Weibertreu über den Weinbergen – ein vertrautes Motiv für viele Familien aus der Region.',
      en: "Heilbronn is a wine town and a river town at once — surrounded by vineyards, with a spaciously rebuilt city centre that offers plenty of room for large celebrations. The city still carries the nickname 'Käthchenstadt', after the legend of the beautiful Käthchen of Heilbronn. A few kilometres away, in neighbouring Weinsberg, the legendary Weibertreu castle ruin also rises above the vines — a familiar sight for many families from the region.",
      tr: 'Heilbronn hem şarap hem nehir kenti — bağ yamaçlarıyla çevrili, savaş sonrası geniş biçimde yeniden inşa edilen ve büyük kutlamalara bolca yer sunan bir şehir merkeziyle. Şehir bugün hâlâ, güzel Käthchen von Heilbronn efsanesinden gelen “Käthchenstadt” lakabını taşıyor. Birkaç kilometre ötede, komşu Weinsberg’de, efsanevi Weibertreu kale kalıntısı da bağların üzerinde yükseliyor — bölgeden birçok aile için tanıdık bir manzara.',
    },
    angle: {
      de: 'Heilbronn liegt innerhalb der anfahrtskostenfreien Zone – keine Extrakosten, keine Überraschungen im Angebot. Gebucht wird hier regelmäßig, weil es in der Region kaum einen Anbieter gibt, der DJ-Set, Live-Orchester mit Bläsern und dreisprachige Moderation aus einer Hand liefert und dabei Halay genauso souverän spielt wie einen klassischen Hochzeitswalzer.',
      en: "Heilbronn falls within the travel-included zone — no extra cost, no surprises in the quote. Couples book from here regularly because there's hardly another provider in the region who delivers a DJ set, a live orchestra with horns and trilingual hosting from one supplier, playing Halay with the same confidence as a classic wedding waltz.",
      tr: 'Heilbronn, ücretsiz ulaşımın geçerli olduğu bölgenin içinde — ek maliyet yok, teklifte sürpriz yok. Buradan düzenli olarak rezervasyon alınıyor, çünkü bölgede DJ seti, nefesli çalgılı canlı orkestra ve üç dilde sunumu tek elden sunan, halayı da klasik düğün valsini de aynı özgüvenle çalan başka bir sağlayıcı neredeyse yok.',
    },
    faq: [
      {
        question: {
          de: 'Fällt für Heilbronn eine Anfahrtspauschale an?',
          en: 'Is there a travel surcharge for Heilbronn?',
          tr: 'Heilbronn için ek ulaşım ücreti var mı?',
        },
        answer: {
          de: 'Nein. Die rund 40 Kilometer von Stuttgart liegen innerhalb der anfahrtskostenfreien Zone – ohne Aufpreis.',
          en: 'No. The roughly 40 kilometres from Stuttgart fall within the travel-included zone — no surcharge.',
          tr: 'Hayır. Stuttgart’a olan yaklaşık 40 kilometrelik mesafe, ücretsiz ulaşım bölgesinin içinde — ek ücret yok.',
        },
      },
      {
        question: {
          de: 'Spielen Sie auch bei Feiern in den Weinbergen rund um Heilbronn?',
          en: 'Do you also play celebrations in the vineyards around Heilbronn?',
          tr: 'Heilbronn çevresindeki bağlarda yapılan kutlamalarda da çalıyor musunuz?',
        },
        answer: {
          de: 'Ja. Outdoor-Locations in den Rebhängen rund um Heilbronn und Weinsberg werden vorab auf Strom, Wetter und Lautstärke abgestimmt.',
          en: 'Yes. Outdoor venues in the vineyards around Heilbronn and Weinsberg are coordinated in advance for power, weather and volume.',
          tr: 'Evet. Heilbronn ve Weinsberg çevresindeki bağ yamaçlarındaki açık hava mekânları için elektrik, hava durumu ve ses seviyesi önceden netleştirilir.',
        },
      },
    ],
  },
  {
    slug: 'pforzheim',
    name: 'Pforzheim',
    region: 'Baden-Württemberg',
    distanceKm: 57,
    population: 135087,
    priority: 1,
    turkishCommunity: true,
    nearby: ['karlsruhe', 'baden-baden', 'boeblingen', 'reutlingen'],
    // Luftlinie laut Recherche ~57 km, damit außerhalb der 50-km-Zone —
    // anders als in einem früheren Entwurf dieser Datei (dort mit
    // geschätzter Fahrstrecke als "innerhalb" markiert).
    travel: {
      included: false,
      note: {
        de: 'Pforzheim liegt knapp über der anfahrtskostenfreien 50-km-Grenze. Die Anfahrt wird transparent im individuellen Angebot ausgewiesen – keine versteckten Aufschläge.',
        en: 'Pforzheim is just beyond the 50 km travel-included line. Travel is itemised transparently in your individual quote — no hidden surcharges.',
        tr: 'Pforzheim, 50 km’lik ücretsiz ulaşım sınırının hemen ötesinde. Ulaşım, size özel teklifte şeffaf şekilde ayrıca gösterilir — gizli ek ücret yok.',
      },
    },
    // TODO(kunde): Konkrete Hochzeitslocation in Pforzheim im
    // Recherche-Pass nicht verifiziert — siehe SEO-CITY-STRATEGY.md.
    venues: [],
    intro: {
      de: 'Pforzheim heißt nicht umsonst Goldstadt – jahrhundertelange Schmuck- und Uhrenindustrie hat die Stadt geprägt und viele Familien aus der Türkei angezogen, die hier gearbeitet und Wurzeln geschlagen haben. Gleichzeitig liegt Pforzheim im Nagoldtal, am Eingang zum Nordschwarzwald: Wer die Trauung im Wald oder in einem Schwarzwald-Gasthof feiert und die Party anschließend in der Stadt weiterlaufen lässt, ist hier goldrichtig.',
      en: "Pforzheim isn't called the 'Gold City' for nothing — centuries of jewellery and watchmaking shaped the town and drew many families from Turkey who worked here and put down roots. Pforzheim also sits in the Nagold valley, right at the entrance to the northern Black Forest: for couples marrying in the forest or a Black Forest inn and continuing the party in town, this is exactly the right base.",
      tr: 'Pforzheim’a “Altın Şehir” denmesi boşuna değil — yüzyıllar süren mücevher ve saat sanayisi şehri şekillendirdi ve burada çalışıp kök salan birçok Türk aileyi kente getirdi. Pforzheim aynı zamanda Nagold vadisinde, kuzey Karaormanı’nın hemen girişinde: ormanda ya da bir Schwarzwald hanında nikâh kıyıp partiyi şehirde sürdürmek isteyen çiftler için tam doğru üs.',
    },
    angle: {
      de: 'Pforzheim liegt knapp außerhalb der anfahrtskostenfreien Zone – ehrlich im Angebot ausgewiesen statt versteckt aufgeschlagen. Gebucht wird die Goldstadt trotzdem regelmäßig: Die migrationsgeschichtlich enge Verbindung zur Türkei macht zweisprachige Moderation hier zum Normalfall, und DJ-Set, Live-Orchester mit Bläsern und Moderation aus einer Hand sind in der Region selten.',
      en: "Pforzheim falls just outside the travel-included zone — itemised honestly in the quote rather than quietly added on. The Gold City still books regularly: the town's long migration history with Turkey makes bilingual hosting the norm here, and a DJ set, live orchestra with horns and hosting from one supplier are hard to find in the region.",
      tr: 'Pforzheim, ücretsiz ulaşım bölgesinin hemen dışında kalıyor — bunu gizlemek yerine teklifte dürüstçe gösteriyoruz. Yine de Altın Şehir’den düzenli rezervasyon alınıyor: şehrin Türkiye ile uzun göç geçmişi burada iki dilli sunumu kural hâline getiriyor, DJ seti, nefesli çalgılı canlı orkestra ve sunumu tek elden sunan bir sağlayıcı ise bölgede nadir.',
    },
    faq: [
      {
        question: {
          de: 'Was kostet die Anfahrt nach Pforzheim zusätzlich?',
          en: 'What does the extra travel to Pforzheim cost?',
          tr: 'Pforzheim için ek ulaşım ücreti ne kadar?',
        },
        answer: {
          de: 'Pforzheim liegt knapp über der 50-km-Grenze der inklusive Anfahrt. Der Mehrbetrag wird transparent im schriftlichen Angebot ausgewiesen, bevor Sie sich entscheiden.',
          en: 'Pforzheim is just beyond the 50 km included-travel line. The additional amount is itemised transparently in the written quote before you decide.',
          tr: 'Pforzheim, ücretsiz ulaşımın geçerli olduğu 50 km sınırının hemen ötesinde. Ek tutar, karar vermeden önce yazılı teklifte açıkça gösterilir.',
        },
      },
      {
        question: {
          de: 'Wir feiern die Trauung im Schwarzwald oder Nagoldtal und die Party in Pforzheim – geht das?',
          en: 'We\'re marrying in the Black Forest or the Nagold valley and partying in Pforzheim — is that possible?',
          tr: 'Nikâhı Karaorman’da ya da Nagold vadisinde, partiyi Pforzheim’da yapıyoruz — bu mümkün mü?',
        },
        answer: {
          de: 'Ja, das ist ein häufiges Format in der Region. Zeitpläne und Technik-Transport zwischen zwei Locations werden im Vorgespräch minutengenau abgestimmt.',
          en: "Yes, that's a common format in the region. Timings and equipment transport between two venues are coordinated to the minute during the planning call.",
          tr: 'Evet, bölgede sık görülen bir format. İki mekân arasındaki zamanlama ve ekipman taşıması, ön görüşmede dakikası dakikasına planlanır.',
        },
      },
    ],
  },
  {
    slug: 'karlsruhe',
    name: 'Karlsruhe',
    region: 'Baden-Württemberg',
    distanceKm: 62,
    population: 309964,
    priority: 1,
    turkishCommunity: true,
    nearby: ['pforzheim', 'baden-baden', 'mannheim', 'boeblingen'],
    travel: {
      included: false,
      note: {
        de: 'Karlsruhe liegt außerhalb des 50-km-Radius mit inklusiver Anfahrt. Die Fahrtstrecke von rund 62 Kilometern wird im individuellen Angebot offen ausgewiesen.',
        en: 'Karlsruhe falls outside the 50 km travel-included radius. The roughly 62 km distance is itemised openly in your individual quote.',
        tr: 'Karlsruhe, ücretsiz ulaşımın geçerli olduğu 50 km’lik yarıçapın dışında kalıyor. Yaklaşık 62 km’lik mesafe, size özel teklifte açıkça gösterilir.',
      },
    },
    venues: [
      {
        name: 'Festsaal im Schloss Karlsburg Durlach',
        kind: 'saal',
        note: {
          de: 'Historischer Festsaal im Karlsburger Schloss in Durlach (erbaut 1563) – rund 242 m² und Platz für bis zu 140 Gäste.',
          en: "A historic ceremony hall in Durlach's Karlsburg palace (built in 1563) — around 242 m² with room for up to 140 guests.",
          tr: 'Durlach’taki Karlsburg Sarayı içinde tarihi bir tören salonu (1563 yapımı) — yaklaşık 242 m² büyüklüğünde, 140 kişiye kadar davetli kapasitesi.',
        },
      },
    ],
    intro: {
      de: 'Karlsruhe ist die Fächerstadt – strahlenförmig um das Schloss angelegt, eine der größten Städte Baden-Württembergs und durch Universität und Nähe zum Elsass eine der internationalsten der Region. Die Stadt hat außerdem eine der größeren türkisch-deutschen Communities im Land – die Nachfrage nach türkischen Hochzeitslocations in Karlsruhe ist so groß, dass eigene Verzeichnisse dafür existieren.',
      en: "Karlsruhe is the 'fan city' — laid out in rays around the palace, one of Baden-Württemberg's largest cities, and one of the region's most international thanks to its university and proximity to Alsace. It's also home to one of the state's larger Turkish-German communities — demand for Turkish wedding venues in Karlsruhe is strong enough that dedicated directories exist for it.",
      tr: 'Karlsruhe, “yelpaze şehir” — saray etrafında ışınsal olarak kurulmuş, Baden-Württemberg’in en büyük şehirlerinden biri ve üniversitesi ile Alsace’a yakınlığı sayesinde bölgenin en uluslararası kentlerinden. Ayrıca eyaletin daha büyük Türk-Alman topluluklarından birine ev sahipliği yapıyor — Karlsruhe’de Türk düğün mekânlarına olan talep o kadar yüksek ki, bunun için özel rehberler bile var.',
    },
    angle: {
      de: '62 Kilometer sind kein Katzensprung, deshalb wird die Anfahrt für Karlsruhe offen im Angebot ausgewiesen statt versteckt draufgeschlagen. Gebucht wird trotzdem regelmäßig aus der Fächerstadt – weil ein Anbieter, der DJ-Set, Live-Orchester mit Bläsern und Moderation auf Deutsch, Türkisch und Englisch aus einer Hand liefert, in der Region schwer zu finden ist.',
      en: "62 kilometres is no small distance, which is why travel to Karlsruhe is itemised openly in the quote rather than quietly added on. Couples still book from the fan city regularly — because a provider delivering a DJ set, a live orchestra with horns and hosting in German, Turkish and English from one supplier is hard to find in this region.",
      tr: '62 kilometre küçük bir mesafe değil, bu yüzden Karlsruhe’ye ulaşım gizlice eklenmek yerine teklifte açıkça gösterilir. Yine de yelpaze şehirden düzenli olarak rezervasyon alınıyor — çünkü DJ seti, nefesli çalgılı canlı orkestra ve Almanca, Türkçe ve İngilizce sunumu tek elden sunan bir sağlayıcı bu bölgede bulmak zor.',
    },
    faq: [
      {
        question: {
          de: 'Was kostet die Anfahrt von Stuttgart nach Karlsruhe zusätzlich?',
          en: 'What does the extra travel from Stuttgart to Karlsruhe cost?',
          tr: 'Stuttgart’tan Karlsruhe’ye ek ulaşım ne kadar tutar?',
        },
        answer: {
          de: 'Karlsruhe liegt außerhalb der 50-km-Inklusivstrecke. Die tatsächliche Fahrtstrecke von rund 62 Kilometern wird nachvollziehbar im schriftlichen Angebot berechnet, bevor Sie sich festlegen.',
          en: 'Karlsruhe is outside the 50 km included-travel range. The actual distance of roughly 62 km is calculated transparently in the written quote before you commit.',
          tr: 'Karlsruhe, ücretsiz ulaşımın geçerli olduğu 50 km aralığının dışında. Yaklaşık 62 km’lik gerçek mesafe, karar vermeden önce yazılı teklifte şeffaf şekilde hesaplanır.',
        },
      },
      {
        question: {
          de: 'Spielen Sie auch im Festsaal Schloss Karlsburg Durlach oder ähnlichen Locations?',
          en: 'Do you also play at the Festsaal in Schloss Karlsburg Durlach or similar venues?',
          tr: 'Festsaal Schloss Karlsburg Durlach’ta ya da benzer mekânlarda da çalıyor musunuz?',
        },
        answer: {
          de: 'Ja, sofern die Location dort Feiern erlaubt. Auflagen zu Lautstärke und Aufbauzeiten werden vorab direkt mit der Location geklärt.',
          en: 'Yes, as long as the venue permits celebrations there. Rules on volume and setup times are clarified directly with the venue in advance.',
          tr: 'Evet, mekân orada kutlamalara izin verdiği sürece. Ses seviyesi ve kurulum saatleriyle ilgili kurallar önceden doğrudan mekânla netleştirilir.',
        },
      },
    ],
  },
  {
    slug: 'mannheim',
    name: 'Mannheim',
    region: 'Baden-Württemberg',
    distanceKm: 95,
    population: 316877,
    priority: 1,
    turkishCommunity: true,
    nearby: ['heidelberg', 'karlsruhe', 'pforzheim'],
    travel: {
      included: false,
      note: {
        de: 'Mannheim liegt außerhalb des 50-km-Radius mit inklusiver Anfahrt. Die Fahrtstrecke von rund 95 Kilometern wird im individuellen Angebot offen ausgewiesen.',
        en: 'Mannheim falls outside the 50 km travel-included radius. The roughly 95 km distance is itemised openly in your individual quote.',
        tr: 'Mannheim, ücretsiz ulaşımın geçerli olduğu 50 km’lik yarıçapın dışında kalıyor. Yaklaşık 95 km’lik mesafe, size özel teklifte açıkça gösterilir.',
      },
    },
    venues: [
      {
        name: 'Dügün Salonu Mannheim',
        kind: 'saal',
        note: {
          de: 'Eigener türkischer Hochzeitssaal in Mannheim – ein Beleg für die aktive türkische Community der Stadt. Keine Partnerschaft, sondern eine bekannte lokale Adresse zur Orientierung.',
          en: "A dedicated Turkish wedding hall in Mannheim — evidence of the city's active Turkish community. Not a partnership, just a well-known local address for orientation.",
          tr: 'Mannheim’da kendine ait bir Türk düğün salonu — şehrin aktif Türk topluluğunun bir kanıtı. Bir ortaklık değil, yönlendirme amaçlı bilinen bir yerel adres.',
        },
      },
    ],
    intro: {
      de: 'Mannheim ist die „Quadratestadt“ – ein schachbrettartiger Grundriss am Zusammenfluss von Rhein und Neckar und eine der Städte mit der am längsten gewachsenen türkisch-deutschen Community im Land. Ein sehr hoher Anteil der Bevölkerung hat internationale Wurzeln, entsprechend vielfältig sind Hochzeiten hier – von rein türkischen bis zu deutsch-türkisch gemischten Feiern.',
      en: "Mannheim is the 'city of squares' — a chessboard-like grid at the confluence of the Rhine and Neckar, and one of the cities with the longest-established Turkish-German community in the state. A very high share of the population has international roots, and weddings here reflect that diversity — from purely Turkish celebrations to German-Turkish mixed ones.",
      tr: 'Mannheim, “kareler şehri” — Ren ve Neckar nehirlerinin birleştiği noktada satranç tahtası gibi bir plana sahip ve eyaletteki en köklü Türk-Alman topluluklarından birine ev sahipliği yapan şehirlerden biri. Nüfusun çok büyük bir kısmı uluslararası kökene sahip, düğünler de buna paralel şekilde çeşitli — tamamen Türk düğünlerinden Alman-Türk karma kutlamalara kadar.',
    },
    angle: {
      de: 'Mannheim ist kein Zufallsziel: In der Stadt gibt es einen eigenen türkischen Hochzeitssaal – ein Beleg für eine gewachsene, aktive Community. Genau in dieses Umfeld passt ein Anbieter, der DJ-Set, Live-Orchester mit Bläsern und Moderation auf Deutsch, Türkisch und Englisch aus einer Hand liefert. Die rund 95 Kilometer Anfahrt werden dafür transparent im individuellen Angebot ausgewiesen.',
      en: "Mannheim isn't a random target: the city has its own Turkish wedding hall — proof of a long-established, active community. That's exactly the setting for a provider delivering a DJ set, a live orchestra with horns and hosting in German, Turkish and English from one supplier. The roughly 95 km of travel involved is itemised transparently in your individual quote.",
      tr: 'Mannheim rastgele seçilmiş bir hedef değil: şehrin kendi Türk düğün salonu var — köklü ve aktif bir topluluğun kanıtı. Tam olarak bu ortama, DJ seti, nefesli çalgılı canlı orkestra ve Almanca, Türkçe, İngilizce sunumu tek elden sunan bir sağlayıcı yakışıyor. Yaklaşık 95 kilometrelik ulaşım, size özel teklifte şeffaf şekilde gösterilir.',
    },
    faq: [
      {
        question: {
          de: 'Was kostet die Anfahrt von Stuttgart nach Mannheim zusätzlich?',
          en: 'What does the extra travel from Stuttgart to Mannheim cost?',
          tr: 'Stuttgart’tan Mannheim’a ek ulaşım ne kadar tutar?',
        },
        answer: {
          de: 'Mannheim liegt außerhalb der 50-km-Inklusivstrecke. Die tatsächliche Distanz von rund 95 Kilometern wird transparent im schriftlichen Angebot berechnet.',
          en: 'Mannheim is outside the 50 km included-travel range. The actual distance of roughly 95 km is calculated transparently in the written quote.',
          tr: 'Mannheim, ücretsiz ulaşımın geçerli olduğu 50 km aralığının dışında. Yaklaşık 95 km’lik gerçek mesafe, yazılı teklifte şeffaf şekilde hesaplanır.',
        },
      },
      {
        question: {
          de: 'Spielen Sie auch bei rein türkischen Hochzeiten, nicht nur bei gemischten Feiern?',
          en: 'Do you also play purely Turkish weddings, not just mixed celebrations?',
          tr: 'Sadece karma kutlamalarda değil, tamamen Türk düğünlerinde de çalıyor musunuz?',
        },
        answer: {
          de: 'Ja, selbstverständlich. Ob rein türkisch, deutsch-türkisch gemischt oder international – Musikauswahl und Moderation werden auf Ihre Feier zugeschnitten.',
          en: 'Yes, of course. Whether purely Turkish, German-Turkish mixed or international — music and hosting are tailored to your celebration.',
          tr: 'Evet, elbette. İster tamamen Türk, ister Alman-Türk karma, ister uluslararası olsun — müzik seçimi ve sunum kutlamanıza göre şekillendirilir.',
        },
      },
    ],
  },
  {
    /** Tier 2 — siehe „Batch August 2026" im Dateikopf. */
    slug: 'tuebingen',
    name: 'Tübingen',
    region: 'Baden-Württemberg',
    distanceKm: 30,
    population: 93615,
    priority: 1,
    turkishCommunity: false,
    nearby: ['reutlingen', 'boeblingen', 'esslingen', 'villingen-schwenningen'],
    travel: { included: true },
    // TODO(kunde): keine Hochzeitslocation im Recherche-Pass verifiziert —
    // siehe docs/SEO-CITY-STRATEGY.md. Lieber leer als erfunden.
    venues: [],
    intro: {
      de: 'Tübingen ist und bleibt eine Universitätsstadt: Viele Paare, die hier heiraten, sind über Studium oder Forschung hergekommen, und die Gästeliste reicht entsprechend oft weit über Deutschland hinaus. Dazu die Kulisse, für die Tübingen bekannt ist — der Neckar mit seinen Stocherkähnen, dahinter die Fachwerkgiebel und schmalen Gassen der Altstadt. Wer hier feiert, feiert selten auf der grünen Wiese, sondern mittendrin.',
      en: 'Tübingen is and remains a university town: many couples marrying here arrived through study or research, and the guest list reaches well beyond Germany accordingly. Then there is the setting the town is known for — the Neckar with its Stocherkahn punts, and behind it the half-timbered gables and narrow lanes of the old town. A wedding here is rarely held out in a field; it happens in the middle of everything.',
      tr: 'Tübingen bir üniversite şehri ve öyle kalıyor: burada evlenen birçok çift şehre eğitim ya da araştırma yoluyla gelmiş, davetli listesi de buna bağlı olarak sık sık Almanya’nın dışına taşıyor. Bir de şehrin bilinen manzarası var — Neckar ve üzerindeki Stocherkahn kayıkları, arkasında eski şehrin ahşap kirişli cepheleri ve dar sokakları. Tübingen’de düğünler genelde şehrin dışında değil, tam ortasında yapılıyor.',
    },
    angle: {
      de: '30 Kilometer heißt: Anfahrt inklusive, ohne Aufschlag. Der eigentliche Knackpunkt in Tübingen ist ohnehin nicht die Strecke, sondern die letzten hundert Meter — Zufahrt zum Entladen in der Altstadt, Kabelwege über altes Pflaster, oft Treppen statt Aufzug, dazu die Sperrzeiten. Das wird vorher geklärt, nicht am Hochzeitstag. Und weil die Gästeliste hier häufig international ist, zählt im Ablauf, dass auch Gäste ohne Deutschkenntnisse jederzeit wissen, was als Nächstes passiert.',
      en: '30 kilometres means travel is included, no surcharge. The real bottleneck in Tübingen is not the drive anyway — it is the last hundred metres: unloading access in the old town, cable runs over old paving, often stairs instead of a lift, plus quiet hours. That gets settled beforehand, not on the wedding day. And with a guest list this international, the running order has to keep guests with no German knowing what comes next.',
      tr: '30 kilometre, ulaşımın dahil olması demek — ek ücret yok. Tübingen’de asıl mesele zaten yol değil, son yüz metre: eski şehirde yükleme için araç girişi, eski taş döşeme üzerinden kablo geçişleri, çoğu zaman asansör yerine merdiven, bir de sessizlik saatleri. Bunlar düğün günü değil, öncesinde netleşir. Davetli listesi burada sık sık uluslararası olduğu için programda şu belirleyici oluyor: Almanca bilmeyen davetliler de sıradaki adımın ne olduğunu her an bilsin.',
    },
    faq: [
      {
        question: {
          de: 'Wir möchten zwischendurch für Fotos mit dem Stocherkahn auf den Neckar. Was passiert in der Zwischenzeit auf der Feier?',
          en: 'We want to slip away to the Neckar for Stocherkahn photos. What happens at the party while we are gone?',
          tr: 'Arada Neckar’da Stocherkahn ile fotoğraf çektirmek istiyoruz. Biz yokken kutlamada ne oluyor?',
        },
        answer: {
          de: 'Diese Lücke wird eingeplant, nicht überbrückt. Der Zeitpunkt kommt dorthin in den Ablauf, wo er am wenigsten kostet — meist nach dem Essen, wenn die Gäste ohnehin in Bewegung sind. Musik und Ansagen laufen so weiter, dass die Stimmung nicht abreißt, und Ihre Rückkehr in den Saal wird als eigener Moment gesetzt statt nebenbei zu passieren.',
          en: 'That gap gets planned in, not papered over. It goes into the running order where it costs least — usually after the meal, when guests are up and moving anyway. Music and announcements carry the room while you are away, and your return to the hall is set up as a moment of its own rather than happening in passing.',
          tr: 'Bu boşluk sonradan doldurulmaz, baştan programa yazılır. En az zarar verdiği ana yerleştirilir — genelde yemekten sonra, davetliler zaten hareket hâlindeyken. Siz yokken müzik ve anonslar salondaki havayı düşürmeyecek şekilde devam eder, salona dönüşünüz ise araya sıkışmak yerine ayrı bir an olarak planlanır.',
        },
      },
      {
        question: {
          de: 'Ein Teil unserer Gäste spricht kein Deutsch, viele reisen aus dem Ausland an. Wie läuft dann die Moderation?',
          en: 'Some of our guests speak no German and many travel in from abroad. How does the hosting work then?',
          tr: 'Davetlilerimizin bir kısmı Almanca bilmiyor, birçoğu yurt dışından geliyor. Sunum nasıl yapılıyor?',
        },
        answer: {
          de: 'Die wichtigen Ansagen laufen in der Sprache, die Ihre Gäste tatsächlich verstehen — meist Deutsch plus Englisch. Was wann angesagt wird, legen wir im Vorgespräch anhand Ihrer Gästeliste fest, damit niemand raten muss, wann Einzug, Essen oder Tanz beginnt.',
          en: 'The announcements that matter run in the language your guests actually understand — usually German plus English. What is announced and when is set during the planning call, based on your guest list, so nobody has to guess when the entrance, the meal or the dancing begins.',
          tr: 'Önemli anonslar davetlilerinizin gerçekten anladığı dilde yapılır — genelde Almanca ve İngilizce. Neyin ne zaman anons edileceği, ön görüşmede davetli listenize göre belirlenir; böylece çiftin salona girişini, yemeği ya da dansın başlangıcını kimse tahmin etmek zorunda kalmaz.',
        },
      },
      {
        question: {
          de: 'Wird die Fahrt nach Tübingen separat berechnet?',
          en: 'Is the drive to Tübingen billed separately?',
          tr: 'Tübingen’e ulaşım ayrıca faturalandırılıyor mu?',
        },
        answer: {
          de: 'Nein. Mit rund 30 Kilometern Luftlinie ab Stuttgart liegt Tübingen deutlich innerhalb der 50-km-Zone, in der die Anfahrt zum Paketpreis gehört. Im Angebot taucht dafür keine eigene Position auf.',
          en: 'No. At roughly 30 kilometres from Stuttgart as the crow flies, Tübingen sits comfortably inside the 50 km zone where travel belongs to the package price. No separate line appears for it in the quote.',
          tr: 'Hayır. Stuttgart’tan yaklaşık 30 kilometre kuş uçuşu mesafedeki Tübingen, ulaşımın paket fiyatına dahil olduğu 50 km’lik bölgenin rahatlıkla içinde. Teklifte bunun için ayrı bir kalem yer almaz.',
        },
      },
    ],
  },
  {
    /** Tier 2 — siehe „Batch August 2026" im Dateikopf. */
    slug: 'goeppingen',
    name: 'Göppingen',
    region: 'Baden-Württemberg',
    distanceKm: 35,
    population: 58905,
    priority: 1,
    turkishCommunity: false,
    nearby: ['esslingen', 'schwaebisch-gmuend', 'ulm', 'reutlingen'],
    travel: { included: true },
    // TODO(kunde): keine Hochzeitslocation im Recherche-Pass verifiziert —
    // siehe docs/SEO-CITY-STRATEGY.md. Lieber leer als erfunden.
    venues: [],
    intro: {
      de: 'Göppingen liegt im Filstal, rund 35 Kilometer von Stuttgart entfernt – eine Stadt an der Fils, hinter der unmittelbar die Vorberge der Schwäbischen Alb ansteigen. Mit knapp 59.000 Einwohnern ist Göppingen groß genug für Feiern mitten in der Stadt und klein genug, dass die freie Landschaft in wenigen Minuten erreicht ist. Genau diese Nachbarschaft von Talsohle und Albrand prägt, wie hier geheiratet wird: oft an zwei Orten an einem Tag.',
      en: 'Göppingen sits in the Fils valley, around 35 kilometres from Stuttgart — a town on the river Fils, with the foothills of the Swabian Alb rising immediately behind it. With just under 59,000 inhabitants, Göppingen is big enough for celebrations in the middle of town and small enough that open countryside is a few minutes away. That closeness between valley floor and Alb rim shapes how couples marry here: often in two places on one day.',
      tr: 'Göppingen, Stuttgart’a yaklaşık 35 kilometre uzaklıkta, Fils vadisinde (Filstal) yer alıyor – Fils kıyısında kurulmuş, hemen arkasında Schwäbische Alb’in ilk yamaçları yükselen bir şehir. 59.000’e yakın nüfusuyla Göppingen, şehrin tam ortasında kutlamalara yetecek kadar büyük, açık araziye birkaç dakikada ulaşılacak kadar da küçük. Vadi tabanı ile Alb yamacının bu yakınlığı, burada düğünlerin nasıl yapıldığını da belirliyor: çoğu zaman aynı günde iki ayrı mekânda.',
    },
    angle: {
      de: 'Wer oben an der Alb traut und unten in der Stadt feiert, überbrückt mehr als ein paar Kilometer – nämlich den Höhenunterschied zwischen Albrand und Talsohle. Das heißt: zwei Aufbauten, Strom im Freien, der oft aus dem Generator kommt, und ein Zeitplan, in den Abbau, Fahrt und Soundcheck zwischen Sektempfang und erstem Tanz passen. Stuttgart liegt nur 35 Kilometer entfernt, der Aufbau kann also früh beginnen – durchgerechnet wird der Ablauf vorab.',
      en: 'Marrying up on the Alb and celebrating down in town covers more than a few kilometres — it crosses the height difference between the Alb rim and the valley floor. That means two setups, outdoor power often from a generator, and a schedule with room for teardown, drive and soundcheck between the reception drinks and the first dance. Stuttgart is only 35 kilometres away, so setup can start early and the sequence is planned in advance.',
      tr: 'Yukarıda Alb yamacında nikâh kıyıp aşağıda şehirde kutlama yapmak, birkaç kilometreden fazlası: Alb kenarı ile vadi tabanı arasındaki yükseklik farkı demek. Yani iki ayrı kurulum, çoğu zaman jeneratörden gelen açık hava elektriği ve söküm, yol ve ses kontrolünü kokteyl ile ilk dans arasına sığdıran bir zaman planı. Stuttgart yalnızca 35 kilometre uzakta olduğu için kuruluma erken başlanabilir ve bu akış önceden planlanır.',
    },
    faq: [
      {
        question: {
          de: 'Zählt die Fahrt zwischen der Trauung auf der Alb und der Feier in Göppingen extra?',
          en: 'Does the drive between an Alb ceremony and the celebration in Göppingen cost extra?',
          tr: 'Alb’deki nikâh ile Göppingen’deki kutlama arasındaki yol ayrıca ücretlendiriliyor mu?',
        },
        answer: {
          de: 'Nein. Göppingen liegt mit 35 Kilometern deutlich innerhalb der 50-km-Zone, in der die Anfahrt in den Paketen enthalten ist, und der kurze Weg zwischen Albrand und Stadt bleibt Teil desselben Tagesablaufs. Liegt der zweite Ort spürbar weiter draußen, wird das offen im schriftlichen Angebot ausgewiesen – vorher, nicht hinterher.',
          en: 'No. At 35 kilometres, Göppingen sits well inside the 50 km zone where travel is included in the packages, and the short hop between the Alb rim and the town stays part of the same day. If the second location is noticeably further out, that is itemised openly in the written quote — beforehand, not afterwards.',
          tr: 'Hayır. Göppingen 35 kilometreyle, ulaşımın paketlere dahil olduğu 50 km’lik bölgenin rahatlıkla içinde kalıyor; Alb kenarı ile şehir arasındaki kısa yol da aynı günün akışının parçası. İkinci mekân belirgin şekilde daha uzaktaysa, bu yazılı teklifte açıkça gösterilir – sonradan değil, önceden.',
        },
      },
      {
        question: {
          de: 'Muss die Musik pausieren, während zwischen Trauung und Feierort gewechselt wird?',
          en: 'Does the music have to stop while we move from the ceremony to the celebration?',
          tr: 'Nikâh alanından kutlama mekânına geçilirken müzik durmak zorunda mı?',
        },
        answer: {
          de: 'Nein, weil kein kompletter Umzug stattfindet. Im Vorgespräch wird festgelegt, was oben an der Trauung steht und was unten am Feierort – meist ein kleines, schnell aufgebautes Set für die Trauung und die volle Anlage, die unten schon vorher fertig steht. Zwischen beiden Orten liegt dann eine kurze Fahrt, kein Abbau der Hauptanlage.',
          en: 'No, because nothing is fully relocated. The planning call sets out what stands at the ceremony and what stands at the celebration — usually a small, quickly built set for the ceremony, with the full rig already in place in town beforehand. What is left between the two is a short drive, not a teardown of the main system.',
          tr: 'Hayır, çünkü tam bir taşınma yaşanmıyor. Ön görüşmede yukarıda nikâh alanında neyin, aşağıda kutlama mekânında neyin duracağı belirlenir – genellikle nikâh için hızlı kurulan küçük bir set, aşağıda ise önceden hazır duran tam sistem. Geriye iki mekân arasında yalnızca kısa bir yol kalır, ana sistemin sökülmesi değil.',
        },
      },
      {
        question: {
          de: 'Die Trauung soll oben im Freien stattfinden – was passiert bei Regen?',
          en: 'The ceremony is meant to be outdoors up on the hillside — what happens if it rains?',
          tr: 'Nikâh yukarıda açık havada planlanıyor – yağmur yağarsa ne olur?',
        },
        answer: {
          de: 'Die Alternative wird vorher festgelegt, nicht am Hochzeitsmorgen entschieden. Das Set für die Trauung bleibt bewusst kompakt: Es läuft über die Steckdose vor Ort oder einen Generator, ist schnell unter Dach gebracht und kann im Zweifel ganz entfallen, ohne dass die Anlage unten in der Stadt angerührt wird. Die Feier am Abend bleibt davon unberührt.',
          en: 'The alternative is agreed in advance, not decided on the morning. The ceremony set is deliberately compact: it runs off a socket on site or a generator, moves under cover quickly, and can be dropped altogether if need be, without anyone touching the rig down in town. The evening celebration stays unaffected either way.',
          tr: 'Alternatif önceden belirlenir, düğün sabahı karar verilmez. Nikâh için kurulan set bilinçli olarak kompakt tutulur: alandaki prizden ya da jeneratörden beslenir, hızla kapalı alana alınabilir ve gerekirse tamamen devre dışı bırakılır – aşağıda şehirdeki sisteme hiç dokunulmadan. Akşamki kutlama bundan etkilenmez.',
        },
      },
    ],
  },
  {
    /** Tier 2 — siehe „Batch August 2026" im Dateikopf. */
    slug: 'schwaebisch-gmuend',
    name: 'Schwäbisch Gmünd',
    region: 'Baden-Württemberg',
    distanceKm: 45,
    population: 64237,
    priority: 1,
    turkishCommunity: false,
    nearby: ['aalen', 'goeppingen', 'esslingen'],
    travel: { included: true },
    venues: [
      {
        name: 'Manufaktur B26',
        kind: 'location',
        note: {
          de: 'Bekannte Eventlocation in der Stadt, seit 2016 in Betrieb – gefeiert wird zwischen historischen Automobilen, in Bereichen namens Piazza und Boxengasse.',
          en: 'A well-known event location in the town, running since 2016 — celebrations take place among historic cars, in areas called Piazza and Boxengasse.',
          tr: 'Şehirde bilinen bir etkinlik mekânı, 2016’dan beri faaliyette – kutlamalar tarihi otomobillerin arasında, Piazza ve Boxengasse adlı bölümlerde yapılıyor.',
        },
      },
    ],
    intro: {
      de: 'Schwäbisch Gmünd liegt im Ostalbkreis, rund 45 Kilometer östlich von Stuttgart, und gilt als älteste Stauferstadt. Wie die anderen Industriestädte der Ostalb lebt sie von der Fertigung, die viele Familien über Generationen hier gehalten hat. Bekannt ist in Gmünd unter anderem die Manufaktur B26 – eine Eventfläche zwischen historischen Automobilen, mit Bereichen, die Piazza und Boxengasse heißen. Das ist kein klassischer Festsaal, und genau das macht die Planung interessant.',
      en: 'Schwäbisch Gmünd sits in the Ostalbkreis, roughly 45 kilometres east of Stuttgart, and is considered the oldest of the Staufer towns. Like the other industrial towns of the Ostalb, it lives from manufacturing, which has kept many families here across generations. One of the known venues in Gmünd is Manufaktur B26 — an event space set among historic cars, with areas called Piazza and Boxengasse. It is not a conventional banquet hall, and that is exactly what makes the planning interesting.',
      tr: 'Schwäbisch Gmünd, Stuttgart’ın yaklaşık 45 kilometre doğusunda, Ostalbkreis’te yer alıyor ve en eski Staufer şehri sayılıyor. Ostalb’ın diğer sanayi kentleri gibi burası da üretimle ayakta duruyor; birçok aileyi kuşaklar boyunca burada tutan da bu oldu. Şehirde bilinen mekânlardan biri Manufaktur B26 – tarihi otomobillerin arasına kurulmuş, Piazza ve Boxengasse adlı bölümleri olan bir etkinlik alanı. Klasik bir düğün salonu değil, planlamayı ilginç kılan da tam olarak bu.',
    },
    angle: {
      de: 'Eine Feier zwischen Oldtimern ist licht- und tontechnisch eine eigene Aufgabe: harte Oberflächen statt Teppich und Vorhang, dazu Fahrzeuge, an die weder Stativ noch Kabel gehören. So ein Raum wird vorab abgegangen, nicht am Abend improvisiert. Die 45 Kilometer nach Gmünd liegen dabei klar innerhalb der anfahrtskostenfreien Zone, und zweisprachige Moderation wird hier so regelmäßig angefragt, dass sie von vornherein eingeplant ist.',
      en: 'A celebration among classic cars is a job of its own in light and sound: hard surfaces instead of carpet and curtain, plus vehicles that no stand or cable should go near. A room like that gets walked through beforehand rather than improvised on the night. The 45 kilometres to Gmünd sit comfortably inside the travel-included zone, and bilingual hosting is asked for here often enough to be planned in from the start.',
      tr: 'Klasik otomobillerin arasında bir kutlama, ışık ve ses açısından başlı başına bir iş: halı ve perde yerine sert yüzeyler, üstelik hiçbir tripodun ve kablonun yaklaşmaması gereken araçlar. Böyle bir mekân akşam doğaçlama çözülmez, önceden adım adım gezilir. Gmünd’e olan 45 kilometre, ücretsiz ulaşım bölgesinin rahatlıkla içinde kalıyor; iki dilli sunum ise burada o kadar sık isteniyor ki baştan programa dâhil ediliyor.',
    },
    faq: [
      {
        question: {
          de: 'Schwäbisch Gmünd liegt schon im Ostalbkreis – fahren Sie dorthin ohne Aufpreis?',
          en: 'Schwäbisch Gmünd is already in the Ostalb district — do you cover it without a surcharge?',
          tr: 'Schwäbisch Gmünd artık Ostalb bölgesinde — oraya ek ücret olmadan geliyor musunuz?',
        },
        answer: {
          de: 'Ja. Mit rund 45 Kilometern von Stuttgart bleibt Gmünd innerhalb der anfahrtskostenfreien 50-Kilometer-Zone, auch wenn es schon Ostalb ist. Für die Anfahrt taucht im Angebot deshalb keine eigene Position auf.',
          en: 'Yes. At roughly 45 kilometres from Stuttgart, Gmünd stays inside the 50 km travel-included zone, Ostalb or not. No separate travel line appears on the quote.',
          tr: 'Evet. Stuttgart’a yaklaşık 45 kilometre uzaklıktaki Gmünd, Ostalb’da olsa da 50 kilometrelik ücretsiz ulaşım bölgesinin içinde kalıyor. Bu yüzden teklifte ulaşım için ayrı bir kalem çıkmıyor.',
        },
      },
      {
        question: {
          de: 'Kann man in einer Halle voller Oldtimer wirklich richtig feiern?',
          en: 'Can you really throw a proper party in a hall full of classic cars?',
          tr: 'Klasik otomobillerle dolu bir mekânda gerçekten doyasıya kutlama yapılabilir mi?',
        },
        answer: {
          de: 'Ja. Stellflächen, Kabelwege und die Abstände zu den Fahrzeugen legen wir vor dem Hochzeitstag gemeinsam mit der Location fest. Das Licht wird so gesetzt, dass es die Tanzfläche trägt und die Autos Kulisse bleiben, nicht Hindernis.',
          en: 'Yes. Floor space, cable runs and the clearances around the vehicles are settled with the venue before the day. Lighting is set so it carries the dance floor and the cars stay a backdrop rather than an obstacle.',
          tr: 'Evet. Kurulum alanları, kablo güzergâhları ve araçlara bırakılacak mesafeler, düğün gününden önce mekânla birlikte belirleniyor. Işık, dans pistini taşıyacak şekilde kurulur; otomobiller engel değil, dekor olarak kalır.',
        },
      },
    ],
  },
  {
    /** Tier 2 — siehe „Batch August 2026" im Dateikopf. */
    slug: 'aalen',
    name: 'Aalen',
    region: 'Baden-Württemberg',
    distanceKm: 67,
    population: 67697,
    priority: 1,
    turkishCommunity: false,
    nearby: ['schwaebisch-gmuend', 'goeppingen', 'ulm'],
    travel: {
      included: false,
      note: {
        de: 'Aalen liegt mit rund 67 Kilometern außerhalb des anfahrtskostenfreien 50-km-Radius. Der Anfahrtsanteil wird im schriftlichen Angebot ausgewiesen, bevor unterschrieben wird – kein versteckter Aufschlag.',
        en: 'At roughly 67 kilometres, Aalen falls outside the 50 km travel-included radius. The travel amount is itemised in the written quote before anything is signed — no hidden surcharge.',
        tr: 'Yaklaşık 67 kilometreyle Aalen, ücretsiz ulaşımın geçerli olduğu 50 km’lik yarıçapın dışında kalıyor. Ulaşım tutarı, imza atılmadan önce yazılı teklifte ayrıca gösterilir — gizli ek ücret yok.',
      },
    },
    venues: [
      {
        name: 'Villa Stützel',
        kind: 'location',
        note: {
          de: 'Bekannte Veranstaltungsadresse in Aalen – hier zur Orientierung genannt, nicht als Partner-Location.',
          en: 'A well-known event address in Aalen — listed here for orientation, not as a partner venue.',
          tr: 'Aalen’de bilinen bir etkinlik adresi — burada yönlendirme amacıyla anılıyor, ortak mekân olarak değil.',
        },
      },
      {
        name: 'Freudenschmaus',
        kind: 'location',
        note: {
          de: 'Location mitten in Aalen, in der auch gefeiert wird – Kapazität und Auflagen klärt man am besten direkt dort.',
          en: 'A venue in the middle of Aalen that is also used for celebrations — capacity and house rules are best clarified directly with them.',
          tr: 'Aalen’in merkezinde kutlamalara da ev sahipliği yapan bir mekân — kapasite ve kurallar en iyisi doğrudan mekânla netleştirilir.',
        },
      },
      {
        name: 'Schloss Kapfenburg',
        kind: 'schloss',
        note: {
          de: 'Rund 15 Kilometer außerhalb von Aalen, nicht in der Stadt selbst: Rittersaal für bis zu 90, Fürstensaal für bis zu 120 Gäste.',
          en: 'About 15 kilometres outside Aalen rather than in the town itself: a Rittersaal for up to 90 guests and a Fürstensaal for up to 120.',
          tr: 'Şehrin kendisinde değil, Aalen’den yaklaşık 15 kilometre uzakta: 90 kişiye kadar Rittersaal ve 120 kişiye kadar Fürstensaal.',
        },
      },
    ],
    intro: {
      de: 'Aalen ist eine Industriestadt im Ostalbkreis – die Betriebe prägen hier den Arbeitsalltag ganzer Familien, oft über mehrere Generationen. Für Hochzeiten fällt vor allem die Spannweite der Räume auf – von der Villa Stützel und dem Freudenschmaus mitten in der Stadt bis zu den Sälen von Schloss Kapfenburg, rund 15 Kilometer außerhalb.',
      en: 'Aalen is an industrial town in the Ostalbkreis, where the factories have shaped the working lives of whole families, often across several generations. For weddings, what stands out is the sheer range of room sizes — from Villa Stützel and the Freudenschmaus in the middle of town to the halls of Schloss Kapfenburg, some 15 kilometres outside it.',
      tr: 'Aalen, Ostalbkreis’te bir sanayi kenti — buradaki fabrikalar çoğu zaman birkaç kuşak boyunca ailelerin çalışma hayatını şekillendirmiş. Düğünler açısından en dikkat çeken şey ise mekânların birbirinden çok farklı ölçeklerde olması — şehrin merkezindeki Villa Stützel ve Freudenschmaus’tan, yaklaşık 15 kilometre dışarıdaki Schloss Kapfenburg’un salonlarına kadar.',
    },
    angle: {
      de: 'Ein Saal auf der Kapfenburg und eine Feier mitten in der Stadt sind zwei völlig verschiedene akustische Aufgaben: Ein Abend im Fürstensaal mit 120 Gästen braucht eine andere Beschallung als ein Raum im Ortskern. Deshalb wird die Technik nicht als Standardpaket geladen, sondern nach Raumgröße, Deckenhöhe und Nachbarschaft ausgewählt und vorab mit der Location abgestimmt. Die rund 67 Kilometer Anfahrt stehen offen im Angebot, statt im Preis zu verschwinden.',
      en: 'A hall at Kapfenburg and a celebration in the town centre are two different acoustic jobs: an evening for 120 guests in the Fürstensaal needs a different setup than a room in the middle of Aalen. So the equipment isn’t loaded as one standard package — it is chosen for room size, ceiling height and neighbours, and agreed with the venue beforehand. The roughly 67 kilometres of travel are itemised openly in the quote, not folded into the price.',
      tr: 'Kapfenburg’daki bir salon ile şehrin göbeğindeki bir kutlama, akustik açıdan bambaşka iki iş: Fürstensaal’de 120 davetlinin olduğu bir akşam, şehir merkezindeki bir mekândan farklı bir ses düzeni gerektirir. Bu yüzden ekipman standart bir paket olarak yüklenmez; salonun büyüklüğüne, tavan yüksekliğine ve çevresine göre seçilir, önceden mekânla birlikte kararlaştırılır. Yaklaşık 67 kilometrelik ulaşım da fiyatın içinde kaybolmak yerine teklifte açıkça yer alır.',
    },
    faq: [
      {
        question: {
          de: 'Wie wird die Strecke Stuttgart–Aalen im Angebot behandelt?',
          en: 'How is the Stuttgart–Aalen distance handled in the quote?',
          tr: 'Stuttgart–Aalen mesafesi teklifte nasıl ele alınıyor?',
        },
        answer: {
          de: 'Die rund 67 Kilometer liegen außerhalb der 50 Kilometer, die in den Paketen enthalten sind. Was darüber hinausgeht, steht als eigene Position im schriftlichen Angebot – Sie sehen den Betrag also, bevor Sie unterschreiben, und nicht erst auf der Rechnung.',
          en: 'The roughly 67 kilometres are beyond the 50 km included in the packages. Whatever goes past that appears as its own line in the written quote — so you see the amount before you sign, not for the first time on the invoice.',
          tr: 'Yaklaşık 67 kilometre, paketlere dahil olan 50 kilometrenin dışında kalıyor. Bunun ötesindeki kısım yazılı teklifte ayrı bir kalem olarak yer alır — yani tutarı faturada değil, imzalamadan önce görürsünüz.',
        },
      },
      {
        question: {
          de: 'Ist Ihre Technik für einen kleineren Saal nicht überdimensioniert?',
          en: 'Isn’t your equipment oversized for a smaller hall?',
          tr: 'Ekipmanınız küçük bir salon için fazla büyük kalmıyor mu?',
        },
        answer: {
          de: 'Nein, weil sie nach Raum ausgewählt wird. Für einen Saal in der Größenordnung des Rittersaals auf der Kapfenburg (bis 90 Gäste) fährt ein kompakteres Setup mit als für 120 Gäste im Fürstensaal – Boxenzahl, Aufstellung und Pegel werden vorab mit der Location abgestimmt.',
          en: 'No, because it is chosen per room. A hall in the order of the Rittersaal at Kapfenburg (up to 90 guests) gets a more compact setup than 120 guests in the Fürstensaal — speaker count, placement and volume levels are agreed with the venue in advance.',
          tr: 'Hayır, çünkü ekipman salona göre seçilir. Kapfenburg’daki Rittersaal ölçeğindeki bir salon için (90 kişiye kadar), Fürstensaal’deki 120 kişilik bir düğüne göre daha kompakt bir kurulum getirilir — hoparlör sayısı, yerleşim ve ses seviyesi önceden mekânla birlikte belirlenir.',
        },
      },
      {
        question: {
          de: 'Schloss Kapfenburg liegt gar nicht in Aalen – spielen Sie dort trotzdem?',
          en: 'Schloss Kapfenburg isn’t actually in Aalen — do you still play there?',
          tr: 'Schloss Kapfenburg aslında Aalen’de değil — orada da çalıyor musunuz?',
        },
        answer: {
          de: 'Ja, sofern die Kapfenburg den Termin für Ihre Feier freigibt. Sie liegt rund 15 Kilometer außerhalb der Stadt – Gäste aus Aalen planen also eine kurze Fahrt ein. Aufbauzeiten und Zufahrt werden vorher direkt mit der Verwaltung geklärt.',
          en: 'Yes, provided Kapfenburg has the date available for your celebration. It sits about 15 kilometres outside the town, so guests coming from Aalen have a short drive ahead of them. Setup times and vehicle access are clarified directly with the venue administration beforehand.',
          tr: 'Evet, Kapfenburg o tarihi kutlamanız için onayladığı sürece. Şehrin yaklaşık 15 kilometre dışında kalıyor; yani Aalen’den gelen davetliler için kısa bir yol var. Kurulum saatleri ve araç girişi önceden doğrudan mekân yönetimiyle netleştirilir.',
        },
      },
    ],
  },
  {
    /** Tier 2 — siehe „Batch August 2026" im Dateikopf. */
    slug: 'ulm',
    name: 'Ulm',
    region: 'Baden-Württemberg',
    distanceKm: 72,
    population: 128998,
    priority: 1,
    turkishCommunity: false,
    nearby: ['goeppingen', 'aalen', 'reutlingen'],
    travel: {
      included: false,
      note: {
        de: 'Ulm liegt mit rund 72 Kilometern deutlich außerhalb der anfahrtskostenfreien 50-km-Zone. Die Anfahrt wird als eigener Posten im schriftlichen Angebot ausgewiesen – kein versteckter Aufschlag.',
        en: 'At roughly 72 kilometres, Ulm is well beyond the 50 km travel-included zone. Travel is itemised as its own line in the written quote — no hidden surcharge.',
        tr: 'Yaklaşık 72 kilometreyle Ulm, ücretsiz ulaşımın geçerli olduğu 50 km’lik bölgenin epey dışında. Ulaşım, yazılı teklifte ayrı bir kalem olarak gösterilir — gizli ek ücret yok.',
      },
    },
    venues: [
      {
        name: 'Ulmer Rathaus',
        kind: 'location',
        note: {
          de: 'Das historische Rathaus im Zentrum – bemalte Fassade, gotisch gerahmte Fenster, eines der schönsten Gebäude der Region. Hier finden standesamtliche Trauungen statt.',
          en: 'The historic town hall in the city centre — painted facade, Gothic-framed windows, one of the most beautiful buildings in the region. Civil ceremonies take place here.',
          tr: 'Şehir merkezindeki tarihi belediye binası — resimlerle bezeli cephe, gotik çerçeveli pencereler; bölgenin en güzel yapılarından biri. Resmî nikâhlar burada kıyılıyor.',
        },
      },
    ],
    intro: {
      de: 'Ulm liegt an der Donau, und über allem steht das Münster – das Wahrzeichen, an dem sich die ganze Stadt orientiert. Standesamtlich geheiratet wird im historischen Rathaus mitten in der Altstadt, einem der schönsten Gebäude der Region: bemalte Fassade, gotisch gerahmte Fenster, denkmalgeschützt bis ins Detail. Das macht den Vormittag schön und den Ablauf anspruchsvoll, denn gefeiert wird anschließend meist woanders – im Saal am Stadtrand, im Hotel, ein Stück außerhalb.',
      en: 'Ulm sits on the Danube, and the Münster stands above everything — the landmark the whole city orients itself by. Civil ceremonies take place in the historic Rathaus in the middle of the old town, one of the most beautiful buildings in the region: a painted facade, Gothic-framed windows, listed down to the last detail. That makes for a beautiful morning and a demanding schedule, because the celebration itself usually happens somewhere else — a hall on the edge of town, a hotel, a little way out.',
      tr: 'Ulm Tuna kıyısında kurulu ve her şeyin üzerinde Münster yükseliyor — bütün şehrin kendini ona göre konumlandırdığı simge yapı. Resmî nikâh, kent merkezinin tam ortasındaki tarihi Rathaus’ta kıyılıyor; bölgenin en güzel binalarından biri: resimlerle bezeli cephe, gotik çerçeveli pencereler, en ince ayrıntısına kadar koruma altında. Bu, sabahı güzelleştiriyor ama programı zorlaştırıyor, çünkü asıl kutlama çoğunlukla başka bir yerde oluyor — şehrin kenarındaki bir salonda, bir otelde, biraz dışarıda.',
    },
    angle: {
      de: 'Ein Tag, der im denkmalgeschützten Rathaus beginnt und abends außerhalb weitergeht, ist vor allem eine Zeitfrage: Trauung, Fotos, Gelin Çıkarma, Transfer, Aufbau – das muss ineinandergreifen, sonst wartet der Saal auf die Technik. Deshalb steht der Ablauf vorher fest – mit Wegzeit für die zweite Anfahrt und den Umbau. Die rund 72 Kilometer ab Stuttgart liegen außerhalb der anfahrtskostenfreien Zone und stehen offen als eigene Zeile im Angebot; dafür kommt jemand, der beide Orte zusammenhält.',
      en: 'A day that starts in a listed town hall and moves to a venue outside town is a question of timing: ceremony, photos, Gelin Çıkarma, transfer, setup — it has to interlock, or the hall waits for the equipment. So the running order is fixed beforehand, with the second journey and the changeover written into the timings. The roughly 72 kilometres from Stuttgart fall outside the travel-included zone and are itemised openly in the quote; what they buy is someone who holds both places together.',
      tr: 'Koruma altındaki tarihi Rathaus’ta başlayıp akşam şehir dışında devam eden bir gün, her şeyden önce bir zamanlama meselesi: nikâh, fotoğraf, gelin çıkarma, transfer, kurulum — hepsinin birbirine geçmesi gerekir, yoksa salon ekipmanı bekler. Bu yüzden akış günden önce netleşir; ikinci ulaşımın yol süresi ve kurulum payı da programın içinde. Stuttgart’tan yaklaşık 72 kilometre, ücretsiz ulaşım bölgesinin dışında kalıyor ve teklifte ayrı bir satır olarak açıkça yer alıyor; karşılığında iki mekânı bir arada tutan biri geliyor.',
    },
    faq: [
      {
        question: {
          de: 'Wie wird die Anfahrt nach Ulm berechnet, wenn der Tag über zwei Orte läuft?',
          en: 'How is travel to Ulm calculated when the day runs across two places?',
          tr: 'Gün iki ayrı mekânda geçtiğinde Ulm için ulaşım nasıl hesaplanıyor?',
        },
        answer: {
          de: 'Ulm liegt mit rund 72 Kilometern außerhalb der anfahrtskostenfreien 50-km-Zone, deshalb steht die Anfahrt als eigener Posten im schriftlichen Angebot. Läuft der Tag über zwei Orte – Rathaus und Abendlocation –, wird das vorher besprochen und im selben Angebot ausgewiesen. Sie sehen den vollständigen Betrag, bevor Sie sich entscheiden, nicht danach.',
          en: 'At roughly 72 kilometres, Ulm lies outside the 50 km travel-included zone, so travel appears as its own item in the written quote. If the day runs across two places — the Rathaus and an evening venue — that is discussed beforehand and itemised in the same quote. You see the full amount before you decide, not after.',
          tr: 'Ulm, yaklaşık 72 kilometreyle 50 km’lik ücretsiz ulaşım bölgesinin dışında; bu yüzden ulaşım, yazılı teklifte ayrı bir kalem olarak yer alır. Gün iki ayrı mekânda geçiyorsa — Rathaus ve akşam mekânı — bu önceden konuşulur ve aynı teklifte gösterilir. Toplam tutarı karar vermeden önce görürsünüz, sonradan değil.',
        },
      },
      {
        question: {
          de: 'Wir heiraten standesamtlich im Ulmer Rathaus und feiern abends außerhalb – wie läuft das ab?',
          en: 'We are having the civil ceremony at the Ulm Rathaus and celebrating outside town in the evening — how does that work?',
          tr: 'Resmî nikâhı Ulm Rathaus’ta kıyıp akşam şehir dışında kutlayacağız — bu nasıl işliyor?',
        },
        answer: {
          de: 'Zwischen Trauung und Abendlocation liegt ein Transfer, und der wird eingeplant statt improvisiert: Wegzeit, Aufbau und Soundcheck werden im Vorgespräch so gelegt, dass die Technik steht, bevor die ersten Gäste eintreffen. Für Musik im Rathaus selbst gelten die Auflagen des Hauses – was dort erlaubt ist, fragen wir rechtzeitig vor dem Termin ab; meist genügt dafür eine kleine, schnell aufgebaute Anlage.',
          en: 'There is a transfer between ceremony and evening venue, and it gets planned rather than improvised: travel time, setup and soundcheck are placed in the planning call so the equipment is standing before the first guests arrive. Music inside the Rathaus follows the rules of the building — we check what is permitted there well before the date; usually a small, quickly assembled system is enough.',
          tr: 'Nikâh ile akşam mekânı arasında bir transfer var ve bu doğaçlama değil, planlı yürür: yol süresi, kurulum ve ses kontrolü ön görüşmede öyle yerleştirilir ki ilk misafirler gelmeden ekipman hazır olur. Rathaus içindeki müzik için binanın kendi kuralları geçerli — orada neye izin verildiğini tarihten önce sorup öğreniyoruz; genellikle küçük ve hızlı kurulan bir sistem yeterli oluyor.',
        },
      },
      {
        question: {
          de: 'Wird bei deutsch-türkischen Feiern in Ulm zweisprachig moderiert?',
          en: 'Is the hosting bilingual at German-Turkish celebrations in Ulm?',
          tr: 'Ulm’daki Alman-Türk düğünlerinde sunum iki dilli mi yapılıyor?',
        },
        answer: {
          de: 'Ja. Ansagen und Moderation laufen auf Deutsch und Türkisch – an einem Tag, der über zwei Orte verteilt ist, hängt daran, dass beide Familien wissen, wann es weitergeht und wohin. Welche Sprache an welcher Stelle führt, wird im Vorgespräch festgelegt und nicht am Abend improvisiert.',
          en: 'Yes. Announcements and hosting run in German and Turkish — on a day split across two places, that is what keeps both families knowing when things move on and where to. Which language leads at which point is agreed in the planning call, not improvised on the night.',
          tr: 'Evet. Anonslar ve sunum Almanca ve Türkçe yürür — iki ayrı mekâna yayılan bir günde, her iki ailenin de ne zaman nereye geçileceğini bilmesi buna bağlı. Hangi bölümde hangi dilin öne çıkacağı ön görüşmede kararlaştırılır, akşam doğaçlama yapılmaz.',
        },
      },
    ],
  },
  {
    /** Tier 2 — siehe „Batch August 2026" im Dateikopf. */
    slug: 'heidelberg',
    name: 'Heidelberg',
    region: 'Baden-Württemberg',
    distanceKm: 79,
    population: 155175,
    priority: 1,
    turkishCommunity: false,
    nearby: ['mannheim', 'karlsruhe', 'heilbronn'],
    travel: {
      included: false,
      note: {
        de: 'Heidelberg liegt mit rund 79 Kilometern außerhalb des anfahrtskostenfreien 50-km-Radius. Die Anfahrt wird als eigene Position im individuellen Angebot ausgewiesen – nachvollziehbar berechnet und ohne versteckten Aufschlag.',
        en: 'At roughly 79 kilometres, Heidelberg lies outside the 50 km travel-included radius. Travel is itemised as its own line in your individual quote — transparently calculated, with no hidden surcharge.',
        tr: 'Yaklaşık 79 kilometreyle Heidelberg, ücretsiz ulaşımın geçerli olduğu 50 km’lik yarıçapın dışında. Ulaşım, size özel teklifte ayrı bir kalem olarak ve hesabı görülebilir şekilde gösterilir — gizli ek ücret yok.',
      },
    },
    venues: [
      {
        name: 'Schloss Heidelberg',
        kind: 'schloss',
        note: {
          de: 'Standesamtliche Trauungen werden hier seit 2009 angeboten, in der Brunnenstube oder der Liselottestube (Quelle: Stadt Heidelberg). Beide Räume sind auf die Trauung ausgelegt, gefeiert wird üblicherweise andernorts. Keine Partner-Location, sondern eine bekannte Adresse zur Orientierung.',
          en: 'Civil ceremonies have been offered here since 2009, in the Brunnenstube or the Liselottestube (source: Stadt Heidelberg). Both rooms are laid out for the ceremony, with the celebration usually held elsewhere. Not a partner venue, just a well-known address listed for orientation.',
          tr: '2009’dan bu yana burada resmî nikâh kıyılıyor; Brunnenstube ya da Liselottestube salonlarında (kaynak: Stadt Heidelberg). Her iki oda da nikâh törenine göre düzenlenmiş, kutlama genellikle başka bir yerde yapılıyor. Ortaklık kurulan bir mekân değil, yönlendirme amaçlı bilinen bir adres.',
        },
      },
    ],
    intro: {
      de: 'Heidelberg ist eine international bekannte Stadt – das Schloss über der Altstadt, der Neckar darunter. Seit 2009 wird im Schloss auch standesamtlich geheiratet, in der Brunnenstube oder der Liselottestube. Beide Räume sind historisch und klein, ausgelegt auf die Trauung selbst; die Abendfeier findet deshalb meistens an einer zweiten Adresse statt. Ein Hochzeitstag an zwei Orten – planerisch ist genau das der Punkt, an dem in Heidelberg die Arbeit beginnt.',
      en: 'Heidelberg is an internationally known city — the castle above the old town, the Neckar below it. Civil ceremonies have been held at the castle since 2009, in the Brunnenstube or the Liselottestube. Both rooms are historic and small, laid out for the ceremony itself; the evening celebration therefore usually takes place at a second address. One wedding day, two venues — in Heidelberg, that split is where the planning actually starts.',
      tr: 'Heidelberg uluslararası ölçekte tanınan bir şehir — eski şehrin üzerinde şato, altında Neckar nehri. 2009’dan bu yana şatoda resmî nikâh da kıyılıyor: Brunnenstube ya da Liselottestube salonlarında. Her iki oda da tarihi ve küçük, nikâh töreninin kendisine göre düzenlenmiş; akşam kutlaması bu yüzden genellikle ikinci bir adreste yapılıyor. Tek günde iki mekân — Heidelberg’de planlamanın asıl başladığı nokta tam da burası.',
    },
    angle: {
      de: 'Zwei Adressen an einem Tag heißen zwei Aufbauten, zwei Zeitfenster und einen Übergang, der sitzen muss – daran hängt in Heidelberg oft mehr als an der Musikauswahl. Kommen die Gäste zusätzlich aus mehreren Ländern, wird dreisprachige Moderation sehr konkret: Jeder Tisch weiß, was als Nächstes kommt – vor dem Einzug des Paares, vor dem Essen, vor der Gelin Çıkarma. Die rund 79 Kilometer Anfahrt stehen als eigene Position im Angebot, nicht versteckt im Paketpreis.',
      en: 'Two addresses in one day means two setups, two time windows and a handover that has to land — in Heidelberg, more rides on that than on the music. If guests are also arriving from several countries, trilingual hosting becomes very concrete: every table knows what comes next — before the couple\'s entrance, before dinner, before the gelin çıkarma. Travel over the roughly 79 kilometres is its own line in the quote, never buried in a package price.',
      tr: 'Tek günde iki adres demek; iki kurulum, iki zaman aralığı ve tam oturması gereken bir geçiş demek — Heidelberg’de çoğu zaman buna, müzik seçiminden daha çok şey bağlı. Davetliler bir de birkaç farklı ülkeden geliyorsa, üç dilde sunum çok somut bir şeye dönüşüyor: her masa sırada ne olduğunu biliyor — çiftin girişinden önce, yemekten önce, gelin çıkarmadan önce. Yaklaşık 79 kilometrelik ulaşım ise paket fiyatına gizlenmeden, teklifte ayrı bir kalem olarak yer alıyor.',
    },
    faq: [
      {
        question: {
          de: 'Trauung und Abendfeier finden bei uns an zwei verschiedenen Adressen statt – wie wird die Anfahrt dann berechnet?',
          en: 'Our ceremony and our evening reception are at two different addresses — how is travel calculated then?',
          tr: 'Nikâh ve akşam kutlaması bizde iki ayrı adreste — ulaşım o zaman nasıl hesaplanıyor?',
        },
        answer: {
          de: 'Heidelberg liegt mit rund 79 Kilometern außerhalb der anfahrtskostenfreien 50-km-Zone; die Anfahrt steht deshalb als eigene Position im schriftlichen Angebot. Sobald der Ablauf mit beiden Adressen feststeht, wird er dabei berücksichtigt – Sie sehen den Betrag, bevor Sie zusagen, nicht danach.',
          en: 'At roughly 79 kilometres, Heidelberg is outside the 50 km travel-included zone, so travel appears as its own line in the written quote. Once the running order across both addresses is settled, it is taken into account there — you see the amount before you commit, not afterwards.',
          tr: 'Yaklaşık 79 kilometreyle Heidelberg, ücretsiz ulaşımın geçerli olduğu 50 km’lik bölgenin dışında; bu yüzden ulaşım, yazılı teklifte ayrı bir kalem olarak yer alıyor. İki adresli program netleştiğinde bu da hesaba katılıyor — tutarı karar vermeden önce görüyorsunuz, sonrasında değil.',
        },
      },
      {
        question: {
          de: 'Wir heiraten im Schloss Heidelberg und feiern abends woanders – wie läuft das ab?',
          en: 'We\'re marrying at Schloss Heidelberg and celebrating elsewhere in the evening — how does that work?',
          tr: 'Nikâhı Schloss Heidelberg’de kıyıp akşam başka bir yerde kutluyoruz — bu nasıl yürüyor?',
        },
        answer: {
          de: 'Das kommt in Heidelberg häufig vor. Der eigentliche Aufbau passiert am Abend-Ort; für den Trauraum selbst wäre höchstens eine kleine Beschallung nötig – ob eigene Technik dort überhaupt erlaubt ist, fragen wir vorab bei der Location an. Aufbauzeiten, Zufahrt und der Übergang zwischen beiden Adressen werden im Vorgespräch mit beiden Häusern abgestimmt.',
          en: 'That happens often in Heidelberg. The actual rig goes up at the evening venue; the ceremony room itself would need a small PA at most — and whether outside equipment is permitted there is something we ask the venue beforehand. Setup windows, vehicle access and the handover between the two addresses are agreed with both houses during the planning call.',
          tr: 'Heidelberg’de bu sık görülüyor. Asıl kurulum akşam mekânında yapılıyor; nikâh salonu için en fazla küçük bir ses sistemi gerekir — ancak orada dışarıdan ekipman kullanımına izin verilip verilmediğini önceden mekâna soruyoruz. Kurulum saatleri, araç girişi ve iki adres arasındaki geçiş, ön görüşmede her iki mekânla birlikte netleştiriliyor.',
        },
      },
      {
        question: {
          de: 'Unsere Gäste kommen aus mehreren Ländern und kennen den Ablauf einer deutsch-türkischen Hochzeit nicht. Wie behalten sie den Faden?',
          en: 'Our guests come from several countries and don\'t know the running order of a German-Turkish wedding. How do they keep up?',
          tr: 'Davetlilerimiz birkaç farklı ülkeden geliyor ve Alman-Türk düğün akışını bilmiyor. Akışı nasıl takip edecekler?',
        },
        answer: {
          de: 'Über Ansagen, die vor dem jeweiligen Programmpunkt kommen und nicht mittendrin. Moderiert wird auf Deutsch, Türkisch und Englisch; welche Sprache wann führt, wird im Vorgespräch festgelegt, und die wichtigen Ansagen laufen kurz zweisprachig. So weiß auch der Tisch, der zum ersten Mal auf einer türkischen Hochzeit sitzt, was gleich passiert.',
          en: 'Through announcements that come before each part of the programme, not in the middle of it. Hosting runs in German, Turkish and English; which language leads at which point is agreed in the planning call, and the important announcements are made briefly in two languages. So even the table sitting at a Turkish wedding for the first time knows what is about to happen.',
          tr: 'Her program bölümünün ortasında değil, öncesinde yapılan anonslarla. Sunum Almanca, Türkçe ve İngilizce yapılıyor; hangi bölümde hangi dilin öne çıkacağı ön görüşmede belirleniyor, önemli anonslar ise kısaca iki dilde tekrarlanıyor. Böylece ilk kez bir Türk düğününde oturan masa da birazdan ne olacağını biliyor.',
        },
      },
    ],
  },
  {
    /** Tier 3 — siehe „Batch August 2026" im Dateikopf. */
    slug: 'baden-baden',
    name: 'Baden-Baden',
    region: 'Baden-Württemberg',
    distanceKm: 69,
    population: 56738,
    priority: 2,
    turkishCommunity: false,
    nearby: ['karlsruhe', 'pforzheim', 'offenburg', 'lahr'],
    travel: {
      included: false,
      note: {
        de: 'Baden-Baden liegt mit rund 69 Kilometern außerhalb des 50-km-Radius mit inklusiver Anfahrt. Die Anfahrt wird im individuellen Angebot offen ausgewiesen – kein versteckter Aufschlag.',
        en: 'At roughly 69 kilometres, Baden-Baden falls outside the 50 km travel-included radius. Travel is itemised openly in your individual quote — no hidden surcharge.',
        tr: 'Baden-Baden, yaklaşık 69 kilometreyle ücretsiz ulaşımın geçerli olduğu 50 km’lik yarıçapın dışında kalıyor. Ulaşım, size özel teklifte açıkça gösterilir — gizli ek ücret yok.',
      },
    },
    // TODO(kunde): keine Hochzeitslocation im Recherche-Pass verifiziert —
    // siehe docs/SEO-CITY-STRATEGY.md. Lieber leer als erfunden.
    venues: [],
    intro: {
      de: 'Baden-Baden ist eine Kurstadt von internationalem Ruf, und das prägt den Ort bis heute: die Lichtentaler Allee als parkartige Promenade, das Casino als Name, der weit über Deutschland hinaus bekannt ist, dazu ein Publikum, das von überall anreist. Die Stadt selbst bleibt klein – ihr Einzugsgebiet ist es nicht. Wer hier heiratet, plant deshalb oft für eine Gästeliste, die aus mehreren Ländern kommt, und für einen Abend, der etwas förmlicher gedacht ist als anderswo.',
      en: 'Baden-Baden is a spa town with an international reputation, and it still shows: the Lichtentaler Allee as a park-like promenade, the Casino as a name known far beyond Germany, and a crowd that arrives from everywhere. The town itself stays small — its catchment area does not. Couples marrying here are therefore often planning for a guest list drawn from several countries, and for an evening pitched a little more formally than elsewhere.',
      tr: 'Baden-Baden, uluslararası üne sahip bir kaplıca kenti ve bu, şehrin bugünkü havasında hâlâ hissediliyor: park gibi uzanan Lichtentaler Allee, Almanya’nın çok ötesinde tanınan bir isim olan Casino ve her yerden gelen bir ziyaretçi kitlesi. Şehrin kendisi küçük kalıyor; etki alanı ise hiç de öyle değil. Bu yüzden burada evlenen çiftler çoğu zaman birkaç ülkeden gelen bir davetli listesi ve başka yerlere göre biraz daha resmi düşünülmüş bir akşam için plan yapıyor.',
    },
    angle: {
      de: 'Rund 69 Kilometer liegen jenseits der 50-km-Grenze – die Anfahrt steht deshalb offen im Angebot statt versteckt im Kleingedruckten. Der Grund, sie trotzdem in Kauf zu nehmen, liegt in der Stadt: Ein Abend in Baden-Baden ist meist förmlicher angelegt als anderswo. Das verschiebt die Arbeit von der Lautstärke zur Moderation – kurze, ruhige Ansagen, ein Programm, das erklärt wird, und ein Ton, der die Gäste führt, ohne sie anzutreiben.',
      en: 'Roughly 69 kilometres puts Baden-Baden past the 50 km line, so travel appears openly in the quote rather than buried in the small print. The reason to accept it is the town itself: an evening in Baden-Baden is usually pitched more formally than elsewhere. That shifts the work from volume to hosting — short, calm announcements, a programme that gets explained, and a register that guides guests rather than pushing them.',
      tr: 'Yaklaşık 69 kilometre, 50 km sınırının ötesinde kalıyor; bu yüzden ulaşım küçük puntolara gizlenmeden teklifte açıkça yer alıyor. Bunu göze almanın nedeni şehrin kendisi: Baden-Baden’de bir akşam genellikle başka yerlere göre biraz daha resmi kurgulanıyor. Bu da işi ses seviyesinden sunuma kaydırıyor — kısa ve sakin anonslar, açıklanan bir program ve davetlileri iterek değil yönlendirerek taşıyan bir ton.',
    },
    faq: [
      {
        question: {
          de: 'Baden-Baden klingt weit weg – wie viel Anfahrt kommt tatsächlich dazu?',
          en: 'Baden-Baden sounds far away — how much travel actually gets added?',
          tr: 'Baden-Baden uzak geliyor — gerçekte ne kadar ulaşım ekleniyor?',
        },
        answer: {
          de: 'Weniger, als der Ruf der Stadt vermuten lässt: Es sind rund 69 Kilometer Luftlinie – damit liegt Baden-Baden etwa 19 Kilometer jenseits der inklusiven 50-km-Zone. Die Anfahrt wird deshalb im schriftlichen Angebot offen ausgewiesen, bevor Sie sich entscheiden; nachträglich kommt nichts dazu.',
          en: 'Less than the town’s reputation suggests: it is roughly 69 kilometres as the crow flies, which puts Baden-Baden about 19 kilometres beyond the included 50 km zone. Travel is therefore itemised openly in the written quote before you decide; nothing is added afterwards.',
          tr: 'Şehrin ünü kadar uzak değil: kuş uçuşu yaklaşık 69 kilometre, yani Baden-Baden ücretsiz ulaşımın geçerli olduğu 50 km’lik bölgenin aşağı yukarı 19 kilometre ötesinde. Ulaşım bu yüzden, karar vermeden önce yazılı teklifte açıkça gösteriliyor; sonradan hiçbir şey eklenmiyor.',
        },
      },
      {
        question: {
          de: 'Ein Teil unserer Gäste reist aus dem Ausland an und kennt den Ablauf nicht. Wie wird das gelöst?',
          en: 'Some of our guests are travelling in from abroad and don’t know the running order. How is that handled?',
          tr: 'Davetlilerimizin bir kısmı yurt dışından geliyor ve akışı bilmiyor. Bu nasıl çözülüyor?',
        },
        answer: {
          de: 'Die Moderation erklärt die einzelnen Programmpunkte kurz in der Sprache, die im Saal gebraucht wird – Deutsch, Türkisch oder Englisch. Der Ablauf wird zudem so gelegt, dass die wichtigen Momente wie Einzug, Gelin Çıkarma und Eröffnungstanz nicht in die Zeit fallen, in der angereiste Gäste noch unterwegs oder schon auf dem Rückweg ins Hotel sind.',
          en: 'Hosting explains each part of the programme briefly in whichever language the room needs — German, Turkish or English. The running order is also timed so the moments that matter, like the entrance, the gelin çıkarma and the first dance, don’t land while travelling guests are still on their way or already heading back to the hotel.',
          tr: 'Sunum, her program bölümünü salonda ihtiyaç duyulan dilde kısaca açıklıyor — Almanca, Türkçe ya da İngilizce. Ayrıca akış, salona giriş, gelin çıkarma ve ilk dans gibi önemli anlar yolda olan ya da otele dönmüş davetlilerin kaçıracağı saatlere denk gelmeyecek şekilde planlanıyor.',
        },
      },
    ],
  },
  {
    /** Tier 3 — siehe „Batch August 2026" im Dateikopf. */
    slug: 'offenburg',
    name: 'Offenburg',
    region: 'Baden-Württemberg',
    distanceKm: 97,
    population: 62994,
    priority: 2,
    turkishCommunity: false,
    nearby: ['lahr', 'baden-baden', 'freiburg', 'karlsruhe'],
    travel: {
      included: false,
      note: {
        de: 'Offenburg liegt mit rund 97 Kilometern außerhalb des 50-km-Radius mit inklusiver Anfahrt. Die Strecke wird im individuellen Angebot offen ausgewiesen. Endet die Feier sehr spät, kann eine Übernachtung vor Ort die ruhigere Lösung sein als die Rückfahrt in der Nacht – sie steht dann ebenfalls als eigener Posten im Angebot.',
        en: 'At roughly 97 kilometres, Offenburg falls outside the 50 km travel-included radius. The distance is itemised openly in your individual quote. If the celebration ends very late, staying overnight nearby can be the calmer option than driving back through the night — and it appears as its own line in the quote as well.',
        tr: 'Offenburg, yaklaşık 97 kilometre ile ücretsiz ulaşımın geçerli olduğu 50 km’lik yarıçapın dışında kalıyor. Mesafe, size özel teklifte açıkça gösterilir. Kutlama çok geç bitiyorsa, gece yola çıkmak yerine bölgede konaklamak daha sakin bir çözüm olabilir – o da teklifte ayrı bir kalem olarak yer alır.',
      },
    },
    // TODO(kunde): keine Hochzeitslocation im Recherche-Pass verifiziert —
    // siehe docs/SEO-CITY-STRATEGY.md. Lieber leer als erfunden.
    venues: [],
    intro: {
      de: 'Offenburg liegt dort, wo die Rheinebene an den Schwarzwald stößt. Vor der Stadt beginnen die Rebhänge der Ortenau, dahinter steigt der Wald an, und nach Westen ist die französische Grenze nah, mit Straßburg dahinter. Das prägt die Hochzeiten hier: gefeiert wird oft im Weingut oder im Landgasthof statt im reinen Stadtsaal, und auf der Gästeliste stehen nicht selten auch Gäste von der anderen Rheinseite. Beides ist zuerst eine Planungsfrage, keine Musikfrage.',
      en: 'Offenburg sits where the Rhine plain meets the Black Forest. The vineyards of the Ortenau begin just outside town, the forest rises behind them, and to the west the French border is close, with Strasbourg beyond it. That shapes weddings here: celebrations often happen at a winery or a country inn rather than a plain municipal hall, and guest lists frequently include people from the other side of the Rhine. Both are questions of planning first, not of music.',
      tr: 'Offenburg, Ren ovasının Karaorman eteklerinde son bulduğu noktada kurulu. Şehrin hemen dışında Ortenau’nun bağ yamaçları başlıyor, arkasında orman yükseliyor; batıda ise Fransa sınırı yakın, onun ötesinde de Strazburg var. Bu, buradaki düğünlere de yansıyor: kutlamalar çoğu zaman klasik bir şehir salonu yerine bir bağ evinde ya da kırsal bir handa yapılıyor ve davetli listesinde Ren’in öte yakasından gelen misafirler de sıkça yer alıyor. İkisi de önce bir planlama meselesi, müzik meselesi değil.',
    },
    angle: {
      de: 'Rund 97 Kilometer bis Offenburg – außerhalb der inklusiven Zone, deshalb steht die Anfahrt offen im Angebot statt still im Preis. Auf dieser Strecke wird nichts vor Ort improvisiert: Strom auf der Weingut-Terrasse, Sperrzeit und Lärmschutz im Landgasthof, ein Plan B bei Regen. Gemischte Gästelisten bekommen dieselbe Ehrlichkeit vorab – moderiert wird auf Deutsch, Türkisch und Englisch, nicht auf Französisch.',
      en: 'Roughly 97 kilometres to Offenburg — outside the included zone, so travel is itemised openly in the quote instead of folded quietly into the price. At that distance nothing is left to improvise on site: power on the winery terrace, closing time and noise rules at the country inn, a plan B for rain. Mixed guest lists get the same honesty up front — hosting runs in German, Turkish and English, not in French.',
      tr: 'Offenburg’a yaklaşık 97 kilometre var — ücretsiz ulaşım bölgesinin dışında, bu yüzden yol, fiyatın içine sessizce eklenmek yerine teklifte açıkça yazılır. Bu mesafede hiçbir şey yerinde doğaçlamaya bırakılmaz: bağ evinin terasındaki elektrik, kırsal handa kapanış saati ve gürültü kuralları, yağmur için B planı. Karma davetli listeleri de aynı dürüstlüğü önceden görür — sunum Almanca, Türkçe ve İngilizce yapılır, Fransızca değil.',
    },
    faq: [
      {
        question: {
          de: 'Rechnen Sie für Offenburg eine Übernachtung mit ein, wenn wir bis in die Nacht feiern?',
          en: 'Do you factor in an overnight stay for Offenburg if we celebrate into the night?',
          tr: 'Gece geç saatlere kadar kutlama yaparsak Offenburg için konaklama da hesaba katılıyor mu?',
        },
        answer: {
          de: 'Nur wenn die Feier es verlangt. Die rund 97 Kilometer liegen außerhalb der 50-km-Inklusivstrecke und werden als eigener Posten im schriftlichen Angebot ausgewiesen. Eine Übernachtung kommt nur dazu, wenn Sie bis in die frühen Morgenstunden feiern wollen – und dann steht sie vorher im Angebot, nicht hinterher in der Rechnung.',
          en: 'Only if the celebration calls for it. The roughly 97 kilometres fall outside the 50 km included-travel range and are itemised as their own line in the written quote. An overnight stay is added only if you want to carry on into the early hours — and then it is in the quote beforehand, not on the invoice afterwards.',
          tr: 'Yalnızca kutlama gerektiriyorsa. Yaklaşık 97 kilometre, 50 km’lik ücretsiz ulaşım aralığının dışında kalıyor ve yazılı teklifte ayrı bir kalem olarak gösteriliyor. Konaklama ise ancak sabahın erken saatlerine kadar devam etmek isterseniz ekleniyor – o zaman da sonradan faturada değil, önceden teklifte yer alıyor.',
        },
      },
      {
        question: {
          de: 'Wir feiern in einem Weingut in der Ortenau oder in einem Landgasthof am Schwarzwaldrand – worauf kommt es dort an?',
          en: 'Our celebration is at a winery in the Ortenau or a country inn at the edge of the Black Forest — what matters there?',
          tr: 'Ortenau’da bir bağ evinde ya da Karaorman kenarındaki kırsal bir handa kutlama yapıyoruz — orada nelere dikkat ediliyor?',
        },
        answer: {
          de: 'Zuerst auf die Technik: Wie viel Leistung an der Terrasse anliegt und ob ein zweiter Stromkreis nötig ist, wird vorab direkt mit der Location geklärt. Dann auf zwei getrennte Zeitgrenzen – die Sperrzeit regelt, wann der Betrieb schließen muss, der Lärmschutz, ab wann draußen leiser gespielt werden muss. Beide gelten unabhängig voneinander. Bei Außenflächen gehört ein Regenplan von Anfang an dazu.',
          en: 'The technical side first: how much load the terrace can carry and whether a second circuit is needed are clarified directly with the venue in advance. Then two separate time limits — the statutory closing time governs when the premises have to shut, noise-protection rules govern from when the volume has to come down outdoors. The two apply independently of each other. For outdoor areas, a rain plan is part of the setup from the start.',
          tr: 'Önce teknik tarafa: terasta ne kadar güç bulunduğu ve ikinci bir hat gerekip gerekmediği önceden doğrudan mekânla netleştirilir. Sonra birbirinden ayrı iki zaman sınırına – yasal kapanış saati işletmenin ne zaman kapanması gerektiğini, gürültü koruma kuralları ise dışarıda sesin ne zaman kısılacağını belirler. İkisi birbirinden bağımsız geçerlidir. Açık alanlarda yağmur planı en baştan işin bir parçasıdır.',
        },
      },
      {
        question: {
          de: 'Ein Teil unserer Gäste kommt aus dem Elsass und spricht Französisch. Wie läuft die Moderation?',
          en: 'Some of our guests come from Alsace and speak French. How does the hosting work?',
          tr: 'Misafirlerimizin bir kısmı Alsas’tan geliyor ve Fransızca konuşuyor. Sunum nasıl yürüyor?',
        },
        answer: {
          de: 'Moderiert wird auf Deutsch, Türkisch und Englisch – Französisch gehört nicht dazu, und das gehört vorher gesagt statt am Abend bemerkt. In der Praxis laufen Ansagen für französischsprachige Gäste zusätzlich auf Englisch, und feste Programmpunkte wie Einzug oder Anschnitt werden vorab mit jemandem aus dem Familienkreis abgestimmt.',
          en: 'Hosting runs in German, Turkish and English — French is not part of it, and that is said beforehand rather than noticed on the night. In practice, announcements for French-speaking guests also run in English, and fixed moments such as the entrance or the cake are agreed in advance with someone from the family.',
          tr: 'Sunum Almanca, Türkçe ve İngilizce yapılır — Fransızca buna dahil değil ve bunun akşam fark edilmesindense önceden söylenmesi doğru olur. Uygulamada Fransızca konuşan misafirler için anonslar ayrıca İngilizce de yapılır; gelin ve damadın salona girişi ya da pasta kesimi gibi sabit program noktaları ise önceden aileden biriyle konuşulur.',
        },
      },
    ],
  },
  {
    /** Tier 2 — siehe „Batch August 2026" im Dateikopf. */
    slug: 'freiburg',
    name: 'Freiburg im Breisgau',
    region: 'Baden-Württemberg',
    // „im Breisgau" sprengt das Template (de 69 Zeichen); gesucht wird
    // ohnehin „hochzeits dj freiburg" — der Kurzname trägt die Abfrage,
    // Anzeigename und H1 behalten die amtliche Form.
    metaTitle: {
      de: 'Hochzeits-DJ Freiburg – DJ, Musiker & Moderator | DJ Veys',
      tr: "Düğün DJ'i Freiburg – DJ, müzisyen & sunucu | DJ Veys",
      en: 'Wedding DJ Freiburg – DJ, Musician & Host | DJ Veys',
    },
    distanceKm: 131,
    population: 236182,
    priority: 1,
    turkishCommunity: false,
    nearby: ['offenburg', 'lahr', 'baden-baden', 'karlsruhe'],
    travel: {
      included: false,
      note: {
        de: 'Mit rund 131 Kilometern liegt Freiburg weit außerhalb des 50-km-Radius mit inklusiver Anfahrt. Die Strecke wird im individuellen Angebot offen ausgewiesen; endet die Feier spät, ist eine Übernachtung oft die ehrlichere Lösung als eine Rückfahrt um vier Uhr morgens — auch sie steht dann im Angebot.',
        en: 'At roughly 131 kilometres, Freiburg is well outside the 50 km travel-included radius. The distance is itemised openly in your individual quote; if the celebration runs late, an overnight stay is often the more honest solution than a drive home at four in the morning — and that is itemised too.',
        tr: 'Freiburg, yaklaşık 131 kilometreyle ücretsiz ulaşımın geçerli olduğu 50 km’lik yarıçapın hayli dışında. Mesafe, size özel teklifte açıkça gösterilir; kutlama geç biterse konaklama çoğu zaman sabaha karşı dönüş yolundan daha dürüst bir çözümdür — o da teklifte ayrıca yer alır.',
      },
    },
    venues: [
      {
        name: 'Historisches Kaufhaus',
        kind: 'location',
        note: {
          de: 'Roter Bau mit gotischen Arkaden direkt am Münsterplatz — gilt als die beliebteste Hochzeitslocation der Stadt.',
          en: 'A red building with Gothic arcades directly on Münsterplatz — regarded as the most popular wedding venue in the city.',
          tr: 'Münsterplatz’ta duran, gotik kemerli kırmızı bir yapı — şehrin en çok tercih edilen düğün mekânı sayılıyor.',
        },
      },
      {
        name: 'Schloss Ebnet',
        kind: 'schloss',
        note: {
          de: 'Bekannte Schloss-Location in Freiburg für Paare, die nicht mitten am Münsterplatz feiern möchten.',
          en: 'A well-known castle venue in Freiburg for couples who would rather not celebrate on Münsterplatz itself.',
          tr: 'Münsterplatz’ın tam ortasında kutlamak istemeyen çiftler için Freiburg’da bilinen bir şato mekânı.',
        },
      },
      {
        name: 'Alte Wache',
        kind: 'location',
        note: {
          de: 'Historisches Gebäude und eine der bekannten Adressen für Feiern in Freiburg — hier zur Orientierung genannt, nicht als Partnerlocation.',
          en: 'A historic building and one of the well-known addresses for celebrations in Freiburg — listed here for orientation, not as a partner venue.',
          tr: 'Tarihi bir yapı ve Freiburg’da kutlamalar için bilinen adreslerden biri — burada ortaklık olarak değil, yönlendirme amacıyla anılıyor.',
        },
      },
    ],
    intro: {
      de: 'Freiburg liegt im äußersten Südwesten, am Rand des Schwarzwalds — und damit weiter von Stuttgart entfernt als die meisten Städte in diesem Verzeichnis. Die bekannteste Hochzeitsadresse der Stadt steht mitten in der Altstadt: das Historische Kaufhaus, ein roter Bau mit gotischen Arkaden direkt am Münsterplatz. Die standesamtliche Trauung findet im historischen Rathaus statt; wer abseits des Münsterplatzes feiern möchte, findet mit Schloss Ebnet eine zweite bekannte Adresse.',
      en: 'Freiburg sits in the far south-west of Germany, at the edge of the Black Forest — further from Stuttgart than most of the cities in this directory. The best-known wedding address in town stands in the middle of the old town: the Historisches Kaufhaus, a red building with Gothic arcades directly on Münsterplatz. Civil ceremonies take place in the historic Rathaus, and for couples who would rather not celebrate on the square itself, Schloss Ebnet is a second well-known address.',
      tr: 'Freiburg, Almanya’nın en güneybatı ucunda, Karaorman’ın kıyısında — Stuttgart’a bu listedeki şehirlerin çoğundan daha uzak. Şehrin en bilinen düğün adresi tam eski şehrin ortasında: gotik kemerleriyle kırmızı bir yapı olan ve doğrudan Münsterplatz’ta duran Historisches Kaufhaus. Resmi nikâh tarihi Rathaus’ta kıyılıyor; Münsterplatz’ın dışında kutlamak isteyenler içinse Schloss Ebnet ikinci bilinen adres.',
    },
    angle: {
      de: 'Bei 131 Kilometern stellt sich die Frage anders: nicht, welcher DJ noch frei ist, sondern wofür sich der Weg lohnt. Freiburg hat einen dichten eigenen DJ-Markt; wer aus Stuttgart anreist, muss also etwas mitbringen, das hier nicht selbstverständlich ist — das DJ-Set, live gespielte Saz und Gitarre und die Moderation des Abends von derselben Person. Wer ausschließlich ein DJ-Set sucht, findet es näher. Auch das gehört zu einer ehrlichen Antwort.',
      en: 'At 131 kilometres the question changes: not which DJ is still free, but what makes the journey worth it. Freiburg has no shortage of DJs of its own, so anyone coming from Stuttgart has to bring what is not standard here — the DJ set, saz and guitar played live, and hosting the evening from the same person. If you only need a DJ set, you will find one closer. An honest answer says that too.',
      tr: '131 kilometrede soru başka türlü kuruluyor: mesele boş bir DJ bulmak değil, bu yolun neye değdiği. Freiburg’un kendi DJ piyasası zaten yoğun; dolayısıyla Stuttgart’tan gelen birinin, burada kendiliğinden bulunmayan bir şey getirmesi gerekiyor — DJ seti, canlı çalınan saz ve gitar ve akşamın sunumu, hepsi aynı kişiden. Sadece bir DJ seti arıyorsanız daha yakında bulursunuz. Dürüst cevap bunu da söyler.',
    },
    faq: [
      {
        question: {
          de: 'Was passiert nach der Feier — Rückfahrt nach Stuttgart oder Übernachtung?',
          en: 'What happens after the party — the drive back to Stuttgart, or an overnight stay?',
          tr: 'Kutlamadan sonra ne oluyor — Stuttgart’a dönüş mü, konaklama mı?',
        },
        answer: {
          de: 'Beides ist möglich, und beides steht offen im Angebot. Freiburg liegt mit rund 131 Kilometern weit außerhalb der 50-km-Inklusivstrecke; endet die Feier tief in der Nacht, ist eine Übernachtung meist die ehrlichere Lösung als eine Rückfahrt um vier Uhr morgens. Anfahrt und, falls nötig, Übernachtung werden im schriftlichen Angebot einzeln ausgewiesen — bevor Sie sich festlegen.',
          en: 'Either works, and either is stated openly in the quote. At roughly 131 kilometres, Freiburg is far outside the 50 km included-travel range; if the celebration runs deep into the night, an overnight stay is usually the more honest solution than a drive home at four in the morning. Travel and, where needed, accommodation are itemised separately in the written quote — before you commit.',
          tr: 'İkisi de mümkün ve ikisi de teklifte açıkça yer alır. Freiburg, yaklaşık 131 kilometreyle ücretsiz ulaşımın geçerli olduğu 50 km aralığının epey dışında; kutlama gecenin geç saatlerine kadar sürerse, konaklama çoğu zaman sabaha karşı dönüş yolundan daha dürüst bir çözümdür. Ulaşım, gerekiyorsa konaklama da, siz karar vermeden önce yazılı teklifte ayrı ayrı gösterilir.',
        },
      },
      {
        question: {
          de: 'In Freiburg sind Sie nicht ortskundig — wie wird das aufgefangen?',
          en: 'You are not local to Freiburg — how is that made up for?',
          tr: 'Freiburg’u yerel biri gibi tanımıyorsunuz — bu nasıl telafi ediliyor?',
        },
        answer: {
          de: 'Indem nichts vorausgesetzt wird. Zufahrt, Anlieferzeiten und Lautstärkegrenzen unterscheiden sich von Location zu Location und werden vor der Zusage direkt mit Ihrer Location geklärt, statt am Hochzeitstag entdeckt zu werden. Die Anreise wird zudem früh genug angesetzt, dass Aufbau und Soundcheck nicht davon abhängen, wie der Verkehr an diesem Tag läuft.',
          en: 'By assuming nothing. Access, delivery windows and volume limits differ from venue to venue and are clarified directly with your venue before anything is confirmed, rather than discovered on the wedding day. Arrival is also scheduled early enough that setup and soundcheck do not depend on how the traffic runs that day.',
          tr: 'Hiçbir şeyi varsaymayarak. Giriş yolu, yükleme saatleri ve ses sınırları mekândan mekâna değişir; bunlar düğün günü keşfedilmek yerine, kesinleşmeden önce doğrudan sizin mekânınızla netleştirilir. Yola çıkış da, kurulum ve ses kontrolü o günkü trafiğe bağlı kalmayacak kadar erken planlanır.',
        },
      },
      {
        question: {
          de: 'In Freiburg gibt es genug DJs — warum einen aus Stuttgart buchen?',
          en: 'There are plenty of DJs in Freiburg — why book one from Stuttgart?',
          tr: 'Freiburg’da yeterince DJ var — neden Stuttgart’tan biri?',
        },
        answer: {
          de: 'Nur dann, wenn Sie mehr als ein DJ-Set wollen. Live gespielte Saz oder Gitarre an den Stellen, an denen es zählt, und die Moderation des Abends aus derselben Hand sind das, was die 131 Kilometer trägt. Für einen reinen DJ-Abend ist ein Anbieter vor Ort die vernünftigere Wahl — auch wenn diese Empfehlung gegen die eigene Buchung spricht.',
          en: 'Only if you want more than a DJ set. Saz or guitar played live at the moments that matter, and hosting the evening from the same person, are what carries the 131 kilometres. For a straightforward DJ evening, a provider based in Freiburg is the more sensible choice — even though that recommendation argues against the booking.',
          tr: 'Yalnızca DJ setinden fazlasını istiyorsanız. Önemli anlarda canlı çalınan saz ya da gitar ve akşamın sunumunun aynı kişiden gelmesi, 131 kilometreyi taşıyan şey. Sadece bir DJ akşamı istiyorsanız, Freiburg’daki bir sağlayıcı daha mantıklı bir tercih — bu öneri kendi rezervasyonumuzun aleyhine olsa bile.',
        },
      },
    ],
  },
  {
    /** Tier 3 — siehe „Batch August 2026" im Dateikopf. */
    slug: 'konstanz',
    name: 'Konstanz',
    region: 'Baden-Württemberg',
    distanceKm: 124,
    population: 86845,
    priority: 2,
    turkishCommunity: false,
    nearby: ['friedrichshafen', 'villingen-schwenningen', 'ulm'],
    travel: {
      included: false,
      note: {
        de: 'Konstanz liegt mit rund 124 Kilometern deutlich außerhalb des 50-km-Radius mit inklusiver Anfahrt. Die Strecke wird offen im individuellen Angebot ausgewiesen; endet die Feier spät, gehört eine Übernachtung ehrlicherweise dazu und steht ebenfalls im Angebot – keine versteckten Aufschläge.',
        en: 'At around 124 kilometres, Konstanz is well outside the 50 km travel-included radius. The distance is itemised openly in your individual quote, and if the celebration ends late an overnight stay is the honest answer — it appears in the quote as well. No hidden surcharges.',
        tr: 'Yaklaşık 124 kilometreyle Konstanz, ücretsiz ulaşımın geçerli olduğu 50 km’lik yarıçapın epey dışında. Mesafe, size özel teklifte açıkça gösterilir; kutlama geç biterse konaklama dürüst çözümdür ve o da teklifte yer alır – gizli ek ücret yok.',
      },
    },
    venues: [
      {
        name: 'Neues Schloss Meersburg',
        kind: 'schloss',
        note: {
          de: 'Barocke Residenz der Konstanzer Fürstbischöfe mit Blick über den Bodensee – bekannt in der Region, liegt aber in Meersburg am gegenüberliegenden Ufer, nicht in Konstanz selbst.',
          en: 'A Baroque residence of the Konstanz prince-bishops overlooking the Bodensee — well known in the region, though it stands in Meersburg on the opposite bank, not in Konstanz itself.',
          tr: 'Konstanz prens-piskoposlarına ait, Bodensee manzaralı barok bir ikametgâh – bölgede tanınan bir yapı, ancak Konstanz’ın içinde değil, karşı kıyıdaki Meersburg’da bulunuyor.',
        },
      },
    ],
    intro: {
      de: 'Konstanz liegt am Bodensee, und die Grenze zur Schweiz verläuft mitten durch die Stadt – Hochzeiten hier haben regelmäßig Gäste, die von beiden Seiten anreisen. Der See prägt auch das Format: Viele Paare feiern am Ufer oder ganz im Freien, mit dem Wasser im Blick. Gegenüber, in Meersburg, steht das Neue Schloss, einst barocke Residenz der Konstanzer Fürstbischöfe – nicht in Konstanz selbst, aber für Paare aus der Stadt in Reichweite.',
      en: 'Konstanz sits on the Bodensee, and the German-Swiss border runs straight through the city — weddings here regularly draw guests from both sides of it. The lake shapes the format too: many couples celebrate on the shore or fully outdoors, with the water in view. On the opposite bank, in Meersburg, stands the Neues Schloss, once a Baroque residence of the Konstanz prince-bishops — not in Konstanz itself, but within reach for couples from the city.',
      tr: 'Konstanz, Bodensee kıyısında; Almanya-İsviçre sınırı da şehrin tam ortasından geçiyor – buradaki düğünlerde davetlilerin sınırın iki yakasından gelmesi olağan. Göl aynı zamanda formatı belirliyor: birçok çift kıyıda ya da tamamen açık havada, suya bakan bir manzarayla kutluyor. Karşı kıyıda, Meersburg’da, bir zamanlar Konstanz prens-piskoposlarına ait barok bir ikametgâh olan Neues Schloss duruyor – Konstanz’ın içinde değil, ama şehirdeki çiftler için ulaşılabilir mesafede.',
    },
    angle: {
      de: 'Am See ist die Technik die eigentliche Planungsarbeit: offenes Ufer, der Stromanschluss oft dutzende Meter entfernt im Gebäude, Wind vom Wasser und – wo Wohnbebauung ans Ufer grenzt – die Ruhezeiten der Gemeinde. Diese Fragen werden geklärt, bevor ein Termin zugesagt wird, Regenvariante inklusive. Dafür lohnen sich die 124 Kilometer: Angereist wird mit Puffer, damit Aufbau und Soundcheck längst stehen, wenn die ersten Gäste kommen. Die Strecke selbst steht offen im Angebot.',
      en: 'By the lake, the technical side is the real planning work: an open shore, power often dozens of metres away in the building, wind off the water, and quiet hours where housing borders the shore. That is settled before a date is confirmed, rain plan included. It is also what the 124 kilometres buy: arriving with a buffer, so setup and soundcheck are done before the first guests appear. The distance is itemised openly in the quote.',
      tr: 'Göl kenarında asıl planlama işi teknikte: açık bir kıyı, elektrik bağlantısı çoğu zaman binanın içinde onlarca metre uzakta, sudan gelen rüzgâr ve – kıyıda konut varsa – belediyenin sessizlik saatleri. Bu sorular tarih kesinleşmeden önce yanıtlanır; yağmur için B planı dahil. 124 kilometrenin karşılığı da bu: yola zaman payıyla çıkılır, ilk davetliler gelmeden kurulum ve ses kontrolü çoktan tamamlanır. Mesafe teklifte açıkça yazılır.',
    },
    faq: [
      {
        question: {
          de: 'Kommt bei der Entfernung nach Konstanz zur Anfahrt noch eine Übernachtung dazu?',
          en: 'Given the distance to Konstanz, does an overnight stay get added on top of the travel?',
          tr: 'Konstanz’ın uzaklığı düşünülünce, yol ücretine bir de konaklama ekleniyor mu?',
        },
        answer: {
          de: 'Wenn die Feier bis in die Nacht läuft, ja: 124 Kilometer direkt nach dem Abbau sind kein guter Abschluss eines Hochzeitstags. Fahrtstrecke und Übernachtung stehen dann als eigene Posten im schriftlichen Angebot, bevor Sie sich entscheiden. Ist die Übernachtung nicht nötig, taucht sie auch nicht auf.',
          en: 'If the celebration runs into the night, yes: 124 kilometres straight after packing down is no way to end a wedding day. The distance and the overnight stay then appear as separate lines in the written quote before you decide. If the overnight stay is not needed, it is not in there.',
          tr: 'Kutlama gece geç saatlere kadar sürüyorsa evet: toplama biter bitmez 124 kilometre yol, bir düğün gününün iyi bir kapanışı olmuyor. Yol mesafesi ve konaklama, siz karar vermeden önce yazılı teklifte ayrı kalemler olarak yer alır. Konaklama gerekmiyorsa teklifte de görünmez.',
        },
      },
      {
        question: {
          de: 'Wir feiern draußen am Seeufer – wie wird die Anlage dort aufgebaut?',
          en: 'We are celebrating outdoors on the lakeshore — how is the sound system set up there?',
          tr: 'Göl kıyısında açık havada kutlayacağız – ses sistemi orada nasıl kuruluyor?',
        },
        answer: {
          de: 'Anders als in einem Saal: statt zweier lauter Boxen Richtung Wasser stehen mehrere kleinere, leiser eingestellte Punkte entlang der Gästefläche – der Wind vom See dünnt den Ton sonst genau dort aus, wo moderiert wird. Vorab entschieden wird auch die Stromfrage: lange Zuleitung vom Gebäude oder leises Aggregat. Das steht im Angebot, nicht erst am Hochzeitstag.',
          en: 'Differently from a hall: instead of two loud speakers aimed at the water, several smaller, quieter points go along the guest area — otherwise the wind off the lake thins the sound exactly where the hosting happens. The power question is settled in advance too: a long cable run from the building, or a quiet generator. That belongs in the quote, not on the wedding day.',
          tr: 'Salondan farklı olarak: suya dönük iki güçlü hoparlör yerine, davetli alanı boyunca daha küçük ve daha kısık ayarlanmış birkaç nokta kurulur – yoksa gölden gelen rüzgâr sesi tam da sunumun yapıldığı yerde inceltir. Elektrik sorusu da önceden karara bağlanır: binadan uzun bir hat mı çekilecek, yoksa sessiz bir jeneratör mü. Bu, düğün gününde değil, teklifte belli olur.',
        },
      },
      {
        question: {
          de: 'Unsere Location liegt in Meersburg am anderen Ufer – ist das ein Problem?',
          en: 'Our venue is in Meersburg on the other side of the lake — is that a problem?',
          tr: 'Mekânımız gölün karşı kıyısında, Meersburg’da – bu sorun olur mu?',
        },
        answer: {
          de: 'Nein, aber der Weg gehört in den Zeitplan: Rund um den Überlinger See zu fahren dauert deutlich länger als die Überfahrt mit der Autofähre Konstanz–Meersburg. Welche Variante gerechnet wird, steht vor dem Tag fest – mit Puffer, damit Aufbau und Soundcheck stehen, bevor die ersten Gäste da sind, auch die aus der Schweiz.',
          en: 'No, but the route belongs in the schedule: driving around the Überlinger See takes considerably longer than the Konstanz–Meersburg car ferry. Which option is planned for is settled before the day — with a buffer, so setup and soundcheck are done before the first guests arrive, including those coming from Switzerland.',
          tr: 'Hayır, ama ulaşım zaman planının bir parçası: Überlinger See’nin etrafından dolaşmak, Konstanz–Meersburg araba feribotuyla geçmekten belirgin şekilde uzun sürüyor. Hangi seçeneğin hesaplandığı günden önce bellidir – kurulum ve ses kontrolü, İsviçre’den gelenler dahil ilk davetliler gelmeden bitecek şekilde zaman payıyla.',
        },
      },
    ],
  },
  {
    /** Tier 3 — siehe „Batch August 2026" im Dateikopf. */
    slug: 'friedrichshafen',
    name: 'Friedrichshafen',
    region: 'Baden-Württemberg',
    distanceKm: 127,
    population: 62798,
    priority: 2,
    turkishCommunity: false,
    nearby: ['konstanz', 'ulm'],
    travel: {
      included: false,
      note: {
        de: 'Friedrichshafen liegt mit rund 127 Kilometern Luftlinie deutlich außerhalb der anfahrtskostenfreien 50-km-Zone. Die Strecke wird im schriftlichen Angebot einzeln ausgewiesen – kein versteckter Aufschlag. Endet die Feier spät, ist eine Übernachtung meist die ehrlichere Lösung als die Rückfahrt mitten in der Nacht; auch sie steht dann offen im Angebot.',
        en: 'At around 127 kilometres, Friedrichshafen is well outside the 50 km travel-included zone. The distance is itemised separately in the written quote — no hidden surcharge. If the celebration runs late, an overnight stay is usually the more honest solution than driving back in the middle of the night; that too appears openly in the quote.',
        tr: 'Yaklaşık 127 kilometreyle Friedrichshafen, ücretsiz ulaşımın geçerli olduğu 50 km’lik bölgenin epey dışında. Mesafe, yazılı teklifte ayrı bir kalem olarak gösterilir — gizli ek ücret yok. Kutlama geç saatlere uzuyorsa, gece yarısı geri dönmek yerine bir gecelik konaklama genelde daha dürüst bir çözüm; o da teklifte açıkça yer alır.',
      },
    },
    // TODO(kunde): keine Hochzeitslocation im Recherche-Pass verifiziert —
    // siehe docs/SEO-CITY-STRATEGY.md. Lieber leer als erfunden.
    venues: [],
    intro: {
      de: 'Friedrichshafen liegt am Nordufer des Bodensees und verdankt seinen Ruf der Luftfahrt: Hier wurden die Zeppeline gebaut, das Zeppelin Museum hält diese Geschichte bis heute wach. Gefeiert wird in der Stadt oft mit Blick aufs Wasser, im Sommer bis weit in den Abend hinein draußen. Wind vom See und kühlere Nächte gehören deshalb zur Planung – ebenso die Frage, wann der Ton nach drinnen wechselt. Was am Ufer erlaubt ist, wird direkt mit dem Veranstaltungsort geklärt, nicht pauschal angenommen.',
      en: 'Friedrichshafen sits on the northern shore of Lake Constance and owes its reputation to aviation: the Zeppelins were built here, and the Zeppelin Museum keeps that history present. Celebrations in the city often take place with the water in view, and in summer they stay outdoors well into the evening. Wind off the lake and cooler nights therefore belong in the planning — as does the question of when the sound moves indoors. What is permitted on the shore is settled directly with the venue, never assumed.',
      tr: 'Friedrichshafen, Bodensee’nin kuzey kıyısında yer alıyor ve ününü havacılığa borçlu: Zeppelinler burada üretildi, Zeppelin Museum bu tarihi bugün de canlı tutuyor. Şehirdeki kutlamalar çoğu zaman suya bakan bir manzarayla yapılıyor, yazın ise akşamın geç saatlerine kadar açık havada sürüyor. Gölden gelen rüzgâr ve serinleyen geceler bu yüzden planlamanın parçası — tıpkı sesin ne zaman içeri alınacağı sorusu gibi. Kıyıda nelere izin verildiği ise peşinen varsayılmaz, doğrudan mekânla netleştirilir.',
    },
    angle: {
      de: 'Friedrichshafen ist Messestadt und Seestadt zugleich, und beides landet im selben Kalender: die Hochzeit am Samstag, der Firmenabend unter der Woche. Anlage, Aufbau und Person sind in beiden Fällen dieselben – wer im Vorgespräch am Tisch sitzt, steht abends auch am Pult. Was ein Abend am Wasser darüber hinaus verlangt, ist vor allem Planung: Aufbau mit Puffer und ein vereinbarter Zeitpunkt, an dem der Ton nach drinnen wechselt.',
      en: 'Friedrichshafen is a trade-fair town and a lakeside town at once, and both land in the same calendar: the wedding on Saturday, the corporate evening midweek. The rig, the setup and the person are the same in either case — whoever sits at the planning table also stands behind the booth that night. Beyond that, an evening by the water is mostly planning: setup with a buffer, and an agreed moment when the sound moves indoors.',
      tr: 'Friedrichshafen hem fuar hem göl kenti; ikisi de aynı takvime giriyor: cumartesi düğün, hafta içi şirket akşamı. Her iki durumda da ses sistemi, kurulum ve kişi aynı — ön görüşmede masada oturan, akşam da kabinin başında duruyor. Su kenarındaki bir akşamın bunun ötesinde istediği şey ise planlama: pay bırakan bir kurulum ve sesin içeri alınacağı, önceden kararlaştırılmış bir saat.',
    },
    faq: [
      {
        question: {
          de: 'Kommt für Friedrichshafen eine Übernachtung dazu oder fahren Sie nach der Feier zurück nach Stuttgart?',
          en: 'Does Friedrichshafen mean an overnight stay, or do you drive back to Stuttgart after the celebration?',
          tr: 'Friedrichshafen için bir gecelik konaklama gerekiyor mu, yoksa kutlamadan sonra Stuttgart’a geri mi dönüyorsunuz?',
        },
        answer: {
          de: 'Beides ist möglich, und beides steht im schriftlichen Angebot. Die rund 127 Kilometer liegen außerhalb der 50-km-Inklusivzone, die Anfahrt wird deshalb als eigener Posten ausgewiesen. Endet der Abend spät, wird die Übernachtung gleich mitkalkuliert – Sie entscheiden vor der Zusage, nicht danach.',
          en: 'Either is possible, and both appear in the written quote. The roughly 127 kilometres fall outside the 50 km included zone, so travel is itemised as its own line. If the evening runs late, the overnight stay is costed in alongside it — you decide before you commit, not afterwards.',
          tr: 'İkisi de mümkün ve ikisi de yazılı teklifte yer alıyor. Yaklaşık 127 kilometre, ücretsiz ulaşımın geçerli olduğu 50 km’lik bölgenin dışında; bu yüzden ulaşım ayrı bir kalem olarak gösterilir. Akşam geç biterse konaklama da baştan hesaba katılır — kararı onay vermeden önce verirsiniz, sonradan değil.',
        },
      },
      {
        question: {
          de: 'Wie planen Sie in Friedrichshafen einen Abend, der draußen am See beginnt und drinnen weitergeht?',
          en: 'How do you plan an evening in Friedrichshafen that starts outdoors by the lake and continues indoors?',
          tr: 'Friedrichshafen’de göl kenarında başlayıp içeride devam eden bir akşamı nasıl planlıyorsunuz?',
        },
        answer: {
          de: 'Mit einer festen Uhrzeit statt mit Bauchgefühl. Über dem Wasser trägt der Schall weiter als im Saal, und der Wind vom See kann abends auffrischen – beides wird vorab mit der Location besprochen, samt der Frage, welche Auflagen dort gelten. Daraus entsteht ein Zeitpunkt für den Wechsel nach drinnen, den alle kennen, bevor der Abend anfängt.',
          en: 'With a fixed time rather than a gut feeling. Sound carries further over water than inside a hall, and the wind off the lake can pick up in the evening — both are discussed with the venue beforehand, along with the question of which rules apply there. Out of that comes an agreed time for the move indoors that everyone knows before the evening starts.',
          tr: 'İçgüdüyle değil, net bir saatle. Su üzerinde ses kapalı bir salondakinden daha uzağa taşınır ve gölden gelen rüzgâr akşama doğru sertleşebilir — ikisi de önceden mekânla konuşulur, orada hangi kuralların geçerli olduğu sorusuyla birlikte. Böylece içeri geçiş için, akşam başlamadan herkesin bildiği bir saat belirlenir.',
        },
      },
      {
        question: {
          de: 'Übernehmen Sie in Friedrichshafen auch Firmenfeiern und Abendveranstaltungen?',
          en: 'Do you also take on corporate parties and evening events in Friedrichshafen?',
          tr: 'Friedrichshafen’de şirket kutlamaları ve akşam etkinlikleri de üstleniyor musunuz?',
        },
        answer: {
          de: 'Ja. Ton- und Lichttechnik, Aufbau und Moderation sind dieselben wie bei einer Hochzeit, nur der Ablauf ist ein anderer – Begrüßung, Programmpunkte und Musik richten sich nach dem Zeitplan des Unternehmens. Fällt der Abend in eine Messewoche, wird der Aufbau so gelegt, dass er dem Tagesprogramm nicht in die Quere kommt.',
          en: 'Yes. The sound and lighting, the setup and the hosting are the same as at a wedding — only the running order differs, with the welcome, programme slots and music built around the company schedule. If the evening falls in a trade-fair week, setup is scheduled so it does not collide with the daytime programme.',
          tr: 'Evet. Ses ve ışık ekipmanı, kurulum ve sunum bir düğündekiyle aynı; yalnızca akış farklı — karşılama, program başlıkları ve müzik şirketin zaman planına göre kurgulanır. Akşam bir fuar haftasına denk geliyorsa kurulum, gündüz programıyla çakışmayacak şekilde planlanır.',
        },
      },
    ],
  },
  {
    /**
     * Batch August 2026, Nachtrag (2026-08-16): vom Kunden ausdrücklich
     * angefragte Abdeckung — „auch wer in Villingen-Schwenningen sucht,
     * soll fündig werden". `distanceKm` per Haversine (48.0606, 8.4594),
     * dieselbe Rechnung wie beim übrigen Batch.
     */
    slug: 'villingen-schwenningen',
    name: 'Villingen-Schwenningen',
    region: 'Baden-Württemberg',
    // Der Doppelname sprengt das Titel-Template (de 71 Zeichen — Google
    // kappt bei ~60): kurzer Ersatz ohne den Zusatz, Keyword vorn.
    metaTitle: {
      de: 'Hochzeits-DJ Villingen-Schwenningen | DJ Veys',
      tr: "Düğün DJ'i Villingen-Schwenningen | DJ Veys",
      en: 'Wedding DJ Villingen-Schwenningen | DJ Veys',
    },
    distanceKm: 96,
    // TODO(kunde): Einwohnerzahl (~85–90 Tsd. laut Stadtverwaltung) vor
    // Veröffentlichung einer konkreten Zahl verifizieren — bis dahin null,
    // dieselbe Regel wie bei Böblingen.
    population: null,
    priority: 2,
    turkishCommunity: false,
    nearby: ['tuebingen', 'konstanz', 'freiburg', 'offenburg'],
    travel: {
      included: false,
      note: {
        de: 'Villingen-Schwenningen liegt mit rund 96 Kilometern Luftlinie außerhalb der anfahrtskostenfreien 50-km-Zone. Die Strecke über die A81 wird im schriftlichen Angebot als eigener Posten ausgewiesen. Bei Feiern bis in die frühen Morgenstunden steht eine Übernachtung ebenfalls vorab im Angebot – nicht hinterher auf der Rechnung.',
        en: 'At roughly 96 kilometres as the crow flies, Villingen-Schwenningen is outside the 50 km travel-included zone. The drive down the A81 is itemised as its own line in the written quote. For celebrations running into the early hours, an overnight stay is likewise quoted up front — not added to the invoice afterwards.',
        tr: 'Villingen-Schwenningen, kuş uçuşu yaklaşık 96 kilometreyle ücretsiz ulaşımın geçerli olduğu 50 km’lik bölgenin dışında. A81 üzerinden yol, yazılı teklifte ayrı bir kalem olarak gösterilir. Sabahın erken saatlerine uzayan kutlamalarda konaklama da önceden teklifte yer alır – sonradan faturada değil.',
      },
    },
    // TODO(kunde): keine Hochzeitslocation verifiziert — lieber leer als
    // erfunden, dieselbe Regel wie bei Offenburg und Friedrichshafen.
    venues: [],
    intro: {
      de: 'Villingen-Schwenningen ist eine Stadt mit zwei Kernen: das badische Villingen mit seiner mittelalterlichen Altstadt und das württembergische Schwenningen, das mit der Uhrenindustrie groß wurde – erst 1972 wurden beide eine Stadt. Für Hochzeiten heißt das: Gefeiert wird mal auf der einen, mal auf der anderen Seite, oft auch in den Gemeinden der Baar dazwischen. Die größte Stadt des Schwarzwald-Baar-Kreises liegt dabei auf gut 700 Metern – die Abende sind hier auch im Sommer spürbar kühler als im Neckartal.',
      en: 'Villingen-Schwenningen is a city with two centres: Villingen on the Baden side with its medieval old town, and Schwenningen on the Württemberg side, which grew up with the clock industry — the two only became one city in 1972. For weddings that means celebrations happen sometimes on one side, sometimes on the other, and often in the villages of the Baar plateau in between. The largest city of the Schwarzwald-Baar district also sits at a good 700 metres — evenings here are noticeably cooler than in the Neckar valley, even in summer.',
      tr: 'Villingen-Schwenningen iki çekirdekli bir şehir: Baden tarafında ortaçağdan kalma eski merkeziyle Villingen, Württemberg tarafında ise saat sanayisiyle büyüyen Schwenningen – ikisi ancak 1972’de tek şehir oldu. Düğünler için bunun anlamı şu: kutlama bazen bir yakada, bazen öbüründe, çoğu zaman da aradaki Baar platosunun beldelerinde yapılıyor. Schwarzwald-Baar ilçesinin en büyük şehri üstelik 700 metrenin üzerinde kurulu – akşamlar burada yazın bile Neckar vadisinden hissedilir ölçüde serin geçiyor.',
    },
    angle: {
      de: 'Die erste Planungsfrage lautet hier oft: Villingen oder Schwenningen? Zwei Zentren, zwei Sorten Säle, dazwischen die Hallen der Baar-Gemeinden – welcher Raum es wird, ändert an Anlage, Aufbau und Person nichts, denn die Technik reist komplett mit und hängt nicht davon ab, was der Saal vor Ort hergibt. Die rund 96 Kilometer ab Stuttgart stehen offen im Angebot; geplant wird die Feier mit denselben Vorgesprächen wie eine im Kessel.',
      en: 'The first planning question here is often: Villingen or Schwenningen? Two centres, two kinds of hall, plus the venues of the Baar villages in between — whichever room it ends up being changes nothing about the rig, the setup or the person, because the equipment travels along in full and does not depend on what the hall happens to own. The roughly 96 kilometres from Stuttgart are itemised openly in the quote; the celebration is planned with the same preparatory calls as one in Stuttgart itself.',
      tr: 'Buradaki ilk planlama sorusu çoğu zaman şu: Villingen mi, Schwenningen mi? İki merkez, iki tür salon, arada da Baar beldelerinin düğün salonları – hangisi seçilirse seçilsin ses sistemi, kurulum ve kişi değişmez; çünkü ekipman eksiksiz birlikte gelir, salonun kendi imkânlarına bağlı kalmaz. Stuttgart’tan yaklaşık 96 kilometre teklifte açıkça yazılıdır; kutlama, Stuttgart’taki bir düğünle aynı ön görüşmelerle planlanır.',
    },
    faq: [
      {
        question: {
          de: 'Kommen Sie aus Stuttgart nach Villingen-Schwenningen – und was kostet die Anfahrt?',
          en: 'Do you come from Stuttgart to Villingen-Schwenningen — and what does the travel cost?',
          tr: 'Stuttgart’tan Villingen-Schwenningen’e geliyor musunuz – yol ücreti ne kadar tutuyor?',
        },
        answer: {
          de: 'Ja, die Strecke über die A81 gehört zum Einzugsgebiet. Die rund 96 Kilometer Luftlinie liegen außerhalb der 50-km-Inklusivzone, deshalb wird die Anfahrt im schriftlichen Angebot als eigener Posten ausgewiesen – vor der Zusage, nicht danach. Am Programm selbst ändert die Entfernung nichts.',
          en: 'Yes — the run down the A81 is part of the service area. The roughly 96 kilometres as the crow flies fall outside the 50 km included zone, so travel is itemised as its own line in the written quote — before you commit, not after. The distance changes nothing about the programme itself.',
          tr: 'Evet, A81 üzerinden bu güzergâh hizmet bölgesine dahil. Kuş uçuşu yaklaşık 96 kilometre, ücretsiz ulaşımın geçerli olduğu 50 km’lik bölgenin dışında kaldığı için yol, yazılı teklifte ayrı bir kalem olarak gösterilir – onay vermeden önce, sonradan değil. Mesafe programın kendisini değiştirmez.',
        },
      },
      {
        question: {
          de: 'Villingen oder Schwenningen – macht das für Technik und Ablauf einen Unterschied?',
          en: 'Villingen or Schwenningen — does it make a difference for the equipment and the running order?',
          tr: 'Villingen mi, Schwenningen mi – teknik ve akış açısından fark eder mi?',
        },
        answer: {
          de: 'Für die Feier selbst nicht, für die Vorbereitung schon. Die Anlage ist in beiden Stadtbezirken dieselbe, weil sie komplett mitgebracht wird. Was sich unterscheidet, sind die Räume: Altstadtnahe Säle in Villingen stellen andere Fragen an Zufahrt und Aufbauzeit als Hallen in Schwenningen oder in den Baar-Gemeinden. Genau das wird im Vorgespräch mit der Location geklärt – nicht am Abend selbst.',
          en: 'Not for the celebration itself, but yes for the preparation. The rig is the same in both districts, because it is brought along in full. What differs is the rooms: halls near Villingen’s old town ask different questions about access and setup time than venues in Schwenningen or the Baar villages. Exactly that is settled with the venue in the planning call — not on the night.',
          tr: 'Kutlamanın kendisi için değil, hazırlık için eder. Ses sistemi iki yakada da aynıdır, çünkü eksiksiz olarak birlikte getirilir. Farklılaşan şey mekânlar: Villingen’in eski şehrine yakın salonlar, giriş ve kurulum süresi konusunda Schwenningen’deki ya da Baar beldelerindeki salonlardan farklı sorular sorar. İşte tam bu, akşamın kendisinde değil, mekânla yapılan ön görüşmede netleştirilir.',
        },
      },
      {
        question: {
          de: 'Auf der Baar kann es früh im Jahr und spät im Herbst schneien – ändert das etwas an der Planung?',
          en: 'On the Baar plateau it can snow early and late in the year — does that change the planning?',
          tr: 'Baar platosunda yılın erken ve geç aylarında kar yağabiliyor – bu planlamayı değiştirir mi?',
        },
        answer: {
          de: 'An der Feier nichts, an der Anreise ja: Die Hochebene gehört zu den kältesten Siedlungsräumen Deutschlands, und dorthin wird mit größerem Zeitpuffer gefahren als ins Neckartal. Aufbau und Soundcheck sind ohnehin lange vor dem ersten Gast abgeschlossen – ein früherer Start ist eine Planungsnotiz, keine Zusatzkosten.',
          en: 'Nothing about the celebration, but yes about the journey: the plateau is one of the coldest inhabited areas in Germany, and the drive up is scheduled with a bigger time buffer than a run into the Neckar valley. Setup and soundcheck are finished long before the first guest arrives anyway — an earlier start is a planning note, not an extra cost.',
          tr: 'Kutlamada hiçbir şeyi, yolculukta ise evet: Bu plato Almanya’nın en soğuk yerleşim bölgelerinden biridir ve oraya Neckar vadisine göre daha büyük bir zaman payıyla yola çıkılır. Kurulum ve ses denemesi zaten ilk misafirden çok önce bitmiş olur – daha erken yola çıkmak bir planlama notudur, ek bir masraf değil.',
        },
      },
    ],
  },
  {
    /**
     * Batch August 2026, Nachtrag (2026-08-16): vom Kunden ausdrücklich
     * angefragte Abdeckung — „auch wer in Lahr sucht, soll fündig werden".
     * Amtlich „Lahr/Schwarzwald"; Anzeigename bewusst kurz, der volle Name
     * steht in der Prosa. `distanceKm` per Haversine (48.3403, 7.8712).
     */
    slug: 'lahr',
    name: 'Lahr',
    region: 'Baden-Württemberg',
    distanceKm: 108,
    // TODO(kunde): Einwohnerzahl (~47–49 Tsd. laut Stadtverwaltung) vor
    // Veröffentlichung einer konkreten Zahl verifizieren — bis dahin null.
    population: null,
    priority: 2,
    turkishCommunity: false,
    nearby: ['offenburg', 'freiburg', 'baden-baden', 'karlsruhe'],
    travel: {
      included: false,
      note: {
        de: 'Lahr liegt mit rund 108 Kilometern Luftlinie außerhalb der anfahrtskostenfreien 50-km-Zone. Über die A5 ist die Stadt gut erreichbar; die Strecke wird im schriftlichen Angebot einzeln ausgewiesen. Endet die Feier spät, steht eine Übernachtung ebenfalls vorab im Angebot – kein Posten davon taucht erst auf der Rechnung auf.',
        en: 'At roughly 108 kilometres as the crow flies, Lahr is outside the 50 km travel-included zone. The city is easy to reach via the A5; the distance is itemised separately in the written quote. If the celebration ends late, an overnight stay is likewise quoted up front — none of it first appears on the invoice.',
        tr: 'Lahr, kuş uçuşu yaklaşık 108 kilometreyle ücretsiz ulaşımın geçerli olduğu 50 km’lik bölgenin dışında. A5 üzerinden şehre ulaşım kolay; mesafe yazılı teklifte ayrı olarak gösterilir. Kutlama geç bitiyorsa konaklama da önceden teklifte yer alır – hiçbir kalem ilk kez faturada ortaya çıkmaz.',
      },
    },
    // TODO(kunde): keine Hochzeitslocation verifiziert — lieber leer als
    // erfunden, dieselbe Regel wie bei Offenburg und Friedrichshafen.
    venues: [],
    intro: {
      de: 'Lahr – amtlich Lahr/Schwarzwald – liegt in der südlichen Ortenau zwischen Rheinebene und Schwarzwaldrand, direkt an der A5 zwischen Offenburg und Freiburg. Überregional bekannt ist die Stadt für die Chrysanthema, die den Herbst in ein Blumenfest verwandelt. Gefeiert wird hier oft nicht im Zentrum selbst, sondern in den Hallen und Höfen der umliegenden Gemeinden zwischen Reben und Waldrand – Räume, die selten eine eigene Veranstaltungstechnik haben.',
      en: 'Lahr — officially Lahr/Schwarzwald — sits in the southern Ortenau between the Rhine plain and the edge of the Black Forest, right on the A5 between Offenburg and Freiburg. Beyond the region the town is known for the Chrysanthema, which turns its autumn into a flower festival. Celebrations here often happen not in the centre itself but in the halls and courtyards of the surrounding villages between vineyards and forest edge — rooms that rarely come with their own event equipment.',
      tr: 'Lahr – resmî adıyla Lahr/Schwarzwald – güney Ortenau’da, Ren ovasıyla Karaorman eteği arasında, Offenburg ile Freiburg arasındaki A5 otoyolunun hemen üzerinde yer alıyor. Şehir, sonbaharı bir çiçek festivaline çeviren Chrysanthema ile bölge dışında da tanınıyor. Buradaki kutlamalar çoğu zaman merkezde değil, bağlarla orman kenarı arasındaki çevre beldelerin salonlarında ve avlularında yapılıyor – kendi etkinlik teknolojisi nadiren bulunan mekânlar.',
    },
    angle: {
      de: 'Wer rund um Lahr feiert, bucht selten einen Saal mit fest installierter Technik – die Halle im Ortsteil, der Winzerhof, das Bürgerhaus bringen Charme mit, aber keine Anlage. Genau dafür ist dieses Setup gebaut: Ton, Licht und Mikrofone reisen komplett aus Stuttgart mit und werden auf den Raum eingemessen, statt zu hoffen, was vor Ort steht. Die rund 108 Kilometer stehen als eigener Posten im Angebot – zusammen mit allem anderen, bevor Sie zusagen.',
      en: 'Around Lahr, couples rarely book a hall with fixed installed equipment — the village hall, the winegrower’s courtyard or the community house bring charm, but no rig. This setup is built for exactly that: sound, lighting and microphones travel along in full from Stuttgart and are tuned to the room, instead of hoping for whatever is on site. The roughly 108 kilometres appear as their own line in the quote — together with everything else, before you say yes.',
      tr: 'Lahr çevresinde kutlama yapanlar nadiren sabit ses düzeni olan bir salon kiralar – beldedeki salon, bağcı avlusu ya da halk evi kendine has bir hava taşır ama ses sistemi getirmez. Bu düzen tam bunun için kurulu: ses, ışık ve mikrofonlar Stuttgart’tan eksiksiz gelir ve mekâna göre ayarlanır; yerinde ne bulunacağına bel bağlanmaz. Yaklaşık 108 kilometre de teklifte ayrı bir kalem olarak yazılıdır – onay vermeden önce, diğer her şeyle birlikte.',
    },
    faq: [
      {
        question: {
          de: 'Lohnt sich ein DJ aus Stuttgart für eine Feier in Lahr – oder wird die Anfahrt zu teuer?',
          en: 'Is a DJ from Stuttgart worth it for a celebration in Lahr — or does the travel get too expensive?',
          tr: 'Lahr’daki bir kutlama için Stuttgart’tan DJ getirmeye değer mi – yol masrafı çok mu tutar?',
        },
        answer: {
          de: 'Die Anfahrt ist eine klar bezifferte Position, kein Kostenrisiko: Die rund 108 Kilometer liegen außerhalb der 50-km-Inklusivzone und stehen als eigener Posten im schriftlichen Angebot, bei sehr späten Feiern zusammen mit einer Übernachtung. Was Sie dafür bekommen, ist an jedem Ort gleich – dieselbe Anlage, dieselbe Vorbereitung, dieselbe Person am Pult.',
          en: 'Travel is a clearly priced line item, not a cost risk: the roughly 108 kilometres fall outside the 50 km included zone and appear as their own position in the written quote — together with an overnight stay for very late celebrations. What you get for it is the same in every town: the same rig, the same preparation, the same person behind the booth.',
          tr: 'Yol, bir maliyet riski değil, net rakamla yazılmış bir kalemdir: yaklaşık 108 kilometre, 50 km’lik ücretsiz bölgenin dışında kalır ve yazılı teklifte ayrı bir kalem olarak yer alır – çok geç biten kutlamalarda konaklamayla birlikte. Karşılığında aldığınız şey her yerde aynıdır: aynı ses sistemi, aynı hazırlık, kabinin başında aynı kişi.',
        },
      },
      {
        question: {
          de: 'Unsere Halle im Umland hat keine eigene Technik – reicht Ihre Anlage für den Raum?',
          en: 'Our hall outside town has no equipment of its own — is your rig enough for the room?',
          tr: 'Çevre beldedeki salonumuzun kendi ses düzeni yok – sizin sisteminiz salona yeter mi?',
        },
        answer: {
          de: 'Dafür ist sie da. Ton, Licht und Funkmikrofone kommen komplett mit und werden auf Größe und Akustik des Raums abgestimmt – vom Bürgerhaus bis zur Weinguthalle. Vorab werden mit der Location nur zwei Dinge geklärt: Strom und Zufahrt. Eine Anlage vor Ort ist nie Voraussetzung.',
          en: 'That is what it is for. Sound, lighting and wireless microphones all come along and are matched to the size and acoustics of the room — from a community house to a winery hall. Only two things are clarified with the venue in advance: power and access. Equipment on site is never a requirement.',
          tr: 'Zaten bunun için var. Ses, ışık ve telsiz mikrofonlar eksiksiz gelir ve salonun büyüklüğüyle akustiğine göre ayarlanır – halk evinden bağ evi salonuna kadar. Mekânla önceden yalnızca iki şey netleştirilir: elektrik ve araç girişi. Mekânda hazır bir ses düzeni hiçbir zaman şart değildir.',
        },
      },
      {
        question: {
          de: 'Kommen Sie auch in die Gemeinden rund um Lahr – etwa Friesenheim, Seelbach oder Ettenheim?',
          en: 'Do you also come to the villages around Lahr — Friesenheim, Seelbach or Ettenheim, say?',
          tr: 'Lahr çevresindeki beldelere de geliyor musunuz – örneğin Friesenheim, Seelbach ya da Ettenheim’a?',
        },
        answer: {
          de: 'Ja – für die Anfahrt zählt die Strecke, nicht der Ortsname. Ob die Feier in Lahr selbst, in Friesenheim oder weiter Richtung Ettenheim stattfindet, verschiebt das Angebot um wenige Kilometer, mehr nicht. Geben Sie bei der Anfrage einfach den Ort der Location an, dann steht die genaue Strecke im Angebot.',
          en: 'Yes — for travel it is the distance that counts, not the place name. Whether the celebration is in Lahr itself, in Friesenheim or further towards Ettenheim shifts the quote by a few kilometres, nothing more. Just name the venue’s village in your enquiry and the exact distance appears in the quote.',
          tr: 'Evet – yol için önemli olan mesafedir, yer adı değil. Kutlamanın Lahr’ın kendisinde, Friesenheim’da ya da Ettenheim yönünde olması teklifi yalnızca birkaç kilometre oynatır, o kadar. Talebinizde mekânın bulunduğu beldeyi yazmanız yeterli; kesin mesafe teklifte yer alır.',
        },
      },
    ],
  },
];

export interface PublishedCity extends City {
  /**
   * Locales this specific city page actually ships real, translated prose
   * for — computed once here via `getReadyLocalesForCity()` so
   * `generateStaticParams`, hreflang and `src/app/sitemap.ts` (which imports
   * `cities` and reads `city.locales`) can never disagree with each other.
   * Never `[]`: German prose is mandatory, so every published city has at
   * least `['de']`.
   */
  locales: Locale[];
}

/**
 * THE published, page/sitemap-facing city list. Only `priority <= 2`
 * entries, each enriched with the locales it genuinely has prose for.
 *
 * `src/app/sitemap.ts` (SEO agent's file) imports this exact export and
 * expects `{ slug: string; locales?: Locale[] }[]` — defaulting to every
 * configured locale when `locales` is missing. Never remove the `locales`
 * field or widen it beyond `getReadyLocalesForCity()`'s result: that's
 * exactly how 33 non-existent city URLs (priority-3 cities × all locales,
 * and every city × ku/fr/es) ended up in the sitemap before this fix.
 */
export const cities: PublishedCity[] = allCityEntries
  .filter((c) => c.priority <= 2)
  .map((c) => ({ ...c, locales: getReadyLocalesForCity(c) }))
  .filter((c) => c.locales.length > 0);

/** Alias kept for readability at call sites — identical to `cities`. */
export function getAllCities(): PublishedCity[] {
  return cities;
}

export function getCityBySlug(slug: string): PublishedCity | undefined {
  return cities.find((c) => c.slug === slug);
}

/** Löst `city.nearby`-Slugs zu echten, ausgespielten Städten auf (max. `limit`). */
export function getNearbyCities(city: City, limit = 4): PublishedCity[] {
  return city.nearby
    .map((slug) => getCityBySlug(slug))
    .filter((c): c is PublishedCity => Boolean(c))
    .slice(0, limit);
}
