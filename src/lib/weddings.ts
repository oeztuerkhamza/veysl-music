import 'server-only';

import type { Locale } from '@/i18n/routing';
import { toSameOriginMediaPath } from '@/lib/media-url';
import { getPayloadClient, readFromCms } from '@/lib/payload';
import { extractYouTubeVideoId, youTubeEmbedUrl, youTubeThumbnailUrl } from '@/lib/social/embed';
import { cacheRemoteImage } from '@/lib/social/media-cache';

/**
 * Referenz-Hochzeiten für `/echte-hochzeiten`, gelesen aus der Payload-
 * Collection `weddings`.
 *
 * Löst `src/content/weddings.ts` ab. Die statische Liste stand seit Beginn
 * leer da, mit einem `TODO(kunde)` als einzigem Inhalt: Material lag nicht
 * freigegeben vor, und ein Eintrag hätte einen Deploy gebraucht. Genau das
 * ist der Grund, warum die Seite jetzt aus dem CMS liest — nicht, weil der
 * Vorbehalt gefallen wäre. Er gilt unverändert und steht in den Feld-
 * beschreibungen der Collection: nur echtes, vom Paar freigegebenes Material.
 *
 * Wie jeder CMS-Zugriff im Render-Pfad läuft der Read über `readFromCms`:
 * eine nicht migrierte oder langsame Datenbank fällt auf „keine Referenzen“
 * zurück (die Seite zeigt dann ihren gestalteten Leerzustand), statt den
 * Seitenaufbau anzuhalten.
 */

export interface WeddingPhoto {
  src: string;
  alt: string;
  /** Aus dem Upload; fehlt bei sehr alten Datensätzen — die Anzeige fällt dann auf ein Seitenverhältnis zurück. */
  width?: number;
  height?: number;
}

export interface WeddingVideo {
  /** YouTube-Video-ID — zugleich der React-Key. */
  id: string;
  /** `youtube-nocookie`-Embed, wird erst nach Klick geladen (siehe `VideoFacade`). */
  embedUrl: string;
  /**
   * Vorschaubild als **eigener** Pfad (`/api/social/media/…`), nicht als
   * `i.ytimg.com`-URL — siehe `resolveVideoPosters()` weiter unten.
   * `undefined`, wenn sich das Bild nicht abholen ließ.
   */
  thumbnailUrl?: string;
  title?: string;
}

export interface WeddingClip {
  /** Pfad auf den eigenen Server — die Datei liegt im `veysl-media`-Volume. */
  src: string;
  type: string;
  title?: string;
}

export interface WeddingReference {
  id: string;
  coupleLabel: string;
  city?: string;
  venue?: string;
  guestCount?: number;
  /** ISO-Datum `YYYY-MM-DD`. */
  date?: string;
  /** Titelbild — ohne eigenes Titelbild das erste Galeriefoto. */
  cover?: WeddingPhoto;
  gallery: WeddingPhoto[];
  /** Selbst gehostete kurze Videodateien (meist vom Paar hochgeladen). */
  clips: WeddingClip[];
  videos: WeddingVideo[];
  /** Markdown-Fließtext in der angefragten Sprache (Payload fällt auf Deutsch zurück). */
  story?: string;
}

interface MediaDoc {
  url?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
}

interface ClipDoc {
  url?: string | null;
  mimeType?: string | null;
  title?: string | null;
}

interface WeddingDoc {
  id: string | number;
  coupleLabel?: string | null;
  city?: string | null;
  venue?: string | null;
  guestCount?: number | null;
  date?: string | null;
  coverImage?: MediaDoc | string | number | null;
  gallery?: { image?: MediaDoc | string | number | null }[] | null;
  clips?: { clip?: ClipDoc | string | number | null }[] | null;
  videos?: { url?: string | null; title?: string | null }[] | null;
  story?: string | null;
}

