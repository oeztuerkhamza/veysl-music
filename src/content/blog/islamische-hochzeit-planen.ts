import type { BlogPost } from './types';

/**
 * Primary keyword (DE): "islamische hochzeit planen" / "islamische hochzeit mit dj".
 *
 * Der erste Artikel der Kategorie `islamische-hochzeit` und der einzige Text im
 * gesamten Ratgeber, der den religiösen Teil einer Feier überhaupt behandelt —
 * bis hierher kamen „Dua", „İlahi" und „Tilawet" im Blog kein einziges Mal vor.
 *
 * Abgrenzung zur Landingpage `/islamische-hochzeit` (siehe
 * `src/content/islamic.ts`): Die Seite verkauft das Angebot und zeigt einen
 * Beispielablauf. Dieser Artikel beantwortet die Planungsfragen davor — wer was
 * organisiert, welche Reihenfolge sich bewährt hat, welche Fehler wiederkehren.
 * Kein Absatz wiederholt die Seite; beide verlinken aufeinander.
 *
 * Faktenlage wie überall: Was DJ Veys selbst leistet, steht in
 * `.claude/BRAND-FACTS.md` (Abschnitt „Religiös geprägte Hochzeiten", vom
 * Kunden am 2026-07-30 bestätigt, Tilawet-Rezitation am 2026-07-31). Alles
 * darüber hinaus ist allgemeine Planungspraxis und als solche formuliert —
 * dieser Artikel erteilt ausdrücklich keine religiöse Auskunft.
 */
export const islamischeHochzeitDe = `
## Zwei Feiern an einem Abend — und warum das der Kern der Planung ist

Eine islamisch geprägte Hochzeit stellt Paare vor eine Aufgabe, die eine rein
standesamtliche Feier nicht kennt: Zwei sehr unterschiedliche Stimmungen sollen an einem
Abend nebeneinander bestehen. Der religiöse Teil verlangt Ruhe, Aufmerksamkeit und
Verständlichkeit. Die Feier danach verlangt Energie, Lautstärke und eine volle Tanzfläche.
Beides ist selbstverständlich vereinbar — aber nicht zufällig. Es ist eine Frage des
Ablaufplans.

Der häufigste Planungsfehler ist deshalb kein musikalischer, sondern ein
organisatorischer: Der religiöse Teil und die Feier werden getrennt gedacht, oft sogar
getrennt gebucht, und niemand ist ausdrücklich für den Übergang zuständig. Genau dort
kippt der Abend — die Musik bricht mitten im Stück ab, die Gäste wissen nicht, ob sie
sitzen bleiben sollen, und nach der Dua steht der Saal still, weil niemand ihn wieder in
Bewegung bringt.

## Wer macht was: die Rollen früh klären

Bevor über Uhrzeiten gesprochen wird, lohnt sich eine nüchterne Liste, wer welchen Teil
übernimmt:

| Aufgabe | Typische Zuständigkeit | Was früh geklärt sein sollte |
|---|---|---|
| Kur'an-Rezitation | Ein Hoca, ein Familienmitglied — oder der DJ/Moderator selbst, wenn er rezitiert | Wer genau, und wie lange |
| Dua | Meist dieselbe Person wie die Rezitation | Zeitpunkt im Ablauf, nicht nur „irgendwann vor dem Essen" |
| İlahi | Live vorgetragen oder abgespielt | Live oder Playback, mit oder ohne Saz-Begleitung |
| Ansage und Übergänge | Moderation | In welchen Sprachen, und wer den Saal wieder in Bewegung bringt |
| Technik für den religiösen Teil | Ton- und Lichttechnik | Eigenes Mikrofon, Pegel, keine Effekte |

Die vierte Zeile wird am häufigsten übersehen und entscheidet am meisten. Eine Rezitation
ohne vorherige, für alle verständliche Ansage trifft einen Teil der Gäste unvorbereitet —
und ein Saal, in dem die Hälfte noch am Buffet steht, wird dem Moment nicht gerecht.

## Die Reihenfolge, die sich in der Praxis bewährt hat

Es gibt keine verbindliche Reihenfolge, und Familien handhaben das unterschiedlich. Was
sich in der Praxis aber immer wieder als tragfähig erweist: der religiöse Teil **früh am
Abend**, vor dem Essen, nicht zwischen zwei Tanzrunden.

Dafür sprechen drei praktische Gründe. Erstens sind die Gäste vollzählig und noch
aufnahmefähig. Zweitens ist die Lautstärke des Abends zu diesem Zeitpunkt ohnehin niedrig,
der Übergang also klein. Drittens — und das ist der wichtigste Punkt — muss die Energie
danach nur noch steigen. Wer den religiösen Teil mitten in eine laufende Tanzrunde legt,
bricht sie ab und muss die Stimmung anschließend ein zweites Mal aufbauen.

## Technik: der Unterschied zwischen gehört und verstanden

Für den religiösen Teil gelten andere technische Regeln als für den Rest des Abends, und
sie sind unspektakulär, aber nicht verhandelbar:

- **Ein eigenes Mikrofon**, sauber eingepegelt, nicht das Handmikrofon vom Moderator, das
  gerade zur Hand ist.
- **Kein Hall, keine Effekte.** Was auf einer Stimme im Tanzset gut klingt, macht eine
  Rezitation schwerer verständlich.
- **Deutlich niedrigerer Pegel** als das Tanzset — Ziel ist Verständlichkeit im ganzen
  Saal, nicht Lautstärke.
- **Der Pegel wird beim Soundcheck eingestellt**, nicht im Moment selbst. Wer während der
  Rezitation an Reglern dreht, ist zu spät dran.

## Musik: was vorher, was danach

Die Musik vor dem religiösen Teil sollte leise, instrumental und unaufdringlich sein —
sie wird ausgeblendet, nicht abgebrochen. Ein sauberes Fade über einige Sekunden ist der
Unterschied zwischen einem Übergang und einem Abbruch.

Nach der Dua funktioniert ein Zwischenschritt besser als der Sprung direkt in die
Tanzmusik. İlahi — live vorgetragen, auf Wunsch mit Saz — ist genau dieser Zwischenschritt:
noch nicht Party, nicht mehr Andacht. Wer diesen Block überspringt, verlangt vom Saal einen
Stimmungswechsel in einer einzigen Sekunde, und der gelingt selten.

Türk Sanat Müziği eignet sich aus demselben Grund gut für die Essensphase: ruhig genug für
Gespräche, aber nicht beliebig.

## Alkoholfrei feiern — eine Frage, die keine ist

Viele Paare fragen, ob eine alkoholfreie Feier „schwerer in Stimmung zu bringen" sei. Die
Erfahrung aus dem deutsch-türkischen Umfeld, wo das der Normalfall ist, sagt eindeutig
nein. Die Tanzfläche lebt vom Repertoire, vom Timing und von der Moderation — nicht von
der Bar. Wer das Gegenteil behauptet, hat meist ein Repertoire-Problem und kein
Getränke-Problem.

## Mehrsprachigkeit: der Punkt, an dem Stimmung entsteht oder verloren geht

Bei einer Gästeliste aus zwei Sprachwelten entscheidet die Moderation mit darüber, ob sich
alle angesprochen fühlen. Wichtig ist weniger, dass jeder Satz doppelt gesagt wird, als
dass **beide Gruppen wissen, was gerade passiert** — besonders vor dem religiösen Teil.
Eine Ansage, die eine ganze Gästegruppe faktisch ausschließt, kostet spürbar Stimmung,
unabhängig davon, wie gut die Musik ist.

## Die fünf Fehler, die sich wiederholen

1. **Kein fester Zeitpunkt für Rezitation und Dua** — nur ein vages „vor dem Essen".
2. **Zwei getrennte Dienstleister ohne gemeinsamen Ablaufplan**, jeder mit eigener
   Vorstellung vom Timing.
3. **Musik wird abgebrochen statt ausgeblendet**, was den Übergang hart und unabsichtlich
   respektlos wirken lässt.
4. **Kein Zwischenschritt zwischen Dua und Tanzfläche**, sodass der Saal im Stillstand
   verharrt.
5. **Der Pegel für die Rezitation wird erst im Moment gesucht**, statt beim Soundcheck
   festgelegt zu werden.

## Was das für die Auswahl des Dienstleisters heißt

Die entscheidende Frage an einen Anbieter lautet nicht „spielst du auch türkische Musik",
sondern: **Wer übernimmt den Übergang?** Kommen Rezitation, Dua, İlahi, Moderation und
DJ-Set aus einer Hand, entfällt die Abstimmung zwischen mehreren Zeitplänen — und damit
die häufigste Fehlerquelle des Abends.

Bei DJ Veys liegen diese Bausteine tatsächlich bei einer Person: Die Kur'an-Rezitation
trägt Veysel Durmuş selbst vor, İlahi wird live gespielt, moderiert wird auf Deutsch,
Türkisch und Englisch, und dieselbe Person übernimmt danach das DJ-Set. Ein ausführlicher
Beispielablauf mit Uhrzeiten steht auf der Seite zur islamischen Hochzeit.

## Fazit

Eine islamisch geprägte Hochzeit ist kein Sonderfall, der besondere Kompromisse verlangt —
sie ist ein Abend mit zwei Teilen, der einen durchdachten Ablaufplan braucht statt zweier
getrennter Buchungen. Wer den religiösen Teil früh setzt, die Technik dafür vorbereitet und
den Übergang bewusst gestaltet, bekommt beides in voller Qualität: einen würdigen Rahmen und
eine volle Tanzfläche.
`.trim();

