import type { BlogPost } from './types';

/**
 * Primary keyword (DE): "wie viel budget für musik hochzeit" / "hochzeitsbudget musik anteil".
 *
 * Sits deliberately UPSTREAM of was-kostet-ein-hochzeits-dj in the funnel: that post
 * answers "what does it cost", this one answers the question couples ask before it —
 * "how much of our budget should this be at all". No cannibalization, because this post
 * carries no market figures at all and never competes for the price keyword.
 *
 * HARD EDITORIAL CONSTRAINT on this article, tighter than the rest of the cluster:
 * zero percentages and zero euro figures anywhere, not even as attributed market
 * observations. The entire budget-share question is answered through mechanism —
 * fixed vs. guest-scaling cost behaviour — precisely because every number that could
 * be given here would be an invented norm. See .claude/BRAND-FACTS.md and CONTRACT.md:
 * prices stay "auf Anfrage", and guest-count or budget-share norms are never stated
 * as fact.
 */
export const hochzeitsbudgetMusikDe = `
## Warum eine feste Anteilsregel nicht funktioniert

Die Frage nach dem Musikbudget wird fast immer als Anteilsfrage gestellt: ein fester Teil
der Gesamtsumme, der sich auf jede Feier anwenden lässt. Genau das funktioniert nicht,
und der Grund liegt nicht in der Musik, sondern im Aufbau des Budgets selbst. Die großen
Posten einer Hochzeit reagieren völlig unterschiedlich, wenn sich die Feier verändert.
Wer diese Mechanik versteht, braucht keine Faustregel mehr, sondern entscheidet an der
eigenen Feier entlang.

## Feste Kosten und mitwachsende Kosten

Die wichtigste Trennlinie im Hochzeitsbudget verläuft nicht zwischen wichtig und
unwichtig, sondern zwischen Posten, die mit jedem zusätzlichen Gast mitwachsen, und
Posten, die weitgehend gleich bleiben.

| Posten | Verhalten bei mehr Gästen |
|---|---|
| Catering und Getränke | wächst nahezu direkt mit jedem Gedeck |
| Location und Bestuhlung | wächst in Stufen, mit der benötigten Raumgröße |
| Papeterie, Gastgeschenke, Tischdekoration | wächst pro Person |
| Fotografie | bleibt weitgehend gleich; teurer wird der längere Tag, nicht die größere Gästeliste |
| Musik und Technik | bleibt weitgehend gleich; skaliert nur stufenweise über die Beschallung |

Das ist die eigentliche Antwort auf die Anteilsfrage. Eine Feier mit achtzig Gästen und
dieselbe Feier mit zweihundert Gästen unterscheiden sich beim Catering ganz erheblich.
Beim DJ ändert sich deutlich weniger: dieselbe Vorbereitung, dieselbe Anfahrt, dieselbe
Spielzeit, eine Anlage eine Stufe größer, gegebenenfalls eine zweite Beschallungszone.
Der Anteil, den die Musik am Gesamtbudget einnimmt, sinkt deshalb fast automatisch, je
größer die Feier wird — ohne dass irgendjemand eine Entscheidung getroffen hätte. Eine
Anteilsregel, die für die kleine Feier passt, ist bei der großen bereits falsch, und
umgekehrt.

## Was das Musikbudget tatsächlich kauft

Hilfreicher als ein Anteil ist die Frage, welche konkreten Dinge im Musikbudget stecken.
Es sind im Wesentlichen vier:

- **Spielzeit.** Ein Set am Abend ist etwas anderes als eine durchgehende Begleitung vom
  Empfang über das Dinner bis in die Nacht. Der Unterschied ist keine Frage der Qualität,
  sondern der Stunden.
- **Technikumfang.** Beschallung passend zu Raum und Gästezahl, Licht, weitere Zonen,
  Mikrofone für Reden. Das ist die einzige Position, die überhaupt mit der Gästezahl
  mitwächst, und sie tut es in Stufen statt gleichmäßig.
- **Live-Elemente.** Ob zusätzlich zum DJ-Set live gespielt wird, ob eine Live-Besetzung
  dazukommt, ob moderiert wird und in welchen Sprachen.
- **Anzahl der Gewerke.** Ob Musik, Technik und Moderation aus einer Hand kommen oder auf
  mehrere Dienstleister verteilt sind, die einzeln beauftragt, koordiniert und abgestimmt
  werden müssen.

Der letzte Punkt wird beim Vergleichen regelmäßig übersehen. Zwei Budgets, die auf dem
Papier gleich aussehen, können einmal einen einzigen Ansprechpartner enthalten und einmal
drei — mit drei Verträgen, drei Anfahrten und drei Abstimmungen, die jemand führen muss.

## Warum Sparen ausgerechnet hier am teuersten wird

In Hochzeitsforen taucht eine Sorge auffällig häufig auf, und sie betrifft nie das Essen:
dass die Tanzfläche leer bleibt. Das ist keine Werbebehauptung, sondern eine Beobachtung
darüber, wovor Paare sich im Voraus fürchten und woran sie sich im Nachhinein erinnern.
Dahinter steht ein struktureller Grund.

Fast jeder Posten im Hochzeitsbudget wirkt auf einen abgegrenzten Teil des Tages: das
Kleid beim Ankommen und auf den Bildern, das Catering beim Dinner, die Dekoration im
Raum. Die Musik läuft dagegen über den gesamten Ablauf und bestimmt zusätzlich dessen
Kurve — wann es ruhig ist, wann die Stimmung kippt, wann der Abend seinen Höhepunkt hat
und wann er ausklingt. Sie ist der einzige Posten, der nicht nur zu einem Moment
beiträgt, sondern die Reihenfolge der Momente formt.

Dazu kommt ein zweiter Punkt: Ein schwächerer Posten lässt sich an anderer Stelle meist
ausgleichen. Ein Abend, an dem niemand tanzt, lässt sich nicht ausgleichen — er ist
vorbei.

## Eine Prioritätenübung, die zehn Minuten dauert

Statt einen Anteil zu suchen, lässt sich die Entscheidung direkt treffen. Die Übung
funktioniert am besten zu zweit, mit einem Blatt Papier:

1. **Getrennt aufschreiben**, an welche drei Dinge Sie sich in fünf Jahren von dieser
   Hochzeit erinnern möchten. Nicht die drei teuersten Posten, sondern die drei
   Erinnerungen.
2. **Listen vergleichen.** Übereinstimmungen sind die echten gemeinsamen Prioritäten;
   die Unterschiede sind das eigentliche Gespräch.
3. **Jeder Priorität den Posten zuordnen**, der sie tatsächlich herstellt. "Alle haben
   getanzt" hängt an Musik und Ablauf, "es sah wunderschön aus" an Fotografie und
   Dekoration.
4. **Zwei Posten benennen, die niemand genannt hat.** Dort liegt der Spielraum, aus dem
   sich Budget für die Prioritäten holen lässt — fast immer bei Posten, die pro Person
   mitwachsen.
5. **Erst danach Angebote einholen**, und zwar in der Reihenfolge der Prioritäten. Wer
   zuerst anfragt, was ihm am wichtigsten ist, kennt den echten Rahmen, bevor der Rest
   bereits verplant ist.

Der Wert der Übung liegt nicht im Ergebnis, sondern in der Reihenfolge: Prioritäten
zuerst, Zahlen danach. Wer umgekehrt vorgeht, verteilt das Budget in der Reihenfolge, in
der die Angebote zufällig eintreffen.

## Wann ein kleineres Musikbudget völlig ausreicht

Es gibt Feiern, bei denen ein größeres Musikbudget schlicht nichts hinzufügt, und es wäre
unredlich, das zu verschweigen:

- **Der Abend endet früh.** Klingt die Feier nach dem Dinner aus, hat ein durchgehendes
  Abendprogramm keine Funktion.
- **Es wird bewusst nicht getanzt.** Manche Paare planen einen Empfang, ein langes Essen
  und Gespräche. Dann braucht es saubere Hintergrundbeschallung und funktionierende
  Mikrofone für die Reden, mehr nicht.
- **Kleine Gästezahl in einem gutmütigen Raum.** Wo die Akustik unkompliziert ist und
  wenige Gäste zu beschallen sind, ist der Technikbedarf real geringer.
- **Die Location stellt eine feste Anlage.** Dann entfällt ein Teil des Technikumfangs —
  vorausgesetzt, jemand prüft vorher, ob die vorhandene Anlage für den geplanten Abend
  tatsächlich taugt.

In all diesen Fällen ist der kleinere Umfang keine Sparmaßnahme, sondern die passende
Buchung. Der Unterschied zwischen "kleiner buchen" und "an der falschen Stelle sparen"
liegt darin, ob der Umfang zum geplanten Abend passt oder ob der Abend nachträglich an
einen zu knappen Umfang angepasst werden muss.

## Wann das Musikbudget festgelegt werden sollte

Praktisch ist die Reihenfolge fast wichtiger als die Höhe. Location und Gästezahl stehen
meist zuerst fest, weil beide alles andere begrenzen. Danach lohnt es sich, die Posten zu
buchen, die nur einmal pro Termin verfügbar sind — und dazu gehört die Musik, weil ein
Samstag in der Hauptsaison früh vergeben ist. Wer die Musik ans Ende der Planung
schiebt, entscheidet am Ende nicht mehr nach Passung, sondern nach dem, was übrig ist:
beim Budget wie beim Kalender.

## Fazit

Die ehrliche Antwort auf die Anteilsfrage ist keine Zahl, sondern eine Unterscheidung:
Posten, die mit der Gästezahl mitwachsen, und Posten, die es nicht tun. Musik gehört zur
zweiten Gruppe und ist gleichzeitig der Posten, der den Ablauf des gesamten Abends formt.
Wer die Prioritätenübung macht, bevor die ersten Angebote eintreffen, trifft die
Entscheidung bewusst statt der Reihe nach. Wie sich der Preis eines Hochzeits-DJs dann
konkret zusammensetzt, behandelt der ausführliche Artikel zu den Kosten eines
Hochzeits-DJs; welche Leistungen in welchem Rahmen enthalten sind, zeigt die
Paketübersicht, und eine unverbindliche Anfrage klärt den Rest für Ihr Datum.
`.trim();

