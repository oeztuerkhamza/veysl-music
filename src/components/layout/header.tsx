'use client';

import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { site } from '@/content/site';
import { ISLAMIC_SUPPORTED_LOCALES } from '@/content/islamic';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './language-switcher';
import { ThemeToggle } from './theme-toggle';

/**
 * `/fragen` and `/ratgeber` are here because they were previously reachable
 * from nowhere. The answer hub (40 Q&As, the site's highest sitemap priority
 * after the home page) and the entire 15-article guide cluster had no inbound
 * link from the header, the footer, the home page or any content page — the
 * only references anywhere were a back-link inside a blog article and two
 * pills rendered on blog articles themselves. That left ~67 of 179 URLs
 * discoverable through the sitemap alone, which gets them crawled but passes
 * them no link signal at all, and gives a reader no path in.
 *
 * The overlay is always mounted (see the `inert` note further down), so every
 * entry here is a real anchor in the served HTML of every page, not markup
 * that only appears after a click.
 */
const NAV_ITEMS = [
  { href: '/hochzeit-events', key: 'services' },
  /**
   * Direkt hinter den allgemeinen Leistungen, nicht ans Ende: Das ist der
   * Bereich mit dem klarsten eigenen Profil und der schwächsten Konkurrenz im
   * deutschsprachigen Markt (siehe docs/SEO-KEYWORD-MAP.md §5). Solange er nur
   * im Footer stand, las er sich wie eine Fußnote unter „Hochzeit & Events" —
   * genau das Gegenteil eines eigenständigen Angebots.
   *
   * `locales` blendet ihn dort aus, wo es die Seite nicht gibt (ku).
   */
  { href: '/islamische-hochzeit', key: 'islamicWedding', locales: ISLAMIC_SUPPORTED_LOCALES },
  { href: '/pakete', key: 'packages' },
  { href: '/echte-hochzeiten', key: 'weddings' },
  { href: '/ablauf', key: 'process' },
  { href: '/fragen', key: 'questions' },
  { href: '/ratgeber', key: 'guide' },
  { href: '/galerie', key: 'gallery' },
  { href: '/epk', key: 'epk' },
  { href: '/kontakt', key: 'contact' },
] as const satisfies ReadonlyArray<{ href: string; key: string; locales?: readonly Locale[] }>;

/** Entries whose page exists in the current locale. See the `locales` note on the islamic entry. */
function navItemsFor(locale: Locale) {
  return NAV_ITEMS.filter((item) => !('locales' in item) || item.locales.includes(locale));
}

/**
 * The bar itself carries five links, not the full set. Eight items at 1024 px
 * already forced the whole navigation — language switcher included — behind a
 * single low contrast icon, which read as "the menu is gone", and the list has
 * since grown to eleven. Five fit comfortably; the full set always lives one
 * click away in the overlay, which now opens at every width rather than being
 * a mobile fallback.
 *
 * `islamicWedding` took the slot that `music` used to hold, rather than
 * becoming a sixth item: five is a measured limit here, not a preference, and
 * a sixth entry would push the bar back into the collapsed state that this
 * list was trimmed to avoid. Music keeps its place in the overlay, one click
 * away, which is where seven of the eleven entries already live.
 */
const PRIMARY_KEYS = new Set(['services', 'islamicWedding', 'packages', 'weddings', 'contact']);

/**
 * Fallback for locales without the islamic page (ku): without it the bar would
 * simply show four links there instead of five. `music` is the entry that
 * gave up the slot, so it is also the one that takes it back.
 */
const PRIMARY_FALLBACK_KEY = 'music';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function Header() {
  const t = useTranslations('nav');
  const locale = useLocale() as Locale;
  const navItems = navItemsFor(locale);
  const primaryKeys = navItems.some((item) => item.key === 'islamicWedding')
    ? PRIMARY_KEYS
    : new Set([...PRIMARY_KEYS, PRIMARY_FALLBACK_KEY]);
  const primaryItems = navItems.filter((item) => primaryKeys.has(item.key));
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
          {primaryItems.map((item) => (
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

        {/* `min-h-0` + `overflow-y-auto` are what stop the list being clipped.
            A flex child defaults to `min-height: auto`, so it refuses to
            shrink below its content and simply overflows the dialog — with
            eight items at display size on a phone, the last one was cut off
            with no way to reach it. `m-auto` on the inner list centres it when
            there is room and gets out of the way when there is not, which
            `justify-center` alone cannot do: that clips the overflow at the
            top instead of letting it scroll. This matters more now that the
            list is ten items: on a short phone it genuinely scrolls, which is
            the intended behaviour, not a regression. */}
        <nav
          className="mx-auto flex w-full min-h-0 max-w-[90rem] flex-1 flex-col overflow-y-auto px-6 sm:px-8 lg:px-12"
          aria-label={t('menu')}
        >
          <div className="m-auto flex w-full flex-col gap-1 py-4">
            {navItems.map((item, index) => (
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
                {/* One notch smaller than before. Eight items have to fit a
                    short phone viewport; display-2 made that impossible. */}
                <span className="font-display text-2xl font-medium text-ink transition-colors duration-300 group-hover:text-clay sm:text-3xl lg:text-4xl">
                  {t(item.key)}
                </span>
              </Link>
            ))}
          </div>
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
