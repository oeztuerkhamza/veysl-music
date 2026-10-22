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

Wer zum ersten Mal zu einer türkischen oder deutsch-türkischen Hochzeit eingeladen ist,
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
Zwei Fragen tauchen immer wieder auf:

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

Als deutscher Gast brauchen Sie kein Spezialwissen, sondern drei Dinge: rechtzeitig da
sein, das Geschenk für den Taki-Moment vorbereiten und die Tanzfläche nicht vermeiden.
Alles Weitere erklärt sich im Lauf des Abends — nicht zuletzt durch eine Moderation, die
jeden Programmpunkt in beiden Sprachen ansagt. Wer selbst eine solche Feier plant, findet
in der Übersicht zu Hochzeit und Events sowie auf der Seite für türkische Hochzeiten in
Stuttgart den passenden Einstieg.
`.trim();

export const tuerkischeHochzeitAlsGastTr = `
## Türk düğünü neden farklı hissettirir

Karma bir davetli listesinde Alman misafirler genellikle iyi niyetle gelir ama akışı
bilmez: ne zaman ayağa kalkılır, hediye ne zaman ve nasıl verilir, halaya girmek şart mı.
Bu belirsizlik çoğu zaman akşamı salonun kenarında geçiren bir masayla sonuçlanır — kimse
istemediği hâlde. Düğünden önce birkaç cümlelik bir bilgilendirme, davetiyeye eklenen kısa
bir not ya da bir mesaj, bunu büyük ölçüde çözer.

Aşağıdaki başlıklar, bir Alman misafirin akşam boyunca karşılaşacağı her şeyi sırayla ele
alıyor — misafir olarak okumak için de, davetlilere önceden iletmek için de. Hepsi
gerekmez; ilk üç başlık çoğu durumda yeterli.

## Akşamın akışı: misafirin gözünden

| An | Misafiri ne bekliyor |
|---|---|
| Geliş | Ailenin karşılaması, salonun uzun bir süreye yayılarak dolması |
| Çiftin girişi | Kendine ait müzik, çoğunlukla canlı bir an, herkes ayakta ve alkışta |
| Törensel bölüm | Konuşmalar, yüzük töreni, kırmızı kuşak — akşamın en sakin bölümü |
| Takı | Misafirler öne çıkar ve hediyelerini görünür şekilde takdim eder |
| Yemek | Alman akışına alışkın biri için genellikle beklenenden geç |
| Dans programı | Halay, Roman havası, Türkçe ve uluslararası parçalar dönüşümlü |
| Kapanış | Ortalama bir Alman kutlamasından belirgin şekilde geç |

Bu sıralama aileden aileye değişir. Bunu önceden bilmek bile başlı başına
rahatlatıcı: "saat kaçta ne olacak" listesi yerine "şu anlar olacak" çerçevesi vermek daha
gerçekçi. Karma davetli listelerinde sunumun Almanca ve Türkçe yapılması da bu boşluğu
akşam boyunca kapatır.

## Giriş: kaçırılmaması gereken an

Çiftin girişi akşamın ilk büyük anıdır ve bilinçli olarak sahnelenir: kendine ait müzik,
sık sık canlı bir unsur, sahneye ya da baş masaya giden yolda ışık. Birçok ailede bunun
öncesinde ayrı bir program noktası vardır — gelin çıkarma, yani gelinin baba evinden
alındığı ya da salona getirildiği an.

Pratikte şu kadarı yeterli: zamanında salonda olun, ayağa kalkın, orta koridoru boş
bırakın ve fotoğrafçının önüne geçmeyin. Telefonla fotoğraf çekmek hemen her yerde hoş
karşılanır, ama ikinci sıradan.

## Takı: en çok sorulan konu

Alman düğünlerinde zarf genellikle bir kutuya sessizce bırakılır. Türk düğününde ise
hediyenin verilmesi başlı başına bir program noktasıdır: takı. Çift önde durur, misafirler
tek tek, çift olarak ya da aile olarak öne çıkar ve hediye görünür biçimde takdim edilir —
geleneksel olarak para ya da gelinliğe ve damatlığa takılan bir kurdeleye iliştirilen altın.
Sunum çoğu zaman bu bölüme eşlik eder ve öne çıkan misafiri anons eder.

Pratik noktalar:

- **Zarf içinde para da altın da olağandır.** Klasik bir eşya hediyesi birçok düğünde
  istisnadır.
