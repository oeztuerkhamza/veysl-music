# Search Console "Seitenindexierung" raporu — ne demek, ne yapılır

**Kime:** Veysel · **Tarih:** 15 Ekim 2026
**Girdi:** Search Console'dan yapıştırdığın altı satırlık özet (Grund · Quelle · Validierung · Seiten).
**Ayrıca bak:** [SEO-INCELEME-EKIM-2026.md](SEO-INCELEME-EKIM-2026.md)

---

## Kısa cevap

**Raporun büyük kısmı beklenen gürültü, kodda yeni bir hata bulmadım.** Altı satırın üçü (404,
Weiterleitung, noindex) bu sitenin bilinçli tasarımının sonucu; biri (robots.txt) büyük olasılıkla
API adresleri; asıl dikkate değer olanlar **46 sayfalık "indexlenmedi" grubu**. Ve bunların hiçbiri
"validation'ı tekrar başlat" ile düzelmez.

Bunu iki şeyle destekliyorum, ama **Google'ın sana gösterdiği gerçek URL listelerini
görmediğim için** bazı satırlar için "büyük olasılıkla" diyorum, kesin demiyorum:

1. Canlı sitenin kodunu üretim ayarlarıyla yerelde derleyip **tüm sitemap'i (280 URL) ve içlerindeki
   301 farklı iç bağlantı hedefini taradım**: hiçbir sayfa 404'e, yönlendirmeye ya da robots'la kapatılmış bir adrese
   bağlanmıyor. Sitemap'teki her adres 200 veriyor. `hreflang` karşılıklı.
2. Sitenin ürettiği her URL kombinasyonunu (8 dil × tüm rota ve slug'lar, 1.080 adres) tek tek
   sorguladım ve sonucu Search Console sayılarıyla karşılaştırdım.

---

## Satır satır

| Grund | Seiten | Yargı | Neden |
|---|---|---|---|
| **Nicht gefunden (404)** | 273 | ✅ Büyük olasılıkla gürültü | Aşağıda §1 |
| **Seite mit Weiterleitung** | 22 | ✅ Beklenen | §2 |
| **Durch robots.txt blockiert** | 16 | ✅ Büyük olasılıkla API adresleri | §3 |
| **Durch "noindex" ausgeschlossen** | 20 | ✅ Birebir doğrulandı | §4 |
| **Gecrawlt – zurzeit nicht indexiert** | 31 | ⚠️ Gerçek konu | §5 |
| **Gefunden – zurzeit nicht indexiert** | 15 | ⚠️ Gerçek konu | §5 |

### 1. Nicht gefunden (404) — 273

Sitenin **şu an** ürettiği hiçbir adres 404 vermiyor (yukarıdaki tarama). Yani bu sayı yeni bir hatadan
gelmiyor, **geçmişte Google'ın öğrendiği adreslerden** geliyor. Repo geçmişi bunu açıklıyor:

- Site başlangıçta sitemap'te ve `hreflang`'da bazı sayfaları **sekiz dilde** duyurdu. Sonra Stadt-,
  Regions-, Landes- ve Ratgeber-sayfaları yalnızca Almanca, Türkçe ve İngilizce'ye indirildi (çünkü
  diğer dillerde gerçek metin yok; sahte çeviri sayfası yayınlamamak bilinçli bir karar). Google
  eski adresleri hâlâ biliyor ve 404 görüyor.
- 23 Ağustos'ta aynı konu zaten bir kez incelenmişti: o gün 128 adet vardı, 31'i alt slug'lardan
  kurtarılıp 301'e çevrildi (`next.config.ts`, commit `e4efb4b`); "hiç ulaşılmamış diller" için 404
  **bilerek** bırakıldı.

Yerel taramada bu aileler görünüyor: **Stadt-Seiten ku/ar/nl/fr/es = 105 adres**, Regions-Seiten
≈ 21, Landes- ve Nischen-Seiten 5 dilde = 23; bunlara blog yazılarının nl/fr/es/ku/ar'daki
karşılıkları da eklenince sayı yüzlerce olur. **273'ün tam olarak hangi adreslerden oluştuğunu bilmiyorum**
çünkü listeyi görmedim; bu bir çıkarım, ölçüm değil.

