import type { CollectionConfig } from 'payload';
import { isAdmin } from '../access/is-admin';

/**
 * Mirrors the *base* (non-dynamic-instance) keys in the image-slot agent's
 * registry, `src/content/site-images.ts` — duplicated as plain literals
 * rather than imported, for the same reason `bookings.ts`/`enquiries.ts`
 * duplicate `eventTypeValues` instead of importing `@/lib/booking`: this
 * collection's own `key` field is what `resolveSlot()` in that file queries
 * (`payload.find({ collection: 'site-images', where: { key equals ... } })`),
 * so importing the registry here would close a circular dependency between
 * this collection and the file that resolves against it.
 *
 * Keep this list, and the shot list itself, in sync by hand — the full
 * photographer's brief per slot lives in `docs/IMAGE-SLOTS.md`
 * (client-facing) / `src/content/site-images.ts` (`purpose`/`altHint`), not
 * duplicated into the admin UI here.
 */
interface StaticSlotEntry {
  key: string;
  label: string;
  dynamic?: boolean;
}

const STATIC_SLOTS: StaticSlotEntry[] = [
  { key: 'home.hero.background', label: 'Hero-Hintergrund (Startseite)' },
  { key: 'home.showreel.poster', label: 'Vorschaubild Aftermovie (Startseite)' },
  { key: 'weddings.hero.atmosphere', label: 'Atmosphäre „Echte Hochzeiten"' },
  { key: 'gallery.hero.atmosphere', label: 'Atmosphäre Galerie' },
  { key: 'epk.portrait', label: 'Professionelles Porträt (EPK)' },
  { key: 'musik.hero.performance', label: 'Live-Performance (Musik)' },
  { key: 'home.intro.portrait', label: 'Porträt bei der Arbeit (Startseite)' },
  { key: 'services.wedding.image', label: 'Service-Block: Hochzeit' },
  { key: 'services.engagement.image', label: 'Service-Block: Verlobung' },
  { key: 'services.afterparty.image', label: 'Service-Block: Afterparty' },
  { key: 'services.corporate.image', label: 'Service-Block: Firmenfeier' },
  { key: 'packages.signature.image', label: 'Paket-Bild: Signature' },
  { key: 'epk.pressPhoto.performance', label: 'Pressefoto: Live-Performance' },
  { key: 'epk.pressPhoto.hosting', label: 'Pressefoto: Moderation' },
  { key: 'kontakt.portrait', label: 'Porträt/Vertrauensbild (Kontakt)' },
  { key: 'home.testimonials.avatar', label: 'Testimonial-Porträt', dynamic: true },
  { key: 'packages.essential.image', label: 'Paket-Bild: Essential' },
  { key: 'packages.prestige.image', label: 'Paket-Bild: Prestige' },
  { key: 'epk.personalStory', label: 'Persönliche Geschichte (EPK) — bereits erfüllt' },
  { key: 'epk.setupDetail', label: 'Setup/Soundcheck (EPK) — bereits erfüllt' },
  { key: 'ablauf.process.image', label: 'Vorgespräch/Soundcheck (Ablauf)' },
  { key: 'og.default', label: 'Standard-Vorschaubild (OG/Social)' },
  { key: 'city.header.background', label: 'Stadt-Header-Hintergrund', dynamic: true },
  { key: 'blog.cover', label: 'Artikel-Titelbild', dynamic: true },
  { key: 'region.header.background', label: 'Länder-Header-Hintergrund', dynamic: true },
];

/**
 * Admin-swappable images for every photo slot on the site (`<SiteImage
 * slot="…">`, `src/components/media/site-image.tsx`) — the collection
 * `resolveSlot()` in `src/content/site-images.ts` reads. One row = one real
 * photo; a missing row means that `<SiteImage>` falls back to the slot's
 * `fallbackSrc` and finally to a designed empty state — never a broken
 * image (see BRAND-FACTS.md "Media").
 *
 * `slotKey` is a **select**, not free text — deliberately, per the image-
 * slot agent's request: a typo'd key would silently and permanently resolve
 * to a placeholder with nothing to signal why. Dynamic slots (city/blog/
 * testimonial-specific) additionally take a `dynamicId` (the city/article
 * slug or testimonial id); `key` — the exact string `resolveSlot()` looks
 * up — is computed from the two and stored read-only.
 */
export const SiteImageSlots: CollectionConfig = {
  slug: 'site-images',
  labels: {
    singular: { de: 'Bild-Slot', tr: 'Görsel Alanı' },
    plural: { de: 'Bild-Slots', tr: 'Görsel Alanları' },
  },
  defaultSort: 'priority',
  admin: {
    useAsTitle: 'key',
    defaultColumns: ['slotKey', 'dynamicId', 'priority', 'image', 'updatedAt'],
    description:
      'Jedes austauschbare Foto der Website. Was genau fotografiert werden soll, steht in docs/IMAGE-SLOTS.md (Fotografen-Briefing) — hier nur den Slot wählen, bei Bedarf eine ID anhängen (Stadt-/Artikel-Slug oder Kundenstimme) und das Bild hochladen. Kein Eintrag für einen Slot = ein gestalteter Platzhalter statt eines kaputten Bilds — nichts geht kaputt, solange hier noch nichts steht.',
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
        if (data?.slotKey) {
          data.key = data.dynamicId ? `${data.slotKey}.${data.dynamicId}` : data.slotKey;
          const index = STATIC_SLOTS.findIndex((slot) => slot.key === data.slotKey);
          data.priority = index === -1 ? 99 : index + 1;
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: 'slotKey', label: { de: 'Bereich der Website', tr: 'Web sitesi alanı' },
      type: 'select',
      required: true,
      options: STATIC_SLOTS.map((slot) => ({
        label: `${slot.label}${slot.dynamic ? ' (braucht ID unten)' : ''}`,
        value: slot.key,
      })),
      admin: { description: { de: 'Welcher Bereich der Website. Die genaue Bildvorgabe steht in docs/IMAGE-SLOTS.md.', tr: 'Web sitesinin hangi alanı. Görselin tam gereksinimleri docs/IMAGE-SLOTS.md içinde.' } },
    },
    {
      name: 'dynamicId', label: { de: 'Zusatz-ID', tr: 'Ek kimlik' },
      type: 'text',
      admin: {
        description:
          'Nur bei dynamischen Slots ausfüllen: Stadt-Slug (z. B. "stuttgart"), Artikel-Slug oder Kundenstimme-ID. Bei allen anderen Slots leer lassen.',
      },
    },
    {
      name: 'key', label: { de: 'Technischer Schlüssel', tr: 'Teknik anahtar' },
      type: 'text',
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description: { de: 'Automatisch aus Slot + ID zusammengesetzt — der exakte Schlüssel, den die Website abfragt.', tr: 'Alan + kimlikten otomatik oluşur — web sitesinin sorguladığı tam anahtar.' },
      },
    },
    {
      name: 'priority', label: { de: 'Priorität', tr: 'Öncelik' },
      type: 'number',
      admin: { readOnly: true, description: { de: '1 = größte Wirkung, zuerst fotografieren (aus dem Slot abgeleitet).', tr: '1 = en yüksek etki, önce çekilmeli (alandan türetilir).' } },
    },
    {
      name: 'image', label: { de: 'Bild', tr: 'Görsel' },
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { description: { de: 'Alt-Text ist beim Hochladen in der Medien-Sammlung Pflicht.', tr: 'Alt metin, Medya koleksiyonuna yüklerken zorunludur.' } },
    },
  ],
};
