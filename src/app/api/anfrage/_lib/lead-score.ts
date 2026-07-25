import { getAvailabilityStatus } from '@/lib/availability-status';
import { daysUntil, type EnquiryOutput } from '@/lib/booking';

export type LeadTier = 'hot' | 'warm' | 'cold';

export interface LeadScore {
  score: number;
  tier: LeadTier;
  /** Human-readable factor breakdown — included in the owner notification so triage is fast. */
  reasons: string[];
}

/**
 * Heuristic lead score (project plan A.6 "lead qualification"). Not a hard
 * business rule, just a triage aid for the DJ's inbox — every enquiry is
 * still delivered and answered regardless of tier.
 *
 * Factors (max ~82 points):
 *  - Date availability   free +15 / taken -10 / unknown 0
 *  - Lead time           <30d +20 / 30-90d +10 / 90-180d +5 / >180d 0
 *  - Guest count         150+ +15 / 80-149 +10 / 30-79 +5 / <30 or unknown 0
 *  - Budget              d(>4000€) +20 / c +15 / b +8 / a +2 / unsure 0
 *  - Completeness        +2 each for venue, message, partnerName, package,
 *                         services, hostingLanguage — capped at +12
 *
 * Tiers: hot >= 45, warm >= 20, else cold.
 */
export async function scoreEnquiry(enquiry: EnquiryOutput): Promise<LeadScore> {
  let score = 0;
  const reasons: string[] = [];

  const availability = await getAvailabilityStatus(enquiry.eventDate);
  if (availability === 'free') {
    score += 15;
    reasons.push('Termin ist laut Liste frei (+15)');
  } else if (availability === 'taken') {
    score -= 10;
    reasons.push('Termin ist laut Liste bereits vergeben (-10, Warteliste)');
  } else {
    reasons.push('Verfügbarkeit unbekannt (0)');
  }

  const lead = daysUntil(enquiry.eventDate);
  if (lead < 30) {
    score += 20;
    reasons.push(`Nur ${lead} Tage bis zur Feier (+20, dringend)`);
  } else if (lead < 90) {
    score += 10;
    reasons.push(`${lead} Tage Vorlauf (+10)`);
  } else if (lead < 180) {
    score += 5;
    reasons.push(`${lead} Tage Vorlauf (+5)`);
  } else {
    reasons.push(`${lead} Tage Vorlauf (0, noch früh in der Planung)`);
  }

  const guests = enquiry.guests;
  if (guests !== undefined) {
    if (guests >= 150) {
      score += 15;
      reasons.push(`${guests} Gäste (+15)`);
    } else if (guests >= 80) {
      score += 10;
      reasons.push(`${guests} Gäste (+10)`);
    } else if (guests >= 30) {
      score += 5;
      reasons.push(`${guests} Gäste (+5)`);
    } else {
      reasons.push(`${guests} Gäste (0)`);
    }
  } else {
    reasons.push('Gästezahl nicht angegeben (0)');
  }

  const budgetPoints: Record<NonNullable<EnquiryOutput['budget']>, number> = {
    d: 20,
    c: 15,
    b: 8,
    a: 2,
    unsure: 0,
  };
  if (enquiry.budget) {
    const points = budgetPoints[enquiry.budget];
    score += points;
    reasons.push(`Budget "${enquiry.budget}" (+${points})`);
  } else {
    reasons.push('Kein Budget angegeben (0)');
  }

  let completeness = 0;
  if (enquiry.venue) completeness += 2;
  if (enquiry.message && enquiry.message.trim().length >= 10) completeness += 2;
  if (enquiry.partnerName) completeness += 2;
  if (enquiry.package) completeness += 2;
  if (enquiry.services && enquiry.services.length > 0) completeness += 2;
  if (enquiry.hostingLanguage) completeness += 2;
  completeness = Math.min(completeness, 12);
  score += completeness;
  reasons.push(`Vollständigkeit optionaler Felder (+${completeness})`);

  const tier: LeadTier = score >= 45 ? 'hot' : score >= 20 ? 'warm' : 'cold';

  return { score, tier, reasons };
}
