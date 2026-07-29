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
  labels: {
    singular: { de: 'Kontaktnachricht', tr: 'İletişim Mesajı' },
    plural: { de: 'Kontaktnachrichten', tr: 'İletişim Mesajları' },
  },
  defaultSort: '-createdAt',
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['createdAt', 'firstName', 'lastName', 'subject', 'status'],
    description: { de: 'Eingehende Nachrichten aus dem allgemeinen Kontaktformular unter /kontakt (kein Buchungsdatum).', tr: '/kontakt sayfasındaki genel iletişim formundan gelen mesajlar (rezervasyon tarihi içermez).' },
  },
  access: {
    read: isAdmin,
    create: denyAll,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'status', label: { de: 'Status', tr: 'Durum' },
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: { de: 'Neu', tr: 'Yeni' }, value: 'new' },
        { label: { de: 'Gelesen', tr: 'Okundu' }, value: 'read' },
        { label: { de: 'Beantwortet', tr: 'Yanıtlandı' }, value: 'answered' },
        { label: { de: 'Archiviert', tr: 'Arşivlendi' }, value: 'archived' },
      ],
    },
    {
      name: 'locale', label: { de: 'Sprache der Nachricht', tr: 'Mesajın dili' },
      type: 'select',
      admin: { readOnly: true, description: { de: 'Sprache der Website beim Absenden — in dieser Sprache antworten.', tr: 'Gönderim anındaki site dili — bu dilde yanıtlayın.' } },
      options: ['de', 'en', 'tr', 'ku', 'nl', 'fr', 'es'],
    },
    {
      name: 'subject', label: { de: 'Betreff', tr: 'Konu' },
      type: 'select',
      required: true,
      options: [
        { label: { de: 'Allgemeine Frage', tr: 'Genel soru' }, value: 'general' },
        { label: { de: 'Frage zu einer Buchung', tr: 'Rezervasyon sorusu' }, value: 'booking' },
        { label: { de: 'Technik / Verleih', tr: 'Teknik / kiralama' }, value: 'technical' },
        { label: { de: 'Location- / Planer-Partnerschaft', tr: 'Mekân / organizatör iş birliği' }, value: 'partnership' },
        { label: { de: 'Presse', tr: 'Basın' }, value: 'press' },
        { label: { de: 'Sonstiges', tr: 'Diğer' }, value: 'other' },
      ],
    },
    { name: 'firstName', label: { de: 'Vorname', tr: 'Ad' }, type: 'text', required: true },
    { name: 'lastName', label: { de: 'Nachname', tr: 'Soyad' }, type: 'text', required: true },
    { name: 'email', label: { de: 'E-Mail', tr: 'E-posta' }, type: 'email', required: true },
    { name: 'phone', label: { de: 'Telefon', tr: 'Telefon' }, type: 'text' },
    { name: 'company', label: { de: 'Firma / Location', tr: 'Firma / mekân' }, type: 'text', admin: { description: { de: 'Firma / Location-Name, falls angegeben.', tr: 'Firma / mekân adı, belirtilmişse.' } } },
    {
      name: 'preferredContact', label: { de: 'Bevorzugter Kontaktweg', tr: 'Tercih edilen iletişim' },
      type: 'select',
      options: [
        { label: { de: 'E-Mail', tr: 'E-posta' }, value: 'email' },
        { label: { de: 'Telefon', tr: 'Telefon' }, value: 'phone' },
        { label: { de: 'WhatsApp', tr: 'WhatsApp' }, value: 'whatsapp' },
      ],
    },
    {
      name: 'eventDate', label: { de: 'Datum der Feier', tr: 'Etkinlik tarihi' },
      type: 'text',
      validate: (value: unknown) => (value ? validateIsoDate(value) : true),
      admin: { description: { de: 'Format JJJJ-MM-TT, falls schon ein Datum feststeht (optional).', tr: 'Biçim YYYY-AA-GG, tarih belliyse (isteğe bağlı).' } },
    },
    { name: 'message', label: { de: 'Nachricht', tr: 'Mesaj' }, type: 'textarea', required: true },
  ],
};
