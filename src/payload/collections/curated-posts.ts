import type { CollectionConfig } from 'payload';
import { parseSocialPermalink, validateSocialPermalink } from '@/lib/social/permalink';
import { isAdmin } from '../access/is-admin';

/**
 * Hand-picked Instagram/YouTube posts for the public site — read by
 * `CmsProvider` (`src/lib/social/cms-provider.ts`, owned by the social-feed
 * agent) via the Local API. Exact field contract from
 * `docs/SOCIAL-FEED.md` §9 — do not rename `platform`/`placement` values,
 * `CmsProvider` and `SocialPlacement` (`src/lib/social/types.ts`) depend on
 * them matching exactly.
 *
 * `platform` is never hand-picked: it's derived from `permalink` in the
 * `beforeValidate` hook below, using the social-feed agent's own
 * `parseSocialPermalink` — reused rather than re-implemented so validation
 * and parsing can never drift apart (per their explicit request).
 */
export const CuratedPosts: CollectionConfig = {
  slug: 'curated-posts',
  labels: {
    singular: { de: 'Kuratierter Social-Beitrag', tr: 'Seçilmiş Sosyal Medya Gönderisi' },
    plural: { de: 'Kuratierte Social-Beiträge', tr: 'Seçilmiş Sosyal Medya Gönderileri' },
  },
  admin: {
    useAsTitle: 'permalink',
    defaultColumns: ['platform', 'placement', 'status', 'featured', 'sortOrder', 'updatedAt'],
    description:
      'Handverlesene Instagram-/YouTube-Beiträge für die Website. Link einfügen — Plattform und (bei YouTube) Vorschaubild werden automatisch erkannt.',
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.permalink) {
          const parsed = parseSocialPermalink(data.permalink);
          if (parsed) data.platform = parsed.platform;
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: 'permalink',
      type: 'text',
      required: true,
      unique: true,
      validate: validateSocialPermalink,
      admin: { description: 'Der eingefügte Instagram- oder YouTube-Link.' },
    },
    {
      name: 'platform',
      type: 'select',
      required: true,
      admin: {
        readOnly: true,
        description: 'Wird automatisch aus dem Link erkannt — nicht manuell änderbar.',
      },
      options: [
        { label: 'Instagram', value: 'instagram' },
        { label: 'YouTube', value: 'youtube' },
      ],
    },
    {
      name: 'captionOverride',
      type: 'textarea',
      localized: true,
      admin: { description: 'Optional — ersetzt die Original-Caption. Leer lassen, wenn keine Caption angezeigt werden soll.' },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'YouTube: automatisch, kein Upload nötig — das Vorschaubild wird aus dem Link erzeugt. Instagram: ohne Meta-Zugangsdaten kann kein Bild automatisch geladen werden — bitte hier einen Screenshot/eine Kopie des Beitragsbilds hochladen, sonst erscheint nur ein Platzhalter.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Wird zuerst angezeigt, plattformübergreifend.' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      admin: { description: 'Manuelle Reihenfolge (aufsteigend) nach "Featured". Leer lassen für Sortierung nach Kuratierungsdatum.' },
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
    {
      name: 'placement',
      type: 'select',
      required: true,
      hasMany: true,
      defaultValue: ['home'],
      options: [
        { label: 'Startseite', value: 'home' },
        { label: 'Galerie', value: 'gallery' },
        { label: 'Kontaktseite', value: 'contact' },
      ],
      admin: { description: 'Wo dieser Beitrag erscheinen soll. Werte müssen exakt zu SocialPlacement in src/lib/social/types.ts passen.' },
    },
  ],
};