export const islamischeHochzeitTr = `
## Bir akşamda iki tören — ve planlamanın asıl meselesi

İslami bir düğün, çiftlerin önüne yalnızca resmî nikâhla yapılan bir kutlamada
karşılaşmadıkları bir görev koyar: Birbirinden çok farklı iki atmosferin aynı akşam yan
yana durması gerekir. Dinî bölüm sükûnet, dikkat ve anlaşılırlık ister. Sonrasındaki
kutlama ise enerji, ses ve dolu bir pist. İkisi elbette bir arada olur — ama kendiliğinden
değil. Bu bir akış planı meselesidir.

Bu yüzden en sık yapılan hata müzikle ilgili değil, organizasyonla ilgilidir: Dinî bölüm ve
kutlama ayrı düşünülür, çoğu zaman ayrı ayrı rezerve edilir ve geçişten kimse açıkça
sorumlu olmaz. Akşam tam orada bozulur — müzik şarkının ortasında kesilir, misafirler
oturup oturmayacaklarını bilmez ve duadan sonra salon donup kalır, çünkü kimse onu yeniden
harekete geçirmez.

## Kim ne yapıyor: rolleri erken netleştirin

Saatler konuşulmadan önce, hangi bölümü kimin üstlendiğine dair sade bir liste işe yarar:

| Görev | Genellikle kim yapar | Erkenden netleşmesi gereken |
|---|---|---|
| Kur'an tilaveti | Bir hoca, aileden biri — ya da okuyorsa DJ/sunucunun kendisi | Tam olarak kim ve ne kadar sürecek |
| Dua | Genellikle tilaveti okuyan kişi | Akıştaki yeri; "yemekten önce bir ara" değil |
| İlahi | Canlı icra ya da kayıttan | Canlı mı playback mi, saz eşliğinde mi |
| Anons ve geçişler | Sunum | Hangi dillerde ve salonu yeniden kim hareketlendirecek |
| Dinî bölümün tekniği | Ses ve ışık | Ayrı mikrofon, seviye, efekt yok |

Dördüncü satır en çok atlanan ve en çok belirleyici olandır. Öncesinde herkesin anlayacağı
bir anons yapılmadan başlayan bir tilavet, misafirlerin bir kısmını hazırlıksız yakalar —
ve yarısı hâlâ açık büfede duran bir salon o ana hakkını vermez.

## Pratikte kendini kanıtlamış sıralama

Bağlayıcı bir sıralama yok; aileler farklı uyguluyor. Ancak pratikte tekrar tekrar sağlam
çıkan şu: dinî bölüm **akşamın erken saatinde**, yemekten önce, iki dans turunun arasında
değil.

Bunun üç pratik gerekçesi var. Birincisi, misafirler tam kadro ve hâlâ dikkatli. İkincisi,
o saatte akşamın ses seviyesi zaten düşük, yani geçiş küçük. Üçüncüsü — ve en önemlisi —
enerjinin sonrasında yalnızca yükselmesi gerekir. Dinî bölümü süren bir dans turunun ortasına
koyan kişi, o turu keser ve havayı ikinci kez baştan kurmak zorunda kalır.

## Teknik: duyulmak ile anlaşılmak arasındaki fark

Dinî bölüm için akşamın geri kalanından farklı teknik kurallar geçerlidir; gösterişsizdirler
ama pazarlığa açık değildirler:

- **Kendi ayrı mikrofonu**, düzgün seviyelendirilmiş; sunucunun elinin altındaki el
  mikrofonu değil.
- **Reverb yok, efekt yok.** Dans setinde bir ses üzerinde iyi duran şey, tilaveti
  anlaşılmaz kılar.
- **Dans setinden belirgin şekilde düşük seviye** — amaç ses yüksekliği değil, salonun her
  yerinde anlaşılırlık.
- **Seviye ses kontrolünde ayarlanır**, o an değil. Tilavet sırasında düğmelerle uğraşan
  kişi geç kalmıştır.

## Müzik: öncesinde ne, sonrasında ne

Dinî bölümden önceki müzik sessiz, enstrümantal ve öne çıkmayan cinsten olmalı — kesilmez,
kısılarak kapatılır. Birkaç saniyelik düzgün bir fade, geçiş ile kesinti arasındaki farktır.

Duadan sonra doğrudan dans müziğine atlamak yerine bir ara adım daha iyi işler. İlahi —
canlı, istenirse saz eşliğinde — tam olarak o ara adımdır: henüz kutlama değil, artık
ibadet de değil. Bu bölümü atlayan kişi salondan tek saniyede ruh hâli değiştirmesini ister
ki bu nadiren olur.

Türk Sanat Müziği de aynı nedenle yemek bölümüne çok uyar: sohbeti bölmeyecek kadar sakin,
ama sıradan değil.

## Alkolsüz kutlamak — aslında soru olmayan bir soru

Birçok çift alkolsüz bir düğünün "havaya sokmasının daha zor" olup olmadığını sorar. Bunun
olağan olduğu Alman-Türk çevresindeki tecrübe net biçimde hayır diyor. Pisti ayakta tutan
repertuvar, zamanlama ve sunumdur — bar değil. Aksini iddia edenin genellikle içecek
sorunu değil, repertuvar sorunu vardır.

## Çok dillilik: havanın kurulduğu ya da kaybedildiği nokta

İki dilli bir misafir listesinde, herkesin kendini muhatap hissedip hissetmediğine büyük
ölçüde sunum karar verir. Önemli olan her cümlenin iki kez söylenmesi değil, **iki grubun
da o an ne olduğunu bilmesidir** — özellikle dinî bölümden önce. Koca bir misafir grubunu
fiilen dışarıda bırakan bir anons, müzik ne kadar iyi olursa olsun havayı gözle görülür
şekilde düşürür.

## Tekrarlanan beş hata

1. **Tilavet ve dua için sabit bir saat olmaması** — sadece belirsiz bir "yemekten önce".
2. **Ortak akış planı olmayan iki ayrı hizmet sağlayıcı**, her biri kendi zamanlama
   anlayışıyla.
3. **Müziğin kısılmak yerine kesilmesi**; bu geçişi sert ve istemeden saygısız gösterir.
4. **Dua ile pist arasında ara adım olmaması**, salonun donup kalması.
5. **Tilavet için seviyenin ses kontrolünde değil, o anda aranması.**

## Bunun hizmet sağlayıcı seçimine etkisi

Bir sağlayıcıya sorulacak asıl soru "Türkçe müzik de çalıyor musun?" değil, şudur:
**Geçişi kim üstleniyor?** Tilavet, dua, ilahi, sunum ve DJ seti tek elden geliyorsa,
birden fazla zaman planını uyumlamak ortadan kalkar — akşamın en sık hata kaynağı da
onunla birlikte.

DJ Veys'te bu bileşenler gerçekten tek kişide: Kur'an tilavetini Veysel Durmuş kendisi
okur, ilahi canlı icra edilir, sunum Almanca, Türkçe ve İngilizce yapılır ve DJ setini de
aynı kişi devralır. Saatleriyle birlikte ayrıntılı bir örnek akış, İslami düğün sayfasında
yer alıyor.

## Sonuç

İslami bir düğün, özel tavizler gerektiren istisnai bir durum değildir — iki bölümü olan ve
iki ayrı rezervasyon yerine düşünülmüş tek bir akış planı isteyen bir akşamdır. Dinî bölümü
erkene alan, tekniğini önceden hazırlayan ve geçişi bilinçli kuran çift ikisini de tam
kalitesinde alır: hem hakkı verilmiş bir çerçeve hem de dolu bir pist.
`.trim();

