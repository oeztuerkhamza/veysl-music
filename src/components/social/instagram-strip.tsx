import { getLocale, getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Reveal } from '@/components/motion/reveal';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { InstagramIcon } from '@/components/ui/social-icons';
import { site } from '@/content/site';
import { localeTags, type Locale } from '@/i18n/routing';
import { getInstagramPosts } from '@/lib/social/provider';
import { buildSocialCardLabels } from './social-labels';
import { SocialPostGrid } from './social-post-grid';

const STRIP_LIMIT = 6;

/**
 * Compact homepage/footer-adjacent strip. 63,000 followers is @dj_veys's
 * single strongest trust signal (see .claude/BRAND-FACTS.md) — the number is
 * rendered as a headline stat, not a footnote, next to a small live-feed
 * preview and a strong follow CTA.
 */
export async function InstagramStrip() {
  const t = await getTranslations('social');
  const locale = (await getLocale()) as Locale;
  const posts = await getInstagramPosts(STRIP_LIMIT, { placement: 'home', locale });
  const labels = buildSocialCardLabels(t);
  const followerCount = new Intl.NumberFormat(localeTags[locale]).format(site.stats.instagramFollowers);

  return (
    <Section id="instagram" className="bg-surface">
      <Container>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow={t('instagramStrip.eyebrow')}
            title={t('instagramStrip.title')}
            lead={t('instagramStrip.followerCaption')}
          />

          <Reveal className="flex flex-col items-start gap-3 sm:items-end">
            <p className="flex items-baseline gap-2">
              <span className="font-display text-4xl text-gold sm:text-5xl">{followerCount}</span>
              <span className="text-sm uppercase tracking-[0.1em] text-ink-muted">
                {t('instagramStrip.followerLabel')}
              </span>
            </p>
            <Button href={site.social.instagram} variant="gold" size="md">
              <InstagramIcon className="h-4 w-4" aria-hidden="true" />
              {t('instagramStrip.cta')}
            </Button>
          </Reveal>
        </div>

        <div className="mt-10">
          <SocialPostGrid
            posts={posts}
            labels={labels}
            locale={locale}
            columns={6}
            emptyIcon={InstagramIcon}
            emptyTitle={t('grid.empty.title')}
            emptyText={t('instagramStrip.empty')}
            emptyCtaLabel={t('instagramStrip.cta')}
            emptyCtaHref={site.social.instagram}
          />
        </div>
      </Container>
    </Section>
  );
}
