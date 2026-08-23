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

## Tasarruf neden en pahalıya tam da burada mal olur

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
- **Az davetli, uysal bir salon.** Akustiğin sorunsuz olduğu ve az kişinin seslendirildiği
  yerde teknik ihtiyaç gerçekten daha düşüktür.
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
clear, no rule of thumb is needed — the decision can be made against your own celebration
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
  additional zones, microphones for speeches. This is the only position that genuinely
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

Almost every item in a wedding budget acts on a bounded part of the day: the dress on
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
   matters most means knowing the real frame before the rest is already committed.

The value of the exercise isn't the result, it's the sequence: priorities first, numbers
second. Done the other way round, the budget gets allocated in whatever order the quotes
happen to arrive.

## When a smaller music budget is genuinely fine

There are celebrations where a larger music budget simply adds nothing, and it would be
dishonest to leave that out:

- **The evening ends early.** If the celebration winds down after dinner, a full evening
  programme has no function.
- **There will deliberately be no dancing.** Some couples plan a reception, a long meal
  and conversation. That calls for clean background sound and working microphones for the
  speeches, and nothing beyond it.
- **A small guest count in a forgiving room.** Where the acoustics are uncomplicated and
  few guests need covering, the technical requirement really is lower.
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
  },
};