export const hochzeitsbudgetMusikTr = `
## Sabit bir oran kuralı neden işe yaramıyor

Müzik bütçesi sorusu neredeyse her zaman bir oran sorusu olarak sorulur: toplam tutardan
her düğüne uygulanabilecek sabit bir dilim. Tam olarak bu işe yaramıyor ve nedeni müzikte
değil, bütçenin kendi yapısında. Bir düğünün büyük kalemleri, düğün değiştiğinde bambaşka
davranır. Bu mekanizmayı bir kez kavrayan çifte artık genel geçer bir kural gerekmez;
kararı kendi düğünü üzerinden verebilir.

## Sabit kalemler ve misafirle büyüyen kalemler

Düğün bütçesindeki en önemli ayrım önemli ile önemsiz arasında değil, her ek misafirle
birlikte büyüyen kalemler ile büyük ölçüde aynı kalan kalemler arasındadır.

| Kalem | Misafir sayısı artınca davranışı |
|---|---|
| Yemek ve içecek | neredeyse her kuver ile doğrudan büyür |
| Mekân ve oturma düzeni | gereken salon büyüklüğüyle kademeli büyür |
| Davetiye, hediyelik, masa süslemesi | kişi başına büyür |
| Fotoğraf | büyük ölçüde aynı kalır; pahalılaştıran uzun gün, kalabalık liste değil |
| Müzik ve teknik | büyük ölçüde aynı kalır; yalnızca ses sistemi üzerinden kademeli ölçeklenir |

Oran sorusunun asıl cevabı budur. Seksen davetlili bir düğün ile aynı düğünün iki yüz
davetlili hâli, yemek tarafında ciddi biçimde ayrışır. DJ tarafında ise çok daha azı
değişir: aynı hazırlık, aynı yol, aynı çalma süresi, bir kademe büyük bir ses sistemi,
gerekirse ikinci bir ses bölgesi. Bu yüzden müziğin toplam bütçedeki payı, düğün
büyüdükçe neredeyse kendiliğinden düşer — kimse bir karar vermemiş olsa bile. Küçük
düğüne uyan bir oran kuralı, büyük düğünde zaten yanlıştır; tersi de geçerlidir.

## Müzik bütçesi gerçekte neyi satın alır

Bir orandan daha yararlı olan soru şu: müzik bütçesinin içinde somut olarak ne var? Esas
olarak dört şey:

- **Çalma süresi.** Akşam çalınan bir set ile karşılamadan yemeğe, oradan gecenin sonuna
  uzanan kesintisiz bir eşlik aynı şey değildir. Fark kalite değil, saattir.
- **Teknik kapsam.** Salona ve davetli sayısına uygun ses, ışık, ek bölgeler,
  konuşmalar için mikrofonlar. Davetli sayısıyla gerçekten büyüyen tek kalem budur ve
  düzgün bir eğriyle değil, kademeler hâlinde büyür.
- **Canlı unsurlar.** DJ setinin yanı sıra canlı çalınıp çalınmayacağı, canlı bir kadro
  eklenip eklenmeyeceği, sunum yapılıp yapılmayacağı ve hangi dillerde.
- **Kaç ayrı hizmet sağlayıcı.** Müzik, teknik ve sunumun tek elden mi geldiği, yoksa
  ayrı ayrı sözleşme yapılan, koordine edilen ve uyumlandırılan birden fazla sağlayıcıya
  mı dağıldığı.

Son madde karşılaştırmalarda düzenli olarak gözden kaçar. Kâğıt üzerinde aynı görünen iki
bütçeden biri tek bir muhatap, diğeri üç muhatap içerebilir — üç sözleşme, üç ulaşım ve
birinin yürütmesi gereken üç ayrı koordinasyon ile.

## Tasarruf tam da burada neden en pahalıya mal olur

Düğün forumlarında dikkat çekici sıklıkta dile getirilen bir endişe var ve bu asla yemek
değil: dans pistinin boş kalması. Bu bir reklam iddiası değil, çiftlerin önceden neyden
korktuğuna ve sonradan neyi hatırladığına dair bir gözlem. Arkasında yapısal bir neden
var.

Düğün bütçesindeki neredeyse her kalem, günün sınırlı bir bölümünde etkisini gösterir:
gelinlik girişte ve fotoğraflarda, yemek akşam sofrasında, süsleme salonda. Müzik ise tüm
akış boyunca çalar ve ayrıca akışın eğrisini belirler — ne zaman sakinleşileceğini, ne
zaman havanın döneceğini, akşamın zirvesinin ne zaman geleceğini ve nasıl sonlanacağını.
Yalnızca tek bir ana katkı sunmakla kalmayıp anların sırasını biçimlendiren tek kalemdir.

Bir de ikinci nokta var: zayıf kalan bir kalem genellikle başka yerden telafi edilebilir.
Kimsenin dans etmediği bir akşam telafi edilemez — o akşam geçmiştir.

## On dakika süren bir öncelik alıştırması

Bir oran aramak yerine kararı doğrudan vermek mümkün. Alıştırma en iyi iki kişiyle, bir
kâğıt üzerinde işler:

1. **Ayrı ayrı yazın:** bu düğünden beş yıl sonra hangi üç şeyi hatırlamak istiyorsunuz?
   En pahalı üç kalemi değil, üç anıyı.
2. **Listeleri karşılaştırın.** Örtüşenler gerçek ortak önceliklerdir; farklar ise asıl
   konuşulması gereken kısımdır.
3. **Her önceliğe onu gerçekten üreten kalemi eşleyin.** "Herkes dans etti" müziğe ve
   akışa bağlıdır, "her şey çok güzel görünüyordu" fotoğrafa ve süslemeye.
4. **Kimsenin saymadığı iki kalemi belirleyin.** Önceliklere bütçe aktarılacak alan
   oradadır — neredeyse her zaman kişi başına büyüyen kalemlerde.
5. **Teklifleri ancak bundan sonra toplayın**, hem de öncelik sırasına göre. En önemli
   gördüğü şeyi önce soran kişi, gerisi planlanmadan önce gerçek çerçeveyi bilir.

Alıştırmanın değeri sonuçta değil, sıradadır: önce öncelikler, sonra rakamlar. Tersini
yapan, bütçeyi tekliflerin rastgele geliş sırasına göre dağıtır.

## Daha küçük bir müzik bütçesi ne zaman gerçekten yeterlidir

Daha büyük bir müzik bütçesinin hiçbir şey eklemediği düğünler vardır ve bunu söylememek
dürüst olmaz:

- **Akşam erken biter.** Yemekten sonra sonlanan bir kutlamada kesintisiz bir gece
  programının işlevi yoktur.
- **Bilinçli olarak dans edilmeyecektir.** Bazı çiftler bir karşılama, uzun bir yemek ve
  sohbet planlar. O zaman temiz bir fon sesi ve konuşmalar için çalışan mikrofonlar
  yeter, fazlası değil.
- **Az davetli, uysal bir salon.** Akustiğin sorunsuz olduğu ve az sayıda kişinin bulunduğu
  salonlarda teknik ihtiyaç gerçekten daha düşüktür.
- **Mekân sabit bir ses sistemi sağlıyor.** O zaman teknik kapsamın bir bölümü ortadan
  kalkar — yeter ki mevcut sistemin planlanan akşam için gerçekten yeterli olup olmadığı
  önceden kontrol edilsin.

Bu durumların hepsinde küçük kapsam bir tasarruf tedbiri değil, doğru rezervasyondur.
"Daha küçük rezerve etmek" ile "yanlış yerden kısmak" arasındaki fark şudur: kapsam
planlanan akşama mı uyuyor, yoksa akşam sonradan yetersiz kapsama göre mi küçültülmek
zorunda kalıyor?

## Müzik bütçesi ne zaman belirlenmeli

Pratikte sıra, tutardan neredeyse daha önemlidir. Mekân ve davetli sayısı genellikle ilk
netleşir, çünkü ikisi de geri kalan her şeyi sınırlar. Ardından, bir tarihte yalnızca bir
kez müsait olan kalemleri rezerve etmek mantıklıdır — müzik de bunlardan biridir, çünkü
sezonun cumartesileri erken dolar. Müziği planlamanın sonuna bırakan kişi, kararı artık
uygunluğa göre değil, geriye ne kaldığına göre verir: hem bütçede hem takvimde.

## Sonuç

Oran sorusunun dürüst cevabı bir rakam değil, bir ayrımdır: davetli sayısıyla büyüyen
kalemler ve büyümeyen kalemler. Müzik ikinci gruptadır ve aynı zamanda tüm akşamın akışını
biçimlendiren kalemdir. Öncelik alıştırmasını ilk teklifler gelmeden yapan çift, kararı
sırayla değil bilinçli olarak verir. Bir düğün DJ'inin fiyatının somut olarak neyden
oluştuğunu düğün DJ maliyetleri hakkındaki ayrıntılı yazı ele alıyor; hangi hizmetlerin
hangi çerçevede yer aldığını paket sayfası gösteriyor ve bağlayıcı olmayan bir talep
gerisini kendi tarihiniz için netleştiriyor.
`.trim();

