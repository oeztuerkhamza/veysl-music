import type { AnalyticsProvider } from '../types';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Consent-gated: `init()` must only ever be called after the visitor has
 * explicitly granted consent (see `src/components/analytics/analytics-scripts.tsx`).
 * This is deliberately stricter than Google's own Consent Mode v2
 * recommendation, which allows loading `gtag.js` pre-consent and sending
 * cookieless "consent pings" while `analytics_storage` stays `denied` — this
 * project's brief calls for GA4 to be "off by default, only load after
 * explicit consent", so `gtag.js` itself is never requested from Google
 * until that happens. See `docs/ANALYTICS.md` for the trade-off this
 * implies (no pre-consent conversion modelling from Google's side — an
 * acceptable cost for a stricter, more defensible DSGVO/TTDSG posture).
 */
export function createGa4Provider(measurementId: string): AnalyticsProvider {
  let loaded = false;

  return {
    name: 'ga4',
    init() {
      if (typeof document === 'undefined' || loaded) return;
      loaded = true;

      window.dataLayer = window.dataLayer || [];
      window.gtag =
        window.gtag ||
        function gtag(...args: unknown[]) {
          window.dataLayer!.push(args);
        };

      window.gtag('js', new Date());
      // Consent Mode v2 — analytics only, never ads. Set right after consent
      // was granted (init() is guaranteed to never run before that).
      window.gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'granted',
      });
      window.gtag('config', measurementId, {
        // App Router client-side navigations don't reload the document, so
        // gtag's own automatic "pageview on load" would only ever fire once
        // per full page load. `pageview()` below sends the rest manually.
        send_page_view: false,
        anonymize_ip: true,
      });

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);
    },
    track(event, props) {
      window.gtag?.('event', event, props);
    },
    pageview(path) {
      window.gtag?.('event', 'page_view', { page_path: path });
    },
    teardown() {
      // gtag.js cannot be truly "unloaded" once fetched, and GA sets its own
      // first-party cookies (_ga, _ga_<id>) outside our control. Best
      // effort: stop sending further hits and drop GA's own cookies for
      // this domain so a visitor who revokes consent isn't measured again
      // on their next page.
      window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
      loaded = false;
      if (typeof document === 'undefined') return;
      document.cookie.split(';').forEach((entry) => {
        const name = entry.split('=')[0]?.trim();
        if (name && /^_ga/.test(name)) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
        }
      });
    },
  };
}
