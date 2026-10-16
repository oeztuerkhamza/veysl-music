import type { Locale } from '@/i18n/routing';

/**
 * Zielstädte der Türkisch-Nische: „Türkischer DJ {Stadt}" für die großen
 * Städte außerhalb der Kernregion — in Deutschland die sieben aus
 * `site.germanyCities`, im Ausland die Hauptstadt und eine weitere große
 * Stadt je Land aus `site.europeCountries`.
 * Route: `/tuerkischer-dj/[stadt]` (siehe `src/i18n/routing.ts`).
 *
 * ENTSCHEIDUNG DES BETREIBERS, 2026-10-16. Bis dahin galt das Gegenteil, und
 * zwar ausdrücklich dokumentiert: kein `/tuerkischer-dj/[stadt]`-Cluster
 * (routing.ts), keine europäischen Stadtseiten (docs/SEO-EUROPE-STRATEGY.md
 * §1), weil Seiten für Orte ohne belegbare lokale Substanz Doorway-Pages
 * wären. Der Betreiber will trotzdem, dass Menschen, die dort nach einem
 * türkischen DJ suchen, ihn finden. Dieses File setzt das um und hält die
 * Risiken so klein, wie es ehrlich geht:
 *
 *  - **Kein Track-Record, den es nicht gibt.** `verified` ist `true` für genau
 *    eine Stadt: Wien (`site.verifiedInternational`, Instagram-Highlight
 *    „Viyana"). Überall sonst heißt es „buchbar" und „wir reisen an", nie
 *    „regelmäßig gebucht", nie eine Referenz-Location, nie eine Zahl.
 *  - **Kein Lokal-Pack-Versprechen.** Das Markup trägt `areaServed: City`,
 *    die Texte sagen offen, dass DJ Veys in Stuttgart sitzt und anreist.
 *  - **Jede Seite hat eigenen Text.** `intro`, `route` und `faq` sind je Stadt
 *    geschrieben, nicht aus einer Vorlage mit getauschtem Namen erzeugt. Wo
 *    es keine nennenswerte türkische Community gibt (Rom, Madrid, Oslo …),
 *    steht das auch so da: Dort geht es um Destination Weddings und
 *    deutsch-türkische Paare mit Gästen, die einfliegen — nicht um eine
 *    Diaspora, die es nicht gibt.
 *  - **Nichts Nachprüfbares erfunden.** Stadtteile und Gemeinschaften nur,
 *    wo sie allgemein bekannt sind; sonst qualitativ. Keine Einwohnerzahlen,
 *    keine Prozentwerte, keine Locations.
 *  - **Abschaltbar.** `published: false` nimmt eine Stadt aus Sitemap,
 *    Static-Params und allen Links; `hasDestinationProse()` hält eine Stadt
 *    zurück, deren Texte zu dünn sind. Zeigt die Search Console „Gecrawlt –
 *    nicht indexiert" für viele dieser Seiten, ist das der Hebel.
 *
 * Nur de/tr/en (`TURKISH_DJ_SUPPORTED_LOCALES`): eine Nische, ein Schalter.
 */

export const DESTINATION_LOCALES = ['de', 'tr', 'en'] as const;
export type DestinationLocale = (typeof DESTINATION_LOCALES)[number];

export function isDestinationLocale(locale: Locale): locale is DestinationLocale {
  return (DESTINATION_LOCALES as readonly Locale[]).includes(locale);
}

export type L3 = Record<DestinationLocale, string>;

export type CountryKey = 'de' | 'at' | 'ch' | 'nl' | 'be' | 'lu' | 'fr' | 'it' | 'es' | 'dk' | 'se' | 'no';

export interface DestinationCountry {
  name: L3;
  /** Slug unter `/hochzeits-dj-europa/[land]`, wenn es dort eine Länderseite gibt. */
  regionSlug?: string;
}

export const destinationCountries: Record<CountryKey, DestinationCountry> = {
  de: { name: { de: 'Deutschland', tr: 'Almanya', en: 'Germany' } },
  at: { name: { de: 'Österreich', tr: 'Avusturya', en: 'Austria' }, regionSlug: 'oesterreich' },
  ch: { name: { de: 'Schweiz', tr: 'İsviçre', en: 'Switzerland' }, regionSlug: 'schweiz' },
  nl: { name: { de: 'Niederlande', tr: 'Hollanda', en: 'Netherlands' }, regionSlug: 'niederlande' },
  be: { name: { de: 'Belgien', tr: 'Belçika', en: 'Belgium' }, regionSlug: 'belgien' },
  lu: { name: { de: 'Luxemburg', tr: 'Lüksemburg', en: 'Luxembourg' } },
  fr: { name: { de: 'Frankreich', tr: 'Fransa', en: 'France' }, regionSlug: 'frankreich' },
  it: { name: { de: 'Italien', tr: 'İtalya', en: 'Italy' } },
  es: { name: { de: 'Spanien', tr: 'İspanya', en: 'Spain' } },
  dk: { name: { de: 'Dänemark', tr: 'Danimarka', en: 'Denmark' } },
  se: { name: { de: 'Schweden', tr: 'İsveç', en: 'Sweden' } },
  no: { name: { de: 'Norwegen', tr: 'Norveç', en: 'Norway' } },
};

/**
 * Wie die Anreise gedacht ist — steuert nur den gemeinsamen Absatz in den
 * Messages (`destination.travel.<class>`), nie eine Preisaussage:
 *  - `near`: Anreise am Veranstaltungstag ist realistisch.
 *  - `far`: eine Tagesreise mit dem Transporter, mit Übernachtung.
 *  - `flight`: Flug; Technik reist leicht mit oder wird vor Ort gemietet.
 */
export type TravelClass = 'near' | 'far' | 'flight';

export interface DestinationFaq {
  q: L3;
  a: L3;
}

export interface DestinationCity {
  /** Ein Slug für alle Sprachen, ASCII — `muenchen`, `zuerich`. */
  slug: string;
  name: L3;
  country: CountryKey;
  /** Hauptstadt des Landes? Steuert nur die Beschriftung. */
  capital: boolean;
  /** Luftlinie ab Stuttgart, auf 5 km gerundet (Haversine aus den Stadtkoordinaten). */
  distanceKm: number;
  travel: TravelClass;
  /** `true` nur für Wien — der einzige belegte Auftritt außerhalb Deutschlands. */
  verified?: boolean;
  /** Nimmt die Stadt aus Sitemap, Static-Params und Links, ohne die Daten zu löschen. */
  published: boolean;
  intro: L3;
  route: L3;
  faq: DestinationFaq;
}

