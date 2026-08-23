import type { BlogPost } from './types';

/**
 * Primary keyword (DE): "türkische hochzeit als gast" / "was schenkt man auf einer
 * türkischen hochzeit". Written for the *guest*, not the couple — the search intent
 * behind the recurring gutefrage threads ("bin eingeladen, was ziehe ich an, was schenke
 * ich, muss ich tanzen") is purely informational and has no planning angle at all.
 *
 * Deliberately complements, doesn't duplicate, tuerkische-hochzeit-ablauf-musik-timing
 * (the planning guide, written for the couple) and davul-zurna-halay-roman-havasi (the
 * terminology guide). The cultural descriptions here — the Halay chain, Gelin Çıkarma as
 * the entrance moment, Kına Gecesi as a separate evening — are deliberately kept
 * consistent with those two posts.
 *
 * Two hard editorial constraints, both from .claude/BRAND-FACTS.md:
 * 1. **No gift amounts.** The Taki section describes how the ritual works and stops at
 *    "orientieren Sie sich an Ihrer Nähe zur Familie". Any euro or gram figure would be
 *    invented, and inventing one for a ritual that varies by family and region is worse
 *    than saying nothing.
 * 2. **Secular framing in every locale.** This is the general-audience Turkish wedding
 *    piece; the religiously framed layer lives in islamische-hochzeit-planen and is gated
 *    to tr/ku/ar by the client's decision of 2026-08-05.
 */
