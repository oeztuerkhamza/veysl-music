'use client';

import { useTranslations } from 'next-intl';
import { useAudio } from '@/components/audio';
import { useWhatsappModal } from '@/components/whatsapp/whatsapp-modal-provider';
import { WhatsAppIcon } from '@/components/ui/social-icons';
import { cn } from '@/lib/utils';

/**
 * Fixed WhatsApp button, bottom-right, on every page. Mounted once in
 * `src/app/[locale]/layout.tsx` alongside `<StickyCtaBar />`. Opens the
 * shared pre-qualification modal (`src/components/whatsapp/whatsapp-
 * prequalify-modal.tsx`) rather than linking to `wa.me` directly — that
 * modal's own "Direkt schreiben" is the instant-skip path.
 *
 * Stacking: on screens where `StickyCtaBar` can be visible (below `lg`) the
 * FAB sits above it via the same `--mobile-cta-height` custom property that
 * bar publishes; when the global audio player is also mounted (a track has
 * been started), the FAB is pushed up further so it never overlaps the
 * player's controls, using its approximate collapsed/expanded heights. From
 * `lg` up, `StickyCtaBar` is never rendered, so the FAB drops back to a
 * simple corner offset (`GlobalPlayer` sits at `bottom-0` full-width there
 * instead, clear of the right-aligned FAB by z-index only — acceptable
 * since the widths rarely fully coincide with the corner and this keeps the
 * fix scoped to this component; flag to the layout/audio agents if a real
 * collision is spotted in review).
 */
export function WhatsAppFab() {
  const t = useTranslations('cta');
  const { current, expanded } = useAudio();
  const { openWhatsappModal } = useWhatsappModal();

  const hasPlayer = Boolean(current);

  return (
    <button
      type="button"
      onClick={() => openWhatsappModal('fab')}
      aria-label={t('whatsappFab')}
      className={cn(
        'fixed right-4 z-50 flex size-14 items-center justify-center rounded-full',
        'bg-[#25D366] text-white shadow-lift transition-transform duration-300 ease-out-expo',
        'hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        'motion-reduce:transition-none motion-reduce:hover:scale-100',
        'sm:right-[calc(1.5rem+env(safe-area-inset-right,0px))]',
        'right-[calc(1rem+env(safe-area-inset-right,0px))]',
        // `--mobile-cta-height` already includes env(safe-area-inset-bottom) —
        // see src/app/globals.css — so it covers the safe area below `lg`
        // (where StickyCtaBar can be visible) without double-counting it.
        'bottom-[calc(var(--mobile-cta-height,4rem)+0.75rem)]',
        hasPlayer && !expanded && 'bottom-[calc(var(--mobile-cta-height,4rem)+7rem)]',
        hasPlayer && expanded && 'bottom-[calc(var(--mobile-cta-height,4rem)+17rem)]',
        // From `lg` up StickyCtaBar never renders, so fall back to a plain
        // corner offset plus the safe area directly.
        'lg:bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))]',
        hasPlayer && !expanded && 'lg:bottom-[calc(6rem+env(safe-area-inset-bottom,0px))]',
        hasPlayer && expanded && 'lg:bottom-[calc(17rem+env(safe-area-inset-bottom,0px))]'
      )}
    >
      <WhatsAppIcon className="size-7" />
    </button>
  );
}
