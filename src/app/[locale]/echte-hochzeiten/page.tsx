import { HeartHandshake } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo';
import { weddings } from '@/content/weddings';
import { venues } from '@/content/venues';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { PageHero } from '@/components/pages/page-hero';
import { EmptyState } from '@/components/pages/empty-state';
import { WeddingCard } from '@/components/pages/wedding-card';
import { FinalCta } from '@/components/pages/final-cta';

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

  const venueById = new Map(venues.map((venue) => [venue.id, venue]));

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
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {weddings.map((wedding) => (
                <WeddingCard
                  key={wedding.id}
                  wedding={wedding}
                  venue={wedding.venueId ? venueById.get(wedding.venueId) : undefined}
                  guestsLabel={t('guests')}
                  playLabel={tMusicPlayer('play')}
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
    </>
  );
}
