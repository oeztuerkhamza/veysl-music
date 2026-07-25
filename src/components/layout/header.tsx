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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the overlay on route/locale changes (e.g. a link inside it navigated).
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Two-state open: mount immediately (inert, invisible), then flip `entered`
  // on the next frame so the CSS transition actually has something to
  // transition from — this is what drives the staggered link reveal.
  useEffect(() => {
    if (!mobileOpen) {
      setEntered(false);
      return;
    }
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

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
      openButtonRef.current?.focus();
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-500 ease-out-expo',
        scrolled || mobileOpen
          ? 'border-b border-line bg-bg/90 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      )}
    >
      <div className="mx-auto flex h-20 w-full max-w-[90rem] items-center justify-between px-6 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="font-display text-2xl font-medium tracking-[0.08em] text-ink"
          aria-label={t('home')}
        >
          {site.name}
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label={t('menu')}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium tracking-wide text-ink-muted transition-colors duration-300 hover:text-ink"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher />
          <ThemeToggle />
          <Button href="/anfrage" variant="gold" size="md">
            {t('booking')}
          </Button>
        </div>

        <button
          ref={openButtonRef}
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink lg:hidden"
          aria-label={t('menu')}
          aria-haspopup="dialog"
          aria-expanded={mobileOpen}
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
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
          'fixed inset-0 z-50 flex h-dvh flex-col bg-bg transition-opacity duration-300 ease-out-expo lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div className="flex h-20 items-center justify-between px-6 sm:px-8">
          <span className="font-display text-2xl font-medium tracking-[0.08em] text-ink">{site.name}</span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setMobileOpen(false)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink"
            aria-label={t('close')}
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col justify-center gap-2 px-6 sm:px-8" aria-label={t('menu')}>
          {NAV_ITEMS.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'font-display text-3xl font-medium text-ink transition-all duration-500 ease-out-expo',
                entered ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
              )}
              style={{ transitionDelay: entered ? `${index * 60}ms` : '0ms' }}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-4 px-6 pb-10 sm:px-8">
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <Button href="/anfrage" variant="gold" size="lg" className="w-full">
            {t('booking')}
          </Button>
        </div>
      </div>
    </header>
  );
}
