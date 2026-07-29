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
      name: 'permalink', label: { de: 'Link', tr: 'Bağlantı' },
      type: 'text',
      required: true,
      unique: true,
      validate: validateSocialPermalink,
      admin: { description: { de: 'Der eingefügte Instagram- oder YouTube-Link.', tr: 'Yapıştırılan Instagram veya YouTube bağlantısı.' } },
    },
    {
      name: 'platform', label: { de: 'Plattform', tr: 'Platform' },
      type: 'select',
      required: true,
      admin: {
        readOnly: true,
        description: { de: 'Wird automatisch aus dem Link erkannt — nicht manuell änderbar.', tr: 'Bağlantıdan otomatik algılanır — elle değiştirilemez.' },
      },
      options: [
        { label: { de: 'Instagram', tr: 'Instagram' }, value: 'instagram' },
        { label: { de: 'YouTube', tr: 'YouTube' }, value: 'youtube' },
      ],
    },
    {
      name: 'captionOverride', label: { de: 'Eigene Bildunterschrift', tr: 'Özel açıklama' },
      type: 'textarea',
      localized: true,
      admin: { description: { de: 'Optional — ersetzt die Original-Caption. Leer lassen, wenn keine Caption angezeigt werden soll.', tr: 'İsteğe bağlı — orijinal açıklamanın yerine geçer. Açıklama gösterilmesin isteniyorsa boş bırakın.' } },
    },
    {
      name: 'thumbnail', label: { de: 'Vorschaubild', tr: 'Önizleme görseli' },
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'YouTube: automatisch, kein Upload nötig — das Vorschaubild wird aus dem Link erzeugt. Instagram: ohne Meta-Zugangsdaten kann kein Bild automatisch geladen werden — bitte hier einen Screenshot/eine Kopie des Beitragsbilds hochladen, sonst erscheint nur ein Platzhalter.',
      },
    },
    {
      name: 'featured', label: { de: 'Hervorgehoben', tr: 'Öne çıkarılmış' },
      type: 'checkbox',
      defaultValue: false,
      admin: { description: { de: 'Wird zuerst angezeigt, plattformübergreifend.', tr: 'Platform fark etmeksizin en başta gösterilir.' } },
    },
    {
      name: 'sortOrder', label: { de: 'Reihenfolge', tr: 'Sıra' },
      type: 'number',
      admin: { description: { de: 'Manuelle Reihenfolge (aufsteigend) nach "Featured". Leer lassen für Sortierung nach Kuratierungsdatum.', tr: '"Öne çıkarılmış" sonrası elle sıra (artan). Küratörlük tarihine göre sıralama için boş bırakın.' } },
    },
    {
      name: 'status', label: { de: 'Status', tr: 'Durum' },
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: { de: 'Entwurf', tr: 'Taslak' }, value: 'draft' },
        { label: { de: 'Veröffentlicht', tr: 'Yayında' }, value: 'published' },
      ],
    },
    {
      name: 'placement', label: { de: 'Platzierung', tr: 'Yerleşim' },
      type: 'select',
      required: true,
      hasMany: true,
      defaultValue: ['home'],
      options: [
        { label: { de: 'Startseite', tr: 'Ana sayfa' }, value: 'home' },
        { label: { de: 'Galerie', tr: 'Galeri' }, value: 'gallery' },
        { label: { de: 'Kontaktseite', tr: 'İletişim sayfası' }, value: 'contact' },
      ],
      admin: { description: { de: 'Wo dieser Beitrag erscheinen soll. Werte müssen exakt zu SocialPlacement in src/lib/social/types.ts passen.', tr: 'Bu gönderinin nerede görüneceği. Değerler src/lib/social/types.ts içindeki SocialPlacement ile birebir aynı olmalı.' } },
    },
  ],
};
