/**
 * General contact form (`/kontakt`) domain logic — deliberately separate
 * from `src/lib/booking.ts`. `/anfrage` asks for a wedding date and produces
 * a scored lead; `/kontakt` is for everyone else (venues, planners, press,
 * an AV rental question, a single question before someone is ready to
 * enquire). Same validation shape/conventions as `booking.ts` on purpose —
 * validation messages are **message keys** resolved via
 * `useTranslations('contactForm.validation')`, kept in sync with
 * `messages/{de,en}.json`.
 */
import { z } from 'zod';
import { isValidIsoDate } from './booking';

/** Keys of `contactForm.subjects`. Mirrors the literal option list duplicated in `src/payload/collections/contact-messages.ts` — keep both in sync by hand (see that file's header for why it isn't imported). */
export const contactSubjectValues = ['general', 'booking', 'technical', 'partnership', 'press', 'other'] as const;
export type ContactSubject = (typeof contactSubjectValues)[number];

/** Keys of `contactForm.preferredContactOptions`. */
export const contactPreferredChannelValues = ['email', 'phone', 'whatsapp'] as const;
export type ContactPreferredChannel = (typeof contactPreferredChannelValues)[number];

/**
 * Rendered but hidden anti-spam field. Deliberately NOT named `company` —
 * unlike the booking form, this form has a *real* optional "company / venue
 * name" field, so the honeypot needs its own, different key.
 */
export const CONTACT_HONEYPOT_FIELD = 'website' as const;

function emptyToUndefined(value: unknown) {
  return value === '' || value === null || value === undefined ? undefined : value;
}

const optionalTrimmedString = (max: number) =>
  z.preprocess(emptyToUndefined, z.string().trim().max(max, { error: 'max' }).optional());

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(emptyToUndefined, z.enum(values, { error: 'required' }).optional());

export const contactMessageSchema = z.object({
  firstName: z.string({ error: 'required' }).trim().min(1, { error: 'required' }).max(120, { error: 'max' }),
  lastName: z.string({ error: 'required' }).trim().min(1, { error: 'required' }).max(120, { error: 'max' }),
  email: z.email({ error: 'email' }),
  subject: z.enum(contactSubjectValues, { error: 'required' }),
  message: z.string({ error: 'required' }).trim().min(10, { error: 'min' }).max(4000, { error: 'max' }),

  phone: optionalTrimmedString(40),
  company: optionalTrimmedString(160),
  preferredContact: optionalEnum(contactPreferredChannelValues),
  eventDate: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .refine((v) => isValidIsoDate(v), { error: 'date' })
      .optional()
  ),

  consent: z.literal(true, { error: 'consent' }),

  [CONTACT_HONEYPOT_FIELD]: z.string().max(0).optional(),
});

/** Shape as produced by native form inputs (strings) before zod coercion. */
export type ContactFormInput = z.input<typeof contactMessageSchema>;
/** Shape after zod parsing. */
export type ContactMessageOutput = Omit<z.output<typeof contactMessageSchema>, typeof CONTACT_HONEYPOT_FIELD>;

/** RHF `defaultValues` — every field present so inputs stay controlled from the start. */
export const contactDefaultValues: ContactFormInput = {
  firstName: '',
  lastName: '',
  email: '',
  subject: undefined as unknown as ContactSubject,
  message: '',
  phone: '',
  company: '',
  preferredContact: undefined,
  eventDate: '',
  consent: false as unknown as true,
  [CONTACT_HONEYPOT_FIELD]: '',
};
