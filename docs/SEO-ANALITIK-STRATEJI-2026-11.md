# SEO stratejisi – analitik verisiyle güncelleme (11 Kasım 2026)

Bu doküman `docs/SEO-ACTION-PLAN.md` ve `docs/SEO-KEYWORD-MAP.md` içindeki ön-lansman
varsayımlarını **gerçek Search Console ve GA4 verisiyle** günceller. Çelişki olursa bu
doküman kazanır.

**Kaynaklar (kendi okumam, 11.11.2026):**
- Search Console, `dj-veys.de` (domain mülkü), son 90 gün: 257 tık, 6.930 gösterim, CTR %3,7,
  ortalama pozisyon 18. 322 farklı sorgu, 356 sayfa.
- GA4, `www.dj-veys.de`, son 28 gün (14.10.–10.11.): 128 oturum, 87 kullanıcı.
- Kod okuması: `src/components/analytics/*`, `src/lib/analytics/*`, `src/content/cities.ts`.

**Veri sınırı:** Örneklem küçük (128 oturum). Yorumlar yön gösterir, kesin sonuç değildir.
Tek tek sayfa karşılaştırmaları (ör. 9 vs 13 oturum) istatistiksel olarak anlamsızdır;
yalnızca desen olarak okunmalı.

---

## 1. Verinin özeti

### Trafik kaynağı (GA4, 28 gün)
| Kanal | Oturum | Engagement | Ort. süre |
|---|---|---|---|
| Organic Search | 86 (%67) | %60 | 45 sn |
| AI Assistant | 15 (%12) | %87 | 1 dk 20 sn |
| Organic Social | 13 (%10) | %77 | 25 sn |
| Direct | 12 (%9) | %42 | 1 dk 07 sn |
| Referral / Unassigned | 4 | – | – |

AI Assistant kanalı küçük ama en kaliteli. `docs/GEO-STRATEGY.md` doğru yönde; öncelik düşmemeli.

### Landing page (GA4, 28 gün)
`/` 70 oturum · `/tuerkischer-dj-stuttgart` 13 · `/tuerkischer-dj/[stadt]` 9 · `/ratgeber/[slug]` 7 ·
`/islamische-hochzeit` 6 · `/anfrage` 5 · `/hochzeit-events` 5 · `/tuerkischer-dj-deutschland` 4.

Süre deseni: Ratgeber (1 dk 48 sn) ve `/islamische-hochzeit` (1 dk 44 sn) tutuyor.
`/tuerkischer-dj-deutschland` (14 sn), `/deutsch-tuerkische-hochzeit` (7 sn) ve şehir sayfaları
(13 sn) ziyaretçiyi tutmuyor.

### Search Console – sayfalar (90 gün)
`/` 95 tık / 1.252 gösterim · `/tuerkischer-dj-stuttgart` 36 / 1.017 · `/tuerkischer-dj-deutschland`
19 / 661 · `/islamische-hochzeit` 12 / 182 · `/hochzeits-dj/heilbronn` 4 / 271 ·
`/hochzeits-dj/mannheim` 4 / 208 · `/hochzeits-dj/pforzheim` 4 / 164 · `/hochzeits-dj/esslingen` 3 / 103.

### Search Console – sorgular (90 gün)
- **Marka:** `dj veys` 14 tık, `veys` 20 gösterim. Toplam tıkın ~%6'sı; marka henüz küçük.
- **Gösterim var, tık yok (CTR ≈ 0):**
  `ablauf einer dj begleiteten hochzeit` 142 · `türkischer dj` 99 · `dj ludwigsburg` 91 ·
  `dj heilbronn` 72 · `türkischer hochzeits dj` 64 · `playlist oder dj event` 60 ·
  `dj deutsch türkische hochzeit` 57 · `deutsch türkischer hochzeits dj` 53 ·
  `playlist für hochzeitsgäste erstellen` 48 · `moderator heilbronn` 38 · `dj pforzheim` 38 ·
  `dj mannheim hochzeit` 35 · `hochzeits dj karlsruhe` 27.
