import type { Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import type { BlogPost } from '@/content/blog';
import { PostCard } from './post-card';

export interface PostGridProps {
  posts: BlogPost[];
  locale: Locale;
  className?: string;
}

export function PostGrid({ posts, locale, className }: PostGridProps) {
  if (posts.length === 0) return null;

  return (
    <div className={cn('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} locale={locale} />
      ))}
    </div>
  );
}
