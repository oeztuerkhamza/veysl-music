import { getTranslations } from 'next-intl/server';
import { Quote, Star } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Card } from '@/components/ui/card';
import { Reveal } from '@/components/motion/reveal';
import { site } from '@/content/site';

export interface Testimonial {
  quote: string;
  author: string;
  venue: string;
  date: string;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
}

/**
 * Accepts real testimonials as a prop — never invents quotes. Renders nothing
 * until `@/content/testimonials` (owned by the pages agent) exists and is wired
 * in from `page.tsx`. The Google rating badge stays behind `site.reviews.isPublishable`
 * (currently false: the rating is verified at 5.0 but the review count is not).
 */
export async function Testimonials({ testimonials }: TestimonialsProps) {
  const t = await getTranslations('home.testimonials');

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <Section id="stimmen">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow={t('eyebrow')} title={t('title')} lead={t('subtitle')} />

          {site.reviews.isPublishable && (
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 text-gold" fill="currentColor" aria-hidden="true" />
              <span className="text-ink">
                {t('ratingLabel', {
                  rating: site.reviews.rating.toFixed(1),
                  count: site.reviews.count,
                })}
              </span>
            </div>
          )}
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {testimonials.slice(0, 3).map((testimonial) => (
            <Reveal key={`${testimonial.author}-${testimonial.date}`}>
              <Card className="flex h-full flex-col p-8">
                <Quote className="h-6 w-6 text-gold" aria-hidden="true" />
                <p className="mt-4 flex-1 font-display text-xl leading-snug text-ink">
                  “{testimonial.quote}”
                </p>
                <footer className="mt-6 text-sm text-ink-muted">
                  <p className="text-ink">{testimonial.author}</p>
                  <p>
                    {testimonial.venue} · {testimonial.date}
                  </p>
                </footer>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
