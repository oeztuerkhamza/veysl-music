import type { Access, CollectionConfig } from 'payload';
import { isAdmin } from '../access/is-admin';

/** Published testimonials are public; drafts stay admin-only. */
const readPublishedOrAdmin: Access = ({ req }) => {
  if (req.user) return true;
  return { status: { equals: 'published' } };
};

/**
 * Customer quotes, managed entirely from the admin. `status` defaults to
 * `draft` on purpose (explicit requirement): nothing goes live the moment
 * it's typed in — the owner has to deliberately flip it to "Veröffentlicht"
 * once a testimonial is confirmed usable, matching the project's
 * no-fabricated-social-proof rule (see BRAND-FACTS.md).
 *
 * Wiring published testimonials into public pages is out of this task's
 * ownership — see `blog-posts.ts` header for the same note.
 */
export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: {
    singular: { de: 'Kundenstimme', tr: 'Müşteri Yorumu' },
    plural: { de: 'Kundenstimmen', tr: 'Müşteri Yorumları' },
  },
  admin: {
    useAsTitle: 'authorName',
    defaultColumns: ['authorName', 'eventDate', 'rating', 'status'],
    description: { de: 'Kundenstimmen für die Website. Nur "Veröffentlicht" ist öffentlich sichtbar.', tr: 'Web sitesi için müşteri yorumları. Yalnızca "Yayında" olanlar herkese görünür.' },
  },
  access: {
    read: readPublishedOrAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'authorName', type: 'text', required: true, label: { de: 'Name', tr: 'Ad' } },
    {
      name: 'eventDate',
      type: 'date',
      label: { de: 'Datum der Feier', tr: 'Etkinlik tarihi' },
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        description: { de: 'Datum der Feier (optional).', tr: 'Etkinliğin tarihi (isteğe bağlı).' },
      },
    },
    { name: 'venue', type: 'text', label: { de: 'Location', tr: 'Mekân' } },
    {
      name: 'quote',
      type: 'textarea',
      required: true,
      localized: true,
      label: { de: 'Zitat', tr: 'Yorum metni' },
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      label: { de: 'Bewertung', tr: 'Puan' },
      admin: {
        // Not decoration: this is the ONLY rating that may feed schema.org
        // `aggregateRating` (src/lib/testimonials.ts). Filling it in is what
        // eventually puts stars next to the site in Google's results —
        // Google's own reviews are barred from doing that.
        description: {
          de: '1–5 Sterne, falls bekannt. Ab drei bewerteten Stimmen erscheint die Sterne-Auszeichnung in Google.',
          tr: '1–5 yıldız, biliniyorsa. Puanlı üç yorumdan itibaren Google’da yıldız işaretlemesi görünür.',
        },
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: { de: 'Bild', tr: 'Görsel' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      label: { de: 'Status', tr: 'Durum' },
      options: [
        { label: { de: 'Entwurf', tr: 'Taslak' }, value: 'draft' },
        { label: { de: 'Veröffentlicht', tr: 'Yayında' }, value: 'published' },
      ],
    },
  ],
};
