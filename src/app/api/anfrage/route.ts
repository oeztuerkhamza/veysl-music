/**
 * POST /api/anfrage — the booking enquiry submission endpoint.
 *
 * Env vars a real deployment needs (see `.env.example` at the repo root):
 *   BOOKING_TRANSPORT       "console" (default, dev-only) | future: "resend" | "smtp"
 *   BOOKING_NOTIFY_EMAIL    owner inbox the enquiry notification goes to
 *   RESEND_API_KEY          once BOOKING_TRANSPORT=resend is implemented
 *   SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS   if a plain-SMTP transport is added instead
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { locales } from '@/i18n/routing';
import { enquirySchema, HONEYPOT_FIELD, type EnquiryOutput } from '@/lib/booking';
import { getPayloadClient } from '@/lib/payload';
import { getClientIp, isRateLimited } from '../_lib/rate-limit';
import { scoreEnquiry } from './_lib/lead-score';
import { getEnquiryTransport } from './_lib/transport';

export const dynamic = 'force-dynamic';

const requestSchema = enquirySchema.extend({ locale: z.enum(locales) });

/** Short redacted fingerprint for logs — never the full email/phone. */
function redact(value: string, keep = 2): string {
  if (value.length <= keep) return '*'.repeat(value.length);
  return `${value.slice(0, keep)}${'*'.repeat(Math.max(value.length - keep, 3))}`;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  try {
    if (isRateLimited(`anfrage:${ip}`, { capacity: 5, windowMs: 10 * 60_000 })) {
      return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
    }

    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
    }

    const parsed = requestSchema.safeParse(raw);
    if (!parsed.success) {
      const honeypotFilled = parsed.error.issues.some((issue) => issue.path[0] === HONEYPOT_FIELD);
      if (honeypotFilled) {
        // Don't reveal the anti-spam mechanism to whatever filled it in.
        console.warn(`[anfrage] rejected (honeypot) ip=${ip}`);
        return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 });
      }

      const fields: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === 'string' && !(key in fields)) fields[key] = issue.message;
      }
      return NextResponse.json({ ok: false, error: 'validation', fields }, { status: 400 });
    }

    const { locale, [HONEYPOT_FIELD]: honeypot, ...enquiry } = parsed.data;
    void honeypot; // always '' here — safeParse already enforced max(0)

    const typedEnquiry = enquiry as EnquiryOutput;
    const score = await scoreEnquiry(typedEnquiry);
    const transport = getEnquiryTransport();
    const ctx = {
      enquiry: typedEnquiry,
      score,
      locale,
      submittedAt: new Date().toISOString(),
    };

    console.info(
      `[anfrage] received tier=${score.tier} score=${score.score} date=${enquiry.eventDate} city=${enquiry.city} email=${redact(enquiry.email)} phone=${redact(enquiry.phone)}`
    );

    // Persist first — an enquiry the admin panel never sees is as lost as
    // one the owner never got emailed about, so this write is fatal too.
    try {
      const payload = await getPayloadClient();
      await payload.create({
        collection: 'enquiries',
        data: { ...typedEnquiry, locale, leadScore: score.score, leadTier: score.tier, status: 'new' },
      });
    } catch (err) {
      console.error('[anfrage] failed to persist enquiry', err instanceof Error ? err.message : err);
      return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
    }

    // The owner notification is the point of this endpoint — a lead that
    // never reaches the DJ is a lost booking, so its failure is fatal.
    try {
      await transport.notifyOwner(ctx);
    } catch (err) {
      console.error('[anfrage] owner notification failed', err instanceof Error ? err.message : err);
      return NextResponse.json({ ok: false, error: 'delivery_failed' }, { status: 502 });
    }

    // The customer auto-reply is a nice-to-have; don't fail the request over it.
    try {
      await transport.sendCustomerAutoReply(ctx);
    } catch (err) {
      console.warn('[anfrage] customer auto-reply failed', err instanceof Error ? err.message : err);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('[anfrage] unexpected error', err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
