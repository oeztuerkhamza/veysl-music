/**
 * Server-side "download once, serve forever (ish)" cache for social-media
 * thumbnails. This is the mechanism that turns a Meta/Google CDN URL into a
 * same-origin one — the actual GDPR-relevant step described in
 * docs/SOCIAL-FEED.md: our server fetches the bytes, our server stores them,
 * the browser only ever requests `/api/social/media/<id>` on our own domain.
 *
 * Deliberately filesystem-based, not a new dependency: this is a small VM
 * deployment (see CLAUDE.md-equivalent context for this repo — SQLite +
 * self-hosted Payload), not serverless. `SOCIAL_MEDIA_CACHE_DIR` should point
 * at a persistent volume/bind mount in production so the cache survives
 * restarts, exactly like the Docker volume pattern this project already uses
 * elsewhere for uploads. If this project ever moves to a stateless/serverless
 * host, swap the two functions below for a blob-store client (Vercel Blob,
 * S3, R2) — everything upstream (providers, components, the media route)
 * only depends on this file's two exports, not on "disk" as a concept.
 */
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const CACHE_DIR = process.env.SOCIAL_MEDIA_CACHE_DIR
  ? path.resolve(process.env.SOCIAL_MEDIA_CACHE_DIR)
  : path.join(process.cwd(), '.cache', 'social-media');

/** Re-check the upstream URL at most this often; served bytes stay first-party either way. */
const MAX_AGE_MS = 12 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8000;

/** sha256 hex, truncated — matches the `id` the `/api/social/media/[id]` route accepts. */
const MEDIA_ID_PATTERN = /^[a-f0-9]{24}$/;

interface CacheMeta {
  contentType: string;
  sourceUrl: string;
  cachedAt: number;
}

let dirReady: Promise<void> | null = null;
function ensureCacheDir(): Promise<void> {
  dirReady ??= mkdir(CACHE_DIR, { recursive: true }).then(() => undefined);
  return dirReady;
}

function cacheKeyFor(sourceUrl: string): string {
  return createHash('sha256').update(sourceUrl).digest('hex').slice(0, 24);
}

function binPath(key: string): string {
  return path.join(CACHE_DIR, `${key}.bin`);
}

function metaPath(key: string): string {
  return path.join(CACHE_DIR, `${key}.json`);
}

function mediaUrl(key: string): string {
  return `/api/social/media/${key}`;
}

async function readMeta(key: string): Promise<CacheMeta | null> {
  try {
    return JSON.parse(await readFile(metaPath(key), 'utf8')) as CacheMeta;
  } catch {
    return null;
  }
}

/**
 * Downloads `sourceUrl` server-side and stores the bytes on disk, keyed by a
 * hash of the URL. Returns a first-party path the browser can request, or
 * `null` if nothing could be cached (missing URL, network failure, non-2xx
 * response, no prior cache to fall back to). Never throws — every provider
 * calls this and must be able to treat `null` as "render a placeholder",
 * never as a fatal error on a marketing page.
 */
export async function cacheRemoteImage(sourceUrl: string | null | undefined): Promise<string | null> {
  if (!sourceUrl) return null;
  const key = cacheKeyFor(sourceUrl);

  try {
    await ensureCacheDir();

    const existingMeta = await readMeta(key);
    if (existingMeta && Date.now() - existingMeta.cachedAt < MAX_AGE_MS && existsSync(binPath(key))) {
      return mediaUrl(key);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(sourceUrl, {
        signal: controller.signal,
        // A UA header avoids some CDNs (incl. Instagram's) serving a 403 to bare fetches.
        headers: { 'user-agent': 'Mozilla/5.0 (compatible; VEYSLBot/1.0; +https://veysl.de)' },
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      // A stale cached copy beats nothing — e.g. a signed Instagram media URL
      // that has since expired but whose bytes we already stored.
      return existingMeta && existsSync(binPath(key)) ? mediaUrl(key) : null;
    }

    const contentType = response.headers.get('content-type') ?? 'image/jpeg';
    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(binPath(key), buffer);
    const meta: CacheMeta = { contentType, sourceUrl, cachedAt: Date.now() };
    await writeFile(metaPath(key), JSON.stringify(meta));
    return mediaUrl(key);
  } catch (err) {
    console.warn('[social] media cache miss', err instanceof Error ? err.message : err);
    return existsSync(binPath(key)) ? mediaUrl(key) : null;
  }
}

/** Used by `src/app/api/social/media/[id]/route.ts` to stream back cached bytes. */
export async function readCachedMedia(id: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  if (!MEDIA_ID_PATTERN.test(id)) return null;
  try {
    const meta = await readMeta(id);
    if (!meta) return null;
    const buffer = await readFile(binPath(id));
    return { buffer, contentType: meta.contentType };
  } catch {
    return null;
  }
}
