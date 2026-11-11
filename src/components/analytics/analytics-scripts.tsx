'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { initAnalytics, setAnalyticsLocale, trackPageview } from '@/lib/analytics';

/**
 * Bootstraps the analytics providers and keeps them in sync with locale and
 * client-side route changes. Renders nothing — every provider injects its
 * own script imperatively inside `init()` (see `src/lib/analytics/providers`).
 *
 * Mount exactly once, near the root of the tree — see `<AnalyticsRoot>` and
 * `docs/ANALYTICS.md` for the one-line addition to
 * `src/app/[locale]/layout.tsx` this needs (owned by the layout agent, not
 * this one).
 */
export function AnalyticsScripts() {
  const locale = useLocale();
  // Bewusst `next/navigation`, nicht `@/i18n/navigation`: next-intl liefert
  // bei dynamischen Routen den Routen-Schlüssel (`/hochzeits-dj/[stadt]`)
  // statt der echten URL. Damit landete in GA4 jede Stadtseite und jeder
  // Ratgeber-Artikel in einer einzigen Zeile, und ein Wechsel von einer
  // Stadtseite zur nächsten löste gar keinen page_view aus. Der Hook dient
  // nur als Auslöser; gesendet wird die Adresse, die der Browser anzeigt.
  const routePathname = usePathname();

  useEffect(() => {
    setAnalyticsLocale(locale);
  }, [locale]);

  // Runs once — initAnalytics() itself is idempotent, but there's no reason
  // to call it more than once from here.
  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackPageview(window.location.pathname);
  }, [routePathname]);

  return null;
}
