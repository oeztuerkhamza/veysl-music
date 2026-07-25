import type { BlogPost, BlogTemplateField } from './types';

/**
 * RECAP TEMPLATE — `type: 'recap'`, `status: 'template'`. Not a real event. VEYSL has
 * zero verified real-wedding details today (no couple names, venue, date — see
 * `.claude/BRAND-FACTS.md`), so this ships as a fill-in-the-blank skeleton, not a
 * finished post. Two placeholder conventions are used in `body` below, and both must
 * be gone before this is ever published:
 *
 *   - `{{TOKEN}}` — a blank to fill in with a real fact, matched 1:1 to `templateFields`.
 *   - `[ANLEITUNG: ...]` — an editing instruction for the owner, to be DELETED, never
 *     filled in or published as-is.
 *
 * Every fact this template asks for must be real and have the couple's written
 * permission to publish (first names, date, venue) — see docs/BLOG-PLAN.md → "HOW-TO:
 * collecting real testimonials", the same consent process applies here.
 */

export const templateFieldsGrosseFeier: BlogTemplateField[] = [
  {
    key: 'COUPLE_NAMES',
    label: { de: 'Vornamen des Brautpaars', tr: 'Çiftin adları', en: "Couple's first names" },
    hint: {
      de: 'Nur mit schriftlichem Einverständnis des Paares veröffentlichen. Nachnamen weglassen.',
      tr: 'Sadece çiftin yazılı izniyle yayınlayın. Soyadları eklemeyin.',
      en: "Only publish with the couple's written permission. Omit surnames.",
    },
    example: 'Elif & Jonas',
  },
  {
    key: 'CITY',
    label: { de: 'Stadt der Feier', tr: 'Kutlamanın şehri', en: 'City of the celebration' },
    hint: {
      de: 'Möglichst eine Stadt aus dem Einzugsgebiet nennen, siehe cities.ts.',
      tr: 'Mümkünse hizmet bölgesindeki bir şehir belirtin, bkz. cities.ts.',
      en: 'Prefer a city from the service area, see cities.ts.',
    },
    example: 'Esslingen',
  },
  {
    key: 'VENUE_NAME',
    label: { de: 'Name der Location', tr: 'Mekân adı', en: 'Venue name' },
    hint: {
      de: 'Nur echte, bestätigte Locations nennen — niemals erfinden, siehe venues.ts.',
      tr: 'Sadece gerçek, doğrulanmış mekânları belirtin — asla uydurmayın, bkz. venues.ts.',
      en: 'Name only a real, confirmed venue — never invent one, see venues.ts.',
    },
    example: 'Esslinger Burg',
  },
  {
    key: 'MONTH_YEAR',
    label: { de: 'Monat und Jahr', tr: 'Ay ve yıl', en: 'Month and year' },
    hint: {
      de: 'Kein exaktes Datum nötig — Monat/Jahr reicht und schützt die Privatsphäre etwas mehr.',
      tr: 'Tam tarih gerekmez — ay/yıl yeterli ve gizliliği biraz daha korur.',
      en: 'No exact date needed — month/year is enough and protects privacy a little more.',
    },
    example: 'Juni 2026',
  },
  {
    key: 'GUEST_COUNT',
    label: { de: 'Ungefähre Gästezahl', tr: 'Yaklaşık davetli sayısı', en: 'Approximate guest count' },
    hint: { de: 'Grobe Zahl reicht, muss nicht exakt sein.', tr: 'Kaba bir rakam yeterli.', en: 'A rough number is fine.' },
    example: '160',
  },
  {
    key: 'PACKAGE_USED',
    label: { de: 'Gebuchtes Paket', tr: 'Rezerve edilen paket', en: 'Package booked' },
    hint: {
      de: 'Muss zu einem echten Paket aus packages.ts passen (Essential/Signature/Prestige).',
      tr: 'packages.ts içindeki gerçek bir paketle eşleşmeli (Essential/Signature/Prestige).',
      en: 'Must match a real package from packages.ts (Essential/Signature/Prestige).',
    },
    example: 'Prestige',
  },
  {
    key: 'HIGHLIGHT_MOMENT',
    label: { de: 'Ein konkreter Höhepunkt des Abends', tr: 'Akşamın somut bir zirve anı', en: 'One concrete highlight of the evening' },
    hint: {
      de: '[ANLEITUNG] 2–3 Sätze: Was genau ist passiert? Welcher Song, welche Reaktion der Gäste?',
      tr: '[ANLEITUNG] 2-3 cümle: Tam olarak ne oldu? Hangi şarkı, davetlilerin tepkisi neydi?',
      en: '[ANLEITUNG] 2–3 sentences: what exactly happened? Which song, how did guests react?',
    },
  },
  {
    key: 'ORCHESTRA_OR_DJ',
    label: { de: 'DJ-Set oder DJ & Orkestra', tr: 'DJ seti mi, DJ & Orkestra mı', en: 'DJ set or DJ & Orkestra' },
    hint: {
      de: 'Welches Format wurde gebucht — reines DJ-Set oder mit Live-Orchester?',
      tr: 'Hangi format rezerve edildi — sade DJ seti mi, canlı orkestralı mı?',
      en: 'Which format was booked — a bare DJ set, or with the live orchestra?',
    },
    example: 'DJ & Orkestra',
  },
  {
    key: 'COUPLE_QUOTE',
    label: { de: 'Zitat des Brautpaars (optional)', tr: 'Çiftin sözü (isteğe bağlı)', en: "Quote from the couple (optional)" },
    hint: {
      de: 'Nur ein echtes, freigegebenes Zitat einfügen. Ohne Freigabe: Feld leer lassen und Absatz löschen, nicht erfinden.',
      tr: 'Sadece gerçek, izin verilmiş bir alıntı ekleyin. İzin yoksa: alanı boş bırakıp paragrafı silin, uydurmayın.',
      en: "Insert only a real, permission-granted quote. Without permission: leave blank and delete the paragraph — never invent one.",
    },
  },
  {
    key: 'PHOTO_CREDIT',
    label: { de: 'Fotograf/in (Namensnennung)', tr: 'Fotoğrafçı (isim belirtme)', en: 'Photographer credit' },
    hint: {
      de: 'Nur mit Einverständnis des Fotografen/der Fotografin nennen.',
      tr: 'Sadece fotoğrafçının izniyle belirtin.',
      en: "Only credit with the photographer's permission.",
    },
  },
];

