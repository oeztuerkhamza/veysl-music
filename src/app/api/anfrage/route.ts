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
import { getEnquiryTransport, type EnquiryTransport } from './_lib/transport';

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
    // NB: the transport is deliberately NOT built here. `getEnquiryTransport()`
    // constructs a `MailSender`, and both real senders throw from their
    // constructor when a credential is missing or malformed (a blank
    // `SMTP_PORT` is enough — `Number('')` is 0). Built at this point, that
    // throw would land in the outer catch below, return a 500, and take the
    // enquiry down with it *before* the database write further down had run:
    // one typo in `.env` and every submission is destroyed rather than
    // merely un-notified. It is built after persisting instead — see there.
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

    // The owner notification used to be fatal — a 502 and "Das hat leider
    // nicht geklappt." in the visitor's face — on the reasoning that a lead
    // which never reaches the DJ is a lost booking.
    //
    // That reasoning skips the line above it: the enquiry is already in the
    // database at this point. The lead is not lost, it is sitting in
    // /admin under Anfragen with status `new`. What the old behaviour lost
    // was the *couple*: someone who filled in a three-step form, was told it
    // failed, and now either submits again — creating a duplicate of a row
    // that saved fine — or goes to a competitor. A mail outage on our side
    // became a conversion failure on theirs.
    //
    // So: persistence is what decides the response. A failed notification is
    // logged at error level (it is a real incident, and the mail setup needs
    // fixing) but the visitor is told the truth, which is that their enquiry
    // arrived.
    let ownerNotified = true;
    let customerNotified = true;

    // Constructing the transport is itself a step that can throw (see the note
    // where `ctx` is built). Now that the enquiry is safely persisted, that
    // throw costs the two notifications and nothing else.
    let transport: EnquiryTransport | undefined;
    try {
      transport = getEnquiryTransport();
    } catch (err) {
      ownerNotified = false;
      customerNotified = false;
      console.error(
        '[anfrage] mail transport unavailable (check BOOKING_TRANSPORT and its credentials) — enquiry IS saved, check /admin → Anfragen',
        err instanceof Error ? err.message : err,
      );
    }

    if (transport) {
      try {
        await transport.notifyOwner(ctx);
      } catch (err) {
        ownerNotified = false;
        console.error(
          '[anfrage] owner notification failed — enquiry IS saved, check /admin → Anfragen',
          err instanceof Error ? err.message : err,
        );
      }
    }

    // The customer auto-reply is a nice-to-have; don't fail the request over it.
    //
    // It is, however, the piece that goes *outward* — the owner notification
    // goes to BOOKING_NOTIFY_EMAIL, which on the self-hosted setup is a
    // mailbox on the very same Postfix and is delivered locally, while this
    // one has to reach gmail.com/gmx.de/web.de over the open internet. So
    // "the enquiry reached me but the couple never got their confirmation" is
    // the expected shape of a half-broken mail server, not an odd edge case,
    // and it needs to be as visible as the owner side. Logging the recipient
    // *domain* (never the address — that is personal data) is what makes a
    // pattern like "every external domain fails, dj-veys.de succeeds"
    // readable straight from the logs.
    if (transport) {
      try {
        await transport.sendCustomerAutoReply(ctx);
      } catch (err) {
        customerNotified = false;
        const domain = enquiry.email.split('@')[1] ?? '(unparsable)';
        console.error(
          `[anfrage] customer auto-reply failed — recipient domain=${domain}`,
          err instanceof Error ? err.message : err,
        );
      }
    }

    // Both flags are reported, not acted on by the client: the funnel shows
    // its success state either way. They exist so a failure is visible to
    // anyone curling the endpoint or reading an access log, instead of a
    // silent 200 that hides a broken mail server.
    return NextResponse.json({ ok: true, ownerNotified, customerNotified }, { status: 200 });
  } catch (err) {
    console.error('[anfrage] unexpected error', err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
