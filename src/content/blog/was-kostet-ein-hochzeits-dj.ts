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

## Günstiger Hochzeits-DJ — Chance oder Risiko?

Ein niedriger Preis ist kein Fehler — er verlangt nur eine zweite Frage: Was ist dafür im
Umfang enthalten? Der Markt reicht vom Hobby-DJ über nebenberufliche bis zu professionellen
Anbietern, und die Leistungsumfänge dieser Stufen unterscheiden sich stärker als ihre
Preise. Prüfbare Warnsignale sind unabhängig vom Preis dieselben: kein schriftlicher
Vertrag, keine eigene Technik mit Backup, keine klare Antwort auf die Frage, wer am Abend
tatsächlich auflegt. Wer drei Angebote nebeneinanderlegt, vergleicht deshalb am besten
nicht die Endsummen, sondern Spielzeit, Technikumfang und die Person dahinter.

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

## Ucuz düğün DJ'i — fırsat mı, risk mi?

Düşük fiyat bir hata değildir — yalnızca ikinci bir soruyu zorunlu kılar: Bu fiyata kapsam
olarak ne dahil? Pazar, hobi olarak çalanlardan yarı zamanlılara ve profesyonel
sağlayıcılara uzanır ve bu basamakların hizmet kapsamları, fiyatlarından daha fazla
farklılaşır. Denetlenebilir uyarı işaretleri fiyattan bağımsız olarak aynıdır: yazılı
sözleşme yok, yedekli kendi ekipmanı yok, akşam gerçekte kimin çalacağı sorusuna net yanıt
yok. Üç teklifi yan yana koyan, bu yüzden en iyisi toplam rakamları değil çalma süresini,
teknik kapsamı ve arkasındaki kişiyi karşılaştırır.

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

## A cheap wedding DJ — bargain or risk?

A low price is not a mistake — it just demands a second question: what exactly is included
for it? The market runs from hobby DJs through part-timers to professional providers, and
what separates those tiers is scope far more than price. The checkable warning signs are
the same at any price point: no written contract, no own equipment with backup, no clear
answer to who will actually be behind the booth that night. So when you put three quotes
side by side, compare playing time, equipment scope and the person behind it — not the
bottom lines.

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

