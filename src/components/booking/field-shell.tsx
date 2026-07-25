import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FieldShellProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  requiredMarkLabel?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Label + control + hint/error wiring shared by every field in the enquiry
 * funnel. Never placeholder-as-label — every control gets a real `<label>`.
 * Callers are responsible for setting `id`, `aria-invalid` and
 * `aria-describedby={error ? \`${id}-error\` : hint ? \`${id}-hint\` : undefined}`
 * on the actual input to match the ids rendered here.
 */
export function FieldShell({
  id,
  label,
  error,
  hint,
  required,
  requiredMarkLabel,
  className,
  children,
}: FieldShellProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required ? (
          <>
            <span aria-hidden="true" className="text-gold">
              {' '}
              *
            </span>
            {requiredMarkLabel ? <span className="sr-only"> ({requiredMarkLabel})</span> : null}
          </>
        ) : null}
      </label>
      {children}
      {!error && hint ? (
        <p id={`${id}-hint`} className="text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Shared input styling so every native control in the funnel looks consistent. */
export const fieldControlClass =
  'w-full rounded-md border border-line bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-faint transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40 aria-[invalid=true]:border-danger';
