import { defaultLocale, localeTags, type Locale } from '@/i18n/routing';
import { site } from '@/content/site';
import { absoluteAssetUrl, absoluteUrl } from './seo';

/**
 * JSON-LD builders for veysl.de. Every function returns a plain, typed object —
 * no `any` anywhere in this file. Pages render the result with `<JsonLd data={x} />`
 * imported from `@/lib/json-ld` (a separate file — `@/lib/schema` only resolves
 * to this `.ts` module, so the component can't live here).
 *
 * VEYSL is the one and only brand name in any human-visible output on this
 * site. `site.previousNames` ("DJ Veys", "VeysTunesOfficial") is machine-
 * readable continuity data ONLY — it feeds `alternateName`/`sameAs` here so
 * existing followers, Google reviews and search associations carry over to
 * the new domain, and nowhere else. Never print it as prose.
 *
 * Entity model (three cross-linked but distinct things, sharing one canonical
 * business @id so search engines/AI treat them as the same real-world entity):
 * - `organizationSchema()` / `localBusinessSchema()` — the bookable business
 *   "VEYSL", `@id` = `#business`.
 * - `musicGroupSchema()` — the performing act — DJ + live orchestra (horns),
 *   not a solo DJ — `@id` = `#act`, `member` → person.
 * - `personSchema()` — Veysel Durmuş, the human behind the brand, `@id` = `#person`.
 */

const BUSINESS_ID_FRAGMENT = '#business';
const ACT_ID_FRAGMENT = '#act';
const PERSON_ID_FRAGMENT = '#person';
const WEBSITE_ID_FRAGMENT = '#website';

function entityId(fragment: string): string {
  return `${absoluteUrl('/', defaultLocale)}${fragment}`;
}

function nonEmptyStrings(values: Array<string | undefined | null>): string[] {
  return values.filter((value): value is string => Boolean(value && value.length > 0));
}

/**
 * `sameAs` for the business/act entities: legacy domain + BOTH Instagram
 * accounts (the current `@dj_veys` — 63K followers, the actual recognition
 * anchor — and the legacy `@veystunesofficial`, which still carries the
 * Google review history) + YouTube + the Google Maps profile.
 */
function businessSameAs(): string[] {
  return nonEmptyStrings([
    site.legacyUrl,
    site.social.instagram,
    site.social.instagramLegacy,
    site.social.youtube,
    site.social.googleMaps,
    site.social.tiktok,
    site.social.spotify,
    site.social.soundcloud,
    site.social.mixcloud,
  ]);
}

/** `sameAs` for the person entity: personal/brand profiles only, not the Maps listing. */
function personSameAs(): string[] {
  return nonEmptyStrings([site.social.instagram, site.social.instagramLegacy, site.social.youtube]);
}

/**
 * Instagram follower count as a schema.org `InteractionCounter` — legitimate,
 * verifiable-right-now social proof (unlike the unverified Google review
 * count). Deliberately NOT folded into `aggregateRatingSchema()` — a follower
 * count is not a rating and must never be presented as one.
 */
export interface InteractionCounterSchema {
  '@type': 'InteractionCounter';
  interactionType: 'https://schema.org/FollowAction';
  userInteractionCount: number;
  target: string;
}

function instagramFollowerCounter(): InteractionCounterSchema | undefined {
  const followers = site.stats.instagramFollowers;
  if (!site.social.instagram || followers <= 0) return undefined;
  return {
    '@type': 'InteractionCounter',
    interactionType: 'https://schema.org/FollowAction',
    userInteractionCount: followers,
    target: site.social.instagram,
  };
}

/**
 * Short capability summary appended to the tagline for the business/act
 * entities — reflects the "DJ + live orchestra (with horns) + hosting + AV
 * rental, from one supplier" positioning confirmed in BRAND-FACTS.md, which is
 * materially stronger/more specific than "wedding DJ" alone. This copy is
 * SEO-agent-authored (not sourced from `messages/*.json`) and only de/en/tr
 * are filled in so far — falls back to the tagline alone for ku/fr/es until
 * someone translates these two sentences too. See SEO agent report.
 */
