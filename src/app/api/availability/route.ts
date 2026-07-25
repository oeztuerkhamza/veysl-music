import { NextRequest, NextResponse } from 'next/server';
import { getAvailabilityStatus } from '@/lib/availability-status';
import { isValidIsoDate } from '@/lib/booking';
import { getClientIp, isRateLimited } from '../_lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * GET /api/availability?date=YYYY-MM-DD
 *
 * Returns `{ status: 'free' | 'taken' | 'unknown' | 'past' }`. No personal
 * data is accepted here — only the date — so this endpoint stays cheap to
 * call live while the visitor types (see `src/components/booking`).
 */
export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited(`availability:${ip}`, { capacity: 30, windowMs: 60_000 })) {
    return NextResponse.json(
      { status: 'unknown', error: 'rate_limited' },
      { status: 429, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const date = request.nextUrl.searchParams.get('date');

  if (!date || !isValidIsoDate(date)) {
    return NextResponse.json(
      { status: 'unknown', error: 'invalid_date' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const status = await getAvailabilityStatus(date);

  return NextResponse.json({ status }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
}
