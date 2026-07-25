import { SiteImage } from '@/components/media';
import { dynamicSlotKey } from '@/content/site-images';
import type { BlogPost } from '@/content/blog';

export interface PostCoverProps {
  post: Pick<BlogPost, 'slug'>;
  /** Localized post title — used as the resolved image's alt text once a real photo exists. */
  title: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/**
 * Resolves the article's `blog.cover.<slug>` image slot (registered in
 * `src/content/site-images.ts`) via `<SiteImage>`: a real CMS-uploaded photo
 * once one exists, the registry's designed empty state until then. Never a
 * stock substitute — see `.claude/BRAND-FACTS.md` "Media".
 */
export function PostCover({ post, title, sizes = '(min-width: 1024px) 33vw, 100vw', priority = false, className }: PostCoverProps) {
  return <SiteImage slot={dynamicSlotKey('blog.cover', post.slug)} alt={title} sizes={sizes} priority={priority} className={className} />;
}
