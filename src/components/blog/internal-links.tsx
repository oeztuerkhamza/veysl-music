import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import type { StaticPathname } from '@/lib/seo';
import { getAnswerById, isReligiousAnswer, resolveAnswerText } from '@/content/answers';
import { isIslamicLocale } from '@/content/islamic';
import { getCityBySlug } from '@/content/cities';
import { BLOG_ROUTE_LABEL_KEY } from './route-labels';

/**
 * Resolves `BlogPost.links` / `.relatedAnswers` / `.relatedCities` — the
 * structured internal-link data described in `src/content/blog/types.ts`'s
 * file header point 3 — into real, localized `<Link>`s. Never hardcodes an
 * href: `/pakete` becomes `/packages` in English and `/paketler` in Turkish
 * automatically via `@/i18n/navigation`'s `Link`.
 */

const pillClass = 'rounded-full border border-line px-4 py-2 text-sm text-ink-muted transition-colors hover:border-gold hover:text-gold';

function LinkPillSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-10 border-t border-line pt-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{title}</p>
      <div className="mt-4 flex flex-wrap gap-3">{children}</div>
    </div>
  );
}

export interface FurtherReadingLinksProps {
  links: StaticPathname[];
  locale: Locale;
  title: string;
}

/** `post.links` — static site pages (packages, process, booking, …) worth linking to from this article. */
export async function FurtherReadingLinks({ links, locale, title }: FurtherReadingLinksProps) {
  const resolved = links
    .map((href) => ({ href, labelKey: BLOG_ROUTE_LABEL_KEY[href] }))
    .filter((entry): entry is { href: StaticPathname; labelKey: string } => Boolean(entry.labelKey));
  if (resolved.length === 0) return null;

  const t = await getTranslations({ locale });

  return (
    <LinkPillSection title={title}>
      {resolved.map(({ href, labelKey }) => (
        <Link key={href} href={href} className={pillClass}>
          {t(labelKey)}
        </Link>
      ))}
    </LinkPillSection>
  );
}

export interface RelatedAnswerLinksProps {
  ids: string[] | undefined;
  locale: Locale;
  title: string;
}

/**
 * `post.relatedAnswers` — GEO corpus entries from `@/content/answers`,
 * deep-linked to their anchor on `/fragen`.
 *
 * The anchor has to exist for the link to be worth anything, and since the
 * religiously framed entries render only in tr/ku/ar (src/content/islamic.ts)
 * they are dropped everywhere else. Without this guard a German article
 * linking to `after-wedding-party` would point at `/fragen#after-wedding-party`
 * and land the reader at the top of a page that never mentions it.
 */
export function RelatedAnswerLinks({ ids, locale, title }: RelatedAnswerLinksProps) {
  if (!ids || ids.length === 0) return null;
  const answers = ids
    .map((id) => getAnswerById(id))
    .filter((answer): answer is NonNullable<ReturnType<typeof getAnswerById>> => Boolean(answer))
    .filter((answer) => isIslamicLocale(locale) || !isReligiousAnswer(answer));
  if (answers.length === 0) return null;

  return (
    <LinkPillSection title={title}>
      {answers.map((answer) => (
        <Link key={answer.id} href={{ pathname: '/fragen', hash: answer.id }} className={pillClass}>
          {resolveAnswerText(answer.q, locale)}
        </Link>
      ))}
    </LinkPillSection>
  );
}

export interface RelatedCityLinksProps {
  slugs: string[] | undefined;
  locale: Locale;
  title: string;
}

/** `post.relatedCities` — nearby-city landing pages, only linked where that city actually ships prose for `locale` (mirrors the same guard `src/app/sitemap.ts` applies). */
export async function RelatedCityLinks({ slugs, locale, title }: RelatedCityLinksProps) {
  if (!slugs || slugs.length === 0) return null;
  const cities = slugs
    .map((slug) => getCityBySlug(slug))
    .filter((city): city is NonNullable<typeof city> => city != null && city.locales.includes(locale));
  if (cities.length === 0) return null;

  const t = await getTranslations({ locale });

  return (
    <LinkPillSection title={title}>
      {cities.map((city) => (
        <Link key={city.slug} href={{ pathname: '/hochzeits-dj/[stadt]', params: { stadt: city.slug } }} className={pillClass}>
          {/* The city page's own H1 („Hochzeits-DJ in {city}") instead of the
              bare city name: the anchor should say what the target page is
              about, not only where it is — the same rule CityNearby follows. */}
          {t('city.hero.title', { city: city.name })}
        </Link>
      ))}
    </LinkPillSection>
  );
}
