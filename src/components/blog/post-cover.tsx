import { SiteImage } from '@/components/media';
import { dynamicSlotKey } from '@/content/site-images';
import type { BlogPost } from '@/content/blog';

export interface PostCoverProps {
  post: Pick<BlogPost, 'slug'>;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/**
 * Resolves the article's `blog.cover.<slug>` image slot (registered in
 * `src/content/site-images.ts`) via `<SiteImage>`: a real CMS-uploaded photo
 * once one exists, the registry's designed empty state until then. Never a
 * stock substitute — see `.claude/BRAND-FACTS.md` "Media".
 *
 * Deliberately passes no `alt`. It used to forward the localized post title,
 * which was the only sensible value while every cover was an empty state — but
 * a title is a claim about the *article*, not a description of the *picture*,
 * and the registry's own `altHint` for this slot says in so many words not to
 * repeat it. Now that real covers exist, each one carries its own description
 * (from the CMS upload, else the registry), and that is what a screen reader
 * gets. The article headline sits next to the image in the markup anyway, so
 * nothing is lost when a cover has no description of its own.
 */
export function PostCover({ post, sizes = '(min-width: 1024px) 33vw, 100vw', priority = false, className }: PostCoverProps) {
  return <SiteImage slot={dynamicSlotKey('blog.cover', post.slug)} sizes={sizes} priority={priority} className={className} />;
}
