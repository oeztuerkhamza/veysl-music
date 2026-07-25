import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { buildConfig } from 'payload';
import sharp from 'sharp';

import { BlockedDates } from './src/payload/collections/blocked-dates';
import { BlogPosts } from './src/payload/collections/blog-posts';
import { Bookings } from './src/payload/collections/bookings';
import { ContactMessages } from './src/payload/collections/contact-messages';
import { CuratedPosts } from './src/payload/collections/curated-posts';
import { Enquiries } from './src/payload/collections/enquiries';
import { Media } from './src/payload/collections/media';
import { SiteImageSlots } from './src/payload/collections/site-image-slots';
import { Testimonials } from './src/payload/collections/testimonials';
import { Users } from './src/payload/collections/users';
import { WhatsappLeads } from './src/payload/collections/whatsapp-leads';
import { SiteSettings } from './src/payload/globals/site-settings';
import { migrations } from './src/migrations';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/**
 * Admin panel + CMS for veysl.de. See the top of the repo's `.env.example`
 * for the env vars this reads, and the final report for the full
 * architecture rationale (Payload 3 vs. a hand-rolled admin) and
 * compatibility evidence with Next.js 16 / React 19.2.
 *
 * --- Swapping SQLite for Postgres in production -----------------------------
 * Every collection/global here is plain Payload config with no SQLite-
 * specific field types (dates and IDs are stored as validated text on
 * purpose — see `src/payload/utils/iso-date.ts` — precisely so this works
 * unchanged against Postgres). To go to Postgres:
 *   1. `npm install @payloadcms/db-postgres`
 *   2. replace the `sqliteAdapter(...)` call below with
 *      `postgresAdapter({ pool: { connectionString: process.env.DATABASE_URI } })`
 *   3. set `DATABASE_URI` to a `postgres://…` connection string
 *   4. regenerate migrations against the new adapter (see below) and deploy
 * No collection/global/field needs to change.
 *
 * --- Why this file is `.mts`, not `.ts` -------------------------------------
 * `@payloadcms/db-sqlite`'s `connect()` only auto-creates tables when
 * `NODE_ENV !== 'production'` (`pushDevSchema`) — in production it instead
 * runs `prodMigrations` (wired below) on every boot, and does **nothing** if
 * that's unset. Without it, a fresh production database has zero tables and
 * every write (`/api/anfrage`, `/api/kontakt`, `/api/whatsapp-lead`) 500s
 * forever — this is exactly the bug this migration setup fixes.
 *
 * Generating those migrations requires the standalone `payload` CLI
 * (`payload migrate:create`), which loads this file directly with Node's own
 * module resolution (via `tsx`), not through Next's bundler. That import
 * chain hit a real, reproducible wall: `@payloadcms/richtext-lexical` is
 * pure ESM with a top-level `await` somewhere in its dependency graph, and
 * `require()`-ing an ESM module containing top-level await is impossible on
 * *any* Node version (verified on both v22.23.1 and v24.15 locally — this
 * is not the Node-24-specific issue it first looked like). `tsx` was
 * transpiling this file to CommonJS `require()` calls because the project
 * `package.json` has no `"type": "module"`, which is what triggered it.
 *
 * Fix, verified working end-to-end (CLI loads, migration generates, `next
 * build`/`next start` still work — Next's own bundler doesn't care about
 * any of this, only the standalone CLI does):
 *   1. This file is `.mts` — an explicit, unambiguous ESM extension `tsx`
 *      always honours regardless of `package.json`, so the whole config
 *      loads as real ESM and every dependency (including richtext-lexical)
 *      is `import()`-ed, never `require()`-d.
 *   2. `src/payload/package.json` (`{ "type": "module" }`) scopes the same
 *      ESM treatment to the collection/hook/access/util files this config
 *      imports, so their own extension-less relative imports
 *      (`from '../access/is-admin'`) resolve under `tsx`'s ESM loader
 *      instead of Node's plain CJS resolver, which can't find them.
 *   3. Because `payload.config.mts` isn't one of the two filenames Payload's
 *      own CLI auto-searches for (`payload.config.js`/`.ts` only — see
 *      `payload/dist/config/find.js`), every CLI invocation needs
 *      `PAYLOAD_CONFIG_PATH=payload.config.mts` set (see `.env.example`,
 *      `deploy/deploy.sh`). The running Next.js app itself does **not** need
 *      this — `@payload-config` there resolves via the `tsconfig.json` path
 *      alias at build time, unrelated to the CLI's runtime file search.
 *
 * --- Regenerating migrations after a schema change --------------------------
 *   PAYLOAD_CONFIG_PATH=payload.config.mts DATABASE_URI="file:./scratch.db" \
 *     npx payload migrate:create <name>
 * against a throwaway empty SQLite file (not the real dev DB — this
 * generates a full CREATE-from-empty migration reflecting the config, so a
 * dirty starting DB produces a wrong diff), then delete the scratch file and
 * commit the new file under `src/migrations/`.
 */
export default buildConfig({
  serverURL: process.env.PAYLOAD_SERVER_URL || 'http://localhost:3000',
  secret: process.env.PAYLOAD_SECRET || '',
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '— VEYSL Admin',
    },
  },
  editor: lexicalEditor(),
  collections: [
    Users,
    Media,
    SiteImageSlots,
    BlockedDates,
    Bookings,
    Enquiries,
    ContactMessages,
    WhatsappLeads,
    CuratedPosts,
    BlogPosts,
    Testimonials,
  ],
  globals: [SiteSettings],
  localization: {
    locales: ['de', 'en', 'tr', 'ku', 'nl', 'fr', 'es'],
    defaultLocale: 'de',
    fallback: true,
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || `file:${path.resolve(dirname, 'veysl-cms.db')}`,
    },
    // Production: `connect()` runs these on every boot (idempotent — Payload
    // tracks applied migrations in `payload_migrations`), so even if the
    // explicit `deploy/deploy.sh` migration step is ever skipped, the app
    // still self-heals its schema instead of 500ing on every write forever.
    // Dev/local: irrelevant — `pushDevSchema` handles schema sync instead
    // (see the comment above), `prodMigrations` is only consulted when
    // `NODE_ENV === 'production'`. Regenerate via the command documented
    // above whenever a collection/global/field changes.
    prodMigrations: migrations,
  }),
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
});