export const destinationCities: DestinationCity[] = [
  // ── Deutschland ───────────────────────────────────────────────────────────
  {
    slug: 'muenchen',
    name: { de: 'München', tr: 'Münih', en: 'Munich' },
    country: 'de',
    capital: false,
    distanceKm: 190,
    travel: 'near',
    published: true,
    intro: {
      de: 'München hat eine seit Jahrzehnten gewachsene türkische Community, und viele Paare dort feiern zweisprachig: Familie aus der Türkei, Freunde aus Bayern. Für diesen Abend braucht es Halay und Pop im selben Set und eine Moderation, die beide Hälften des Saals mitnimmt – das ist, was DJ Veys aus Stuttgart nach München mitbringt.',
      tr: 'Münih’in onlarca yıldır büyüyen bir Türk topluluğu var ve oradaki birçok çift iki dilli kutlama yapıyor: Türkiye’den gelen aile, Bavyera’dan arkadaşlar. Bu akşam için aynı sette halay ile pop, salonun iki yarısını da yanına alan bir sunum gerekiyor – DJ Veys’in Stuttgart’tan Münih’e getirdiği tam olarak bu.',
      en: 'Munich has had a Turkish community for decades, and many couples there celebrate bilingually: family from Turkey, friends from Bavaria. That evening needs Halay and pop in the same set and a host who carries both halves of the room – which is what DJ Veys brings from Stuttgart to Munich.',
    },
    route: {
      de: 'Über die A8 liegt München rund zwei Stunden von Stuttgart entfernt. Aufbau und Soundcheck am Veranstaltungstag sind damit meist ohne Übernachtung machbar; bei Feiern bis in die Nacht wird sie im Angebot ausgewiesen.',
      tr: 'A8 otoyoluyla Münih, Stuttgart’tan yaklaşık iki saat uzaklıkta. Bu yüzden kurulum ve ses kontrolü etkinlik günü çoğunlukla konaklamasız yapılabilir; gece geç saate uzayan kutlamalarda konaklama teklifte ayrıca gösterilir.',
      en: 'Via the A8, Munich is about two hours from Stuttgart. Setup and sound check on the day usually work without an overnight stay; for celebrations that run late into the night, it is itemised in the quote.',
    },
    faq: {
      q: {
        de: 'Spielen Sie auch auf Hochzeiten im Umland von München?',
        tr: 'Münih çevresindeki düğünlerde de çalıyor musunuz?',
        en: 'Do you also play weddings around Munich?',
      },
      a: {
        de: 'Ja, das Einsatzgebiet beschränkt sich nicht auf das Stadtgebiet. Entscheidend ist der Veranstaltungsort: Entfernung und Aufbauzeit bestimmen, ob eine Übernachtung nötig ist, und das steht vor der Zusage im Angebot.',
        tr: 'Evet, hizmet bölgesi şehir sınırlarıyla sınırlı değil. Belirleyici olan etkinlik mekânıdır: mesafe ve kurulum süresi konaklamanın gerekip gerekmediğini belirler ve bu, onaydan önce teklifte yer alır.',
        en: 'Yes, the service area is not limited to the city itself. The venue decides: distance and setup time determine whether an overnight stay is needed, and that is in the quote before you commit.',
      },
    },
  },
  {
    slug: 'frankfurt',
    name: { de: 'Frankfurt', tr: 'Frankfurt', en: 'Frankfurt' },
    country: 'de',
    capital: false,
    distanceKm: 155,
    travel: 'near',
    published: true,
    intro: {
      de: 'Das Rhein-Main-Gebiet mit Frankfurt, Offenbach und Rüsselsheim gehört zu den Regionen, in denen türkische Familien seit Generationen leben und feiern. Wer dort eine Hochzeit, Kına oder Nişan plant, sucht häufig einen DJ, der Gelin Çıkarma und Davul-Zurna-Momente ebenso dramaturgisch führen kann wie den Eröffnungstanz.',
      tr: 'Frankfurt, Offenbach ve Rüsselsheim’ı kapsayan Ren-Main bölgesi, Türk ailelerin kuşaklardır yaşadığı ve kutlama yaptığı yerlerden. Orada düğün, kına ya da nişan planlayanlar çoğu kez gelin çıkarma ve davul-zurna anlarını da açılış dansı kadar dramaturjik yönetebilecek bir DJ arıyor.',
      en: 'The Rhine-Main area around Frankfurt, Offenbach and Rüsselsheim is one of the regions where Turkish families have lived and celebrated for generations. Couples planning a wedding, Kına or Nişan there often look for a DJ who can stage Gelin Çıkarma and Davul-Zurna moments as deliberately as the first dance.',
    },
    route: {
      de: 'Frankfurt gehört mit rund 155 km Luftlinie zu den nächstgelegenen großen Städten in unserer Liste. Die Anreise erfolgt mit dem Transporter über A5 oder A81/A6, am Veranstaltungstag und in der Regel ohne Übernachtung.',
      tr: 'Frankfurt, kuş uçuşu yaklaşık 155 km ile listemizdeki en yakın büyük şehirlerden biri. Ulaşım, A5 ya da A81/A6 üzerinden araçla, etkinlik günü ve kural olarak konaklamasız yapılır.',
      en: 'At about 155 km as the crow flies, Frankfurt is one of the closest large cities on our list. Travel is by van via the A5 or A81/A6, on the day of the event and usually without an overnight stay.',
    },
    faq: {
      q: {
        de: 'Kann ich Kına-Abend und Hochzeit in Frankfurt bei Ihnen zusammen buchen?',
        tr: 'Frankfurt’ta kına gecesi ile düğünü birlikte rezerve edebilir miyim?',
        en: 'Can I book the Kına evening and the wedding in Frankfurt together?',
      },
      a: {
        de: 'Ja. Beide Abende lassen sich in einer Anfrage planen; jeder Termin wird einzeln geprüft und im Angebot getrennt ausgewiesen, damit Sie sehen, was Anfahrt und was Programm kostet.',
        tr: 'Evet. İki akşam tek bir talepte planlanabilir; her tarih ayrı kontrol edilir ve teklifte ayrı gösterilir, böylece ulaşımın ve programın neye mal olduğunu görürsünüz.',
        en: 'Yes. Both evenings can be planned in one enquiry; each date is checked individually and itemised separately in the quote so you can see what travel and what programme cost.',
      },
    },
  },
  {
    slug: 'nuernberg',
    name: { de: 'Nürnberg', tr: 'Nürnberg', en: 'Nuremberg' },
    country: 'de',
    capital: false,
    distanceKm: 155,
    travel: 'near',
    published: true,
    intro: {
      de: 'Nürnberg, Fürth und Erlangen bilden eine Metropolregion mit einer gewachsenen türkischen Gemeinschaft – und mit Familien, die für eine Hochzeit aus ganz Franken, aus Süddeutschland und der Türkei zusammenkommen. Das verlangt einen Abend, der Großfamilie und Freundeskreis gleichermaßen trägt, vom Kına bis zur Tanzfläche.',
      tr: 'Nürnberg, Fürth ve Erlangen, köklü bir Türk topluluğuna sahip bir metropol bölge oluşturuyor – ve bir düğün için Franken’in her yerinden, Güney Almanya’dan ve Türkiye’den bir araya gelen aileler var. Bu, kınadan dans pistine kadar hem geniş aileyi hem arkadaş çevresini taşıyan bir akşam gerektiriyor.',
      en: 'Nuremberg, Fürth and Erlangen form a metropolitan region with an established Turkish community – and families who gather for a wedding from across Franconia, southern Germany and Turkey. That calls for an evening that carries the extended family and the circle of friends alike, from Kına to the dance floor.',
    },
    route: {
      de: 'Nürnberg liegt gut 150 km Luftlinie von Stuttgart entfernt, die A6 führt direkt hin. Aufbau und Soundcheck lassen sich am Veranstaltungstag einplanen; Technik und Moderation reisen komplett mit.',
      tr: 'Nürnberg, Stuttgart’a kuş uçuşu 150 km’den biraz fazla; A6 oraya doğrudan çıkıyor. Kurulum ve ses kontrolü etkinlik günü planlanabilir; teknik donanım ve sunum eksiksiz birlikte gelir.',
      en: 'Nuremberg is just over 150 km as the crow flies from Stuttgart, and the A6 leads straight there. Setup and sound check can be planned for the day of the event; equipment and hosting travel complete.',
    },
    faq: {
      q: {
        de: 'Ist die Moderation in Nürnberg auch zweisprachig möglich?',
        tr: 'Nürnberg’de sunum iki dilli yapılabilir mi?',
        en: 'Can the hosting in Nuremberg be bilingual?',
      },
      a: {
        de: 'Ja. Live moderiert wird auf Deutsch, Türkisch und Englisch, auch gemischt innerhalb eines Abends – etwa Begrüßung auf beiden Sprachen und Programmpunkte für die jeweils passende Hälfte des Saals.',
        tr: 'Evet. Canlı sunum Almanca, Türkçe ve İngilizce yapılır, hatta bir akşam içinde karışık da olabilir – örneğin karşılama iki dilde, program noktaları ise salonun ilgili yarısına uygun dilde.',
        en: 'Yes. Live hosting is in German, Turkish and English, and can mix within one evening – for example the welcome in both languages and programme points in whichever language suits that half of the room.',
      },
    },
  },
  {
    slug: 'koeln',
    name: { de: 'Köln', tr: 'Köln', en: 'Cologne' },
    country: 'de',
    capital: false,
    distanceKm: 290,
    travel: 'far',
    published: true,
    intro: {
      de: 'Köln ist die Stadt der Keupstraße in Mülheim – für viele Deutschtürken ein Stück Heimat und Anlaufpunkt für alles, was zur Hochzeit gehört. Im Raum Köln, Bonn und Leverkusen wird groß gefeiert, mit Sälen für mehrere hundert Gäste, und dort zählt ein DJ, der Tempo und Dramaturgie eines solchen Abends hält.',
      tr: 'Köln, Mülheim’daki Keupstraße’nin şehri – birçok Almanyalı Türk için bir parça memleket ve düğünle ilgili her şeyin uğrak noktası. Köln, Bonn ve Leverkusen çevresinde büyük kutlamalar yapılıyor, birkaç yüz kişilik salonlarla; orada böyle bir akşamın temposunu ve dramaturjisini koruyan bir DJ önem taşıyor.',
      en: 'Cologne is the city of the Keupstraße in Mülheim – for many German Turks a piece of home and a first stop for everything a wedding needs. Around Cologne, Bonn and Leverkusen celebrations are big, with halls for several hundred guests, and what matters there is a DJ who keeps the pace and staging of such an evening.',
    },
    route: {
      de: 'Köln liegt knapp 290 km Luftlinie entfernt, die A61 am Rhein entlang bringt den Transporter in rund dreieinhalb Stunden hin. Für Feiern, die in den frühen Morgen gehen, planen wir eine Übernachtung ein und weisen sie im Angebot aus.',
      tr: 'Köln kuş uçuşu yaklaşık 290 km uzakta; Ren boyunca A61 araç ile yaklaşık üç buçuk saatte ulaştırır. Sabaha kadar süren kutlamalar için konaklama planlarız ve teklifte gösteririz.',
      en: 'Cologne is just under 290 km as the crow flies, and the A61 along the Rhine gets the van there in roughly three and a half hours. For celebrations that run into the early morning we plan an overnight stay and itemise it in the quote.',
    },
    faq: {
      q: {
        de: 'Reisen Sie für eine große Feier mit 300 Gästen nach Köln?',
        tr: '300 kişilik büyük bir kutlama için Köln’e gelir misiniz?',
        en: 'Do you travel to Cologne for a large celebration with 300 guests?',
      },
      a: {
        de: 'Ja. Für große Säle wird die Technik passend dimensioniert; Beschallung, Licht und Aufbauzeit werden im Vorgespräch mit Ihnen und der Location abgestimmt, nicht pauschal angenommen.',
        tr: 'Evet. Büyük salonlar için teknik donanım uygun boyutlandırılır; ses, ışık ve kurulum süresi sizinle ve mekânla yapılan ön görüşmede netleştirilir, genellenmez.',
        en: 'Yes. For large halls the equipment is sized accordingly; sound, lighting and setup time are agreed in the planning call with you and the venue, not assumed.',
      },
    },
  },
  {
    slug: 'duesseldorf',
    name: { de: 'Düsseldorf', tr: 'Düsseldorf', en: 'Düsseldorf' },
    country: 'de',
    capital: false,
    distanceKm: 320,
    travel: 'far',
    published: true,
    intro: {
      de: 'Düsseldorf liegt mitten im Rhein-Ruhr-Gebiet, der Region mit der größten Dichte türkischer Familien in Deutschland – Duisburg, Neuss und Essen sind nur eine Autofahrt entfernt. Wer dort feiert, hat Gäste aus mehreren Städten und oft zwei Generationen mit sehr unterschiedlichem Musikgeschmack im Saal.',
      tr: 'Düsseldorf, Almanya’da Türk ailelerin en yoğun yaşadığı bölge olan Ren-Ruhr’un tam ortasında – Duisburg, Neuss ve Essen sadece bir araba yolculuğu uzaklıkta. Orada kutlama yapanların birkaç şehirden misafirleri var ve salonda çoğu kez müzik zevki çok farklı iki kuşak bulunuyor.',
      en: 'Düsseldorf sits in the middle of the Rhine-Ruhr area, the region with the densest concentration of Turkish families in Germany – Duisburg, Neuss and Essen are a short drive away. Couples celebrating there have guests from several cities and often two generations with very different music tastes in the room.',
    },
    route: {
      de: 'Düsseldorf liegt rund 320 km Luftlinie von Stuttgart entfernt; die Fahrt mit dem Transporter dauert gut vier Stunden. Ab dieser Entfernung gehört eine Übernachtung zur Planung, die Kosten stehen vor der Zusage im Angebot.',
      tr: 'Düsseldorf, Stuttgart’a kuş uçuşu yaklaşık 320 km; araçla yolculuk dört saati biraz aşar. Bu mesafeden itibaren konaklama planın bir parçasıdır, maliyet onaydan önce teklifte yer alır.',
      en: 'Düsseldorf is about 320 km as the crow flies from Stuttgart; the drive by van takes a little over four hours. From this distance an overnight stay is part of the plan, and the cost is in the quote before you commit.',
    },
    faq: {
      q: {
        de: 'Wie läuft das mit zwei Generationen und gemischtem Musikgeschmack?',
        tr: 'İki kuşak ve karışık müzik zevkiyle nasıl ilerliyorsunuz?',
        en: 'How do you handle two generations with mixed music tastes?',
      },
      a: {
        de: 'Im Vorgespräch klären wir, was für die ältere Generation unverzichtbar ist und was die jüngeren Gäste hören wollen. Daraus entsteht ein Ablauf, der Halay, Klassiker und aktuelle Musik so staffelt, dass kein Teil des Saals zum Zuschauer wird.',
        tr: 'Ön görüşmede, yaşlı kuşak için vazgeçilmezin ne olduğunu ve genç misafirlerin ne dinlemek istediğini netleştiririz. Buradan halayı, klasikleri ve güncel müziği öyle sıralayan bir akış çıkar ki salonun hiçbir kısmı seyirciye dönüşmez.',
        en: 'In the planning call we clarify what the older generation cannot do without and what the younger guests want to hear. From that comes a running order that stages Halay, classics and current music so that no part of the room ends up just watching.',
      },
    },
  },
  {
    slug: 'hamburg',
    name: { de: 'Hamburg', tr: 'Hamburg', en: 'Hamburg' },
    country: 'de',
    capital: false,
    distanceKm: 535,
    travel: 'far',
    published: true,
    intro: {
      de: 'Hamburg hat eine große, seit den 1960ern gewachsene türkische Community, in Stadtteilen wie Wilhelmsburg und Harburg ebenso wie in der ganzen Metropolregion. Die Feiern dort sind oft Treffen von Familien aus dem Norden und der Türkei – und verlangen einen DJ, der zwischen Halay und Hafenstadt-Partymusik nicht umschalten muss, sondern beides kann.',
      tr: 'Hamburg’un 1960’lardan beri büyüyen büyük bir Türk topluluğu var – Wilhelmsburg ve Harburg gibi semtlerde de, tüm metropol bölgede de. Oradaki kutlamalar çoğu kez kuzeyden ve Türkiye’den ailelerin buluşması; halay ile liman şehri parti müziği arasında geçiş yapmak zorunda kalmayan, ikisini de bilen bir DJ gerektiriyor.',
      en: 'Hamburg has a large Turkish community that has grown since the 1960s, in districts such as Wilhelmsburg and Harburg as well as across the metropolitan region. Celebrations there are often gatherings of families from the north and from Turkey – and call for a DJ who does not have to switch between Halay and port-city party music but can do both.',
    },
    route: {
      de: 'Hamburg ist rund 535 km Luftlinie von Stuttgart entfernt – eine ganze Tagesfahrt mit dem Transporter. Wir reisen am Vortag oder am Morgen an und weisen Fahrtstrecke und Übernachtung im Angebot einzeln aus.',
      tr: 'Hamburg, Stuttgart’a kuş uçuşu yaklaşık 535 km – araçla tam bir günlük yolculuk. Bir gün önce ya da sabah gelir, yol mesafesi ile konaklamayı teklifte ayrı ayrı gösteririz.',
      en: 'Hamburg is about 535 km as the crow flies from Stuttgart – a full day’s drive by van. We travel the day before or in the morning and itemise distance and overnight stay separately in the quote.',
    },
    faq: {
      q: {
        de: 'Lohnt sich ein Auswärts-DJ aus Stuttgart für Hamburg überhaupt?',
        tr: 'Stuttgart’tan gelen bir DJ Hamburg için gerçekten mantıklı mı?',
        en: 'Does a DJ from Stuttgart make sense for Hamburg at all?',
      },
      a: {
        de: 'Das entscheiden Sie anhand des Angebots: Anfahrt und Übernachtung stehen als eigene Posten darin, nicht versteckt im Preis. Wer ein bestimmtes Programm sucht – türkisches Repertoire, Gelin Çıkarma, Moderation auf Türkisch und Deutsch aus einer Hand –, findet das nicht überall vor Ort.',
        tr: 'Buna teklife bakarak siz karar verirsiniz: ulaşım ve konaklama fiyatın içine gizlenmeden ayrı kalemler olarak orada durur. Belirli bir program arayanlar – Türk repertuvarı, gelin çıkarma, Türkçe ve Almanca sunumun tek elden – bunu her yerde bulamayabilir.',
        en: 'You decide that from the quote: travel and accommodation appear as separate line items rather than hidden in the price. If you are looking for a specific programme – Turkish repertoire, Gelin Çıkarma, hosting in Turkish and German from one person – you do not always find that locally.',
      },
    },
  },
  {
    slug: 'berlin',
    name: { de: 'Berlin', tr: 'Berlin', en: 'Berlin' },
    country: 'de',
    capital: true,
    distanceKm: 510,
    travel: 'far',
    published: true,
    intro: {
      de: 'Berlin hat eine der größten türkischen Gemeinden außerhalb der Türkei, mit Schwerpunkten in Kreuzberg, Neukölln und Wedding. Hochzeiten fallen hier so groß und so unterschiedlich aus wie die Stadt: klassisch türkisch, deutsch-türkisch, international. Gesucht wird ein DJ, der alle drei Varianten fahren kann.',
      tr: 'Berlin’in Türkiye dışındaki en büyük Türk topluluklarından biri var; ağırlık noktaları Kreuzberg, Neukölln ve Wedding. Düğünler burada şehir kadar büyük ve çeşitli: klasik Türk, Alman-Türk, uluslararası. Bu üç biçimi de yönetebilecek bir DJ aranıyor.',
      en: 'Berlin has one of the largest Turkish communities outside Turkey, with centres in Kreuzberg, Neukölln and Wedding. Weddings here come as big and as varied as the city: classically Turkish, German-Turkish, international. What is sought is a DJ who can run all three.',
    },
    route: {
      de: 'Berlin ist mit rund 510 km Luftlinie die weiteste deutsche Stadt in dieser Liste; die Fahrt mit dem Transporter dauert ungefähr sechs Stunden. Wir reisen am Vortag an, Technik und Moderation kommen vollständig mit.',
      tr: 'Berlin, kuş uçuşu yaklaşık 510 km ile bu listedeki en uzak Alman şehri; araçla yolculuk yaklaşık altı saat sürer. Bir gün önce gelir, teknik donanım ve sunum eksiksiz birlikte gelir.',
      en: 'At about 510 km as the crow flies, Berlin is the furthest German city on this list; the drive by van takes roughly six hours. We arrive the day before, and equipment and hosting come complete.',
    },
    faq: {
      q: {
        de: 'Können Sie bei einer deutsch-türkischen Hochzeit in Berlin beide Seiten abholen?',
        tr: 'Berlin’deki bir Alman-Türk düğününde iki tarafı da yakalayabilir misiniz?',
        en: 'Can you reach both sides at a German-Turkish wedding in Berlin?',
      },
      a: {
        de: 'Das ist der Kern des Angebots: zwei Familien, zwei Sprachen, ein Abend. Der Ablauf wird mit beiden Seiten abgestimmt, die Moderation wechselt zwischen Deutsch, Türkisch und Englisch.',
        tr: 'Teklifin özü bu: iki aile, iki dil, tek bir akşam. Akış iki tarafla birlikte netleştirilir, sunum Almanca, Türkçe ve İngilizce arasında geçiş yapar.',
        en: 'That is the core of the offer: two families, two languages, one evening. The running order is agreed with both sides, and hosting switches between German, Turkish and English.',
      },
    },
  },

  // ── Österreich ────────────────────────────────────────────────────────────
  {
    slug: 'wien',
    name: { de: 'Wien', tr: 'Viyana', en: 'Vienna' },
    country: 'at',
    capital: true,
    distanceKm: 535,
    travel: 'far',
    verified: true,
    published: true,
    intro: {
      de: 'Wien ist der Ort außerhalb Deutschlands, an dem DJ Veys nachweislich gespielt hat – zu sehen im Instagram-Highlight „Viyana". In Stadtteilen wie Favoriten und Ottakring lebt eine große türkische Community, und viele Familien feiern in Wien auf deutsch-türkische Art. Hier ist die Anreise kein Versprechen, sondern erprobt.',
      tr: 'Viyana, DJ Veys’in Almanya dışında kanıtlanmış şekilde çaldığı yer – Instagram’daki “Viyana” öne çıkanında görülebilir. Favoriten ve Ottakring gibi semtlerde büyük bir Türk topluluğu yaşıyor ve birçok aile Viyana’da Alman-Türk tarzı kutlama yapıyor. Burada ulaşım bir vaat değil, denenmiş bir şey.',
      en: 'Vienna is the place outside Germany where DJ Veys has verifiably played – visible in the Instagram highlight “Viyana”. A large Turkish community lives in districts such as Favoriten and Ottakring, and many families celebrate in Vienna in a German-Turkish way. Here the journey is not a promise but proven.',
    },
    route: {
      de: 'Wien liegt rund 535 km Luftlinie von Stuttgart entfernt; die Fahrt führt über München und Salzburg. Anfahrt und Übernachtung stehen im Angebot als eigene Posten. Österreich ist EU-Land: Schuko-Steckdosen, 230 V, keine Zollformalitäten für die Technik.',
      tr: 'Viyana, Stuttgart’a kuş uçuşu yaklaşık 535 km; yol Münih ve Salzburg üzerinden geçer. Ulaşım ve konaklama teklifte ayrı kalemler olarak yer alır. Avusturya AB ülkesidir: Schuko prizler, 230 V, ekipman için gümrük formalitesi yok.',
      en: 'Vienna is about 535 km as the crow flies from Stuttgart; the route runs via Munich and Salzburg. Travel and accommodation appear as separate line items in the quote. Austria is an EU country: Schuko sockets, 230 V, no customs formalities for the equipment.',
    },
    faq: {
      q: {
        de: 'Haben Sie schon einmal in Wien gespielt?',
        tr: 'Daha önce Viyana’da çaldınız mı?',
        en: 'Have you played in Vienna before?',
      },
      a: {
        de: 'Ja. Der Auftritt in Wien ist der nachweisliche Auftritt außerhalb Deutschlands und im Instagram-Highlight „Viyana" dokumentiert. Für andere Städte gilt: buchbar, aber ohne eigenes Referenz-Event.',
        tr: 'Evet. Viyana’daki gösteri Almanya dışındaki kanıtlanmış gösteridir ve Instagram’daki “Viyana” öne çıkanında belgelenmiştir. Diğer şehirler için: rezervasyona açık, ancak kendine ait bir referans etkinlik yok.',
        en: 'Yes. The Vienna booking is the verifiable one outside Germany and is documented in the Instagram highlight “Viyana”. For other cities: available to book, but without a reference event of their own.',
      },
    },
  },
  {
    slug: 'graz',
    name: { de: 'Graz', tr: 'Graz', en: 'Graz' },
    country: 'at',
    capital: false,
    distanceKm: 505,
    travel: 'far',
    published: true,
    intro: {
      de: 'Graz ist die zweitgrößte Stadt Österreichs und hat eine überschaubare, aber lebendige türkische Community. Hier feiern oft Familien, die sich über Österreich, Deutschland und die Türkei verteilen, und ein Wochenende in der Steiermark wird dann zum Familientreffen mit Hochzeit.',
      tr: 'Graz, Avusturya’nın ikinci büyük şehri ve küçük ama canlı bir Türk topluluğuna sahip. Burada çoğu kez Avusturya’ya, Almanya’ya ve Türkiye’ye dağılmış aileler kutlama yapıyor; Steiermark’ta bir hafta sonu, düğünlü bir aile buluşmasına dönüşüyor.',
      en: 'Graz is Austria’s second-largest city and has a modest but lively Turkish community. Families that are spread across Austria, Germany and Turkey often celebrate here, and a weekend in Styria becomes a family reunion with a wedding.',
    },
    route: {
      de: 'Graz liegt rund 505 km Luftlinie entfernt; die Fahrt über München und Salzburg dauert mit dem Transporter gut sechs Stunden. Wir reisen am Vortag an und weisen die Übernachtung im Angebot einzeln aus. Österreich ist EU-Land – die Technik reist ohne Zollformalitäten.',
      tr: 'Graz kuş uçuşu yaklaşık 505 km uzakta; Münih ve Salzburg üzerinden araçla yolculuk altı saati biraz aşar. Bir gün önce gelir, konaklamayı teklifte ayrı gösteririz. Avusturya AB ülkesidir – ekipman gümrük formalitesi olmadan yolculuk eder.',
      en: 'Graz is about 505 km as the crow flies; the drive via Munich and Salzburg takes a little over six hours by van. We arrive the day before and itemise the overnight stay separately in the quote. Austria is an EU country – the equipment travels without customs formalities.',
    },
    faq: {
      q: {
        de: 'Ist Graz für eine Anfrage nicht zu weit weg?',
        tr: 'Graz bir talep için fazla uzak değil mi?',
        en: 'Is Graz not too far away for an enquiry?',
      },
      a: {
        de: 'Nein, aber es ist eine Reise, und so wird sie auch behandelt: Fahrtstrecke und Übernachtung stehen als eigene Posten im Angebot, bevor Sie etwas zusagen. Vorab schicken wir keine Pauschale, sondern eine nachvollziehbare Rechnung.',
        tr: 'Hayır, ama bu bir yolculuk ve öyle ele alınır: yol mesafesi ve konaklama, siz bir şeyi onaylamadan önce teklifte ayrı kalemler olarak yer alır. Peşin bir götürü bedel değil, anlaşılır bir hesap göndeririz.',
        en: 'No, but it is a journey and is treated as one: distance and overnight stay are separate items in the quote before you commit to anything. We do not send a flat figure but a calculation you can follow.',
      },
    },
  },

  // ── Schweiz ───────────────────────────────────────────────────────────────
  {
    slug: 'bern',
    name: { de: 'Bern', tr: 'Bern', en: 'Bern' },
    country: 'ch',
    capital: true,
    distanceKm: 240,
    travel: 'far',
    published: true,
    intro: {
      de: 'Bern ist die Bundesstadt der Schweiz und Treffpunkt für Familien aus dem ganzen Mittelland. Die türkische Community im Land ist über Zürich, Basel und Bern verteilt, und Hochzeiten bringen Gäste aus allen drei zusammen. Dazu kommen Freunde, die Hochdeutsch und Berndeutsch sprechen – eine Moderation auf Deutsch, Türkisch und Englisch deckt beides ab.',
      tr: 'Bern, İsviçre’nin federal şehri ve tüm Orta Plato’dan ailelerin buluşma noktası. Ülkedeki Türk topluluğu Zürih, Basel ve Bern’e dağılmış durumda ve düğünler üç şehirden misafirleri bir araya getiriyor. Bir de standart Almanca ve Bern Almancası konuşan arkadaşlar var – Almanca, Türkçe ve İngilizce sunum ikisini de karşılıyor.',
      en: 'Bern is Switzerland’s federal city and a meeting point for families from across the Mittelland. The country’s Turkish community is spread over Zurich, Basel and Bern, and weddings bring guests from all three together. Add friends who speak standard German and Bernese German – hosting in German, Turkish and English covers both.',
    },
    route: {
      de: 'Bern liegt rund 240 km Luftlinie von Stuttgart entfernt, die Fahrt führt über Karlsruhe und Basel. Die Schweiz ist nicht in der EU-Zollunion: Für die Technik wird ein ATA-Carnet fällig, ein planbarer Vorgang, den wir vorbereiten. Abgerechnet wird auf Wunsch in Franken.',
      tr: 'Bern, Stuttgart’a kuş uçuşu yaklaşık 240 km; yol Karlsruhe ve Basel üzerinden geçer. İsviçre AB gümrük birliğinde değildir: ekipman için ATA Karnesi gerekir, planlanabilir bir süreç; hazırlığı biz yaparız. İsteğe bağlı olarak frank cinsinden faturalandırılır.',
      en: 'Bern is about 240 km as the crow flies from Stuttgart, with the route via Karlsruhe and Basel. Switzerland is outside the EU customs union: the equipment needs an ATA Carnet, a plannable procedure that we prepare. On request we bill in francs.',
    },
    faq: {
      q: {
        de: 'Wie funktioniert der Zoll für die Technik in der Schweiz?',
        tr: 'İsviçre’de ekipman için gümrük nasıl işliyor?',
        en: 'How does customs work for the equipment in Switzerland?',
      },
      a: {
        de: 'Mitgeführte Technik wird mit einem ATA-Carnet vorübergehend ein- und wieder ausgeführt. Das ist ein bekanntes Verfahren für Berufsausrüstung; es kostet Vorbereitungszeit, ist aber kein Hindernis. Die Kosten stehen im Angebot.',
        tr: 'Taşınan ekipman, bir ATA Karnesi ile geçici olarak ithal ve ihraç edilir. Bu, mesleki ekipman için bilinen bir yöntemdir; hazırlık süresi alır ama engel değildir. Maliyetler teklifte yer alır.',
        en: 'Equipment brought along is temporarily imported and re-exported with an ATA Carnet. It is a well-known procedure for professional gear; it takes preparation time but is no obstacle. The costs are in the quote.',
      },
    },
  },
  {
    slug: 'zuerich',
    name: { de: 'Zürich', tr: 'Zürih', en: 'Zurich' },
    country: 'ch',
    capital: false,
    distanceKm: 165,
    travel: 'near',
    published: true,
    intro: {
      de: 'Zürich liegt näher an Stuttgart als Köln, Hamburg oder Berlin – und ist die größte Stadt der Schweiz mit einer gewachsenen türkischen Community. Wer dort türkisch oder deutsch-türkisch feiert, sucht oft einen DJ, der Halay ebenso sicher auflegt wie Schweizer und internationale Hits, und der durch den Abend führt, ohne dass eine Familienseite das Nachsehen hat.',
      tr: 'Zürih, Stuttgart’a Köln, Hamburg ya da Berlin’den daha yakın – ve İsviçre’nin en büyük şehri, köklü bir Türk topluluğuyla. Orada Türk ya da Alman-Türk kutlama yapanlar çoğu kez halayı İsviçre ve uluslararası hitler kadar güvenle çalan ve akşamı, bir aile tarafı geride kalmadan yöneten bir DJ arıyor.',
      en: 'Zurich is closer to Stuttgart than Cologne, Hamburg or Berlin – and is Switzerland’s largest city, with an established Turkish community. Couples who celebrate Turkish or German-Turkish there often look for a DJ who plays Halay as confidently as Swiss and international hits and who leads through the evening without one side of the family being left behind.',
    },
    route: {
      de: 'Rund 165 km Luftlinie trennen Stuttgart und Zürich; die Fahrt über die A81 ist oft an einem Tag machbar. Die Schweiz ist nicht in der EU-Zollunion: Für die Technik wird ein ATA-Carnet fällig, den wir vorbereiten. Lautstärkeauflagen sind in Schweizer Gemeinden oft strenger – wir klären sie vorab mit der Location.',
      tr: 'Stuttgart ile Zürih arasında kuş uçuşu yaklaşık 165 km var; A81 üzerinden yolculuk çoğu kez tek günde yapılabilir. İsviçre AB gümrük birliğinde değildir: ekipman için ATA Karnesi gerekir, hazırlığı biz yaparız. İsviçre belediyelerinde ses kısıtlamaları sıklıkla daha sıkıdır – bunları önceden mekânla netleştiririz.',
      en: 'About 165 km as the crow flies separate Stuttgart and Zurich; the drive via the A81 is often manageable in one day. Switzerland is outside the EU customs union: the equipment needs an ATA Carnet, which we prepare. Noise rules are often stricter in Swiss municipalities – we clarify them with the venue in advance.',
    },
    faq: {
      q: {
        de: 'Ist die Anreise nach Zürich wirklich kürzer als nach Berlin?',
        tr: 'Zürih’e ulaşım gerçekten Berlin’den daha kısa mı?',
        en: 'Is getting to Zurich really shorter than getting to Berlin?',
      },
      a: {
        de: 'Ja: rund 165 km Luftlinie gegenüber etwa 510 km nach Berlin. Das senkt die Anfahrtskosten spürbar, bringt aber den Zoll für die Technik mit – beides steht getrennt im Angebot.',
        tr: 'Evet: Berlin’e yaklaşık 510 km’ye karşılık kuş uçuşu yaklaşık 165 km. Bu ulaşım maliyetini belirgin biçimde düşürür, ancak ekipman için gümrüğü de getirir – ikisi de teklifte ayrı yer alır.',
        en: 'Yes: about 165 km as the crow flies versus roughly 510 km to Berlin. That lowers the travel cost noticeably but brings customs for the equipment – both are shown separately in the quote.',
      },
    },
  },

  // ── Niederlande ───────────────────────────────────────────────────────────
  {
    slug: 'amsterdam',
    name: { de: 'Amsterdam', tr: 'Amsterdam', en: 'Amsterdam' },
    country: 'nl',
    capital: true,
    distanceKm: 500,
    travel: 'far',
    published: true,
    intro: {
      de: 'Amsterdam ist die Hauptstadt der Niederlande, und in Vierteln wie Amsterdam-West und Nieuw-West gehört die türkische und kurdische Community seit Jahrzehnten zum Stadtbild. Für türkische Hochzeiten dort ist ein DJ gefragt, der Halay und internationale Popmusik gleichermaßen sicher mischt und auf Türkisch, Deutsch und Englisch moderiert.',
      tr: 'Amsterdam Hollanda’nın başkenti ve Amsterdam-West ile Nieuw-West gibi mahallelerde Türk ve Kürt topluluğu onlarca yıldır şehir manzarasının parçası. Oradaki Türk düğünleri için halayı ve uluslararası pop müziği aynı özgüvenle karıştıran, Türkçe, Almanca ve İngilizce sunum yapan bir DJ aranıyor.',
      en: 'Amsterdam is the capital of the Netherlands, and in districts such as Amsterdam-West and Nieuw-West the Turkish and Kurdish community has been part of the cityscape for decades. For Turkish weddings there, a DJ is in demand who mixes Halay and international pop with equal confidence and hosts in Turkish, German and English.',
    },
    route: {
      de: 'Amsterdam liegt rund 500 km Luftlinie von Stuttgart entfernt; die Fahrt über Köln und Arnheim dauert mit dem Transporter etwa sechs Stunden. Die Niederlande nutzen Schuko-Steckdosen und 230 V – technisch unkompliziert. Die Lärmschutzauflagen sind dort oft enger gefasst, wir klären sie vorab mit der Location.',
      tr: 'Amsterdam, Stuttgart’a kuş uçuşu yaklaşık 500 km; Köln ve Arnhem üzerinden araçla yolculuk yaklaşık altı saat sürer. Hollanda Schuko prizleri ve 230 V kullanır – teknik olarak sorunsuz. Gürültü kuralları orada çoğu kez daha dardır, bunları önceden mekânla netleştiririz.',
      en: 'Amsterdam is about 500 km as the crow flies from Stuttgart; the drive via Cologne and Arnhem takes roughly six hours by van. The Netherlands uses Schuko sockets and 230 V – technically straightforward. Noise rules there are often tighter, so we clarify them with the venue in advance.',
    },
    faq: {
      q: {
        de: 'Moderieren Sie in Amsterdam auch auf Niederländisch?',
        tr: 'Amsterdam’da Felemenkçe sunum da yapıyor musunuz?',
        en: 'Do you also host in Dutch in Amsterdam?',
      },
      a: {
        de: 'Nein. Live moderiert wird auf Deutsch, Türkisch und Englisch. Für Feiern in den Niederlanden ist das oft genau die passende Kombination, wenn Familie aus Deutschland und der Türkei dabei ist; ein rein niederländischsprachiges Publikum sollte es wissen.',
        tr: 'Hayır. Canlı sunum Almanca, Türkçe ve İngilizce yapılır. Hollanda’daki kutlamalar için, Almanya ve Türkiye’den aile de katılıyorsa bu çoğu kez tam uygun kombinasyondur; yalnızca Felemenkçe konuşan bir kitle bunu bilmeli.',
        en: 'No. Live hosting is in German, Turkish and English. For celebrations in the Netherlands that is often exactly the right combination when family from Germany and Turkey is present; a purely Dutch-speaking audience should know.',
      },
    },
  },
  {
    slug: 'rotterdam',
    name: { de: 'Rotterdam', tr: 'Rotterdam', en: 'Rotterdam' },
    country: 'nl',
    capital: false,
    distanceKm: 485,
    travel: 'far',
    published: true,
    intro: {
      de: 'Rotterdam ist die zweitgrößte Stadt der Niederlande und eine der Städte, in denen türkische Familien am sichtbarsten leben. Die Hafenstadt hat eine lange Geschichte als Zuzugsort, und dort wird groß und laut gefeiert. Gesucht wird ein DJ, der eine solche Feier trägt und die zweisprachigen Programmpunkte nicht dem Zufall überlässt.',
      tr: 'Rotterdam, Hollanda’nın ikinci büyük şehri ve Türk ailelerin en görünür yaşadığı şehirlerden biri. Liman şehrinin göç alan bir yer olarak uzun bir geçmişi var ve orada büyük ve gürültülü kutlama yapılır. Böyle bir kutlamayı taşıyan ve iki dilli program noktalarını tesadüfe bırakmayan bir DJ aranıyor.',
      en: 'Rotterdam is the second-largest city in the Netherlands and one of the cities where Turkish families are most visible. The port city has a long history as a place of arrival, and celebrations there are big and loud. What is sought is a DJ who carries such a celebration and does not leave the bilingual programme points to chance.',
    },
    route: {
      de: 'Rotterdam liegt rund 485 km Luftlinie entfernt, die Fahrt über Köln und Eindhoven dauert mit dem Transporter etwa sechs Stunden. Wir reisen am Vortag an, Übernachtung und Fahrtstrecke stehen im Angebot einzeln. Niederländische Lärmschutzauflagen klären wir vorab mit der Location.',
      tr: 'Rotterdam kuş uçuşu yaklaşık 485 km uzakta; Köln ve Eindhoven üzerinden araçla yolculuk yaklaşık altı saat sürer. Bir gün önce geliriz; konaklama ve yol mesafesi teklifte ayrı yer alır. Hollanda gürültü kurallarını önceden mekânla netleştiririz.',
      en: 'Rotterdam is about 485 km as the crow flies, and the drive via Cologne and Eindhoven takes roughly six hours by van. We arrive the day before; overnight stay and distance appear separately in the quote. We clarify Dutch noise rules with the venue in advance.',
    },
    faq: {
      q: {
        de: 'Können Sie bei einer Feier mit türkischen und kurdischen Gästen spielen?',
        tr: 'Türk ve Kürt misafirlerin bulunduğu bir kutlamada çalabilir misiniz?',
        en: 'Can you play at a celebration with Turkish and Kurdish guests?',
      },
      a: {
        de: 'Ja. Im Vorgespräch klären wir, welche Musik und welche Programmpunkte für welche Gäste wichtig sind; die Moderation läuft auf Deutsch, Türkisch und Englisch. Kurdische Titel lassen sich auf Wunsch in den Ablauf aufnehmen.',
        tr: 'Evet. Ön görüşmede hangi müziğin ve hangi program noktalarının hangi misafirler için önemli olduğunu netleştiririz; sunum Almanca, Türkçe ve İngilizce yapılır. Kürtçe parçalar isteğe bağlı olarak akışa eklenebilir.',
        en: 'Yes. In the planning call we clarify which music and which programme points matter to which guests; hosting is in German, Turkish and English. Kurdish tracks can be added to the running order on request.',
      },
    },
  },

  // ── Belgien ───────────────────────────────────────────────────────────────
  {
    slug: 'bruessel',
    name: { de: 'Brüssel', tr: 'Brüksel', en: 'Brussels' },
    country: 'be',
    capital: true,
    distanceKm: 415,
    travel: 'far',
    published: true,
    intro: {
      de: 'Brüssel ist die Hauptstadt Belgiens und das Zentrum der EU – und in Stadtteilen wie Schaerbeek und Saint-Josse eine der Städte mit der sichtbarsten türkischen Community Westeuropas. Hochzeiten dort verbinden Familien aus Brüssel, Flandern und der Türkei; im Gespräch wechseln Türkisch, Französisch und Niederländisch.',
      tr: 'Brüksel Belçika’nın başkenti ve AB’nin merkezi – ve Schaerbeek ile Saint-Josse gibi semtlerde Batı Avrupa’nın en görünür Türk topluluklarından birine sahip. Oradaki düğünler Brüksel’den, Flandre’dan ve Türkiye’den aileleri bir araya getiriyor; sohbet Türkçe, Fransızca ve Felemenkçe arasında geçiş yapıyor.',
      en: 'Brussels is the capital of Belgium and the centre of the EU – and in districts such as Schaerbeek and Saint-Josse home to one of the most visible Turkish communities in Western Europe. Weddings there link families from Brussels, Flanders and Turkey; conversation shifts between Turkish, French and Dutch.',
    },
    route: {
      de: 'Brüssel liegt rund 415 km Luftlinie von Stuttgart entfernt; die Fahrt über Luxemburg dauert mit dem Transporter etwa sechs Stunden. Belgien nutzt Schuko-Steckdosen und 230 V. Moderiert wird auf Deutsch, Türkisch und Englisch – nicht auf Französisch oder Niederländisch, das sagen wir offen.',
      tr: 'Brüksel, Stuttgart’a kuş uçuşu yaklaşık 415 km; Lüksemburg üzerinden araçla yolculuk yaklaşık altı saat sürer. Belçika Schuko prizleri ve 230 V kullanır. Sunum Almanca, Türkçe ve İngilizce yapılır – Fransızca ya da Felemenkçe değil, bunu açıkça söyleriz.',
      en: 'Brussels is about 415 km as the crow flies from Stuttgart; the drive via Luxembourg takes roughly six hours by van. Belgium uses Schuko sockets and 230 V. Hosting is in German, Turkish and English – not in French or Dutch, and we say so openly.',
    },
    faq: {
      q: {
        de: 'Spielen Sie in Brüssel auch, wenn die Gäste Französisch sprechen?',
        tr: 'Misafirler Fransızca konuşsa da Brüksel’de çalıyor musunuz?',
        en: 'Do you play in Brussels even if the guests speak French?',
      },
      a: {
        de: 'Musikalisch ja. Die Moderation bleibt bei Deutsch, Türkisch und Englisch; für ein Publikum, das vor allem Französisch spricht, sollte das vorab geklärt sein. Die Musik selbst braucht keine gemeinsame Sprache.',
        tr: 'Müzik açısından evet. Sunum Almanca, Türkçe ve İngilizce kalır; ağırlıklı olarak Fransızca konuşan bir kitle için bunun önceden netleşmesi gerekir. Müziğin kendisi ortak bir dile ihtiyaç duymaz.',
        en: 'Musically yes. Hosting stays in German, Turkish and English; for an audience that mainly speaks French this should be clarified beforehand. The music itself needs no shared language.',
      },
    },
  },
  {
    slug: 'antwerpen',
    name: { de: 'Antwerpen', tr: 'Anvers', en: 'Antwerp' },
    country: 'be',
    capital: false,
    distanceKm: 435,
    travel: 'far',
    published: true,
    intro: {
      de: 'Antwerpen ist die größte Stadt Flanderns und eine der Städte Belgiens, in denen türkische Familien seit Jahrzehnten leben und feiern. Die Hochzeiten dort sind oft Treffen von Familien zwischen Flandern, Brüssel und der Türkei; wer das stemmt, plant eine Feier, bei der Programm, Sprache und Ablauf nicht dem Zufall überlassen sind.',
      tr: 'Anvers, Flandre’ın en büyük şehri ve Türk ailelerin onlarca yıldır yaşayıp kutlama yaptığı Belçika şehirlerinden biri. Oradaki düğünler çoğu kez Flandre, Brüksel ve Türkiye arasındaki ailelerin buluşması; bunu üstlenen, program, dil ve akışın tesadüfe bırakılmadığı bir kutlama planlıyor.',
      en: 'Antwerp is the largest city in Flanders and one of the Belgian cities where Turkish families have lived and celebrated for decades. Weddings there are often gatherings of families between Flanders, Brussels and Turkey; those who take that on plan a celebration where programme, language and running order are not left to chance.',
    },
    route: {
      de: 'Antwerpen liegt rund 435 km Luftlinie entfernt; die Fahrt über Köln und Maastricht dauert mit dem Transporter etwa sechs Stunden. Wir reisen am Vortag an und weisen Fahrtstrecke und Übernachtung im Angebot einzeln aus. Belgien nutzt Schuko-Steckdosen und 230 V.',
      tr: 'Anvers kuş uçuşu yaklaşık 435 km uzakta; Köln ve Maastricht üzerinden araçla yolculuk yaklaşık altı saat sürer. Bir gün önce geliriz; yol mesafesi ve konaklama teklifte ayrı yer alır. Belçika Schuko prizleri ve 230 V kullanır.',
      en: 'Antwerp is about 435 km as the crow flies, and the drive via Cologne and Maastricht takes roughly six hours by van. We arrive the day before and itemise distance and overnight stay separately in the quote. Belgium uses Schuko sockets and 230 V.',
    },
    faq: {
      q: {
        de: 'Wird die Moderation in Antwerpen auf Niederländisch angeboten?',
        tr: 'Anvers’te Felemenkçe sunum sunuluyor mu?',
        en: 'Is hosting offered in Dutch in Antwerp?',
      },
      a: {
        de: 'Nein. Live moderiert wird auf Deutsch, Türkisch und Englisch. Diese Seite gibt es auf Deutsch, Türkisch und Englisch, damit Sie lesen und anfragen können; niederländischsprachige Gäste sollten keine niederländische Moderation erwarten.',
        tr: 'Hayır. Canlı sunum Almanca, Türkçe ve İngilizce yapılır. Bu sayfa okuyup talepte bulunabilmeniz için Almanca, Türkçe ve İngilizce olarak sunuluyor; Felemenkçe konuşan misafirler Felemenkçe sunum beklememeli.',
        en: 'No. Live hosting is in German, Turkish and English. This page exists in German, Turkish and English so you can read it and get in touch; Dutch-speaking guests should not expect Dutch hosting.',
      },
    },
  },

  // ── Luxemburg ─────────────────────────────────────────────────────────────
  {
    slug: 'luxemburg',
    name: { de: 'Luxemburg', tr: 'Lüksemburg', en: 'Luxembourg' },
    country: 'lu',
    capital: true,
    distanceKm: 240,
    travel: 'far',
    published: true,
    intro: {
      de: 'Luxemburg ist Hauptstadt und zugleich die einzige große Stadt des Landes, und kein klassischer Diaspora-Standort: Die türkische Community ist dort überschaubar. Anfragen von dort sind eher internationale Paare, deutsch-türkische Familien mit Wohnsitz im Großherzogtum und Feiern, bei denen Gäste aus Deutschland und der Türkei anreisen.',
      tr: 'Lüksemburg hem başkent hem ülkenin tek büyük şehri ve klasik bir diaspora noktası değil: oradaki Türk topluluğu küçük. Oradan gelen talepler çoğunlukla uluslararası çiftler, Büyük Dükalık’ta yaşayan Alman-Türk aileler ve Almanya ile Türkiye’den misafirlerin geldiği kutlamalar.',
      en: 'Luxembourg is the capital and also the only large city in the country, and not a classic diaspora location: the Turkish community there is modest. Enquiries from there are more likely international couples, German-Turkish families living in the Grand Duchy, and celebrations where guests travel in from Germany and Turkey.',
    },
    route: {
      de: 'Luxemburg liegt rund 240 km Luftlinie von Stuttgart entfernt; die Fahrt führt über Saarbrücken und dauert mit dem Transporter etwa dreieinhalb Stunden. Luxemburg ist EU-Land, die Technik reist ohne Zollformalitäten, Schuko-Steckdosen und 230 V sind wie in Deutschland.',
      tr: 'Lüksemburg, Stuttgart’a kuş uçuşu yaklaşık 240 km; yol Saarbrücken üzerinden geçer ve araçla yaklaşık üç buçuk saat sürer. Lüksemburg AB ülkesidir, ekipman gümrük formalitesi olmadan yolculuk eder; Schuko prizler ve 230 V Almanya’dakiyle aynıdır.',
      en: 'Luxembourg is about 240 km as the crow flies from Stuttgart; the route runs via Saarbrücken and takes roughly three and a half hours by van. Luxembourg is an EU country, the equipment travels without customs formalities, and Schuko sockets and 230 V are as in Germany.',
    },
    faq: {
      q: {
        de: 'Lohnt sich eine Anfrage für Luxemburg, obwohl Sie dort keine Referenzen haben?',
        tr: 'Lüksemburg’da referansınız olmamasına rağmen talepte bulunmaya değer mi?',
        en: 'Is an enquiry for Luxembourg worthwhile even though you have no references there?',
      },
      a: {
        de: 'Das ist Ihre Entscheidung, und wir drehen sie nicht schön: In Luxemburg hat DJ Veys keinen belegten Auftritt. Was wir belegen können, ist das Programm – Repertoire, Moderation, Technik – und eine nachvollziehbare Rechnung für die Anreise.',
        tr: 'Bu sizin kararınız ve onu güzel göstermeye çalışmıyoruz: DJ Veys’in Lüksemburg’da kanıtlanmış bir gösterisi yok. Kanıtlayabileceğimiz şey programdır – repertuvar, sunum, teknik donanım – ve ulaşım için anlaşılır bir hesap.',
        en: 'That is your call, and we do not dress it up: DJ Veys has no verified booking in Luxembourg. What we can show is the programme – repertoire, hosting, equipment – and a calculation for the journey that you can follow.',
      },
    },
  },

  // ── Frankreich ────────────────────────────────────────────────────────────
  {
    slug: 'paris',
    name: { de: 'Paris', tr: 'Paris', en: 'Paris' },
    country: 'fr',
    capital: true,
    distanceKm: 500,
    travel: 'far',
    published: true,
    intro: {
      de: 'Paris und die Île-de-France haben eine große türkische Community, rund um die Rue du Faubourg-Saint-Denis im 10. Arrondissement ebenso wie in den Vororten. Wer dort türkisch oder deutsch-türkisch heiratet, feiert zwischen Pariser Alltag und der Familie in der Türkei – und sucht einen DJ, der beide Welten kennt.',
      tr: 'Paris ve Île-de-France’ın büyük bir Türk topluluğu var – 10. bölgedeki Rue du Faubourg-Saint-Denis çevresinde de, banliyölerde de. Orada Türk ya da Alman-Türk evlenenler Paris gündelik hayatı ile Türkiye’deki aile arasında kutlama yapıyor ve iki dünyayı da tanıyan bir DJ arıyor.',
      en: 'Paris and the Île-de-France have a large Turkish community, around the Rue du Faubourg-Saint-Denis in the 10th arrondissement as well as in the suburbs. Couples who marry Turkish or German-Turkish there celebrate between Parisian everyday life and family in Turkey – and look for a DJ who knows both worlds.',
    },
    route: {
      de: 'Paris liegt rund 500 km Luftlinie von Stuttgart entfernt; die Fahrt führt über Straßburg und Metz. Frankreich ist EU-Land: Schuko-kompatible Steckdosen und 230 V, keine Zollformalitäten für die Technik. Moderiert wird auf Deutsch, Türkisch und Englisch – nicht auf Französisch.',
      tr: 'Paris, Stuttgart’a kuş uçuşu yaklaşık 500 km; yol Strazburg ve Metz üzerinden geçer. Fransa AB ülkesidir: Schuko uyumlu prizler ve 230 V, ekipman için gümrük formalitesi yok. Sunum Almanca, Türkçe ve İngilizce yapılır – Fransızca değil.',
      en: 'Paris is about 500 km as the crow flies from Stuttgart; the route runs via Strasbourg and Metz. France is an EU country: Schuko-compatible sockets and 230 V, no customs formalities for the equipment. Hosting is in German, Turkish and English – not in French.',
    },
    faq: {
      q: {
        de: 'Brauche ich für Paris einen französischsprachigen Moderator?',
        tr: 'Paris için Fransızca konuşan bir sunucuya ihtiyacım var mı?',
        en: 'Do I need a French-speaking host for Paris?',
      },
      a: {
        de: 'Wenn ein großer Teil der Gäste nur Französisch spricht, ja – das bieten wir nicht an. Für Feiern, bei denen Deutsch, Türkisch und Englisch reichen, etwa mit Familie aus Deutschland und der Türkei, passt das Angebot.',
        tr: 'Misafirlerin büyük kısmı yalnızca Fransızca konuşuyorsa evet – bunu sunmuyoruz. Almanca, Türkçe ve İngilizcenin yettiği kutlamalarda, örneğin Almanya ve Türkiye’den aileyle, teklif uygundur.',
        en: 'If a large part of the guests only speak French, yes – we do not offer that. For celebrations where German, Turkish and English are enough, for example with family from Germany and Turkey, the offer fits.',
      },
    },
  },
  {
    slug: 'strassburg',
    name: { de: 'Straßburg', tr: 'Strazburg', en: 'Strasbourg' },
    country: 'fr',
    capital: false,
    distanceKm: 105,
    travel: 'near',
    published: true,
    intro: {
      de: 'Straßburg liegt nur rund 105 km von Stuttgart entfernt und hat eine gewachsene türkische Community im Elsass. Familien dort leben oft zwischen Frankreich und Deutschland, mit Verwandten auf beiden Seiten des Rheins und in der Türkei – eine Hochzeit, bei der der Abend auf Deutsch und Türkisch funktionieren muss.',
      tr: 'Strazburg, Stuttgart’a sadece yaklaşık 105 km uzakta ve Alsace’ta köklü bir Türk topluluğuna sahip. Oradaki aileler çoğu kez Fransa ile Almanya arasında yaşıyor, Ren’in iki yakasında ve Türkiye’de akrabalarıyla – akşamın Almanca ve Türkçe işlemesi gereken bir düğün.',
      en: 'Strasbourg is only about 105 km from Stuttgart and has an established Turkish community in Alsace. Families there often live between France and Germany, with relatives on both sides of the Rhine and in Turkey – a wedding where the evening has to work in German and Turkish.',
    },
    route: {
      de: 'Straßburg ist die nächstgelegene ausländische Stadt in dieser Liste: über die A5 und die Rheinbrücke bei Kehl liegt sie zwei Stunden entfernt. Aufbau und Soundcheck am Veranstaltungstag sind meist ohne Übernachtung möglich. Frankreich ist EU-Land, Moderation auf Deutsch, Türkisch und Englisch.',
      tr: 'Strazburg bu listedeki en yakın yabancı şehir: A5 ve Kehl’deki Ren köprüsü üzerinden iki saat uzaklıkta. Kurulum ve ses kontrolü etkinlik günü çoğunlukla konaklamasız mümkündür. Fransa AB ülkesidir, sunum Almanca, Türkçe ve İngilizcedir.',
      en: 'Strasbourg is the closest foreign city on this list: via the A5 and the Rhine bridge at Kehl it is two hours away. Setup and sound check on the day usually work without an overnight stay. France is an EU country, hosting is in German, Turkish and English.',
    },
    faq: {
      q: {
        de: 'Muss ich für Straßburg mit Zollformalitäten rechnen?',
        tr: 'Strazburg için gümrük formalitelerine hazırlanmam gerekir mi?',
        en: 'Do I need to expect customs formalities for Strasbourg?',
      },
      a: {
        de: 'Nein. Deutschland und Frankreich sind EU-Länder; die Technik reist ohne Zollformalitäten über die Grenze. Zu klären bleiben Lautstärke und Sperrzeit der Location, die wir vorab mit ihr abstimmen.',
        tr: 'Hayır. Almanya ve Fransa AB ülkeleridir; ekipman gümrük formalitesi olmadan sınırı geçer. Netleştirilmesi gereken mekânın ses seviyesi ve kapanış saatidir; bunları önceden mekânla görüşürüz.',
        en: 'No. Germany and France are EU countries; the equipment crosses the border without customs formalities. What remains to clarify are the venue’s volume limits and closing time, which we agree with it in advance.',
      },
    },
  },

  // ── Italien ───────────────────────────────────────────────────────────────
  {
    slug: 'rom',
    name: { de: 'Rom', tr: 'Roma', en: 'Rome' },
    country: 'it',
    capital: true,
    distanceKm: 805,
    travel: 'flight',
    published: true,
    intro: {
      de: 'Rom ist Hauptstadt und eines der großen Ziele für Destination Weddings. Eine nennenswerte türkische Diaspora gibt es in Italien nicht – hier geht es um Paare, die Italien als Kulisse wählen, und um deutsch-türkische Familien, die dafür einfliegen. Wer so heiratet, sucht einen DJ, der den Abend trägt, auch wenn die Gäste aus drei Ländern kommen.',
      tr: 'Roma başkent ve destinasyon düğünleri için en büyük hedeflerden biri. İtalya’da kayda değer bir Türk diasporası yok – burada İtalya’yı fon olarak seçen çiftler ve bunun için uçakla gelen Alman-Türk aileler söz konusu. Böyle evlenenler, misafirler üç ülkeden gelse bile akşamı taşıyan bir DJ arıyor.',
      en: 'Rome is the capital and one of the great destinations for destination weddings. There is no significant Turkish diaspora in Italy – this is about couples who choose Italy as a backdrop and German-Turkish families who fly in for it. Couples who marry like this look for a DJ who carries the evening even when the guests come from three countries.',
    },
    route: {
      de: 'Rom liegt rund 805 km Luftlinie von Stuttgart entfernt. Dafür bieten sich ein Flug mit leichtem Gepäck und die Miete von Beschallung und Licht vor Ort an, alternativ die Anreise mit dem Transporter in zwei Tagen. Italien ist EU-Land – Zoll fällt nicht an. Was welche Variante kostet, steht vorab im Angebot.',
      tr: 'Roma, Stuttgart’a kuş uçuşu yaklaşık 805 km. Bunun için hafif bagajla uçuş ve ses ile ışığın yerinde kiralanması akla gelir; alternatif olarak iki günde araçla gelme. İtalya AB ülkesidir – gümrük söz konusu değil. Hangi seçeneğin neye mal olduğu önceden teklifte yer alır.',
      en: 'Rome is about 805 km as the crow flies from Stuttgart. A flight with light luggage and rented sound and lighting on site is one option, travelling by van over two days the other. Italy is an EU country – no customs. What each option costs is in the quote beforehand.',
    },
    faq: {
      q: {
        de: 'Spielen Sie auch bei einer Destination Wedding in Italien?',
        tr: 'İtalya’daki bir destinasyon düğününde de çalıyor musunuz?',
        en: 'Do you also play at a destination wedding in Italy?',
      },
      a: {
        de: 'Ja, als Anfrage. In Italien hat DJ Veys keinen belegten Auftritt, das sagen wir offen. Sicher ist, was reist: Repertoire, Moderation auf Deutsch, Türkisch und Englisch und – falls gewünscht – Live-Musik mit Saz. Technik und Anreise werden vorab einzeln kalkuliert.',
        tr: 'Evet, talep olarak. İtalya’da DJ Veys’in kanıtlanmış bir gösterisi yok, bunu açıkça söyleriz. Kesin olan şey yanında gelenler: repertuvar, Almanca, Türkçe ve İngilizce sunum ve istenirse sazla canlı müzik. Teknik ve ulaşım önceden ayrı ayrı hesaplanır.',
        en: 'Yes, as an enquiry. DJ Veys has no verified booking in Italy, and we say so openly. What travels is certain: repertoire, hosting in German, Turkish and English and, if wanted, live music with Saz. Equipment and travel are calculated separately beforehand.',
      },
    },
  },
  {
    slug: 'mailand',
    name: { de: 'Mailand', tr: 'Milano', en: 'Milan' },
    country: 'it',
    capital: false,
    distanceKm: 370,
    travel: 'far',
    published: true,
    intro: {
      de: 'Mailand ist die größte Stadt Norditaliens und mit dem Comer See in der Nähe ein Ziel für Hochzeiten im Ausland. Eine große türkische Community gibt es dort nicht; Anfragen kommen eher von Paaren, die Norditalien wählen, und von deutsch-türkischen Familien, die dafür anreisen.',
      tr: 'Milano, Kuzey İtalya’nın en büyük şehri ve yakındaki Como Gölü ile yurt dışı düğünler için bir hedef. Orada büyük bir Türk topluluğu yok; talepler daha çok Kuzey İtalya’yı seçen çiftlerden ve bunun için gelen Alman-Türk ailelerden geliyor.',
      en: 'Milan is the largest city in northern Italy and, with Lake Como nearby, a destination for weddings abroad. There is no large Turkish community there; enquiries are more likely from couples choosing northern Italy and from German-Turkish families who travel for it.',
    },
    route: {
      de: 'Mailand liegt rund 370 km Luftlinie von Stuttgart entfernt, die Fahrt über die Schweiz dauert aber deutlich länger, als die Zahl nahelegt. Dabei wird für die Technik ein ATA-Carnet für die Durchreise fällig. Alternativ fliegen wir mit leichtem Gepäck und mieten Beschallung vor Ort. Die Varianten stehen im Angebot nebeneinander.',
      tr: 'Milano, Stuttgart’a kuş uçuşu yaklaşık 370 km, ancak İsviçre üzerinden yolculuk, rakamın düşündürdüğünden belirgin biçimde uzun sürer. Bu sırada ekipman için geçiş amacıyla ATA Karnesi gerekir. Alternatif olarak hafif bagajla uçar ve ses sistemini yerinde kiralarız. Seçenekler teklifte yan yana yer alır.',
      en: 'Milan is about 370 km as the crow flies from Stuttgart, but the drive through Switzerland takes noticeably longer than that figure suggests. The equipment needs an ATA Carnet for the transit. Alternatively we fly with light luggage and rent sound on site. The options sit side by side in the quote.',
    },
    faq: {
      q: {
        de: 'Ist eine Hochzeit am Comer See machbar?',
        tr: 'Como Gölü’nde bir düğün mümkün mü?',
        en: 'Is a wedding at Lake Como feasible?',
      },
      a: {
        de: 'Ja, als Anfrage. Entscheidend sind Zufahrt, Stromanschluss und Lautstärkeauflagen der Location; das klären wir im Vorgespräch. Die Seeregion liegt in Italien, also in der EU; Zoll fällt nur für die Durchreise durch die Schweiz an.',
        tr: 'Evet, talep olarak. Mekânın erişimi, elektrik bağlantısı ve ses kısıtlamaları belirleyicidir; bunları ön görüşmede netleştiririz. Göl bölgesi İtalya’dadır, yani AB’de; gümrük yalnızca İsviçre üzerinden geçiş için söz konusudur.',
        en: 'Yes, as an enquiry. What decides it are access, power supply and noise rules of the venue; we clarify them in the planning call. The lake area is in Italy, hence in the EU; customs only apply to the transit through Switzerland.',
      },
    },
  },

  // ── Spanien ───────────────────────────────────────────────────────────────
  {
    slug: 'madrid',
    name: { de: 'Madrid', tr: 'Madrid', en: 'Madrid' },
    country: 'es',
    capital: true,
    distanceKm: 1375,
    travel: 'flight',
    published: true,
    intro: {
      de: 'Madrid ist Hauptstadt und liegt mit knapp 1.400 km Luftlinie am weitesten von Stuttgart entfernt. In Spanien gibt es keine große türkische Diaspora; Anfragen sind Destination Weddings und Familien aus Deutschland, der Türkei und Spanien, die dort zusammenkommen. Dafür braucht es einen DJ, der den Abend plant, bevor er anreist.',
      tr: 'Madrid başkent ve yaklaşık 1.400 km kuş uçuşu ile Stuttgart’a en uzak şehir. İspanya’da büyük bir Türk diasporası yok; talepler destinasyon düğünleri ve orada bir araya gelen Almanya, Türkiye ve İspanya’dan aileler. Bunun için akşamı, yola çıkmadan önce planlayan bir DJ gerekiyor.',
      en: 'Madrid is the capital and, at nearly 1,400 km as the crow flies, the furthest city from Stuttgart. Spain has no large Turkish diaspora; enquiries are destination weddings and families from Germany, Turkey and Spain who come together there. That calls for a DJ who plans the evening before he travels.',
    },
    route: {
      de: 'Die Anreise nach Madrid ist ein Flug; die Technik reist leicht mit, Beschallung und Licht werden in der Regel vor Ort gemietet. Spanien ist EU-Land, Steckdosen und Spannung sind kompatibel. Was geliehen und was mitgebracht wird, steht vorab im Angebot – ohne Pauschale.',
      tr: 'Madrid’e ulaşım bir uçuştur; ekipman hafif gelir, ses ve ışık kural olarak yerinde kiralanır. İspanya AB ülkesidir, prizler ve voltaj uyumludur. Neyin kiralanıp neyin getirileceği önceden teklifte yer alır – götürü bedel olmadan.',
      en: 'Getting to Madrid means a flight; the equipment travels light, and sound and lighting are usually rented on site. Spain is an EU country, with compatible sockets and voltage. What is rented and what is brought is in the quote beforehand – no flat rate.',
    },
    faq: {
      q: {
        de: 'Wie läuft die Technik bei einem Flug nach Madrid?',
        tr: 'Madrid’e uçuşta teknik donanım nasıl işliyor?',
        en: 'How does the equipment work with a flight to Madrid?',
      },
      a: {
        de: 'Was ins Handgepäck passt, fliegt mit – Controller, Kopfhörer, Mikrofone, Musik. Beschallung und Licht werden vor Ort gemietet, mit einem Anbieter, den wir vorab prüfen. Beides steht getrennt im Angebot.',
        tr: 'El bagajına sığanlar birlikte uçar – kontrolcü, kulaklık, mikrofonlar, müzik. Ses ve ışık yerinde, önceden kontrol ettiğimiz bir sağlayıcıdan kiralanır. İkisi de teklifte ayrı yer alır.',
        en: 'What fits in hand luggage flies with us – controller, headphones, microphones, music. Sound and lighting are rented on site from a provider we check beforehand. Both appear separately in the quote.',
      },
    },
  },
  {
    slug: 'barcelona',
    name: { de: 'Barcelona', tr: 'Barselona', en: 'Barcelona' },
    country: 'es',
    capital: false,
    distanceKm: 985,
    travel: 'flight',
    published: true,
    intro: {
      de: 'Barcelona ist Spaniens zweitgrößte Stadt und ein beliebtes Ziel für Hochzeiten am Mittelmeer, auch für Paare aus Deutschland und der Türkei. Die türkische Community vor Ort ist klein; hier geht es um Gäste, die einfliegen, und um eine Feier, bei der der Ablauf stimmen muss, weil es keinen zweiten Versuch gibt.',
      tr: 'Barselona, İspanya’nın ikinci büyük şehri ve Almanya ile Türkiye’den çiftler için de Akdeniz’de düğün hedefi. Oradaki Türk topluluğu küçük; burada uçakla gelen misafirler ve ikinci bir denemenin olmadığı bir kutlamada akışın doğru olması söz konusu.',
      en: 'Barcelona is Spain’s second-largest city and a popular Mediterranean wedding destination, also for couples from Germany and Turkey. The Turkish community on site is small; this is about guests who fly in and a celebration where the running order has to be right because there is no second attempt.',
    },
    route: {
      de: 'Barcelona liegt rund 985 km Luftlinie von Stuttgart entfernt; die Anreise ist ein Flug, die Technik reist leicht mit, Beschallung und Licht werden vor Ort gemietet. Spanien ist EU-Land, Steckdosen und Spannung sind kompatibel. Die Kosten stehen vor der Zusage im Angebot.',
      tr: 'Barselona, Stuttgart’a kuş uçuşu yaklaşık 985 km; ulaşım bir uçuştur, ekipman hafif gelir, ses ve ışık yerinde kiralanır. İspanya AB ülkesidir, prizler ve voltaj uyumludur. Maliyetler onaydan önce teklifte yer alır.',
      en: 'Barcelona is about 985 km as the crow flies from Stuttgart; getting there is a flight, the equipment travels light, and sound and lighting are rented on site. Spain is an EU country, with compatible sockets and voltage. The costs are in the quote before you commit.',
    },
    faq: {
      q: {
        de: 'Planen Sie den Ablauf vorab, wenn die Gäste aus mehreren Ländern kommen?',
        tr: 'Misafirler birkaç ülkeden geliyorsa akışı önceden planlıyor musunuz?',
        en: 'Do you plan the running order beforehand when guests come from several countries?',
      },
      a: {
        de: 'Ja, im Vorgespräch per Video oder persönlich. Wir klären Sprachen, Programmpunkte und Musikwünsche, bevor die Anreise gebucht ist; vor Ort gibt es dann keine offenen Fragen mehr.',
        tr: 'Evet, ön görüşmede video ile ya da yüz yüze. Ulaşım rezerve edilmeden önce diller, program noktaları ve müzik isteklerini netleştiririz; yerinde artık açık soru kalmaz.',
        en: 'Yes, in the planning call by video or in person. We clarify languages, programme points and music wishes before the travel is booked; on site there are no open questions left.',
      },
    },
  },

  // ── Dänemark ──────────────────────────────────────────────────────────────
  {
    slug: 'kopenhagen',
    name: { de: 'Kopenhagen', tr: 'Kopenhag', en: 'Copenhagen' },
    country: 'dk',
    capital: true,
    distanceKm: 800,
    travel: 'flight',
    published: true,
    intro: {
      de: 'Kopenhagen ist Hauptstadt und größte Stadt Dänemarks und hat eine türkische Community, die seit den 1960ern wächst und das Stadtbild mit prägt. Feiern dort verbinden dänische und türkische Familienwelten, und deutsch-türkische Paare bringen oft Verwandte aus drei Ländern mit.',
      tr: 'Kopenhag Danimarka’nın başkenti ve en büyük şehri; 1960’lardan beri büyüyen ve şehir görünümünü de şekillendiren bir Türk topluluğuna sahip. Oradaki kutlamalar Danimarka ve Türk aile dünyalarını bir araya getiriyor, Alman-Türk çiftler çoğu kez üç ülkeden akrabalarını da getiriyor.',
      en: 'Copenhagen is the capital and largest city of Denmark and has a Turkish community that has been growing since the 1960s and helps shape the city. Celebrations there join Danish and Turkish family worlds, and German-Turkish couples often bring relatives from three countries.',
    },
    route: {
      de: 'Kopenhagen liegt rund 800 km Luftlinie von Stuttgart entfernt. Wir fliegen mit leichtem Gepäck, Beschallung und Licht werden vor Ort gemietet. Dänemark ist EU-Land; Schuko-kompatible Steckdosen, 230 V. Moderiert wird auf Deutsch, Türkisch und Englisch, nicht auf Dänisch.',
      tr: 'Kopenhag, Stuttgart’a kuş uçuşu yaklaşık 800 km. Hafif bagajla uçarız, ses ve ışık yerinde kiralanır. Danimarka AB ülkesidir; Schuko uyumlu prizler, 230 V. Sunum Almanca, Türkçe ve İngilizce yapılır, Danca değil.',
      en: 'Copenhagen is about 800 km as the crow flies from Stuttgart. We fly with light luggage, and sound and lighting are rented on site. Denmark is an EU country; Schuko-compatible sockets, 230 V. Hosting is in German, Turkish and English, not in Danish.',
    },
    faq: {
      q: {
        de: 'Reist die gesamte Technik nach Kopenhagen mit?',
        tr: 'Tüm ekipman Kopenhag’a birlikte geliyor mu?',
        en: 'Does all the equipment travel to Copenhagen?',
      },
      a: {
        de: 'In der Regel nicht: Der Transporter wäre zwei Tage unterwegs. Üblich sind der Flug mit dem Wesentlichen und die Miete der Beschallung vor Ort. Auf Wunsch kalkulieren wir auch die Anreise mit dem Transporter; beides steht nebeneinander im Angebot.',
        tr: 'Genellikle hayır: araç iki gün yolda olurdu. Genel uygulama, gerekli olanlarla uçmak ve ses sistemini yerinde kiralamaktır. İsteğe bağlı olarak araçla gelişi de hesaplarız; ikisi teklifte yan yana yer alır.',
        en: 'Usually not: the van would be on the road for two days. The usual way is to fly with the essentials and rent sound on site. On request we also calculate travel by van; both options sit side by side in the quote.',
      },
    },
  },
  {
    slug: 'aarhus',
    name: { de: 'Aarhus', tr: 'Aarhus', en: 'Aarhus' },
    country: 'dk',
    capital: false,
    distanceKm: 825,
    travel: 'flight',
    published: true,
    intro: {
      de: 'Aarhus ist die zweitgrößte Stadt Dänemarks und hat, wie andere dänische Städte, türkische und kurdische Familien, die dort seit Jahrzehnten leben. Hochzeiten dort sind kleiner und ruhiger als in Rhein-Ruhr oder Berlin, und der Anspruch ist derselbe: ein Abend, der auf Türkisch und Deutsch funktioniert.',
      tr: 'Aarhus, Danimarka’nın ikinci büyük şehri ve diğer Danimarka şehirleri gibi onlarca yıldır orada yaşayan Türk ve Kürt ailelere sahip. Oradaki düğünler Ren-Ruhr ya da Berlin’dekilerden daha küçük ve sakin, beklenti ise aynı: Türkçe ve Almanca işleyen bir akşam.',
      en: 'Aarhus is Denmark’s second-largest city and, like other Danish cities, has Turkish and Kurdish families who have lived there for decades. Weddings there are smaller and calmer than in Rhine-Ruhr or Berlin, and the expectation is the same: an evening that works in Turkish and German.',
    },
    route: {
      de: 'Aarhus liegt rund 825 km Luftlinie von Stuttgart entfernt, auf Jütland. Die Anreise erfolgt per Flug mit leichter Ausrüstung; Beschallung und Licht werden vor Ort gemietet. Dänemark ist EU-Land, Schuko-kompatible Steckdosen, 230 V. Die Kosten stehen vorab im Angebot.',
      tr: 'Aarhus, Stuttgart’a kuş uçuşu yaklaşık 825 km, Jutland’da. Ulaşım hafif ekipmanla uçuşla yapılır; ses ve ışık yerinde kiralanır. Danimarka AB ülkesidir, Schuko uyumlu prizler, 230 V. Maliyetler önceden teklifte yer alır.',
      en: 'Aarhus is about 825 km as the crow flies from Stuttgart, in Jutland. Travel is by flight with light equipment; sound and lighting are rented on site. Denmark is an EU country, with Schuko-compatible sockets and 230 V. The costs are in the quote beforehand.',
    },
    faq: {
      q: {
        de: 'Ist eine kleinere Feier in Aarhus den Aufwand wert?',
        tr: 'Aarhus’ta daha küçük bir kutlama emeğe değer mi?',
        en: 'Is a smaller celebration in Aarhus worth the effort?',
      },
      a: {
        de: 'Das hängt am Angebot, nicht an der Gästezahl: Anreise und Übernachtung stehen als eigene Posten darin, und Sie sehen, was die Entfernung kostet. Bei kleinen Feiern kann das Verhältnis ungünstig sein, und wir sagen es, wenn es so ist.',
        tr: 'Bu misafir sayısına değil, teklife bağlı: ulaşım ve konaklama içinde ayrı kalemler olarak yer alır ve mesafenin neye mal olduğunu görürsünüz. Küçük kutlamalarda oran elverişsiz olabilir ve öyleyse bunu söyleriz.',
        en: 'That depends on the quote, not the guest count: travel and accommodation are separate items in it, and you see what the distance costs. For small celebrations the ratio can be unfavourable, and we say so if it is.',
      },
    },
  },

  // ── Schweden ──────────────────────────────────────────────────────────────
  {
    slug: 'stockholm',
    name: { de: 'Stockholm', tr: 'Stockholm', en: 'Stockholm' },
    country: 'se',
    capital: true,
    distanceKm: 1305,
    travel: 'flight',
    published: true,
    intro: {
      de: 'Stockholm ist Hauptstadt Schwedens, und in Schweden leben bedeutende türkische, kurdische und aramäische Gemeinschaften mit Wurzeln in der Türkei. Hochzeiten dort verbinden oft mehrere Sprachen und Traditionen an einem Abend; wer so feiert, sucht einen DJ, der Halay, schwedische und internationale Musik in einem Ablauf zusammenbringt.',
      tr: 'Stockholm İsveç’in başkenti ve İsveç’te kökleri Türkiye’ye uzanan önemli Türk, Kürt ve Süryani toplulukları yaşıyor. Oradaki düğünler çoğu kez bir akşamda birkaç dili ve geleneği birleştiriyor; böyle kutlama yapanlar halayı, İsveç ve uluslararası müziği tek bir akışta bir araya getiren bir DJ arıyor.',
      en: 'Stockholm is the capital of Sweden, and Sweden is home to significant Turkish, Kurdish and Assyrian communities with roots in Turkey. Weddings there often combine several languages and traditions in one evening; couples who celebrate like this look for a DJ who brings Halay, Swedish and international music together in one running order.',
    },
    route: {
      de: 'Stockholm liegt rund 1.305 km Luftlinie von Stuttgart entfernt; die Anreise ist ein Flug. Die Technik reist leicht mit, Beschallung und Licht werden vor Ort gemietet. Schweden ist EU-Land, Schuko-kompatible Steckdosen, 230 V. Moderiert wird auf Deutsch, Türkisch und Englisch, nicht auf Schwedisch.',
      tr: 'Stockholm, Stuttgart’a kuş uçuşu yaklaşık 1.305 km; ulaşım bir uçuştur. Ekipman hafif gelir, ses ve ışık yerinde kiralanır. İsveç AB ülkesidir, Schuko uyumlu prizler, 230 V. Sunum Almanca, Türkçe ve İngilizce yapılır, İsveççe değil.',
      en: 'Stockholm is about 1,305 km as the crow flies from Stuttgart; getting there is a flight. The equipment travels light, and sound and lighting are rented on site. Sweden is an EU country, with Schuko-compatible sockets and 230 V. Hosting is in German, Turkish and English, not in Swedish.',
    },
    faq: {
      q: {
        de: 'Spielen Sie auch kurdische und aramäische Titel?',
        tr: 'Kürtçe ve Süryanice parçalar da çalıyor musunuz?',
        en: 'Do you also play Kurdish and Assyrian tracks?',
      },
      a: {
        de: 'Kurdische Titel lassen sich auf Wunsch in den Ablauf aufnehmen; das klären wir im Vorgespräch. Bei Titeln anderer Sprachen fragen wir nach, was für Ihre Feier wichtig ist, statt Behauptungen aufzustellen, die wir nicht belegen können.',
        tr: 'Kürtçe parçalar isteğe bağlı olarak akışa eklenebilir; bunu ön görüşmede netleştiririz. Diğer dillerdeki parçalarda, kanıtlayamayacağımız iddialar öne sürmek yerine, kutlamanız için neyin önemli olduğunu sorarız.',
        en: 'Kurdish tracks can be added to the running order on request; we clarify that in the planning call. For tracks in other languages we ask what matters for your celebration instead of making claims we cannot back up.',
      },
    },
  },
  {
    slug: 'goeteborg',
    name: { de: 'Göteborg', tr: 'Göteborg', en: 'Gothenburg' },
    country: 'se',
    capital: false,
    distanceKm: 1010,
    travel: 'flight',
    published: true,
    intro: {
      de: 'Göteborg ist die zweitgrößte Stadt Schwedens, eine Hafenstadt mit eigenen türkischen und kurdischen Familien. Die Feiern dort sind Treffen weitverzweigter Verwandtschaft, bei denen Programm und Sprache für alle Generationen passen müssen – vom Kına bis zum Abendtanz.',
      tr: 'Göteborg, İsveç’in ikinci büyük şehri, kendi Türk ve Kürt ailelerine sahip bir liman şehri. Oradaki kutlamalar geniş akrabalığın buluşmaları; program ve dil, kınadan akşam dansına kadar tüm kuşaklara uymak zorunda.',
      en: 'Gothenburg is Sweden’s second-largest city, a port city with Turkish and Kurdish families of its own. Celebrations there are gatherings of widely spread relatives, where programme and language have to suit every generation – from Kına to the evening dance.',
    },
    route: {
      de: 'Göteborg liegt rund 1.010 km Luftlinie von Stuttgart entfernt; die Anreise erfolgt per Flug. Beschallung und Licht werden vor Ort gemietet, die Technik reist leicht mit. Schweden ist EU-Land, Schuko-kompatible Steckdosen, 230 V. Anreise und Miete stehen getrennt im Angebot.',
      tr: 'Göteborg, Stuttgart’a kuş uçuşu yaklaşık 1.010 km; ulaşım uçuşla yapılır. Ses ve ışık yerinde kiralanır, ekipman hafif gelir. İsveç AB ülkesidir, Schuko uyumlu prizler, 230 V. Ulaşım ve kira teklifte ayrı yer alır.',
      en: 'Gothenburg is about 1,010 km as the crow flies from Stuttgart; travel is by flight. Sound and lighting are rented on site, and the equipment travels light. Sweden is an EU country, with Schuko-compatible sockets and 230 V. Travel and rental appear separately in the quote.',
    },
    faq: {
      q: {
        de: 'Wie früh sollte ich für Göteborg anfragen?',
        tr: 'Göteborg için ne kadar erken talepte bulunmalıyım?',
        en: 'How early should I enquire for Gothenburg?',
      },
      a: {
        de: 'Möglichst früh: Wochenenden in der Hauptsaison, Mai bis September, sind bei Hochzeits-DJs oft ein Jahr und länger im Voraus belegt. Eine Anfrage kostet nichts, und die Verfügbarkeit melden wir innerhalb von 24 Stunden zurück.',
        tr: 'Mümkün olduğunca erken: yoğun sezonun hafta sonları, Mayıs’tan Eylül’e, düğün DJ’lerinde çoğu kez bir yıl ve daha fazla önceden doludur. Talep ücretsizdir ve müsaitlik durumunu 24 saat içinde bildiririz.',
        en: 'As early as possible: peak-season weekends, May to September, are often booked a year or more in advance for wedding DJs. An enquiry costs nothing, and we report availability back within 24 hours.',
      },
    },
  },

  // ── Norwegen ──────────────────────────────────────────────────────────────
  {
    slug: 'oslo',
    name: { de: 'Oslo', tr: 'Oslo', en: 'Oslo' },
    country: 'no',
    capital: true,
    distanceKm: 1245,
    travel: 'flight',
    published: true,
    intro: {
      de: 'Oslo ist Hauptstadt Norwegens und hat eine kleine, aber gewachsene türkische Community. Eine Diaspora-Szene wie in Deutschland gibt es dort nicht; Anfragen sind Familien, die zwischen Norwegen, Deutschland und der Türkei verteilt leben, und Paare, die Skandinavien für ihre Feier wählen.',
      tr: 'Oslo Norveç’in başkenti ve küçük ama köklü bir Türk topluluğuna sahip. Orada Almanya’daki gibi bir diaspora sahnesi yok; talepler Norveç, Almanya ve Türkiye arasında dağılmış yaşayan aileler ve kutlamaları için İskandinavya’yı seçen çiftlerden geliyor.',
      en: 'Oslo is the capital of Norway and has a small but established Turkish community. There is no diaspora scene as in Germany; enquiries come from families spread between Norway, Germany and Turkey, and from couples who choose Scandinavia for their celebration.',
    },
    route: {
      de: 'Oslo liegt rund 1.245 km Luftlinie von Stuttgart entfernt; die Anreise ist ein Flug. Norwegen gehört zum EWR, aber nicht zur EU-Zollunion: Für mitgeführte Technik braucht es ein Zolldokument wie das ATA-Carnet. Deshalb werden Beschallung und Licht meist vor Ort gemietet; die Varianten stehen im Angebot.',
      tr: 'Oslo, Stuttgart’a kuş uçuşu yaklaşık 1.245 km; ulaşım bir uçuştur. Norveç AEA’ya dahildir ama AB gümrük birliğinde değildir: getirilen ekipman için ATA Karnesi gibi bir gümrük belgesi gerekir. Bu yüzden ses ve ışık çoğunlukla yerinde kiralanır; seçenekler teklifte yer alır.',
      en: 'Oslo is about 1,245 km as the crow flies from Stuttgart; getting there is a flight. Norway is part of the EEA but not of the EU customs union: equipment brought along needs a customs document such as the ATA Carnet. That is why sound and lighting are usually rented on site; the options are in the quote.',
    },
    faq: {
      q: {
        de: 'Warum ist Norwegen zollrechtlich anders als die EU-Länder?',
        tr: 'Norveç gümrük açısından AB ülkelerinden neden farklı?',
        en: 'Why is Norway different from EU countries in customs terms?',
      },
      a: {
        de: 'Norwegen ist im Europäischen Wirtschaftsraum, aber nicht in der EU-Zollunion. Technik, die mit nach Norwegen geht, muss deshalb angemeldet und wieder ausgeführt werden. Das ist planbar, kostet aber Vorbereitung; die Kosten stehen im Angebot.',
        tr: 'Norveç Avrupa Ekonomik Alanı’nda ama AB gümrük birliğinde değil. Norveç’e giden ekipmanın bu yüzden bildirilmesi ve yeniden ihraç edilmesi gerekir. Bu planlanabilir ama hazırlık gerektirir; maliyetler teklifte yer alır.',
        en: 'Norway is in the European Economic Area but not in the EU customs union. Equipment that goes to Norway therefore has to be declared and re-exported. It is plannable but takes preparation; the costs are in the quote.',
      },
    },
  },
  {
    slug: 'bergen',
    name: { de: 'Bergen', tr: 'Bergen', en: 'Bergen' },
    country: 'no',
    capital: false,
    distanceKm: 1315,
    travel: 'flight',
    published: true,
    intro: {
      de: 'Bergen ist die zweitgrößte Stadt Norwegens, an der Westküste gelegen, und mit der Fjordlandschaft ein Ziel für Hochzeiten im Ausland. Eine nennenswerte türkische Community gibt es dort nicht; es geht um Destination Weddings und um deutsch-türkische Familien, die für ihre Feier einfliegen.',
      tr: 'Bergen, Norveç’in ikinci büyük şehri, batı kıyısında ve fiyort manzarasıyla yurt dışı düğünler için bir hedef. Orada kayda değer bir Türk topluluğu yok; konu destinasyon düğünleri ve kutlamaları için uçakla gelen Alman-Türk aileler.',
      en: 'Bergen is Norway’s second-largest city on the west coast and, with its fjord landscape, a destination for weddings abroad. There is no significant Turkish community there; this is about destination weddings and German-Turkish families who fly in for their celebration.',
    },
    route: {
      de: 'Bergen liegt rund 1.315 km Luftlinie von Stuttgart entfernt; die Anreise ist ein Flug. Norwegen gehört zum EWR, aber nicht zur EU-Zollunion, also wird die Beschallung meist vor Ort gemietet, statt Technik zu verzollen. Was reist, was gemietet wird und was das kostet, steht vorab im Angebot.',
      tr: 'Bergen, Stuttgart’a kuş uçuşu yaklaşık 1.315 km; ulaşım bir uçuştur. Norveç AEA’ya dahildir ama AB gümrük birliğinde değildir; bu yüzden ses sistemi, ekipmanı gümrükletmek yerine çoğunlukla yerinde kiralanır. Neyin geldiği, neyin kiralandığı ve maliyeti önceden teklifte yer alır.',
      en: 'Bergen is about 1,315 km as the crow flies from Stuttgart; getting there is a flight. Norway is part of the EEA but not of the EU customs union, so sound is usually rented on site instead of clearing equipment through customs. What travels, what is rented and what it costs is in the quote beforehand.',
    },
    faq: {
      q: {
        de: 'Kann ich eine Hochzeit in einer Fjordlandschaft mit Ihnen planen?',
        tr: 'Fiyort manzarasında bir düğünü sizinle planlayabilir miyim?',
        en: 'Can I plan a wedding in a fjord landscape with you?',
      },
      a: {
        de: 'Ja, als Anfrage. Entscheidend sind Erreichbarkeit der Location, Stromanschluss und Lautstärkeauflagen; das klären wir im Vorgespräch. In Norwegen hat DJ Veys keinen belegten Auftritt – wir sagen es offen und rechnen die Anreise transparent.',
        tr: 'Evet, talep olarak. Mekânın ulaşılabilirliği, elektrik bağlantısı ve ses kısıtlamaları belirleyicidir; bunları ön görüşmede netleştiririz. Norveç’te DJ Veys’in kanıtlanmış bir gösterisi yok – açıkça söyler, ulaşımı şeffaf biçimde hesaplarız.',
        en: 'Yes, as an enquiry. What decides it are the venue’s accessibility, power supply and noise rules; we clarify them in the planning call. DJ Veys has no verified booking in Norway – we say so openly and calculate the journey transparently.',
      },
    },
  },
];

