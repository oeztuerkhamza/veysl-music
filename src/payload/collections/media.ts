import path from 'node:path';
import type { CollectionConfig } from 'payload';
import { isAdmin } from '../access/is-admin';

/**
 * Upload library backing blog covers, testimonial photos and every named
 * slot in the `site-images` global. Publicly readable — files are rendered
 * in `<img>`/`next/image` across the public site and in OG tags, so the
 * *files* have to be reachable without a session; only who may upload/edit
 * is gated.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Medium', plural: 'Medien' },
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
    description: 'Bild-Uploads für Blog, Testimonials und die austauschbaren Bild-Slots der Website (SiteImages).',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  upload: {
    staticDir: path.resolve(process.cwd(), 'media'),
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 900, height: 600, position: 'centre' },
      { name: 'hero', width: 2400, height: 1350, position: 'centre' },
    ],
    formatOptions: { format: 'webp', options: { quality: 82 } },
    // Explicit raster allowlist, not 'image/*'. That wildcard admits
    // image/svg+xml, which Payload serves same-origin from
    // /api/media/file/<name> with no CSP in front of it. Payload does screen
    // SVGs, but with a regex denylist that misses entity-encoded payloads.
    // Nothing here uploads SVG — every imageSize below is raster — so the
    // whole class goes away for the cost of naming four types.
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Pflichtfeld — Alt-Text für Barrierefreiheit und SEO. Pro Sprache pflegbar.' },
    },
    {
      name: 'caption',
      type: 'text',
      localized: true,
      admin: { description: 'Optionale Bildunterschrift (z. B. für Blog/Testimonials).' },
    },
  ],
};
