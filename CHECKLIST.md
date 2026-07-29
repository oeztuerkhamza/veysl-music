# DJ Veys.DE — Yapılacaklar Listesi

**Son güncelleme:** Temmuz 2026
İki bölüm: **A) Yazılım tarafı** (senin/geliştiricinin işi) — **B) İşletme tarafı** (Veysel'in işi).

Sıralama **etkiye göre**, aciliyete göre değil. Almanca müşteri versiyonu için bkz. [HANDOVER.md](HANDOVER.md).

---

## 🔴 LAUNCH BLOKERLERİ — bunlar bitmeden site yayına giremez

| # | Ne | Kim | Neden bloker |
|---|---|---|---|
| 1 | Impressum: **tam sokak adresi + posta kodu** | İşletme | Almanya'da § 5 DDG zorunlu. Eksikse **abmahn** (ihtarname + masraf) riski. Eski Impressum'da sadece "Obertürkheim" yazıyordu, yetmez. |
| 2 | **USt-IdNr.** veya Kleinunternehmer (§ 19 UStG) beyanı | İşletme | Aynı yasal zorunluluk |
| 3 | Datenschutzerklärung **hukuki kontrolü** | İşletme | Şu an taslak. Avukat ya da güvenilir jeneratör onayı şart. |
| ~~4~~ | ~~Payload'ın istemci paketine sızması~~ | Yazılım | ✅ **Çözüldü** — `server-only` sınırı kondu, sayfalar 200 dönüyor |
| ~~5~~ | ~~Dil dosyalarının senkronu~~ | Yazılım | ✅ **Çözüldü** — 7 dilin hepsi 791 anahtarda eşit, doğrulandı |

**Kalan üç bloker de işletme tarafında.** Yazılım tarafındaki iki bloker
kapandı; site teknik olarak yayına hazır, yasal olarak değil.

---

# A) YAZILIM TARAFI

## A.1 Şu an devam eden

- [ ] **Payload 500 hatası** — `server-only` sınırı koy, istemciden gelen import zincirini kes
- [ ] Admin paneli: takvim, buchung, blocked dates, anfrage gelen kutusu
- [ ] `siteSettings` global — e-posta, telefon, adres, sosyal, **Sprechstunden**
- [ ] İletişim formu (`/kontakt`) + `contactMessages` koleksiyonu
- [ ] WhatsApp ön-eleme modalı (kaçış kapısıyla birlikte)
- [ ] 15 blog yazısı (DE/TR/EN)
- [ ] Avrupa ülke sayfaları (AT, CH, NL, BE, FR + destination hub)
- [ ] Fotoğraf slot kaydı (`site-images.ts`) + `<SiteImage>` bileşeni
- [ ] Sosyal medya seçimi (`curatedPosts` koleksiyonu)
- [ ] Analytics (Plausible) + huni olay takibi + CRO denetimi

## A.2 Bitmiş

- [x] Next.js 16 + React 19 + TS + Tailwind v4
- [x] **7 dil** (de/tr/ku/en/nl/fr/es), her dile özel SEO slug'ları
- [x] hreflang + x-default, otomatik dil yönlendirmesi kapalı (Googlebot Almanca ana sayfayı görsün diye)
- [x] Design system, layout, dil seçici, tema
- [x] Ana sayfa — WebGL hero, sıfır fotoğrafla çalışıyor
- [x] Global audio player (waveform, sayfa geçişinde kesilmiyor)
- [x] 3 adımlı anfrage hunisi + müsaitlik kontrolü + **lead scoring** (hot/warm/cold)
- [x] 12 içerik sayfası × 7 dil
- [x] SEO: schema.org, sitemap, robots (AI botlarına izinli), llms.txt, PWA manifest
- [x] **GEO cevap merkezi** `/fragen` — 40 soru + `/api/faq`
- [x] 7 şehir landing sayfası (Karlsruhe, Mannheim, Heilbronn, Reutlingen, Pforzheim, Esslingen, Böblingen)
- [x] Rakip analizi + anahtar kelime haritası + eylem planı (`docs/`)
- [x] YouTube RSS beslemesi (anahtarsız, otomatik)
- [x] Resmî WhatsApp simgesi, sağ alt sabit buton

## A.3 Yayın öncesi — teknik

- [x] ~~Postgres'e geç~~ — **gerekmiyor.** Vercel değil, kendi VPS'imizde kalıcı
      volume üzerinde SQLite çalışıyor; gerekçe `docs/DEPLOYMENT.md` → "Why SQLite"
- [ ] Rate limiter'ı Upstash/KV'ye taşı — **tek container olduğu sürece gerekmiyor.**
      Yalnızca `app` birden fazla replikaya çıkarılırsa şart olur
- [x] ~~`ResendTransport` yaz~~ — **bitti.** Hem `resend` (REST) hem `smtp`
      (nodemailer) uygulandı. Bu kurulumda `smtp` kullanılacak, çünkü mail
      aynı sunucuda self-hosted
- [ ] `.env` üretim değerleri: `JWT`/Payload secret, DB, Resend, Plausible
- [ ] `next build` üretim derlemesi + Lighthouse ölçümü (hedef 90+)
- [ ] Core Web Vitals doğrula: LCP ≤ 2,5 sn · INP ≤ 200 ms · CLS ≤ 0,1
- [ ] Veritabanı dosyası ve `.env` **`.gitignore`'da** olduğunu doğrula — müşteri e-postaları repoya girmemeli
- [ ] Yedekleme: DB + yüklenen görseller
- [ ] Uptime izleme + hata takibi (Sentry vb.)
- [ ] `og-image.jpg` (1200×630), `logo.png`, PWA ikonları (192/512 + maskable)

## A.4 Domain göçü — ⛔ **konusuz kaldı**

**Eski domain (`veystunesofficial.de`) Temmuz 2026'da iptal edildi.** Göçün
tamamı 301 yönlendirmesine dayanıyordu, o da domain elde olmadan mümkün değil.

- [x] ~~`www` → apex yönlendirmesi~~ — **çalışıyor**, `dj-veys.de` tarafında doğrulandı
- ~~Eski domaini iptal etme, elinde tut~~ — ⛔ iptal edildi
- ~~Sayfa sayfa 301~~ — ⛔ uygulanamaz. `deploy/redirects-legacy.conf` ve
  nginx'teki legacy bloğu yerinde ama artık hiç eşleşmeyecek
- ~~Search Console **Adres değişikliği**~~ — ⛔ eski property'nin doğrulanmış
  olmasını *ve* 301 veriyor olmasını şart koşar; ikisi de yok
- [ ] Sitemap gönder, indeksleme takibi — **geçerliliğini koruyor**, eski domainle ilgisi yoktu
- [ ] Google Business Profile'daki site adresini güncelle — **yeni kayıt açma**,
      mevcut 5,0 ★ / 31 yorumlu profili düzenle
- [ ] **Instagram bio linki** (B.3) — artık 63.000 kişilik kitlenin siteye
      ulaşabildiği **tek** yol, çünkü eski domain üzerinden geçiş kalmadı

Kayıp dürüst değerlendirmesi: küçük. Eski site zaten genel sorgularda
sıralanmıyordu ve iptalden önce ana sayfası 503, diğer tüm yolları 404
veriyordu. Ayrıntı: `docs/DEPLOYMENT.md` → "Domain migration".

> **Geri alınabilir mi:** Alman registrar'larda kündigung genelde dönem
> sonunda işler ve o tarihe kadar geri çekilebilir. Geri çekilirse yukarıdaki
> plan aynen uygulanabilir hale gelir. Karar vereceksen şimdi ver.

## A.5 Yayın sonrası

- [ ] Kalan 4 dilin senkronu + kalite kontrolü
- [ ] Kürtçe/Fransızca/İspanyolca şehir sayfası metinleri (şu an sadece DE/TR/EN)
- [ ] Blog yazılarının kalan dillere çevirisi
- [ ] A/B testi altyapısı
- [ ] Instagram Graph API entegrasyonu (token gelince)
- [ ] Google Places API ile canlı yorum akışı (Place ID gelince)

---

# B) İŞLETME TARAFI — Veysel

## B.1 🔴 En yüksek etki: fotoğraf ve video

Düğün pazarında dönüşümü belirleyen bir numaralı şey görsellik. Çift üç DJ sitesini iki dakikada karşılaştırıyor. **Teknik SEO bizi 1. sıraya taşısa bile, fotoğraf yoksa talep rakibe gider.**

Elimizdeki 12 fotoğrafın içinde **tek bir gerçek düğün karesi yok** — çift yok, dolu pist yok, mekân yok.

- [ ] **Gece dolu tanzfläche** — sitenin en önemli tek karesi
- [ ] **Çift duygu anında** (ilk dans, gelin girişi)
- [ ] **Elinde mikrofonla moderasyon** — sunuculuk hizmetini gösterir
- [ ] **Canlı saz / gitar çalarken** — asıl farkın bu
- [ ] **Orkestra ve nefesli çalgılar sahnede** — rakiplerde yok
- [ ] Güzel bir mekânda kurulu DJ seti (boş beyaz odada değil)
- [ ] Profesyonel portre (EPK ve basın için)
- [ ] **Aftermovie / showreel** (30–90 sn)

> Pratik yol: sonraki 2-3 düğünde çiftin fotoğrafçısına sor — isim vererek birkaç kare kullanabilir misin? **Çiftten ve fotoğrafçıdan yazılı izin al.** Tanınabilir misafir varsa bu Almanya'da yasal zorunluluk (DSGVO + Recht am eigenen Bild).

## B.2 🔴 Google yorumları — asıl ranking parası

Rakip analizinde bulundu: benzer DJ'lerde **12–86 yorum** var. En tehlikeli rakip DJ Serkan'da ~30 yorum + 20 yıl.

- [ ] **Yorum sayını söyle.** Profilde 5,0 ★ görünüyor ama sayı bilinmiyor. **Bu sayı gelmeden yıldız rozeti ve rating schema'sı açılmıyor** — uydurma sayı basmıyoruz.
- [ ] **Google Place ID**
- [ ] **Sistemli yorum topla:** her düğünden 2-3 gün sonra kısa WhatsApp + doğrudan yorum linki. Gerçekçi hedef: 1 yılda 30-50 yorum.
- [ ] Google Business Profile'ı tamamla: kategori, hizmet alanı, hizmetler, fotoğraflar, düzenli gönderi

## B.3 🔴 Instagram — 63.000 kişi bekliyor

- [ ] **Bio'daki linki `dj-veys.de` yap** — şu an eski domaini gösteriyor. **5 dakikalık iş, en hızlı trafik kaynağın.**
- [ ] Profil metnine DJ Veys adını ekle
- [ ] YouTube kanal bilgisi ve GBP'yi de yeni domaine çevir
- [ ] Sonraki etkinliklerde DJ Veys'i görünür kıl (DJ masası, story, aftermovie brandingi)

## B.4 🟡 Fiyat ve paketler

Site şu an her yerde **"Preis auf Anfrage"** diyor. Çalışır ama ideal değil — şeffaf başlangıç fiyatı uygunsuz talebi eler, sana zaman kazandırır.

- [ ] Essential / Signature / Prestige başlangıç fiyatları
- [ ] Paket içerikleri doğru mu? (saat, kişi sayısı, teknik)
- [ ] Anfahrt kaç km'ye kadar dahil?
- [ ] Etkinlik sayısı **200+** olarak yazıldı — teyit

## B.5 🟡 Referans ve sosyal kanıt

Bu bölümler bilerek **boş** ve tasarlanmış boş durum gösteriyor. **Hiçbir isim, alıntı veya mekân uydurulmadı.**

- [ ] 3–5 **müşteri yorumu** + yayın izni (çiftin adı, ay, mekân)
- [ ] Çaldığın **mekânların listesi**
- [ ] Partner onayı: Liebe Events, Alpina Löwen, ArslanEvent, AuraEvent — kendi paylaşımlarında görünüyorlar ama **logo/isim kullanımı için onlardan izin gerekir**

## B.6 🟡 Mail kurulumu

Ayrıntı: [docs/MAIL-SETUP.md](docs/MAIL-SETUP.md)

- [ ] `info@dj-veys.de` postası (öneri: Mailbox.org, Alman sağlayıcı)
- [ ] `no-reply@dj-veys.de` gönderimi (öneri: Resend)
- [ ] **MX + SPF + DKIM + DMARC** kayıtları — biri eksikse onay mailleri spam'e düşer
- [ ] DMARC'ı `p=none` ile başlat, 2-4 hafta sonra sıkılaştır. **Doğrudan `p=reject` yaparsan kendi postanı bloklarsın.**
- [ ] Özel gmail adresinden çık — premium talepte kurumsal olmayan adres güven kaybettirir

## B.7 🟢 İçerik ve materyal

- [ ] **Mix dosyaları** (MP3): Empfang, Dinner, Peaktime, Halay/Arabesk, After-Hours
- [ ] Spotify / SoundCloud / Mixcloud profili varsa
- [ ] **Technical Rider** PDF (mekânlar istiyor)
- [ ] Pressefotos ZIP
- [ ] Dolu günlerin listesi (takvimde gösterilecek)

## B.8 🟢 Cevap bekleyen sorular

- [ ] **Kurmancî konuşuyor musun?** Site Kürtçe de var ama sunum dilleri Almanca/Türkçe/İngilizce yazıldı. Kürtçe de sunabiliyorsan bu, bölgede neredeyse hiç rakibin olmadığı bir avantaj. Ama yanlış yazarsak Kürtçe bekleyip Türkçe duyan aile kötü yorum yazar.
- [ ] Fransızca/Felemenkçe sunum yapmıyorsun, doğru mu? (Siteye öyle yazıldı)
- [ ] Norveç/İsviçre gibi AB dışı ülkeler için ekipman karnesi (ATA) deneyimin var mı?

## B.9 🟢 Off-page — uzun vade

Rakip analizinin dürüst sonucu: **bölgesel hâkimiyet 6–18 ay sürer** ve kodla değil bunlarla belirlenir.

- [ ] Mekânların "empfohlene Dienstleister" sayfalarına girmek
- [ ] Wedding planner ve fotoğrafçılarla karşılıklı bağlantı
- [ ] Hochzeitsmesse katılımı
- [ ] Düğün portallarına kayıt (eventpeppers, hochzeit.click — rakipler oradan geliyor)
- [ ] Basın/röportaj

---

## Gerçekçi zaman çizelgesi

| Aşama | Süre | Neye bağlı |
|---|---|---|
| Site teknik olarak yayına hazır | 1–2 hafta | Yazılım tarafı |
| Yasal olarak yayına hazır | Adres + USt-IdNr + hukuki kontrol gelince | **İşletme** |
| Google'da görünmeye başlama | 2–6 hafta | İndeksleme |
| Bölgede rekabetçi | 2–4 ay | İçerik + teknik |
| **Bölgede hâkim** | **6–18 ay** | **Yorumlar + backlink + zaman** |

Son satır önemli: on-page çalışmanın yapabileceği her şeyi maksimuma çektik. Kalanı yorum sayısı, backlink ve zaman belirliyor — ve ikisi de B bölümünde.