export const wasKostetNl = `
## Waarom er geen enkel eerlijk bedrag bestaat

"Wat kost een bruiloft-dj?" is een van de meest gezochte vragen bij het plannen van een
bruiloft — en tegelijk een vraag zonder één serieus antwoord. Wie één vast bedrag
belooft, versimpelt te veel of verzint het. Wat zich wél eerlijk laat beantwoorden:
welke factoren de prijs werkelijk bepalen, in welke orde van grootte de Duitse markt
zich beweegt, en waar u op moet letten bij het vergelijken van offertes.

## De orde van grootte: wat de markt laat zien

Meerdere landelijke Duitse bruiloftsportalen en dj-aanbieders noemen onafhankelijk van
elkaar vergelijkbare marges voor een bruiloft-dj in Duitsland: grofweg 900 tot 3.000 euro
per avond, met uitschieters tot ongeveer 4.000 euro in het hogere segment, en lagere
bedragen vanaf ongeveer 800 euro voor kortere of eenvoudiger boekingen. Deze marges zijn
**algemene marktobservaties uit openbare bronnen, geen prijzen van DJ Veys** — zijn eigen
pakketten worden individueel berekend op basis van speelduur, aantal gasten en technische
behoefte, en worden pas na het planningsgesprek als schriftelijke offerte vastgelegd.

Waarom is die marge zo breed? Omdat "bruiloft-dj" geen gestandaardiseerd product is. Een
kale draaiservice van vier uur zonder eigen apparatuur ligt ergens anders dan een
aanbieder met eigen geluid- en lichtinstallatie, meertalige presentatie en live muziek.

## De vier factoren die de prijs echt bepalen

| Factor | Wat erachter zit |
|---|---|
| Speelduur | Vier uur kale dj-set is iets anders dan een pakket dat loopt van de ontvangst tot het einde van de avond |
| Aantal gasten | Meer gasten betekent meestal meer geluidsvermogen en vaak een grotere dansvloer |
| Technische behoefte | Extra licht, uplights, meerdere zones of een tweede ruimte werken direct door in de inspanning |
| Extra's | Presentatie, live muziek of geluid voor een buitenceremonie kosten voorbereidingstijd, los van het draaien zelf |

Daar komt de reisafstand bij: een dj die vlak bij de locatie zit, rekent anders dan
iemand die voor dezelfde bruiloft 150 kilometer en een overnachting moet inplannen.

## Waarom zo weinig aanbieders hun prijzen publiceren

Een opvallend patroon in deze markt: de meeste bruiloft-dj's — ook in Baden-Württemberg —
publiceren geen concreet bedrag op hun website, maar verwijzen naar een individuele
offerte. Dat komt zelden door een gebrek aan transparantie, maar doordat de hierboven
beschreven mix van factoren per bruiloft te veel verschilt om eerlijk in één getal te
persen. Een vaste prijs die net zo goed geldt voor een kleine viering op het gemeentehuis
als voor een grote bruiloft met twee zones en een liveband, zou voor de een te duur zijn
en voor de ander te krap gerekend.

Voor u als stel betekent dat: een schriftelijke, individuele offerte na een voorgesprek is
in deze markt de norm, geen slecht teken. Belangrijk is niet of een aanbieder vooraf een
bedrag noemt, maar of de offerte daarna navolgbaar is uitgesplitst.

## Waar u bij het vergelijken van offertes echt op moet letten

- **Is de reisafstand al inbegrepen of komt die er apart bij?** Een offerte zonder die
  vermelding is onvolledig.
- **Is de speelduur duidelijk begrensd, of worden extra uren apart gefactureerd?**
- **Zijn presentatie en eventuele live muziek inbegrepen of losse posten?**
- **Hoeveel techniek zit er werkelijk in** — volstaat de installatie voor het aantal
  gasten, of is een upgrade nodig?
- **Is er een schriftelijk contract** waarin diensten, tijden en prijs vastliggen?

De goedkoopste offerte is zelden de beste als centrale punten als technische omvang of
reiskosten pas achteraf opduiken.

## Verborgen kostenposten die vaak over het hoofd worden gezien

Naast de vier grote prijsbepalers is er een reeks kleinere posten die in een onvolledige
offerte graag ontbreken en later als verrassing opduiken:

- **Overuren:** wat kost het als het feest langer doorloopt dan geboekt? Een vast uurtarief
  voor verlenging hoort al in de offerte te staan, niet pas op de avond zelf te worden
  onderhandeld.
- **Op- en afbouwtijd:** sommige aanbieders rekenen op- en afbouw binnen de geboekte
  speelduur, andere niet. Het verschil kan een vol uur effectieve speeltijd schelen.
- **Tweede locatie:** vindt de ceremonie ergens anders plaats dan het feest, dan kan een
  verhuizing van de apparatuur apart in rekening worden gebracht.
- **Persoonlijke wensen met voorbereidingstijd:** een uitgewerkte mashup voor de openingsdans
  of een bijzonder uitgebreide wensenlijst betekent voorbereiding die niet elke aanbieder
  automatisch inprijst.

Een volledige offerte hoort al deze punten expliciet in te sluiten of expliciet uit te
sluiten — "dat hangt van de situatie af" is geen voldoende antwoord vóór de handtekening.

## Een voorbeeld van hoe de omvang de prijs verandert

Zonder een concreet bedrag te noemen laat het effect van de omvang zich goed zien aan twee
tegengestelde voorbeelden. Een kleinere viering met 40 gasten, vier uur speelduur, één
locatie en zonder extra's zit vanzelf aan de onderkant van de hierboven genoemde
marktmarge. Een grote bruiloft met 180 gasten, een doorlopende avond van ontvangst tot
diep in de nacht, twee geluidszones, meertalige presentatie en een livemuziek-component
zit vanzelf aan de bovenkant — niet omdat de aanbieder "duurder" is, maar omdat het
werkelijke werk een ander is. Wie twee offertes vergelijkt, zou daarom altijd moeten
vragen of beide van een vergelijkbare omvang uitgaan, voordat de eindbedragen naast elkaar
worden gelegd.

## Hoe DJ Veys dit aanpakt

In plaats van één vast bedrag staan op het pakketoverzicht drie stappen met een duidelijk
afgebakend kader — speelduur, maximaal aantal gasten en technische omvang per pakket. Het
concrete bedrag ontstaat pas na het planningsgesprek, waarin uw werkelijke wensen worden
verhelderd, en wordt daarna schriftelijk als individuele offerte vastgelegd. Reisafstand
binnen een vastgelegde straal rond Stuttgart is daarbij al inbegrepen, verdere afstanden
worden transparant vermeld.

## Conclusie

Er bestaat geen enkel eerlijk bedrag voor "wat kost een bruiloft-dj", maar er zijn wel
navolgbare factoren die de prijs verklaren, en een globale marktoriëntatie om u aan vast
te houden. Belangrijker dan het bedrag zelf is de vraag of een offerte transparant is
uitgesplitst. Wie voor de eigen bruiloft een concrete, individuele inschatting wil, kan
die via het pakketoverzicht en een vrijblijvende aanvraag opvragen.
`.trim();

