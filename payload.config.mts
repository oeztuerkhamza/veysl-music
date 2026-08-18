import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { buildConfig } from 'payload';
import { de } from 'payload/i18n/de';
import { tr } from 'payload/i18n/tr';
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
import { WeddingClips } from './src/payload/collections/wedding-clips';
import { WeddingSubmissions } from './src/payload/collections/wedding-submissions';
import { Weddings } from './src/payload/collections/weddings';
import { WhatsappLeads } from './src/payload/collections/whatsapp-leads';
import { SiteSettings } from './src/payload/globals/site-settings';
import { migrations } from './src/migrations';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/**
 * Admin panel + CMS for dj-veys.de. See the top of the repo's `.env.example`
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
 *   DATABASE_URI="file:./scratch.db" npm run payload:migrate:create -- <name>
 *
 * Use the npm script, **not** `npx payload migrate:create` directly. There is
 * a genuine conflict between running migrations and generating them, and the
 * script is what holds both ends:
 *
 *   - `src/migrations/package.json` (`{"type":"module"}`) must exist, or Node
 *     resolves the migration `.ts` files as CommonJS, `src/migrations/index.ts`
 *     gets namespaces without their `up`/`down` bindings, and `payload
 *     migrate` fails with `migration.up is not a function` — aborting every
 *     deploy at the migration step.
 *   - `migrate:create` reads every `*.json` in that directory as a schema
 *     snapshot, `package.json` included, and refuses to generate anything
 *     because it does not validate as one.
 *
 * The marker must be present to run and absent to generate. Removing it fixes
 * generation and breaks deploys; restoring it fixes deploys and breaks
 * generation — both have already happened here. `scripts/payload-migrate-
 * create.mjs` moves it aside for the generate step and restores it in a
 * `finally`, so an interrupted run cannot leave deploys broken.
 *
 * Run it against a throwaway empty SQLite file (not the real dev DB — a dirty
 * starting DB produces a wrong diff), then delete the scratch file and commit
 * the new file under `src/migrations/`.
 */
export default buildConfig({
  serverURL: process.env.PAYLOAD_SERVER_URL || 'http://localhost:3000',
  secret: process.env.PAYLOAD_SECRET || '',
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '— DJ Veys Admin',
    },
  },
  /**
   * Admin-UI-Sprachen: Deutsch und Türkisch, Deutsch als Rückfallebene.
   *
   * Ohne diesen Block nimmt Payload *alle* mitgelieferten Sprachen und `en`
   * als `fallbackLanguage`, und wählt dann pro Request: Cookie `payload-lng`
   * → `Accept-Language` → Fallback (siehe
   * `payload/dist/utilities/getRequestLanguage.js`). Ein Browser mit
   * englischem `Accept-Language` bekam dadurch eine englische Oberfläche
   * ("Create New", "No Results.") mit deutschen Labels darin
   * ("Create new Medium").
   *
   * Die Liste hier ist deshalb bewusst kurz — aber sie ist eine
   * Betreiberentscheidung, keine technische: der Betreiber arbeitet auf
   * Deutsch und Türkisch, also stehen genau diese beiden im Umschalter unter
   * „Payload-Einstellungen → Sprache". Wer eine weitere braucht, ergänzt sie
   * hier (`import { en } from 'payload/i18n/en'`) und übersetzt die Labels in
   * `src/payload/**` mit.
   *
   * `fallbackLanguage` muss ein Key aus `supportedLanguages` bleiben, sonst
   * ersetzt Payload ihn kommentarlos durch den ersten Key. Ein Altbestands-
   * Cookie mit einer nicht mehr geführten Sprache fällt automatisch hierauf
   * zurück — die Umstellung ist also selbstheilend.
   *
   * Damit „türkisch" nicht nur die Rahmen-Oberfläche meint, sind die
   * Collection-Labels und Beschreibungen in `src/payload/**` als
   * `{ de, tr }`-Objekte getextet (Payloads `StaticLabel` erlaubt
   * `Record<string, string>`); sonst stünden türkische Menüs um deutsche
   * Einträge herum.
   */
  i18n: {
    supportedLanguages: { de, tr },
    fallbackLanguage: 'de',
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
    Weddings,
    WeddingClips,
    WeddingSubmissions,
  ],
  globals: [SiteSettings],
  /**
   * Inhaltssprachen — die acht Sprachen der Website (src/i18n/routing.ts).
   *
   * Mit benannten Locales statt bloßer Codes. Vorher stand im Sprachumschalter
   * des Adminpanels wörtlich `de`, `en`, `tr`, `ku`, `nl`, `fr`, `es` — wer
   * einen Text auf Kurmancî pflegen wollte, musste wissen, dass das `ku` ist,
   * und `nl` von `de` auseinanderhalten. Die Labels sind selbst zweisprachig
   * (`Record<string, string>`, aufgelöst über die Admin-UI-Sprache), also
   * heißt Türkisch im deutschen Panel „Türkisch" und im türkischen „Türkçe".
   *
   * Reihenfolge wie in `src/i18n/routing.ts`: Deutsch als Hauptmarkt zuerst,
   * dann Türkisch als bestätigte Kernzielgruppe, dann der Rest. Der
   * Umschalter zeigt sie in genau dieser Reihenfolge.
   */
  localization: {
    locales: [
      { code: 'de', label: { de: 'Deutsch', tr: 'Almanca' } },
      { code: 'tr', label: { de: 'Türkisch', tr: 'Türkçe' } },
      { code: 'ku', label: { de: 'Kurdisch (Kurmancî)', tr: 'Kürtçe (Kurmancî)' } },
      { code: 'ar', label: { de: 'Arabisch', tr: 'Arapça' } },
      { code: 'en', label: { de: 'Englisch', tr: 'İngilizce' } },
      { code: 'nl', label: { de: 'Niederländisch', tr: 'Felemenkçe' } },
      { code: 'fr', label: { de: 'Französisch', tr: 'Fransızca' } },
      { code: 'es', label: { de: 'Spanisch', tr: 'İspanyolca' } },
    ],
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
