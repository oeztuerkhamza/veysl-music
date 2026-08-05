import type { CollectionConfig } from 'payload';
import { SITE_LOCALE_OPTIONS } from '../site-locales';
import { denyAll, isAdmin } from '../access/is-admin';
import { validateIsoDate, validateOptionalTime } from '../utils/iso-date';

/**
 * Persisted submissions from the public `/anfrage` funnel
 * (`src/app/api/anfrage/route.ts`). Mirrors the shape of `enquirySchema` in
 * `src/lib/booking.ts` field-for-field, plus the computed lead score/tier
 * and an admin-editable triage `status`.
 *
 * `create` is denied for everyone, including admins, via the REST/GraphQL
 * API (`denyAll`): the only supported way to create a row is the trusted
 * server-side Local API call in `/api/anfrage`, which runs with Payload's
 * default `overrideAccess: true` and therefore ignores this rule. That
 * keeps the zod validation, honeypot and rate limit in `/api/anfrage` as the
 * single front door — nobody can POST a fake enquiry straight into the CMS.
 *
 * Select-field options below intentionally duplicate the literal value
 * lists in `src/lib/booking.ts` (`eventTypeValues`, `packageValues`, …)
 * rather than importing them, to avoid a circular import between this file
 * and `src/lib/booking.ts` (see the comment in `bookings.ts` for the full
 * chain). Keep both lists in sync by hand.
 */
