import type { BlogPost } from './types';

/**
 * Primary keyword (DE): "lieder bei hochzeit" (Keyword Planner 5 000/Monat) /
 * "musik für die hochzeit" (500/Monat, fünf Varianten) — siehe
 * docs/SEO-KEYWORD-MAP.md §00, wo dieser Cluster als einzige Lücke ohne Seite stand.
 *
 * Herkunft der Titel: Keine Liste hier ist eine Statistik und keine behauptet,
 * „die meistgespielten" zu sein. Jeder Titel stammt aus mindestens einer öffentlichen
 * Hochzeits-/Halay-Liste (Recherche 2026-10-27: Milliyet-Halayliste, Spotify-
 * Hochzeitsplaylist-Auswertung via log.com.tr, Holzschuh „Deutsche Party-Hits",
 * kuechenfibel.de) oder ist ein allgemein dokumentiertes Volkslied. Interpreten
 * stehen nur dort, wo die Zuordnung belegt ist — bei Volksliedern steht „trad.".
 * Veysel soll die Listen gegen seine eigenen Sets prüfen; danach dürfen sie als
 * „aus unseren Sets" formuliert werden, vorher nicht (.claude/BRAND-FACTS.md).
 *
 * Keine Liedtexte, nur Titel und Interpreten.
 */
export const musikHochzeitDe = `
## Welche Musik auf einer Hochzeit läuft, hängt an der Kultur — nicht am Geschmack

Auf einer deutschen Hochzeit wartet die Tanzfläche auf „Atemlos", auf einer türkischen
auf den ersten Halay, auf einer kurdischen auf Delilo. Wer zwei Familien mit
unterschiedlichen Hintergründen an einem Abend zusammenbringt, braucht deshalb nicht
eine Playlist, sondern mehrere — und einen DJ, der weiß, wann welche davon dran ist.

Die drei Listen unten sind **Klassiker, die auf solchen Hochzeiten immer wieder laufen**,
keine Rangliste. Sie sind als Startpunkt für die eigene Musikplanung gedacht, nicht als
Pflichtprogramm.

## Türkische Hochzeit: zehn Klassiker

| Titel | Interpret | Typischer Moment |
|---|---|---|
| Yüksek Yüksek Tepelere | trad. | Kına Gecesi — das Kına-Lied schlechthin |
| Damat Halayı | trad. | Halay für den Bräutigam |
| Halayımız Bitmesin | Yurtseven Kardeşler | Halay-Block |
| Kara Üzüm Habbesi | Kardeş Türküler | Halay-Block |
| Erik Dalı | trad. (Gaziantep) | Oyun havası, früh am Abend |
| Ankara'nın Bağları | trad. (Ankara) | Oyun havası |
| Misket | trad. (Ankara) | Oyun havası |
| Kasap Havası | trad. (Thrakien) | Roman-Block |
| Rakkas | Sezen Aksu | Pop-Block, alle Generationen |
| Gül Döktüm Yollarına | Tarkan | Pop-Block |

Auf einer türkischen Hochzeit wechseln sich Blöcke ab: Halay, Oyun havası, Roman havası
und türkischer Pop. Ein Block dauert meist zehn bis zwanzig Minuten. Was zwischen
Halay und Roman havası genau der Unterschied ist, erklärt der Ratgeber zu Davul-Zurna,
Halay und Roman Havası.

## Kurdische Hochzeit: acht Klassiker

| Titel | Interpret | Typischer Moment |
|---|---|---|
| Delilo | trad. (u. a. İzzet Yıldızhan) | Erster Govend, öffnet die Tanzfläche |
| Şemame (Sexanî) | trad. (u. a. İbrahim Tatlıses) | Schneller Govend |
| Lorke Lorke | Beşir Kaya | Halay-Block |
| Le Buke | Rojda | Hochzeitslied, Einzug oder Govend |
| Zer Mircan | Agire Jiyan | Govend |
| Şilele | Servet Kocakaya | Govend |
| Midigo Me | Maral | Govend |
| Govenda Azadî | Şivan Perwer | Späterer Govend-Block |

Hier stehen bewusst acht statt zehn Titel: Kurdische Hochzeitsmusik ist stark regional
— Govend aus Amed klingt anders als aus Serhat oder Behdinan —, und eine allgemeine
Top-10 würde eine Einheitlichkeit behaupten, die es nicht gibt. Welche Region die Familie
prägt, ist deshalb eine der ersten Fragen im Vorgespräch.

## Deutsche Hochzeit: zehn Klassiker

| Titel | Interpret | Typischer Moment |
|---|---|---|
| Atemlos durch die Nacht | Helene Fischer | Peaktime |
| Die immer lacht | Stereoact feat. Kerstin Ott | Peaktime |
| Hulapalu | Andreas Gabalier | Peaktime |
| Cordula Grün | Josh. | Peaktime, alle singen mit |
| Ein Stern (der deinen Namen trägt) | DJ Ötzi & Nik P. | Schlager-Block |
| Skandal im Sperrbezirk | Spider Murphy Gang | 80er-Block |
| 99 Luftballons | Nena | 80er-Block |
| Major Tom (völlig losgelöst) | Peter Schilling | 80er-Block |
| Tage wie diese | Die Toten Hosen | Später Abend |
| Auf uns | Andreas Bourani | Gemeinsamer Moment, oft kurz vor Mitternacht |

## Deutsch-türkisch, deutsch-kurdisch: die Mischung ist die eigentliche Aufgabe

Bei einer gemischten Hochzeit ist keine der drei Listen allein richtig. Was sich bewährt:

- **Blöcke statt Zufallsmix.** Ein Halay-Block, dann ein deutscher Block, dann wieder
  zurück — jede Familie weiß, wann „ihre" Musik kommt, und keine Tanzfläche bricht
  nach einem einzelnen fremden Song ab.
- **Brücken-Songs an den Übergängen.** Türkischer Pop wie Tarkan funktioniert oft bei
  beiden Familien und eignet sich als Übergang zwischen den Welten.
- **Moderation auf beiden Sprachen.** Ein Satz vor dem ersten Halay („jetzt tanzen alle
  mit, auch wer es noch nie gemacht hat") holt die deutsche Seite auf die Tanzfläche.

## So wird aus der Liste Ihre Liste

Die Titel oben sind ein Ausgangspunkt. Für den eigenen Abend lohnt sich eine kurze
Wunschliste pro Familie und eine klare No-Go-Liste — wie man beides aufbaut, steht im
Ratgeber zu Musikwünschen und No-Go-Liste. Für den Eröffnungstanz gibt es einen eigenen
Ratgeber zur Songauswahl.

Welche Blöcke wann laufen, welche Region bei der kurdischen Musik gemeint ist und welche
Titel auf keinen Fall gespielt werden sollen, klären wir im Vorgespräch — die Anfrage
dafür ist unverbindlich.
`.trim();

