import type { CollectionConfig } from 'payload';
import { isAdmin } from '../access/is-admin';
import { validateIsoDate } from '../utils/iso-date';

/**
 * The single source of truth for the public availability calendar
 * (`src/components/booking/availability-calendar.tsx`, `/api/availability*`).
 *
 * `date` is stored as a plain validated `YYYY-MM-DD` string rather than
 * Payload's `date` field type on purpose: the rest of the app (`src/lib/
 * booking.ts`) compares dates as ISO strings throughout, and a real `date`
 * field stores a timestamp that can shift by a day depending on which
 * timezone reads it back. A text field keeps "one row = one calendar day"
 * unambiguous everywhere, including in SQLite/Postgres alike.
 *
 * Not exposed on Payload's own public REST API (`access.read` requires an
 * admin session) — the public calendar is served by this app's own
 * rate-limited `/api/availability` routes, which read this collection
 * through the trusted server-side Local API instead.
 */
export const BlockedDates: CollectionConfig = {
  slug: 'blocked-dates',
  labels: {
    singular: { de: 'Blockierter Tag', tr: 'Kapalı Gün' },
    plural: { de: 'Blockierte Tage', tr: 'Kapalı Günler' },
  },
  admin: {
    useAsTitle: 'date',
    defaultColumns: ['date', 'source', 'reason'],
    description:
      'Tage, die im öffentlichen Verfügbarkeitskalender als belegt angezeigt werden. Eine leere Liste bedeutet "unbekannt", nicht "alles frei" — siehe src/content/availability.ts.',
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'date', label: { de: 'Datum', tr: 'Tarih' },
      type: 'text',
      required: true,
      unique: true,
      index: true,
      validate: validateIsoDate,
      admin: { description: { de: 'Format JJJJ-MM-TT, z. B. 2026-08-14. Ein Eintrag pro Kalendertag.', tr: 'Biçim YYYY-AA-GG, örn. 2026-08-14. Takvim günü başına bir kayıt.' } },
    },
    {
      name: 'reason', label: { de: 'Grund (intern)', tr: 'Sebep (dahili)' },
      type: 'text',
      admin: { description: { de: 'Nur intern sichtbar (z. B. Kundenname/Notiz) — erscheint nie auf der Website.', tr: 'Yalnızca dahili (örn. müşteri adı/not) — web sitesinde asla görünmez.' } },
    },
    {
      name: 'source', label: { de: 'Herkunft', tr: 'Kaynak' },
      type: 'select',
      required: true,
      defaultValue: 'manual',
      options: [
        { label: { de: 'Manuell geblockt', tr: 'Elle kapatıldı' }, value: 'manual' },
        { label: { de: 'Aus einer Buchung', tr: 'Rezervasyondan' }, value: 'booking' },
      ],
      admin: {
        description:
          '"Aus einer Buchung" wird automatisch gesetzt/entfernt, wenn eine Buchung in diesem Panel angelegt, storniert oder gelöscht wird — bitte nicht von Hand ändern.',
      },
    },
    {
      name: 'booking', label: { de: 'Buchung', tr: 'Rezervasyon' },
      type: 'relationship',
      relationTo: 'bookings',
      admin: {
        condition: (data) => data?.source === 'booking',
        description: { de: 'Verknüpfte Buchung.', tr: 'Bağlı rezervasyon.' },
      },
    },
  ],
};