export const wasKostetFr = `
## Pourquoi il n'existe aucun chiffre unique et honnête

« Combien coûte un DJ de mariage ? » est l'une des questions les plus recherchées pendant
la préparation d'un mariage — et l'une de celles qui n'admettent aucune réponse unique
sérieuse. Qui promet un tarif unique simplifie à l'excès ou l'invente. Ce à quoi on peut
répondre honnêtement : quels facteurs déterminent réellement le prix, dans quel ordre de
grandeur se situe le marché allemand, et à quoi faire attention en comparant des devis.

## L'ordre de grandeur : ce que montre le marché

Plusieurs portails de mariage allemands et prestataires DJ citent, indépendamment les uns
des autres, des fourchettes comparables pour un DJ de mariage en Allemagne : grosso modo
entre 900 et 3 000 euros par soirée, avec des pointes jusqu'à environ 4 000 euros sur le
segment haut de gamme, et des montants plus bas à partir de 800 euros environ pour des
prestations plus courtes ou plus simples. Ces fourchettes sont **des observations
générales du marché issues de sources publiques, et non les tarifs de DJ Veys** — ses
propres formules sont calculées individuellement selon la durée de prestation, le nombre
d'invités et les besoins techniques, puis formalisées par écrit après l'entretien de
préparation.

Pourquoi cette fourchette est-elle si large ? Parce qu'un « DJ de mariage » n'est pas un
produit standardisé. Une prestation de quatre heures sans matériel propre ne se situe pas
au même endroit qu'un prestataire disposant de sa propre sonorisation et de ses lumières,
d'une animation multilingue et de musique live.

## Les quatre facteurs qui déterminent vraiment le prix

| Facteur | Ce qu'il recouvre |
|---|---|
| Durée de prestation | Quatre heures de set DJ n'ont rien à voir avec une formule allant du vin d'honneur à la fin de la nuit |
| Nombre d'invités | Plus d'invités implique généralement plus de puissance sonore et souvent une piste plus grande |
| Besoins techniques | Éclairage supplémentaire, uplights, plusieurs zones ou une seconde salle pèsent directement sur la charge de travail |
| Prestations annexes | Animation, musique live ou sonorisation d'une cérémonie laïque demandent un temps de préparation indépendant du mix lui-même |

S'y ajoute le déplacement : un DJ installé près du lieu de réception ne calcule pas comme
celui qui doit prévoir 150 kilomètres et une nuit d'hôtel pour la même soirée.

## Pourquoi si peu de prestataires affichent leurs prix

Un schéma frappant sur ce marché : la plupart des DJ de mariage — y compris en
Bade-Wurtemberg — ne publient aucun chiffre concret sur leur site et renvoient vers un
devis individuel. Cela tient rarement à un manque de transparence, mais au fait que le
mélange de facteurs décrit plus haut varie trop d'un mariage à l'autre pour tenir
honnêtement dans un seul nombre. Un prix fixe valable aussi bien pour une petite
célébration à la mairie que pour un grand mariage à deux zones avec groupe live serait
soit trop cher pour l'une, soit trop juste pour l'autre.

Pour vous, en tant que couple, cela signifie : un devis écrit et individuel après un
premier entretien est la norme sur ce marché, pas un mauvais signe. L'important n'est pas
qu'un prestataire annonce un chiffre à l'avance, mais que le devis soit ensuite détaillé
de façon compréhensible.

## Ce qu'il faut vraiment vérifier en comparant des devis

- **Le déplacement est-il déjà compris ou facturé à part ?** Un devis muet sur ce point
  est incomplet.
- **La durée est-elle clairement bornée, ou les heures supplémentaires sont-elles
  facturées séparément ?**
- **L'animation et l'éventuelle musique live sont-elles comprises ou en supplément ?**
- **Quelle part de matériel est réellement incluse** — la sonorisation suffit-elle au
  nombre d'invités, ou faut-il une montée en gamme ?
- **Existe-t-il un contrat écrit** fixant prestations, horaires et prix ?

Le devis le moins cher est rarement le meilleur si des points centraux comme l'étendue
technique ou le déplacement n'apparaissent qu'après coup.

## Les coûts cachés que l'on oublie souvent

Au-delà des quatre grands facteurs, une série de postes plus modestes manque volontiers
dans un devis incomplet et resurgit plus tard en mauvaise surprise :

- **Heures supplémentaires :** que coûte une soirée qui dure plus longtemps que prévu ? Un
  tarif horaire fixe pour les prolongations doit figurer dans le devis, et non se
  négocier le soir même.
- **Montage et démontage :** certains prestataires comptent le montage et le démontage
  dans la durée réservée, d'autres non. L'écart peut représenter une heure pleine de
  prestation effective.
- **Second lieu :** si la cérémonie se tient ailleurs que la réception, le déplacement du
  matériel peut être facturé en plus.
- **Demandes personnalisées avec préparation :** un mashup élaboré pour l'ouverture de bal
  ou une liste de souhaits particulièrement fournie représentent un temps de préparation
  que tous les prestataires n'intègrent pas automatiquement.

Un devis complet doit inclure ou exclure explicitement chacun de ces points — « cela
dépend de la situation » n'est pas une réponse suffisante avant signature.

## Un exemple : comment l'étendue change le prix

Sans avancer de chiffre précis, l'effet de l'étendue se saisit bien à travers deux
exemples opposés. Une célébration réduite de 40 invités, quatre heures de prestation, un
seul lieu et sans option se situe naturellement en bas de la fourchette citée plus haut.
Un grand mariage de 180 invités, une soirée continue du vin d'honneur jusqu'au bout de la
nuit, deux zones de sonorisation, une animation en plusieurs langues et une composante de
musique live se situe naturellement en haut — non parce que le prestataire est « plus
cher », mais parce que le travail réel n'est pas le même. Qui compare deux devis devrait
donc toujours demander s'ils partent d'une étendue comparable, avant de mettre les
totaux côte à côte.

## Comment DJ Veys procède

Plutôt qu'un tarif forfaitaire, la page des formules présente trois niveaux au cadre
clairement défini — durée, nombre maximal d'invités et étendue technique par formule. Le
chiffre concret n'apparaît qu'après l'entretien de préparation, une fois vos besoins
réels clarifiés, puis il est consigné par écrit sous forme de devis individuel. Le
déplacement dans un rayon défini autour de Stuttgart y est déjà intégré ; au-delà, les
distances sont indiquées de façon transparente.

## Conclusion

Il n'existe pas de chiffre unique et honnête pour « combien coûte un DJ de mariage », mais
il existe des facteurs compréhensibles qui expliquent le prix, et un repère de marché
approximatif pour se situer. Plus important que le chiffre lui-même : le devis est-il
détaillé de façon transparente ? Pour une estimation concrète et individuelle de votre
propre mariage, la page des formules et une demande sans engagement sont l'étape suivante.
`.trim();

