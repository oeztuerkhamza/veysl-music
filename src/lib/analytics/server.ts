/**
 * Server-side counterpart to `enquiry_submitted` (see `./index.ts`). A
 * client-side-only event misses a meaningful share of traffic on the one
 * event that matters most commercially: ad/tracker blockers (uBlock Origin,
 * Brave, iOS "Prevent Cross-Site Tracking" combined with some blocklists,
 * etc.) routinely strip Plausible's/GA4's client script, but they can't stop
 * a server calling out on its own. This keeps the booking-funnel numbers
 * that drive real decisions (how many enquiries actually landed) honest.
 *
 * Fires directly against Plausible's public Events API
 * (https://plausible.io/docs/events-api) — no client script, no cookies, no
 * personal data in the payload, nothing GA4-specific (Google's Measurement
 * Protocol would need a per-visitor client id we deliberately don't have
 * server-side, since we never track individual visitors — see
 * docs/ANALYTICS.md). No-ops silently if `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
 * isn't set, same "ship empty" pattern as the rest of this codebase's
 * optional integrations (e.g. `src/content/availability.ts`).
 *
 * `import 'server-only'` mirrors `src/content/availability.ts` /
 * `src/content/get-site.ts` — this must never end up in a client bundle.
 *
 * See docs/ANALYTICS.md / docs/CRO-AUDIT.md for the exact (one-line,
 * fire-and-forget, non-blocking) call site this needs in
 * `src/app/api/anfrage/route.ts` — that file is owned by the booking agent,
 * not this one.
 */
import 'server-only';

import { getAnalyticsConfig } from './config';

export async function trackServerEnquirySubmitted(props: {
  eventType?: string;
  package?: string;
  locale: string;
}): Promise<void> {
  const { plausibleDomain } = getAnalyticsConfig();
  if (!plausibleDomain) return;

  const endpoint = process.env.PLAUSIBLE_EVENTS_API_URL ?? 'https://plausible.io/api/event';

  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Plausible's Events API requires *some* User-Agent to accept the
        // request when there's no real browser behind it — see the linked
        // docs above. This is a business event, not a visitor session, so
        // there's no attempt to correlate it with the visitor's own browser
        // hit for the same submission.
        'User-Agent': 'veysl-server-analytics/1.0',
      },
      body: JSON.stringify({
        name: 'enquiry_submitted',
        domain: plausibleDomain,
        url: `https://${plausibleDomain}/anfrage`,
        props: { ...props, source: 'server' },
      }),
    });
  } catch (err) {
    // Never let analytics delivery fail (or even slow down) the actual
    // booking request — the caller should not await this out of a
    // try/catch of its own; log and move on.
    console.error(
      '[analytics] server-side enquiry_submitted failed',
      err instanceof Error ? err.message : err
    );
  }
}
