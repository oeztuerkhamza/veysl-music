import path from 'node:path';
import type { CollectionConfig } from 'payload';
import { isAdmin } from '../access/is-admin';
import { revalidateAfterChange, revalidateAfterDelete } from '../revalidate';

/**
 * Upload library backing blog covers, testimonial photos and every named
 * slot in the `site-images` global. Publicly readable — files are rendered
 * in `<img>`/`next/image` across the public site and in OG tags, so the
 * *files* have to be reachable without a session; only who may upload/edit
 * is gated.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: { de: 'Medium', tr: 'Medya' },
    plural: { de: 'Medien', tr: 'Medya' },
  },
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
    description: { de: 'Bild-Uploads für Blog, Testimonials und die austauschbaren Bild-Slots der Website (SiteImages).', tr: 'Blog, müşteri yorumları ve web sitesinin değiştirilebilir görsel alanları (SiteImages) için görsel yüklemeleri.' },
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  // Auch hier, nicht nur auf `site-images`: Wird ein bereits zugewiesenes Bild
  // ersetzt oder sein Alt-Text korrigiert, ändert sich der Slot-Datensatz
  // nicht — nur das Medium. Ohne diesen Hook bliebe die Seite auf dem alten
  // Stand, obwohl im Admin sichtbar das neue Bild steht.
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  upload: {
    staticDir: path.resolve(process.cwd(), 'media'),
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 900, height: 600, position: 'centre' },
      { name: 'hero', width: 2400, height: 1350, position: 'centre' },
    ],
    formatOptions: { format: 'webp', options: { quality: 82 } },
    /**
     * Obergrenze für die gespeicherte Originaldatei.
     *
     * Bis hierher gab es keine: `formatOptions` wandelte zwar jeden Upload in
     * WebP, ließ die Auflösung aber unangetastet. Ein Foto direkt vom Handy
     * kommt mit 4000 px und mehr — und genau so lag es dann auf der Platte,
     * obwohl die größte Variante dieser Seite (`hero`) 2400 px breit ist.
     *
     * Das kostet an drei Stellen: Plattenplatz im `veysl-media`-Volume, CPU
     * beim Optimierer (der das Vollbild für *jede* neue Breiten-/Format-
     * Kombination erneut dekodiert) — und im Fehlerfall die Bandbreite der
     * Besucherin, denn wenn `next/image` ausfällt, ist die Originaldatei das,
     * was der Browser bekommt. Wie knapp dieser Fall ist, hat sich gerade
     * gezeigt: Der Optimierer antwortete wochenlang mit 400.
     *
     * 2560 px lässt der 2400er-Variante Luft und nimmt jedem realistischen
     * Upload den Rest. `withoutEnlargement` verhindert, dass ein kleineres
     * Bild künstlich hochskaliert (und damit größer) wird; `fit: 'inside'`
     * behält das Seitenverhältnis — beschnitten wird erst in den `imageSizes`.
     */
    resizeOptions: { width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true },
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
      name: 'alt', label: { de: 'Alt-Text', tr: 'Alt metin' },
      type: 'text',
      required: true,
      localized: true,
      admin: { description: { de: 'Pflichtfeld — Alt-Text für Barrierefreiheit und SEO. Pro Sprache pflegbar.', tr: 'Zorunlu alan — erişilebilirlik ve SEO için alt metin. Her dil için ayrı girilebilir.' } },
    },
    {
      name: 'caption', label: { de: 'Bildunterschrift', tr: 'Görsel açıklaması' },
      type: 'text',
      localized: true,
      admin: { description: { de: 'Optionale Bildunterschrift (z. B. für Blog/Testimonials).', tr: 'İsteğe bağlı görsel açıklaması (örn. blog/yorumlar için).' } },
    },
  ],
};
