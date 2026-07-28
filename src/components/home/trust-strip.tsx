import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Reveal } from '@/components/motion/reveal';

const KEYS = ['planning', 'tech', 'contract', 'multilingual'] as const;

/**
 * Two-column editorial list, not a four-card grid.
 *
 * The icon cards this replaces were the strongest "generated template" signal
 * on the page: four equal boxes, four lucide glyphs, four identical paragraphs.
 * The same four promises now read as a numbered list with hairline rules, and
 * the heading holds the left column and stays put while the list scrolls past
 * it — that stillness against movement is what makes the block feel edited.
 *
 * `home.trust` has no eyebrow key (unlike the other preview sections), so this
 * hand-rolls its own heading instead of going through `<SectionHeading>`.
 */
export async function TrustStrip() {
  const t = await getTranslations('home.trust');

  return (
    <Section id="vertrauen">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* `hyphens-auto` + `break-words` are load-bearing, not defensive.
              This heading sits in a 4-of-12 column at display size, and the
              translations contain single unbreakable words far longer than
              German's: Turkish "Güvenebileceğiniz" is 17 characters and
              overflowed the column straight across the list beside it. The
              `lang` attribute is set per locale on <html>, so `hyphens: auto`
              breaks each language by its own rules; `break-words` is the
              backstop for locales the browser has no hyphenation dictionary
              for. */}
          <div className="lg:col-span-4">
            <h2 className="text-display-2 hyphens-auto break-words font-medium text-ink lg:sticky lg:top-32">
              {t('title')}
            </h2>
          </div>

          <ul className="lg:col-span-8">
            {KEYS.map((key, index) => (
              <Reveal key={key} as="li" y={18} className="block border-t border-line last:border-b">
                <div className="grid gap-x-8 gap-y-3 py-8 sm:grid-cols-[auto_1fr] sm:py-10">
                  <span className="text-label pt-2 text-clay tabular-nums" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-display-3 text-ink">{t(`items.${key}.title`)}</h3>
                    <p className="mt-3 max-w-xl leading-relaxed text-ink-muted">
                      {t(`items.${key}.text`)}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