- **Beklenmeyen kümeler:** Felemenkçe (`turkse bruiloft organiseren` 14, `turkse verloving` 12,
  `nisan turks` 17, `nisan` 13), İngilizce (`english speaking dj belgium` 18), Balkan
  (`hochzeit balkan dj in baden-württemberg` 21 / `stuttgart` 14 / `düsseldorf` 13).
- Pozisyon 18 ortalama = çoğu sorgu 2. sayfada. Gösterim var, tık yok çünkü sıralama düşük,
  CTR sorunu yalnızca ikinci derecede.

### Sorgu başına pozisyon (Search Console, 90 gün, 11.11.2026'da ikinci okuma)
Bu tablo §3'teki önceliği değiştirir: **şehir ve "türkischer dj" sorgularında sorun başlık
değil, sıralama.** 3.–5. sayfadaki bir sonuç, başlığı ne olursa olsun tıklanmaz.

| Sorgu | Gösterim | Pozisyon | Sayfa | Okuma |
|---|---|---|---|---|
| `dj ludwigsburg` | 91 | 42,3 | `/hochzeits-dj/ludwigsburg` (39,7) | Sıralama |
| `dj heilbronn` | 72 | 26,0 | `/hochzeits-dj/heilbronn` | Sıralama |
| `dj pforzheim` | 38 | 41,4 | şehir sayfası | Sıralama |
| `hochzeits dj karlsruhe` | 27 | 44,7 | şehir sayfası | Sıralama |
| `türkischer dj` | 99 | 22,6 | – | Sıralama |
| `türkischer hochzeits dj` | 64 | 55,5 | – | Sıralama |
| `dj deutsch türkische hochzeit` | 57 | 52,5 | – | Sıralama |
| `ablauf einer dj begleiteten hochzeit` | 142 | 30,1 | `/ratgeber` hub (36,7), `/fragen` (68,6); hedef yazı yalnızca 24,5 | **Kanibalizasyon**: Google hedef yazıyı değil hub'ı gösteriyor |
| `playlist oder dj event` + 3 benzer | 152 | ~58 | `hochzeit-ohne-dj-spotify-playlist` (58,3) | Niyet uyumsuzluğu → meta güncellendi (§7) |
| `nisan turks`, `nisan`, `turkse verloving`, `nisan betekenis turks` | ~55 | 5,7–13,7 | `nl/gids/nisan-turkse-verloving-gids` (9,0) | **CTR** – ilk sayfa, 0 tık → meta güncellendi (§7) |
| `türkische hochzeit musik` | 11 | 6,3 | `ratgeber/musik-fuer-die-hochzeit-lieder` (6,2) | İlk sayfa; yazı 27.10.'da yayınlandı, bekle |
| `dj esslingen`, `dj hochzeit esslingen` | 58 | ~9 | `/hochzeits-dj/esslingen` | İlk sayfanın sonu; tek tık alan şehir |
| `hochzeit dj stuttgart` | 15 | 7,7 | – | İlk sayfa |
| `dj mannheim hochzeit` | 35 | 12,3 | `/hochzeits-dj/mannheim` | 2. sayfa başı – en yakın şehir fırsatı |

