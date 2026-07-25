/**
 * Standalone ISO `YYYY-MM-DD` validation for Payload field `validate` functions.
 *
 * Deliberately NOT imported from `@/lib/booking` (which has an identical
 * `isValidIsoDate`): `src/lib/booking.ts` -> `src/content/availability.ts` ->
 * `src/lib/payload.ts` -> `payload.config.ts` -> the collections in this
 * folder, so importing back from a collection into `@/lib/booking` would
 * close a circular import loop. A few duplicated lines here are cheaper than
 * a cycle between the CMS config and the app it configures.
 */
export function isIsoDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/** Payload `validate` for a required `YYYY-MM-DD` text field. */
export function validateIsoDate(value: unknown): true | string {
  if (typeof value !== 'string' || !isIsoDateString(value)) {
    return 'Bitte ein gültiges Datum im Format JJJJ-MM-TT angeben.';
  }
  return true;
}

/** Payload `validate` for an optional `HH:MM` 24h text field. */
export function validateOptionalTime(value: unknown): true | string {
  if (value === undefined || value === null || value === '') return true;
  if (typeof value !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    return 'Bitte eine Uhrzeit im Format SS:MM angeben.';
  }
  return true;
}
