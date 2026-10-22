import type { BlogPost } from './types';

/**
 * Primary keyword (DE): "hochzeitslocation stuttgart" / "hochzeitslocation umgebung
 * stuttgart worauf achten" — deliberately answered from the technical side, which is the
 * angle no venue directory covers: every portal ranks halls, none of them explains what a
 * DJ actually measures at a viewing.
 *
 * ⚠️ ABSOLUTE RULE for this article, per `.claude/BRAND-FACTS.md` ("venue partners" is on
 * the *do NOT invent* list): **no venue is named anywhere in any locale** — not as a
 * recommendation, not as a warning, not as an example. `site.partnersUnconfirmed` exists
 * precisely because the client has not confirmed that any hall is a current partner, and
 * an article that name-drops one implies exactly the relationship we are not allowed to
 * claim. The body says this out loud once, in every language, rather than leaving the
 * omission to look like an oversight.
 *
 * Deliberate keyword split, see docs/BLOG-PLAN.md "cannibalization notes":
 * `location-akustik-checkliste` owns "location akustik" and goes deep on room sound —
 * this post touches acoustics as *one* of eight criteria and hands off by name.
 * `laermschutz-sperrzeiten-baden-wuerttemberg` owns every legal figure; nothing about
 * Sperrzeiten is restated here, only the questions to ask the venue about them.
 *
 * TR slug `stuttgart-dugun-salonu-secimi` carries the diaspora query as actually typed
 * ("düğün salonu", not "düğün mekânı"), which is the phrasing the Turkish-language
 * wedding portals for Germany rank for. EN slug keeps "wedding venue Stuttgart".
 */