export const musikHochzeitTr = `
## Düğünde hangi müziğin çalacağını zevk değil, kültür belirler

Alman düğününde dans pisti "Atemlos"u bekler, Türk düğününde ilk halayı, Kürt düğününde
Delilo'yu. Farklı kökenlerden iki aileyi aynı akşamda bir araya getirecekseniz, tek bir
çalma listesine değil birkaçına — ve hangisinin ne zaman çalacağını bilen bir DJ'e —
ihtiyacınız var.

Aşağıdaki üç liste bir sıralama değil, **bu düğünlerde tekrar tekrar çalınan
klasikler**. Kendi müzik planınız için bir başlangıç noktası, zorunlu program değil.

## Türk düğünü: on klasik

| Şarkı | Sanatçı | Tipik an |
|---|---|---|
| Yüksek Yüksek Tepelere | anonim | Kına gecesi |
| Damat Halayı | anonim | Damat için halay |
| Halayımız Bitmesin | Yurtseven Kardeşler | Halay bölümü |
| Kara Üzüm Habbesi | Kardeş Türküler | Halay bölümü |
| Erik Dalı | anonim (Gaziantep) | Oyun havası |
| Ankara'nın Bağları | anonim (Ankara) | Oyun havası |
| Misket | anonim (Ankara) | Oyun havası |
| Kasap Havası | anonim (Trakya) | Roman bölümü |
| Rakkas | Sezen Aksu | Pop bölümü |
| Gül Döktüm Yollarına | Tarkan | Pop bölümü |

## Kürt düğünü: sekiz klasik

| Şarkı | Sanatçı | Tipik an |
|---|---|---|
| Delilo | anonim (İzzet Yıldızhan vb.) | İlk govend |
| Şemame (Sexanî) | anonim (İbrahim Tatlıses vb.) | Hızlı govend |
| Lorke Lorke | Beşir Kaya | Halay bölümü |
| Le Buke | Rojda | Giriş ya da govend |
| Zer Mircan | Agire Jiyan | Govend |
| Şilele | Servet Kocakaya | Govend |
| Midigo Me | Maral | Govend |
| Govenda Azadî | Şivan Perwer | Geç govend bölümü |

Burada bilerek on değil sekiz şarkı var: Kürt düğün müziği bölgeden bölgeye çok değişir
ve genel bir "ilk 10" listesi, olmayan bir birlik iddia ederdi. Ailenin hangi yöreden
olduğu bu yüzden ön görüşmedeki ilk sorulardan biri.

## Alman düğünü: on klasik

| Şarkı | Sanatçı | Tipik an |
|---|---|---|
| Atemlos durch die Nacht | Helene Fischer | Zirve |
| Die immer lacht | Stereoact feat. Kerstin Ott | Zirve |
| Hulapalu | Andreas Gabalier | Zirve |
| Cordula Grün | Josh. | Zirve |
| Ein Stern (der deinen Namen trägt) | DJ Ötzi & Nik P. | Schlager bölümü |
| Skandal im Sperrbezirk | Spider Murphy Gang | 80'ler bölümü |
| 99 Luftballons | Nena | 80'ler bölümü |
| Major Tom (völlig losgelöst) | Peter Schilling | 80'ler bölümü |
| Tage wie diese | Die Toten Hosen | Gece geç saat |
| Auf uns | Andreas Bourani | Gece yarısına doğru ortak an |

## Karma düğünde asıl iş karışımı kurmak

- **Rastgele karışım değil, bölümler.** Önce halay, sonra Almanca bölüm, sonra yine
  halay — her aile kendi müziğinin ne zaman geleceğini bilir.
- **Geçişlerde köprü şarkılar.** Tarkan gibi Türkçe pop çoğu zaman iki ailede de
  karşılık bulur.
- **İki dilde sunum.** İlk halaydan önce tek bir cümle, Alman tarafını da piste getirir.

Hangi bölümün ne zaman çalacağını, Kürt müziğinde hangi yörenin kastedildiğini ve
kesinlikle çalınmaması gereken şarkıları ön görüşmede birlikte netleştiriyoruz.
`.trim();

