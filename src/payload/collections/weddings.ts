import type { Access, CollectionConfig } from 'payload';
import { parseSocialPermalink } from '@/lib/social/permalink';
import { isAdmin } from '../access/is-admin';
import { isIsoDateString } from '../utils/iso-date';
import { revalidateAfterChange, revalidateAfterDelete } from '../revalidate';

/** Veröffentlichte Referenzen sind öffentlich; Entwürfe sieht nur, wer angemeldet ist. */
const readPublishedOrAdmin: Access = ({ req }) => {
  if (req.user) return true;
  return { status: { equals: 'published' } };
};

/**
 * Referenz-Hochzeiten für `/echte-hochzeiten` — Fotos, YouTube-Videos und ein
 * geschriebener Text pro Abend, alles aus dem Adminpanel oder direkt von der
 * Seite aus (`src/components/cms/wedding-editor.tsx`).
 *
 * Ersetzt die statische Liste in `src/content/weddings.ts`, die per Kommentar
 * bewusst leer blieb, bis echtes Material vorliegt. Der Grund dafür bleibt
 * bestehen und wandert hier in die Feldbeschreibungen: keine erfundenen
 * Paare, keine Stockfotos, `coupleLabel` und `venue` nur mit Einverständnis.
 * Der Unterschied ist allein, dass das Befüllen jetzt keinen Deploy braucht.
 *
 * Lokalisiert sind ausschließlich die Felder, die wirklich Sprache enthalten:
 * `story` und `videos.title`. Eckdaten wie Stadt, Location, Gästezahl und
 * Datum sind sprachneutral — sie in acht Sprachen pflegen zu müssen, wäre
 * acht Mal dieselbe Eingabe. Die Alt-Texte der Bilder sind in `media` schon
 * lokalisiert.
 */
