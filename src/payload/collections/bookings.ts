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
  labels: { singular: 'Buchung', plural: 'Buchungen' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['date', 'title', 'eventType', 'status'],
    description: 'Vom DJ selbst angelegte, bestätigte Termine. Blockiert automatisch den Tag im öffentlichen Kalender.',
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
      name: 'date',
      type: 'text',
      required: true,
      index: true,
      validate: validateIsoDate,
      admin: { description: 'Format JJJJ-MM-TT, z. B. 2026-08-14.' },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'Interne Bezeichnung, z. B. "Hochzeit Familie Yıldız".' },
    },
    {
      name: 'eventType',
      type: 'select',
      required: true,
      defaultValue: 'wedding',
      options: [
        { label: 'Hochzeit', value: 'wedding' },
        { label: 'Verlobung / Nişan', value: 'engagement' },
        { label: 'Henna-Abend / Kına', value: 'henna' },
        { label: 'After-Party', value: 'afterparty' },
        { label: 'Firmenevent', value: 'corporate' },
        { label: 'Geburtstag / Jubiläum', value: 'birthday' },
        { label: 'Sonstiges', value: 'other' },
      ],
    },
    { name: 'city', type: 'text' },
    { name: 'venue', type: 'text' },
    { name: 'customerName', type: 'text' },
    { name: 'notes', type: 'textarea' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'confirmed',
      options: [
        { label: 'Bestätigt (blockiert den Tag)', value: 'confirmed' },
        { label: 'Storniert (gibt den Tag wieder frei)', value: 'cancelled' },
      ],
    },
  ],
};
