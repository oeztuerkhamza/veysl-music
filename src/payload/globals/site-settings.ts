import type { GlobalConfig } from 'payload';
import { isAdmin } from '../access/is-admin';

const weekdayOptions = [
  { label: { de: 'Montag', tr: 'Pazartesi' }, value: 'mon' },
  { label: { de: 'Dienstag', tr: 'Salı' }, value: 'tue' },
  { label: { de: 'Mittwoch', tr: 'Çarşamba' }, value: 'wed' },
  { label: { de: 'Donnerstag', tr: 'Perşembe' }, value: 'thu' },
  { label: { de: 'Freitag', tr: 'Cuma' }, value: 'fri' },
  { label: { de: 'Samstag', tr: 'Cumartesi' }, value: 'sat' },
  { label: { de: 'Sonntag', tr: 'Pazar' }, value: 'sun' },
];

function validateUrl(value: unknown): true | string {
  if (value === undefined || value === null || value === '') return true;
  if (typeof value !== 'string') return 'Bitte eine gültige URL angeben.';
  try {
    new URL(value);
    return true;
  } catch {
    return 'Bitte eine vollständige URL angeben, z. B. https://example.com';
  }
}

/** Digits only, optional leading country code, no `+`, no spaces — exactly what a `wa.me/<value>` link needs. */
function validateWhatsappDigits(value: unknown): true | string {
  if (value === undefined || value === null || value === '') return true;
  if (typeof value !== 'string' || !/^[1-9]\d{6,14}$/.test(value)) {
    return 'Nur Ziffern inkl. Ländercode, ohne "+" und ohne Leerzeichen, z. B. 4917664844815 — sonst bricht der WhatsApp-Link.';
  }
  return true;
}

function validatePhoneDisplay(value: unknown): true | string {
  if (value === undefined || value === null || value === '') return true;
  if (typeof value !== 'string' || !/^\+?[0-9 ()-]{6,25}$/.test(value)) {
    return 'Bitte eine gültige Telefonnummer angeben.';
  }
  return true;
}

function validateOptionalTime(value: unknown): true | string {
  if (value === undefined || value === null || value === '') return true;
  if (typeof value !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    return 'Bitte eine Uhrzeit im Format SS:MM angeben.';
  }
  return true;
}

