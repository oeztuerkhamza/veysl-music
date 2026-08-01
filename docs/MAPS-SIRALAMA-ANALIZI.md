# Google Maps'te Stuttgart'ta neden ön sıralarda değilim?

**Kime:** Veysel · **Tarih:** Ağustos 2026
**Soru:** "Google Maps'te Stuttgart'ta neden üst sıralarda çıkmıyorum?"

Bu analiz `.claude/BRAND-FACTS.md`, `src/content/site.ts`, `docs/GOOGLE-BUSINESS-PROFILE.md`
ve `docs/SEO-COMPETITIVE-ANALYSIS.md` üzerinden yapıldı. Uydurma veri yok; doğrulanamayan
her şey **"kontrol edilecek"** olarak işaretlendi.

> **Bu analizin sınırı — dürüst olalım:** Bu oturumun ağ politikası `dj-veys.de` ve
> Google Maps'e doğrudan erişimi engelliyor (403). Yani **profilin içindeki ayarları
> (kategori, fotoğraf sayısı, gönderiler) ben göremedim.** Onlar aşağıda "kontrol
> edilecek" diye geçiyor. Buna karşılık kodda ve dokümanlarda duran her şey doğrulandı,
> ve iki bulgu (eski alan adı, marka çakışması) doğrudan ölçülebilir durumda.

---

## Kısa cevap

Tek bir sebep yok, ama **en büyük sebep senin kontrolünde değil, ikinci en büyük sebep
ise geri alınamaz bir kayıp.** Sırayla:

| # | Sebep | Etki | Düzeltilebilir mi? |
|---|---|---|---|
| 1 | **Adres Obertürkheim'da** — şehir merkezine ~8 km | 🔴 Çok yüksek | ❌ Hayır (adres uydurmak yasak) |
| 2 | **Eski alan adı `veystunesofficial.de` iptal edildi** | 🔴 Çok yüksek | ❌ Kalıcı kayıp, telafi edilir |
| 3 | **"DJ Veys" adı başka bir müzisyenle çakışıyor** | 🟠 Yüksek | ⚠️ Yönetilebilir |
| 4 | **31 yorum var ama yorum hızı çok düşük** | 🟠 Yüksek | ✅ Evet — en güçlü kozun |
| 5 | **Site henüz Google'da görünmüyor** | 🟠 Yüksek | ✅ Evet |
| 6 | **Rehberlerde (citation) hâlâ eski isim/eski site** | 🟡 Orta | ✅ Evet |
| 7 | **Profil içi eksikler** (kategori, foto, gönderi) | 🟡 Orta | ✅ Evet — en ucuzu |

---

## 0. Önce ölç: "üst sıralarda değilim" cümlesi genelde yanlış ölçülüyor

Bir şey yapmadan önce bunu netleştirmek gerekiyor, çünkü **yapılacak iş buna göre
tamamen değişiyor.**

Kendi telefonundan, kendi Google hesabınla, Obertürkheim'dayken "Hochzeits DJ Stuttgart"
aratmak **mümkün olan en yanıltıcı testtir.** İki şey birden sonucu bozar: Google seni
tanıdığı için kişiselleştirir, ve bulunduğun konum sıralamayı belirler.

**Doğru test:**

1. **Google Business Profile → "Leistung" (Performance) sekmesi.** Bu rapor sana hangi
   aramalarda göründüğünü, kaç kez göründüğünü, kaç arama ve kaç yol tarifi geldiğini
   *veri olarak* söyler. Dışarıdan yapılan hiçbir analiz bunun yerini tutmaz ve bedava.
   **İlk bakılacak yer burasıdır.**
2. **Izgara testi (grid):** Stuttgart'ın farklı noktalarından — Mitte, Vaihingen, Bad
   Cannstatt, Obertürkheim, Esslingen — gizli sekmede aynı sorguyu aratıp sıranı not et.
   Ya da bir local rank tracker kullan (Local Falcon, BrightLocal gibi).

**Tahminim şu ve test bunu doğrulayacak:** Obertürkheim, Untertürkheim, Wangen,
Hedelfingen ve Esslingen çevresinden aratıldığında muhtemelen **zaten ilk 3'tesin.**
Şehir merkezinden aratıldığında düşüyorsun. Eğer böyleyse teşhis "profilim kötü" değil,
**"mesafe"** — ve yapılacak iş tamamen farklı.

