# Kleinanzeigen Watcher — yeni ilan alarmı

Belirlediğin bir Kleinanzeigen arama URL'sini sürekli tarar, **yeni düşen ilanı**
saniyeler içinde Telegram'dan sana gönderir. Amaç basit: ilana ilk yazan sen ol.

Bu araç web sitesinden tamamen bağımsız çalışır — Next.js'e dokunmaz, hiçbir
harici paket kurmaz (sadece Node 24'ün kendi `fetch`'i).

---

## 1. Telegram botunu oluştur

1. Telegram'da **[@BotFather](https://t.me/BotFather)**'a yaz: `/newbot`
2. Bot için bir isim ve kullanıcı adı ver.
3. BotFather sana `123456789:AAF...` şeklinde bir **token** verir.
4. **Kendi botuna** Telegram'dan bir mesaj at (`/start`). Bu şart — bot, önce
   kendisine yazılmamış birine mesaj gönderemez.

Token'ı `.env` dosyasına koy:

```bash
cd tools/kleinanzeigen-watcher
cp .env.example .env
```

`.env` içindeki satırı kendi token'ınla değiştir:

```
TELEGRAM_BOT_TOKEN=123456789:AAF...
```

> `.env` ve `watches.json` `.gitignore`'da — token'ın repoya girmez.

## 2. Chat ID'ni öğren

```bash
node watcher.mjs --chat-id
```

Bota yazdığın mesaj sayesinde chat ID'n listelenir. (Boş çıkarsa bota bir mesaj
atıp komutu tekrarla.)

## 3. Aramanı ekle

En kolayı komut satırından:

```bash
node watcher.mjs --add "https://www.kleinanzeigen.de/s-fahrraeder/freiburg-im-breisgau/bulls/k0c217l9354r20" --max-price 400 --private-only
```

Bu komut `watches.json` yoksa oluşturur, arama için otomatik bir isim üretir ve
**hemen bir deneme çekimi yapıp kaç ilan bulduğunu söyler** — URL'nin gerçekten
çalıştığını günlerce beklemeden görürsün:

```
Aufgenommen als "freiburg-im-breisgau-bulls": freiburg im breisgau · bulls · fahrraeder
  alle 60s  ·  bis 400 €, nur privat
  Probeabruf: 25 Anzeigen auf Seite 1, davon 19 nach Filter.
```

