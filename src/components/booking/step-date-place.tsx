'use client';

import type { RefObject } from 'react';
import { useTranslations } from 'next-intl';
import { useFormContext, useWatch } from 'react-hook-form';
import { FieldShell, fieldControlClass } from './field-shell';
import { AvailabilityIndicator } from './availability-indicator';
import { AvailabilityCalendar } from './availability-calendar';
import type { EnquiryFormInput } from '@/lib/booking';

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
  const {
    register,
    control,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext<EnquiryFormInput>();
  const eventDate = useWatch({ control, name: 'eventDate' });

  const dateError = errors.eventDate?.message ? tValidation(errors.eventDate.message) : undefined;
  const cityError = errors.city?.message ? tValidation(errors.city.message) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <h2 ref={headingRef} tabIndex={-1} className="font-display text-3xl text-ink focus:outline-none">
        {t('steps.date')}
      </h2>
      <fieldset className="flex flex-col gap-6">
        <legend className="sr-only">{t('steps.date')}</legend>

        {/* Nur noch der Kalender. Vorher stand darüber ein `<input type="date">`
            plus der Hinweis „Oder direkt im Kalender wählen" — zwei Wege für
            dasselbe Feld, von denen der obere die Verfügbarkeit gar nicht
            kennt: Er nimmt klaglos ein Datum an, das der Kalender als belegt
            markiert. Ein Weg, der die Belegung zeigt, ist besser als zwei, von
            denen einer widerspricht.

            `eventDate` ist deshalb jetzt ein reines `setValue`-Feld ohne
            eigenes Control. Das Label bleibt sichtbar und trägt weiterhin die
            Fehlermeldung — das Pflichtfeld ist unverändert, nur die Eingabe
            ist es nicht mehr. */}
        <div className="flex flex-col gap-2">
          <p id="eventDate-label" className="text-sm font-medium text-ink">
            {t('fields.eventDate')}
            <span aria-hidden="true" className="text-gold"> *</span>
            <span className="sr-only"> ({tCommon('required')})</span>
          </p>
          <AvailabilityCalendar
            value={eventDate}
            onSelect={(iso) => {
              setValue('eventDate', iso, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
              void trigger('eventDate');
            }}
            onAnnounce={onAvailabilityAnnounce}
          />
          {/* Registriert das Feld, ohne es zu zeigen: RHF braucht die
              Registrierung, damit `trigger`/`errors` für `eventDate` greifen,
              und ein Submit ohne Auswahl muss weiterhin scheitern. */}
          <input type="hidden" {...register('eventDate')} />
          {dateError ? (
            <p id="eventDate-error" role="alert" className="text-sm text-danger">
              {dateError}
            </p>
          ) : null}
          <AvailabilityIndicator onAnnounce={onAvailabilityAnnounce} />
        </div>

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
