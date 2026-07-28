import { getTranslations } from 'next-intl/server';
import { site } from '@/content/site';
import { cn } from '@/lib/utils';

interface EntityCardProps {
  className?: string;
}

/**
 * The single passage every page-owner should reach for when a crawler or an
 * AI answer engine needs to resolve "who/what/where/which languages" in one
 * self-contained paragraph — reusable beyond `/fragen`. Sourced from the
 * `answers.entity` message (see `messages/de.json`/`en.json`) so the exact
 * wording is translator-editable without touching this component.
 *
 * Only `site.name` ("DJ Veys") appears here — per the client's explicit
 * correction, this project has exactly one visible brand. `site.previousNames`
 * ("VeysTunesOfficial") is technical-continuity data only
 * (schema `alternateName`, redirects) and must never surface in this prose.
 */
export async function EntityCard({ className }: EntityCardProps) {
  const t = await getTranslations('answers');

  return (
    <div className={cn('rounded-lg border border-line bg-surface p-6 sm:p-8', className)}>
      <p className="max-w-3xl text-lg leading-relaxed text-ink">
        {t('entity', {
          owner: site.owner,
          city: site.city,
          years: site.stats.yearsExperience,
          events: site.stats.eventsCompleted,
        })}
      </p>
    </div>
  );
}
