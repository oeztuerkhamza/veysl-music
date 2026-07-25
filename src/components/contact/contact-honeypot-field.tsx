'use client';

import { useFormContext } from 'react-hook-form';
import { CONTACT_HONEYPOT_FIELD, type ContactFormInput } from '@/lib/contact';

/**
 * Anti-spam trap for the `/kontakt` form. Same technique as
 * `src/components/booking/honeypot-field.tsx` but with its own field name
 * (`website`, not `company`) — this form has a *real* optional "company /
 * venue name" field, so it can't reuse the booking form's honeypot key.
 */
export function ContactHoneypotField() {
  const { register } = useFormContext<ContactFormInput>();

  return (
    <div
      aria-hidden="true"
      tabIndex={-1}
      className="pointer-events-none absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
    >
      <label htmlFor={CONTACT_HONEYPOT_FIELD}>Website</label>
      <input
        id={CONTACT_HONEYPOT_FIELD}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        {...register(CONTACT_HONEYPOT_FIELD)}
      />
    </div>
  );
}