**Neden artmış (128 → 273)?** Bunu kesin söyleyemem. En makul açıklama: yeni sayfalar yayınlandıkça
ve Google daha fazla eski sitemap/hreflang adresini işledikçe sayı büyümüş. Şu an yeni 404 üretilmediğini
gösteren tarama, sayının **artık büyümemesi** gerektiği anlamına geliyor.

**Ne yapılır:** Hiçbir şey. 404 doğru cevap; Google birkaç ay içinde listeyi kendisi küçültür.
**Ne yapılmaz:** "Validation" düğmesine tekrar basmak; bu adresler hâlâ 404 verdiği için Google her
seferinde "Fehlgeschlagen" der. **İstisna:** listede Almanca (kök), `/tr/…` veya `/en/…` ile başlayan ve
**gerçekten var olması gereken** bir sayfa görürsen, o bir hata olabilir; `npm run gsc:triage` (aşağıda)
bunları ayırır.

### 2. Seite mit Weiterleitung — 22

Sitenin bilinçli yönlendirmeleri; yerel taramada **45 yönlendirme** var ve hepsi geçerli bir hedefe gidiyor:

- `/<dil>/` → `/<dil>` (sondaki eğik çizgi, 7 adres)
- `/hochzeits-dj/stuttgart` ve diller (8) → ana sayfa. Stuttgart için ayrı şehir sayfası yok, ana sayfa
  o anahtar kelimeyi hedefliyor
- Eski Ratgeber slug'ları `/tr/rehber/<almanca-slug>` → yeni slug (30)

Bunların dışında `next.config.ts` emekli `/musik` sayfasını galeriye ve üst dizinleri (`/hochzeits-dj`,
`/tuerkischer-dj`) ilgili Landesseite'ye de yönlendiriyor.

Google bunları "indexlenmeyen" sayıyor çünkü yönlendirme **indexlenmez**, hedef indexlenir. Bu hata değil.
Validation "fehlgeschlagen" çünkü yönlendirme duruyor. Dokunma.

### 3. Durch robots.txt blockiert — 16

`robots.txt` yalnızca `/api/` ve `/admin` yollarını kapatıyor, `/api/faq` bilerek açık. Üretim HTML'inde
bu yollara tek bir bağlantı var (`/api/faq`, izinli). Google ise **JavaScript dosyalarının içindeki**
adres benzeri metinleri de "keşfedilen URL" sayar; bu 16 adres büyük olasılıkla formların ve CMS'in
`/api/anfrage`, `/api/kontakt`, `/api/availability`, `/api/users/me` gibi API uçları. Bunlar sayfa değil
ve kapalı olmaları **doğru**.

