import type { AnalyticsProvider, EventProps } from '../types';

declare global {
  interface Window {
    plausible?: {
      (event: string, options?: { props?: EventProps; u?: string }): void;
      q?: unknown[];
    };
  }
}

/**
 * Cookieless, no personal data — Plausible needs no consent banner under
 * DSGVO/TTDSG (see `docs/ANALYTICS.md`). Always active whenever
 * `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set, independent of the optional
 * GA4/Clarity consent gate. This is the ONLY provider active for the
 * majority of visitors (those who decline/never see the optional-stats
 * prompt), which is the entire point: a cookieless tool measures everyone,
 * a consent-gated one measures only the subset who opted in.
 */
export function createPlausibleProvider(domain: string, scriptUrl: string): AnalyticsProvider {
  function ensureQueue() {
    if (typeof window === 'undefined') return;
    // Standard Plausible queuing snippet: events fired before the real
    // script has finished loading are buffered on `.q` and flushed once it has.
    window.plausible =
      window.plausible ||
      function plausible(...args: unknown[]) {
        (window.plausible!.q = window.plausible!.q || []).push(args);
      };
  }

  return {
    name: 'plausible',
    init() {
      if (typeof document === 'undefined') return;
      ensureQueue();
      if (document.querySelector(`script[data-domain="${domain}"]`)) return;
      const script = document.createElement('script');
      script.defer = true;
      script.dataset.domain = domain;
      script.src = scriptUrl;
      document.head.appendChild(script);
    },
    track(event, props) {
      window.plausible?.(event, props ? { props } : undefined);
    },
    pageview() {
      // Deliberately a no-op: Plausible's standard `script.js` already hooks
      // the History API and reports pageviews on every client-side route
      // change by itself (that's why we use `script.js`, not
      // `script.manual.js`). Calling `plausible('pageview', ...)` here too
      // would risk double-counting; see `providers/ga4-provider.ts` for the
      // provider that genuinely needs a manual call.
    },
  };
}
