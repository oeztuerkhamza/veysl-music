import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo';
import { mixes } from '@/content/mixes';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { PageHero } from '@/components/pages/page-hero';
import { MusicExplorer } from '@/components/pages/music-explorer';
import { StreamingLinks } from '@/components/pages/streaming-links';
import { FinalCta } from '@/components/pages/final-cta';
import { buildMusicJsonLd } from '@/components/pages/page-json-ld';
import { JsonLd } from '@/lib/json-ld';

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({ locale, pathname: '/musik' });
}

export default async function MusikPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('music');
  const tRoot = await getTranslations();

  return (
    <>
      <JsonLd data={buildMusicJsonLd({ locale, homeLabel: tRoot('nav.home'), pageLabel: tRoot('nav.music') })} />

      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        imageSlot="musik.hero.performance"
      />

      <Section>
        <Container>
          {/*
            Wired to the audio agent's real player + catalogue
            (src/components/audio, src/content/mixes.ts). The filter state
            lives in MusicExplorer; TrackList/TrackCard stay "dumb" and just
            render whatever (moment, genre) selection is handed to them.
          */}
          <MusicExplorer mixes={mixes} />
        </Container>
      </Section>

      <Section>
        <Container>
          <StreamingLinks />
        </Container>
      </Section>

      <FinalCta />
    </>
  );
}