export const tuerkischeHochzeitAlsGastDe = `
## Warum sich eine türkische Hochzeit anders anfühlt

Wer zum ersten Mal auf einer türkischen oder deutsch-türkischen Hochzeit eingeladen ist,
merkt schon beim Betreten des Saals, dass der Abend einer anderen Dramaturgie folgt als
eine rein deutsche Feier: mehr Gäste, mehr Zeremonie, deutlich mehr Tanz und ein Ablauf,
der sich an Momenten orientiert statt an festen Uhrzeiten. Vorwissen erwartet niemand. Es
hilft aber, die wiederkehrenden Bausteine zu kennen — dann muss man nicht raten, wann
etwas Wichtiges passiert.

Eine Einschränkung vorweg: "die türkische Hochzeit" gibt es nicht. Familien aus
unterschiedlichen Regionen und mit unterschiedlich ausgeprägter Tradition feiern spürbar
verschieden. Der folgende Rahmen beschreibt, was verbreitet ist, nicht was verbindlich
wäre.

## Der Abend aus Gästesicht

| Moment | Was auf Gäste zukommt |
|---|---|
| Ankunft | Begrüßung durch die Familie, der Saal füllt sich langsam |
| Einzug des Brautpaars | Eigene Musik, oft ein Live-Moment, alle stehen und applaudieren |
| Zeremonieller Teil | Reden, Ringzeremonie, rote Schleife — der ruhigste Teil des Abends |
| Taki | Die Gäste kommen nach vorn und überreichen ihr Geschenk sichtbar |
| Essen | Kommt häufig später als im deutschen Ablauf gewohnt |
| Tanzprogramm | Halay, Roman Havası, türkische und internationale Titel im Wechsel |
| Ausklang | Meist deutlich später als bei einer deutschen Feier |

Die Reihenfolge variiert von Familie zu Familie. Wer zum ersten Mal dabei ist, orientiert
sich am einfachsten an der Moderation: Bei gemischter Gästeliste laufen die Ansagen
üblicherweise auf Deutsch und Türkisch.

## Der Einzug: der Moment, den niemand verpassen sollte

Der Einzug des Brautpaars ist der erste große Höhepunkt und wird bewusst inszeniert:
eigene Musik, häufig ein Live-Element, Licht auf dem Weg zur Bühne. In vielen Familien
geht ein eigener Programmpunkt voraus, das Gelin Çıkarma — der Moment, in dem die Braut
aus dem Elternhaus abgeholt beziehungsweise in den Saal geführt wird.

Für Gäste heißt das: rechtzeitig im Saal sein, aufstehen, den Mittelgang frei lassen und
dem Fotografen nicht in die Linie laufen. Handyfotos sind fast überall willkommen — aber
aus der zweiten Reihe.

## Das Geschenk: wie Taki funktioniert

Auf einer deutschen Hochzeit verschwindet der Umschlag unauffällig in einer Box. Auf
einer türkischen Hochzeit ist das Überreichen selbst ein Programmpunkt: Taki. Das
Brautpaar steht vorn, die Gäste kommen einzeln, als Paar oder als Familie nach vorn, und
das Geschenk wird sichtbar übergeben — traditionell Geld oder Goldschmuck, der an ein
Band an Kleid und Anzug gesteckt wird. Häufig begleitet die Moderation diesen Teil.

Praktisch heißt das:

- **Geld im Umschlag oder Gold sind beide üblich.** Ein Sachgeschenk ist die Ausnahme.
- **Für die Höhe gibt es keine Tabelle**, und niemand von außen kann seriös eine
  aufstellen. Orientieren Sie sich an Ihrer Nähe zur Familie.
- **Den Umschlag vorher beschriften.** Bei einer großen Gästeliste ist der Name die
  einzige Chance, dass sich das Brautpaar später gezielt bedanken kann.
- **Auf den Moment warten.** Das Geschenk zwischendurch am Tisch zu überreichen, ist gut
  gemeint, nimmt dem Programmpunkt aber seinen Sinn.

Der Taki-Moment ist öffentlich, aber freundlich: Die Aufmerksamkeit gilt dem Brautpaar,
nicht dem einzelnen Umschlag.

## Dresscode: was tatsächlich getragen wird

Türkische Hochzeiten sind meist festlicher als eine durchschnittliche deutsche Feier.
Anzug oder dunkler Zweiteiler, Kleid oder festlicher Zweiteiler sind die sichere Wahl.
Zwei Punkte werden immer wieder gefragt:

- **Weiß bleibt der Braut vorbehalten** — dieselbe Regel wie auf einer deutschen Hochzeit.
- **Wie zurückhaltend die Kleidung ausfällt, unterscheidet sich von Familie zu Familie.**
  Wer die Familie nicht gut kennt, fährt mit einer klassisch-festlichen Variante gut.

Wichtiger als der Schnitt des Kleides: bequeme Schuhe. Der Tanzteil ist lang und beginnt
früher, als deutsche Gäste es erwarten.

## Halay für Anfänger: Sie werden mitgezogen

Halay ist ein Kettentanz: Die Tanzenden fassen sich an den kleinen Fingern oder halten ein
Tuch und bewegen sich in einer Linie oder einem offenen Kreis, angeführt von einer Person,
die Tempo und Figuren vorgibt. Es ist ein gemeinschaftlicher Tanz — und genau deshalb wird
irgendwann jemand nach Ihrer Hand greifen. Das ist als Einladung gemeint, nicht als
Mutprobe.

Der ehrliche Überlebensplan für den Grundschritt:

1. **Am Ende der Kette einreihen**, nicht in der Mitte. Dort ist die Schrittfolge am
   einfachsten.
2. **Auf die Füße der Person zwei Plätze weiter vorn schauen**, nicht auf die eigenen.
3. **Kleine Schritte machen.** Das Grundmuster verläuft meist seitwärts, mit einer
   Betonung im Takt, und wiederholt sich.
4. **Nicht führen wollen.** Figuren, Tempowechsel und Ende gibt der Kopf der Kette vor.
5. **Zwei bis drei Durchläufe abwarten.** Danach sitzt das Muster meist gut genug.

Den einen Halay-Schritt gibt es nicht: Regionale Varianten unterscheiden sich in
Schrittfolge und Tempo. Für Gäste ohne Vorkenntnisse ist das eine Entlastung — auch
türkische Gäste tanzen nicht jede Variante blind mit.

## Etikette: was gut ankommt und was nicht

| Kommt gut an | Besser vermeiden |
|---|---|
| Zum angekündigten Beginn erscheinen | Erst kurz vor dem Essen auftauchen |
| Die Eltern beider Seiten kurz begrüßen | Nur das Brautpaar begrüßen und weiterziehen |
| Beim Taki warten, bis Sie an der Reihe sind | Den Umschlag zwischendurch am Tisch übergeben |
| Beim Tanzen mitmachen, auch ohne Schrittkenntnis | Demonstrativ am Tisch sitzen bleiben |
| Aus der zweiten Reihe fotografieren | Während des Einzugs in den Mittelgang treten |
| Musikwunsch einmal freundlich am Pult platzieren | Mehrfach nachfragen oder während der Zeremonie ans Pult gehen |

Zwei Fragen tauchen besonders oft auf. Ob Alkohol ausgeschenkt wird, entscheidet die
Familie und ist von Feier zu Feier verschieden — was auf dem Tisch steht, ist die Antwort.
Und dass man längst nicht jeden kennt, ist normal: Großfamilie und weiterer
Bekanntenkreis gehören selbstverständlich dazu.

## Wenn zusätzlich eine Kına Gecesi stattfindet

Manche Einladungen umfassen einen zweiten Abend: die Kına Gecesi, meist am Vorabend,
traditionell ein Fest der Frauen und heute in vielen Familien für alle Gäste geöffnet. Der
Beginn ist emotionaler und langsamer als die Hochzeit selbst — Einzug der Braut und
Henna-Ritual stehen im Mittelpunkt, danach geht der Abend in eine Party über. Es ist ein
eigenständiges Fest, keine kleinere Vorversion der Hochzeit. Ob dort ein separates
Geschenk üblich ist, klärt am einfachsten die Person, über die Sie eingeladen wurden.

## Fazit

Als deutscher Gast braucht es kein Spezialwissen, sondern drei Dinge: rechtzeitig da
sein, das Geschenk für den Taki-Moment vorbereiten und die Tanzfläche nicht vermeiden.
Alles Weitere erklärt sich im Lauf des Abends — nicht zuletzt durch eine Moderation, die
jeden Programmpunkt in beiden Sprachen ansagt. Wer selbst eine solche Feier plant, findet
in der Übersicht zu Hochzeit und Events sowie auf der Seite für türkische Hochzeiten in
Stuttgart den passenden Einstieg.
`.trim();