export const hochzeitsbudgetMusikEn = `
## Why a fixed share rule doesn't work

The music budget question is almost always asked as a share question: a fixed slice of
the total that can be applied to any wedding. That is exactly what doesn't work, and the
reason lies not in the music but in how the budget itself is built. The big line items of
a wedding behave completely differently when the wedding changes. Once that mechanism is
clear, no rule of thumb is needed — the decision can be made from your own celebration outwards
instead.

## Fixed costs and guest-scaling costs

The most important dividing line in a wedding budget isn't between important and
unimportant. It runs between items that grow with every additional guest and items that
stay largely the same.

| Line item | Behaviour as guest numbers rise |
|---|---|
| Catering and drinks | grows almost directly with every cover |
| Venue and seating | grows in steps, with the room size required |
| Stationery, favours, table decoration | grows per head |
| Photography | stays largely the same; a longer day costs more, a longer guest list doesn't |
| Music and technical setup | stays largely the same; scales only in steps, via the sound system |

That is the real answer to the share question. A celebration with eighty guests and the
same celebration with two hundred differ considerably on catering. On the DJ side, far
less changes: the same preparation, the same journey, the same playing time, a rig one
size up, possibly a second sound zone. The share music takes of the total therefore falls
almost automatically as the wedding grows — without anyone having made a decision. A
share rule that fits the small celebration is already wrong for the large one, and the
other way round.

## What the music budget actually buys

More useful than a share is the question of what concretely sits inside the music budget.
There are essentially four things:

- **Playing time.** An evening set is a different job from continuous accompaniment from
  the reception through dinner and into the night. The difference isn't quality, it's
  hours.
- **Technical scope.** Sound matched to the room and the guest count, lighting,
  additional zones, microphones for speeches. This is the only item that genuinely
  grows with guest numbers, and it does so in steps rather than smoothly.
- **Live elements.** Whether anything is played live alongside the DJ set, whether a live
  line-up joins, whether hosting is needed, and in which languages.
- **Number of suppliers.** Whether music, technical setup and hosting come from one
  source, or are spread across several providers who each have to be booked, coordinated
  and briefed separately.

That last point is regularly overlooked when comparing. Two budgets that look identical
on paper can contain one point of contact in one case and three in the other — three
contracts, three journeys and three separate coordination threads that somebody has to
run.

## Why cutting here is the most expensive cut

One worry comes up strikingly often in wedding forums, and it is never about the food:
that the dance floor stays empty. That isn't a marketing claim, it's an observation about
what couples fear beforehand and what they remember afterwards. There's a structural
reason behind it.

Almost every item in a wedding budget affects only a bounded part of the day: the dress on
arrival and in the photographs, catering at dinner, decoration in the room. Music, by
contrast, runs across the whole timeline and also shapes its curve — when things stay
calm, when the mood turns, when the evening peaks and how it winds down. It's the only
item that doesn't just contribute to one moment but shapes the order of the moments.

There's a second point on top of that. A weaker line item can usually be compensated for
somewhere else. An evening on which nobody dances can't be compensated for — it's over.

## A ten-minute priorities exercise

Instead of hunting for a share, the decision can be made directly. The exercise works
best as a couple, with a sheet of paper:

1. **Write down separately** which three things you want to remember about this wedding in
   five years. Not the three most expensive items — the three memories.
2. **Compare the lists.** The overlaps are the genuine shared priorities; the differences
   are the conversation that actually needs having.
3. **Assign each priority the item that produces it.** "Everyone danced" hangs on music
   and the running order; "it looked beautiful" on photography and decoration.
4. **Name two items nobody listed.** That's where the room to move is — the budget for
   your priorities comes from there, and almost always from items that grow per head.
5. **Only then request quotes**, and do it in order of priority. Asking first about what
   matters most means knowing the real scope before the rest is already committed.

The value of the exercise isn't the result, it's the sequence: priorities first, numbers
second. Done the other way round, the budget gets allocated in whatever order the quotes
happen to arrive.

## When a smaller music budget is genuinely fine

There are celebrations where a larger music budget simply adds nothing, and it would be
dishonest to leave that out:

- **The evening ends early.** If the celebration winds down after dinner, a full evening
  programme serves no purpose.
- **There will deliberately be no dancing.** Some couples plan a reception, a long meal
  and conversation. That calls for clean background sound and working microphones for the
  speeches, and nothing beyond it.
- **A small guest count in a forgiving room.** Where the acoustics are uncomplicated and
  few guests to reach with sound, the technical requirement really is lower.
- **The venue provides an installed system.** Part of the technical scope then falls away
  — provided somebody checks in advance whether the existing system is actually up to the
  evening as planned.

In all these cases the smaller scope isn't a saving, it's the right booking. The
difference between booking smaller and cutting in the wrong place is whether the scope
fits the evening you planned, or whether the evening has to be trimmed afterwards to fit
a scope that was too thin.

## When the music budget should be set

In practice, the sequence matters almost more than the amount. Venue and guest count are
usually fixed first, because both constrain everything else. After that it pays to book
the items that are only available once per date — and music is one of them, because
Saturdays in peak season are taken early. Push music to the end of the planning and the
decision stops being about fit and becomes about whatever is left over: in the budget and
in the calendar alike.

## Conclusion

The honest answer to the share question isn't a number, it's a distinction: items that
grow with the guest count, and items that don't. Music belongs to the second group and is
at the same time the item that shapes the arc of the entire evening. Couples who run the
priorities exercise before the first quotes arrive make the decision deliberately rather
than in sequence. How a wedding DJ's price is actually put together is covered in the
detailed article on wedding DJ costs; which services sit within which scope is shown on
the packages page, and a no-obligation enquiry settles the rest for your own date.
`.trim();

