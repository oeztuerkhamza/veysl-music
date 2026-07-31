/**
 * Booking-enquiry domain logic: the zod schema shared by the client-side
 * multi-step form and the `/api/anfrage` route, plus small date helpers used
 * for both the enquiry's "must be in the future" rule and the availability
 * check in `/api/availability`.
 *
 * IMPORTANT: validation messages are **message keys**, not prose. The form
 * resolves them via `useTranslations('booking.validation')`. Keep every enum
 * below in sync with the matching object under `booking.*` in
 * `messages/{de,en}.json` — the funnel enum values ARE the message keys.
 *
 * ⚠️ This module is imported by many `'use client'` components (the whole
 * booking form tree), so it must never import anything that touches the
 * Payload/Node runtime (`@/content/availability`, `@/lib/payload`, …) — that
 * would drag `payload` (which needs `node:fs`) into the browser bundle and
 * 500 every page. The DB-backed availability check lives in the sibling,
 * `import 'server-only'`-guarded module `src/lib/availability-status.ts`
 * instead; only the plain `AvailabilityStatus` *type* stays here.
 */
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Enum value sets — each list must match the keys of the corresponding
// `booking.*` object in messages/de.json / messages/en.json exactly.
// ---------------------------------------------------------------------------

/** Keys of `booking.eventTypes`. */
export const eventTypeValues = [
  'wedding',
  'engagement',
  'henna',
  'afterparty',
  'corporate',
  'birthday',
  'other',
] as const;
export type EventType = (typeof eventTypeValues)[number];

/** Keys of `booking.packageOptions`. */
export const packageValues = ['essential', 'signature', 'prestige', 'custom'] as const;
export type PackageOption = (typeof packageValues)[number];

/** Keys of `booking.budgets`. */
export const budgetValues = ['unsure', 'a', 'b', 'c', 'd'] as const;
export type Budget = (typeof budgetValues)[number];

/** Keys of `booking.sources`. */
export const sourceValues = ['google', 'instagram', 'recommendation', 'venue', 'ai', 'other'] as const;
export type Source = (typeof sourceValues)[number];

/**
 * Keys of `booking.services` — which of Veysel's offerings (DJ, hosting,
 * live music, AV rental) the enquiry is about. Deliberately its own list
 * rather than reusing `site.capabilities`: the funnel merges wedding-dj /
 * event-dj into a single "DJ & Musik" line because `eventType` already
 * captures the occasion.
 */
export const serviceValues = ['dj', 'hosting', 'liveMusic', 'avRental'] as const;
export type ServiceOption = (typeof serviceValues)[number];

/** Keys of `booking.hostingLanguages`. */
export const hostingLanguageValues = ['noPreference', 'de', 'tr', 'en'] as const;
export type HostingLanguage = (typeof hostingLanguageValues)[number];

/** Rendered but hidden anti-spam field. Must arrive empty. */
export const HONEYPOT_FIELD = 'company' as const;

// ---------------------------------------------------------------------------
// Date helpers — shared by the zod schema, the availability API and the
// lead-scoring logic. ISO "YYYY-MM-DD" strings compare lexicographically in
// the same order as chronologically, so plain string comparison is enough.
// ---------------------------------------------------------------------------

/** Real-calendar validation for a `YYYY-MM-DD` string (rejects e.g. 2026-02-30). */
export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/** Today as `YYYY-MM-DD` in the server/client's local calendar day. */
export function todayIsoDate(referenceDate: Date = new Date()): string {
  const year = referenceDate.getFullYear();
  const month = String(referenceDate.getMonth() + 1).padStart(2, '0');
  const day = String(referenceDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Strictly after today — the enquiry form's "must be in the future" rule (excludes today). */
export function isFutureIsoDate(value: string, referenceDate: Date = new Date()): boolean {
  return isValidIsoDate(value) && value > todayIsoDate(referenceDate);
}

/** Strictly before today. */
export function isPastIsoDate(value: string, referenceDate: Date = new Date()): boolean {
  return isValidIsoDate(value) && value < todayIsoDate(referenceDate);
}

/** Whole calendar days between today and the given future/past ISO date (negative if past). */
export function daysUntil(value: string, referenceDate: Date = new Date()): number {
  const today = new Date(Date.UTC(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate()));
  const [year, month, day] = value.split('-').map(Number);
  const target = new Date(Date.UTC(year, month - 1, day));
  return Math.round((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

// ---------------------------------------------------------------------------
// Field-level building blocks
// ---------------------------------------------------------------------------

/** Turns `''` (an untouched optional input) into `undefined` before validation. */
function emptyToUndefined(value: unknown) {
  return value === '' || value === null || value === undefined ? undefined : value;
}

const optionalTrimmedString = (max: number) =>
  z.preprocess(emptyToUndefined, z.string().trim().max(max, { error: 'max' }).optional());

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(emptyToUndefined, z.enum(values, { error: 'required' }).optional());

const optionalTimeString = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, { error: 'date' })
    .optional()
);

/** `guests` arrives as a string from the numeric-keypad input; coerced to a number 1–5000. */
const guestsField = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) return undefined;
  const n = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(n) ? n : value;
}, z.number({ error: 'guests' }).int({ error: 'guests' }).min(1, { error: 'guests' }).max(5000, { error: 'guests' }).optional());

