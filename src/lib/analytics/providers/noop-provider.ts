import type { AnalyticsProvider } from '../types';

/**
 * Safe default when nothing is configured (local dev, PR previews without
 * `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` set). Every call is a genuine no-op —
 * nothing is ever sent anywhere, no network request is ever made. This is
 * what makes `track()` safe to call from anywhere without env-var checks
 * scattered through the codebase.
 */
export function createNoopProvider(): AnalyticsProvider {
  return {
    name: 'noop',
    init() {},
    track() {},
    pageview() {},
  };
}
