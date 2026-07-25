'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { site } from '@/content/site';

export function ErrorPanel({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations('booking.error');
  const tCta = useTranslations('cta');
  const whatsappUrl = `https://wa.me/${site.contact.whatsapp}`;

  return (
    <div role="alert" className="flex flex-col gap-6 rounded-lg border border-danger/40 bg-danger/5 p-8 text-center">
      <h2 className="font-display text-3xl text-ink">{t('title')}</h2>
      <p className="text-lg text-ink-muted">{t('text')}</p>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button type="button" onClick={onRetry} variant="primary" size="lg">
          {t('retry')}
        </Button>
        <Button href={whatsappUrl} variant="ghost" size="lg">
          {tCta('whatsapp')}
        </Button>
      </div>
    </div>
  );
}
