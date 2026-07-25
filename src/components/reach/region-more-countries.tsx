import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { Link } from '@/i18n/navigation';
import { site } from '@/content/site';
import { getAllRegions } from '@/content/regions';

/**
 * The rest of `site.europeCountries` — countries that ARE bookable
 * (site-wide "buchbar" tier) but do not (yet) have a dedicated page. Reads
 * `site.europeCountries` live rather than a hardcoded list, so removing a
 * country there (e.g. the UK, already removed) automatically drops it here
 * too, with no second edit required. Country names render in German
 * regardless of page locale — same established behaviour as
 * `home/service-areas.tsx`'s `site.serviceAreas`/`site.germanyCities`/
 * `site.europeCountries` chips, since `site.ts`'s reach lists have no
 * per-locale variants. Each chip links to `/anfrage`, never to a page that
 * doesn't exist — no dead links, no implied local presence.
 */
export function RegionMoreCountries() {
  const t = useTranslations('regions.hub.more');
  const dedicated = new Set(getAllRegions().map((r) => r.name.de));
  const remaining = site.europeCountries.filter((country) => !dedicated.has(country));

  if (remaining.length === 0) return null;

  return (
    <Section>
      <Container>
        <Reveal>
          <SectionHeading eyebrow={t('eyebrow')} title={t('title')} lead={t('text')} />
          <ul className="mt-8 flex flex-wrap gap-3">
            {remaining.map((country) => (
              <li key={country}>
                <Link
                  href="/anfrage"
                  className="inline-flex items-center rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink-muted transition-colors hover:border-gold hover:text-gold"
                >
                  {t('cta', { country })}
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </Section>
  );
}
