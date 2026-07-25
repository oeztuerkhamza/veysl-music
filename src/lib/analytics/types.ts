/**
 * Provider-agnostic analytics contract — same pattern as the pluggable
 * `MailSender`/`*Transport` interfaces in `src/app/api/anfrage/_lib/transport.ts`:
 * callers only ever talk to `track()`/`trackPageview()` in `./index.ts`, never
 * to a specific provider. Swapping/adding a provider touches only
 * `./providers/*` and the registry in `./index.ts`.
 *
 * Event props are intentionally restricted to primitives — categories and
 * counts, never free text. See `.claude/CONTRACT.md` §"never send PII into
 * any analytics event" and the dev-mode guard in `./index.ts`.
 */

export type EventPropValue = string | number | boolean | undefined;
export type EventProps = Record<string, EventPropValue>;

export interface AnalyticsProvider {
  /** Short identifier used only in error logs (`"plausible"`, `"ga4"`, …). */
  readonly name: string;
  /**
   * Loads the provider (injects its script, sets up its queue function).
   * Idempotent — safe to call more than once. For consent-gated providers,
   * the caller guarantees this is never invoked before consent is granted.
   */
  init(): void;
  /** Fire a custom event. Must never throw — the caller in `./index.ts` still wraps this defensively either way. */
  track(event: string, props?: EventProps): void;
  /** Record an SPA route change. Providers that already auto-track pageviews via their own script (Plausible, Clarity) can no-op here. */
  pageview(path: string): void;
  /**
   * Best-effort teardown when consent is revoked after having been granted.
   * Only meaningful for consent-gated providers — core/cookieless providers
   * don't need it since there was never anything to revoke.
   */
  teardown?(): void;
}
