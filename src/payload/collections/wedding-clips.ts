import path from 'node:path';
import type { CollectionConfig } from 'payload';
import { isAdmin } from '../access/is-admin';
import { revalidateAfterChange, revalidateAfterDelete } from '../revalidate';

/**
 * Kurze Videodateien einer Referenz-Hochzeit — das, was ein Paar direkt vom
 * Handy hochlädt, ohne den Umweg über YouTube.
 *
 * Eine eigene Collection statt eines weiteren Feldes in `media`, weil `media`
 * kein Video annehmen kann und auch nicht soll: dort läuft jeder Upload durch
 * `sharp`, wird zu WebP umgewandelt und in drei Bildgrößen zerlegt
 * (`imageSizes`). Auf eine Videodatei ist davon nichts anwendbar, und die
 * `mimeTypes`-Liste dort ist bewusst eng — sie hält unter anderem SVG
 * draußen. Zwei Collections trennen die beiden Fälle sauber, statt eine
 * Konfiguration zu bauen, die für beide halb passt.
 *
 * ⚠️ **Größe.** Videos sind hier absichtlich als *kurze Ausschnitte* gedacht
 * — Einzug, Eröffnungstanz, ein Halay —, nicht als Hochzeitsfilm in voller
 * Länge. Drei Grenzen setzen das durch, und alle drei müssen zusammenpassen:
 *
 *   1. `MAX_CLIP_BYTES` in `src/lib/wedding-upload.ts` (Anwendung)
 *   2. `client_max_body_size` in `nginx/nginx.conf` (Proxy davor)
 *   3. der Plattenplatz im `veysl-media`-Volume (docker-compose.yml)
 *
 * Der Grund ist nicht Sparsamkeit: Payload liest eine hochgeladene Datei als
 * Ganzes in den Speicher, bevor sie auf der Platte landet. Ein 2-GB-Film wäre
 * ein 2-GB-Ausschlag im Arbeitsspeicher einer kleinen VM — also ein Absturz
 * für alle anderen Besucher der Seite. Für lange Filme ist der YouTube-Link
 * (`weddings.videos`) der richtige Weg; er kostet uns weder Speicher noch
 * Bandbreite.
 */
export const WeddingClips: CollectionConfig = {
  slug: 'wedding-clips',
  labels: {
    singular: { de: 'Video-Datei', tr: 'Video dosyası' },
    plural: { de: 'Video-Dateien', tr: 'Video dosyaları' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['filename', 'title', 'updatedAt'],
    description: {
      de: 'Kurze Videoausschnitte von Hochzeiten (Handy-Clips). Für lange Filme bitte einen YouTube-Link an der Hochzeit selbst hinterlegen.',
      tr: 'Düğünlerden kısa video kesitleri (telefon çekimleri). Uzun filmler için düğün kaydına YouTube bağlantısı ekleyin.',
    },
  },
  access: {
    // Wie `media`: die Datei selbst muss öffentlich abrufbar sein, sonst kann
    // das <video> auf der Seite sie nicht laden. Wer hochladen darf, ist die
    // eigentliche Frage — und das sind nur Angemeldete bzw. der Server selbst
    // (`/api/wedding-upload` schreibt über die Local API).
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  upload: {
    // Unterordner von `media/`, damit eine Videodatei nie mit einem Bild
    // gleichen Namens kollidiert. Liegt im selben Docker-Volume.
    staticDir: path.resolve(process.cwd(), 'media', 'clips'),
    // Kein `imageSizes`, kein `formatOptions`, kein `resizeOptions` — nichts
    // davon ergibt für Video einen Sinn, und `sharp` würde an der Datei
    // ohnehin scheitern.
    //
    // Die Liste ist bewusst kurz und deckt ab, was Handys tatsächlich
    // erzeugen: iPhone liefert .mov (video/quicktime), Android .mp4.
    mimeTypes: ['video/mp4', 'video/quicktime', 'video/webm'],
  },
  fields: [
    {
      name: 'title',
      label: { de: 'Bildunterschrift', tr: 'Açıklama' },
      type: 'text',
      localized: true,
      admin: {
        description: {
          de: 'Optional — z. B. „Einzug“. Wird unter dem Video angezeigt.',
          tr: 'İsteğe bağlı — örn. "Gelin girişi". Videonun altında gösterilir.',
        },
      },
    },
  ],
};
