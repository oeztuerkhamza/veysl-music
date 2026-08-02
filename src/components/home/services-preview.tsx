import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { SiteImage } from '@/components/media';

const KEYS = ['wedding', 'engagement', 'afterparty', 'corporate'] as const;

/**
 * Editorial feature-plus-list, not four equal cards.
 *
 * The wedding entry is the business — it gets the large treatment and the full
 * measure. The other three are real offerings but supporting ones, so they sit
 * as a stacked list beside it. Weighting the four by how much they actually
 * matter is the difference between a designed page and a rendered array; the
 * previous version gave a corporate gig the same visual weight as a wedding.
 *
 * Renders the full `text` description (not just the tagline) for every entry —
 * real, crawlable prose in the initial HTML, since thin hero-plus-cards
 * homepages lose on "Hochzeits-DJ Stuttgart"-type searches.
 */
export async function ServicesPreview() {
  const t = await getTranslations('home.services');
  const tItems = await getTranslations('services.items');

  const [lead, ...rest] = KEYS;

  return (
    <Section id="leistungen">
      <Container>
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} lead={t('subtitle')} />

        <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal y={20} className="lg:col-span-7">
            <article className="border-t-2 border-clay pt-8">
              <p className="text-label text-clay">{tItems(`${lead}.tagline`)}</p>
              <h3 className="text-display-2 mt-5 font-medium text-ink">{tItems(`${lead}.title`)}</h3>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
                {tItems(`${lead}.text`)}
              </p>
              {/* Das Hochzeitsbild bekommt die volle Breite des Aufmachers —
                  dieselbe Gewichtung, die der Text hier schon hat. */}
              <SiteImage
                slot={`services.${lead}.image`}
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="mt-8"
                decorative
              />
            </article>
          </Reveal>

          <div className="lg:col-span-5">
            {rest.map((key, index) => (
              <Reveal
                key={key}
                as="article"
                y={16}
                delay={index * 0.06}
                className="block border-t border-line last:border-b"
              >
                {/* Miniatur links, Text rechts: Die drei Nebeneinträge bleiben
                    eine Liste — ein zweites Raster gleich großer Bilder würde
                    genau die Gleichgewichtung zurückholen, die dieser Abschnitt
                    bewusst vermeidet. */}
                <div className="flex items-start gap-5 py-7">
                  <div className="w-20 shrink-0 sm:w-24">
                    <SiteImage
                      slot={`services.${key}.image`}
                      sizes="(min-width: 640px) 6rem, 5rem"
                      decorative
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-label text-gold">{tItems(`${key}.tagline`)}</p>
                    <h3 className="mt-3 font-display text-2xl text-ink">{tItems(`${key}.title`)}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                      {tItems(`${key}.text`)}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <Button href="/hochzeit-events" variant="secondary" size="md">
            {t('cta')}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
