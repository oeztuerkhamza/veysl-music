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
  labels: { singular: 'Kundenstimme', plural: 'Kundenstimmen' },
  admin: {
    useAsTitle: 'authorName',
    defaultColumns: ['authorName', 'eventDate', 'rating', 'status'],
    description: 'Kundenstimmen für die Website. Nur "Veröffentlicht" ist öffentlich sichtbar.',
  },
  access: {
    read: readPublishedOrAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'authorName', type: 'text', required: true },
    {
      name: 'eventDate',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayOnly' }, description: 'Datum der Feier (optional).' },
    },
    { name: 'venue', type: 'text' },
    {
      name: 'quote',
      type: 'textarea',
      required: true,
      localized: true,
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      admin: { description: '1–5 Sterne, falls bekannt.' },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Entwurf', value: 'draft' },
        { label: 'Veröffentlicht', value: 'published' },
      ],
    },
  ],
};
