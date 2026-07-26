'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useFormContext, useWatch } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isFutureIsoDate, isValidIsoDate, type AvailabilityStatus, type EnquiryFormInput } from '@/lib/booking';

type IndicatorStatus = AvailabilityStatus | 'idle' | 'checking';

/**
 * Step 1's live availability check: debounced + abortable, never blocks
 * submission. `taken` still invites the enquiry (waiting list) — it is
 * never treated as an error state.
 */
export function AvailabilityIndicator({ onAnnounce }: { onAnnounce: (message: string) => void }) {
  const t = useTranslations('booking.availability');
  const { control } = useFormContext<EnquiryFormInput>();
  const eventDate = useWatch({ control, name: 'eventDate' });

  // 'idle'/'past' are pure functions of the date itself — derived during render
  // instead of stored in state, so there is nothing to reset when the date changes.
  const dateIsEmpty = !eventDate || !isValidIsoDate(eventDate);
  const dateIsPast = !dateIsEmpty && !isFutureIsoDate(eventDate);

  const [checkResult, setCheckResult] = useState<{ date: string; status: AvailabilityStatus } | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const status: IndicatorStatus = dateIsEmpty
    ? 'idle'
    : dateIsPast
      ? 'past'
      : checkResult && checkResult.date === eventDate
        ? checkResult.status
        : 'checking';

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    if (dateIsEmpty || dateIsPast) return;

    const dateToCheck = eventDate;
    debounceRef.current = setTimeout(() => {
      const controller = new AbortController();
      abortRef.current = controller;

      fetch(`/api/availability?date=${dateToCheck}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data: { status?: AvailabilityStatus }) => {
          setCheckResult({ date: dateToCheck, status: data.status ?? 'unknown' });
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === 'AbortError') return;
          setCheckResult({ date: dateToCheck, status: 'unknown' });
        });
    }, 450);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [eventDate, dateIsEmpty, dateIsPast]);

  useEffect(() => {
    if (status === 'idle' || status === 'checking') return;
    const message =
      status === 'free' ? t('free') : status === 'taken' ? t('taken') : status === 'past' ? t('pastDate') : t('unknown');
    onAnnounce(message);
    // onAnnounce is a stable callback from the parent; only re-announce on status change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => () => abortRef.current?.abort(), []);

  if (status === 'idle') return null;

  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-md border px-4 py-3 text-sm',
        status === 'checking' && 'border-line text-ink-muted',
        status === 'free' && 'border-success/40 bg-success/10 text-success',
        status === 'taken' && 'border-gold/40 bg-gold/10 text-ink',
        status === 'unknown' && 'border-line text-ink-muted',
        status === 'past' && 'border-danger/40 bg-danger/10 text-danger'
      )}
    >
      {status === 'checking' ? (
        <>
          <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          <span>{t('checking')}</span>
        </>
      ) : (
        <div className="flex flex-col gap-0.5">
          <span>
            {status === 'free' && t('free')}
            {status === 'taken' && t('taken')}
            {status === 'unknown' && t('unknown')}
            {status === 'past' && t('pastDate')}
          </span>
          {status === 'free' ? <span className="text-ink-muted">{t('freeHint')}</span> : null}
          {status === 'taken' ? <span className="text-ink-muted">{t('takenHint')}</span> : null}
        </div>
      )}
    </div>
  );
}