export const musikHochzeitEn = `
## What plays at a wedding depends on culture, not taste

At a German wedding the dance floor waits for "Atemlos", at a Turkish one for the first
halay, at a Kurdish one for Delilo. Bringing two families with different backgrounds
together in one evening takes not one playlist but several — and a DJ who knows when
each one is due.

The three lists below are **classics that come up again and again at these weddings**,
not a ranking. Treat them as a starting point for your own music planning.

## Turkish wedding: ten classics

| Song | Artist | Typical moment |
|---|---|---|
| Yüksek Yüksek Tepelere | trad. | Henna night (kına gecesi) |
| Damat Halayı | trad. | Halay for the groom |
| Halayımız Bitmesin | Yurtseven Kardeşler | Halay block |
| Kara Üzüm Habbesi | Kardeş Türküler | Halay block |
| Erik Dalı | trad. (Gaziantep) | Oyun havası |
| Ankara'nın Bağları | trad. (Ankara) | Oyun havası |
| Misket | trad. (Ankara) | Oyun havası |
| Kasap Havası | trad. (Thrace) | Roman block |
| Rakkas | Sezen Aksu | Pop block |
| Gül Döktüm Yollarına | Tarkan | Pop block |

## Kurdish wedding: eight classics

| Song | Artist | Typical moment |
|---|---|---|
| Delilo | trad. (e.g. İzzet Yıldızhan) | First govend |
| Şemame (Sexanî) | trad. (e.g. İbrahim Tatlıses) | Fast govend |
| Lorke Lorke | Beşir Kaya | Halay block |
| Le Buke | Rojda | Entrance or govend |
| Zer Mircan | Agire Jiyan | Govend |
| Şilele | Servet Kocakaya | Govend |
| Midigo Me | Maral | Govend |
| Govenda Azadî | Şivan Perwer | Later govend block |

Eight rather than ten on purpose: Kurdish wedding music is strongly regional, and a
generic top ten would claim a uniformity that does not exist. Which region shapes the
family is one of the first questions in the planning call.

## German wedding: ten classics

| Song | Artist | Typical moment |
|---|---|---|
| Atemlos durch die Nacht | Helene Fischer | Peak time |
| Die immer lacht | Stereoact feat. Kerstin Ott | Peak time |
| Hulapalu | Andreas Gabalier | Peak time |
| Cordula Grün | Josh. | Peak time |
| Ein Stern (der deinen Namen trägt) | DJ Ötzi & Nik P. | Schlager block |
| Skandal im Sperrbezirk | Spider Murphy Gang | 80s block |
| 99 Luftballons | Nena | 80s block |
| Major Tom (völlig losgelöst) | Peter Schilling | 80s block |
| Tage wie diese | Die Toten Hosen | Late evening |
| Auf uns | Andreas Bourani | Shared moment near midnight |

## Mixed weddings: the blend is the real job

- **Blocks, not a random shuffle.** Halay, then a German block, then back — each family
  knows when "their" music is coming.
- **Bridge songs at the transitions.** Turkish pop such as Tarkan often lands with both
  families.
- **Hosting in both languages.** One sentence before the first halay gets the German
  side onto the dance floor too.

Which blocks run when, which region the Kurdish music should come from and what must
never be played — we settle that in the planning call.
`.trim();

