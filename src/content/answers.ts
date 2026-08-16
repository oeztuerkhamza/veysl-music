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

import { locales, type Locale } from '@/i18n/routing';
import { isIslamicLocale } from '@/content/islamic';
import type { StaticPathname } from '@/lib/seo';

export const ANSWER_CATEGORIES = [
  'buchung',
  'preis',
  'ablauf',
  'musik',
  'technik',
  'tuerkisch',
  'islamisch',
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
  /**
   * Marks an entry as part of the religiously-framed layer, for entries that
   * do **not** sit in the `islamisch` category.
   *
   * Three answers carry religious content while genuinely belonging to another
   * category: `after-wedding-party` (ablauf), `tsm-live` (musik) and
   * `recitation-sound` (technik) — the "drei Ergänzungen" the `U_ISLAM`
   * comment above already names. They are not miscategorised: a question about
   * microphone technique for a recitation is a technical question, and moving
   * it into `islamisch` would hide it from the technical cluster for the very
   * readers it was written for.
   *
   * So visibility is expressed here instead of through the category. Anything
   * where `isReligiousAnswer()` is true renders only in
   * `ISLAMIC_SUPPORTED_LOCALES` (src/content/islamic.ts) — see
   * `getVisibleAnswers()`.
   */
  religious?: boolean;
  /** ISO date (YYYY-MM-DD). Surfaced as "zuletzt aktualisiert" on /fragen — freshness is a citation signal for answer engines. */
  updated: string;
}

const U = '2026-07-24';

/**
 * Zweites Datum für die religiös geprägte Ebene (Kategorie `islamisch` plus
 * die drei Ergänzungen in `musik`/`ablauf`/`technik`), die der Kunde am
 * 2026-07-30 als bestehendes, bis dahin nirgends dokumentiertes Angebot
 * bestätigt hat — siehe `.claude/BRAND-FACTS.md`, Abschnitt „Religiös
 * geprägte Hochzeiten“. Bewusst nicht als Sammel-Update auf alle 40
 * Altbestände gezogen: `updated` ist ein Frischesignal für Antwortmaschinen
 * und wird wertlos, wenn unveränderte Texte ein neues Datum bekommen.
 */
const U_ISLAM = '2026-07-30';

/**
 * Einen Tag später bestätigte der Kunde zusätzlich, dass er die Kur’an-
 * Rezitation **selbst** vorträgt. Das ist keine Formulierungsfrage, sondern
 * der Unterschied zwischen „koordiniert den religiösen Teil“ und „führt ihn
 * durch“ — und damit das stärkste Differenzierungsmerkmal in diesem ganzen
 * Cluster. Betrifft `who-recites` (neu) und `quran-and-modern-party`
 * (nachgeschärft); die übrigen Einträge behalten ihr altes Datum, weil sich
 * an ihrem Text nichts geändert hat.
 */
const U_TILAWET = '2026-07-31';

/**
 * Datum der Landesseite `/tuerkischer-dj-baden-wuerttemberg` (August 2026).
 * Nur der neue Landes-Eintrag trägt es — gleiche Begründung wie bei
 * `U_ISLAM`: unveränderte Texte behalten ihr altes Datum.
 */
const U_TURKISH_BW = '2026-08-16';