export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  labels: {
    singular: { de: 'Anfrage', tr: 'Talep' },
    plural: { de: 'Anfragen', tr: 'Talepler' },
  },
  defaultSort: '-createdAt',
  admin: {
    useAsTitle: 'eventDate',
    defaultColumns: ['eventDate', 'firstName', 'lastName', 'eventType', 'leadTier', 'status', 'createdAt'],
    description: {
      de: 'Eingehende Anfragen aus dem öffentlichen Formular unter /anfrage — zum Sichten und Nachverfolgen.',
      tr: '/anfrage sayfasındaki formdan gelen talepler — incelemek ve takip etmek için.',
    },
  },
  access: {
    read: isAdmin,
    create: denyAll,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    // --- Triage (admin-editable) -------------------------------------------------
    {
      name: 'status',
      label: { de: 'Status', tr: 'Durum' },
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: { de: 'Neu', tr: 'Yeni' }, value: 'new' },
        { label: { de: 'Kontaktiert', tr: 'İletişime geçildi' }, value: 'contacted' },
        { label: { de: 'Gewonnen', tr: 'Kazanıldı' }, value: 'won' },
        { label: { de: 'Verloren', tr: 'Kaybedildi' }, value: 'lost' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'leadScore', label: { de: 'Lead-Score', tr: 'Talep puanı' }, type: 'number', admin: { readOnly: true, width: '50%' } },
        {
          name: 'leadTier',
          label: { de: 'Lead-Stufe', tr: 'Talep seviyesi' },
          type: 'select',
          admin: { readOnly: true, width: '50%' },
          options: [
            { label: { de: 'Heiß', tr: 'Sıcak' }, value: 'hot' },
            { label: { de: 'Warm', tr: 'Ilık' }, value: 'warm' },
            { label: { de: 'Kalt', tr: 'Soğuk' }, value: 'cold' },
          ],
        },
      ],
    },
    {
      name: 'locale',
      label: { de: 'Sprache der Anfrage', tr: 'Talebin dili' },
      type: 'select',
      admin: { readOnly: true, description: { de: 'Sprache, in der die Anfrage abgeschickt wurde.', tr: 'Talebin gönderildiği dil.' } },
      options: [...SITE_LOCALE_OPTIONS],
    },

    // --- Termin & Ort --------------------------------------------------------
    { name: 'eventDate', label: { de: 'Datum der Feier', tr: 'Etkinlik tarihi' }, type: 'text', required: true, index: true, validate: validateIsoDate },
    {
      name: 'eventType',
      label: { de: 'Art der Feier', tr: 'Etkinlik türü' },
      type: 'select',
      /**
       * Nicht mehr `required`: Das Dropdown ist aus dem öffentlichen Formular
       * entfernt worden, der Wert kommt nur noch aus dem WhatsApp-Flow oder aus
       * Anfragen von vor der Umstellung. Bliebe die Pflicht hier stehen, würde
       * jede neue Anfrage beim Speichern scheitern — die Mail ginge raus, der
       * Datensatz nicht.
       */
      options: [
        { label: { de: 'Hochzeit', tr: 'Düğün' }, value: 'wedding' },
        { label: { de: 'Verlobung / Nişan', tr: 'Nişan' }, value: 'engagement' },
        { label: { de: 'Henna-Abend / Kına', tr: 'Kına gecesi' }, value: 'henna' },
        { label: { de: 'After-Party', tr: 'After-party' }, value: 'afterparty' },
        { label: { de: 'Firmenevent', tr: 'Kurumsal etkinlik' }, value: 'corporate' },
        { label: { de: 'Geburtstag / Jubiläum', tr: 'Doğum günü / yıldönümü' }, value: 'birthday' },
        { label: { de: 'Sonstiges', tr: 'Diğer' }, value: 'other' },
      ],
    },
    { name: 'city', label: { de: 'Stadt', tr: 'Şehir' }, type: 'text', required: true },
    { name: 'venue', label: { de: 'Location', tr: 'Mekân' }, type: 'text' },

    // --- Details ---------------------------------------------------------------
    { name: 'guests', label: { de: 'Gäste', tr: 'Misafir sayısı' }, type: 'number', min: 1, max: 5000 },
    { name: 'startTime', label: { de: 'Beginn', tr: 'Başlangıç' }, type: 'text', validate: validateOptionalTime },
    { name: 'endTime', label: { de: 'Ende', tr: 'Bitiş' }, type: 'text', validate: validateOptionalTime },
    {
      name: 'package',
      label: { de: 'Paket', tr: 'Paket' },
      type: 'select',
      options: [
        { label: { de: 'Essential', tr: 'Essential' }, value: 'essential' },
        { label: { de: 'Signature', tr: 'Signature' }, value: 'signature' },
        { label: { de: 'Prestige', tr: 'Prestige' }, value: 'prestige' },
        { label: { de: 'Individuell / noch unsicher', tr: 'Özel / henüz belirsiz' }, value: 'custom' },
      ],
    },
    {
      name: 'budget',
      label: { de: 'Budget', tr: 'Bütçe' },
      type: 'select',
      options: [
        { label: { de: 'Noch unklar', tr: 'Henüz belirsiz' }, value: 'unsure' },
        { label: { de: 'bis 1.500 €', tr: "1.500 € altı" }, value: 'a' },
        { label: { de: '1.500 – 2.500 €', tr: '1.500 – 2.500 €' }, value: 'b' },
        { label: { de: '2.500 – 4.000 €', tr: '2.500 – 4.000 €' }, value: 'c' },
        { label: { de: 'über 4.000 €', tr: '4.000 € üzeri' }, value: 'd' },
      ],
    },
    {
      name: 'services',
      label: { de: 'Leistungen', tr: 'Hizmetler' },
      type: 'select',
      hasMany: true,
      options: [
        { label: { de: 'DJ & Musik', tr: 'DJ & müzik' }, value: 'dj' },
        { label: { de: 'Moderation', tr: 'Sunuculuk' }, value: 'hosting' },
        { label: { de: 'Live-Musik (Saz & Gitarre)', tr: 'Canlı müzik (saz & gitar)' }, value: 'liveMusic' },
        { label: { de: 'Ton-/Licht-/Veranstaltungstechnik', tr: 'Ses / ışık / etkinlik tekniği' }, value: 'avRental' },
      ],
    },
    {
      name: 'hostingLanguage',
      label: { de: 'Moderationssprache', tr: 'Sunum dili' },
      type: 'select',
      options: [
        { label: { de: 'Keine Präferenz', tr: 'Tercih yok' }, value: 'noPreference' },
        { label: { de: 'Deutsch', tr: 'Almanca' }, value: 'de' },
        { label: { de: 'Türkisch', tr: 'Türkçe' }, value: 'tr' },
        { label: { de: 'Englisch', tr: 'İngilizce' }, value: 'en' },
      ],
    },

    // --- Kontakt ----------------------------------------------------------------
    { name: 'firstName', label: { de: 'Vorname', tr: 'Ad' }, type: 'text', required: true },
    { name: 'lastName', label: { de: 'Nachname', tr: 'Soyad' }, type: 'text', required: true },
    { name: 'partnerName', label: { de: 'Name Partner:in', tr: 'Eş / partner adı' }, type: 'text' },
    { name: 'email', label: { de: 'E-Mail', tr: 'E-posta' }, type: 'email', required: true },
    { name: 'phone', label: { de: 'Telefon', tr: 'Telefon' }, type: 'text', required: true },
    { name: 'message', label: { de: 'Nachricht', tr: 'Mesaj' }, type: 'textarea' },
    {
      name: 'source',
      label: { de: 'Gefunden über', tr: 'Nereden buldu' },
      type: 'select',
      options: [
        { label: { de: 'Google-Suche', tr: 'Google araması' }, value: 'google' },
        { label: { de: 'Instagram', tr: 'Instagram' }, value: 'instagram' },
        { label: { de: 'Empfehlung', tr: 'Tavsiye' }, value: 'recommendation' },
        { label: { de: 'Location / Planerin', tr: 'Mekân / organizatör' }, value: 'venue' },
        { label: { de: 'ChatGPT / KI-Assistent', tr: 'ChatGPT / yapay zekâ' }, value: 'ai' },
        { label: { de: 'Sonstiges', tr: 'Diğer' }, value: 'other' },
      ],
    },
    { name: 'consent', label: { de: 'Einwilligung Datenschutz', tr: 'Gizlilik onayı' }, type: 'checkbox', required: true, defaultValue: false },
  ],
};