- **Miktar için bir tablo yoktur** ve dışarıdan kimse ciddi biçimde böyle bir tablo
  kuramaz. Ölçü, aileye olan yakınlıktır — kendi çevrelerindeki bir davette nasıl
  davranıyorlarsa öyle.
- **Zarfın üzerine isim yazılmalı.** Kalabalık bir davetli listesinde çiftin sonradan
  teşekkür edebilmesinin tek yolu budur.
- **Sırası beklenmeli.** Hediyeyi program dışında masada vermek iyi niyetlidir ama program
  noktasının anlamını ortadan kaldırır.

Takı anı herkesin gözü önünde yaşanır ama sıcaktır. Bir sınav değildir; dikkat zarfa değil çifte
yöneliktir. Bunu önceden bilmek, öne çıkarken duyulan tereddüdü büyük ölçüde
ortadan kaldırır.

## Kıyafet

Türk düğünleri genellikle ortalama bir Alman kutlamasından daha şık geçer. Takım elbise ya
da koyu renk bir ikili takım, elbise ya da şık bir ceket-etek takımı güvenli tercihtir.
En çok sorulan iki konu:

- **Beyaz geline aittir** — Alman düğünlerindeki kuralın aynısı.
- **Kıyafetin ne kadar kapalı olacağı aileden aileye belirgin şekilde değişir.** Aileyi iyi
  tanımayan biri için klasik-şık bir tercih her zaman doğru sonucu verir.

Elbisenin kesiminden daha çok işe yarayan bir uyarı: rahat ayakkabı. Dans bölümü uzundur ve
Alman misafirlerin beklediğinden erken başlar.

## Halayın temeli: yeni başlayanlar için

Halay, katılanların serçe parmaklarından tutuştuğu ya da bir mendil tuttuğu, bir sıra veya
açık daire hâlinde ilerleyen bir zincir dansıdır. Zincirin başındaki kişi tempoyu ve
figürleri belirler. Ortak bir danstır — bu yüzden er ya da geç birisi elinizi tutacaktır.
Bu bir davettir, bir cesaret sınavı değil — ve önceden bilmek işe yarar.

Temel adım için dürüst bir hayatta kalma planı:

1. **Zincirin sonuna girin**, ortasına değil. Orada adım en basittir ve kimse
   kolunuzu çekiştirmez.
2. **İki sıra öndeki kişinin ayaklarına bakın**, kendi ayaklarınıza değil.
3. **Küçük adımlar atın.** Temel örüntü çoğunlukla yana doğru ilerler, ritimde bir vurgu
   taşır ve sürekli tekrar eder.
4. **Öne geçmeye çalışmayın.** Figürleri, tempo değişimini ve bitişi zincirin başı verir.
5. **İki üç tur bekleyin.** Genellikle bundan sonra örüntü, takip etmeye yetecek kadar
   oturur.

Tek bir halay adımı yoktur: bölgesel varyantlar adım dizilimi ve tempo bakımından farklıdır
ve her aile kendi alışık olduğu versiyonu getirir. Bu, ilk kez katılan biri için bir rahatlamadır —
Türk misafirler de her varyantı gözü kapalı oynamaz.

## Görgü kuralları: neyin iyi karşılandığı

| İyi karşılanır | Kaçınmakta fayda var |
|---|---|
| Duyurulan saatte gelmek | Yemeğe yakın ortaya çıkmak |
| Her iki tarafın ebeveynlerini kısaca selamlamak | Yalnızca çifti selamlayıp geçmek |
| Takıda sıranın gelmesini beklemek | Zarfı sırası gelmeden masada vermek |
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
olduğunu, düğünün küçük bir provası olmadığını bilmek yerinde olur.
Orada ayrı bir hediye âdeti olup olmadığını en kolay, daveti ileten kişi açıklığa
kavuşturur.

## Sonuç

Bir Alman misafirin bilmesi gerekenler üç cümleye sığar: zamanında gelin, takı anı için
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
dark jacket-and-trousers, a dress or a smart trouser suit are the safe choice. Two points come up
again and again:

- **White stays reserved for the bride** — the same rule as at a German wedding.
- **Just how conservative the dress code is will vary considerably from family to family.**
  If you do not know the family well, a classically formal choice is always a safe bet.

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

