import type { CollectionConfig } from 'payload';
import { isAdmin } from '../access/is-admin';
import { revalidateAfterChange, revalidateAfterDelete } from '../revalidate';
import { SITE_LOCALE_OPTIONS } from '../site-locales';

/**
 * Manuell korrigierte Website-Texte.
 *
 * Die Texte der Seite stehen in `messages/<sprache>.json` im Repository. Diese
 * Collection legt eine Schicht darüber: Ein Eintrag ersetzt den Text unter
 * `key` in der Sprache `locale`, alles ohne Eintrag bleibt unverändert. Gelesen
 * wird sie in `src/i18n/request.ts` über `src/lib/text-overrides.ts`.
 *
 * Bearbeitet wird in aller Regel nicht hier, sondern direkt auf der Seite
 * (Knopf „Texte" unten links, solange man angemeldet ist). Diese Liste ist die
 * Übersicht: was wurde geändert, und ein Eintrag löschen = Originaltext zurück.
 */
export const TextOverrides: CollectionConfig = {
  slug: 'text-overrides',
  labels: {
    singular: { de: 'Textkorrektur', tr: 'Metin düzeltmesi' },
    plural: { de: 'Textkorrekturen', tr: 'Metin düzeltmeleri' },
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['locale', 'key', 'value', 'updatedAt'],
    description: {
      de: 'Von Hand geänderte Texte der Website. Am einfachsten direkt auf der Seite: angemeldet unten links auf „Texte" tippen und den Text anklicken. Einen Eintrag hier zu löschen stellt den Originaltext wieder her.',
      tr: 'Web sitesinde elle değiştirilen metinler. En kolayı doğrudan sayfada: giriş yaptıktan sonra sol alttaki “Metinler” düğmesine basıp metne tıklayın. Buradan bir kaydı silmek özgün metni geri getirir.',
    },
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
    beforeValidate: [
      ({ data }) => {
        if (data?.locale && data?.key) data.slug = `${data.locale}:${data.key}`;
        return data;
      },
    ],
  },
  fields: [
    {
      name: 'locale',
      label: { de: 'Sprache', tr: 'Dil' },
      type: 'select',
      required: true,
      options: [...SITE_LOCALE_OPTIONS],
    },
    {
      name: 'key',
      label: { de: 'Schlüssel', tr: 'Anahtar' },
      type: 'text',
      required: true,
      admin: { description: { de: 'Pfad in messages/<sprache>.json, z. B. home.hero.title.', tr: 'messages/<dil>.json içindeki yol, ör. home.hero.title.' } },
    },
    {
      name: 'value',
      label: { de: 'Text', tr: 'Metin' },
      type: 'textarea',
      required: true,
      admin: { description: { de: 'Platzhalter wie {name} und Tags wie <b>…</b> unverändert lassen.', tr: '{name} gibi yer tutucuları ve <b>…</b> gibi etiketleri değiştirmeyin.' } },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: { readOnly: true, hidden: true },
    },
  ],
};
