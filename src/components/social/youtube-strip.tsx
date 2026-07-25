import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { VideoFacade } from '@/components/pages/video-facade';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Reveal } from '@/components/motion/reveal';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { YouTubeIcon } from '@/components/ui/social-icons';
import { site } from '@/content/site';
import type { Locale } from '@/i18n/routing';
import { extractYouTubeVideoId, youTubeEmbedUrl } from '@/lib/social/embed';
import { getYouTubePosts } from '@/lib/social/provider';
import type { SocialPost } from '@/lib/social/types';
import { SocialEmptyState } from './social-empty-state';

const STRIP_LIMIT = 4;
// Nominal 16:9 dimensions passed to <VideoFacade> for its aspect-ratio/intrinsic-size
// hint — not real source dimensions (YouTube's RSS feed doesn't expose the video's
// actual resolution), same approach as ShowreelFacade's gradient placeholder.
const NOMINAL_WIDTH = 640;
const NOMINAL_HEIGHT = 360;

/**
 * Latest-videos strip. The one place in this feature that reuses the
 * click-to-load `<VideoFacade>` pattern for a genuine on-site embed: YouTube
 * via `youtube-nocookie.com` needs no vendor script and only loads after an
 * explicit click, so it stays inside the "no consent banner needed" design —
 * see docs/SOCIAL-FEED.md for why Instagram deliberately does NOT get the
 * same treatment.
 */
export async function YouTubeStrip() {
  const t = await getTranslations('social');
  const locale = (await getLocale()) as Locale;
  const posts = await getYouTubePosts(STRIP_LIMIT, { placement: 'home', locale });
  const altFallback = t('grid.altFallback.youtube');

  return (
    <Section id="youtube" className="bg-surface">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading eyebrow={t('youtubeStrip.eyebrow')} title={t('youtubeStrip.title')} />
          <Button href={site.social.youtube} variant="secondary" size="md">
            <YouTubeIcon className="h-4 w-4" aria-hidden="true" />
            {t('youtubeStrip.cta')}
          </Button>
        </div>

        <div className="mt-10">
          {posts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {posts.map((post) => (
                <Reveal key={post.id}>
                  <YouTubeVideoTile post={post} playLabel={t('grid.playLabel')} altFallback={altFallback} />
                </Reveal>
              ))}
            </div>
          ) : (
            <SocialEmptyState
              icon={YouTubeIcon}
              title={t('grid.empty.title')}
              text={t('youtubeStrip.empty')}
              ctaLabel={t('youtubeStrip.cta')}
              ctaHref={site.social.youtube}
            />
          )}
        </div>
      </Container>
    </Section>
  );
}

interface YouTubeVideoTileProps {
  post: SocialPost;
  playLabel: string;
  altFallback: string;
}

function YouTubeVideoTile({ post, playLabel, altFallback }: YouTubeVideoTileProps) {
  const videoId = extractYouTubeVideoId(post.permalink);
  const alt = post.caption?.trim() || altFallback;

  // Can't build a safe on-site embed (no video id, or no cached poster) —
  // fall back to a plain link-out card rather than rendering nothing.
  if (!videoId || !post.thumbnailUrl) {
    return (
      <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="group flex flex-col gap-2">
        <span className="relative block aspect-video overflow-hidden rounded-lg border border-line bg-surface-2">
          {post.thumbnailUrl ? (
            <Image
              src={post.thumbnailUrl}
              alt={alt}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : null}
        </span>
        {post.caption ? <p className="line-clamp-2 text-sm text-ink-muted">{post.caption}</p> : null}
      </a>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <VideoFacade
        videoUrl={youTubeEmbedUrl(videoId)}
        posterSrc={post.thumbnailUrl}
        posterAlt={alt}
        width={NOMINAL_WIDTH}
        height={NOMINAL_HEIGHT}
        playLabel={playLabel}
      />
      {post.caption ? <p className="line-clamp-2 text-sm text-ink-muted">{post.caption}</p> : null}
    </div>
  );
}
