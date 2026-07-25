import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';

interface FinalCtaProps {
  /** Smaller variant for utility pages (legal) where a hard sales push is out of place. */
  compact?: boolean;
}

/**
 * The conversion block every page ends on — "no page is a dead end" per the
 * build contract. Self-contained (fetches its own translations) so every
 * page can just render `<FinalCta />` without wiring copy by hand.
 */
export async function FinalCta({ compact = false }: FinalCtaProps) {
  const t = await getTranslations('cta');

  return (
    <Section id="anfrage-cta">
      <Container>
        <Reveal>
          <div className="flex flex-col items-start gap-4 rounded-lg border border-line bg-surface p-8 sm:p-10">
            <Eyebrow>{t('short')}</Eyebrow>
            <h2 className="font-display text-[clamp(1.75rem,3vw,2.75rem)] leading-tight text-ink">
              {t('finalTitle')}
            </h2>
            {!compact ? <p className="max-w-xl text-ink-muted">{t('finalSubtitle')}</p> : null}
            <Button href="/anfrage" variant="gold" size={compact ? 'md' : 'lg'}>
              {t('primary')}
            </Button>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
