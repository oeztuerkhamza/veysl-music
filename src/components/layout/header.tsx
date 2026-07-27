'use client';

import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { site } from '@/content/site';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './language-switcher';
import { ThemeToggle } from './theme-toggle';

const NAV_ITEMS = [
  { href: '/hochzeit-events', key: 'services' },
  { href: '/pakete', key: 'packages' },
  { href: '/echte-hochzeiten', key: 'weddings' },
  { href: '/musik', key: 'music' },
  { href: '/ablauf', key: 'process' },
  { href: '/galerie', key: 'gallery' },
  { href: '/epk', key: 'epk' },
  { href: '/kontakt', key: 'contact' },
] as const;

/**
 * The bar itself carries five links, not eight. Eight items at 1024 px forced
 * the whole navigation — language switcher included — behind a single low
 * contrast icon, which read as "the menu is gone". Five fit comfortably; the
 * full set always lives one click away in the overlay, which now opens at
 * every width rather than being a mobile fallback.
 */
const PRIMARY_KEYS = new Set(['services', 'packages', 'weddings', 'music', 'contact']);
const PRIMARY_ITEMS = NAV_ITEMS.filter((item) => PRIMARY_KEYS.has(item.key));

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function Header() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  // Close the overlay on route/locale changes (e.g. a link inside it
  // navigated), and reset the staggered-reveal flag the instant it closes.
  // Adjusted directly during render — not in an effect — per the "Adjusting
  // some state when a prop changes" pattern (react.dev/learn/you-might-not-need-an-effect):
  // it's synchronous, so there's no extra painted frame with stale state,
  // and it doesn't call setState from inside an effect body.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }
  const [prevMobileOpen, setPrevMobileOpen] = useState(mobileOpen);
  if (mobileOpen !== prevMobileOpen) {
    setPrevMobileOpen(mobileOpen);
    if (!mobileOpen) setEntered(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Two-state open: mount immediately (inert, invisible), then flip `entered`
  // on the next frame so the CSS transition actually has something to
  // transition from — this is what drives the staggered link reveal. (The
  // immediate reset to `false` on close happens above, during render.)
  useEffect(() => {
    if (!mobileOpen) return;
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    /**
     * Auslöser hier festhalten und nicht erst im Cleanup aus dem Ref lesen:
     * zum Aufräumzeitpunkt kann `current` schon auf einen anderen Knoten
     * zeigen, und dann landet der Fokus nach dem Schließen irgendwo statt auf
     * dem Menü-Button. Der Button bleibt über die ganze Lebensdauer des
     * Overlays gemountet, also ist die festgehaltene Referenz genau die
     * richtige.
     */
    const trigger = openButtonRef.current;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !overlayRef.current) return;
      const focusable = Array.from(overlayRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      trigger?.focus();
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-500 ease-out-expo',
        scrolled || mobileOpen
          ? 'border-b border-line bg-bg/85 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      )}
    >
      <div className="mx-auto flex h-20 w-full max-w-[90rem] items-center justify-between gap-4 px-6 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="font-display text-2xl font-medium tracking-[0.08em] text-ink"
          aria-label={t('home')}
        >
          {site.name}
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label={t('menu')}>
          {PRIMARY_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium tracking-wide text-ink-muted transition-colors duration-300 hover:text-ink"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Never collapsed into the overlay: on a seven-language site the
              language control is a primary affordance, and a visitor who
              cannot find it in the bar assumes it does not exist. */}
          <LanguageSwitcher />
          <ThemeToggle />

          <Button href="/anfrage" variant="clay" size="md" className="hidden sm:inline-flex">
            {t('booking')}
          </Button>

          {/* Bordered, not bare: over the hero the old icon-only button had no
              visible affordance at all. */}
          <button
            ref={openButtonRef}
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink transition-colors duration-300 hover:border-clay hover:text-clay"
            aria-label={t('menu')}
            aria-haspopup="dialog"
            aria-expanded={mobileOpen}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Always mounted (not conditionally removed): `inert` keeps it out of
          the tab order and the accessibility tree while closed, and lets the
          opacity/transform transition actually run on open instead of being
          skipped by mount/unmount. */}
      <div
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('menu')}
        inert={!mobileOpen}
        className={cn(
          'fixed inset-0 z-50 flex h-dvh flex-col bg-bg transition-opacity duration-300 ease-out-expo',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div className="mx-auto flex h-20 w-full max-w-[90rem] items-center justify-between px-6 sm:px-8 lg:px-12">
          <span className="font-display text-2xl font-medium tracking-[0.08em] text-ink">{site.name}</span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setMobileOpen(false)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink transition-colors duration-300 hover:border-clay hover:text-clay"
            aria-label={t('close')}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav
          className="mx-auto flex w-full max-w-[90rem] flex-1 flex-col justify-center gap-1 px-6 sm:px-8 lg:px-12"
          aria-label={t('menu')}
        >
          {NAV_ITEMS.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-baseline gap-5 py-1 transition-all duration-500 ease-out-expo',
                entered ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
              )}
              style={{ transitionDelay: entered ? `${index * 55}ms` : '0ms' }}
            >
              <span className="text-label w-6 shrink-0 text-ink-faint tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="text-display-3 font-medium text-ink transition-colors duration-300 group-hover:text-clay sm:text-display-2">
                {t(item.key)}
              </span>
            </Link>
          ))}
        </nav>

        <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-4 px-6 pb-10 sm:px-8 lg:px-12">
          <Button href="/anfrage" variant="clay" size="lg" className="w-full sm:w-auto sm:self-start">
            {t('booking')}
          </Button>
        </div>
      </div>
    </header>
  );
}
