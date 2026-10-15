import type { Access, CollectionBeforeValidateHook, CollectionConfig } from 'payload';
import { isAdmin } from '../access/is-admin';
import { slugify } from '../utils/slugify';
import { revalidateAfterChange, revalidateAfterDelete } from '../revalidate';

/** Veröffentlichte Locations sind öffentlich; Entwürfe sieht nur, wer angemeldet ist. */
const readPublishedOrAdmin: Access = ({ req }) => {
  if (req.user) return true;
  return { status: { equals: 'published' } };
};

/**
 * Mindestlänge des „DJ-Blicks" für die Veröffentlichung.
 *
 * Eine Location-Seite mit einem Namen und einem Satz ist genau die dünne
 * Seite, die Google als Doorway-Seite wertet und die den Rest der Website
 * mitzieht. 120 Zeichen sind kein Qualitätsurteil, sondern eine Schwelle, die
 * „Saal in Fellbach, war schön" nicht erreicht — die Seite soll etwas
 * enthalten, das nur wer dort gespielt hat wissen kann.
 */
const MIN_NOTE_LENGTH = 120;

/** Slug beim Anlegen aus dem Namen ableiten, wenn der Betreiber keinen eingibt. */
const ensureSlug: CollectionBeforeValidateHook = ({ data }) => {
  if (data && !data.slug && typeof data.name === 'string') {
    data.slug = slugify(data.name);
  } else if (data && typeof data.slug === 'string') {
    data.slug = slugify(data.slug);
  }
  return data;
};

/**
 * Locations, in denen DJ Veys tatsächlich gespielt hat — jede wird eine eigene
 * Seite `/hochzeitslocation/<slug>`.
 *
 * Zwei Sicherungen gegen die zwei Arten, wie so eine Liste schaden kann:
 *
 * 1. **Einverständnis.** Eine Location namentlich als Referenz zu nennen ist
 *    eine Behauptung über Dritte (`src/content/venues.ts` trug dazu seit
 *    Projektbeginn ein `TODO(kunde)`). „Veröffentlicht" ist deshalb nur mit
 *    gesetztem Häkchen „Namensnennung abgestimmt" speicherbar.
 * 2. **Substanz.** Ohne eigenen Text ist die Seite nur ein Name mit Stadt.
 *    „Veröffentlicht" verlangt deshalb den Abschnitt „DJ-Blick" (siehe
 *    `MIN_NOTE_LENGTH`).
 *
 * Der Gästezahl- oder Anzahl-Auftritte-Wert wurde bewusst weggelassen: Zahlen,
 * die niemand nachzählt, sind genau die Art Angabe, die BRAND-FACTS.md
 * ausschließt.
 */
