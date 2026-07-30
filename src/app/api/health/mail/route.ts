/**
 * GET /api/health/mail — "why is no enquiry mail going out?", answerable
 * without SSH access to the server.
 *
 * Why this exists: every failure on the mail path was already logged, and
 * `scripts/mail-test.mjs` already separates "wrong password" from "host
 * unreachable" from "accepted but never delivered". Both need a shell on the
 * VPS. That is the wrong requirement for the single question most likely to be
 * asked in a hurry — a couple submitted an enquiry, no mail arrived, is the
 * lead lost? — so the same checks are exposed over HTTP here, and
 * `.github/workflows/mail-doctor.yml` runs them on a schedule.
 *
 * Auth: `Authorization: Bearer $MAIL_HEALTH_TOKEN`. Header only, never a query
 * parameter: query strings are written to nginx's access log, and a
 * long-lived token in a log file is a token that leaks.
 *
 * The response is a 200 whenever the caller is authorised, including when
 * everything is broken — the verdict is the `ok` field and the `problems`
 * array. A diagnostic that answers with a 503 cannot be read by
 * `curl --fail`, and "the check itself failed" would be indistinguishable
 * from "the check ran and found the mail server down".
 *
 * Never returns a secret, a customer address or a message body. Addresses are
 * reduced to their domain and secrets to their length — see `ConfigEntry`.
 */
import { createHash, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, isRateLimited } from '../../_lib/rate-limit';
import { diagnoseMail } from './_lib/diagnose';

export const dynamic = 'force-dynamic';

/**
 * Constant-time comparison, so a wrong token cannot be found one byte at a
 * time. Compared as SHA-256 digests rather than raw bytes for one reason:
 * `timingSafeEqual` throws when the two buffers differ in length, and both
 * handling that separately and letting it throw would leak the expected
 * token's length. Digests are always 32 bytes.
 */
function tokenMatches(provided: string, expected: string): boolean {
  return timingSafeEqual(
    createHash('sha256').update(provided).digest(),
    createHash('sha256').update(expected).digest()
  );
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);

  // Tighter than the form endpoints: a legitimate caller is a cron job, and
  // the SMTP probe below opens a real connection to the mailserver. This is
  // also what keeps the endpoint from being useful for guessing the token.
  if (isRateLimited(`health-mail:${ip}`, { capacity: 10, windowMs: 10 * 60_000 })) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  const expected = process.env.MAIL_HEALTH_TOKEN?.trim();
  if (!expected) {
    // Deliberately not a 404. An operator who has just added the workflow
    // needs to tell "the endpoint is not deployed yet" apart from "the token
    // is not set", and hiding the difference costs more than the obscurity is
    // worth — the endpoint reveals nothing without the token either way.
    return NextResponse.json(
      {
        ok: false,
        error: 'health_check_disabled',
        detail: 'MAIL_HEALTH_TOKEN is not set on the server. Add it to /opt/veysl/app/.env and run `docker compose up -d app`.',
      },
      { status: 503 }
    );
  }

  const header = request.headers.get('authorization') ?? '';
  const provided = header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : '';
  if (!provided || !tokenMatches(provided, expected)) {
    console.warn(`[health/mail] rejected (bad or missing token) ip=${ip}`);
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const diagnosis = await diagnoseMail();
  return NextResponse.json(diagnosis, {
    status: 200,
    // Belt and braces next to `force-dynamic`: this must never be served from
    // a CDN or proxy cache, or a scheduled check would happily report
    // yesterday's state as today's.
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
