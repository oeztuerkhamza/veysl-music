import type { BlogPost } from './types';

/**
 * Primary keyword (DE): "was kostet ein hochzeits-dj" / "hochzeits-dj kosten baden-württemberg".
 * Deliberately informational/market-overview, NOT transactional — `/pakete` (meta key
 * `packages`) already owns the transactional "hochzeits-dj preise stuttgart" keyword
 * per docs/SEO-KEYWORD-MAP.md. This post explains the market and cost drivers in general
 * terms and points to `/pakete` + `/anfrage` for DJ Veys's own (request-based) figures —
 * see docs/BLOG-PLAN.md "cannibalization notes" for why this split is intentional.
 *
 * The only concrete € figures in this post are explicitly attributed to "mehrere
 * bundesweite Hochzeitsportale" (a live web search across several independent German
 * wedding/DJ cost pages, July 2026 — ranges seen: ~900–3.000 €, ~1.500–3.000 €,
 * ~1.500–4.000 €, and ~800–1.600 € for an "erfahrener DJ"). None of it is presented as
 * DJ Veys's own pricing — `.claude/BRAND-FACTS.md` and `packages.ts` both mandate
 * "Preis auf Anfrage" until the client supplies real figures.
 */
export const wasKostetDe = `
## Warum es keine einzelne, ehrliche Zahl gibt

"Was kostet ein Hochzeits-DJ?" ist eine der meistgesuchten Fragen bei der
Hochzeitsplanung — und gleichzeitig eine, auf die es keine seriöse Einheitsantwort gibt.
Wer eine einzelne Zahl verspricht, vereinfacht entweder zu stark oder hat sie sich
ausgedacht. Was sich dagegen seriös beantworten lässt: welche Faktoren den Preis
tatsächlich treiben, in welcher Größenordnung sich der Markt bundesweit bewegt, und
worauf beim Vergleichen von Angeboten zu achten ist.

## Die Größenordnung: was der Markt hergibt

Mehrere bundesweite Hochzeitsportale und DJ-Anbieter nennen unabhängig voneinander
ähnliche Spannen für einen Hochzeits-DJ in Deutschland: grob zwischen 900 und 3.000 Euro
pro Abend, mit Ausreißern bis etwa 4.000 Euro im gehobenen Segment, und mit niedrigeren
Beträgen ab rund 800 Euro für kürzere oder einfachere Buchungen. Diese Spannen sind
**allgemeine Marktbeobachtungen aus öffentlich zugänglichen Quellen, keine DJ Veys-Preise**
— seine eigenen Pakete werden individuell nach Spielzeit, Gästezahl und Technikbedarf
kalkuliert und erst nach dem Planungsgespräch als schriftliches Angebot ausgewiesen.

Warum ist die Spanne so breit? Weil "Hochzeits-DJ" kein standardisiertes Produkt ist.
Ein reiner Auflege-Service für vier Stunden ohne eigene Technik liegt woanders als ein
Anbieter mit eigener Ton- und Lichtanlage, mehrsprachiger Moderation und Live-Musik.

## Die vier Faktoren, die den Preis wirklich treiben

| Faktor | Was sich dahinter verbirgt |
|---|---|
| Spielzeit | Vier Stunden reiner DJ-Set unterscheiden sich deutlich von einem Paket, das vom Sektempfang bis zum Ausklang reicht |
| Gästezahl | Mehr Gäste bedeuten meist mehr Beschallungsleistung und oft eine größere Tanzfläche |
| Technikbedarf | Eine Anlage, zusätzliches Licht, Uplights, mehrere Zonen oder eine zweite Location wirken sich direkt auf den Aufwand aus |
| Zusatzleistungen | Moderation, Live-Musik, Beschallung der freien Trauung oder eine zweite Location kosten Vorbereitungszeit, unabhängig vom reinen Auflegen |

Dazu kommt die Anfahrt: Ein DJ mit Sitz in der Nähe der Location kalkuliert anders als
einer, der für dieselbe Feier 150 Kilometer und eine Übernachtung einplanen muss.

## Warum so wenige Anbieter ihre Preise öffentlich nennen

Ein auffälliges Muster in diesem Markt: Die meisten Hochzeits-DJs — auch in
Baden-Württemberg — veröffentlichen keine konkreten Zahlen auf ihrer Website, sondern
verweisen auf ein individuelles Angebot. Das liegt selten an mangelnder Transparenz,
sondern daran, dass der oben beschriebene Faktoren-Mix pro Feier zu unterschiedlich ist,
um ihn seriös in eine einzige Zahl zu pressen. Ein Fixpreis, der für eine kleine
Standesamtsfeier genauso gilt wie für eine große Hochzeit mit zwei Zonen und Live-Band,
wäre entweder für die eine Seite zu teuer oder für die andere zu knapp kalkuliert.

Das bedeutet für Sie als Paar: Ein schriftliches, individuelles Angebot nach einem
Vorgespräch ist in diesem Markt der Normalfall, kein schlechtes Zeichen. Wichtig ist
nicht, ob ein Anbieter vorab eine Zahl nennt, sondern ob das Angebot danach
nachvollziehbar aufgeschlüsselt ist.

## Worauf beim Vergleich von Angeboten wirklich achten

- **Ist die Anfahrt bereits enthalten oder kommt sie separat dazu?** Ein Angebot ohne
  diese Angabe ist unvollständig.
- **Ist die Spielzeit klar begrenzt oder gibt es einen fließenden Übergang, für den
  Mehrstunden separat berechnet werden?**
- **Sind Moderation und eventuelle Live-Musik im Preis enthalten oder Zusatzposten?**
- **Wie viel Technik ist tatsächlich eingeschlossen** — reicht die Anlage für die
  Gästezahl, oder ist ein Upgrade nötig?
- **Gibt es einen schriftlichen Vertrag**, der Leistungen, Zeiten und Preis fixiert?

Das günstigste Angebot ist selten das beste, wenn zentrale Punkte wie Technikumfang oder
Anfahrt erst nachträglich auftauchen.

## Versteckte Kostenpunkte, die häufig übersehen werden

Neben den vier großen Preistreibern gibt es eine Reihe kleinerer Posten, die in einem
unvollständigen Angebot gerne fehlen und später als Überraschung auftauchen:

- **Überstunden:** Was kostet es, wenn die Feier länger geht als gebucht? Ein fester
  Stundensatz für Verlängerungen sollte bereits im Angebot stehen, nicht erst am Abend
  ausgehandelt werden.
- **Auf- und Abbauzeit:** Manche Anbieter rechnen Auf- und Abbau in die gebuchte
  Spielzeit ein, andere nicht. Der Unterschied kann eine volle Stunde effektiver
  Spielzeit ausmachen.
- **Zweite Location:** Findet die Zeremonie an einem anderen Ort statt als die Feier
  selbst, kann ein Technik-Umzug zusätzlich berechnet werden.
- **Individuelle Wünsche mit Vorbereitungsaufwand:** Ein aufwendiges Mashup für den
  Eröffnungstanz oder eine besonders umfangreiche Musikwunschliste bedeuten
  Vorbereitungszeit, die nicht jeder Anbieter automatisch einpreist.

Ein vollständiges Angebot sollte all diese Punkte entweder explizit einschließen oder
explizit ausschließen — "kommt auf die Situation an" ist keine ausreichende Antwort vor
der Unterschrift.

## Ein Beispiel, wie der Umfang den Preis verändert

Ohne eine konkrete Zahl zu nennen, lässt sich die Wirkung des Umfangs anhand von zwei
gegenläufigen Beispielen greifbar machen. Eine kleinere Feier mit 40 Gästen, vier
Stunden Spielzeit, einer einzelnen Location und ohne Zusatzleistungen bewegt sich
naturgemäß am unteren Ende der weiter oben genannten Marktspanne. Eine große Hochzeit
mit 180 Gästen, einem durchgehenden Abend von Sektempfang bis in die Nacht, zwei
Beschallungszonen, Moderation auf mehreren Sprachen und einer Live-Musik-Komponente
bewegt sich naturgemäß am oberen Ende — nicht, weil der Anbieter "teurer" ist, sondern
weil der tatsächliche Aufwand ein anderer ist. Wer zwei Angebote vergleicht, sollte
deshalb immer fragen, ob beide von einem vergleichbaren Umfang ausgehen, bevor die
reinen Endsummen gegenübergestellt werden.

## Wie DJ Veys das handhabt

Statt einer pauschalen Zahl gibt es auf der Paketübersicht drei Stufen mit klar
definiertem Rahmen — Spielzeit, maximale Gästezahl und Technikumfang je Paket. Die
konkrete Zahl entsteht erst nach dem Planungsgespräch, in dem Ihre tatsächlichen
Anforderungen geklärt werden, und wird dann schriftlich als individuelles Angebot
festgehalten. Anfahrt innerhalb eines definierten Radius um Stuttgart ist dabei bereits
eingerechnet, weitere Strecken werden transparent ausgewiesen.

## Fazit

Es gibt keine einzelne ehrliche Zahl für "was kostet ein Hochzeits-DJ", aber es gibt
nachvollziehbare Faktoren, die den Preis erklären, und eine grobe Marktorientierung, an
der Sie sich orientieren können. Wichtiger als die Zahl selbst ist die Frage, ob ein
Angebot transparent aufgeschlüsselt ist. Wer für die eigene Feier eine konkrete,
individuelle Einschätzung möchte, kann diese über die Paketübersicht und eine
unverbindliche Anfrage einholen.
`.trim();

