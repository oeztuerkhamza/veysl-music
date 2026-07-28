import type { CollectionConfig } from 'payload';
import { denyAll, isAdmin } from '../access/is-admin';
import { validateIsoDate } from '../utils/iso-date';

/**
 * Fire-and-forget captures from the WhatsApp pre-qualification modal
 * (`src/components/whatsapp/whatsapp-prequalify-modal.tsx`) — posted right
 * before the visitor is redirected to `wa.me`, so the DJ still gets the
 * date/city/guest-count even for the (likely majority of) visitors who tap
 * through but never actually send the WhatsApp message.
 *
 * Deliberately separate from `enquiries` and `contact-messages`: no name,
 * email or phone is collected here at all (WhatsApp itself supplies the
 * contact channel) — see the privacy note in the modal. Same
 * `create: denyAll` pattern as those two collections: only the trusted
 * server-side Local API call from `/api/whatsapp-lead` may create a row.
 */
export const WhatsappLeads: CollectionConfig = {
  slug: 'whatsapp-leads',
  labels: {
    singular: { de: 'WhatsApp-Lead', tr: 'WhatsApp Talebi' },
    plural: { de: 'WhatsApp-Leads', tr: 'WhatsApp Talepleri' },
  },
  defaultSort: '-createdAt',
  admin: {
    useAsTitle: 'eventDate',
    defaultColumns: ['createdAt', 'eventType', 'eventDate', 'city', 'guestsRange', 'source', 'leadTier'],
    description:
      'Angaben aus dem WhatsApp-Vorqualifizierungs-Dialog, bevor zu wa.me weitergeleitet wird. Kein Name/E-Mail/Telefon — WhatsApp liefert den Kontaktweg selbst.',
  },
  access: {
    read: isAdmin,
    create: denyAll,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'leadScore', type: 'number', admin: { readOnly: true, width: '50%' } },
        {
          name: 'leadTier',
          type: 'select',
          admin: { readOnly: true, width: '50%' },
          options: [
            { label: 'Heiß', value: 'hot' },
            { label: 'Warm', value: 'warm' },
            { label: 'Kalt', value: 'cold' },
          ],
        },
      ],
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      options: [
        { label: 'WhatsApp-Button (fix, unten rechts)', value: 'fab' },
        { label: 'Mobile Sticky-Leiste', value: 'stickyCta' },
        { label: 'Kontaktseite', value: 'contactPage' },
        { label: 'Erfolgsseite nach Anfrage', value: 'bookingSuccess' },
      ],
    },
    {
      name: 'locale',
      type: 'select',
      admin: { readOnly: true },
      options: ['de', 'en', 'tr', 'ku', 'nl', 'fr', 'es'],
    },
    {
      name: 'eventType',
      type: 'select',
      options: [
        { label: 'Hochzeit', value: 'wedding' },
        { label: 'Verlobung / Nişan', value: 'engagement' },
        { label: 'Henna-Abend / Kına', value: 'henna' },
        { label: 'Firmenevent', value: 'corporate' },
        { label: 'Sonstiges', value: 'other' },
      ],
    },
    {
      name: 'eventDate',
      type: 'text',
      validate: (value: unknown) => (value ? validateIsoDate(value) : true),
      admin: { description: 'Format JJJJ-MM-TT.' },
    },
    { name: 'city', type: 'text' },
    {
      name: 'guestsRange',
      type: 'select',
      options: [
        { label: 'bis 80', value: 'under80' },
        { label: '80–150', value: 'from80to150' },
        { label: '150–250', value: 'from150to250' },
        { label: '250+', value: 'over250' },
      ],
    },
    {
      name: 'service',
      type: 'select',
      options: [
        { label: 'DJ', value: 'dj' },
        { label: 'DJ & Orkestra', value: 'djOrchestra' },
        { label: '+ Moderation', value: 'hosting' },
        { label: '+ Technik', value: 'technik' },
      ],
    },
  ],
};
