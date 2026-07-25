import 'server-only';

import { getPayload, type Payload } from 'payload';
import config from '@payload-config';

/**
 * Payload's Local API client — talks to SQLite (or Postgres in production)
 * directly, no HTTP hop. `getPayload` is memoized internally per config
 * module, so calling this from many server components/route handlers is
 * cheap; it does not open a new connection each time.
 *
 * Local API calls default to `overrideAccess: true` (full trust), which is
 * exactly what every server-side caller in this app relies on — e.g.
 * `/api/anfrage` creating an `Enquiries` row even though that collection
 * denies `create` for every external request (see
 * `src/payload/collections/enquiries.ts`).
 */
export function getPayloadClient(): Promise<Payload> {
  return getPayload({ config });
}

/** Zeitlimit für CMS-Lesezugriffe im Render-Pfad. */
const CMS_READ_TIMEOUT_MS = 5_000;

/**
 * CMS-Lesezugriff mit Zeitlimit und garantiertem Fallback.
 *
 * Warum das nötig ist: ein `try/catch` um `getPayloadClient()` reicht nicht.
 * Bei nicht migrierter, gesperrter oder noch initialisierender Datenbank
 * *scheitert* Payload nicht — es kehrt schlicht nie zurück, und dann greift
 * kein catch. Beim Production-Build hat genau das ~190 prerenderte Seiten in
 * Nextjs' 60-Sekunden-Timeout laufen lassen und den Build abgebrochen.
 *
 * Regel: **jeder CMS-Zugriff, der während des Renderings passiert, läuft
 * durch diese Funktion.** Admin-Panel und API-Routen dürfen weiterhin direkt
 * `getPayloadClient()` benutzen — dort ist Warten korrekt und ein Fallback
 * wäre falsch.
 */
export async function readFromCms<T>(read: (payload: Payload) => Promise<T>, fallback: T, label: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      getPayloadClient().then(read),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`CMS read timed out after ${CMS_READ_TIMEOUT_MS}ms`)), CMS_READ_TIMEOUT_MS);
      }),
    ]);
  } catch (err) {
    console.warn(`[cms] ${label} unavailable — using fallback:`, err instanceof Error ? err.message : err);
    return fallback;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