export const wasKostetTr = `
## Neden tek bir dürüst rakam yok

"Bir düğün DJ'i ne kadara mal olur?" düğün planlamasında en çok aranan sorulardan biri —
ve aynı zamanda tek bir ciddi cevabı olmayan bir soru. Tek bir rakam vaat eden ya çok
basitleştiriyor ya da uyduruyor demektir. Buna karşılık ciddi şekilde cevaplanabilecek
şey şu: fiyatı gerçekten neyin belirlediği, pazarın Almanya genelinde hangi aralıkta
hareket ettiği ve tekliflerin karşılaştırılmasında nelere dikkat edilmesi gerektiği.

## Büyüklük düzeyi: pazar ne gösteriyor

Almanya genelindeki birçok düğün portalı ve DJ sağlayıcısı, birbirinden bağımsız olarak
benzer aralıklar veriyor: bir akşam için kabaca 900 ile 3.000 Euro arasında, üst
segmentte 4.000 Euro'ya kadar çıkan istisnalarla, daha kısa ya da basit rezervasyonlar
için 800 Euro civarından başlayan tutarlarla. Bu aralıklar **genel pazar
gözlemleridir, DJ Veys'in fiyatları değildir** — kendi paketleri çalma süresi, misafir
sayısı ve teknik ihtiyaca göre bireysel hesaplanır ve ancak planlama görüşmesinden sonra
yazılı bir teklif olarak sunulur.

## Fiyatı gerçekten belirleyen dört etken

| Etken | Neyi ifade ediyor |
|---|---|
| Çalma süresi | Dört saatlik sade bir DJ seti ile kokteylden gecenin sonuna kadar süren bir paket birbirinden çok farklıdır |
| Misafir sayısı | Daha fazla misafir genellikle daha güçlü bir ses sistemi ve daha büyük bir dans pisti gerektirir |
| Teknik ihtiyaç | Ek ışık, uplight, birden fazla bölge ya da ikinci bir mekân doğrudan maliyeti etkiler |
| Ek hizmetler | Sunum, canlı müzik ya da açık hava töreninin seslendirilmesi, sadece müzik çalmaktan bağımsız hazırlık gerektirir |

## Neden bu kadar az sağlayıcı fiyatını açıkça paylaşıyor

Bu pazarda dikkat çekici bir örüntü var: Baden-Württemberg'deki dahil çoğu düğün DJ'i
web sitesinde somut bir rakam vermiyor, bireysel teklife yönlendiriyor. Bunun nedeni
genellikle şeffaflık eksikliği değil, yukarıdaki etken karışımının her düğün için o
kadar farklı olması ki tek bir rakama sığdırmak ciddi olmaz. Küçük bir nikah dairesi
kutlaması için de, iki bölgeli ve canlı gruplu büyük bir düğün için de aynı sabit fiyat
uygulamak, bir taraf için çok pahalı, diğeri için çok yetersiz kalırdı.

Sizin için bunun anlamı: bir ön görüşmenin ardından yazılı, bireysel bir teklif almak bu
pazarda kural, kötü bir işaret değil. Önemli olan bir sağlayıcının önceden bir rakam
verip vermediği değil, teklifin sonrasında anlaşılır şekilde ayrıştırılmış olmasıdır.

## Teklifleri karşılaştırırken gerçekten nelere bakılmalı

- Ulaşım fiyata dahil mi, yoksa ayrıca mı ekleniyor?
- Çalma süresi net mi, yoksa ek saatler ayrıca mı ücretlendiriliyor?
- Sunum ve varsa canlı müzik fiyata dahil mi, yoksa ek kalem mi?
- Teknik kapsam misafir sayısına gerçekten yetiyor mu?
- Hizmetleri, süreleri ve fiyatı sabitleyen yazılı bir sözleşme var mı?

## Sık gözden kaçan gizli maliyet kalemleri

Dört büyük fiyat etkeninin yanında, eksik bir teklifte sıkça yer almayan ve sonradan
sürpriz olarak ortaya çıkan bazı küçük kalemler var:

- **Fazla mesai:** Kutlama rezerve edilenden uzun sürerse ne olur? Uzatmalar için sabit
  bir saatlik ücret, akşam pazarlık edilmek yerine baştan teklifte yer almalı.
- **Kurulum ve toplama süresi:** Bazı sağlayıcılar kurulum ve toplamayı rezerve edilen
  çalma süresine dahil eder, bazıları etmez. Fark, tam bir saatlik etkin çalma süresine
  denk gelebilir.
- **İkinci mekân:** Tören, kutlamadan farklı bir yerde yapılıyorsa, ekipman taşıması ek
  olarak ücretlendirilebilir.
- **Hazırlık gerektiren özel istekler:** Açılış dansı için özel bir mashup ya da
  kapsamlı bir müzik istek listesi, her sağlayıcının otomatik olarak fiyata dahil
  etmeyebileceği bir hazırlık süresi gerektirir.

## Kapsamın fiyatı nasıl değiştirdiğine bir örnek

Somut bir rakam vermeden, kapsamın etkisini iki zıt örnekle somutlaştırmak mümkün: 40
davetlili, dört saatlik, tek mekânlı ve ek hizmetsiz küçük bir kutlama, doğal olarak
yukarıda belirtilen pazar aralığının alt ucunda yer alır. 180 davetlili, kokteylden
geceye kadar süren, iki ses bölgesi, çok dilli sunum ve canlı müzik unsuru olan büyük
bir düğün ise doğal olarak üst uçta yer alır — sağlayıcı "daha pahalı" olduğu için değil,
gerçek iş yükü farklı olduğu için. İki teklifi karşılaştıranlar, sadece toplam tutarları
yan yana koymadan önce her ikisinin de karşılaştırılabilir bir kapsamdan yola çıkıp
çıkmadığını sormalı.

## DJ Veys bunu nasıl ele alıyor

Sabit bir rakam yerine paket sayfasında net tanımlanmış üç kademe bulunur — her paket
için çalma süresi, azami misafir sayısı ve teknik kapsam. Somut rakam, planlama
görüşmesinden sonra gerçek ihtiyaçlarınız netleştikten sonra ortaya çıkar ve bireysel bir
teklif olarak yazılı hâle getirilir.

## Sonuç

"Bir düğün DJ'i ne kadara mal olur?" sorusunun tek bir dürüst cevabı yok, ama fiyatı
açıklayan somut etkenler ve yönelebileceğiniz kabaca bir pazar aralığı var. Rakamın
kendisinden daha önemlisi, teklifin şeffaf şekilde ayrıştırılmış olmasıdır. Kendi
düğününüz için somut bir değerlendirme isterseniz paket sayfası ve ücretsiz bir talep
formu bu konuda yardımcı olur.
`.trim();

