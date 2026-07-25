import { getTranslations } from 'next-intl/server';
import { CalendarClock } from 'lucide-react';
import { getBlockedDates } from '@/content/availability';
import { site } from '@/content/site';
import { todayIsoDate } from '@/lib/booking';
import { cn } from '@/lib/utils';

/**
 * Honest, real-data loss-aversion note per `.claude/CONTRACT.md`'s brief
 * ("Saturdays in season fill up, using the real blocked-date data... Never a
 * fake countdown or invented scarcity"). Counts already-blocked upcoming
 * Saturdays in the current season year from `getBlockedDates()` — the exact
 * same CMS-backed source the booking calendar itself reads
 * (`src/content/availability.ts`, owned by the booking agent; this file only
 * ever reads its exported function, never writes to it).
 *
 * Renders nothing if there's no real signal: an empty blocklist (meaning "we
 * don't know", not "everything is free" — see that file's own doc comment)
 * or zero blocked Saturdays. No invented season boundaries, no percentage,
 * no countdown — just the one real, defensible number.
 */
export async function SeasonScarcity({ className }: { className?: string }) {
  const t = await getTranslations('cro');
  const blocked = await getBlockedDates();
  if (blocked.length === 0) return null;

  const today = todayIsoDate();
  const year = site.season.year;
  const yearPrefix = String(year);

  const blockedSaturdays = blocked.filter((iso) => {
    if (iso < today || !iso.startsWith(yearPrefix)) return false;
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d)).getUTCDay() === 6; // Saturday, UTC-safe like isValidIsoDate() in src/lib/booking.ts
  }).length;

  if (blockedSaturdays === 0) return null;

  return (
    <p className={cn('inline-flex items-start gap-2 text-sm text-ink-muted', className)}>
      <CalendarClock className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
      {t('seasonScarcity', { count: blockedSaturdays, year })}
    </p>
  );
}
