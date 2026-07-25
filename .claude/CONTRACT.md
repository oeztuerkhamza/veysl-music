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

Dark, cinematic, editorial. Warm champagne gold on near-black. Generous whitespace,
large type, restrained accents. Think luxury wedding editorial — **not** neon club flyer.

### Design tokens — defined in `src/app/globals.css` via Tailwind v4 `@theme`

Use these token names. **Never hardcode a hex value in a component.**

```
Colour (CSS vars, both themes defined):
  --color-bg            page background          dark #08080A   light #FAF8F4
  --color-surface       cards, panels            dark #101013   light #FFFFFF
  --color-surface-2     nested / hover           dark #17171B   light #F2EEE7
  --color-ink           primary text             dark #F6F3ED   light #14131A
  --color-ink-muted     secondary text           dark #A6A19A   light #5E5850
  --color-ink-faint     tertiary / captions      dark #6E6A64   light #8B857C
  --color-line          hairline borders         dark #232329   light #E3DDD2
  --color-gold          brand accent             #D6B36A   (same both themes)
  --color-gold-soft     hover / glow             #E8CE96
  --color-gold-deep     pressed / gradients      #A8853F
  --color-success       #4E9E7A
  --color-danger        #C9564B

Typography:
  font-display  → var(--font-display)  Cormorant Garamond (variable serif)
  font-sans     → var(--font-sans)     Inter (variable sans)

Radii:  --radius-sm .375rem | --radius-md .75rem | --radius-lg 1.25rem | --radius-full 999px
Easing: --ease-out-expo cubic-bezier(.16,1,.3,1)  — the house easing curve
Shadow: --shadow-soft, --shadow-lift
```

Tailwind usage: `bg-bg`, `text-ink`, `text-ink-muted`, `border-line`, `text-gold`,
`bg-surface`, `font-display`, `rounded-lg`, etc.

### Type scale

Display headings use `font-display` (Cormorant), fluid via `clamp()`. Body uses
`font-sans` (Inter) at `text-base`/`text-lg` with `leading-relaxed`. Eyebrow labels are
`text-xs uppercase tracking-[0.2em] text-gold`.

### Shared UI primitives — `src/components/ui/` (owned by the layout agent)

Import these, do not re-create them:

```ts
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';      // variant: primary|secondary|ghost|gold, size: sm|md|lg, asChild-style `href` supported
import { Container } from '@/components/ui/container'; // max-width + responsive gutters
import { Section } from '@/components/ui/section';     // vertical rhythm wrapper, optional `id`
import { Eyebrow } from '@/components/ui/eyebrow';     // gold uppercase label
import { SectionHeading } from '@/components/ui/section-heading'; // eyebrow + h2 + lead
import { Card } from '@/components/ui/card';
import { Reveal } from '@/components/motion/reveal';   // GSAP scroll reveal, reduced-motion safe
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
