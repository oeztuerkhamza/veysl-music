/**
 * Consent state for the OPTIONAL, consent-gated providers (GA4, Clarity)
 * only — Plausible never reads this, it doesn't need consent. Persisted to
 * `localStorage` so the choice survives reloads; broadcast via `window`
 * `CustomEvent`s rather than React context so `<ConsentBanner>`,
 * `<AnalyticsScripts>` and `<ConsentSettingsLink>` (three independent
 * components, mounted in different places) can all react without needing to
 * share a common provider tree.
 *
 * No functions here throw — `localStorage` can be unavailable (private
 * browsing, quota, disabled storage); every read/write degrades to
 * in-memory-only behaviour for that session instead of crashing.
 */

export type ConsentValue = 'granted' | 'denied';
export type ConsentState = ConsentValue | 'unset';

const STORAGE_KEY = 'veysl:consent-analytics';
const CHANGE_EVENT = 'veysl:consent-changed';
const REOPEN_EVENT = 'veysl:consent-reopen';

export function getStoredConsent(): ConsentState {
  if (typeof window === 'undefined') return 'unset';
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === 'granted' || raw === 'denied' ? raw : 'unset';
  } catch {
    return 'unset';
  }
}

export function setConsent(value: ConsentValue): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Private browsing / storage disabled — the dispatch below still lets
    // this session's providers react, it just won't persist across a reload.
  }
  window.dispatchEvent(new CustomEvent<ConsentValue>(CHANGE_EVENT, { detail: value }));
}

export function onConsentChange(callback: (value: ConsentValue) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (event: Event) => callback((event as CustomEvent<ConsentValue>).detail);
  window.addEventListener(CHANGE_EVENT, handler as EventListener);
  return () => window.removeEventListener(CHANGE_EVENT, handler as EventListener);
}

/** Reopens the consent prompt — the DSGVO/TTDSG-required "change your mind any time" path. See `<ConsentSettingsLink>`. */
export function requestConsentReopen(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(REOPEN_EVENT));
}

export function onConsentReopenRequest(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(REOPEN_EVENT, callback);
  return () => window.removeEventListener(REOPEN_EVENT, callback);
}
