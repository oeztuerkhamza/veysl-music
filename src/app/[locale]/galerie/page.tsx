import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo';
import { gallery } from '@/content/gallery';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { PageHero } from '@/components/pages/page-hero';
import { GalleryExplorer } from '@/components/pages/gallery-explorer';
import { FinalCta } from '@/components/pages/final-cta';
import { buildSimplePageJsonLd } from '@/components/pages/page-json-ld';
import { JsonLd } from '@/lib/json-ld';

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({ locale, pathname: '/galerie' });
}

export default async function GaleriePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tRootNav = await getTranslations();
  const t = await getTranslations('gallery');
  const tCta = await getTranslations('cta');
  const tMusicPlayer = await getTranslations('music.player');

  return (
    <>
      <JsonLd
        data={buildSimplePageJsonLd({
          locale,
          homeLabel: tRootNav('nav.home'),
          pageLabel: tRootNav('nav.gallery'),
          pathname: '/galerie',
          type: 'ImageGallery',
        })}
      />
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        imageSlot="gallery.hero.atmosphere"
      />

      <Section>
        <Container>
          <GalleryExplorer
            items={gallery}
            labels={{
              all: t('filterAll'),
              photo: t('filterPhoto'),
              video: t('filterVideo'),
              empty: t('empty'),
              playLabel: tMusicPlayer('play'),
              ctaLabel: tCta('short'),
            }}
          />
        </Container>
      </Section>

      <FinalCta />
    </>
  );
}
