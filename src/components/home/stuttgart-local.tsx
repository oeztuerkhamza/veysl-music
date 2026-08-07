import { getLocale, getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { Link } from '@/i18n/navigation';
import { allCityEntries, resolveLocalized } from '@/content/cities';
import { TURKISH_DJ_SUPPORTED_LOCALES } from '@/content/turkish-dj';
import { BW_SUPPORTED_LOCALES } from '@/content/region-bw';
import type { Locale } from '@/i18n/routing';

/**
 * Stuttgart-Tiefe für die Startseite.
 *
 * Hintergrund (SEO-Audit August 2026): Die Startseite ist die designierte
 * Zielseite für „Hochzeits-DJ Stuttgart" — die Stadtseite `/hochzeits-dj/
 * stuttgart` ist absichtlich zurückgestellt (`priority: 3` in cities.ts,
 * 301 auf die Startseite), damit sie die Startseite nicht kannibalisiert.
 * Nur: Die fertig geschriebene Stuttgart-Prosa (Obertürkheim, Talkessel,
 * deutsch-türkische Community) lag damit UNGENUTZT in cities.ts, während die
 * Startseite selbst kaum zwei Sätze Stuttgart-Substanz trug.
 *
 * Diese Sektion holt genau diese Prosa auf die Seite, die dafür ranken soll.
 * Kein neuer Text, keine Duplikate — die Stadtseite, deren Text das ist, ist
 * nicht ausgespielt.
 *
 * Rendert nur, wenn die Prosa in der aktuellen Sprache existiert (de/en/tr) —
 * dieselbe „lieber kein Absatz als ein deutscher Absatz"-Regel wie überall.
 */
export async function StuttgartLocal() {
  const locale = (await getLocale()) as Locale;

  const stuttgart = allCityEntries.find((city) => city.slug === 'stuttgart');
  const intro = resolveLocalized(stuttgart?.intro, locale);
  const angle = resolveLocalized(stuttgart?.angle, locale);
  if (!intro || !angle) return null;

  const t = await getTranslations('home.stuttgart');
  const tNav = await getTranslations('nav');

  return (
    <Section>
      <Container size="narrow">
        <Reveal>
          <SectionHeading eyebrow={t('eyebrow')} title={t('title')} />
          <div className="mt-6 space-y-5 leading-relaxed text-ink-muted">
            <p>{intro}</p>
            <p>{angle}</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {TURKISH_DJ_SUPPORTED_LOCALES.includes(locale) ? (
              <Link
                href="/tuerkischer-dj-stuttgart"
                className="underline decoration-gold/50 underline-offset-4 text-ink-muted transition-colors hover:text-gold"
              >
                {tNav('turkishDj')}
              </Link>
            ) : null}
            {BW_SUPPORTED_LOCALES.includes(locale) ? (
              <Link
                href="/hochzeits-dj-baden-wuerttemberg"
                className="underline decoration-gold/50 underline-offset-4 text-ink-muted transition-colors hover:text-gold"
              >
                {tNav('badenWuerttemberg')}
              </Link>
            ) : null}
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
