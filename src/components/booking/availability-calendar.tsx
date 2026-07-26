'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isValidIsoDate, todayIsoDate, type AvailabilityStatus } from '@/lib/booking';

interface MonthResponse {
  month?: string;
  hasData?: boolean;
  blockedDates?: string[];
}

interface MonthData {
  month: string;
  hasData: boolean;
  blockedDates: Set<string>;
}

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function monthOf(iso: string): string {
  return iso.slice(0, 7);
}

/** Monday-first weekday index (0 = Monday … 6 = Sunday). */
function mondayIndex(date: Date): number {
  return (date.getUTCDay() + 6) % 7;
}

function shiftMonth(monthIso: string, delta: number): string {
  const [year, month] = monthIso.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, '0')}`;
}

/** Full 6-row (42-cell) matrix so the grid height never jumps between months. */
function buildMonthMatrix(monthIso: string): Date[] {
  const [year, month] = monthIso.split('-').map(Number);
  const first = new Date(Date.UTC(year, month - 1, 1));
  const offset = mondayIndex(first);
  return Array.from({ length: 42 }, (_, i) => new Date(Date.UTC(year, month - 1, 1 - offset + i)));
}

function chunkWeeks(days: Date[]): Date[][] {
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

export interface AvailabilityCalendarProps {
  /** Selected ISO `YYYY-MM-DD` date, or `''`/`undefined` for none — controlled, like a native input. */
  value: string | undefined;
  /** Called with the ISO date the visitor picked. */
  onSelect: (iso: string) => void;
  /** Live-region announcer shared with the caller (e.g. the same one `AvailabilityIndicator` writes to). */
  onAnnounce: (message: string) => void;
}

/**
 * Month-grid availability calendar. Reads from the cached
 * `/api/availability/calendar` route (backed by the `BlockedDate`
 * collection). Fully keyboard-operable: arrow keys move by day, Home/End
 * jump to the start/end of the row, PageUp/PageDown change month, Enter/
 * Space selects — never a mouse-only widget.
 *
 * Deliberately **not** wired to react-hook-form itself (`value`/`onSelect`
 * props instead) so it can be reused verbatim in two different contexts:
 * step 1 of the `/anfrage` funnel (`step-date-place.tsx`, alongside — not
 * instead of — the native date input) and the WhatsApp pre-qualification
 * modal (`src/components/whatsapp/whatsapp-prequalify-modal.tsx`), which has
 * no form at all.
 *
 * Same honesty rule as the rest of the booking domain: `hasData: false`
 * (from the API) means every day renders as "unknown", never as free.
 */
export function AvailabilityCalendar({ value, onSelect, onAnnounce }: AvailabilityCalendarProps) {
  const t = useTranslations('booking.calendar');
  const locale = useLocale();
  const gridLabelId = useId();

  const eventDate = value ?? '';

  const todayIso = useMemo(() => todayIsoDate(), []);
  const currentMonthIso = monthOf(todayIso);

  const [visibleMonth, setVisibleMonth] = useState<string>(() =>
    isValidIsoDate(eventDate) && eventDate >= todayIso ? monthOf(eventDate) : currentMonthIso
  );
  const [focusedIso, setFocusedIso] = useState<string>(() =>
    isValidIsoDate(eventDate) && eventDate >= todayIso ? eventDate : todayIso
  );
  const [monthData, setMonthData] = useState<MonthData | null>(null);
  // Derived, not state: the month is "loading" exactly until `monthData` describes
  // `visibleMonth` (the fetch below always settles it, on both success and failure).
  const loading = !monthData || monthData.month !== visibleMonth;

  const cellRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const pendingFocusRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/availability/calendar?month=${visibleMonth}`)
      .then((res) => res.json())
      .then((data: MonthResponse) => {
        if (cancelled) return;
        setMonthData({ month: visibleMonth, hasData: Boolean(data.hasData), blockedDates: new Set(data.blockedDates ?? []) });
      })
      .catch(() => {
        if (!cancelled) setMonthData({ month: visibleMonth, hasData: false, blockedDates: new Set() });
      });
    return () => {
      cancelled = true;
    };
  }, [visibleMonth]);

  // Keep the visible month in sync if the visitor types a date directly into the native
  // input. Adjusted during render (not in an effect) so month + focus land in the same
  // pass — see "Adjusting state when a prop changes" in the React docs.
  const [prevEventDate, setPrevEventDate] = useState(eventDate);
  if (eventDate !== prevEventDate) {
    setPrevEventDate(eventDate);
    if (isValidIsoDate(eventDate) && eventDate >= todayIso && monthOf(eventDate) !== visibleMonth) {
      setVisibleMonth(monthOf(eventDate));
      setFocusedIso(eventDate);
    }
  }

  useEffect(() => {
    if (!pendingFocusRef.current) return;
    pendingFocusRef.current = false;
    cellRefs.current.get(focusedIso)?.focus();
  }, [focusedIso, visibleMonth]);

  const statusFor = useCallback(
    (iso: string): AvailabilityStatus => {
      if (iso < todayIso) return 'past';
      if (!monthData || monthData.month !== monthOf(iso) || !monthData.hasData) return 'unknown';
      return monthData.blockedDates.has(iso) ? 'taken' : 'free';
    },
    [monthData, todayIso]
  );

  const days = useMemo(() => buildMonthMatrix(visibleMonth), [visibleMonth]);
  const weeks = useMemo(() => chunkWeeks(days), [days]);

  const monthLabel = useMemo(() => {
    const [year, month] = visibleMonth.split('-').map(Number);
    return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(new Date(Date.UTC(year, month - 1, 1)));
  }, [visibleMonth, locale]);

  const weekdayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    // 2024-01-01 is a Monday — a stable Monday-first reference week.
    return Array.from({ length: 7 }, (_, i) => formatter.format(new Date(Date.UTC(2024, 0, 1 + i))));
  }, [locale]);

  const formatFullDate = useCallback(
    (iso: string) =>
      new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(
        new Date(`${iso}T00:00:00`)
      ),
    [locale]
  );

  const goToMonth = useCallback((next: string) => {
    setVisibleMonth(next);
  }, []);

  const canGoPrev = shiftMonth(visibleMonth, -1) >= currentMonthIso.slice(0, 7) || visibleMonth > currentMonthIso;

  const selectDay = useCallback(
    (iso: string) => {
      if (iso < todayIso) return;
      onSelect(iso);
      const status = statusFor(iso);
      onAnnounce(t('selectedAnnouncement', { date: formatFullDate(iso), status: t(`status.${status}`) }));
    },
    [todayIso, onSelect, statusFor, formatFullDate, onAnnounce, t]
  );

  const moveFocus = useCallback(
    (deltaDays: number) => {
      const next = new Date(`${focusedIso}T00:00:00Z`);
      next.setUTCDate(next.getUTCDate() + deltaDays);
      const nextIso = toIso(next);
      const nextMonth = monthOf(nextIso);
      pendingFocusRef.current = true;
      if (nextMonth !== visibleMonth) setVisibleMonth(nextMonth);
      setFocusedIso(nextIso);
    },
    [focusedIso, visibleMonth]
  );

  const handleGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        moveFocus(1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        moveFocus(-1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveFocus(7);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveFocus(-7);
        break;
      case 'Home':
        event.preventDefault();
        moveFocus(-mondayIndex(new Date(`${focusedIso}T00:00:00Z`)));
        break;
      case 'End':
        event.preventDefault();
        moveFocus(6 - mondayIndex(new Date(`${focusedIso}T00:00:00Z`)));
        break;
      case 'PageUp':
        event.preventDefault();
        pendingFocusRef.current = true;
        goToMonth(shiftMonth(visibleMonth, -1));
        break;
      case 'PageDown':
        event.preventDefault();
        pendingFocusRef.current = true;
        goToMonth(shiftMonth(visibleMonth, 1));
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        selectDay(focusedIso);
        break;
      default:
        break;
    }
  };

  const navButtonClass =
    'flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-2 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-muted';

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            pendingFocusRef.current = false;
            goToMonth(shiftMonth(visibleMonth, -1));
          }}
          disabled={!canGoPrev}
          aria-label={t('previousMonth')}
          className={navButtonClass}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>
        <p className="font-display text-lg capitalize text-ink">{monthLabel}</p>
        <button
          type="button"
          onClick={() => {
            pendingFocusRef.current = false;
            goToMonth(shiftMonth(visibleMonth, 1));
          }}
          aria-label={t('nextMonth')}
          className={navButtonClass}
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>

      <p id={gridLabelId} className="sr-only">
        {t('instructions')}
      </p>

      <div role="grid" aria-labelledby={gridLabelId} onKeyDown={handleGridKeyDown} className="flex flex-col gap-1">
        <div role="row" className="grid grid-cols-7 gap-1">
          {weekdayLabels.map((label) => (
            <div
              key={label}
              role="columnheader"
              aria-hidden="true"
              className="flex h-8 items-center justify-center text-xs uppercase tracking-wide text-ink-faint"
            >
              {label}
            </div>
          ))}
        </div>

        {weeks.map((week, weekIndex) => (
          <div role="row" key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((date) => {
              const iso = toIso(date);
              const inMonth = monthOf(iso) === visibleMonth;
              const status = statusFor(iso);
              const isSelected = iso === eventDate;
              const isToday = iso === todayIso;
              const isDisabled = status === 'past';

              return (
                <button
                  key={iso}
                  type="button"
                  role="gridcell"
                  ref={(el) => {
                    if (el) cellRefs.current.set(iso, el);
                    else cellRefs.current.delete(iso);
                  }}
                  tabIndex={iso === focusedIso ? 0 : -1}
                  aria-selected={isSelected}
                  aria-disabled={isDisabled || undefined}
                  aria-current={isToday ? 'date' : undefined}
                  aria-label={`${formatFullDate(iso)} — ${t(`status.${status}`)}${isToday ? ` — ${t('today')}` : ''}`}
                  disabled={isDisabled}
                  onClick={() => selectDay(iso)}
                  onFocus={() => setFocusedIso(iso)}
                  className={cn(
                    'mx-auto flex size-9 items-center justify-center rounded-full text-sm transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
                    !inMonth && 'text-ink-faint/40',
                    isDisabled && 'cursor-not-allowed text-ink-faint/30',
                    !isDisabled && inMonth && !isSelected && status === 'free' && 'text-ink hover:bg-success/15',
                    !isDisabled && inMonth && !isSelected && status === 'taken' && 'text-ink-muted hover:bg-surface-2',
                    !isDisabled && inMonth && !isSelected && status === 'unknown' && 'text-ink-muted hover:bg-surface-2',
                    isSelected && 'bg-gold text-on-gold hover:bg-gold-soft',
                    isToday && !isSelected && 'ring-1 ring-inset ring-gold/50'
                  )}
                >
                  {date.getUTCDate()}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {loading ? (
        <p className="flex items-center gap-2 text-xs text-ink-muted">
          <Loader2 className="size-3 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          {t('loading')}
        </p>
      ) : (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted" aria-hidden="true">
          <li className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-success" />
            {t('status.free')}
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-ink-faint" />
            {t('status.taken')}
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2 rounded-full border border-ink-faint/60" />
            {t('status.unknown')}
          </li>
        </ul>
      )}
    </div>
  );
}
