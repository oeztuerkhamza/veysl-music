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
        {/* Clay, not gold: the primary conversion has exactly one colour across
            the site (hero, header, sticky bar), so it is recognisable as "the
            booking button" rather than as another accent. */}
        <Button href="/anfrage" variant="clay" size="md" className="flex-[2]">
          {t('cta.short')}
        </Button>
        {/* WhatsApp-Grün (#25D366), nicht die neutrale Outline-Variante.
            Seit der runde FAB unterhalb von `lg` ausgeblendet ist, ist dieser
            Knopf auf dem Telefon der einzige WhatsApp-Einstieg — und WhatsApp
            wird an der Farbe erkannt, nicht am Glyph. Als graue Umrandung
            neben dem tonfarbenen Hauptknopf las er sich wie ein
            Sekundär-Icon; grün ist er das, was er ist: der schnellste Weg,
            uns zu erreichen.

            Bewusst ein eigenes `className` statt einer neuen Button-Variante:
            es ist eine Fremdmarken-Farbe, die genau hier und im FAB gilt und
            nirgendwo sonst im Designsystem auftauchen soll. */}
        <button
          type="button"
          onClick={() => openWhatsappModal('stickyCta')}
          aria-label={t('cta.whatsapp')}
          className={cn(
            'flex h-11 flex-1 items-center justify-center rounded-full',
            'bg-[#25D366] text-white transition-transform duration-300 ease-out-expo',
            'hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
            'motion-reduce:transition-none motion-reduce:hover:scale-100'
          )}
        >
          <WhatsAppIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
