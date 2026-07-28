import type { Access, CollectionConfig } from 'payload';
import { isAdmin } from '../access/is-admin';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Published posts are public; drafts are only visible to a logged-in admin (e.g. previewing before publish). */
const readPublishedOrAdmin: Access = ({ req }) => {
  if (req.user) return true;
  return { status: { equals: 'published' } };
};

/**
 * Blog ("Ratgeber") content, managed entirely from the admin. `title`,
 * `excerpt`, `body`, `tags` and `slug` are localized per
 * `localization.locales` in `payload.config.ts` — every one of the six site
 * languages gets its own text and its own SEO-friendly URL segment, matching
 * how `src/i18n/routing.ts` gives every other route a localized slug.
 *
 * Wiring these into the actual `/ratgeber` pages is outside this task's
 * ownership (`src/app/[locale]/*`, `src/content/*` outside `booking.ts`/
 * `availability.ts` belong to the pages/home agents per CONTRACT.md) — see
 * the final report for the read endpoints this collection exposes.
 */
export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  labels: {
    singular: { de: 'Blogartikel', tr: 'Blog Yazısı' },
    plural: { de: 'Blogartikel', tr: 'Blog Yazıları' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'publishedAt', 'updatedAt'],
    description: 'Artikel für /ratgeber ("Guide"). Nur "Veröffentlicht" ist öffentlich sichtbar.',
  },
  access: {
    read: readPublishedOrAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  versions: { drafts: false }, // status field below already models draft/published explicitly
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      localized: true,
      unique: true,
      index: true,
      validate: (value: unknown) => {
        if (typeof value !== 'string' || !slugPattern.test(value)) {
          return 'Nur Kleinbuchstaben, Ziffern und Bindestriche, z. B. "hochzeits-dj-checkliste".';
        }
        return true;
      },
      admin: { description: 'URL-Segment, pro Sprache eigen — z. B. "hochzeits-dj-checkliste" / "wedding-dj-checklist".' },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      admin: { description: 'Kurzfassung für Teaser-Karten und Meta-Description.' },
    },
    {
      name: 'body',
      type: 'richText',
      localized: true,
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      localized: true,
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayOnly' }, description: 'Anzeigedatum — kann in die Zukunft gelegt werden.' },
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