export const hochzeitsbudgetMusikAnteilEs = `
## Por qué no funciona una regla de porcentaje fijo

La pregunta por el presupuesto de la música casi siempre se plantea como una pregunta de
porcentaje: una porción fija del total que pueda aplicarse a cualquier boda. Eso es justo lo
que no funciona, y el motivo no está en la música, sino en cómo se construye el propio
presupuesto. Las grandes partidas de una boda se comportan de manera completamente distinta
cuando la boda cambia. Una vez entendido ese mecanismo, no hace falta ninguna regla general:
la decisión puede tomarse a partir de la propia celebración.

## Costes fijos y costes que crecen con los invitados

La línea divisoria más importante de un presupuesto de boda no separa lo importante de lo
secundario. Separa las partidas que crecen con cada invitado adicional de las que se mantienen
prácticamente iguales.

| Partida | Comportamiento al aumentar los invitados |
|---|---|
| Catering y bebidas | crece casi directamente con cada cubierto |
| Lugar y mobiliario | crece por escalones, según el tamaño de sala necesario |
| Papelería, detalles para invitados, decoración de mesa | crece por persona |
| Fotografía | se mantiene en gran medida igual; un día más largo cuesta más, una lista de invitados más larga no |
| Música y técnica | se mantiene en gran medida igual; solo crece por escalones, a través del equipo de sonido |

Esa es la verdadera respuesta a la pregunta del porcentaje. Una celebración con ochenta
invitados y la misma celebración con doscientos se diferencian considerablemente en el
catering. En el lado del DJ cambia mucho menos: la misma preparación, el mismo desplazamiento,
el mismo tiempo de actuación, un equipo de una talla más y quizá una segunda zona de sonido.
Por tanto, la parte que la música ocupa del total baja casi automáticamente a medida que crece
la boda, sin que nadie lo haya decidido. Una regla de porcentaje que encaja en la celebración
pequeña ya es errónea para la grande, y viceversa.

## Qué compra realmente el presupuesto de la música

Más útil que un porcentaje es preguntarse qué hay concretamente dentro del presupuesto de la
música. Básicamente son cuatro cosas:

- **Tiempo de actuación.** Un set de noche es un encargo distinto de un acompañamiento continuo
  desde el aperitivo, pasando por la cena, hasta la madrugada. La diferencia no es de calidad,
  sino de horas.
- **Alcance técnico.** Sonido adaptado a la sala y al número de invitados, iluminación, zonas
  adicionales, micrófonos para los discursos. Es la única partida que crece realmente con los
  invitados, y lo hace por escalones, no de forma continua.
- **Elementos en directo.** Si se toca algo en directo además del set del DJ, si se suma una
  formación en directo, si hace falta presentación y en qué idiomas.
- **Número de proveedores.** Si la música, la técnica y la presentación vienen de una sola
  fuente o se reparten entre varios proveedores que hay que contratar, coordinar e informar por
  separado.

Este último punto se pasa por alto con regularidad al comparar. Dos presupuestos que sobre el
papel parecen idénticos pueden incluir en un caso una sola persona de contacto y en el otro
tres: tres contratos, tres desplazamientos y tres hilos de coordinación que alguien tiene que
llevar.

## Por qué recortar aquí es el recorte más caro

En los foros de bodas aparece una preocupación con llamativa frecuencia, y nunca tiene que ver
con la comida: que la pista de baile se quede vacía. No es una afirmación de marketing, sino una
observación sobre lo que las parejas temen antes y lo que recuerdan después. Detrás hay un
motivo estructural.

Casi todas las partidas de un presupuesto de boda afectan solo a una parte acotada del día: el
vestido a la llegada y en las fotos, el catering en la cena, la decoración en la sala. La
música, en cambio, recorre todo el horario y además da forma a su curva: cuándo hay calma,
cuándo cambia el ambiente, cuándo llega el punto álgido de la noche y cómo termina. Es la única
partida que no solo aporta a un momento, sino que ordena los momentos.

A eso se suma un segundo punto. Una partida más floja suele poder compensarse en otro sitio.
Una noche en la que nadie baila no se compensa: ya ha pasado.

## Un ejercicio de prioridades de diez minutos

En lugar de buscar un porcentaje, la decisión puede tomarse directamente. El ejercicio funciona
mejor en pareja, con una hoja de papel:

1. **Escriban por separado** qué tres cosas quieren recordar de esta boda dentro de cinco años.
   No las tres partidas más caras, sino los tres recuerdos.
2. **Comparen las listas.** Las coincidencias son las verdaderas prioridades compartidas; las
   diferencias son la conversación que de verdad hay que tener.
3. **Asignen a cada prioridad la partida que la produce.** «Todo el mundo bailó» depende de la
   música y del programa; «quedó precioso», de la fotografía y la decoración.
4. **Nombren dos partidas que nadie haya anotado.** Ahí está el margen: el presupuesto para sus
   prioridades sale de allí, y casi siempre de partidas que crecen por persona.
5. **Solo entonces pidan presupuestos**, y en el orden de sus prioridades. Preguntar primero por
   lo más importante permite conocer el alcance real antes de que el resto ya esté comprometido.

El valor del ejercicio no está en el resultado, sino en el orden: primero las prioridades,
después los números. Si se hace al revés, el presupuesto se reparte en el orden en que van
llegando los presupuestos.

## Cuándo un presupuesto de música más pequeño está realmente bien

Hay celebraciones en las que un presupuesto de música mayor sencillamente no aporta nada, y
sería deshonesto omitirlo:

- **La noche termina pronto.** Si la celebración concluye tras la cena, un programa de noche
  completo no tiene sentido.
- **Deliberadamente no habrá baile.** Algunas parejas planifican un aperitivo, una comida larga
  y conversación. Eso requiere un sonido de fondo limpio y micrófonos que funcionen para los
  discursos, y nada más.
- **Pocos invitados en una sala agradecida.** Donde la acústica es sencilla y hay que llegar con
  el sonido a pocos invitados, la exigencia técnica es realmente menor.
- **El lugar dispone de un sistema instalado.** Entonces desaparece parte del alcance técnico,
  siempre que alguien compruebe de antemano si el sistema existente está realmente a la altura
  de la noche prevista.

En todos estos casos, el alcance menor no es un ahorro, sino la contratación correcta. La
diferencia entre contratar menos y recortar en el lugar equivocado está en si el alcance encaja
con la noche que se ha planificado, o si después hay que recortar la noche para que quepa en un
alcance demasiado escaso.

## Cuándo conviene fijar el presupuesto de la música

En la práctica, el orden importa casi más que la cantidad. El lugar y el número de invitados
suelen fijarse primero, porque ambos condicionan todo lo demás. Después compensa contratar las
partidas que solo están disponibles una vez por fecha, y la música es una de ellas, porque los
sábados de temporada alta se ocupan pronto. Si la música se deja para el final de la
planificación, la decisión deja de tratarse de lo que encaja y pasa a tratarse de lo que queda:
tanto en el presupuesto como en el calendario.

## Conclusión

La respuesta sincera a la pregunta del porcentaje no es un número, sino una distinción: partidas
que crecen con el número de invitados y partidas que no. La música pertenece al segundo grupo
y es, a la vez, la partida que da forma al arco de toda la noche. Las parejas que hacen el
ejercicio de prioridades antes de que lleguen los primeros presupuestos toman la decisión de
forma deliberada y no por orden de llegada. Cómo se compone realmente el precio de un DJ de
bodas se explica en el artículo detallado sobre su coste; qué servicios incluye cada alcance se
muestra en la página de paquetes, y una consulta sin compromiso resuelve el resto para su
propia fecha.
`.trim();