export const islamischeHochzeitEn = `
## Two celebrations in one evening — and why that is the heart of the planning

An Islamic wedding puts a task in front of couples that a purely civil celebration never
raises: two very different moods have to coexist in a single evening. The religious part
calls for quiet, attention and intelligibility. The celebration afterwards calls for
energy, volume and a full dance floor. The two are entirely compatible — but not by
accident. It is a question of the running order.

The most common planning mistake is therefore not a musical one but an organisational one:
the religious part and the party are thought of separately, often even booked separately,
and nobody is explicitly responsible for the transition. That is exactly where the evening
tips over — the music cuts off mid-track, guests do not know whether to stay seated, and
after the dua the room simply stalls because nobody moves it on.

## Who does what: settle the roles early

Before anyone talks about clock times, a plain list of who takes which part is worth more:

| Task | Usually handled by | What to settle early |
|---|---|---|
| Quran recitation | A hoca, a family member — or the DJ/host himself, if he recites | Exactly who, and for how long |
| Dua | Usually the same person as the recitation | Its slot in the running order, not a vague "before dinner" |
| Ilahi | Performed live or played back | Live or playback, with or without saz |
| Announcements and transitions | Hosting | In which languages, and who gets the room moving again |
| Sound for the religious part | Audio and lighting | Own microphone, level, no effects |

The fourth row is the one most often overlooked and the one that decides the most. A
recitation with no prior announcement everyone can follow catches part of the guests
unprepared — and a room where half the party is still at the buffet does not do the moment
justice.

## The order that holds up in practice

There is no binding sequence, and families handle it differently. What does prove reliable
again and again in practice: the religious part **early in the evening**, before dinner,
not between two rounds of dancing.

Three practical reasons support that. First, the guests are all present and still
receptive. Second, the volume of the evening is low at that point anyway, so the transition
is a small one. Third — and this matters most — the energy after it only has to rise.
Placing the religious part in the middle of a running dance set breaks that set, and the
mood then has to be built a second time.

## Sound: the difference between heard and understood

Different technical rules apply to the religious part than to the rest of the evening.
They are unspectacular, but they are not negotiable:

- **Its own microphone**, properly levelled — not whichever handheld the host happens to
  be holding.
- **No reverb, no effects.** What flatters a voice in the dance set makes a recitation
  harder to follow.
- **A markedly lower level** than the dance set — the goal is intelligibility everywhere
  in the room, not volume.
- **The level is set at the soundcheck**, not in the moment. Anyone reaching for a fader
  during the recitation is already too late.

## Music: what comes before, what comes after

The music before the religious part should be quiet, instrumental and unobtrusive — and it
is faded out, not cut. A clean fade over a few seconds is the difference between a
transition and an interruption.

After the dua, an intermediate step works better than jumping straight into dance music.
Ilahi — performed live, with saz on request — is exactly that step: not yet a party, no
longer a devotion. Skip that block and you are asking the room to change mood in a single
second, which rarely works.

Türk Sanat Müziği suits the dinner phase for the same reason: calm enough for conversation,
but never arbitrary.

## Celebrating without alcohol — a question that is not one

Many couples ask whether an alcohol-free celebration is "harder to get going". The
experience from the German-Turkish scene, where it is the norm, says clearly no. The dance
floor lives off the repertoire, the timing and the hosting — not off the bar. Anyone
claiming otherwise usually has a repertoire problem, not a drinks problem.

## Multilingual hosting: where the mood is made or lost

With a guest list spanning two language worlds, the hosting decides in large part whether
everyone feels addressed. What matters is less that every sentence is said twice than that
**both groups know what is happening right now** — especially before the religious part. An
announcement that effectively excludes a whole group of guests costs noticeable atmosphere,
however good the music is.

## The five mistakes that keep recurring

1. **No fixed time for recitation and dua** — only a vague "before dinner".
2. **Two separate suppliers with no shared running order**, each with their own idea of
   timing.
3. **Music cut rather than faded**, which makes the transition feel abrupt and unintentionally
   disrespectful.
4. **No intermediate step between dua and dance floor**, leaving the room at a standstill.
5. **The level for the recitation searched for in the moment** instead of set at the
   soundcheck.

## What this means for choosing a supplier

The decisive question to ask a provider is not "do you play Turkish music too", but:
**who owns the transition?** If recitation, dua, ilahi, hosting and the DJ set come from
one source, coordinating several timetables disappears — and with it the most common
source of error in the evening.

At DJ Veys these building blocks genuinely sit with one person: Veysel Durmuş performs the
Quran recitation himself, ilahi is played live, hosting runs in German, Turkish and English,
and the same person takes over the DJ set afterwards. A detailed example running order with
clock times is on the Islamic wedding page.

## Conclusion

An Islamic wedding is not a special case demanding particular compromises — it is an
evening with two parts that needs one considered running order rather than two separate
bookings. Set the religious part early, prepare the sound for it, and shape the transition
deliberately, and you get both at full quality: a dignified frame and a full dance floor.
`.trim();