function toPhoto(value: MediaDoc | string | number | null | undefined): WeddingPhoto | null {
  // Bei `depth: 1` ist ein gesetztes Upload-Feld ein Objekt; eine blanke ID
  // bedeutet, dass das Medium gelöscht wurde. Dann lieber kein Bild als ein
  // kaputtes.
  if (!value || typeof value !== 'object' || !value.url) return null;

  return {
    src: toSameOriginMediaPath(value.url),
    // `alt` ist in `media` Pflichtfeld, aber pro Sprache gepflegt — in einer
    // noch nicht übersetzten Sprache kann es leer ankommen. Leerer Alt-Text
    // ist korrekt für ein rein illustrierendes Foto, erfundener wäre falsch.
    alt: typeof value.alt === 'string' ? value.alt : '',
    width: typeof value.width === 'number' ? value.width : undefined,
    height: typeof value.height === 'number' ? value.height : undefined,
  };
}

function toClip(value: ClipDoc | string | number | null | undefined): WeddingClip | null {
  if (!value || typeof value !== 'object' || !value.url) return null;
  return {
    src: toSameOriginMediaPath(value.url),
    // Ohne korrekten `type` am <source> rät der Browser anhand der Endung —
    // bei einer iPhone-.mov geht das regelmäßig schief.
    type: value.mimeType || 'video/mp4',
    title: value.title?.trim() || undefined,
  };
}

function toVideo(entry: { url?: string | null; title?: string | null }): WeddingVideo | null {
  const videoId = entry.url ? extractYouTubeVideoId(entry.url) : null;
  // Das Feld validiert bereits beim Speichern gegen YouTube-Links; hier wird
  // nur der Fall abgefangen, dass ein Datensatz aus einer früheren Fassung
  // stammt oder direkt in der Datenbank verändert wurde.
  if (!videoId) return null;

  return {
    id: videoId,
    embedUrl: youTubeEmbedUrl(videoId),
    title: entry.title?.trim() || undefined,
  };
}

function toWedding(doc: WeddingDoc): WeddingReference | null {
  const coupleLabel = doc.coupleLabel?.trim();
  // `required: true` in der Collection — ein Datensatz ohne Paar-Bezeichnung
  // wäre eine namenlose Referenz und wird verworfen statt leer gerendert.
  if (!coupleLabel) return null;

  const gallery = (doc.gallery ?? [])
    .map((entry) => toPhoto(entry?.image))
    .filter((photo): photo is WeddingPhoto => photo !== null);

  const videos = (doc.videos ?? [])
    .map(toVideo)
    .filter((video): video is WeddingVideo => video !== null);

  const clips = (doc.clips ?? [])
    .map((entry) => toClip(entry?.clip))
    .filter((clip): clip is WeddingClip => clip !== null);

  const cover = toPhoto(doc.coverImage) ?? gallery[0];

  return {
    id: String(doc.id),
    coupleLabel,
    city: doc.city?.trim() || undefined,
    venue: doc.venue?.trim() || undefined,
    guestCount: typeof doc.guestCount === 'number' && doc.guestCount > 0 ? doc.guestCount : undefined,
    date: doc.date?.trim() || undefined,
    cover,
    // Ohne dieses Filter stünde dasselbe Foto zweimal auf der Seite: einmal
    // groß als Titelbild, einmal wieder als Kachel. Das passiert in beide
    // Richtungen — wenn kein Titelbild gesetzt ist und das erste
    // Galeriefoto einspringt, und wenn jemand dasselbe Bild bewusst in
    // beide Felder legt. Verglichen wird über die Datei, nicht über die
    // Position.
    gallery: gallery.filter((photo) => photo.src !== cover?.src),
    clips,
    videos,
    story: doc.story?.trim() || undefined,
  };
}

