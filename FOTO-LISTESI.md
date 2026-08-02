# DJ-VEYS.DE — Fotoğraf Çekim Listesi

**Kime:** Veysel · **Ne için:** dj-veys.de web sitesi
**Nasıl kullanılır:** Bu listeyi doğrudan fotoğrafçıya ver, ya da kendin bir düğünde çektir.

Sitenin tasarımı fotoğrafsız da düzgün görünecek şekilde kuruldu — boş yerler kırık resim değil, tasarlanmış boşluk olarak duruyor. Ama **düğün pazarında talebi getiren şey fotoğraf.** Çift üç DJ sitesini iki dakikada karşılaştırıyor.

---

## 📌 DURUM — 02.08.2026 teslimatından sonra

Veysel 32 fotoğraf gönderdi. Bunlardan **31 tanesi işlendi** ve sitede
**görünen her bir görsel alanı doldurdu** — hiçbir yerde tasarlanmış boşluk
kalmadı. Dosyalar `public/images/veys/`, slot eşleşmeleri
`src/content/site-images.ts` içinde.

Ana sayfa (hero + showreel), EPK, Galeri (8 kare), Müzik, Kontakt,
Echte Hochzeiten, 4 hizmet bloğunun hepsi ve **16 blog yazısının hepsi**
artık gerçek fotoğrafla çıkıyor.

**Hepsi varsayılan (default).** Admin panelinden herhangi birine yeni görsel
yüklendiği anda, o görsel varsayılanın yerine geçer — kod değişmez, deploy
gerekmez. Yüklenen görsel silinirse tekrar buradaki varsayılana döner.

### Dolu ama "asıl istenen kare" değil — sırası gelince değiştir

Aşağıdakiler boş görünmüyor, ama briefteki kareyle birebir değil. Öncelik
sırasıyla:

| # | Slot | Şu an ne var | Asıl istenen |
|---|---|---|---|
| **1** | Ana sayfa hero | Sahnede moderasyon karesi (setin en yüksek çözünürlüklüsü, 5120 px) | **Gece dolu tanzfläche.** Teslimatta pistte dans eden insan olan tek bir kare bile yok. Hâlâ listenin en değerli karesi. |
| **2** | Showreel | Salonun akşam karesi — **play tuşu bilerek yok**, çünkü video yok | Aftermovie (30–90 sn) + ondan alınmış kapak karesi |
| 5 | EPK portresi | Etkinlikte gülen kare (papyonlu, sıcak) | Stüdyo portresi. EPK + iletişim + basın + Google Business = 4 yerde kullanılacak. |
| 6 | Basın: canlı performans | Bağlama yakın çekimi | **Sahnede, düğünde, arkada dinleyen insanlarla saz.** Rakiplerden ayrıştıran kare tam olarak bu. |
| 7 | Hizmet: Düğün | Veysel salonda pultun başında | Gelin-damat karesi — **var ama izin yok**, aşağıya bak |
| 8 | Hizmet: Kına/Nişan | Moderasyon karesi | Kına gecesi: kına tepsisi, kırmızı örtü, halay |
| 10 | Hizmet: Firmenevent | Dekorsuz, sade salonda kurulum | Gerçek kurumsal etkinlik |
| 14 | Signature paketi | Büyük aydınlık salon | Zirve anı, dolu pist |
| 15 | Şehir sayfaları | Sadece Stuttgart (sazla, Stuttgart manzarası) | Diğer 8 şehir için o şehirden gerçek mekân karesi |

> Kısacası: **eksik olan "Veysel" değil, "kalabalık".** Gelen karelerin
> neredeyse hepsi kurulum, ekipman, sahne ve Veysel'in kendisi. Sitede en çok
> dönüşüm getirecek şey — dolu pist — tek bir karede bile yok. Sonraki
> düğünde fotoğrafçıya söylenecek tek cümle bu.

### ⚠️ Kullanılamayan kare

Gelin ve damatla birlikte çekilen kare (ikisinin de yüzü net görünüyor)
**siteye konmadı.** Yazılı izin olmadan yayınlanamaz — aşağıdaki bölüm tam
olarak bunu anlatıyor. İzin alınırsa kare hazır, eklenmesi beş dakika.