export const islamischeHochzeitNl = `
## Twee vieringen op één avond — en waarom dat de kern van de planning is

Een islamitische bruiloft stelt paren voor een opgave die een puur burgerlijke viering niet
kent: twee heel verschillende sferen moeten op één avond naast elkaar bestaan. Het
religieuze deel vraagt rust, aandacht en verstaanbaarheid. Het feest daarna vraagt energie,
volume en een volle dansvloer. Die twee gaan uitstekend samen — maar niet vanzelf. Het is
een kwestie van het draaiboek.

De meest gemaakte planningsfout is dan ook geen muzikale, maar een organisatorische: het
religieuze deel en het feest worden los van elkaar bedacht, vaak zelfs los geboekt, en
niemand is uitdrukkelijk verantwoordelijk voor de overgang. Precies daar kantelt de avond —
de muziek wordt middenin afgekapt, gasten weten niet of ze moeten blijven zitten, en na de
dua valt de zaal stil omdat niemand hem weer op gang brengt.

## Wie doet wat: leg de rollen vroeg vast

Voordat er over tijden wordt gesproken, levert een nuchtere lijst van wie welk deel doet
meer op:

| Taak | Meestal bij wie | Wat vroeg vast moet staan |
|---|---|---|
| Koranrecitatie | Een hoca, een familielid — of de dj/presentator zelf, als die reciteert | Precies wie, en hoe lang |
| Dua | Meestal dezelfde persoon als de recitatie | Het tijdstip in het draaiboek, niet een vaag "voor het eten" |
| Ilahi | Live gebracht of afgespeeld | Live of playback, met of zonder saz |
| Aankondigingen en overgangen | Presentatie | In welke talen, en wie de zaal weer in beweging brengt |
| Techniek voor het religieuze deel | Geluid en licht | Eigen microfoon, niveau, geen effecten |

De vierde regel wordt het vaakst over het hoofd gezien en is het meest bepalend. Een
recitatie zonder voorafgaande, voor iedereen begrijpelijke aankondiging overvalt een deel
van de gasten — en een zaal waarvan de helft nog bij het buffet staat, doet het moment geen
recht.

## De volgorde die zich in de praktijk bewijst

Er is geen bindende volgorde en families doen het verschillend. Wat in de praktijk telkens
weer houdbaar blijkt: het religieuze deel **vroeg op de avond**, vóór het eten, niet tussen
twee dansrondes door.

Daar pleiten drie praktische redenen voor. Ten eerste zijn de gasten voltallig en nog
ontvankelijk. Ten tweede is het volume van de avond op dat moment toch al laag, dus de
overgang is klein. Ten derde — en dat weegt het zwaarst — hoeft de energie daarna alleen nog
maar te stijgen. Wie het religieuze deel midden in een lopende dansronde plaatst, breekt die
af en moet de sfeer daarna een tweede keer opbouwen.

## Techniek: het verschil tussen gehoord en begrepen

Voor het religieuze deel gelden andere technische regels dan voor de rest van de avond. Ze
zijn weinig spectaculair, maar niet onderhandelbaar:

- **Een eigen microfoon**, netjes uitgestuurd — niet de handmicrofoon die de presentator
  toevallig vasthoudt.
- **Geen galm, geen effecten.** Wat een stem in de dansset goed doet klinken, maakt een
  recitatie moeilijker te volgen.
- **Een duidelijk lager niveau** dan de dansset — het doel is verstaanbaarheid in de hele
  zaal, niet volume.
- **Het niveau wordt bij de soundcheck ingesteld**, niet op het moment zelf. Wie tijdens de
  recitatie naar een fader grijpt, is te laat.

## Muziek: wat ervoor, wat erna

De muziek vóór het religieuze deel hoort zacht, instrumentaal en onopvallend te zijn — en
wordt uitgefadet, niet afgekapt. Een nette fade van een paar seconden is het verschil tussen
een overgang en een onderbreking.

Na de dua werkt een tussenstap beter dan een sprong recht in de dansmuziek. Ilahi — live
gebracht, desgewenst met saz — is precies die tussenstap: nog geen feest, geen gebed meer.
Wie dat blok overslaat, vraagt de zaal in één seconde van stemming te wisselen, en dat lukt
zelden.

Türk Sanat Müziği past om dezelfde reden goed bij het dinergedeelte: rustig genoeg om te
praten, maar nooit willekeurig.

## Alcoholvrij vieren — een vraag die er geen is

Veel paren vragen of een alcoholvrije viering "moeilijker op gang komt". De ervaring uit de
Duits-Turkse kring, waar dat de norm is, zegt duidelijk nee. De dansvloer draait op het
repertoire, de timing en de presentatie — niet op de bar. Wie het tegendeel beweert, heeft
meestal een repertoireprobleem en geen drankprobleem.

## Meertaligheid: waar de sfeer ontstaat of verdwijnt

Bij een gastenlijst uit twee taalwerelden bepaalt de presentatie voor een groot deel of
iedereen zich aangesproken voelt. Belangrijker dan dat elke zin twee keer klinkt, is dat
**beide groepen weten wat er op dat moment gebeurt** — zeker vóór het religieuze deel. Een
aankondiging die een hele gastengroep feitelijk buitensluit, kost merkbaar sfeer, hoe goed
de muziek ook is.

## De vijf fouten die zich blijven herhalen

1. **Geen vast tijdstip voor recitatie en dua** — alleen een vaag "voor het eten".
2. **Twee losse dienstverleners zonder gedeeld draaiboek**, elk met een eigen idee over
   timing.
3. **Muziek afgekapt in plaats van uitgefadet**, waardoor de overgang hard en onbedoeld
   respectloos aanvoelt.
4. **Geen tussenstap tussen dua en dansvloer**, zodat de zaal stil blijft staan.
5. **Het niveau voor de recitatie op het moment zelf gezocht** in plaats van bij de
   soundcheck vastgelegd.

## Wat dit betekent voor de keuze van een dienstverlener

De beslissende vraag aan een aanbieder is niet "draai je ook Turkse muziek", maar: **wie
neemt de overgang voor zijn rekening?** Komen recitatie, dua, ilahi, presentatie en dj-set
uit één hand, dan vervalt het afstemmen van meerdere tijdschema's — en daarmee de meest
voorkomende foutbron van de avond.

Bij DJ Veys liggen die bouwstenen werkelijk bij één persoon: Veysel Durmuş verzorgt de
Koranrecitatie zelf, ilahi wordt live gespeeld, de presentatie loopt in het Duits, Turks en
Engels, en dezelfde persoon neemt daarna de dj-set over. Een uitgebreid voorbeeldverloop met
tijden staat op de pagina over de islamitische bruiloft.

## Conclusie

Een islamitische bruiloft is geen bijzonder geval dat bijzondere concessies vraagt — het is
een avond met twee delen die één doordacht draaiboek nodig heeft in plaats van twee losse
boekingen. Wie het religieuze deel vroeg plaatst, de techniek erop voorbereidt en de
overgang bewust vormgeeft, krijgt beide in volle kwaliteit: een waardig kader en een volle
dansvloer.
`.trim();

export const islamischeHochzeitFr = `
## Deux célébrations en une soirée — et pourquoi c'est le cœur de la préparation

Un mariage musulman pose aux couples une question qu'une célébration purement civile ne
soulève jamais : deux ambiances très différentes doivent coexister le même soir. La partie
religieuse demande du calme, de l'attention et de l'intelligibilité. La fête qui suit
demande de l'énergie, du volume et une piste pleine. Les deux sont parfaitement conciliables
— mais pas par hasard. C'est une question de déroulé.

L'erreur de préparation la plus fréquente n'est donc pas musicale mais organisationnelle :
la partie religieuse et la fête sont pensées séparément, souvent même réservées séparément,
et personne n'est explicitement responsable de la transition. C'est précisément là que la
soirée bascule — la musique est coupée en plein morceau, les invités ne savent pas s'ils
doivent rester assis, et après la doua la salle reste figée parce que personne ne la relance.

## Qui fait quoi : fixer les rôles tôt

Avant même de parler d'horaires, une liste sobre de qui prend quelle partie vaut davantage :

| Tâche | Généralement assurée par | À fixer tôt |
|---|---|---|
| Récitation coranique | Un hoca, un membre de la famille — ou le DJ/animateur lui-même s'il récite | Qui exactement, et pour combien de temps |
| Doua | Le plus souvent la même personne que la récitation | Son créneau dans le déroulé, pas un vague « avant le dîner » |
| Ilahi | Interprété en live ou diffusé | Live ou playback, avec ou sans saz |
| Annonces et transitions | Animation | Dans quelles langues, et qui relance la salle |
| Son pour la partie religieuse | Sonorisation et lumière | Micro dédié, niveau, aucun effet |

La quatrième ligne est la plus souvent négligée et la plus déterminante. Une récitation sans
annonce préalable compréhensible par tous prend une partie des invités au dépourvu — et une
salle dont la moitié est encore au buffet ne rend pas justice au moment.

## L'ordre qui tient dans la pratique

Il n'existe pas d'ordre contraignant, et les familles font différemment. Ce qui se révèle
pourtant solide encore et encore : la partie religieuse **tôt dans la soirée**, avant le
dîner, et non entre deux séquences dansantes.

Trois raisons pratiques plaident en ce sens. D'abord, les invités sont au complet et encore
disponibles. Ensuite, le volume de la soirée est de toute façon bas à ce moment-là, donc la
transition est courte. Enfin — et c'est le point le plus important — l'énergie n'a plus
ensuite qu'à monter. Placer la partie religieuse au milieu d'une séquence dansante en cours,
c'est la briser et devoir reconstruire l'ambiance une seconde fois.

## Le son : la différence entre entendu et compris

La partie religieuse obéit à d'autres règles techniques que le reste de la soirée. Elles
n'ont rien de spectaculaire, mais elles ne se négocient pas :

- **Un micro dédié**, correctement réglé — pas le micro main que l'animateur a sous la main.
- **Aucune réverbération, aucun effet.** Ce qui flatte une voix dans le set dansant rend une
  récitation plus difficile à suivre.
- **Un niveau nettement inférieur** au set dansant — l'objectif est l'intelligibilité dans
  toute la salle, pas le volume.
- **Le niveau se règle à la balance**, pas sur le moment. Qui touche un fader pendant la
  récitation s'y prend trop tard.

## La musique : avant et après

La musique qui précède la partie religieuse doit être discrète, instrumentale et effacée —
et elle est fondue, non coupée. Un fondu propre de quelques secondes fait la différence
entre une transition et une interruption.

Après la doua, une étape intermédiaire fonctionne mieux qu'un saut direct dans la musique de
danse. L'ilahi — interprété en live, au saz si souhaité — est exactement cette étape : pas
encore la fête, plus tout à fait le recueillement. Sauter ce bloc, c'est demander à la salle
de changer d'humeur en une seconde, ce qui réussit rarement.

Le Türk Sanat Müziği convient au dîner pour la même raison : assez calme pour laisser parler,
jamais quelconque.

## Fêter sans alcool — une question qui n'en est pas une

Beaucoup de couples demandent si une fête sans alcool est « plus difficile à lancer ».
L'expérience du milieu germano-turc, où c'est la norme, répond clairement non. La piste vit
du répertoire, du timing et de l'animation — pas du bar. Qui prétend le contraire a
généralement un problème de répertoire, pas de boissons.

## Le multilinguisme : là où l'ambiance se gagne ou se perd

Avec une liste d'invités issue de deux mondes linguistiques, l'animation décide en grande
partie si chacun se sent concerné. L'important est moins que chaque phrase soit dite deux
fois que **que les deux groupes sachent ce qui se passe à cet instant** — surtout avant la
partie religieuse. Une annonce qui exclut de fait tout un groupe d'invités coûte
sensiblement en ambiance, quelle que soit la qualité de la musique.

## Les cinq erreurs qui reviennent

1. **Aucun horaire fixe pour la récitation et la doua** — seulement un vague « avant le
   dîner ».
2. **Deux prestataires distincts sans déroulé commun**, chacun avec sa propre idée du timing.
3. **Une musique coupée au lieu d'être fondue**, ce qui rend la transition brutale et
   involontairement irrespectueuse.
4. **Aucune étape intermédiaire entre la doua et la piste**, laissant la salle à l'arrêt.
5. **Le niveau de la récitation cherché sur le moment** au lieu d'être fixé à la balance.

## Ce que cela implique pour le choix du prestataire

La question décisive à poser n'est pas « jouez-vous aussi de la musique turque », mais :
**qui prend en charge la transition ?** Si récitation, doua, ilahi, animation et set DJ
viennent de la même source, la coordination entre plusieurs plannings disparaît — et avec
elle la source d'erreur la plus fréquente de la soirée.

Chez DJ Veys, ces briques reposent réellement sur une seule personne : Veysel Durmuş assure
lui-même la récitation coranique, l'ilahi est joué en live, l'animation se fait en allemand,
turc et anglais, et la même personne enchaîne ensuite sur le set DJ. Un exemple de déroulé
détaillé avec horaires figure sur la page consacrée au mariage musulman.

## Conclusion

Un mariage musulman n'est pas un cas particulier réclamant des compromis particuliers : c'est
une soirée en deux parties qui a besoin d'un déroulé réfléchi plutôt que de deux réservations
séparées. Placer la partie religieuse tôt, préparer le son en conséquence et travailler la
transition sciemment, c'est obtenir les deux dans leur pleine qualité : un cadre digne et une
piste pleine.
`.trim();