export const tuerkischeHochzeitAlsGastEs = `
## Por qué una boda turca se vive de otra manera

Quien está invitado por primera vez a una boda turca o germano-turca suele notarlo en cuanto entra
en el salón: la noche sigue un arco distinto al de una celebración alemana sin más. Más invitados,
más ceremonia, mucho más baile y un programa construido en torno a momentos más que a horas
fijas. Nadie espera conocimientos previos. Pero ayuda conocer los elementos que se repiten: así no
hay que adivinar cuándo está ocurriendo algo importante.

Una advertencia previa: no existe «la» boda turca. Las familias de distintas regiones, y con
distintos grados de tradición, celebran de forma notablemente diferente. Lo que sigue describe lo
habitual, no lo obligatorio.

## La noche desde el punto de vista del invitado

| Momento | Qué pueden esperar los invitados |
|---|---|
| Llegada | Saludo de la familia, el salón se va llenando poco a poco |
| Entrada de la pareja | Música propia, a menudo un elemento en directo, todos de pie aplaudiendo |
| Parte ceremonial | Discursos, ceremonia de los anillos, banda roja: el tramo más tranquilo de la noche |
| Takı | Los invitados se acercan y entregan su regalo de forma visible |
| Comida | Más tarde de lo que haría esperar un programa alemán |
| Programa de baile | Halay, Roman Havası, temas turcos e internacionales alternándose |
| Final de la noche | Normalmente mucho más tarde que en una celebración alemana |

El orden varía de una familia a otra. Si es su primera vez, el punto de referencia más sencillo es
la presentación: con una lista de invitados mixta, los avisos suelen hacerse en alemán y en turco.

## La entrada: el momento que nadie debería perderse

La entrada de la pareja es el primer gran punto álgido de la noche y se escenifica a propósito:
música propia, a menudo un elemento en directo y luz a lo largo del recorrido hasta el escenario.
En muchas familias, antes hay un punto propio del programa: el gelin çıkarma, el momento en que se
recoge a la novia en la casa familiar o se la conduce al salón.

Para los invitados significa: estar a tiempo en el salón, ponerse de pie, dejar libre el pasillo
central y no cruzarse en la línea del fotógrafo. Las fotos con el móvil son bienvenidas casi en
todas partes, desde la segunda fila.

## El regalo: cómo funciona el takı

En una boda alemana, el sobre desaparece discretamente en una caja. En una boda turca, entregar el
regalo es un punto propio del programa: el takı. La pareja se coloca delante, los invitados se
acercan de uno en uno, en pareja o en familia, y el regalo se entrega de forma visible:
tradicionalmente dinero, u oro prendido en una cinta sobre el vestido y el traje. La presentación
suele acompañar este tramo.

Lo que significa en la práctica:

- **El dinero en sobre y el oro son ambos normales.** Un regalo convencional es la excepción.
- **No existe una tabla de importes**, y nadie desde fuera puede elaborar una de forma creíble.
  Oriéntese por lo cercana que sea su relación con la familia.
- **Escriba su nombre en el sobre de antemano.** Con una lista de invitados larga, ese nombre es
  la única oportunidad de la pareja de darle las gracias personalmente después.
- **Espere al momento.** Entregar el regalo en la mesa entre medias es bienintencionado, pero quita
  sentido al ritual.

El momento del takı es público, pero cálido: la atención está en la pareja, no en ningún sobre
concreto.

## Vestimenta: lo que se lleva realmente

Las bodas turcas suelen ser más formales que una celebración alemana media. Un traje o una
chaqueta oscura con pantalón, un vestido o un traje pantalón elegante son la opción segura. Hay
dos puntos que se repiten una y otra vez:

- **El blanco queda reservado para la novia**: la misma regla que en una boda alemana.
- **Lo conservadora que sea la vestimenta varía considerablemente de una familia a otra.** Si no
  conoce bien a la familia, una elección clásicamente formal siempre es una apuesta segura.

Más importante que el corte de un vestido: unos zapatos cómodos. El baile dura mucho y empieza
antes de lo que suelen esperar los invitados alemanes.

## Halay para principiantes: le van a sacar a bailar

El halay es un baile en cadena: los bailarines se enlazan por el meñique o sostienen un pañuelo y
se mueven en línea o en un círculo abierto, guiados por una persona a la cabeza que marca el tempo
y las figuras. Es un baile comunitario, y precisamente por eso, en algún momento, alguien le
tenderá la mano. Es una invitación, no un desafío.

Un plan de supervivencia sincero para el paso básico:

1. **Únase al final de la cadena**, no en medio. Ahí el paso es más sencillo.
2. **Fíjese en los pies de la persona que está dos puestos por delante**, no en los suyos.
3. **Dé pasos pequeños.** El patrón básico se desplaza sobre todo hacia un lado, lleva un acento
   en el ritmo y se repite.
4. **No intente dirigir.** Las figuras, los cambios de tempo y el final vienen todos de la cabeza
   de la cadena.
5. **Dese dos o tres vueltas.** Después, el patrón suele estar lo bastante asentado.

No existe un único paso de halay: las variantes regionales difieren en la secuencia de pasos y en
el tempo. Para un invitado sin conocimientos previos es un alivio: los invitados turcos tampoco
bailan todas las variantes a ciegas.

## Etiqueta: lo que se recibe bien y lo que no

| Se recibe bien | Mejor evitarlo |
|---|---|
| Llegar a la hora de inicio anunciada | Presentarse poco antes de la comida |
| Saludar brevemente a los padres de ambos lados | Saludar solo a la pareja y seguir de largo |
| Esperar su turno en el takı | Entregar el sobre en la mesa entre medias |
| Sumarse al baile aunque no conozca los pasos | Quedarse sentado ostensiblemente toda la noche |
| Fotografiar desde la segunda fila | Meterse en el pasillo central durante la entrada |
| Hacer con educación una petición musical en la mesa del DJ | Insistir varias veces o acudir a la mesa en mitad de la ceremonia |

Dos preguntas surgen con especial frecuencia. Si se sirve alcohol es decisión de la familia y
cambia de una celebración a otra: lo que hay en la mesa es la respuesta. Y no conocer a todo el
mundo es normal: la familia extensa y el círculo amplio de conocidos forman parte de la lista con
toda naturalidad.

## Si además hay una kına gecesi

Algunas invitaciones incluyen una segunda velada: la kına gecesi, normalmente la noche anterior,
tradicionalmente una celebración de mujeres y hoy abierta a todos los invitados en muchas
familias. Empieza de forma más emotiva y más lenta que la propia boda: la entrada de la novia y el
ritual de la henna están en el centro, y después la velada pasa a ser una fiesta. Es una
celebración independiente, no un anticipo más pequeño de la boda. Si allí se acostumbra un regalo
aparte, lo mejor es aclararlo con quien le transmitió la invitación.

## Conclusión

Ser invitado a una boda turca no requiere conocimientos especiales, solo tres cosas: llegar a
tiempo, tener el regalo preparado para el momento del takı y no evitar la pista de baile. Todo lo
demás se explica solo a lo largo de la noche, no en último lugar gracias a una presentación que
anuncia cada punto del programa en los dos idiomas. Quien planifique una celebración así
encontrará en la visión general de bodas y eventos y en la página sobre bodas turcas en Stuttgart
el punto de partida natural.
`.trim();

