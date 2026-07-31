'use client';

import type { RefObject } from 'react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { serviceValues, type EnquiryFormInput } from '@/lib/booking';

/**
 * Schritt 2 — nur noch die Leistungs-Auswahl.
 *
 * Vorher standen hier sechs weitere Felder: Gästezahl, Start- und Endzeit,
 * interessantes Paket, Budgetrahmen und bevorzugte Moderationssprache. Alle
 * waren optional, alle sind auf Kundenwunsch entfernt — was ein Paar an dieser
 * Stelle noch nicht weiß, hält es auf, und was es weiß, steht ohnehin meist im
 * Freitextfeld in Schritt 3.
 *
 * Die Felder bleiben im Schema (`src/lib/booking.ts`) und in der
 * `enquiries`-Collection erhalten, nur ohne Eingabe: bereits eingegangene
 * Anfragen tragen die Werte, der Mail-Report blendet fehlende Angaben von
 * selbst aus („Gäste: keine Angabe"), und der WhatsApp-Flow erfasst Gästezahl
 * und Leistung weiterhin über seine eigenen Chips.
 */
export function StepDetails({ headingRef }: { headingRef: RefObject<HTMLHeadingElement | null> }) {
  const t = useTranslations('booking');
  const tServices = useTranslations('booking.services');
  const { register } = useFormContext<EnquiryFormInput>();

  return (
    <div className="flex flex-col gap-6">
      <h2 ref={headingRef} tabIndex={-1} className="font-display text-3xl text-ink focus:outline-none">
        {t('steps.details')}
      </h2>
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
    </div>
  );
}