export const islamischeHochzeitEs = `
## Dos celebraciones en una noche, y por qué ahí está el núcleo de la organización

Una boda islámica plantea a las parejas una tarea que una celebración puramente civil no
conoce: dos ambientes muy distintos deben convivir la misma noche. La parte religiosa exige
calma, atención e inteligibilidad. La fiesta posterior exige energía, volumen y una pista
llena. Ambas cosas son perfectamente compatibles, pero no por casualidad. Es una cuestión de
desarrollo.

Por eso el error de planificación más frecuente no es musical, sino organizativo: la parte
religiosa y la fiesta se piensan por separado, muchas veces incluso se contratan por
separado, y nadie es responsable de forma explícita de la transición. Justo ahí se tuerce la
noche: la música se corta a media canción, los invitados no saben si deben permanecer
sentados y, tras la dua, la sala se queda parada porque nadie vuelve a ponerla en marcha.

## Quién hace qué: fijar los papeles pronto

Antes de hablar de horas, una lista sobria de quién asume cada parte rinde más:

| Tarea | Normalmente a cargo de | Qué debe estar claro pronto |
|---|---|---|
| Recitación del Corán | Un hoca, un familiar o el propio DJ/presentador, si recita | Quién exactamente y durante cuánto tiempo |
| Dua | Habitualmente la misma persona que recita | Su momento en el desarrollo, no un vago «antes de la cena» |
| Ilahi | Interpretado en directo o reproducido | En vivo o playback, con o sin saz |
| Anuncios y transiciones | Presentación | En qué idiomas y quién reactiva la sala |
| Sonido de la parte religiosa | Sonido e iluminación | Micrófono propio, nivel, sin efectos |

La cuarta fila es la que más se pasa por alto y la que más decide. Una recitación sin un
anuncio previo comprensible para todos pilla desprevenida a parte de los invitados, y una
sala con la mitad de la gente todavía en el bufé no hace justicia al momento.

## El orden que se sostiene en la práctica

No hay un orden vinculante y las familias lo resuelven de forma distinta. Lo que sí resulta
sólido una y otra vez en la práctica: la parte religiosa **temprano**, antes de la cena, y no
entre dos rondas de baile.

Hay tres razones prácticas. Primero, los invitados están todos y siguen receptivos. Segundo,
a esa hora el volumen de la noche es bajo de todos modos, así que la transición es corta.
Tercero, y es lo que más pesa: después la energía solo tiene que subir. Quien coloca la parte
religiosa en mitad de una ronda de baile en marcha la interrumpe y tiene que reconstruir el
ambiente por segunda vez.

## Sonido: la diferencia entre oído y entendido

Para la parte religiosa rigen reglas técnicas distintas a las del resto de la noche. No son
espectaculares, pero no se negocian:

- **Micrófono propio**, con el nivel bien ajustado, y no el de mano que el presentador tenga
  a mano.
- **Sin reverberación ni efectos.** Lo que favorece a una voz en la sesión de baile hace la
  recitación más difícil de seguir.
- **Un nivel claramente inferior** al de la sesión de baile: el objetivo es la inteligibilidad
  en toda la sala, no el volumen.
- **El nivel se fija en la prueba de sonido**, no en el momento. Quien toca un fader durante
  la recitación llega tarde.

## Música: qué antes y qué después

La música previa a la parte religiosa debe ser baja, instrumental y discreta, y se baja con
un fundido, no se corta. Un fundido limpio de unos segundos es la diferencia entre una
transición y una interrupción.

Tras la dua funciona mejor un paso intermedio que saltar directamente a la música de baile.
El ilahi —interpretado en directo, con saz si se desea— es exactamente ese paso: todavía no
es fiesta y ya no es recogimiento. Saltarse ese bloque es pedirle a la sala que cambie de
ánimo en un segundo, y eso rara vez sale bien.

El Türk Sanat Müziği encaja en la cena por el mismo motivo: lo bastante tranquilo para
conversar, nunca indiferente.

## Celebrar sin alcohol: una pregunta que no lo es

Muchas parejas preguntan si una celebración sin alcohol «arranca peor». La experiencia del
entorno germano-turco, donde es lo normal, responde con claridad que no. La pista se sostiene
con el repertorio, el timing y la presentación, no con la barra. Quien afirma lo contrario
suele tener un problema de repertorio y no de bebidas.

## Multilingüismo: donde el ambiente se gana o se pierde

Con una lista de invitados de dos mundos lingüísticos, la presentación decide en buena medida
si todos se sienten aludidos. Importa menos que cada frase se diga dos veces que **que ambos
grupos sepan qué está ocurriendo en ese momento**, sobre todo antes de la parte religiosa. Un
anuncio que en la práctica excluye a todo un grupo de invitados cuesta ambiente de forma
perceptible, por buena que sea la música.

## Los cinco errores que se repiten

1. **Ningún momento fijo para la recitación y la dua**, solo un vago «antes de la cena».
2. **Dos proveedores separados sin un desarrollo compartido**, cada uno con su propia idea
   del timing.
3. **Música cortada en lugar de fundida**, lo que hace la transición brusca e
   involuntariamente irrespetuosa.
4. **Ningún paso intermedio entre la dua y la pista**, con la sala detenida.
5. **El nivel de la recitación buscado en el momento** en vez de fijado en la prueba de
   sonido.

## Qué significa esto al elegir proveedor

La pregunta decisiva no es «¿pinchas también música turca?», sino: **¿quién asume la
transición?** Si recitación, dua, ilahi, presentación y sesión de DJ vienen de la misma
mano, desaparece la coordinación entre varios calendarios, y con ella la fuente de error
más frecuente de la noche.

En DJ Veys esas piezas recaen realmente en una sola persona: Veysel Durmuş recita él mismo
el Corán, el ilahi se toca en directo, la presentación se hace en alemán, turco e inglés y
la misma persona asume después la sesión de DJ. Un desarrollo de ejemplo detallado con horas
está en la página sobre la boda islámica.

## Conclusión

Una boda islámica no es un caso especial que exija concesiones especiales: es una noche con
dos partes que necesita un único desarrollo bien pensado en lugar de dos reservas separadas.
Situar la parte religiosa temprano, preparar el sonido para ella y diseñar la transición a
conciencia da ambas cosas en plena calidad: un marco digno y una pista llena.
`.trim();

/**
 * ⚠️ Kurmancî — zur Prüfung durch einen Muttersprachler markiert, wie die
 * kurdischen Slugs in `src/i18n/routing.ts` und der `islamic`-Namespace in
 * `messages/ku.json`. Auf Kundenwunsch geschrieben statt weiter zurückgestellt;
 * der Vorbehalt steht hier, damit er beim Gegenlesen nicht übersehen wird.
 */
