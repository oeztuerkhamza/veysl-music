import { getTranslations } from 'next-intl/server';
import { site } from '@/content/site';
import { cn } from '@/lib/utils';

interface KeyFactsProps {
  className?: string;
}

/**
 * Compact, scannable fact list — years, events, hosting languages, service
 * area and capabilities, built straight from `site.stats`/`site.capabilities`
 * (never hand-typed numbers). Facts presented as a plain `<dl>` list are
 * disproportionately easy for answer engines to lift compared to the same
 * numbers buried in prose, which is the entire reason this exists as its
 * own component rather than just more sentences in `<EntityCard>`.
 *
 * Deliberately owns its OWN `answers.keyFacts.*` / `answers.capabilities.*`
 * labels rather than reusing `home.stats.*` or
 * `services.capabilitiesStrip.items.*` — this component is meant to be
 * dropped onto other pages too, and shouldn't silently change if a
 * home-page-specific string is reworded elsewhere. Note for whoever owns
 * `services.capabilitiesStrip`: that namespace is currently missing an
 * `orchestra` entry even though `site.capabilities` includes it — see the
 * GEO agent's report.
 */
export async function KeyFacts({ className }: KeyFactsProps) {
  const t = await getTranslations('answers');

  const rows: { label: string; value: string }[] = [
    { label: t('keyFacts.years'), value: `${site.stats.yearsExperience}+` },
    { label: t('keyFacts.events'), value: `${site.stats.eventsCompleted}+` },
    {
      label: t('keyFacts.languages'),
      value: site.stats.hostingLanguages.map((lang) => lang.toUpperCase()).join(' · '),
    },
    { label: t('keyFacts.serviceArea'), value: site.serviceAreas.join(' · ') },
    {
      label: t('keyFacts.capabilitiesLabel'),
      value: site.capabilities.map((id) => t(`capabilities.${id}`)).join(' · '),
    },
  ];

  return (
    <dl className={cn('divide-y divide-line rounded-lg border border-line bg-surface', className)}>
      {rows.map((row) => (
        <div key={row.label} className="flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-baseline sm:gap-4 sm:py-3">
          <dt className="shrink-0 text-xs uppercase tracking-[0.12em] text-ink-faint sm:w-48">{row.label}</dt>
          <dd className="text-sm font-medium text-ink">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
