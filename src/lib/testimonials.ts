import 'server-only';

import { readFromCms } from '@/lib/payload';

/**
 * First-party customer testimonials, read from the Payload `testimonials`
 * collection.
 *
 * This is the missing half of the review story. The collection has existed —
 * with a quote, an author, a venue, an event date, a 1–5 `rating` and a
 * draft/published workflow — but nothing on the public site ever read it: the
 * home page carried a hardcoded empty array and a TODO, so anything the
 * operator entered in the admin simply never appeared.
 *
 * Why it matters beyond showing quotes: these are the ONLY ratings that may
 * legally feed schema.org `aggregateRating`. Google's review-snippet
 * guidelines require a marked-up rating to come from the site's own users and
 * forbid carrying over another platform's aggregation, which is why the
 * Google profile's 5.0/31 is display-only (see the note on `site.reviews` and
 * docs/GOOGLE-BUSINESS-PROFILE.md §12). Every quote the operator collects
 * here is therefore worth more than a Google review in search results — it is
 * what can put stars next to the listing.
 *
 * Reads go through `readFromCms`, like every other CMS access in a render
 * path: an unmigrated or slow database must degrade to "no testimonials",
 * never hang a page.
 */

export interface PublishedTestimonial {
  id: string;
  quote: string;
  authorName: string;
  venue?: string;
  /** ISO date of the event the quote is about. */
  eventDate?: string;
  /** 1–5, optional — a couple may give a quote without a star rating. */
  rating?: number;
}

interface TestimonialDoc {
  id: string | number;
  quote?: string | null;
  authorName?: string | null;
  venue?: string | null;
  eventDate?: string | null;
  rating?: number | null;
}

function toTestimonial(doc: TestimonialDoc): PublishedTestimonial | null {
  const quote = doc.quote?.trim();
  const authorName = doc.authorName?.trim();
  // Both are `required: true` in the collection, but a row written before a
  // field existed can still arrive empty — drop it rather than render a quote
  // with no attribution, which would read as invented.
  if (!quote || !authorName) return null;

  const rating = typeof doc.rating === 'number' && doc.rating > 0 && doc.rating <= 5 ? doc.rating : undefined;

  return {
    id: String(doc.id),
    quote,
    authorName,
    venue: doc.venue?.trim() || undefined,
    eventDate: doc.eventDate ?? undefined,
    rating,
  };
}

/**
 * Published testimonials, newest event first. Drafts are excluded here as well
 * as by the collection's own access rule — belt and braces, because this runs
 * through the Local API, which bypasses access control by design.
 */
export async function getPublishedTestimonials(limit = 12): Promise<PublishedTestimonial[]> {
  return readFromCms(
    async (payload) => {
      const result = await payload.find({
        collection: 'testimonials',
        where: { status: { equals: 'published' } },
        sort: '-eventDate',
        limit,
        depth: 0,
      });
      return (result.docs as TestimonialDoc[]).map(toTestimonial).filter((t): t is PublishedTestimonial => t !== null);
    },
    [],
    'testimonials',
  );
}

export interface FirstPartyAggregate {
  /** Mean of the given ratings, rounded to one decimal — what schema.org expects. */
  rating: number;
  /** How many testimonials carried a rating. NOT the number of quotes. */
  count: number;
}

/**
 * Aggregates only the entries that actually carry a rating.
 *
 * Returns `null` below `MIN_RATINGS_FOR_AGGREGATE`. A single five-star quote
 * is a true statement and still a bad rich snippet: "5.0 from 1 review" reads
 * as thin at best and self-serving at worst, and Google's guidelines expect an
 * aggregate to represent something. Three is the smallest number that reads as
 * a body of opinion rather than a favour from a friend.
 */
const MIN_RATINGS_FOR_AGGREGATE = 3;

export function firstPartyAggregate(testimonials: PublishedTestimonial[]): FirstPartyAggregate | null {
  const ratings = testimonials
    .map((t) => t.rating)
    .filter((r): r is number => typeof r === 'number');

  if (ratings.length < MIN_RATINGS_FOR_AGGREGATE) return null;

  const mean = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  return { rating: Math.round(mean * 10) / 10, count: ratings.length };
}
