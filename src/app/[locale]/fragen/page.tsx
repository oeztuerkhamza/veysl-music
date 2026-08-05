import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { PageHero } from '@/components/pages/page-hero';
import { FinalCta } from '@/components/pages/final-cta';
import { Reveal } from '@/components/motion/reveal';
import { EntityCard } from '@/components/geo/entity-card';
import { KeyFacts } from '@/components/geo/key-facts';
import { AnswerBlock } from '@/components/geo/answer-block';
import { Link } from '@/i18n/navigation';
import { type Locale } from '@/i18n/routing';
import { formatDate } from '@/lib/utils';
import { absoluteUrl, type StaticPathname } from '@/lib/seo';
import { isIslamicLocale } from '@/content/islamic';
import { breadcrumbSchema, faqPageSchema, localBusinessSchema, websiteSchema } from '@/lib/schema';
import {
  ANSWER_CATEGORIES,
  getVisibleAnswers,
  latestAnswerUpdate,
  resolveAnswerText,
} from '@/content/answers';
import { buildFragenMetadata, fragenUrl } from './metadata';
import { ROUTE_LABEL_KEY } from './route-labels';

interface FragenPageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: FragenPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildFragenMetadata(locale);
}

/**
 * The GEO answer hub — every question a real `<h2>`/`<h3>` heading,
 * immediately followed by its self-contained answer paragraph, all present
 * in the initial server-rendered HTML. No accordion, no click-to-reveal:
 * see `AnswerBlock` and docs/GEO-STRATEGY.md for why that single structural
 * choice matters more than anything else on this page.
 */
