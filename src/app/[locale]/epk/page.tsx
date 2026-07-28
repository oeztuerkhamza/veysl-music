import Image from 'next/image';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo';
import { site } from '@/content/site';
import { epkDownloads, epkImages, partnerLogos, pressMentions } from '@/content/epk';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { PageHero } from '@/components/pages/page-hero';
import { EpkDownloads } from '@/components/pages/epk-downloads';
import { FinalCta } from '@/components/pages/final-cta';
import { buildEpkJsonLd } from '@/components/pages/page-json-ld';
import { JsonLd } from '@/lib/json-ld';

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({ locale, pathname: '/epk' });
}

export default async function EpkPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('epk');
  const tCta = await getTranslations('cta');

  const tRoot = await getTranslations();

  const bioLong = t.raw('bio.long') as string[];

  return (
    <>
      <JsonLd data={buildEpkJsonLd({ locale, homeLabel: tRoot('nav.home'), pageLabel: tRoot('nav.epk') })} />

      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        imageSlot="epk.portrait"
      />

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[2fr_1fr] lg:items-start">
            <Reveal>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gold">{t('bioShort')}</p>
                <p className="mt-3 max-w-2xl font-display text-2xl leading-snug text-ink">{t('bio.short')}</p>

                <p className="mt-10 text-xs uppercase tracking-[0.2em] text-gold">{t('bioLong')}</p>
                <div className="mt-3 flex max-w-2xl flex-col gap-4">
                  {bioLong.map((paragraph, index) => (
                    <p key={index} className="leading-relaxed text-ink-muted">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <dl className="mt-10 grid max-w-2xl grid-cols-1 gap-4 border-t border-line pt-6 sm:grid-cols-3">
                  <div>
                    <dd className="font-display text-2xl text-ink">{t('stats.years', { years: site.stats.yearsExperience })}</dd>
                  </div>
                  <div>
                    <dd className="font-display text-2xl text-ink">{t('stats.events', { events: site.stats.eventsCompleted })}</dd>
                  </div>
                  <div>
                    <dd className="text-ink-muted">{t('stats.languages')}</dd>
                  </div>
                </dl>
              </div>
            </Reveal>

            {epkImages.personalStory ? (
              <Reveal>
                <figure className="overflow-hidden rounded-lg border border-line">
                  <Image
                    src={epkImages.personalStory.src}
                    alt={epkImages.personalStory.alt}
                    width={epkImages.personalStory.width}
                    height={epkImages.personalStory.height}
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="h-full w-full object-cover"
                  />
                </figure>
              </Reveal>
            ) : null}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal>
            <h2 className="font-display text-3xl text-ink sm:text-4xl">{t('downloads')}</h2>
          </Reveal>
          <div className="mt-8 grid gap-10 lg:grid-cols-[2fr_1fr] lg:items-start">
            <EpkDownloads downloads={epkDownloads} />

            {epkImages.setupDetail ? (
              <Reveal>
                <figure className="w-40 overflow-hidden rounded-lg border border-line">
                  <Image
                    src={epkImages.setupDetail.src}
                    alt={epkImages.setupDetail.alt}
                    width={epkImages.setupDetail.width}
                    height={epkImages.setupDetail.height}
                    sizes="160px"
                    className="h-full w-full object-cover"
                  />
                </figure>
              </Reveal>
            ) : null}
          </div>
        </Container>
      </Section>

      {partnerLogos.length > 0 ? (
        <Section>
          <Container>
            <Reveal>
              <h2 className="font-display text-3xl text-ink sm:text-4xl">{t('partnersTitle')}</h2>
            </Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {partnerLogos.map((partner) => (
                <div key={partner.id} className="flex items-center justify-center rounded-lg border border-line bg-surface p-6">
                  <p className="text-sm text-ink-muted">{partner.name}</p>
                </div>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {pressMentions.length > 0 ? (
        <Section>
          <Container>
            <Reveal>
              <h2 className="font-display text-3xl text-ink sm:text-4xl">{t('pressTitle')}</h2>
            </Reveal>
            <ul className="mt-8 flex flex-col gap-3">
              {pressMentions.map((mention) => (
                <li key={mention.id} className="text-ink-muted">
                  {mention.outlet}
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      <Section>
        <Container>
          <Reveal>
            <div className="flex flex-col items-start gap-4 rounded-lg border border-line bg-surface p-8 sm:p-10">
              <h2 className="font-display text-3xl text-ink">{t('contactTitle')}</h2>
              <div className="flex flex-col gap-1 text-ink-muted">
                <a href={site.contact.phoneHref} className="transition-colors hover:text-gold">
                  {site.contact.phone}
                </a>
                <a href={`mailto:${site.contact.email}`} className="transition-colors hover:text-gold">
                  {site.contact.email}
                </a>
              </div>
              <Button href="/anfrage" variant="gold" size="md">
                {tCta('primary')}
              </Button>
            </div>
          </Reveal>
        </Container>
      </Section>

      <FinalCta compact />
    </>
  );
}