export const tuerkischeHochzeitAlsGastFr = `
## Pourquoi un mariage turc se vit différemment

Quand on est invité pour la première fois à un mariage turc ou germano-turc, on le remarque
généralement dès l'entrée dans la salle : la soirée suit un autre arc qu'une fête allemande classique.
Plus d'invités, plus de cérémonie, beaucoup plus de danse, et un programme construit autour de
moments plutôt que d'horaires fixes. Personne n'attend de connaissances préalables. Il est toutefois
utile de connaître les éléments qui reviennent : on ne devine plus alors quand se passe quelque chose
d'important.

Une précision d'abord : « le » mariage turc n'existe pas. Les familles de régions différentes, et
plus ou moins attachées à la tradition, font la fête de manière sensiblement différente. Ce qui suit
décrit ce qui est courant, pas ce qui est obligatoire.

## La soirée du point de vue de l'invité

| Moment | Ce à quoi les invités peuvent s'attendre |
|---|---|
| Arrivée | Accueil par la famille, la salle se remplit peu à peu |
| Entrée du couple | Sa propre musique, souvent un élément live, tout le monde debout applaudit |
| Partie cérémonielle | Discours, cérémonie des bagues, ruban rouge : la séquence la plus calme de la nuit |
| Takı | Les invités s'avancent et remettent leur cadeau de façon visible |
| Repas | Plus tard que ne le laisserait penser un déroulé allemand |
| Programme de danse | Halay, Roman Havası, titres turcs et internationaux en alternance |
| Fin de soirée | Généralement bien plus tard que lors d'une fête allemande |

L'ordre varie d'une famille à l'autre. Si c'est votre première fois, le repère le plus simple est
l'animation : avec une liste d'invités mixte, les annonces se font normalement en allemand et en turc.

## L'entrée : le moment à ne pas manquer

L'entrée du couple est le premier grand temps fort de la soirée et elle est délibérément mise en scène
: sa propre musique, souvent un élément live et de la lumière le long du chemin vers la scène. Dans de
nombreuses familles, un moment distinct du programme la précède : le gelin çıkarma, le moment où l'on
va chercher la mariée dans la maison familiale ou où on la conduit dans la salle.

Pour les invités, cela signifie : être dans la salle à temps, se lever, laisser l'allée centrale
libre et ne pas se mettre dans le champ du photographe. Les photos au téléphone sont bienvenues
presque partout, depuis le deuxième rang.

## Le cadeau : comment fonctionne le takı

Lors d'un mariage allemand, l'enveloppe disparaît discrètement dans une boîte. Lors d'un mariage turc,
la remise du cadeau est un moment du programme à part entière : le takı. Le couple se tient devant,
les invités s'avancent seuls, en couple ou en famille, et le cadeau est remis de façon visible :
traditionnellement de l'argent, ou de l'or épinglé à un ruban sur la robe et le costume. L'animation
accompagne souvent cette séquence.

Concrètement :

- **L'argent en enveloppe et l'or sont tous deux normaux.** Un cadeau classique est l'exception.
- **Il n'existe pas de barème de montants**, et personne d'extérieur ne peut en établir un de façon
  crédible. Fiez-vous à votre degré de proximité avec la famille.
- **Écrivez votre nom sur l'enveloppe à l'avance.** Avec une longue liste d'invités, ce nom est la
  seule possibilité pour le couple de vous remercier personnellement ensuite.
- **Attendez le moment prévu.** Remettre le cadeau à table entre-temps part d'une bonne intention,
  mais retire son sens au rituel.

Le moment du takı est public, mais chaleureux : l'attention porte sur le couple, pas sur une enveloppe
en particulier.

## La tenue : ce que l'on porte vraiment

Les mariages turcs sont généralement plus habillés qu'une fête allemande moyenne. Un costume ou une
veste sombre avec pantalon, une robe ou un tailleur-pantalon élégant sont le choix sûr. Deux points
reviennent sans cesse :

- **Le blanc reste réservé à la mariée** : la même règle que lors d'un mariage allemand.
- **Le degré de conservatisme de la tenue varie considérablement d'une famille à l'autre.** Si vous
  connaissez mal la famille, un choix classique et habillé est toujours une valeur sûre.

Plus important que la coupe d'une robe : des chaussures confortables. La danse dure longtemps et
commence plus tôt que ne s'y attendent généralement les invités allemands.

## Le halay pour débutants : on vous y entraînera

Le halay est une danse en chaîne : les danseurs se tiennent par le petit doigt ou tiennent un foulard
et avancent en ligne ou en cercle ouvert, menés par une personne en tête qui donne le tempo et les
figures. C'est une danse collective, et c'est précisément pour cela qu'à un moment donné, quelqu'un
vous tendra la main. C'est une invitation, pas un défi.

Un plan de survie honnête pour le pas de base :

1. **Rejoignez la fin de la chaîne**, pas le milieu. C'est là que le pas est le plus simple.
2. **Regardez les pieds de la personne située deux places devant vous**, pas les vôtres.
3. **Faites de petits pas.** Le motif de base se déplace surtout latéralement, porte un accent dans le
   rythme et se répète.
4. **N'essayez pas de mener.** Les figures, les changements de tempo et la fin viennent tous de la
   tête de la chaîne.
5. **Laissez-vous deux ou trois tours.** Ensuite, le motif est généralement assez bien acquis.

Il n'existe pas un seul pas de halay : les variantes régionales diffèrent par l'enchaînement des pas
et le tempo. Pour un invité sans connaissances préalables, c'est un soulagement : les invités turcs ne
dansent pas non plus toutes les variantes les yeux fermés.

## Les usages : ce qui est bien perçu et ce qui ne l'est pas

| Bien perçu | Plutôt à éviter |
|---|---|
| Arriver à l'heure de début annoncée | Arriver juste avant le repas |
| Saluer brièvement les parents des deux côtés | Saluer seulement le couple puis passer son chemin |
| Attendre son tour au takı | Remettre l'enveloppe à table entre-temps |
| Se joindre à la danse même sans connaître les pas | Rester ostensiblement assis toute la soirée |
| Photographier depuis le deuxième rang | S'avancer dans l'allée centrale pendant l'entrée |
| Faire poliment une demande musicale à la régie | Insister plusieurs fois, ou aller à la régie en pleine cérémonie |

Deux questions reviennent particulièrement souvent. Le service d'alcool est une décision de la famille
et varie d'une fête à l'autre : ce qui est sur la table vous donne la réponse. Et ne pas connaître
tout le monde est normal : la famille élargie et le cercle plus large des connaissances font
naturellement partie de la liste.

## S'il y a aussi une kına gecesi

Certaines invitations portent sur une deuxième soirée : la kına gecesi, généralement la veille,
traditionnellement une fête de femmes et aujourd'hui ouverte à tous les invités dans de nombreuses
familles. Elle commence de façon plus émouvante et plus lente que le mariage lui-même : l'entrée de la
mariée et le rituel du henné sont au centre, puis la soirée bascule dans la fête. C'est une fête à
part entière, pas un avant-goût réduit du mariage. Pour savoir si un cadeau distinct y est d'usage, le
mieux est de demander à la personne qui vous a transmis l'invitation.

## Conclusion

Être invité à un mariage turc ne demande aucune connaissance particulière, seulement trois choses :
arriver à l'heure, avoir le cadeau prêt pour le moment du takı et ne pas éviter la piste de danse. Tout
le reste s'explique de lui-même au fil de la soirée, notamment grâce à une animation qui annonce
chaque moment du programme dans les deux langues. Pour planifier une telle fête, la vue d'ensemble
mariages et événements et la page consacrée aux mariages turcs à Stuttgart sont le point de départ
naturel.
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
          'Zu einer türkischen Hochzeit eingeladen? Ablauf, Taki und Geschenk, Dresscode, Halay-Grundschritt und Etikette — was Gäste vorher wissen sollten.',
      },
    },
    tr: {
      slug: 'turk-dugunune-katilan-alman-misafirler',
      title: 'Türk düğününe giden Alman misafirler: bilinmesi gerekenler',
      excerpt:
        'Karma bir davetli listesinde Alman misafirler akışı bilmedikleri için çekingen kalır: takının ne zaman ve nasıl yapıldığı, kıyafetin ne kadar şık olması gerektiği, halaya girmenin şart olup olmadığı. Bu rehber akşamı sırayla anlatıyor — okumak ya da davetlilere iletmek için.',
      body: tuerkischeHochzeitAlsGastTr,
      seo: {
        metaTitle: 'Alman Misafirlere Türk Düğünü Rehberi | DJ Veys',
        metaDescription:
          'Türk düğününe giden bir Alman misafir neyi bilmeli? Akış, takı, kıyafet, halayın temel adımı ve görgü kuralları tek tek açıklanıyor.',
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
    es: {
      slug: 'invitado-a-una-boda-turca',
      title: 'Invitado a una boda turca: la guía para invitados',
      excerpt:
        'Como invitado a una boda turca no necesita conocimientos especiales, pero sí tres puntos de orientación: el momento del takı, en el que el regalo se entrega de forma visible, una vestimenta más formal de lo que quizá espere y un paso básico de halay al que tarde o temprano le sacarán. Esta guía recorre la noche desde el lado del invitado.',
      body: tuerkischeHochzeitAlsGastEs,
      seo: {
        metaTitle: 'Invitado a una boda turca: guía práctica | DJ Veys',
        metaDescription:
          'Invitado a una boda turca: entrada, takı y regalo, vestimenta, halay para principiantes y etiqueta.',
      },
    },
    fr: {
      slug: 'invite-a-un-mariage-turc',
      title: 'Invité à un mariage turc : le guide de l\'invité',
      excerpt:
        'En tant qu\'invité à un mariage turc, vous n\'avez besoin d\'aucune connaissance particulière, mais de trois repères : le moment du takı, où le cadeau est remis de façon visible, une tenue plus habillée que vous ne l\'imaginez peut-être, et un pas de halay de base dans lequel on finira par vous entraîner. Ce guide parcourt la soirée du point de vue de l\'invité.',
      body: tuerkischeHochzeitAlsGastFr,
      seo: {
        metaTitle: 'Invité à un mariage turc : le guide pratique | DJ Veys',
        metaDescription:
          'À quoi s\'attendre en tant qu\'invité à un mariage turc : entrée, takı et cadeau, tenue, halay pour débutants et usages.',
      },
    },
  },
};