export const islamischeHochzeitKu = `
## Du şahî di şeveke de — û çima ev dilê plansaziyê ye

Daweteke îslamî erkekî datîne ber cotan ku şahiyeke tenê fermî nas nake: divê du hawayên
pir cuda di şeveke de li tenişta hev bijîn. Beşa olî hêminî, baldarî û têgihîştinê dixwaze.
Şahiya piştî wê enerjî, deng û meydaneke govendê ya tijî dixwaze. Herdu bê guman bi hev re
dibin — lê ne bi xwe. Ev pirseke rêza bernameyê ye.

Ji ber vê yekê xeletiya herî pirûbêj ne ya muzîkê ye, lê ya rêxistinê ye: beşa olî û şahî
cuda tên fikirîn, gelek caran cuda tên rezervekirin, û kes bi zelalî ji derbasbûnê berpirs
nîne. Şev tam li wir xera dibe — muzîk di nîvê strana de tê birrîn, mêvan nizanin ka dê
rûnin an na, û piştî duayê salon sar dibe, ji ber ku kes wê dîsa nade tevgerê.

## Kî çi dike: rolan zû zelal bikin

Berî ku behsa demjimêran bê kirin, lîsteyeke sade ya kî kîjan beşê digire dest bêtir kêrhatî ye:

| Erk | Bi gelemperî kî dike | Divê zû zelal be |
|---|---|---|
| Tilaweta Qur’anê | Mele, kesek ji malbatê — an DJ/pêşkêşvan bi xwe, eger bixwîne | Bi rastî kî, û çiqas dirêj |
| Dua | Bi piranî heman kesê ku tilawetê dixwîne | Cihê wê di rêzê de, ne “berî xwarinê carekê” |
| Îlahî | Zindî tê gotin an ji tomarê | Zindî an playback, bi saz an bê saz |
| Daxuyanî û derbasbûn | Pêşkêşî | Bi kîjan zimanan, û kî salonê dîsa dide tevgerê |
| Teknîka beşa olî | Deng û ronahî | Mîkrofona serbixwe, ast, bê efekt |

Rêza çaremîn ya herî zêde tê ji bîr kirin û ya herî diyarker e. Tilawetek ku berî wê
daxuyaniyeke ji her kesî re fêmbar nehatibe kirin, beşek ji mêvanan bêamade digire — û
salonek ku nîvê wê hîn li ber bûfeyê ye, wê kêliyê nade heqê wê.

## Rêzika ku di pratîkê de xwe îspat kiriye

Rêzikeke mecbûrî tune ye, û malbat cuda cuda dikin. Lê ya ku di pratîkê de her carê xurt
derdikeve: beşa olî **di destpêka şevê de**, berî xwarinê, ne di navbera du gerên govendê de.

Sê sedemên pratîkî hene. Ya yekem, mêvan hemû hazir in û hîn bala wan heye. Ya duyem, asta
dengê şevê wê demê jixwe nizm e, ango derbasbûn biçûk e. Ya sêyem — û ya herî girîng —
piştî wê divê enerjî tenê hilkişe. Kesê ku beşa olî datîne nav gerek govendê ya berdewam,
wê gerê dibirre û neçar dimîne cara duyem hewayê ji nû ve ava bike.

## Teknîk: cudahiya di navbera bihîstin û fêmkirinê de

Ji bo beşa olî qaîdeyên teknîkî yên cuda hene. Ew ne balkêş in, lê li ser wan pazar nabe:

- **Mîkrofoneke serbixwe**, bi rêkûpêk hatiye eyarkirin — ne ya destan a ku pêşkêşvan bi
  tesadufî di dest de ye.
- **Bê deng-vegerandin, bê efekt.** Tiştê ku li ser dengekî di seta govendê de xweş e,
  tilawetê zehmettir dike ku bê fêmkirin.
- **Astek diyar nizmtir** ji seta govendê — armanc têgihîştin e li seranserê salonê, ne
  bilindahiya dengê.
- **Ast di kontrola dengî de tê eyarkirin**, ne di wê kêliyê de. Kesê ku di dema tilawetê de
  destê xwe dide ser eyaran, dereng maye.

## Muzîk: berî çi, piştî çi

Muzîka berî beşa olî divê nizm, enstrumantal û bêdeng be — nayê birrîn, hêdî hêdî tê
nizmkirin. Nizmbûneke paqij a çend saniyan cudahiya di navbera derbasbûn û birrînê de ye.

Piştî duayê gaveke navîn ji lêdana rasterast a muzîka govendê çêtir dixebite. Îlahî — zindî,
li ser daxwazê bi sazê — tam ew gav e: hîn ne şahî, êdî ne îbadet. Kesê ku vê blokê derbas
dike, ji salonê dixwaze ku di saniyeyekê de hawayê xwe biguhere, û ev kêm caran dibe.

Türk Sanat Müziği ji ber heman sedemê ji beşa xwarinê re dibe: têra sohbetê aram, lê ne
tiştekî bêqîmet.

## Bê alkol şahî kirin — pirseke ku ne pirs e

Gelek cot dipirsin ka şahiyeke bê alkol “zehmettir tê hawayê”. Ezmûna ji civata alman-tirk,
ku li wir ev tiştekî asayî ye, bi zelalî dibêje na. Meydana govendê bi repertuwar, bi
demjimêr û bi pêşkêşiyê radiweste — ne bi bar. Kesê ku berevajiyê wê dibêje, bi piranî
pirsgirêka repertuwarê heye, ne ya vexwarinê.

## Pirzimanî: cihê ku hawa lê çêdibe an lê winda dibe

Di lîsteyeke mêvanan a ji du cîhanên zimanî de, pêşkêşî bi giranî diyar dike ka her kes xwe
muxatab hîs dike an na. Girîng ne ew e ku her hevok du caran bê gotin, lê ew e ku **herdu
kom bizanin di wê kêliyê de çi diqewime** — nemaze berî beşa olî. Daxuyaniyeke ku komeke
mêvanan bi awayekî pratîk li derve dihêle, hawayê bi awayekî berbiçav kêm dike, muzîk çiqas
baş be jî.

## Pênc xeletiyên ku dubare dibin

1. **Ji bo tilawet û duayê demeke sabit tune** — tenê “berî xwarinê” ya nezelal.
2. **Du pêşkêşkerên cuda bêyî rêzeke bernameyê ya hevpar**, her yek bi têgihîştina xwe ya
   demjimêrê.
3. **Muzîk tê birrîn li şûna ku hêdî bê nizmkirin**, ku derbasbûnê hişk û bêhemdî bêrêz
   dike.
4. **Di navbera dua û meydana govendê de gaveke navîn tune**, ji ber vê yekê salon sekinî
   dimîne.
5. **Asta tilawetê di wê kêliyê de tê lêgerîn** li şûna ku di kontrola dengî de bê diyarkirin.

## Ev ji bo hilbijartina pêşkêşkerî çi tê wateyê

Pirsa diyarker a ji pêşkêşkerekî re ne “tu muzîka tirkî jî lê didî?” ye, lê ev e: **kî
derbasbûnê digire ser xwe?** Eger tilawet, dua, îlahî, pêşkêşî û seta DJ ji yek destî bên,
hevrêzkirina çend bernameyên demê ji holê radibe — û bi wê re çavkaniya xeletiyê ya herî
pirûbêj a şevê jî.

Li cem DJ Veys ev pêkhate bi rastî di destê yek kesî de ne: tilaweta Qur’anê Veysel Durmuş
bi xwe dixwîne, îlahî zindî tê lêdan, pêşkêşî bi almanî, tirkî û îngilîzî tê kirin, û seta
DJ jî heman kes digire dest. Rêzeke nimûne ya berfireh bi demjimêran li ser rûpela daweta
îslamî heye.

## Encam

Daweteke îslamî ne rewşeke taybet e ku tawîzên taybet dixwaze — ew şeveke bi du beşan e ku
li şûna du rezervasyonên cuda yek rêza bernameyê ya bifikirî dixwaze. Kesê ku beşa olî zû
datîne, teknîka wê pêşî amade dike û derbasbûnê bi zanebûn ava dike, herduyan bi qalîteya
tam distîne: çarçoveyeke bi rûmet û meydaneke govendê ya tijî.
`.trim();

/**
 * Arabisch. Zusammen mit tr/ku die einzige Sprache, in der dieser Artikel
 * überhaupt erscheint (siehe `restrictToLocales` unten).
 *
 * ⚠️ Zur Prüfung durch einen Muttersprachler markiert — derselbe Vorbehalt
 * wie beim kurdischen Text darüber.
 */