export const musikHochzeitPost: BlogPost = {
  id: 'musik-fuer-die-hochzeit-lieder',
  slug: 'musik-fuer-die-hochzeit-lieder',
  category: 'musik',
  type: 'guide',
  status: 'published',
  publishedAt: '2026-10-27',
  updatedAt: '2026-10-27',
  tags: ['musik', 'playlist', 'tuerkische-hochzeit', 'kurdische-hochzeit', 'deutsch-tuerkisch'],
  readingTimeMinutes: 5,
  links: ['/tuerkische-hochzeit', '/kurdische-hochzeit', '/deutsch-tuerkische-hochzeit', '/anfrage'],
  relatedPosts: [
    'davul-zurna-halay-roman-havasi',
    'musikwuensche-no-go-liste',
    'eroeffnungstanz-songauswahl',
    'kina-gecesi-henna-abend-planen',
  ],
  translations: {
    de: {
      title: 'Musik für die Hochzeit: Lieder für türkische, kurdische und deutsche Hochzeiten',
      excerpt:
        'Welche Lieder laufen auf einer Hochzeit? Das hängt an der Kultur: Halay und Tarkan auf der türkischen, Delilo und Govend auf der kurdischen, „Atemlos" und Schlager auf der deutschen. Hier sind die Klassiker aller drei — und wie man sie auf einer gemischten Hochzeit verbindet.',
      body: musikHochzeitDe,
      seo: {
        metaTitle: 'Hochzeitslieder: türkisch, kurdisch & deutsch | DJ Veys',
        metaDescription:
          'Musik für die Hochzeit: Klassiker für türkische, kurdische und deutsche Hochzeiten — Halay, Govend, Schlager — und wie man sie gemischt verbindet.',
      },
    },
    tr: {
      slug: 'dugun-sarkilari-listesi',
      title: 'Düğün şarkıları: Türk, Kürt ve Alman düğünlerinin klasikleri',
      excerpt:
        'Düğünde hangi şarkılar çalar? Kültüre bağlı: Türk düğününde halay ve Tarkan, Kürt düğününde Delilo ve govend, Alman düğününde "Atemlos" ve Schlager. Üçünün klasikleri ve karma bir düğünde nasıl birleştirildikleri.',
      body: musikHochzeitTr,
      seo: {
        metaTitle: 'Düğün Şarkıları: Türk, Kürt ve Alman Düğünü | DJ Veys',
        metaDescription:
          'Türk, Kürt ve Alman düğünlerinde tekrar tekrar çalınan klasikler — halay, govend, Schlager — ve karma düğünde nasıl birleştirildikleri.',
      },
    },
    en: {
      slug: 'wedding-songs-turkish-kurdish-german',
      title: 'Wedding music: the classics at Turkish, Kurdish and German weddings',
      excerpt:
        'Which songs play at a wedding? It depends on the culture: halay and Tarkan at a Turkish wedding, Delilo and govend at a Kurdish one, "Atemlos" and Schlager at a German one. Here are the classics of all three — and how to blend them at a mixed wedding.',
      body: musikHochzeitEn,
      seo: {
        metaTitle: 'Wedding Songs: Turkish, Kurdish & German | DJ Veys',
        metaDescription:
          'Classics that come up again and again at Turkish, Kurdish and German weddings — halay, govend, Schlager — and how to blend them at a mixed celebration.',
      },
    },
  },
};