export const hochzeitslocationDe = `
## Warum hier bewusst keine einzelne Halle empfohlen wird

Dieser Artikel nennt keine konkrete Location — weder als Empfehlung noch als Warnung. Das
hat einen sachlichen Grund: Partnerschaften mit Sälen werden hier nicht behauptet, und ein
Raum, der für eine Feier genau richtig ist, kann für die nächste der falsche sein. Was
sich dagegen ehrlich weitergeben lässt, sind die Kriterien, die unabhängig vom Haus immer
gelten. Aus zwölf Jahren und über 200 Veranstaltungen ist eine Prüfliste geworden,
die sich bei einer Besichtigung in etwa zwanzig Minuten abarbeiten lässt.

## Kapazität ist nicht gleich Tanzfläche

Die Zahl im Exposé beschreibt, wie viele Personen bestuhlt in den Raum passen — nicht, wie
viele gleichzeitig tanzen können. Entscheidend sind zwei andere Größen: die tatsächlich
freie Fläche, wenn alle Tische stehen, und wo diese Fläche liegt. Eine Tanzfläche am Ende
eines langen Saals zieht den Abend auseinander, weil die hinteren Tische akustisch und
optisch abgehängt sind. Eine mittig gelegene Fläche mit Tischen ringsum hält die Feier
zusammen. Lassen Sie sich deshalb den Bestuhlungsplan für Ihre eigene Gästezahl zeigen und
beurteilen Sie nie den leeren Raum.

## Akustik: Deckenhöhe, Glas, harte Flächen

Hohe Decken, große Glasfronten und blanke Wände erzeugen Nachhall, der sich mit Technik
nur begrenzt korrigieren lässt — mehr Lautstärke macht ihn schlimmer, nicht besser.
Vorhänge, Teppich, Holz und ein voller Raum dämpfen. Für die Details dazu gibt es in
diesem Ratgeber einen eigenen Beitrag: "Location-Akustik: worauf man bei der Besichtigung
achtet". Bei der Location-Auswahl selbst reicht ein grober Test — einmal in die Hände
klatschen und hören, wie lange es nachklingt.

## Strom: der Punkt, der am häufigsten unterschätzt wird

Ton, Licht, Nebelmaschine, Küche und Kaffeemaschinen hängen in vielen Häusern am selben
Stromkreis. Fällt eine Sicherung, ist es fast nie die Küche, die still wird. Zu klären ist
deshalb: Wie viele getrennte Stromkreise stehen auf der Bühnenseite zur Verfügung, mit
welcher Absicherung, und lässt sich einer davon exklusiv für die Technik reservieren?
Diese Frage beantwortet der Hausmeister oder Haustechniker zuverlässig, die Vermietung
oft nicht.

## Anlieferung, Wege und der Platz für die Technik

Wie weit ist es vom Parkplatz zur Tür, gibt es Stufen, einen Aufzug, ausreichend breite
Türen — und darf während Auf- und Abbau überhaupt nah am Eingang gehalten werden? Eigene
Ton- und Lichttechnik inklusive Auf- und Abbau ist bei DJ Veys Teil der Buchung, aber die
dafür nötige Zeit muss der Mietvertrag hergeben. Für die Stellfläche selbst gilt:
Sichtachse zur Tanzfläche, Steckdose in der Nähe, und keine Kabelwege quer über Flucht-
oder Gästewege.

## Sperrzeit und Lärmschutz — drinnen und draußen getrennt betrachten

Für den Innenraum und für den Außenbereich gelten in der Regel unterschiedliche Regeln,
und die entscheidenden Punkte stehen im Mietvertrag, nicht im Gesetzbuch. Zu fragen ist,
bis wann drinnen gefeiert werden darf, ab wann draußen Ruhe herrschen muss, ob ein
Pegelbegrenzer verbaut ist und wer im Haus über Ausnahmen entscheidet. Die rechtliche
Einordnung dazu steht ausführlich im Beitrag "Lärmschutz, Sperrstunde und Sperrzeiten in
Baden-Württemberg".

## Haustechnik oder eigene Anlage

Hier trennen sich zwei Typen von Häusern. Gemeinde- und Bürgerhäuser bringen häufig eine
einfache Grundbeschallung mit, die für Reden reicht und für eine Tanzfläche nicht. Größere
Hotelsäle haben oft eine fest installierte Anlage — und manchmal die vertragliche
Bedingung, dass genau diese benutzt werden muss. Die Frage lautet daher nicht "gibt es
Technik", sondern: Darf eigene Technik betrieben werden, und wenn ja, an welchem
Anschlusspunkt?

## Catering-Timing

Der Übergang vom Essen zur Tanzfläche ist der empfindlichste Moment des Abends. Wenn das
Dessert kommt, während die Musik hochfährt, verliert man beides. Sinnvoll ist deshalb, bei
der Besichtigung zu klären, ob die Küche feste Ausgabezeiten hat oder flexibel bleibt, und
ob eine Abstimmung zwischen Service und Musik vorgesehen ist. Ein Haus, das diese Frage
routiniert beantwortet, hat sie schon oft gelöst.

## Was bei großen türkischen Hochzeiten dazukommt

Bei türkischen und deutsch-türkischen Feiern verschieben sich einige Kriterien deutlich.
Halay wird im Kreis oder in der Kette getanzt, und eine Kette wächst nach außen — sie
braucht eine zusammenhängende Fläche ohne Säule, Stufe oder Podest mittendrin. Der Einzug
des Paares braucht einen freien Weg von der Tür bis zur Fläche; kommen Live-Elemente dazu,
laufen weitere Personen denselben Weg, was bei der Bestuhlung eingeplant und vorab
koordiniert wird. Und weil mehrere Generationen gleichzeitig feiern, zählt die Balance
zwischen Sitzplatz und Tanzfläche: Die ältere Verwandtschaft möchte das Geschehen sehen,
aber nicht direkt neben einem Lautsprecher sitzen. Ein Raum, der beides zulässt, ist mehr
wert als der schönere Saal ohne diese Möglichkeit.

## Die Fragenliste für die Besichtigung

| Thema | Frage an das Haus |
|---|---|
| Fläche | Wie sieht der Bestuhlungsplan für unsere Gästezahl aus, und wie groß bleibt die Tanzfläche? |
| Strom | Wie viele getrennte Stromkreise gibt es an der Bühnenseite? |
| Technik | Darf eigene Ton- und Lichttechnik betrieben werden? |
| Pegel | Ist ein Pegelbegrenzer installiert, und auf welchen Wert? |
| Zeiten | Bis wann drinnen, bis wann draußen? |
| Aufbau | Ab welcher Uhrzeit ist Zutritt für den Aufbau möglich? |
| Anlieferung | Stufen, Aufzug, Türbreiten, Halten am Eingang? |
| Catering | Feste Ausgabezeiten oder Abstimmung mit dem Ablauf? |

Diese acht Punkte vor der Unterschrift schriftlich zu klären, kostet eine E-Mail und
erspart am Hochzeitstag die meisten Improvisationen.

## Fazit

Eine Location wird selten wegen ihrer Technik ausgesucht, und das ist auch richtig so —
der erste Eindruck, die Lage und das Gefühl entscheiden zu Recht zuerst. Die technischen
Kriterien sind aber diejenigen, die sich später nicht mehr ändern lassen, und genau
deshalb gehören sie in die Besichtigung und nicht in die Woche vor der Feier. Wer den
Raum bereits im Blick hat, kann ihn im Planungsgespräch einfach durchgehen; die
Stadtseiten zu Esslingen, Ludwigsburg und Heilbronn und die Übersichtsseite für
Baden-Württemberg zeigen, wo Anfahrt und Ortskenntnis ohnehin gegeben sind — Anfahrt
innerhalb von 50 Kilometern rund um Stuttgart ist eingerechnet. Über die Anfrageseite
kommt die Rückmeldung in der Regel innerhalb von 24 Stunden.
`.trim();

