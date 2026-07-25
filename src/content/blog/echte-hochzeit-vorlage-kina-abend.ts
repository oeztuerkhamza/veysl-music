import type { BlogPost, BlogTemplateField } from './types';

/**
 * RECAP TEMPLATE — `type: 'recap'`, `status: 'template'`. See the header comment in
 * `echte-hochzeit-vorlage-grosse-feier.ts` for the full rationale and the `{{TOKEN}}` /
 * `[ANLEITUNG]` placeholder convention — identical rules apply here. This second
 * template covers a Kına Gecesi rather than the wedding day itself, since the two
 * events have a genuinely different structure (see `kina-gecesi-henna-abend-planen.ts`)
 * and deserve their own recap shape rather than reusing the wedding template with
 * different labels.
 */

export const templateFieldsKinaAbend: BlogTemplateField[] = [
  {
    key: 'BRIDE_NAME',
    label: { de: 'Vorname der Braut', tr: 'Gelinin adı', en: "Bride's first name" },
    hint: {
      de: 'Nur mit schriftlichem Einverständnis veröffentlichen. Nachname weglassen.',
      tr: 'Sadece yazılı izinle yayınlayın. Soyadı eklemeyin.',
      en: "Only publish with written permission. Omit the surname.",
    },
    example: 'Zeynep',
  },
  {
    key: 'CITY',
    label: { de: 'Stadt der Feier', tr: 'Kutlamanın şehri', en: 'City of the celebration' },
    hint: {
      de: 'Möglichst eine Stadt aus dem Einzugsgebiet, siehe cities.ts.',
      tr: 'Mümkünse hizmet bölgesindeki bir şehir, bkz. cities.ts.',
      en: 'Prefer a city from the service area, see cities.ts.',
    },
    example: 'Böblingen',
  },
  {
    key: 'VENUE_OR_LOCATION_TYPE',
    label: { de: 'Location oder Ort (falls nicht öffentlich nennbar: Locationtyp)', tr: 'Mekân ya da yer (kamuya açıklanamıyorsa: mekân türü)', en: 'Venue or place (if not publicly nameable: venue type)' },
    hint: {
      de: 'Bei privaten Feiern im Garten/zu Hause: nur den Typ nennen ("privater Garten"), keine Adresse.',
      tr: 'Bahçede/evde yapılan özel kutlamalarda: sadece türünü belirtin ("özel bahçe"), adres vermeyin.',
      en: 'For private celebrations at home/in a garden: name only the type ("private garden"), never an address.',
    },
    example: 'privater Garten',
  },
  {
    key: 'MONTH_YEAR',
    label: { de: 'Monat und Jahr', tr: 'Ay ve yıl', en: 'Month and year' },
    hint: { de: 'Monat/Jahr reicht.', tr: 'Ay/yıl yeterli.', en: 'Month/year is enough.' },
    example: 'Mai 2026',
  },
  {
    key: 'GUEST_COUNT',
    label: { de: 'Ungefähre Gästezahl', tr: 'Yaklaşık davetli sayısı', en: 'Approximate guest count' },
    hint: { de: 'Grobe Zahl reicht.', tr: 'Kaba bir rakam yeterli.', en: 'A rough number is fine.' },
    example: '70',
  },
  {
    key: 'ENTRANCE_SONG_MOMENT',
    label: { de: 'Der Einzugsmoment der Braut', tr: 'Gelinin giriş anı', en: "The bride's entrance moment" },
    hint: {
      de: '[ANLEITUNG] 2–3 Sätze: Wie kam die Braut herein, welche Musik lief, wie haben die Gäste reagiert?',
      tr: '[ANLEITUNG] 2-3 cümle: Gelin nasıl girdi, hangi müzik çaldı, davetliler nasıl tepki verdi?',
      en: '[ANLEITUNG] 2–3 sentences: how did the bride enter, what music played, how did guests react?',
    },
  },
  {
    key: 'RITUAL_DESCRIPTION',
    label: { de: 'Beschreibung des Henna-Rituals', tr: 'Kına ritüelinin tanımı', en: 'Description of the henna ritual' },
    hint: {
      de: '[ANLEITUNG] Konkret beschreiben, ohne private Details preiszugeben, die das Paar nicht öffentlich sehen möchte.',
      tr: '[ANLEITUNG] Çiftin kamuya açık görmek istemeyeceği özel detayları vermeden somut şekilde tanımlayın.',
      en: '[ANLEITUNG] Describe concretely, without private details the couple wouldn\'t want made public.',
    },
  },
  {
    key: 'LIVE_MUSIC_DETAILS',
    label: { de: 'Live-Musik-Einsatz (Davul-Zurna, Saz o. Ä.)', tr: 'Canlı müzik kullanımı (davul-zurna, saz vb.)', en: 'Live music used (davul-zurna, saz, etc.)' },
    hint: {
      de: 'Welche Live-Elemente kamen zum Einsatz, und in welchem Moment?',
      tr: 'Hangi canlı unsurlar kullanıldı, hangi anda?',
      en: 'Which live elements were used, and at what moment?',
    },
  },
  {
    key: 'FAMILY_QUOTE',
    label: { de: 'Zitat der Braut oder Familie (optional)', tr: 'Gelinin ya da ailenin sözü (isteğe bağlı)', en: 'Quote from the bride or family (optional)' },
    hint: {
      de: 'Nur ein echtes, freigegebenes Zitat einfügen. Ohne Freigabe: Abschnitt löschen.',
      tr: 'Sadece gerçek, izin verilmiş bir alıntı ekleyin. İzin yoksa: bölümü silin.',
      en: 'Insert only a real, permission-granted quote. Without permission: delete the section.',
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

export const kinaAbendBodyDe = `
> **Hinweis für dich als Betreiber, vor der Veröffentlichung entfernen:** Diese Vorlage
> ist für eine Kına Gecesi (Henna-Abend) gedacht — bewusst getrennt von der
> Hochzeits-Vorlage, weil der Ablauf grundlegend anders ist (siehe der Guide zur
> Kına-Gecesi-Planung). Ersetze jedes {{TOKEN}} durch echte, freigegebene Angaben und
> lösche jede [ANLEITUNG]-Zeile danach. Bei privaten Feiern (Garten, zu Hause) niemals
> die genaue Adresse nennen — siehe Hinweis zum Feld VENUE_OR_LOCATION_TYPE.

## Eine Kına Gecesi in {{CITY}}: {{BRIDE_NAME}}s Henna-Abend

Im {{MONTH_YEAR}} feierte {{BRIDE_NAME}} ihre Kına Gecesi in {{VENUE_OR_LOCATION_TYPE}}
in {{CITY}} — mit rund {{GUEST_COUNT}} Gästen.

[ANLEITUNG] Hier 2–3 Sätze zur Atmosphäre und zum Rahmen des Abends: Wer war
eingeladen, wie war die Location gestaltet, was war der Anlass für die Entscheidung
dieses Formats?

## Der Einzug

{{ENTRANCE_SONG_MOMENT}}

## Das Henna-Ritual

{{RITUAL_DESCRIPTION}}

## Live-Musik und der Übergang zur Party

{{LIVE_MUSIC_DETAILS}}

[ANLEITUNG] Beschreiben, wie der Stimmungswechsel vom Ritual zur Party gestaltet wurde
— welcher Song, welches Timing, wie haben die Gäste reagiert.

## Stimme der Familie

{{FAMILY_QUOTE}}

[ANLEITUNG] Falls kein freigegebenes Zitat vorliegt, diesen gesamten Abschnitt löschen.

## Fazit

[ANLEITUNG] Ein bis zwei abschließende Sätze, die den Abend zusammenfassen und zur
eigenen Anfrage überleiten.

*Fotos: {{PHOTO_CREDIT}}*
`.trim();

export const kinaAbendBodyTr = `
> **İşletmeci olarak sana not, yayınlamadan önce kaldır:** Bu şablon bir kına gecesi
> için tasarlandı — akış temelden farklı olduğu için düğün şablonundan bilinçli olarak
> ayrıldı (bkz. kına gecesi planlama rehberi). Her {{TOKEN}}'ı gerçek, izin verilmiş
> bilgilerle değiştir ve ardından her [ANLEITUNG] satırını sil. Özel kutlamalarda
> (bahçe, ev) asla tam adresi belirtme.

## {{CITY}}'de bir kına gecesi: {{BRIDE_NAME}}'in henna akşamı

{{MONTH_YEAR}} tarihinde {{BRIDE_NAME}}, {{CITY}}'deki {{VENUE_OR_LOCATION_TYPE}}'de
yaklaşık {{GUEST_COUNT}} davetliyle kına gecesini kutladı.

[ANLEITUNG] Akşamın atmosferi ve çerçevesi hakkında 2-3 cümle yazın: kimler davetliydi,
mekân nasıl hazırlanmıştı, bu formatın seçilmesinin nedeni neydi?

## Giriş

{{ENTRANCE_SONG_MOMENT}}

## Kına ritüeli

{{RITUAL_DESCRIPTION}}

## Canlı müzik ve partiye geçiş

{{LIVE_MUSIC_DETAILS}}

[ANLEITUNG] Ritüelden partiye atmosfer değişiminin nasıl tasarlandığını anlatın — hangi
şarkı, hangi zamanlama, davetliler nasıl tepki verdi.

## Ailenin sözü

{{FAMILY_QUOTE}}

[ANLEITUNG] İzin verilmiş bir alıntı yoksa, bu bölümü tamamen silin.

## Sonuç

[ANLEITUNG] Akşamı özetleyen ve kendi talebinize yönlendiren bir-iki kapanış cümlesi.

*Fotoğraflar: {{PHOTO_CREDIT}}*
`.trim();

export const kinaAbendBodyEn = `
> **Note for you as the operator, remove before publishing:** This template is built
> for a Kına Gecesi (henna night) — deliberately separate from the wedding template
> because the running order is fundamentally different (see the kına gecesi planning
> guide). Replace every {{TOKEN}} with real, approved details and delete every
> [ANLEITUNG] line afterward. For private celebrations (garden, home), never name the
> exact address.

## A kına gecesi in {{CITY}}: {{BRIDE_NAME}}'s henna night

In {{MONTH_YEAR}}, {{BRIDE_NAME}} celebrated her kına gecesi at
{{VENUE_OR_LOCATION_TYPE}} in {{CITY}} — with around {{GUEST_COUNT}} guests.

[ANLEITUNG] Write 2–3 sentences about the atmosphere and framing of the evening: who
was invited, how was the venue set up, what was the reason behind choosing this format?

## The entrance

{{ENTRANCE_SONG_MOMENT}}

## The henna ritual

{{RITUAL_DESCRIPTION}}

## Live music and the transition into the party

{{LIVE_MUSIC_DETAILS}}

[ANLEITUNG] Describe how the mood shift from ritual to party was designed — which
song, what timing, how guests reacted.

## In the family's words

{{FAMILY_QUOTE}}

[ANLEITUNG] If no approved quote exists, delete this whole section.

## Conclusion

[ANLEITUNG] One or two closing sentences summarising the evening and leading into your
own enquiry.

*Photos: {{PHOTO_CREDIT}}*
`.trim();

export const echteHochzeitKinaAbendPost: BlogPost = {
  id: 'echte-hochzeit-vorlage-kina-abend',
  slug: 'echte-hochzeit-vorlage-kina-abend',
  category: 'real-wedding',
  type: 'recap',
  status: 'template',
  publishedAt: '2026-07-25',
  updatedAt: '2026-07-25',
  tags: ['real-wedding', 'vorlage', 'kina-gecesi'],
  readingTimeMinutes: 4,
  links: ['/hochzeit-events', '/echte-hochzeiten', '/anfrage'],
  relatedPosts: ['echte-hochzeit-vorlage-grosse-feier', 'kina-gecesi-henna-abend-planen'],
  templateFields: templateFieldsKinaAbend,
  translations: {
    de: {
      title: '[VORLAGE] Echte Kına Gecesi: {{BRIDE_NAME}} in {{CITY}}',
      excerpt:
        '[VORLAGE — nicht veröffentlichen, bis alle {{TOKENS}} durch echte, freigegebene Angaben ersetzt sind] Eine Kına Gecesi: Einzug, Henna-Ritual, Live-Musik und der Übergang zur Party.',
      body: kinaAbendBodyDe,
      seo: {
        metaTitle: '[VORLAGE] Echte Kına Gecesi in {{CITY}} | VEYSL',
        metaDescription: '[VORLAGE — vor Veröffentlichung mit echten Daten füllen] Echte Kına Gecesi, Ritual und Live-Musik.',
      },
    },
    tr: {
      title: '[ŞABLON] Gerçek kına gecesi: {{CITY}}\'de {{BRIDE_NAME}}',
      excerpt:
        '[ŞABLON — tüm {{TOKEN}}\'lar gerçek, izin verilmiş bilgilerle değiştirilmeden yayınlamayın] Bir kına gecesi: giriş, kına ritüeli, canlı müzik ve partiye geçiş.',
      body: kinaAbendBodyTr,
      seo: {
        metaTitle: '[ŞABLON] {{CITY}}\'de Gerçek Kına Gecesi | VEYSL',
        metaDescription: '[ŞABLON — yayınlamadan önce gerçek verilerle doldurun] Gerçek kına gecesi, ritüel ve canlı müzik.',
      },
    },
    en: {
      title: '[TEMPLATE] Real kına gecesi: {{BRIDE_NAME}} in {{CITY}}',
      excerpt:
        '[TEMPLATE — do not publish until every {{TOKEN}} is replaced with real, approved details] A kına gecesi: entrance, henna ritual, live music and the transition into the party.',
      body: kinaAbendBodyEn,
      seo: {
        metaTitle: '[TEMPLATE] Real Kına Gecesi in {{CITY}} | VEYSL',
        metaDescription: '[TEMPLATE — fill with real data before publishing] A real kına gecesi, ritual and live music.',
      },
    },
  },
};
