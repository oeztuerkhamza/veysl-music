# VEYSL.DE — Shared Build Contract

**Read this file before writing any code.** Every agent working on this repo shares this
contract. Do not invent your own tokens, primitives, or conventions.

---

## 1. Project

**VEYSL** — premium wedding & event DJ, Germany. Domain `veysl.de`.
Repo: `D:\projects\veysl-music` (Windows, PowerShell).

**The site is a lead-generation machine, not a portfolio.** Every page must serve
"show work → build trust → capture enquiry". The single primary conversion is a
**booking enquiry** (date + package). Success metric = qualified enquiries, not pageviews.

Tier: **ULTRA** (full premium feature set — cinematic motion, WebGL, PWA, GEO/AI, multilingual).

## 2. Stack (already installed — do NOT add heavy deps without asking)

| | |
|---|---|
| Framework | Next.js **16.2.11** App Router, React **19.2**, TypeScript strict |
| Styling | **Tailwind CSS v4** (CSS-first `@theme`, no `tailwind.config.js`) |
| i18n | **next-intl v4** — locales `de` (default, no prefix), `en`, `tr` |
| Motion | **GSAP 3.15** |
| 3D | **three 0.185** + `@react-three/fiber` 9 + `@react-three/drei` 10 |
| Audio | **wavesurfer.js 7** |
| Forms | react-hook-form 7 + zod 4 + `@hookform/resolvers` |
| Icons | **lucide-react** |
| Theme | next-themes (`class` attribute, dark default) |
| Utils | clsx + tailwind-merge (via `cn()`) |

## 3. Non-negotiable quality bars

- **Core Web Vitals**: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1. Every effect has a
  performance budget. If an effect costs more than it gives, it is removed.
- **WCAG 2.2 AA** (target AA+): 4.5:1 contrast, visible focus ring on everything
  focusable, full keyboard operation, semantic headings (exactly one `<h1>` per page),
  labelled form fields, min 24×24 px touch targets, skip-to-content link.
- **`prefers-reduced-motion: reduce` must be honoured by every animation.** No exceptions.
- **Server Components by default.** `'use client'` only where interaction/state truly
  requires it, and as deep in the tree as possible.
- **No fabricated data.** Never ship invented review counts, ratings, prices, client
  names or press quotes. Unknown values are `null` and the UI degrades gracefully
  (e.g. renders "Preis auf Anfrage"). Placeholders are marked `TODO(kunde)`.

## 4. Design language

