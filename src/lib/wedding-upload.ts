/**
 * Die Regeln des Foto-/Video-Uploads durch das Brautpaar — an *einer* Stelle,
 * weil sie an drei Stellen gelten müssen und dort auseinanderlaufen würden:
 * im Formular (damit eine zu große Datei gar nicht erst hochlädt), in
 * `/api/wedding-upload` (die einzige Grenze, die zählt) und im Text, den das
 * Paar liest.
 *
 * Bewusst frei von Server-Importen: dieses Modul wird auch vom
 * Client-Formular geladen.
 */

/** Nur das, was Kameras und Handys wirklich liefern. Kein SVG, kein HEIC (Payload/sharp wandelt es nicht zuverlässig). */
export const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const;

/** iPhone liefert .mov, Android .mp4. WebM der Vollständigkeit halber. */
export const ALLOWED_CLIP_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'] as const;

/** Eine DSLR-JPEG liegt bei 8–15 MB; 20 lässt Luft, ohne ein RAW durchzulassen. */
export const MAX_PHOTO_BYTES = 20 * 1024 * 1024;

/**
 * 100 MB pro Video — rund eine Minute Handyaufnahme in 1080p.
 *
 * Die Zahl ist keine Bequemlichkeit, sondern eine Speichergrenze: Payload
 * liest eine hochgeladene Datei vollständig in den Arbeitsspeicher, bevor sie
 * auf der Platte landet. Auf einer kleinen VM ist ein Hochzeitsfilm in voller
 * Länge damit kein langsamer Upload, sondern ein Ausschlag im
 * Arbeitsspeicher, den die ganze Seite spürt. Lange Filme gehören als
 * YouTube-Link hierher, nicht als Datei — der kostet uns nichts.
 *
 * ⚠️ Muss zu `client_max_body_size` in `nginx/nginx.conf` passen. Der Proxy
 * sieht die Anfrage zuerst; ist er enger eingestellt, bricht der Upload mit
 * einem 413 ab, den diese Anwendung nie zu Gesicht bekommt und deshalb auch
 * nicht sinnvoll erklären kann.
 */
export const MAX_CLIP_BYTES = 100 * 1024 * 1024;

/** Pro Absendevorgang. Hält eine versehentlich ausgewählte Kamerarolle (800 Bilder) auf. */
export const MAX_PHOTOS_PER_SUBMISSION = 30;
export const MAX_CLIPS_PER_SUBMISSION = 3;
export const MAX_YOUTUBE_URLS_PER_SUBMISSION = 5;

/**
 * Obergrenze für die gesamte Anfrage. Muss auch dann greifen, wenn jede
 * einzelne Datei unter ihrem Limit liegt: 30 × 20 MB wären sonst 600 MB in
 * einer Anfrage.
 */
export const MAX_TOTAL_BYTES = 120 * 1024 * 1024;

export const MAX_NOTE_LENGTH = 2000;
export const MAX_NAME_LENGTH = 120;

/** Für `accept` am `<input type="file">` — nur eine Vorauswahl im Dateidialog, keine Prüfung. */
export const PHOTO_ACCEPT = ALLOWED_PHOTO_TYPES.join(',');
export const CLIP_ACCEPT = ALLOWED_CLIP_TYPES.join(',');

export function isAllowedPhoto(type: string): boolean {
  return (ALLOWED_PHOTO_TYPES as readonly string[]).includes(type);
}

export function isAllowedClip(type: string): boolean {
  return (ALLOWED_CLIP_TYPES as readonly string[]).includes(type);
}

/**
 * Dateigröße für die Anzeige.
 *
 * Unterhalb eines Megabyte in KB, darüber in MB mit einer Nachkommastelle.
 * Ohne die Fallunterscheidung stand an einem 300-KB-Foto „0 MB“ — was wie
 * eine leere oder kaputte Datei aussieht, genau in dem Moment, in dem
 * jemand prüft, ob seine Auswahl angekommen ist.
 */
export function formatMegabytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;
}
