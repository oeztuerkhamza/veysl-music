/**
 * Async, DB-backed resolver for everything in `src/content/site.ts` that the
 * owner can now edit himself from `/admin` (Payload global `site-settings`,
 * see `src/payload/globals/site-settings.ts`).
 *
 * `site.ts` is untouched and stays the typed defaults/fallback — this file
 * deep-merges the CMS override on top of it, **field by field**, so a blank
 * admin field (or an unreachable DB) never blanks out a working default; it
 * just falls back silently. Only the fields listed in the brief are
 * override-able (contact, address, social, serviceAreas, stats, season,
 * reviews, openingHours). Brand identity (`name`, `legalName`,
 * `previousNames`) and everything else in `site.ts` is intentionally NOT
 * override-able here — see BRAND-FACTS.md.
 *
 * Usage: only from Server Components/route handlers (`await getSite()`).
 * Never import this into a `'use client'` file — resolved values must be
 * passed down as props instead. `import 'server-only'` below turns any
 * accidental client import into a build-time error instead of a silent
 * "payload needs node:fs in the browser" chunking failure.
 */
import 'server-only';

import { unstable_cache } from 'next/cache';
import { getPayloadClient } from '@/lib/payload';
import { site, type Site } from './site';

export type Weekday = 'fri' | 'mon' | 'sat' | 'sun' | 'thu' | 'tue' | 'wed';

export interface OpeningHoursEntry {
  weekday: Weekday;
  opens: string | null;
  closes: string | null;
  closed: boolean;
  note: string;
}

export interface ResolvedSite {
  name: string;
  legalName: string | null;
  owner: string;
  previousNames: readonly string[];
  domain: string;
  url: string;
  tagline: Site['tagline'];
  city: string;
  district: string;
  region: string;
  country: string;
  serviceAreas: string[];
  reach: Site['reach'];
  contact: { email: string; phone: string; phoneHref: string; whatsapp: string };
  address: { street: string; postalCode: string; city: string };
  vatId: string;
  /** § 19 UStG. Entweder das oder `vatId` — die Impressum-Seite verlangt genau eines von beiden. */
  smallBusinessExempt: boolean;
  professionalInsurance: string;
  social: {
    instagram: string;
    instagramHandle: string;
    instagramLegacy: string;
    youtube: string;
    googleMaps: string;
    tiktok: string;
    spotify: string;
    soundcloud: string;
    mixcloud: string;
  };
  stats: { yearsExperience: number; eventsCompleted: number; hostingLanguages: string[]; instagramFollowers: number };
  capabilities: Site['capabilities'];
  partnersUnconfirmed: readonly string[];
  /** `isPublishable` is recomputed from the *merged* rating/count, never copied verbatim — see the guardrail in the global's admin description. */
  reviews: {
    googlePlaceId: string;
    rating: number;
    count: number;
    profileUrl: string;
    /** Owner's short review link — see the note in site.ts. Not CMS-editable; carried through so both paths agree. */
    writeReviewUrl: string;
    isPublishable: boolean;
  };
  season: { year: number };
  openingHours: OpeningHoursEntry[];
}

interface SiteSettingsDoc {
  contact?: { email?: null | string; phone?: null | string; phoneHref?: null | string; whatsapp?: null | string };
  address?: { street?: null | string; postalCode?: null | string; city?: null | string };
  legal?: { vatId?: null | string; smallBusinessExempt?: boolean | null; professionalInsurance?: null | string };
  social?: Record<string, null | string | undefined>;
  serviceAreas?: (null | string)[] | null;
  stats?: { yearsExperience?: null | number; eventsCompleted?: null | number; instagramFollowers?: null | number; hostingLanguages?: (null | string)[] | null };
  season?: { year?: null | number };
  reviews?: { googlePlaceId?: null | string; rating?: null | number; count?: null | number; profileUrl?: null | string };
  openingHours?:
    | {
        weekday?: null | string;
        opens?: null | string;
        closes?: null | string;
        closed?: boolean | null;
        note?: null | string;
      }[]
    | null;
}

/**
 * Zeitlimit für den CMS-Zugriff.
 *
 * Ein try/catch allein reicht hier nicht: Payload kann bei nicht migrierter
 * oder gesperrter Datenbank nicht *fehlschlagen*, sondern schlicht nie
 * zurückkehren — dann greift kein catch. Genau das hat den Production-Build
 * blockiert: `next build` prerendert ~190 Seiten, jede rief `getSite()` auf,
 * jede lief in Nextjs' 60-Sekunden-Timeout, der Build brach ab.
 *
 * Fünf Sekunden sind für eine lokale SQLite-Abfrage großzügig. Wird es
 * überschritten, gilt das CMS als nicht verfügbar und die statischen
 * Defaults aus `site.ts` gewinnen — dieselbe Degradierung wie bei einem Fehler.
 */
const CMS_TIMEOUT_MS = 5_000;

async function loadSiteSettings(): Promise<null | SiteSettingsDoc> {
  let timer: NodeJS.Timeout | undefined;

  try {
    const settings = await Promise.race([
      (async () => {
        const payload = await getPayloadClient();
        return (await payload.findGlobal({ slug: 'site-settings', depth: 0 })) as SiteSettingsDoc;
      })(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`CMS timeout after ${CMS_TIMEOUT_MS}ms`)), CMS_TIMEOUT_MS);
      }),
    ]);
    return settings;
  } catch (err) {
    // The public site must keep working off site.ts even if the CMS/DB is
    // unreachable, unmigrated, or simply slow — never block a page render.
    console.warn('[get-site] siteSettings unavailable — using static defaults:', err instanceof Error ? err.message : err);
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** 5 min: contact/opening-hours edits are not time-critical, and this keeps `getSite()` cheap to call from many Server Components. */
const getCachedSiteSettings = unstable_cache(loadSiteSettings, ['site-settings'], { revalidate: 300 });

function pickString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() !== '' ? value : fallback;
}

function pickNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/**
 * Anders als bei Strings ist `false` hier ein *gültiger* Wert, kein „leer":
 * ein abgewähltes Häkchen im Adminpanel muss den statischen Fallback
 * überschreiben können. Deshalb wird nur `undefined`/`null` durchgelassen.
 */
function pickBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function pickStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const cleaned = value.filter((v): v is string => typeof v === 'string' && v.trim() !== '');
  return cleaned.length > 0 ? cleaned : fallback;
}

const weekdays: readonly Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function mapOpeningHours(value: SiteSettingsDoc['openingHours']): OpeningHoursEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is NonNullable<typeof entry> & { weekday: string } => typeof entry?.weekday === 'string')
    .filter((entry) => (weekdays as readonly string[]).includes(entry.weekday))
    .map((entry) => ({
      weekday: entry.weekday as Weekday,
      opens: typeof entry.opens === 'string' && entry.opens !== '' ? entry.opens : null,
      closes: typeof entry.closes === 'string' && entry.closes !== '' ? entry.closes : null,
      closed: Boolean(entry.closed),
      note: typeof entry.note === 'string' ? entry.note : '',
    }));
}

/**
 * Resolve the effective site settings: CMS overrides merged over
 * `src/content/site.ts`. Safe to call from any Server Component; cached for
 * 5 minutes, and falls back to the static file entirely if the DB is down.
 */
export async function getSite(): Promise<ResolvedSite> {
  const base: ResolvedSite = {
    ...site,
    serviceAreas: [...site.serviceAreas],
    contact: { ...site.contact },
    address: { ...site.address },
    social: { ...site.social },
    stats: { ...site.stats, hostingLanguages: [...site.stats.hostingLanguages] },
    reviews: { ...site.reviews, isPublishable: site.reviews.isPublishable },
    season: { ...site.season },
    openingHours: [],
  };

  const overrides = await getCachedSiteSettings();
  if (!overrides) return base;

  const contact = overrides.contact ?? {};
  const address = overrides.address ?? {};
  const social = overrides.social ?? {};
  const stats = overrides.stats ?? {};
  const season = overrides.season ?? {};
  const reviews = overrides.reviews ?? {};
  const legal = overrides.legal ?? {};

  const mergedRating = pickNumber(reviews.rating, base.reviews.rating);
  const mergedCount = pickNumber(reviews.count, base.reviews.count);

  return {
    ...base,
    serviceAreas: pickStringArray(overrides.serviceAreas, base.serviceAreas),
    contact: {
      email: pickString(contact.email, base.contact.email),
      phone: pickString(contact.phone, base.contact.phone),
      phoneHref: pickString(contact.phoneHref, base.contact.phoneHref),
      whatsapp: pickString(contact.whatsapp, base.contact.whatsapp),
    },
    address: {
      street: pickString(address.street, base.address.street),
      postalCode: pickString(address.postalCode, base.address.postalCode),
      city: pickString(address.city, base.address.city),
    },
    // Rechtliche Pflichtangaben — im Adminpanel pflegbar, damit der Betreiber
    // Anschrift, USt-IdNr. und Versicherung ohne Deploy nachtragen kann.
    vatId: pickString(legal.vatId, base.vatId),
    smallBusinessExempt: pickBoolean(legal.smallBusinessExempt, base.smallBusinessExempt),
    professionalInsurance: pickString(legal.professionalInsurance, base.professionalInsurance),
    social: {
      instagram: pickString(social.instagram, base.social.instagram),
      instagramHandle: pickString(social.instagramHandle, base.social.instagramHandle),
      instagramLegacy: pickString(social.instagramLegacy, base.social.instagramLegacy),
      youtube: pickString(social.youtube, base.social.youtube),
      googleMaps: pickString(social.googleMaps, base.social.googleMaps),
      tiktok: pickString(social.tiktok, base.social.tiktok),
      spotify: pickString(social.spotify, base.social.spotify),
      soundcloud: pickString(social.soundcloud, base.social.soundcloud),
      mixcloud: pickString(social.mixcloud, base.social.mixcloud),
    },
    stats: {
      yearsExperience: pickNumber(stats.yearsExperience, base.stats.yearsExperience),
      eventsCompleted: pickNumber(stats.eventsCompleted, base.stats.eventsCompleted),
      instagramFollowers: pickNumber(stats.instagramFollowers, base.stats.instagramFollowers),
      hostingLanguages: pickStringArray(stats.hostingLanguages, base.stats.hostingLanguages),
    },
    season: { year: pickNumber(season.year, base.season.year) },
    reviews: {
      googlePlaceId: pickString(reviews.googlePlaceId, base.reviews.googlePlaceId),
      rating: mergedRating,
      count: mergedCount,
      profileUrl: pickString(reviews.profileUrl, base.reviews.profileUrl),
      // Always the static value: there is no CMS field for it, and rebuilding
      // this object field-by-field silently dropped it before — leaving the
      // CMS-resolved site with `undefined` where the static one had a link.
      writeReviewUrl: base.reviews.writeReviewUrl,
      isPublishable: mergedCount > 0 && mergedRating > 0,
    },
    openingHours: mapOpeningHours(overrides.openingHours),
  };
}
