'use client';

import type { RefObject } from 'react';
import { useTranslations } from 'next-intl';
import { useFormContext, useWatch } from 'react-hook-form';
import { FieldShell, fieldControlClass } from './field-shell';
import { AvailabilityIndicator } from './availability-indicator';
import { AvailabilityCalendar } from './availability-calendar';
import type { EnquiryFormInput } from '@/lib/booking';
import { eventTypeValues } from '@/lib/booking';

export function StepDatePlace({
  headingRef,
  onAvailabilityAnnounce,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  onAvailabilityAnnounce: (message: string) => void;
}) {
  const t = useTranslations('booking');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('booking.validation');
  const tEventTypes = useTranslations('booking.eventTypes');
  const {
    register,
    control,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext<EnquiryFormInput>();
  const eventDate = useWatch({ control, name: 'eventDate' });

  const dateError = errors.eventDate?.message ? tValidation(errors.eventDate.message) : undefined;
  const eventTypeError = errors.eventType?.message ? tValidation(errors.eventType.message) : undefined;
  const cityError = errors.city?.message ? tValidation(errors.city.message) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <h2 ref={headingRef} tabIndex={-1} className="font-display text-3xl text-ink focus:outline-none">
        {t('steps.date')}
      </h2>
      <fieldset className="flex flex-col gap-6">
        <legend className="sr-only">{t('steps.date')}</legend>

        <div className="flex flex-col gap-2">
          <FieldShell
            id="eventDate"
            label={t('fields.eventDate')}
            required
            requiredMarkLabel={tCommon('required')}
            error={dateError}
          >
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
          <AvailabilityIndicator onAnnounce={onAvailabilityAnnounce} />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-ink-muted">{t('calendar.pickerLabel')}</p>
          <AvailabilityCalendar
            value={eventDate}
            onSelect={(iso) => {
              setValue('eventDate', iso, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
              void trigger('eventDate');
            }}
            onAnnounce={onAvailabilityAnnounce}
          />
        </div>

        <FieldShell
          id="eventType"
          label={t('fields.eventType')}
          required
          requiredMarkLabel={tCommon('required')}
          error={eventTypeError}
        >
          <select
            id="eventType"
            enterKeyHint="next"
            aria-invalid={!!errors.eventType}
            aria-describedby={errors.eventType ? 'eventType-error' : undefined}
            className={fieldControlClass}
            defaultValue=""
            {...register('eventType')}
          >
            <option value="" disabled>
              {tCommon('required')}
            </option>
            {eventTypeValues.map((value) => (
              <option key={value} value={value}>
                {tEventTypes(value)}
              </option>
            ))}
          </select>
        </FieldShell>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FieldShell
            id="city"
            label={t('fields.city')}
            required
            requiredMarkLabel={tCommon('required')}
            error={cityError}
          >
            <input
              id="city"
              type="text"
              inputMode="text"
              autoComplete="address-level2"
              enterKeyHint="next"
              placeholder={t('fields.cityPlaceholder')}
              aria-invalid={!!errors.city}
              aria-describedby={errors.city ? 'city-error' : undefined}
              className={fieldControlClass}
              {...register('city')}
            />
          </FieldShell>

          <FieldShell id="venue" label={t('fields.venue')}>
            <input
              id="venue"
              type="text"
              inputMode="text"
              autoComplete="off"
              enterKeyHint="next"
              placeholder={t('fields.venuePlaceholder')}
              className={fieldControlClass}
              {...register('venue')}
            />
          </FieldShell>
        </div>
      </fieldset>
    </div>
  );
}
