import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { getPostById, getPostSlug, resolveBlogLocale, type BlogPost } from '@/content/blog';

export interface GuideLinksProps {
  /** Ids from `src/content/blog` — in the order they should appear. */
  ids: readonly string[];
  locale: Locale;
}

/**
 * Contextual links from a money page to the guide articles that answer the
 * question a visitor has right before booking.
 *
 * Why this exists: the pages that carry the commercial intent (`/pakete`, the
 * Turkish-niche landing pages, `/islamische-hochzeit`) were reachable from
 * every guide, but almost no guide was reachable from them — an article like
 * „Was kostet ein Hochzeits-DJ?" had four inbound links in the whole site,
 * two of which were the menu. A link from the page that ranks (or should rank)
 * is the strongest internal signal a guide can get, and it hands the reader
 * the next piece of reassurance in the same click.
 *
 * Renders nothing in a locale where none of the posts has real content
 * (nl/fr/es/ku/ar today): a heading over an empty list, or a link to a page
 * that falls back to German, is worse than no section.
 */
export async function GuideLinks({ ids, locale }: GuideLinksProps) {
  const entries = ids
    .map((id) => getPostById(id))
    .filter((post): post is BlogPost => post !== undefined)
    .map((post) => ({ post, content: resolveBlogLocale(post, locale) }))
    .filter((entry): entry is { post: BlogPost; content: NonNullable<typeof entry.content> } => entry.content !== null);

  if (entries.length === 0) return null;

  const t = await getTranslations({ locale, namespace: 'blog.guideLinks' });

  return (
    <Section>
      <Container>
        <Reveal>
          <SectionHeading eyebrow={t('eyebrow')} title={t('title')} />
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map(({ post, content }) => (
              <li key={post.id}>
                <Link
                  href={{ pathname: '/ratgeber/[slug]', params: { slug: getPostSlug(post, locale) } }}
                  className="group flex h-full flex-col gap-2 rounded-lg border border-line bg-surface-2 p-5 transition-colors hover:border-gold"
                >
                  <span className="font-display text-lg leading-snug text-ink transition-colors group-hover:text-gold">
                    {content.title}
                  </span>
                  <span className="line-clamp-3 text-sm leading-relaxed text-ink-muted">{content.excerpt}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </Section>
  );
}

/**
 * Which guides belong on which page. One place, so the link map can be read
 * (and audited against docs/SEO-KEYWORD-MAP.md) without opening eight pages.
 * Each list is ≤ 3 on purpose — a wall of links dilutes the page it sits on.
 */
export const GUIDE_LINKS_BY_PAGE = {
  home: ['was-kostet-ein-hochzeits-dj', 'tuerkische-hochzeit-ablauf-musik-timing', 'hochzeitslocation-stuttgart-dj-perspektive'],
  packages: ['was-kostet-ein-hochzeits-dj', 'wann-hochzeits-dj-buchen', 'hochzeitsbudget-musik-anteil'],
  services: ['kina-gecesi-henna-abend-planen', 'nisan-verlobung-planen', 'dj-live-band-oder-beides'],
  process: ['wann-hochzeits-dj-buchen', 'hochzeits-timeline-musterablauf', 'dramaturgie-hochzeitsabend'],
  islamic: ['islamische-hochzeit-planen', 'deutsch-tuerkische-hochzeit-zwei-familien', 'tuerkische-hochzeit-als-gast'],
  turkishDj: ['tuerkische-hochzeit-ablauf-musik-timing', 'nisan-verlobung-planen', 'gelin-alma-brautabholung-musik'],
  turkishDjBw: ['deutsch-tuerkische-hochzeit-zwei-familien', 'laermschutz-sperrzeiten-baden-wuerttemberg', 'tuerkische-hochzeit-ablauf-musik-timing'],
  turkishDjDe: ['destination-wedding-dj-buchen', 'tuerkische-hochzeit-als-gast', 'was-kostet-ein-hochzeits-dj'],
  germanTurkish: ['deutsch-tuerkische-hochzeit-zwei-familien', 'hochzeits-timeline-musterablauf', 'musikwuensche-no-go-liste'],
  turkish: ['tuerkische-hochzeit-ablauf-musik-timing', 'gelin-alma-brautabholung-musik', 'davul-zurna-halay-roman-havasi'],
  kurdish: ['davul-zurna-halay-roman-havasi', 'kina-gecesi-henna-abend-planen', 'wann-hochzeits-dj-buchen'],
  bw: ['laermschutz-sperrzeiten-baden-wuerttemberg', 'hochzeitslocation-stuttgart-dj-perspektive', 'location-akustik-checkliste'],
} as const satisfies Record<string, readonly string[]>;
