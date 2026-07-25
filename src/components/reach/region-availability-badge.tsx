import { useTranslations } from 'next-intl';
import { BadgeCheck, Plane } from 'lucide-react';
import { resolveLocalized, type PublishedRegion } from '@/content/regions';
import type { Locale } from '@/i18n/routing';

/**
 * The single most important honesty control on this entire route family.
 * `region.verified` is `true` for exactly one entry (Österreich/Wien) — see
 * `.claude/BRAND-FACTS.md` and the doc comment at the top of
 * `src/content/regions.ts`. Every other country renders the "available to
 * book" badge, never a track-record claim. Do not add a variant that blurs
 * this distinction.
 */
export function RegionAvailabilityBadge({ region, locale }: { region: PublishedRegion; locale: Locale }) {
  const t = useTranslations('regions.country.availability');
  const countryName = resolveLocalized(region.name, locale) ?? region.name.de;

  if (region.verified && region.verifiedCity) {
    return (
      <div className="inline-flex items-center gap-3 rounded-full border border-gold/40 bg-surface px-5 py-2.5">
        <BadgeCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-gold" />
        <span className="text-sm text-ink">
          <span className="font-medium text-gold">{t('verifiedTitle')}</span>
          {' — '}
          {t('verifiedText', { city: region.verifiedCity })}
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-line bg-surface px-5 py-2.5">
      <Plane aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-faint" />
      <span className="text-sm text-ink-muted">
        <span className="font-medium text-ink">{t('availableTitle', { country: countryName })}</span>
        {' — '}
        {t('availableText', { country: countryName })}
      </span>
    </div>
  );
}