export const islamischeHochzeitAr = `
## حفلان في أمسية واحدة — ولماذا هذا هو جوهر التخطيط

يضع الزفاف ذو الطابع الإسلامي أمام العروسين مهمةً لا يعرفها حفل مدني بحت: أن يتعايش
مزاجان مختلفان تمامًا في أمسية واحدة. الجزء الديني يطلب الهدوء والانتباه ووضوح الكلمة.
أما الاحتفال الذي يليه فيطلب الطاقة وعلوّ الصوت وحلبة رقص ممتلئة. والجمع بين الاثنين ممكن
بلا شك — لكنه لا يحدث من تلقاء نفسه. إنها مسألة برنامج.

ولهذا فإن أكثر أخطاء التخطيط شيوعًا ليس خطأً موسيقيًا بل خطأ تنظيميًا: يُفكَّر في الجزء
الديني وفي الحفل كلٌّ على حدة، وكثيرًا ما يُحجزان من جهتين مختلفتين، ولا أحد مسؤول صراحةً
عن الانتقال بينهما. وهناك تحديدًا تنقلب الأمسية — تنقطع الموسيقى في منتصف الأغنية، ولا
يدري الضيوف أيبقون جالسين أم لا، وبعد الدعاء تجمد القاعة لأن لا أحد يعيدها إلى الحركة.

## من يفعل ماذا: احسموا الأدوار مبكرًا

قبل الحديث عن التوقيتات، تُجدي قائمةٌ بسيطة تحدّد من يتولّى أيّ جزء:

| المهمة | من يتولّاها عادةً | ما ينبغي حسمه مبكرًا |
|---|---|---|
| تلاوة القرآن الكريم | شيخ أو أحد أفراد العائلة — أو الـ DJ/المقدّم نفسه إن كان يتلو | من بالضبط، وكم تستغرق |
| الدعاء | غالبًا الشخص نفسه الذي يتلو | موضعه في البرنامج، لا "قبل العشاء في وقت ما" |
| الأناشيد | أداء حيّ أو تشغيل من تسجيل | حيّ أم مسجّل، بمصاحبة الساز أم بدونها |
| الإعلانات والانتقالات | التقديم | بأي اللغات، ومن يعيد القاعة إلى الحركة |
| تقنية الجزء الديني | الصوت والإضاءة | ميكروفون مخصّص، مستوى الصوت، بلا مؤثرات |

الصف الرابع هو الأكثر عرضةً للإغفال، وهو الأكثر تأثيرًا في النتيجة. فالتلاوة التي تبدأ دون
إعلان مسبق يفهمه الجميع تباغت جزءًا من الضيوف — وقاعةٌ لا يزال نصف مَن فيها واقفًا عند
البوفيه لا تُعطي تلك اللحظة حقّها.

## الترتيب الذي أثبت نفسه عمليًا

لا يوجد ترتيب مُلزِم، والعائلات تتعامل مع الأمر بطرق مختلفة. لكن ما يثبت متانته مرة بعد
مرة في الواقع العملي هو هذا: الجزء الديني **في وقت مبكر من الأمسية**، قبل العشاء، لا بين
جولتَي رقص.

وهناك ثلاثة أسباب عملية لذلك. أولًا، الضيوف حاضرون بكامل عددهم وما زالوا منتبهين. ثانيًا،
مستوى صوت الأمسية في تلك الساعة منخفض أصلًا، فيكون الانتقال طفيفًا. ثالثًا — وهذه أهم نقطة
— لا يبقى أمام الطاقة بعدها إلا أن ترتفع. أما من يضع الجزء الديني في منتصف جولة رقص جارية
فهو يقطعها، ويضطر إلى بناء الأجواء من جديد مرة ثانية.

## التقنية: الفرق بين أن يُسمع وأن يُفهم

يخضع الجزء الديني لقواعد تقنية غير تلك التي يخضع لها بقية الأمسية، وهي قواعد غير لافتة
لكنها غير قابلة للتفاوض:

- **ميكروفون مخصّص له**، مضبوط المستوى بدقة، لا الميكروفون اليدوي الذي يصادف أنه في يد
  المقدّم.
- **بلا صدى وبلا مؤثرات.** فما يُجمّل الصوت في فقرة الرقص يجعل التلاوة أصعب على الفهم.
- **مستوى صوت أخفض بوضوح** من فقرة الرقص — فالهدف هو الوضوح في كل أرجاء القاعة، لا علوّ
  الصوت.
- **يُضبط المستوى في اختبار الصوت**، لا في اللحظة نفسها. ومن يمدّ يده إلى الأزرار أثناء
  التلاوة فقد تأخّر.

## الموسيقى: ماذا قبل وماذا بعد

الموسيقى التي تسبق الجزء الديني ينبغي أن تكون خافتة وآلية وغير متطفّلة — ويُخفَت صوتها تدريجيًا
حتى يختفي، ولا تُقطع. فتلاشٍ نظيف على مدى ثوانٍ قليلة هو الفرق بين انتقال وبين قطع.

وبعد الدعاء تنجح خطوة وسيطة أكثر من القفز مباشرة إلى موسيقى الرقص. والأناشيد — تُؤدّى
حيّة، وبمصاحبة الساز عند الرغبة — هي تلك الخطوة الوسيطة بالضبط: لم تعد لحظة ابتهال،
ولم تصبح حفلًا بعد. ومن يتخطّى هذه الفقرة يطلب من القاعة أن تغيّر حالها في ثانية واحدة، وهذا نادرًا
ما ينجح.

والموسيقى التركية الكلاسيكية (Türk Sanat Müziği) تناسب فترة العشاء للسبب نفسه: هادئة بما
يكفي للأحاديث، لكنها ليست موسيقى اعتباطية.

## احتفال بلا كحول — سؤال ليس سؤالًا في الحقيقة

يسأل كثير من العرسان إن كان الحفل الخالي من الكحول "أصعب في إشعال الأجواء". والتجربة في
الوسط الألماني التركي، حيث هذا هو الوضع الطبيعي، تقول لا بوضوح. فحلبة الرقص تعيش على
الذخيرة الموسيقية وعلى التوقيت وعلى التقديم — لا على البار. ومن يزعم العكس فمشكلته غالبًا
في الذخيرة الموسيقية لا في المشروبات.

## تعدّد اللغات: النقطة التي تُصنع عندها الأجواء أو تُفقد

مع قائمة ضيوف قادمة من عالمَين لغويَّين، يقرّر التقديم إلى حدّ كبير ما إذا كان الجميع
يشعرون بأنهم مقصودون بالكلام. والمهم ليس أن تُقال كل جملة مرتين، بل أن **تعرف المجموعتان
كلتاهما ما الذي يحدث في تلك اللحظة** — وخصوصًا قبل الجزء الديني. فالإعلان الذي يستبعد
عمليًا مجموعة كاملة من الضيوف يُفقد الأمسية أجواءها بشكل ملموس، مهما كانت الموسيقى جيدة.

## الأخطاء الخمسة التي تتكرّر

1. **لا وقت ثابت للتلاوة والدعاء** — بل مجرد عبارة غامضة: "قبل العشاء".
2. **مزوّدا خدمة منفصلان بلا برنامج مشترك**، لكلٍّ منهما تصوّره الخاص عن التوقيت.
3. **قطع الموسيقى بدل خفضها تدريجيًا**، وهو ما يجعل الانتقال حادًّا ويُظهره قليل
   الاحترام من دون قصد.
4. **غياب خطوة وسيطة بين الدعاء وحلبة الرقص**، فتبقى القاعة جامدة في مكانها.
5. **البحث عن مستوى صوت التلاوة في اللحظة نفسها** بدل تحديده في اختبار الصوت.

## ماذا يعني هذا عند اختيار مزوّد الخدمة

السؤال الحاسم الذي يُطرح على أي مزوّد ليس "هل تشغّل موسيقى تركية أيضًا؟"، بل: **من يتولّى
الانتقال؟** فإذا جاءت التلاوة والدعاء والأناشيد والتقديم وفقرة الـ DJ من جهة واحدة، سقطت
الحاجة إلى التنسيق بين عدة جداول زمنية — وسقط معها أكثر مصادر الخطأ شيوعًا في الأمسية.

وعند DJ Veys تجتمع هذه المكوّنات فعليًا في شخص واحد: القرآن الكريم يتلوه فيسيل دورموش
(Veysel Durmuş) بنفسه، والأناشيد تُؤدّى حيّة، والتقديم بالألمانية والتركية والإنجليزية، والشخص نفسه
يتولّى فقرة الـ DJ بعد ذلك. أما نموذج برنامج مفصّل بالتوقيتات فتجدونه في صفحة الزفاف
الإسلامي.

## الخلاصة

الزفاف ذو الطابع الإسلامي ليس حالة استثنائية تفرض تنازلات خاصة — إنه أمسية من جزأين تحتاج
إلى برنامج واحد مدروس بدل حجزين منفصلين. فمن يضع الجزء الديني مبكرًا، ويجهّز تقنيته سلفًا،
ويصوغ الانتقال بوعي، يحصل على الاثنين بكامل جودتهما: إطار يليق بالمناسبة، وحلبة رقص
ممتلئة.
`.trim();

