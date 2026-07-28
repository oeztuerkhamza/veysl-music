import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { Card } from '@/components/ui/card';
import { Eyebrow } from '@/components/ui/eyebrow';
import { getPostSlug, resolveBlogLocale, type BlogPost } from '@/content/blog';
import { PostCover } from './post-cover';
import { PostMeta } from './post-meta';

export interface PostCardProps {
  post: BlogPost;
  locale: Locale;
  priority?: boolean;
}

/** One article teaser — cover slot, category, title, excerpt, compact meta. Renders nothing if the post has no content for `locale` (defensive; callers should already filter). */
export async function PostCard({ post, locale, priority = false }: PostCardProps) {
  const content = resolveBlogLocale(post, locale);
  if (!content) return null;

  const tCategory = await getTranslations({ locale, namespace: 'blog.categories' });

  return (
    <Link href={{ pathname: '/ratgeber/[slug]', params: { slug: getPostSlug(post, locale) } }} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden p-0">
        <PostCover post={post} title={content.title} priority={priority} sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 100vw" />
        <div className="flex flex-1 flex-col gap-3 p-6">
          <Eyebrow>{tCategory(post.category)}</Eyebrow>
          <h3 className="font-display text-xl leading-snug text-ink transition-colors group-hover:text-gold">{content.title}</h3>
          <p className="line-clamp-3 text-sm leading-relaxed text-ink-muted">{content.excerpt}</p>
          <div className="mt-auto pt-3">
            <PostMeta post={post} locale={locale} compact />
          </div>
        </div>
      </Card>
    </Link>
  );
}
