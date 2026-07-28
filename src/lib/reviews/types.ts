/**
 * Google-sourced review data.
 *
 * Deliberately separate from `src/content/testimonials.ts`: those are
 * first-party quotes the couple gave us directly, and only those may ever feed
 * schema.org `aggregateRating`. Google's structured-data guidelines forbid
 * marking up ratings collected on another platform as your own — doing it is a
 * documented cause of manual actions. These are displayed with attribution and
 * a link back to Google, and nothing more.
 */

export interface GoogleReview {
  /** Reviewer's display name as Google returns it. Shown verbatim — never abbreviated or edited. */
  authorName: string;
  /** Reviewer's Google profile photo. Attribution is a Places API terms requirement, not decoration. */
  authorPhotoUrl: string | null;
  /** Link to the reviewer's Google profile, when Google supplies one. */
  authorUrl: string | null;
  rating: number;
  /** Review body. May be empty — a star-only rating is valid on Google. */
  text: string;
  /** Google's own localised "vor 2 Monaten" string, in the requested language. */
  relativeTime: string;
  /** ISO timestamp, for `<time dateTime>`. */
  publishedAt: string | null;
  /** Deep link to this review on Google. Required by the Places API terms. */
  googleUrl: string | null;
}

export interface GoogleReviewSummary {
  /** Average across all ratings, as Google computes it. */
  rating: number;
  /** Total number of ratings — including star-only ones with no text. */
  totalCount: number;
  /** Up to five reviews; the Places API does not return more. */
  reviews: GoogleReview[];
  /** Link to the full profile, so visitors can read past the five. */
  profileUrl: string;
  /** Link that opens Google's own "write a review" dialog for this place. */
  writeReviewUrl: string;
}
