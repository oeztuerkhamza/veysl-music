/**
 * Macht aus der URL eines Payload-Uploads einen Pfad gleicher Herkunft.
 *
 * Payload baut die `url` eines Mediums aus `serverURL` zusammen und liefert
 * damit je nach Konfiguration eine absolute URL
 * (`http://…/api/media/file/foto.webp`). `next/image` lehnt eine absolute URL
 * ab, deren Host nicht in `images.remotePatterns` steht — mit einem 500 auf
 * der ganzen Seite, nicht mit einem fehlenden Bild.
 *
 * Verglichen wird gegen zwei Herkünfte:
 *
 *   - `PAYLOAD_SERVER_URL` — genau der Wert, aus dem Payload die URL gebaut
 *     hat. Das ist der zuverlässige Vergleich, und der, der bisher fehlte:
 *     lokal steht dort `http://localhost:3000`, während der Entwicklungsserver
 *     auf einem freien Port läuft, und `NEXT_PUBLIC_SITE_URL` ist gar nicht
 *     gesetzt. Ergebnis war ein 500 auf jeder Seite mit einem CMS-Bild, sobald
 *     der erste Upload existierte.
 *   - `NEXT_PUBLIC_SITE_URL` — die öffentliche Adresse. In Produktion sind
 *     beide dieselbe Domain; der Vergleich bleibt trotzdem drin, damit eine
 *     Abweichung zwischen beiden nicht dieselbe Falle stellt.
 *
 * Fremde Hosts bleiben unangetastet: Wandern die Uploads später auf S3 oder
 * ein CDN, fällt der Wert unverändert durch und `images.remotePatterns` greift
 * wie vorgesehen.
 */
export function toSameOriginMediaPath(url: string): string {
  if (url.startsWith('/')) return url;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  for (const candidate of [process.env.PAYLOAD_SERVER_URL, process.env.NEXT_PUBLIC_SITE_URL]) {
    if (!candidate) continue;
    try {
      if (parsed.origin === new URL(candidate).origin) {
        return `${parsed.pathname}${parsed.search}`;
      }
    } catch {
      // Unbrauchbarer Wert in der Umgebungsvariable — nächste Kandidatin.
    }
  }

  return url;
}
