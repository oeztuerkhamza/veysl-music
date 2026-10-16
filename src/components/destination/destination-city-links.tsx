import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { isDestinationLocale, type DestinationCity } from '@/content/destination-cities';

interface DestinationCityLinksProps {
  cities: readonly DestinationCity[];
  locale: Locale;
}

/**
 * Links von den Überblicksseiten (Deutschland, Europa-Hub, Länderseiten) auf
 * die Zielstadt-Seiten `/tuerkischer-dj/[stadt]`. Ohne diese Links hingen die
 * Stadtseiten nur an der Sitemap — der schwächste Weg, eine Seite zu finden.
 *
 * Rendert nichts, wenn die Sprache die Seitenfamilie nicht hat (nur de/tr/en)
 * oder es keine Städte gibt: eine Überschrift über einer leeren Liste wäre
 * schlechter als kein Abschnitt.
 */
export async function DestinationCityLinks({ cities, locale }: DestinationCityLinksProps) {
  if (!isDestinationLocale(locale) || cities.length === 0) return null;

  const t = await getTranslations({ locale, namespace: 'destination.list' });

  return (
    <Section>
      <Container>
        <Reveal>
          <SectionHeading eyebrow={t('eyebrow')} title={t('title')} />
          <ul className="mt-8 flex flex-wrap gap-3">
            {cities.map((city) => (
              <li key={city.slug}>
                <Link
                  href={{ pathname: '/tuerkischer-dj/[stadt]', params: { stadt: city.slug } }}
                  className="inline-flex items-center rounded-full border border-gold/40 bg-surface px-4 py-2 text-sm text-ink transition-colors hover:border-gold hover:text-gold"
                >
                  {t('link', { city: city.name[locale] })}
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </Section>
  );
}
