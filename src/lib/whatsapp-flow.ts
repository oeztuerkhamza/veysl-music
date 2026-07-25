/**
 * WhatsApp pre-qualification flow — shared, client-safe domain logic (no
 * Payload/DB imports; used directly by the modal component). See
 * `src/components/whatsapp/whatsapp-prequalify-modal.tsx` for the UI and
 * `src/app/api/whatsapp-lead/route.ts` for the fire-and-forget capture.
 *
 * Deliberately its own small vocabulary, not a reuse of `eventTypeValues`/
 * `serviceValues` from `src/lib/booking.ts`: this is a fast tap-only
 * pre-filter with a shorter, coarser option set (chips, not a full form).
 */
import { z } from 'zod';
import { isValidIsoDate } from './booking';

/** Keys of `whatsappFlow.steps.eventType.options` — reuses the wording of `booking.eventTypes` for the five occasions this quick flow offers. */
export const whatsappEventTypeValues = ['wedding', 'engagement', 'henna', 'corporate', 'other'] as const;
export type WhatsappEventType = (typeof whatsappEventTypeValues)[number];

/** Keys of `whatsappFlow.steps.guests.options`. */
export const whatsappGuestsRangeValues = ['under80', 'from80to150', 'from150to250', 'over250'] as const;
export type WhatsappGuestsRange = (typeof whatsappGuestsRangeValues)[number];

/** Keys of `whatsappFlow.steps.service.options`. */
export const whatsappServiceValues = ['dj', 'djOrchestra', 'hosting', 'technik'] as const;
export type WhatsappService = (typeof whatsappServiceValues)[number];

/** Every entry point that can open the modal — stored with the lead so triage knows where it came from. */
export const whatsappSourceValues = ['fab', 'stickyCta', 'contactPage', 'bookingSuccess'] as const;
export type WhatsappSource = (typeof whatsappSourceValues)[number];

export interface WhatsappLeadAnswers {
  eventType?: WhatsappEventType;
  eventDate?: string;
  city?: string;
  guestsRange?: WhatsappGuestsRange;
  service?: WhatsappService;
}

export const whatsappLeadSchema = z.object({
  eventType: z.enum(whatsappEventTypeValues).optional(),
  eventDate: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : v),
    z
      .string()
      .refine((v) => isValidIsoDate(v), { error: 'date' })
      .optional()
  ),
  city: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : v),
    z.string().trim().max(160).optional()
  ),
  guestsRange: z.enum(whatsappGuestsRangeValues).optional(),
  service: z.enum(whatsappServiceValues).optional(),
  source: z.enum(whatsappSourceValues),
});

export type WhatsappLeadInput = z.output<typeof whatsappLeadSchema>;

/** sessionStorage key the modal persists partial answers under, so a re-open doesn't start over. */
export const WHATSAPP_FLOW_STORAGE_KEY = 'veysl:whatsapp-prequalify';
