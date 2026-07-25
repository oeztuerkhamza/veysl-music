import { getLocale, getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { InstagramIcon } from '@/components/ui/social-icons';
import { site } from '@/content/site';
import type { Locale } from '@/i18n/routing';
import { DEFAULT_FEED_LIMIT, getSocialFeed } from '@/lib/social/provider';
import type { SocialPlacement } from '@/lib/social/types';
import { buildSocialCardLabels } from './social-labels';
import { SocialPostGrid } from './social-post-grid';

export interface SocialGridProps {
  limit?: number;
  /** Filters to curated posts tagged for this surface (`CmsProvider` only — automatic-feed posts are placement-agnostic and always included). Omit to show everything. */
  placement?: SocialPlacement;
  id?: string;
  className?: string;
}

/**
 * Standalone "Social" section: merged Instagram + YouTube feed (see
 * `getSocialFeed` — featured/`sortOrder` first, then newest first),
 * server-fetched so mounting it anywhere is a single `<SocialGrid />` with no
 * data plumbing required from the page. See docs/SOCIAL-FEED.md for
 * recommended mount points and the caching/GDPR reasoning.
 */
export async function SocialGrid({ limit = DEFAULT_FEED_LIMIT, placement, id = 'social', className }: SocialGridProps) {
  const t = await getTranslations('social');
  const locale = (await getLocale()) as Locale;
  const posts = await getSocialFeed(limit, { placement, locale });
  const labels = buildSocialCardLabels(t);

  return (
    <Section id={id} className={className}>
      <Container>
        <SectionHeading eyebrow={t('grid.eyebrow')} title={t('grid.title')} lead={t('grid.lead')} />
        <div className="mt-10">
          <SocialPostGrid
            posts={posts}
            labels={labels}
            locale={locale}
            columns={4}
            emptyIcon={InstagramIcon}
            emptyTitle={t('grid.empty.title')}
            emptyText={t('grid.empty.text')}
            emptyCtaLabel={t('grid.empty.cta')}
            emptyCtaHref={site.social.instagram}
          />
        </div>
      </Container>
    </Section>
  );
}
