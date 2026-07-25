'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { stepKeys } from '@/lib/booking';

export function BookingProgress({
  currentStep,
  totalSteps,
  onStepSelect,
}: {
  currentStep: number;
  totalSteps: number;
  /** Lets a visitor jump back to an already-completed step; never forward. */
  onStepSelect: (step: number) => void;
}) {
  const t = useTranslations('booking');

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">
        {t('stepLabel', { current: currentStep, total: totalSteps })}
      </p>
      <ol className="flex items-center gap-2">
        {stepKeys.map((key, index) => {
          const step = index + 1;
          const isCurrent = step === currentStep;
          const isDone = step < currentStep;
          return (
            <li key={key} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                disabled={!isDone}
                onClick={() => isDone && onStepSelect(step)}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'h-1.5 w-full rounded-full transition-colors',
                  isCurrent && 'bg-gold',
                  isDone && 'bg-gold/60 hover:bg-gold cursor-pointer',
                  !isCurrent && !isDone && 'bg-line cursor-default'
                )}
              >
                <span className="sr-only">{t(`steps.${key}`)}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
