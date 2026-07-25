import { getLocale, getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { Link } from '@/i18n/navigation';
import { site } from '@/content/site';
import { getAllCities, hasCityProse } from '@/content/cities';
import type { Locale } from '@/i18n/routing';

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink-muted">
      {children}
    </span>
  );
}

/**
 * Einzugsgebiet in drei Stufen — siehe site.ts.
 *
 * Die Staffelung ist eine SEO-Entscheidung: die Kernregion wird auf die
 * Städteseiten verlinkt und trägt die lokale Relevanz, Deutschland und Europa
 * zeigen die Reichweite. Bewusst getrennte Formulierungen: „regelmäßig
 * gebucht" nur für die Kernregion, sonst „buchbar".
 */
export async function ServiceAreas() {
  const t = await getTranslations('home.serviceAreas');
  const locale = (await getLocale()) as Locale;

  // Nur Städte mit eigener Landingpage in dieser Sprache werden verlinkt.
  const linkable = new Map(
    getAllCities()
      .filter((city) => hasCityProse(city, locale))
      .map((city) => [city.name, city.slug])
  );

  return (
    <Section id="einzugsgebiet">
      <Container>
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} lead={t('subtitle')} />

        <Reveal>
          <div className="mt-8 space-y-8">
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-gold">{t('coreTitle')}</h3>
              <ul className="mt-3 flex flex-wrap gap-3">
                {site.serviceAreas.map((city) => {
                  const slug = linkable.get(city);
                  return (
                    <li key={city}>
                      {slug ? (
                        <Link
                          href={{ pathname: '/hochzeits-dj/[stadt]', params: { stadt: slug } }}
                          className="inline-flex items-center rounded-full border border-gold/40 bg-surface px-4 py-2 text-sm text-ink transition-colors hover:border-gold hover:text-gold"
                        >
                          {city}
                        </Link>
                      ) : (
                        <Chip>{city}</Chip>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-gold">{t('germanyTitle')}</h3>
              <ul className="mt-3 flex flex-wrap gap-3">
                {site.germanyCities.map((city) => (
                  <li key={city}>
                    <Chip>{city}</Chip>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-gold">{t('europeTitle')}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{t('europeText')}</p>
              <ul className="mt-3 flex flex-wrap gap-3">
                {site.europeCountries.map((country) => (
                  <li key={country}>
                    <Chip>{country}</Chip>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