export const wasKostetEn = `
## Why there's no single honest number

"How much does a wedding DJ cost?" is one of the most-searched questions in wedding
planning — and also one with no serious single answer. Anyone promising one flat figure
is either oversimplifying or making it up. What can be answered honestly: which factors
actually drive the price, roughly where the German market sits, and what to check when
comparing quotes.

## The order of magnitude: what the market shows

Several nationwide German wedding portals and DJ providers independently cite similar
ranges for a wedding DJ in Germany: roughly 900 to 3,000 euros per evening, with
outliers up to around 4,000 euros at the premium end, and lower amounts from around 800
euros for shorter or simpler bookings. These ranges are **general market observations,
not DJ Veys's own pricing** — his packages are calculated individually based on playing
time, guest count and technical needs, and only turn into a written quote after the
planning call.

## The four factors that actually drive the price

| Factor | What it covers |
|---|---|
| Playing time | A four-hour bare DJ set is a different job from a package running from the champagne reception to the end of the night |
| Guest count | More guests usually means more sound output and often a larger dance floor |
| Technical needs | Extra lighting, uplights, multiple zones or a second room feed directly into the cost |
| Extras | Hosting, live music or sound for an outdoor ceremony require preparation time independent of playback itself |

## Why so few providers publish real prices

A notable pattern in this market: most wedding DJs, including in Baden-Württemberg,
don't publish a concrete figure on their site and point to an individual quote instead.
That's rarely a lack of transparency — it's that the factor mix above varies too much
per wedding to fit honestly into one number. A flat price that works equally for a small
registry-office celebration and a large wedding with two zones and a live band would be
either too expensive for one or too tight for the other.

For you as a couple, that means: a written, individual quote following a planning call
is the norm in this market, not a red flag. What matters isn't whether a number is
quoted upfront, but whether the quote is itemised clearly afterwards.

## What to actually check when comparing quotes

- Is travel already included, or added separately?
- Is playing time clearly capped, or are extra hours billed separately?
- Is hosting, and any live music, included or a line item on top?
- Does the technical scope genuinely match your guest count?
- Is there a written contract fixing services, times and price?

## Hidden costs that often get overlooked

Beyond the four big price drivers, a handful of smaller line items are often missing
from an incomplete quote and turn into a surprise later:

- **Overtime:** What does it cost if the celebration runs longer than booked? A fixed
  hourly rate for extensions should already be in the quote, not negotiated on the
  night.
- **Set-up and tear-down time:** Some providers count set-up and tear-down within the
  booked playing time, others don't. The difference can amount to a full hour of
  effective playing time.
- **A second venue:** If the ceremony happens somewhere different from the reception,
  moving equipment between the two can be billed separately.
- **Custom requests requiring prep:** An elaborate first-dance mashup or an especially
  detailed wishlist means preparation time that not every provider automatically prices
  in.

## An example of how scope changes the price

Without naming a concrete figure, the effect of scope is easy to see through two
contrasting examples. A smaller celebration with 40 guests, four hours of playing time,
a single venue and no extras naturally sits at the lower end of the market range cited
above. A large wedding with 180 guests, a continuous evening from the champagne
reception into the night, two sound zones, multilingual hosting and a live-music
component naturally sits at the upper end — not because the provider is "more
expensive", but because the actual workload is different. Anyone comparing two quotes
should always ask whether both assume a comparable scope before comparing the final
totals directly.

## How DJ Veys handles this

Instead of one flat figure, the packages page lays out three clearly defined tiers —
playing time, maximum guest count and technical scope per package. The concrete number
only appears after the planning call, once your actual requirements are clear, and is
then set out in writing as an individual quote.

## Conclusion

There's no single honest answer to "how much does a wedding DJ cost", but there are
concrete factors that explain the price and a rough market range to orient yourself by.
What matters more than the number is whether a quote is itemised transparently. For a
concrete assessment of your own wedding, the packages page and a free enquiry are the
next step.
`.trim();

