import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { resolveLocalized, type City } from '@/content/cities';
import type { Locale } from '@/i18n/routing';

const HOSTING_LANGS = ['de', 'tr', 'en'] as const;

/**
 * The bicultural angle — the genuine competitive advantage per the brief.
 * Renders nothing if `turkishCommunity` is false or if no `angle` prose
 * exists for the active locale (never a German fallback paragraph).
 */
export function CityBicultural({ city, locale }: { city: City; locale: Locale }) {
  const t = useTranslations('city');
  const tLang = useTranslations('booking.hostingLanguages');

  if (!city.turkishCommunity) return null;
  const angle = resolveLocalized(city.angle, locale);
  if (!angle) return null;

  return (
    <Section>
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={t('bicultural.eyebrow')}
            title={t('bicultural.title', { city: city.name })}
            lead={angle}
          />
          <div className="mt-8">
            <p className="text-xs uppercase tracking-[0.2em] text-gold">{t('bicultural.languagesTitle')}</p>
            <ul className="mt-3 flex flex-wrap gap-3">
              {HOSTING_LANGS.map((code) => (
                <li key={code} className="rounded-full border border-line px-4 py-1.5 text-sm text-ink-muted">
                  {tLang(code)}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