Sonuç: Esslingen (9) ve Mannheim (12) dışında şehir sayfaları sıralamada değil. Şehir sayfası
başlıkları zaten sorguyla eşleşiyor (`DJ {city} – Hochzeits-DJ & Moderator | DJ Veys`);
başlık yeniden yazmak bu sayfaları yükseltmez. Yükseltecek olan: şehre özgü gerçek içerik
(mekân, gerçek düğün, foto) ve dış sinyal (GBP yorumları, yerel portal/mekân backlink'leri).

**Düzeltme (§1 ve §3'teki aşırı yorum):** GA4'te `/deutsch-tuerkische-hochzeit` 2 oturum,
`/tuerkischer-dj-deutschland` 4 oturum. "7 sn / 14 sn terk" bu örneklemle anlamlı değil;
bu sayfaları sırf bu yüzden değiştirmeyin.

> **Düzeltme (önceki özetim hatalıydı):** Ludwigsburg ve Karlsruhe şehir sayfaları **zaten var**
> (`src/content/cities.ts`, 22 şehir). Sorun "sayfa yok" değil, sayfanın bu sorgularda
> sıralanamaması. Çözüm yeni sayfa değil, mevcut sayfayı güçlendirmek.

---

## 2. Düzeltilmesi gerekenler (P0 – önce bunlar, ölçüm olmadan strateji kör)

### 2.1 GA4'te anahtar olay (key event) yok – 0 dönüşüm
Kodda olay fonksiyonları var (`enquiry_submitted`, `whatsapp_click`, `phone_click`,
`email_click`). Ama GA4 arayüzünde **hiçbiri anahtar olay olarak işaretlenmemişti**:
Edinme raporunda "Schlüsselereignisse 0,00". `docs/GTM-SETUP.md` §5 bunu manuel adım
olarak tarif ediyor; yapılmamıştı.

**Daha ciddi bulgu (11.11.2026):** `trackEnquirySubmitted()` kodda **hiçbir yerden
çağrılmıyordu**, yani form gönderimi GA4'e hiç gitmiyordu. Sunucu tarafındaki
`trackServerEnquirySubmitted` (`src/lib/analytics/server.ts`) yalnızca Plausible'a
gönderir, GA4'e değil. Düzeltildi: `enquiry-form.tsx` başarılı gönderimden sonra çağırıyor.
GA4'ün son 28 günündeki olaylar: `enquiry_started` ve `form_start` var (formu başlatan
var), `enquiry_submitted`, `phone_click` ve `email_click` yok.

Yapılacak (GA4 → Verwalten → Ereignisse, olaylar son 28 günde geldiyse listede görünür):
`enquiry_submitted`, `whatsapp_click`, `phone_click`, `email_click` → anahtar olay yap.
Bu kod değişikliği değil, yönetici arayüzü işi.

Önce kontrol: Echtzeit'te bu olayların gerçekten gelip gelmediğine bak. Gelmiyorlarsa
asıl sorun consent'tir (bkz. 2.3).

### 2.2 Sayfa yolları şablon olarak kaydediliyor
GA4 landing page raporunda `/tuerkischer-dj/[stadt]` ve `/ratgeber/[slug]` görünüyor.
Neden (kodla tutarlı): `usePathname()` `@/i18n/navigation`'dan (next-intl) geliyor ve
`AnalyticsScripts` bunu doğrudan `trackPageview(pathname)` ile gönderiyor
(`src/components/analytics/analytics-scripts.tsx:33`). Dinamik rotalarda bu değer gerçek
URL değil, `routing.ts` içindeki şablon anahtarı.

Sonuçlar:
1. Tüm şehir sayfaları ve tüm Ratgeber yazıları GA4'te **tek satır** olarak toplanıyor.
   Hangi şehrin/yazının işe yaradığı görülemiyor.
2. `auto-track.tsx` içindeki `CITY_PATHNAME_PATTERN` (`/^\/hochzeits-dj\/([^/]+)$/`)
   şablon dizgesiyle eşleşirse `city_page_view` olayının şehir değeri `[stadt]` literali
   olur (veriyle doğrulanmadı; Echtzeit/DebugView'da `city_page_view` parametresine bak).
3. `scroll_depth` olayları da şablon yolu taşıyor.

Düzeltme yönü (kod): sayfa görüntülemeye **gerçek** yolu gönder (`window.location.pathname`
ya da `useParams()` ile çözülmüş yol) ve `page_location`/`page_title` ekle; şehir slug'ını
`useParams()`'tan al. Etki alanı: `analytics-scripts.tsx`, `auto-track.tsx`, provider'ların
`pageview()` imzası. Düzeltmeden önce GA4 DebugView ile mevcut hatayı doğrula.
Geçmiş veri düzelmez; ölçüm ancak düzeltmeden sonra başlar.

### 2.3 Consent kaynaklı veri kaybı
`ga4-provider.ts` kasıtlı olarak onaydan önce `gtag.js` yüklemiyor. Search Console'da
90 günde 257 tık var, GA4'te 28 günde 128 oturum görünüyor; oran bu dönem için
tutarsız değil ama tam karşılaştırma yapılmadı. Onay vermeyenler **hiç ölçülmüyor**.
Bu bilinçli bir tercih (`docs/ANALYTICS.md`); sonuç: GA4 sayıları gerçek trafiğin alt sınırıdır.
Karar gerektirmez, yalnızca raporu okurken akılda tut.

### 2.4 İndekslenmemiş sayfalar: 777 / indeksli: 399
Sitede 8 dil var; çoğu indekslenmeyen URL büyük olasılıkla ku/ar/nl/fr/es varyantları ve
şablonlar. Bu doküman nedenleri analiz etmedi. Mevcut rapor: `docs/GSC-INDEKSLEME-RAPORU-EKIM-2026.md`.
Önce Search Console → Seiten → "Nicht indexiert" gruplarını (Gecrawlt – zurzeit nicht
indexiert / Duplikat / Weiterleitung) bu rapora karşı güncelle. Dil varyantları
Google'ın zayıf bulduğu "ince içerik" ise, indekslenmeyi zorlamak yerine hreflang/içerik
derinliğine bak.

### 2.5 Raporlama hijyeni
- GA4'te Search Console bağlantısı: Admin → Product links → Search Console links
  (yapılmadıysa; Edinme'de "Google organic search queries" raporu açılır).
- Dahili trafiği filtrele (Admin → Data filters), aksi halde 128 oturumun bir kısmı sen ve
  test oturumlarıdır.

---

## 3. Geliştirilecekler (mevcut sayfalar)

Sıralama kuralı: gösterimi yüksek, tıkı sıfır, sayfası var → önce bunlar.

| Sayfa | Veri | Aksiyon |
|---|---|---|
| `/hochzeits-dj/heilbronn`, `/mannheim`, `/pforzheim`, `/esslingen`, `/ludwigsburg`, `/karlsruhe` | 103–271 gösterim, 3–4 tık, GA4'te 13 sn | Title/H1'de sorgunun birebir kalıbı (`DJ Heilbronn`, `Hochzeits-DJ Heilbronn`). Üstte somut kanıt: gerçek mekân, mesafe, hangi etkinlik. Form/WhatsApp CTA'sı ilk ekranda. Şablon cümlesi değil, şehre özgü içerik (bkz. `docs/SEO-CITY-STRATEGY.md` §5). |
| `/hochzeits-dj/heilbronn` | `moderator heilbronn` 38 | H2 + kısa paragraf: Moderation/Hochzeitsmoderator Heilbronn. |
| `/tuerkischer-dj-deutschland` | 661 gösterim, 19 tık, 14 sn | En yüksek gösterim/terk oranı. İçerik amaca uymuyor olabilir: sayfa ülke geneli mi, şehir mi? Sorgu `türkischer dj` / `türkischer hochzeits dj` ise H1/ilk paragraf bunu karşılamalı, ardından Stuttgart/BW'ye yönlendir. |
| `/deutsch-tuerkische-hochzeit` | 7 sn, sorgu `dj deutsch türkische hochzeit` 57, `deutsch türkischer hochzeits dj` 53 | Bu kalıp ana kitle. Title'a `DJ` + `deutsch-türkische Hochzeit` al; sayfa zaten var, 7 sn ciddi uyumsuzluk işareti. |
| `/tuerkischer-dj-stuttgart` | 1.017 gösterim, 36 tık (en iyi CTR'lerden biri) | Dokunma, koru. Dönüşüm yolunu (CTA) güçlendir. |
| `/` | 95 tık, süre 49 sn | Fiyat/Kosten ve `dj buchen` niyeti `/pakete` ve `/anfrage`'a net yönlensin. |
| Ratgeber: `hochzeits-timeline-musterablauf` | `ablauf einer dj begleiteten hochzeit` 142 gösterim, 0 tık | metaTitle zaten "Ablauf einer Hochzeit mit DJ". Sorgu "dj begleiteten" diyor; başlık/H1'de bu ifade geçsin. Sıralamayı Search Console'da sayfa filtresiyle kontrol et. |
| Ratgeber: `hochzeit-ohne-dj-spotify-playlist` | `playlist oder dj event` 60, `live dj oder playlist` 30, `professioneller dj oder spotify` 14, `playlist für hochzeitsgäste erstellen` 48 | Dört sorgu aynı yazıya düşüyor: başlığı "DJ oder Playlist" karşılaştırması olarak yeniden çerçevele, açık cevaplı FAQ ekle. |
| Ratgeber: `wann-hochzeits-dj-buchen`, `hochzeitsbudget-musik-anteil` | `wann dj für hochzeit anfragen` 20, `guide für hochzeitsmusik-budget` 13 | Küçük ama sorgu eşleşiyor; başlıkları sorguya yaklaştır. |

Teknik hatırlatma (CTR): mevcut sayfalarda title ≤ 60 karakter, description CTA'lı olsun.
Home title zaten düzeltildi mi kontrol et (`docs/SEO-ACTION-PLAN.md` (a) 64 karakter uyarısı).

---

## 4. Üretilecekler (yeni içerik)

### 4.1 Öncelik 1 – kanıtlanmış talep, sayfa yok
1. **Felemenkçe içerik.** Veride `turkse bruiloft organiseren`, `turkse verloving`, `nisan turks`
   gösterim alıyor. `nl` dili sitede var; Hollanda/Belçika'daki Türk ailelerine yönelik
   Ratgeber yazıları: "Turkse bruiloft organiseren in Duitsland", "Turkse verloving (nişan) –
   wat komt erbij". Native Felemenkçe kontrolü şart; makine çevirisi yayınlama.
2. **Balkan düğünü.** `hochzeit balkan dj` üç şehirde 48 toplam gösterim. Sitede Balkan
   müziği/diline dair doğrulanmış bir bilgi yok (`.claude/BRAND-FACTS.md` kontrol edilmeli).
   **Müşteriye sor:** Balkan (sırp, bosna, arnavut vb.) düğünü verebiliyor mu? Cevap evetse
   sayfa/Ratgeber; hayırsa üretme.
3. **"English-speaking DJ" yazısı** (`english speaking dj belgium` 18). Kapsam: BW dışı
   (Belçika) için talep var; DJ'in seyahat edip etmediğini sor. Yoksa üretme.

### 4.2 Öncelik 2 – mevcut talebi genişlet
4. **Ratgeber: Marka/niyet köprüleri.** `türkischer dj` (99) ve `türkischer hochzeits dj` (64)
   genel sorgular; ilgili yazı: "Türkischer Hochzeits-DJ: Was ihn von einem normalen
   Hochzeits-DJ unterscheidet" (açık, dürüst karşılaştırma; `/tuerkischer-dj-stuttgart`'a link).
5. **Hochzeitsmoderator/Moderation.** `moderator heilbronn` 38. Şehir sayfalarında kısa
   bölüm yeter; ayrı kümeye gerek yok.
6. **Kina/Nişan** zaten var (`kina-gecesi-henna-abend-planen` 4 tık, `nisan-verlobung-planen`).
   Bunları iç linkle `/tuerkischer-dj-stuttgart`'a bağla; ek yazı üretme.

### 4.3 Üretme (veri desteklemiyor)
- Ek şehir sayfaları: 22 şehir zaten var, mevcutlar henüz sıralanmıyor. **Yeni şehir ekleme.**
- Yeni dil varyantları: önce nl'nin işe yaradığını gör.
- Genel "dj hochzeit" başlıklı geniş içerik: rekabet yüksek, pozisyon 18'in 2. sayfa
  problemini içerik hacmi çözmez, dış sinyal (yorum, link) çözer (§5).

---

## 5. Site dışı (yalnızca müşteri yapabilir)

Veri, `docs/SEO-ACTION-PLAN.md` §(c)'yi doğruluyor: sorun içerik eksikliğinden çok otorite.
Pozisyon 18 ve 2. sayfa tıkanması bunun işareti.
1. Google Business Profil: yorum sayısı ve puan, `site.reviews.isPublishable` kilidi.
2. Düğün portalı ve mekân listelemeleri (`docs/PARTNER-OUTREACH.md`).
3. Yorum isteği: gerçek müşterilerden, tek tek, etkinlikten hemen sonra.
4. Hochzeitsmesse Stuttgart, 9–10.01.2027 (Liederhalle): lead + içerik + backlink.

---

## 6. Sıra ve hedefler

| Sıra | İş | Tür | Ölçüt |
|---|---|---|---|
| 1 | Anahtar olayları işaretle (§2.1), Echtzeit'te doğrula | GA4 arayüzü | `Schlüsselereignisse` > 0 |
| 2 | Pageview yolu + şehir slug düzeltmesi (§2.2) | Kod | GA4'te `/hochzeits-dj/heilbronn` ayrı satır |
| 3 | SC–GA4 bağlantısı + dahili trafik filtresi (§2.5) | GA4 arayüzü | Organik sorgu raporu açık |
| 4 | Şehir sayfaları + `/tuerkischer-dj-deutschland` + `/deutsch-tuerkische-hochzeit` yeniden çerçeveleme (§3) | İçerik/kod | 28 gün sonra SC'de CTR ve pozisyon |
| 5 | Ratgeber: DJ-oder-Playlist, Ablauf (§3) | İçerik | Sorgu başına tık |
| 6 | Felemenkçe yazıları (§4.1) + müşteriye Balkan/İngilizce sorusu | İçerik + müşteri | NL gösterim → tık |
| 7 | İndeksleme analizi (§2.4) | Analiz | Indexiert/Nicht indexiert oranı |
| 8 | Site dışı otorite (§5) | Müşteri | GBP yorum sayısı |

**28 gün sonra bakılacak üç sayı:** (a) anahtar olay sayısı, (b) hedef şehir sayfalarının
Search Console CTR/pozisyonu, (c) AI Assistant oturumu. Bu dokümandaki önceliklerin
değişip değişmeyeceğini bu üç sayı belirler. Tek aylık veriyle (128 oturum) büyük strateji
değişikliği yapma.

## 7. Bu turda yapılanlar (11.11.2026)

- **Tracking:** `analytics-scripts.tsx` artık `page_view` için tarayıcıdaki gerçek yolu
  gönderiyor (`window.location.pathname`, tetikleyici `next/navigation` `usePathname`).
  Şehirden şehre geçiş de artık `page_view` üretiyor (önce üretmiyordu, çünkü next-intl
  anahtarı değişmiyordu). `auto-track.tsx`: şehir slug'ı `useParams()`'tan, scroll ve
  WhatsApp/telefon/e-posta olaylarının `page` değeri gerçek yol. Geçmiş veri düzelmez.
- **Meta:** `hochzeit-ohne-dj-spotify-playlist` (DE) → "DJ oder Playlist? …";
  `nisan-verlobung-planen` (NL) → "Nişan: de Turkse verloving uitgelegd", açıklama
  "Wat is een nişan?" ile başlıyor.
- **Form dönüşümü:** `enquiry-form.tsx` başarılı gönderimde `trackEnquirySubmitted`
  çağırıyor (yalnızca kategorik alanlar, kişisel veri yok).
- **GA4 anahtar olay:** `whatsapp_click` işaretlendi. `enquiry_submitted`, `phone_click`
  ve `email_click` son 28 günde hiç gelmediği için GA4 listesinde yok; işaretlenemedi.
  Deploy'dan sonra ilk geldikleri gün Verwaltung → Ereignisse → Letzte Ereignisse'de
  yıldızla işaretle.
- **Yapılmadı:** SC–GA4 bağlantısı, dahili trafik filtresi.
- **Yapılmadı (müşteri girdisi ister):** şehir sayfalarına gerçek mekân/düğün/foto,
  GBP yorumları, Balkan/Belçika soruları.

## Açık sorular (müşteriye)
1. Balkan düğünü (Sırp/Bosna/Arnavut) veriyor mu?
2. BW dışı (Belçika/Hollanda) iş alıyor mu?
3. Anfrage formu ve WhatsApp'tan gelen lead sayısı (GA4'ün göremediği gerçek dönüşüm).