### Teknik not

Gelen dosyaların çoğu WhatsApp'tan geçtiği için sıkıştırılmış (çoğu 960–1600 px).
Sitede iyi duruyorlar, ama **orijinaller elde varsa gönderilsin** — özellikle
sahne/moderasyon kareleri büyük ekranda daha net çıkar. İki dosya orijinal
çözünürlükte geldi (5120 px) ve farkı görülüyor.

---

## ⚠️ Önce izin

Almanya'da tanınabilir insan olan fotoğrafı yayınlamak **yazılı izin** gerektiriyor (DSGVO + Recht am eigenen Bild). Bu bir formalite değil, ihtarname konusu.

- [ ] **Çiftten yazılı izin** — sözleşmeye tek paragraf ekle: "DJ, etkinlikten seçilmiş görselleri kendi tanıtımında kullanabilir."
- [ ] **Fotoğrafçıdan kullanım hakkı** — fotoğrafın telifi fotoğrafçıda. "Sen çektin ama ben kullanabilir miyim" diye sormak yetmez, yazılı olmalı.
- [ ] **Çocuk varsa** velisinden ayrıca izin
- [ ] Kalabalık pist çekimlerinde kimse net tanınmıyorsa risk düşük — ama yine de çifte haber ver

> Pratik yol: sonraki 2-3 düğünde fotoğrafçıya baştan söyle. "Şu 6 kareyi de çeker misin, tanıtımda kullanacağım" demek, sonradan izin kovalamaktan çok daha kolay.

---

# 🔴 ÖNCELİK 1 — Önce bunlar (6 kare)

Bunlar sitenin en görünür yerleri. Diğer hepsinden önce bunlar.

### 1. Gece dolu tanzfläche — **sitenin en önemli tek karesi**
- **Nerede:** Ana sayfa açılış ekranı, tam ekran
- **Oran:** çok geniş yatay (21:9) — geniş çek, kenarlardan kırpılacak
- **Ne:** Pist tamamen dolu, insanlar hareket halinde, eller havada. Işıklar çalışıyor. DJ masası arkada görünüyor ama ana konu **kalabalık**.
- **Ne olmasın:** Boş pist, yarı dolu salon, gündüz ışığı, boş sandalyeler
- **İpucu:** Gecenin en yoğun anında, yüksek ISO, flaşsız — ortam ışığı korunsun. Hareket bulanıklığı **iyi**, enerjiyi gösterir.

### 2. Aftermovie / showreel kapağı
- **Oran:** 16:9
- **Ne:** Videonun en çarpıcı karesi. Tek bir an — konfeti, ilk dans, kalabalık zıplarken.
- **Not:** Video da lazım (30-90 saniye). Kapak karesi videodan alınabilir.

### 3. Gerçek düğün atmosferi
- **Oran:** 21:9
- **Ne:** Salonun bütününü gösteren geniş kare — masalar, ışık, dekor, sahne. Mekânın kalitesi görünsün.
- **Neden:** "Bu adam bu seviyede mekânlarda çalışıyor" mesajı

### 4. Galeri başlık karesi
- **Oran:** 21:9
- **Ne:** 3'ten farklı bir düğün. Farklı mekân, farklı atmosfer.

### 5. **Profesyonel portre** — en yüksek getirili tek fotoğraf
- **Oran:** dikey (4:5)
- **Ne:** Veysel, düzgün ışıkta, sade koyu arka plan. Takım ya da şık gömlek. Yüz net, bakış kameraya.
- **Neden bu kadar önemli:** **Dört ayrı yerde** kullanılıyor — EPK, iletişim sayfası, basın kiti, sonra Google Business Profile. Bir kere doğru çektir, her yerde çalışsın.
- **Ne olmasın:** Selfie, telefon fotoğrafı, dağınık arka plan, kesik kafa

### 6. **Canlı saz / gitar çalarken** — asıl farkın bu
- **Oran:** 16:9
- **Ne:** Veysel elinde sazla ya da gitarla çalıyor, sahnede ya da salonda. Arkada dinleyen insanlar görünüyor.
- **Neden:** Rakiplerin hiçbirinde bu yok. "DJ değil, müzisyen de" iddiasının tek kanıtı bu kare.

