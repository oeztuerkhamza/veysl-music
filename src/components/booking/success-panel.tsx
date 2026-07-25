'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useWhatsappModal } from '@/components/whatsapp/whatsapp-modal-provider';
import { formatDate } from '@/lib/utils';

export function SuccessPanel({ firstName: name, eventDate }: { firstName: string; eventDate: string }) {
  const t = useTranslations('booking.success');
  const locale = useLocale();
  const { openWhatsappModal } = useWhatsappModal();
  const dateLabel = formatDate(eventDate, locale);

  return (
    <div role="status" className="flex flex-col gap-6 rounded-lg border border-line bg-surface p-8 text-center">
      <h2 className="font-display text-3xl text-ink">{t('title')}</h2>
      <p className="text-lg text-ink-muted">{t('text', { name, date: dateLabel })}</p>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button type="button" onClick={() => openWhatsappModal('bookingSuccess')} variant="gold" size="lg">
          {t('whatsapp')}
        </Button>
        <Button href="/" variant="ghost" size="lg">
          {t('backHome')}
        </Button>
      </div>
    </div>
  );
}