export const islamischeHochzeitPost: BlogPost = {
  id: 'islamische-hochzeit-planen',
  slug: 'islamische-hochzeit-planen',
  category: 'islamische-hochzeit',
  type: 'guide',
  status: 'published',
  publishedAt: '2026-07-31',
  updatedAt: '2026-08-27',
  tags: ['islamische-hochzeit', 'ablauf', 'dua', 'ilahi', 'planung'],
  readingTimeMinutes: 7,
  /**
   * Kein `restrictToLocales` mehr: Der Kunde hat die religiös geprägte Ebene
   * am 2026-08-27 für alle acht Sprachen freigegeben (Begründung bei
   * `ISLAMIC_SUPPORTED_LOCALES` in `src/content/islamic.ts`). Die deutschen,
   * englischen, niederländischen, französischen und spanischen Bodies unten
   * standen die ganze Zeit geschrieben da — genau dafür wurden sie behalten
   * statt gelöscht.
   */
  links: ['/islamische-hochzeit', '/ablauf', '/anfrage'],
  relatedAnswers: ['islamic-wedding-dj', 'who-recites', 'quran-and-modern-party', 'dua-in-program'],
  relatedPosts: ['tuerkische-hochzeit-ablauf-musik-timing', 'hochzeits-timeline-musterablauf'],
  translations: {
    de: {
      title: 'Islamische Hochzeit planen: Ablauf, Dua und Feier an einem Abend',
      excerpt:
        'Eine islamisch geprägte Hochzeit ist ein Abend mit zwei Teilen — der religiöse Rahmen und die Feier danach. Dieser Guide zeigt, welche Reihenfolge sich bewährt, welche Technik der religiöse Teil braucht und welche fünf Fehler sich immer wiederholen.',
      body: islamischeHochzeitDe,
      seo: {
        metaTitle: 'Islamische Hochzeit planen: Ablauf & Dua | DJ Veys',
        metaDescription:
          'Kur’an-Rezitation, Dua und Feier an einem Abend planen: bewährte Reihenfolge, Technik für den religiösen Teil und die fünf häufigsten Fehler.',
      },
    },
    tr: {
      slug: 'islami-dugun-planlama',
      title: 'İslami düğün planlamak: akış, dua ve kutlama aynı akşamda',
      excerpt:
        'İslami bir düğün, iki bölümü olan bir akşamdır — dinî çerçeve ve ardından gelen kutlama. Bu rehber hangi sıralamanın işe yaradığını, dinî bölümün hangi tekniği gerektirdiğini ve sürekli tekrarlanan beş hatayı gösteriyor.',
      body: islamischeHochzeitTr,
      seo: {
        metaTitle: 'İslami düğün planlama: akış & dua | DJ Veys',
        metaDescription:
          'Kur’an tilaveti, dua ve kutlamayı aynı akşamda planlamak: kendini kanıtlamış sıralama, dinî bölümün tekniği ve en sık yapılan beş hata.',
      },
    },
    en: {
      slug: 'planning-an-islamic-wedding',
      title: 'Planning an Islamic wedding: running order, dua and the party in one evening',
      excerpt:
        'An Islamic wedding is an evening with two parts — the religious frame and the celebration that follows. This guide shows the order that holds up in practice, the sound the religious part needs, and the five mistakes that keep recurring.',
      body: islamischeHochzeitEn,
      seo: {
        metaTitle: 'Planning an Islamic Wedding: Order & Dua | DJ Veys',
        metaDescription:
          'Planning Quran recitation, dua and the celebration in one evening: the order that works, sound for the religious part, and five common mistakes.',
      },
    },
    nl: {
      slug: 'islamitische-bruiloft-plannen',
      title: 'Islamitische bruiloft plannen: verloop, dua en feest op één avond',
      excerpt:
        'Een islamitische bruiloft is een avond met twee delen — het religieuze kader en het feest dat volgt. Deze gids laat zien welke volgorde zich bewijst, welke techniek het religieuze deel nodig heeft en welke vijf fouten zich blijven herhalen.',
      body: islamischeHochzeitNl,
      seo: {
        metaTitle: 'Islamitische bruiloft plannen: verloop & dua | DJ Veys',
        metaDescription:
          'Koranrecitatie, dua en feest op één avond plannen: de volgorde die werkt, de techniek voor het religieuze deel en de vijf meest gemaakte fouten.',
      },
    },
    fr: {
      slug: 'organiser-un-mariage-musulman',
      title: 'Organiser un mariage musulman : déroulé, doua et fête en une soirée',
      excerpt:
        'Un mariage musulman est une soirée en deux parties — le cadre religieux et la fête qui suit. Ce guide montre l’ordre qui tient dans la pratique, le son dont la partie religieuse a besoin et les cinq erreurs qui reviennent sans cesse.',
      body: islamischeHochzeitFr,
      seo: {
        metaTitle: 'Organiser un mariage musulman : déroulé & doua | DJ Veys',
        metaDescription:
          'Récitation coranique, doua et fête en une soirée : l’ordre qui fonctionne, le son pour la partie religieuse et les cinq erreurs les plus fréquentes.',
      },
    },
    es: {
      slug: 'organizar-una-boda-islamica',
      title: 'Organizar una boda islámica: desarrollo, dua y fiesta en una noche',
      excerpt:
        'Una boda islámica es una noche con dos partes: el marco religioso y la fiesta posterior. Esta guía muestra el orden que se sostiene en la práctica, el sonido que necesita la parte religiosa y los cinco errores que se repiten.',
      body: islamischeHochzeitEs,
      seo: {
        metaTitle: 'Organizar una boda islámica: desarrollo y dua | DJ Veys',
        metaDescription:
          'Planificar recitación del Corán, dua y fiesta en una noche: el orden que funciona, el sonido de la parte religiosa y los cinco errores más comunes.',
      },
    },
    ku: {
      slug: 'plansaziya-daweta-islami',
      title: 'Plansaziya daweta îslamî: rêza bernameyê, dua û şahî di şeveke de',
      excerpt:
        'Daweteke îslamî şeveke bi du beşan e — çarçoveya olî û şahiya piştî wê. Ev rêbername nîşan dide kîjan rêzik xwe îspat dike, beşa olî çi teknîkê dixwaze û kîjan pênc xeletî her carê dubare dibin.',
      body: islamischeHochzeitKu,
      seo: {
        metaTitle: 'Plansaziya daweta îslamî: rêz & dua | DJ Veys',
        metaDescription:
          'Tilaweta Qur’anê, dua û şahî di şeveke de plansaz bikin: rêzika ku dixebite, teknîka beşa olî û pênc xeletiyên herî pirûbêj.',
      },
    },
    ar: {
      slug: 'takhtit-zafaf-islami',
      title: 'تخطيط الزفاف الإسلامي: البرنامج والدعاء والحفل في أمسية واحدة',
      excerpt:
        'الزفاف ذو الطابع الإسلامي أمسية من جزأين — الإطار الديني والاحتفال الذي يليه. يوضّح هذا الدليل الترتيب الذي أثبت نفسه عمليًا، والتقنية التي يحتاجها الجزء الديني، والأخطاء الخمسة التي تتكرّر في كل مرة.',
      body: islamischeHochzeitAr,
      seo: {
        metaTitle: 'تخطيط زفاف إسلامي: البرنامج والدعاء | DJ Veys',
        metaDescription:
          'تلاوة القرآن الكريم والدعاء والحفل في أمسية واحدة: الترتيب الذي أثبت نفسه عمليًا، وتقنية الجزء الديني، والأخطاء الخمسة الأكثر شيوعًا.',
      },
    },
  },
};