export const grosseFeierBodyDe = `
> **Hinweis für dich als Betreiber, vor der Veröffentlichung entfernen:** Diese Vorlage
> ist für eine größere Hochzeit mit DJ & Orkestra gedacht. Ersetze jedes {{TOKEN}} durch
> echte, vom Brautpaar freigegebene Angaben (siehe die Feldliste in diesem Modul) und
> lösche jede Zeile, die mit [ANLEITUNG] beginnt, nachdem du sie ausgefüllt hast. Ohne
> schriftliche Freigabe des Paares für Namen, Ort und Fotos bleibt dieser Beitrag
> unveröffentlicht.

## Eine Hochzeit in {{CITY}}: {{COUPLE_NAMES}}

{{COUPLE_NAMES}} haben im {{MONTH_YEAR}} in {{VENUE_NAME}} in {{CITY}} geheiratet — mit
rund {{GUEST_COUNT}} Gästen und dem {{PACKAGE_USED}}-Paket inklusive {{ORCHESTRA_OR_DJ}}.

[ANLEITUNG] Hier 2–3 Sätze zur Location und zum Charakter der Feier schreiben: Was hat
diese Hochzeit besonders gemacht? Deutsch-türkisch, rein deutsch, international?
Draußen, drinnen, beides?

## Der Ablauf des Abends

[ANLEITUNG] Kurz den tatsächlichen Ablauf skizzieren — Zeremonie, Empfang, Dinner,
Tanzprogramm. Nicht erfinden, sondern den echten Ablauf dieser Feier wiedergeben.

## Der Höhepunkt des Abends

{{HIGHLIGHT_MOMENT}}

## Musik und Live-Momente

[ANLEITUNG] Beschreiben, welche Musikrichtungen liefen, ob und wie die Live-Orchester-
Option zum Einsatz kam, welche besonderen Wünsche des Paares umgesetzt wurden.

## Stimme des Brautpaars

{{COUPLE_QUOTE}}

[ANLEITUNG] Falls kein freigegebenes Zitat vorliegt, diesen gesamten Abschnitt löschen
statt ihn leer oder erfunden zu lassen.

## Fazit

[ANLEITUNG] Ein bis zwei abschließende Sätze, die die Hochzeit zusammenfassen und zur
eigenen Anfrage überleiten.

*Fotos: {{PHOTO_CREDIT}}*
`.trim();

