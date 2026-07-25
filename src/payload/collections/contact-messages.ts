import type { CollectionConfig } from 'payload';
import { denyAll, isAdmin } from '../access/is-admin';
import { validateIsoDate } from '../utils/iso-date';

/**
 * Submissions from the general `/kontakt` form — deliberately a separate
 * collection from `enquiries` (the `/anfrage` booking funnel): different
 * shape, different triage, different intent (partnerships, press, AV
 * rental questions, a quick question before someone is ready to book a
 * date). Mixing the two would make the owner's inbox useless.
 *
 * Same `create: denyAll` pattern as `enquiries.ts`: the only way in is the
 * trusted server-side Local API call from `/api/kontakt`, which runs with
 * Payload's default `overrideAccess: true`.
 */
export const ContactMessages: CollectionConfig = {
  slug: 'contact-messages',
  labels: { singular: 'Kontaktnachricht', plural: 'Kontaktnachrichten' },
  defaultSort: '-createdAt',
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['createdAt', 'firstName', 'lastName', 'subject', 'status'],
    description: 'Eingehende Nachrichten aus dem allgemeinen Kontaktformular unter /kontakt (kein Buchungsdatum).',
  },
  access: {
    read: isAdmin,
    create: denyAll,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'Neu', value: 'new' },
        { label: 'Gelesen', value: 'read' },
        { label: 'Beantwortet', value: 'answered' },
        { label: 'Archiviert', value: 'archived' },
      ],
    },
    {
      name: 'locale',
      type: 'select',
      admin: { readOnly: true, description: 'Sprache der Website beim Absenden — in dieser Sprache antworten.' },
      options: ['de', 'en', 'tr', 'ku', 'nl', 'fr', 'es'],
    },
    {
      name: 'subject',
      type: 'select',
      required: true,
      options: [
        { label: 'Allgemeine Frage', value: 'general' },
        { label: 'Frage zu einer Buchung', value: 'booking' },
        { label: 'Technik / Verleih', value: 'technical' },
        { label: 'Location- / Planer-Partnerschaft', value: 'partnership' },
        { label: 'Presse', value: 'press' },
        { label: 'Sonstiges', value: 'other' },
      ],
    },
    { name: 'firstName', type: 'text', required: true },
    { name: 'lastName', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text' },
    { name: 'company', type: 'text', admin: { description: 'Firma / Location-Name, falls angegeben.' } },
    {
      name: 'preferredContact',
      type: 'select',
      options: [
        { label: 'E-Mail', value: 'email' },
        { label: 'Telefon', value: 'phone' },
        { label: 'WhatsApp', value: 'whatsapp' },
      ],
    },
    {
      name: 'eventDate',
      type: 'text',
      validate: (value: unknown) => (value ? validateIsoDate(value) : true),
      admin: { description: 'Format JJJJ-MM-TT, falls schon ein Datum feststeht (optional).' },
    },
    { name: 'message', type: 'textarea', required: true },
  ],
};
