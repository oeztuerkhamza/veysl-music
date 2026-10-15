import 'server-only';

import type { Locale } from '@/i18n/routing';
import { toSameOriginMediaPath } from '@/lib/media-url';
import { readFromCms } from '@/lib/payload';
import type { WeddingReference } from '@/lib/weddings';
import { normalizeVenueName, VENUE_SUPPORTED_LOCALES } from '@/content/venues';

/**
 * Veröffentlichte Locations für `/hochzeitslocation/<slug>`, gelesen aus der
 * Payload-Collection `venues`. Gleiches Muster wie `src/lib/weddings.ts`:
 * jeder Lesezugriff im Render-Pfad läuft durch `readFromCms`, ein
 * Datenbankproblem ergibt „keine Locations" statt eines abgebrochenen Builds.
 */

export interface VenueReference {
  id: string;
  slug: string;
  name: string;
  city: string;
  address?: string;
  website?: string;
  /** „DJ-Blick" als Markdown in der angefragten Sprache (Payload fällt auf Deutsch zurück). */
  note?: string;
  image?: { src: string; alt: string; width?: number; height?: number };
}

interface MediaDoc {
  url?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
}

interface VenueDoc {
  id: string | number;
  slug?: string | null;
  name?: string | null;
  city?: string | null;
  address?: string | null;
  website?: string | null;
  note?: string | null;
  image?: MediaDoc | string | number | null;
  permission?: boolean | null;
  status?: string | null;
}

function toVenue(doc: VenueDoc): VenueReference | null {
  const name = doc.name?.trim();
  const slug = doc.slug?.trim();
  const city = doc.city?.trim();
  // Zugriffsregel UND Einverständnis nochmals prüfen: Local-API-Aufrufe laufen
  // mit `overrideAccess: true`, und ohne `permission` darf die Location auf
  // keiner öffentlichen Seite stehen — auch nicht, wenn jemand den Status
  // direkt in der Datenbank gesetzt hat.
  if (!name || !slug || !city || doc.status !== 'published' || doc.permission !== true) return null;

  const image = doc.image && typeof doc.image === 'object' && doc.image.url ? doc.image : null;

  return {
    id: String(doc.id),
    slug,
    name,
    city,
    address: doc.address?.trim() || undefined,
    website: doc.website?.trim() || undefined,
    note: doc.note?.trim() || undefined,
    image: image
      ? {
          src: toSameOriginMediaPath(image.url as string),
          alt: typeof image.alt === 'string' ? image.alt : '',
          width: typeof image.width === 'number' ? image.width : undefined,
          height: typeof image.height === 'number' ? image.height : undefined,
        }
      : undefined,
  };
}

/** Alle veröffentlichten Locations, alphabetisch. */
export async function getPublishedVenues(locale: Locale, limit = 200): Promise<VenueReference[]> {
  return readFromCms(
    async (payload) => {
      const result = await payload.find({
        collection: 'venues',
        where: { and: [{ status: { equals: 'published' } }, { permission: { equals: true } }] },
        sort: 'name',
        limit,
        depth: 1,
        locale,
      });
      return (result.docs as unknown as VenueDoc[])
        .map(toVenue)
        .filter((venue): venue is VenueReference => venue !== null);
    },
    [],
    'venues'
  );
}

export async function getVenueBySlug(slug: string, locale: Locale): Promise<VenueReference | null> {
  const venues = await getPublishedVenues(locale);
  return venues.find((venue) => venue.slug === slug) ?? null;
}

/** `(locale, slug)`-Paare für `generateStaticParams` und die Sitemap — nur Sprachen, in denen es die Seite gibt. */
export async function getVenueParams(): Promise<Array<{ locale: Locale; slug: string }>> {
  const venues = await getPublishedVenues('de');
  return venues.flatMap((venue) => VENUE_SUPPORTED_LOCALES.map((locale) => ({ locale, slug: venue.slug })));
}

/** Veröffentlichte Hochzeiten, deren Freitext-Location diesem Namen entspricht. */
export function weddingsAtVenue(weddings: WeddingReference[], venue: Pick<VenueReference, 'name'>): WeddingReference[] {
  const wanted = normalizeVenueName(venue.name);
  return weddings.filter((wedding) => normalizeVenueName(wedding.venue) === wanted);
}

/** Die Location-Seite zu einem Hochzeits-Freitext, falls es sie gibt — für den Link auf der Hochzeits-Referenz. */
export function venueForWedding(venues: VenueReference[], wedding: Pick<WeddingReference, 'venue'>): VenueReference | undefined {
  const wanted = normalizeVenueName(wedding.venue);
  return wanted ? venues.find((venue) => normalizeVenueName(venue.name) === wanted) : undefined;
}

/**
 * Passt ein Freitext-Ortsname aus dem CMS zu einer Stadtseite?
 *
 * Exakt (ohne Groß-/Kleinschreibung und doppelte Leerzeichen) oder als Anfang
 * des amtlichen Namens: „Freiburg" im CMS gehört zu „Freiburg im Breisgau" auf
 * der Stadtseite. Ohne diese Toleranz verschwände eine Hochzeit still von der
 * Stadtseite, weil jemand den Ortsnamen kürzer getippt hat.
 */
export function cityMatches(cmsCity: string | null | undefined, cityName: string): boolean {
  const a = normalizeVenueName(cmsCity);
  const b = normalizeVenueName(cityName);
  return a !== '' && (a === b || b.startsWith(`${a} `));
}
