'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { AvailabilityCalendar } from '@/components/booking/availability-calendar';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import {
  whatsappEventTypeValues,
  whatsappGuestsRangeValues,
  whatsappServiceValues,
  WHATSAPP_FLOW_STORAGE_KEY,
  type WhatsappGuestsRange,
  type WhatsappLeadAnswers,
  type WhatsappService,
  type WhatsappSource,
} from '@/lib/whatsapp-flow';
import type { AvailabilityStatus, EventType } from '@/lib/booking';

const STEP_KEYS = ['eventType', 'date', 'city', 'guests', 'service'] as const;
type StepKey = (typeof STEP_KEYS)[number];

function firstUnansweredStep(answers: WhatsappLeadAnswers): number {
  const index = STEP_KEYS.findIndex((key) => {
    if (key === 'eventType') return !answers.eventType;
    if (key === 'date') return !answers.eventDate;
    if (key === 'city') return !answers.city;
    if (key === 'guests') return !answers.guestsRange;
    if (key === 'service') return !answers.service;
    return false;
  });
  return index === -1 ? 0 : index;
}

interface Props {
  open: boolean;
  onClose: () => void;
  whatsappNumber: string;
  source: WhatsappSource;
}

/**
 * Bottom-sheet-on-mobile pre-qualification dialog shown before opening
 * WhatsApp. Every question is skippable, a one-tap escape ("Direkt
 * schreiben") is always visible, and "Auf WhatsApp weiter" — which finishes
 * with whatever has been answered so far — is available on every step, not
 * just the last one. Never a form the visitor has to complete to proceed.
 *
 * `role="dialog"`, labelled, focus-trapped, Escape closes, focus returns to
 * the trigger on close (handled by the provider). Answers persist to
 * `sessionStorage` so closing and reopening doesn't lose progress.
 */