**URL'yi nasıl alırsın:** Kleinanzeigen'de aramanı normal şekilde yap (kelime,
şehir, yarıçap, kategori — hepsi URL'ye işlenir), tarayıcının adres çubuğundaki
adresi olduğu gibi kopyala. Araç sıralamayı otomatik olarak "en yeni"ye çevirir.

Sonra chat ID'ni `watches.json` içindeki `chatId` alanına yaz.

<details>
<summary>Alternatif: dosyayı elle düzenle</summary>

```bash
cp watches.example.json watches.json
```

`watches.json` içine chat ID'ni ve izlemek istediğin arama URL'sini yaz:

```json
{
  "telegram": { "chatId": "123456789" },
  "watches": [
    {
      "id": "bulls-freiburg",
      "label": "Bulls Fahrräder Freiburg (20 km)",
      "url": "https://www.kleinanzeigen.de/s-fahrraeder/freiburg-im-breisgau/bulls/k0c217l9354r20",
      "intervalSeconds": 60,
      "filters": {
        "maxPrice": 400,
        "titleExclude": ["defekt", "bastler"],
        "skipCommercial": true
      }
    }
  ]
}
```

</details>

## 4. Çalıştır

Önce gerçekten ne yakaladığını gör (Telegram'a hiçbir şey gitmez):

```bash
node watcher.mjs --once --dry-run
```

Sonra sürekli izlemeye al:

```bash
node watcher.mjs
```

Durdurmak için `Ctrl+C` — kaldığı yeri kaydeder.

---

## Nasıl çalışıyor

- Her turda arama sayfasını çeker ve ilanları `data-adid` ile kimliklendirir.
- Görülen ID'ler `state.json`'a yazılır; **aynı ilan iki kez gönderilmez.**
- **İlk çalıştırma sessizdir:** o anda listede olan ilanlar "yeni" sayılmaz,
  sadece hafızaya alınır. Yoksa başlar başlamaz 25 mesaj yerdin.
- Sonraki turlarda listeye giren her yeni ID alarm üretir.
- İlanlar eskiden yeniye sıralı gönderilir, böylece sohbetteki sıra gerçek
  sırayla aynı olur.

## İlanı doğrudan uygulamada açmak

Her alarmda tek bir link var: **📱 In der App oeffnen**. Tarayıcı linki bilerek
kaldırıldı — Telegram onu kendi gömülü tarayıcısında açıyordu, yani tam da giriş
yapman gereken yerde. Yanlış linke dokunmak en hızlı cevabı kaçırtıyordu.

Link kendi domainimizdeki bir köprü sayfasına gider
([src/app/api/ka/[...path]/route.ts](../../src/app/api/ka/%5B...path%5D/route.ts)),
o sayfa da `ebayk://` şemasına atlayarak Kleinanzeigen uygulamasını açar.

**Neden bu dolambaç gerekiyor:**

- Mesaja doğrudan `ebayk://` linki koymak olmuyor — Bot API kabul ediyor ama
  iOS istemcisi onu tıklanabilir yapmıyor (cihazda denendi).
- Normal `https://` linki de uygulamayı açmıyor. Telegram onu
  `[WKWebView loadRequest:]` ile yüklüyor, WebKit bu yola
  `ShouldAllowExternalSchemesButNotAppLinks` veriyor — yani iOS Universal
  Links bu yükleme için tanımı gereği kapalı.
- Ama Telegram'ın gömülü tarayıcısı, şeması `http/https/tonsite/about`
  **dışında** olan her navigasyonu iptal edip
  `openExternalUrl(…, forceExternal: true)` → `UIApplication.shared.open()`
  çağırıyor (`BrowserWebContent.swift`). Sayfanın *içinden* `ebayk://`
  çağırmak bu yüzden işe yarıyor.

Köprü sayfası üç katmanlı, çünkü ilk katman her yerde tutmayabilir:

1. Gövdenin sonunda çalışan script hemen `ebayk://` adresine gider — **sıfır
   dokunuş**, tuttuğunda.
2. Tutmazsa ekranı kaplayan bir düğme duruyor; ona dokunmak gerçek bir kullanıcı
   hareketi, yani en güvenilir yol.
3. En altta normal `https://` linki — uygulama kurulu değilse tek çalışan yol.

> Script `<head>`'de değil, gövdenin sonunda. `<head>`'de denendiğinde sayfa
> hiç çizilmeden bekleyen bir navigasyonda asılı kalıyor; uygulama kurulu
> olmayan bir cihazda sonuç boş ekran olurdu.

Köprü, `watches.json` içindeki `bridgeBaseUrl` ile açılır:

```json
"telegram": { "chatId": "...", "bridgeBaseUrl": "https://dj-veys.de" }
```

Boş bırakırsan watcher aynen çalışır; köprü olmadığı için mesajda tek bir normal
`https://` link kalır — linksiz bir alarmın hiçbir faydası olmazdı.

### Hazır ilk mesaj

Bir şablon tanımlarsan köprüye dokunmak **hem metni panoya kopyalar hem
uygulamayı açar**. Uygulamada mesaj kutusuna basılı tutup Yapıştır demen yeter.

```json
"messageTemplate": "Hallo, ist \"{title}\" noch verfügbar? Ich hätte Interesse und könnte es kurzfristig abholen. Viele Grüße"
```

Yer tutucular: `{title}`, `{price}`, `{location}`, `{url}`. Bilinmeyen bir yer
tutucu olduğu gibi kalır — yazım hatası sessizce boşluk bırakmasın diye.

Varsayılan şablon bilerek **pazarlıksız**. İlk mesajda fiyat kırmak, "ilk yazan"
avantajını yer: satıcı düşünür, başka teklifleri bekler, geç cevap verir. İki
cümle — müsait mi, hızlı alırım — en hızlı cevabı getiren biçim.

Her aramaya ayrı şablon verebilirsin (`watches[].messageTemplate`). Boş string
(`""`) o arama için şablonu kapatır; alanı hiç yazmazsan genel şablon geçerli
olur.

> Şablon varken köprü sayfası **otomatik atlamaz.** Panoya yazmak bir kullanıcı
> hareketi gerektiriyor; otomatik atlasaydı uygulamaya boş panoyla düşerdin.
> Bir dokunuş ikisini birden yapar.

**Alternatif (kod gerektirmez):** Telegram'ın gömülü tarayıcısını kapatırsan
normal `https://` linki de uygulamayı açar — Kleinanzeigen hem iOS Universal
Links hem Android App Links yayınlıyor. Telegram → Ayarlar → "browser" diye
ara → In-App Browser'ı kapat. Bu, sadece bottan gelenleri değil bütün
linkleri düzeltir.

## Filtreler

Her arama kendi `filters` bloğuna sahip. Hepsi isteğe bağlı:

| Alan | Anlamı |
| --- | --- |
| `minPrice` / `maxPrice` | Fiyat aralığı (sayı, € cinsinden). `"Zu verschenken"` = 0 sayılır. |
| `titleMustInclude` | Başlıkta bu kelimelerden **en az biri** geçmeli. Boş = herkese açık. |
| `titleExclude` | Bu kelimelerden biri geçiyorsa ilanı atla (`"defekt"`, `"bastler"` …). |
| `skipCommercial` | `true` ise mağaza/PRO satıcıları atla, sadece özel kişiler gelsin. |
| `skipTopAds` | Parayla üste sabitlenmiş "Top-Anzeige"leri atla. Varsayılan `true` — bunlar eskidir. |
| `allowMissingPrice` | Fiyatı yazmayan ("VB") ilanlar fiyat filtresine takılmasın. Varsayılan `true`. |

## Bot üzerinden yönetim (en pratik yol)

Sunucuya hiç girmeden, doğrudan Telegram'dan yönetebilirsin.

**Arama eklemek:** Kleinanzeigen'de aramanı yap, adres çubuğundaki URL'yi
kopyala ve **bota gönder.** Hepsi bu. Bot aramayı ekler, hemen bir deneme
çekimi yapıp kaç ilan bulduğunu söyler ve izlemeye başlar.

URL'nin arkasına isteğe bağlı olarak şunları yazabilirsin (telefonda kolay
olsun diye kelimelerle, tire tire seçeneklerle değil):

```
https://www.kleinanzeigen.de/s-fahrraeder/... max 300 privat ohne defekt,bastler
```

| Ek | Anlamı |
| --- | --- |
| `max 300` | En fazla 300 € |
| `min 50` | En az 50 € |
| `privat` | Mağaza/PRO satıcıları atla |
| `ohne defekt,bastler` | Başlıkta bu kelimeler geçerse atla |
| `plz 79` | **Sadece 79 ile başlayan posta kodları** |

| `takt 30` | 60 yerine 30 saniyede bir tara (en az 15) |

**Aramaları yönetmek:** `/list` yaz. Her arama kendi mesajında gelir, altında
üç düğmeyle:

| Düğme | Ne yapar |
| --- | --- |
| ⏱ **Takt** | Tarama aralığını değiştirir — 30s / 60s / 2dk / 5dk / 15dk arasından dokunarak seç |
| ✏️ **Text** | O aramaya özel ilk mesaj metnini ayarlar |
| 🗑 **Löschen** | Aramayı siler |

**✏️ Text**'e dokununca bot metni sorar; **o mesajı yanıtlayarak** gönderirsin.
`{title}` `{price}` `{location}` yer tutucuları kullanılabilir. Yanıt olarak
`-` yazarsan o arama için kopyalama kapanır, `*` yazarsan genel şablona döner.

Yazarak da olur (id'leri `/list` gösterir):

```
/takt freiburg-im-breisgau 30
/text freiburg-im-breisgau Moin, ist {title} noch zu haben?
```

`/help` her zaman bu özeti verir.

> Aralık en az **15 saniye**; bot altını kabul etmez ve nedenini söyler.
> Düğmeler her seçeneğin yanında beklenen gecikmeyi yazar. 15 saniye en hızlısı
> ama engellenme riskini de en çok artıran seçenek — ayrıntısı
> [Tarama sıklığı](#tarama-sıklığı--ilk-yazan-olmak) bölümünde.

Değişiklikler **anında** geçerli olur; container'ı yeniden başlatmana gerek yok.

### Kimler kullanabilir — `/user`

Bot varsayılan olarak **yalnızca seni** dinler (`telegram.chatId`). Başkası
yazarsa hiç cevap almaz; botun adını bilen bir yabancı ne aramalarını görebilir
ne de değiştirebilir. İstersen yanına başkalarını da alabilirsin — ve kime ne
kadar yetki vereceğine sen karar verirsin.

| Yetki | Ne yapabilir |
| --- | --- |
| `ansehen` | `/list` ile aramaları görür |
| `aendern` | Arama ekler, `⏱ Takt` ve `✏️ Text` düğmelerini kullanır |
| `loeschen` | `🗑` ile arama siler |

```
/user                                          listeyi göster (🚫 kaldır düğmesiyle)
/user add 123456789 Ali                        ekle — başta sadece "ansehen"
/user add 123456789 Ali rechte: ansehen,aendern  yetkileriyle birlikte ekle
/user rechte 123456789 alle                    yetkileri değiştir
/user del 123456789                            listeden çıkar
```

Birinin Telegram kimliğini öğrenmek için ona bota bir şey yazdır: denemesi
log'a düşer (`Nicht erlaubt: Kennung 123456789 … /user add 123456789`) ve
kimliği orada yazar.

`/user` komutunu **sadece sen** kullanabilirsin — listeye aldığın kişi başkasını
ekleyemez, kendi yetkisini yükseltemez. Yetkisi olmayana o düğme hiç
gösterilmez. Liste `watches.json` içinde `telegram.users` altında durur, elle de
düzenlenebilir ve değişiklik anında geçerli olur.

Cevaplar komutun yazıldığı sohbete gider; **ilan alarmları her zaman yalnızca
sana** gelir — listeye aldığın kişiler botu yönetir, alarm kopyası almaz.

## Birden fazla arama (komut satırından)

İstediğin kadar arama ekleyebilirsin — her biri **kendi aralığında, kendi
filtreleriyle ve kendi hafızasıyla** bağımsız döner. Biri engellenirse veya
alarm verirse diğerleri etkilenmez.

```bash
# bisiklet: 60 sn.'de bir, en fazla 400 €, sadece özel satıcı
node watcher.mjs --add "https://www.kleinanzeigen.de/s-fahrraeder/freiburg-im-breisgau/bulls/k0c217l9354r20" \
  --max-price 400 --private-only --exclude "defekt,bastler"

# laptop: 90 sn.'de bir, en fazla 600 €
node watcher.mjs --add "https://www.kleinanzeigen.de/s-notebooks/freiburg-im-breisgau/thinkpad/k0c278l9354r30" \
  --max-price 600 --interval 90
```

Ne izlediğini görmek ve silmek için:

```bash
node watcher.mjs --list
node watcher.mjs --remove freiburg-im-breisgau-bulls
```

`--add` ile birlikte kullanabileceğin seçenekler:

| Seçenek | Anlamı |
| --- | --- |
| `--label "Metin"` | Telegram mesajlarında görünecek isim (varsayılan: URL'den türetilir). |
| `--id isim` | Kendi kısa kimliğin (`--remove` bunu kullanır). |
| `--interval 60` | Tarama aralığı, saniye (en az 30). |
| `--min-price` / `--max-price` | Fiyat aralığı. |
| `--include a,b` | Başlıkta bunlardan biri geçmeli. |
| `--exclude defekt,bastler` | Başlıkta bunlardan biri geçerse atla. |
| `--private-only` | Mağaza/PRO satıcıları atla. |

Sonradan fikir değiştirirsen `watches.json`'ı elle de düzenleyebilirsin —
filtre tablosundaki her alan orada geçerli. Yeni eklenen bir arama ilk turunda
sessizce priming yapar, mevcut ilanlar için sana mesaj yağmaz.

> Çok sayıda arama eklersen hepsi aynı siteye istek atar. 4–5 aramanın üstüne
> çıkacaksan aralıkları biraz açmak (`--interval 90`) engellenme riskini düşürür.

## Tarama sıklığı — ilk yazan olmak

Belirleyici tek sayı şu: **ortalama gecikmen taktın yarısıdır.** Yeni bir ilan
iki tarama arasında bir yerde düşer; ortalama olarak taktın yarısı kadar sonra
görürsün.

| Takt | Ortalama gecikme | En kötü |
| --- | --- | --- |
| 60 sn. (eski varsayılan) | ~30 sn. | 70 sn. |
| 30 sn. | ~15 sn. | 37 sn. |
| 15 sn. | ~7 sn. | 19 sn. |
| 10 sn. (alt sınır) | ~5 sn. | 13 sn. |

**Hepsini tek komutla en hızlıya almak:** bota `/schnell` yaz. Bütün aramaları
alt sınıra çeker ve kaç tanesini değiştirdiğini söyler. Düğmelerle de olur ama
her arama için ayrı ayrı — birkaç arama varken zaten yapmadığın iş o.

Popüler bir ilanda 30 saniye, önüne birkaç kişinin geçmesine fazlasıyla yeter.
`⏱ Takt` düğmesi artık her seçeneğin altında bu gecikmeyi yazıyor, ve alt sınır
30'dan **10 saniyeye** indi.

### Mesajın kendisi de öne alındı

Takt dışında, ilan görüldükten sonra mesajın sana ulaşmasında da iki yerde
zaman kaybediliyordu:

- **Bir turda birden fazla ilan varsa** Telegram'a saniyede ~1 mesaj
  gidebildiği için aralarında ~1'er saniye var. Eskiden **en eskisi ilk**
  gönderiliyordu ("sohbette kronoloji doğru olsun" diye) — yani en taze ilan,
  yani kazanma şansın olan tek ilan, **en sona** kalıyordu. Artık en yeni ilk
  çıkıyor.
- **`/list` gibi bir komuta cevap verilirken** ilan düşerse, alarm o 10
  mesajın arkasına giriyordu: ~10 saniye. Artık alarmların önceliği var,
  komut cevaplarının önüne geçiyorlar. Bekleme en fazla 1 saniye.

Log'da her turun sonunda `erste Meldung nach 480 ms` yazıyor: çekim
başladığından ilk mesaj gönderilene kadar geçen, tamamen bizim elimizdeki süre.

**Ama gerçekten yavaş olan sen misin?** Tahmin etmene gerek yok: her alarmda
artık ilanın **yaşı** yazıyor — `⏱ 25 s alt` yani "bot bunu ilan düştükten 25
saniye sonra gördü".

Ve bu yaş **ikiye ayrılıyor.** Anahtar şu: ilan bir önceki turda 1. sayfada
yoktu, olsaydı zaten o zaman haber verilirdi. Demek ki iki tur arasında bir
yerde sayfaya düştü. Buradan ikisi birden çıkar:

- Kendi taktın **en fazla iki tur arasındaki süre** kadar gecikmeye sebep olmuş
  olabilir.
- Bunun üstündeki her şey, ilanın **yayınlanıp da henüz 1. sayfada
  görünmediği** süredir — Kleinanzeigen'in kendi gecikmesi. Buna taktı
  kısaltmak hiçbir şey yapmaz.

Fark önemliyse alarmın altına şu satır düşer:

```
🐢 2 min davon lag sie schon eingestellt, bevor sie auf Seite 1 auftauchte
   — der eigene Takt kostete hoechstens 60 s.
```

Böyle bir satır görüyorsan o kısım senin elinde değil: taktı kısaltmak
kazandırmaz, ilan yine aynı yaşta gelir. Satır **hiç çıkmıyorsa** gecikme
tamamen taktan geliyor demektir — o zaman kısaltmak gerçekten işe yarar.

### Bölge sınırı — `plz`

Aramanın bölgesi normalde sadece **URL'in içinde** durur, yani Kleinanzeigen'in
o adresten ne anladığına bağlıdır. Site bir gün beklenenden farklı cevap
verirse (yönlendirme, adres değişikliği, arayüz değişimi) bütün ülkeden ilan
düşmeye başlar ve bunu durduracak hiçbir şey yoktur. Bu bir kez yaşandı.

Bu yüzden sınır artık **kendi kodumuzda** da var:

```
/plz freiburg-im-breisgau-ktm 79     sadece 79… posta kodları
/plz freiburg-im-breisgau-ktm 79,78  birden fazla
/plz freiburg-im-breisgau-ktm        sınırı kaldır
```

Arama eklerken de yazabilirsin: `… max 200 privat plz 79`

Posta kodu okunamayan ilan **elenir**. Sınır koyduysan sınır uygulanmalı;
şüphede bırakıp geçirmek istediğinin tersi olurdu.

### Sıfırlama — `/reset`

Yanlış yapılandırma sonrası yarım liste "görüldü" diye hafızada kalır. `/reset`
hafızayı temizler: bir sonraki tur mevcut ilanları **sessizce** not eder ve
ancak ondan sonra gelenleri bildirir. **Aramaların silinmez.**

### Üçüncü bir kaynak: önbellek

`Cache-Control: no-cache` göndermek yetmiyor — CDN'ler anonim isteklerde bu
başlığı genellikle yok sayar, yoksa herkes istek atarak origin'i yorabilirdi.
Yani sayfayı **dakikalarca eski bir kopyadan** almış olabiliriz; dışarıdan bu
"Kleinanzeigen yavaş" gibi görünür ama değildir.

> **Bu parametre artık varsayılan olarak KAPALI.** Açıkken, aramada hiç
> geçmeyen şehirlerden ilanlar gelmeye ve dar bir yerel arama tek turda 8
> mesaj sınırına dayanmaya başladı. İkisi de Kleinanzeigen'in bilinmeyen
> parametreli adrese farklı cevap vermesiyle uyuşuyor — muhtemelen yoldaki
> şehir bilgisini düşüren bir yönlendirmeyle. Kanıtlanmadı (buradan istek
> atamıyorum), ama birkaç saniyelik önbellek kazancı, her turda yabancı ilan
> almaya değmez. Denemek istersen `watches.json` içine `"cacheBuster": true`.

Parametre açıkken adrese değişen bir `_=<zaman>` ekleniyor (önbellek için
farklı bir anahtar demek). `Age` başlığı ise her zaman okunuyor — o bedava.
Log'da şöyle görürsün:

```
Meine Suche: Abruf 412 ms, Seite 0 s aus dem Zwischenspeicher
```

`0 s` ise önbellek devre dışı, sayfa taze. Sıfırdan büyükse o saniyeler
🐢 satırında Kleinanzeigen'in hanesinden **düşülüyor** — ve satır bunu ayrıca
yazıyor, çünkü o kısım çözülebilir bir sorundur.

`0 s` ise sayfa taze demektir. Sıfırdan büyükse o saniyeler 🐢 satırında
Kleinanzeigen'in hanesinden düşülür.

> Yaş bilgisi Kleinanzeigen'in dakika hassasiyetindeki zaman damgasından
> geliyor, yani ±1 dakika yanılma payı var. Saat bilgisi okunamayan ilanlarda
> eskisi gibi tarih yazar.

Sapma payı da artık taktın **dörtte birini** geçmiyor. Sabit 0–10 sn. sapma,
15 saniyelik bir taktı ortalamada 20 saniyeye çıkarıyordu — kazandığının üçte
ikisi geri gidiyordu.

**Karşı taraftaki risk:** Kleinanzeigen çok sık isteği captcha ile cezalandırır.
15 saniye, saatte 240 istek demek — gerçekten önem verdiğin **tek bir arama**
için makul, hepsi için değil. Engel gelirse (HTTP 429 vb.) aralık kendiliğinden
ikiye katlanarak açılır, düzelince eski hızına döner ve uzun süren engelde
Telegram'dan bir kez uyarır. Yani engel kalıcı değil — ama o sürede zaten kör
kalırsın.

## Komutlar

```bash
node watcher.mjs                 # sürekli izle
node watcher.mjs --once          # tek tur çalış, çık
node watcher.mjs --dry-run       # Telegram'a gönderme, sadece ekrana yaz

node watcher.mjs --list          # eklediğin aramaları göster
node watcher.mjs --add "URL"     # yeni arama ekle
node watcher.mjs --remove id     # arama sil

node watcher.mjs --chat-id       # chat ID'ni bul
node watcher.mjs --config yol    # başka bir yapılandırma dosyası
node watcher.mjs --help          # tüm seçenekler
```

`--once` ve `--dry-run` birlikte kullanılabilir; filtreleri ayarlarken en
pratik yol budur.

## Sunucuda 7/24 çalıştırmak

Laptopta çalıştırırsan bilgisayar uyuduğunda izleme de durur. Kalıcı çözüm için
watcher **djveys sunucusuna** (`/opt/veysl/kleinanzeigen-watcher`) kurulu —
siteden tamamen ayrı bir Docker stack'i, kendi `docker-compose.yml`'i var.
Bozulursa veya yeniden derlenirse siteye hiçbir şey olmaz.

Sunucuda kurulum şu haliyle duruyor: image derlenmiş, `bulls-freiburg` araması
eklenmiş, container **henüz başlatılmamış** (Telegram token'ı bekliyor).

### Yol A — GitHub secret + CI (önerilen)

Token repo secret'ında durur, `.github/workflows/deploy-watcher.yml` her
deploy'da sunucudaki `.env`'i ondan yazar. Token tek bir yerde yaşar; sunucu
değişse de elle dosya düzenlemek gerekmez.

Secret'ı **bir kez** sen oluşturursun:

```bash
gh secret set WATCHER_TELEGRAM_BOT_TOKEN --repo oeztuerkhamza/veysl-music
```

Komut token'ı gizli olarak sorar — ekrana basılmaz, kabuk geçmişine düşmez.

Sonra deploy'u tetikle:

```bash
gh workflow run deploy-watcher.yml --repo oeztuerkhamza/veysl-music
```

`tools/kleinanzeigen-watcher/**` altında bir değişiklik `master`'a gittiğinde
de kendiliğinden çalışır. Workflow sonunda container'ın gerçekten ayakta
olduğunu doğrular — token yanlışsa yeşil değil, kırmızı görürsün.

Chat ID'yi `data/watches.json` içine yazmayı unutma (aşağıdaki 2. adım).

### Yol B — sunucuda elle (üç adım)

```bash
ssh djveys
cd /opt/veysl/kleinanzeigen-watcher
```

**1.** Token'ı `.env`'e yaz (BotFather'dan aldığın değeri kendin gir):

```bash
nano .env          # TELEGRAM_BOT_TOKEN=... satırını doldur
```

**2.** Chat ID'ni öğren ve `data/watches.json` içine yaz:

```bash
docker compose run --rm watcher --chat-id
nano data/watches.json    # "chatId": "..." alanını doldur
```

**3.** Başlat:

```bash
docker compose up -d
docker compose logs -f
```

### Sunucuda günlük kullanım

```bash
docker compose logs -f --tail 50        # canlı log
docker compose restart                  # yeniden başlat
docker compose down                     # durdur
docker compose run --rm watcher --list  # aramaları göster
docker compose run --rm watcher --add "URL" --max-price 300   # arama ekle
```

Arama ekledikten/sildikten sonra çalışan container'ı `docker compose restart`
ile yenile — yapılandırmayı sadece açılışta okuyor.

Kodda değişiklik yaparsan yeniden derle:

```bash
docker compose build && docker compose up -d
```

`data/` dizini bind-mount: `watches.json` ve `state.json` sunucuda normal
dosyalar, editörle düzenlenebilir ve image yeniden derlense de silinmez.

## Testler

```bash
cd tools/kleinanzeigen-watcher
node test/run.mjs
```

161 kontrol, **tamamen çevrimdışı** — Kleinanzeigen'e tek istek gitmez. Parser,
kaydedilmiş bir sayfa parçasına karşı sınanır
([test/fixture-suchseite.html](test/fixture-suchseite.html), gerçek bir arama
sayfasından üç ilana kısaltılmış). CI'da her PR'da çalışır.

Gerçek sayfayı da denemek istersen:

```bash
node test/run.mjs --live
```

Bu tek bir gerçek istek atar ve Kleinanzeigen'in sayfa yapısını değiştirip
değiştirmediğini söyler. Bilerek CI'da çalışmıyor: her commit'te başkasının
sunucusuna istek atmak kimseye fayda sağlamaz — üstelik bu proje tam da
engellenmemeye bağlı.

## Sağlık kontrolü

İki ayrı sinyal var, çünkü iki ayrı şey bozulabilir:

| Sinyal | Neyi söyler | Nerede görünür |
| --- | --- | --- |
| `data/heartbeat` (15 sn'de bir) | Süreç dönüyor mu | `docker ps` → healthy/unhealthy |
| Başarılı çekim zamanı | Kleinanzeigen'e erişim var mı | Telegram'dan uyarı |

Uzun süre başarılı çekim gelmezse (aralığın 10 katı, en az 15 dakika) bot bir
kez uyarır, düzelince de haber verir. Bu, en tehlikeli açığı kapatır: bozuk bir
watcher, sessiz bir pazardan ayırt edilemez.

Healthcheck durumu **görünür kılar**, kendiliğinden yeniden başlatmaz —
`restart: unless-stopped` "unhealthy" durumuna tepki vermez. Haber vermek
Telegram uyarısının işi.

```bash
docker inspect -f '{{.State.Health.Status}}' kleinanzeigen-watcher
```

## Sıfırlama

Bir aramayı baştan başlatmak (veya "kaçırdım" durumunu düzeltmek) için
`state.json`'ı sil. Bir sonraki çalıştırma yine sessiz priming turu yapar.

## Bilinen sınırlar

- **Sadece 1. sayfa taranır.** Tarih sıralı olduğu için yeni ilan zaten en
  üstte olur. Ama iki tur arasında 25'ten fazla ilan düşerse aradakiler
  kaçabilir — çok yoğun aramalarda `intervalSeconds`'ı düşür veya aramayı
  (şehir/fiyat/kelime ile) daralt.
- **Tur başına en fazla 8 mesaj** gönderilir (`maxAlertsPerCycle`). Fazlası
  varsa tek bir uyarı mesajı gelir. Bu, fazla geniş bir aramanın telefonu
  kilitlemesini önler.
- Kleinanzeigen sayfa yapısını değiştirirse araç yedek bir HTML çözümleyiciye
  düşer. O modda ilan linki ve başlığı doğru gelir, ama `skipCommercial` ve
  `skipTopAds` filtreleri güvenilmez olur.
- Bu araç sadece **haber verir**. İlana yazmayı sen yaparsın — otomatik mesaj
  göndermez.