export default async function FragenPage({ params }: FragenPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  /**
   * `/islamische-hochzeit` gibt es nur in tr/ku/ar; in den übrigen fünf
   * Sprachen liefert die Seite `notFound()` und ihr Label fehlt in den
   * messages. Der Korpus verlinkt sie trotzdem — hier wird der Link für
   * jene Sprachen entfernt, statt ihn im Korpus wegzulassen und damit auch
   * den drei Sprachen zu nehmen, in denen er stimmt.
   *
   * Greift auch nach dem Sichtbarkeitsfilter unten noch: Die Antwort, die
   * diesen Link trägt, sitzt in `technik` und ist selbst religiös markiert —
   * aber ein späterer, nicht-religiöser Eintrag darf jederzeit dorthin
   * verlinken, ohne dass die deutsche Seite einen toten Link bekommt.
   */
  const reachableLinks = (links: readonly StaticPathname[] | undefined): StaticPathname[] =>
    (links ?? []).filter((href) => href !== '/islamische-hochzeit' || isIslamicLocale(locale));

  const t = await getTranslations('answers');
  // Root-level translator (no namespace) so this page can resolve labels that
  // already exist under "nav"/"footer" for the internal links attached to
  // each answer, instead of re-translating the same route names again here.
  const tRoot = await getTranslations();

  const updatedDate = formatDate(latestAnswerUpdate(), locale);

  /**
   * The corpus as *this* locale sees it. Outside tr/ku/ar the religiously
   * framed entries are not part of the site (src/content/islamic.ts), so they
   * are absent from the headings, from the category nav, from the answer
   * count in the hero and from the FAQPage schema alike — the `islamisch`
   * category drops out on its own, because the filter below removes any
   * category left with no items.
   */
  const visibleAnswers = getVisibleAnswers(locale);
  const categoriesWithItems = ANSWER_CATEGORIES.map((category) => ({
    category,
    items: visibleAnswers.filter((answer) => answer.category === category),
  })).filter((group) => group.items.length > 0);

  // Entity graph + FAQPage schema. Re-declares `websiteSchema`/`localBusinessSchema`
  // here (already present on `/`) because an AI crawler may land on `/fragen`
  // directly as the cited URL, never having fetched the home page — the
  // entity must resolve correctly from this page alone. This should be
  // `<JsonLd data={jsonLd} />` from `@/lib/schema.tsx`, but the bare
  // `@/lib/schema` specifier resolves only to the `.ts` builders (see the
  // home page's identical comment on that `.ts`/`.tsx` name collision), so
  // it's inlined here the same way.
  const jsonLd = JSON.stringify([
    websiteSchema(locale),
    localBusinessSchema(locale),
    breadcrumbSchema([
      { name: tRoot('nav.home'), url: absoluteUrl('/', locale) },
      { name: t('hero.title'), url: fragenUrl(locale) },
    ]),
    faqPageSchema(
      visibleAnswers.map((answer) => ({
        q: resolveAnswerText(answer.q, locale),
        a: resolveAnswerText(answer.a, locale),
      })),
    ),
  ]).replace(/</g, '\\u003c');

  return (
    <>
      {/* JSON-LD hat keinen anderen unterstützten Renderpfad. (`react/no-danger`
          ist in dieser Config nicht aktiv — ein eslint-disable wäre toter Code.) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle', { count: visibleAnswers.length })}
      />

      <Section>
        <Container size="narrow">
          <Reveal>
            <EntityCard />
            <div className="mt-6">
              <KeyFacts />
            </div>
          </Reveal>
          <p className="mt-6 text-sm text-ink-faint">{t('updated', { date: updatedDate })}</p>
          <p className="mt-2 text-sm text-ink-muted">
            {t('seeAlso')}{' '}
            <Link href="/ablauf" className="text-gold underline underline-offset-4 hover:text-gold-soft">
              {tRoot('nav.process')}
            </Link>
            .
          </p>

          <nav aria-label={t('hero.eyebrow')} className="mt-10 flex flex-wrap gap-3 border-y border-line py-6">
            {categoriesWithItems.map(({ category }) => (
              <a
                key={category}
                href={`#${category}`}
                className="rounded-full border border-line px-4 py-2 text-sm text-ink-muted transition-colors hover:border-gold hover:text-gold"
              >
                {t(`categories.${category}`)}
              </a>
            ))}
          </nav>
        </Container>
      </Section>

      {categoriesWithItems.map(({ category, items }) => (
        <Section key={category} id={category} className="scroll-mt-24">
          <Container size="narrow">
            <h2 className="font-display text-2xl text-ink sm:text-3xl">{t(`categories.${category}`)}</h2>
            <div className="mt-2">
              {items.map((item) => (
                <AnswerBlock
                  key={item.id}
                  id={item.id}
                  question={resolveAnswerText(item.q, locale)}
                  answer={resolveAnswerText(item.a, locale)}
                  facts={item.facts}
                  links={
                    reachableLinks(item.links).length > 0 ? (
                      <>
                        {reachableLinks(item.links).map((href) => {
                          const labelKey = ROUTE_LABEL_KEY[href];
                          if (!labelKey) return null;
                          return (
                            <Link
                              key={href}
                              href={href}
                              className="text-gold underline underline-offset-4 hover:text-gold-soft"
                            >
                              {tRoot(labelKey)}
                            </Link>
                          );
                        })}
                      </>
                    ) : undefined
                  }
                />
              ))}
            </div>
          </Container>
        </Section>
      ))}

      <FinalCta />

      <Container>
        <p className="pb-16 text-center text-xs text-ink-faint">
          {t('jsonFeedNote')}{' '}
          {/*
            Bewusst ein <a> und kein <Link>: /api/faq ist ein Route Handler,
            der JSON zurückgibt, keine Seite. Client-seitige Navigation dorthin
            würde der Router als Seitenwechsel behandeln und scheitern — der
            Link soll die Datei ausliefern. Die Regel erkennt nur den internen
            Pfad und kann Handler nicht von Seiten unterscheiden.
          */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/api/faq" className="underline underline-offset-4 hover:text-ink-muted">
            {t('jsonFeedLink')}
          </a>
        </p>
      </Container>
    </>
  );
}