export const tuerkischeHochzeitAlsGastTr = `
## Neden önceden anlatmakta fayda var

Karma bir davetli listesinde Alman misafirler genellikle iyi niyetle gelir ama akışı
bilmez: ne zaman ayağa kalkılır, hediye ne zaman ve nasıl verilir, halaya girmek şart mı.
Bu belirsizlik çoğu zaman akşamı salonun kenarında geçiren bir masayla sonuçlanır — kimse
istemediği hâlde. Düğünden önce birkaç cümlelik bir bilgilendirme, davetiyeye eklenen kısa
bir not ya da bir mesaj, bunu büyük ölçüde çözer.

Aşağıdaki başlıklar, Alman misafirlerinize aktarabileceğiniz konuları sırayla ele alıyor.
Hepsini anlatmak gerekmez; ilk üçü çoğu misafir için yeterli.

## Akşamın akışı: misafirin gözünden

| An | Misafiri ne bekliyor |
|---|---|
| Geliş | Ailenin karşılaması, salonun uzun bir süreye yayılarak dolması |
| Çiftin girişi | Kendine ait müzik, çoğunlukla canlı bir an, herkes ayakta ve alkışta |
| Törensel bölüm | Konuşmalar, yüzük töreni, kırmızı kuşak — akşamın en sakin bölümü |
| Takı | Misafirler öne çıkar ve hediyesini görünür şekilde takdim eder |
| Yemek | Alman akışına alışkın biri için genellikle beklenenden geç |
| Dans programı | Halay, Roman havası, Türkçe ve uluslararası parçalar dönüşümlü |
| Kapanış | Ortalama bir Alman kutlamasından belirgin şekilde geç |

Bu sıralama aileden aileye değişir. Bunu misafirlerinize söylemek bile başlı başına
rahatlatıcı: "saat kaçta ne olacak" listesi yerine "şu anlar olacak" çerçevesi vermek daha
gerçekçi. Karma davetli listelerinde sunumun Almanca ve Türkçe yapılması da bu boşluğu
akşam boyunca kapatır.

## Girişi kaçırmasınlar

Çiftin girişi akşamın ilk büyük anıdır ve bilinçli olarak sahnelenir: kendine ait müzik,
sık sık canlı bir unsur, sahneye ya da baş masaya giden yolda ışık. Birçok ailede bunun
öncesinde ayrı bir program noktası vardır — gelin çıkarma, yani gelinin baba evinden
alındığı ya da salona getirildiği an.

Misafire söylenecek somut şey şudur: zamanında salonda olun, ayağa kalkın, orta koridoru
boş bırakın ve fotoğrafçının önüne geçmeyin. Telefonla fotoğraf çekmek hemen her yerde hoş
karşılanır, ama ikinci sıradan.

## Takı: en çok sorulan konu

Alman düğünlerinde zarf genellikle bir kutuya sessizce bırakılır. Türk düğününde ise
hediyenin verilmesi başlı başına bir program noktasıdır: takı. Çift önde durur, misafirler
tek tek, çift olarak ya da aile olarak öne çıkar ve hediye görünür biçimde takdim edilir —
geleneksel olarak para ya da gelinliğe ve damatlığa takılan bir kurdeleye iliştirilen altın.
Sunum çoğu zaman bu bölüme eşlik eder ve öne çıkanı anons eder.

Misafirinize aktarılacak pratik noktalar:

- **Zarf içinde para da altın da olağandır.** Klasik bir eşya hediyesi birçok düğünde
  istisnadır.
- **Miktar için bir tablo yoktur** ve dışarıdan kimse ciddi biçimde böyle bir tablo
  kuramaz. Ölçü, aileye olan yakınlıktır — kendi çevrelerindeki bir davette nasıl
  davranıyorlarsa öyle.
- **Zarfın üzerine isim yazılmalı.** Kalabalık bir davetli listesinde çiftin sonradan
  teşekkür edebilmesinin tek yolu budur.
- **Ana beklenmeli.** Hediyeyi ara sırada masada vermek iyi niyetlidir ama program
  noktasının anlamını ortadan kaldırır.

Takı anı halka açıktır ama sıcaktır. Bir sınav değildir; dikkat zarfa değil çifte
yöneliktir. Misafirin bu cümleyi önceden duymuş olması, öne çıkarken duyduğu tereddüdü
tamamen ortadan kaldırır.

## Kıyafet

Türk düğünleri genellikle ortalama bir Alman kutlamasından daha şık geçer. Takım elbise ya
da koyu renk bir ikili, elbise ya da şık bir ikili güvenli tercihtir. Düzenli olarak sorulan
iki nokta:

- **Beyaz geline aittir** — Alman düğünlerindeki kuralın aynısı.
- **Kıyafetin ne kadar kapalı olacağı aileden aileye belirgin şekilde değişir.** Aileyi iyi
  tanımayan biri için klasik-şık bir tercih her zaman doğru sonucu verir.

Elbisenin kesiminden daha çok işe yarayan bir uyarı: rahat ayakkabı. Dans bölümü uzundur ve
Alman misafirlerin beklediğinden erken başlar.

## Halayın temeli: nasıl anlatılır

Halay, katılanların serçe parmaklarından tutuştuğu ya da bir mendil tuttuğu, bir sıra veya
açık daire hâlinde ilerleyen bir zincir dansıdır. Zincirin başındaki kişi tempoyu ve
figürleri belirler. Ortak bir danstır — bu yüzden er ya da geç birisi misafirinizin elini
tutacaktır. Bunun bir davet olduğunu, bir cesaret sınavı olmadığını önceden söylemek işe
yarar.

Temel adım için dürüst bir hayatta kalma planı:

1. **Zincirin sonuna girin**, ortasına değil. Orada adım en basittir ve kimse size
   asılmaz.
2. **İki sıra öndeki kişinin ayaklarına bakın**, kendi ayaklarınıza değil.
3. **Küçük adımlar atın.** Temel örüntü çoğunlukla yana doğru ilerler, ritimde bir vurgu
   taşır ve sürekli tekrar eder.
4. **Öne geçmeye çalışmayın.** Figürleri, tempo değişimini ve bitişi zincirin başı verir.
5. **İki üç tur bekleyin.** Genellikle bundan sonra örüntü, takip etmeye yetecek kadar
   oturur.

Tek bir halay adımı yoktur: bölgesel varyantlar adım dizilimi ve tempo bakımından farklıdır
ve her aile kendi alışık olduğu versiyonu getirir. Bu, acemi misafir için bir rahatlamadır —
Türk misafirler de her varyantı gözü kapalı oynamaz.

## Görgü kuralları: neyin iyi karşılandığı

| İyi karşılanır | Kaçınmakta fayda var |
|---|---|
| Duyurulan saatte gelmek | Yemeğe yakın ortaya çıkmak |
| Her iki tarafın ebeveynlerini kısaca selamlamak | Yalnızca çifti selamlayıp geçmek |
| Takıda sıranın gelmesini beklemek | Zarfı ara sırada masada vermek |
| Adımları bilmeden de dansa katılmak | Gösterişli biçimde masada oturmaya devam etmek |
| İkinci sıradan fotoğraf çekmek | Giriş sırasında orta koridora çıkmak |
| Müzik isteğini bir kez nazikçe iletmek | Defalarca sormak ya da tören sırasında kabine gitmek |

Misafir forumlarında sık dönen iki soru daha var. Birincisi, alkol servis edilip
edilmeyeceğine aile karar verir ve düğünden düğüne değişir; masada ne varsa cevap odur,
dışarıdan bir şey getirmek alışıldık değildir. İkincisi, davetli sayısı alışıldığından çok
daha yüksek olabilir, çünkü geniş aile ve daha uzak çevre doğal olarak listeye dahildir.
Herkesi tanımamak normaldir ve yanlış yerde olmanın işareti değildir.

## Kına gecesi ayrı bir gecedir

Bazı davetler ikinci bir akşamı da kapsar: kına gecesi, genellikle düğünden önceki akşam,
geleneksel olarak kadınların gecesi ve bugün birçok ailede tüm davetlilere açık. Başlangıcı
düğünün kendisinden daha duygusal ve daha yavaştır — gelinin girişi ve kına ritüeli
merkezdedir, ardından akşam bir partiye dönüşür. Kendi karakteri olan bağımsız bir kutlama
olduğunu, düğünün küçük bir ön versiyonu olmadığını misafirinize söylemek yerinde olur.
Orada ayrı bir hediye âdeti olup olmadığını en kolay, daveti ileten kişi açıklığa
kavuşturur.

## Sonuç

Alman misafirlerinize anlatılacaklar üç cümleye sığar: zamanında gelin, takı anı için
hediyeyi hazır bulundurun, dans pistinden kaçmayın. Gerisi akşam boyunca kendiliğinden
anlaşılır — özellikle program noktalarını her iki dilde de anons eden bir sunum varsa.
Kendi düğününü planlayan ve davetli listesinin her iki tarafını da yanına almak isteyenler
için düğün ve etkinlik hizmetleri sayfası ile Stuttgart'taki Türk düğünleri sayfası doğru
başlangıç noktası.
`.trim();

