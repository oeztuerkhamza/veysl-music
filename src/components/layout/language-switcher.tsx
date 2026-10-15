'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter as useRawRouter } from 'next/navigation';
import { Check, Globe2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { hreflangTags, localeNames, routing, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';

/**
 * Die Sprachvarianten der aktuellen Seite, gelesen aus ihren eigenen
 * `<link rel="alternate" hreflang>`-Tags: hreflang-Code → Pfad.
 *
 * Warum aus dem DOM und nicht aus den Route-Params: Der Umschalter baute die
 * Ziel-URL früher aus den Params der aktuellen Seite. Das ist falsch, sobald
 * der Slug sprachabhängig ist — auf `/en/guide/wedding-dj-checklist` ergab
 * „Türkisch" `/tr/rehber/wedding-dj-checklist` (404, richtig wäre
 * `/tr/rehber/dugun-dj-kontrol-listesi`). Und er bot jede der acht Sprachen
 * an, auch dort, wo es die Seite nicht gibt: Stadt-, Regions- und
 * Landesseiten existieren nur auf de/tr/en. Der Search-Console-Export vom
 * 2026-10-16 listet 273 Adressen als 404: 224 davon liegen in ku/ar/nl/fr/es,
 * 42 tragen in de/tr/en den Slug einer anderen Sprache — beides Adressen,
 * die dieser Umschalter erzeugen konnte. (Ob ein Teil auch aus älteren
 * Sitemaps stammt, lässt der Export nicht erkennen.)
 *
 * Die hreflang-Tags der Seite sind die einzige Stelle, die beides schon
 * richtig weiß: `buildMetadata()` setzt sie pro Seite mit den
 * sprachspezifischen Slugs und nur für Sprachen, in denen die Seite wirklich
 * existiert. Sitemap und Umschalter lesen damit dieselbe Wahrheit.
 */
function readAlternates(): Partial<Record<string, string>> {
  const found: Partial<Record<string, string>> = {};
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((node) => {
    const code = node.getAttribute('hreflang');
    const href = node.getAttribute('href');
    if (!code || !href || code === 'x-default') return;
    try {
      const url = new URL(href, window.location.origin);
      found[code] = url.pathname + url.search;
    } catch {
      /* ungültige URL — Sprache bleibt ausgeblendet */
    }
  });
  return found;
}

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
  const router = useRouter();
  const rawRouter = useRawRouter();
  const [open, setOpen] = useState(false);
  // Wird beim Öffnen des Menüs neu gelesen, nicht beim Rendern: Nach einer
  // Client-Navigation tauschen sich die Tags erst mit der neuen Seite aus.
  const [alternates, setAlternates] = useState<Partial<Record<string, string>>>({});
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

  function toggleMenu() {
    if (!open) setAlternates(readAlternates());
    setOpen((value) => !value);
  }

  function selectLocale(nextLocale: Locale) {
    setOpen(false);
    triggerRef.current?.focus();
    if (nextLocale === locale) return;
    const target = alternates[hreflangTags[nextLocale]];
    if (target) {
      rawRouter.replace(target);
    } else {
      // Keine Alternativen gefunden (z. B. auf der Fehlerseite): lieber die
      // Startseite der Sprache als eine geratene URL, die 404 liefern kann.
      router.replace('/', { locale: nextLocale });
    }
  }

  // Nur Sprachen anbieten, in denen es diese Seite gibt. Ohne gelesene
  // Alternativen bleiben alle sichtbar und führen auf die Startseite.
  const hasAlternates = Object.keys(alternates).length > 0;
  const available = routing.locales.filter(
    (item) => item === locale || !hasAlternates || Boolean(alternates[hreflangTags[item]]),
  );

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
        onClick={toggleMenu}
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
          className="absolute end-0 top-full z-50 mt-2 max-h-80 min-w-[10rem] overflow-y-auto rounded-md border border-line bg-surface py-1 shadow-lift"
        >
          {available.map((item, index) => {
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
                  'flex w-full items-center justify-between gap-3 px-4 py-2 text-start text-sm text-ink-muted transition-colors duration-300 hover:bg-surface-2 hover:text-ink',
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