export const wasKostetEs = `
## Por qué no existe una única cifra honesta

«¿Cuánto cuesta un DJ de bodas?» es una de las preguntas más buscadas al organizar una
boda, y a la vez una de las que no admiten una respuesta única seria. Quien promete una
cifra cerrada simplifica en exceso o se la inventa. Lo que sí puede responderse con
honestidad: qué factores determinan realmente el precio, en qué orden de magnitud se
mueve el mercado alemán y en qué fijarse al comparar presupuestos.

## El orden de magnitud: lo que muestra el mercado

Varios portales de bodas y proveedores de DJ de ámbito nacional en Alemania citan, de
forma independiente, horquillas parecidas para un DJ de bodas: aproximadamente entre 900
y 3.000 euros por noche, con excepciones de hasta unos 4.000 euros en el segmento alto, y
cantidades más bajas desde unos 800 euros para reservas más cortas o sencillas. Estas
horquillas son **observaciones generales del mercado procedentes de fuentes públicas, no
los precios de DJ Veys**: sus paquetes se calculan de forma individual según la duración,
el número de invitados y las necesidades técnicas, y solo se concretan por escrito tras
la reunión de planificación.

¿Por qué es tan amplia la horquilla? Porque «DJ de bodas» no es un producto
estandarizado. Un servicio de cuatro horas sin equipo propio no está en el mismo lugar
que un proveedor con su propio equipo de sonido e iluminación, presentación multilingüe y
música en directo.

## Los cuatro factores que de verdad determinan el precio

| Factor | Qué hay detrás |
|---|---|
| Duración | Cuatro horas de sesión de DJ no son lo mismo que un paquete que va del cóctel al final de la noche |
| Número de invitados | Más invitados suele significar más potencia de sonido y a menudo una pista más grande |
| Necesidades técnicas | Iluminación adicional, uplights, varias zonas o una segunda sala repercuten directamente en el trabajo |
| Servicios adicionales | Presentación, música en directo o sonorizar una ceremonia civil requieren preparación al margen de pinchar |

A esto se añade el desplazamiento: un DJ con base cerca del lugar calcula de otra manera
que quien debe prever 150 kilómetros y una noche de hotel para la misma celebración.

## Por qué tan pocos proveedores publican sus precios

Un patrón llamativo en este mercado: la mayoría de los DJ de bodas —también en
Baden-Wurtemberg— no publica cifras concretas en su web y remite a un presupuesto
individual. Rara vez se debe a falta de transparencia, sino a que la mezcla de factores
descrita arriba varía demasiado de una boda a otra como para comprimirla honestamente en
un solo número. Un precio fijo que valga igual para una celebración pequeña en el
registro civil y para una gran boda con dos zonas y banda en directo resultaría o
demasiado caro para una o demasiado ajustado para la otra.

Para vosotros como pareja eso significa: un presupuesto escrito e individual tras una
reunión previa es lo normal en este mercado, no una mala señal. Lo importante no es si un
proveedor adelanta una cifra, sino si el presupuesto está después desglosado de forma
comprensible.

## En qué fijarse de verdad al comparar presupuestos

- **¿El desplazamiento está incluido o se suma aparte?** Un presupuesto que no lo indica
  está incompleto.
- **¿La duración está claramente delimitada, o las horas extra se facturan por separado?**
- **¿La presentación y la posible música en directo están incluidas o son partidas
  adicionales?**
- **¿Cuánto equipo se incluye realmente?** ¿Basta para el número de invitados o hace falta
  una mejora?
- **¿Hay un contrato escrito** que fije servicios, horarios y precio?

El presupuesto más barato rara vez es el mejor si puntos centrales como el alcance técnico
o el desplazamiento aparecen solo después.

## Costes ocultos que suelen pasarse por alto

Junto a los cuatro grandes factores hay una serie de partidas menores que suelen faltar en
un presupuesto incompleto y aparecen más tarde como sorpresa:

- **Horas extra:** ¿qué cuesta que la fiesta se alargue más de lo reservado? Una tarifa
  horaria fija para prolongaciones debería figurar ya en el presupuesto, no negociarse esa
  misma noche.
- **Montaje y desmontaje:** algunos proveedores computan el montaje y el desmontaje dentro
  de la duración contratada y otros no. La diferencia puede suponer una hora entera de
  música efectiva.
- **Segundo lugar:** si la ceremonia se celebra en un sitio distinto de la fiesta, el
  traslado del equipo puede facturarse aparte.
- **Peticiones personalizadas con preparación:** un mashup elaborado para el primer baile o
  una lista de deseos especialmente extensa implican un tiempo de preparación que no todos
  los proveedores incluyen automáticamente.

Un presupuesto completo debe incluir o excluir explícitamente todos estos puntos;
«depende de la situación» no es una respuesta suficiente antes de firmar.

## Un ejemplo de cómo el alcance cambia el precio

Sin dar una cifra concreta, el efecto del alcance se entiende bien con dos ejemplos
opuestos. Una celebración pequeña de 40 invitados, cuatro horas de música, un solo lugar y
sin extras se sitúa de forma natural en la parte baja de la horquilla citada arriba. Una
gran boda de 180 invitados, con una noche continua desde el cóctel hasta la madrugada, dos
zonas de sonido, presentación en varios idiomas y un componente de música en directo se
sitúa de forma natural en la parte alta: no porque el proveedor sea «más caro», sino
porque el trabajo real es distinto. Quien compare dos presupuestos debería preguntar
siempre si ambos parten de un alcance comparable antes de poner los totales uno al lado
del otro.

## Cómo lo gestiona DJ Veys

En lugar de una cifra cerrada, la página de paquetes presenta tres niveles con un marco
claramente definido: duración, número máximo de invitados y alcance técnico por paquete.
La cifra concreta surge solo tras la reunión de planificación, una vez aclaradas vuestras
necesidades reales, y queda recogida por escrito como presupuesto individual. El
desplazamiento dentro de un radio definido alrededor de Stuttgart ya está incluido; las
distancias mayores se indican de forma transparente.

## Conclusión

No existe una única cifra honesta para «cuánto cuesta un DJ de bodas», pero sí factores
comprensibles que explican el precio y una orientación aproximada del mercado. Más
importante que la cifra en sí es si el presupuesto está desglosado con transparencia.
Quien quiera una estimación concreta e individual para su propia boda puede pedirla a
través de la página de paquetes y una solicitud sin compromiso.
`.trim();

