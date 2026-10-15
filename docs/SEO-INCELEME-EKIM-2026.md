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
  `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` ile geliyor; yerel derlemede bu değer yok. → Faz 0, madde 1.
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

## 5. Plan

### Faz 0 — Bu hafta (toplam ~2 saat, Veysel + geliştirici)

| # | İş | Kim | Neden |
|---|---|---|---|
| 1 | **Search Console doğrulandı mı?** Doğrulanmadıysa: Property `https://dj-veys.de` → HTML etiketi → `.env`'e `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` → deploy → doğrula → `sitemap.xml` gönder | Geliştirici | Bundan sonraki her karar bu veriye dayanıyor |
| 2 | **Bing Webmaster Tools**: Search Console'dan içe aktar (2 dk) | Geliştirici | ChatGPT araması ve Copilot Bing dizinini kullanıyor; GEO yatırımı ancak böyle karşılık bulur |
| 3 | Instagram (@dj_veys, 63K) bio linki = `https://dj-veys.de` | Veysel | En büyük trafik kaynağı; marka aramasını besler |
| 4 | YouTube kanal açıklaması ve son 20 videonun açıklamasına ilgili sayfanın linki | Veysel | 265 video = 265 bağlantı fırsatı |
| 5 | GBP: web sitesi alanı `dj-veys.de`, birincil kategori "DJ" / "Hochzeits-DJ", hizmet alanı, 10+ yeni fotoğraf | Veysel | Maps'te alaka sinyali |
| 6 | musiqua.com'daki "DJ-Veys" kaydını kontrol et: kim açtı, fiyat doğru mu, link `dj-veys.de` mi? | Veysel | Yanlış fiyat = yanlış beklenti; doğru kayıt = citation |

### Faz 1 — 15 Ekim – 15 Kasım: kanıt ve temel

| # | İş | Kim | Hedef |
|---|---|---|---|
| 1 | **Gerçek "ab" fiyatlar** → `/pakete` (B1) | Veysel → geliştirici | 3 fiyat |
| 2 | **Yorum sprinti:** 2025–2026 sezonunun bütün çiftlerine kişisel WhatsApp ile yorum linki (`g.page/r/CTlpdnW5VjW4EBM/review`). Her gün 2–3 kişiye, toplu gönderim değil | Veysel | 31 → **45** |
| 3 | **3 gerçek düğün** `/echte-hochzeiten`'e (B2), izinli fotoğraf ve yorumla | Veysel → geliştirici | 3 kayıt |
| 4 | İç link düzeltmeleri (B3) | Geliştirici | Her yazıya en az 5 iç link |
| 5 | **Rehber/portal kayıtları (citation) — 15 adet**, hepsinde aynı NAP (Name/Adresse/Phone): Bridebook, hochzeit.click, eventpeppers, weddyplace, hochzeitsportal-stuttgart.de, ProvenExpert, Gelbe Seiten, Das Örtliche, 11880, Bing Places, Apple Business Connect, Yelp, Cylex, Fixando, musiqua | Veysel (geliştirici yardım) | 15 kayıt |
| 6 | Meta düzeltmeleri (B5) | Geliştirici | 1 saat |

### Faz 2 — 15 Kasım – 31 Aralık: otorite

| # | İş | Kim | Hedef |
|---|---|---|---|
| 1 | **Mekân bağlantıları:** çalıştığı 10 düğün salonuna kısa e-posta/WhatsApp: "Dienstleister/Partner" sayfasına ekleme isteği + kendi sitende mekân sayfası karşılığı. Türk düğün salonları (Stuttgart, Esslingen, Fellbach, Waiblingen, Sindelfingen) önce | Veysel | **5 backlink** |
| 2 | **Fotoğrafçı/organizatör ağı:** aynı düğünde çalıştığı fotoğrafçılardan fotoğraf (izinli) + karşılıklı tavsiye linki. Partnerler (Liebe Events, Alpina Löwen, ArslanEvent, AuraEvent) **izin alınarak** | Veysel | 5 backlink |
| 3 | **Mekân sayfaları:** `venues.ts` boş. Her gerçek mekân için kısa "DJ perspektifinden" sayfa (akustik, kurulum, Sperrzeit, park). Mekâna linklenebilir bir sayfa vermek, link istemeyi kolaylaştırır | Geliştirici + Veysel | 5 mekân |
| 4 | **İlçe sayfaları (B6)** — yalnızca gerçek düğün/mekân varsa: önce Fellbach, Waiblingen, Sindelfingen | Geliştirici | 2–3 sayfa |
| 5 | **Basın:** "63.000 takipçili Stuttgartlı düğün DJ'i, Kur'an tilaveti de kendisi okuyor" yerel haber değeri taşıyor. Stuttgarter Zeitung/Nachrichten yerel bölüm, Esslinger Zeitung, Türk medyası (Renk Magazin, Hürriyet Avrupa) | Veysel | 1–2 haber |
| 6 | **Video SEO:** YouTube'daki en iyi 10 düğün klibi ilgili şehir/hizmet sayfasına gömülü (mevcut tıklayınca yüklenen yapı) + VideoObject şeması | Geliştirici | 10 video |
| 7 | **TrauDich! Stuttgart 9–10 Ocak 2027** (Liederhalle) için karar: stant, ya da en azından ziyaretçi olarak mekân ve fotoğrafçılarla tanışma. Stant açılırsa katılımcı listesinden backlink | Veysel | Karar 15 Kasım'a kadar |

### Faz 3 — Ocak – Mart 2027: sezon, veriyle ilerleme

| # | İş | Kim |
|---|---|---|
| 1 | **Search Console "Sorgular" raporu:** 4–15. sıradaki sorgular = en hızlı kazanç. Her biri için ilgili sayfayı güçlendir (bölüm ekle, iç link, başlık) | Geliştirici |
| 2 | **Gösterimi yüksek, tıklaması düşük sorgular** için başlık/açıklama yeniden yazımı | Geliştirici |
| 3 | **Ayda 2 yeni rehber yazısı**, konuları Search Console'dan (tahminle değil). Öncelik Türkçe sorgular: "düğün salonu stuttgart", "kına gecesi müzik listesi", "düğün dj fiyatları almanya" | Geliştirici + Veysel |
| 4 | Her düğünden sonra: 1 yorum isteği + 1 izinli `/echte-hochzeiten` kaydı (rutin) | Veysel |
| 5 | TrauDich! sonrası: fuarda tanışılan mekân ve tedarikçilerle bağlantı takibi | Veysel |

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