const CAPABILITY_SUMMARY: Partial<Record<Locale, string>> = {
  de: 'DJ & Live-Orchester (mit Bläsern), Moderation auf Deutsch, Türkisch und Englisch sowie Vermietung von Ton-, Licht- und Veranstaltungstechnik — alles aus einer Hand.',
  en: 'DJ and live orchestra (with horns), hosting in German, Turkish and English, plus sound/lighting/event-tech rental — all from one supplier.',
  tr: 'DJ ve canlı orkestra (nefesli çalgılarla), Almanca, Türkçe ve İngilizce sunuculuk, ayrıca ses-ışık-etkinlik teknolojisi kiralama — tek elden.',
};

function entityDescription(locale: Locale): string {
  const tagline = localizedTagline(locale);
  const summary = CAPABILITY_SUMMARY[locale];
  return summary ? `${tagline} — ${summary}` : tagline;
}

/** E.164-ish phone string derived from `contact.phoneHref` (falls back to the display format). */
function telephoneE164(): string | undefined {
  const raw = site.contact.phoneHref.replace(/^tel:/, '') || site.contact.phone;
  return raw || undefined;
}

/**
 * `site.tagline` now covers all six locales, so this is a safety net rather
 * than a real stopgap — falls back to German, then English, instead of
 * emitting `undefined` into structured data if a locale key is ever missing
 * (e.g. a future locale added to `routing.ts` before `site.ts` catches up).
 */
function localizedTagline(locale: Locale): string {
  const tagline = site.tagline as Partial<Record<Locale, string>>;
  return tagline[locale] ?? tagline[defaultLocale] ?? site.tagline.en ?? site.tagline.de;
}

const LANGUAGE_NAMES: Record<string, string> = { de: 'German', en: 'English', tr: 'Turkish' };

export interface PostalAddressSchema {
  '@type': 'PostalAddress';
  streetAddress?: string;
  postalCode?: string;
  addressLocality?: string;
  addressRegion?: string;
  addressCountry: string;
}

/**
 * Street and postal code are still TODO(kunde) in site.ts (required for a legally
 * complete Impressum, but unknown for now) — omitted entirely rather than
 * shipping an empty string. `addressLocality` uses the more specific
 * `site.address.city` ("Stuttgart-Obertürkheim"), not the coarser `site.city`.
 */
function businessAddress(): PostalAddressSchema {
  const { street, postalCode, city } = site.address;
  // `Boolean(...)` (not a bare truthiness check) deliberately widens the
  // `as const`-literal `''` types to plain `boolean` — otherwise TS statically
  // proves the `{...}` branch unreachable for the currently-empty fields and
  // rejects the spread ("Spread types may only be created from object types").
  return {
    '@type': 'PostalAddress',
    ...(Boolean(street) && { streetAddress: street }),
    ...(Boolean(postalCode) && { postalCode }),
    ...(Boolean(city) && { addressLocality: city }),
    addressRegion: site.region,
    addressCountry: site.country,
  };
}

export interface AreaServedCity {
  '@type': 'City';
  name: string;
}

function areaServedCities(): AreaServedCity[] {
  return site.serviceAreas.map((name) => ({ '@type': 'City', name }));
}

export interface ContactPointSchema {
  '@type': 'ContactPoint';
  contactType: string;
  telephone?: string;
  email?: string;
  availableLanguage: string[];
}

function contactPointSchema(): ContactPointSchema {
  return {
    '@type': 'ContactPoint',
    contactType: 'booking',
    telephone: telephoneE164(),
    email: site.contact.email || undefined,
    availableLanguage: site.stats.hostingLanguages.map((code) => LANGUAGE_NAMES[code] ?? code),
  };
}

export interface AggregateRatingSchema {
  '@type': 'AggregateRating';
  ratingValue: number;
  reviewCount: number;
  itemReviewed: { '@type': string; '@id': string; name: string };
}

/**
 * MUST return `null` unless `site.reviews.isPublishable` is true.
 *
 * The Google profile currently shows a verified 5.0 rating, but the review
 * COUNT is not verified (`site.reviews.count` is a `0` placeholder pending the
 * client). Emitting a rating without a real, matching review count is exactly
 * the kind of fabricated review data that risks a Google manual action — this
 * gate must stay strict even though the rating itself is known to be real.
 */