export const wasKostetEinHochzeitsDjPost: BlogPost = {
  id: 'was-kostet-ein-hochzeits-dj',
  slug: 'was-kostet-ein-hochzeits-dj',
  category: 'kosten',
  type: 'guide',
  status: 'published',
  publishedAt: '2026-08-04',
  updatedAt: '2026-07-25',
  tags: ['kosten', 'preise', 'planung', 'budget'],
  readingTimeMinutes: 6,
  links: ['/pakete', '/anfrage', '/fragen'],
  relatedAnswers: ['cost-drivers', 'travel-included', 'extras-included', 'weekday-discount'],
  relatedCities: ['heilbronn', 'pforzheim'],
  relatedPosts: ['hochzeits-dj-checkliste', 'dj-live-band-oder-beides'],
  translations: {
    de: {
      title: 'Was kostet ein Hochzeits-DJ in Baden-Württemberg?',
      excerpt:
        'Eine seriöse Einheitszahl für "was kostet ein Hochzeits-DJ" gibt es nicht — wohl aber nachvollziehbare Preistreiber und eine grobe Marktorientierung. Dieser Artikel erklärt beides, ohne DJ Veys’ eigene Preise zu erfinden: Die bleiben "Preis auf Anfrage", bis echte Zahlen vorliegen.',
      body: wasKostetDe,
      seo: {
        metaTitle: 'Was kostet ein Hochzeits-DJ? Marktüberblick | DJ Veys',
        metaDescription:
          'Was kostet ein Hochzeits-DJ wirklich? Preistreiber, Marktspannen aus mehreren Quellen und eine Checkliste zum Angebotsvergleich, unabhängig eingeordnet.',
      },
    },
    tr: {
      slug: 'dugun-dj-fiyatlari',
      title: 'Baden-Württemberg\'de bir düğün DJ\'i ne kadara mal olur?',
      excerpt:
        '"Bir düğün DJ\'i ne kadara mal olur" sorusunun tek bir ciddi cevabı yok — ama somut fiyat etkenleri ve kabaca bir pazar aralığı var. Bu yazı ikisini de DJ Veys\'in kendi fiyatlarını uydurmadan açıklıyor: onlar gerçek rakamlar gelene kadar "talep üzerine" kalıyor.',
      body: wasKostetTr,
      seo: {
        metaTitle: 'Düğün DJ\'i Fiyatları: Pazar Genel Bakışı | DJ Veys',
        metaDescription:
          'Bir düğün DJ\'i gerçekte ne kadara mal olur? Fiyatı belirleyen etkenler, birden fazla kaynaktan pazar aralıkları ve teklif karşılaştırma kontrol listesi.',
      },
    },
    en: {
      slug: 'wedding-dj-cost',
      title: 'How much does a wedding DJ cost in Baden-Württemberg?',
      excerpt:
        'There is no single honest number for "how much does a wedding DJ cost" — but there are real price drivers and a rough market range. This article explains both without inventing DJ Veys\'s own pricing: that stays "on request" until real figures exist.',
      body: wasKostetEn,
      seo: {
        metaTitle: 'Wedding DJ Cost: An Honest Market Overview | DJ Veys',
        metaDescription:
          'What does a wedding DJ actually cost? Price drivers, market ranges from multiple sources, and a checklist for comparing quotes fairly.',
      },
    },
  },
};
