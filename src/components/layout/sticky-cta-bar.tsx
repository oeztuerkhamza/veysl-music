'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { WhatsAppIcon } from '@/components/ui/social-icons';
import { useWhatsappModal } from '@/components/whatsapp/whatsapp-modal-provider';
import { cn } from '@/lib/utils';

/**
 * Mobile-only sticky CTA bar. Content row is a fixed 4rem (h-16) — keep that
 * in sync with `--mobile-cta-height` in globals.css (`calc(4rem + safe-area)`),
 * which the audio player's GlobalPlayer reads to stack above this bar. Its
 * WhatsApp button opens the shared pre-qualification modal rather than
 * linking to `wa.me` directly — see `src/components/whatsapp/`.
 */
export function StickyCtaBar() {
  const t = useTranslations();
  const pathname = usePathname();
  const { openWhatsappModal } = useWhatsappModal();
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    function onScroll() {
      setPastHero(window.scrollY > window.innerHeight * 0.7);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // usePathname() from next-intl resolves to the canonical (locale-agnostic)
  // key, so this comparison holds across every locale's localized slug.
  const isBookingPage = pathname === '/anfrage';
  const visible = pastHero && !isBookingPage;

  return (
    <div
      inert={!visible}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 backdrop-blur-md',
        'transition-transform duration-500 ease-out-expo lg:hidden',
        visible ? 'translate-y-0' : 'translate-y-full'
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex h-16 items-center gap-2 px-3">
        <Button href="/anfrage" variant="gold" size="md" className="flex-[2]">
          {t('cta.short')}
        </Button>
        <Button
          type="button"
          onClick={() => openWhatsappModal('stickyCta')}
          variant="secondary"
          size="md"
          aria-label={t('cta.whatsapp')}
          className="flex-1 px-0"
        >
          <WhatsAppIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