---

# 🟡 ÖNCELİK 2 — İkinci tur (11 kare)

### Hizmet sayfaları için — dikey (4:5), her biri farklı bir etkinlik türünden

| # | Ne | Detay |
|---|---|---|
| 7 | **Düğün** | Gelin-damat ve pistteki kalabalık aynı karede |
| 8 | **Nişan / Kına** | Kına gecesinden — geleneksel öğeler görünsün (kına tepsisi, kırmızı örtü, halay) |
| 9 | **After-Party** | Gecenin geç saati, yoğun ışık, koyu atmosfer |
| 10 | **Firmenevent** | Kurumsal ortam — sahne, kürsü, daha sakin ve şık |

### Basın fotoğrafları — yatay (3:2)

| # | Ne | Detay |
|---|---|---|
| 11 | **Sahnede çalarken** | Saz/gitar, arkada seyirci belli |
| 12 | **Elinde mikrofonla moderasyon** | Jest ve enerji görünsün — **entertainer olduğunu gösterir, sadece DJ değil** |

### Diğerleri

| # | Ne | Oran |
|---|---|---|
| 13 | Ana sayfa tanıtım portresi (5'ten farklı poz) | 4:5 |
| 14 | Signature paket görseli — orta ölçekli düğün | 3:2 |
| 15 | Şehir sayfası başlığı — bölgesel mekân | 16:9 |
| 16 | Blog kapak görselleri | 3:2 |
| 17 | İletişim sayfası portresi (daha sıcak, gülümseyen) | 4:5 |

---

# 🟢 ÖNCELİK 3 — Sonra

| # | Ne | Not |
|---|---|---|
| 18 | Küçük/samimi kutlama | "Küçük paket = daha az kaliteli değil" mesajı |
| 19 | Prestige paket — büyük salon, tam ışık kurulumu | |
| 20 | **Orkestra ve nefesli çalgılar sahnede** | Bu da büyük fark — mümkünse öncelik 1'e çek |
| 21 | Gerçek etkinlikte kurulu ekipman | Şu anki "boş beyaz oda" karesinin yerini alacak |
| 22 | Süreç/hazırlık anı — soundcheck | |
| 23 | Sosyal paylaşım görseli (WhatsApp/Facebook önizlemesi) | 16:9 |

---

## Teknik notlar — fotoğrafçıya

- **Format:** JPG, uzun kenar en az **2000 px**. Orijinali gönderin, WhatsApp'tan sıkıştırılmış hâlini değil.
- **Yatay ve dikey ayrı çekilsin.** Yatay kareyi dikey slota kırpmak yüz kesiyor.
- **Ana konuyu ortada bırakın** — site farklı ekranlarda farklı kırpıyor.
- **Renk:** sitenin paleti koyu + altın. Sıcak tonlu, kontrastı yüksek kareler daha iyi oturuyor.
- **Flaş dikkatli:** doğrudan flaş atmosferi öldürüyor. Ortam ışığı + yüksek ISO tercih edilsin.
- **Video:** dikey (Reels) ve yatay ayrı ayrı. Site için yatay, Instagram için dikey.

---

## Fotoğraf yoksa ne oluyor?

Site çalışıyor ve şık duruyor — o yerlerde altın çizgili, tasarlanmış boşluklar var, kırık resim değil.

Ama şunu net söyleyeyim: **teknik SEO seni Google'da 1. sıraya taşısa bile, siteye giren çift boş beyaz oda fotoğrafı görürse rakibe gider.** Bu listedeki 6 kare, sitenin geri kalanının yapabileceği her şeyden daha çok anfrage getirir.

02.08.2026 teslimatından sonra da bu cümle aynen geçerli: eksik olan tek şey
kalabalık, ve tam da o eksik olan şey en çok getiriyi olan şey.

## Stok fotoğraf kullanmıyoruz

Eski sitede bir stok fotoğraf vardı (gün batımında sahilde bir adam — Veysel değil). Onu kullanmadık ve kullanmayacağız. İnternetten bulunmuş "mutlu çift" görseli koymak, siteye giren gerçek çift tarafından anlaşılır ve güveni kırar. Boş bırakmak daha iyi.
