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

Her alarmda iki link var: **📱 In der App** ve **🌐 Browser**.

İlki kendi domainimizdeki bir köprü sayfasına gider
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

Boş bırakırsan watcher aynen çalışır, sadece mesajda tek bir normal link olur.

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

**Aramaları görmek ve silmek:** `/list` yaz. Her arama kendi mesajında gelir,
altında 🗑 **Löschen** düğmesiyle — dokununca silinir.

`/help` her zaman bu özeti verir.

Değişiklikler **anında** geçerli olur; container'ı yeniden başlatmana gerek
yok. Bot yalnızca senin sohbetinden gelen komutları kabul eder — botun adını
bilen bir yabancı ne aramalarını görebilir ne de değiştirebilir.

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

## Tarama sıklığı

Varsayılan **60 saniye**, üstüne rastgele 0–10 sn. sapma. Bu bilerek seçildi:

- Kleinanzeigen çok sık isteği captcha ile cezalandırır. Sen sıklığı ikiye
  katlayıp engel yersen, kazandığın 30 saniyeyi saatlerce geri ödersin.
- Araç `30` saniyenin altını kabul etmez.
- Engel gelirse (HTTP 429 vb.) aralık kendiliğinden ikiye katlanarak açılır,
  düzelince eski hızına döner. Uzun süren engelde Telegram'dan bir kez uyarır.

Pratikte 60 sn.'de ortalama 30 saniyelik gecikmeyle haberin olur — popüler
ilanlarda bu hâlâ ilk yazanlar arasında olmaya fazlasıyla yeter.

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
