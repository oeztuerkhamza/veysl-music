import type { CollectionConfig } from 'payload';
import { isAdmin } from '../access/is-admin';
import { bookingsAfterChange, bookingsAfterDelete } from '../hooks/sync-blocked-date';
import { validateIsoDate } from '../utils/iso-date';

/**
 * The owner's own confirmed events — created directly in the admin panel
 * (not by a public form). A `confirmed` booking blocks its date on the
 * public calendar via the hooks below; `cancelled` frees it again unless a
 * manual block also covers that day.
 *
 * `eventType` intentionally duplicates the option list in
 * `eventTypeValues` (src/lib/booking.ts) as plain literals instead of
 * importing it: `src/lib/booking.ts` -> `src/content/availability.ts` ->
 * `src/lib/payload.ts` -> `payload.config.ts` -> this file, so importing the
 * other direction would close a circular dependency. Keep both lists in
 * sync by hand if the enquiry funnel's event types ever change.
 */
export const Bookings: CollectionConfig = {
  slug: 'bookings',
  labels: {
    singular: { de: 'Buchung', tr: 'Rezervasyon' },
    plural: { de: 'Buchungen', tr: 'Rezervasyonlar' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['date', 'title', 'eventType', 'status'],
    description: { de: 'Vom DJ selbst angelegte, bestätigte Termine. Blockiert automatisch den Tag im öffentlichen Kalender.', tr: 'DJ tarafından girilen onaylı randevular. Herkese açık takvimde günü otomatik kapatır.' },
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [bookingsAfterChange],
    afterDelete: [bookingsAfterDelete],
  },
  fields: [
    {
      name: 'date', label: { de: 'Datum', tr: 'Tarih' },
      type: 'text',
      required: true,
      index: true,
      validate: validateIsoDate,
      admin: { description: { de: 'Format JJJJ-MM-TT, z. B. 2026-08-14.', tr: 'Biçim YYYY-AA-GG, örn. 2026-08-14.' } },
    },
    {
      name: 'title', label: { de: 'Interne Bezeichnung', tr: 'Dahili başlık' },
      type: 'text',
      required: true,
      admin: { description: { de: 'Interne Bezeichnung, z. B. "Hochzeit Familie Yıldız".', tr: 'Dahili başlık, örn. "Yıldız ailesi düğünü".' } },
    },
    {
      name: 'eventType', label: { de: 'Art der Feier', tr: 'Etkinlik türü' },
      type: 'select',
      required: true,
      defaultValue: 'wedding',
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
    { name: 'city', label: { de: 'Stadt', tr: 'Şehir' }, type: 'text' },
    { name: 'venue', label: { de: 'Location', tr: 'Mekân' }, type: 'text' },
    { name: 'customerName', label: { de: 'Kundenname', tr: 'Müşteri adı' }, type: 'text' },
    { name: 'notes', label: { de: 'Notizen', tr: 'Notlar' }, type: 'textarea' },
    {
      name: 'status', label: { de: 'Status', tr: 'Durum' },
      type: 'select',
      required: true,
      defaultValue: 'confirmed',
      options: [
        { label: { de: 'Bestätigt (blockiert den Tag)', tr: 'Onaylandı (günü kapatır)' }, value: 'confirmed' },
        { label: { de: 'Storniert (gibt den Tag wieder frei)', tr: 'İptal edildi (günü açar)' }, value: 'cancelled' },
      ],
    },
  ],
};