export const hochzeitslocationTr = `
## Neden burada tek bir salon önerilmiyor

Bu yazıda bilinçli olarak hiçbir salonun adı geçmiyor — ne tavsiye olarak ne de uyarı
olarak. Bunun somut bir nedeni var: burada hiçbir salonla ortaklık iddia edilmiyor ve bir
düğün için tam isabet olan bir mekân, bir sonraki için yanlış tercih olabilir. Buna
karşılık dürüstçe aktarılabilecek şey, hangi salon olursa olsun geçerli olan ölçütlerdir.
On iki yılı aşkın deneyim ve 200'ün üzerinde organizasyondan çıkan bu kontrol listesi, bir
keşif ziyaretinde yaklaşık yirmi dakikada gözden geçirilebilir.

## Kapasite, dans alanı demek değildir

Broşürdeki sayı, salona sandalyeli düzende kaç kişinin sığdığını söyler — aynı anda kaç
kişinin dans edebileceğini değil. Belirleyici olan iki başka ölçüdür: tüm masalar
kurulduğunda gerçekten boş kalan alan ve bu alanın nerede olduğu. Uzun bir salonun ucunda
kalan dans alanı akşamı ikiye böler, çünkü arkadaki masalar hem sesten hem görüntüden
kopar. Ortada konumlanmış, çevresi masalarla sarılı bir alan ise kutlamayı bir arada
tutar. Bu yüzden kendi davetli sayınıza göre hazırlanmış oturma planını isteyin ve boş
salona bakarak karar vermeyin.

## Akustik: tavan yüksekliği, cam, sert yüzeyler

Yüksek tavanlar, geniş cam cepheler ve çıplak duvarlar yankı üretir; bu, teknikle ancak
sınırlı ölçüde düzeltilebilir — sesi açmak yankıyı iyileştirmez, kötüleştirir. Perde,
halı, ahşap ve dolu bir salon sesi yumuşatır. Ayrıntılar için bu rehberde ayrı bir yazı
var: "Mekân akustiği: keşifte nelere dikkat edilmeli". Salon seçimi aşamasında kaba bir
test yeter — bir kez el çırpın ve sesin ne kadar sürdüğünü dinleyin.

## Elektrik: en sık hafife alınan başlık

Ses, ışık, sis makinesi, mutfak ve kahve makineleri birçok binada aynı hat üzerindedir.
Sigorta attığında susan neredeyse hiçbir zaman mutfak olmaz. Bu yüzden netleştirilmesi
gereken şudur: sahne tarafında kaç ayrı elektrik hattı var, kaç amperle korunuyor ve
bunlardan biri yalnızca teknik ekipmana ayrılabilir mi? Bu soruyu binanın teknik
sorumlusu güvenilir biçimde yanıtlar, kiralama biriminin çoğu zaman bilgisi yoktur.

## Yükleme, yollar ve tekniğin duracağı alan

Otoparktan kapıya mesafe ne kadar, basamak var mı, asansör var mı, kapılar yeterince
geniş mi — ve kurulum ile toplama sırasında girişe yakın durulabiliyor mu? DJ Veys'te
kendi ses ve ışık sistemi, kurulum ve sökümü dahil olmak üzere rezervasyona dahildir,
ancak bunun için gereken zamanın kira sözleşmesinde karşılığı olmalıdır. Ekipmanın
duracağı yer için kural nettir: dans alanını gören bir açı, yakında priz ve kabloların
kaçış yollarını ya da davetli geçişlerini kesmemesi.

## Kapanış saati ve gürültü koruması — içerisi ve dışarısı ayrı değerlendirilir

Kapalı alan ile açık alan için genellikle farklı kurallar geçerlidir ve belirleyici
maddeler kanun kitabında değil, kira sözleşmesinde durur. Sorulması gerekenler: içeride
saat kaça kadar kutlanabilir, dışarıda ne zaman sessizlik başlar, ses seviyesi sınırlayıcı
bir cihaz kurulu mu ve istisnalara binada kim karar veriyor? Hukuki çerçeve için
"Baden-Württemberg'de gürültü koruması ve kapanış saatleri" yazısına bakılabilir.

## Binanın kendi sistemi mi, kendi ekipmanımız mı

Burada iki tür bina ayrışır. Belediye ve mahalle salonlarında çoğu zaman konuşmalara yeten
ama dans alanına yetmeyen basit bir ses düzeni bulunur. Büyük otel balo salonlarında ise
sıklıkla sabit bir sistem vardır — ve bazen sözleşmede tam olarak o sistemin kullanılması
şartı yer alır. Dolayısıyla soru "teknik var mı" değil, şudur: kendi ekipmanımız
çalıştırılabiliyor mu, çalıştırılabiliyorsa hangi bağlantı noktasından?

## Yemek servisinin zamanlaması

Yemekten dans alanına geçiş, akşamın en hassas anıdır. Tatlı servisi müzik yükselirken
gelirse ikisi de kaybedilir. Bu yüzden keşif sırasında mutfağın sabit servis saatleri mi
olduğunu yoksa esnek kalıp kalmadığını ve servis ile müzik arasında bir koordinasyonun
öngörülüp öngörülmediğini netleştirmek gerekir. Bu soruyu rahatlıkla yanıtlayan bir bina,
onu daha önce defalarca çözmüştür.

## Kalabalık Türk düğünlerinde ek olarak neye bakılır

Türk ve Alman-Türk düğünlerinde bazı ölçütler belirgin biçimde değişir. Halay daire ya da
zincir hâlinde oynanır ve zincir dışa doğru büyür — ortasında kolon, basamak ya da podyum
olmayan, bütünlüklü bir alana ihtiyaç duyar. Çiftin girişi için kapıdan alana kadar boş
bir güzergâh gerekir; canlı unsurlar eklendiğinde aynı güzergâhı başka kişiler de
kullanır, bu da oturma planında hesaba katılır ve önceden koordine edilir. Aynı anda
birden fazla kuşak kutladığı için oturma düzeni ile dans alanı arasındaki denge önem
kazanır: yaşlı akrabalar olan biteni görmek ister ama doğrudan bir hoparlörün yanında
oturmak istemez. Bu ikisine birden izin veren bir salon, bu imkânı sunmayan, daha
gösterişli bir salondan daha değerlidir.

## Keşif ziyareti için soru listesi

| Konu | Binaya sorulacak soru |
|---|---|
| Alan | Davetli sayımıza göre oturma planı nasıl, geriye ne kadar dans alanı kalıyor? |
| Elektrik | Sahne tarafında kaç ayrı elektrik hattı var? |
| Teknik | Kendi ses ve ışık sistemimiz çalıştırılabilir mi? |
| Ses sınırı | Ses seviyesi sınırlayıcı kurulu mu, hangi değerde? |
| Saatler | İçeride saat kaça kadar, dışarıda saat kaça kadar? |
| Kurulum | Kurulum için binaya kaçta girilebiliyor? |
| Yükleme | Basamak, asansör, kapı genişliği, girişte durma imkânı? |
| İkram | Sabit servis saatleri mi, akışa göre koordinasyon mu? |

Bu sekiz maddeyi imzadan önce yazılı olarak netleştirmek bir e-posta kadar zaman alır ve
düğün günü doğaçlama çözüm arama ihtiyacının çoğunu ortadan kaldırır.

## Sonuç

Bir salon nadiren tekniği yüzünden seçilir ve bu da doğrudur — ilk izlenim, konum ve
atmosfer haklı olarak önce gelir. Ne var ki teknik ölçütler, sonradan değiştirilemeyen
ölçütlerdir; tam da bu yüzden düğünden önceki haftaya değil, keşif ziyaretine aittirler.
Salonu zaten görmüş olan çiftler, planlama görüşmesinde listeyi birlikte gözden
geçirebilir; Esslingen, Ludwigsburg ve Heilbronn şehir sayfaları ile Baden-Württemberg
genel sayfası, ulaşımın ve bölge bilgisinin zaten mevcut olduğu yerleri gösteriyor —
Stuttgart çevresinde 50 kilometreye kadar ulaşım dahildir. Talep sayfası üzerinden gelen
sorulara geri dönüş genellikle 24 saat içinde yapılır.
`.trim();

