import { HeartHandshake } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localeTags, type Locale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo';
import { getPublishedWeddings } from '@/lib/weddings';
import { venues } from '@/content/venues';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { PageHero } from '@/components/pages/page-hero';
import { EmptyState } from '@/components/pages/empty-state';
import { WeddingEntry } from '@/components/pages/wedding-entry';
import { FinalCta } from '@/components/pages/final-cta';
import { WeddingEditorLayer } from '@/components/cms/wedding-editor-layer';

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({ locale, pathname: '/echte-hochzeiten' });
}

export default async function EchteHochzeitenPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('weddings');
  const tCta = await getTranslations('cta');
  const tMusicPlayer = await getTranslations('music.player');

  // Aus der Payload-Collection `weddings` (siehe src/lib/weddings.ts) — bis
  // hierher stand an dieser Stelle eine leere Konstante aus
  // `src/content/weddings.ts`, die nur ein Deploy hätte füllen können.
  const weddings = await getPublishedWeddings(locale);

  const entryLabels = {
    guests: t('guests'),
    story: t('story'),
    photos: t('photos'),
    videos: t('videos'),
    play: tMusicPlayer('play'),
  };

  return (
    <>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        imageSlot="weddings.hero.atmosphere"
      />

      <Section>
        <Container>
          {weddings.length === 0 ? (
            <EmptyState message={t('empty')} icon={HeartHandshake} ctaLabel={tCta('short')} ctaHref="/anfrage" />
          ) : (
            <div className="space-y-16">
              {weddings.map((wedding) => (
                <WeddingEntry
                  key={wedding.id}
                  wedding={wedding}
                  localeTag={localeTags[locale]}
                  labels={entryLabels}
                />
              ))}
            </div>
          )}
        </Container>
      </Section>

      {venues.length > 0 ? (
        <Section>
          <Container>
            <Reveal>
              <SectionHeading eyebrow={t('hero.eyebrow')} title={t('venuesTitle')} lead={t('venuesSubtitle')} />
            </Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {venues.map((venue) => (
                <Reveal key={venue.id}>
                  <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-line bg-surface p-6 text-center">
                    <p className="font-display text-lg text-ink">{venue.name}</p>
                    <p className="text-sm text-ink-muted">{venue.city}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      <FinalCta />

      {/*
        Anlegen/Bearbeiten/Löschen direkt auf dieser Seite — lädt nur, wenn ein
        Payload-Hinweis-Cookie da ist, und prüft dann die Sitzung serverseitig.
        Für alle anderen rendert die Komponente `null` und ihr Chunk wird nie
        angefordert (siehe wedding-editor-layer.tsx).
      */}
      <WeddingEditorLayer locale={locale} />
    </>
  );
}
