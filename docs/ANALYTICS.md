# DJ Veys — Analytics

Owned by the CRO/analytics agent. Covers `src/lib/analytics/**` and
`src/components/analytics/**`. See `docs/CRO-AUDIT.md` for the conversion
findings this data is meant to feed.

---

## 1. Stack — and why

**Default: [Plausible](https://plausible.io)** (`src/lib/analytics/providers/plausible-provider.ts`).
Cookieless, no personal data collected, **no consent banner required under
DSGVO/TTDSG**. This is a commercial decision as much as a legal one: a
consent banner suppresses roughly 20–40% of measured traffic and adds
friction to the very first interaction a visitor has with the site — on a
site whose whole point is "flood of enquiries", losing a fifth of the funnel
data before it even starts is a real cost. A cookieless tool measures
everyone, with or without a banner.

Nothing is sent anywhere unless `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set (see
`.env.example`). Locally and in PR previews, `NoopProvider`
(`src/lib/analytics/providers/noop-provider.ts`) takes over silently — every
`track()` call is a real no-op, not a build error.

**Optional, consent-gated: GA4 (with Consent Mode v2) + Microsoft Clarity.**
Both are **off by default** and only ever load after the visitor explicitly
picks "accept all" in `<ConsentBanner>`. This is stricter than Google's own
Consent Mode v2 recommendation (which allows loading `gtag.js` pre-consent
and sending cookieless "consent pings"): this project's brief asked for
"off by default, only load after explicit consent", so `gtag.js` itself is
never requested from Google before that happens. The trade-off: no
pre-consent conversion modelling from Google's side. That's an intentional,
defensible choice for a project this privacy-conscious — revisit only if the
client explicitly wants Google's modelled conversions badly enough to accept
the weaker consent posture.

Neither GA4 nor Clarity is wired up with real IDs — both env vars
(`NEXT_PUBLIC_GA4_MEASUREMENT_ID`, `NEXT_PUBLIC_CLARITY_PROJECT_ID`) are
blank in `.env.example`. `<ConsentBanner>` itself renders nothing at all
unless at least one is set — there is no reason to show a consent prompt for
a decision that doesn't exist yet.

**Microsoft Clarity masking — read before ever setting `NEXT_PUBLIC_CLARITY_PROJECT_ID` in production:**
the enquiry form (`/anfrage`) and the general contact form (`/kontakt`)
collect first name, last name, partner name, email, phone and a free-text
message. Clarity's own recording starts before any of this project's JS can
intervene per field, so the only reliable way to keep those fields out of a
session replay is the **dashboard-level** setting: Clarity project →
**Settings → Privacy → "Mask all text and user input" (Strict mode)**. Turn
this on *before* the env var is ever set in production. This cannot be
enforced from this codebase — it's a manual, one-time step in Clarity's own
UI, and it's the single most important item in this whole document if
Clarity is ever turned on.

---

## 2. Architecture

```
src/lib/analytics/
  types.ts                 AnalyticsProvider / EventProps contracts
  config.ts                reads NEXT_PUBLIC_* env vars
  consent.ts                localStorage + window CustomEvent consent state
  server.ts                 server-side Plausible Events API call (ad-blocker-resilient enquiry_submitted)
  providers/
    noop-provider.ts
    plausible-provider.ts   core, cookieless, always active if configured
    ga4-provider.ts         gated, Consent Mode v2
    clarity-provider.ts     gated, session replay
  index.ts                  track()/trackPageview() + the full typed event taxonomy

src/components/analytics/
  analytics-scripts.tsx     bootstraps providers, forwards locale + route changes
  auto-track.tsx            delegated, zero-per-component instrumentation (see §4)
  consent-banner.tsx         the DSGVO/TTDSG prompt
  consent-settings-link.tsx  "change your mind later" — see §5
  analytics-root.tsx         combines the three above into one mount point
  index.ts                   barrel: <AnalyticsRoot>, <ConsentSettingsLink>
```

Every application-facing call should go through the typed helpers exported
from `src/lib/analytics/index.ts` (`trackCtaClick()`,
`trackEnquirySubmitted()`, …) rather than the generic `track(event, props)`
primitive — that's what keeps this document and the actual call sites from
drifting apart.

**PII guard:** `track()` runs a cheap regex check (dev-mode only, non-
blocking) over every prop value and `console.warn`s if something looks like
an email or a phone number. It's a safety net for mistakes, not a substitute
for reviewing what a new call site actually sends. Never pass name, email,
phone or free-text message content into any event — categories and counts
only.

---

## 3. Consent model

- Storage key: `localStorage['veysl:consent-analytics']` = `'granted' | 'denied'` (absent = `'unset'`).
- `setConsent('granted' | 'denied')` persists the choice and dispatches a
  `window` `CustomEvent('veysl:consent-changed')` — `<AnalyticsScripts>`
  listens and initializes/tears down GA4 + Clarity accordingly. No React
  context is used on purpose: `<ConsentBanner>`, `<AnalyticsScripts>` and
  `<ConsentSettingsLink>` are three independent components mounted in
  different places (root layout vs. footer), and a `window` event is the
  simplest thing that reliably reaches all three.
- `requestConsentReopen()` — the DSGVO/TTDSG-required "change your mind any
  time" path (the banner's own copy, `messages/de.json` → `consent.text`,
  literally promises this: *"Ihre Entscheidung, jederzeit widerrufbar"*).
  Dispatches `'veysl:consent-reopen'`; `<ConsentBanner>` listens and reopens.
- **`<ConsentSettingsLink>` needs a one-line mount in the footer — see §5.**
  Without it, a visitor who already dismissed the banner has no way back in.
  It self-hides (renders `null`) if there's nothing to consent to.

---

## 4. Event taxonomy

Every event automatically gets a `locale` prop merged in by `track()` — no
call site needs to pass it explicitly.

| Event | Props | Fires | Owner |
|---|---|---|---|
| `enquiry_started` | — | First form-control focus while on `/anfrage` | **Automatic** — `<AutoTrack>`, pathname-gated |
| `enquiry_step_completed` | `step: number`, `stepKey: string` | A step's fields validated and the visitor moved forward (never on "back") | **Manual** — `enquiry-form.tsx` `handleNext`, see §6.1 |
| `enquiry_submitted` | `eventType?`, `package?`, `budget?`, `hasServices?: boolean`, `source?` | `POST /api/anfrage` returned `ok: true` | **Manual** — `enquiry-form.tsx` `onValidSubmit`, see §6.1 |
| `enquiry_failed` | `reason: 'validation'\|'network'\|'rate_limited'\|'delivery_failed'\|'server_error'\|'unknown'` | Submission rejected or the request itself failed | **Manual** — same call site, see §6.1 |
| `availability_checked` | `status: 'free'\|'taken'\|'unknown'\|'past'` | The live per-date check on step 1 resolves | **Manual** — `availability-indicator.tsx`, see §6.2 |
| `whatsapp_click` | `page: string` | Any `a[href^="https://wa.me/"]` clicked, anywhere | **Automatic** — `<AutoTrack>`, href-pattern delegation |
| `phone_click` | `page: string` | Any `a[href^="tel:"]` clicked | **Automatic** |
| `email_click` | `page: string` | Any `a[href^="mailto:"]` clicked | **Automatic** |
| `cta_click` | `location: string` | Any element carrying `data-cta="…"` clicked | **Automatic**, but the *value* needs the attribute added — see §7 |
| `package_interest` | `tier: string` | Any element carrying `data-package="…"` clicked | **Automatic**, same caveat — see §7 |
| `scroll_depth` | `page: string`, `depth: 25\|50\|75\|100` | Document scrolled past each milestone, once per page | **Automatic** — global, every page |
| `faq_expanded` | `id: string` | Any native `<details>` opened (both `FaqAccordion` and `CityFaq`) | **Automatic** — capture-phase `toggle` listener |
| `mix_played` | `mixId: string`, `moment?: string` | A genuinely new track starts (not resume/toggle of the same one) | **Manual** — `audio-provider.tsx`, see §6.3 |
| `city_page_view` | `city: string` (slug) | Route matches `/hochzeits-dj/{slug}` | **Automatic** — derived from the route |
| server-side `enquiry_submitted` | `eventType?`, `package?`, `locale`, `source: 'server'` | Right after the enquiry is persisted, independent of the visitor's own browser | **Manual** — `api/anfrage/route.ts`, see §6.4 |

**Why some events are automatic and others aren't:** everything derivable
from stable, already-existing markup or routing (link `href` patterns,
native `<details>` toggling, the route itself) is wired up once in
`<AutoTrack>` (`src/components/analytics/auto-track.tsx`) with **zero**
edits needed in any other agent's file. Business-state events — a form step
actually validating, a fetch actually succeeding/failing, which exact track
started — depend on internal state this component has no reliable way to
observe from the DOM, and reverse-engineering them via `MutationObserver`
hacks would be more fragile than a one-line call from the component that
already has the answer. Those are documented precisely below instead.

`<AutoTrack>`'s route matching relies on a fact already documented elsewhere
in this codebase (`src/components/layout/sticky-cta-bar.tsx`'s own comment):
`usePathname()` from `@/i18n/navigation` (next-intl) resolves to the
**canonical, locale-agnostic route key** regardless of which locale's
localized slug is in the address bar. So `/anfrage` and
`/hochzeits-dj/{slug}` match on every locale without enumerating all seven
localized variants.

---

## 5. Mounting — the one change needed in the layout agent's file

```tsx
// src/app/[locale]/layout.tsx
import { AnalyticsRoot } from '@/components/analytics';

// …anywhere inside <body>, e.g. right after <NextIntlClientProvider>'s
// children start, alongside <StickyCtaBar>/<WhatsAppFab>. It renders no
// visible chrome of its own except the consent banner, which is already
// `position: fixed`, so placement inside the tree doesn't matter for layout.
<AnalyticsRoot />
```

And in the footer's legal column, next to Impressum/Datenschutz:

```tsx
// src/components/layout/footer.tsx
import { ConsentSettingsLink } from '@/components/analytics';

// …inside the existing "legal" <div className="flex flex-col gap-3">, after
// the Datenschutz <Link>:
<ConsentSettingsLink className={linkClasses} />
```

(`ConsentSettingsLink` renders `null` automatically if no consent-gated
provider is configured, so this is safe to add unconditionally.)

---

## 6. Exact instructions for other agents

### 6.1 Booking agent — `src/components/booking/enquiry-form.tsx`

Add the import:

```ts
import { trackEnquiryFailed, trackEnquiryStepCompleted, trackEnquirySubmitted } from '@/lib/analytics';
import type { EnquiryFailureReason } from '@/lib/analytics';
```

In `handleNext`, track right after validation passes (this is the actual
"step completed" moment — going back never calls this):

```ts
const handleNext = useCallback(async () => {
  const fields = Array.from(stepFieldGroups[step - 1]) as (keyof EnquiryFormInput)[];
  const valid = await trigger(fields);
  if (!valid) return;
  trackEnquiryStepCompleted(step, stepKeys[step - 1]); // NEW
  if (step < TOTAL_STEPS) goToStep(step + 1);
}, [goToStep, step, trigger]);
```

In `onValidSubmit`, restructured slightly so tracking has exactly **one**
call site per outcome (the original `throw`-into-`catch` control flow would
double-fire `enquiry_failed` if tracking were added naively — track the
`!res.ok` branch directly, don't route it through the `catch`):

```ts
const onValidSubmit = useCallback(
  async (data: EnquiryFormInput) => {
    const parsed = enquirySchema.parse(data);
    try {
      const res = await fetch('/api/anfrage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...parsed, locale }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };

      if (!res.ok || !json.ok) {
        trackEnquiryFailed(mapSubmitErrorReason(json.error, res.status)); // NEW
        setPhase('error');
        return;
      }

      trackEnquirySubmitted({ // NEW
        eventType: parsed.eventType,
        package: parsed.package,
        budget: parsed.budget,
        hasServices: (parsed.services?.length ?? 0) > 0,
        source: parsed.source,
      });

      setSubmitted({ firstName: parsed.firstName, eventDate: parsed.eventDate });
      setPhase('success');
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    } catch {
      trackEnquiryFailed('network'); // NEW — fetch itself threw (offline, CORS, JSON parse, …)
      setPhase('error');
    }
  },
  [locale]
);

// module scope, alongside the other small helpers at the top of the file:
function mapSubmitErrorReason(error: string | undefined, status: number): EnquiryFailureReason {
  if (error === 'rate_limited') return 'rate_limited';
  if (error === 'delivery_failed') return 'delivery_failed';
  if (error === 'validation' || error === 'invalid_request' || error === 'invalid_json') return 'validation';
  if (status >= 500) return 'server_error';
  return 'unknown';
}
```

`enquiry_started` needs **no** change here — `<AutoTrack>` already covers it
automatically (first form-control focus while `pathname === '/anfrage'`). If
a more precise "first field of step 1 specifically" trigger is ever wanted
instead, swap it for a `useRef` + `onFocus` on the `eventDate` input and call
`trackEnquiryStarted()` there once — the automatic version already does the
job at effectively the same moment.

### 6.2 Booking agent — `src/components/booking/availability-indicator.tsx`

```ts
import { trackAvailabilityChecked } from '@/lib/analytics';

// …inside the existing effect:
useEffect(() => {
  if (status === 'idle' || status === 'checking') return;
  const message = /* … unchanged … */;
  onAnnounce(message);
  trackAvailabilityChecked(status); // NEW — `status` is already exactly `AvailabilityResultStatus`
}, [status]);
```

### 6.3 Audio agent — `src/components/audio/audio-provider.tsx`

```ts
import { trackMixPlayed } from '@/lib/analytics';

// …inside `play()`, in the existing branch that loads a genuinely new track
// (this guard is what prevents double-counting on pause/resume/toggle of
// the same mix):
if (loadedIdRef.current !== mix.id) {
  trackMixPlayed(mix.id, mix.moment); // NEW
  setStatus('loading');
  audio.src = mix.src;
  loadedIdRef.current = mix.id;
  audio.load();
}
```

### 6.4 Booking agent — `src/app/api/anfrage/route.ts` (server-side counterpart)

Fire-and-forget, right after the enquiry is successfully persisted (the
function never throws — see `src/lib/analytics/server.ts` — so it's safe to
not await it and let it resolve in the background rather than adding latency
to the response):

```ts
import { trackServerEnquirySubmitted } from '@/lib/analytics/server';

// …right after the `payload.create({ collection: 'enquiries', … })` call succeeds:
void trackServerEnquirySubmitted({
  eventType: enquiry.eventType,
  package: enquiry.package,
  locale,
});
```

This exists specifically so a visitor with an ad/tracker blocker (which
routinely strips Plausible's/GA4's client script) still shows up in the one
number that actually drives decisions: completed bookings, not page hits.

---

## 7. `data-cta` / `data-package` attribute contract

`<AutoTrack>` fires `cta_click`/`package_interest` the moment it sees these
attributes anywhere in the DOM — no code change needed in `auto-track.tsx`
itself as more get added. Recommended values, one per real CTA/package
element found while reading the funnel (see `docs/CRO-AUDIT.md` for the
CRO reasoning behind measuring these specific locations):

| File (owner) | Element | `data-cta` | `data-package` |
|---|---|---|---|
| `src/components/hero/hero.tsx` (home) | primary `<Button href="/anfrage">` | `hero-primary` | — |
| `src/components/hero/hero.tsx` (home) | secondary `<Button href="/musik">` | `hero-listen` | — |
| `src/components/layout/header.tsx` (layout) | desktop nav booking `<Button>` | `header-desktop` | — |
| `src/components/layout/header.tsx` (layout) | mobile overlay booking `<Button>` | `header-mobile` | — |
| `src/components/layout/sticky-cta-bar.tsx` (layout) | primary `<Button>` | `sticky-bar` | — |
| `src/components/home/final-cta.tsx` (home) | primary `<Button>` | `home-final-cta` | — |
| `src/components/home/packages-preview.tsx` (home) | each tier's `<Button>` | `packages-preview-{tier}` | `{tier}` |
| `src/components/pages/package-card.tsx` (pages, used on `/pakete`) | CTA `<Button>` | `pakete-card` | `{pkg.id}` |
| `src/app/[locale]/pakete/page.tsx` (pages) | custom-package block `<Button>` | `pakete-custom` | `custom` |
| `src/components/city/city-cta.tsx` (pages/city) | primary `<Button>` | `city-cta` | — |

This table is deliberately not exhaustive — treat it as a starting set, not
a ceiling. Any future CTA just needs the one attribute; nothing else to wire.

---

## 8. Verifying this works

No dev server was run for this change (per the CRO agent's brief, only
`npx tsc --noEmit` was used — see the final report). To verify once merged:

1. Set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` locally and open the Plausible
   real-time dashboard (or the self-hosted equivalent) while clicking
   through the funnel.
2. `console.debug('[analytics] …')` lines appear in the browser console for
   every tracked event outside production builds (`NODE_ENV !== 'production'`)
   — the fastest way to confirm an event fired at all without a live
   Plausible project.
3. To test GA4/Clarity gating: leave both env vars unset and confirm
   `<ConsentBanner>` never renders; set one, confirm it renders, confirm
   `window.gtag`/`window.clarity` are `undefined` until "accept all" is
   clicked, and confirm the corresponding `<script>` tag only then appears
   in `document.head`.
