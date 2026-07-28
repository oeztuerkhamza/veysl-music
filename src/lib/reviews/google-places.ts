import 'server-only';

import type { Locale } from '@/i18n/routing';
import { site } from '@/content/site';
import type { GoogleReview, GoogleReviewSummary } from './types';

/**
 * Google Places API (New) — live rating and review text for the business
 * profile, fetched server-side.
 *
 * WHY 24 HOURS, not longer and not shorter. The Places API terms allow a Place
 * ID to be stored indefinitely but cap caching of the *content* at 30 days, so
 * anything longer would breach them. Shorter costs money for nothing: reviews
 * on a wedding-DJ profile arrive weekly at best, and the Place Details call
 * that includes `reviews` sits in Google's more expensive SKU. One call a day
 * keeps this comfortably inside the free monthly allowance.
 *
 * Fails soft in every direction — missing key, missing place ID, HTTP error,
 * malformed payload all return `null`, and the section simply does not render.
 * A review widget is not worth a 500 on the homepage.
 */

const PLACES_ENDPOINT = 'https://places.googleapis.com/v1/places';
const REVALIDATE_SECONDS = 60 * 60 * 24;
const REQUEST_TIMEOUT_MS = 8_000;

/**
 * Only what we actually render. The Places API bills per requested field
 * group, so asking for more than this costs real money for data nobody sees.
 */
const FIELD_MASK = [
  'rating',
  'userRatingCount',
  'googleMapsUri',
  'reviews.name',
  'reviews.rating',
  'reviews.text',
  'reviews.originalText',
  'reviews.relativePublishTimeDescription',
  'reviews.publishTime',
  'reviews.authorAttribution',
].join(',');

interface RawAuthorAttribution {
  displayName?: string;
  uri?: string;
  photoUri?: string;
}

interface RawReview {
  name?: string;
  rating?: number;
  text?: { text?: string; languageCode?: string };
  originalText?: { text?: string; languageCode?: string };
  relativePublishTimeDescription?: string;
  publishTime?: string;
  authorAttribution?: RawAuthorAttribution;
  googleMapsUri?: string;
}

interface RawPlaceResponse {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: RawReview[];
  error?: { message?: string; status?: string };
}

/**
 * Google's own review-writing dialog for a place — one definition of the link
 * we ask couples to follow after a wedding.
 *
 * Prefers the short `g.page/r/…/review` link Google hands the owner inside the
 * Business Profile (`site.reviews.writeReviewUrl`), and derives the canonical
 * `search.google.com/local/writereview` form from the Place ID only when that
 * is not configured. Both open the same dialog — verified by following the
 * short link, which resolves to exactly this URL for this Place ID — but the
 * owner's one is short enough to send a couple over WhatsApp and is tagged by
 * Google as an owner-solicited review.
 */
export function writeReviewUrl(placeId: string): string {
  const configured = site.reviews.writeReviewUrl?.trim();
  if (configured) return configured;
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
}

function toReview(raw: RawReview): GoogleReview | null {
  const author = raw.authorAttribution?.displayName?.trim();
  if (!author) return null;
  if (typeof raw.rating !== 'number') return null;

  // `originalText` is what the reviewer actually wrote; `text` may be Google's
  // machine translation into the requested language. Prefer the original —
  // presenting a translation as someone's own words is putting words in their
  // mouth, and couples often recognise each other's reviews.
  const body = (raw.originalText?.text ?? raw.text?.text ?? '').trim();

  return {
    authorName: author,
    authorPhotoUrl: raw.authorAttribution?.photoUri ?? null,
    authorUrl: raw.authorAttribution?.uri ?? null,
    rating: raw.rating,
    text: body,
    relativeTime: raw.relativePublishTimeDescription?.trim() ?? '',
    publishedAt: raw.publishTime ?? null,
    googleUrl: raw.googleMapsUri ?? null,
  };
}

/**
 * @param locale drives Google's `languageCode`, which decides the language of
 *   `relativePublishTimeDescription` ("vor 2 Monaten" vs "2 ay önce").
 */
export async function fetchGoogleReviews(locale: Locale): Promise<GoogleReviewSummary | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  const placeId = site.reviews.googlePlaceId?.trim();

  // Not an error state: the site is designed to run without this, and does so
  // today. Silence rather than a warning, so logs stay readable.
  if (!apiKey || !placeId) return null;

  try {
    const response = await fetch(
      `${PLACES_ENDPOINT}/${encodeURIComponent(placeId)}?languageCode=${encodeURIComponent(locale)}`,
      {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': FIELD_MASK,
        },
        next: { revalidate: REVALIDATE_SECONDS },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      },
    );

    if (!response.ok) {
      // Never log the response body — it echoes the request, and the request
      // carries the API key.
      console.warn(`[reviews] Places API responded ${response.status}`);
      return null;
    }

    const body = (await response.json()) as RawPlaceResponse;
    if (body.error) {
      console.warn(`[reviews] Places API error: ${body.error.status ?? 'unknown'}`);
      return null;
    }
    if (typeof body.rating !== 'number' || typeof body.userRatingCount !== 'number') {
      return null;
    }

    const reviews = (body.reviews ?? [])
      .map(toReview)
      .filter((review): review is GoogleReview => review !== null);

    return {
      rating: body.rating,
      totalCount: body.userRatingCount,
      reviews,
      profileUrl: body.googleMapsUri ?? site.reviews.profileUrl,
      writeReviewUrl: writeReviewUrl(placeId),
    };
  } catch (error) {
    console.warn(
      `[reviews] Places API unreachable: ${error instanceof Error ? error.message : 'unknown'}`,
    );
    return null;
  }
}
