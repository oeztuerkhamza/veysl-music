import type { AnalyticsProvider } from '../types';

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/**
 * Consent-gated, same rule as the GA4 provider: `init()` is only ever called
 * after the visitor explicitly accepted (see `src/lib/analytics/index.ts`), so
 * `gtm.js` is never requested from Google before that.
 *
 * Replaces the direct GA4 provider when `NEXT_PUBLIC_GTM_ID` is set — GA4 (and
 * any other tag) is then configured inside the GTM container. Running both
 * would count every hit twice.
 *
 * Every `track()` call becomes a `dataLayer` event named exactly like the
 * event in the taxonomy (`cta_click`, `enquiry_submitted`, …) with its props
 * as flat keys, so a GTM "Custom Event" trigger + "Data Layer Variable"s work
 * without any glue code. Route changes push `page_view` with `page_path`.
 */
export function createGtmProvider(containerId: string): AnalyticsProvider {
  let loaded = false;

  function push(entry: Record<string, unknown>) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(entry);
  }

  return {
    name: 'gtm',
    init() {
      if (typeof document === 'undefined' || loaded) return;
      loaded = true;

      window.dataLayer = window.dataLayer || [];
      // Consent Mode v2 — analytics only, never ads. Must precede gtm.js.
      // GTM reads `consent` commands pushed as `arguments` objects, so a plain
      // array would be ignored.
      function gtag(..._args: unknown[]) {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer!.push(arguments);
      }
      gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'granted',
      });

      push({ 'gtm.start': Date.now(), event: 'gtm.js' });

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}`;
      document.head.appendChild(script);
    },
    track(event, props) {
      if (!loaded) return;
      push({ event, ...props });
    },
    pageview(path) {
      if (!loaded) return;
      push({ event: 'page_view', page_path: path });
    },
    teardown() {
      // Like gtag.js, gtm.js can't be unloaded once fetched. Deny analytics
      // storage so consent-aware tags stop, and drop GA's cookies.
      if (typeof document === 'undefined') return;
      function gtag(..._args: unknown[]) {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer!.push(arguments);
      }
      if (window.dataLayer) gtag('consent', 'update', { analytics_storage: 'denied' });
      loaded = false;
      document.cookie.split(';').forEach((entry) => {
        const name = entry.split('=')[0]?.trim();
        if (name && /^_ga/.test(name)) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
        }
      });
    },
  };
}
