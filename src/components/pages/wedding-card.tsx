import Image from 'next/image';
import type { WeddingReference } from '@/content/weddings';
import type { Venue } from '@/content/venues';
import { VideoFacade } from './video-facade';
import { Reveal } from '@/components/motion/reveal';

interface WeddingCardProps {
  wedding: WeddingReference;
  venue?: Venue;
  guestsLabel: string;
  playLabel: string;
}

/** Not reachable yet — src/content/weddings.ts ships empty on purpose (see
 *  its header comment). Built now so a future CMS/data drop needs zero
 *  component changes, only real entries in the content module. */
export function WeddingCard({ wedding, venue, guestsLabel, playLabel }: WeddingCardProps) {
  return (
    <Reveal>
      <article className="overflow-hidden rounded-lg border border-line bg-surface">
        {wedding.videoUrl ? (
          <VideoFacade
            videoUrl={wedding.videoUrl}
            posterSrc={wedding.coverImage.src}
            posterAlt={wedding.coverImage.alt}
            width={wedding.coverImage.width}
            height={wedding.coverImage.height}
            playLabel={playLabel}
          />
        ) : (
          <Image
            src={wedding.coverImage.src}
            alt={wedding.coverImage.alt}
            width={wedding.coverImage.width}
            height={wedding.coverImage.height}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="h-full w-full object-cover"
          />
        )}
        <div className="flex flex-col gap-1 p-5">
          <p className="font-display text-xl text-ink">{wedding.coupleLabel}</p>
          <p className="text-sm text-ink-muted">
            {wedding.city}
            {venue ? ` · ${venue.name}` : ''}
          </p>
          {wedding.guestCount ? (
            <p className="text-xs uppercase tracking-[0.15em] text-gold">
              {wedding.guestCount} {guestsLabel}
            </p>
          ) : null}
        </div>
      </article>
    </Reveal>
  );
}