export const hochzeitslocationEn = `
## Why no single venue is recommended here

This article deliberately names no venue — not as a recommendation, not as a warning.
There is a straightforward reason for that: no partnership with any hall is claimed here,
and a room that is exactly right for one wedding can be the wrong one for the next. What
can honestly be passed on are the criteria that apply regardless of the building. Twelve
years and more than 200 events have turned those into a checklist that can be worked
through in about twenty minutes during a viewing.

## Capacity is not the same as dance floor

The number in the brochure describes how many people fit into the room seated — not how
many can dance at the same time. Two other measurements decide that: the floor area that
genuinely stays free once all the tables are in place, and where that area sits. A dance
floor at the far end of a long hall pulls the evening apart, because the back tables are
cut off both acoustically and visually. A central area with tables around it holds the
celebration together. So ask to see the seating plan for your own guest count, and never
judge an empty room.

## Acoustics: ceiling height, glass, hard surfaces

High ceilings, large glass fronts and bare walls produce reverb that equipment can only
correct so far — turning the volume up makes it worse, not better. Curtains, carpet, wood
and a full room absorb it. There is a dedicated article on the detail in this guide:
"Venue acoustics: what to check during a viewing". At the venue-selection stage a rough
test is enough — clap once and listen to how long the room rings.

## Power: the point most often underestimated

Sound, lighting, haze, the kitchen and the coffee machines run off the same circuit in
plenty of buildings. When a fuse trips, it is almost never the kitchen that goes quiet.
So the thing to establish is: how many separate circuits are available on the stage side,
at what rating, and can one of them be reserved exclusively for the technical setup? The
caretaker or building technician answers this reliably; the letting office often cannot.

## Load-in, routes and where the equipment stands

How far is it from the car park to the door, are there steps, is there a lift, are the
doors wide enough — and is stopping near the entrance permitted during setup and
teardown? With DJ Veys the sound and lighting equipment, including setup and teardown, is
part of the booking, but the rental agreement has to allow the time that takes. For the
stand position itself the rule is simple: a clear sightline to the dance floor, a socket
nearby, and no cable runs crossing escape routes or guest walkways.

## Closing times and noise rules — indoors and outdoors are separate questions

Indoor and outdoor areas are usually governed by different rules, and the decisive clauses
sit in the rental agreement rather than in any statute. The questions to ask: how late may
the celebration run indoors, from when does quiet apply outside, is a volume limiter
installed, and who in the building decides on exceptions? The legal framework is covered
in detail in the article "Noise protection and closing times in Baden-Württemberg".

## In-house system or bringing your own

This is where two types of building diverge. Community and village halls often come with a
basic sound system that is fine for speeches and not for a dance floor. Larger hotel
ballrooms frequently have a permanently installed system — and sometimes a contractual
condition that this specific system must be used. So the question is not "is there
equipment", but: may our own equipment be operated, and if so, from which connection
point?

## Catering timing

The transition from dinner to the dance floor is the most delicate moment of the evening.
If dessert arrives while the music is ramping up, you lose both. It is worth clarifying at
the viewing whether the kitchen works to fixed service times or stays flexible, and whether
any coordination between service and music is foreseen. A venue that answers this
routinely has solved it many times before.

## What changes for large Turkish weddings

At Turkish and German-Turkish celebrations several criteria shift noticeably. Halay is
danced in a circle or a chain, and a chain grows outwards — it needs one continuous area
with no pillar, step or platform in the middle of it. The couple's entrance needs a clear
route from the door to the floor; where live elements are involved, further people use
that same route, which has to be accounted for in the seating plan and coordinated in
advance. And because several generations celebrate at once, the balance between seating
and dance floor matters: older relatives want to see what is happening, but not sit
directly beside a speaker. A room that allows both is worth more than a handsomer hall
that does not.

## The question list for the viewing

| Topic | Question for the venue |
|---|---|
| Floor area | What does the seating plan look like for our guest count, and how much dance floor is left? |
| Power | How many separate circuits are there on the stage side? |
| Equipment | May our own sound and lighting equipment be operated? |
| Volume | Is a limiter installed, and at what level? |
| Times | How late indoors, how late outdoors? |
| Setup | From what time is access for setup possible? |
| Load-in | Steps, lift, door widths, stopping at the entrance? |
| Catering | Fixed service times, or coordinated with the running order? |

Settling these eight points in writing before signing costs one email and removes most of
the improvisation from the wedding day itself.

## Conclusion

A venue is rarely chosen for its technical qualities, and rightly so — the first
impression, the location and the feeling come first for good reason. But the technical
criteria are the ones that cannot be changed later, which is exactly why they belong in
the viewing rather than in the week before the celebration. Couples who already have a
room in mind can simply go through the list during the planning call; the city pages for
Esslingen, Ludwigsburg and Heilbronn and the Baden-Württemberg overview show where travel
and local knowledge are already in place — travel within 50 kilometres of Stuttgart is
included. Enquiries sent through the enquiry page are usually answered within 24 hours.
`.trim();

