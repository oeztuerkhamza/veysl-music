/**
 * DB-backed availability source, replacing the old hand-maintained static
 * list. Backed by the Payload `blocked-dates` collection (admin panel:
 * "Blockierte Tage") — populated either manually by the DJ or automatically
 * whenever a `confirmed` Booking is created/cancelled (see
 * `src/payload/hooks/sync-blocked-date.ts`).
 *
 * KRITISCH (unchanged from the original static version): an empty result
 * means "wir wissen es nicht", NICHT "alles frei". `getAvailabilityStatus`
 * in `src/lib/booking.ts` and `/api/availability` still show the neutral
 * "unknown" state whenever this list is empty — never a false "free".
 *
 * Exported function names (`getBlockedDates`, `isDateBlocked`) are kept
 * identical to the old static module so every existing call site keeps
 * working — they are now `async`, which is the only breaking change, and
 * every current caller is server-only code that already awaits them.
 *
 * `import 'server-only'` guards against this ever being pulled into a
 * client bundle again (it happened once already via `src/lib/booking.ts` —
 * see `src/lib/availability-status.ts` for the fix and the full story).
 */
import 'server-only';

import { readFromCms } from '@/lib/payload';

interface Cache {
  value: string[];
  expiresAt: number;
}

let cache: Cache | null = null;
/** Short TTL: cheap enough to re-fetch often, long enough that a burst of calendar/availability requests doesn't hammer the DB. */
const TTL_MS = 30_000;

async function fetchBlockedDates(): Promise<string[]> {
  // Zeitbegrenzt: ein blockierendes Payload darf den Buchungs-Render-Pfad
  // nicht aufhalten. Leerer Fallback => Status "unknown", nie "frei".
  return readFromCms(
    async (payload) => {
      const result = await payload.find({
        collection: 'blocked-dates',
        limit: 2000,
        depth: 0,
        pagination: false,
      });
      return result.docs
        .map((doc) => (typeof doc.date === 'string' ? doc.date : undefined))
        .filter((date): date is string => Boolean(date));
    },
    [] as string[],
    'blocked-dates'
  );
}

/** Read-only accessor — every blocked `YYYY-MM-DD` date, DJ-maintained or auto-blocked by a confirmed booking. */
export async function getBlockedDates(): Promise<readonly string[]> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.value;

  try {
    const value = await fetchBlockedDates();
    cache = { value, expiresAt: now + TTL_MS };
    return value;
  } catch (err) {
    // The public site must keep degrading honestly (to "unknown") even if
    // the DB is briefly unreachable — never fall through to a stale "free".
    console.error('[availability] failed to load blocked dates from the CMS', err);
    return cache?.value ?? [];
  }
}

/** Whether the given `YYYY-MM-DD` date is on the blocklist. */
export async function isDateBlocked(iso: string): Promise<boolean> {
  const dates = await getBlockedDates();
  return dates.includes(iso);
}

/** All blocked dates within a given `YYYY-MM` month — powers the calendar grid (`/api/availability/calendar`). */
export async function getBlockedDatesInMonth(monthIso: string): Promise<string[]> {
  const dates = await getBlockedDates();
  return dates.filter((date) => date.startsWith(monthIso));
}
