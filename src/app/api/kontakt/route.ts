/**
 * POST /api/kontakt — the general contact form submission endpoint.
 * Deliberately separate from `/api/anfrage` (the booking funnel) — see
 * `src/lib/contact.ts` and `src/payload/collections/contact-messages.ts`
 * for why.
 *
 * Persist-first: the DB write (Local API `payload.create`) is the one fatal
 * step — a message that never reaches the admin panel is lost for good.
 * Both the owner notification and the sender's confirmation are best-effort
 * and never fail the request, matching "the message must never be lost
 * because mail failed" from the brief.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSite } from '@/content/get-site';
import { locales } from '@/i18n/routing';
import { CONTACT_HONEYPOT_FIELD, contactMessageSchema, type ContactMessageOutput } from '@/lib/contact';
import { getPayloadClient } from '@/lib/payload';
import { recordTransportUnavailable, runNotification } from '../_lib/notify';
import { getClientIp, isRateLimited } from '../_lib/rate-limit';
import { getContactTransport, type ContactTransport } from '../anfrage/_lib/transport';

export const dynamic = 'force-dynamic';

const requestSchema = contactMessageSchema.extend({ locale: z.enum(locales) });

function redact(value: string, keep = 2): string {
  if (value.length <= keep) return '*'.repeat(value.length);
  return `${value.slice(0, keep)}${'*'.repeat(Math.max(value.length - keep, 3))}`;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  try {
    if (isRateLimited(`kontakt:${ip}`, { capacity: 5, windowMs: 10 * 60_000 })) {
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
      const honeypotFilled = parsed.error.issues.some((issue) => issue.path[0] === CONTACT_HONEYPOT_FIELD);
      if (honeypotFilled) {
        console.warn(`[kontakt] rejected (honeypot) ip=${ip}`);
        return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 });
      }

      const fields: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === 'string' && !(key in fields)) fields[key] = issue.message;
      }
      return NextResponse.json({ ok: false, error: 'validation', fields }, { status: 400 });
    }

    const { locale, [CONTACT_HONEYPOT_FIELD]: honeypot, ...message } = parsed.data;
    void honeypot; // always '' here — safeParse already enforced max(0)

    const submittedAt = new Date().toISOString();
    const typedMessage = message as ContactMessageOutput;

    console.info(
      `[kontakt] received subject=${typedMessage.subject} email=${redact(typedMessage.email)} locale=${locale}`
    );

    // Persist first — this write is the only fatal step (see file header).
    try {
      const payload = await getPayloadClient();
      await payload.create({
        collection: 'contact-messages',
        data: { ...typedMessage, locale, status: 'new' },
      });
    } catch (err) {
      console.error('[kontakt] failed to persist message', err instanceof Error ? err.message : err);
      return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
    }

    const ctx = { message: typedMessage, locale, submittedAt };

    // Owner notification + sender confirmation are both best-effort from here on.
    //
    // Including the *construction* of the transport, which is a step that can
    // throw in its own right: both real senders validate their credentials in
    // their constructor and throw when one is missing or malformed. Left
    // outside a try (as it was), that throw reached the outer catch and turned
    // an already-saved message into a 500 — the visitor is told it failed and
    // writes again, while the original sits in /admin. Persist-first, promised
    // in this file's header, only holds if everything after the write is
    // caught.
    // Both start at `false` and only become true on a delivery that really
    // happened — see the same reasoning spelled out in /api/anfrage's route:
    // with `BOOKING_TRANSPORT=console` every `send()` on the site is a
    // `console.log` that resolves, so a flag that starts at `true` reports
    // success for mail nobody received. `runNotification` owns that rule.
    let ownerNotified = false;
    let senderConfirmed = false;

    let transport: ContactTransport | undefined;
    try {
      transport = getContactTransport();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        '[kontakt] mail transport unavailable (check BOOKING_TRANSPORT and its credentials) — message IS saved, check /admin',
        message,
      );
      recordTransportUnavailable(['kontakt:owner', 'kontakt:sender'], message);
    }

    if (transport) {
      // Bound to a const so the closures below keep the narrowing.
      const mail = transport;

      // `getSite()` resolves the owner address rather than hardcoding it. It
      // fails soft to the static defaults in src/content/site.ts, but it is
      // still awaited inside a guard: everything past the persist above must
      // be incapable of reaching the outer catch and turning a saved message
      // into a 500 the visitor is told to retry.
      let ownerEmail: string | undefined;
      try {
        ownerEmail = (await getSite()).contact.email;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[kontakt] could not resolve the owner address — message IS saved, check /admin', message);
        recordTransportUnavailable(['kontakt:owner'], message);
      }

      if (ownerEmail) {
        const to = ownerEmail;
        ownerNotified = await runNotification({
          channel: 'kontakt:owner',
          transport: mail,
          recipient: to,
          label: '[kontakt] owner notification (message IS saved, check /admin)',
          send: () => mail.notifyOwner(ctx, to),
        });
      }

      senderConfirmed = await runNotification({
        channel: 'kontakt:sender',
        transport: mail,
        recipient: typedMessage.email,
        label: '[kontakt] sender confirmation',
        send: () => mail.sendConfirmation(ctx),
      });
    }

    // Reported for the same reason as on /anfrage: without these, a broken
    // mail server is indistinguishable from a healthy one at the API boundary.
    return NextResponse.json({ ok: true, ownerNotified, senderConfirmed }, { status: 200 });
  } catch (err) {
    console.error('[kontakt] unexpected error', err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
