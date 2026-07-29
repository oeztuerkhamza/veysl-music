'use client';

import type { RefObject } from 'react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { FieldShell, fieldControlClass } from './field-shell';
import {
  budgetValues,
  hostingLanguageValues,
  packageValues,
  serviceValues,
  type EnquiryFormInput,
} from '@/lib/booking';

export function StepDetails({ headingRef }: { headingRef: RefObject<HTMLHeadingElement | null> }) {
  const t = useTranslations('booking');
  const tValidation = useTranslations('booking.validation');
  const tBudgets = useTranslations('booking.budgets');
  const tPackages = useTranslations('booking.packageOptions');
  // Dieselbe Quelle wie die Paketseite — keine zweite Fassung derselben Texte.
  const tPackageItems = useTranslations('packages.items');
  const tServices = useTranslations('booking.services');
  const tHostingLanguages = useTranslations('booking.hostingLanguages');
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<EnquiryFormInput>();

  const guestsError = errors.guests?.message ? tValidation(errors.guests.message) : undefined;

  /**
   * Copy for the currently selected package, read from the same
   * `packages.items.*` namespace the /pakete page renders.
   *
   * Only the three real packages have it — `custom` ("Individuell / noch
   * unsicher") describes itself and has no entry, so it correctly yields
   * `null` and no hint is shown rather than an empty line.
   */
  const selectedPackage = watch('package');
  const packageHint =
    selectedPackage === 'essential' || selectedPackage === 'signature' || selectedPackage === 'prestige'
      ? { tagline: tPackageItems(`${selectedPackage}.tagline`), description: tPackageItems(`${selectedPackage}.description`) }
      : null;

  return (
    <div className="flex flex-col gap-6">
      <h2 ref={headingRef} tabIndex={-1} className="font-display text-3xl text-ink focus:outline-none">
        {t('steps.details')}
      </h2>
      <fieldset className="flex flex-col gap-6">
        <legend className="sr-only">{t('steps.details')}</legend>

        <FieldShell id="guests" label={t('fields.guests')} error={guestsError}>
          <input
            id="guests"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            enterKeyHint="next"
            autoComplete="off"
            aria-invalid={!!errors.guests}
            aria-describedby={errors.guests ? 'guests-error' : undefined}
            className={fieldControlClass}
            {...register('guests')}
          />
        </FieldShell>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FieldShell id="startTime" label={t('fields.startTime')}>
            <input
              id="startTime"
              type="time"
              enterKeyHint="next"
              autoComplete="off"
              className={fieldControlClass}
              {...register('startTime')}
            />
          </FieldShell>
          <FieldShell id="endTime" label={t('fields.endTime')}>
            <input
              id="endTime"
              type="time"
              enterKeyHint="next"
              autoComplete="off"
              className={fieldControlClass}
              {...register('endTime')}
            />
          </FieldShell>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FieldShell id="package" label={t('fields.package')}>
            <select
              id="package"
              enterKeyHint="next"
              defaultValue=""
              className={fieldControlClass}
              aria-describedby={packageHint ? 'package-hint' : undefined}
              {...register('package')}
            >
              <option value="" />
              {packageValues.map((value) => (
                <option key={value} value={value}>
                  {tPackages(value)}
                </option>
              ))}
            </select>
            {/* Was das gewählte Paket überhaupt enthält — bis hierher stand im
                Formular nur „Essential / Signature / Prestige", und wer nicht
                vorher auf /pakete war, wählte einen Namen ohne Inhalt.
                Derselbe Text wie auf der Paketseite (`packages.items.*`), also
                keine zweite Fassung, die auseinanderlaufen kann. Bewusst ohne
                Link dorthin: mitten im Formular jemanden auf eine andere Seite
                zu schicken, kostet mehr Abschlüsse, als die Langfassung bringt. */}
            {packageHint ? (
              <p id="package-hint" className="mt-2 text-sm leading-relaxed text-ink-muted">
                <span className="text-ink">{packageHint.tagline}</span> — {packageHint.description}
              </p>
            ) : null}
          </FieldShell>

          <FieldShell id="budget" label={t('fields.budget')}>
            <select id="budget" enterKeyHint="next" defaultValue="" className={fieldControlClass} {...register('budget')}>
              <option value="" />
              {budgetValues.map((value) => (
                <option key={value} value={value}>
                  {tBudgets(value)}
                </option>
              ))}
            </select>
          </FieldShell>
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-medium text-ink">{t('fields.services')}</legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {serviceValues.map((value) => (
              <label
                key={value}
                htmlFor={`services-${value}`}
                className="flex items-center gap-3 rounded-md border border-line bg-surface px-4 py-3 text-sm text-ink"
              >
                <input
                  id={`services-${value}`}
                  type="checkbox"
                  value={value}
                  className="size-5 shrink-0 rounded border-line accent-[var(--color-gold)]"
                  {...register('services')}
                />
                {tServices(value)}
              </label>
            ))}
          </div>
        </fieldset>

        <FieldShell id="hostingLanguage" label={t('fields.hostingLanguage')}>
          <select
            id="hostingLanguage"
            enterKeyHint="next"
            defaultValue=""
            className={fieldControlClass}
            {...register('hostingLanguage')}
          >
            <option value="" />
            {hostingLanguageValues.map((value) => (
              <option key={value} value={value}>
                {tHostingLanguages(value)}
              </option>
            ))}
          </select>
        </FieldShell>
      </fieldset>
    </div>
  );
}
