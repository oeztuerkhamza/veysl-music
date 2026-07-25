import type { CollectionConfig } from 'payload';
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
  labels: { singular: 'Anfrage', plural: 'Anfragen' },
  defaultSort: '-createdAt',
  admin: {
    useAsTitle: 'eventDate',
    defaultColumns: ['eventDate', 'firstName', 'lastName', 'eventType', 'leadTier', 'status', 'createdAt'],
    description: 'Eingehende Anfragen aus dem öffentlichen Formular unter /anfrage — zum Sichten und Nachverfolgen.',
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
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'Neu', value: 'new' },
        { label: 'Kontaktiert', value: 'contacted' },
        { label: 'Gewonnen', value: 'won' },
        { label: 'Verloren', value: 'lost' },
      ],
    },
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
      name: 'locale',
      type: 'select',
      admin: { readOnly: true, description: 'Sprache, in der die Anfrage abgeschickt wurde.' },
      options: ['de', 'en', 'tr', 'ku', 'nl', 'fr', 'es'],
    },

    // --- Termin & Ort --------------------------------------------------------
    { name: 'eventDate', type: 'text', required: true, index: true, validate: validateIsoDate },
    {
      name: 'eventType',
      type: 'select',
      required: true,
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
    { name: 'city', type: 'text', required: true },
    { name: 'venue', type: 'text' },

    // --- Details ---------------------------------------------------------------
    { name: 'guests', type: 'number', min: 1, max: 5000 },
    { name: 'startTime', type: 'text', validate: validateOptionalTime },
    { name: 'endTime', type: 'text', validate: validateOptionalTime },
    {
      name: 'package',
      type: 'select',
      options: [
        { label: 'Essential', value: 'essential' },
        { label: 'Signature', value: 'signature' },
        { label: 'Prestige', value: 'prestige' },
        { label: 'Individuell / noch unsicher', value: 'custom' },
      ],
    },
    {
      name: 'budget',
      type: 'select',
      options: [
        { label: 'Noch unklar', value: 'unsure' },
        { label: 'bis 1.500 €', value: 'a' },
        { label: '1.500 – 2.500 €', value: 'b' },
        { label: '2.500 – 4.000 €', value: 'c' },
        { label: 'über 4.000 €', value: 'd' },
      ],
    },
    {
      name: 'services',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'DJ & Musik', value: 'dj' },
        { label: 'Moderation', value: 'hosting' },
        { label: 'Live-Musik (Saz & Gitarre)', value: 'liveMusic' },
        { label: 'Ton-/Licht-/Veranstaltungstechnik', value: 'avRental' },
      ],
    },
    {
      name: 'hostingLanguage',
      type: 'select',
      options: [
        { label: 'Keine Präferenz', value: 'noPreference' },
        { label: 'Deutsch', value: 'de' },
        { label: 'Türkisch', value: 'tr' },
        { label: 'Englisch', value: 'en' },
      ],
    },

    // --- Kontakt ----------------------------------------------------------------
    { name: 'firstName', type: 'text', required: true },
    { name: 'lastName', type: 'text', required: true },
    { name: 'partnerName', type: 'text' },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text', required: true },
    { name: 'message', type: 'textarea' },
    {
      name: 'source',
      type: 'select',
      options: [
        { label: 'Google-Suche', value: 'google' },
        { label: 'Instagram', value: 'instagram' },
        { label: 'Empfehlung', value: 'recommendation' },
        { label: 'Location / Planerin', value: 'venue' },
        { label: 'ChatGPT / KI-Assistent', value: 'ai' },
        { label: 'Sonstiges', value: 'other' },
      ],
    },
    { name: 'consent', type: 'checkbox', required: true, defaultValue: false },
  ],
};
