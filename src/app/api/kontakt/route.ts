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
    let ownerNotified = true;
    let senderConfirmed = true;

    let transport: ContactTransport | undefined;
    try {
      transport = getContactTransport();
    } catch (err) {
      ownerNotified = false;
      senderConfirmed = false;
      console.error(
        '[kontakt] mail transport unavailable (check BOOKING_TRANSPORT and its credentials) — message IS saved, check /admin',
        err instanceof Error ? err.message : err,
      );
    }

    if (transport) {
      try {
        const site = await getSite();
        await transport.notifyOwner(ctx, site.contact.email);
      } catch (err) {
        ownerNotified = false;
        console.error('[kontakt] owner notification failed — message IS saved, check /admin', err instanceof Error ? err.message : err);
      }

      try {
        await transport.sendConfirmation(ctx);
      } catch (err) {
        senderConfirmed = false;
        // Recipient *domain* only — the address itself is personal data. A run
        // of failures that all share an external domain is the signature of a
        // mailserver that delivers locally but not to the outside world.
        const domain = typedMessage.email.split('@')[1] ?? '(unparsable)';
        console.error(`[kontakt] sender confirmation failed — recipient domain=${domain}`, err instanceof Error ? err.message : err);
      }
    }

    // Reported for the same reason as on /anfrage: without these, a broken
    // mail server is indistinguishable from a healthy one at the API boundary.
    return NextResponse.json({ ok: true, ownerNotified, senderConfirmed }, { status: 200 });
  } catch (err) {
    console.error('[kontakt] unexpected error', err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