export const Weddings: CollectionConfig = {
  slug: 'weddings',
  labels: {
    singular: { de: 'Referenz-Hochzeit', tr: 'Referans Düğün' },
    plural: { de: 'Referenz-Hochzeiten', tr: 'Referans Düğünler' },
  },
  admin: {
    useAsTitle: 'coupleLabel',
    defaultColumns: ['coupleLabel', 'city', 'date', 'status', 'updatedAt'],
    description: {
      de: 'Echte Hochzeiten für die Seite „Echte Hochzeiten“ — Titelbild, Fotogalerie, YouTube-Videos und ein Text pro Abend. Nur „Veröffentlicht“ ist öffentlich sichtbar. Bitte nur echtes, vom Paar freigegebenes Material.',
      tr: '"Gerçek Düğünler" sayfası için gerçek düğünler — kapak görseli, foto galerisi, YouTube videoları ve her düğün için bir yazı. Yalnızca "Yayında" olanlar herkese görünür. Lütfen yalnızca çiftin onay verdiği gerçek materyali kullanın.',
    },
  },
  access: {
    read: readPublishedOrAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  // Wie bei `media`/`site-images`: ohne diesen Hook erschiene eine neu
  // angelegte Hochzeit erst beim nächsten Deploy, weil `/echte-hochzeiten`
  // statisch vorgerendert wird (siehe src/payload/revalidate.ts).
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    {
      name: 'coupleLabel',
      label: { de: 'Paar', tr: 'Çift' },
      type: 'text',
      required: true,
      admin: {
        description: {
          de: 'Wie das Paar genannt werden möchte — z. B. „A. & B.“ oder „Ayşe & Mehmet“. Nur mit ausdrücklichem Einverständnis ausschreiben.',
          tr: 'Çiftin nasıl anılmak istediği — örn. "A. & B." veya "Ayşe & Mehmet". Yalnızca açık izinle tam ad yazın.',
        },
      },
    },
    {
      name: 'city',
      label: { de: 'Stadt', tr: 'Şehir' },
      type: 'text',
      admin: { description: { de: 'z. B. „Stuttgart“.', tr: 'örn. "Stuttgart".' } },
    },
    {
      name: 'venue',
      label: { de: 'Location', tr: 'Mekân' },
      type: 'text',
      admin: {
        description: {
          de: 'Name der Location — nur nennen, wenn die Location damit einverstanden ist.',
          tr: 'Mekânın adı — yalnızca mekân onay veriyorsa yazın.',
        },
      },
    },
    {
      name: 'guestCount',
      label: { de: 'Gäste', tr: 'Misafir sayısı' },
      type: 'number',
      min: 1,
      admin: {
        description: { de: 'Ungefähre Gästezahl. Leer lassen, wenn unbekannt.', tr: 'Yaklaşık misafir sayısı. Bilinmiyorsa boş bırakın.' },
      },
    },
    {
      name: 'date',
      label: { de: 'Datum', tr: 'Tarih' },
      type: 'text',
      index: true,
      validate: (value: unknown) => {
        if (value === undefined || value === null || value === '') return true;
        if (typeof value !== 'string' || !isIsoDateString(value)) {
          return 'Bitte ein gültiges Datum im Format JJJJ-MM-TT angeben, z. B. 2026-06-14.';
        }
        return true;
      },
      admin: {
        description: {
          de: 'JJJJ-MM-TT, z. B. 2026-06-14. Bestimmt zugleich die Reihenfolge auf der Seite (neueste zuerst).',
          tr: 'YYYY-AA-GG, örn. 2026-06-14. Sayfadaki sırayı da belirler (en yeni önce).',
        },
      },
    },
    {
      name: 'coverImage',
      label: { de: 'Titelbild', tr: 'Kapak görseli' },
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: {
          de: 'Das große Bild oben in der Referenz. Ohne Titelbild wird die erste Aufnahme aus der Galerie genommen.',
          tr: 'Referansın en üstündeki büyük görsel. Kapak yoksa galerideki ilk fotoğraf kullanılır.',
        },
      },
    },
    {
      name: 'story',
      label: { de: 'Text zur Hochzeit', tr: 'Düğün yazısı' },
      type: 'textarea',
      localized: true,
      admin: {
        rows: 12,
        description: {
          de: 'Der Text unter den Bildern. Einfache Formatierung: Leerzeile = neuer Absatz, „## “ am Zeilenanfang = Zwischenüberschrift, „- “ = Aufzählung, **fett**.',
          tr: 'Görsellerin altındaki yazı. Basit biçimlendirme: boş satır = yeni paragraf, satır başında "## " = ara başlık, "- " = madde, **kalın**.',
        },
      },
    },
    {
      name: 'gallery',
      label: { de: 'Fotogalerie', tr: 'Foto galerisi' },
      type: 'array',
      labels: {
        singular: { de: 'Foto', tr: 'Fotoğraf' },
        plural: { de: 'Fotos', tr: 'Fotoğraflar' },
      },
      admin: {
        description: {
          de: 'Weitere Fotos dieses Abends. Reihenfolge per Ziehen änderbar. Der Alt-Text kommt aus dem jeweiligen Medium.',
          tr: 'Bu düğüne ait diğer fotoğraflar. Sıra sürükleyerek değiştirilebilir. Alt metin ilgili medyadan gelir.',
        },
      },
      fields: [
        {
          name: 'image',
          label: { de: 'Foto', tr: 'Fotoğraf' },
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'videos',
      label: { de: 'Videos', tr: 'Videolar' },
      type: 'array',
      labels: {
        singular: { de: 'Video', tr: 'Video' },
        plural: { de: 'Videos', tr: 'Videolar' },
      },
      admin: {
        description: {
          de: 'YouTube-Links dieses Abends. Das Vorschaubild kommt automatisch von YouTube — nichts hochzuladen. Abgespielt wird erst nach Klick.',
          tr: 'Bu düğüne ait YouTube bağlantıları. Önizleme görseli otomatik olarak YouTube tarafından sağlanır — yükleme gerekmez. Video ancak tıklayınca oynatılır.',
        },
      },
      fields: [
        {
          name: 'url',
          label: { de: 'YouTube-Link', tr: 'YouTube bağlantısı' },
          type: 'text',
          required: true,
          validate: (value: unknown) => {
            if (typeof value !== 'string' || !value.trim()) {
              return 'Bitte einen YouTube-Link einfügen.';
            }
            const parsed = parseSocialPermalink(value);
            if (!parsed || parsed.platform !== 'youtube') {
              return 'Nur YouTube-Links werden unterstützt: youtube.com/watch?v=…, youtube.com/shorts/… oder youtu.be/….';
            }
            return true;
          },
          admin: {
            description: {
              de: 'z. B. https://www.youtube.com/watch?v=… — Shorts und youtu.be-Kurzlinks gehen auch.',
              tr: 'örn. https://www.youtube.com/watch?v=… — Shorts ve youtu.be kısa bağlantıları da olur.',
            },
          },
        },
        {
          name: 'title',
          label: { de: 'Bildunterschrift', tr: 'Video açıklaması' },
          type: 'text',
          localized: true,
          admin: {
            description: {
              de: 'Optional — z. B. „Einzug“ oder „Halay“. Wird unter dem Video angezeigt.',
              tr: 'İsteğe bağlı — örn. "Gelin girişi" veya "Halay". Videonun altında gösterilir.',
            },
          },
        },
      ],
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
        description: {
          de: 'Erst „Veröffentlicht“ macht die Hochzeit auf der Website sichtbar.',
          tr: 'Düğün ancak "Yayında" seçilince web sitesinde görünür.',
        },
      },
    },
  ],
};
