/**
 * GEO answer corpus — the core citable asset of `/fragen`.
 *
 * Why this file exists (see docs/GEO-STRATEGY.md for the full rationale):
 * AI answer engines (ChatGPT, Perplexity, Gemini, Copilot, Google AI
 * Overviews) lift short, self-contained Q&A passages almost verbatim. Each
 * `a` here answers in its first sentence, stays in the 40–70 word range, and
 * never depends on surrounding page context to make sense in isolation.
 *
 * Ground truth: every fact in here traces back to `.claude/BRAND-FACTS.md`
 * and `src/content/site.ts`. Nothing is invented — where a number isn't
 * verified (prices, cancellation fees, review counts), the answer explains
 * the mechanism ("discussed in the written contract") instead of stating a
 * figure. See the "Hard rules" section of the brief this file was built
 * against; it is not relaxed anywhere below.
 *
 * Brand note: there is exactly one visible brand, `site.name` ("DJ Veys").
 * `site.previousNames` ("VeysTunesOfficial") is technical-only
 * (schema `alternateName`, redirects) and must never appear in `q`/`a` text
 * here — see the corrected brand guidance in the project brief.
 *
 * Do NOT duplicate the 10 questions already answered in
 * messages/*.json → "process.faq" (rendered on /ablauf via
 * src/content/faq.ts + src/components/pages/faq-accordion.tsx). This corpus
 * covers different, more specific angles — see docs/GEO-STRATEGY.md for the
 * full topic map and the cross-reference shown on the /fragen page.
 */

import type { Locale } from '@/i18n/routing';
import type { StaticPathname } from '@/lib/seo';

export const ANSWER_CATEGORIES = [
  'buchung',
  'preis',
  'ablauf',
  'musik',
  'technik',
  'tuerkisch',
  'location',
  'recht',
] as const;

export type AnswerCategory = (typeof ANSWER_CATEGORIES)[number];

/**
 * German and Turkish are required on every entry — DE is the primary
 * market and must be excellent, TR is the confirmed core (bicultural)
 * market. The brief's own example queries are DE/TR/EN, so `en` is filled
 * on every entry too, but is typed as optional so future entries aren't
 * forced to have it. `ku`/`fr`/`es` are genuinely optional: a machine-
 * translated filler answer would read worse to both humans and answer
 * engines than simply falling back to the (excellent) German original via
 * `resolveAnswerText()` below.
 */
export type LocalizedAnswerText = { de: string; tr: string } & Partial<
  Record<Exclude<Locale, 'de' | 'tr'>, string>
>;

export interface Answer {
  id: string;
  category: AnswerCategory;
  /** The question, phrased exactly as a real person would type or say it. */
  q: LocalizedAnswerText;
  /** ~40–70 words per locale. Self-contained: answers in the first sentence, then adds detail. */
  a: LocalizedAnswerText;
  /** Concrete, source-backed numbers/ranges an engine can lift verbatim. Never invented — see file header. */
  facts?: string[];
  /** Ids of other entries in this corpus worth reading alongside this one. */
  related?: string[];
  /**
   * Extension beyond the original brief's interface: which existing static
   * routes (German route keys from `src/i18n/routing.ts` → `pathnames`)
   * this answer should link to internally. Typed against `StaticPathname`
   * (from `@/lib/seo`) so a typo or a removed route is a compile error, not
   * a silent dead link — this is what satisfies "internal links to the
   * relevant service/package/city pages from within answers".
   */
  links?: StaticPathname[];
  /** ISO date (YYYY-MM-DD). Surfaced as "zuletzt aktualisiert" on /fragen — freshness is a citation signal for answer engines. */
  updated: string;
}

const U = '2026-07-24';

