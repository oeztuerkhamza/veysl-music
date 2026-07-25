import { getAvailabilityStatus } from '@/lib/availability-status';
import { daysUntil } from '@/lib/booking';
import type { WhatsappLeadInput } from '@/lib/whatsapp-flow';

export interface WhatsappLeadScore {
  score: number;
  tier: 'cold' | 'hot' | 'warm';
}

/**
 * Trimmed version of `scoreEnquiry` (src/app/api/anfrage/_lib/lead-score.ts)
 * — reuses the same availability/lead-time signals where they overlap, but
 * this flow never collects budget, guest count as an exact number, or
 * multiple services, so those factors don't apply. Every field is optional
 * (the visitor may have skipped every question), so this degrades to a flat
 * 0/cold for an all-skipped submission rather than erroring.
 */
export async function scoreWhatsappLead(input: WhatsappLeadInput): Promise<WhatsappLeadScore> {
  let score = 0;

  if (input.eventDate) {
    const availability = await getAvailabilityStatus(input.eventDate);
    if (availability === 'free') score += 15;
    else if (availability === 'taken') score -= 5;

    const lead = daysUntil(input.eventDate);
    if (lead >= 0) {
      if (lead < 30) score += 15;
      else if (lead < 90) score += 8;
      else if (lead < 180) score += 4;
    }
  }

  if (input.guestsRange === 'over250') score += 12;
  else if (input.guestsRange === 'from150to250') score += 8;
  else if (input.guestsRange === 'from80to150') score += 4;

  if (input.service === 'djOrchestra') score += 6;
  if (input.city) score += 2;

  const tier: WhatsappLeadScore['tier'] = score >= 30 ? 'hot' : score >= 12 ? 'warm' : 'cold';
  return { score, tier };
}
