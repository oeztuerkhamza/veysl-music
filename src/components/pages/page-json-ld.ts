import {
  breadcrumbSchema,
  faqPageSchema,
  localBusinessSchema,
  musicGroupSchema,
  organizationSchema,
  personSchema,
  serviceSchema,
  type FaqItem,
  type ServiceInput,
} from '@/lib/schema';
import { absoluteUrl } from '@/lib/seo';
import type { Locale } from '@/i18n/routing';

/**
 * JSON-LD for the four plain content pages that carried none.
 *
 * The city, blog and region clusters each already have a `*-json-ld.ts` of
 * this shape; the core pages never got one, so `/ablauf`, `/musik`, `/epk`
 * and `/pakete` shipped zero structured data. Two of the builders they need
 * had in fact been written and documented in `@/lib/schema` for exactly these
 * pages — `musicGroupSchema()` ("put this on /musik") and `personSchema()`
 * ("Use on /epk") — and were never called from anywhere. This file is where
 * they finally get used.
 *
 * Every page's graph re-states the business/act/person entity rather than
 * assuming the crawler has seen the home page. An answer engine cites a
 * single URL and fetches only that URL, so an entity that only resolves from
 * `/` resolves nowhere useful. The `@id` fragments in `@/lib/schema`
 * (`#business` / `#act` / `#person`) are what stop the repetition from
 * reading as three different businesses.
 *
 * Nothing here invents copy: every name/description is either already
 * translated in `messages/*.json` (passed in by the page) or comes from the
 * shared builders, which are themselves fed by `src/content/site.ts`.
 */

/**
 * The `@/lib/schema` interfaces use literal `'@type'` unions and have no index
 * signature, so TS won't assign them to `Record<string, unknown>` without a
 * cast — the runtime shape is exactly what `<JsonLd>` expects. Same helper,
 * same reason, as `buildCityJsonLd()`.
 */
const asRecord = (value: object): Record<string, unknown> => value as Record<string, unknown>;

interface PageJsonLdBase {
  locale: Locale;
  /** Already-translated label for the home breadcrumb (`nav.home`). */
  homeLabel: string;
  /** Already-translated label for this page (its `nav.*` key). */
  pageLabel: string;
}

function trail(locale: Locale, homeLabel: string, pageLabel: string, pageUrl: string) {
  return breadcrumbSchema([
    { name: homeLabel, url: absoluteUrl('/', locale) },
    { name: pageLabel, url: pageUrl },
  ]);
}

/**
 * `/ablauf` — the 10 `process.faq` entries as `FAQPage`.
 *
 * This is the single highest-value addition of the four. `faqPageSchema()`'s
 * own doc comment names this page ("feed this the 10 `process.faq` entries
 * directly") because answer engines lift Q&A pairs from FAQPage markup close
 * to verbatim, and the page already renders all ten answers into the
 * server HTML for precisely that reason (see the comment above `rawFaq` in
 * the page). Only the machine-readable half was missing.
 *
 * The answers render inside an accordion, which is fine here and is NOT the
 * pattern `/fragen` deliberately avoids: the text is in the initial HTML
 * either way — `/fragen` drops the accordion because it is the citation
 * target, this page is the human walkthrough.
 */
export function buildProcessJsonLd({
  locale,
  homeLabel,
  pageLabel,
  faqItems,
}: PageJsonLdBase & { faqItems: FaqItem[] }): Record<string, unknown>[] {
  const pageUrl = absoluteUrl('/ablauf', locale);
  const graph: Record<string, unknown>[] = [
    asRecord(localBusinessSchema(locale)),
    asRecord(trail(locale, homeLabel, pageLabel, pageUrl)),
  ];
  if (faqItems.length > 0) graph.push(asRecord(faqPageSchema(faqItems)));
  return graph;
}

/**
 * `/musik` — the performing act, not the booking logistics.
 *
 * `musicGroupSchema()` carries the Instagram follower count as an
 * `InteractionCounter`: real, verifiable social proof, and deliberately not
 * an `aggregateRating` (a follower count is not a rating). The unverified
 * Google review count stays gated inside `localBusinessSchema()` as before —
 * nothing here opens that gate.
 */
export function buildMusicJsonLd({ locale, homeLabel, pageLabel }: PageJsonLdBase): Record<string, unknown>[] {
  const pageUrl = absoluteUrl('/musik', locale);
  return [asRecord(musicGroupSchema(locale)), asRecord(trail(locale, homeLabel, pageLabel, pageUrl))];
}

/**
 * `/epk` — Veysel Durmuş as a `Person`, plus the lean `Organization` so the
 * `worksFor: { '@id': '#business' }` reference on the person actually
 * resolves on this page instead of dangling at an `@id` defined only on `/`.
 */
export function buildEpkJsonLd({ locale, homeLabel, pageLabel }: PageJsonLdBase): Record<string, unknown>[] {
  const pageUrl = absoluteUrl('/epk', locale);
  return [
    asRecord(personSchema(locale)),
    asRecord(organizationSchema(locale)),
    asRecord(trail(locale, homeLabel, pageLabel, pageUrl)),
  ];
}

/**
 * `/pakete` — one `Service` per package.
 *
 * No `Offer` and no `price`: `src/content/packages.ts` has `priceFrom: null`
 * on all three ("Preis auf Anfrage") until the client supplies real figures.
 * An `Offer` without a price is invalid structured data, and an invented one
 * is worse — so the packages are described as services and priced nowhere,
 * matching what the page itself says. When real prices land, this is where
 * an `offers` property belongs.
 */
export function buildPackagesJsonLd({
  locale,
  homeLabel,
  pageLabel,
  services,
}: PageJsonLdBase & { services: ServiceInput[] }): Record<string, unknown>[] {
  const pageUrl = absoluteUrl('/pakete', locale);
  return [
    asRecord(localBusinessSchema(locale)),
    ...serviceSchema(services).map(asRecord),
    asRecord(trail(locale, homeLabel, pageLabel, pageUrl)),
  ];
}