export function aggregateRatingSchema(): AggregateRatingSchema | null {
  if (!site.reviews.isPublishable) return null;
  return {
    '@type': 'AggregateRating',
    ratingValue: site.reviews.rating,
    reviewCount: site.reviews.count,
    // The Google profile these reviews live on is under a previous name (see
    // `site.previousNames`) — cross-reference the same business entity by @id
    // rather than duplicating a name here.
    itemReviewed: { '@type': 'LocalBusiness', '@id': entityId(BUSINESS_ID_FRAGMENT), name: site.name },
  };
}

export interface LocalBusinessSchema {
  '@context': 'https://schema.org';
  '@type': ['LocalBusiness', 'MusicGroup'];
  '@id': string;
  name: string;
  /** `site.previousNames` — continuity signal only, never printed as visible copy. */
  alternateName: string[];
  legalName?: string;
  description: string;
  url: string;
  telephone?: string;
  email?: string;
  address: PostalAddressSchema;
  areaServed: AreaServedCity[];
  contactPoint: ContactPointSchema;
  sameAs?: string[];
  founder: { '@id': string };
  aggregateRating?: AggregateRatingSchema;
}

/**
 * The DJ/event business as a bookable service. `@type` combines `LocalBusiness`
 * (bookable, has an address/areaServed) and `MusicGroup` (it IS the performing
 * act, not just a company that hires one) — both are valid simultaneously per
 * schema.org's multi-typing support. `priceRange` is deliberately omitted: no
 * package pricing is public yet, and an invented range would be worse than no
 * range at all.
 */
export function localBusinessSchema(locale: Locale = defaultLocale): LocalBusinessSchema {
  const sameAs = businessSameAs();
  const rating = aggregateRatingSchema();
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'MusicGroup'],
    '@id': entityId(BUSINESS_ID_FRAGMENT),
    name: site.name,
    alternateName: [...site.previousNames],
    legalName: site.legalName,
    description: entityDescription(locale),
    url: absoluteUrl('/', locale),
    telephone: telephoneE164(),
    email: site.contact.email || undefined,
    address: businessAddress(),
    areaServed: areaServedCities(),
    contactPoint: contactPointSchema(),
    ...(sameAs.length > 0 && { sameAs }),
    founder: { '@id': entityId(PERSON_ID_FRAGMENT) },
    ...(rating && { aggregateRating: rating }),
  };
}

export interface MusicGroupSchema {
  '@context': 'https://schema.org';
  '@type': 'MusicGroup';
  '@id': string;
  name: string;
  alternateName: string[];
  description: string;
  url: string;
  sameAs?: string[];
  member: { '@id': string };
  interactionStatistic?: InteractionCounterSchema;
}

/**
 * The performing act as its own portable identity (independent of address/
 * booking details) — put this on /musik and anywhere the artist, not the
 * business logistics, is the subject. `genre` is intentionally not set: it
 * isn't confirmed anywhere in site.ts / BRAND-FACTS.md. Carries the Instagram
 * follower count as an `InteractionCounter` — real, verifiable social proof,
 * distinct from (and not a substitute for) the still-unverified Google review
 * count used in `aggregateRatingSchema()`.
 */
export function musicGroupSchema(locale: Locale = defaultLocale): MusicGroupSchema {
  const sameAs = nonEmptyStrings([
    site.social.instagram,
    site.social.instagramLegacy,
    site.social.youtube,
    site.social.spotify,
    site.social.soundcloud,
    site.social.mixcloud,
    site.social.tiktok,
  ]);
  const followerCounter = instagramFollowerCounter();
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    '@id': entityId(ACT_ID_FRAGMENT),
    name: site.name,
    alternateName: [...site.previousNames],
    description: entityDescription(locale),
    url: absoluteUrl('/', locale),
    ...(sameAs.length > 0 && { sameAs }),
    member: { '@id': entityId(PERSON_ID_FRAGMENT) },
    ...(followerCounter && { interactionStatistic: followerCounter }),
  };
}

export interface PersonSchema {
  '@context': 'https://schema.org';
  '@type': 'Person';
  '@id': string;
  name: string;
  alternateName: string[];
  jobTitle: string;
  url: string;
  knowsLanguage: string[];
  sameAs?: string[];
  worksFor: { '@id': string };
}

/**
 * Veysel Durmuş — the confirmed real person behind the VEYSL brand. Use on
 * /epk (about/press-kit) where the human story (IT specialist by day,
 * musician since childhood, endurance athlete) is the differentiator.
 */
