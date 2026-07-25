import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { getPublishedGuides, resolveBlogLocale, type BlogPost } from '@/content/blog';
import { PostGrid } from './post-grid';

export interface RelatedPostsProps {
  post: BlogPost;
  locale: Locale;
  limit?: number;
}

/**
 * `post.relatedPosts` first (the editorially curated set from
 * `docs/BLOG-PLAN.md` §8), topped up with same-category then same-tag posts
 * when a post has fewer than `limit` explicit relations — every post in this
 * corpus already has 1–3 explicit `relatedPosts`, so the fallback rarely
 * fires today, but keeps this component correct for any future post that
 * ships without one.
 */
function pickRelated(post: BlogPost, locale: Locale, limit: number): BlogPost[] {
  const candidates = getPublishedGuides().filter((p) => p.id !== post.id && resolveBlogLocale(p, locale) !== null);
  const byId = new Map(candidates.map((p) => [p.id, p]));

  const explicit = (post.relatedPosts ?? []).map((id) => byId.get(id)).filter((p): p is BlogPost => Boolean(p));
  if (explicit.length >= limit) return explicit.slice(0, limit);

  const chosenIds = new Set(explicit.map((p) => p.id));
  const remaining = candidates.filter((p) => !chosenIds.has(p.id));
  const sameCategory = remaining.filter((p) => p.category === post.category);
  const sameCategoryIds = new Set(sameCategory.map((p) => p.id));
  const sameTag = remaining.filter((p) => !sameCategoryIds.has(p.id) && p.tags.some((tag) => post.tags.includes(tag)));
  const sameTagIds = new Set(sameTag.map((p) => p.id));
  const rest = remaining.filter((p) => !sameCategoryIds.has(p.id) && !sameTagIds.has(p.id));

  return [...explicit, ...sameCategory, ...sameTag, ...rest].slice(0, limit);
}

/** "Related articles" section — falls back to same-category/same-tag posts when `relatedPosts` doesn't fill `limit`. Renders nothing if no candidates exist for `locale`. */
export async function RelatedPosts({ post, locale, limit = 3 }: RelatedPostsProps) {
  const related = pickRelated(post, locale, limit);
  if (related.length === 0) return null;

  const t = await getTranslations({ locale, namespace: 'blog.post' });

  return (
    <Section>
      <Container>
        <Reveal>
          <SectionHeading title={t('relatedPostsTitle')} />
          <div className="mt-8">
            <PostGrid posts={related} locale={locale} />
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
