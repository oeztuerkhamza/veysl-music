'use client';

import type { ReactNode, RefObject } from 'react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { Link } from '@/i18n/navigation';
import { FieldShell, fieldControlClass } from './field-shell';
import { sourceValues, type EnquiryFormInput } from '@/lib/booking';

export function StepContact({ headingRef }: { headingRef: RefObject<HTMLHeadingElement | null> }) {
  const t = useTranslations('booking');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('booking.validation');
  const tSources = useTranslations('booking.sources');
  const {
    register,
    formState: { errors },
  } = useFormContext<EnquiryFormInput>();

  const firstNameError = errors.firstName?.message ? tValidation(errors.firstName.message) : undefined;
  const lastNameError = errors.lastName?.message ? tValidation(errors.lastName.message) : undefined;
  const emailError = errors.email?.message ? tValidation(errors.email.message) : undefined;
  const phoneError = errors.phone?.message ? tValidation(errors.phone.message) : undefined;
  const consentError = errors.consent?.message ? tValidation(errors.consent.message) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <h2 ref={headingRef} tabIndex={-1} className="font-display text-3xl text-ink focus:outline-none">
        {t('steps.contact')}
      </h2>
      <fieldset className="flex flex-col gap-6">
        <legend className="sr-only">{t('steps.contact')}</legend>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FieldShell
            id="firstName"
            label={t('fields.firstName')}
            required
            requiredMarkLabel={tCommon('required')}
            error={firstNameError}
          >
            <input
              id="firstName"
              type="text"
              inputMode="text"
              autoComplete="given-name"
              enterKeyHint="next"
              aria-invalid={!!errors.firstName}
              aria-describedby={errors.firstName ? 'firstName-error' : undefined}
              className={fieldControlClass}
              {...register('firstName')}
            />
          </FieldShell>

          <FieldShell
            id="lastName"
            label={t('fields.lastName')}
            required
            requiredMarkLabel={tCommon('required')}
            error={lastNameError}
          >
            <input
              id="lastName"
              type="text"
              inputMode="text"
              autoComplete="family-name"
              enterKeyHint="next"
              aria-invalid={!!errors.lastName}
              aria-describedby={errors.lastName ? 'lastName-error' : undefined}
              className={fieldControlClass}
              {...register('lastName')}
            />
          </FieldShell>
        </div>

        <FieldShell id="partnerName" label={t('fields.partnerName')}>
          <input
            id="partnerName"
            type="text"
            inputMode="text"
            autoComplete="off"
            enterKeyHint="next"
            className={fieldControlClass}
            {...register('partnerName')}
          />
        </FieldShell>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FieldShell
            id="email"
            label={t('fields.email')}
            required
            requiredMarkLabel={tCommon('required')}
            error={emailError}
          >
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

          <FieldShell
            id="phone"
            label={t('fields.phone')}
            required
            requiredMarkLabel={tCommon('required')}
            error={phoneError}
          >
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              enterKeyHint="next"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
              className={fieldControlClass}
              {...register('phone')}
            />
          </FieldShell>
        </div>

        <FieldShell id="message" label={t('fields.message')}>
          <textarea
            id="message"
            rows={4}
            autoComplete="off"
            enterKeyHint="enter"
            placeholder={t('fields.messagePlaceholder')}
            className={fieldControlClass}
            {...register('message')}
          />
        </FieldShell>

        <FieldShell id="source" label={t('fields.source')}>
          <select id="source" enterKeyHint="next" defaultValue="" className={fieldControlClass} {...register('source')}>
            <option value="" />
            {sourceValues.map((value) => (
              <option key={value} value={value}>
                {tSources(value)}
              </option>
            ))}
          </select>
        </FieldShell>

        <div className="flex flex-col gap-2">
          <label htmlFor="consent" className="flex items-start gap-3 text-sm text-ink">
            <input
              id="consent"
              type="checkbox"
              className="mt-0.5 size-5 shrink-0 rounded border-line accent-[var(--color-gold)]"
              aria-invalid={!!errors.consent}
              aria-describedby={errors.consent ? 'consent-error' : undefined}
              {...register('consent')}
            />
            <span>
              {t.rich('fields.consent', {
                // `fields.consent` uses a bare `{privacyLink}` ICU argument, not an
                // `<privacyLink>…</privacyLink>` tag pair. use-intl's `RichTagsFunction`
                // type only models the tag-pair case (a function receiving `chunks`);
                // for a bare argument it substitutes the value as-is without invoking
                // it, so a function here would render literally, un-called. Passing
                // the element directly is the verified-correct runtime behaviour —
                // the cast exists solely to satisfy a type that doesn't model this case.
                privacyLink: (
                  <Link href="/datenschutz" className="text-gold underline underline-offset-2 hover:text-gold-soft">
                    {t('fields.privacyLinkText')}
                  </Link>
                ) as unknown as (chunks: ReactNode) => ReactNode,
              })}
            </span>
          </label>
          {consentError ? (
            <p id="consent-error" role="alert" className="text-sm text-danger">
              {consentError}
            </p>
          ) : null}
        </div>
      </fieldset>
    </div>
  );
}
