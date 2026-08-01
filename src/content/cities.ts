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
 * TIER 1 (ausgespielt, `priority: 1`): Karlsruhe, Mannheim, Heilbronn,
 * Reutlingen, Pforzheim, Esslingen, Böblingen — die vom Recherche-Agent
 * bestätigte Liste. Stuttgart und Ludwigsburg sind bewusst NICHT in
 * diesem Batch (siehe Kommentare bei den jeweiligen Einträgen unten,
 * `priority: 3`) — Inhalt bleibt erhalten, `getAllCities()` blendet sie
 * nur aus, bis das Team sie bewusst wieder aufnimmt.
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
    nearby: ['esslingen', 'boeblingen', 'pforzheim'],
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
    nearby: ['karlsruhe', 'boeblingen', 'reutlingen'],
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
    nearby: ['pforzheim', 'mannheim', 'boeblingen'],
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
    nearby: ['karlsruhe', 'pforzheim'],
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
