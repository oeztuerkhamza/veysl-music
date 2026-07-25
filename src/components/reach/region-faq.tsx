import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { resolveLocalized, type PublishedRegion } from '@/content/regions';
import type { Locale } from '@/i18n/routing';

/**
 * Country-specific FAQ (2–3 pairs) — never a copy of the shared /ablauf FAQ
 * or the hub's own FAQ. Native <details>/<summary>, identical pattern to
 * `CityFaq` for one consistent accordion behaviour across the whole site.
 */
export function RegionFaq({ region, locale }: { region: PublishedRegion; locale: Locale }) {
  const t = useTranslations('regions.country');
  const countryName = resolveLocalized(region.name, locale) ?? region.name.de;

  const entries = region.faq
    .map((entry) => ({
      question: resolveLocalized(entry.question, locale),
      answer: resolveLocalized(entry.answer, locale),
    }))
    .filter((e): e is { question: string; answer: string } => Boolean(e.question && e.answer));

  if (entries.length === 0) return null;

  return (
    <Section id="faq">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={t('faq.eyebrow')} title={t('faq.title', { country: countryName })} />
        </Reveal>
        <div className="mt-8 divide-y divide-line border-y border-line">
          {entries.map((entry, i) => (
            <details key={i} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg text-ink marker:content-none">
                <span>{entry.question}</span>
                <span aria-hidden="true" className="shrink-0 text-gold transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-2xl leading-relaxed text-ink-muted">{entry.answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}
