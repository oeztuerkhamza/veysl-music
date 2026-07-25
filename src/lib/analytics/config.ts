/**
 * Reads `NEXT_PUBLIC_*` analytics configuration. Every value is optional —
 * absence means "not configured", never a hard error, matching this
 * codebase's existing "ship empty" philosophy (see e.g.
 * `src/content/availability.ts`, `src/lib/social/provider.ts`). Safe to call
 * from both server and client code — these are all `NEXT_PUBLIC_` vars,
 * inlined at build time.
 */

export interface AnalyticsConfig {
  /** Bare domain Plausible was configured with, e.g. `"veysl.de"`. Unset = Plausible (and therefore all core, cookieless tracking) is off. */
  plausibleDomain?: string;
  /** Override for a self-hosted Plausible instance. Defaults to Plausible Cloud's script. */
  plausibleScriptUrl: string;
  /** GA4 Measurement ID, e.g. `"G-XXXXXXXXXX"`. Consent-gated — see `src/components/analytics/consent-banner.tsx`. */
  ga4MeasurementId?: string;
  /** Microsoft Clarity project ID. Consent-gated. Requires Strict masking mode enabled in the Clarity dashboard first — see `docs/ANALYTICS.md`. */
  clarityProjectId?: string;
}

export function getAnalyticsConfig(): AnalyticsConfig {
  return {
    plausibleDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || undefined,
    plausibleScriptUrl: process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL || 'https://plausible.io/js/script.js',
    ga4MeasurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || undefined,
    clarityProjectId: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || undefined,
  };
}

/**
 * Whether there is anything at all for a visitor to consent to. Plausible is
 * deliberately excluded — it's cookieless and collects no personal data, so
 * it never needs consent under DSGVO/TTDSG. Gates whether `<ConsentBanner>`
 * renders at all: showing a consent prompt for a decision that doesn't exist
 * would be pure friction with zero purpose.
 */
export function hasConsentGatedProviders(config: AnalyticsConfig = getAnalyticsConfig()): boolean {
  return Boolean(config.ga4MeasurementId || config.clarityProjectId);
}
