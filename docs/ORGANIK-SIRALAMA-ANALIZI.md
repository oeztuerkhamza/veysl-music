# "Hochzeits-DJ Stuttgart" — organik sonuçlarda neden ilk 5'te değilim?

**Kime:** Veysel · **Tarih:** 1 Ağustos 2026
**Kapsam:** Mavi bağlantılar (organik liste). **Harita kutusu bu belgede değil** —
o [MAPS-SIRALAMA-ANALIZI.md](MAPS-SIRALAMA-ANALIZI.md) ve
[LOCAL-SEO-CHECKLIST.md](LOCAL-SEO-CHECKLIST.md) içinde. İkisi ayrı yarış; aynı
sayfada görünürler ama farklı kurallarla sıralanırlar.

Bu analizdeki her sayı **canlı siteden ölçüldü**, tahmin değil. Ölçemediğim şeyler
açıkça "bilinmiyor" diye işaretli.

---

## Kısa cevap

Dört somut şey vardı, üçü teknik ve düzeltildi. Ama en büyük sebep hiçbiri değil.

| # | Sebep | Etki | Durum |
|---|---|---|---|
| 1 | **Site Google'da doğrulanmamış** — ne indekslendiğini kimse bilmiyor | 🔴 Çok yüksek | ⚠️ Mekanizma kuruldu, **senden bir adım** bekliyor |
| 2 | **Alan adı çok yeni** — rakiplerde 20+ yıl var | 🔴 Çok yüksek | ❌ Kod çözemez, zaman çözer |
| 3 | **Dışarıdan hiç bağlantı yok** (backlink) | 🔴 Çok yüksek | ❌ Kod çözemez, bu saha işi |
| 4 | **Sayfa başlığı kesiliyordu** (66 karakter) | 🟠 Orta | ✅ Düzeltildi → 58 |
| 5 | **Hiçbir başlıkta "Stuttgart" geçmiyordu** | 🟠 Orta | ✅ Düzeltildi |
| 6 | **`/hochzeits-dj/stuttgart` 404 veriyordu** | 🟡 Düşük-orta | ✅ Düzeltildi → 301 |

Dürüst olmak gerekirse: 4, 5 ve 6 düzeltildi diye yarın ilk 5'e girmezsin. Onlar
"aynı ligde oynayabilmek" için gerekli, "kazanmak" için yeterli değil. Kazandıran
şey 1, 2 ve 3 — ve üçünün de çözümü kodda değil.

---

## 1. 🔴 Site Google'da doğrulanmamıştı

**Ölçüm:** Canlı ana sayfanın HTML'ini indirip arattım. `google-site-verification`
etiketi **hiç yok**.

Bunun anlamı sadece "bir etiket eksik" değil. Search Console olmadan şu soruların
hiçbirinin cevabı yok:

- Site Google'ın dizininde mi? Kaç sayfası?
- Hangi aramalarda kaçıncı sırada görünüyor?
- Google sitemap'i okudu mu, hata buldu mu?

Yani şu an "ilk 5'te değilim" cümlesini bile ölçemiyoruz. Belki 7. sıradasın, belki
hiç dizinde değilsin — ikisi tamamen farklı problem ve tamamen farklı çözüm ister.
**Bu yüzden bu madde 1 numara: diğer her şey bunun üstüne kurulur.**

**Ne yaptım:** Etiket artık `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` ile geliyor.
Değer boşsa etiket hiç basılmıyor.