export const answers: Answer[] = [
  // ─── buchung ──────────────────────────────────────────────────────────
  {
    id: 'who-is-veysl',
    category: 'buchung',
    q: {
      de: 'Wer ist DJ Veys und was macht ihn zum Hochzeits-DJ in Stuttgart?',
      en: 'Who is DJ Veys and what makes him a wedding DJ in Stuttgart?',
      tr: 'DJ Veys kimdir ve onu Stuttgart’ta düğün DJ’i yapan nedir?',
      ar: 'من هو DJ Veys وما الذي يميّزه كدي جي أعراس في شتوتغارت؟',
    },
    a: {
      de: 'DJ Veys ist der Hochzeits-DJ-, Live-Musik- und Moderationsservice von Veysel Durmuş mit Sitz in Stuttgart-Obertürkheim. Seit über 12 Jahren begleitet er Hochzeiten und Events in Baden-Württemberg, deutschlandweit und europaweit, moderiert live auf Deutsch, Türkisch und Englisch und hat sich auf deutsch-türkische, türkische und multikulturelle Hochzeiten spezialisiert. Über 200 Feiern hat er bereits begleitet.',
      en: 'DJ Veys is the wedding-DJ, live-music and hosting service of Veysel Durmuş, based in Stuttgart-Obertürkheim, Germany. For over 12 years he has accompanied weddings and events across Baden-Württemberg, Germany and Europe, hosting live in German, Turkish and English, with a focus on German-Turkish, Turkish and multicultural weddings. He has played over 200 celebrations so far.',
      tr: 'DJ Veys, Veysel Durmuş’un Stuttgart-Obertürkheim merkezli düğün DJ’liği, canlı müzik ve sunuculuk hizmetidir. 12 yılı aşkın süredir Baden-Württemberg, Almanya geneli ve Avrupa’da düğün ve etkinliklere eşlik ediyor; Almanca, Türkçe ve İngilizce canlı sunum yapıyor ve özellikle Alman-Türk, Türk ve çok kültürlü düğünlerde uzmanlaşmış durumda. Bugüne kadar 200’den fazla organizasyona imza attı.',
      ar: 'DJ Veys هو خدمة دي جي الأعراس والموسيقى الحية والتقديم التي يقدّمها فيسيل دورموش ومقرّها شتوتغارت-أوبرتوركهايم. منذ أكثر من 12 عاماً يرافق الأعراس والفعاليات في بادن-فورتمبيرغ وفي عموم ألمانيا وأوروبا، ويقدّم الحفلات مباشرة بالألمانية والتركية والإنجليزية، وهو متخصّص في الأعراس الألمانية-التركية والتركية ومتعدّدة الثقافات. وقد رافق حتى اليوم أكثر من 200 حفل.',
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
      ar: 'كيف أتأكّد أنّ DJ Veys يمتلك خبرة حقيقية؟',
    },
    a: {
      de: 'Am direktesten an drei überprüfbaren Zahlen: über 12 Jahre Erfahrung als DJ und Musiker, mehr als 200 begleitete Hochzeiten und Events sowie über 63.000 Follower auf Instagram, wo regelmäßig Ausschnitte echter Feiern zu sehen sind. Dazu kommt eigene, professionelle Ton- und Lichttechnik statt zusammengekaufter Leihgeräte.',
      en: 'Most directly by three checkable numbers: over 12 years of experience as a DJ and musician, more than 200 weddings and events accompanied, and over 63,000 followers on Instagram, where real event footage is posted regularly. He also owns his professional sound and lighting equipment rather than sourcing it ad hoc.',
      tr: 'En doğrudan kanıt üç somut rakamda: DJ ve müzisyen olarak 12 yılı aşkın deneyim, 200’den fazla düğün ve etkinlik ve Instagram’da 63.000’i aşkın takipçi; burada düzenli olarak gerçek etkinliklerden görüntüler paylaşılıyor. Ayrıca kiralık değil, kendi profesyonel ses ve ışık ekipmanını kullanıyor.',
      ar: 'تكشف ذلك ثلاثة أرقام قابلة للتحقّق مباشرة: أكثر من 12 عاماً من الخبرة كدي جي وموسيقي، وأكثر من 200 عرس وفعالية رافقها، وأكثر من 63,000 متابع على إنستغرام حيث تُنشر بانتظام لقطات من حفلات حقيقية. يُضاف إلى ذلك أنّه يملك أجهزة صوت وإضاءة احترافية خاصة به، بدل استئجار معدّات متفرّقة لكل مناسبة.',
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
      ar: 'ماذا يحدث إذا مرض فيسيل أو تعذّر حضوره في اللحظة الأخيرة؟',
    },
    a: {
      de: 'Ein Ausfall wegen Krankheit ist selten, sollte aber vor der Hochzeit geklärt sein statt am Tag selbst improvisiert zu werden. Ein Vorgehen für einen solchen Fall wird individuell im Planungsgespräch besprochen und Teil des schriftlichen Vertrags. Sprechen Sie das Thema gern schon bei Ihrer Anfrage an, dann fließt die Antwort direkt in Ihr Angebot ein.',
      en: 'A cancellation due to illness is rare, but it should be settled before the wedding day rather than improvised on the spot. Arrangements for that case are discussed individually during the planning call and become part of the written contract. Feel free to raise this in your enquiry — the answer will then be part of your quote.',
      tr: 'Hastalık nedeniyle iptal nadir görülür, ancak düğün gününde doğaçlama yapılacağına önceden netleştirilmesi gereken bir konudur. Böyle bir durum için izlenecek yol, planlama görüşmesinde ayrıca ele alınır ve yazılı sözleşmenin bir parçası olur. Bu konuyu talebinizde belirtmeniz yeterli — yanıt doğrudan teklifinize dahil edilir.',
      ar: 'التغيّب بسبب المرض نادر الحدوث، لكنه أمر يُفضَّل حسمه قبل العرس بدل الارتجال في اليوم نفسه. لذلك يُناقَش الإجراء المتّبع في مثل هذه الحالة بشكل فردي خلال جلسة التخطيط، ويصبح جزءاً من العقد المكتوب. اذكروا هذه النقطة في طلبكم منذ البداية، وسيدخل الجواب مباشرة ضمن عرض السعر الخاص بكم.',
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
      ar: 'هل يكفي إرسال طلب عبر إنستغرام أم من الأفضل استخدام نموذج الحجز؟',
    },
    a: {
      de: 'Beides erreicht ihn, aber das Anfrageformular auf dieser Seite ist der zuverlässigere Weg: Es erfasst Datum, Ort, Gästezahl und Wünsche strukturiert, sodass innerhalb von 24 Stunden eine verbindliche Rückmeldung zur Verfügbarkeit möglich ist. Eine Nachricht über Instagram funktioniert für eine erste, unverbindliche Kontaktaufnahme, ersetzt aber keine vollständige Anfrage.',
      en: 'Both reach him, but the enquiry form on this site is the more reliable route: it captures date, location, guest count and wishes in a structured way, allowing a definitive availability answer within 24 hours. A message on Instagram works for a first, informal contact but doesn’t replace a full enquiry.',
      tr: 'İkisi de ona ulaşır, ancak bu sitedeki talep formu daha güvenilir bir yoldur: tarih, yer, misafir sayısı ve isteklerinizi yapılandırılmış biçimde kaydeder, böylece 24 saat içinde kesin bir uygunluk yanıtı alınabilir. Instagram üzerinden bir mesaj ilk, resmi olmayan temas için işe yarar ama tam bir talebin yerini tutmaz.',
      ar: 'كلا الطريقين يصل إليه، لكنّ نموذج الطلب على هذا الموقع أكثر موثوقية: فهو يسجّل التاريخ والمكان وعدد الضيوف ورغباتكم بشكل منظّم، ما يتيح ردّاً مؤكداً على التوفّر خلال 24 ساعة. أما رسالة إنستغرام فهي مناسبة لتواصل أول غير رسمي، لكنها لا تحلّ محلّ طلب كامل بكل تفاصيله.',
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
      ar: 'هل هناك لقاء تعارف شخصي قبل الحجز؟',
    },
    a: {
      de: 'Ja. Nach der ersten Anfrage folgt ein Video- oder Vor-Ort-Gespräch, in dem Ablauf, Musikgeschmack, No-Gos und Timing besprochen werden, bevor ein schriftliches Angebot erstellt wird. Im Signature-Paket sind zwei Planungsgespräche vorgesehen, im Prestige-Paket eine unbegrenzte Anzahl inklusive einer Location-Begehung vorab.',
      en: 'Yes. After the initial enquiry, a video or in-person meeting covers the schedule, musical taste, no-gos and timing before a written quote is drawn up. The Signature package includes two planning calls, and Prestige includes an unlimited number plus an advance venue walk-through.',
      tr: 'Evet. İlk talebin ardından, yazılı teklif hazırlanmadan önce akış, müzik zevki, istenmeyenler ve zamanlama video görüşmesinde ya da yüz yüze bir toplantıda konuşulur. Signature paketinde iki planlama görüşmesi, Prestige paketinde ise sınırsız sayıda görüşme ve önceden mekân keşfi bulunur.',
      ar: 'نعم. بعد الطلب الأول يأتي لقاء عبر الفيديو أو حضورياً، تُناقَش فيه تفاصيل سير اليوم والذوق الموسيقي والأغاني غير المرغوبة والتوقيت، قبل إعداد عرض سعر مكتوب. تشمل باقة Signature جلستَي تخطيط، بينما تتيح باقة Prestige عدداً غير محدود من الجلسات إضافةً إلى معاينة مسبقة لقاعة الحفل.',
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
      ar: 'هل يمكن تعديل برنامج الحفل بعد توقيع العقد؟',
    },
    a: {
      de: 'Kleinere Anpassungen — etwa eine verschobene Uhrzeit, ein anderes Musikstück für den Eröffnungstanz oder eine ergänzte Wunschliste — sind bis kurz vor der Feier üblich und werden im laufenden Austausch nachgezogen. Größere Änderungen, die den vereinbarten Umfang betreffen, etwa mehr Spielzeit oder ein Locationwechsel, werden schriftlich im Vertrag nachgetragen.',
      en: 'Smaller adjustments — a shifted start time, a different first-dance song, or an updated wishlist — are normal right up until shortly before the event and are simply updated along the way. Bigger changes that affect the agreed scope, such as more playing time or a venue change, are added to the written contract.',
      tr: 'Küçük değişiklikler — saatin kayması, açılış dansı şarkısının değişmesi ya da istek listesinin güncellenmesi gibi — düğüne kısa süre kalana kadar normaldir ve süreç içinde güncellenir. Anlaşılan kapsamı etkileyen büyük değişiklikler, örneğin daha uzun çalma süresi ya da mekân değişikliği, yazılı sözleşmeye eklenir.',
      ar: 'التعديلات الصغيرة — كتعديل في التوقيت، أو اختيار أغنية أخرى لرقصة الافتتاح، أو إضافة أغانٍ إلى قائمة الطلبات — أمر معتاد حتى قبل الحفل بوقت قصير، ويجري تحديثها ضمن التواصل المستمر. أما التغييرات الكبيرة التي تمسّ النطاق المتّفق عليه، مثل تمديد ساعات العزف أو تغيير القاعة، فتُضاف كتابةً إلى العقد.',
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
      ar: 'هل يمكن الحجز في وقت قصير، مثلاً خلال ستة إلى ثمانية أسابيع؟',
    },
    a: {
      de: 'Ja, das kommt auf die Verfügbarkeit an: Für Samstage in der Hauptsaison von Mai bis September ist mit 12 bis 18 Monaten Vorlauf zu rechnen, aber Werktage, Nebensaison-Termine oder kurzfristige Absagen anderer Feiern schaffen immer wieder freie Slots. Die Verfügbarkeit für ein konkretes Datum wird innerhalb von 24 Stunden geprüft — auch kurzfristig.',
      en: 'Yes, it depends on availability: Saturdays in the peak season from May to September typically need 12 to 18 months’ lead time, but weekdays, off-season dates or last-minute cancellations from other bookings regularly open up free slots. Availability for a specific date is checked within 24 hours, even at short notice.',
      tr: 'Evet, bu uygunluğa bağlıdır: Mayıs-Eylül yoğun sezonundaki cumartesi günleri için genelde 12-18 ay öncesinden rezervasyon gerekir, ancak hafta içi günler, sezon dışı tarihler veya başka bir organizasyonun son anda iptali sık sık boş tarihler doğurur. Belirli bir tarih için uygunluk, son dakika olsa bile 24 saat içinde kontrol edilir.',
      ar: 'نعم، وذلك يتوقّف على التوفّر: أيام السبت في الموسم الرئيسي من مايو إلى سبتمبر تحتاج عادةً إلى حجز مسبق بـ 12 إلى 18 شهراً، لكنّ أيام الأسبوع ومواعيد خارج الموسم وإلغاءات مفاجئة لحفلات أخرى تفتح مواعيد شاغرة باستمرار. ويُفحص التوفّر لأي تاريخ محدّد خلال 24 ساعة، حتى في الطلبات العاجلة.',
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
      ar: 'لماذا تتفاوت أسعار دي جي الأعراس إلى هذا الحدّ؟',
    },
    a: {
      de: 'Der Preis hängt vor allem von vier Faktoren ab: Spielzeit, Gästezahl, Technikbedarf (Tonanlage, Licht, Zonenanzahl) und Anfahrt. Ein DJ mit eigener, hochwertiger Ton- und Lichttechnik sowie zusätzlicher Moderation oder Live-Musik kalkuliert entsprechend anders als ein reiner Auflege-Service ohne Zusatzleistungen. Die drei Pakete auf dieser Seite zeigen den üblichen Rahmen; das verbindliche Angebot folgt nach dem Planungsgespräch.',
      en: 'Price mainly depends on four factors: playing time, guest count, technical requirements (sound, lighting, number of zones) and travel. A DJ who owns high-quality sound and lighting equipment and also offers hosting or live music prices differently from a bare-bones playback-only service. The three packages on this page show the usual range; the binding quote follows the planning call.',
      tr: 'Fiyat esas olarak dört etkene bağlıdır: çalma süresi, misafir sayısı, teknik ihtiyaç (ses, ışık, bölge sayısı) ve ulaşım. Kendi kaliteli ses ve ışık ekipmanına sahip, ayrıca sunum veya canlı müzik de sunan bir DJ, sadece müzik çalan bir hizmetten farklı fiyatlandırılır. Bu sayfadaki üç paket genel çerçeveyi gösterir; kesin teklif planlama görüşmesinden sonra verilir.',
      ar: 'يتوقّف السعر أساساً على أربعة عوامل: مدة العزف، وعدد الضيوف، والاحتياجات التقنية (نظام الصوت والإضاءة وعدد المناطق)، والمسافة. فالدي جي الذي يملك أجهزة صوت وإضاءة عالية الجودة ويقدّم إلى جانبها التقديم أو الموسيقى الحية يحسب سعره بشكل مختلف عن خدمة تشغيل موسيقى فقط. تُظهر الباقات الثلاث هنا الإطار المعتاد، ويأتي العرض المُلزم بعد جلسة التخطيط.',
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
      ar: 'هل تكلفة التنقّل مشمولة في السعر؟',
    },
    a: {
      de: 'Ja, alle drei Pakete verstehen sich inklusive Anfahrt innerhalb von 50 Kilometern rund um Stuttgart. Liegt Ihre Location weiter entfernt — etwa deutschlandweit oder für eine Destination Wedding in Europa — wird die zusätzliche Anfahrt transparent im individuellen Angebot ausgewiesen, ebenso eine mögliche Übernachtung.',
      en: 'Yes, all three packages include travel within 50 kilometres of Stuttgart. If your venue is further away — nationwide in Germany or for a destination wedding in Europe — the extra travel is itemised transparently in the individual quote, along with any overnight stay if needed.',
      tr: 'Evet, üç paketin tamamı Stuttgart çevresinde 50 kilometreye kadar ulaşımı içerir. Mekânınız daha uzaktaysa — Almanya genelinde ya da Avrupa’da bir destination wedding için — ek ulaşım masrafı, gerekirse konaklamayla birlikte, bireysel teklifte açıkça belirtilir.',
      ar: 'نعم، الباقات الثلاث جميعها تشمل التنقّل ضمن 50 كيلومتراً حول شتوتغارت. وإذا كانت القاعة أبعد من ذلك — في أي مكان في ألمانيا أو لحفل زفاف في وجهة أوروبية — تُدرَج تكلفة التنقّل الإضافية بشفافية في عرض السعر الفردي، إلى جانب أي تكلفة مبيت عند الحاجة.',
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
      ar: 'هل توجد أسعار أقل للأعراس في أيام الأسبوع أو خارج الموسم؟',
    },
    a: {
      de: 'Ein pauschaler Rabatt ist nicht öffentlich ausgewiesen, weil sich der Preis ohnehin individuell aus Spielzeit, Gästezahl und Technikbedarf ergibt — und diese Faktoren unterscheiden sich bei Wochentags- oder Nebensaison-Feiern oft ohnehin. Fragen Sie Ihr Datum konkret an: In der Anfrage lässt sich klären, ob ein Werktag oder ein Termin außerhalb von Mai bis September Spielraum im Angebot schafft.',
      en: 'No blanket discount is publicly listed, because pricing is calculated individually from playing time, guest count and technical needs anyway — and those factors often differ for weekday or off-season celebrations regardless. Ask about your specific date: the enquiry is where it becomes clear whether a weekday or a date outside May to September creates room in the quote.',
      tr: 'Genel bir indirim kamuya açık şekilde belirtilmemiştir çünkü fiyat zaten çalma süresi, misafir sayısı ve teknik ihtiyaca göre bireysel hesaplanır — bu etkenler hafta içi ya da sezon dışı düğünlerde zaten farklı olabilir. Tarihinizi doğrudan sorun: talep sırasında, hafta içi bir gün ya da Mayıs-Eylül dışındaki bir tarihin teklifte esneklik yaratıp yaratmayacağı netleşir.',
      ar: 'لا يوجد خصم ثابت معلن، لأنّ السعر يُحسب أصلاً بشكل فردي حسب مدة العزف وعدد الضيوف والاحتياجات التقنية — وهذه العوامل تختلف غالباً في حفلات أيام الأسبوع أو خارج الموسم على أي حال. اسألوا عن تاريخكم تحديداً: عند تقديم الطلب يتّضح ما إذا كان يوم عمل أو موعد خارج مايو-سبتمبر يمنح مرونة في العرض.',
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
      ar: 'هل التقديم والموسيقى الحية بالساز أو الغيتار تكلّف مبلغاً إضافياً فوق سعر الدي جي؟',
    },
    a: {
      de: 'Moderation auf Deutsch, Türkisch und Englisch sowie Live-Musik an Saz und Gitarre sind keine fremd zugekauften Zusatzbuchungen, sondern kommen aus einer Hand — Veysel spielt beide Instrumente selbst seit seiner Kindheit. Ob und in welchem Umfang sie für Ihre Feier sinnvoll sind, wird im Planungsgespräch besprochen und fließt in das individuelle Angebot ein, statt als starrer Aufpreis vorab festzustehen.',
      en: 'Hosting in German, Turkish and English, as well as live music on saz and guitar, aren’t outsourced add-ons — they come from one source, since Veysel has played both instruments himself since childhood. Whether and how much of this makes sense for your celebration is discussed during the planning call and reflected in the individual quote, rather than fixed as a flat surcharge upfront.',
      tr: 'Almanca, Türkçe ve İngilizce sunum ile saz ve gitarda canlı müzik, dışarıdan satın alınan ek hizmetler değildir, tek bir kaynaktan gelir — ikisini de çocukluğundan beri kendisi çalıyor. Düğününüz için ne ölçüde anlamlı olacağı planlama görüşmesinde konuşulur ve önceden sabit bir ek ücret olarak değil, bireysel teklife yansıtılır.',
      ar: 'التقديم بالألمانية والتركية والإنجليزية والعزف الحيّ على الساز والغيتار ليست خدمات تُشترى من طرف ثالث، بل تأتي من مصدر واحد؛ إذ يعزف فيسيل الآلتين بنفسه منذ طفولته. أما مدى ملاءمتها لحفلكم وحجم استخدامها فيُناقَش في جلسة التخطيط ويُدرَج ضمن العرض الفردي، بدل تحديده مسبقاً كرسم إضافي ثابت.',
    },
    facts: ['Moderation: Deutsch, Türkisch, Englisch', 'Live-Musik: Saz & Gitarre seit der Kindheit'],
    related: ['live-vs-dj', 'who-is-veysl'],
    links: ['/hochzeit-events'],
    updated: U,
  },
  {
    id: 'invoice-vat',
    category: 'preis',
    q: {
      de: 'Wird für Firmenevents eine Rechnung mit ausgewiesener Umsatzsteuer ausgestellt?',
      en: 'Is an invoice with itemised VAT issued for corporate events?',
      tr: 'Kurumsal etkinlikler için KDV’si ayrıca gösterilen bir fatura kesiliyor mu?',
      ar: 'هل تصدرون فاتورة تتضمّن ضريبة القيمة المضافة للفعاليات المؤسسية؟',
    },
    a: {
      de: 'Ja, für Firmenevents wie Sommerfeste, Weihnachtsfeiern oder Produktlaunches gehört eine Rechnung mit ausgewiesener Umsatzsteuer zum festen Leistungsversprechen. Ein fester Ansprechpartner ist zudem bis zum Ende der Veranstaltung verfügbar. Details zur Rechnungsstellung für private Hochzeiten klären Sie am besten direkt im Angebotsgespräch.',
      en: 'Yes, for corporate events such as summer parties, Christmas parties or product launches, an invoice with itemised VAT is a standard part of the service. A dedicated contact is also available until the event ends. For invoicing details on private weddings, it’s best to clarify directly during the quote conversation.',
      tr: 'Evet, yaz partileri, yılbaşı kutlamaları veya ürün lansmanları gibi kurumsal etkinlikler için KDV’si ayrıca gösterilen bir fatura standart hizmetin parçasıdır. Ayrıca etkinlik bitene kadar sabit bir irtibat kişisi bulunur. Özel düğünlerde faturalandırma detayları en iyi şekilde teklif görüşmesinde netleştirilir.',
      ar: 'نعم، في الفعاليات المؤسسية مثل الحفلات الصيفية أو حفلات عيد الميلاد أو إطلاق المنتجات، تُعدّ الفاتورة التي تُبيَّن فيها ضريبة القيمة المضافة جزءاً ثابتاً من الخدمة. كما يتوفّر مسؤول تواصل ثابت حتى نهاية الفعالية. أما تفاصيل الفوترة في الأعراس الخاصة فيُفضَّل توضيحها مباشرة أثناء محادثة عرض السعر.',
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
      ar: 'ما الذي يُناقش بالضبط في جلسة التخطيط قبل العرس؟',
    },
    a: {
      de: 'Im Planungsgespräch — per Video oder vor Ort — geht es um den zeitlichen Ablauf des Tages, Musikgeschmack und No-Gos, Schlüsselmomente wie Einzug und Eröffnungstanz sowie die technischen Rahmenbedingungen der Location. Nach der Buchung folgt ein zweites, detaillierteres Gespräch (im Signature-Paket enthalten), in dem Timing und Wunschliste final abgestimmt werden.',
      en: 'The planning call — by video or in person — covers the day’s timeline, musical taste and no-gos, key moments such as the entrance and first dance, and the venue’s technical conditions. After booking, a second, more detailed call follows (included in the Signature package) where timing and the wishlist are finalised.',
      tr: 'Planlama görüşmesi — video ya da yüz yüze — günün zaman akışını, müzik zevkini ve istenmeyenleri, giriş ve açılış dansı gibi kilit anları ve mekânın teknik koşullarını kapsar. Rezervasyondan sonra (Signature pakete dahil) daha detaylı ikinci bir görüşme yapılır ve zamanlama ile istek listesi kesinleştirilir.',
      ar: 'تتناول جلسة التخطيط — عبر الفيديو أو حضورياً — الجدول الزمني لليوم، والذوق الموسيقي والأغاني غير المرغوبة، واللحظات المفصلية مثل الدخول ورقصة الافتتاح، إضافةً إلى الظروف التقنية في القاعة. وبعد الحجز تأتي جلسة ثانية أكثر تفصيلاً (مشمولة في باقة Signature) يُحسم فيها التوقيت وقائمة الأغاني بشكل نهائي.',
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
      ar: 'هل ينسّق أيضاً بشكل مباشر مع منظّمة الأعراس والمصوّر؟',
    },
    a: {
      de: 'Ja, die Abstimmung mit Fotograf, Caterer, Location und Hochzeitsplanerin ist fester Bestandteil der Vorbereitung — insbesondere bei Schlüsselmomenten wie Einzug, Anschnitt oder Eröffnungstanz, bei denen Timing zwischen DJ und Kamera exakt passen muss. Kontaktdaten Dritter werden auf Wunsch direkt ausgetauscht, damit am Tag selbst nichts doppelt abgestimmt werden muss.',
      en: 'Yes, coordinating with the photographer, caterer, venue and wedding planner is a standard part of the preparation — especially for key moments like the entrance, cake-cutting or first dance, where the timing between DJ and camera needs to line up exactly. Contact details for third parties are exchanged directly on request, so nothing needs double-checking on the day itself.',
      tr: 'Evet, fotoğrafçı, catering, mekân ve düğün planlayıcısıyla koordinasyon hazırlığın standart bir parçasıdır — özellikle giriş, pasta kesimi veya açılış dansı gibi DJ ile kameranın zamanlamasının tam örtüşmesi gereken anlarda. Talep üzerine üçüncü tarafların iletişim bilgileri doğrudan paylaşılır, böylece günün kendisinde hiçbir şey iki kez koordine edilmek zorunda kalmaz.',
      ar: 'نعم، التنسيق مع المصوّر وشركة الضيافة والقاعة ومنظّمة الأعراس جزء ثابت من التحضير — خصوصاً في اللحظات المفصلية مثل الدخول وقطع الكعكة ورقصة الافتتاح، حيث يجب أن يتطابق توقيت الدي جي مع الكاميرا تماماً. وتُتبادَل بيانات التواصل مع الأطراف الأخرى عند الطلب، حتى لا يُنسَّق شيء مرتين في يوم الحفل نفسه.',
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
      ar: 'كيف يتم التحضير لرقصة الافتتاح؟',
    },
    a: {
      de: 'Der Song und die gewünschte Version (Radio-Edit, längere Albumversion oder ein spezielles Mashup) werden im Planungsgespräch festgelegt und vorab technisch vorbereitet, inklusive sauberem Ein- und Ausblenden. Im Signature- und im Prestige-Paket ist eine begleitete Choreografie-Abstimmung enthalten, damit Einsatz, Tempo und Lichtstimmung exakt zum eingeübten Tanz passen.',
      en: 'The song and preferred version (radio edit, extended album cut or a custom mashup) are set during the planning call and prepared technically in advance, including a clean fade-in and fade-out. Both the Signature and Prestige packages include coordinated choreography support, so the cue, tempo and lighting mood match the rehearsed dance exactly.',
      tr: 'Şarkı ve tercih edilen versiyon (radyo düzenlemesi, uzun albüm versiyonu veya özel bir mashup) planlama görüşmesinde belirlenir ve önceden teknik olarak hazırlanır; temiz bir giriş-çıkış geçişi dahil. Signature ve Prestige paketlerinde koreografi desteği de bulunur, böylece müzik girişi, tempo ve ışık atmosferi provası yapılmış dansla tam örtüşür.',
      ar: 'تُحدَّد الأغنية والنسخة المرغوبة (نسخة الراديو، أو نسخة الألبوم الأطول، أو مزيج خاص) في جلسة التخطيط، ثم تُجهَّز تقنياً مسبقاً بما في ذلك دخول وخروج سلس للصوت. وتشمل باقتا Signature وPrestige تنسيقاً مرافقاً للكوريغرافيا، كي تتطابق لحظة البدء والإيقاع وأجواء الإضاءة تماماً مع الرقصة التي تدرّبتم عليها.',
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
      ar: 'هل يمكن للعروسين المشاركة في تحديد برنامج السهرة؟',
    },
    a: {
      de: 'Ja, der Spannungsbogen des Abends — von Sektempfang über Dinner bis Peaktime — wird gemeinsam im Planungsgespräch entworfen, nicht vorgegeben. Sie bestimmen Reihenfolge und Schwerpunkte der Programmpunkte wie Reden, Anschnitt oder Spiele; die musikalische und moderative Umsetzung dazwischen liegt dann in professioneller Hand, damit keine Lücken entstehen.',
      en: 'Yes, the arc of the evening — from the champagne reception through dinner to peak time — is designed together during the planning call, not dictated in advance. You decide the order and emphasis of programme moments like speeches, cake-cutting or games; the musical and hosting execution in between is then handled professionally so no gaps appear.',
      tr: 'Evet, akşamın akışı — kokteyl karşılamasından yemeğe, oradan da dansın doruğuna kadar — önceden dayatılmaz, planlama görüşmesinde birlikte tasarlanır. Konuşmalar, pasta kesimi veya oyunlar gibi program noktalarının sırasını ve ağırlığını siz belirlersiniz; aradaki müzikal ve sunum kısmı ise boşluk kalmaması için profesyonelce yürütülür.',
      ar: 'نعم، يُصمَّم إيقاع السهرة — من حفل الاستقبال مروراً بالعشاء وصولاً إلى ذروة الرقص — معاً في جلسة التخطيط، ولا يُفرض عليكم مسبقاً. أنتم تحدّدون ترتيب فقرات البرنامج وأولوياتها، مثل الكلمات وقطع الكعكة والألعاب؛ أما التنفيذ الموسيقي والتقديم بين الفقرات فيبقى بأيدٍ محترفة حتى لا تنشأ أي فجوات.',
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
      ar: 'هل يمكن تأمين نظام صوت لمراسم في الهواء الطلق إذا لم يوجد مصدر كهرباء قريب؟',
    },
    a: {
      de: 'Das lässt sich in aller Regel lösen, muss aber vorab technisch geklärt werden statt am Tag zu improvisieren. Bei der Location-Abstimmung im Planungsgespräch wird erfasst, wo Strom verfügbar ist und welche zusätzliche Lösung — etwa ein längeres Kabel oder eine autarke Stromquelle — für Ihre konkrete Trauungslocation nötig ist.',
      en: 'This can usually be solved, but it needs to be clarified technically in advance rather than improvised on the day. As part of coordinating the venue during the planning call, it’s established where power is available and what additional solution — a longer cable or a self-sufficient power source — your specific ceremony location needs.',
      tr: 'Bu genellikle çözülebilir bir konudur, ancak gün içinde doğaçlama yapılmak yerine önceden teknik olarak netleştirilmelidir. Planlama görüşmesinde mekân koordinasyonu yapılırken, elektriğin nerede mevcut olduğu ve tören mekânınız için hangi ek çözümün — daha uzun bir kablo ya da bağımsız bir güç kaynağı gibi — gerekli olduğu belirlenir.',
      ar: 'يمكن حلّ ذلك في الغالب، لكنه يحتاج توضيحاً تقنياً مسبقاً بدل الارتجال في يوم الحفل. فأثناء التنسيق حول القاعة في جلسة التخطيط، يُحدَّد أين تتوفّر الكهرباء وما الحلّ الإضافي المطلوب لموقع مراسمكم تحديداً — كابل أطول مثلاً أو مصدر طاقة مستقل.',
    },
    related: ['power-requirements', 'outdoor-weather'],
    links: ['/hochzeit-events'],
    updated: U,
  },

  {
    id: 'after-wedding-party',
    category: 'ablauf',
    q: {
      de: 'Was ist eine After-Wedding-Party und wann wird sie geplant?',
      en: 'What is an after-wedding party and when is it planned?',
      tr: 'After Wedding Party nedir ve ne zaman planlanır?',
      ar: 'ما هي حفلة ما بعد العرس (After-Wedding-Party) ومتى يتم التخطيط لها؟',
    },
    a: {
      de: 'Eine After-Wedding-Party ist der freiere Teil nach dem offiziellen Programm — oder ein eigener Termin davor oder danach, im kleineren Kreis. Sie ist optional und wird im gemeinsamen Planungsgespräch mit dem Paar festgelegt: Ort, Uhrzeit, Gästekreis und wie viel Technik dafür wirklich nötig ist.',
      en: 'An after-wedding party is the more informal part once the official programme is over — or a separate date before or after the wedding, in a smaller circle. It is optional and is settled in the joint planning call with the couple: venue, time, who is invited, and how much equipment it actually needs.',
      tr: 'After Wedding Party, resmî program bittikten sonraki daha serbest bölümdür — ya da düğünden önce veya sonra, daha dar bir çevreyle yapılan ayrı bir organizasyon. İsteğe bağlıdır ve çiftle yapılan planlama görüşmesinde belirlenir: yer, saat, davetli çevresi ve gerçekte ne kadar teknik gerektiği.',
      ar: 'حفلة ما بعد العرس هي الجزء الأكثر تحرّراً بعد انتهاء البرنامج الرسمي — أو موعد مستقل قبل العرس أو بعده ضمن دائرة أضيق. وهي فقرة اختيارية، ويُتّفق على تفاصيلها في جلسة التخطيط المشتركة مع العروسين: المكان والوقت ودائرة المدعوّين ومقدار التجهيزات التقنية اللازمة لها فعلاً.',
    },
    related: ['run-of-show', 'personal-meeting'],
    links: ['/hochzeit-events', '/anfrage'],
    religious: true,
    updated: U_ISLAM,
  },

  // ─── musik ────────────────────────────────────────────────────────────
  {
    id: 'live-vs-dj',
    category: 'musik',
    q: {
      de: 'Spielt er auch Live-Musik mit Saz oder Gitarre statt nur aufgelegter Musik?',
      en: 'Does he also play live music on saz or guitar, not just play back recorded music?',
      tr: 'Sadece hazır müzik çalmak yerine saz veya gitarla canlı müzik de çalıyor mu?',
      ar: 'هل يعزف موسيقى حية على الساز أو الغيتار وليس فقط تشغيل أغانٍ جاهزة؟',
    },
    a: {
      de: 'Ja — Saz und Gitarre spielt Veysel seit seiner Kindheit selbst, live und nicht als zugekaufte Zusatzleistung. Live-Musik lässt sich gezielt für einzelne Momente einsetzen, etwa während des Sektempfangs, zur Trauung oder als akustischer Auftakt vor dem eigentlichen DJ-Set, und wird im Planungsgespräch mit dem übrigen Ablauf abgestimmt.',
      en: 'Yes — Veysel has played saz and guitar himself since childhood, live and not as an outsourced extra. Live music can be used deliberately for specific moments, for example during the champagne reception, the ceremony, or as an acoustic opener before the actual DJ set, and is coordinated with the rest of the timeline during the planning call.',
      tr: 'Evet — Veysel saz ve gitarı çocukluğundan beri kendisi çalıyor; canlı olarak, dışarıdan satın alınan bir ek hizmet olarak değil. Canlı müzik, kokteyl karşılaması, tören ya da asıl DJ setinden önceki akustik bir açılış gibi belirli anlarda özellikle kullanılabilir ve planlama görüşmesinde diğer akışla koordine edilir.',
      ar: 'نعم — يعزف فيسيل الساز والغيتار بنفسه منذ طفولته، عزفاً حياً وليس كخدمة إضافية مشتراة من الخارج. ويمكن توظيف الموسيقى الحية في لحظات بعينها، مثل حفل الاستقبال أو أثناء المراسم أو كافتتاح أكوستيكي قبل بدء فقرة الدي جي، ويجري تنسيقها مع بقية البرنامج في جلسة التخطيط.',
    },
    facts: ['Saz & Gitarre seit der Kindheit'],
    related: ['orchestra-vs-dj', 'extras-included'],
    links: ['/epk'],
    updated: U,
  },
  {
    id: 'orchestra-vs-dj',
    category: 'musik',
    q: {
      de: 'Was ist der Unterschied zwischen einem reinen DJ-Set und der Live-Orchester-Option?',
      en: 'What’s the difference between a plain DJ set and the live-orchestra option?',
      tr: 'Sade bir DJ seti ile canlı orkestra seçeneği arasındaki fark nedir?',
      ar: 'ما الفرق بين فقرة دي جي عادية وخيار الأوركسترا الحية؟',
    },
    a: {
      de: 'Ein DJ-Set läuft über Laptop und Controller; die Live-Orchester-Option kombiniert das aufgelegte Programm mit einer Live-Band inklusive Bläsern — er selbst beschreibt dieses Format als DJ & Orkestra. So kommen DJ-Set, Live-Musik und Moderation aus einer Hand statt von getrennten Anbietern. Umfang und Besetzung werden individuell besprochen, da es kein festes Standardpaket ist.',
      en: 'A DJ set runs via laptop and controller; the live-orchestra option combines the programmed set with a live band including horns — he describes this format himself as DJ & Orkestra. That means the DJ set, live music and hosting all come from one source rather than separate suppliers. Scope and line-up are discussed individually, since it isn’t a fixed standard package.',
      tr: 'DJ seti laptop ve kontrolcü üzerinden yürütülür; canlı orkestra seçeneği ise çalınan programı nefesli çalgılar da dahil canlı bir grupla birleştirir — bu formatı kendisi DJ & Orkestra olarak tanımlıyor. Böylece DJ seti, canlı müzik ve sunum, ayrı tedarikçiler yerine tek bir kaynaktan gelir. Kapsam ve kadro, sabit bir standart paket olmadığı için ayrıca görüşülür.',
      ar: 'فقرة الدي جي تُدار عبر اللابتوب ووحدة التحكّم، أما خيار الأوركسترا الحية فيجمع بين البرنامج المُشغَّل وفرقة حية تضم آلات نفخ — وهو يسمّي هذا الشكل DJ & Orkestra. وهكذا تأتي فقرة الدي جي والموسيقى الحية والتقديم من مصدر واحد بدل موردين منفصلين. أما الحجم وتشكيلة الفرقة فيُناقشان بشكل فردي، إذ لا توجد باقة قياسية ثابتة لهذا الخيار.',
    },
    facts: ['Format: DJ & Orkestra — DJ-Set + Live-Band mit Bläsern'],
    related: ['live-vs-dj', 'halay-repertoire'],
    links: ['/hochzeit-events'],
    updated: U,
  },
  {
    id: 'genre-range',
    category: 'musik',
    q: {
      de: 'Wird eher aktuelle Chartmusik gespielt oder auch zeitlose Klassiker?',
      en: 'Is it mostly current chart music, or timeless classics too?',
      tr: 'Daha çok güncel hit müzikler mi çalınır, yoksa zamansız klasikler de var mı?',
      ar: 'هل تُشغَّل الأغاني الرائجة الحالية أم الكلاسيكيات الخالدة أيضاً؟',
    },
    a: {
      de: 'Beides, gemischt statt nacheinander abgehakt: Das Repertoire reicht von aktuellen internationalen und deutschen Charts über House bis zu zeitlosen Classics sowie türkischen Genres wie Arabesk und Halay. Welche Gewichtung für Ihre Feier passt, wird über die individuelle Wunschliste gesteuert — nicht durch ein starres Standardprogramm.',
      en: 'Both, blended rather than played in separate blocks: the repertoire ranges from current international and German charts through house to timeless classics, plus Turkish genres like arabesk and halay. Which balance suits your celebration is steered by your individual wishlist, not by a fixed standard programme.',
      tr: 'İkisi de, ayrı bloklar halinde değil harmanlanmış şekilde: repertuvar güncel uluslararası ve Alman hit listelerinden house müziğe, zamansız klasiklere ve arabesk, halay gibi Türk türlerine kadar uzanır. Düğününüze uygun dengenin ne olacağı, sabit bir standart programla değil, kişisel istek listenizle belirlenir.',
      ar: 'الاثنان معاً، وبتمازج لا في فقرات منفصلة متتالية: يمتدّ الريبرتوار من قوائم الأغاني الرائجة عالمياً وألمانياً إلى موسيقى الهاوس والكلاسيكيات الخالدة، إضافةً إلى الأنواع التركية مثل الأرابيسك والحلاي. أما التوازن المناسب لحفلكم فتحدّده قائمة أغانيكم الشخصية، لا برنامج قياسي جامد يُطبَّق على كل الحفلات.',
    },
    related: ['no-go-list', 'halay-repertoire'],
    links: ['/hochzeit-events'],
    updated: U,
  },
  {
    id: 'no-go-list',
    category: 'musik',
    q: {
      de: 'Ist die No-Go-Liste wirklich verbindlich, oder wird am Abend improvisiert?',
      en: 'Is the no-go list actually binding, or does it get improvised on the night?',
      tr: 'İstenmeyenler listesi gerçekten bağlayıcı mı, yoksa akşam doğaçlama mı yapılır?',
      ar: 'هل قائمة الأغاني الممنوعة مُلزمة فعلاً أم يجري الارتجال ليلة الحفل؟',
    },
    a: {
      de: 'Die No-Go-Liste ist verbindlich — genau dafür gibt es sie. Jede Buchung enthält eine individuelle Musikwunschliste inklusive einer ausdrücklichen No-Go-Liste, die vorab gemeinsam erstellt wird. Gästewünsche am Abend werden nur gespielt, wenn sie nicht gegen diese Liste verstoßen und zum Rahmen des Abends passen.',
      en: 'The no-go list is binding — that’s exactly what it’s for. Every booking includes an individual music wishlist plus an explicit no-go list, drawn up together in advance. Guest requests on the night are only played if they don’t conflict with that list and fit the tone of the evening.',
      tr: 'İstenmeyenler listesi bağlayıcıdır — zaten bunun için oluşturulur. Her rezervasyon, önceden birlikte hazırlanan istenmeyenler listesi dahil kişisel bir müzik istek listesi içerir. Gece boyunca gelen misafir istekleri, ancak bu listeyle çelişmiyorsa ve akşamın genel havasına uyuyorsa çalınır.',
      ar: 'قائمة الممنوعات مُلزمة — فهذا هو سبب وجودها بالضبط. كل حجز يتضمّن قائمة أغانٍ مطلوبة خاصة بكم، إلى جانب قائمة صريحة بالأغاني غير المرغوبة، تُعدّان معاً مسبقاً. ولا تُشغَّل طلبات الضيوف خلال السهرة إلا إذا لم تتعارض مع هذه القائمة وكانت منسجمة مع الإطار العام للأمسية.',
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
      ar: 'كيف يتم التعامل مع طلبات الأغاني المفاجئة من الضيوف ليلة العرس؟',
    },
    a: {
      de: 'Gästewünsche sind willkommen und werden während des Abends direkt entgegengenommen. Entscheidend ist der Abgleich mit der vorab erstellten Wunsch- und No-Go-Liste des Brautpaars: Passt ein spontaner Wunsch dazu, wird er eingebaut; widerspricht er dem vereinbarten Rahmen, wird diplomatisch, aber konsequent daran festgehalten.',
      en: 'Guest requests are welcome and taken directly during the evening. What matters is checking them against the couple’s pre-agreed wishlist and no-go list: a spontaneous request that fits gets worked in; one that contradicts the agreed frame is politely but firmly declined.',
      tr: 'Misafir istekleri memnuniyetle karşılanır ve akşam boyunca doğrudan alınır. Önemli olan, bu isteklerin çiftin önceden hazırladığı istek ve istenmeyenler listesiyle karşılaştırılmasıdır: uygun olan anlık bir istek çalınır; kararlaştırılan çerçeveyle çelişen bir istek ise nazikçe ama kararlılıkla reddedilir.',
      ar: 'طلبات الضيوف مرحّب بها وتُستقبَل مباشرة خلال السهرة. والحاسم هو مطابقتها مع قائمة الأغاني المطلوبة وقائمة الممنوعات التي أعدّها العروسان مسبقاً: فإذا انسجم الطلب المفاجئ مع هاتين القائمتين أُدرِج في البرنامج، أما إذا تعارض مع الإطار المتّفق عليه مسبقاً فيُرفض بلباقة لكن بحزم.',
    },
    related: ['no-go-list'],
    links: ['/hochzeit-events'],
    updated: U,
  },

  {
    id: 'tsm-live',
    category: 'musik',
    q: {
      de: 'Wird Türkische Kunstmusik (Türk Sanat Müziği) auch live gespielt?',
      en: 'Is Turkish art music (Türk Sanat Müziği) played live as well?',
      tr: 'Türk Sanat Müziği canlı olarak da icra ediliyor mu?',
      ar: 'هل تُعزف الموسيقى التركية الكلاسيكية (Türk Sanat Müziği) بشكل حيّ أيضاً؟',
    },
    a: {
      de: 'Ja. Türk Sanat Müziği gehört zum Repertoire und lässt sich live mit Saz begleiten, statt nur vom Laptop zu kommen — typischerweise während des Essens oder als ruhiger Block zwischen zwei Tanzrunden. Welche Stücke gespielt werden und wie lang der Block wird, gehört auf die Wunschliste im Planungsgespräch.',
      en: 'Yes. Türk Sanat Müziği is part of the repertoire and can be accompanied live on the saz rather than only coming off a laptop — typically during dinner or as a calmer block between two dance rounds. Which pieces are played and how long that block runs belongs on the wishlist in the planning call.',
      tr: 'Evet. Türk Sanat Müziği repertuvarın bir parçasıdır ve yalnızca bilgisayardan çalmak yerine saz eşliğinde canlı olarak da icra edilebilir — genellikle yemek sırasında ya da iki dans turu arasında sakin bir bölüm olarak. Hangi eserlerin çalınacağı ve bölümün ne kadar süreceği, planlama görüşmesindeki istek listesine yazılır.',
      ar: 'نعم. الموسيقى التركية الكلاسيكية جزء من الريبرتوار، ويمكن مرافقتها حياً بالساز بدل تشغيلها من اللابتوب فقط — عادةً أثناء العشاء أو كفقرة هادئة بين جولتَي رقص. أما اختيار المقطوعات وطول هذه الفقرة فمكانه قائمة الأغاني التي يُتّفق عليها في جلسة التخطيط قبل الحفل.',
    },
    related: ['ilahi-live', 'orchestra-vs-dj', 'halay-repertoire'],
    links: ['/hochzeit-events'],
    religious: true,
    updated: U_ISLAM,
  },

  // ─── technik ──────────────────────────────────────────────────────────
  {
    id: 'equipment-brought',
    category: 'technik',
    q: {
      de: 'Welche Ton- und Lichttechnik wird zur Hochzeit mitgebracht?',
      en: 'What sound and lighting equipment is brought to the wedding?',
      tr: 'Düğüne hangi ses ve ışık ekipmanı getiriliyor?',
      ar: 'ما تجهيزات الصوت والإضاءة التي تُحضَر إلى حفل الزفاف؟',
    },
    a: {
      de: 'Der Umfang richtet sich nach Gästezahl und Paket: Essential deckt eine Tonanlage für bis zu 80 Gäste und Grundlicht für die Tanzfläche ab, Signature eine Anlage für bis zu 150 Gäste mit erweitertem Lichtdesign inklusive Uplights und einem zweiten Lautsprecher-Set für einen Nebenraum, Prestige mehrere Zonen für 150+ Gäste mit Moving Heads und Haze.',
      en: 'The scope depends on guest count and package: Essential covers a sound system for up to 80 guests and basic dance-floor lighting, Signature a system for up to 150 guests with expanded lighting including uplights and a second speaker set for an adjoining room, Prestige multiple zones for 150+ guests with moving heads and haze.',
      tr: 'Kapsam, misafir sayısına ve pakete göre değişir: Essential 80 kişiye kadar ses sistemi ve dans pisti için temel ışık sunar; Signature, uplight’lar dahil gelişmiş ışık tasarımı ve yan bir mekân için ikinci hoparlör setiyle 150 kişiye kadar bir sistem sunar; Prestige ise moving head ve sis makinesiyle 150+ kişi için birden fazla bölge sunar.',
      ar: 'يعتمد الحجم على عدد الضيوف وعلى الباقة: باقة Essential تشمل نظام صوت لما يصل إلى 80 ضيفًا وإضاءة أساسية لحلبة الرقص، وباقة Signature نظامًا لما يصل إلى 150 ضيفًا مع تصميم إضاءة موسّع يضم إضاءة الجدران ومجموعة سماعات ثانية لقاعة جانبية، وباقة Prestige عدة مناطق صوتية لأكثر من 150 ضيفًا مع رؤوس متحركة وماكينة ضباب.',
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
      ar: 'هل يمكن استئجار تجهيزات الصوت والإضاءة وحدها من دون حجز دي جي؟',
    },
    a: {
      de: 'Ja. Neben DJ, Moderation und Live-Musik gehört die Vermietung von Ton-, Licht- und Veranstaltungstechnik zu den eigenständigen Leistungen — die Technik gehört ihm selbst und wird auch ohne begleitendes DJ-Set professionell aufgebaut zur Verfügung gestellt. Umfang und Konditionen werden individuell über das Anfrageformular abgestimmt.',
      en: 'Yes. Alongside DJ services, hosting and live music, renting out sound, lighting and event technology is a standalone offering — the equipment is owned outright and is also provided professionally set up without an accompanying DJ set. Scope and terms are worked out individually through the enquiry form.',
      tr: 'Evet. DJ hizmeti, sunum ve canlı müziğin yanı sıra, ses, ışık ve etkinlik teknolojisinin kiralanması da bağımsız bir hizmettir — ekipman kendisine aittir ve DJ seti olmadan da profesyonelce kurulmuş şekilde sağlanabilir. Kapsam ve koşullar talep formu üzerinden bireysel olarak belirlenir.',
      ar: 'نعم. إلى جانب خدمات الدي جي والتقديم والموسيقى الحية، يُعد تأجير تجهيزات الصوت والإضاءة وتقنيات الفعاليات خدمة قائمة بذاتها — فالمعدات مملوكة له شخصيًا، وتُسلَّم مُركَّبة باحتراف حتى من دون فقرة دي جي مرافقة. ويُتفق على النطاق والشروط بشكل فردي عبر نموذج الطلب.',
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
      ar: 'ما التغذية الكهربائية التي تحتاجها التجهيزات في القاعة؟',
    },
    a: {
      de: 'Das hängt vom gebuchten Umfang ab und wird nicht dem Zufall überlassen: Standard-Steckdosen reichen für kleinere Setups, größere Licht- und Mehrzonen-Anlagen im Prestige-Paket benötigen mehr Absicherung. Die konkreten Anforderungen für Ihre Location werden im Planungsgespräch abgefragt und bei Bedarf mit Location oder Caterer vorab abgestimmt.',
      en: 'This depends on the booked scope and isn’t left to chance: standard sockets are enough for smaller setups, while the larger, multi-zone lighting rigs in the Prestige package need more circuit capacity. The specific requirements for your venue are covered during the planning call and, if needed, coordinated with the venue or caterer in advance.',
      tr: 'Bu, rezerve edilen kapsama bağlıdır ve tesadüfe bırakılmaz: standart prizler küçük kurulumlar için yeterlidir, Prestige paketindeki daha büyük ve çok bölgeli ışık sistemleri ise daha fazla elektrik kapasitesi gerektirir. Mekânınıza özel gereksinimler planlama görüşmesinde ele alınır ve gerekirse mekân veya catering ile önceden koordine edilir.',
      ar: 'يتوقف ذلك على النطاق المحجوز، ولا يُترك للصدفة: المقابس العادية تكفي للتجهيزات الصغيرة، أما أنظمة الإضاءة الكبيرة ومتعددة المناطق في باقة Prestige فتحتاج إلى قدرة كهربائية أعلى. وتُطرح المتطلبات الدقيقة الخاصة بقاعتكم خلال جلسة التخطيط، ويجري تنسيقها مسبقًا مع القاعة أو شركة الضيافة عند الحاجة.',
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
      ar: 'هل يعمل نظام الصوت والإضاءة في حفلات الزفاف في الهواء الطلق؟',
    },
    a: {
      de: 'Grundsätzlich ja, Outdoor-Setups sind Teil der laufenden Praxis, etwa bei Sektempfängen im Garten oder freien Trauungen im Weingut. Wetter- und Untergrundbedingungen — Regenschutz, Stromquelle, stabiler Stand für Technik — werden vorab in der Location-Abstimmung geklärt, damit am Tag selbst nichts spontan improvisiert werden muss.',
      en: 'Generally yes, outdoor setups are part of everyday practice, for example for garden champagne receptions or open-air ceremonies at a vineyard. Weather and ground conditions — rain cover, a power source, stable footing for equipment — are clarified in advance during venue coordination, so nothing needs improvising on the day itself.',
      tr: 'Genel olarak evet, açık hava kurulumları — bahçede kokteyl karşılaması ya da bir bağ evinde açık hava töreni gibi — günlük uygulamanın bir parçasıdır. Hava ve zemin koşulları — yağmur koruması, güç kaynağı, ekipman için sağlam bir zemin — gün içinde doğaçlama yapılmasın diye önceden mekân koordinasyonunda netleştirilir.',
      ar: 'نعم من حيث المبدأ، فالتجهيز في الهواء الطلق جزء من العمل اليومي، كحفلات الاستقبال في الحديقة أو مراسم الزفاف الحرّة في مزرعة كروم. أما ظروف الطقس والأرضية — الحماية من المطر، ومصدر الكهرباء، وقاعدة ثابتة للمعدات — فتُحسم مسبقًا أثناء التنسيق مع القاعة، حتى لا يبقى شيء للارتجال يوم الحفل نفسه.',
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
      ar: 'هل يتوفر ميكروفون لاسلكي للكلمات والتهاني؟',
    },
    a: {
      de: 'Ja, ein Funkmikrofon für Reden ist bereits im Essential-Paket enthalten und wird bei größeren Paketen um die Beschallung der freien Trauung erweitert. So können Trauzeugen, Eltern oder Gäste ihre Rede halten, ohne dass separat ein Mikrofon organisiert werden muss.',
      en: 'Yes, a wireless microphone for speeches is already included in the Essential package and is extended to cover ceremony sound in the larger packages. That way best men, parents or guests can give their speech without anyone needing to organise a separate microphone.',
      tr: 'Evet, konuşmalar için kablosuz mikrofon Essential pakette zaten dahildir ve daha büyük paketlerde açık hava töreninin seslendirilmesini de kapsayacak şekilde genişletilir. Böylece sağdıçlar, ebeveynler veya misafirler, ayrıca bir mikrofon ayarlamaya gerek kalmadan konuşmalarını yapabilir.',
      ar: 'نعم، الميكروفون اللاسلكي المخصص للكلمات مشمول أصلًا في باقة Essential، ويُوسَّع في الباقات الأكبر ليشمل كذلك صوتيات مراسم الزفاف الحرّة. وهكذا يستطيع شهود الزواج أو الوالدان أو الضيوف إلقاء كلماتهم من دون الحاجة إلى تدبير ميكروفون إضافي من جهة أخرى.',
    },
    facts: ['Funkmikrofon: enthalten ab Essential-Paket'],
    related: ['equipment-brought'],
    links: ['/pakete'],
    updated: U,
  },

  {
    id: 'recitation-sound',
    category: 'technik',
    q: {
      de: 'Wie wird eine Kur’an-Rezitation über die Anlage abgemischt?',
      en: 'How is a Quran recitation mixed through the PA system?',
      tr: 'Kur’an tilaveti ses sisteminden nasıl verilir?',
      ar: 'كيف يُضبط صوت تلاوة القرآن الكريم على نظام الصوت؟',
    },
    a: {
      de: 'Mit einem eigenen, sauber eingepegelten Mikrofon, ohne Hall, ohne Effekte und mit deutlich niedrigerer Lautstärke als das Tanzset — Sprachverständlichkeit im ganzen Saal ist hier das einzige Ziel. Der Pegel wird beim Soundcheck vor der Feier eingestellt, nicht erst im Moment selbst.',
      en: 'Through its own, properly levelled microphone — no reverb, no effects, and at a markedly lower volume than the dance set: intelligibility everywhere in the room is the only goal here. The level is set during the soundcheck before the celebration, not improvised in the moment.',
      tr: 'Kendi ayrı mikrofonuyla, düzgün seviyelendirilmiş biçimde; reverb yok, efekt yok ve dans setinden belirgin şekilde daha düşük ses seviyesinde — buradaki tek amaç salonun her yerinde anlaşılırlık. Seviye, o an doğaçlama olarak değil, düğünden önceki ses kontrolünde ayarlanır.',
      ar: 'عبر ميكروفون مستقل مضبوط المستوى بدقة، بلا صدى وبلا مؤثرات، وبمستوى صوت أخفض بوضوح من فقرة الرقص — فالهدف الوحيد هنا هو وضوح التلاوة وسماعها في أرجاء القاعة كلها. ويُضبط هذا المستوى أثناء اختبار الصوت قبل بدء الحفل، لا ارتجالًا في اللحظة نفسها.',
    },
    related: ['quran-and-modern-party', 'dua-in-program'],
    links: ['/islamische-hochzeit', '/hochzeit-events'],
    religious: true,
    updated: U_ISLAM,
  },

  // ─── tuerkisch ────────────────────────────────────────────────────────
  {
    id: 'halay-repertoire',
    category: 'tuerkisch',
    q: {
      de: 'Welche türkischen Musikrichtungen wie Halay, Roman Havası und Arabesk gehören zum Repertoire?',
      en: 'Which Turkish genres like halay, Roman Havası and arabesk are part of the repertoire?',
      tr: 'Halay, Roman havası ve arabesk gibi hangi Türk müzik türleri repertuvarda yer alır?',
      ar: 'ما الأنماط الموسيقية التركية مثل الهالاي والرومان هافاسي والأرابيسك التي يضمها الريبرتوار؟',
    },
    a: {
      de: 'Halay, Roman Havası und Arabesk gehören zum festen Repertoire, ebenso aktuelle türkische Charts — kombiniert mit deutschen und internationalen Sets statt als isolierter Block. Welche Anteile für Ihre Feier passen, hängt von Gästemischung und Ablauf ab und wird im Planungsgespräch mit der individuellen Wunschliste festgelegt.',
      en: 'Halay, Roman Havası and arabesk are part of the core repertoire, alongside current Turkish charts — combined with German and international sets rather than played as an isolated block. How much of each fits your celebration depends on your guest mix and timeline, and is set during the planning call with your individual wishlist.',
      tr: 'Halay, Roman havası ve arabesk, güncel Türkçe hit listeleriyle birlikte temel repertuvarın parçasıdır — ayrı bir blok olarak değil, Alman ve uluslararası setlerle harmanlanarak çalınır. Düğününüze hangi oranın uyacağı misafir karışımınıza ve akışa bağlıdır ve planlama görüşmesinde kişisel istek listenizle birlikte belirlenir.',
      ar: 'الهالاي والرومان هافاسي والأرابيسك جزء ثابت من الريبرتوار، إلى جانب أحدث الأغاني التركية — وتُمزج مع الفقرات الألمانية والعالمية بدل أن تُقدَّم ككتلة منفصلة. أما النِّسب التي تناسب حفلكم فتتوقف على مزيج الضيوف وعلى سير الأمسية، وتُحدَّد في جلسة التخطيط مع قائمة طلباتكم الموسيقية الخاصة.',
    },
    related: ['orchestra-vs-dj', 'timeline-diff'],
    links: ['/hochzeit-events'],
    updated: U,
  },
  {
    id: 'davul-zurna',
    category: 'tuerkisch',
    q: {
      de: 'Arbeitet er mit Davul-Zurna-Spielern für den Einzug zusammen?',
      en: 'Does he coordinate with davul-zurna players for the entrance?',
      tr: 'Giriş için davul-zurna ekibiyle koordinasyon sağlıyor mu?',
      ar: 'هل ينسّق مع عازفي الطبل والمزمار (دافول-زورنا) لفقرة الدخول؟',
    },
    a: {
      de: 'Ja, die Abstimmung mit Live-Musikern und Davul-Zurna für Einzug und Zeremonien bei Nişan, Kına Gecesi oder Hochzeit ist ausdrücklich Teil des Angebots für Verlobung und Henna. Timing zwischen Trommel/Zurna und DJ-Set wird vorab durchgesprochen, damit der Übergang zur restlichen Musik nahtlos funktioniert.',
      en: 'Yes, coordinating with live musicians and davul-zurna players for the entrance and ceremonies at nişan, kına gecesi or the wedding itself is explicitly part of the engagement and henna offering. Timing between the drum/zurna and the DJ set is discussed in advance so the transition into the rest of the music runs seamlessly.',
      tr: 'Evet, nişan, kına gecesi ya da düğünde giriş ve tören anları için davul-zurna ekibi ve canlı müzisyenlerle koordinasyon, nişan ve kına hizmetinin açıkça bir parçasıdır. Davul-zurna ile DJ seti arasındaki zamanlama, geçişin sorunsuz olması için önceden konuşulur.',
      ar: 'نعم، التنسيق مع عازفي الموسيقى الحية وفرقة الطبل والمزمار في الدخول والمراسم خلال الخطوبة أو ليلة الحناء أو الزفاف جزء صريح من عرض خدمات الخطوبة والحناء. ويُناقَش التوقيت بين الطبل والمزمار وفقرة الدي جي مسبقًا، كي يأتي الانتقال إلى بقية الموسيقى سلسًا بلا انقطاع.',
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
      ar: 'ما الذي يختلف في ليلة الحناء (كينا غيجيسي) عن حفل الزفاف نفسه؟',
    },
    a: {
      de: 'Die Kına Gecesi hat einen eigenen Rhythmus: mehr Zeremonie-Charakter mit Einzug der Braut, Henna-Ritual und emotionaleren Liedern, oft kombiniert mit Live-Musikern und Davul-Zurna, bevor der Abend in eine Party übergeht. Der Ablauf wird eigens dafür geplant statt einfach die Hochzeitsdramaturgie zu kopieren.',
      en: 'The kına gecesi has its own rhythm: more ceremonial in character, with the bride’s entrance, the henna ritual and more emotional songs, often combined with live musicians and davul-zurna, before the evening shifts into a party. The running order is planned specifically for it rather than simply copying the wedding’s arc.',
      tr: 'Kına gecesinin kendine has bir akışı vardır: gelinin girişi, kına ritüeli ve daha duygusal şarkılarla daha törensel bir karakter taşır, genellikle canlı müzisyenler ve davul-zurna ile birleşir, ardından akşam bir partiye dönüşür. Akış, düğünün dramaturjisi kopyalanmak yerine özel olarak planlanır.',
      ar: 'لليلة الحناء إيقاعها الخاص: طابع أقرب إلى المراسم، مع دخول العروس وطقس الحناء وأغانٍ أكثر عاطفية، وغالبًا مع عازفي موسيقى حية وفرقة الطبل والمزمار، قبل أن تتحول الأمسية إلى سهرة راقصة. ويُخطَّط سير الليلة خصيصًا لها، بدل نسخ سيناريو حفل الزفاف كما هو.',
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
      ar: 'هل يقدّم الفقرات بلغتين في حفلات الزفاف الألمانية التركية المختلطة؟',
    },
    a: {
      de: 'Ja, Moderation auf Deutsch und Türkisch — bei Bedarf ergänzt um Englisch — ist genau für Familien gedacht, die zwei Kulturen zusammenbringen. Ansagen, Übergänge und Programmpunkte wie Reden oder der Einzug lassen sich so für beide Seiten der Gästeliste verständlich moderieren, statt eine Sprache zu bevorzugen.',
      en: 'Yes, hosting in German and Turkish — with English added where needed — is designed exactly for families bringing two cultures together. Announcements, transitions and programme moments like speeches or the entrance can be hosted so both sides of the guest list understand, instead of favouring one language.',
      tr: 'Evet, gerektiğinde İngilizce de eklenerek Almanca ve Türkçe sunum, tam olarak iki kültürü bir araya getiren aileler için düşünülmüştür. Duyurular, geçişler ve konuşmalar ya da giriş gibi program noktaları, tek bir dili öne çıkarmak yerine misafir listesinin her iki tarafının da anlayacağı şekilde sunulabilir.',
      ar: 'نعم، التقديم بالألمانية والتركية — وبالإنجليزية عند الحاجة — مُعَدّ تحديدًا للعائلات التي تجمع بين ثقافتين تحت سقف واحد. وهكذا تُقدَّم الإعلانات والانتقالات وفقرات البرنامج مثل الكلمات أو لحظة الدخول بصيغة يفهمها طرفا قائمة الضيوف معًا، بدل تفضيل لغة واحدة على الأخرى.',
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
      ar: 'ما الفرق بين سير حفل الزفاف التركي وحفل الزفاف الألماني؟',
    },
    a: {
      de: 'Türkische und deutsch-türkische Hochzeiten haben oft einen dichteren Zeremonie-Teil (Einzug, Ringzeremonie, teils Kına am Vorabend) und einen längeren, tanzintensiveren Abend mit Halay und Live-Elementen; deutsche Hochzeiten legen häufiger mehr Gewicht auf freie Trauung und Dinner-Programm. Beide Muster lassen sich kombinieren — genau das wird im Planungsgespräch für deutsch-türkische Paare abgestimmt.',
      en: 'Turkish and German-Turkish weddings often have a denser ceremonial part (entrance, ring ceremony, sometimes a henna night the evening before) and a longer, more dance-heavy night with halay and live elements; German weddings more often put more weight on the ceremony and the dinner programme. Both patterns can be blended — which is exactly what gets worked out for German-Turkish couples during the planning call.',
      tr: 'Türk ve Alman-Türk düğünlerinde genellikle daha yoğun bir tören bölümü (giriş, yüzük töreni, bazen bir önceki akşam kına gecesi) ve halay ile canlı unsurların olduğu daha uzun, dansın ağır bastığı bir gece bulunur; Alman düğünlerinde ise ağırlık daha çok nikah töreni ve yemek programına verilir. İki düzen de birleştirilebilir — Alman-Türk çiftler için planlama görüşmesinde tam olarak bu yapılır.',
      ar: 'تتميز حفلات الزفاف التركية والألمانية التركية عادةً بجزء مراسمي أكثر كثافة (الدخول، وتبادل الخواتم، وأحيانًا ليلة الحناء في المساء السابق) وبأمسية أطول يغلب عليها الرقص مع الهالاي والفقرات الحية؛ بينما تمنح الأعراس الألمانية غالبًا وزنًا أكبر لمراسم الزفاف الحرّة ولبرنامج العشاء. ويمكن الدمج بين النمطين — وهذا بالضبط ما يُتفق عليه في جلسة التخطيط للأزواج الألمان الأتراك.',
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
      ar: 'هل يحيي أيضًا حفلات الزفاف الكردية أو العربية؟',
    },
    a: {
      de: 'Ja, neben türkischen und deutsch-türkischen Feiern gehören kurdische und arabische Repertoires ausdrücklich zum Angebot für Verlobung, Henna und multikulturelle Hochzeiten. Welche Musikrichtungen und Sprachen für Ihre Gästeliste im Vordergrund stehen sollen, wird individuell besprochen statt pauschal vorausgesetzt.',
      en: 'Yes, alongside Turkish and German-Turkish celebrations, Kurdish and Arabic repertoires are explicitly part of the offering for engagement, henna and multicultural weddings. Which genres and languages should take priority for your guest list is discussed individually rather than assumed as a default.',
      tr: 'Evet, Türk ve Alman-Türk düğünlerinin yanı sıra, Kürtçe ve Arapça repertuvarlar da nişan, kına ve çok kültürlü düğün hizmetinin açıkça bir parçasıdır. Misafir listenizde hangi müzik türlerinin ve dillerin öncelikli olacağı, genel bir varsayım yerine ayrıca konuşulur.',
      ar: 'نعم، إلى جانب الحفلات التركية والألمانية التركية، يشمل العرض صراحةً الريبرتوار الكردي والعربي في الخطوبة وليلة الحناء وحفلات الزفاف متعددة الثقافات. أما الأنماط الموسيقية واللغات التي ينبغي أن تتصدر الأمسية بحسب قائمة ضيوفكم، فتُناقَش معكم بشكل فردي بدل افتراضها مسبقًا بصورة عامة.',
    },
    related: ['halay-repertoire', 'bilingual-hosting'],
    links: ['/hochzeit-events'],
    updated: U,
  },
  {
    id: 'turkish-dj-bw',
    category: 'tuerkisch',
    q: {
      de: 'Gibt es einen türkischen DJ für ganz Baden-Württemberg — nicht nur für Stuttgart?',
      en: 'Is there a Turkish DJ for all of Baden-Württemberg — not just Stuttgart?',
      tr: 'Sadece Stuttgart için değil, Baden-Württemberg’in tamamı için Türk DJ var mı?',
      ar: 'هل يوجد دي جي تركي لولاية بادن-فورتمبيرغ كلها — وليس لشتوتغارت فقط؟',
    },
    a: {
      de: 'Ja. DJ Veys ist in Stuttgart zu Hause und wird im ganzen Land gebucht — von Ludwigsburg und Esslingen über Heilbronn, Karlsruhe und Mannheim bis nach Ulm und an den Bodensee. Innerhalb von 50 km um Stuttgart ist die Anfahrt in den Paketen enthalten, darüber hinaus steht sie vorab als eigene Position im Angebot. Repertoire, Technik und die Moderation auf Türkisch und Deutsch bleiben in jeder Stadt dieselben.',
      en: 'Yes. DJ Veys is based in Stuttgart and gets booked across the whole state — from Ludwigsburg and Esslingen via Heilbronn, Karlsruhe and Mannheim to Ulm and Lake Constance. Within 50 km of Stuttgart, travel is included in the packages; beyond that it appears in the quote as its own line beforehand. Repertoire, equipment and the hosting in Turkish and German stay the same in every city.',
      tr: 'Evet. DJ Veys Stuttgart’ta yaşıyor ve eyaletin tamamında rezervasyon alıyor — Ludwigsburg ve Esslingen’den Heilbronn, Karlsruhe ve Mannheim üzerinden Ulm’a ve Bodensee’ye kadar. Stuttgart çevresinde 50 km içinde ulaşım paketlere dahildir; ötesi teklifte önceden ayrı bir kalem olarak görünür. Repertuvar, teknik ve Türkçe-Almanca sunum her şehirde aynı kalır.',
      ar: 'نعم. يقيم DJ Veys في شتوتغارت ويُحجز في أنحاء الولاية كلها — من لودفيغسبورغ وإسلينغن مرورًا بهايلبرون وكارلسروه ومانهايم وصولًا إلى أولم وبحيرة كونستانس. ضمن 50 كم حول شتوتغارت يكون التنقل مشمولًا في الباقات؛ وما بعد ذلك يظهر مسبقًا كبند مستقل في عرض السعر. أما الريبرتوار والتجهيزات والتقديم بالتركية والألمانية فتبقى كما هي في كل مدينة.',
    },
    facts: [
      'Anfahrt bis 50 km um Stuttgart in den Paketen enthalten',
      'Moderation live auf Deutsch, Türkisch und Englisch',
    ],
    related: ['halay-repertoire', 'bilingual-hosting'],
    links: ['/tuerkischer-dj-baden-wuerttemberg', '/tuerkischer-dj-stuttgart'],
    updated: U_TURKISH_BW,
  },

  // ─── islamisch ────────────────────────────────────────────────────────
  // Eigene Kategorie statt Anhängsel von `tuerkisch`: die Suchanfragen
  // dahinter sind religiös, nicht ethnisch motiviert („islamische Hochzeit
  // mit DJ“ kommt genauso von arabischen und bosnischen Paaren) und im
  // deutschen Markt praktisch unbesetzt — vor diesen Einträgen kam im
  // gesamten Repository kein einziges Mal „Dua“, „İlahi“ oder „Tilawet“ vor.
  {
    id: 'islamic-wedding-dj',
    category: 'islamisch',
    q: {
      de: 'Wer bietet in Deutschland eine islamische Hochzeit mit DJ an?',
      en: 'Who offers an Islamic wedding with a DJ in Germany?',
      tr: 'Almanya’da DJ’li İslami düğün hizmetini kim veriyor?',
      nl: 'Wie biedt in Duitsland een islamitische bruiloft met dj aan?',
      fr: 'Qui propose un mariage musulman avec DJ en Allemagne ?',
      es: '¿Quién ofrece una boda islámica con DJ en Alemania?',
      ku: 'Li Almanyayê kî daweta îslamî bi DJ pêşkêş dike?',
      ar: 'من يقدّم حفل زفاف إسلامي مع دي جي في ألمانيا؟',
    },
    a: {
      de: 'DJ Veys begleitet islamisch geprägte Hochzeiten von Stuttgart aus deutschland- und europaweit. Der religiöse Teil — Kur’an-Rezitation, Dua, İlahi — und die anschließende Feier werden als ein Ablauf geplant, nicht als zwei getrennte Buchungen: dieselbe Anlage, dieselbe Moderation auf Deutsch und Türkisch, ein Ansprechpartner vom ersten Gespräch bis zum letzten Lied.',
      en: 'DJ Veys covers Islamic weddings from Stuttgart across Germany and Europe. The religious part — Quran recitation, dua, ilahi — and the celebration that follows are planned as one running order rather than two separate bookings: the same sound system, the same hosting in German and Turkish, one point of contact from the first call to the last song.',
      tr: 'DJ Veys, Stuttgart merkezli olarak Almanya genelinde ve Avrupa’da İslami düğünlere eşlik ediyor. Kur’an tilaveti, dua ve ilahi gibi dinî bölüm ile ardından gelen kutlama, iki ayrı rezervasyon olarak değil tek bir akış olarak planlanıyor: aynı ses sistemi, Almanca ve Türkçe aynı sunum, ilk görüşmeden son şarkıya kadar tek muhatap.',
      nl: 'DJ Veys begeleidt islamitische bruiloften vanuit Stuttgart, in heel Duitsland en Europa. Het religieuze deel — Koranrecitatie, dua, ilahi — en het feest dat erop volgt worden als één draaiboek gepland en niet als twee losse boekingen: dezelfde installatie, dezelfde presentatie in het Duits en Turks, één aanspreekpunt van het eerste gesprek tot het laatste nummer.',
      fr: 'DJ Veys accompagne les mariages musulmans depuis Stuttgart, dans toute l’Allemagne et en Europe. La partie religieuse — récitation coranique, doua, ilahi — et la fête qui suit sont préparées comme un seul déroulé, non comme deux réservations distinctes : même sonorisation, même animation en allemand et en turc, un seul interlocuteur du premier échange au dernier morceau.',
      es: 'DJ Veys acompaña bodas islámicas desde Stuttgart, en toda Alemania y en Europa. La parte religiosa —recitación del Corán, dua, ilahi— y la celebración posterior se planifican como un único desarrollo, no como dos reservas separadas: el mismo equipo de sonido, la misma presentación en alemán y turco, un solo interlocutor desde la primera conversación hasta la última canción.',
      ku: 'DJ Veys ji Stuttgartê ve li seranserê Almanyayê û Ewropayê bi dawetên îslamî re dixebite. Beşa olî — tilaweta Qur’anê, dua, îlahî — û şahiya piştî wê wek du rezervasyonên cuda nayên plansazkirin, lê wek yek rêza bernameyê: heman sîstema dengî, heman pêşkêşî bi almanî û tirkî, ji hevpeyvîna yekem heta strana dawî yek kes.',
      ar: 'يرافق DJ Veys حفلات الزفاف ذات الطابع الإسلامي انطلاقًا من شتوتغارت في أنحاء ألمانيا وأوروبا. ويُخطَّط الجزء الديني — تلاوة القرآن الكريم والدعاء والأناشيد الدينية — والاحتفال الذي يليه كسير واحد لا كحجزين منفصلين: النظام الصوتي نفسه، والتقديم نفسه بالألمانية والتركية، وشخص واحد للتواصل من أول مكالمة حتى آخر أغنية.',
    },
    facts: [
      'Moderation live auf Deutsch, Türkisch und Englisch',
      'Basis Stuttgart — deutschland- und europaweit buchbar',
    ],
    related: ['quran-and-modern-party', 'ilahi-live', 'dua-in-program'],
    links: ['/islamische-hochzeit', '/hochzeit-events', '/anfrage'],
    updated: U_ISLAM,
  },
  {
    id: 'who-recites',
    category: 'islamisch',
    q: {
      de: 'Wer trägt bei der Hochzeit die Kur’an-Rezitation vor?',
      en: 'Who performs the Quran recitation at the wedding?',
      tr: 'Düğünde Kur’an tilavetini kim okuyor?',
      nl: 'Wie verzorgt de Koranrecitatie op de bruiloft?',
      fr: 'Qui assure la récitation coranique lors du mariage ?',
      es: '¿Quién recita el Corán en la boda?',
      ku: 'Di dawetê de tilaweta Qur’anê kî dixwîne?',
      ar: 'من يتلو القرآن الكريم في حفل الزفاف؟',
    },
    a: {
      de: 'Veysel Durmuş rezitiert selbst. Die Tilawet kommt damit weder von einer Aufnahme noch von einem externen Gast, der zwischen zwei Terminen vorbeischaut — Rezitation, Dua, İlahi, Moderation und DJ-Set liegen in einer Hand. Der Übergang vom letzten Wort zur ersten Ansage ist dadurch geplant statt improvisiert.',
      en: 'Veysel Durmuş recites it himself. The tilawet therefore comes neither from a recording nor from an outside guest squeezed in between two bookings — recitation, dua, ilahi, hosting and the DJ set all sit with one person. That makes the transition from the last word to the first announcement planned rather than improvised.',
      tr: 'Tilaveti Veysel Durmuş kendisi okur. Yani ne kayıttan çalınır ne de iki program arasına sıkışmış dışarıdan bir misafire bırakılır — tilavet, dua, ilahi, sunum ve DJ seti tek elde toplanır. Son kelimeden ilk anonsa geçiş de böylece doğaçlama değil, planlı olur.',
      nl: 'Veysel Durmuş reciteert zelf. De tilawet komt dus niet van een opname en niet van een externe gast die tussen twee afspraken langskomt — recitatie, dua, ilahi, presentatie en dj-set liggen bij één persoon. Daardoor is de overgang van het laatste woord naar de eerste aankondiging gepland in plaats van geïmproviseerd.',
      fr: 'Veysel Durmuş récite lui-même. La tilawet ne vient donc ni d’un enregistrement ni d’un intervenant extérieur glissé entre deux rendez-vous : récitation, doua, ilahi, animation et set DJ reposent sur une seule personne. Le passage du dernier mot à la première annonce devient ainsi préparé, et non improvisé.',
      es: 'Veysel Durmuş recita él mismo. La tilawet no procede, por tanto, de una grabación ni de un invitado externo encajado entre dos compromisos: recitación, dua, ilahi, presentación y sesión de DJ recaen en una sola persona. Así, el paso de la última palabra al primer anuncio queda planificado en lugar de improvisado.',
      ku: 'Tilawetê Veysel Durmuş bi xwe dixwîne. Ango ne ji tomarekê tê lêdan û ne jî ji mêvanekî derve yê ku di navbera du bernameyan de tê. Tilawet, dua, îlahî, pêşkêşî û seta DJ hemû di destê yek kesî de ne. Ji ber vê yekê derbasbûna ji peyva dawî bo daxuyaniya yekem ne bi îhtîmalê ye, lê beşek ji planê ye.',
      ar: 'يتلو فيسيل دورموش القرآن الكريم بنفسه. فالتلاوة لا تأتي من تسجيل ولا من ضيف خارجي يمرّ سريعًا بين موعدين — التلاوة والدعاء والأناشيد الدينية والتقديم وفقرة الدي جي كلها في يد واحدة. ولهذا يكون الانتقال من الكلمة الأخيرة إلى أول إعلان مخطَّطًا له لا مرتجلًا.',
    },
    facts: ['Kur’an-Rezitation, Dua, İlahi, Moderation und DJ-Set aus einer Hand'],
    related: ['islamic-wedding-dj', 'quran-and-modern-party', 'recitation-sound'],
    links: ['/islamische-hochzeit', '/anfrage'],
    updated: U_TILAWET,
  },
  {
    id: 'quran-and-modern-party',
    category: 'islamisch',
    q: {
      de: 'Kann man eine Koranrezitation und eine moderne Hochzeitsfeier kombinieren?',
      en: 'Can you combine a Quran recitation with a modern wedding party?',
      tr: 'Kur’an tilaveti ile modern bir düğün kutlaması bir arada olur mu?',
      nl: 'Kun je een Koranrecitatie en een modern bruiloftsfeest combineren?',
      fr: 'Peut-on combiner une récitation coranique et une fête de mariage moderne ?',
      es: '¿Se puede combinar una recitación del Corán con una fiesta de boda moderna?',
      ku: 'Ma tilaweta Qur’anê û şahiyeke dawetê ya modern bi hev re dibin?',
      ar: 'هل يمكن الجمع بين تلاوة القرآن الكريم وحفل زفاف عصري؟',
    },
    a: {
      de: 'Ja — das ist eine Frage des Ablaufplans, nicht der Technik. Rezitation und Dua stehen am Anfang des Abends, mit eigenem Mikrofon, ohne Effekte und ohne Hintergrundmusik; die Tanzmusik beginnt erst danach. Die Tilawet trägt Veysel Durmuş selbst vor, sodass der Übergang in den festlichen Teil aus derselben Hand kommt.',
      en: 'Yes — it is a question of the running order, not of the equipment. The recitation and dua open the evening on their own microphone, without effects and without background music; dance music only starts afterwards. Veysel Durmuş performs the tilawet himself, so the move into the celebratory part comes from the same person.',
      tr: 'Evet — bu, teknikten çok akış planıyla ilgili bir konu. Tilavet ve dua, akşamın başında kendi mikrofonuyla, efektsiz ve fon müziği olmadan yer alır; dans müziği ancak bundan sonra başlar. Tilaveti Veysel Durmuş kendisi okuduğu için, kutlama bölümüne geçiş de aynı elden gelir.',
      nl: 'Ja — dat is een kwestie van het draaiboek, niet van de techniek. Recitatie en dua openen de avond op een eigen microfoon, zonder effecten en zonder achtergrondmuziek; de dansmuziek begint pas daarna. Omdat Veysel Durmuş de tilawet zelf verzorgt, komt ook de overgang naar het feestelijke deel uit dezelfde hand.',
      fr: 'Oui — c’est une question de déroulé, pas de matériel. La récitation et la doua ouvrent la soirée sur un micro dédié, sans effets ni musique de fond ; la musique de danse ne commence qu’ensuite. Comme Veysel Durmuş assure lui-même la tilawet, le passage à la partie festive vient de la même personne.',
      es: 'Sí, y es una cuestión de desarrollo, no de equipo. La recitación y la dua abren la velada con su propio micrófono, sin efectos ni música de fondo; la música de baile empieza solo después. Como Veysel Durmuş recita él mismo la tilawet, el paso a la parte festiva llega también de la misma mano.',
      ku: 'Erê — ev pirseke rêza bernameyê ye, ne ya teknîkê. Tilawet û dua di destpêka şevê de, bi mîkrofoneke serbixwe, bêyî efekt û bêyî muzîka paşxaneyê tên. Muzîka govendê tenê piştî wê dest pê dike. Ji ber ku tilawetê Veysel Durmuş bi xwe dixwîne, derbasbûna beşa şahiyê jî ji heman destî tê.',
      ar: 'نعم — والمسألة تتعلق بخطة سير الأمسية لا بالتجهيزات. تأتي التلاوة والدعاء في بداية السهرة، بميكروفون مستقل، بلا مؤثرات وبلا موسيقى خلفية؛ ولا تبدأ موسيقى الرقص إلا بعد ذلك. ويتلو فيسيل دورموش القرآن الكريم بنفسه، فيأتي الانتقال إلى الجزء الاحتفالي من اليد نفسها.',
    },
    related: ['islamic-wedding-dj', 'who-recites', 'recitation-sound'],
    links: ['/islamische-hochzeit', '/ablauf', '/anfrage'],
    updated: U_TILAWET,
  },
  {
    id: 'ilahi-live',
    category: 'islamisch',
    q: {
      de: 'Gibt es einen türkischen Hochzeits-DJ mit İlahi und Moderation?',
      en: 'Is there a Turkish wedding DJ who offers ilahi and hosting?',
      tr: 'İlahi ve sunuculuk yapan bir Türk düğün DJ’i var mı?',
      nl: 'Bestaat er een Turkse bruiloft-dj die ilahi en presentatie verzorgt?',
      fr: 'Existe-t-il un DJ de mariage turc proposant ilahi et animation ?',
      es: '¿Hay algún DJ de bodas turco que ofrezca ilahi y presentación?',
      ku: 'Ma DJ’ekî dawetê yê tirk heye ku îlahî û pêşkêşiyê jî pêk tîne?',
      ar: 'هل يوجد دي جي أعراس تركي يقدّم الأناشيد الدينية والتقديم معًا؟',
    },
    a: {
      de: 'Ja: DJ Veys ist DJ, Musiker und Moderator in einer Person. İlahi wird live vorgetragen, auf Wunsch mit Saz-Begleitung, die Moderation läuft auf Deutsch, Türkisch und Englisch, und dieselbe Person übernimmt danach das DJ-Set. Für das Paar heißt das: keine Abstimmung zwischen drei Dienstleistern, ein Vertrag, eine Technik.',
      en: 'Yes: DJ Veys is DJ, musician and host in one person. Ilahi is performed live, with saz accompaniment on request, hosting runs in German, Turkish and English, and the same person takes over the DJ set afterwards. For the couple that means no coordination between three suppliers — one contract, one setup.',
      tr: 'Evet: DJ Veys aynı kişide DJ, müzisyen ve sunucu demek. İlahi canlı olarak, istenirse saz eşliğinde icra edilir; sunum Almanca, Türkçe ve İngilizce yapılır ve DJ setini de aynı kişi devralır. Çift açısından anlamı şu: üç ayrı hizmet sağlayıcıyı koordine etmek yok — tek sözleşme, tek teknik kurulum.',
      nl: 'Ja: DJ Veys is dj, muzikant en presentator in één persoon. Ilahi wordt live gebracht, desgewenst met sazbegeleiding, de presentatie loopt in het Duits, Turks en Engels, en dezelfde persoon neemt daarna de dj-set over. Voor het paar betekent dat: geen afstemming tussen drie leveranciers — één contract, één opstelling.',
      fr: 'Oui : DJ Veys est DJ, musicien et animateur en une seule personne. L’ilahi est interprété en live, avec accompagnement au saz si souhaité, l’animation se fait en allemand, turc et anglais, et la même personne enchaîne ensuite sur le set DJ. Pour le couple : aucune coordination entre trois prestataires — un contrat, une installation.',
      es: 'Sí: DJ Veys es DJ, músico y presentador en una sola persona. El ilahi se interpreta en directo, con acompañamiento de saz si se desea, la presentación se hace en alemán, turco e inglés, y la misma persona asume después la sesión de DJ. Para la pareja eso significa: ninguna coordinación entre tres proveedores, un contrato, un montaje.',
      ku: 'Erê: DJ Veys di yek kesî de hem DJ, hem muzîkjen û hem pêşkêşvan e. Îlahî zindî tê gotin, li ser daxwazê bi sazê re, pêşkêşî bi almanî, tirkî û îngilîzî tê kirin û seta DJ jî heman kes digire dest. Ji bo cotê wateya vê ev e: hevrêzkirina sê pêşkêşkerên cuda tune — yek peyman, yek sazûman.',
      ar: 'نعم: DJ Veys دي جي وموسيقي ومقدّم في شخص واحد. تُؤدّى الأناشيد الدينية بشكل حي، وبمصاحبة السّاز عند الطلب، ويجري التقديم بالألمانية والتركية والإنجليزية، ثم يتولى الشخص نفسه فقرة الدي جي بعدها. وهذا يعني للعروسين: لا تنسيق بين ثلاثة مورّدين — عقد واحد وتجهيز تقني واحد.',
    },
    facts: ['DJ, Musiker (Saz & Gitarre) und Moderator in einer Person'],
    related: ['islamic-wedding-dj', 'tsm-live', 'orchestra-vs-dj'],
    links: ['/islamische-hochzeit', '/hochzeit-events'],
    updated: U_ISLAM,
  },
  {
    id: 'dua-in-program',
    category: 'islamisch',
    q: {
      de: 'Wie wird eine Dua in den Hochzeitsablauf eingeplant?',
      en: 'How is a dua scheduled within the wedding running order?',
      tr: 'Dua, düğün akışına nasıl yerleştirilir?',
      nl: 'Hoe wordt een dua in het verloop van de bruiloft ingepland?',
      fr: 'Comment la doua s’insère-t-elle dans le déroulé du mariage ?',
      es: '¿Cómo se integra la dua en el desarrollo de la boda?',
      ku: 'Dua çawa di rêza bernameya dawetê de tê bicihkirin?',
      ar: 'كيف يُدرَج الدعاء في سير حفل الزفاف؟',
    },
    a: {
      de: 'Die Dua bekommt einen festen Zeitpunkt im Ablaufplan, meistens vor dem Essen oder vor dem Eröffnungstanz. Die Musik wird sauber ausgeblendet statt abgebrochen, die Gäste werden zweisprachig angekündigt und gebeten, Platz zu nehmen, das Mikrofon liegt bereit. Danach führt die Moderation zurück in den Abend.',
      en: 'The dua is given a fixed slot in the running order, usually before dinner or before the first dance. Music is faded out cleanly rather than cut, guests are addressed bilingually and asked to take their seats, and the microphone is ready. Afterwards the hosting leads back into the evening.',
      tr: 'Dua, akış planında sabit bir zamana yerleştirilir; genellikle yemekten ya da açılış dansından önce. Müzik kesilmez, düzgün şekilde kısılarak kapatılır; misafirlere iki dilde anons yapılır ve yerlerine geçmeleri rica edilir, mikrofon hazır bekler. Ardından sunum akşamın devamına geçişi sağlar.',
      nl: 'De dua krijgt een vast tijdstip in het draaiboek, meestal vóór het diner of vóór de openingsdans. De muziek wordt netjes uitgefadet in plaats van afgekapt, gasten worden tweetalig aangekondigd en gevraagd plaats te nemen, en de microfoon staat klaar. Daarna leidt de presentatie terug de avond in.',
      fr: 'La doua reçoit un créneau fixe dans le déroulé, généralement avant le dîner ou avant l’ouverture de bal. La musique est fondue proprement plutôt que coupée, les invités sont prévenus dans les deux langues et invités à s’asseoir, et le micro est prêt. L’animation ramène ensuite vers la suite de la soirée.',
      es: 'La dua recibe un momento fijo en el desarrollo, normalmente antes de la cena o antes del primer baile. La música se baja con un fundido limpio en lugar de cortarse, se avisa a los invitados en dos idiomas y se les pide que tomen asiento, y el micrófono está preparado. Después la presentación devuelve el hilo a la velada.',
      ku: 'Dua di rêza bernameyê de demeke sabit distîne, bi piranî berî xwarinê an berî govenda destpêkê. Muzîk nayê birrîn, hêdî hêdî tê nizmkirin; ji mêvanan re bi du zimanan tê ragihandin û tê xwestin ku rûnin, mîkrofon amade ye. Piştî wê pêşkêşî dîsa şevê didomîne.',
      ar: 'يُخصَّص للدعاء وقت ثابت في خطة سير الحفل، غالبًا قبل العشاء أو قبل رقصة الافتتاح. وتُخفَّض الموسيقى تدريجيًا حتى تنتهي بدل قطعها فجأة، ويُعلَن ذلك للضيوف بلغتين ويُطلب منهم أخذ أماكنهم، ويكون الميكروفون جاهزًا. وبعد ذلك يعيد التقديم الأمسية إلى مسارها الاحتفالي.',
    },
    related: ['quran-and-modern-party', 'run-of-show', 'bilingual-hosting'],
    links: ['/islamische-hochzeit', '/ablauf'],
    updated: U_ISLAM,
  },
  {
    id: 'alcohol-free-celebration',
    category: 'islamisch',
    q: {
      de: 'Spielt DJ Veys auch auf alkoholfreien Hochzeiten?',
      en: 'Does DJ Veys also play at alcohol-free weddings?',
      tr: 'DJ Veys alkolsüz düğünlerde de çalıyor mu?',
      nl: 'Draait DJ Veys ook op alcoholvrije bruiloften?',
      fr: 'DJ Veys joue-t-il aussi lors de mariages sans alcool ?',
      es: '¿DJ Veys pincha también en bodas sin alcohol?',
      ku: 'Ma DJ Veys di dawetên bê alkol de jî lêdixe?',
      ar: 'هل يحيي DJ Veys حفلات الزفاف الخالية من الكحول؟',
    },
    a: {
      de: 'Ja. Ob auf der Feier Alkohol ausgeschenkt wird, entscheiden Paar und Location — auf die DJ-Leistung hat das keinen Einfluss. Alkoholfreie Hochzeiten sind im deutsch-türkischen Umfeld Alltag, und die Erfahrung dort ist eindeutig: Die Tanzfläche lebt vom Repertoire und vom Timing, nicht von der Bar.',
      en: 'Yes. Whether alcohol is served is decided by the couple and the venue — it makes no difference to the DJ service. Alcohol-free weddings are routine in the German-Turkish scene, and the experience there is unambiguous: the dance floor lives off the repertoire and the timing, not off the bar.',
      tr: 'Evet. Düğünde alkol servisi olup olmayacağına çift ve mekân karar verir — bunun DJ hizmetine bir etkisi yoktur. Alkolsüz düğünler Alman-Türk çevresinde son derece olağandır ve oradaki tecrübe nettir: Pisti ayakta tutan bar değil, repertuvar ve zamanlamadır.',
      nl: 'Ja. Of er alcohol wordt geschonken, bepalen het paar en de locatie — op de dj-dienst heeft dat geen invloed. Alcoholvrije bruiloften zijn in Duits-Turkse kring doodnormaal, en de ervaring daar is eenduidig: de dansvloer draait op het repertoire en de timing, niet op de bar.',
      fr: 'Oui. C’est au couple et au lieu de décider si de l’alcool est servi — cela ne change rien à la prestation DJ. Les mariages sans alcool sont courants dans le milieu germano-turc, et l’expérience y est sans ambiguïté : la piste vit du répertoire et du timing, pas du bar.',
      es: 'Sí. Que se sirva alcohol o no lo deciden la pareja y el lugar; no afecta al servicio de DJ. Las bodas sin alcohol son habituales en el entorno germano-turco, y la experiencia allí es inequívoca: la pista se sostiene con el repertorio y el timing, no con la barra.',
      ku: 'Erê. Ka dê alkol were dayîn an na, biryara cot û ya mekanê ye — bandorê li xizmeta DJ nake. Dawetên bê alkol di nav civata alman-tirk de tiştekî asayî ne, û ezmûna wir zelal e: meydana govendê bi repertuwar û demjimêrê radiweste, ne bi bar.',
      ar: 'نعم. قرار تقديم الكحول من عدمه يعود إلى العروسين وإلى القاعة — ولا أثر له على خدمة الدي جي. فحفلات الزفاف الخالية من الكحول أمر معتاد تمامًا في الوسط الألماني التركي، والخبرة هناك واضحة: ما يُبقي حلبة الرقص حيّة هو الريبرتوار وحُسن التوقيت، لا البار.',
    },
    related: ['islamic-wedding-dj', 'halay-repertoire'],
    links: ['/islamische-hochzeit'],
    updated: U_ISLAM,
  },

  // ─── location ─────────────────────────────────────────────────────────
  {
    id: 'service-area',
    category: 'location',
    q: {
      de: 'Wie weit reist er für Hochzeiten außerhalb von Stuttgart?',
      en: 'How far does he travel for weddings outside Stuttgart?',
      tr: 'Stuttgart dışındaki düğünler için ne kadar uzağa gidiyor?',
      ar: 'إلى أي مسافة يسافر لإحياء حفلات الزفاف خارج شتوتغارت؟',
    },
    a: {
      de: 'Regelmäßig gebucht wird er in Stuttgart, Esslingen, Ludwigsburg, Böblingen, Heilbronn, Reutlingen, Pforzheim und Karlsruhe, dazu deutschlandweit und europaweit. Innerhalb von 50 Kilometern um Stuttgart ist die Anfahrt bereits im Paketpreis enthalten, für weitere Entfernungen wird sie transparent im individuellen Angebot ausgewiesen.',
      en: 'He’s regularly booked in Stuttgart, Esslingen, Ludwigsburg, Böblingen, Heilbronn, Reutlingen, Pforzheim and Karlsruhe, as well as across Germany and Europe. Travel within 50 kilometres of Stuttgart is already included in the package price; for greater distances it’s itemised transparently in the individual quote.',
      tr: 'Düzenli olarak Stuttgart, Esslingen, Ludwigsburg, Böblingen, Heilbronn, Reutlingen, Pforzheim ve Karlsruhe’de, ayrıca Almanya genelinde ve Avrupa’da rezervasyon alıyor. Stuttgart çevresinde 50 kilometreye kadar ulaşım paket fiyatına dahildir; daha uzun mesafeler için bu, bireysel teklifte açıkça belirtilir.',
      ar: 'يُحجز بانتظام في شتوتغارت وإسلينغن ولودفيغسبورغ وبوبلينغن وهايلبرون ورويتلينغن وبفورتسهايم وكارلسروه، إضافة إلى أنحاء ألمانيا وأوروبا. والتنقّل ضمن 50 كيلومترًا حول شتوتغارت مشمول أصلًا في سعر الباقة، أما المسافات الأبعد فتُبيَّن تكلفة الوصول إليها بشفافية وبشكل منفصل في العرض الفردي.',
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
      ar: 'هل يحيي حفلات خارج ألمانيا، في النمسا مثلًا؟',
    },
    a: {
      de: 'Ja, auf seinem Instagram-Profil sind unter anderem Auftritte in Wien dokumentiert — die Arbeit reicht also über Deutschland hinaus. Für internationale Termine gelten dieselben Grundsätze wie für Destination Weddings: Anfahrt, Übernachtung und eine mögliche Technikmiete vor Ort werden transparent im individuellen Angebot ausgewiesen.',
      en: 'Yes, his Instagram profile documents appearances in Vienna among other places, so the work extends beyond Germany. International dates follow the same principles as destination weddings: travel, accommodation and any local equipment rental are itemised transparently in the individual quote.',
      tr: 'Evet, Instagram profilinde diğerlerinin yanı sıra Viyana’daki performanslar da belgelenmiştir — yani çalışmaları Almanya’nın ötesine uzanır. Uluslararası tarihler için de destination wedding’lerle aynı ilkeler geçerlidir: ulaşım, konaklama ve gerekirse yerel ekipman kiralaması bireysel teklifte açıkça belirtilir.',
      ar: 'نعم، يوثّق حسابه على إنستغرام حفلات في فيينا وغيرها — أي أن عمله يمتد إلى ما هو أبعد من ألمانيا. وتسري على المواعيد الدولية المبادئ نفسها المعتمدة في حفلات الزفاف في وجهات بعيدة: تُبيَّن تكاليف السفر والإقامة وأي استئجار محلي للتجهيزات بشفافية في العرض الفردي.',
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
      ar: 'هل يعرف تجهيزات القاعة وصوتياتها مسبقًا، أم يتضح ذلك يوم الحفل فقط؟',
    },
    a: {
      de: 'Für jede Feier fließen Location-Angaben aus dem Planungsgespräch in die technische Vorbereitung ein, damit am Tag selbst nichts überrascht. Eine physische Location-Begehung vorab ist ausdrücklich Teil des Prestige-Pakets; bei den anderen Paketen lässt sich eine Begehung auf Wunsch individuell vereinbaren, etwa bei besonders anspruchsvoller Akustik.',
      en: 'For every celebration, venue details from the planning call feed into the technical preparation, so nothing comes as a surprise on the day itself. An in-person venue walk-through beforehand is explicitly part of the Prestige package; for the other packages, a walk-through can be arranged individually on request, for example where the acoustics are particularly demanding.',
      tr: 'Her etkinlik için, mekân bilgileri planlama görüşmesinden teknik hazırlığa aktarılır, böylece günün kendisinde sürpriz yaşanmaz. Önceden yapılan fiziksel mekân keşfi, açıkça Prestige paketinin bir parçasıdır; diğer paketlerde, özellikle akustiği zorlu mekânlarda, talep üzerine bireysel olarak bir keşif ayarlanabilir.',
      ar: 'تدخل معلومات القاعة المأخوذة من جلسة التخطيط في التحضير التقني لكل حفل، حتى لا يفاجئ شيء يوم المناسبة. أما المعاينة الميدانية للقاعة مسبقًا فهي جزء صريح من باقة Prestige؛ وفي الباقات الأخرى يمكن الاتفاق على معاينة بشكل فردي عند الطلب، كأن تكون صوتيات المكان صعبة بوجه خاص.',
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
      ar: 'من ينظّم الإقامة ونقل التجهيزات في حفل زفاف بوجهة بعيدة؟',
    },
    a: {
      de: 'Die Grundlogistik — Anfahrt, Übernachtung und eine mögliche Technikmiete vor Ort statt Transport der eigenen Anlage über weite Strecken — wird gemeinsam im Angebot geplant und transparent ausgewiesen, nicht erst kurzfristig improvisiert. Details wie die konkrete Hotelbuchung liegen meist beim Brautpaar oder der Planerin, die Kosten dafür fließen ins Angebot ein.',
      en: 'The basic logistics — travel, accommodation and any local equipment rental instead of transporting the equipment itself over long distances — are planned together in the quote and itemised transparently, not improvised at the last minute. Details like the actual hotel booking usually sit with the couple or planner, with the associated cost reflected in the quote.',
      tr: 'Temel lojistik — ulaşım, konaklama ve uzun mesafelerde ekipmanı taşımak yerine yerel ekipman kiralama gibi konular — son anda doğaçlama yapılmak yerine teklifte birlikte planlanır ve açıkça belirtilir. Otel rezervasyonu gibi detaylar genellikle çift ya da planlayıcı tarafından yapılır, bu maliyetler ise teklife yansıtılır.',
      ar: 'تُخطَّط اللوجستيات الأساسية — السفر والإقامة وإمكانية استئجار تجهيزات محلية بدل نقل المعدات الخاصة لمسافات طويلة — معًا داخل العرض وتُبيَّن بشفافية، لا أن تُرتجل في اللحظة الأخيرة. أما التفاصيل مثل حجز الفندق فعليًا فتبقى غالبًا لدى العروسين أو منظّمة الحفل، بينما تُدرَج تكلفتها ضمن العرض.',
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
      ar: 'ماذا يتضمن العقد المكتوب بالضبط؟',
    },
    a: {
      de: 'Der Vertrag fixiert Leistungen, Zeiten und Preis, damit am Hochzeitstag keine Überraschungen entstehen — das ist ausdrücklich Teil des Leistungsversprechens jeder Buchung. Dazu gehören unter anderem Spielzeit, gebuchtes Paket samt Technikumfang, vereinbarte Zusatzleistungen wie Moderation oder Live-Musik sowie die Zahlungsmodalitäten aus Anzahlung und Restbetrag.',
      en: 'The contract fixes the services, times and price so there are no surprises on the wedding day — that’s explicitly part of the service promise on every booking. Among other things it covers the playing time, the booked package with its technical scope, agreed extras like hosting or live music, and the payment terms for deposit and balance.',
      tr: 'Sözleşme, düğün gününde sürpriz yaşanmaması için hizmetleri, saatleri ve fiyatı sabitler — bu, her rezervasyonun açıkça verilen bir hizmet sözüdür. Bunlar arasında çalma süresi, teknik kapsamıyla birlikte rezerve edilen paket, sunum veya canlı müzik gibi kararlaştırılan ekstralar ve ön ödeme ile kalan bakiyeye ilişkin ödeme koşulları yer alır.',
      ar: 'يثبّت العقد الخدمات والأوقات والسعر حتى لا تحدث مفاجآت يوم الزفاف — وهذا جزء صريح من وعد الخدمة في كل حجز. ويشمل من بين أمور أخرى مدة العزف، والباقة المحجوزة بما فيها نطاق التجهيزات التقنية، والخدمات الإضافية المتفق عليها كالتقديم أو الموسيقى الحية، وشروط الدفع من عربون ومبلغ متبقٍّ.',
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
      ar: 'ماذا يحدث إذا اضطررنا إلى إلغاء الزفاف أو تأجيله؟',
    },
    a: {
      de: 'Ein pauschaler Storno- oder Verschiebungssatz ist nicht öffentlich festgelegt, weil die Konditionen individuell im schriftlichen Vertrag geregelt werden, statt sich aus einer allgemeinen Regel zu ergeben. Melden Sie sich möglichst frühzeitig — je nach Zeitpunkt und Grund lassen sich Verschiebungen oft unkomplizierter lösen als eine vollständige Stornierung.',
      en: 'There’s no publicly fixed cancellation or postponement fee, because the terms are set individually in the written contract rather than following one general rule. Get in touch as early as possible — depending on timing and reason, a postponement can often be resolved more easily than a full cancellation.',
      tr: 'Genel geçerli bir iptal ya da erteleme ücreti kamuya açık şekilde belirlenmemiştir, çünkü koşullar genel bir kurala göre değil, yazılı sözleşmede bireysel olarak düzenlenir. Mümkün olan en erken zamanda bize ulaşın — zamanlamaya ve nedene bağlı olarak, bir erteleme genellikle tam bir iptalden daha kolay çözülebilir.',
      ar: 'لا توجد نسبة إلغاء أو تأجيل ثابتة معلنة، لأن الشروط تُنظَّم بشكل فردي في العقد المكتوب بدل أن تنبع من قاعدة عامة موحّدة. تواصلوا معنا في أقرب وقت ممكن — فبحسب التوقيت والسبب، غالبًا ما يكون حل التأجيل أيسر من الإلغاء الكامل.',
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
      ar: 'كيف تُعالَج بياناتي المُرسَلة عبر نموذج الطلب؟',
    },
    a: {
      de: 'Die im Formular angegebenen Daten — etwa Datum, Ort und Art der Feier, Gästezahl, Name, E-Mail, Telefon und Ihre Nachricht — werden ausschließlich zur Bearbeitung Ihrer Anfrage genutzt. Ergibt sich kein Vertrag, werden sie gelöscht, sobald die Anfrage abgeschlossen ist; kommt ein Vertrag zustande, gelten die gesetzlichen Aufbewahrungsfristen. Details stehen in der Datenschutzerklärung.',
      en: 'The data you provide in the form — such as the date, location and type of celebration, guest count, name, email, phone and your message — is used solely to handle your enquiry. If no contract results, it is deleted once the enquiry is closed; if a contract is signed, statutory retention periods apply. Full details are in the privacy policy.',
      tr: 'Formda verdiğiniz bilgiler — tarih, yer ve etkinlik türü, misafir sayısı, ad, e-posta, telefon ve mesajınız gibi — yalnızca talebinizi işleme almak için kullanılır. Bir sözleşme oluşmazsa, talep sonuçlandığında bu bilgiler silinir; bir sözleşme imzalanırsa yasal saklama süreleri geçerli olur. Ayrıntılar gizlilik politikasında yer alır.',
      ar: 'تُستخدم البيانات التي تدخلونها في النموذج — كتاريخ الحفل ومكانه ونوعه وعدد الضيوف والاسم والبريد الإلكتروني والهاتف ورسالتكم — لمعالجة طلبكم حصرًا. فإن لم يُبرَم عقد، تُحذف فور إغلاق الطلب؛ وإن أُبرم عقد، تسري مدد الحفظ القانونية. وتجدون التفاصيل في سياسة الخصوصية.',
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

/**
 * Whether this entry is genuinely written in `locale` — both question and
 * answer, non-empty.
 *
 * `resolveAnswerText()` deliberately falls back to German, which is right on
 * `/fragen`: a real German answer beats no answer, and the page is marked
 * `noindex` for locales where that fallback applies, so the substitution is
 * never presented to a crawler as a translation.
 *
 * That reasoning does not carry to a page whose own copy *is* translated. The
 * Islamic landing page ships fully localized prose and then reads its FAQ
 * block out of this corpus; without this check, `/ku/daweta-islami` renders
 * Kurmancî headings above six German questions, and `/ar/zafaf-islami` would
 * do the same in Arabic — the exact "shell around German text" the comment on
 * `getReadyLocalesForAnswers()` below treats as a defect. Callers that render
 * answers inside otherwise-translated copy filter on this and drop the block
 * entirely when nothing survives.
 */
export function isAnswerAuthoredIn(answer: Answer, locale: Locale): boolean {
  const q = (answer.q as Partial<Record<Locale, string>>)[locale];
  const a = (answer.a as Partial<Record<Locale, string>>)[locale];
  return Boolean(q?.trim()) && Boolean(a?.trim());
}

/**
 * True for every entry belonging to the religiously-framed layer — the whole
 * `islamisch` category plus the three `religious: true` entries that live in
 * other categories (see the field's own comment).
 */
export function isReligiousAnswer(answer: Answer): boolean {
  return answer.category === 'islamisch' || answer.religious === true;
}

/**
 * The corpus as one locale may actually see it.
 *
 * Outside `ISLAMIC_SUPPORTED_LOCALES` (tr/ku/ar) the religiously-framed layer
 * is not part of the site at all — a client decision, reasoned through in
 * src/content/islamic.ts. `/fragen` renders from this function rather than
 * from `answers` directly, so the German, English, Dutch, French and Spanish
 * answer hubs simply do not contain those nine entries, and the `islamisch`
 * category heading disappears with them (the page drops empty categories).
 *
 * This is the one place that filtering happens. `answers` itself stays
 * complete on purpose: the Islamic landing page reads its FAQ block straight
 * out of `getAnswersByCategory('islamisch')`, and it only ever renders in a
 * locale where all of this is visible anyway.
 */
export function getVisibleAnswers(locale: Locale): Answer[] {
  if (isIslamicLocale(locale)) return answers;
  return answers.filter((answer) => !isReligiousAnswer(answer));
}

/**
 * The locales this corpus is genuinely authored in — a locale counts only if
 * EVERY entry **that locale can see** has both its question and its answer
 * written in it. Today that is `de`/`tr`/`en` (40 entries each);
 * `ku`/`nl`/`fr`/`es` have zero and are served the German original through
 * `resolveAnswerText()` above.
 *
 * Coverage is measured against `getVisibleAnswers()`, not the raw corpus:
 * a locale that never shows the religious layer must not be held to
 * translating it. Measuring against all 40 would mean German — which hides
 * nine of them — could still be blocked from "ready" by an untranslated
 * answer no German visitor is ever served.
 *
 * That fallback is the right behaviour for a visitor — a real German answer
 * beats a machine-translated one — but it must never be dressed up as a
 * translation for a crawler. Before this existed, `/fragen` claimed hreflang
 * for all seven locales and the sitemap listed all seven as indexable, so
 * `/nl/veelgestelde-vragen` shipped a Dutch shell around 40 German answers
 * and asserted it was the Dutch version of the page.
 *
 * Computed from the data rather than hardcoded, so the moment someone
 * translates the corpus into a further locale, hreflang, the sitemap and the
 * `noindex` gate all switch on together without another edit. This mirrors
 * `getReadyLocalesForCity()` (src/content/cities.ts) and
 * `getReadyLocalesForPost()` (src/content/blog/index.ts) — the same rule the
 * city, blog and region clusters already follow.
 */
export function getReadyLocalesForAnswers(): Locale[] {
  const hasFullCoverage = (locale: Locale): boolean =>
    getVisibleAnswers(locale).every((answer) => {
      const q = (answer.q as Partial<Record<Locale, string>>)[locale];
      const a = (answer.a as Partial<Record<Locale, string>>)[locale];
      return Boolean(q?.trim()) && Boolean(a?.trim());
    });
  return locales.filter(hasFullCoverage);
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