/**
 * Holt die YouTube-Vorschaubilder auf den eigenen Server und ersetzt sie
 * durch first-party-Pfade.
 *
 * Zwei Gründe, warum hier nicht einfach die `i.ytimg.com`-URL im `<Image>`
 * landet:
 *
 *   1. Datenschutz. Die ganze Video-Konstruktion dieser Seite ist darauf
 *      gebaut, dass der Browser YouTube erst *nach* einem Klick kontaktiert
 *      (`VideoFacade` + `youtube-nocookie`). Ein Vorschaubild direkt von
 *      YouTubes CDN würde genau das unterlaufen — beim ersten Seitenaufbau,
 *      ungefragt. `media-cache.ts` ist die Stelle, die diese Entscheidung
 *      für den Social-Feed schon trägt (docs/SOCIAL-FEED.md §9.1); Videos
 *      einer Referenz-Hochzeit sind derselbe Fall.
 *   2. `next/image` lehnt jeden Host ab, der nicht in
 *      `images.remotePatterns` steht — und dort steht kein YouTube-Host,
 *      eben wegen (1). Ein Bild von dort erzeugt keinen Platzhalter, sondern
 *      einen 500er auf der ganzen Seite.
 *
 * Läuft bewusst **außerhalb** von `readFromCms`: Diese Abrufe gehen ins
 * Netz, und `readFromCms` bricht nach fünf Sekunden mit dem Fallback ab —
 * ein langsames YouTube würde die Seite sonst nicht um ein Vorschaubild
 * bringen, sondern um sämtliche Hochzeiten. `cacheRemoteImage` wirft nie und
 * liefert `null`, wenn nichts zu holen war; dann rendert die Kachel ihren
 * gestalteten Leerzustand.
 */
async function resolveVideoPosters(weddings: WeddingReference[]): Promise<WeddingReference[]> {
  return Promise.all(
    weddings.map(async (wedding) => ({
      ...wedding,
      videos: await Promise.all(
        wedding.videos.map(async (video) => ({
          ...video,
          thumbnailUrl: (await cacheRemoteImage(youTubeThumbnailUrl(video.id))) ?? undefined,
        }))
      ),
    }))
  );
}

/**
 * Veröffentlichte Referenzen, neueste Hochzeit zuerst. Der Status wird hier
 * nochmals eingegrenzt, obwohl die Collection dieselbe Regel als
 * Zugriffsregel führt: Local-API-Aufrufe laufen konstruktionsbedingt mit
 * `overrideAccess: true`, ein Entwurf käme sonst mit auf die öffentliche
 * Seite.
 */
export async function getPublishedWeddings(locale: Locale, limit = 24): Promise<WeddingReference[]> {
  const weddings = await readFromCms(
    async (payload) => {
      const result = await payload.find({
        collection: 'weddings',
        where: { status: { equals: 'published' } },
        sort: '-date',
        limit,
        // 1 reicht: Titelbild und Galeriefotos sind Uploads eine Ebene tief.
        depth: 1,
        locale,
      });
      return (result.docs as unknown as WeddingDoc[])
        .map(toWedding)
        .filter((wedding): wedding is WeddingReference => wedding !== null);
    },
    [],
    'weddings'
  );

  return resolveVideoPosters(weddings);
}

/**
 * Die Hochzeit hinter einem Upload-Token — für `/fotos/<token>`.
 *
 * Bewusst **nicht** über `readFromCms`: Hier ist ein Fallback die falsche
 * Antwort. Fällt die Datenbank aus, würde „keine Hochzeit gefunden“ dem Paar
 * sagen, sein Link sei ungültig — und ein gültiger Link, den jemand für
 * kaputt hält, wird kein zweites Mal geöffnet. Ein Fehler darf hier nach oben
 * durchschlagen und die Fehlerseite zeigen: „gerade kaputt, versuch es
 * gleich nochmal“ ist die ehrliche Auskunft.
 *
 * Der Statusfilter fehlt mit Absicht — ein Entwurf ist genau der Normalfall.
 * Der Betreiber legt die Hochzeit nach dem Fest an, schickt den Link und
 * veröffentlicht erst, wenn das Material da und freigegeben ist.
 */
export async function getWeddingByUploadToken(
  token: string
): Promise<{ id: string; coupleLabel: string } | null> {
  if (!token || token.length > 128) return null;

  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'weddings',
    where: { uploadToken: { equals: token } },
    limit: 1,
    depth: 0,
    pagination: false,
  });

  const doc = result.docs[0];
  // Abgeschaltet wird wie unbekannt behandelt, damit ein zurückgezogener Link
  // nicht verrät, dass es ihn einmal gab (gleiche Regel wie in der Route).
  if (!doc || doc.uploadEnabled === false) return null;

  return { id: String(doc.id), coupleLabel: doc.coupleLabel ?? '' };
}
