# Search Console "Seitenindexierung" raporu — gerçek verilerle analiz

**Kime:** Veysel · **Tarih:** 16 Ekim 2026
**Girdi:** Search Console'dan indirilen dört liste (404: 273 · Weiterleitung: 22 · robots.txt: 16 · "Gecrawlt – nicht indexiert": 31).
**Ayrıca bak:** [SEO-INCELEME-EKIM-2026.md](SEO-INCELEME-EKIM-2026.md)

> Gönderdiğin beş dosyadan ikisi aynı (robots.txt listesi iki kez). **"noindex" (20) ve
> "Gefunden – nicht indexiert" (15) listeleri yok**; onları da dışa aktarırsan tamamlarım.

---

## Kısa cevap

Listeleri tek tek canlı sitenin koduna karşı sınadım. **İki gerçek hata buldum ve düzelttim**;
geri kalanı bilinçli davranışlar ya da Google'ın kalite kararı.

| Bulgu | Sayfa | Durum |
|---|---|---|
| **Dil değiştirici 404'e götürüyordu** (yanlış slug, olmayan dil) | ~266 / 273 | 🔧 Düzeltildi |
| **`/api/social/media/` görselleri robots.txt ile kapalıydı** | 16 / 16 | 🔧 Düzeltildi |
| Eski adresler → 301 (guide slug'ları, `/musik`, `www`) | 22 / 22 | ✅ Beklenen |
| Canlı Türkçe rehber yazıları indexlenmemiş | 13 | ⚠️ Google'ın kararı, aşağıda |
| `feed.xml`, `woff2`, `manifest` vb. "indexlenmemiş" | 11 | ✅ Gürültü |
| Eskimiş yönlendirme kayıtları | 7 | ✅ Gürültü |

---

## 1. Nicht gefunden (404) — 273

Her adresi sorguladım ve rota ailesine ayırdım:

| Grup | Adet | Neden |
|---|---|---|
| ku / ar / nl / fr / es dillerinde | **224** | O dilde bu sayfa yok (şehir, bölge, bazı rehberler) |
| de / tr / en'de **başka bir dilin slug'ı** | **42** | Örn. `/tr/rehber/wedding-dj-checklist` (İngilizce slug Türkçe yolda) |
| Eski build'in yazı tipi dosyası | 1 | `/_next/static/media/….woff2`, deploy'dan sonra hash değişir |
| **Artık 404 değil / sayfa değil** | 6 | 3'ü şimdi 308, 2'si 200 (`/tr/dugun-dj-avrupa…`), 1'i `mta-sts.dj-veys.de` alt alan adı |

### Asıl neden: dil değiştirici (🔧 düzeltildi)

42 yanlış-slug adresinin hepsi tek bir şeyin ürünü: **dil değiştiricinin hedef adresi, mevcut sayfanın
parametrelerinden kuruluyordu.** İngilizce rehber `/en/guide/wedding-dj-checklist` üzerinde "Türkçe"yi
seçmek `/tr/rehber/wedding-dj-checklist` üretiyordu, doğrusu `/tr/rehber/dugun-dj-kontrol-listesi`.
Üstelik her sayfada sekiz dilin hepsi sunuluyordu; şehir, bölge ve Landesseiten yalnızca de/tr/en'de
olduğu için, bir şehir sayfasında "Français" seçmek kullanıcıyı **404'e** götürüyordu.

Bu, yalnızca bir Search Console sorunu değil, **ziyaretçilerin yaşadığı gerçek bir hataydı**: dil
değiştiren bir kullanıcı (özellikle Türkçe/Almanca/İngilizce rehber okuyan) hata sayfasına düşüyordu.

**Düzeltme** (`src/components/layout/language-switcher.tsx`): Değiştirici artık hedefi sayfanın kendi
`hreflang` etiketlerinden okuyor. Bu etiketler her sayfada doğru slug'ı ve yalnızca gerçekten var olan
dilleri içerir, sitemap'le aynı kaynaktır. Sonuç:

- Şehir sayfasında yalnızca **Deutsch, Türkçe, English** sunuluyor
- `/en/guide/wedding-dj-checklist` → Türkçe → `/tr/rehber/dugun-dj-kontrol-listesi`
- `/pakete` hâlâ 8 dili sunuyor, hepsi doğru adrese gidiyor

Gerçek bir tarayıcıda (headless Chromium) denendi: 5 geçiş senaryosu ve menü içerikleri doğru.

**Bu adresler listeden ne zaman çıkar?** Yeni 404 üretilmiyor; mevcutlar Google'ın yeniden tarama
hızıyla birkaç hafta/ay içinde düşer. **Tekrar "Validation" başlatma**, adresler hâlâ 404 verdiği için her
seferinde "fehlgeschlagen" der.

### 2. Seite mit Weiterleitung — 22 ✅ beklenen

Hepsi geçerli bir hedefe gidiyor:

- 14× eski rehber slug'ı `/en/guide/<almanca-slug>`, `/tr/rehber/<almanca-slug>` → yeni slug
- 6× emekli `/musik` sayfası (de, en, es, fr, ku, nl) → galeri
- `http://www.dj-veys.de/` ve `https://www.dj-veys.de/` → ana sayfa (nginx, `www` → apex)

Google bunları "indexlenmemiş" sayar, çünkü yönlendirme indexlenmez, hedef indexlenir. Dokunma.

### 3. Durch robots.txt blockiert — 16 🔧 düzeltildi

Hepsi aynı kalıpta: `/api/social/media/<id>`. Bunlar Instagram/YouTube **önizleme görselleri**: ana
sayfadaki sosyal şerit bunları kendi sunucundan sunuyor (tarayıcı hiçbir zaman Instagram'a doğrudan
gitmiyor, gizlilik için). `robots.txt` ise tüm `/api/` yolunu kapatıyordu; yalnızca `/api/faq` açıktı.
Sonuç: **Googlebot sayfanın görsellerini yükleyemiyordu**, Google Görseller'e de giremiyorlardı.

**Düzeltme** (`src/app/robots.ts`): `Allow: /api/social/media/` eklendi. Yol yalnızca genel, içerik
adresli (`immutable`) görselleri sunuyor ve girdi kabul etmiyor. `/api/` altında geri kalan her şey kapalı.

### 4. Gecrawlt – zurzeit nicht indexiert — 31

| Grup | Adet | Anlamı |
|---|---|---|
| **Canlı Türkçe sayfalar** | 12 | `tr/islami-dugun` ve 11 Türkçe rehber yazısı |
| Canlı İngilizce rehber | 1 | `en/guide/venue-acoustics-checklist` |
| Eskimiş kayıtlar (şimdi 308) | 7 | Alt slug'larla taranmış, sonra yönlendirilmiş |
| HTML olmayan dosyalar | 11 | `feed.xml` ×6, `manifest.webmanifest`, `favicon.ico`, `woff2`, `/api/faq`, `http://dj-veys.de/` |

**Dikkate değer olan 13 canlı sayfa**, ve **12'si Türkçe**: sitenin çekirdek kitlesi. Ne dediğine
bakalım:

- **Teknik hata yok.** Hepsi 200, sitemap'te, canonical kendini gösteriyor, `noindex` yok, hreflang doğru
  (`npm run seo:check`).
- "Crawled – not indexed", Google'ın içeriği okuyup **şimdilik** indexe almamayı seçmesi demek. Bu sayfaların
  çoğu 25–30 Ağustos'ta taranmış: yani yeni adresler. Slug yerelleştirmesinden önce bu Türkçe rehberler
  Almanca slug'larla (404) duyuruluyordu; yeni adreslerin geçmişi, bağlantısı ve güveni sıfırdan başlıyor.
- Listedeki 7 kayıt, eski Almanca slug'ların 308 ile yeni adreslere giden hâlleri. Google bunu birkaç
  haftada kendisi çözer.

Teknik bir kusur olmadığı için kod tarafında yapılacak bir şey yok. **Yapılacaklar sende:**

1. **"Indexierung beantragen"** — aşağıdaki 12 sayfa için URL-Prüfung'ten tek tek (günde ~10 hak):
   `/tr/islami-dugun`, `/tr/rehber/kina-gecesi-planlama`, `/tr/rehber/dugun-zaman-cizelgesi-ornek-akis`,
   `/tr/rehber/turk-dugunune-katilan-alman-misafirler`, `/tr/rehber/dj-mi-canli-grup-mu`,
   `/tr/rehber/dugunde-dj-yerine-spotify-listesi`, `/tr/rehber/stuttgart-dugun-salonu-secimi`,
   `/tr/rehber/davul-zurna-halay-roman-havasi`, `/tr/rehber/yurt-disinda-dugun-dj`,
   `/tr/rehber/dugun-aksami-dramaturjisi`, `/tr/rehber/alman-turk-dugunu-iki-aile`,
   `/tr/rehber/acilis-dansi-sarki-secimi`.
2. **Türkçe sayfalara dış bağlantı:** Türk topluluk sitelerinde, Instagram ve YouTube açıklamalarında
   Türkçe rehberlere link ver. En hızlı güven sinyali bu.
3. **Sabır:** Yeni adreslerde 4–8 hafta normal.

### 5. Eksik listeler

- **"Durch noindex ausgeschlossen" (20):** Önceki taramada birebir doğruladım: Impressum + Datenschutz × 8 dil
  (16) ve SSS'nin ku/nl/fr/es sürümleri (4). Bilinçli.
- **"Gefunden – zurzeit nicht indexiert" (15):** Listeyi görmeden yorumlayamam. Google adresi biliyor ama
  henüz taramadı; muhtemelen en derindeki şehir/blog sayfaları.

---

## `gsc:triage` ile yeniden sınama

```bash
npm run gsc:triage -- liste.csv --out rapor.csv
```

Bu veriyle çalıştırınca (düzeltmeler uygulanmış yerel derlemeye karşı): 404 listesi **270 `erwartet`,
3 `offen`, 0 `PRÜFEN`**; yönlendirme listesi 20 `erwartet` (kalan 2'si `www`/`http` varyantı, nginx'te
yönleniyor, yerelde yok); "crawled – not indexed" listesi 7 `erwartet` (eskimiş yönlendirme) ve 24
`offen`; robots listesi artık engellenmiyor, 15'i `erwartet` (görseller sunucu önbelleğinden gelir, yerelde
önbellek boş).