export const grosseFeierBodyTr = `
> **İşletmeci olarak sana not, yayınlamadan önce kaldır:** Bu şablon, DJ & Orkestra ile
> yapılan büyük bir düğün için tasarlandı. Her {{TOKEN}}'ı çiftin izin verdiği gerçek
> bilgilerle değiştir ve [ANLEITUNG] ile başlayan her satırı doldurduktan sonra sil.
> İsimler, yer ve fotoğraflar için çiftin yazılı izni olmadan bu yazı yayınlanmamalı.

## {{CITY}}'de bir düğün: {{COUPLE_NAMES}}

{{COUPLE_NAMES}}, {{MONTH_YEAR}} tarihinde {{CITY}}'deki {{VENUE_NAME}}'de yaklaşık
{{GUEST_COUNT}} davetliyle ve {{ORCHESTRA_OR_DJ}} dahil {{PACKAGE_USED}} paketiyle
evlendi.

[ANLEITUNG] Mekân ve kutlamanın karakteri hakkında 2-3 cümle yazın: bu düğünü özel kılan
neydi? Alman-Türk mü, sade Alman mı, uluslararası mı? Açık havada mı, kapalıda mı?

## Akşamın akışı

[ANLEITUNG] Gerçek akışı kısaca özetleyin — tören, karşılama, yemek, dans programı.
Uydurmayın, bu kutlamanın gerçek akışını yansıtın.

## Akşamın zirvesi

{{HIGHLIGHT_MOMENT}}

## Müzik ve canlı anlar

[ANLEITUNG] Hangi müzik türlerinin çaldığını, canlı orkestra seçeneğinin kullanılıp
kullanılmadığını ve çiftin hangi özel isteklerinin gerçekleştirildiğini anlatın.

## Çiftin sözü

{{COUPLE_QUOTE}}

[ANLEITUNG] İzin verilmiş bir alıntı yoksa, bu bölümü tamamen silin, boş ya da uydurma
bırakmayın.

## Sonuç

[ANLEITUNG] Düğünü özetleyen ve kendi talebinize yönlendiren bir-iki kapanış cümlesi.

*Fotoğraflar: {{PHOTO_CREDIT}}*
`.trim();