export const hochzeitslocationStuttgartEs = `
## Por qué aquí no se recomienda ningún lugar concreto

Este artículo no nombra deliberadamente ningún lugar: ni como recomendación ni como advertencia.
Hay un motivo sencillo: aquí no se afirma ninguna colaboración con ningún salón, y una sala que
es exactamente la adecuada para una boda puede ser la equivocada para la siguiente. Lo que sí
puede transmitirse con honestidad son los criterios que se aplican con independencia del
edificio. Doce años y más de 200 eventos los han convertido en una lista de comprobación que
puede repasarse en unos veinte minutos durante una visita.

## La capacidad no es lo mismo que la pista de baile

La cifra del folleto describe cuántas personas caben sentadas en la sala, no cuántas pueden
bailar a la vez. Eso lo deciden otras dos medidas: la superficie que realmente queda libre una
vez colocadas todas las mesas, y dónde está esa superficie. Una pista al fondo de un salón
alargado divide la noche, porque las mesas del fondo quedan desconectadas acústica y
visualmente. Una zona central con las mesas alrededor mantiene unida la celebración. Por eso
conviene pedir el plano de mesas para el propio número de invitados y no juzgar nunca una sala
vacía.

## Acústica: altura del techo, cristal, superficies duras

Los techos altos, las grandes cristaleras y las paredes desnudas producen una reverberación que
el equipo solo puede corregir hasta cierto punto: subir el volumen la empeora, no la mejora.
Las cortinas, las alfombras, la madera y una sala llena la absorben. Esta guía dedica un
artículo propio al detalle: «Acústica del lugar: qué comprobar en una visita». En la fase de
elección del lugar basta con una prueba aproximada: dar una palmada y escuchar cuánto tiempo
resuena la sala.

## Electricidad: el punto que más a menudo se subestima

En muchos edificios, el sonido, la iluminación, la máquina de humo, la cocina y las cafeteras
funcionan con el mismo circuito. Cuando salta un fusible, casi nunca es la cocina la que se
queda en silencio. Lo que hay que aclarar es: cuántos circuitos separados hay disponibles en el
lado del escenario, con qué potencia, y si uno de ellos puede reservarse exclusivamente para la
técnica. Esto lo responde con fiabilidad el conserje o el técnico del edificio; la oficina de
alquiler a menudo no.

## Acceso, recorridos y ubicación del equipo

¿Qué distancia hay del aparcamiento a la puerta, hay escalones, hay ascensor, son las puertas lo
bastante anchas y se permite parar cerca de la entrada durante el montaje y el desmontaje? Con
DJ Veys, el equipo de sonido e iluminación, incluidos montaje y desmontaje, forma parte de la
contratación, pero el contrato de alquiler tiene que permitir el tiempo que eso requiere. Para
la ubicación en sí, la regla es sencilla: visión directa de la pista, un enchufe cerca y ningún
cable que cruce vías de evacuación o zonas de paso de los invitados.

## Horarios de cierre y normas de ruido: interior y exterior son cuestiones distintas

Las zonas interiores y exteriores suelen regirse por normas distintas, y las cláusulas
decisivas están en el contrato de alquiler más que en cualquier ley. Las preguntas que hay que
hacer: hasta qué hora puede durar la celebración en el interior, desde cuándo rige el silencio
en el exterior, si hay instalado un limitador de volumen y quién decide en el edificio sobre las
excepciones. El marco legal se trata en detalle en el artículo «Protección contra el ruido y
horarios de cierre en Baden-Württemberg».

## Sistema propio del local o equipo traído

Aquí se separan dos tipos de edificio. Los salones municipales y de pueblo suelen contar con un
sistema de sonido básico que sirve para los discursos, pero no para una pista de baile. Los
salones de banquetes de hoteles más grandes tienen a menudo un sistema instalado de forma fija,
y a veces una condición contractual que obliga a usar precisamente ese sistema. Por eso la
pregunta no es «¿hay equipo?», sino: ¿puede utilizarse nuestro propio equipo y, en ese caso,
desde qué punto de conexión?

## El horario del catering

La transición de la cena a la pista de baile es el momento más delicado de la noche. Si el
postre llega mientras la música está subiendo, se pierden las dos cosas. Conviene aclarar en la
visita si la cocina trabaja con horarios de servicio fijos o es flexible, y si está prevista
alguna coordinación entre el servicio y la música. Un lugar que responde a esto con soltura lo
ha resuelto ya muchas veces.

## Qué cambia en las grandes bodas turcas

En las celebraciones turcas y germano-turcas, varios criterios se desplazan de forma notable.
El halay se baila en círculo o en cadena, y una cadena crece hacia fuera: necesita una
superficie continua sin columnas, escalones ni tarimas en medio. La entrada de los novios
necesita un recorrido despejado desde la puerta hasta la pista; cuando hay elementos en
directo, más personas utilizan ese mismo recorrido, lo que debe tenerse en cuenta en el plano
de mesas y coordinarse de antemano. Y como celebran varias generaciones a la vez, importa el
equilibrio entre asientos y pista: los familiares mayores quieren ver lo que pasa, pero no
sentarse justo al lado de un altavoz. Una sala que permite ambas cosas vale más que un salón más
bonito que no lo permite.

## La lista de preguntas para la visita

| Tema | Pregunta para el lugar |
|---|---|
| Superficie | ¿Cómo queda el plano de mesas para nuestro número de invitados y cuánta pista queda libre? |
| Electricidad | ¿Cuántos circuitos separados hay en el lado del escenario? |
| Equipo | ¿Puede utilizarse nuestro propio equipo de sonido e iluminación? |
| Volumen | ¿Hay un limitador instalado y a qué nivel? |
| Horarios | ¿Hasta qué hora en el interior y hasta qué hora en el exterior? |
| Montaje | ¿Desde qué hora es posible el acceso para montar? |
| Acceso | ¿Escalones, ascensor, anchura de las puertas, parada en la entrada? |
| Catering | ¿Horarios de servicio fijos o coordinados con el programa? |

Dejar por escrito estos ocho puntos antes de firmar cuesta un correo electrónico y elimina la
mayor parte de la improvisación del propio día de la boda.

## Conclusión

Un lugar rara vez se elige por sus cualidades técnicas, y con razón: la primera impresión, la
ubicación y la sensación van primero por buenos motivos. Pero los criterios técnicos son los que
no pueden cambiarse después, y precisamente por eso deben formar parte de la visita y no de la
semana anterior a la celebración. Las parejas que ya tienen una sala en mente pueden repasar la
lista en la reunión de planificación; las páginas de Esslingen, Ludwigsburg y Heilbronn y la
visión general de Baden-Württemberg muestran dónde ya hay desplazamiento y conocimiento local
asegurados: el desplazamiento dentro de 50 kilómetros de Stuttgart está incluido. Las consultas
enviadas a través de la página de solicitud suelen responderse en un plazo de 24 horas.
`.trim();