**Doğrula:** Search Console'da bu satıra tıkla, listeyi dışa aktar. Hepsi `/api/…` veya `/admin…` ise
tamam. Tek bir normal sayfa varsa bana gönder; bu gerçek bir hata olurdu. (Not: 16, siteyi tamamen
kapatan bir hata olsaydı 280'e yakın olurdu.)

### 4. Durch "noindex" ausgeschlossen — 20

**Birebir doğruladım:** Yerel taramada sitemap dışında, `noindex` taşıyan ve 200 veren **tam 20 sayfa**
çıkıyor:

- Impressum ve Datenschutz × 8 dil = 16
- SSS sayfası (`/fragen`) ku, nl, fr, es = 4 (bu dillerde henüz tam çeviri yok, bu yüzden indexlenmesi
  istenmiyor)

Hepsi footer/menüden bağlı, hepsi sitemap'te **yok**. Tam istenen durum. Validation "Gestartet" kalabilir;
bir şey düzeltmen gerekmiyor.

### 5. "Gecrawlt – nicht indexiert" (31) ve "Gefunden – nicht indexiert" (15) — gerçek konu

Bunlar **teknik hata değil**, Google'ın kalite/öncelik kararı:

- **Gecrawlt – zurzeit nicht indexiert (31):** Google sayfayı gördü, içeriği okudu, **şimdilik** indexe
  almamaya karar verdi. Yeni ve otoritesi düşük sitelerde en sık görülen sebep: benzer ya da ince içerik,
  az iç link, az dış link.
- **Gefunden – zurzeit nicht indexiert (15):** Google adresi biliyor ama **henüz taramadı**. Site yeni olduğu
  için tarama bütçesi sınırlı; en derindeki sayfalar sona kalıyor.

Toplam 46 sayfa; sitemap'te yaklaşık 280 indexlenebilir sayfa var (yaklaşık %16). **İndexlenmiş sayfa
sayısını yapıştırmadın**, onu görmeden oranın kötü olup olmadığını söyleyemem; bu rapor yalnızca
"indexlenmeyenleri" gösteriyor. Raporun üst kısmındaki "Indexiert" sayısını bana yaz.

Hangi sayfalar olabilir (tahmin; liste yok): ku/ar/nl/fr/es dillerindeki sayfalar (82 adres; Almanca'dan
çevrilmiş, çok benzer), en alt seviyedeki şehir sayfaları (Lahr, Villingen-Schwenningen, Friedrichshafen…),
yeni rehber yazıları.

**Ne yapılır (öncelik sırasıyla):**

1. **Listeyi dışa aktar** ve bana gönder: iki satıra da tıkla → *Export*. Hangi sayfaların etkilendiğini
   görmeden iyi bir karar veremem.
2. **En önemli 10 sayfa için "Indexierung beantragen":** Search Console → üstteki arama kutusuna adres →
   URL-Prüfung → *Indexierung beantragen*. Günde yaklaşık 10 istek hakkın var. Sıra: ana sayfa,
   `/pakete`, `/tuerkischer-dj-stuttgart`, `/islamische-hochzeit`, `/hochzeits-dj-baden-wuerttemberg`,
   en iyi 3 şehir, en iyi 3 rehber.
3. **İç linkler** (yapıldı): Rehber yazıları artık ana sayfalardan bağlı (PR #30).
4. **Dış bağlantı:** `docs/SEO-INCELEME-EKIM-2026.md` Aşama 4. Otorite olmadan "crawled – not indexed" grubu
   küçülmez; bunun kısayolu yok.
5. **Sabır:** Yeni sitede bu grubun küçülmesi haftalar sürer.

Düşük değerli dil sayfalarını (ku/ar/nl/fr/es) sitemap'ten çıkarmak da bir seçenek, ama bu pazar
kararı. Önce listeyi görelim.

---

## Listeleri otomatik sınıflandırma: `npm run gsc:triage`

Altı satırın her birini Search Console'dan dışa aktar (satıra tıkla → sağ üstte *Exportieren* → CSV),
sonra:

```bash
npm run gsc:triage -- indirdigin-dosya.csv --out rapor.csv
```

Betik her adresi **canlı siteye** sorar ve üç gruba ayırır:

| Verdikt | Anlamı |
|---|---|
| `erwartet` | Sitenin cevabı doğru, rapor gürültü (nl/fr/es… dilindeki 404, geçerli yönlendirme, `/api` robots, noindex) |
| `PRÜFEN` | Gerçek sorun olabilir: Almanca/Türkçe/İngilizce bir adres 404 veriyor, bir yönlendirme zincirleniyor ya da boşa gidiyor, sitemap'teki bir sayfa `noindex`, 5xx |
| `offen` | Sayfa canlı ve indexlenebilir; Google almadı, bu yukarıdaki §5 |

Çıkış kodu `PRÜFEN` varsa 1. `PRÜFEN` listesini bana gönder, her biri için ya `next.config.ts`'e 301 ya
da düzeltme yaparım.

Yerel bir derlemeye karşı denemek için `--base http://localhost:3000` ekle.

---

## Yaptıklarım ve sınırlar

- **Yaptım:** Yerel üretim derlemesinde 280 sitemap URL'si ve içlerindeki 301 farklı iç bağlantı hedefi tarandı;
  1.080 olası adres tek tek sorgulandı; `robots.txt`, `noindex`, yönlendirme ve 404 sonuçları Search
  Console sayılarıyla karşılaştırıldı. `scripts/gsc-triage.mjs` tüm kategori örnekleriyle sınandı.
- **Yapamadım:** Canlı siteye bu ortamdan erişim yok; Search Console'a erişimim yok. **Gerçek URL
  listelerini görmedim**, bu yüzden 404, robots ve "indexlenmedi" grupları için kesin değil, çıkarım
  yapıyorum. Listeleri gönderirsen kesinleştiririm.
- **Kod değişikliği gerekmedi:** Bu rapor için siteyi değiştirmeye yol gösteren bir bulgu çıkmadı. Eklenen
  tek şey `gsc-triage` betiği ve bu belge.
