/**
 * POST /api/whatsapp-lead — fire-and-forget capture from the WhatsApp
 * pre-qualification modal, posted right before the visitor is redirected to
 * `wa.me`. The client never awaits this before redirecting (see
 * `src/components/whatsapp/whatsapp-prequalify-modal.tsx`), so this route
 * must stay fast and must never be the reason the redirect is slow — but it
 * still validates and rate-limits like every other public endpoint.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { locales } from '@/i18n/routing';
import { getPayloadClient } from '@/lib/payload';
import { whatsappLeadSchema } from '@/lib/whatsapp-flow';
import { getClientIp, isRateLimited } from '../_lib/rate-limit';
import { scoreWhatsappLead } from './_lib/lead-score';

export const dynamic = 'force-dynamic';

const requestSchema = whatsappLeadSchema.extend({ locale: z.enum(locales) });

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  try {
    if (isRateLimited(`whatsapp-lead:${ip}`, { capacity: 15, windowMs: 10 * 60_000 })) {
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
      return NextResponse.json({ ok: false, error: 'validation' }, { status: 400 });
    }

    const { locale, ...answers } = parsed.data;
    const score = await scoreWhatsappLead(answers);

    const payload = await getPayloadClient();
    await payload.create({
      collection: 'whatsapp-leads',
      data: { ...answers, locale, leadScore: score.score, leadTier: score.tier },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('[whatsapp-lead] unexpected error', err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