---

## 1. Google Maps sıralaması neye göre çalışır?

Google'ın kendi belgelediği üç faktör var:

1. **Relevanz (Uygunluk)** — profil sorguya uyuyor mu? (Kategori, hizmetler, açıklama)
2. **Entfernung (Mesafe)** — arayan kişiye ne kadar yakınsın?
3. **Bekanntheit (Bilinirlik/Prominence)** — web'de ne kadar tanınıyorsun? (Yorumlar,
   rehber kayıtları, sitenin organik gücü, marka aramaları, basında geçme)

İlk ikisi büyük ölçüde sabit. **Rekabet 3. maddede yapılır.** Aşağıdaki maddelerin
neredeyse hepsi 3. maddeyi besliyor.

---

## 2. 🔴 Sebep 1: Adres — bu yapısal ve düzeltilemez

**Durum:** Asangstraße 98, 70329 **Stuttgart-Obertürkheim** (`src/content/site.ts`).

Obertürkheim, Neckar'ın sağ yakasında, şehrin doğu ucunda bir Stadtbezirk — Esslingen'in
Mettingen mahallesiyle komşu. **Stuttgart Mitte'ye kuş uçuşu yaklaşık 7–8 km.**

Birisi konum sinyali vermeden "Hochzeits DJ Stuttgart" arattığında Google sorguyu
**Stuttgart'ın merkez noktasına** göre çözümlüyor. Karşılaştırma için: aramalarda öne
çıkan [eindj.de](https://www.eindj.de/) adresi Hohenheimer Str. 119A, 70184 — yani
Stuttgart-Süd, Schlossplatz'a ~1,5 km. Rakip pratikte tam merkez noktasının üstünde
oturuyor, sen 8 km dışından yarışıyorsun.

### ⚠️ Yaygın ve pahalı yanlış anlama

"Ben zaten *Servicegebiet* (hizmet bölgesi) işletmesiyim, adresim gizli, o yüzden mesafe
beni etkilemez" — **bu doğru değil.** Adresi gizlemek onu *müşteriden* saklar; Google
mesafeyi yine de doğrulanmış gerçek adresine göre hesaplar. Hizmet bölgesine "Stuttgart"
yazmak, seni Stuttgart merkezine taşımaz.

### Ne yapılır?

- ❌ **Sahte/sanal/ödünç adres kullanma.** İkinci en yaygın hesap kapatma sebebi bu. 31
  yorumu ve 5,0'ı kaybetmeye değmez.
- ✅ **Doğu koridorunu domine et.** Obertürkheim/Untertürkheim/Wangen/Hedelfingen ve
  özellikle **Esslingen** senin doğal avantaj alanın. `/hochzeits-dj/esslingen` sayfası
  zaten kodda var — bu sayfa bir "yan şehir" değil, senin **en yüksek kazanma
  olasılıklı** sayfan.
- ✅ **Haritada kaybettiğini organikte al.** Harita paketinin altındaki 10 mavi linkte
  mesafe faktörü yok. "Hochzeits DJ Stuttgart" için organik sıralama tamamen kazanılabilir
  ve `docs/SEO-CITY-STRATEGY.md`'deki şehir sayfası planı tam olarak bunun için var.

---

## 3. 🔴 Sebep 2: Eski alan adı iptal edildi — en büyük onarılabilir hasar

Bu, projedeki en pahalı olay ve maalesef önceden yazılı olarak uyarılmıştı.

`HANDOVER.md` §3'te kırmızı başlıkla şu yazıyor:

> - [ ] Alte Domain **behalten**, nicht kündigen

Ama `src/content/site.ts` içindeki not ve `e1ec27d` numaralı commit ("Retire the legacy
domain now that its registration is gone") **kaydın gittiğini** söylüyor. Yani tam tersi
oldu.

### Bunun somut bedeli

| Kayıp | Neden önemli |
|---|---|
| **Tüm backlink'ler öldü** | `veystunesofficial.de`'ye yıllar içinde verilmiş her link artık boşluğa gidiyor. 301 yönlendirme yapılamıyor — çünkü alan adı artık senin değil. Link gücü **transfer edilmedi, yok oldu.** |
| **Search Console "Adressänderung" imkânsız** | Bu araç her iki alan adına da sahip olmanı şart koşar. Google'a "aynı işletmeyim, yeni adresteyim" demenin resmî yolu kapandı. |
| **Rehberlerdeki her kayıt artık ölü link gösteriyor** | Gelbe Seiten, Das Örtliche, 11880, Yelp.de, hochzeitsportal-stuttgart.de... hepsinde çalışmayan bir web adresi duruyor. Bu, NAP tutarsızlığının en kötü türü. |
| **Alan adı üçüncü şahsa geçebilir** | Serbest kalan bir alan adını bir rakip veya spam sitesi alabilir. Kod bunu doğru şekilde ele almış: `sameAs` içinden çıkarılmış. |

**"Bilinirlik" = Google'ın "bu işletme web'de ne kadar tanınıyor" okuması.** Markanın web
geçmişini silmek, doğrudan bu skoru düşürür.

### Ne yapılır (telafi)

1. **Alan adı hâlâ serbest mi diye bak.** `veystunesofficial.de` henüz kimse tarafından
   alınmadıysa **geri al** — yıllık ~10 €. Sonra sayfa sayfa 301 ile `dj-veys.de`'ye
   yönlendir. Backlink'lerin bir kısmı geri kazanılabilir. **Bu maddeyi bugün kontrol et,
   her gün risk artıyor.**
2. Alınmışsa: eski siteye link veren yerleri tek tek bulup (Instagram bio, YouTube kanal
   bilgisi, rehberler, partner siteleri) **elle `dj-veys.de`'ye çevirt.** Yavaş ama işe
   yarar.

---

## 4. 🟠 Sebep 3: "DJ Veys" adı başka biriyle çakışıyor

Bu, dokümanların hiçbirinde geçmiyor ve gerçek bir problem.

"DJ Veys" arandığında **tamamen başka bir müzisyen** çıkıyor — Spotify, Apple Music,
Amazon Music, SoundCloud ve Bandcamp'te kayıtlı bir sanatçı. Bu profillerin hepsi
seninkinden eski ve platform sinyalleri güçlü.

Bunun anlamı: Google "DJ Veys" varlığını çözmeye çalışırken **rakip aday** var, ve o
adayın geçmişi daha derin. Eski isim `VeysTunesOfficial` bu açıdan çok daha iyiydi —
10+ yıllık birikimi vardı ve **hiçbir şeyle karışmıyordu.**

Ayrıca doğrulandı: `dj-veys.de` şu anda aramalarda **hiçbir yerde görünmüyor.**

### Ne yapılır?

**İsmi geri değiştirme** — 63.000 takipçi seni "DJ Veys" olarak tanıyor, o kazanç daha
büyük. Ama varlığı açıkça ayrıştırman lazım:

- Adın **her yerde** "Stuttgart" ve "Hochzeits-DJ" ile birlikte geçsin. Google
  ayrıştırmayı birlikte-geçme (co-occurrence) ile yapar.
- `sameAs` sadece **senin** profillerini göstersin — kod bunu zaten doğru yapıyor, ve
  YouTube handle'ının 2026-08-01'de düzeltilmesi (`@djveysofficial`) tam olarak bu yüzden
  önemliydi.
- Sitenin canlı ve indekslenmiş olması burada kritik: Google'a "DJ Veys = Stuttgart'ta bir
  düğün DJ'i" diyen en güçlü tek belge kendi siten.

---

## 5. 🟠 Sebep 4: Yorumlar — sayı fena değil, **hız** çok düşük

**Durum:** `site.reviews` → **5,0 ★ / 31 yorum**, Place ID doğrulanmış
(`ChIJqW8NRI0tU6gROWl2dblWNbg`).

Önce iyi haber: **profil yeniden adlandırılmış, yeni profil açılmamış.** Knowledge Graph
ID'si (`/g/11xp06nh71`) hem eski hem yeni linkte aynı. Bu doğru yapılmış — 31 yorum ve
5,0 hayatta.

Rekabet karşılaştırması (`docs/SEO-COMPETITIVE-ANALYSIS.md`):

| Rakip | Yorum |
|---|---|
| DJ Serkan / tuerkischerdj.com (niş lideri) | ~30+, 5,0 |
| **DJ Veys** | **31, 5,0** |
| lakeloveevents.com (şehir sayfası ağı olan) | 12, 5,0 |
| eventpeppers profilleri (Stuttgart) | 2 – 86 arası |

Yani **yorum sayısında geride değilsin, paritedesin.** Asıl problem başka:

### Problem: hız (velocity) ve tazelik

31 yorum / 12+ yıl ≈ **yılda 2,5 yorum.** 200+ organizasyona karşılık **%1,5'lik bir
yorum oranı.** Google hem toplam sayıya hem de **son dönemdeki akışa** bakıyor — 800
yorumu olup son bir yılda hiç yorum almayan işletme "uykuda" görünür.

**Bu, tek başına en yüksek getirili ve tamamen senin kontrolündeki kaldıraç.** 200+
etkinlik yapmış birinin yılda 2,5 yorum alması bir tanınırlık problemi değil, **sistem
problemi** — kimse istemiyor.

### Ne yapılır?

Bağlantı kodda hazır, `site.reviews.writeReviewUrl`:

```
https://g.page/r/CTlpdnW5VjW4EBM/review
```

- **Her düğünden 2–3 gün sonra, çifte tek tek WhatsApp'tan bu linki gönder.** Şablon değil,
  kişisel bir mesaj.
- Hedef: **12 ayda 60–80 yorum.** Etkinlik hacminle fazlasıyla mümkün.
- **Her yoruma cevap ver** — olumluya da olumsuza da, şablonla değil, o yorumdan bir
  ayrıntıya değinerek.
- ❌ **Toplu mesaj atma.** Ani yorum patlaması Google'ın kötüye kullanım filtresini
  tetikler.
- ❌ **Yorum karşılığı indirim/hediye verme.** Politika ihlali; tüm yorum setini
  sildirebilir.

---

## 6. 🟠 Sebep 5: Site Google'da henüz yok

`dj-veys.de` DNS'te çözülüyor (159.195.216.142), yani sunucu ayakta. Ama aramalarda
görünmüyor ve `HANDOVER.md` §9'da hâlâ açık madde olarak duruyor:

> - [ ] Zugang Google Search Console und Google Business Profile

Harita sıralaması, profile bağlı **web sitesinin organik gücünü** de okur. Site
indekslenmemişse profil tek bacak üstünde duruyor.

**Ne yapılır:**

1. `dj-veys.de`'yi **Search Console'da domain property olarak doğrula**, sitemap gönder.
2. GBP'deki "Website" alanı `dj-veys.de` olsun — **UTM'siz, temiz.** (Ölçüm için ayrı
   rezervasyon linki kullanılıyor, `docs/GOOGLE-BUSINESS-PROFILE.md` §6.)
3. **Instagram bio'daki linki değiştir.** 63.000 takipçili hesap hâlâ eski alan adını
   gösteriyorsa, bu hem en büyük trafik kaynağın hem de en güçlü tek bilinirlik sinyalin
   boşa gidiyor demektir.

---

## 7. 🟡 Sebep 6: Rehber kayıtları (Citations) ve NAP

Google, aynı işletme olduğunu **birebir aynı yazılmış** İsim–Adres–Telefon üçlüsünden
anlar. Kanonik hâl:

```
DJ Veys
Asangstraße 98, 70329 Stuttgart
+49 176 64844815
https://dj-veys.de
```

**Yapılacaklar — hepsi aynı anda, tek tek değil:**

- **Tier 1:** Bing Places, **Apple Maps Connect** (iPhone kullanıcıları için tamamen ayrı
  bir sistem, çoğu kişi atlıyor), Facebook Business, Instagram Business
- **Tier 2 (Almanya):** Gelbe Seiten, Das Örtliche, 11880, GoYellow, Cylex, Yelp.de
- **Sektör:** hochzeit.click, eventpeppers, hochzeitsportal-stuttgart.de,
  hochzeitsportal24.de — bunlarla *sıralama yarışına girme,* **içlerine kaydol.** Zaten
  ilk sayfayı onlar tutuyor; oraya girmek onları geçmeye çalışmaktan daha verimli.

---

## 8. 🟡 Sebep 7: Profilin içi — en ucuz düzeltmeler

⚠️ **Bunları göremedim** (ağ engeli), o yüzden hepsi *kontrol listesi*, tespit değil.
`docs/GOOGLE-BUSINESS-PROFILE.md` tam kurulum rehberi — burada sadece sıralamayı en çok
etkileyenler:

- [ ] **Birincil kategori `DJ` mi?** Bu tek alan, tüm ikincil kategorilerin toplamından
      daha fazla ağırlık taşıyor. "Eventagentur" veya "Unterhaltung" gibi geniş bir
      kategori seçiliyse, **tek başına** "Hochzeits DJ Stuttgart" 3'lüsünü kaybettiriyor
      olabilir.
- [ ] **Hizmet bölgesi 8 şehirle sınırlı mı?** 20 hakkın var ama hepsini doldurma —
      alanı büyütmek erişimi artırmaz, **uygunluk sinyalini sulandırır.** "Deutschland"
      veya Avrupa ülkeleri kesinlikle yazılmasın.
- [ ] **Fotoğraf sayısı.** Hedef 30+. Şu anda gerçek düğün fotoğrafı yok — bu zaten
      `HANDOVER.md`'de **1 numaralı engel** olarak duruyor. Maps'te fotoğraf hem
      görünürlüğü hem de tıklanma oranını çok sert etkiliyor.
      ❌ `05-86ab7620.jpg` (stok fotoğraf) **asla yüklenmesin.**
- [ ] **Haftalık Google Posts.** Profilin aktif yönetildiğini gösterir.
- [ ] **Q&A: 5–8 soruyu kendi hesabından sor ve cevapla.** Bu açıkça izinli ve bedava
      SERP alanı. `src/content/answers.ts` içindeki en güçlü cevaplar kısaltılarak
      kullanılabilir.
- [ ] **"Von Google vorgeschlagene Änderungen"** — ayda bir kontrol et. Herkes kategori,
      saat, hatta adres önerisi yapabiliyor ve Google bazen sessizce uyguluyor. İyi
      kurulmuş bir profilin sessizce bozulmasının en yaygın yolu bu.

---

## 9. Kodda bulunan sorunlar

### ✅ (a) `addressLocality` GBP ile uyuşmuyordu — düzeltildi

`site.address.city` **"Stuttgart-Obertürkheim"** yazıyordu. Google 70329 posta kodunun
kanonik yerleşimini **"Stuttgart"** olarak biliyor ve GBP'de de öyle görünüyor. Yani
sitenin schema'sı ile Google profili NAP'ın "A"sında birbirini tutmuyordu.

İlginç olan şu: `site.ts`'teki kendi yorumu zaten *"identisch mit der Adresse im
Google-Unternehmensprofil"* diyordu — değer, kendi gerekçesiyle çelişiyordu.

Bu tek değer iki yeri birden bozuyordu, çünkü Impressum de aynı alanı kullanıyor:
**"70329 Stuttgart-Obertürkheim"** düzgün kurulmuş bir posta adresi değil (§ 5 DDG
ladungsfähige Anschrift = postalische Anschrift). Değer `'Stuttgart'` yapıldı; semt
`site.district` ve fließtext copy'de zaten duruyor, hiçbir bilgi kaybolmadı.

Ayrıca admin panelindeki "Ort" alanına açıklama eklendi (DE + TR), çünkü CMS bu değeri
ezebiliyor — yani aynı hata panelden tekrar girilebilirdi.

### ✅ (b) Yanıltıcı yorum satırı — düzeltildi

`src/lib/schema.ts` hâlâ *"Street and postal code are still TODO(kunde) … unknown for
now"* diyordu; adres `08e5d4d` commit'inde girilmişti.

### ⚠️ (c) YENİ BULGU: schema ile Impressum farklı kaynaktan besleniyor — **açık**

(a) düzeltilirken çıktı ve tek satırla kapanmıyor:

- `src/app/[locale]/impressum/page.tsx` → **`getSite()`** kullanıyor (admin panelinin
  değerlerini üstüne bindiriyor)
- `src/lib/schema.ts` → **statik `site`** sabitini import ediyor

Sonuç: **Veysel adresi admin panelinden değiştirirse, görünen Impressum değişir ama aynı
sayfadaki JSON-LD değişmez.** Yani panelden yapılan bir düzeltme, tam olarak (a)'da
kapatılan NAP uyumsuzluğunu sessizce geri getirir.

Bu bilinçli olarak bu değişikliğin dışında bırakıldı: düzeltmek için çözümlenmiş `site`
nesnesinin `localBusinessSchema()`'yı çağıran ~8 yere kadar taşınması gerekiyor — ayrı ve
dikkat isteyen bir iş. Kod içine uyarı olarak not düşüldü.

**O zamana kadar geçerli kural:** adres değişikliği **hem** `src/content/site.ts`'te
**hem** panelde yapılmalı, sadece panelde değil.

---

## 10. Öncelik sırası — önümüzdeki 90 gün

**Bu hafta (senin işin, hepsi bedava):**

1. **GBP → Leistung raporuna bak.** Gerçekten görünmüyor musun, yoksa görünüyor ama
   tıklanmıyor musun? Her şey bu cevaba bağlı.
2. **`veystunesofficial.de` hâlâ serbest mi kontrol et.** Serbestse **hemen geri al.**
3. **Birincil kategoriyi `DJ` yap.**
4. **Instagram bio linkini `dj-veys.de` yap.**

**Bu ay:**

5. **Yorum akışını sistemleştir** — her düğünden sonra tek mesaj. En yüksek getirili
   madde bu.
6. **Search Console'da siteyi doğrula**, sitemap gönder.
7. Tier-1 + Tier-2 rehber kayıtlarını **aynı NAP ile** aç/güncelle.
8. Profili doldur: hizmetler, açıklama, Q&A, haftalık gönderi.

**Bu sezon:**

9. **Gerçek düğün fotoğrafları ve video.** Hem site hem GBP için 1 numaralı engel —
   `FOTO-LISTESI.md` zaten hazır çekim listesi.
10. **Esslingen ve doğu koridoru şehir sayfaları** — mesafe avantajının olduğu tek yer.
11. Organik sıralama için şehir sayfası ağı (`docs/SEO-CITY-STRATEGY.md`).

---

## 11. Kesinlikle yapılmayacaklar

Her biri gerçek bir hesap kapatma veya sıralama kaybı riski — üslup tercihi değil:

1. ❌ İşletme adına anahtar kelime: "DJ Veys Hochzeits-DJ Stuttgart" → **en yaygın sert
   suspension sebebi.**
2. ❌ Yeni marka adıyla **ikinci bir profil** açmak → 31 yorum bölünür.
3. ❌ Sahte, sanal veya ödünç adres.
4. ❌ Yorum karşılığı hediye/indirim, toplu yorum talebi.
5. ❌ Uydurma fiyat, uydurma yorum sayısı, uydurma hizmet bölgesi.
6. ❌ Stok fotoğrafı kendi işi gibi göstermek.
7. ❌ "24 saat açık" veya telefonun açılmadığı çalışma saatleri.

---

## Gerçekçi beklenti

Şeffaf olalım: **"Hochzeits DJ Stuttgart" düz sorgusunda 1. sıra kısa vadede
gerçekçi değil.** Mesafe dezavantajı yapısal, eski alan adının kaybı kalıcı, ve o
sorgunun ilk sayfasını eventpeppers gibi dizinler tutuyor.

Gerçekçi ve değerli olan hedef şu: **yorum akışı + tam profil + canlı site + doğu
koridoru** ile 6–9 ay içinde Stuttgart'ın doğusunda ve Esslingen'de harita paketine
girmek, ve `docs/SEO-COMPETITIVE-ANALYSIS.md`'nin tespit ettiği asıl boşluğu almak:
**Türkçe/çok kültürlü düğün sorgularında hiç kimse gerçek şehir sayfası yapmıyor.**
Senin gerçek fırsatın "Hochzeits DJ Stuttgart"ta değil, orada.
