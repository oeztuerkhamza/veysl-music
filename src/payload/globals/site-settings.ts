import type { GlobalConfig } from 'payload';
import { isAdmin } from '../access/is-admin';

const weekdayOptions = [
  { label: 'Montag', value: 'mon' },
  { label: 'Dienstag', value: 'tue' },
  { label: 'Mittwoch', value: 'wed' },
  { label: 'Donnerstag', value: 'thu' },
  { label: 'Freitag', value: 'fri' },
  { label: 'Samstag', value: 'sat' },
  { label: 'Sonntag', value: 'sun' },
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
  label: 'Website-Einstellungen',
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
        { name: 'email', type: 'email', admin: { description: 'Überschreibt site.contact.email.' } },
        { name: 'phone', type: 'text', validate: validatePhoneDisplay, admin: { description: 'Anzeigeformat, z. B. "+49 176 64844815".' } },
        {
          name: 'phoneHref',
          type: 'text',
          admin: { description: 'tel:-Link. Wird aus "phone" abgeleitet, wenn leer — kann aber überschrieben werden.' },
        },
        {
          name: 'whatsapp',
          type: 'text',
          validate: validateWhatsappDigits,
          admin: { description: 'Nur Ziffern inkl. Ländercode für wa.me-Links, z. B. "4917664844815".' },
        },
      ],
    },
    {
      name: 'address',
      type: 'group',
      fields: [
        { name: 'street', type: 'text' },
        { name: 'postalCode', type: 'text' },
        { name: 'city', type: 'text' },
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
      name: 'serviceAreas',
      type: 'text',
      hasMany: true,
      admin: { description: 'Regelmäßig bespielte Städte, z. B. "Stuttgart". Überschreibt die komplette Liste, wenn nicht leer.' },
    },
    {
      name: 'stats',
      type: 'group',
      fields: [
        { name: 'yearsExperience', type: 'number', min: 0 },
        { name: 'eventsCompleted', type: 'number', min: 0 },
        { name: 'instagramFollowers', type: 'number', min: 0 },
        {
          name: 'hostingLanguages',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Deutsch', value: 'de' },
            { label: 'Türkisch', value: 'tr' },
            { label: 'Englisch', value: 'en' },
          ],
        },
      ],
    },
    {
      name: 'season',
      type: 'group',
      fields: [{ name: 'year', type: 'number', admin: { description: 'Aktuelle Buchungssaison, z. B. 2026.' } }],
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
      labels: { singular: 'Sprechstunde', plural: 'Sprechstunden' },
      admin: { description: 'Wann Veysel erreichbar ist. Für "nach Vereinbarung" o.ä. das Feld "Hinweis" nutzen statt Zeiten.' },
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
          admin: { description: 'Optional, z. B. "Termine nach Vereinbarung".' },
        },
      ],
    },
  ],
};