export const hochzeitsbudgetMusikAnteilFr = `
## Pourquoi une règle de pourcentage fixe ne fonctionne pas

La question du budget musique est presque toujours posée comme une question de pourcentage : une
part fixe du total que l'on pourrait appliquer à n'importe quel mariage. C'est précisément ce qui ne
fonctionne pas, et la raison ne tient pas à la musique, mais à la façon dont le budget lui-même est
construit. Les grands postes d'un mariage se comportent de manière complètement différente quand le
mariage change. Une fois ce mécanisme compris, aucune règle empirique n'est nécessaire : la décision
peut se prendre à partir de sa propre fête.

## Coûts fixes et coûts qui augmentent avec les invités

La ligne de partage la plus importante d'un budget de mariage ne sépare pas l'important du
secondaire. Elle sépare les postes qui augmentent avec chaque invité supplémentaire de ceux qui
restent en grande partie identiques.

| Poste | Comportement quand le nombre d'invités augmente |
|---|---|
| Traiteur et boissons | augmente presque directement à chaque couvert |
| Lieu et mobilier | augmente par paliers, selon la taille de salle nécessaire |
| Papeterie, cadeaux d'invités, décoration de table | augmente par personne |
| Photographie | reste en grande partie identique ; une journée plus longue coûte plus cher, une liste d'invités plus longue non |
| Musique et technique | reste en grande partie identique ; n'augmente que par paliers, via la sonorisation |

C'est la vraie réponse à la question du pourcentage. Une fête de quatre-vingts invités et la même fête
avec deux cents invités diffèrent considérablement sur le traiteur. Côté DJ, beaucoup moins de choses
changent : la même préparation, le même déplacement, le même temps de jeu, une sono d'une taille
au-dessus, éventuellement une deuxième zone de son. La part de la musique dans le total baisse donc
presque automatiquement à mesure que le mariage grandit, sans que personne n'ait pris de décision.
Une règle de pourcentage adaptée à la petite fête est déjà fausse pour la grande, et inversement.

## Ce que le budget musique achète réellement

Plus utile qu'un pourcentage est la question de ce que contient concrètement le budget musique. Il
s'agit essentiellement de quatre choses :

- **Le temps de jeu.** Un set de soirée est une mission différente d'un accompagnement continu du vin
  d'honneur au dîner puis jusque dans la nuit. La différence n'est pas de qualité, mais d'heures.
- **L'ampleur technique.** Une sonorisation adaptée à la salle et au nombre d'invités, l'éclairage,
  des zones supplémentaires, des micros pour les discours. C'est le seul poste qui augmente vraiment
  avec le nombre d'invités, et il le fait par paliers plutôt que de façon continue.
- **Les éléments live.** S'il y a du live en plus du set du DJ, si une formation live se joint à la
  soirée, si une animation est nécessaire, et dans quelles langues.
- **Le nombre de prestataires.** Si la musique, la technique et l'animation proviennent d'une seule
  source, ou sont réparties entre plusieurs prestataires qu'il faut réserver, coordonner et briefer
  séparément.

Ce dernier point est régulièrement oublié dans les comparaisons. Deux budgets qui semblent identiques
sur le papier peuvent comprendre dans un cas un seul interlocuteur et dans l'autre trois : trois
contrats, trois déplacements et trois fils de coordination que quelqu'un doit gérer.

## Pourquoi économiser ici est l'économie la plus coûteuse

Une inquiétude revient avec une fréquence frappante sur les forums de mariage, et elle ne concerne
jamais le repas : que la piste de danse reste vide. Ce n'est pas un argument marketing, mais une
observation sur ce que les couples redoutent avant et sur ce dont ils se souviennent après. Il y a
une raison structurelle derrière cela.

Presque tous les postes d'un budget de mariage ne concernent qu'une partie limitée de la journée : la
robe à l'arrivée et sur les photos, le traiteur au dîner, la décoration dans la salle. La musique, en
revanche, traverse tout le planning et en façonne aussi la courbe : quand tout reste calme, quand
l'ambiance bascule, quand la soirée atteint son sommet et comment elle se termine. C'est le seul poste
qui ne contribue pas seulement à un moment, mais qui organise l'ordre des moments.

À cela s'ajoute un second point. Un poste plus faible peut généralement être compensé ailleurs. Une
soirée où personne ne danse ne se compense pas : elle est passée.

## Un exercice de priorités de dix minutes

Plutôt que de chercher un pourcentage, la décision peut se prendre directement. L'exercice fonctionne
mieux à deux, avec une feuille de papier :

1. **Notez chacun de votre côté** les trois choses dont vous voulez vous souvenir de ce mariage dans
   cinq ans. Pas les trois postes les plus chers, mais les trois souvenirs.
2. **Comparez les listes.** Les recoupements sont les vraies priorités communes ; les différences
   sont la conversation qu'il faut réellement avoir.
3. **Attribuez à chaque priorité le poste qui la produit.** « Tout le monde a dansé » dépend de la
   musique et du programme ; « c'était magnifique », de la photographie et de la décoration.
4. **Nommez deux postes que personne n'a notés.** C'est là que se trouve la marge de manœuvre : le
   budget pour vos priorités vient de là, et presque toujours de postes qui augmentent par personne.
5. **Ce n'est qu'ensuite que vous demandez des devis**, et dans l'ordre de vos priorités. Commencer
   par ce qui compte le plus permet de connaître l'ampleur réelle avant que le reste ne soit déjà
   engagé.

La valeur de l'exercice ne tient pas au résultat, mais à l'ordre : d'abord les priorités, ensuite les
chiffres. Si l'on procède à l'inverse, le budget se répartit dans l'ordre d'arrivée des devis.

## Quand un budget musique plus modeste convient vraiment

Il existe des fêtes pour lesquelles un budget musique plus important n'apporte tout simplement rien,
et il serait malhonnête de le passer sous silence :

- **La soirée se termine tôt.** Si la fête s'achève après le dîner, un programme de soirée complet
  n'a aucun intérêt.
- **On ne dansera délibérément pas.** Certains couples prévoient un vin d'honneur, un long repas et
  de la conversation. Cela demande un son de fond propre et des micros fonctionnels pour les
  discours, rien de plus.
- **Peu d'invités dans une salle accommodante.** Là où l'acoustique est simple et où il faut atteindre
  peu d'invités, l'exigence technique est réellement plus faible.
- **Le lieu dispose d'un système installé.** Une partie de l'ampleur technique disparaît alors, à
  condition que quelqu'un vérifie à l'avance si le système existant est vraiment à la hauteur de la
  soirée prévue.

Dans tous ces cas, la prestation plus modeste n'est pas une économie, mais la bonne réservation. La
différence entre réserver plus petit et économiser au mauvais endroit tient à la question de savoir
si la prestation correspond à la soirée prévue, ou si la soirée doit être rabotée après coup pour
tenir dans une prestation trop mince.

## Quand fixer le budget musique

En pratique, l'ordre compte presque plus que le montant. Le lieu et le nombre d'invités sont
généralement fixés en premier, car ils conditionnent tout le reste. Ensuite, il vaut la peine de
réserver les postes qui ne sont disponibles qu'une fois par date, et la musique en fait partie, car
les samedis de haute saison sont pris tôt. Si l'on repousse la musique à la fin de la préparation,
la décision ne porte plus sur ce qui convient, mais sur ce qui reste : dans le budget comme dans le
calendrier.

## Conclusion

La réponse honnête à la question du pourcentage n'est pas un chiffre, mais une distinction : les
postes qui augmentent avec le nombre d'invités, et ceux qui n'augmentent pas. La musique appartient au
second groupe et elle est en même temps le poste qui façonne l'arc de toute la soirée. Les couples
qui font l'exercice des priorités avant l'arrivée des premiers devis prennent la décision
délibérément plutôt que dans l'ordre d'arrivée. La composition réelle du prix d'un DJ de mariage est
expliquée dans l'article détaillé sur le coût d'un DJ de mariage ; les prestations comprises dans
chaque formule figurent sur la page des formules, et une demande sans engagement règle le reste pour
votre propre date.
`.trim();

