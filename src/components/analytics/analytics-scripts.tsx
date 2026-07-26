'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
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
  const pathname = usePathname();

  useEffect(() => {
    setAnalyticsLocale(locale);
  }, [locale]);

  // Runs once — initAnalytics() itself is idempotent, but there's no reason
  // to call it more than once from here.
  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackPageview(pathname);
  }, [pathname]);

  return null;
}
