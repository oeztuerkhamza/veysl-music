import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { resolveLocalized, type PublishedRegion } from '@/content/regions';
import type { Locale } from '@/i18n/routing';

/**
 * Home → Destination Wedding Europa → {country}. Same pattern and the same
 * "no own <section>/padding" contract as `city-breadcrumbs.tsx` — rendered
 * inside `RegionHero`'s own `<Section>`/`<Container>` so it shares clearance
 * under the fixed, transparent-over-hero header.
 *
 * The matching `BreadcrumbList` JSON-LD is built separately in
 * `region-json-ld.ts` — kept in sync manually, same as the city cluster.
 */
export function RegionBreadcrumbs({ region, locale }: { region: PublishedRegion; locale: Locale }) {
  const tNav = useTranslations('nav');
  const tRegions = useTranslations('regions');
  const name = resolveLocalized(region.name, locale) ?? region.name.de;

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-ink-faint">
        <li>
          <Link href="/" className="transition-colors hover:text-ink">
            {tNav('home')}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link href="/hochzeits-dj-europa" className="transition-colors hover:text-ink">
            {tRegions('eyebrow')}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li aria-current="page" className="text-ink-muted">
          {name}
        </li>
      </ol>
    </nav>
  );
}