/**
 * Everything in `src/content/site.ts` that the owner should be able to edit
 * himself, without a code change or redeploy: contact channels, address,
 * social links, service areas, the headline stats, the current season, the
 * gated review numbers, and consultation hours ("Sprechstunden").
 *
 * `src/content/site.ts` remains the typed defaults/fallback and is NOT
 * replaced — `src/content/get-site.ts` deep-merges this global over those
 * defaults, per field, so a blank admin field never blanks out a working
 * default (see that file for the exact merge rule). Brand identity
 * (`name`, `legalName`, `previousNames`) is deliberately NOT editable here —
 * those stay code-level per BRAND-FACTS.md.
 *
 * `read` is admin-only on purpose: the public site never talks to this
 * global directly, only through the cached `getSite()` resolver's trusted
 * Local API call — see that file.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: { de: 'Website-Einstellungen', tr: 'Web Sitesi Ayarları' },
  admin: {
    description:
      'Kontakt, Adresse, Social Links, Kennzahlen und Sprechstunden der Website. Leer gelassene Felder behalten den bisherigen Standardwert aus dem Code (site.ts) — ein Tippfehler blockiert also nie den ganzen Kontaktweg.',
  },
  access: {
    read: isAdmin,
    update: isAdmin,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        // Convenience: derive the tel: link from the display phone number if left blank.
        if (data?.contact?.phone && !data.contact.phoneHref) {
          const digits = String(data.contact.phone).replace(/[^\d+]/g, '');
          data.contact.phoneHref = digits ? `tel:${digits}` : undefined;
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: 'contact',
      type: 'group',
      fields: [
        { name: 'email', label: { de: 'E-Mail', tr: 'E-posta' }, type: 'email', admin: { description: { de: 'Überschreibt site.contact.email.', tr: 'site.contact.email değerini geçersiz kılar.' } } },
        { name: 'phone', label: { de: 'Telefon', tr: 'Telefon' }, type: 'text', validate: validatePhoneDisplay, admin: { description: { de: 'Anzeigeformat, z. B. "+49 176 64844815".', tr: 'Gösterim biçimi, örn. "+49 176 64844815".' } } },
        {
          name: 'phoneHref', label: { de: 'tel:-Link', tr: 'tel: bağlantısı' },
          type: 'text',
          admin: { description: { de: 'tel:-Link. Wird aus "phone" abgeleitet, wenn leer — kann aber überschrieben werden.', tr: 'tel: bağlantısı. Boşsa "phone" alanından türetilir — istenirse elle girilebilir.' } },
        },
        {
          name: 'whatsapp', label: { de: 'WhatsApp-Nummer', tr: 'WhatsApp numarası' },
          type: 'text',
          validate: validateWhatsappDigits,
          admin: { description: { de: 'Nur Ziffern inkl. Ländercode für wa.me-Links, z. B. "4917664844815".', tr: 'wa.me bağlantıları için ülke kodu dahil yalnızca rakamlar, örn. "4917664844815".' } },
        },
      ],
    },
    {
      name: 'address',
      type: 'group',
      label: { de: 'Anschrift (Impressum — Pflichtangabe)', tr: 'Adres (Impressum — zorunlu)' },
      admin: {
        description:
          'Vollständige Anschrift nach § 5 DDG. Straße UND Postleitzahl sind zwingend — nur der Ort genügt nicht und ist abmahnfähig. Solange beide fehlen, zeigt die Impressum-Seite an dieser Stelle sichtbar einen Platzhalter statt einer erfundenen Adresse.',
      },
      fields: [
        { name: 'street', label: { de: 'Straße und Hausnummer', tr: 'Sokak ve numara' }, type: 'text', admin: { placeholder: 'Musterstraße 12' } },
        { name: 'postalCode', label: { de: 'Postleitzahl', tr: 'Posta kodu' }, type: 'text', admin: { placeholder: '70329' } },
        {
          name: 'city', label: { de: 'Ort', tr: 'Şehir' }, type: 'text',
          admin: {
            placeholder: 'Stuttgart',
            description: {
              de: 'Nur der postalische Ort — „Stuttgart", nicht der Stadtbezirk „Stuttgart-Obertürkheim". Dieser Wert muss zeichengleich mit dem Ort im Google-Unternehmensprofil sein, sonst leidet die lokale Sichtbarkeit.',
              tr: 'Sadece posta adresindeki şehir — "Stuttgart", semt adı ("Stuttgart-Obertürkheim") değil. Bu değer Google işletme profilindeki şehirle birebir aynı olmalı, yoksa yerel görünürlük zarar görüyor.',
            },
          },
        },
      ],
    },
    {
      name: 'legal',
      type: 'group',
      label: { de: 'Rechtliche Angaben (Impressum)', tr: 'Yasal bilgiler (Impressum)' },
      admin: {
        description:
          'Pflichtangaben für den deutschen Rechtsraum. Diese Felder werden ausschließlich hier gepflegt — kein Code-Deploy nötig. Nichts erfinden: leer gelassene Felder erscheinen auf der Impressum-Seite als sichtbarer Platzhalter, und das ist einer falschen Angabe deutlich vorzuziehen.',
      },
      fields: [
        {
          name: 'vatId',
          type: 'text',
          label: { de: 'Umsatzsteuer-IdNr.', tr: 'KDV kimlik numarası' },
          admin: {
            placeholder: 'DE123456789',
            description: {
              de: 'Nach § 27a UStG anzugeben, sofern vorhanden. Wer die Kleinunternehmerregelung nutzt, lässt das Feld leer und setzt stattdessen den Haken unten.',
              tr: '§ 27a UStG uyarınca, varsa girilmelidir. Küçük işletme düzenlemesinden yararlananlar bu alanı boş bırakıp aşağıdaki kutuyu işaretler.',
            },
          },
        },
        {
          name: 'smallBusinessExempt',
          type: 'checkbox',
          label: { de: 'Kleinunternehmer nach § 19 UStG', tr: 'Küçük işletme beyanı (§ 19 UStG)' },
          admin: {
            description:
              'Setzen, wenn keine Umsatzsteuer ausgewiesen wird. Die Impressum-Seite formuliert daraus den Hinweis. Entweder dieses Häkchen oder eine USt-IdNr. muss gesetzt sein — beides leer ist rechtlich unvollständig.',
          },
        },
        {
          name: 'professionalInsurance',
          type: 'text',
          label: { de: 'Berufs-/Betriebshaftpflichtversicherung', tr: 'Mesleki / işletme sorumluluk sigortası' },
          admin: {
            placeholder: 'Musterversicherung AG, Musterstadt — Geltungsbereich: Deutschland',
            description: {
              de: 'Versicherer und räumlicher Geltungsbereich. Für DJ-/Veranstaltungsdienstleistungen üblich und von vielen Locations verlangt.',
              tr: 'Sigorta şirketi ve geçerlilik alanı. DJ / etkinlik hizmetlerinde olağandır ve birçok mekân tarafından istenir.',
            },
          },
        },
      ],
    },
    {
      name: 'social',
      type: 'group',
      fields: [
        { name: 'instagram', type: 'text', validate: validateUrl },
        { name: 'instagramHandle', type: 'text' },
        { name: 'instagramLegacy', type: 'text', validate: validateUrl },
        { name: 'youtube', type: 'text', validate: validateUrl },
        { name: 'googleMaps', type: 'text', validate: validateUrl },
        { name: 'tiktok', type: 'text', validate: validateUrl },
        { name: 'spotify', type: 'text', validate: validateUrl },
        { name: 'soundcloud', type: 'text', validate: validateUrl },
        { name: 'mixcloud', type: 'text', validate: validateUrl },
      ],
    },
    {
      name: 'serviceAreas', label: { de: 'Einzugsgebiet', tr: 'Hizmet bölgesi' },
      type: 'text',
      hasMany: true,
      admin: { description: { de: 'Regelmäßig bespielte Städte, z. B. "Stuttgart". Überschreibt die komplette Liste, wenn nicht leer.', tr: 'Düzenli çalışılan şehirler, örn. "Stuttgart". Boş değilse listenin tamamını geçersiz kılar.' } },
    },
    {
      name: 'stats',
      type: 'group',
      fields: [
        { name: 'yearsExperience', label: { de: 'Jahre Erfahrung', tr: 'Deneyim yılı' }, type: 'number', min: 0 },
        { name: 'eventsCompleted', label: { de: 'Begleitete Events', tr: 'Tamamlanan etkinlik' }, type: 'number', min: 0 },
        { name: 'instagramFollowers', label: { de: 'Instagram-Follower', tr: 'Instagram takipçisi' }, type: 'number', min: 0 },
        {
          name: 'hostingLanguages', label: { de: 'Moderationssprachen', tr: 'Sunum dilleri' },
          type: 'select',
          hasMany: true,
          options: [
            { label: { de: 'Deutsch', tr: 'Almanca' }, value: 'de' },
            { label: { de: 'Türkisch', tr: 'Türkçe' }, value: 'tr' },
            { label: { de: 'Englisch', tr: 'İngilizce' }, value: 'en' },
          ],
        },
      ],
    },
    {
      name: 'season',
      type: 'group',
      fields: [{ name: 'year', type: 'number', admin: { description: { de: 'Aktuelle Buchungssaison, z. B. 2026.', tr: 'Güncel rezervasyon sezonu, örn. 2026.' } } }],
    },
    {
      name: 'reviews',
      type: 'group',
      admin: {
        description:
          'Das Badge und das AggregateRating-Schema erscheinen nur, wenn sowohl "count" > 0 als auch "rating" > 0 sind — niemals eine erfundene Bewertungszahl eintragen (siehe BRAND-FACTS.md).',
      },
      fields: [
        { name: 'googlePlaceId', type: 'text' },
        { name: 'rating', type: 'number', min: 0, max: 5, admin: { step: 0.1 } },
        { name: 'count', type: 'number', min: 0 },
        { name: 'profileUrl', type: 'text', validate: validateUrl },
      ],
    },
    {
      name: 'openingHours',
      type: 'array',
      labels: {
        singular: { de: 'Sprechstunde', tr: 'Çalışma Saati' },
        plural: { de: 'Sprechstunden', tr: 'Çalışma Saatleri' },
      },
      admin: { description: { de: 'Wann Veysel erreichbar ist. Für "nach Vereinbarung" o.ä. das Feld "Hinweis" nutzen statt Zeiten.', tr: 'Veysel’in ulaşılabilir olduğu saatler. "Randevu ile" gibi durumlarda saat yerine "Not" alanını kullanın.' } },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'weekday', type: 'select', required: true, options: weekdayOptions, admin: { width: '25%' } },
            { name: 'opens', type: 'text', validate: validateOptionalTime, admin: { width: '20%', placeholder: '10:00' } },
            { name: 'closes', type: 'text', validate: validateOptionalTime, admin: { width: '20%', placeholder: '18:00' } },
            { name: 'closed', type: 'checkbox', defaultValue: false, admin: { width: '15%' } },
          ],
        },
        {
          name: 'note',
          type: 'text',
          localized: true,
          admin: { description: { de: 'Optional, z. B. "Termine nach Vereinbarung".', tr: 'İsteğe bağlı, örn. "Randevu ile görüşme".' } },
        },
      ],
    },
  ],
};
