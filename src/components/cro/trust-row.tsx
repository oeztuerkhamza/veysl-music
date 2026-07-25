import type { ComponentType } from 'react';
import { getTranslations } from 'next-intl/server';
import { Award, Languages, PartyPopper } from 'lucide-react';
import { InstagramIcon } from '@/components/ui/social-icons';
import { site } from '@/content/site';
import { cn } from '@/lib/utils';

type TrustFact = 'followers' | 'years' | 'events' | 'languages';
type FactIcon = ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;

interface TrustRowProps {
  className?: string;
  /** Which facts to show, in order. Defaults to all four — pass a shorter list for a tight space (e.g. beside a form's submit button). */
  items?: TrustFact[];
}

const DEFAULT_ITEMS: TrustFact[] = ['followers', 'years', 'events', 'languages'];

/**
 * Compact, verified-only trust-proximity strip — for placing directly beside
 * a CTA/submit action. Distinct from the homepage's full-width `<StatsBand>`
 * (`src/components/home/stats-band.tsx`, owned by the home agent): this is
 * meant for pages/asides that don't already have a stats section of their
 * own — `/pakete`, the `/anfrage` sidebar, city pages, package cards.
 *
 * Every number reads from `site.stats` (the static module, matching
 * `<StatsBand>`'s own convention — not the CMS-resolved `getSite()`, so this
 * behaves identically to the homepage band it's meant to complement). The
 * Google rating is deliberately excluded: `site.reviews.isPublishable` is
 * `false` until the client supplies a verified review count — see
 * `.claude/BRAND-FACTS.md`. Nothing here is invented.
 */
export async function TrustRow({ className, items = DEFAULT_ITEMS }: TrustRowProps) {
  const t = await getTranslations('cro.trust');

  const facts: Record<TrustFact, { icon: FactIcon; label: string }> = {
    followers: {
      icon: InstagramIcon,
      label: t('followers', { count: new Intl.NumberFormat('de-DE').format(site.stats.instagramFollowers) }),
    },
    years: { icon: Award, label: t('years', { count: site.stats.yearsExperience }) },
    events: { icon: PartyPopper, label: t('events', { count: site.stats.eventsCompleted }) },
    languages: { icon: Languages, label: t('languages', { count: site.stats.hostingLanguages.length }) },
  };

  return (
    <ul className={cn('flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-muted', className)}>
      {items.map((key) => {
        const { icon: Icon, label } = facts[key];
        return (
          <li key={key} className="inline-flex items-center gap-1.5">
            <Icon className="size-3.5 shrink-0 text-gold" aria-hidden="true" />
            {label}
          </li>
        );
      })}
    </ul>
  );
}
