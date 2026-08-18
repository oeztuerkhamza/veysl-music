import type { CollectionConfig } from 'payload';
import { denyAll, isAdmin } from '../access/is-admin';

/**
 * Der Posteingang für das, was ein Paar über seinen Upload-Link geschickt hat
 * — Fotos, kurze Videos, YouTube-Links und eine Notiz, alles noch
 * unveröffentlicht.
 *
 * Warum überhaupt eine Zwischenstufe, statt direkt in die Galerie zu
 * schreiben: Der Upload-Link geht per WhatsApp an ein Brautpaar und wird von
 * dort weitergeleitet, in Familiengruppen geteilt, auf zwei Handys geöffnet.
 * Was am Ende ankommt, ist unbekannt — ein Screenshot, ein Foto vom falschen
 * Abend, ein Bild, auf dem ein Gast erkennbar ist, der das nicht möchte. Eine
 * öffentliche Referenzseite darf so etwas nicht ungeprüft zeigen; die
 * Entscheidung, was den Abend nach außen darstellt, bleibt beim Betreiber.
 *
 * `create` ist deshalb für *jeden* Weg von außen geschlossen, auch für
 * angemeldete Nutzer — genau wie bei `enquiries`. Der einzige Schreiber ist
 * `/api/wedding-upload`, der über die Local API läuft (`overrideAccess`) und
 * vorher den Token prüft, die Dateigrößen begrenzt und die Rate limitiert.
 * Ohne diese Regel wäre `POST /api/wedding-submissions` ein offenes Endstück
 * an der Datenbank.
 *
 * Übernommen oder verworfen wird auf der Seite selbst
 * (`src/components/cms/wedding-editor.tsx`): „Übernehmen“ hängt die Dateien
 * an die Hochzeit und setzt hier `handled`, „Verwerfen“ löscht diesen Satz
 * samt der hochgeladenen Dateien.
 */
export const WeddingSubmissions: CollectionConfig = {
  slug: 'wedding-submissions',
  labels: {
    singular: { de: 'Eingereichte Hochzeitsdatei', tr: 'Gönderilen düğün dosyası' },
    plural: { de: 'Eingereichte Hochzeitsdateien', tr: 'Gönderilen düğün dosyaları' },
  },
  admin: {
    useAsTitle: 'submitterName',
    defaultColumns: ['submitterName', 'wedding', 'status', 'createdAt'],
    description: {
      de: 'Was Paare über ihren Upload-Link geschickt haben. Nichts davon ist öffentlich sichtbar, bevor es auf der Seite „Echte Hochzeiten“ übernommen wurde.',
      tr: 'Çiftlerin yükleme bağlantısı üzerinden gönderdikleri. "Gerçek Düğünler" sayfasında onaylanmadan hiçbiri herkese görünmez.',
    },
  },
  access: {
    read: isAdmin,
    // Nur der Server (Local API) legt hier an — siehe Kopfkommentar.
    create: denyAll,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'wedding',
      label: { de: 'Hochzeit', tr: 'Düğün' },
      type: 'relationship',
      relationTo: 'weddings',
      required: true,
      index: true,
      admin: {
        description: {
          de: 'Ergibt sich aus dem Upload-Link — das Paar wählt nichts aus.',
          tr: 'Yükleme bağlantısından belirlenir — çift bir seçim yapmaz.',
        },
      },
    },
    {
      name: 'submitterName',
      label: { de: 'Absender', tr: 'Gönderen' },
      type: 'text',
      admin: {
        description: {
          de: 'Wie sich die Person im Formular genannt hat. Ungeprüft — jeder mit dem Link kann hier alles eintragen.',
          tr: 'Kişinin formda yazdığı ad. Doğrulanmamıştır — bağlantıya sahip herkes buraya istediğini yazabilir.',
        },
      },
    },
    {
      name: 'note',
      label: { de: 'Nachricht', tr: 'Mesaj' },
      type: 'textarea',
      admin: {
        description: {
          de: 'Was das Paar zum Abend geschrieben hat. Nicht automatisch öffentlich — taugt aber oft als Kundenstimme (mit Rückfrage).',
          tr: 'Çiftin gece hakkında yazdıkları. Otomatik olarak yayınlanmaz — ama çoğu zaman (sorduktan sonra) müşteri yorumu olur.',
        },
      },
    },
    {
      name: 'photos',
      label: { de: 'Fotos', tr: 'Fotoğraflar' },
      type: 'array',
      fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
    },
    {
      name: 'clips',
      label: { de: 'Videos', tr: 'Videolar' },
      type: 'array',
      fields: [{ name: 'clip', type: 'upload', relationTo: 'wedding-clips', required: true }],
    },
    {
      name: 'youtubeUrls',
      label: { de: 'YouTube-Links', tr: 'YouTube bağlantıları' },
      type: 'array',
      fields: [{ name: 'url', type: 'text', required: true }],
    },
    {
      name: 'status',
      label: { de: 'Status', tr: 'Durum' },
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: [
        { label: { de: 'Wartet auf Prüfung', tr: 'İnceleme bekliyor' }, value: 'pending' },
        { label: { de: 'Erledigt', tr: 'Tamamlandı' }, value: 'handled' },
      ],
    },
  ],
};
