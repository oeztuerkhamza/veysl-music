import Image from 'next/image';
import { Images, Play } from 'lucide-react';
import { InstagramIcon, YouTubeIcon } from '@/components/ui/social-icons';
import { cn, formatDate } from '@/lib/utils';
import type { SocialPost } from '@/lib/social/types';

export interface SocialCardLabels {
  altFallback: Record<SocialPost['platform'], string>;
  typeLabel: Record<SocialPost['type'], string>;
  openOn: Record<SocialPost['platform'], string>;
}

interface SocialPostCardProps {
  post: SocialPost;
  labels: SocialCardLabels;
  locale: string;
  className?: string;
}

const PLATFORM_ICON = { instagram: InstagramIcon, youtube: YouTubeIcon } as const;

/**
 * Always links out to the original post — never embeds Meta/Google content
 * inline, even on click. Consistent, GDPR-simplest behaviour across a mixed
 * Instagram + YouTube grid; the deliberate exception (an on-site YouTube
 * embed on click) lives only in `<YouTubeStrip>`, not here — see
 * docs/SOCIAL-FEED.md.
 */
export function SocialPostCard({ post, labels, locale, className }: SocialPostCardProps) {
  const PlatformIcon = PLATFORM_ICON[post.platform];
  const isMotion = post.type === 'video' || post.type === 'reel';
  const alt = post.caption?.trim() || labels.altFallback[post.platform];
  const ariaLabel = `${labels.openOn[post.platform]} — ${labels.typeLabel[post.type]}`;

  return (
    <article className={cn('flex flex-col gap-2', className)}>
      <a
        href={post.permalink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className="group relative block aspect-square overflow-hidden rounded-lg border border-line bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        {post.thumbnailUrl ? (
          <Image
            src={post.thumbnailUrl}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_50%_30%,var(--color-gold-deep)_0%,var(--color-surface-2)_65%,var(--color-surface)_100%)]"
          >
            <PlatformIcon className="h-8 w-8 text-ink-faint" />
          </span>
        )}

        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity duration-300 ease-out-expo group-hover:opacity-100 motion-reduce:transition-none"
        />

        <span
          aria-hidden="true"
          className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm"
        >
          <PlatformIcon className="h-3.5 w-3.5" />
        </span>

        {isMotion ? (
          <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-transform duration-300 ease-out-expo group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
              <Play className="h-4 w-4 translate-x-0.5" fill="currentColor" aria-hidden="true" />
            </span>
          </span>
        ) : post.type === 'carousel' ? (
          <span
            aria-hidden="true"
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm"
          >
            <Images className="h-3.5 w-3.5" />
          </span>
        ) : null}
      </a>

      {post.caption ? <p className="line-clamp-2 text-sm leading-relaxed text-ink-muted">{post.caption}</p> : null}

      <time dateTime={post.postedAt} className="text-xs uppercase tracking-[0.1em] text-ink-faint">
        {formatDate(post.postedAt, locale, { day: '2-digit', month: 'short', year: 'numeric' })}
      </time>
    </article>
  );
}
