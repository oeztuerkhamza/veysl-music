import { NextRequest, NextResponse } from 'next/server';
import { getBlockedDates, getBlockedDatesInMonth } from '@/content/availability';
import { getClientIp, isRateLimited } from '../../_lib/rate-limit';

export const dynamic = 'force-dynamic';

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * GET /api/availability/calendar?month=YYYY-MM
 *
 * Whole-month data for `src/components/booking/availability-calendar.tsx`,
 * so the grid doesn't need one round-trip per visible day. Same honesty
 * rule as `/api/availability`: `hasData: false` means "we don't know
 * anything yet" — the calendar must render every day as unknown, never as
 * free, when this is false (see src/content/availability.ts).
 */
export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited(`availability-calendar:${ip}`, { capacity: 60, windowMs: 60_000 })) {
    return NextResponse.json(
      { hasData: false, blockedDates: [], error: 'rate_limited' },
      { status: 429, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const month = request.nextUrl.searchParams.get('month');
  if (!month || !MONTH_PATTERN.test(month)) {
    return NextResponse.json(
      { hasData: false, blockedDates: [], error: 'invalid_month' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const [allBlocked, monthBlocked] = await Promise.all([getBlockedDates(), getBlockedDatesInMonth(month)]);

  return NextResponse.json(
    { month, hasData: allBlocked.length > 0, blockedDates: monthBlocked },
    { status: 200, headers: { 'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=300' } }
  );
}
