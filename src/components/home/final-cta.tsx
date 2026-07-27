import { getTranslations } from 'next-intl/server';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Section } from '@/components/ui/section';
import { Reveal } from '@/components/motion/reveal';
import { site } from '@/content/site';

/**
 * Closing ask, on the night ground.
 *
 * Replaces a full-bleed `from-gold-deep to-gold` gradient slab. That block had
 * two problems: it painted its own colours instead of using the theme, so in
 * the light palette it turned olive-brown; and a saturated gradient panel with
 * centred text is the most recognisable "generated landing page" ending there
 * is. The night ground ties it back to the music section instead, so the page
 * closes on the evening it is selling.
 */
export async function FinalCta() {
  const t = await getTranslations('home.finalCta');
  const tCta = await getTranslations('cta');

  const whatsappHref = `https://wa.me/${site.contact.whatsapp}`;

  return (
    <Section id="anfrage" tone="night" size="tall" className="overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_55%_60%_at_50%_0%,var(--color-glow),transparent_60%)]"
        aria-hidden="true"
      />

      <Container className="relative z-10">
        <Reveal y={20}>
          <div className="max-w-3xl">
            <Eyebrow>{t('eyebrow')}</Eyebrow>
            <h2 className="text-display-2 mt-5 font-medium text-ink">{t('title')}</h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">{t('subtitle')}</p>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Button href="/anfrage" variant="gold" size="lg">
                {tCta('primary')}
              </Button>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted underline-offset-4 transition-colors duration-300 hover:text-ink hover:underline"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                {tCta('whatsapp')}
              </a>
            </div>

            <p className="text-label mt-10 flex items-center gap-3 text-ink-faint">
              <span aria-hidden="true" className="h-px w-8 bg-gold/60" />
              {t('reassurance')}
            </p>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