const MIN_INTRO = 160;
const MIN_ROUTE = 120;
const MIN_FAQ_ANSWER = 100;

/**
 * Eine Stadt erscheint nur, wenn ihre Texte in allen drei Sprachen die
 * Mindestlänge haben. Wie `hasCityProse()`: lieber keine Seite als eine
 * dünne — Doorway-Pages sind genau der Fall, den diese Schwelle verhindert.
 */
export function hasDestinationProse(city: DestinationCity): boolean {
  return DESTINATION_LOCALES.every(
    (locale) =>
      city.intro[locale].trim().length >= MIN_INTRO &&
      city.route[locale].trim().length >= MIN_ROUTE &&
      city.faq.q[locale].trim().length > 0 &&
      city.faq.a[locale].trim().length >= MIN_FAQ_ANSWER,
  );
}

export function getDestinationCities(): DestinationCity[] {
  return destinationCities.filter((city) => city.published && hasDestinationProse(city));
}

export function getDestinationCity(slug: string): DestinationCity | undefined {
  return getDestinationCities().find((city) => city.slug === slug);
}

export function getDestinationCitiesByCountry(country: CountryKey): DestinationCity[] {
  return getDestinationCities().filter((city) => city.country === country);
}

/** Städte für die Länderseite `/hochzeits-dj-europa/[land]` (über deren Region-Slug). */
export function getDestinationCitiesByRegionSlug(regionSlug: string): DestinationCity[] {
  const key = (Object.keys(destinationCountries) as CountryKey[]).find(
    (k) => destinationCountries[k].regionSlug === regionSlug,
  );
  return key ? getDestinationCitiesByCountry(key) : [];
}

/**
 * Die Stadtseite für einen Namen aus `site.germanyCities` bzw. eine Stadt der
 * Auslandsliste. Der Name wird gegen die deutsche Schreibweise geprüft.
 */
export function findDestinationCityByName(name: string): DestinationCity | undefined {
  return getDestinationCities().find((city) => city.name.de.toLocaleLowerCase('de-DE') === name.toLocaleLowerCase('de-DE'));
}

/** Nachbarn für die Querverlinkung: dasselbe Land zuerst, dann die nächstgelegenen. */
export function getRelatedDestinationCities(city: DestinationCity, limit = 3): DestinationCity[] {
  const others = getDestinationCities().filter((other) => other.slug !== city.slug);
  const sameCountry = others.filter((other) => other.country === city.country);
  const rest = others
    .filter((other) => other.country !== city.country && (city.country === 'de') === (other.country === 'de'))
    .sort((a, b) => Math.abs(a.distanceKm - city.distanceKm) - Math.abs(b.distanceKm - city.distanceKm));
  return [...sameCountry, ...rest].slice(0, limit);
}
