/**
 * Public entry point for analytics. Components should almost always import
 * the typed `track*()` helpers at the bottom of this file rather than the
 * generic `track()` primitive — that's what keeps the event taxonomy in
 * `docs/ANALYTICS.md` and the actual call sites from drifting apart.
 *
 * Provider registry:
 *  - Plausible (or the Noop fallback) is "core": active immediately, no
 *    consent required — see `providers/plausible-provider.ts`.
 *  - GA4 / Clarity are "gated": only ever initialized after
 *    `getStoredConsent() === 'granted'`, torn down again on revoke.
 */
import { getAnalyticsConfig } from './config';
import { getStoredConsent, onConsentChange } from './consent';
import { createClarityProvider } from './providers/clarity-provider';
import { createGa4Provider } from './providers/ga4-provider';
import { createNoopProvider } from './providers/noop-provider';
import { createPlausibleProvider } from './providers/plausible-provider';
import type { AnalyticsProvider, EventProps } from './types';

let coreProviders: AnalyticsProvider[] = [];
let gatedProviders: AnalyticsProvider[] = [];
let bootstrapped = false;
let unsubscribeConsent: (() => void) | null = null;
let currentLocale = 'de';
let currentPath = '/';

function buildCoreProviders(): AnalyticsProvider[] {
  const config = getAnalyticsConfig();
  if (config.plausibleDomain) {
    return [createPlausibleProvider(config.plausibleDomain, config.plausibleScriptUrl)];
  }
  return [createNoopProvider()];
}

function buildGatedProviders(): AnalyticsProvider[] {
  const config = getAnalyticsConfig();
  const providers: AnalyticsProvider[] = [];
  if (config.ga4MeasurementId) providers.push(createGa4Provider(config.ga4MeasurementId));
  if (config.clarityProjectId) providers.push(createClarityProvider(config.clarityProjectId));
  return providers;
}

/** Called once by `<AnalyticsScripts>`. Idempotent — safe if mounted twice (e.g. React Strict Mode). */
export function initAnalytics(): void {
  if (bootstrapped) return;
  bootstrapped = true;

  coreProviders = buildCoreProviders();
  coreProviders.forEach((provider) => provider.init());

  if (getStoredConsent() === 'granted') {
    gatedProviders = buildGatedProviders();
    gatedProviders.forEach((provider) => provider.init());
  }

  unsubscribeConsent = onConsentChange((value) => {
    if (value === 'granted') {
      if (gatedProviders.length === 0) gatedProviders = buildGatedProviders();
      gatedProviders.forEach((provider) => {
        provider.init();
        provider.pageview(currentPath);
      });
    } else {
      gatedProviders.forEach((provider) => provider.teardown?.());
    }
  });
}

/** Keeps the current locale available so every tracked event carries it — see `track()` below. Called from `<AnalyticsScripts>` via `useLocale()`. */
export function setAnalyticsLocale(locale: string): void {
  currentLocale = locale;
}

function activeProviders(): AnalyticsProvider[] {
  return [...coreProviders, ...gatedProviders];
}

// A crude but cheap net: catches an accidentally-passed email address or a
// long run of digits (phone number) landing in an event prop. Dev-only,
// non-blocking — see `.claude/CONTRACT.md`/the CRO brief's "never send PII"
// rule. This is a safety net for mistakes, not a substitute for reviewing
// what a new `track*()` call site actually passes.
const LOOKS_LIKE_PII = /@|\+?\d[\d\s-]{6,}\d/;

function warnIfPii(event: string, props?: EventProps) {
  if (process.env.NODE_ENV === 'production' || !props) return;
  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'string' && LOOKS_LIKE_PII.test(value)) {
      console.warn(
        `[analytics] "${event}" prop "${key}" looks like it may contain an email/phone number. ` +
          'Analytics event props must stay categories/counts only — double-check this call site.'
      );
    }
  }
}

