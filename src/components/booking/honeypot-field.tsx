'use client';

import { useFormContext } from 'react-hook-form';
import { HONEYPOT_FIELD, type EnquiryFormInput } from '@/lib/booking';

/**
 * Anti-spam trap. Hidden from sight AND assistive tech — not `display:none`
 * on a focusable input (which some scrapers skip), but an off-screen wrapper
 * that real users/AT never reach (`tabIndex={-1}`, `aria-hidden`) while bots
 * that blindly fill every field still populate it.
 */
export function HoneypotField() {
  const { register } = useFormContext<EnquiryFormInput>();

  return (
    <div
      aria-hidden="true"
      tabIndex={-1}
      className="pointer-events-none absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
    >
      <label htmlFor={HONEYPOT_FIELD}>Company</label>
      <input
        id={HONEYPOT_FIELD}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        {...register(HONEYPOT_FIELD)}
      />
    </div>
  );
}
