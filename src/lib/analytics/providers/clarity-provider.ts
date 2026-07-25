import type { AnalyticsProvider } from '../types';

declare global {
  interface Window {
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[] };
  }
}

/**
 * Consent-gated session replay/heatmaps.
 *
 * IMPORTANT — masking is configured in the Clarity project dashboard
 * (Settings → Privacy → "Mask all text and user input" / Strict mode), NOT
 * in this file: Clarity's own recording script starts capturing before any
 * of our JS can intervene per-field, so dashboard-level masking is the only
 * reliable way to guarantee the enquiry form's name/email/phone/message
 * fields are never captured in a session replay. This MUST be turned on
 * before `NEXT_PUBLIC_CLARITY_PROJECT_ID` is ever set in a production
 * environment — see `docs/ANALYTICS.md` for the exact steps.
 */
export function createClarityProvider(projectId: string): AnalyticsProvider {
  let loaded = false;

  return {
    name: 'clarity',
    init() {
      if (typeof document === 'undefined' || loaded) return;
      loaded = true;

      window.clarity =
        window.clarity ||
        (function clarity(...args: unknown[]) {
          (window.clarity!.q = window.clarity!.q || []).push(args);
        } as Window['clarity']);

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.clarity.ms/tag/${projectId}`;
      document.head.appendChild(script);
    },
    track(event) {
      // Clarity's custom-event API takes a name only, no arbitrary props —
      // see https://learn.microsoft.com/clarity/setup-and-installation/clarity-api.
      // The full prop payload still reaches Plausible/GA4 via the same
      // `track()` call; Clarity only ever gets the bare event name.
      window.clarity?.('event', event);
    },
    pageview() {
      // Clarity's script is SPA-aware and tracks page views itself.
    },
    teardown() {
      window.clarity?.('consent', false);
      loaded = false;
    },
  };
}