export const wasKostetEinHochzeitsDjPost: BlogPost = {
  id: 'was-kostet-ein-hochzeits-dj',
  slug: 'was-kostet-ein-hochzeits-dj',
  category: 'kosten',
  type: 'guide',
  status: 'published',
  publishedAt: '2026-08-04',
  updatedAt: '2026-08-23',
  tags: ['kosten', 'preise', 'planung', 'budget'],
  readingTimeMinutes: 6,
  links: ['/pakete', '/anfrage', '/fragen'],
  relatedAnswers: ['cost-drivers', 'travel-included', 'extras-included', 'weekday-discount'],
  relatedCities: ['heilbronn', 'pforzheim'],
  relatedPosts: ['hochzeits-dj-checkliste', 'dj-live-band-oder-beides'],
  translations: {
    de: {
      title: 'Was kostet ein Hochzeits-DJ in Baden-Württemberg? (2026)',
      excerpt:
        'Eine seriöse Einheitszahl für "was kostet ein Hochzeits-DJ" gibt es nicht — wohl aber nachvollziehbare Preistreiber und eine grobe Marktorientierung. Dieser Artikel erklärt beides, ohne DJ Veys’ eigene Preise zu erfinden: Die bleiben "Preis auf Anfrage", bis echte Zahlen vorliegen.',
      body: wasKostetDe,
      seo: {
        metaTitle: 'Was kostet ein Hochzeits-DJ? Preise 2026 | DJ Veys',
        metaDescription:
          'Was kostet ein Hochzeits-DJ wirklich? Preistreiber, Marktspannen aus mehreren Quellen und eine Checkliste zum Angebotsvergleich, unabhängig eingeordnet.',
      },
    },
    tr: {
      slug: 'dugun-dj-fiyatlari',
      title: 'Baden-Württemberg\'de bir düğün DJ\'i ne kadara mal olur? (2026)',
      excerpt:
        '"Bir düğün DJ\'i ne kadara mal olur" sorusunun tek bir ciddi cevabı yok — ama somut fiyat etkenleri ve kabaca bir pazar aralığı var. Bu yazı ikisini de DJ Veys\'in kendi fiyatlarını uydurmadan açıklıyor: onlar gerçek rakamlar gelene kadar "talep üzerine" kalıyor.',
      body: wasKostetTr,
      seo: {
        metaTitle: 'Düğün DJ\'i Fiyatları 2026: Pazar Genel Bakışı | DJ Veys',
        metaDescription:
          'Bir düğün DJ\'i gerçekte ne kadara mal olur? Fiyatı belirleyen etkenler, birden fazla kaynaktan pazar aralıkları ve teklif karşılaştırma kontrol listesi.',
      },
    },
    en: {
      slug: 'wedding-dj-cost',
      title: 'How much does a wedding DJ cost in Baden-Württemberg? (2026)',
      excerpt:
        'There is no single honest number for "how much does a wedding DJ cost" — but there are real price drivers and a rough market range. This article explains both without inventing DJ Veys\'s own pricing: that stays "on request" until real figures exist.',
      body: wasKostetEn,
      seo: {
        metaTitle: 'Wedding DJ Cost 2026: An Honest Overview | DJ Veys',
        metaDescription:
          'What does a wedding DJ actually cost? Price drivers, market ranges from multiple sources, and a checklist for comparing quotes fairly.',
      },
    },
    nl: {
      slug: 'wat-kost-een-bruiloft-dj',
      title: 'Wat kost een bruiloft-dj in Duitsland?',
      excerpt:
        'Er bestaat geen enkel eerlijk bedrag voor "wat kost een bruiloft-dj" — wel echte prijsbepalers en een globale marktmarge. Dit artikel legt beide uit zonder de prijzen van DJ Veys te verzinnen: die blijven "op aanvraag" zolang er geen echte cijfers zijn.',
      body: wasKostetNl,
      seo: {
        metaTitle: 'Wat kost een bruiloft-dj? Eerlijk marktoverzicht | DJ Veys',
        metaDescription:
          'Wat kost een bruiloft-dj werkelijk? Prijsbepalers, marktmarges uit meerdere bronnen en een checklist om offertes eerlijk te vergelijken.',
      },
    },
    fr: {
      slug: 'combien-coute-un-dj-de-mariage',
      title: 'Combien coûte un DJ de mariage en Allemagne ?',
      excerpt:
        'Il n\'existe aucun chiffre unique et honnête pour « combien coûte un DJ de mariage » — mais il existe de vrais facteurs de prix et un ordre de grandeur de marché. Cet article explique les deux sans inventer les tarifs de DJ Veys : ils restent « sur demande » tant qu\'aucun chiffre réel n\'existe.',
      body: wasKostetFr,
      seo: {
        metaTitle: 'Prix d\'un DJ de mariage : aperçu honnête | DJ Veys',
        metaDescription:
          'Combien coûte réellement un DJ de mariage ? Facteurs de prix, fourchettes de marché issues de plusieurs sources et check-list pour comparer les devis.',
      },
    },
    es: {
      slug: 'cuanto-cuesta-un-dj-de-bodas',
      title: '¿Cuánto cuesta un DJ de bodas en Alemania?',
      excerpt:
        'No existe una única cifra honesta para «cuánto cuesta un DJ de bodas», pero sí factores de precio reales y una horquilla de mercado aproximada. Este artículo explica ambos sin inventar los precios de DJ Veys: siguen siendo «bajo petición» mientras no haya cifras reales.',
      body: wasKostetEs,
      seo: {
        metaTitle: 'Precio de un DJ de bodas: panorama honesto | DJ Veys',
        metaDescription:
          '¿Cuánto cuesta realmente un DJ de bodas? Factores de precio, horquillas de mercado de varias fuentes y una lista para comparar presupuestos.',
      },
    },
  },
};
