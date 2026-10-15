# DJ Veys — SEO incelemesi ve büyüme planı (Ekim 2026)

**Tarih:** 15 Ekim 2026
**Kapsam:** dj-veys.de'nin teknik, içerik ve site dışı SEO durumu, ve önümüzdeki 5 ay için sıralı bir plan.
**Önceki belgeler:** [ORGANIK-SIRALAMA-ANALIZI.md](ORGANIK-SIRALAMA-ANALIZI.md) (Ağustos),
[MAPS-SIRALAMA-ANALIZI.md](MAPS-SIRALAMA-ANALIZI.md), [SEO-ACTION-PLAN.md](SEO-ACTION-PLAN.md).
Bu belge onları tekrar etmiyor, iki ay sonraki durumu ölçüyor ve sıradaki adımları sıralıyor.

---

## Kısa cevap

**Sitenin teknik altyapısı rakiplerin çok önünde, ama sıralamayı artık teknik taraf sınırlamıyor.**
Kodda yapılabileceklerin büyük kısmı yapılmış. Siteyi "arşa çıkaracak" üç şey var ve üçü de
koddan çok saha işi:

1. **Güven sinyali (otorite):** dışarıdan bağlantılar, rehber kayıtları, yorum hızı.
2. **Kanıt içeriği:** gerçek fiyatlar, gerçek düğünler, gerçek mekânlar, video.
3. **Veri:** Search Console verisi olmadan içerik planı tahmine dayanıyor.

Zamanlama da önemli. Çiftler düğün DJ'ini çoğunlukla **Ocak–Mart** arasında arıyor ve rezerve ediyor.
Bugün 15 Ekim. Google'ın yeni sinyalleri işlemesi haftalar sürüyor, bu yüzden **önümüzdeki 10–12 hafta
yapılan iş Ocak'taki sezonda karşılık bulur.** Plan bu takvime göre kuruldu.

---

## 1. Neyi nasıl ölçtüm (ve neyi ölçemedim)

| Ölçüm | Yöntem |
|---|---|
| 271 URL'nin tamamı | Siteyi üretim ayarlarıyla (`NEXT_PUBLIC_SITE_URL=https://dj-veys.de`) yerelde derledim, sitemap'teki her URL'yi tek tek indirip başlık, açıklama, canonical, hreflang, H1–H3, kelime sayısı, iç link ve JSON-LD açısından inceledim |
| Hız (Core Web Vitals) | Lighthouse 12, mobil profil, 3 sayfa |
| Arama görünürlüğü | Web araması (Google değil, gösterge niteliğinde) |

**Sınırlar, açıkça:**

- **Canlı siteye bu ortamdan erişemedim** (ağ politikası 403). Ölçümler aynı kodun yerel
  üretim derlemesinden. Kod aynı, ama **CMS içeriği boş bir veritabanıyla** ölçüldü: canlıda
  admin panelden girilmiş düğünler, yorumlar veya fotoğraflar varsa `/echte-hochzeiten` ve
  `/galerie` canlıda daha dolu olabilir.
- **Google sıralamasını göremedim.** Otomatik Google sorgusu yok; sıra tespiti Search Console'dan
  ya da gizli sekmede elle yapılmalı.
- **Search Console doğrulamasının canlıda yapılıp yapılmadığını göremedim.** Etiket
  `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` ile geliyor; yerel derlemede bu değer yok. → Aşama 0, madde 1.
- Backlink sayısı ölçülmedi (Ahrefs/Semrush erişimi yok).

---

## 2. Teknik SEO karnesi — güçlü

| Kontrol | Sonuç |
|---|---|
| Sitemap'teki URL'ler | **271** (DE 63 · TR 63 · EN 63 · NL 20 · FR 20 · ES 17 · AR 13 · KU 12) |
| 200 dışında yanıt veren URL | **0** |
| Sitemap'te olup `noindex` olan URL | **0** |
| Canonical kendini göstermeyen URL | **0** |
| Tekrarlanan meta açıklama | **0** |
| H1 sayısı 1 olmayan sayfa | **0** |
| hreflang karşılıklılık hatası | **0** |
| `alt` metni olmayan görsel | **0** |
| JSON-LD hatası | **0** · LocalBusiness, MusicGroup, Person, FAQPage (111 sayfa), BreadcrumbList (231), BlogPosting |
| robots.txt | Doğru: `/api/` ve `/admin` kapalı, `/api/faq` açık, yapay zekâ tarayıcılarına izin var, sitemap tanımlı |
| `llms.txt` | Var ve güncel |
| Lighthouse SEO / Erişilebilirlik / En iyi uygulamalar | 92* / 96–100 / 100 |

