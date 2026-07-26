'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { hasConsentGatedProviders } from '@/lib/analytics/config';
import { getStoredConsent, onConsentReopenRequest, setConsent } from '@/lib/analytics/consent';
import { cn } from '@/lib/utils';

// No real store to subscribe to — this is only ever used for its
// server/client snapshot mismatch (see `mounted` below).
const emptySubscribe = () => () => {};

/**
 * DSGVO/TTDSG consent prompt for the OPTIONAL, consent-gated providers only
 * (GA4 + Microsoft Clarity). Plausible needs no consent — it's cookieless
 * and collects no personal data — so this renders nothing at all unless at
 * least one gated provider is actually configured; a consent prompt for a
 * decision that doesn't exist would be pure friction with no purpose. See
 * `docs/ANALYTICS.md`.
 *
 * Both choices are given equal visual weight on purpose — no dark pattern
 * where "accept" is a filled gold button and "decline" is a barely-visible
 * ghost link (see `.claude/CONTRACT.md` §"No dark patterns"). Reopenable any
 * time via `<ConsentSettingsLink>`, matching this banner's own copy
 * ("jederzeit widerrufbar" / "revocable anytime" — see `messages/de.json`
 * `consent.text`).
 */
export function ConsentBanner() {
  const t = useTranslations('consent');

  // Same hydration-safe "mounted" trick as `ThemeToggle`: whether the stored
  // decision is still 'unset' depends on localStorage, which the server
  // can't see. `mounted` is `false` for the server render and the matching
  // first client render, then React re-checks the snapshot right after
  // hydration and flips it to `true` — that transition is what we use below
  // to run the "is this still undecided" check exactly once, client-only.
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);

  // Show the banner the first time we're mounted on the client if the
  // visitor never decided. Adjusted directly during render (keyed off the
  // `mounted` transition, same "adjusting state" pattern used in `Header`)
  // instead of inside an effect body, so there's no synchronous setState
  // call in an effect — this still only ever runs once, right after the
  // hydration-forced re-render.
  const [prevMounted, setPrevMounted] = useState(mounted);
  if (mounted !== prevMounted) {
    setPrevMounted(mounted);
    if (mounted && hasConsentGatedProviders() && getStoredConsent() === 'unset') {
      setVisible(true);
    }
  }

  // Reopening is a one-off request (e.g. a footer link was clicked), not a
  // persisted value, so it stays a plain subscription-with-callback effect.
  useEffect(() => {
    if (!hasConsentGatedProviders()) return;
    return onConsentReopenRequest(() => setVisible(true));
  }, []);

  // Reset the staggered-entry flag the instant the banner should hide.
  // Adjusted directly during render — see the identical pattern (and
  // rationale) in `Header` — so only the async "next frame" half below
  // needs an effect.
  const [prevVisible, setPrevVisible] = useState(visible);
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (!visible) setEntered(false);
  }

  // Same two-state mount-then-flip pattern as `Header`'s mobile overlay and
  // `StickyCtaBar`: mount first, then flip `entered` on the next frame so
  // the CSS transition has something real to transition from.
  useEffect(() => {
    if (!visible) return;
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  if (!hasConsentGatedProviders() || !visible) return null;

  function decide(value: 'granted' | 'denied') {
    setConsent(value);
    setVisible(false);
  }

  return (
    <div
      role="region"
      aria-label={t('title')}
      className={cn(
        'fixed inset-x-0 bottom-0 z-[60] border-t border-line bg-surface/98 backdrop-blur-md',
        'transition-transform duration-500 ease-out-expo motion-reduce:transition-none',
        entered ? 'translate-y-0' : 'translate-y-full'
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <div className="max-w-2xl">
          <p className="font-display text-lg text-ink">{t('title')}</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
            {t('text')}{' '}
            <Link href="/datenschutz" className="text-gold underline underline-offset-2 hover:text-gold-soft">
              {t('privacyLink')}
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Button type="button" variant="secondary" size="md" onClick={() => decide('denied')}>
            {t('essentialOnly')}
          </Button>
          <Button type="button" variant="gold" size="md" onClick={() => decide('granted')}>
            {t('acceptAll')}
          </Button>
        </div>
      </div>
    </div>
  );
}
