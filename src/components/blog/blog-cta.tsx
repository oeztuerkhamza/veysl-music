import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';

/**
 * The conversion block every article ends on — "no page is a dead end" per
 * `.claude/CONTRACT.md`. Same visual shape as `src/components/pages/final-cta.tsx`
 * (owned by the pages agent) but with article-specific copy (`blog.post.cta.*`)
 * and its own component, per this task's explicit `<BlogCta>` deliverable —
 * reuses the shared `cta.primary` button label so the call-to-action wording
 * stays consistent site-wide.
 */
export async function BlogCta() {
  const t = await getTranslations('blog.post.cta');
  const tCta = await getTranslations('cta');

  return (
    <Section id="ratgeber-cta">
      <Container>
        <Reveal>
          <div className="flex flex-col items-start gap-4 rounded-lg border border-line bg-surface p-8 sm:p-10">
            <Eyebrow>{t('eyebrow')}</Eyebrow>
            <h2 className="font-display text-[clamp(1.75rem,3vw,2.75rem)] leading-tight text-ink">{t('title')}</h2>
            <p className="max-w-xl text-ink-muted">{t('subtitle')}</p>
            <Button href="/anfrage" variant="gold" size="lg">
              {tCta('primary')}
            </Button>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
