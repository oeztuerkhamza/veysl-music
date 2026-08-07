import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { absoluteUrl } from '@/lib/seo';
import { JsonLd } from '@/lib/json-ld';
import { formatDate } from '@/lib/utils';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { PageHero } from '@/components/pages/page-hero';
import { Reveal } from '@/components/motion/reveal';
import { getPublishedGuides, resolveBlogLocale } from '@/content/blog';
import { PostGrid } from '@/components/blog/post-grid';
import { BlogEmptyState } from '@/components/blog/blog-empty-state';
import { BlogCta } from '@/components/blog/blog-cta';
import { buildRatgeberIndexMetadata, ratgeberIndexUrl } from '@/components/blog/blog-seo';
import { buildIndexJsonLd } from '@/components/blog/blog-json-ld';
import { BLOG_CATEGORY_ORDER } from '@/components/blog/category';

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

/**
 * Published guides this locale actually gets. `resolveBlogLocale` returns
 * `null` both for a locale a post was never translated into (never
 * machine-translated filler) and for one a post is withheld from — which is
 * how the religious-wedding guide stays off the German, English, Dutch,
 * French and Spanish index while remaining fully written (see
 * `restrictToLocales` in `src/content/blog/types.ts`).
 */
function postsForLocale(locale: Locale) {
  return getPublishedGuides().filter((post) => resolveBlogLocale(post, locale) !== null);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildRatgeberIndexMetadata(locale, postsForLocale(locale).length);
}

export default async function RatgeberIndexPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('blog');
  const tCategory = await getTranslations('blog.categories');
  const posts = postsForLocale(locale);
  const hasArticles = posts.length > 0;

  const groups = BLOG_CATEGORY_ORDER.map((category) => ({
    category,
    posts: posts.filter((post) => post.category === category),
  })).filter((group) => group.posts.length > 0);

  const latestUpdate = posts.reduce<string | null>(
    (latest, post) => (latest === null || post.updatedAt > latest ? post.updatedAt : latest),
    null
  );

  const jsonLd = hasArticles
    ? buildIndexJsonLd({
        homeUrl: absoluteUrl('/', locale),
        indexUrl: ratgeberIndexUrl(locale),
        indexLabel: t('index.eyebrow'),
      })
    : null;

  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}

      <PageHero
        eyebrow={t('index.eyebrow')}
        title={t('index.title')}
        subtitle={hasArticles ? t('index.subtitle', { count: posts.length }) : undefined}
      />

      <Section>
        <Container>
          {!hasArticles ? (
            <BlogEmptyState locale={locale} />
          ) : (
            <>
              {latestUpdate ? <p className="text-sm text-ink-faint">{t('index.updated', { date: formatDate(latestUpdate, locale) })}</p> : null}

              <nav aria-label={t('index.eyebrow')} className="mt-6 flex flex-wrap gap-3 border-y border-line py-6">
                {groups.map(({ category }) => (
                  <a
                    key={category}
                    href={`#${category}`}
                    className="rounded-full border border-line px-4 py-2 text-sm text-ink-muted transition-colors hover:border-gold hover:text-gold"
                  >
                    {tCategory(category)}
                  </a>
                ))}
              </nav>
            </>
          )}
        </Container>
      </Section>

      {groups.map(({ category, posts: categoryPosts }) => (
        <Section key={category} id={category} className="scroll-mt-24">
          <Container>
            <Reveal>
              <SectionHeading title={tCategory(category)} />
            </Reveal>
            <div className="mt-8">
              <PostGrid posts={categoryPosts} locale={locale} />
            </div>
          </Container>
        </Section>
      ))}

      {hasArticles ? <BlogCta /> : null}
    </>
  );
}
