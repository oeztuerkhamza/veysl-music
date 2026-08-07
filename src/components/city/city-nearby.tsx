import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { Link } from '@/i18n/navigation';
import { getNearbyCities, type City } from '@/content/cities';

/**
 * "Auch gebucht in …" — links this page to its nearest neighbours plus back
 * to the core service pages, so the city cluster reads as a real regional
 * network rather than a set of orphaned pages (brief's explicit ask).
 */
export function CityNearby({ city }: { city: City }) {
  const t = useTranslations('city');
  const tNav = useTranslations('nav');
  const nearby = getNearbyCities(city, 4);

  return (
    <Section>
      <Container>
        {nearby.length > 0 ? (
          <Reveal>
            <SectionHeading eyebrow={t('nearby.eyebrow')} title={t('nearby.title', { city: city.name })} />
            <div className="mt-8 flex flex-wrap gap-3">
              {nearby.map((n) => (
                <Link
                  key={n.slug}
                  href={{ pathname: '/hochzeits-dj/[stadt]', params: { stadt: n.slug } }}
                  className="rounded-full border border-line px-5 py-2 text-sm text-ink transition-colors hover:border-gold hover:text-gold"
                >
                  {t('hero.title', { city: n.name })}
                </Link>
              ))}
            </div>
          </Reveal>
        ) : null}

        <p className="mt-12 text-xs uppercase tracking-[0.2em] text-gold">{t('nearby.servicesTitle')}</p>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {/* Cluster-Elternseite zuerst: jede Stadtseite verweist eine Ebene
              hoch auf die BW-Landesseite (Stadtseiten und BW-Seite teilen
              dieselben Sprachen de/tr/en, kein Locale-Guard nötig). */}
          <Link href="/hochzeits-dj-baden-wuerttemberg" className="text-ink-muted transition-colors hover:text-ink">
            {tNav('badenWuerttemberg')}
          </Link>
          <Link href="/hochzeit-events" className="text-ink-muted transition-colors hover:text-ink">
            {tNav('services')}
          </Link>
          <Link href="/pakete" className="text-ink-muted transition-colors hover:text-ink">
            {tNav('packages')}
          </Link>
          <Link href="/ablauf" className="text-ink-muted transition-colors hover:text-ink">
            {tNav('process')}
          </Link>
        </div>
      </Container>
    </Section>
  );
}
