'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { FormProvider, useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  enquiryDefaultValues,
  enquirySchema,
  stepFieldGroups,
  stepKeys,
  type EnquiryFormInput,
} from '@/lib/booking';
import { BookingProgress } from './progress';
import { StepDatePlace } from './step-date-place';
import { StepDetails } from './step-details';
import { StepContact } from './step-contact';
import { HoneypotField } from './honeypot-field';
import { SuccessPanel } from './success-panel';
import { ErrorPanel } from './error-panel';

const STORAGE_KEY = 'veysl:booking-enquiry';
const TOTAL_STEPS = stepFieldGroups.length;

type Phase = 'form' | 'success' | 'error';

export function EnquiryForm() {
  const t = useTranslations('booking');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const [step, setStep] = useState(1);
  const [phase, setPhase] = useState<Phase>('form');
  const [liveMessage, setLiveMessage] = useState('');
  const [submitted, setSubmitted] = useState<{ firstName: string; eventDate: string } | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const restoredRef = useRef(false);
  /** Set by `goToStep` so the effect below only moves focus for user-initiated step changes, never on mount or on sessionStorage restore. */
  const pendingHeadingFocusRef = useRef(false);

  const form = useForm<EnquiryFormInput>({
    resolver: zodResolver(enquirySchema),
    defaultValues: enquiryDefaultValues,
    mode: 'onBlur',
  });

  const { handleSubmit, trigger, reset, watch, setFocus, formState } = form;

  // Reload-safe: restore an in-progress answer set so visitors don't lose the funnel.
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { values?: Partial<EnquiryFormInput>; step?: number };
      if (parsed.values) reset({ ...enquiryDefaultValues, ...parsed.values });
      if (parsed.step && parsed.step >= 1 && parsed.step <= TOTAL_STEPS) setStep(parsed.step);
    } catch {
      // Corrupt or unavailable sessionStorage (private browsing, quota) — start fresh.
    }
  }, [reset]);

  // Persist in-progress answers on every change.
  useEffect(() => {
    const subscription = watch((values) => {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ values, step }));
      } catch {
        // ignore — sessionStorage may be unavailable
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, step]);

  /**
   * Moves focus to the new step's heading after React has committed it.
   *
   * This used to be a `requestAnimationFrame` fired from inside `goToStep`,
   * which never actually worked: at that point `headingRef` still pointed at
   * the outgoing step's heading, and focusing an element that is about to be
   * unmounted drops focus to `<body>`. Verified in the browser — every "next"
   * and every "back" reset the active element to BODY, so a keyboard user was
   * thrown to the top of the document and had to tab all the way back down on
   * each of the three steps. The live region still announced the change, so it
   * was audible but unreachable.
   *
   * An effect keyed to `step` runs after the commit, when the ref holds the
   * heading that is actually on screen. `pendingHeadingFocusRef` keeps it to
   * deliberate navigation: without it this would also steal focus on first
   * paint and when a half-filled form is restored from sessionStorage.
   */
  useEffect(() => {
    if (!pendingHeadingFocusRef.current) return;
    pendingHeadingFocusRef.current = false;
    headingRef.current?.focus();
  }, [step]);

  const announceStep = useCallback(
    (targetStep: number) => {
      const stepKey = stepKeys[targetStep - 1];
      setLiveMessage(`${t('stepLabel', { current: targetStep, total: TOTAL_STEPS })} — ${t(`steps.${stepKey}`)}`);
    },
    [t]
  );

  const goToStep = useCallback(
    (targetStep: number) => {
      pendingHeadingFocusRef.current = true;
      setStep(targetStep);
      announceStep(targetStep);
    },
    [announceStep]
  );

  const handleNext = useCallback(async () => {
    const fields = Array.from(stepFieldGroups[step - 1]) as (keyof EnquiryFormInput)[];
    const valid = await trigger(fields);
    if (!valid) {
      // Move focus to the first field that failed, and say why.
      //
      // `trigger()` — unlike `handleSubmit()` — never moves focus, so before
      // this the button click simply did nothing observable to anyone not
      // watching the fields: the errors appeared, correctly wired up with
      // `aria-invalid` and `aria-describedby`, but focus stayed on whatever
      // was last touched and nothing was announced. A keyboard or screen
      // reader user pressed "next", heard silence, and had to go hunting —
      // on the one form the whole site exists to get filled in.
      //
      // Reuses the live region the successful path already uses, so the
      // announcement arrives the same way a step change does.
      // `form.getFieldState()` and not the destructured `formState.errors`:
      // that object is captured at render time, so reading it here — after an
      // `await` — can see the state from before validation ran and find no
      // error at all.
      const firstInvalid = fields.find((field) => form.getFieldState(field).invalid);
      if (firstInvalid) {
        setLiveMessage(t('validation.stepIncomplete'));
        setFocus(firstInvalid, { shouldSelect: true });
      }
      return;
    }
    if (step < TOTAL_STEPS) goToStep(step + 1);
  }, [form, goToStep, setFocus, step, t, trigger]);

  const handleBack = useCallback(() => {
    if (step > 1) goToStep(step - 1);
  }, [goToStep, step]);

  const onValidSubmit = useCallback(
    async (data: EnquiryFormInput) => {
      try {
        const parsed = enquirySchema.parse(data);
        const res = await fetch('/api/anfrage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...parsed, locale }),
        });
        const json = (await res.json()) as { ok: boolean };
        if (!res.ok || !json.ok) throw new Error('submit_failed');

        setSubmitted({ firstName: parsed.firstName, eventDate: parsed.eventDate });
        setPhase('success');
        try {
          sessionStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore
        }
      } catch {
        setPhase('error');
      }
    },
    [locale]
  );

  // Defensive fallback only: normal navigation already guarantees earlier
  // steps are valid by the time step 3 is reached (handleNext re-validates
  // on every advance). If a field somehow ends up invalid anyway, jump back
  // to the first step that has one instead of leaving the visitor stuck on
  // a submit button that silently does nothing.
  const onInvalidSubmit = useCallback(
    (errors: FieldErrors<EnquiryFormInput>) => {
      const erroredStepIndex = stepFieldGroups.findIndex((fields) =>
        (fields as readonly string[]).some((field) => field in errors)
      );
      if (erroredStepIndex >= 0 && erroredStepIndex + 1 !== step) {
        goToStep(erroredStepIndex + 1);
      }
    },
    [goToStep, step]
  );

  const handleFormKeyDown = useCallback(
    (event: KeyboardEvent<HTMLFormElement>) => {
      if (event.key !== 'Enter') return;
      if (event.target instanceof HTMLTextAreaElement) return;
      if (step === TOTAL_STEPS) return; // final step: let the real submit button handle Enter
      event.preventDefault();
      void handleNext();
    },
    [handleNext, step]
  );

  if (phase === 'success' && submitted) {
    return <SuccessPanel firstName={submitted.firstName} eventDate={submitted.eventDate} />;
  }

  if (phase === 'error') {
    return <ErrorPanel onRetry={() => setPhase('form')} />;
  }

  return (
    <FormProvider {...form}>
      <div className="flex flex-col gap-8">
        <BookingProgress currentStep={step} totalSteps={TOTAL_STEPS} onStepSelect={goToStep} />

        {/* Announces step changes and the live availability check result. */}
        <div aria-live="polite" className="sr-only">
          {liveMessage}
        </div>

        <form
          noValidate
          onKeyDown={handleFormKeyDown}
          onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
          className="flex flex-col gap-8"
        >
          <HoneypotField />

          {step === 1 && <StepDatePlace headingRef={headingRef} onAvailabilityAnnounce={setLiveMessage} />}
          {step === 2 && <StepDetails headingRef={headingRef} />}
          {step === 3 && <StepContact headingRef={headingRef} />}

          <div className="flex items-center justify-between gap-4">
            {step > 1 ? (
              <Button type="button" variant="ghost" onClick={handleBack}>
                {tCommon('back')}
              </Button>
            ) : (
              <span aria-hidden="true" />
            )}

            {step < TOTAL_STEPS ? (
              <Button type="button" variant="gold" onClick={handleNext}>
                {tCommon('next')}
              </Button>
            ) : (
              <Button type="submit" variant="gold" disabled={formState.isSubmitting}>
                {formState.isSubmitting ? tCommon('loading') : tCommon('submit')}
              </Button>
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
}
