import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Star } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/section-heading';
import { fetchGoogleReviews } from '@/lib/reviews/google-places';
import type { Locale } from '@/i18n/routing';

/**
 * Live Google reviews, shown with the attribution the Places API terms require.
 *
 * The provider (`@/lib/reviews/google-places`) has existed for a while with no
 * consumer — the data was fetched by nobody. This is that consumer.
 *
 * Two hard limits worth knowing before anyone asks for more:
 *
 * 1. **Five reviews, maximum.** The Places API returns at most five per place
 *    and offers no parameter for more; `GoogleReviewSummary.reviews` documents
 *    it too. Reading all of them needs the Business Profile API, which is a
 *    different product requiring OAuth as the profile owner. The "read all N
 *    on Google" link below is the honest way to cover the gap.
 * 2. **These never become `aggregateRating`.** Google's review-snippet rules
 *    forbid marking up another platform's ratings as your own, so this section
 *    displays and links, and the star rich snippet stays reserved for
 *    first-party testimonials. See docs/GOOGLE-BUSINESS-PROFILE.md §12.
 *
 * Renders nothing at all when the fetch returns `null` — no API key, no place
 * ID, network error, malformed payload. A review widget is not worth an empty
 * shell on the homepage, let alone a 500.
 */
export async function GoogleReviews({ locale }: { locale: Locale }) {
  const summary = await fetchGoogleReviews(locale);
  if (!summary || summary.reviews.length === 0) return null;

  const t = await getTranslations('home.googleReviews');
  const ratingText = summary.rating.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <Section id="google-bewertungen">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow={t('eyebrow')}
            title={t('title')}
            lead={t('subtitle', { rating: ratingText, count: summary.totalCount })}
          />
          <a
            href={summary.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gold underline underline-offset-4 transition-colors hover:text-gold-soft"
          >
            {t('readAllOnGoogle', { count: summary.totalCount })}
          </a>
        </div>

      </Container>

      {/*
        Laufband statt Raster.

        Bewusst außerhalb von `<Container>`: Das Band läuft randlos durch das
        Fenster, sonst bricht die Illusion an der Containerkante ab.

        Die Liste wird **zweimal** gerendert. Das ist der ganze Trick an einem
        nahtlosen Laufband: Die Animation schiebt genau um die Breite einer
        Hälfte (-50 %) und springt dann zurück auf 0 — weil an dieser Stelle die
        zweite Kopie exakt dort steht, wo die erste stand, ist der Sprung
        unsichtbar. Die Kopie ist `aria-hidden`, sonst läse ein Screenreader
        jede Bewertung doppelt vor.

        Wie viele Bewertungen hier ankommen, entscheidet nicht dieser Code:
        Die Places API liefert höchstens fünf pro Ort, unabhängig davon, wie
        viele das Profil insgesamt hat. Der Link „alle … auf Google lesen"
        oben ist deshalb kein Zierrat, sondern der einzige Weg zum Rest.
      */}
      <div
        className="reviews-marquee group relative mt-10 overflow-hidden"
        // Pausiert bei Maus *und* bei Tastaturfokus. Nur Hover wäre für alle
        // unbenutzbar, die nicht mit der Maus navigieren — und WCAG 2.2.2
        // verlangt für Bewegung, die länger als fünf Sekunden läuft, eine
        // Möglichkeit zum Anhalten, nicht nur eine für Mausnutzer.
        role="region"
        aria-label={t('title')}
      >
        {/* Weiche Kanten, damit die Karten nicht hart abgeschnitten wirken. */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-bg to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-bg to-transparent sm:w-24" />

        <ul className="reviews-marquee-track flex w-max gap-6">
          {[0, 1].flatMap((copy) =>
            summary.reviews.map((review, index) => (
              <li
                key={`${copy}-${review.authorName}-${index}`}
                className="w-[19rem] shrink-0 sm:w-[22rem]"
                aria-hidden={copy === 1 ? true : undefined}
              >
                <Card className="flex h-full flex-col gap-4 p-6">
                <div
                  className="flex items-center gap-1"
                  role="img"
                  aria-label={t('ratingAria', { rating: review.rating })}
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={i < review.rating ? 'size-4 text-gold' : 'size-4 text-line'}
                      fill="currentColor"
                      aria-hidden="true"
                    />
                  ))}
                </div>

                {/* A star-only review carries no text — valid on Google, so the
                    card has to survive it rather than render an empty quote. */}
                {review.text ? (
                  <blockquote className="flex-1 text-sm leading-relaxed text-ink-muted">{review.text}</blockquote>
                ) : (
                  <p className="flex-1 text-sm italic leading-relaxed text-ink-faint">{t('ratingOnly')}</p>
                )}

                <footer className="flex items-center gap-3 border-t border-line pt-4">
                  {/* Attribution is a Places API terms requirement, not decoration:
                      the reviewer's name and photo must be shown as Google returns
                      them. `lh3.googleusercontent.com` is allowlisted in
                      next.config.ts for exactly this. */}
                  {review.authorPhotoUrl ? (
                    <Image
                      src={review.authorPhotoUrl}
                      alt=""
                      width={36}
                      height={36}
                      className="size-9 shrink-0 rounded-full object-cover"
                      unoptimized
                    />
                  ) : null}
                  <div className="min-w-0">
                    <p className="truncate text-sm text-ink">{review.authorName}</p>
                    <p className="text-xs text-ink-faint">
                      {review.publishedAt ? (
                        <time dateTime={review.publishedAt}>{review.relativeTime}</time>
                      ) : (
                        review.relativeTime
                      )}
                      {' · '}
                      {t('sourceGoogle')}
                    </p>
                  </div>
                  </footer>
                </Card>
              </li>
            ))
          )}
        </ul>
      </div>

      <Container>
        <p className="mt-8 text-sm text-ink-muted">
          {t('writeOwnPrompt')}{' '}
          <a
            href={summary.writeReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold underline underline-offset-4 transition-colors hover:text-gold-soft"
          >
            {t('writeOwnCta')}
          </a>
        </p>
      </Container>
    </Section>
  );
}
