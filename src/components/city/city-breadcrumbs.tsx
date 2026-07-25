import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { City } from '@/content/cities';

/**
 * Visible breadcrumb list (Home → Stadt). Deliberately just the `<ol>`, no
 * `<section>`/top padding of its own — rendered by `CityHero` *inside* its
 * own `<Section>`/`<Container>` so it shares the same clearance under the
 * fixed, transparent-over-hero header (`h-20`) as the rest of the hero.
 * A standalone top-of-page nav with only its own small padding would sit
 * underneath the fixed header instead.
 *
 * The matching `BreadcrumbList` JSON-LD is built separately in
 * `city-json-ld.ts` — kept in sync manually since it's only two items.
 */
export function CityBreadcrumbs({ city }: { city: City }) {
  const tNav = useTranslations('nav');

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-ink-faint">
        <li>
          <Link href="/" className="transition-colors hover:text-ink">
            {tNav('home')}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li aria-current="page" className="text-ink-muted">
          {city.name}
        </li>
      </ol>
    </nav>
  );
}