/**
 * Core primitive. Prefer the typed `track*()` helpers below in application
 * code — they exist precisely so a typo can't silently create a new,
 * uncounted event name. Never throws: each provider is called inside its
 * own try/catch so one broken provider can't take another down with it.
 */
export function track(event: string, props?: EventProps): void {
  warnIfPii(event, props);
  const payload: EventProps = { locale: currentLocale, ...props };

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console -- intentional dev-only visibility into what's being tracked
    console.debug(`[analytics] ${event}`, payload);
  }

  for (const provider of activeProviders()) {
    try {
      provider.track(event, payload);
    } catch (err) {
      console.error(`[analytics] provider "${provider.name}" failed to track "${event}"`, err);
    }
  }
}

/** Records an SPA route change. Called by `<AnalyticsScripts>` on every pathname change. */
export function trackPageview(path: string): void {
  currentPath = path;
  for (const provider of activeProviders()) {
    try {
      provider.pageview(path);
    } catch (err) {
      console.error(`[analytics] provider "${provider.name}" failed to record a pageview`, err);
    }
  }
}

// ---------------------------------------------------------------------------
// Typed event taxonomy — see docs/ANALYTICS.md for the full table (when each
// fires, who's responsible for calling it, whether it's automatic via
// <AutoTrack> or needs a one-line call from the owning component).
// ---------------------------------------------------------------------------

export type AvailabilityResultStatus = 'free' | 'taken' | 'unknown' | 'past';
export type EnquiryFailureReason =
  | 'validation'
  | 'network'
  | 'rate_limited'
  | 'delivery_failed'
  | 'server_error'
  | 'unknown';
export type ScrollDepthMilestone = 25 | 50 | 75 | 100;

/** First field focused in the booking funnel. Fired automatically by `<AutoTrack>` (pathname-gated); see docs/ANALYTICS.md if a more precise, form-internal trigger is ever wanted instead. */
export function trackEnquiryStarted(): void {
  track('enquiry_started');
}

/** One step of the 3-step funnel was validated and the visitor moved forward. Never called for backward navigation (going "back" isn't a completion). */
export function trackEnquiryStepCompleted(step: number, stepKey: string): void {
  track('enquiry_step_completed', { step, stepKey });
}

/** The enquiry was accepted by `/api/anfrage`. Props are categorical only — never name/email/phone/message. */
export function trackEnquirySubmitted(props: {
  eventType?: string;
  package?: string;
  budget?: string;
  hasServices?: boolean;
  source?: string;
}): void {
  track('enquiry_submitted', props);
}

export function trackEnquiryFailed(reason: EnquiryFailureReason): void {
  track('enquiry_failed', { reason });
}

/** Result of the live per-date availability check on step 1. */
export function trackAvailabilityChecked(status: AvailabilityResultStatus): void {
  track('availability_checked', { status });
}

export function trackWhatsappClick(page: string): void {
  track('whatsapp_click', { page });
}

export function trackPhoneClick(page: string): void {
  track('phone_click', { page });
}

export function trackEmailClick(page: string): void {
  track('email_click', { page });
}

/** `location` is a stable id, e.g. `"hero"`, `"sticky-bar"`, `"packages-preview-signature"` — see the `data-cta` contract in docs/ANALYTICS.md. */
export function trackCtaClick(location: string): void {
  track('cta_click', { location });
}

/** `tier` is a `PackageId` (`"essential" | "signature" | "prestige"`) or `"custom"`. */
export function trackPackageInterest(tier: string): void {
  track('package_interest', { tier });
}

export function trackScrollDepth(page: string, depth: ScrollDepthMilestone): void {
  track('scroll_depth', { page, depth });
}

/** `id` is the FAQ entry's stable id where available, otherwise a truncated fallback — see `<AutoTrack>`. */
export function trackFaqExpanded(id: string): void {
  track('faq_expanded', { id });
}

export function trackMixPlayed(mixId: string, moment?: string): void {
  track('mix_played', { mixId, moment });
}

export function trackCityPageView(city: string): void {
  track('city_page_view', { city });
}