export function personSchema(locale: Locale = defaultLocale): PersonSchema {
  const sameAs = personSameAs();
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': entityId(PERSON_ID_FRAGMENT),
    name: site.owner,
    alternateName: [...site.previousNames],
    jobTitle: localizedTagline(locale),
    url: absoluteUrl('/', locale),
    knowsLanguage: [...site.stats.hostingLanguages],
    ...(sameAs.length > 0 && { sameAs }),
    worksFor: { '@id': entityId(BUSINESS_ID_FRAGMENT) },
  };
}

export interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  '@id': string;
  name: string;
  alternateName: string[];
  legalName?: string;
  url: string;
  logo?: string;
  sameAs?: string[];
}

/**
 * Deliberately reuses `#business` as its `@id` — this is the same real-world
 * entity as `localBusinessSchema()`, described with a leaner property set for
 * contexts (e.g. `websiteSchema().publisher`) that just need "who publishes
 * this site", not the full address/booking details.
 */
export function organizationSchema(locale: Locale = defaultLocale): OrganizationSchema {
  const sameAs = businessSameAs();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': entityId(BUSINESS_ID_FRAGMENT),
    name: site.name,
    alternateName: [...site.previousNames],
    legalName: site.legalName,
    url: absoluteUrl('/', locale),
    // TODO(kunde): point at a real brand logo once delivered — see SEO agent report.
    logo: absoluteAssetUrl('/logo.png'),
    ...(sameAs.length > 0 && { sameAs }),
  };
}

export interface WebSiteSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  '@id': string;
  name: string;
  url: string;
  description: string;
  /** BCP-47 tag (e.g. `de-DE`, `ku`) from `routing.localeTags` — not the bare locale code. */
  inLanguage: string;
  publisher: { '@id': string };
}

export function websiteSchema(locale: Locale = defaultLocale): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': entityId(WEBSITE_ID_FRAGMENT),
    name: site.name,
    url: absoluteUrl('/', locale),
    description: localizedTagline(locale),
    inLanguage: localeTags[locale],
    publisher: { '@id': entityId(BUSINESS_ID_FRAGMENT) },
  };
}

export interface ServiceInput {
  /** Cross-reference with `site.capabilities` when the item maps 1:1 to one. */
  id?: (typeof site.capabilities)[number];
  /** Already-translated service name (from the caller's `messages/*.json`). */
  name: string;
  /** Already-translated service description. */
  description: string;
  /** Absolute URL of the page/section describing this service, if it has one. */
  url?: string;
}

export interface ServiceSchema {
  '@context': 'https://schema.org';
  '@type': 'Service';
  serviceType: string;
  name: string;
  description: string;
  url?: string;
  provider: { '@id': string };
  areaServed: AreaServedCity[];
}

/**
 * Takes already-localized `{ name, description }` pairs (the DJ/musician/host/
 * AV-rental capabilities from `site.capabilities`, worded by whichever page
 * calls this — see the report for the exact shape). Never invents service copy.
 */
export function serviceSchema(items: ServiceInput[]): ServiceSchema[] {
  const areaServed = areaServedCities();
  const provider = { '@id': entityId(BUSINESS_ID_FRAGMENT) };
  return items.map((item) => ({
    '@context': 'https://schema.org' as const,
    '@type': 'Service' as const,
    serviceType: item.name,
    name: item.name,
    description: item.description,
    ...(item.url && { url: item.url }),
    provider,
    areaServed,
  }));
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqPageSchema {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: { '@type': 'Answer'; text: string };
  }>;
}

/**
 * Highest-leverage GEO asset on the site: feed this the 10 `process.faq`
 * entries directly (they already have the `{ q, a }` shape). AI answer engines
 * lift Q&A pairs from FAQPage schema near-verbatim.
 */
export function faqPageSchema(items: FaqItem[]): FaqPageSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface BreadcrumbListSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{ '@type': 'ListItem'; position: number; name: string; item: string }>;
}

/** `items` in traversal order, e.g. `[{ name: 'Start', url: absoluteUrl('/', locale) }, …]`. */
export function breadcrumbSchema(items: BreadcrumbItem[]): BreadcrumbListSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
