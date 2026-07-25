import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/motion/reveal';

interface HubFaqItem {
  q: string;
  a: string;
}

/**
 * Hub-level FAQ (general destination-wedding logistics questions) — distinct
 * from `RegionIntent` above it (short, keyword-mapped, non-accordion answers)
 * and from each country page's own 2–3 country-specific pairs. Same
 * <details>/<summary> accordion as `RegionFaq`/`CityFaq` for one consistent
 * pattern site-wide.
 */
export function RegionHubFaq() {
  const t = useTranslations('regions.hub.faq');
  const items = t.raw('items') as HubFaqItem[];

  return (
    <Section id="faq">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={t('eyebrow')} title={t('title')} />
        </Reveal>
        <div className="mt-8 divide-y divide-line border-y border-line">
          {items.map((item, index) => (
            <details key={index} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg text-ink marker:content-none">
                <span>{item.q}</span>
                <span aria-hidden="true" className="shrink-0 text-gold transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-2xl leading-relaxed text-ink-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}