export function WhatsappPrequalifyModal({ open, onClose, whatsappNumber, source }: Props) {
  const t = useTranslations('whatsappFlow');
  const tEventTypes = useTranslations('booking.eventTypes');
  const tAvailability = useTranslations('booking.availability');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const titleId = useId();
  const liveRegionId = useId();

  const [answers, setAnswers] = useState<WhatsappLeadAnswers>({});
  const [step, setStep] = useState(0);
  const [dateStatus, setDateStatus] = useState<AvailabilityStatus | null>(null);
  const [liveMessage, setLiveMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const restoredRef = useRef(false);

  // Restore persisted answers once, on first open.
  useEffect(() => {
    if (!open || restoredRef.current) return;
    restoredRef.current = true;
    try {
      const raw = sessionStorage.getItem(WHATSAPP_FLOW_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as WhatsappLeadAnswers;
        setAnswers(parsed);
        setStep(firstUnansweredStep(parsed));
      }
    } catch {
      // ignore — sessionStorage unavailable (private browsing, quota)
    }
  }, [open]);

  // Persist on every change.
  useEffect(() => {
    try {
      sessionStorage.setItem(WHATSAPP_FLOW_STORAGE_KEY, JSON.stringify(answers));
    } catch {
      // ignore
    }
  }, [answers]);

  // Body scroll lock + focus the dialog while open.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => dialogRef.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(frame);
    };
  }, [open]);

  // Honest availability status once a date is picked (mirrors AvailabilityIndicator).
  useEffect(() => {
    if (!answers.eventDate) {
      setDateStatus(null);
      return;
    }
    let cancelled = false;
    fetch(`/api/availability?date=${answers.eventDate}`)
      .then((res) => res.json())
      .then((data: { status?: AvailabilityStatus }) => {
        if (!cancelled) setDateStatus(data.status ?? 'unknown');
      })
      .catch(() => {
        if (!cancelled) setDateStatus('unknown');
      });
    return () => {
      cancelled = true;
    };
  }, [answers.eventDate]);

  const updateAnswer = useCallback(<K extends keyof WhatsappLeadAnswers>(key: K, value: WhatsappLeadAnswers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  const advance = useCallback(() => {
    setStep((current) => Math.min(current + 1, STEP_KEYS.length - 1));
  }, []);

  const goBack = useCallback(() => {
    setStep((current) => Math.max(current - 1, 0));
  }, []);

  const selectChip = useCallback(
    <K extends keyof WhatsappLeadAnswers>(key: K, value: WhatsappLeadAnswers[K], isLastStep: boolean) => {
      updateAnswer(key, value);
      if (!isLastStep) advance();
    },
    [updateAnswer, advance]
  );

  const dateLabel = useMemo(() => (answers.eventDate ? formatDate(answers.eventDate, locale) : undefined), [answers.eventDate, locale]);

  const buildMessage = useCallback(() => {
    const parts: string[] = [];
    if (answers.eventType) {
      parts.push(`${t('messageLabels.eventType')}: ${tEventTypes(answers.eventType as EventType)}`);
    }
    if (answers.eventDate && dateLabel) {
      parts.push(`${t('messageLabels.date')}: ${dateLabel}`);
    }
    if (answers.city) {
      parts.push(`${t('messageLabels.city')}: ${answers.city}`);
    }
    if (answers.guestsRange) {
      parts.push(`${t('messageLabels.guests')}: ${t(`steps.guests.options.${answers.guestsRange}`)}`);
    }
    if (answers.service) {
      parts.push(`${t('messageLabels.service')}: ${t(`steps.service.options.${answers.service}`)}`);
    }
    const intro = t('messageIntro');
    return parts.length > 0 ? `${intro}\n${parts.join(' · ')}` : intro;
  }, [answers, dateLabel, t, tEventTypes]);

  const sendLeadBeacon = useCallback(
    (payloadAnswers: WhatsappLeadAnswers) => {
      try {
        const body = JSON.stringify({ ...payloadAnswers, source, locale });
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/whatsapp-lead', new Blob([body], { type: 'application/json' }));
        } else {
          void fetch('/api/whatsapp-lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            keepalive: true,
          });
        }
      } catch {
        // best-effort only — never blocks the redirect
      }
    },
    [source, locale]
  );

  const finish = useCallback(
    (skipAll: boolean) => {
      const finalAnswers = skipAll ? {} : answers;
      const message = skipAll ? '' : buildMessage();
      const url = `https://wa.me/${whatsappNumber}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

      if (!skipAll) {
        setSubmitting(true);
        sendLeadBeacon(finalAnswers);
      }

      try {
        sessionStorage.removeItem(WHATSAPP_FLOW_STORAGE_KEY);
      } catch {
        // ignore
      }

      onClose();
      window.location.href = url;
    },
    [answers, buildMessage, whatsappNumber, sendLeadBeacon, onClose]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const root = dialogRef.current;
      if (!root) return;
      const focusable = Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  if (!open) return null;

  const stepKey: StepKey = STEP_KEYS[step]!;
  const isLastStep = step === STEP_KEYS.length - 1;

  const chipClass = (active: boolean) =>
    cn(
      'min-h-11 rounded-full border px-4 py-2 text-sm transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
      active ? 'border-gold bg-gold text-on-gold' : 'border-line bg-surface text-ink hover:border-gold hover:text-gold'
    );

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm motion-reduce:transition-none"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative z-10 flex max-h-[90dvh] w-full flex-col gap-5 overflow-y-auto rounded-t-2xl border border-line bg-surface p-6',
          'sm:max-w-md sm:rounded-2xl',
          'focus:outline-none'
        )}
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 id={titleId} className="font-display text-xl text-ink">
              {t('title')}
            </h2>
            <button
              type="button"
              onClick={() => finish(true)}
              className="w-fit text-sm text-gold underline underline-offset-2 hover:text-gold-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              {t('skipAll')}
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div aria-live="polite" id={liveRegionId} className="sr-only">
          {liveMessage}
        </div>

        <div className="flex flex-col gap-3">
          {stepKey === 'eventType' && (
            <>
              <p className="text-sm font-medium text-ink">{t('steps.eventType.question')}</p>
              <div className="flex flex-wrap gap-2">
                {whatsappEventTypeValues.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => selectChip('eventType', value, isLastStep)}
                    aria-pressed={answers.eventType === value}
                    className={chipClass(answers.eventType === value)}
                  >
                    {tEventTypes(value)}
                  </button>
                ))}
              </div>
            </>
          )}

          {stepKey === 'date' && (
            <>
              <p className="text-sm font-medium text-ink">{t('steps.date.question')}</p>
              <AvailabilityCalendar
                value={answers.eventDate}
                onSelect={(iso) => selectChip('eventDate', iso, isLastStep)}
                onAnnounce={setLiveMessage}
              />
              {dateStatus ? (
                <p className="text-sm text-ink-muted">
                  {dateStatus === 'past' ? tAvailability('pastDate') : tAvailability(dateStatus)}
                </p>
              ) : null}
            </>
          )}

          {stepKey === 'city' && (
            <>
              <label htmlFor="whatsapp-flow-city" className="text-sm font-medium text-ink">
                {t('steps.city.question')}
              </label>
              <input
                id="whatsapp-flow-city"
                type="text"
                inputMode="text"
                autoComplete="address-level2"
                placeholder={t('steps.city.placeholder')}
                value={answers.city ?? ''}
                onChange={(event) => updateAnswer('city', event.target.value)}
                className="w-full rounded-md border border-line bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
            </>
          )}

          {stepKey === 'guests' && (
            <>
              <p className="text-sm font-medium text-ink">{t('steps.guests.question')}</p>
              <div className="flex flex-wrap gap-2">
                {whatsappGuestsRangeValues.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => selectChip('guestsRange', value as WhatsappGuestsRange, isLastStep)}
                    aria-pressed={answers.guestsRange === value}
                    className={chipClass(answers.guestsRange === value)}
                  >
                    {t(`steps.guests.options.${value}`)}
                  </button>
                ))}
              </div>
            </>
          )}

          {stepKey === 'service' && (
            <>
              <p className="text-sm font-medium text-ink">{t('steps.service.question')}</p>
              <div className="flex flex-wrap gap-2">
                {whatsappServiceValues.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => selectChip('service', value as WhatsappService, isLastStep)}
                    aria-pressed={answers.service === value}
                    className={chipClass(answers.service === value)}
                  >
                    {t(`steps.service.options.${value}`)}
                  </button>
                ))}
              </div>
            </>
          )}

          {!isLastStep && (
            <button
              type="button"
              onClick={advance}
              className="w-fit text-sm text-ink-muted underline underline-offset-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              {t('skip')}
            </button>
          )}
        </div>

        <ol className="flex items-center justify-center gap-1.5" aria-hidden="true">
          {STEP_KEYS.map((key, index) => (
            <li key={key} className={cn('size-1.5 rounded-full', index === step ? 'bg-gold' : 'bg-line')} />
          ))}
        </ol>

        <p className="text-xs text-ink-faint">
          {t.rich('privacyNote', {
            privacyLink: (chunks) => (
              <Link href="/datenschutz" className="text-gold underline underline-offset-2 hover:text-gold-soft">
                {chunks}
              </Link>
            ),
          })}
        </p>

        <div className="flex items-center justify-between gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="min-h-11 rounded-full border border-line px-4 text-sm text-ink transition-colors hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              {tCommon('back')}
            </button>
          ) : (
            <span aria-hidden="true" />
          )}
          <button
            type="button"
            onClick={() => finish(false)}
            disabled={submitting}
            className="min-h-12 flex-1 rounded-full bg-gold px-6 text-sm font-medium text-on-gold transition-colors hover:bg-gold-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-60 sm:flex-none"
          >
            {t('continueToWhatsapp')}
          </button>
        </div>
      </div>
    </div>
  );
}
