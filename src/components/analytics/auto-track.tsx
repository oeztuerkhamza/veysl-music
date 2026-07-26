'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from '@/i18n/navigation';
import {
  trackCityPageView,
  trackCtaClick,
  trackEmailClick,
  trackEnquiryStarted,
  trackFaqExpanded,
  trackPackageInterest,
  trackPhoneClick,
  trackScrollDepth,
  trackWhatsappClick,
  type ScrollDepthMilestone,
} from '@/lib/analytics';

const SCROLL_MILESTONES: readonly ScrollDepthMilestone[] = [25, 50, 75, 100];

// `usePathname()` (from `@/i18n/navigation`, i.e. next-intl) resolves to the
// canonical, locale-agnostic route key regardless of which locale's
// localized slug is in the address bar — the exact same fact
// `src/components/layout/sticky-cta-bar.tsx` already relies on
// (`pathname === '/anfrage'`). That's what makes these two checks locale-safe
// without needing to enumerate every localized slug from `src/i18n/routing.ts`.
const BOOKING_PATHNAME = '/anfrage';
const CITY_PATHNAME_PATTERN = /^\/hochzeits-dj\/([^/]+)$/;

/**
 * Global, zero-per-component instrumentation. Mount exactly once near the
 * root (see `<AnalyticsRoot>` / `docs/ANALYTICS.md`). Covers everything
 * trackable purely from stable, already-existing markup and routing:
 *
 *  - `whatsapp_click` / `phone_click` / `email_click` — any `wa.me` / `tel:`
 *    / `mailto:` link anywhere on the site, tagged with the page it fired
 *    from. This alone covers the WhatsApp FAB, the sticky bar, the header,
 *    the footer, the `/anfrage` aside and `<SaveForLater>` without a single
 *    edit to any of those owners' files.
 *  - `faq_expanded` — every native `<details>` on the site (both
 *    `FaqAccordion` and `CityFaq` use it), via a capture-phase `toggle`
 *    listener. Capture-phase intercepts the event on its way down to the
 *    target regardless of whether the event itself bubbles, so this doesn't
 *    depend on either component ever changing.
 *  - `city_page_view` — derived straight from the route.
 *  - `enquiry_started` — first form-control focus while on `/anfrage`.
 *  - `scroll_depth` — 25/50/75/100% of document height, per page.
 *  - `cta_click` / `package_interest` — opportunistic: fires the moment any
 *    element anywhere carries a `data-cta` / `data-package` attribute. See
 *    `docs/ANALYTICS.md` for the exact attribute values other agents'
 *    components should adopt.
 *
 * What this deliberately does NOT attempt to infer from the DOM — these need
 * a precise, one-line call from inside the owning component instead, because
 * they depend on internal state (validation having passed, a fetch having
 * succeeded, which exact track started playing) this component has no
 * reliable way to observe: `enquiry_step_completed`, `enquiry_submitted`,
 * `enquiry_failed`, `availability_checked`, `mix_played`. See
 * `docs/CRO-AUDIT.md` / `docs/ANALYTICS.md` for those exact call sites.
 */
export function AutoTrack() {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const firedThresholds = useRef<Set<ScrollDepthMilestone>>(new Set());
  const enquiryStartedRef = useRef(false);
  const cityViewedRef = useRef<string | null>(null);

  useEffect(() => {
    pathnameRef.current = pathname;
    firedThresholds.current = new Set();
    enquiryStartedRef.current = false;

    const cityMatch = CITY_PATHNAME_PATTERN.exec(pathname);
    const citySlug = cityMatch?.[1] ?? null;
    if (citySlug && cityViewedRef.current !== citySlug) {
      cityViewedRef.current = citySlug;
      trackCityPageView(citySlug);
    }
  }, [pathname]);

  // Scroll depth — rAF-throttled, re-armed per page via the effect above.
  useEffect(() => {
    let ticking = false;

    function evaluate() {
      ticking = false;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const percent = scrollable > 0 ? Math.round((window.scrollY / scrollable) * 100) : 100;
      for (const milestone of SCROLL_MILESTONES) {
        if (percent >= milestone && !firedThresholds.current.has(milestone)) {
          firedThresholds.current.add(milestone);
          trackScrollDepth(pathnameRef.current, milestone);
        }
      }
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(evaluate);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    evaluate(); // a short page can already satisfy every milestone with zero scrolling
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  // Delegated click / focus / toggle capture — registered once for the
  // whole app lifetime; reads the current pathname via the ref above so
  // route changes don't churn the listeners.
  useEffect(() => {
    function handleClickCapture(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      if (target.closest('a[href^="https://wa.me/"]')) {
        trackWhatsappClick(pathnameRef.current);
        return; // a link only ever matches one of these three href patterns
      }
      if (target.closest('a[href^="tel:"]')) {
        trackPhoneClick(pathnameRef.current);
        return;
      }
      if (target.closest('a[href^="mailto:"]')) {
        trackEmailClick(pathnameRef.current);
        return;
      }

      // Opportunistic — see the `data-cta` / `data-package` contract in
      // docs/ANALYTICS.md. A package card's CTA can legitimately carry both
      // attributes at once (it's a CTA *and* a specific tier signal); both
      // fire independently.
      const withPackage = target.closest<HTMLElement>('[data-package]');
      if (withPackage?.dataset.package) {
        trackPackageInterest(withPackage.dataset.package);
      }
      const withCta = target.closest<HTMLElement>('[data-cta]');
      if (withCta?.dataset.cta) {
        trackCtaClick(withCta.dataset.cta);
      }
    }

    function handleFocusCapture(event: FocusEvent) {
      if (pathnameRef.current !== BOOKING_PATHNAME || enquiryStartedRef.current) return;
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return;
      enquiryStartedRef.current = true;
      trackEnquiryStarted();
    }

    function handleToggleCapture(event: Event) {
      const target = event.target;
      if (!(target instanceof HTMLDetailsElement) || !target.open) return;
      const fallback = target.querySelector('summary')?.textContent?.trim().slice(0, 80);
      trackFaqExpanded(target.id || fallback || 'unknown');
    }

    document.addEventListener('click', handleClickCapture, true);
    document.addEventListener('focus', handleFocusCapture, true);
    document.addEventListener('toggle', handleToggleCapture, true);
    return () => {
      document.removeEventListener('click', handleClickCapture, true);
      document.removeEventListener('focus', handleFocusCapture, true);
      document.removeEventListener('toggle', handleToggleCapture, true);
    };
  }, []);

  return null;
}
