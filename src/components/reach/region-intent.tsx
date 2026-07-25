import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { AnswerBlock } from '@/components/geo/answer-block';

interface IntentItem {
  q: string;
  a: string;
}

/**
 * The real Europe-wide opportunity per the brief: non-geographic INTENT
 * keywords ("türkischer Hochzeits-DJ deutschlandweit", "Hochzeits-DJ für
 * Destination Wedding", "DJ für türkische Hochzeit im Ausland" …) where being
 * based in Stuttgart is irrelevant — as opposed to local-pack queries, which
 * this route family deliberately does not chase (see docs/SEO-EUROPE-STRATEGY.md).
 *
 * Reuses `AnswerBlock` (`src/components/geo/answer-block.tsx`, owned by
 * another agent, read-only import) rather than an accordion: these are
 * exactly the kind of directly quotable Q&A pairs the GEO answer hub
 * (`/fragen`) already established the pattern for — question as a real
 * heading, answer immediately following in the server-rendered HTML, no
 * click-to-reveal. Read directly from messages via `t.raw()` so every answer
 * is present in the initial HTML, same as `process.faq` on `/ablauf`.
 */
export function RegionIntent() {
  const t = useTranslations('regions.hub.intent');
  const items = t.raw('items') as IntentItem[];

  return (
    <Section>
      <Container size="narrow">
        <Reveal>
          <SectionHeading eyebrow={t('eyebrow')} title={t('title')} />
        </Reveal>
        <div className="mt-2">
          {items.map((item, index) => (
            <AnswerBlock key={index} id={`intent-${index}`} question={item.q} answer={item.a} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
