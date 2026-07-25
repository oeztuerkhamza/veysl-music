'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { FormProvider, useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { FieldShell, fieldControlClass } from '@/components/booking/field-shell';
import { ErrorPanel } from '@/components/booking/error-panel';
import { Link } from '@/i18n/navigation';
import {
  contactDefaultValues,
  contactMessageSchema,
  contactPreferredChannelValues,
  contactSubjectValues,
  type ContactFormInput,
} from '@/lib/contact';
import { ContactHoneypotField } from './contact-honeypot-field';

type Phase = 'form' | 'success' | 'error';

/**
 * General contact form for `/kontakt` — deliberately a single step, unlike
 * the booking funnel. Backed by `POST /api/kontakt`; see `src/lib/contact.ts`
 * and `src/payload/collections/contact-messages.ts` for why this is a
 * separate feature from `/anfrage`.
 */
export function ContactForm() {
  const t = useTranslations('contactForm');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('booking.validation'); // shared, locale-neutral wording — see src/lib/contact.ts header
  const tSubjects = useTranslations('contactForm.subjects');
  const tPreferred = useTranslations('contactForm.preferredContactOptions');
  const locale = useLocale();

  const [phase, setPhase] = useState<Phase>('form');
  const [submittedName, setSubmittedName] = useState('');

  const form = useForm<ContactFormInput>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: contactDefaultValues,
    mode: 'onBlur',
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const onValidSubmit = useCallback(
    async (data: ContactFormInput) => {
      try {
        const parsed = contactMessageSchema.parse(data);
        const res = await fetch('/api/kontakt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...parsed, locale }),
        });
        const json = (await res.json()) as { ok: boolean };
        if (!res.ok || !json.ok) throw new Error('submit_failed');

        setSubmittedName(parsed.firstName);
        setPhase('success');
      } catch {
        setPhase('error');
      }
    },
    [locale]
  );

  // Defensive fallback, mirrors the booking form: this schema has no
  // multi-step navigation, so there's nothing to jump back to — just log.
  const onInvalidSubmit = useCallback((formErrors: FieldErrors<ContactFormInput>) => {
    if (Object.keys(formErrors).length > 0) {
      // no-op: react-hook-form already renders the field-level errors
    }
  }, []);

  if (phase === 'success') {
    return (
      <div role="status" className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-8">
        <h3 className="font-display text-2xl text-ink">{t('success.title')}</h3>
        <p className="text-ink-muted">{t('success.text', { name: submittedName })}</p>
      </div>
    );
  }

  if (phase === 'error') {
    return <ErrorPanel onRetry={() => setPhase('form')} />;
  }

  const firstNameError = errors.firstName?.message ? tValidation(errors.firstName.message) : undefined;
  const lastNameError = errors.lastName?.message ? tValidation(errors.lastName.message) : undefined;
  const emailError = errors.email?.message ? tValidation(errors.email.message) : undefined;
  const subjectError = errors.subject?.message ? tValidation(errors.subject.message) : undefined;
  const messageError = errors.message?.message ? tValidation(errors.message.message) : undefined;
  const eventDateError = errors.eventDate?.message ? tValidation(errors.eventDate.message) : undefined;
  const consentError = errors.consent?.message ? tValidation(errors.consent.message) : undefined;

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)} className="flex flex-col gap-6">
        <ContactHoneypotField />

      <fieldset className="flex flex-col gap-6">
        <legend className="sr-only">{t('title')}</legend>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FieldShell id="firstName" label={t('fields.firstName')} required requiredMarkLabel={tCommon('required')} error={firstNameError}>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              enterKeyHint="next"
              aria-invalid={!!errors.firstName}
              aria-describedby={errors.firstName ? 'firstName-error' : undefined}
              className={fieldControlClass}
              {...register('firstName')}
            />
          </FieldShell>

          <FieldShell id="lastName" label={t('fields.lastName')} required requiredMarkLabel={tCommon('required')} error={lastNameError}>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              enterKeyHint="next"
              aria-invalid={!!errors.lastName}
              aria-describedby={errors.lastName ? 'lastName-error' : undefined}
              className={fieldControlClass}
              {...register('lastName')}
            />
          </FieldShell>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FieldShell id="email" label={t('fields.email')} required requiredMarkLabel={tCommon('required')} error={emailError}>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              enterKeyHint="next"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={fieldControlClass}
              {...register('email')}
            />
          </FieldShell>

          <FieldShell id="phone" label={t('fields.phone')}>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              enterKeyHint="next"
              className={fieldControlClass}
              {...register('phone')}
            />
          </FieldShell>
        </div>

        <FieldShell id="subject" label={t('fields.subject')} required requiredMarkLabel={tCommon('required')} error={subjectError}>
          <select
            id="subject"
            enterKeyHint="next"
            defaultValue=""
            aria-invalid={!!errors.subject}
            aria-describedby={errors.subject ? 'subject-error' : undefined}
            className={fieldControlClass}
            {...register('subject')}
          >
            <option value="" disabled>
              {tCommon('required')}
            </option>
            {contactSubjectValues.map((value) => (
              <option key={value} value={value}>
                {tSubjects(value)}
              </option>
            ))}
          </select>
        </FieldShell>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FieldShell id="company" label={t('fields.company')}>
            <input
              id="company"
              type="text"
              autoComplete="organization"
              enterKeyHint="next"
              placeholder={t('fields.companyPlaceholder')}
              className={fieldControlClass}
              {...register('company')}
            />
          </FieldShell>

          <FieldShell id="preferredContact" label={t('fields.preferredContact')}>
            <select id="preferredContact" enterKeyHint="next" defaultValue="" className={fieldControlClass} {...register('preferredContact')}>
              <option value="" />
              {contactPreferredChannelValues.map((value) => (
                <option key={value} value={value}>
                  {tPreferred(value)}
                </option>
              ))}
            </select>
          </FieldShell>
        </div>

        <FieldShell id="eventDate" label={t('fields.eventDate')} error={eventDateError}>
          <input
            id="eventDate"
            type="date"
            inputMode="none"
            enterKeyHint="next"
            autoComplete="off"
            placeholder={t('fields.eventDatePlaceholder')}
            aria-invalid={!!errors.eventDate}
            aria-describedby={errors.eventDate ? 'eventDate-error' : undefined}
            className={fieldControlClass}
            {...register('eventDate')}
          />
        </FieldShell>

        <FieldShell id="message" label={t('fields.message')} required requiredMarkLabel={tCommon('required')} error={messageError}>
          <textarea
            id="message"
            rows={5}
            autoComplete="off"
            enterKeyHint="enter"
            placeholder={t('fields.messagePlaceholder')}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'message-error' : undefined}
            className={fieldControlClass}
            {...register('message')}
          />
        </FieldShell>

        <div className="flex flex-col gap-2">
          <label htmlFor="contact-consent" className="flex items-start gap-3 text-sm text-ink">
            <input
              id="contact-consent"
              type="checkbox"
              className="mt-0.5 size-5 shrink-0 rounded border-line accent-[var(--color-gold)]"
              aria-invalid={!!errors.consent}
              aria-describedby={errors.consent ? 'contact-consent-error' : undefined}
              {...register('consent')}
            />
            <span>
              {t.rich('fields.consent', {
                // Bare `{privacyLink}` ICU argument, not a tag pair — see the
                // identical, verified-correct pattern in
                // src/components/booking/step-contact.tsx for why the cast exists.
                privacyLink: (
                  <Link href="/datenschutz" className="text-gold underline underline-offset-2 hover:text-gold-soft">
                    {t('fields.privacyLinkText')}
                  </Link>
                ) as unknown as (chunks: ReactNode) => ReactNode,
              })}
            </span>
          </label>
          {consentError ? (
            <p id="contact-consent-error" role="alert" className="text-sm text-danger">
              {consentError}
            </p>
          ) : null}
        </div>

        <div>
          <Button type="submit" variant="gold" size="lg" disabled={isSubmitting}>
            {isSubmitting ? tCommon('loading') : tCommon('submit')}
          </Button>
        </div>
      </fieldset>
      </form>
    </FormProvider>
  );
}
