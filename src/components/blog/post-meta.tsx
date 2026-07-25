import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { cn, formatDate } from '@/lib/utils';
import { site } from '@/content/site';
import type { BlogPost } from '@/content/blog';

export interface PostMetaProps {
  post: Pick<BlogPost, 'publishedAt' | 'updatedAt' | 'readingTimeMinutes'>;
  locale: Locale;
  /** Short variant for `<PostCard>` — reading time + published date only, no author/updated line. */
  compact?: boolean;
  className?: string;
}

/** Published/updated date, estimated reading time, author (`site.name`, per the brief) — the one meta line every post shows, in both a full (article hero) and compact (`<PostCard>`) form. */
export async function PostMeta({ post, locale, compact = false, className }: PostMetaProps) {
  const t = await getTranslations({ locale, namespace: 'blog.post' });
  const published = formatDate(post.publishedAt, locale);
  const updated = post.updatedAt !== post.publishedAt ? formatDate(post.updatedAt, locale) : null;
  const readingTime = t('readingTime', { minutes: post.readingTimeMinutes });

  if (compact) {
    return (
      <p className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-faint', className)}>
        <span>{published}</span>
        <span aria-hidden="true">·</span>
        <span>{readingTime}</span>
      </p>
    );
  }

  return (
    <p className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-faint', className)}>
      <span>{t('byAuthor', { author: site.name })}</span>
      <span aria-hidden="true">·</span>
      <span>{t('publishedOn', { date: published })}</span>
      {updated ? (
        <>
          <span aria-hidden="true">·</span>
          <span>{t('updatedOn', { date: updated })}</span>
        </>
      ) : null}
      <span aria-hidden="true">·</span>
      <span>{readingTime}</span>
    </p>
  );
}