// ---------------------------------------------------------------------------
// The enquiry schema
// ---------------------------------------------------------------------------

export const enquirySchema = z.object({
  // Step 1 — Termin & Ort
  eventDate: z
    .string({ error: 'required' })
    .min(1, { error: 'required' })
    .refine((v) => isValidIsoDate(v), { error: 'date' })
    .refine((v) => isFutureIsoDate(v), { error: 'date' }),
  /**
   * Optional seit dem Verschlanken des Formulars: Das Pflicht-Dropdown „Art
   * der Feier" ist auf Kundenwunsch aus Schritt 1 entfernt worden, damit dort
   * nur noch Kalender, Stadt und Location stehen.
   *
   * Das Feld bleibt im Schema — und in der `enquiries`-Collection —, statt
   * gelöscht zu werden: bereits eingegangene Anfragen tragen den Wert, und der
   * WhatsApp-Flow erfasst ihn weiterhin über seine eigenen Chips. Nur die
   * Pflicht fällt weg. `templates.ts` lässt die Zeile aus, wenn nichts da ist.
   */
  eventType: optionalEnum(eventTypeValues),
  city: z.string({ error: 'required' }).trim().min(1, { error: 'required' }).max(120, { error: 'max' }),
  venue: optionalTrimmedString(160),

  // Step 2 — Details
  guests: guestsField,
  startTime: optionalTimeString,
  endTime: optionalTimeString,
  package: optionalEnum(packageValues),
  budget: optionalEnum(budgetValues),
  services: z.array(z.enum(serviceValues)).optional(),
  hostingLanguage: optionalEnum(hostingLanguageValues),

  // Step 3 — Kontakt
  firstName: z.string({ error: 'required' }).trim().min(1, { error: 'required' }).max(120, { error: 'max' }),
  lastName: z.string({ error: 'required' }).trim().min(1, { error: 'required' }).max(120, { error: 'max' }),
  partnerName: optionalTrimmedString(120),
  email: z.email({ error: 'email' }),
  phone: z.string({ error: 'required' }).trim().min(6, { error: 'min' }).max(40, { error: 'max' }),
  message: optionalTrimmedString(2000),
  source: optionalEnum(sourceValues),
  consent: z.literal(true, { error: 'consent' }),

  // Anti-spam — rendered but visually + a11y hidden; must stay empty.
  [HONEYPOT_FIELD]: z.string().max(0).optional(),
});

/** Shape as produced by native form inputs (strings) before zod coercion. */
export type EnquiryFormInput = z.input<typeof enquirySchema>;
/** Shape after zod parsing (guests as number, empty optionals as undefined). */
export type EnquiryOutput = Omit<z.output<typeof enquirySchema>, typeof HONEYPOT_FIELD>;

/** RHF `defaultValues` — every field present so inputs stay controlled from the start. */
export const enquiryDefaultValues: EnquiryFormInput = {
  eventDate: '',
  eventType: undefined,
  city: '',
  venue: '',
  guests: '' as unknown as number,
  startTime: '',
  endTime: '',
  package: undefined,
  budget: undefined,
  services: [],
  hostingLanguage: undefined,
  firstName: '',
  lastName: '',
  partnerName: '',
  email: '',
  phone: '',
  message: '',
  source: undefined,
  consent: false as unknown as true,
  [HONEYPOT_FIELD]: '',
};

// ---------------------------------------------------------------------------
// Per-step field grouping — lets the form validate/advance one step at a time
// via `trigger(stepFields)` without surfacing errors for unreached fields.
// ---------------------------------------------------------------------------

export const step1Fields = ['eventDate', 'city', 'venue'] as const;
export const step2Fields = ['services'] as const;
export const step3Fields = ['firstName', 'lastName', 'email', 'phone', 'message', 'consent'] as const;

export const stepFieldGroups = [step1Fields, step2Fields, step3Fields] as const;

/** Keys of `booking.steps`, in order — shared by the progress indicator and the live-region announcer. */
export const stepKeys = ['date', 'details', 'contact'] as const;

// ---------------------------------------------------------------------------
// Availability status — the plain *type* only. The DB-backed check itself
// (`getAvailabilityStatus`) lives in `src/lib/availability-status.ts`, a
// `server-only`-guarded sibling module, precisely so this file — imported by
// every client component in the booking form — never pulls in the Payload
// runtime. See that file for `/api/availability` and the lead-scoring use.
// ---------------------------------------------------------------------------

export type AvailabilityStatus = 'free' | 'taken' | 'unknown' | 'past';
