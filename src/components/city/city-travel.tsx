import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { resolveLocalized, type City } from '@/content/cities';
import type { Locale } from '@/i18n/routing';

export function CityTravel({ city, locale }: { city: City; locale: Locale }) {
  const t = useTranslations('city');

  // Prefer the city's own authored travel note (unique prose) over the
  // shared generic sentence — falls back to the shared line only when a
  // non-included city hasn't been given a custom note yet.
  const customNote = resolveLocalized(city.travel.note, locale);
  const sharedLine = city.travel.included
    ? t('distance.included', { city: city.name, km: city.distanceKm })
    : t('distance.notIncluded', { city: city.name, km: city.distanceKm });
  const body = city.distanceKm === 0 ? t('distance.homeBase') : (customNote ?? sharedLine);

  return (
    <Section>
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={t('travel.eyebrow')}
            title={t('travel.title', { city: city.name })}
            lead={body}
          />
          {city.population ? (
            <p className="mt-3 max-w-2xl text-base text-ink-faint">
              {t('distance.population', { count: city.population })}
            </p>
          ) : null}
        </Reveal>
      </Container>
    </Section>
  );
}