export const grosseFeierBodyEn = `
> **Note for you as the operator, remove before publishing:** This template is built
> for a larger wedding with the DJ & Orkestra format. Replace every {{TOKEN}} with real,
> couple-approved details and delete every line starting with [ANLEITUNG] once filled
> in. Without the couple's written permission for names, location and photos, this post
> stays unpublished.

## A wedding in {{CITY}}: {{COUPLE_NAMES}}

{{COUPLE_NAMES}} got married in {{MONTH_YEAR}} at {{VENUE_NAME}} in {{CITY}} — with
around {{GUEST_COUNT}} guests and the {{PACKAGE_USED}} package including
{{ORCHESTRA_OR_DJ}}.

[ANLEITUNG] Write 2–3 sentences about the venue and character of the celebration: what
made this wedding special? German-Turkish, purely German, international? Outdoors,
indoors, both?

## The running order of the evening

[ANLEITUNG] Briefly sketch the actual running order — ceremony, reception, dinner,
dance programme. Don't invent it — reflect this celebration's real running order.

## The highlight of the evening

{{HIGHLIGHT_MOMENT}}

## Music and live moments

[ANLEITUNG] Describe which musical directions played, whether and how the live-
orchestra option was used, and which special requests from the couple were realised.

## In the couple's words

{{COUPLE_QUOTE}}

[ANLEITUNG] If no approved quote exists, delete this whole section rather than leaving
it blank or invented.

## Conclusion

[ANLEITUNG] One or two closing sentences summarising the wedding and leading into your
own enquiry.

*Photos: {{PHOTO_CREDIT}}*
`.trim();

export const echteHochzeitGrosseFeierPost: BlogPost = {
  id: 'echte-hochzeit-vorlage-grosse-feier',
  slug: 'echte-hochzeit-vorlage-grosse-feier',
  category: 'real-wedding',
  type: 'recap',
  status: 'template',
  publishedAt: '2026-07-25',
  updatedAt: '2026-07-25',
  tags: ['real-wedding', 'vorlage', 'dj-orkestra'],
  readingTimeMinutes: 4,
  links: ['/pakete', '/echte-hochzeiten', '/anfrage'],
  relatedPosts: ['echte-hochzeit-vorlage-kina-abend'],
  templateFields: templateFieldsGrosseFeier,
  translations: {
    de: {
      title: '[VORLAGE] Echte Hochzeit: {{COUPLE_NAMES}} in {{CITY}}',
      excerpt:
        '[VORLAGE — nicht veröffentlichen, bis alle {{TOKENS}} durch echte, freigegebene Angaben ersetzt sind] Eine große Hochzeit mit DJ & Orkestra: Ablauf, musikalischer Höhepunkt und die Stimme des Brautpaars.',
      body: grosseFeierBodyDe,
      seo: {
        metaTitle: '[VORLAGE] Echte Hochzeit in {{CITY}} | VEYSL',
        metaDescription: '[VORLAGE — vor Veröffentlichung mit echten Daten füllen] Echte Hochzeit mit DJ & Orkestra, Ablauf und Höhepunkte.',
      },
    },
    tr: {
      title: '[ŞABLON] Gerçek düğün: {{CITY}}\'de {{COUPLE_NAMES}}',
      excerpt:
        '[ŞABLON — tüm {{TOKEN}}\'lar gerçek, izin verilmiş bilgilerle değiştirilmeden yayınlamayın] DJ & Orkestra ile büyük bir düğün: akış, müzikal zirve ve çiftin sözü.',
      body: grosseFeierBodyTr,
      seo: {
        metaTitle: '[ŞABLON] {{CITY}}\'de Gerçek Düğün | VEYSL',
        metaDescription: '[ŞABLON — yayınlamadan önce gerçek verilerle doldurun] DJ & Orkestra ile gerçek düğün, akış ve zirve anları.',
      },
    },
    en: {
      title: '[TEMPLATE] Real wedding: {{COUPLE_NAMES}} in {{CITY}}',
      excerpt:
        '[TEMPLATE — do not publish until every {{TOKEN}} is replaced with real, approved details] A larger wedding with DJ & Orkestra: running order, musical highlight and the couple in their own words.',
      body: grosseFeierBodyEn,
      seo: {
        metaTitle: '[TEMPLATE] Real Wedding in {{CITY}} | VEYSL',
        metaDescription: '[TEMPLATE — fill with real data before publishing] A real wedding with DJ & Orkestra, running order and highlights.',
      },
    },
  },
};