**Senden gereken (5 dakika):**
1. [search.google.com/search-console](https://search.google.com/search-console) →
   Property ekle → **URL öneki** → `https://dj-veys.de`
2. Doğrulama yöntemi: **HTML etiketi**. Sana `content="..."` içinde bir değer verir.
3. O değeri sunucudaki `.env` dosyasına yaz:
   `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=oradaki_değer`
4. Deploy et (master'a push yeter), sonra Search Console'da **"Doğrula"**.
5. Doğrulandıktan sonra: Sitemaps → `sitemap.xml` ekle.

Bunu yapmadan bir sonraki adımı planlamak körlemesine iş olur.

---

## 2. 🔴 Alan adı yeni — ve eskisi geri alınamaz şekilde gitti

`dj-veys.de` haftalık bir alan adı. Rakiplerin durumu
([SEO-COMPETITIVE-ANALYSIS.md](SEO-COMPETITIVE-ANALYSIS.md)):

- **tuerkischerdj.com** (DJ Serkan) — 2000'den beri, "das Original" diyor
- **hochzeit.click** — çok yıllık portal, dizin gücü yüksek
- **eventpeppers.com**, **weddyplace.com** — büyük pazar yerleri

Google ticari sorgularda köklü siteleri kayırır. Bu bir hata değil, tasarım.

Üstelik `veystunesofficial.de` iptal edildi — Maps analizinin 2 numaralı bulgusu.
Eski sitenin biriktirdiği bağlantılar 301 ile yeni alana taşınabilseydi bu madde
çok daha hafif olurdu. **Registrar'da hâlâ geri alınabilir durumdaysa, bugün
yapılacak en değerli tek iş budur** — koddaki hiçbir iyileştirme onun yerini tutmaz.

---

## 3. 🔴 Dışarıdan hiç bağlantı yok

Kod tarafında yapılabilecek her şey yapıldı: temiz teknik yapı, şema işaretlemesi,
49 şehir sayfası, 18 rehber, 48 soru-cevaplık GEO korpusu. Ama Google için bir
sitenin ne kadar güvenilir olduğunun en güçlü işareti hâlâ **başka sitelerin ona
bağlantı vermesi.**

Şu an bu sayı sıfıra yakın. En gerçekçi kaynaklar:

- **Mekânlar.** Çalıştığın salonların "Dienstleister/Partner" sayfaları. Sen zaten
  oradaydın — bağlantı istemek doğal.
- **Düğün portalları.** hochzeit.click, weddyplace, eventpeppers'ta profil.
  Rakiplerin ilk sayfayı tuttuğu yerler bunlar; onlara katılmak da bir yol.
- **Fotoğrafçı ve organizatörler.** Aynı düğünde çalıştığın insanlar.
- **Yerel basın.** 63 bin takipçili bir Stuttgart DJ'i yerel bir haber konusudur.

Bu maddeyi ben yapamam. Ama etkisi 4-5-6'nın toplamından büyük.

---

## 4. ✅ Başlık kesiliyordu

**Ölçüm:** Ana sayfa başlığı 66 karakterdi. Google pratikte ~60 karakterde kesiyor.

```
Hochzeits-DJ Stuttgart — Premium DJ für Hochzeit & Event | DJ Veys   (66) ✂
Hochzeits-DJ Stuttgart – DJ, Musiker & Moderator | DJ Veys           (58) ✓
```

İlginç olan: bu, projenin kendi
[SEO-KEYWORD-MAP.md](SEO-KEYWORD-MAP.md) belgesinde "bedava CTR kazancı" diye
işaretlenmiş ve hiç uygulanmamış. Türkçe (62) ve Kürtçe (68) de sınırın üstündeydi,
onlar da düzeltildi. İngilizce, Hollandaca, Fransızca ve İspanyolca zaten
sınır içindeydi, dokunmadım.

Yeni başlıkta "Premium DJ für Hochzeit & Event" yerine "DJ, Musiker & Moderator"
var — çünkü birincisi anahtar kelimenin zaten söylediğini tekrar ediyordu, ikincisi
ise rakiplerin çoğunda olmayan gerçek farkı söylüyor.

---

## 5. ✅ Hiçbir başlıkta hedef ifade yoktu

**Ölçüm:** Ana sayfada 1 tane H1 ve 9 tane H2 var. **Hiçbirinde "Stuttgart"
geçmiyordu.**

- H1: "Der Sound, an den sich alle erinnern." — sıfır anahtar kelime
- 9 H2'nin hiçbirinde şehir adı yok

Yerel ticari bir sorgu için bu, en temel sinyalin eksik olması demek.

**Ne yaptım:** İki H2 artık ifadeyi taşıyor, yedi dilde de:

- "Hochzeits-DJ in Stuttgart — worauf Sie sich verlassen können" (hero'dan sonraki
  ilk başlık, yani en ağırlıklı olan)
- "Hochzeits-DJ für Stuttgart und Umgebung" (zaten coğrafya bölümü)

**H1'e dokunmadım, bilerek.** Keyword haritası anahtar kelimeli bir H1 öneriyor ama
o satır hero'nun bütün tasarımı — değiştirmek marka kararı, teknik karar değil.
İki H2 ile sinyalin büyük kısmı zaten alınıyor. İstersen H1'i de değiştirebiliriz,
ama o senin onayınla olmalı.

---

## 6. ✅ `/hochzeits-dj/stuttgart` 404 veriyordu

**Ölçüm:**

```
/hochzeits-dj/stuttgart    404  ← hedef şehir
/hochzeits-dj/boeblingen   200
/hochzeits-dj/esslingen    200
/hochzeits-dj/reutlingen   200      (sitemap'te 49 şehir var)
```

Sebep bilinçliymiş: `cities.ts` Stuttgart'ı `priority: 3` ile tutuyor, çünkü ana
sayfa zaten o ifadeyi hedefliyor ve ikinci bir sayfa onu kannibalize ederdi. **Karar
doğru** — ama yan etkisi istenmeyen bir şeydi: insanın tahmin edeceği, bir dizinin
veya rakip sitenin vereceği en olası URL çıkmaz sokaktı.

Artık 301 ile ana sayfaya gidiyor, yedi dilde de kendi slug'ıyla. Strateji aynı
kaldı, rakip sayfa oluşmadı, ama o adrese gelen değer artık ait olduğu yere akıyor.

---

## Sıradaki adımlar — etki sırasına göre

1. **Search Console'u doğrula** (5 dk, sende) — bunsuz geri kalan ölçülemez
2. **`veystunesofficial.de` geri alınabilir mi, bugün kontrol et** (Maps analizi §2)
3. **Mekân ve portal bağlantıları topla** — en yüksek etkili tekrarlayan iş
4. **Yorum hızını artır** (Maps analizi §4 — 31 yorumun var, hız düşük)
5. Doğrulamadan 4 hafta sonra: Search Console'da hangi sorgularda göründüğüne bak
   ve içerik planını ona göre yeniden kur

---

## Bu analizin sınırları

- **Google'da gerçek sıranı göremedim.** Otomatik sorgu Google'ın şartlarına aykırı
  ve sonuç kişiye/konuma göre değişir. Sıra tespiti gizli sekmede elle yapılmalı —
  yöntemi [LOCAL-SEO-CHECKLIST.md](LOCAL-SEO-CHECKLIST.md) §0'da yazılı.
- **Sitenin dizinde olup olmadığını doğrulayamadım.** Search Console olmadan bu
  bilgi yok.
- **Backlink sayısını ölçemedim.** Ahrefs/Semrush erişimi yok. "Sıfıra yakın"
  demem, dışarıya dönük hiçbir çalışma yapılmamış olmasına dayanıyor
  ([GEO-STRATEGY.md](GEO-STRATEGY.md) §6 bunu açıkça söylüyor), ölçüme değil.
