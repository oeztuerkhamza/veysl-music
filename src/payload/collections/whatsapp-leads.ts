import type { CollectionConfig } from 'payload';
import { SITE_LOCALE_OPTIONS } from '../site-locales';
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
        { name: 'leadScore', label: { de: 'Lead-Score', tr: 'Talep puanı' }, type: 'number', admin: { readOnly: true, width: '50%' } },
        {
          name: 'leadTier', label: { de: 'Lead-Stufe', tr: 'Talep seviyesi' },
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
      name: 'source', label: { de: 'Einstiegspunkt', tr: 'Giriş noktası' },
      type: 'select',
      required: true,
      options: [
        { label: { de: 'WhatsApp-Button (fix, unten rechts)', tr: 'WhatsApp düğmesi (sabit, sağ alt)' }, value: 'fab' },
        { label: { de: 'Mobile Sticky-Leiste', tr: 'Mobil sabit şerit' }, value: 'stickyCta' },
        { label: { de: 'Kontaktseite', tr: 'İletişim sayfası' }, value: 'contactPage' },
        { label: { de: 'Erfolgsseite nach Anfrage', tr: 'Talep sonrası teşekkür sayfası' }, value: 'bookingSuccess' },
      ],
    },
    {
      name: 'locale', label: { de: 'Sprache', tr: 'Dil' },
      type: 'select',
      admin: { readOnly: true },
      options: [...SITE_LOCALE_OPTIONS],
    },
    {
      name: 'eventType', label: { de: 'Art der Feier', tr: 'Etkinlik türü' },
      type: 'select',
      options: [
        { label: { de: 'Hochzeit', tr: 'Düğün' }, value: 'wedding' },
        { label: { de: 'Verlobung / Nişan', tr: 'Nişan' }, value: 'engagement' },
        { label: { de: 'Henna-Abend / Kına', tr: 'Kına gecesi' }, value: 'henna' },
        { label: { de: 'Firmenevent', tr: 'Kurumsal etkinlik' }, value: 'corporate' },
        { label: { de: 'Sonstiges', tr: 'Diğer' }, value: 'other' },
      ],
    },
    {
      name: 'eventDate', label: { de: 'Datum der Feier', tr: 'Etkinlik tarihi' },
      type: 'text',
      validate: (value: unknown) => (value ? validateIsoDate(value) : true),
      admin: { description: { de: 'Format JJJJ-MM-TT.', tr: 'Biçim YYYY-AA-GG.' } },
    },
    { name: 'city', label: { de: 'Stadt', tr: 'Şehir' }, type: 'text' },
    {
      name: 'guestsRange', label: { de: 'Gästezahl', tr: 'Misafir sayısı' },
      type: 'select',
      options: [
        { label: { de: 'bis 80', tr: '80’e kadar' }, value: 'under80' },
        { label: { de: '80–150', tr: '80–150' }, value: 'from80to150' },
        { label: { de: '150–250', tr: '150–250' }, value: 'from150to250' },
        { label: { de: '250+', tr: '250+' }, value: 'over250' },
      ],
    },
    {
      name: 'service', label: { de: 'Leistung', tr: 'Hizmet' },
      type: 'select',
      options: [
        { label: { de: 'DJ', tr: 'DJ' }, value: 'dj' },
        { label: { de: 'DJ & Orkestra', tr: 'DJ & orkestra' }, value: 'djOrchestra' },
        { label: { de: '+ Moderation', tr: '+ Sunuculuk' }, value: 'hosting' },
        { label: { de: '+ Technik', tr: '+ Teknik' }, value: 'technik' },
      ],
    },
  ],
};
