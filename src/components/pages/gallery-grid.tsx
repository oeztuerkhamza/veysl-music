import Image from 'next/image';
import type { GalleryItem } from '@/content/gallery';
import { VideoFacade } from './video-facade';
import { Reveal } from '@/components/motion/reveal';

interface GalleryGridProps {
  items: GalleryItem[];
  playLabel: string;
}

export function GalleryGrid({ items, playLabel }: GalleryGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Reveal key={item.id}>
          <div className="overflow-hidden rounded-lg border border-line bg-surface">
            {item.type === 'video' && item.videoUrl ? (
              <VideoFacade
                videoUrl={item.videoUrl}
                posterSrc={item.src}
                posterAlt={item.alt}
                width={item.width}
                height={item.height}
                playLabel={playLabel}
              />
            ) : (
              <Image
                src={item.src}
                alt={item.alt}
                width={item.width}
                height={item.height}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </Reveal>
      ))}
    </div>
  );
}