**Warm editorial on ivory paper.** Light is the default and the brand: warm ivory
ground (#FBF7F0), warm near-black ink, champagne gold as the brand accent and
terracotta as the warming second accent that carries the primary call to action.
Generous whitespace, steep type scale, asymmetric composition, hairline rules
instead of boxes. Think luxury wedding editorial — **not** neon club flyer, and
**not** a dark "premium SaaS" landing page.

Night is used as *punctuation*, not as the ground: `<Section tone="night">`
drops a section to warm near-black for the dancefloor, the sets and the closing
ask. That light-dark rhythm is a structural part of the design, not a theme.

**Anti-pattern, explicitly:** rows of equal icon cards, every section the same
height with a centred heading over an N-column grid, and saturated gradient CTA
slabs. That pattern is what made the first build read as machine-generated. Vary
section shape (`tone`, `size`) and weight items by how much they actually
matter.

### Themes

`next-themes`, `attribute="class"`, **`defaultTheme="light"`, `enableSystem={false}`**.
System detection is deliberately off: the ivory ground *is* the design, and with
system detection every visitor whose phone is set to dark would never see it.
The toggle stays for anyone who wants dark.

### Design tokens — defined in `src/app/globals.css` via Tailwind v4 `@theme`

Use these token names. **Never hardcode a hex value in a component.**

The raw palette lives exactly once, as `--day-*` / `--night-*` in `@layer base`.
`@theme`, `.light`, `.dark` and `.band-night` only *map* it. Add a colour there
and nowhere else — the previous palette repeated its values across four blocks
and shipped two WCAG 1.4.3 failures from exactly that drift.

```
Colour (CSS vars, both themes defined):
  --color-bg            page background          light #FBF7F0   dark #12100D
  --color-surface       cards, panels            light #FFFFFF   dark #1A1712
  --color-surface-2     nested / hover           light #F3ECE1   dark #221E18
  --color-ink           primary text             light #221E1A   dark #F7F2E9
  --color-ink-muted     secondary text           light #5A5148   dark #B0A697
  --color-ink-faint     tertiary / captions      light #736A5F   dark #8C8274
  --color-line          hairline borders         light #E4DACB   dark #2C2721
  --color-gold          brand accent             light #7A5F27   dark #D6B36A
  --color-gold-soft     HOVER (not "lighter")    light #6B5325   dark #E8CE96
  --color-gold-deep     PRESSED (not "darker")   light #55411C   dark #A8853F
  --color-clay          2nd accent / primary CTA light #9F4C29   dark #D98A5F
  --color-clay-soft     HOVER                    light #8A4224   dark #E8A880
  --color-clay-deep     PRESSED                  light #6F3319   dark #C47A52
  --color-glow          decorative light only    light #EDD0AD   dark #A8853F
  --color-success       #3D7D60
  --color-danger        #B0433A

Not @theme tokens (foreground ON an accent surface — they flip per theme):
  --gold-ink / --clay-ink   → utilities .text-on-gold / .text-on-clay
```

Accent tones are verified against the DARKEST light surface (`--color-surface-2`),
not just against `--color-bg` — a tone chosen against the page ground fails on
the `raised` sections.

**`-soft` means hover and `-deep` means pressed** — never "lighter"/"darker".
Both steps always run *away* from the background: darker in the light theme,
lighter in the dark one. That is what keeps the ~20 `hover:text-gold-soft` call
sites above 4.5:1 in both themes. `--color-glow` is decorative light for
gradients only and is never allowed behind text.

Tailwind usage: `bg-bg`, `text-ink`, `text-ink-muted`, `border-line`, `text-gold`,
`text-clay`, `bg-surface`, `font-display`, `rounded-lg`, etc.

### Type scale

Display headings use `font-display` (Cormorant) via the `text-display-1/2/3`
utilities, fluid through `clamp()`. Body uses `font-sans` (Inter) at
`text-base`/`text-lg` with `leading-relaxed`. Labels use the `text-label`
utility (11px, 600, 0.24em, uppercase) — prefer it over hand-rolled
`text-xs uppercase tracking-[…]`. A single lifted clause inside a heading uses
`accent-phrase` (Cormorant italic in terracotta); it is the project’s stand-in
for a script font, so no second font is ever loaded.

### Shared UI primitives — `src/components/ui/` (owned by the layout agent)

Import these, do not re-create them:

```ts
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';      // variant: primary|secondary|ghost|gold|clay, size: sm|md|lg, asChild-style `href` supported
import { Container } from '@/components/ui/container'; // max-width + responsive gutters
import { Section } from '@/components/ui/section';     // vertical rhythm wrapper; tone: paper|raised|night, size: tight|default|tall
import { Eyebrow } from '@/components/ui/eyebrow';     // gold uppercase label
import { SectionHeading } from '@/components/ui/section-heading'; // eyebrow + h2 + lead
import { Card } from '@/components/ui/card';
import { Reveal } from '@/components/motion/reveal';   // GSAP scroll reveal, reduced-motion safe
import { ParticleDrift } from '@/components/motion/particle-drift'; // WebGL haze — DARK grounds only (additive blending is invisible on ivory)
```

## 5. i18n rules

- All user-facing copy lives in `messages/{de,en,tr}.json`. **Zero hardcoded strings
  in components** — not even "Loading". If a key is missing, add it to **all three** files.
- Server components: `const t = await getTranslations('namespace')`.
- Client components: `const t = useTranslations('namespace')`.
- Navigation: import `Link`, `useRouter`, `usePathname`, `getPathname` from
  **`@/i18n/navigation`** — never from `next/link` or `next/navigation`.
- Route keys are the **German** slugs (`/pakete`, `/anfrage`, …); next-intl maps them to
  localized URLs per locale. See `src/i18n/routing.ts` for the full map.
- `<Link href="/pakete">` works in every locale — do not build URLs by hand.

## 6. Content data

Typed, hand-written TS modules under `src/content/`. Structure everything so a headless
CMS (Sanity) can replace the module later without touching components:
content modules export **data only**, never JSX, and never translated prose that belongs
in `messages/*.json`. IDs and keys are stable and locale-independent; the display strings
for those IDs come from the message files.

`src/content/site.ts` already exists — brand, contact, service areas, review config.
Read it, don't duplicate it.

## 7. Conventions

- Files: kebab-case (`global-player.tsx`). Components: PascalCase. Named exports preferred.
- Path alias `@/*` → `src/*`.
- Comments in **German or English**, sparse — explain *why*, never *what*.
- Every `img` gets meaningful `alt`; decorative images get `alt=""`.
- Use `next/image` with explicit `width`/`height` or `fill` + sized parent (CLS).
- Embeds (Spotify/YouTube/SoundCloud) use a **click-to-load facade** — never a raw
  iframe on first paint (protects INP and LCP).
- Do **not** run `npm run dev` or `next build`; the orchestrator handles verification.
- Do **not** edit files outside your ownership block. If you need a change in someone
  else's file, state it in your final report instead.

## 8. File ownership (strict — do not cross these lines)

| Owner | Paths |
|---|---|
| **orchestrator** | `src/i18n/**`, `src/middleware.ts`, `next.config.ts`, `src/content/site.ts`, `messages/de.json`, `messages/en.json`, this file |
| **layout agent** | `src/app/globals.css`, `src/app/layout.tsx`, `src/app/[locale]/layout.tsx`, `src/app/[locale]/not-found.tsx`, `src/components/layout/**`, `src/components/ui/**`, `src/components/motion/**`, `src/lib/utils.ts`, `src/lib/fonts.ts` |
| **home agent** | `src/app/[locale]/page.tsx`, `src/components/home/**`, `src/components/hero/**` |
| **audio agent** | `src/components/audio/**`, `src/content/mixes.ts` |
| **booking agent** | `src/app/[locale]/anfrage/**`, `src/components/booking/**`, `src/app/api/**`, `src/lib/booking.ts`, `src/content/availability.ts` |
| **pages agent** | all other `src/app/[locale]/*/page.tsx`, `src/components/pages/**`, `src/content/{services,packages,faq,testimonials,weddings,venues,gallery,epk}.ts` |
| **seo agent** | `src/lib/seo.ts`, `src/lib/schema.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/manifest.ts`, `public/llms.txt`, `public/site.webmanifest` |
| **i18n agent** | `messages/tr.json` |

Shared read access to everything; write access only to your own block.
