import 'server-only';

/**
 * Reads hand-picked posts from the admin panel (Payload). This is what lets
 * the client choose exactly which YouTube videos and Instagram posts show up
 * on the site, instead of an unmoderated live feed.
 *
 * This module owns the *contract* for the `curated-posts` collection — the
 * admin agent (owner of `src/payload/**`) implements the collection against
 * the field list documented in `docs/SOCIAL-FEED.md` §9. `CuratedPostDoc`
 * below is intentionally NOT typed against the generated `payload-types.ts`:
 * that file is regenerated as the collection evolves during active parallel
 * development, and this provider needs to keep degrading gracefully (empty
 * list, not a crash) even before the collection exists at all, and even if a
 * field gets renamed mid-build. `fetchPosts` never throws.
 *
 * `platform` is stored on the document (not just derived from `permalink`)
 * so this provider can filter/sort at the database level instead of
 * overfetching — but `permalink` remains the actual source of truth: if the
 * two ever disagree (e.g. a hand-edited row), the parsed value from
 * `permalink` wins and a warning is logged, since a hook is expected to keep
 * `platform` in sync automatically (see docs/SOCIAL-FEED.md §9).
 */
import type { Where } from 'payload';
import { readFromCms } from '@/lib/payload';
import { cacheRemoteImage } from './media-cache';
import { parseSocialPermalink } from './permalink';
import { youTubeThumbnailUrl } from './embed';
import type { SocialPlatform, SocialPost, SocialProvider, SocialProviderFetchOptions } from './types';

const COLLECTION_SLUG = 'curated-posts';
const DEFAULT_LOCALE = 'de';

/** Loose expected shape of a `curated-posts` document — see the module doc comment above for why this isn't the generated Payload type. */
interface CuratedPostDoc {
  id: string | number;
  permalink?: string | null;
  platform?: string | null;
  captionOverride?: string | null;
  thumbnail?: { url?: string | null } | string | null;
  featured?: boolean | null;
  sortOrder?: number | null;
  status?: string | null;
  placement?: string[] | null;
  createdAt?: string;
}

export class CmsProvider implements SocialProvider {
  /** Restrict to one platform (used by the per-platform fallback chains); omit for the combined feed. */
  constructor(private readonly platform?: SocialPlatform) {}

  async fetchPosts(limit: number, options?: SocialProviderFetchOptions): Promise<SocialPost[]> {
    const where: Where = { status: { equals: 'published' } };
    if (this.platform) where.platform = { equals: this.platform };
    if (options?.placement) where.placement = { contains: options.placement };

    // Zeitbegrenzt über `readFromCms`: die Feeds laufen im Render-Pfad, und ein
    // blockierendes Payload (nicht migrierte/gesperrte DB) würde sonst die
    // ganze Seite aufhalten statt nur den Feed. Leeres Ergebnis => nächster
    // Provider in der Kette, siehe provider.ts.
    return readFromCms(
      async (payload) => {
        const result = await payload.find({
          collection: COLLECTION_SLUG,
          where,
          limit,
          depth: 1, // resolve the `thumbnail` upload relation to its URL
          locale: options?.locale ?? DEFAULT_LOCALE,
          sort: ['-featured', 'sortOrder', '-createdAt'],
        });

        const docs = (result?.docs ?? []) as unknown as CuratedPostDoc[];
        const posts = await Promise.all(docs.map(toSocialPost));
        return posts.filter((post): post is SocialPost => post !== null);
      },
      [] as SocialPost[],
      'curated social posts'
    );
  }
}

async function toSocialPost(doc: CuratedPostDoc): Promise<SocialPost | null> {
  const parsed = parseSocialPermalink(doc.permalink);
  if (!parsed) {
    // A malformed permalink shouldn't be possible past `validateSocialPermalink`
    // on the field, but skip rather than render a dead card if it slips through.
    console.warn(`[social] curated post ${String(doc.id)} has an unparseable permalink, skipping`);
    return null;
  }
  if (doc.platform && doc.platform !== parsed.platform) {
    console.warn(`[social] curated post ${String(doc.id)} platform field ("${doc.platform}") disagrees with its permalink — using the permalink`);
  }

  const uploadedUrl = typeof doc.thumbnail === 'object' && doc.thumbnail ? (doc.thumbnail.url ?? null) : null;
  // Only YouTube has a thumbnail that's reliably derivable from just the id
  // (see embed.ts) — Instagram without an uploaded image gets no thumbnail
  // at all, by design. See docs/SOCIAL-FEED.md §9.
  const derivedRemote = !uploadedUrl && parsed.platform === 'youtube' ? youTubeThumbnailUrl(parsed.id) : null;
  const thumbnailUrl = uploadedUrl ?? (derivedRemote ? await cacheRemoteImage(derivedRemote) : null);

  return {
    id: `cms-${parsed.platform}-${doc.id}`,
    platform: parsed.platform,
    permalink: parsed.permalink,
    type: parsed.type,
    caption: doc.captionOverride?.trim() || null,
    thumbnailUrl,
    postedAt: doc.createdAt ?? new Date().toISOString(),
    featured: Boolean(doc.featured),
    sortOrder: doc.sortOrder ?? undefined,
  };
}