export const tuerkischeHochzeitAlsGastEn = `
## Why a Turkish wedding feels different

Anyone invited to a Turkish or German-Turkish wedding for the first time usually notices
it the moment they walk into the hall: the evening follows a different arc than a plain
German celebration. More guests, more ceremony, far more dancing, and a running order
built around moments rather than fixed clock times. Nobody expects prior knowledge. It
does help to know the recurring building blocks, though — then you are not guessing when
something important is happening.

One caveat first: there is no such thing as "the" Turkish wedding. Families from different
regions, and with different degrees of tradition, celebrate noticeably differently. What
follows describes what is common, not what is binding.

## The evening from a guest's point of view

| Moment | What guests can expect |
|---|---|
| Arrival | Greeting from the family, the hall filling up slowly |
| The couple's entrance | Its own music, often a live element, everyone standing and applauding |
| Ceremonial part | Speeches, ring ceremony, red sash — the quietest stretch of the night |
| Taki | Guests come forward and present their gift visibly |
| Food | Later than a German running order would lead you to expect |
| Dance programme | Halay, Roman Havası, Turkish and international tracks alternating |
| Wind-down | Usually much later than at a German celebration |

The order varies from family to family. If it is your first time, the simplest anchor is
the hosting: with a mixed guest list, announcements normally run in German and Turkish.

## The entrance: the moment nobody should miss

The couple's entrance is the first big peak of the evening and is deliberately staged —
its own music, often a live element, and light along the way to the stage. In many
families a separate programme point comes first: the gelin çıkarma, the moment the bride
is collected from her family home or led into the hall.

For guests this means: be in the hall in good time, stand up, keep the centre aisle
clear and stay out of the photographer's line. Phone photos are welcome almost
everywhere — from the second row.

## The gift: how taki works

At a German wedding the envelope disappears discreetly into a box. At a Turkish wedding,
handing the gift over is a programme point in its own right: taki. The couple stands at
the front, guests come forward individually, as a couple or as a family, and the gift is
presented visibly — traditionally money, or gold pinned to a ribbon on the dress and the
suit. The hosting often accompanies this section.

What that means in practice:

- **Money in an envelope and gold are both normal.** A conventional present is the
  exception.
- **There is no table of amounts**, and nobody on the outside can credibly draw one up.
  Take your cue from how close you are to the family.
- **Write your name on the envelope beforehand.** With a large guest list, that name is
  the couple's only chance to thank you specifically afterwards.
- **Wait for the moment.** Handing the gift over at the table in between is well meant,
  but it removes the point of the ritual.

The taki moment is public, but warm: the attention is on the couple, not on any
individual envelope.

## Dress code: what people actually wear

Turkish weddings are usually more formal than an average German celebration. A suit or a
dark two-piece, a dress or a formal two-piece, are the safe choice. Two points come up
again and again:

- **White stays reserved for the bride** — the same rule as at a German wedding.
- **How conservative the dress code is varies considerably from family to family.** If you
  do not know the family well, a classically formal choice always lands right.

More important than the cut of a dress: comfortable shoes. The dancing runs long and
starts earlier than German guests tend to expect.

## Halay for beginners: you will be pulled in

Halay is a chain dance: dancers link little fingers or hold a cloth and move in a line or
an open circle, led by one person at the head who sets the tempo and the figures. It is a
communal dance — which is exactly why, at some point, somebody will reach for your hand.
That is meant as an invitation, not a dare.

An honest survival plan for the basic step:

1. **Join at the end of the chain**, not in the middle. The step is simplest there.
2. **Watch the feet of the person two places ahead**, not your own.
3. **Take small steps.** The basic pattern mostly travels sideways, carries one accent in
   the rhythm, and repeats.
4. **Do not try to lead.** Figures, tempo changes and the ending all come from the head of
   the chain.
5. **Give it two or three rounds.** After that the pattern usually sits well enough.

There is no single halay step: regional variants differ in step sequence and tempo. For a
guest with no prior knowledge that is a relief — Turkish guests do not dance every variant
blind either.

## Etiquette: what lands well and what does not

| Lands well | Better avoided |
|---|---|
| Arriving at the announced start time | Turning up shortly before the food |
| Briefly greeting the parents on both sides | Greeting only the couple and moving on |
| Waiting your turn at the taki | Handing the envelope over at the table in between |
| Joining the dancing even without knowing the steps | Conspicuously staying seated all night |
| Photographing from the second row | Stepping into the centre aisle during the entrance |
| Making one music request politely at the booth | Asking repeatedly, or going to the booth mid-ceremony |

Two questions come up especially often. Whether alcohol is served is the family's decision
and differs from celebration to celebration — what is on the table is the answer. And not
knowing everyone is normal: the extended family and the wider circle of acquaintances
belong on the list as a matter of course.

## If there is also a kına gecesi

Some invitations cover a second evening: the kına gecesi, usually the night before,
traditionally a women's celebration and today open to all guests in many families. It
starts more emotionally and more slowly than the wedding itself — the bride's entrance and
the henna ritual are at the centre, after which the evening shifts into a party. It is a
standalone celebration, not a smaller preview of the wedding. Whether a separate gift is
customary there is best clarified by whoever passed on the invitation.

## Conclusion

Being a guest at a Turkish wedding takes no specialist knowledge, just three things:
arrive on time, have the gift ready for the taki moment, and do not avoid the dance floor.
Everything else explains itself over the course of the evening — not least through hosting
that announces each programme point in both languages. Anyone planning a celebration like
this will find the weddings and events overview and the page for Turkish weddings in
Stuttgart the natural place to start.
`.trim();

