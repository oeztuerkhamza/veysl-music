'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Check, Globe2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { localeNames, routing, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';

/**
 * Accessible menu-button pattern (WAI-ARIA APG "Menu Button" with a radio
 * group of mutually exclusive choices). Each language is always rendered in
 * its own language (endonym) — that's the international convention, not a
 * translation gap, so `localeNames` is intentionally not run through `t()`.
 * No flags: flags represent countries, not languages, and Kurdish has no
 * flag that maps cleanly.
 */
export function LanguageSwitcher() {
  const t = useTranslations('nav');
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function selectLocale(nextLocale: Locale) {
    setOpen(false);
    triggerRef.current?.focus();
    if (nextLocale === locale) return;
    router.replace(
      // Dynamic routes (e.g. `/hochzeits-dj/[stadt]`) need their params to
      // rebuild the localized href; they always match the current pathname
      // at runtime, but next-intl can't statically prove that generically.
      // @ts-expect-error -- see https://next-intl.dev/docs/routing/navigation#userouter
      { pathname, params },
      { locale: nextLocale }
    );
  }

  function onMenuKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const items = itemRefs.current.filter((item): item is HTMLButtonElement => Boolean(item));
    if (items.length === 0) return;
    const currentIndex = items.findIndex((item) => item === document.activeElement);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      items[(currentIndex + 1 + items.length) % items.length]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      items[(currentIndex - 1 + items.length) % items.length]?.focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      items[0]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      items[items.length - 1]?.focus();
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('language')}
        className="inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-ink-muted transition-colors duration-300 hover:text-ink"
      >
        <Globe2 className="h-4 w-4" aria-hidden="true" />
        <span className="uppercase">{locale}</span>
      </button>

      {open ? (
        <div
          role="menu"
          aria-label={t('language')}
          onKeyDown={onMenuKeyDown}
          className="absolute right-0 top-full z-50 mt-2 max-h-80 min-w-[10rem] overflow-y-auto rounded-md border border-line bg-surface py-1 shadow-lift"
        >
          {routing.locales.map((item, index) => {
            const isActive = item === locale;
            return (
              <button
                key={item}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                type="button"
                role="menuitem"
                aria-current={isActive ? 'true' : undefined}
                onClick={() => selectLocale(item)}
                className={cn(
                  'flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm text-ink-muted transition-colors duration-300 hover:bg-surface-2 hover:text-ink',
                  isActive && 'text-ink'
                )}
              >
                {localeNames[item]}
                {isActive ? <Check className="h-4 w-4 text-gold" aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
