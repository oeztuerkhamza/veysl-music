'use client';

import { Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

/**
 * Compact, repeatable trust signal for the exact point of highest submit
 * anxiety: directly beside a submit/CTA button, not just "somewhere on the
 * page". See `docs/CRO-AUDIT.md` #5 — the existing `booking.aside.responseTime`
 * copy already says this once on `/anfrage`, but only inside a card that
 * sits BELOW the form in source order on mobile (single-column below `lg`),
 * i.e. below most visitors' fold at the exact moment they'd want the
 * reassurance most.
 *
 * A `'use client'` leaf (needs `useTranslations`) so it can be dropped into
 * either a Server or Client Component tree without the owning page needing
 * its own translation plumbing for it.
 */
export function ResponseTimeBadge({ className }: { className?: string }) {
  const t = useTranslations('cro');
  return (
    <p className={cn('inline-flex items-center gap-2 text-xs text-ink-muted', className)}>
      <Clock className="size-3.5 shrink-0 text-gold" aria-hidden="true" />
      {t('responseTimeBadge')}
    </p>
  );
}
