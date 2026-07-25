import { getTranslations } from 'next-intl/server';
import { CalendarHeart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getSite } from '@/content/get-site';

interface SaveForLaterProps {
  className?: string;
  /** Already-formatted, locale-correct date label (e.g. from `formatDate()`) to prefill into the WhatsApp message — omit outside the booking funnel. */
  eventDateLabel?: string;
}

/**
 * Soft-conversion exit path for a visitor who isn't ready to submit the full
 * enquiry form yet — see `docs/CRO-AUDIT.md` #9 ("Exit paths"). Deliberately
 * built on channels the site already has (a WhatsApp deep link with a
 * prefilled message, a `mailto:` fallback) rather than inventing a
 * newsletter/checklist-download backend that doesn't exist — see the doc
 * comment below.
 *
 * Both actions are plain anchor tags, so `whatsapp_click` / `email_click`
 * are already covered automatically by `<AutoTrack>`'s href-pattern
 * detection (see `src/components/analytics/auto-track.tsx`) — no extra
 * instrumentation needed here.
 *
 * A real "download the planning checklist" or newsletter capture would need
 * a new lightweight API route + storage, which this agent doesn't own
 * (`src/app/api/**` is booking-agent territory) — flagged as a follow-up
 * idea in `docs/CRO-AUDIT.md`, not faked here as if it already existed.
 */
export async function SaveForLater({ className, eventDateLabel }: SaveForLaterProps) {
  const t = await getTranslations('cro.saveForLater');
  const site = await getSite();

  const message = eventDateLabel ? t('whatsappPrefillWithDate', { date: eventDateLabel }) : t('whatsappPrefill');
  const whatsappHref = `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(message)}`;
  const mailHref = `mailto:${site.contact.email}?subject=${encodeURIComponent(t('mailSubject'))}`;

  return (
    <Card className={className}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <CalendarHeart className="size-5 shrink-0 text-gold" aria-hidden="true" />
          <p className="font-display text-lg text-ink">{t('title')}</p>
        </div>
        <p className="text-sm leading-relaxed text-ink-muted">{t('text')}</p>
        <div className="mt-1 flex flex-wrap gap-3">
          <Button href={whatsappHref} variant="secondary" size="sm">
            {t('whatsappCta')}
          </Button>
          <Button href={mailHref} variant="ghost" size="sm">
            {t('mailCta')}
          </Button>
        </div>
      </div>
    </Card>
  );
}
