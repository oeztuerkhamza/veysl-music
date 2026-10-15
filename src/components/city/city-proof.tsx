import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { Link } from '@/i18n/navigation';
import { localeTags, type Locale } from '@/i18n/routing';
import { formatDate } from '@/lib/utils';
import { getPublishedWeddings } from '@/lib/weddings';
import { cityMatches, getPublishedVenues } from '@/lib/venues';
import { isVenueLocale } from '@/content/venues';
import type { City } from '@/content/cities';

/**
 * Belege auf der Stadtseite: echte Hochzeiten und Locations aus dem CMS, die
 * zu dieser Stadt gehören.
 *
 * Das ist die Antwort auf die Frage, die eine Stadtseite sonst nur behauptet
 * („wir spielen auch in Fellbach"): Hier steht, wo, wann und für wen. Gibt es
 * für die Stadt nichts, rendert die Komponente **nichts** — keine leere
 * Überschrift, kein „bald mehr". Eine Stadtseite ohne Beleg bleibt eine
 * Stadtseite ohne Beleg und sagt das nicht laut.
 *
 * Das ist auch die Regel für neue Stadtseiten (docs/SEO-CITY-STRATEGY.md): Ein
 * Ort bekommt nur dann eine eigene Seite, wenn dieser Block für ihn etwas
 * zeigen kann.
 */
export async function CityProof({ city, locale }: { city: City; locale: Locale }) {
  const [weddingsAll, venuesAll] = await Promise.all([getPublishedWeddings(locale), getPublishedVenues(locale)]);
  const weddings = weddingsAll.filter((wedding) => cityMatches(wedding.city, city.name));
  const venues = venuesAll.filter((venue) => cityMatches(venue.city, city.name));
  if (weddings.length === 0 && venues.length === 0) return null;

  const t = await getTranslations({ locale, namespace: 'city.proof' });
  const values = { city: city.name };

  return (
    <Section id="belege">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={t('eyebrow')}
            title={weddings.length > 0 ? t('weddingsTitle', values) : t('venuesTitle', values)}
          />
        </Reveal>

        {weddings.length > 0 ? (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {weddings.map((wedding) => (
              <li key={wedding.id}>
                <Link
                  href={{ pathname: '/echte-hochzeiten', hash: `hochzeit-${wedding.id}` }}
                  className="group flex h-full flex-col gap-2 rounded-lg border border-line bg-surface p-5 transition-colors hover:border-gold"
                >
                  <span className="font-display text-lg text-ink transition-colors group-hover:text-gold">{wedding.coupleLabel}</span>
                  <span className="text-sm text-ink-muted">
                    {[wedding.venue, wedding.date ? formatDate(wedding.date, localeTags[locale]) : undefined]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                  <span className="mt-auto pt-2 text-sm text-gold">{t('viewWedding')} →</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        {venues.length > 0 ? (
          <div className={weddings.length > 0 ? 'mt-12' : 'mt-8'}>
            {weddings.length > 0 ? <h3 className="font-display text-2xl text-ink">{t('venuesTitle', values)}</h3> : null}
            <ul className={`${weddings.length > 0 ? 'mt-6 ' : ''}flex flex-wrap gap-3`}>
              {venues.map((venue) => (
                <li key={venue.id}>
                  {isVenueLocale(locale) ? (
                    <Link
                      href={{ pathname: '/hochzeitslocation/[slug]', params: { slug: venue.slug } }}
                      className="rounded-full border border-line px-4 py-2 text-sm text-ink-muted transition-colors hover:border-gold hover:text-gold"
                    >
                      {venue.name}
                    </Link>
                  ) : (
                    <span className="rounded-full border border-line px-4 py-2 text-sm text-ink-muted">{venue.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {weddings.length > 0 ? (
          <p className="mt-8">
            <Link href="/echte-hochzeiten" className="text-sm text-gold underline-offset-4 hover:underline">
              {t('allWeddings')} →
            </Link>
          </p>
        ) : null}
      </Container>
    </Section>
  );
}
