#!/usr/bin/env node
/**
 * `payload migrate:create`, with the one workaround it needs on this project.
 *
 * The conflict, in full, because it has already been "fixed" once in each
 * direction and will be again by anyone who only sees half of it:
 *
 *   - `src/migrations/` must contain `package.json` with `{"type":"module"}`.
 *     Without it, Node resolves the migration `.ts` files as CommonJS, the
 *     namespace imports in `src/migrations/index.ts` come back without their
 *     `up`/`down` bindings, and `payload migrate` dies with
 *     `migration.up is not a function` — the deploy aborts at the migration
 *     step, every time.
 *
 *   - `payload migrate:create` reads *every* `*.json` in that same directory
 *     as a schema snapshot. It therefore reads `package.json` as one, fails
 *     Zod validation ("version should be 6", "dialect"/"tables" undefined),
 *     and refuses to generate anything.
 *
 * So the marker has to be present to RUN migrations and absent to CREATE
 * them. Removing it (as commit 90b9dc9 did) fixes creation and breaks every
 * deploy; adding it back fixes deploys and breaks creation. This script holds
 * both by moving the file aside for the duration of the generate step only.
 *
 * The restore runs in `finally`, so an interrupted or failed generation
 * cannot leave the repository in the state where production deploys break.
 *
 * Usage:  npm run payload:migrate:create -- <migration-name>
 */
import { spawnSync } from 'node:child_process';
import { existsSync, renameSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const marker = path.join(root, 'src', 'migrations', 'package.json');
const stashed = path.join(root, 'src', 'migrations', '.package.json.stash');

const hadMarker = existsSync(marker);
if (hadMarker) renameSync(marker, stashed);

try {
  const result = spawnSync(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['payload', 'migrate:create', ...process.argv.slice(2)],
    {
      cwd: root,
      stdio: 'inherit',
      env: { ...process.env, PAYLOAD_CONFIG_PATH: 'payload.config.mts' },
    }
  );
  process.exitCode = result.status ?? 1;
} finally {
  if (hadMarker && existsSync(stashed)) renameSync(stashed, marker);
}