export const hochzeitsbudgetMusikAnteilPost: BlogPost = {
  id: 'hochzeitsbudget-musik-anteil',
  slug: 'hochzeitsbudget-musik-anteil',
  category: 'kosten',
  type: 'guide',
  status: 'published',
  publishedAt: '2026-08-23',
  updatedAt: '2026-08-23',
  tags: ['budget', 'kosten', 'planung', 'prioritaeten'],
  readingTimeMinutes: 5,
  links: ['/pakete', '/anfrage'],
  relatedAnswers: ['cost-drivers', 'package-inclusions', 'weekday-discount'],
  relatedPosts: ['was-kostet-ein-hochzeits-dj', 'dj-live-band-oder-beides'],
  translations: {
    de: {
      title: 'Wie viel vom Hochzeitsbudget für die Musik einplanen?',
      excerpt:
        'Auf die Anteilsfrage gibt es keine sinnvolle Faustregel, weil sich die Posten einer Hochzeit unterschiedlich verhalten: Catering wächst mit jedem Gast, Musik und Technik bleiben weitgehend gleich. Dieser Artikel erklärt die Mechanik dahinter, zeigt eine Prioritätenübung für zehn Minuten und sagt auch, wann ein kleineres Musikbudget völlig ausreicht.',
      body: hochzeitsbudgetMusikDe,
      seo: {
        metaTitle: 'Hochzeitsbudget: wie viel für die Musik? | DJ Veys',
        metaDescription:
          'Wie viel vom Hochzeitsbudget sollte in die Musik fließen? Warum feste Anteilsregeln scheitern, was das Musikbudget kauft und eine Übung für Prioritäten.',
      },
    },
    tr: {
      slug: 'dugun-butcesinde-muzik-payi',
      title: 'Düğün bütçesinin ne kadarını müziğe ayırmalı?',
      excerpt:
        'Oran sorusunun anlamlı bir genel kuralı yok, çünkü bir düğünün kalemleri farklı davranır: yemek her davetliyle büyür, müzik ve teknik büyük ölçüde aynı kalır. Bu yazı arkasındaki mekanizmayı açıklıyor, on dakikalık bir öncelik alıştırması sunuyor ve daha küçük bir müzik bütçesinin ne zaman gerçekten yeterli olduğunu da söylüyor.',
      body: hochzeitsbudgetMusikTr,
      seo: {
        metaTitle: 'Düğün Bütçesinde Müzik Payı Ne Kadar? | DJ Veys',
        metaDescription:
          'Düğün bütçesinin ne kadarı müziğe ayrılmalı? Sabit oran kuralları neden işlemez, müzik bütçesi neyi satın alır ve öncelikler nasıl belirlenir.',
      },
    },
    en: {
      slug: 'wedding-budget-music-share',
      title: 'How much of the wedding budget should go to music?',
      excerpt:
        'There is no useful rule of thumb for the share question, because wedding line items behave differently: catering grows with every guest, music and technical setup stay largely the same. This article explains the mechanism, offers a ten-minute priorities exercise, and is honest about when a smaller music budget is genuinely fine.',
      body: hochzeitsbudgetMusikEn,
      seo: {
        metaTitle: 'Wedding Budget: How Much for Music? | DJ Veys',
        metaDescription:
          'How much of the wedding budget should go to music? Why fixed share rules fail, what the music budget actually buys, and a ten-minute priorities exercise.',
      },
    },
    es: {
      slug: 'presupuesto-boda-cuanto-para-la-musica',
      title: '¿Qué parte del presupuesto de la boda debería ir a la música?',
      excerpt:
        'No existe una regla general útil para la pregunta del porcentaje, porque las partidas de una boda se comportan de forma distinta: el catering crece con cada invitado, la música y la técnica se mantienen en gran medida iguales. Este artículo explica el mecanismo, propone un ejercicio de prioridades de diez minutos y es sincero sobre cuándo un presupuesto de música más pequeño está realmente bien.',
      body: hochzeitsbudgetMusikAnteilEs,
      seo: {
        metaTitle: 'Presupuesto de boda: ¿cuánto para la música? | DJ Veys',
        metaDescription:
          'Por qué no sirve un porcentaje fijo para la música de la boda: costes fijos frente a costes por invitado y un ejercicio de prioridades.',
      },
    },
    fr: {
      slug: 'budget-mariage-part-de-la-musique',
      title: 'Quelle part du budget du mariage consacrer à la musique ?',
      excerpt:
        'Il n\'existe pas de règle empirique utile pour la question du pourcentage, car les postes d\'un mariage se comportent différemment : le traiteur augmente avec chaque invité, la musique et la technique restent en grande partie identiques. Cet article explique le mécanisme, propose un exercice de priorités de dix minutes et dit honnêtement quand un budget musique plus modeste convient vraiment.',
      body: hochzeitsbudgetMusikAnteilFr,
      seo: {
        metaTitle: 'Budget mariage : quelle part pour la musique ? | DJ Veys',
        metaDescription:
          'Pourquoi un pourcentage fixe ne marche pas pour la musique du mariage : coûts fixes contre coûts par invité, et un exercice de priorités.',
      },
    },
  },
};
