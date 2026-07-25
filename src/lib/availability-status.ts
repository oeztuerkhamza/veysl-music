/**
 * The DB-backed half of the availability check, split out of
 * `src/lib/booking.ts` on purpose: that module is imported by every client
 * component in the booking form, and this one transitively imports Payload
 * (via `@/content/availability`), which needs Node builtins (`node:fs`) and
 * cannot exist in a browser bundle. `import 'server-only'` turns any future
 * accidental client import of this file into a clear build-time error
 * instead of an opaque Turbopack chunking failure.
 *
 * Used by `/api/availability` (the live per-date check) and `scoreEnquiry`
 * in `/api/anfrage/_lib/lead-score.ts` (so scoring reflects the same status
 * the visitor saw) — both server-only call sites, both already `await` it.
 */
import 'server-only';

import { getBlockedDates, isDateBlocked } from '@/content/availability';
import { isPastIsoDate, isValidIsoDate, type AvailabilityStatus } from './booking';

export async function getAvailabilityStatus(iso: string): Promise<AvailabilityStatus> {
  if (!isValidIsoDate(iso)) return 'unknown';
  if (isPastIsoDate(iso)) return 'past';
  // Ship-empty rule (see content/availability.ts): no data at all means we
  // genuinely don't know — never report "free" by absence of data alone.
  const blocked = await getBlockedDates();
  if (blocked.length === 0) return 'unknown';
  return (await isDateBlocked(iso)) ? 'taken' : 'free';
}