\* SEO puanındaki tek eksik "canonical", testin `localhost`'ta çalışmasından kaynaklanıyor
(canonical doğru şekilde `dj-veys.de`'yi gösteriyor). Canlıda bu puan 100 olmalı.

Bu tablo, bölgedeki rakiplerin neredeyse hiçbirinde bulunmayan bir temel. **Teknik SEO'ya daha fazla
emek koymak artık en yüksek getirili iş değil.**

---

## 3. Bulgular — sıralı

### ✅ Bu incelemede düzeltildi: rehber yazılarının tarihleri çelişiyordu

**Ölçüm:** 24 rehber yazısının **14'ünde** `updatedAt` (25.07.2026), `publishedAt`'tan daha eski.
Sonuç olarak:

- Yazının altında **"Veröffentlicht am 15. September 2026 · Aktualisiert am 25. Juli 2026"** yazıyordu —
  yayından iki ay önce güncellenmiş bir yazı.
- BlogPosting şemasında `dateModified` < `datePublished` vardı; sitemap'teki `lastmod` da yayın
  tarihinden önceydi.

Google çelişkili tarihlerle karşılaşınca ikisine de güvenmeyi bırakır; tarih sinyali "taze içerik"
için önemli. **Düzeltme:** `postModifiedAt()` yardımcı fonksiyonu eklendi
(`src/content/blog/index.ts`); sayfa, şema, Open Graph, sitemap ve rehber ana sayfası artık hep
bu fonksiyondan okuyor. Değiştirilme tarihi hiçbir zaman yayın tarihinden eski olamıyor. Yeniden
derlemeyle doğrulandı: `datePublished` = `dateModified` = `2026-09-15`, sitemap `lastmod` = `2026-09-15`.

### 🔴 B1 — `/pakete` fiyat göstermiyor; başkası gösteriyor

- `/pakete` **377 kelime**, üç paketin üçü de `priceFrom: null` → "Preis auf Anfrage".
- Bu sayfa en yüksek satın alma niyetli sorgu grubunu hedefliyor ("hochzeits dj kosten/preise stuttgart").
- **Web aramasında [musiqua.com](https://de.musiqua.com/instrumente/dj/stuttgart) "DJ-Veys" için
  1.300–2.500 € aralığı gösteriyor.** Bu bilgiyi Veysel mi girdi, doğru mu? Bilinmiyor. Fiyatı
  kendi sitesinde değil, üçüncü bir sitede okumak hem SEO hem güven açısından ters durum.
- Bridebook'ta Stuttgart için 850–2.800 € aralığı listeleniyor; rakiplerin bir kısmı fiyat yayınlıyor.

**Yapılacak:** Veysel'den üç paket için gerçek **"ab … €"** fiyatları alınacak, `src/content/packages.ts`
içine girilecek. Kod bu durumu zaten destekliyor. Musiqua kaydı kontrol edilip sahiplenilecek ya da
düzeltilecek.

### 🔴 B2 — Kanıt sayfaları ince: `/echte-hochzeiten` ve `/galerie`

| Sayfa | Kelime | JSON-LD | Not |
|---|---|---|---|
| `/echte-hochzeiten` | **180** | yok | CMS'te düğün kaydı yoksa boş durum gösteriyor |
| `/galerie` | **163** | yok | |
| `src/content/venues.ts` | — | — | **boş dizi**; hiç mekân yok |
| `src/content/testimonials.ts` | — | — | **boş**; yayın izni olan yorum yok |

Google "deneyim" (E-E-A-T) sinyalini tam olarak bu sayfalardan okur. 22 şehir sayfasının
"burada gerçekten çalışıyor" iddiası da bunlarla kanıtlanıyor.

**Yapılacak:** Sezonun son düğünlerinden **en az 3 gerçek düğün** (çiftin izniyle; mekân, şehir,
ay, 4–6 fotoğraf, varsa 30 saniyelik klip, 2–3 cümlelik yorum). Altyapı hazır:
`echte-hochzeit-vorlage-*` şablonları ve admin paneldeki `weddings` koleksiyonu. Her düğün bir şehir
sayfasından ve ilgili mekândan bağlantı almalı.

### 🟠 B3 — Rehber yazıları iç linklerden zayıf besleniyor

Rehber yazısı başına gelen iç link sayısı (Almanca):

```
1  destination-wedding-dj-buchen
1  hochzeitslocation-stuttgart-dj-perspektive   ← yerel ve ticari
1  islamische-hochzeit-planen                   ← en az rakipli konu
1  tuerkische-hochzeit-als-gast
2  hochzeitsbudget-musik-anteil
4  was-kostet-ein-hochzeits-dj                  ← en yüksek niyetli yazı
```

Buna karşılık her ana sayfa (menü + altbilgi) 62 iç link alıyor. Yazılar bu gücü almıyor.

**Yapılacak (kod, küçük):**
- `/pakete` → "Was kostet ein Hochzeits-DJ?" ve "Hochzeitsbudget: Musik-Anteil".
- `/islamische-hochzeit` → "Islamische Hochzeit planen".
- `/tuerkischer-dj-stuttgart` → "Türkische Hochzeit: Ablauf & Musik", "Kına Gecesi", "Davul Zurna".
- Ana sayfa "Hochzeits-DJ für Stuttgart und Umgebung" bölümü → "Hochzeitslocation Stuttgart".
- Aynı bağlantılar TR ve EN sürümlerinde de.

### 🟠 B4 — Mobil hız: iyi ama "çok iyi" değil

| Sayfa | Performans | LCP | TBT | CLS |
|---|---|---|---|---|
| `/` | 75 | 4,4 sn | 390 ms | 0 |
| `/hochzeits-dj/esslingen` | 80 | 4,3 sn | 260 ms | 0 |
| `/tuerkischer-dj-stuttgart` | 87 | 3,9 sn | 110 ms | 0 |

LCP öğesi resim değil, metin (H1). Gecikmenin %89'u "render delay": JavaScript'in ana iş parçacığını
meşgul etmesi (~87 KB kullanılmayan JS, 1,2 sn başlatma). Bunlar **laboratuvar** sayıları; canlıda
CDN ve önbellekle farklı çıkabilir.

**Yapılacak:** Önce gerçek kullanıcı verisine bakılacak: PageSpeed Insights → dj-veys.de →
"Gerçek kullanıcı deneyimi" bölümü (Search Console'da "Core Web Vitals" raporu). Saha verisinde
LCP > 2,5 sn ise ana sayfadaki istemci bileşenleri (sosyal şeritler, ses oynatıcı, analitik) ertelenerek
yüklenmeli. Saha verisi iyiyse dokunulmayacak.

### 🟡 B5 — Küçük meta düzeltmeleri

- 60 karakteri geçen 3 başlık: `Schwäbisch Gmünd` (65), `Friedrichshafen` (64) ve
  TR `Schwäbisch Gmünd` (61). Şehir adı uzun olduğunda kalıp kesiliyor.
- 160 karakteri geçen 9 açıklama, ana sayfa dahil (167). Etkisi küçük; Google zaten kısaltıyor.
- `/kontakt` başlığı yalnızca "Kontakt — DJ Veys" (17 karakter). "Kontakt — Hochzeits-DJ Stuttgart | DJ Veys"
  marka aramasında daha fazla tıklama getirir.

### 🟡 B6 — Stuttgart çevresinde boş kalan ilçeler (dikkatli olunmalı)

22 şehir sayfası var, ama Stuttgart'ın hemen yanındaki ve Türk nüfusu yoğun birçok yer yok:
Sindelfingen, Waiblingen, Fellbach, Kornwestheim, Backnang, Leonberg, Bietigheim-Bissingen,
Nürtingen, Kirchheim unter Teck, Schorndorf. Maps analizine göre doğu koridoru
(Esslingen, Fellbach, Waiblingen) Veysel'in **mesafe avantajının** olduğu bölge.

**Ama:** Yalnızca şehir adı değiştirilmiş sayfalar Google'ın "doorway page" kuralına takılır ve
tüm siteye zarar verir. **Kural:** Bir ilçe sayfası ancak orada yapılmış **gerçek bir düğün ya da
çalışılmış bir mekân** varsa açılır. Bu yüzden B6, B2'ye bağlı.

---

## 4. Arama görünürlüğü — ne gördüm

Web aramasında (Google değil, gösterge niteliğinde):

- **Marka araması çalışıyor:** "DJ Veys Stuttgart Hochzeit" araması `dj-veys.de`'yi ilk sırada gösteriyor.
  Site indekslenmiş ve doğru varlıkla eşleşiyor.
- **Marka dışı aramalarda yok:** "türkischer DJ Stuttgart Hochzeit", "Hochzeits DJ Stuttgart türkisch"
  ve "düğün dj stuttgart" aramalarında ilk sonuçlar **portallar**:
  [bridebook.com](https://bridebook.com/de/search/wedding-musicians-bands-djs/stuttgart--de),
  [eventbook.com](https://www.eventbook.com/), [fixando.de](https://www.fixando.de/en/hochzeits-dj/angebote/Baden-Württemberg/Stuttgart),
  [cylex.de](https://web2.cylex.de/suche/hochzeits%20dj/s21), [musiqua.com](https://de.musiqua.com/instrumente/dj/stuttgart).
  Örneğin bridebook'ta "DJ Yunus Asam (Backnang)" Türk müziği ile öne çıkıyor.

Buradan çıkan sonuç: **Kısa vadede o portalların içinde yer almak, onları geçmeye çalışmaktan daha
hızlı sonuç verir.** Hem doğrudan talep getirir, hem de backlink/citation sinyali olur.

---

## 5. Plan — aşamalara bölünmüş

**İş bölümü:** 🤖 = kod ve metin yazımı, ben yaparım · 👤 = senin elindeki bilgi, izin ve hesaplar.
Sıra önemli: 🤖 aşamaları senin verini beklemeden başlar, ama bazı sayfalar ancak 👤 aşaması
bittikten sonra anlam kazanır (örneğin mekân sayfası, mekân listesi olmadan boş kalır).

```
Aşama 0 (👤 bu hafta)  ─┐
Aşama 1 (🤖 hemen)      ├─►  Aşama 4 (👤 veri girişi)  ─►  Aşama 5 (🤖 veriyle birleştirme)  ─►  Aşama 6 (sezon rutini)
Aşama 2 (🤖 altyapı)    │
Aşama 3 (🤖 içerik)    ─┘
```

### Durum — 15 Ekim akşamı (🤖 aşamaları)

| Aşama | Durum | Not |
|---|---|---|
| 1 İç link, meta, şema, llms.txt, `seo:check` | ✅ Bitti | 271 sayfa taraması: 0 hata, 1 not (Kürtçe ana sayfa açıklaması 174 karakter) |
| 2.1 Mekân koleksiyonu ve sayfası | ✅ Bitti | Admin'de **Locations**. Yayın için "Namensnennung abgestimmt" kutusu ve en az 120 karakterlik "DJ-Blick" metni zorunlu. Test verisiyle derlendi ve doğrulandı (274 URL, 0 hata) |
| 2.2 Düğünlere ayrı sayfa | ⏸ Bilerek yapılmadı | Kodun kendi gerekçesi (`wedding-entry.tsx`): birkaç düğün için ikinci bir tıklama, görülmesi gereken metni gizler. Bunun yerine her düğüne **bağlantılanabilir bir anker** (`#hochzeit-<id>`) eklendi; mekân ve şehir sayfaları oraya bağlanıyor |
| 2.3 Şehir sayfalarında "Bu şehirdeki düğünler" | ✅ Bitti | `CityProof`: şehirle eşleşen düğün ya da mekân yoksa **hiçbir şey göstermez** |
| 2.4 VideoObject şeması | ⏸ Bilerek yapılmadı | Zorunlu `uploadDate` alanının güvenilir verisi yok; tahminle doldurulmuş şema geçersiz olurdu |
| 2.5 Fiyat → Offer şeması | ✅ Bitti | `packages.ts`'e gerçek fiyat girildiği anda otomatik; `null` iken şema yok |
| 2.6 İlçe sayfası koruması | ✅ Kural olarak | Derleme engeli yerine kural: `docs/SEO-CITY-STRATEGY.md` → yeni ilçe ancak `CityProof` bir şey gösterebiliyorsa açılır |
| 3.1 Yeni rehber yazıları | ✅ 3 yazı × 3 dil | Nişan, gelin alma, "düğün DJ'i ne zaman ayırtılır". Mevcut 20 yazıyla anahtar kelime çakışması kontrol edildi |
| 3.2 SSS | ✅ 2 yeni soru | Nişan ve gelin çıkarma; yalnızca sitede zaten yazan hizmetlere dayanıyor |
| 3.3–3.4 Kayıt metinleri ve mesaj taslakları | ✅ Bitti | [KAYIT-VE-MESAJ-PAKETI.md](KAYIT-VE-MESAJ-PAKETI.md) |

**Senin için açık kalan:** Aşama 0 ve Aşama 4 (aşağıda).

**Admin'e nasıl girilir (`/admin`):**

- **Locations** → *Create new*: Name, City, (Address, Website), **DJ-Blick** (Almanca en az 120 karakter; Türkçesini ayrıca yaz, üst sağdan dil değiştirerek), Foto (isteğe bağlı), **Namensnennung abgestimmt** ✔ (mekân adını anmana izin verdiyse), Status = *Veröffentlicht*. Kaydedince sayfa `/hochzeitslocation/<ad>` olarak açılır; URL adı addan otomatik oluşur.
- **Referenz-Hochzeiten** → *Create new*: Paar, Stadt, **Location** (mekânın adı Locations'taki ad ile *aynı* yazılırsa düğün o mekân sayfasında ve mekân sayfası düğünde otomatik bağlanır), Datum, Titelbild, Text, Fotogalerie, Videos, Status.
- **Kundenstimmen**: Name, Zitat, Bewertung, Status.
- Yeni rehber yazılarının **kapak fotoğrafı**: **Bild-Slots** (Görsel Alanları) içinde `blog.cover.nisan-verlobung-planen`, `blog.cover.gelin-alma-brautabholung-musik`, `blog.cover.wann-hochzeits-dj-buchen`. Yüklenene kadar tasarlanmış boş görünüm çıkar; stok fotoğraf koymuyoruz.

### Aşama 0 — 👤 Bu hafta, ~2 saat, kod gerekmez

| # | İş | Neden |
|---|---|---|
| 1 | **Search Console doğrulandı mı?** Doğrulanmadıysa: Property `https://dj-veys.de` → HTML etiketi → verilen `content="…"` değerini bana yaz (ya da sunucudaki `.env`'e `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` olarak ekle) → deploy sonrası "Doğrula" → `sitemap.xml` gönder | Aşama 5'in yarısı bu veriye bağlı |
| 2 | **Bing Webmaster Tools:** Search Console'dan içe aktar (2 dk) | ChatGPT araması ve Copilot Bing dizinini kullanıyor |
| 3 | Instagram (@dj_veys, 63K) bio linki = `https://dj-veys.de` | En büyük trafik kaynağı; marka aramasını besler |
| 4 | YouTube kanal açıklaması ve son 20 videonun açıklamasına ilgili sayfanın linki | 265 video = 265 bağlantı fırsatı |
| 5 | GBP: web sitesi alanı `dj-veys.de`, birincil kategori, hizmet alanı, 10+ yeni fotoğraf | Maps'te alaka sinyali |
| 6 | [musiqua.com](https://de.musiqua.com/instrumente/dj/stuttgart)'daki "DJ-Veys" kaydı: kim açtı, 1.300–2.500 € doğru mu, link `dj-veys.de` mi? | Yanlış fiyat = yanlış beklenti |
| 7 | PageSpeed Insights'ta dj-veys.de → "Gerçek kullanıcı deneyimi" bölümünün ekran görüntüsünü gönder | Aşama 1, madde 6 buna bağlı |

### Aşama 1 — 🤖 Hemen, senden hiçbir şey gerekmeden (~1 gün)

| # | İş | Bulgu | Ölçüm |
|---|---|---|---|
| 1 | **İç link ağı:** `/pakete` → fiyat ve bütçe yazıları; `/islamische-hochzeit` → İslami düğün yazısı; `/tuerkischer-dj-*` → Türk düğünü, Kına, Davul-Zurna yazıları; ana sayfa → Stuttgart mekân yazısı. DE, TR ve EN | B3 | Her yazıya en az 5 iç link |
| 2 | **Meta düzeltmeleri:** 3 uzun şehir başlığı (Schwäbisch Gmünd, Friedrichshafen), 160+ karakterli 9 açıklama, `/kontakt` başlığı, kısa `/epk` ve `/kontakt` açıklamaları | B5 | Başlıkların hepsi ≤ 60 karakter |
| 3 | **Eksik şema:** `/echte-hochzeiten` (CollectionPage), `/galerie` (ImageGallery), `/kontakt` (ContactPage), `/anfrage`. Şu an JSON-LD'si olmayan 32 sayfa | Bölüm 2 | 0 sayfa şemasız |
| 4 | **`public/llms.txt` güncelle:** "16 Guide-Artikel" yazıyor, yayında 20 var | Bölüm 2 | Sayılar eşleşir |
| 5 | **Kalite kapısı:** başlık/açıklama uzunluğu ve şemasız sayfa kontrolü için küçük bir betik (`scripts/seo-check.mjs`). Aynı taramayı bundan sonra tek komutla tekrarlayabilmek için | Bölüm 1 | `npm run seo:check` |
| 6 | **Hız (yalnızca saha verisi LCP > 2,5 sn gösterirse):** ana sayfada istemci bileşenlerini erteleme (sosyal şeritler, ses oynatıcı, analitik) | B4 | LCP ≤ 2,5 sn |

### Aşama 2 — 🤖 Altyapı: veri girilince kendiliğinden çalışan parçalar (~2–3 gün)

| # | İş | Neden |
|---|---|---|
| 1 | **Mekân koleksiyonu + mekân sayfası:** admin panelde `venues` (ad, şehir, web sitesi, "DJ gözüyle" notu, fotoğraf, **yayın izni kutusu**) ve her mekâna ait `de/tr/en` sayfa. `venues.ts` boş ve deploy gerektiriyor; CMS'e taşıyınca sen deploy beklemeden girersin. Yeni rota ve veritabanı migration'ı gerekir | Mekânlar hem iç link hem "buraya link ver" talebinin karşılığı |
| 2 | **Düğünlere kendi sayfası:** şimdi `/echte-hochzeiten` yalnızca liste. Her yayında düğün için ayrı URL (fotoğraf, video, şehir, mekân). Her biri aranabilir bir sayfa ve her şehir/mekân sayfasından bağlanabilir | Üç düğün = üç yeni, benzersiz sayfa |
| 3 | **Şehir sayfalarına "Bu şehirdeki düğünler" bloğu:** `weddings` kaydında şehir eşleşirse görünür, eşleşme yoksa hiç görünmez | Şehir sayfalarının "burada gerçekten çalışıyor" kanıtı |
| 4 | **VideoObject şeması:** düğün kaydında YouTube videosu varsa otomatik | Video sonuçları |
| 5 | **Fiyat → `Offer` şeması:** `priceFrom` doldurulunca otomatik, boşken hiçbir şey basmaz (şu anki kural: uydurma fiyat şeması yok). Mevcut `package-card.tsx` zaten "ab … €" gösteriyor; şema tarafını kontrol edip bağlarım | Fiyat yayınlanınca zengin sonuç |
| 6 | **İlçe sayfası koruması:** `cities.ts`'e yeni şehir eklerken "kanıt" (bağlı düğün ya da mekân) alanı zorunlu; yoksa derleme uyarı versin | Doorway-page riskini koddan engeller |

### Aşama 3 — 🤖 İçerik yazımı (seed): metin ve blog

Kural: BRAND-FACTS'te olmayan hiçbir rakam, isim veya iddia yazmam. Bilmediğim yeri `TODO(kunde)` bırakır,
sana listelerim. Tüm yeni yazılar `status: 'published'` olmadan önce sana okutulur.

| # | İş | Not |
|---|---|---|
| 1 | **Yeni rehber yazıları (TR öncelikli, sonra DE/EN):** mevcut 20 yazıyla çakışma kontrolünü yapıp aday konular: nişan töreni, gelin çıkarma ve müzik, Kına gecesi müzik listesi, Standesamt/nikâh müziği (Stuttgart), karma Türk-Alman çalma listesi. Search Console verisi gelince sıra buna göre değişir | Aynı anahtar kelimeyi iki yazıda kullanmam |
| 2 | **SSS (`answers.ts`) genişletme:** her cevap kısa, doğrudan, tarihli. GEO için | Mevcut ~50 soruya ek |
| 3 | **Rehber kaydı paket metni:** 15 rehber/portal için kısa (160), orta (500) ve uzun (750 karakter) tanıtım metni, DE ve TR, hepsinde **aynı** ad/adres/telefon | Sen yalnızca kopyalayıp yapıştırırsın (Aşama 4) |
| 4 | **Mesaj taslakları:** mekân, fotoğrafçı, organizatör ve yerel basın için WhatsApp/e-posta metni; yorum isteği mesajı (Google yorum linkiyle); basın bülteni | Sen gönderirsin |
| 5 | **Vaka yazısı şablonu:** `echte-hochzeit-vorlage-*` iki şablon hazır; gerçek düğün verisi gelince doldururum | Aşama 5'te |

### Aşama 4 — 👤 Senin gireceğin veriler

Bu tabloyu bitiren her satır Aşama 5'te bir sayfaya dönüşür. **Hiçbirini eksik bilgiyle ya da tahminle
doldurma;** boş kalan satır, yanlış dolu satırdan iyidir.

| Veri | Nereye | Adet | Dikkat |
|---|---|---|---|
| **3 paket için "ab … €" fiyat** | Bana yaz (`src/content/packages.ts`) | 3 | Yaklaşık değil, gerçekten verebileceğin başlangıç fiyatı |
| **Gerçek düğünler** | `/admin` → *weddings*: Paar (çift adı), Stadt, Location, Gäste, Datum, Titelbild, Text, Fotogalerie, YouTube-Link, Status | **en az 3** | Çift yazılı ya da mesajla izin vermeden `Status` = *Yayında* yapma. Çift adı için "Ayşe & Mehmet" gibi yalnızca ad. DSGVO/Recht am eigenen Bild: [`FOTO-LISTESI.md`](../FOTO-LISTESI.md) |
| **Çift yorumları** | `/admin` → *testimonials*: Name, eventDate, venue, quote, rating | 3–5 | Yayın izni sözlü değil, yazılı |
| **Mekân listesi** | Aşama 2.1 bitince `/admin` → *venues*. O zamana dek bana yaz: ad, şehir, web sitesi, 1–2 cümle "orada neler iyi" | 10 | Yalnızca gerçekten çaldığın yerler. Yayın izni kutusu = mekân adının kullanımına onay |
| **Partner onayı** | Liebe Events, Alpina Löwen, ArslanEvent, AuraEvent ile yazılı onay | 4 | Onay yoksa logo ve isim yok |
| **Fotoğraf ve video** | Sıra [`IMAGE-SLOTS.md`](IMAGE-SLOTS.md)'de: portre → dolu dans pisti → mikrofonla moderasyon → canlı saz → aftermovie | 5–6 | En önemlisi: **gece dolu dans pisti** |
| **Search Console doğrulama kodu** | Bkz. Aşama 0.1 | 1 | |
| **Rehber/portal kayıtlarını aç (15)** | Bridebook, hochzeit.click, eventpeppers, weddyplace, hochzeitsportal-stuttgart.de, ProvenExpert, Gelbe Seiten, Das Örtliche, 11880, Bing Places, Apple Business Connect, Yelp, Cylex, Fixando, musiqua | 15 | Aşama 3.3'teki metni kullan; ad/adres/telefon her yerde aynı |
| **Yorum isteği** | Google yorum linki (`g.page/r/CTlpdnW5VjW4EBM/review`), her gün 2–3 çifte kişisel WhatsApp | 31 → 45 | Toplu gönderim yok |
| **Mekân ve fotoğrafçı mesajları** | Aşama 3.4'teki taslakları gönder | 10 + 5 | Hedef: 10 backlink |
| **TrauDich! Stuttgart (9–10 Ocak 2027)** | Stant ya da ziyaretçi olarak katılım kararı | 1 karar | 15 Kasım'a kadar |

### Aşama 5 — 🤖 Veri geldikten sonra

Her satırın tetikleyicisi, Aşama 4'te hangi veriyi girdiğin:

| Tetikleyici | Ben ne yaparım |
|---|---|
| Fiyatlar | `/pakete` "ab … €" + `Offer` şeması; `was-kostet-ein-hochzeits-dj` yazısındaki rakamları hizalarım; fiyat tutarlılığını 3 dilde kontrol |
| 3 düğün | Her biri için vaka yazısı (şablondan), ilgili şehir ve mekân sayfasından iç link, `VideoObject` |
| Mekân listesi | Mekân sayfalarını yayınlarım, şehir sayfalarını bağlarım, mekâna gönderilecek "sayfanız yayında" mesajı |
| Düğün + mekân kanıtı olan ilçe | **Yalnızca kanıtı olan** ilçe sayfası (Fellbach, Waiblingen, Sindelfingen, Nürtingen…), her biri özgün metinle, şehir adı değiştirilmiş kopya değil |
| Search Console verisi (4 hafta sonra) | 4–15. sıradaki sorgular için sayfa güçlendirme; gösterimi yüksek, tıklaması düşük sorgular için başlık/açıklama yeniden yazımı; yeni yazı konularının sırası |
| Yeni yorum sayısı | Google yorumları sitede yalnızca görünür kalır, `AggregateRating` şemasına **girmez** (kural, `site.ts`) |
| Basın/yeni backlink | Hangi sayfaya link geldiğine bakıp o sayfaya iç link ve içerik takviyesi |

### Aşama 6 — Sezon rutini (Ocak sonrası)

| Kim | Her düğünden sonra |
|---|---|
| 👤 | 2–3 gün içinde yorum isteği; izin varsa 5 foto + yorum; admin'de *weddings* kaydı taslak olarak |
| 🤖 | Taslak kaydı göz atıp yayına hazır hale getiririm, vaka yazısı ve iç link; ayda bir Search Console taraması ve düzeltme listesi |

### Takvim

| Dönem | Ne olur |
|---|---|
| 15–22 Ekim | 👤 Aşama 0. 🤖 Aşama 1 |
| 22 Ekim – 10 Kasım | 🤖 Aşama 2 ve 3. 👤 Aşama 4'ün ilk yarısı: fiyatlar, 3 düğün, yorum isteklerine başlama |
| 10 Kasım – 15 Aralık | 👤 Aşama 4'ün ikinci yarısı: mekân listesi, rehber kayıtları, mesajlar. 🤖 Aşama 5 |
| 15 Aralık – 31 Aralık | Boşlukları kapatma, TrauDich! hazırlığı |
| Ocak – Mart 2027 | Sezon. Aşama 6. Search Console verisiyle ince ayar |

---

## 6. Başarı ölçütleri

Hedefler gerçekçi tutuldu. SEO olasılıklara dayanır, garanti yoktur.

| Ölçüt | Nerede | Bugün | 31 Ara 2026 | 31 Mar 2027 |
|---|---|---|---|---|
| Google yorumu | GBP | 31 | 45 | 60+ |
| Yorum hızı | GBP | düşük | ayda 5+ | her düğünden sonra |
| Site dışı bağlantı veren alan adı | Search Console → Bağlantılar | ~0 (ölçülmedi) | 15 | 30 |
| Rehber kayıtları (aynı NAP) | elle liste | ? | 15 | 20 |
| Marka dışı gösterim / ay | Search Console | bilinmiyor | ölçüm başladı | ×3 (Aralık'a göre) |
| "hochzeits dj stuttgart" ort. sıra | Search Console | bilinmiyor | ilk 20 | **ilk 10** |
| "türkischer dj stuttgart" ort. sıra | Search Console | bilinmiyor | ilk 10 | **ilk 3** |
| "islamische hochzeit dj" ort. sıra | Search Console | bilinmiyor | ilk 10 | **ilk 3** |
| Form + WhatsApp talebi / ay | Plausible / admin | — | ölçüm | ×2 |

**En gerçekçi ilk 3 hedefi:** Türkçe/Türk nişi ("türkischer DJ Stuttgart", "düğün dj stuttgart") ve
İslami düğün sorguları. Bu sorgularda Almanca rakip neredeyse yok ve sitenin bu sayfaları
(683–1.258 kelime) zaten var. "Hochzeits-DJ Stuttgart" başlık sorgusu en zor olanı: portallar ve
20 yıllık siteler orada.

---

## 7. Yapılmayacaklar

- ❌ **Sahte yorum, satın alınmış yorum, toplu yorum isteği.** GBP askıya alınabilir; 31 yorum ve 5,0 kaybolur.
- ❌ **Sanal ofis ya da ödünç adres** ile Stuttgart merkezine "taşınmak". Hesap kapatma sebebi.
- ❌ **Sadece şehir adı değişen sayfalar** (doorway). Her yeni şehir sayfası gerçek bir düğüne/mekâna dayanmalı.
- ❌ **Google yorumlarını `AggregateRating` şemasına koymak.** Google kurallarına aykırı; bir kez geri alındı
  (`src/content/site.ts` → `reviews`).
- ❌ **Link satın almak, link ağları (PBN), "1000 backlink" paketleri.** Tek bir manuel ceza bütün işi siler.
- ❌ **Spotify/SoundCloud'da "DJ Veys" adlı başka bir sanatçıyı `sameAs`'e eklemek.** Bkz. `src/lib/schema.ts`.

---

## 8. Kaynaklar

- Yerel üretim derlemesi + 271 URL taraması, Lighthouse 12 (bu oturum, 15.10.2026)
- [musiqua.com — DJ Stuttgart](https://de.musiqua.com/instrumente/dj/stuttgart)
- [Bridebook — Hochzeitsmusik Stuttgart](https://bridebook.com/de/search/wedding-musicians-bands-djs/stuttgart--de)
- [Bridebook — DJ Yunus Asam](https://bridebook.com/de/wedding-musicians-bands-djs/dj-yunus-asam-backnang-stuttgart-deV8weWZvg)
- [Fixando — Hochzeits-DJ Stuttgart](https://www.fixando.de/en/hochzeits-dj/angebote/Baden-Württemberg/Stuttgart)
- [eventbook.com — Mr. Mac's Party Team](https://www.eventbook.com/en/providers/mr-macs-party-team-der-professionelle-dj-service-fuer-sueddeutschland-stuttgart)
- [messen.de — TrauDich! Stuttgart](https://www.messen.de/de/14/stuttgart/traudich-stuttgart/info)
- [tradefairdates.com — TrauDich! Stuttgart](https://www.tradefairdates.com/TrauDich%21-M290/Stuttgart.html)