export const hochzeitslocationStuttgartFr = `
## Pourquoi aucun lieu précis n'est recommandé ici

Cet article ne cite délibérément aucun lieu, ni comme recommandation ni comme mise en garde. La
raison est simple : aucun partenariat avec une salle n'est revendiqué ici, et une salle parfaitement
adaptée à un mariage peut être la mauvaise pour le suivant. Ce que l'on peut transmettre honnêtement,
ce sont les critères qui s'appliquent quel que soit le bâtiment. Douze ans et plus de 200 événements
en ont fait une check-list que l'on peut parcourir en une vingtaine de minutes lors d'une visite.

## La capacité n'est pas la même chose que la piste de danse

Le chiffre de la brochure indique combien de personnes tiennent assises dans la salle, pas combien
peuvent danser en même temps. Deux autres mesures en décident : la surface qui reste réellement libre
une fois toutes les tables installées, et l'endroit où se trouve cette surface. Une piste au fond
d'une longue salle coupe la soirée en deux, car les tables du fond sont isolées acoustiquement et
visuellement. Une zone centrale entourée de tables maintient la fête soudée. Demandez donc à voir le
plan de table pour votre nombre d'invités, et ne jugez jamais une salle vide.

## L'acoustique : hauteur sous plafond, verre, surfaces dures

Les plafonds hauts, les grandes baies vitrées et les murs nus produisent une réverbération que le
matériel ne peut corriger que jusqu'à un certain point : monter le volume l'aggrave au lieu de
l'améliorer. Les rideaux, la moquette, le bois et une salle pleine l'absorbent. Ce guide consacre un
article spécifique au détail : « Acoustique du lieu : que vérifier lors d'une visite ». Au stade du
choix du lieu, un test approximatif suffit : frappez une fois dans vos mains et écoutez combien de
temps la salle résonne.

## L'électricité : le point le plus souvent sous-estimé

Dans de nombreux bâtiments, la sono, l'éclairage, la machine à brouillard, la cuisine et les machines
à café fonctionnent sur le même circuit. Quand un fusible saute, ce n'est presque jamais la cuisine
qui se tait. Il faut donc établir : combien de circuits séparés sont disponibles côté scène, avec
quelle puissance, et l'un d'eux peut-il être réservé exclusivement à la technique ? Le gardien ou le
technicien du bâtiment répond à cela de façon fiable ; le service de location souvent pas.

## Accès, trajets et emplacement du matériel

Quelle distance sépare le parking de la porte, y a-t-il des marches, un ascenseur, les portes
sont-elles assez larges, et le stationnement près de l'entrée est-il autorisé pendant le montage et
le démontage ? Chez DJ Veys, le matériel de sonorisation et d'éclairage, montage et démontage
compris, fait partie de la réservation, mais le contrat de location doit permettre le temps
nécessaire. Pour l'emplacement lui-même, la règle est simple : une vue dégagée sur la piste, une
prise à proximité, et aucun câble qui traverse les issues de secours ou les passages des invités.

## Heures de fermeture et règles sur le bruit : l'intérieur et l'extérieur sont deux questions distinctes

Les espaces intérieurs et extérieurs sont généralement soumis à des règles différentes, et les
clauses décisives figurent dans le contrat de location plutôt que dans une loi. Les questions à poser
: jusqu'à quelle heure la fête peut-elle durer à l'intérieur, à partir de quand le calme s'impose-t-il
à l'extérieur, un limiteur de volume est-il installé, et qui décide des exceptions dans le bâtiment ?
Le cadre légal est traité en détail dans l'article « Protection contre le bruit et heures de
fermeture dans le Bade-Wurtemberg ».

## Système de la salle ou matériel apporté

C'est ici que deux types de bâtiments se distinguent. Les salles communales et des fêtes disposent
souvent d'une sonorisation de base qui convient aux discours, mais pas à une piste de danse. Les
grandes salles de réception d'hôtels ont fréquemment un système installé à demeure, et parfois une
condition contractuelle imposant l'utilisation de ce système précis. La question n'est donc pas « y
a-t-il du matériel ? », mais : pouvons-nous utiliser notre propre matériel, et si oui, à partir de
quel point de raccordement ?

## Le timing du traiteur

Le passage du dîner à la piste de danse est le moment le plus délicat de la soirée. Si le dessert
arrive pendant que la musique monte en puissance, on perd les deux. Il vaut la peine de clarifier lors
de la visite si la cuisine travaille avec des horaires de service fixes ou reste flexible, et si une
coordination entre le service et la musique est prévue. Un lieu qui répond à cela avec aisance l'a
déjà résolu de nombreuses fois.

## Ce qui change pour les grands mariages turcs

Lors des fêtes turques et germano-turques, plusieurs critères évoluent sensiblement. Le halay se
danse en cercle ou en chaîne, et une chaîne grandit vers l'extérieur : il lui faut une surface
continue sans pilier, marche ni estrade au milieu. L'entrée du couple nécessite un passage dégagé de
la porte jusqu'à la piste ; lorsqu'il y a des éléments live, d'autres personnes empruntent ce même
passage, ce qui doit être pris en compte dans le plan de table et coordonné à l'avance. Et comme
plusieurs générations font la fête en même temps, l'équilibre entre places assises et piste compte :
les parents âgés veulent voir ce qui se passe, mais pas être assis juste à côté d'une enceinte. Une
salle qui permet les deux vaut plus qu'une salle plus belle qui ne le permet pas.

## La liste de questions pour la visite

| Thème | Question pour le lieu |
|---|---|
| Surface | À quoi ressemble le plan de table pour notre nombre d'invités, et combien de piste reste-t-il ? |
| Électricité | Combien de circuits séparés y a-t-il côté scène ? |
| Matériel | Pouvons-nous utiliser notre propre matériel de sonorisation et d'éclairage ? |
| Volume | Un limiteur est-il installé, et à quel niveau ? |
| Horaires | Jusqu'à quelle heure à l'intérieur, jusqu'à quelle heure à l'extérieur ? |
| Montage | À partir de quelle heure l'accès pour le montage est-il possible ? |
| Accès | Marches, ascenseur, largeur des portes, arrêt devant l'entrée ? |
| Traiteur | Horaires de service fixes, ou coordonnés avec le programme ? |

Régler ces huit points par écrit avant de signer coûte un e-mail et supprime la majeure partie de
l'improvisation le jour du mariage.

## Conclusion

On choisit rarement un lieu pour ses qualités techniques, et c'est normal : la première impression,
l'emplacement et le ressenti passent en premier pour de bonnes raisons. Mais les critères techniques
sont ceux que l'on ne peut plus changer ensuite, et c'est précisément pour cela qu'ils ont leur place
lors de la visite et non la semaine précédant la fête. Les couples qui ont déjà une salle en tête
peuvent simplement parcourir la liste lors de l'entretien de préparation ; les pages consacrées à
Esslingen, Ludwigsburg et Heilbronn ainsi que la vue d'ensemble du Bade-Wurtemberg montrent où le
déplacement et la connaissance locale sont déjà acquis : le déplacement dans un rayon de 50
kilomètres autour de Stuttgart est inclus. Les demandes envoyées via la page de demande reçoivent
généralement une réponse sous 24 heures.
`.trim();

