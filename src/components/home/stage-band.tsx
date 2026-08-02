import Image from 'next/image';
import { getSlotFallback, resolveSlot } from '@/content/site-images';

/**
 * Full-bleed photo band directly under the hero.
 *
 * This is where the stage photograph moved to, and the move was the point. As a
 * hero backdrop the same picture sat in a box whose shape follows the viewport —
 * roughly 1.6:1 on a laptop, taller than wide on a phone — so `object-cover` cut
 * into it from a direction nobody can predict, and it read as a photo that had
 * been chopped.
 *
 * Deliberately not `<SiteImage>`, for the same reason `HeroBackdrop` is not:
 * that component pins one aspect ratio from the registry as an inline style, and
 * this band needs a different one per breakpoint. 21:9 is right on a wide screen
 * and wrong on a phone, where it collapses to a ~160 px letterbox strip and the
 * subject inside it turns into a detail. So the ratio opens up as the screen
 * narrows — 3:2 on a phone, 2:1 on a tablet, 21:9 from `lg` — and the file being
 * cropped to 21:9 means the narrower boxes trim the sides, never the top of
 * someone's head.
 *
 * Resolution order matches `<SiteImage>` exactly: an admin upload wins, else the
 * slot default, else the band renders nothing and the page closes back up.
 */
export async function StageBand() {
  const image = (await resolveSlot('home.stage.image')) ?? getSlotFallback('home.stage.image');
  if (!image?.src) return null;

  return (
    // `data-cms-slot` by hand, because this bypasses `<SiteImage>` — without it
    // this would be the one photo on the homepage that cannot be swapped in the
    // on-site editor.
    <div
      data-cms-slot="home.stage.image"
      className="relative mt-2 w-full overflow-hidden aspect-[3/2] sm:mt-4 sm:aspect-[2/1] lg:aspect-[21/9]"
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        // The largest image on the page and, on most screens, the first thing
        // below the fold — worth fetching in the first wave.
        priority
        sizes="100vw"
        className="object-cover"
      />
    </div>
  );
}