Betik bu çalışmada dört şey öğrendi: başka dilin slug'ı, eski build dosyaları, alt alan adları ve
`/api/` adresleri artık "gürültü" olarak ayrılıyor; geri kalan 404'ler gerçek bir sorun işareti sayılıyor.

---

## Sınırlar

- Canlı siteye ve Search Console'a erişimim yok. Listeleri dosyadan okudum, her adresi **kodun yerel
  üretim derlemesine** sordum. Bu, canlıda deploy edilmiş sürümle aynı kod olduğu sürece geçerli.
- **Dil değiştiricinin Google'a nasıl bu adresleri öğrettiği kesin değil:** yanlış-slug adreslerinin
  (ör. `/en/guide/bruiloft-dj-checklist`) başka bir kaynağı mümkün değil gibi görünüyor, ama Googlebot'un
  menüleri tıklamadığını da biliyoruz. Ziyaretçilerin, test edenlerin ya da başka tarayıcıların ürettiği
  adresler olabilir. 224 adreslik ku/ar/nl/fr/es grubunun bir kısmı eski sitemap'lerden de gelmiş olabilir.
  Sonuç değişmiyor: kaynak kapatıldı, yeni 404 üretilmiyor.
- Düzeltmeler deploy edilene kadar canlıda geçerli değil.
