import Image from 'next/image';
import { getSlotFallback, resolveSlot } from '@/content/site-images';

/**
 * Photographic backdrop for the homepage hero.
 *
 * Resolution order is the same as `<SiteImage>`: an admin upload wins, else the
 * slot's `fallbackSrc`, else nothing at all. It used to consult only the CMS,
 * which meant the one photo the homepage most needs was also the only one that
 * could not be shipped with the code — the slot had a perfectly good default
 * and this component could not see it. Uploading in the admin still overrides
 * it, and clearing the upload falls back here rather than to a blank hero.
 *
 * The `null` branch is still real and still matters: it is what kept the hero
 * looking finished through the whole period when no usable photograph existed
 * (see hero.tsx), and it is where this lands again if the default is ever
 * removed.
 *
 * Deliberately not `<SiteImage>`: that component falls back to a designed
 * `<ImagePlaceholder>` box with a fixed aspect ratio, which is right for a
 * figure inside a column and wrong for a full-bleed layer — an empty hero
 * would show a placeholder card instead of the intended empty composition.
 *
 * ── Why this cannot cost measurable performance ──────────────────────────
 *
 * - It is `position: absolute` inside a section that is already
 *   `min-h-[100svh]`, so it occupies no layout box of its own: **CLS stays 0**
 *   whether the photo loads fast, slow, or never.
 * - `priority` marks it as the one preloaded image on the page, so it is
 *   fetched in the first wave rather than after hydration — which is what
 *   makes a hero photo either invisible in the metrics or the worst thing on
 *   the page.
 * - `sizes="100vw"` lets Next serve a width-matched variant instead of a
 *   desktop-sized file to a phone, and `next.config.ts` already puts AVIF
 *   ahead of WebP, so the transferred bytes are a fraction of the upload.
 * - The scrim below is a CSS gradient, not a second image request.
 * - The headline stays plain server-rendered text on top. It usually remains
 *   the LCP element; where the photo takes over, it is a preloaded AVIF at
 *   the right dimensions, which is the fast version of that trade.
 *
 * The one real cost is bytes on the wire for the photo itself. That is worth
 * saying plainly rather than pretending otherwise — a wedding site with no
 * photograph converts worse than one that loads 80 KB slower.
 */
export async function HeroBackdrop() {
  const image = (await resolveSlot('home.hero.background')) ?? getSlotFallback('home.hero.background');
  if (!image?.src) return null;

  return (
    // `data-cms-slot` auch hier, obwohl diese Komponente bewusst kein
    // `<SiteImage>` ist: Sonst wäre ausgerechnet das Foto der Startseite das
    // einzige, das man vor Ort nicht austauschen kann. Solange gar kein Bild
    // gesetzt ist, rendert diese Komponente `null` — dieser Fall wird über die
    // Slot-Liste im Overlay abgedeckt, nicht über einen Knopf im Nichts.
    <div className="absolute inset-0 -z-10" aria-hidden="true" data-cms-slot="home.hero.background">
      <Image
        src={image.src}
        // Empty alt on purpose: this is atmosphere behind a headline that
        // already says what the page is. Announcing it would make a screen
        // reader read decoration before content.
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Scrim. The slot brief asks for a photo that "must also work heavily
          darkened and overlaid with a gradient" precisely so this can exist:
          it is what keeps the headline readable over an unpredictable
          user-supplied image, and what stops a bright photo from fighting the
          warm-paper palette. Two stops rather than a flat wash so the top
          stays legible while the bottom melts into the page background. */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg/85 via-bg/60 to-bg" />
    </div>
  );
}
