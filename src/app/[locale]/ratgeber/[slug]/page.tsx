import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { absoluteUrl } from '@/lib/seo';
import { JsonLd } from '@/lib/json-ld';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Reveal } from '@/components/motion/reveal';
import {
  getPublishedGuides,
  getPostBySlugForLocale,
  getPostSlug,
  resolveBlogLocale,
  getReadyLocalesForPost,
} from '@/content/blog';
import { buildRatgeberPostMetadata, ratgeberIndexUrl, ratgeberPostUrl } from '@/components/blog/blog-seo';
import { buildPostJsonLd } from '@/components/blog/blog-json-ld';
import { PostCover } from '@/components/blog/post-cover';
import { PostMeta } from '@/components/blog/post-meta';
import { PostBody } from '@/components/blog/post-body';
import { RelatedPosts } from '@/components/blog/related-posts';
import { BlogCta } from '@/components/blog/blog-cta';
import { FurtherReadingLinks, RelatedAnswerLinks, RelatedCityLinks } from '@/components/blog/internal-links';

interface PageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

/**
 * Published guides × the locales each one actually has content for — never a
 * locale that would 404 (see `.claude/CONTRACT.md`'s ownership brief and
 * `getReadyLocalesForPost`). The slug is resolved per locale, so this emits
 * `de/hochzeits-dj-checkliste`, `tr/dugun-dj-kontrol-listesi` and
 * `en/wedding-dj-checklist` rather than the same German slug three times.
 */
export function generateStaticParams() {
  return getPublishedGuides().flatMap((post) =>
    getReadyLocalesForPost(post).map((locale) => ({ locale, slug: getPostSlug(post, locale) })),
  );
}

/**
 * Looks the post up **within the requested locale**, so a slug only resolves
 * in the language it belongs to: `/en/guide/wedding-dj-checklist` renders,
 * `/en/guide/hochzeits-dj-checkliste` 404s. Accepting both would serve one
 * article at two URLs — see `getPostBySlugForLocale()`.
 */
function loadPost(slug: string, locale: Locale) {
  const post = getPostBySlugForLocale(slug, locale);
  if (!post || post.type !== 'guide' || post.status !== 'published') return null;
  return post;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = loadPost(slug, locale);
  if (!post) return {};
  const content = resolveBlogLocale(post, locale);
  if (!content) return {};

  return buildRatgeberPostMetadata(locale, post, content, getReadyLocalesForPost(post));
}

export default async function RatgeberPostPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const post = loadPost(slug, locale);
  if (!post) notFound();
  const content = resolveBlogLocale(post, locale);
  if (!content) notFound();

  setRequestLocale(locale);

  const t = await getTranslations('blog');
  const tCategory = await getTranslations('blog.categories');

  const pageUrl = ratgeberPostUrl(locale, post);
  const indexUrl = ratgeberIndexUrl(locale);
  const homeUrl = absoluteUrl('/', locale);
  const jsonLd = buildPostJsonLd({ post, content, locale, pageUrl, indexUrl, indexLabel: t('index.eyebrow'), homeUrl });

  return (
    <>
      <JsonLd data={jsonLd} />

      <Section>
        <Container size="narrow">
          <Reveal>
            <Link href="/ratgeber" className="text-sm text-ink-muted transition-colors hover:text-gold">
              ← {t('post.backToOverview')}
            </Link>
            <Eyebrow className="mt-6">{tCategory(post.category)}</Eyebrow>
            <h1 className="mt-3 font-display text-[clamp(2.25rem,4vw,3.75rem)] leading-[1.08] text-ink">{content.title}</h1>
            <p className="mt-6 text-xl leading-relaxed text-ink-muted">{content.excerpt}</p>
            <div className="mt-6">
              <PostMeta post={post} locale={locale} />
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container size="narrow">
          <PostCover post={post} priority sizes="(min-width: 768px) 700px, 100vw" />
        </Container>
      </Section>

      <Section className="pt-0">
        <Container size="narrow">
          <PostBody body={content.body} />

          <FurtherReadingLinks links={post.links} locale={locale} title={t('post.furtherReadingTitle')} />
          <RelatedAnswerLinks ids={post.relatedAnswers} locale={locale} title={t('post.relatedAnswersTitle')} />
          <RelatedCityLinks slugs={post.relatedCities} locale={locale} title={t('post.relatedCitiesTitle')} />
        </Container>
      </Section>

      <RelatedPosts post={post} locale={locale} />

      <BlogCta />
    </>
  );
}