export const tuerkischeHochzeitAlsGastPost: BlogPost = {
  id: 'tuerkische-hochzeit-als-gast',
  slug: 'tuerkische-hochzeit-als-gast',
  category: 'tuerkische-hochzeit',
  type: 'guide',
  status: 'published',
  publishedAt: '2026-08-23',
  updatedAt: '2026-08-23',
  tags: ['tuerkische-hochzeit', 'gaeste', 'etikette', 'halay', 'dresscode'],
  readingTimeMinutes: 5,
  links: ['/tuerkischer-dj-stuttgart', '/hochzeit-events'],
  relatedAnswers: ['halay-repertoire', 'timeline-diff', 'bilingual-hosting'],
  relatedCities: ['esslingen', 'ludwigsburg'],
  relatedPosts: [
    'tuerkische-hochzeit-ablauf-musik-timing',
    'kina-gecesi-henna-abend-planen',
    'davul-zurna-halay-roman-havasi',
  ],
  translations: {
    de: {
      title: 'Als Gast auf einer türkischen Hochzeit: Ablauf, Geschenk, Halay',
      excerpt:
        'Als Gast auf einer türkischen Hochzeit brauchen Sie kein Spezialwissen, aber drei Orientierungspunkte: den Taki-Moment, an dem das Geschenk sichtbar überreicht wird, einen Dresscode, der festlicher ausfällt als gewohnt, und einen Halay-Grundschritt, in den Sie irgendwann hineingezogen werden. Dieser Guide erklärt den Abend aus Gästesicht.',
      body: tuerkischeHochzeitAlsGastDe,
      seo: {
        metaTitle: 'Türkische Hochzeit als Gast: Etikette | DJ Veys',
        metaDescription:
          'Eingeladen auf eine türkische Hochzeit? Ablauf, Taki und Geschenk, Dresscode, Halay-Grundschritt und Etikette — was Gäste vorher wissen sollten.',
      },
    },
    tr: {
      slug: 'turk-dugunune-katilan-alman-misafirler',
      title: 'Alman misafirlerinize Türk düğünü hakkında ne anlatmalısınız',
      excerpt:
        'Karma bir davetli listesinde Alman misafirler akışı bilmedikleri için çekingen kalır: takının ne zaman ve nasıl yapıldığı, kıyafetin ne kadar şık olması gerektiği, halaya girmenin şart olup olmadığı. Bu rehber, düğünden önce onlara aktarabileceğiniz her şeyi sırayla topluyor.',
      body: tuerkischeHochzeitAlsGastTr,
      seo: {
        metaTitle: 'Alman Misafirlere Türk Düğünü Rehberi | DJ Veys',
        metaDescription:
          'Alman misafirlerinize Türk düğününü nasıl anlatırsınız? Akış, takı, kıyafet, halayın temel adımı ve görgü kuralları tek tek açıklanıyor.',
      },
    },
    en: {
      slug: 'turkish-wedding-as-a-guest',
      title: 'Invited to a Turkish wedding: a guest\'s guide',
      excerpt:
        'As a guest at a Turkish wedding you need no specialist knowledge, but three points of orientation: the taki moment, where the gift is presented visibly, a dress code that runs more formal than you may expect, and a basic halay step you will eventually be pulled into. This guide walks through the evening from the guest\'s side.',
      body: tuerkischeHochzeitAlsGastEn,
      seo: {
        metaTitle: 'Turkish Wedding as a Guest: Guide | DJ Veys',
        metaDescription:
          'Invited to a Turkish wedding? Running order, the taki gift moment, dress code, a basic halay step and etiquette explained for first-time guests.',
      },
    },
  },
};