export const answers: Answer[] = [
  // ─── buchung ──────────────────────────────────────────────────────────
  {
    id: 'who-is-veysl',
    category: 'buchung',
    q: {
      de: 'Wer ist DJ Veys und was macht ihn zum Hochzeits-DJ in Stuttgart?',
      en: 'Who is DJ Veys and what makes him a wedding DJ in Stuttgart?',
      tr: 'DJ Veys kimdir ve onu Stuttgart’ta düğün DJ’i yapan nedir?',
    },
    a: {
      de: 'DJ Veys ist der Hochzeits-DJ-, Live-Musik- und Moderationsservice von Veysel Durmuş mit Sitz in Stuttgart-Obertürkheim. Seit über 12 Jahren begleitet er Hochzeiten und Events in Baden-Württemberg, deutschlandweit und europaweit, moderiert live auf Deutsch, Türkisch und Englisch und hat sich auf deutsch-türkische, türkische und multikulturelle Hochzeiten spezialisiert. Über 200 Feiern hat er bereits begleitet.',
      en: 'DJ Veys is the wedding-DJ, live-music and hosting service of Veysel Durmuş, based in Stuttgart-Obertürkheim, Germany. For over 12 years he has accompanied weddings and events across Baden-Württemberg, Germany and Europe, hosting live in German, Turkish and English, with a focus on German-Turkish, Turkish and multicultural weddings. He has played over 200 celebrations so far.',
      tr: 'DJ Veys, Veysel Durmuş’un Stuttgart-Obertürkheim merkezli düğün DJ’liği, canlı müzik ve sunuculuk hizmetidir. 12 yılı aşkın süredir Baden-Württemberg, Almanya geneli ve Avrupa’da düğün ve etkinliklere eşlik ediyor; Almanca, Türkçe ve İngilizce canlı sunum yapıyor ve özellikle Alman-Türk, Türk ve çok kültürlü düğünlerde uzmanlaşmış durumda. Bugüne kadar 200’den fazla organizasyona imza attı.',
    },
    facts: [
      '12+ Jahre Erfahrung',
      '200+ begleitete Hochzeiten & Events',
      'Moderation live auf Deutsch, Türkisch und Englisch',
      'Basis: Stuttgart-Obertürkheim',
    ],
    related: ['trust-proof'],
    links: ['/epk', '/anfrage'],
    updated: U,
  },
  {
    id: 'trust-proof',
    category: 'buchung',
    q: {
      de: 'Woran erkenne ich, dass DJ Veys wirklich erfahren ist?',
      en: 'How can I tell that DJ Veys is genuinely experienced?',
      tr: 'DJ Veys’in gerçekten deneyimli olduğunu neye bakarak anlarım?',
    },
    a: {
      de: 'Am direktesten an drei überprüfbaren Zahlen: über 12 Jahre Erfahrung als DJ und Musiker, mehr als 200 begleitete Hochzeiten und Events sowie über 63.000 Follower auf Instagram, wo regelmäßig Ausschnitte echter Feiern zu sehen sind. Dazu kommt eigene, professionelle Ton- und Lichttechnik statt zusammengekaufter Leihgeräte.',
      en: 'Most directly by three checkable numbers: over 12 years of experience as a DJ and musician, more than 200 weddings and events accompanied, and over 63,000 followers on Instagram, where real event footage is posted regularly. He also owns his professional sound and lighting equipment rather than sourcing it ad hoc.',
      tr: 'En doğrudan kanıt üç somut rakamda: DJ ve müzisyen olarak 12 yılı aşkın deneyim, 200’den fazla düğün ve etkinlik ve Instagram’da 63.000’i aşkın takipçi; burada düzenli olarak gerçek etkinliklerden görüntüler paylaşılıyor. Ayrıca kiralık değil, kendi profesyonel ses ve ışık ekipmanını kullanıyor.',
    },
    facts: [
      '12+ Jahre Erfahrung',
      '200+ begleitete Hochzeiten & Events',
      '63.000+ Follower auf Instagram',
      'Eigene Ton- und Lichttechnik',
    ],
    related: ['who-is-veysl'],
    links: ['/epk'],
    updated: U,
  },
  {
    id: 'illness-backup',
    category: 'buchung',
    q: {
      de: 'Was passiert, wenn Veysel kurzfristig krank wird oder ausfällt?',
      en: 'What happens if Veysel becomes ill or is unavailable at short notice?',
      tr: 'Veysel aniden hastalanır veya son anda müsait olmazsa ne olur?',
    },
    a: {
      de: 'Ein Ausfall wegen Krankheit ist selten, sollte aber vor der Hochzeit geklärt sein statt am Tag selbst improvisiert zu werden. Ein Vorgehen für einen solchen Fall wird individuell im Planungsgespräch besprochen und Teil des schriftlichen Vertrags. Sprechen Sie das Thema gern schon bei Ihrer Anfrage an, dann fließt die Antwort direkt in Ihr Angebot ein.',
      en: 'A cancellation due to illness is rare, but it should be settled before the wedding day rather than improvised on the spot. Arrangements for that case are discussed individually during the planning call and become part of the written contract. Feel free to raise this in your enquiry — the answer will then be part of your quote.',
      tr: 'Hastalık nedeniyle iptal nadir görülür, ancak düğün gününde doğaçlama yapılacağına önceden netleştirilmesi gereken bir konudur. Böyle bir durum için izlenecek yol, planlama görüşmesinde ayrıca ele alınır ve yazılı sözleşmenin bir parçası olur. Bu konuyu talebinizde belirtmeniz yeterli — yanıt doğrudan teklifinize dahil edilir.',
    },
    related: ['contract-content', 'personal-meeting'],
    links: ['/anfrage'],
    updated: U,
  },
  {
    id: 'instagram-vs-form',
    category: 'buchung',
    q: {
      de: 'Reicht eine Anfrage über Instagram oder sollte ich lieber das Formular nutzen?',
      en: 'Is an enquiry via Instagram enough, or should I use the form instead?',
      tr: 'Instagram üzerinden bir talep yeterli mi, yoksa formu mu kullanmalıyım?',
    },
    a: {
      de: 'Beides erreicht ihn, aber das Anfrageformular auf dieser Seite ist der zuverlässigere Weg: Es erfasst Datum, Ort, Gästezahl und Wünsche strukturiert, sodass innerhalb von 24 Stunden eine verbindliche Rückmeldung zur Verfügbarkeit möglich ist. Eine Nachricht über Instagram funktioniert für eine erste, unverbindliche Kontaktaufnahme, ersetzt aber keine vollständige Anfrage.',
      en: 'Both reach him, but the enquiry form on this site is the more reliable route: it captures date, location, guest count and wishes in a structured way, allowing a definitive availability answer within 24 hours. A message on Instagram works for a first, informal contact but doesn’t replace a full enquiry.',
      tr: 'İkisi de ona ulaşır, ancak bu sitedeki talep formu daha güvenilir bir yoldur: tarih, yer, misafir sayısı ve isteklerinizi yapılandırılmış biçimde kaydeder, böylece 24 saat içinde kesin bir uygunluk yanıtı alınabilir. Instagram üzerinden bir mesaj ilk, resmi olmayan temas için işe yarar ama tam bir talebin yerini tutmaz.',
    },
    facts: ['Antwort in der Regel innerhalb von 24 Stunden'],
    related: ['who-is-veysl'],
    links: ['/anfrage'],
    updated: U,
  },
  {
    id: 'personal-meeting',
    category: 'buchung',
    q: {
      de: 'Gibt es vor der Buchung ein persönliches Kennenlernen?',
      en: 'Is there a personal introductory meeting before booking?',
      tr: 'Rezervasyondan önce yüz yüze bir tanışma görüşmesi yapılıyor mu?',
    },
    a: {
      de: 'Ja. Nach der ersten Anfrage folgt ein Video- oder Vor-Ort-Gespräch, in dem Ablauf, Musikgeschmack, No-Gos und Timing besprochen werden, bevor ein schriftliches Angebot erstellt wird. Im Signature-Paket sind zwei Planungsgespräche vorgesehen, im Prestige-Paket eine unbegrenzte Anzahl inklusive einer Location-Begehung vorab.',
      en: 'Yes. After the initial enquiry, a video or in-person meeting covers the schedule, musical taste, no-gos and timing before a written quote is drawn up. The Signature package includes two planning calls, and Prestige includes an unlimited number plus an advance venue walk-through.',
      tr: 'Evet. İlk talebin ardından, yazılı teklif hazırlanmadan önce akış, müzik zevki, istenmeyenler ve zamanlama video görüşmesinde ya da yüz yüze bir toplantıda konuşulur. Signature paketinde iki planlama görüşmesi, Prestige paketinde ise sınırsız sayıda görüşme ve önceden mekân keşfi bulunur.',
    },
    facts: ['Signature: 2 Planungsgespräche', 'Prestige: unbegrenzte Planungsgespräche + Location-Begehung vorab'],
    related: ['contract-content', 'planning-call'],
    links: ['/anfrage', '/pakete'],
    updated: U,
  },
  {
    id: 'change-after-signing',
    category: 'buchung',
    q: {
      de: 'Kann der Ablaufplan nach Vertragsunterschrift noch geändert werden?',
      en: 'Can the running order still be changed after the contract is signed?',
      tr: 'Sözleşme imzalandıktan sonra akış planı hâlâ değiştirilebilir mi?',
    },
    a: {
      de: 'Kleinere Anpassungen — etwa eine verschobene Uhrzeit, ein anderes Musikstück für den Eröffnungstanz oder eine ergänzte Wunschliste — sind bis kurz vor der Feier üblich und werden im laufenden Austausch nachgezogen. Größere Änderungen, die den vereinbarten Umfang betreffen, etwa mehr Spielzeit oder ein Locationwechsel, werden schriftlich im Vertrag nachgetragen.',
      en: 'Smaller adjustments — a shifted start time, a different first-dance song, or an updated wishlist — are normal right up until shortly before the event and are simply updated along the way. Bigger changes that affect the agreed scope, such as more playing time or a venue change, are added to the written contract.',
      tr: 'Küçük değişiklikler — saatin kayması, açılış dansı şarkısının değişmesi ya da istek listesinin güncellenmesi gibi — düğüne kısa süre kalana kadar normaldir ve süreç içinde güncellenir. Anlaşılan kapsamı etkileyen büyük değişiklikler, örneğin daha uzun çalma süresi ya da mekân değişikliği, yazılı sözleşmeye eklenir.',
    },
    related: ['contract-content', 'run-of-show'],
    links: ['/anfrage'],
    updated: U,
  },
  {
    id: 'short-notice',
    category: 'buchung',
    q: {
      de: 'Sind auch kurzfristige Termine möglich, zum Beispiel in sechs bis acht Wochen?',
      en: 'Are short-notice dates possible too, for example in six to eight weeks?',
      tr: 'Altı ile sekiz hafta gibi kısa vadeli tarihler için de rezervasyon mümkün mü?',
    },
    a: {
      de: 'Ja, das kommt auf die Verfügbarkeit an: Für Samstage in der Hauptsaison von Mai bis September ist mit 12 bis 18 Monaten Vorlauf zu rechnen, aber Werktage, Nebensaison-Termine oder kurzfristige Absagen anderer Feiern schaffen immer wieder freie Slots. Die Verfügbarkeit für ein konkretes Datum wird innerhalb von 24 Stunden geprüft — auch kurzfristig.',
      en: 'Yes, it depends on availability: Saturdays in the peak season from May to September typically need 12 to 18 months’ lead time, but weekdays, off-season dates or last-minute cancellations from other bookings regularly open up free slots. Availability for a specific date is checked within 24 hours, even at short notice.',
      tr: 'Evet, bu uygunluğa bağlıdır: Mayıs-Eylül yoğun sezonundaki cumartesi günleri için genelde 12-18 ay öncesinden rezervasyon gerekir, ancak hafta içi günler, sezon dışı tarihler veya başka bir organizasyonun son anda iptali sık sık boş tarihler doğurur. Belirli bir tarih için uygunluk, son dakika olsa bile 24 saat içinde kontrol edilir.',
    },
    facts: ['12–18 Monate Vorlauf für Samstage Mai–September', 'Verfügbarkeitsprüfung innerhalb von 24 Stunden'],
    related: ['who-is-veysl'],
    links: ['/anfrage'],
    updated: U,
  },

  // ─── preis ────────────────────────────────────────────────────────────
  {
    id: 'cost-drivers',
    category: 'preis',
    q: {
      de: 'Warum unterscheiden sich die Preise verschiedener Hochzeits-DJs so stark?',
      en: 'Why do wedding DJ prices vary so much from one DJ to another?',
      tr: 'Düğün DJ’lerinin fiyatları neden bu kadar farklı olabiliyor?',
    },
    a: {
      de: 'Der Preis hängt vor allem von vier Faktoren ab: Spielzeit, Gästezahl, Technikbedarf (Tonanlage, Licht, Zonenanzahl) und Anfahrt. Ein DJ mit eigener, hochwertiger Ton- und Lichttechnik sowie zusätzlicher Moderation oder Live-Musik kalkuliert entsprechend anders als ein reiner Auflege-Service ohne Zusatzleistungen. Die drei Pakete auf dieser Seite zeigen den üblichen Rahmen; das verbindliche Angebot folgt nach dem Planungsgespräch.',
      en: 'Price mainly depends on four factors: playing time, guest count, technical requirements (sound, lighting, number of zones) and travel. A DJ who owns high-quality sound and lighting equipment and also offers hosting or live music prices differently from a bare-bones playback-only service. The three packages on this page show the usual range; the binding quote follows the planning call.',
      tr: 'Fiyat esas olarak dört etkene bağlıdır: çalma süresi, misafir sayısı, teknik ihtiyaç (ses, ışık, bölge sayısı) ve ulaşım. Kendi kaliteli ses ve ışık ekipmanına sahip, ayrıca sunum veya canlı müzik de sunan bir DJ, sadece müzik çalan bir hizmetten farklı fiyatlandırılır. Bu sayfadaki üç paket genel çerçeveyi gösterir; kesin teklif planlama görüşmesinden sonra verilir.',
    },
    related: ['travel-included', 'extras-included'],
    links: ['/pakete'],
    updated: U,
  },
  {
    id: 'travel-included',
    category: 'preis',
    q: {
      de: 'Ist die Anfahrt im Preis enthalten?',
      en: 'Is travel included in the price?',
      tr: 'Ulaşım masrafı fiyata dahil mi?',
    },
    a: {
      de: 'Ja, alle drei Pakete verstehen sich inklusive Anfahrt innerhalb von 50 Kilometern rund um Stuttgart. Liegt Ihre Location weiter entfernt — etwa deutschlandweit oder für eine Destination Wedding in Europa — wird die zusätzliche Anfahrt transparent im individuellen Angebot ausgewiesen, ebenso eine mögliche Übernachtung.',
      en: 'Yes, all three packages include travel within 50 kilometres of Stuttgart. If your venue is further away — nationwide in Germany or for a destination wedding in Europe — the extra travel is itemised transparently in the individual quote, along with any overnight stay if needed.',
      tr: 'Evet, üç paketin tamamı Stuttgart çevresinde 50 kilometreye kadar ulaşımı içerir. Mekânınız daha uzaktaysa — Almanya genelinde ya da Avrupa’da bir destination wedding için — ek ulaşım masrafı, gerekirse konaklamayla birlikte, bireysel teklifte açıkça belirtilir.',
    },
    facts: ['Anfahrt inklusive bis 50 km um Stuttgart'],
    related: ['destination-logistics', 'service-area'],
    links: ['/pakete'],
    updated: U,
  },
  {
    id: 'weekday-discount',
    category: 'preis',
    q: {
      de: 'Gibt es günstigere Preise für Hochzeiten unter der Woche oder außerhalb der Saison?',
      en: 'Are weekday or off-season weddings priced more favourably?',
      tr: 'Hafta içi veya sezon dışı düğünler için daha uygun fiyat var mı?',
    },
    a: {
      de: 'Ein pauschaler Rabatt ist nicht öffentlich ausgewiesen, weil sich der Preis ohnehin individuell aus Spielzeit, Gästezahl und Technikbedarf ergibt — und diese Faktoren unterscheiden sich bei Wochentags- oder Nebensaison-Feiern oft ohnehin. Fragen Sie Ihr Datum konkret an: In der Anfrage lässt sich klären, ob ein Werktag oder ein Termin außerhalb von Mai bis September Spielraum im Angebot schafft.',
      en: 'No blanket discount is publicly listed, because pricing is calculated individually from playing time, guest count and technical needs anyway — and those factors often differ for weekday or off-season celebrations regardless. Ask about your specific date: the enquiry is where it becomes clear whether a weekday or a date outside May to September creates room in the quote.',
      tr: 'Genel bir indirim kamuya açık şekilde belirtilmemiştir çünkü fiyat zaten çalma süresi, misafir sayısı ve teknik ihtiyaca göre bireysel hesaplanır — bu etkenler hafta içi ya da sezon dışı düğünlerde zaten farklı olabilir. Tarihinizi doğrudan sorun: talep sırasında, hafta içi bir gün ya da Mayıs-Eylül dışındaki bir tarihin teklifte esneklik yaratıp yaratmayacağı netleşir.',
    },
    related: ['cost-drivers', 'short-notice'],
    links: ['/anfrage'],
    updated: U,
  },
  {
    id: 'extras-included',
    category: 'preis',
    q: {
      de: 'Kosten Moderation und Live-Musik mit Saz oder Gitarre zusätzlich zum DJ-Set?',
      en: 'Do hosting and live music on saz or guitar cost extra on top of the DJ set?',
      tr: 'Sunum ve saz ya da gitarla canlı müzik, DJ setine ek olarak ücretlendirilir mi?',
    },
    a: {
      de: 'Moderation auf Deutsch, Türkisch und Englisch sowie Live-Musik an Saz und Gitarre sind keine fremd zugekauften Zusatzbuchungen, sondern kommen aus einer Hand — Veysel spielt beide Instrumente selbst seit seiner Kindheit. Ob und in welchem Umfang sie für Ihre Feier sinnvoll sind, wird im Planungsgespräch besprochen und fließt in das individuelle Angebot ein, statt als starrer Aufpreis vorab festzustehen.',
      en: 'Hosting in German, Turkish and English, as well as live music on saz and guitar, aren’t outsourced add-ons — they come from one source, since Veysel has played both instruments himself since childhood. Whether and how much of this makes sense for your celebration is discussed during the planning call and reflected in the individual quote, rather than fixed as a flat surcharge upfront.',
      tr: 'Almanca, Türkçe ve İngilizce sunum ile saz ve gitarda canlı müzik, dışarıdan satın alınan ek hizmetler değildir, tek bir kaynaktan gelir — ikisini de çocukluğundan beri kendisi çalıyor. Düğününüz için ne ölçüde anlamlı olacağı planlama görüşmesinde konuşulur ve önceden sabit bir ek ücret olarak değil, bireysel teklife yansıtılır.',
    },
    facts: ['Moderation: Deutsch, Türkisch, Englisch', 'Live-Musik: Saz & Gitarre seit der Kindheit'],
    related: ['live-vs-dj', 'who-is-veysl'],
    links: ['/hochzeit-events', '/musik'],
    updated: U,
  },
  {
    id: 'invoice-vat',
    category: 'preis',
    q: {
      de: 'Wird für Firmenevents eine Rechnung mit ausgewiesener Umsatzsteuer ausgestellt?',
      en: 'Is an invoice with itemised VAT issued for corporate events?',
      tr: 'Kurumsal etkinlikler için KDV’si ayrıca gösterilen bir fatura kesiliyor mu?',
    },
    a: {
      de: 'Ja, für Firmenevents wie Sommerfeste, Weihnachtsfeiern oder Produktlaunches gehört eine Rechnung mit ausgewiesener Umsatzsteuer zum festen Leistungsversprechen. Ein fester Ansprechpartner ist zudem bis zum Ende der Veranstaltung verfügbar. Details zur Rechnungsstellung für private Hochzeiten klären Sie am besten direkt im Angebotsgespräch.',
      en: 'Yes, for corporate events such as summer parties, Christmas parties or product launches, an invoice with itemised VAT is a standard part of the service. A dedicated contact is also available until the event ends. For invoicing details on private weddings, it’s best to clarify directly during the quote conversation.',
      tr: 'Evet, yaz partileri, yılbaşı kutlamaları veya ürün lansmanları gibi kurumsal etkinlikler için KDV’si ayrıca gösterilen bir fatura standart hizmetin parçasıdır. Ayrıca etkinlik bitene kadar sabit bir irtibat kişisi bulunur. Özel düğünlerde faturalandırma detayları en iyi şekilde teklif görüşmesinde netleştirilir.',
    },
    related: ['cost-drivers'],
    links: ['/hochzeit-events'],
    updated: U,
  },

  // ─── ablauf ───────────────────────────────────────────────────────────
  {
    id: 'planning-call',
    category: 'ablauf',
    q: {
      de: 'Was genau wird im Planungsgespräch vor der Hochzeit besprochen?',
      en: 'What exactly is discussed during the planning call before the wedding?',
      tr: 'Düğün öncesi planlama görüşmesinde tam olarak neler konuşulur?',
    },
    a: {
      de: 'Im Planungsgespräch — per Video oder vor Ort — geht es um den zeitlichen Ablauf des Tages, Musikgeschmack und No-Gos, Schlüsselmomente wie Einzug und Eröffnungstanz sowie die technischen Rahmenbedingungen der Location. Nach der Buchung folgt ein zweites, detaillierteres Gespräch (im Signature-Paket enthalten), in dem Timing und Wunschliste final abgestimmt werden.',
      en: 'The planning call — by video or in person — covers the day’s timeline, musical taste and no-gos, key moments such as the entrance and first dance, and the venue’s technical conditions. After booking, a second, more detailed call follows (included in the Signature package) where timing and the wishlist are finalised.',
      tr: 'Planlama görüşmesi — video ya da yüz yüze — günün zaman akışını, müzik zevkini ve istenmeyenleri, giriş ve açılış dansı gibi kilit anları ve mekânın teknik koşullarını kapsar. Rezervasyondan sonra (Signature pakete dahil) daha detaylı ikinci bir görüşme yapılır ve zamanlama ile istek listesi kesinleştirilir.',
    },
    related: ['personal-meeting', 'first-dance'],
    links: ['/ablauf'],
    updated: U,
  },
  {
    id: 'photographer-planner',
    category: 'ablauf',
    q: {
      de: 'Arbeitet er auch direkt mit der Hochzeitsplanerin und dem Fotografen zusammen?',
      en: 'Does he coordinate directly with the wedding planner and photographer?',
      tr: 'Düğün planlayıcısı ve fotoğrafçıyla doğrudan koordinasyon sağlıyor mu?',
    },
    a: {
      de: 'Ja, die Abstimmung mit Fotograf, Caterer, Location und Hochzeitsplanerin ist fester Bestandteil der Vorbereitung — insbesondere bei Schlüsselmomenten wie Einzug, Anschnitt oder Eröffnungstanz, bei denen Timing zwischen DJ und Kamera exakt passen muss. Kontaktdaten Dritter werden auf Wunsch direkt ausgetauscht, damit am Tag selbst nichts doppelt abgestimmt werden muss.',
      en: 'Yes, coordinating with the photographer, caterer, venue and wedding planner is a standard part of the preparation — especially for key moments like the entrance, cake-cutting or first dance, where the timing between DJ and camera needs to line up exactly. Contact details for third parties are exchanged directly on request, so nothing needs double-checking on the day itself.',
      tr: 'Evet, fotoğrafçı, catering, mekân ve düğün planlayıcısıyla koordinasyon hazırlığın standart bir parçasıdır — özellikle giriş, pasta kesimi veya açılış dansı gibi DJ ile kameranın zamanlamasının tam örtüşmesi gereken anlarda. Talep üzerine üçüncü tarafların iletişim bilgileri doğrudan paylaşılır, böylece günün kendisinde hiçbir şey iki kez koordine edilmek zorunda kalmaz.',
    },
    related: ['first-dance', 'run-of-show'],
    links: ['/hochzeit-events'],
    updated: U,
  },
  {
    id: 'first-dance',
    category: 'ablauf',
    q: {
      de: 'Wie wird der Eröffnungstanz vorbereitet?',
      en: 'How is the first dance prepared?',
      tr: 'Açılış dansı nasıl hazırlanır?',
    },
    a: {
      de: 'Der Song und die gewünschte Version (Radio-Edit, längere Albumversion oder ein spezielles Mashup) werden im Planungsgespräch festgelegt und vorab technisch vorbereitet, inklusive sauberem Ein- und Ausblenden. Im Signature- und im Prestige-Paket ist eine begleitete Choreografie-Abstimmung enthalten, damit Einsatz, Tempo und Lichtstimmung exakt zum eingeübten Tanz passen.',
      en: 'The song and preferred version (radio edit, extended album cut or a custom mashup) are set during the planning call and prepared technically in advance, including a clean fade-in and fade-out. Both the Signature and Prestige packages include coordinated choreography support, so the cue, tempo and lighting mood match the rehearsed dance exactly.',
      tr: 'Şarkı ve tercih edilen versiyon (radyo düzenlemesi, uzun albüm versiyonu veya özel bir mashup) planlama görüşmesinde belirlenir ve önceden teknik olarak hazırlanır; temiz bir giriş-çıkış geçişi dahil. Signature ve Prestige paketlerinde koreografi desteği de bulunur, böylece müzik girişi, tempo ve ışık atmosferi provası yapılmış dansla tam örtüşür.',
    },
    facts: ['Eröffnungstanz-Choreografie: enthalten in Signature & Prestige'],
    related: ['planning-call', 'photographer-planner'],
    links: ['/pakete'],
    updated: U,
  },
  {
    id: 'run-of-show',
    category: 'ablauf',
    q: {
      de: 'Kann das Brautpaar den Ablauf des Abends selbst mitgestalten?',
      en: 'Can the couple help shape the running order of the evening themselves?',
      tr: 'Çift, akşamın akışını kendi istekleriyle şekillendirebilir mi?',
    },
    a: {
      de: 'Ja, der Spannungsbogen des Abends — von Sektempfang über Dinner bis Peaktime — wird gemeinsam im Planungsgespräch entworfen, nicht vorgegeben. Sie bestimmen Reihenfolge und Schwerpunkte der Programmpunkte wie Reden, Anschnitt oder Spiele; die musikalische und moderative Umsetzung dazwischen liegt dann in professioneller Hand, damit keine Lücken entstehen.',
      en: 'Yes, the arc of the evening — from the champagne reception through dinner to peak time — is designed together during the planning call, not dictated in advance. You decide the order and emphasis of programme moments like speeches, cake-cutting or games; the musical and hosting execution in between is then handled professionally so no gaps appear.',
      tr: 'Evet, akşamın akışı — kokteyl karşılamasından yemeğe, oradan da dansın doruğuna kadar — önceden dayatılmaz, planlama görüşmesinde birlikte tasarlanır. Konuşmalar, pasta kesimi veya oyunlar gibi program noktalarının sırasını ve ağırlığını siz belirlersiniz; aradaki müzikal ve sunum kısmı ise boşluk kalmaması için profesyonelce yürütülür.',
    },
    related: ['planning-call', 'photographer-planner'],
    links: ['/ablauf'],
    updated: U,
  },
  {
    id: 'outdoor-ceremony-power',
    category: 'ablauf',
    q: {
      de: 'Kann eine freie Trauung im Freien beschallt werden, wenn keine Steckdose in der Nähe ist?',
      en: 'Can an outdoor ceremony be given sound if there’s no power socket nearby?',
      tr: 'Yakında priz olmayan açık hava töreni için ses düzeni sağlanabilir mi?',
    },
    a: {
      de: 'Das lässt sich in aller Regel lösen, muss aber vorab technisch geklärt werden statt am Tag zu improvisieren. Bei der Location-Abstimmung im Planungsgespräch wird erfasst, wo Strom verfügbar ist und welche zusätzliche Lösung — etwa ein längeres Kabel oder eine autarke Stromquelle — für Ihre konkrete Trauungslocation nötig ist.',
      en: 'This can usually be solved, but it needs to be clarified technically in advance rather than improvised on the day. As part of coordinating the venue during the planning call, it’s established where power is available and what additional solution — a longer cable or a self-sufficient power source — your specific ceremony location needs.',
      tr: 'Bu genellikle çözülebilir bir konudur, ancak gün içinde doğaçlama yapılmak yerine önceden teknik olarak netleştirilmelidir. Planlama görüşmesinde mekân koordinasyonu yapılırken, elektriğin nerede mevcut olduğu ve tören mekânınız için hangi ek çözümün — daha uzun bir kablo ya da bağımsız bir güç kaynağı gibi — gerekli olduğu belirlenir.',
    },
    related: ['power-requirements', 'outdoor-weather'],
    links: ['/hochzeit-events'],
    updated: U,
  },

  // ─── musik ────────────────────────────────────────────────────────────
  {
    id: 'live-vs-dj',
    category: 'musik',
    q: {
      de: 'Spielt er auch Live-Musik mit Saz oder Gitarre statt nur aufgelegter Musik?',
      en: 'Does he also play live music on saz or guitar, not just play back recorded music?',
      tr: 'Sadece hazır müzik çalmak yerine saz veya gitarla canlı müzik de çalıyor mu?',
    },
    a: {
      de: 'Ja — Saz und Gitarre spielt Veysel seit seiner Kindheit selbst, live und nicht als zugekaufte Zusatzleistung. Live-Musik lässt sich gezielt für einzelne Momente einsetzen, etwa während des Sektempfangs, zur Trauung oder als akustischer Auftakt vor dem eigentlichen DJ-Set, und wird im Planungsgespräch mit dem übrigen Ablauf abgestimmt.',
      en: 'Yes — Veysel has played saz and guitar himself since childhood, live and not as an outsourced extra. Live music can be used deliberately for specific moments, for example during the champagne reception, the ceremony, or as an acoustic opener before the actual DJ set, and is coordinated with the rest of the timeline during the planning call.',
      tr: 'Evet — Veysel saz ve gitarı çocukluğundan beri kendisi çalıyor; canlı olarak, dışarıdan satın alınan bir ek hizmet olarak değil. Canlı müzik, kokteyl karşılaması, tören ya da asıl DJ setinden önceki akustik bir açılış gibi belirli anlarda özellikle kullanılabilir ve planlama görüşmesinde diğer akışla koordine edilir.',
    },
    facts: ['Saz & Gitarre seit der Kindheit'],
    related: ['orchestra-vs-dj', 'extras-included'],
    links: ['/musik', '/epk'],
    updated: U,
  },
  {
    id: 'orchestra-vs-dj',
    category: 'musik',
    q: {
      de: 'Was ist der Unterschied zwischen einem reinen DJ-Set und der Live-Orchester-Option?',
      en: 'What’s the difference between a plain DJ set and the live-orchestra option?',
      tr: 'Sade bir DJ seti ile canlı orkestra seçeneği arasındaki fark nedir?',
    },
    a: {
      de: 'Ein DJ-Set läuft über Laptop und Controller; die Live-Orchester-Option kombiniert das aufgelegte Programm mit einer Live-Band inklusive Bläsern — er selbst beschreibt dieses Format als DJ & Orkestra. So kommen DJ-Set, Live-Musik und Moderation aus einer Hand statt von getrennten Anbietern. Umfang und Besetzung werden individuell besprochen, da es kein festes Standardpaket ist.',
      en: 'A DJ set runs via laptop and controller; the live-orchestra option combines the programmed set with a live band including horns — he describes this format himself as DJ & Orkestra. That means the DJ set, live music and hosting all come from one source rather than separate suppliers. Scope and line-up are discussed individually, since it isn’t a fixed standard package.',
      tr: 'DJ seti laptop ve kontrolcü üzerinden yürütülür; canlı orkestra seçeneği ise çalınan programı nefesli çalgılar da dahil canlı bir grupla birleştirir — bu formatı kendisi DJ & Orkestra olarak tanımlıyor. Böylece DJ seti, canlı müzik ve sunum, ayrı tedarikçiler yerine tek bir kaynaktan gelir. Kapsam ve kadro, sabit bir standart paket olmadığı için ayrıca görüşülür.',
    },
    facts: ['Format: DJ & Orkestra — DJ-Set + Live-Band mit Bläsern'],
    related: ['live-vs-dj', 'halay-repertoire'],
    links: ['/musik'],
    updated: U,
  },
  {
    id: 'genre-range',
    category: 'musik',
    q: {
      de: 'Wird eher aktuelle Chartmusik gespielt oder auch zeitlose Klassiker?',
      en: 'Is it mostly current chart music, or timeless classics too?',
      tr: 'Daha çok güncel hit müzikler mi çalınır, yoksa zamansız klasikler de var mı?',
    },
    a: {
      de: 'Beides, gemischt statt nacheinander abgehakt: Das Repertoire reicht von aktuellen internationalen und deutschen Charts über House bis zu zeitlosen Classics sowie türkischen Genres wie Arabesk und Halay. Welche Gewichtung für Ihre Feier passt, wird über die individuelle Wunschliste gesteuert — nicht durch ein starres Standardprogramm.',
      en: 'Both, blended rather than played in separate blocks: the repertoire ranges from current international and German charts through house to timeless classics, plus Turkish genres like arabesk and halay. Which balance suits your celebration is steered by your individual wishlist, not by a fixed standard programme.',
      tr: 'İkisi de, ayrı bloklar halinde değil harmanlanmış şekilde: repertuvar güncel uluslararası ve Alman hit listelerinden house müziğe, zamansız klasiklere ve arabesk, halay gibi Türk türlerine kadar uzanır. Düğününüze uygun dengenin ne olacağı, sabit bir standart programla değil, kişisel istek listenizle belirlenir.',
    },
    related: ['no-go-list', 'halay-repertoire'],
    links: ['/musik'],
    updated: U,
  },
  {
    id: 'no-go-list',
    category: 'musik',
    q: {
      de: 'Ist die No-Go-Liste wirklich verbindlich, oder wird am Abend improvisiert?',
      en: 'Is the no-go list actually binding, or does it get improvised on the night?',
      tr: 'İstenmeyenler listesi gerçekten bağlayıcı mı, yoksa akşam doğaçlama mı yapılır?',
    },
    a: {
      de: 'Die No-Go-Liste ist verbindlich — genau dafür gibt es sie. Jede Buchung enthält eine individuelle Musikwunschliste inklusive einer ausdrücklichen No-Go-Liste, die vorab gemeinsam erstellt wird. Gästewünsche am Abend werden nur gespielt, wenn sie nicht gegen diese Liste verstoßen und zum Rahmen des Abends passen.',
      en: 'The no-go list is binding — that’s exactly what it’s for. Every booking includes an individual music wishlist plus an explicit no-go list, drawn up together in advance. Guest requests on the night are only played if they don’t conflict with that list and fit the tone of the evening.',
      tr: 'İstenmeyenler listesi bağlayıcıdır — zaten bunun için oluşturulur. Her rezervasyon, önceden birlikte hazırlanan istenmeyenler listesi dahil kişisel bir müzik istek listesi içerir. Gece boyunca gelen misafir istekleri, ancak bu listeyle çelişmiyorsa ve akşamın genel havasına uyuyorsa çalınır.',
    },
    facts: ['Musikwunschliste inkl. No-Go-Liste in jeder Buchung enthalten'],
    related: ['guest-requests-night'],
    links: ['/hochzeit-events'],
    updated: U,
  },
  {
    id: 'guest-requests-night',
    category: 'musik',
    q: {
      de: 'Wie werden spontane Musikwünsche von Gästen am Hochzeitsabend behandelt?',
      en: 'How are spontaneous song requests from guests handled on the wedding night?',
      tr: 'Düğün gecesi misafirlerden gelen ani müzik istekleri nasıl değerlendirilir?',
    },
    a: {
      de: 'Gästewünsche sind willkommen und werden während des Abends direkt entgegengenommen. Entscheidend ist der Abgleich mit der vorab erstellten Wunsch- und No-Go-Liste des Brautpaars: Passt ein spontaner Wunsch dazu, wird er eingebaut; widerspricht er dem vereinbarten Rahmen, wird diplomatisch, aber konsequent daran festgehalten.',
      en: 'Guest requests are welcome and taken directly during the evening. What matters is checking them against the couple’s pre-agreed wishlist and no-go list: a spontaneous request that fits gets worked in; one that contradicts the agreed frame is politely but firmly declined.',
      tr: 'Misafir istekleri memnuniyetle karşılanır ve akşam boyunca doğrudan alınır. Önemli olan, bu isteklerin çiftin önceden hazırladığı istek ve istenmeyenler listesiyle karşılaştırılmasıdır: uygun olan anlık bir istek çalınır; kararlaştırılan çerçeveyle çelişen bir istek ise nazikçe ama kararlılıkla reddedilir.',
    },
    related: ['no-go-list'],
    links: ['/musik'],
    updated: U,
  },

  // ─── technik ──────────────────────────────────────────────────────────
  {
    id: 'equipment-brought',
    category: 'technik',
    q: {
      de: 'Welche Ton- und Lichttechnik wird zur Hochzeit mitgebracht?',
      en: 'What sound and lighting equipment is brought to the wedding?',
      tr: 'Düğüne hangi ses ve ışık ekipmanı getiriliyor?',
    },
    a: {
      de: 'Der Umfang richtet sich nach Gästezahl und Paket: Essential deckt eine Tonanlage für bis zu 80 Gäste und Grundlicht für die Tanzfläche ab, Signature eine Anlage für bis zu 150 Gäste mit erweitertem Lichtdesign inklusive Uplights und einem zweiten Lautsprecher-Set für einen Nebenraum, Prestige mehrere Zonen für 150+ Gäste mit Moving Heads und Haze.',
      en: 'The scope depends on guest count and package: Essential covers a sound system for up to 80 guests and basic dance-floor lighting, Signature a system for up to 150 guests with expanded lighting including uplights and a second speaker set for an adjoining room, Prestige multiple zones for 150+ guests with moving heads and haze.',
      tr: 'Kapsam, misafir sayısına ve pakete göre değişir: Essential 80 kişiye kadar ses sistemi ve dans pisti için temel ışık sunar; Signature, uplight’lar dahil gelişmiş ışık tasarımı ve yan bir mekân için ikinci hoparlör setiyle 150 kişiye kadar bir sistem sunar; Prestige ise moving head ve sis makinesiyle 150+ kişi için birden fazla bölge sunar.',
    },
    facts: [
      'Essential: bis 80 Gäste',
      'Signature: bis 150 Gäste + Uplights',
      'Prestige: 150+ Gäste, mehrere Zonen, Moving Heads & Haze',
    ],
    related: ['rental-only', 'wireless-mic'],
    links: ['/pakete'],
    updated: U,
  },
  {
    id: 'rental-only',
    category: 'technik',
    q: {
      de: 'Kann die Ton- und Lichttechnik auch ohne DJ-Buchung separat gemietet werden?',
      en: 'Can the sound and lighting equipment be rented separately, without booking a DJ?',
      tr: 'Ses ve ışık ekipmanı, DJ rezervasyonu olmadan ayrıca kiralanabilir mi?',
    },
    a: {
      de: 'Ja. Neben DJ, Moderation und Live-Musik gehört die Vermietung von Ton-, Licht- und Veranstaltungstechnik zu den eigenständigen Leistungen — die Technik gehört ihm selbst und wird auch ohne begleitendes DJ-Set professionell aufgebaut zur Verfügung gestellt. Umfang und Konditionen werden individuell über das Anfrageformular abgestimmt.',
      en: 'Yes. Alongside DJ services, hosting and live music, renting out sound, lighting and event technology is a standalone offering — the equipment is owned outright and is also provided professionally set up without an accompanying DJ set. Scope and terms are worked out individually through the enquiry form.',
      tr: 'Evet. DJ hizmeti, sunum ve canlı müziğin yanı sıra, ses, ışık ve etkinlik teknolojisinin kiralanması da bağımsız bir hizmettir — ekipman kendisine aittir ve DJ seti olmadan da profesyonelce kurulmuş şekilde sağlanabilir. Kapsam ve koşullar talep formu üzerinden bireysel olarak belirlenir.',
    },
    facts: ['Eigene Ton-, Licht- & Veranstaltungstechnik — auch separat mietbar'],
    related: ['equipment-brought'],
    links: ['/kontakt', '/anfrage'],
    updated: U,
  },
  {
    id: 'power-requirements',
    category: 'technik',
    q: {
      de: 'Welche Stromversorgung braucht die Technik vor Ort?',
      en: 'What power supply does the equipment need on site?',
      tr: 'Ekipmanın mekânda hangi elektrik altyapısına ihtiyacı var?',
    },
    a: {
      de: 'Das hängt vom gebuchten Umfang ab und wird nicht dem Zufall überlassen: Standard-Steckdosen reichen für kleinere Setups, größere Licht- und Mehrzonen-Anlagen im Prestige-Paket benötigen mehr Absicherung. Die konkreten Anforderungen für Ihre Location werden im Planungsgespräch abgefragt und bei Bedarf mit Location oder Caterer vorab abgestimmt.',
      en: 'This depends on the booked scope and isn’t left to chance: standard sockets are enough for smaller setups, while the larger, multi-zone lighting rigs in the Prestige package need more circuit capacity. The specific requirements for your venue are covered during the planning call and, if needed, coordinated with the venue or caterer in advance.',
      tr: 'Bu, rezerve edilen kapsama bağlıdır ve tesadüfe bırakılmaz: standart prizler küçük kurulumlar için yeterlidir, Prestige paketindeki daha büyük ve çok bölgeli ışık sistemleri ise daha fazla elektrik kapasitesi gerektirir. Mekânınıza özel gereksinimler planlama görüşmesinde ele alınır ve gerekirse mekân veya catering ile önceden koordine edilir.',
    },
    related: ['outdoor-ceremony-power', 'outdoor-weather'],
    links: ['/hochzeit-events'],
    updated: U,
  },
  {
    id: 'outdoor-weather',
    category: 'technik',
    q: {
      de: 'Funktioniert das Setup auch bei Freiluft-Hochzeiten und im Freien?',
      en: 'Does the setup also work for outdoor weddings and open-air venues?',
      tr: 'Kurulum, açık hava düğünlerinde de sorunsuz çalışıyor mu?',
    },
    a: {
      de: 'Grundsätzlich ja, Outdoor-Setups sind Teil der laufenden Praxis, etwa bei Sektempfängen im Garten oder freien Trauungen im Weingut. Wetter- und Untergrundbedingungen — Regenschutz, Stromquelle, stabiler Stand für Technik — werden vorab in der Location-Abstimmung geklärt, damit am Tag selbst nichts spontan improvisiert werden muss.',
      en: 'Generally yes, outdoor setups are part of everyday practice, for example for garden champagne receptions or open-air ceremonies at a vineyard. Weather and ground conditions — rain cover, a power source, stable footing for equipment — are clarified in advance during venue coordination, so nothing needs improvising on the day itself.',
      tr: 'Genel olarak evet, açık hava kurulumları — bahçede kokteyl karşılaması ya da bir bağ evinde açık hava töreni gibi — günlük uygulamanın bir parçasıdır. Hava ve zemin koşulları — yağmur koruması, güç kaynağı, ekipman için sağlam bir zemin — gün içinde doğaçlama yapılmasın diye önceden mekân koordinasyonunda netleştirilir.',
    },
    related: ['outdoor-ceremony-power', 'power-requirements'],
    links: ['/hochzeit-events'],
    updated: U,
  },
  {
    id: 'wireless-mic',
    category: 'technik',
    q: {
      de: 'Wird ein Funkmikrofon für Reden und Glückwünsche gestellt?',
      en: 'Is a wireless microphone provided for speeches and toasts?',
      tr: 'Konuşmalar ve kutlama mesajları için kablosuz mikrofon sağlanıyor mu?',
    },
    a: {
      de: 'Ja, ein Funkmikrofon für Reden ist bereits im Essential-Paket enthalten und wird bei größeren Paketen um die Beschallung der freien Trauung erweitert. So können Trauzeugen, Eltern oder Gäste ihre Rede halten, ohne dass separat ein Mikrofon organisiert werden muss.',
      en: 'Yes, a wireless microphone for speeches is already included in the Essential package and is extended to cover ceremony sound in the larger packages. That way best men, parents or guests can give their speech without anyone needing to organise a separate microphone.',
      tr: 'Evet, konuşmalar için kablosuz mikrofon Essential pakette zaten dahildir ve daha büyük paketlerde açık hava töreninin seslendirilmesini de kapsayacak şekilde genişletilir. Böylece sağdıçlar, ebeveynler veya misafirler, ayrıca bir mikrofon ayarlamaya gerek kalmadan konuşmalarını yapabilir.',
    },
    facts: ['Funkmikrofon: enthalten ab Essential-Paket'],
    related: ['equipment-brought'],
    links: ['/pakete'],
    updated: U,
  },

  // ─── tuerkisch ────────────────────────────────────────────────────────
  {
    id: 'halay-repertoire',
    category: 'tuerkisch',
    q: {
      de: 'Welche türkischen Musikrichtungen wie Halay, Roman Havası und Arabesk gehören zum Repertoire?',
      en: 'Which Turkish genres like halay, Roman Havası and arabesk are part of the repertoire?',
      tr: 'Halay, Roman havası ve arabesk gibi hangi Türk müzik türleri repertuvarda yer alır?',
    },
    a: {
      de: 'Halay, Roman Havası und Arabesk gehören zum festen Repertoire, ebenso aktuelle türkische Charts — kombiniert mit deutschen und internationalen Sets statt als isolierter Block. Welche Anteile für Ihre Feier passen, hängt von Gästemischung und Ablauf ab und wird im Planungsgespräch mit der individuellen Wunschliste festgelegt.',
      en: 'Halay, Roman Havası and arabesk are part of the core repertoire, alongside current Turkish charts — combined with German and international sets rather than played as an isolated block. How much of each fits your celebration depends on your guest mix and timeline, and is set during the planning call with your individual wishlist.',
      tr: 'Halay, Roman havası ve arabesk, güncel Türkçe hit listeleriyle birlikte temel repertuvarın parçasıdır — ayrı bir blok olarak değil, Alman ve uluslararası setlerle harmanlanarak çalınır. Düğününüze hangi oranın uyacağı misafir karışımınıza ve akışa bağlıdır ve planlama görüşmesinde kişisel istek listenizle birlikte belirlenir.',
    },
    related: ['orchestra-vs-dj', 'timeline-diff'],
    links: ['/musik', '/hochzeit-events'],
    updated: U,
  },
  {
    id: 'davul-zurna',
    category: 'tuerkisch',
    q: {
      de: 'Arbeitet er mit Davul-Zurna-Spielern für den Einzug zusammen?',
      en: 'Does he coordinate with davul-zurna players for the entrance?',
      tr: 'Giriş için davul-zurna ekibiyle koordinasyon sağlıyor mu?',
    },
    a: {
      de: 'Ja, die Abstimmung mit Live-Musikern und Davul-Zurna für Einzug und Zeremonien bei Nişan, Kına Gecesi oder Hochzeit ist ausdrücklich Teil des Angebots für Verlobung und Henna. Timing zwischen Trommel/Zurna und DJ-Set wird vorab durchgesprochen, damit der Übergang zur restlichen Musik nahtlos funktioniert.',
      en: 'Yes, coordinating with live musicians and davul-zurna players for the entrance and ceremonies at nişan, kına gecesi or the wedding itself is explicitly part of the engagement and henna offering. Timing between the drum/zurna and the DJ set is discussed in advance so the transition into the rest of the music runs seamlessly.',
      tr: 'Evet, nişan, kına gecesi ya da düğünde giriş ve tören anları için davul-zurna ekibi ve canlı müzisyenlerle koordinasyon, nişan ve kına hizmetinin açıkça bir parçasıdır. Davul-zurna ile DJ seti arasındaki zamanlama, geçişin sorunsuz olması için önceden konuşulur.',
    },
    related: ['kina-gecesi', 'halay-repertoire'],
    links: ['/hochzeit-events'],
    updated: U,
  },
  {
    id: 'kina-gecesi',
    category: 'tuerkisch',
    q: {
      de: 'Was ist bei einer Kına Gecesi (Henna-Nacht) anders als bei der Hochzeit selbst?',
      en: 'What’s different about a kına gecesi (henna night) compared to the wedding itself?',
      tr: 'Kına gecesinin düğünün kendisinden farkı nedir?',
    },
    a: {
      de: 'Die Kına Gecesi hat einen eigenen Rhythmus: mehr Zeremonie-Charakter mit Einzug der Braut, Henna-Ritual und emotionaleren Liedern, oft kombiniert mit Live-Musikern und Davul-Zurna, bevor der Abend in eine Party übergeht. Der Ablauf wird eigens dafür geplant statt einfach die Hochzeitsdramaturgie zu kopieren.',
      en: 'The kına gecesi has its own rhythm: more ceremonial in character, with the bride’s entrance, the henna ritual and more emotional songs, often combined with live musicians and davul-zurna, before the evening shifts into a party. The running order is planned specifically for it rather than simply copying the wedding’s arc.',
      tr: 'Kına gecesinin kendine has bir akışı vardır: gelinin girişi, kına ritüeli ve daha duygusal şarkılarla daha törensel bir karakter taşır, genellikle canlı müzisyenler ve davul-zurna ile birleşir, ardından akşam bir partiye dönüşür. Akış, düğünün dramaturjisi kopyalanmak yerine özel olarak planlanır.',
    },
    related: ['davul-zurna', 'timeline-diff'],
    links: ['/hochzeit-events'],
    updated: U,
  },
  {
    id: 'bilingual-hosting',
    category: 'tuerkisch',
    q: {
      de: 'Moderiert er zweisprachig für gemischte deutsch-türkische Hochzeitsgesellschaften?',
      en: 'Does he host bilingually for mixed German-Turkish wedding parties?',
      tr: 'Karma Alman-Türk düğün topluluğu için iki dilli sunum yapıyor mu?',
    },
    a: {
      de: 'Ja, Moderation auf Deutsch und Türkisch — bei Bedarf ergänzt um Englisch — ist genau für Familien gedacht, die zwei Kulturen zusammenbringen. Ansagen, Übergänge und Programmpunkte wie Reden oder der Einzug lassen sich so für beide Seiten der Gästeliste verständlich moderieren, statt eine Sprache zu bevorzugen.',
      en: 'Yes, hosting in German and Turkish — with English added where needed — is designed exactly for families bringing two cultures together. Announcements, transitions and programme moments like speeches or the entrance can be hosted so both sides of the guest list understand, instead of favouring one language.',
      tr: 'Evet, gerektiğinde İngilizce de eklenerek Almanca ve Türkçe sunum, tam olarak iki kültürü bir araya getiren aileler için düşünülmüştür. Duyurular, geçişler ve konuşmalar ya da giriş gibi program noktaları, tek bir dili öne çıkarmak yerine misafir listesinin her iki tarafının da anlayacağı şekilde sunulabilir.',
    },
    facts: ['Moderation: Deutsch, Türkisch, Englisch'],
    related: ['halay-repertoire', 'timeline-diff'],
    links: ['/hochzeit-events'],
    updated: U,
  },
  {
    id: 'timeline-diff',
    category: 'tuerkisch',
    q: {
      de: 'Wie unterscheidet sich der zeitliche Ablauf einer türkischen von einer deutschen Hochzeit?',
      en: 'How does the timeline of a Turkish wedding differ from a German one?',
      tr: 'Bir Türk düğününün zaman akışı, bir Alman düğününden nasıl farklıdır?',
    },
    a: {
      de: 'Türkische und deutsch-türkische Hochzeiten haben oft einen dichteren Zeremonie-Teil (Einzug, Ringzeremonie, teils Kına am Vorabend) und einen längeren, tanzintensiveren Abend mit Halay und Live-Elementen; deutsche Hochzeiten legen häufiger mehr Gewicht auf freie Trauung und Dinner-Programm. Beide Muster lassen sich kombinieren — genau das wird im Planungsgespräch für deutsch-türkische Paare abgestimmt.',
      en: 'Turkish and German-Turkish weddings often have a denser ceremonial part (entrance, ring ceremony, sometimes a henna night the evening before) and a longer, more dance-heavy night with halay and live elements; German weddings more often put more weight on the ceremony and the dinner programme. Both patterns can be blended — which is exactly what gets worked out for German-Turkish couples during the planning call.',
      tr: 'Türk ve Alman-Türk düğünlerinde genellikle daha yoğun bir tören bölümü (giriş, yüzük töreni, bazen bir önceki akşam kına gecesi) ve halay ile canlı unsurların olduğu daha uzun, dansın ağır bastığı bir gece bulunur; Alman düğünlerinde ise ağırlık daha çok nikah töreni ve yemek programına verilir. İki düzen de birleştirilebilir — Alman-Türk çiftler için planlama görüşmesinde tam olarak bu yapılır.',
    },
    related: ['kina-gecesi', 'bilingual-hosting'],
    links: ['/ablauf', '/hochzeit-events'],
    updated: U,
  },
  {
    id: 'kurdish-arabic',
    category: 'tuerkisch',
    q: {
      de: 'Spielt er auch bei kurdischen oder arabischen Hochzeiten?',
      en: 'Does he also play at Kurdish or Arabic weddings?',
      tr: 'Kürt veya Arap düğünlerinde de çalıyor mu?',
    },
    a: {
      de: 'Ja, neben türkischen und deutsch-türkischen Feiern gehören kurdische und arabische Repertoires ausdrücklich zum Angebot für Verlobung, Henna und multikulturelle Hochzeiten. Welche Musikrichtungen und Sprachen für Ihre Gästeliste im Vordergrund stehen sollen, wird individuell besprochen statt pauschal vorausgesetzt.',
      en: 'Yes, alongside Turkish and German-Turkish celebrations, Kurdish and Arabic repertoires are explicitly part of the offering for engagement, henna and multicultural weddings. Which genres and languages should take priority for your guest list is discussed individually rather than assumed as a default.',
      tr: 'Evet, Türk ve Alman-Türk düğünlerinin yanı sıra, Kürtçe ve Arapça repertuvarlar da nişan, kına ve çok kültürlü düğün hizmetinin açıkça bir parçasıdır. Misafir listenizde hangi müzik türlerinin ve dillerin öncelikli olacağı, genel bir varsayım yerine ayrıca konuşulur.',
    },
    related: ['halay-repertoire', 'bilingual-hosting'],
    links: ['/hochzeit-events'],
    updated: U,
  },

  // ─── location ─────────────────────────────────────────────────────────
  {
    id: 'service-area',
    category: 'location',
    q: {
      de: 'Wie weit reist er für Hochzeiten außerhalb von Stuttgart?',
      en: 'How far does he travel for weddings outside Stuttgart?',
      tr: 'Stuttgart dışındaki düğünler için ne kadar uzağa gidiyor?',
    },
    a: {
      de: 'Regelmäßig gebucht wird er in Stuttgart, Esslingen, Ludwigsburg, Böblingen, Heilbronn, Reutlingen, Pforzheim und Karlsruhe, dazu deutschlandweit und europaweit. Innerhalb von 50 Kilometern um Stuttgart ist die Anfahrt bereits im Paketpreis enthalten, für weitere Entfernungen wird sie transparent im individuellen Angebot ausgewiesen.',
      en: 'He’s regularly booked in Stuttgart, Esslingen, Ludwigsburg, Böblingen, Heilbronn, Reutlingen, Pforzheim and Karlsruhe, as well as across Germany and Europe. Travel within 50 kilometres of Stuttgart is already included in the package price; for greater distances it’s itemised transparently in the individual quote.',
      tr: 'Düzenli olarak Stuttgart, Esslingen, Ludwigsburg, Böblingen, Heilbronn, Reutlingen, Pforzheim ve Karlsruhe’de, ayrıca Almanya genelinde ve Avrupa’da rezervasyon alıyor. Stuttgart çevresinde 50 kilometreye kadar ulaşım paket fiyatına dahildir; daha uzun mesafeler için bu, bireysel teklifte açıkça belirtilir.',
    },
    facts: [
      'Einzugsgebiet: Stuttgart, Esslingen, Ludwigsburg, Böblingen, Heilbronn, Reutlingen, Pforzheim, Karlsruhe',
      'Reichweite: deutschlandweit & europaweit',
    ],
    related: ['travel-included', 'vienna-international'],
    links: ['/kontakt'],
    updated: U,
  },
  {
    id: 'vienna-international',
    category: 'location',
    q: {
      de: 'Spielt er auch international, zum Beispiel in Österreich?',
      en: 'Does he also play internationally, for example in Austria?',
      tr: 'Uluslararası olarak, örneğin Avusturya’da da çalıyor mu?',
    },
    a: {
      de: 'Ja, auf seinem Instagram-Profil sind unter anderem Auftritte in Wien dokumentiert — die Arbeit reicht also über Deutschland hinaus. Für internationale Termine gelten dieselben Grundsätze wie für Destination Weddings: Anfahrt, Übernachtung und eine mögliche Technikmiete vor Ort werden transparent im individuellen Angebot ausgewiesen.',
      en: 'Yes, his Instagram profile documents appearances in Vienna among other places, so the work extends beyond Germany. International dates follow the same principles as destination weddings: travel, accommodation and any local equipment rental are itemised transparently in the individual quote.',
      tr: 'Evet, Instagram profilinde diğerlerinin yanı sıra Viyana’daki performanslar da belgelenmiştir — yani çalışmaları Almanya’nın ötesine uzanır. Uluslararası tarihler için de destination wedding’lerle aynı ilkeler geçerlidir: ulaşım, konaklama ve gerekirse yerel ekipman kiralaması bireysel teklifte açıkça belirtilir.',
    },
    facts: ['Internationale Auftritte u. a. in Wien (dokumentiert auf Instagram)'],
    related: ['service-area', 'destination-logistics'],
    links: ['/anfrage'],
    updated: U,
  },
  {
    id: 'venue-site-visit',
    category: 'location',
    q: {
      de: 'Kennt er die Technik und Akustik der Location schon vorher, oder wird das erst am Tag klar?',
      en: 'Does he know the venue’s technical setup and acoustics in advance, or is that only clear on the day?',
      tr: 'Mekânın teknik altyapısını ve akustiğini önceden biliyor mu, yoksa bu ancak gün içinde mi belli oluyor?',
    },
    a: {
      de: 'Für jede Feier fließen Location-Angaben aus dem Planungsgespräch in die technische Vorbereitung ein, damit am Tag selbst nichts überrascht. Eine physische Location-Begehung vorab ist ausdrücklich Teil des Prestige-Pakets; bei den anderen Paketen lässt sich eine Begehung auf Wunsch individuell vereinbaren, etwa bei besonders anspruchsvoller Akustik.',
      en: 'For every celebration, venue details from the planning call feed into the technical preparation, so nothing comes as a surprise on the day itself. An in-person venue walk-through beforehand is explicitly part of the Prestige package; for the other packages, a walk-through can be arranged individually on request, for example where the acoustics are particularly demanding.',
      tr: 'Her etkinlik için, mekân bilgileri planlama görüşmesinden teknik hazırlığa aktarılır, böylece günün kendisinde sürpriz yaşanmaz. Önceden yapılan fiziksel mekân keşfi, açıkça Prestige paketinin bir parçasıdır; diğer paketlerde, özellikle akustiği zorlu mekânlarda, talep üzerine bireysel olarak bir keşif ayarlanabilir.',
    },
    facts: ['Location-Begehung vorab: Teil des Prestige-Pakets'],
    related: ['equipment-brought'],
    links: ['/pakete'],
    updated: U,
  },
  {
    id: 'destination-logistics',
    category: 'location',
    q: {
      de: 'Wer organisiert Unterkunft und Technik-Transport bei einer Destination Wedding?',
      en: 'Who organises accommodation and equipment transport for a destination wedding?',
      tr: 'Destination wedding’de konaklama ve ekipman taşımasını kim organize eder?',
    },
    a: {
      de: 'Die Grundlogistik — Anfahrt, Übernachtung und eine mögliche Technikmiete vor Ort statt Transport der eigenen Anlage über weite Strecken — wird gemeinsam im Angebot geplant und transparent ausgewiesen, nicht erst kurzfristig improvisiert. Details wie die konkrete Hotelbuchung liegen meist beim Brautpaar oder der Planerin, die Kosten dafür fließen ins Angebot ein.',
      en: 'The basic logistics — travel, accommodation and any local equipment rental instead of transporting the equipment itself over long distances — are planned together in the quote and itemised transparently, not improvised at the last minute. Details like the actual hotel booking usually sit with the couple or planner, with the associated cost reflected in the quote.',
      tr: 'Temel lojistik — ulaşım, konaklama ve uzun mesafelerde ekipmanı taşımak yerine yerel ekipman kiralama gibi konular — son anda doğaçlama yapılmak yerine teklifte birlikte planlanır ve açıkça belirtilir. Otel rezervasyonu gibi detaylar genellikle çift ya da planlayıcı tarafından yapılır, bu maliyetler ise teklife yansıtılır.',
    },
    related: ['vienna-international', 'travel-included'],
    links: ['/anfrage'],
    updated: U,
  },

  // ─── recht ────────────────────────────────────────────────────────────
  {
    id: 'contract-content',
    category: 'recht',
    q: {
      de: 'Was genau steht im schriftlichen Vertrag?',
      en: 'What exactly is set out in the written contract?',
      tr: 'Yazılı sözleşmede tam olarak neler yer alır?',
    },
    a: {
      de: 'Der Vertrag fixiert Leistungen, Zeiten und Preis, damit am Hochzeitstag keine Überraschungen entstehen — das ist ausdrücklich Teil des Leistungsversprechens jeder Buchung. Dazu gehören unter anderem Spielzeit, gebuchtes Paket samt Technikumfang, vereinbarte Zusatzleistungen wie Moderation oder Live-Musik sowie die Zahlungsmodalitäten aus Anzahlung und Restbetrag.',
      en: 'The contract fixes the services, times and price so there are no surprises on the wedding day — that’s explicitly part of the service promise on every booking. Among other things it covers the playing time, the booked package with its technical scope, agreed extras like hosting or live music, and the payment terms for deposit and balance.',
      tr: 'Sözleşme, düğün gününde sürpriz yaşanmaması için hizmetleri, saatleri ve fiyatı sabitler — bu, her rezervasyonun açıkça verilen bir hizmet sözüdür. Bunlar arasında çalma süresi, teknik kapsamıyla birlikte rezerve edilen paket, sunum veya canlı müzik gibi kararlaştırılan ekstralar ve ön ödeme ile kalan bakiyeye ilişkin ödeme koşulları yer alır.',
    },
    facts: ['Schriftlicher Vertrag: fester Bestandteil jeder Buchung'],
    related: ['cancellation', 'personal-meeting'],
    links: ['/anfrage'],
    updated: U,
  },
  {
    id: 'cancellation',
    category: 'recht',
    q: {
      de: 'Was passiert, wenn wir die Hochzeit stornieren oder verschieben müssen?',
      en: 'What happens if we have to cancel or postpone the wedding?',
      tr: 'Düğünü iptal etmemiz ya da ertelememiz gerekirse ne olur?',
    },
    a: {
      de: 'Ein pauschaler Storno- oder Verschiebungssatz ist nicht öffentlich festgelegt, weil die Konditionen individuell im schriftlichen Vertrag geregelt werden, statt sich aus einer allgemeinen Regel zu ergeben. Melden Sie sich möglichst frühzeitig — je nach Zeitpunkt und Grund lassen sich Verschiebungen oft unkomplizierter lösen als eine vollständige Stornierung.',
      en: 'There’s no publicly fixed cancellation or postponement fee, because the terms are set individually in the written contract rather than following one general rule. Get in touch as early as possible — depending on timing and reason, a postponement can often be resolved more easily than a full cancellation.',
      tr: 'Genel geçerli bir iptal ya da erteleme ücreti kamuya açık şekilde belirlenmemiştir, çünkü koşullar genel bir kurala göre değil, yazılı sözleşmede bireysel olarak düzenlenir. Mümkün olan en erken zamanda bize ulaşın — zamanlamaya ve nedene bağlı olarak, bir erteleme genellikle tam bir iptalden daha kolay çözülebilir.',
    },
    related: ['contract-content', 'illness-backup'],
    links: ['/anfrage'],
    updated: U,
  },
  {
    id: 'data-privacy',
    category: 'recht',
    q: {
      de: 'Wie werden meine Daten aus dem Anfrageformular verarbeitet?',
      en: 'How is my data from the enquiry form processed?',
      tr: 'Talep formundan alınan verilerim nasıl işlenir?',
    },
    a: {
      de: 'Die im Formular angegebenen Daten — etwa Datum, Ort und Art der Feier, Gästezahl, Name, E-Mail, Telefon und Ihre Nachricht — werden ausschließlich zur Bearbeitung Ihrer Anfrage genutzt. Ergibt sich kein Vertrag, werden sie gelöscht, sobald die Anfrage abgeschlossen ist; kommt ein Vertrag zustande, gelten die gesetzlichen Aufbewahrungsfristen. Details stehen in der Datenschutzerklärung.',
      en: 'The data you provide in the form — such as the date, location and type of celebration, guest count, name, email, phone and your message — is used solely to handle your enquiry. If no contract results, it is deleted once the enquiry is closed; if a contract is signed, statutory retention periods apply. Full details are in the privacy policy.',
      tr: 'Formda verdiğiniz bilgiler — tarih, yer ve etkinlik türü, misafir sayısı, ad, e-posta, telefon ve mesajınız gibi — yalnızca talebinizi işleme almak için kullanılır. Bir sözleşme oluşmazsa, talep sonuçlandığında bu bilgiler silinir; bir sözleşme imzalanırsa yasal saklama süreleri geçerli olur. Ayrıntılar gizlilik politikasında yer alır.',
    },
    related: ['contract-content'],
    links: ['/datenschutz'],
    updated: U,
  },
];

/** Resolves an entry's localized text for `locale`, falling back to German (always present). */
export function resolveAnswerText(text: LocalizedAnswerText, locale: Locale): string {
  return (text as Partial<Record<Locale, string>>)[locale] ?? text.de;
}

export function getAnswersByCategory(category: AnswerCategory): Answer[] {
  return answers.filter((answer) => answer.category === category);
}

export function getAnswerById(id: string): Answer | undefined {
  return answers.find((answer) => answer.id === id);
}

/** Most recent `updated` date across the whole corpus — ISO strings sort lexicographically. */
export function latestAnswerUpdate(): string {
  return answers.reduce((latest, answer) => (answer.updated > latest ? answer.updated : latest), answers[0].updated);
}