export const hochzeitslocationStuttgartPost: BlogPost = {
  id: 'hochzeitslocation-stuttgart-dj-perspektive',
  slug: 'hochzeitslocation-stuttgart-dj-perspektive',
  category: 'planung',
  type: 'guide',
  status: 'published',
  publishedAt: '2026-08-23',
  updatedAt: '2026-08-23',
  tags: ['location', 'planung', 'besichtigung', 'technik', 'stuttgart'],
  readingTimeMinutes: 5,
  links: ['/hochzeits-dj-baden-wuerttemberg', '/anfrage'],
  relatedAnswers: ['power-requirements', 'venue-site-visit', 'outdoor-weather'],
  relatedCities: ['esslingen', 'ludwigsburg', 'heilbronn'],
  relatedPosts: ['location-akustik-checkliste', 'laermschutz-sperrzeiten-baden-wuerttemberg'],
  translations: {
    de: {
      title: 'Hochzeitslocation in Stuttgart und Region: worauf Sie aus DJ-Sicht achten sollten',
      excerpt:
        'Kapazität, Tanzfläche, Strom, Akustik und Sperrzeit entscheiden über den Abend, lange bevor die Deko steht. Dieser Guide fasst die acht Kriterien zusammen, die ein DJ bei einer Hochzeitslocation im Raum Stuttgart tatsächlich prüft — samt Fragenliste für die Besichtigung. Eine konkrete Halle wird bewusst nicht empfohlen.',
      body: hochzeitslocationDe,
      seo: {
        metaTitle: 'Hochzeitslocation Stuttgart: DJ-Checkliste | DJ Veys',
        metaDescription:
          'Kapazität, Tanzfläche, Strom, Akustik und Sperrzeit: die Kriterien, die ein DJ bei einer Hochzeitslocation im Raum Stuttgart wirklich prüft.',
      },
    },
    tr: {
      slug: 'stuttgart-dugun-salonu-secimi',
      title: 'Stuttgart\'ta düğün salonu seçimi: bir DJ neye bakar',
      excerpt:
        'Kapasite, dans alanı, elektrik, akustik ve kapanış saati, daha dekor kurulmadan akşamın kaderini belirler. Bu rehber, bir DJ\'in Stuttgart bölgesinde bir düğün salonunda gerçekten kontrol ettiği sekiz ölçütü ve keşif ziyareti için bir soru listesini bir araya getiriyor. Belirli bir salon bilinçli olarak önerilmiyor.',
      body: hochzeitslocationTr,
      seo: {
        metaTitle: 'Stuttgart\'ta Düğün Salonu Seçimi | DJ Veys',
        metaDescription:
          'Kapasite, dans alanı, elektrik, akustik ve kapanış saati: bir DJ, Stuttgart bölgesinde düğün salonu seçerken gerçekte neye bakar?',
      },
    },
    en: {
      slug: 'wedding-venue-stuttgart-dj-perspective',
      title: 'Choosing a wedding venue near Stuttgart: what a DJ checks',
      excerpt:
        'Capacity, dance floor, power, acoustics and closing times shape the evening long before the decor goes up. This guide collects the eight criteria a DJ actually checks at a wedding venue in the Stuttgart region, plus a question list for the viewing. No specific hall is recommended, on purpose.',
      body: hochzeitslocationEn,
      seo: {
        metaTitle: 'Wedding Venue Stuttgart: DJ Checklist | DJ Veys',
        metaDescription:
          'Capacity, dance floor, power, acoustics and closing times: the criteria a DJ actually checks when you choose a wedding venue near Stuttgart.',
      },
    },
    es: {
      slug: 'elegir-lugar-de-boda-stuttgart-perspectiva-dj',
      title: 'Elegir el lugar de la boda cerca de Stuttgart: lo que comprueba un DJ',
      excerpt:
        'La capacidad, la pista de baile, la electricidad, la acústica y los horarios de cierre dan forma a la noche mucho antes de que se coloque la decoración. Esta guía reúne los ocho criterios que un DJ comprueba de verdad en un lugar de boda de la región de Stuttgart, junto con una lista de preguntas para la visita. A propósito, no se recomienda ningún salón concreto.',
      body: hochzeitslocationStuttgartEs,
      seo: {
        metaTitle: 'Lugar de boda cerca de Stuttgart: la visión del DJ | DJ Veys',
        metaDescription:
          'Qué comprobar al elegir un lugar de boda cerca de Stuttgart: pista, acústica, electricidad, horarios y preguntas para la visita.',
      },
    },
    fr: {
      slug: 'choisir-lieu-mariage-stuttgart-regard-dj',
      title: 'Choisir un lieu de mariage près de Stuttgart : ce que vérifie un DJ',
      excerpt:
        'La capacité, la piste de danse, l\'électricité, l\'acoustique et les heures de fermeture façonnent la soirée bien avant l\'installation de la décoration. Ce guide rassemble les huit critères qu\'un DJ vérifie réellement dans un lieu de mariage de la région de Stuttgart, avec une liste de questions pour la visite. Aucune salle précise n\'est recommandée, délibérément.',
      body: hochzeitslocationStuttgartFr,
      seo: {
        metaTitle: 'Lieu de mariage près de Stuttgart : le regard du DJ | DJ Veys',
        metaDescription:
          'Que vérifier en choisissant un lieu de mariage près de Stuttgart : piste, acoustique, électricité, horaires et questions pour la visite.',
      },
    },
  },
};
