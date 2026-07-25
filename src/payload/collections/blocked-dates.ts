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
  labels: { singular: 'Blockierter Tag', plural: 'Blockierte Tage' },
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
      name: 'date',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      validate: validateIsoDate,
      admin: { description: 'Format JJJJ-MM-TT, z. B. 2026-08-14. Ein Eintrag pro Kalendertag.' },
    },
    {
      name: 'reason',
      type: 'text',
      admin: { description: 'Nur intern sichtbar (z. B. Kundenname/Notiz) — erscheint nie auf der Website.' },
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'manual',
      options: [
        { label: 'Manuell geblockt', value: 'manual' },
        { label: 'Aus einer Buchung', value: 'booking' },
      ],
      admin: {
        description:
          '"Aus einer Buchung" wird automatisch gesetzt/entfernt, wenn eine Buchung in diesem Panel angelegt, storniert oder gelöscht wird — bitte nicht von Hand ändern.',
      },
    },
    {
      name: 'booking',
      type: 'relationship',
      relationTo: 'bookings',
      admin: {
        condition: (data) => data?.source === 'booking',
        description: 'Verknüpfte Buchung.',
      },
    },
  ],
};