export const Venues: CollectionConfig = {
  slug: 'venues',
  labels: {
    singular: { de: 'Location', tr: 'Mekân' },
    plural: { de: 'Locations', tr: 'Mekânlar' },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'city', 'status', 'permission', 'updatedAt'],
    description: {
      de: 'Hochzeits-Locations, in denen DJ Veys gespielt hat — jede bekommt eine eigene Seite. „Veröffentlicht" geht nur mit Häkchen bei „Namensnennung abgestimmt" und einem Text im Feld „DJ-Blick".',
      tr: 'DJ Veys\'in çaldığı düğün mekânları — her biri kendi sayfasını alır. "Yayında" yalnızca "Ad kullanımı onaylandı" kutusu işaretliyse ve "DJ gözüyle" alanı doluysa kaydedilir.',
    },
  },
  access: {
    read: readPublishedOrAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeValidate: [ensureSlug],
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    {
      name: 'name',
      label: { de: 'Name der Location', tr: 'Mekânın adı' },
      type: 'text',
      required: true,
      admin: {
        description: {
          de: 'So, wie sich die Location selbst schreibt — z. B. „Schloss Karlsburg".',
          tr: 'Mekânın kendi yazdığı şekilde — örn. "Schloss Karlsburg".',
        },
      },
    },
    {
      name: 'slug',
      label: { de: 'URL-Name', tr: 'URL adı' },
      type: 'text',
      unique: true,
      index: true,
      admin: {
        description: {
          de: 'Wird automatisch aus dem Namen gebildet (nur Kleinbuchstaben, Ziffern, Bindestriche). Nach der Veröffentlichung nicht mehr ändern — der Name ist Teil der Adresse.',
          tr: 'Addan otomatik oluşturulur (yalnızca küçük harf, rakam, tire). Yayından sonra değiştirmeyin — ad, adresin parçasıdır.',
        },
      },
    },
    {
      name: 'city',
      label: { de: 'Stadt', tr: 'Şehir' },
      type: 'text',
      required: true,
      admin: {
        description: {
          de: 'Postalischer Ort, z. B. „Karlsruhe". Passt der Name zu einer Stadtseite der Website, wird dorthin verlinkt.',
          tr: 'Posta adresindeki şehir, örn. "Karlsruhe". Web sitesindeki bir şehir sayfasıyla eşleşirse oraya bağlantı verilir.',
        },
      },
    },
    {
      name: 'address',
      label: { de: 'Adresse', tr: 'Adres' },
      type: 'text',
      admin: {
        description: {
          de: 'Optional — Straße und Hausnummer, wie auf der Website der Location.',
          tr: 'İsteğe bağlı — mekânın web sitesindeki gibi sokak ve numara.',
        },
      },
    },
    {
      name: 'website',
      label: { de: 'Website der Location', tr: 'Mekânın web sitesi' },
      type: 'text',
      validate: (value: unknown) => {
        if (value === undefined || value === null || value === '') return true;
        if (typeof value !== 'string') return 'Bitte eine Adresse mit https:// angeben.';
        try {
          const url = new URL(value);
          return url.protocol === 'https:' || url.protocol === 'http:' ? true : 'Nur http(s)-Adressen.';
        } catch {
          return 'Bitte eine vollständige Adresse angeben, z. B. https://www.beispiel.de';
        }
      },
      admin: {
        description: {
          de: 'Optional — mit https://. Wird auf der Location-Seite verlinkt.',
          tr: 'İsteğe bağlı — https:// ile. Mekân sayfasında bağlantı olarak verilir.',
        },
      },
    },
    {
      name: 'note',
      label: { de: 'DJ-Blick', tr: 'DJ gözüyle' },
      type: 'textarea',
      localized: true,
      validate: (value: unknown, { siblingData, req }: { siblingData?: Record<string, unknown>; req?: { locale?: string | null } }) => {
        // Nur beim Speichern der Hauptsprache prüfen: In `tr` darf der Text
        // später nachkommen, ohne dass die Veröffentlichung daran hängt.
        if (siblingData?.status !== 'published') return true;
        if (req?.locale && req.locale !== 'de') return true;
        const length = typeof value === 'string' ? value.trim().length : 0;
        return length >= MIN_NOTE_LENGTH
          ? true
          : `Zum Veröffentlichen mindestens ${MIN_NOTE_LENGTH} Zeichen (aktuell ${length}): Was sollte ein Paar über diesen Saal aus DJ-Sicht wissen?`;
      },
      admin: {
        rows: 10,
        description: {
          de: 'Was ein Paar über diesen Saal aus DJ-Sicht wissen sollte: Akustik, Aufbau und Strom, Sperrzeit, Anfahrt und Parken, Besonderheiten. Nur, was wirklich stimmt. Einfache Formatierung: Leerzeile = neuer Absatz, „## " = Zwischenüberschrift, „- " = Aufzählung, **fett**.',
          tr: 'Bir çiftin bu salon hakkında bir DJ gözüyle bilmesi gerekenler: akustik, kurulum ve elektrik, kapanış saati, ulaşım ve park, özellikler. Yalnızca gerçekten doğru olanlar. Basit biçimlendirme: boş satır = yeni paragraf, "## " = ara başlık, "- " = madde, **kalın**.',
        },
      },
    },
    {
      name: 'image',
      label: { de: 'Foto', tr: 'Fotoğraf' },
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: {
          de: 'Optional — ein Foto aus dieser Location, z. B. von einer Hochzeit dort. Nur mit Freigabe von Paar bzw. Fotograf:in.',
          tr: 'İsteğe bağlı — bu mekândan bir fotoğraf. Yalnızca çiftin/fotoğrafçının izniyle.',
        },
      },
    },
    {
      name: 'permission',
      label: { de: 'Namensnennung abgestimmt', tr: 'Ad kullanımı onaylandı' },
      type: 'checkbox',
      defaultValue: false,
      validate: (value: unknown, { siblingData }: { siblingData?: Record<string, unknown> }) =>
        siblingData?.status === 'published' && !value
          ? 'Zum Veröffentlichen muss die Location mit der Namensnennung einverstanden sein (Häkchen setzen, wenn das schriftlich oder per Nachricht vorliegt).'
          : true,
      admin: {
        position: 'sidebar',
        description: {
          de: 'Nur setzen, wenn die Location einverstanden ist, namentlich genannt zu werden (Nachricht/E-Mail genügt, aufbewahren).',
          tr: 'Yalnızca mekân adının anılmasına izin verdiyse işaretleyin (mesaj/e-posta yeterli, saklayın).',
        },
      },
    },
    {
      name: 'status',
      label: { de: 'Status', tr: 'Durum' },
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: [
        { label: { de: 'Entwurf', tr: 'Taslak' }, value: 'draft' },
        { label: { de: 'Veröffentlicht', tr: 'Yayında' }, value: 'published' },
      ],
      admin: {
        position: 'sidebar',
        description: {
          de: 'Erst „Veröffentlicht" macht die Location-Seite sichtbar.',
          tr: 'Mekân sayfası ancak "Yayında" seçilince görünür.',
        },
      },
    },
  ],
};
