# Deployment runbook — dj-veys.de

Single netcup VPS, Debian 13 (trixie) minimal, Docker Compose (app + nginx +
certbot), SQLite on a persistent volume. No separate database container —
see "Why SQLite" below for the reasoning.

Every command below uses placeholders (`<SERVER_IP>`, `<SSH_USER>`, …). Fill
in your own values when running them.

For this deployment they are:

| Placeholder | Value |
|---|---|
| `<SERVER_IP>` | `159.195.216.142` (netcup VPS, Debian 13, OpenSSH 10.0p2 — verified over SSH) |
| `<SSH_USER>` | `deploy`, created by `deploy/server-setup.sh`. Only the initial provisioning run uses `root` |

The IP and the login name are written here on purpose: they are not secrets,
they are already public in DNS, and leaving them as placeholders is what led
to an SSH config pointing at a wrong address for days. **Secrets stay out** —
no keys, no passwords, no API tokens in this repo, ever. Those live in the
server's `.env` and in GitHub Actions secrets; see "Where credentials live".

---

## Architecture

```
Internet
   |
   v
nginx (host ports 80, 443) ── TLS termination, gzip, legacy-domain redirect
   |
   v (docker network "veysl", not published to the host)
app :3000  — single Next.js container: marketing site + /admin (Payload) + /api/*
   |
   +-- veysl-data volume   -> /app/data/veysl-cms.db   (SQLite)
   +-- veysl-media volume  -> /app/media               (Payload uploads)

certbot — renews the shared TLS cert every 12h, writes into certbot-conf
          (mounted read-only into nginx)
```

One app container, not the split admin-SPA/API/homepage shape some other
projects use — Payload's admin panel is built into the same Next.js app at
`/admin`, so there's nothing else to route.

---

## Why SQLite, not Postgres

`payload.config.ts` documents the adapter swap as a ~3-line change if you
ever need it — this section is why we're *not* making that change now.

**CHECKLIST.md (A.3) says "switch to Postgres"** — but its own stated reason
is that SQLite's file doesn't survive a redeploy on **Vercel-style**
platforms with an ephemeral filesystem. That reasoning doesn't apply here:
this is a single VPS with a named, persistent Docker volume
(`veysl-data:/app/data`) that survives `docker compose down`, image rebuilds,
and redeploys — only `docker compose down -v` or an explicit `docker volume
rm` destroys it, and nothing in deploy.sh does either.

Evaluated honestly against the actual workload (a single-operator wedding-DJ
lead-gen site — a handful of booking enquiries a day, one admin editing
content occasionally, not a multi-tenant SaaS):

- **Concurrent writes**: trivial at this scale. SQLite's single-writer model
  is a non-issue when writes are enquiries/admin edits, not a shopping cart
  under load.
- **Backup story**: a single file, backed up with SQLite's own `.backup`
  command for a consistent snapshot even mid-write (see `deploy/backup.sh`)
  — no separate `pg_dump`/base-backup tooling, no second container to keep
  patched and monitored on a resource-constrained VPS.
- **Operational familiarity**: matches the shape of the client's other
  production stack (also Docker + nginx + certbot, also SQLite-on-a-volume)
  — one fewer moving part to learn.
- **Cost of being wrong**: real, but bounded. If the site ever outgrows
  SQLite (meaningfully concurrent admin users, need for read replicas,
  etc.), the migration is: `npm install @payloadcms/db-postgres`, swap the
  adapter in `payload.config.ts` (see the comment directly above `db:` in
  that file), add a Postgres container + volume to `docker-compose.yml`, run
  `payload migrate` once against the new database, and — this is the part
  that isn't "3 lines" — write a one-off data-export/import script, since
  Payload doesn't ship a generic cross-adapter data migrator. Low
  probability at this project's scale, but not zero-effort; documented here
  so it's a conscious tradeoff, not a surprise later.

**If you choose to move to Postgres anyway**: add a `postgres:16-alpine`
service to `docker-compose.yml` with its own named volume, set
`DATABASE_URI=postgres://user:password@postgres:5432/veysl` in `.env`, make
the adapter swap in `payload.config.ts`, and run
`docker compose run --rm app npx payload migrate` once before first boot.

---

## CMS migrations — RESOLVED, here's how it works now

Found while building this deployment pipeline (not on `CHECKLIST.md`), and
since fixed application-side:

`@payloadcms/db-sqlite`'s connection code (`connect.js`) only
auto-creates/syncs the database schema ("push mode") when
`NODE_ENV !== 'production'`, and only runs formal migrations when
`prodMigrations` is explicitly passed into `sqliteAdapter({...})` in the
config. Left unwired, a genuinely fresh production database would get zero
tables — not an error, just silence, until `POST /api/anfrage` (no fallback
by design — see that route's own comments) 500s on every single booking
attempt while the rest of the site looks fine (`getSite()` and the
site-image slot resolver both fail soft to static defaults, so most pages
render normally regardless).

**Fixed**: `src/migrations/` (one baseline migration covering every
collection/global) is committed, and `payload.config.mts` passes
`prodMigrations: migrations` into `sqliteAdapter({...})` — see that file's
own comment for the full story, including a real, non-obvious blocker along
the way: generating the migration requires the standalone `payload` CLI,
which hit a genuine `require()`-of-ESM-with-top-level-await incompatibility
in `@payloadcms/richtext-lexical` (reproduced identically on Node 22.23.1
*and* 24.15 — not the Node-version issue it first looked like). Fixed by
making the config file itself `.mts` (forces real ESM loading end to end);
the running app is unaffected since it never goes through that file-search
path. **Verified end-to-end, not just type-checked**: built the standalone
`server.js` output, ran `payload migrate` against a brand-new empty SQLite
file with `NODE_ENV=production`, started the server against that database,
and posted a real submission to `/api/anfrage`, `/api/kontakt` and
`/api/whatsapp-lead` — all three returned `200` and the rows are in the
(then-deleted) test database.

`deploy/deploy.sh` (step 4/6, "Database migrations") runs `npx payload
migrate` — with `PAYLOAD_CONFIG_PATH=payload.config.mts` set for that
invocation specifically — against the `builder` stage image before any app
container (re)starts, so a bad migration fails the deploy loudly instead of
silently bricking the enquiry form. `connect()` also auto-applies
`prodMigrations` on every boot as a second safety net (idempotent — Payload
tracks applied migrations in `payload_migrations`), in case that step is
ever skipped.

**Regenerating a migration after a schema change**: see the command
documented directly above `db:` in `payload.config.mts` — generate against a
throwaway empty SQLite file (not the real dev DB), then commit the new file
under `src/migrations/`.

---

## Prerequisites

- A netcup VPS, Debian 13 (trixie) minimal, root access.
- The `dj-veys.de` domain, DNS access to it (and to `veystunesofficial.de` for
  the migration step).
- This repo cloned or otherwise synced onto the box.

## DNS records to set

The records this pipeline depends on are below. For the **complete zone** —
these plus the mail records, CAA, the netcup-panel specifics and the TTL
handling for the migration — see `docs/DNS-RECORDS.md`.

| Host | Type | Value | When |
|---|---|---|---|
| `dj-veys.de` | A (+ AAAA if the VPS has IPv6) | `159.195.216.142` | ✅ set |
| `www.dj-veys.de` | A (+ AAAA) | `159.195.216.142` | ✅ set |
| `veystunesofficial.de` | A (+ AAAA) | `159.195.216.142` | At the domain-migration step — see below, **not** day one |
| `www.veystunesofficial.de` | A (+ AAAA) | `159.195.216.142` | Same as above |

Mail DNS (MX/SPF/DKIM/DMARC) is a separate concern, hosted externally
(Mailbox.org) — see `docs/MAIL-SETUP.md`. Nothing in this deploy pipeline
touches mail DNS.

**Do not repoint `veystunesofficial.de` on day one.** Launch `dj-veys.de`
first, verify it's healthy and indexed, *then* do the domain migration as
its own deliberate step (see "Domain migration" below) — CHECKLIST.md (A.4)
flags this as the single highest technical/SEO risk in the project, and
rushing both at once makes it harder to tell which change caused what if
something goes wrong.

---

## First deploy, start to finish

```bash
# 1. On your own machine: provision the box (run once)
ssh root@<SERVER_IP> 'bash -s' < deploy/server-setup.sh
# Reads deploy/server-setup.sh's own summary at the end for next steps.
# Verify you can SSH in as the new deploy user in a NEW terminal before
# closing this session — the script disables root SSH login as its last step.

# 2. As the deploy user: get the code onto the box
ssh <SSH_USER>@<SERVER_IP>
git clone <REPO_URL> /opt/veysl/app
cd /opt/veysl/app

# 3. Production env
cp env.production.example .env
# Generate PAYLOAD_SECRET ON THIS BOX, never reuse the dev one:
openssl rand -hex 32
# Paste the result into .env's PAYLOAD_SECRET, then fill in every other
# <...> placeholder — see the comments inside env.production.example.
nano .env   # or your editor of choice

# 4. DNS: point dj-veys.de + www.dj-veys.de at this box now (see table above),
#    and wait for it to propagate (`dig dj-veys.de` from your own machine).

# 5. First TLS certificate (one-time)
CERTBOT_EMAIL=<owner-email> deploy/setup-ssl.sh

# 6. First deploy
deploy/deploy.sh
```

`deploy/deploy.sh` builds the image, runs Payload's database migrations (see
the section above), recreates the app container, starts nginx once it
confirms a certificate exists, health-checks, and rolls back automatically
if the health check fails.

### Creating the first Payload admin user

Payload's `Users` collection has no seeded account. The **first** visit to
`https://dj-veys.de/admin` after migrations have run (step 4/6 above)
automatically shows a "Create your first admin user" form instead of a login
form — this is standard Payload behavior, not something this
pipeline sets up separately. Use a real email + a strong, unique password;
this account can create further admin users from `/admin` afterwards.

---

## Where credentials live

Two different places, and the split is deliberate — putting a runtime secret
into GitHub would actively make things worse, so this is worth reading before
adding anything.

**GitHub Actions secrets** — credentials the *pipeline* needs, and only those:

| Secret | Used by |
|---|---|
| `DEPLOY_SSH_HOST` | the `deploy` job in `.github/workflows/deploy.yml` |
| `DEPLOY_SSH_USER` | same |
| `DEPLOY_SSH_KEY` | same — private key matching the deploy user's `authorized_keys` |

Set them with `gh secret set DEPLOY_SSH_KEY < key` or via repo Settings →
Secrets and variables → Actions. **Only the repository owner can do this**;
values must never be pasted into a chat, a commit, or a doc.

**The server's `/opt/veysl/app/.env`** — everything the *application* needs at
runtime: `PAYLOAD_SECRET`, `DATABASE_URI`, `SMTP_PASS`, `RESEND_API_KEY`,
`INSTAGRAM_*`. These do **not** belong in GitHub secrets, for three reasons:

1. The app reads them live when the container starts (see "Build-time vs.
   runtime" below). Changing one needs a restart, not a rebuild — and that
   property disappears the moment the pipeline owns the values.
2. Routing them through GitHub means the pipeline has to write secrets onto
   the server on every deploy, which widens the blast radius of a compromised
   workflow to include the database key and mail credentials.
3. `PAYLOAD_SECRET` is generated **on the server** on purpose
   (`openssl rand -hex 32`) so it never exists anywhere else — not on a
   laptop, not in a CI log.

Rule of thumb: if the *pipeline* needs it to reach the server, GitHub secret.
If the *running app* needs it, server `.env`. Nothing goes in the repo either
way — `.gitignore` covers `.env*` except the committed template.

## Environment variables

All documented in `env.production.example` with inline comments; summary:

| Variable | Required | Notes |
|---|---|---|
| `PAYLOAD_SECRET` | Yes | ≥32 bytes, generated on the server, never committed |
| `DATABASE_URI` | Yes | `file:/app/data/veysl-cms.db` — must match the volume mount |
| `PAYLOAD_SERVER_URL` | Yes | `https://dj-veys.de` |
| `NEXT_PUBLIC_SITE_URL` | Yes | `https://dj-veys.de` — also a Docker **build** arg, see below |
| `BOOKING_TRANSPORT` / `BOOKING_NOTIFY_EMAIL` | Yes | See "Known issues" — `console` is dev-only |
| `RESEND_*` / `SMTP_*` | Once a real transport is implemented | See docs/MAIL-SETUP.md |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` etc. | Optional | Analytics — see docs/ANALYTICS.md |
| `INSTAGRAM_*` / `YOUTUBE_CHANNEL_ID` | Optional | Social feed — see docs/SOCIAL-FEED.md |

**Build-time vs. runtime**: only `NEXT_PUBLIC_*` variables need to be set
*before* `docker compose build` (Next.js inlines them into the client bundle
at build time — see the Dockerfile's top comment). Everything else
(`PAYLOAD_SECRET`, `DATABASE_URI`, booking/mail/social vars) is read live by
the Node process when the container starts, so changing them only needs
`docker compose up -d app` (via `deploy/deploy.sh`), not a rebuild.

---

## Updating / redeploying

```bash
cd /opt/veysl/app
deploy/deploy.sh
```

Idempotent — safe to run with no changes pending (everything no-ops
cleanly). Pulls the latest `git` commit on the current branch (fast-forward
only; refuses to run if the server has local changes it can't cleanly merge
— resolve that manually first), rebuilds the image, checks migrations,
recreates the app container, health-checks, and **automatically rolls back**
to the previous image if the new one doesn't pass its health check within
60 seconds.

## Rolling back manually

`deploy/deploy.sh` tags the previous working image as `veysl-app:previous`
before every deploy. To roll back by hand (e.g. you noticed a problem after
the health check already passed):

```bash
docker tag veysl-app:previous veysl-app:latest
docker compose up -d --force-recreate --no-deps app
```

This only rolls back the **application code/image** — it does not touch the
database. If a bad deploy also corrupted data, restore from backup instead
(next section).

---

## Backups

```bash
deploy/backup.sh                 # take a backup now (DB + media)
deploy/backup.sh list            # see what's available
```

Writes timestamped, gzip-compressed files to `backups/db/` and
`backups/media/` under the app directory, with a configurable retention
window (`RETENTION_DAYS`, default 14 days — older backups are deleted
automatically). The DB backup uses SQLite's own `.backup` command for a
consistent snapshot even while the app is live and writing — never a raw
file copy (see the comment at the top of `deploy/backup.sh` for why that
matters).

**Schedule it** — as the deploy user, `crontab -e`:

```
0 3 * * * /opt/veysl/app/deploy/backup.sh >> /opt/veysl/app/backups/backup.log 2>&1
```

### Restoring a backup — and testing that restore actually works

A backup nobody has ever restored is not a backup. `deploy/backup.sh` has a
restore command; test it **before you need it**, on a fresh VPS/VM if
possible (never rehearse a destructive restore against the live production
volumes):

```bash
deploy/backup.sh restore backups/db/veysl-cms-<timestamp>.db.gz \
                          backups/media/veysl-media-<timestamp>.tar.gz
```

This stops the app, overwrites the `veysl-data`/`veysl-media` volumes with
the chosen backup (after an explicit `yes` confirmation prompt), and starts
the app back up. After it finishes:

1. Load `https://dj-veys.de/admin`, log in, and confirm the enquiries/media
   you expect to see are actually there.
2. Open a few blog/gallery pages that reference uploaded media and confirm
   images load (proves the media volume round-tripped correctly, not just
   the DB).
3. If either check fails, you still have the pre-restore state until you
   run `restore` again — nothing is deleted until the moment of restore, so
   re-running with a different backup file is safe.

**Do this restore-test once, right after your first real backup exists**,
so the first time you *need* a restore isn't also the first time you've
ever run one.

---

## Domain migration (`veystunesofficial.de` -> `dj-veys.de`) — ⛔ VOID

**The owner cancelled the `veystunesofficial.de` registration in July 2026. The
redirect-based migration below can no longer be executed and is kept only as a
record of what was planned.** Read this header, then skip to "What replaces it".

What that removes, permanently:

- **The 301 redirects.** They are served by *our* nginx, which only ever sees
  the old domain's traffic if that domain's DNS points here. No registration,
  no DNS, no traffic, no redirect. `deploy/redirects-legacy.conf` and the
  legacy `server {}` block in `nginx/nginx.conf` are now inert — they are left
  in place because they are harmless (they only ever redirect *to* this site)
  and because deleting them would erase the map of old→new paths, but nothing
  will ever match them.
- **The TLS certificate expansion** (old step 4). Actively dangerous now, not
  just useless: certbot fails the *entire* request if any one `-d` domain
  doesn't validate, so adding the legacy domain would break issuance/renewal
  for `dj-veys.de` itself. `deploy/setup-ssl.sh` carries the same warning.
- **Search Console's Change of Address** (old step 6). It requires the old
  property to be verified *and* serving 301s to the new one. Both are now
  impossible; there is no partial version of this step to salvage.
- **Whatever residual link equity the old domain held.** Honestly assessed:
  little. `docs/SEO-ACTION-PLAN.md` §(d) found the old site never ranked for
  generic wedding-DJ queries, and by 2026-07-29 it was already serving `503` on
  its homepage and `404` on all five other paths, with its sitemap down to a
  single URL. The loss is real but small — this was a thin site, not an
  established one.

**If you want to undo this, check now, not later.** German registrars normally
process a cancellation at the end of the current contract term rather than
immediately, and the cancellation can usually be withdrawn during that window —
the domain often still resolves throughout. If it is withdrawn, everything
below becomes executable again exactly as written. Once the term ends the name
drops and can be re-registered by anyone, at which point it is gone for good.

### What replaces it

Only one path to the old audience remains, and it is entirely off-page. These
were steps 8–9 of a ten-step plan; they are now the whole plan, which makes
them considerably more urgent than their old position implies:

1. **Instagram bio link → `dj-veys.de`.** Previously "5 minutes, your fastest
   traffic source" (CHECKLIST.md B.3). It is now also the *only* route by which
   the 63K-follower audience reaches the new site, and the link currently there
   is about to start failing.
2. **Google Business Profile website field → `dj-veys.de`.** Edit the existing
   listing; **do not create a new one**, or the 5.0★/31-review history splits
   across two profiles (CHECKLIST.md A.4/B.2).
3. **YouTube channel link**, and any directory or portal listing that predates
   this project (`docs/SEO-ACTION-PLAN.md` §(c)(2) lists the ones found).
4. **Submit `https://dj-veys.de/sitemap.xml`** in Search Console for the new
   property and watch coverage. This one is unchanged — it never depended on
   the old domain.

Nothing on this list is a code change. All four are account edits by the owner.

---

<details>
<summary>The original plan, kept for the record (no longer executable)</summary>

The highest technical/SEO risk in this project (CHECKLIST.md A.4). Sequence:

1. **Do not cancel the old domain.** Keep the registration active
   indefinitely — it's still carrying the redirect and whatever residual
   direct traffic/backlinks point at it.
2. Launch `dj-veys.de` first (steps above), verify it's healthy, and let it
   settle for a few days. ✅ **Done** — `dj-veys.de` serves `200`, its sitemap
   returns 157 URLs, `www` 301s to the apex.

   > **The "settle for a few days" caution has since expired — do not read it
   > as a reason to keep waiting.** It was written on the assumption that the
   > old site is healthy and still carrying visibility worth protecting.
   > Measured against the live domain on 2026-07-29, that premise no longer
   > holds: `https://www.veystunesofficial.de/` returns **503**, every other
   > path (`/kontakt/`, `/ueber-uns/`, `/impressum/`, `/datenschutzerklaerung/`,
   > `/blog-hochzeitstipps/`) returns **404**, and the WordPress sitemap that
   > `docs/SEO-ACTION-PLAN.md` §(d) recorded with six URLs now lists exactly
   > one. The old install has been gutted.
   >
   > So the old domain is currently showing Google a `503` on the homepage and
   > `404`s everywhere else — the two worst things it could show. Waiting no
   > longer protects anything; it just extends the window in which residual
   > link equity drains instead of being redirected. Phase 3 is now the
   > *lower*-risk option, and should be done at the next opportunity.
   >
   > **Keep every path in `deploy/redirects-legacy.conf` anyway.** That those
   > five URLs 404 today does not make mapping them pointless — Google's index
   > and any external backlinks still reference them, and a 301 is what
   > converts those hits into signal for the new domain. Deleting the map
   > because the source pages are gone would throw away exactly what this step
   > exists to capture.
3. Point `veystunesofficial.de` + `www.veystunesofficial.de` DNS at
   `<SERVER_IP>`, and **delete the legacy zone's AAAA records** — the VPS has
   no IPv6 and Googlebot crawls over it, so an AAAA left pointing at IONOS
   quietly bypasses the whole redirect. Full record-by-record table, including
   which rows to leave alone (MX): `docs/DNS-RECORDS.md` → "Phase 3".
4. Expand the TLS certificate to cover the legacy domain too (no downtime,
   updates the existing cert in place):
   ```bash
   CERTBOT_EMAIL=<owner-email> \
   CERTBOT_DOMAINS="dj-veys.de www.dj-veys.de veystunesofficial.de www.veystunesofficial.de" \
   deploy/setup-ssl.sh
   ```
5. Verify every redirect path, on both host forms, before step 6 — telling
   Search Console about a move whose redirects are half-broken is worse than
   not telling it. (A script, `deploy/verify-legacy-redirects.sh`, was written
   for this and then removed along with the rest of the migration: it asserted
   a set of 301s that can no longer exist. `git log` has it if the migration is
   ever revived.)
6. **Google Search Console**: verify `dj-veys.de` as a new property, then run
   the **Change of Address** tool from the *old* verified property, pointing
   it at the new one. This is a distinct step from the 301s — it tells
   Google directly rather than waiting for re-crawling to figure it out.
7. Submit the new sitemap (`https://dj-veys.de/sitemap.xml`) in Search
   Console and watch the coverage report over the following weeks.
8. Update the site address on Google Business Profile to `dj-veys.de` —
   **do not create a new GBP listing**; edit the existing one so the
   current 5.0★ profile carries over (CHECKLIST.md A.4/B.2).
9. Update the link in the Instagram bio (currently pointing at the old
   domain — CHECKLIST.md B.3, flagged there as "5 minutes, your fastest
   traffic source").
10. Watch the legacy-domain nginx access log for real 404-turned-301 paths
    that hit the catch-all (`default '/'` in `deploy/redirects-legacy.conf`)
    instead of a precise match — add them to that file if the same path
    shows up repeatedly, rather than leaving real traffic on the catch-all.

`deploy/redirects-legacy.conf` currently maps the six old paths known at
build time (`/`, `/ueber-uns/`, `/kontakt/`, `/blog-hochzeitstipps/`,
`/impressum/`, `/datenschutzerklaerung/`) to their nearest real equivalent on
the new site — never a blanket redirect to the homepage. Anything not listed
falls through to `/` as a last resort rather than 404ing.

</details>

---

## Known issues / follow-ups found while building this pipeline

- **Standalone-server redirect loop (fixed here)**: `next.config.ts` needed
  two additional lines beyond `output: 'standalone'` —
  `skipProxyUrlNormalize: true` and `skipTrailingSlashRedirect: true`.
  Without them, the built-in standalone `server.js` turns next-intl's
  locale-rewrite middleware into an infinite `307` self-redirect on
  **every** page — confirmed locally: `next start` serves `/` as `200`
  fine, `node server.js` (the standalone/Docker path) loops until curl's
  50-redirect ceiling. This is a documented Next.js pattern for
  self-hosted/custom servers with middleware, not app-specific — but it
  only shows up in exactly the runtime mode Docker uses, so it's easy to
  miss if you only ever tested with `next start`/`next dev`.
- **RESOLVED — `answers.capabilities.traditional-turkish`**: the key is now
  present in all seven `messages/*.json` files (verified: 7 entries per
  locale, matching `site.capabilities`). The `/fragen` capability list
  renders complete.
- **RESOLVED — `src/app/[locale]/fragen/metadata.ts`**: the stale
  `FRAGEN_SLUG` map is gone; the file now goes through
  `absoluteUrl('/fragen', locale)`, exactly as its own comment recommended.
  `next build` and `tsc --noEmit` pass, and the CI `build-and-verify` job is
  green — this no longer blocks the pipeline.
- **RESOLVED — real mail transports**: `src/app/api/anfrage/_lib/transport.ts`
  now implements **both** `resend` (REST, via `fetch`) and `smtp` (nodemailer).
  For this deployment the answer is `smtp`: mail is self-hosted on the same
  box (`docs/MAIL-SELFHOSTED.md`), and a local Postfix speaks SMTP, not REST.
  Both throw on construction if their credentials are missing, so a
  misconfigured transport fails at startup rather than silently on the first
  real lead. `console` remains the default and must never be used in
  production — it writes personal data to the container log.
- **The server cannot `git fetch` this repo yet** — `oeztuerkhamza/veysl-music`
  is **private**, and the `deploy` job in `.github/workflows/deploy.yml` works
  by SSHing to the box and running `git fetch --tags && git checkout <tag>`
  there. That needs credentials *on the server*, which nothing in this repo
  currently provides. Fix before enabling the deploy job: generate a key pair
  on the box as the `deploy` user, add the public half to the repo under
  **Settings → Deploy keys** (read-only is enough), and clone via
  `git@github.com:oeztuerkhamza/veysl-music.git` rather than the HTTPS URL.
  A GitHub Actions token is *not* an option here — it never reaches the
  server, since the checkout in CI and the `git fetch` on the box are two
  different machines.
- **No Content-Security-Policy** — deliberately not shipped. This site loads
  its own WebGL hero, GSAP, wavesurfer.js, Payload's Lexical rich-text admin
  editor, and Spotify/SoundCloud/YouTube embed facades; a guessed CSP is
  more likely to silently break one of those than to add real protection.
  Recommended follow-up once the site is live and stable: add a
  `Content-Security-Policy-Report-Only` header first, watch real violation
  reports for a few weeks, then tighten to an enforcing policy informed by
  what's actually observed loading — not guessed up front.
- **No brotli compression** — `nginx:1.27-alpine` doesn't ship the
  `ngx_brotli` module. gzip is fully configured and gets most of the
  practical win; brotli would need a custom-compiled nginx image, judged not
  worth the added maintenance surface for the first production cut.
- **In-memory rate limiter** (`src/app/api/_lib/rate-limit.ts`) — resets on
  every container restart and doesn't share state across replicas. **This is
  fine for this deployment**: one app container, no horizontal scaling. If
  you ever scale `app` to multiple replicas (e.g. `docker compose up -d
  --scale app=2` behind nginx load-balancing), this stops working correctly
  — each replica would enforce its own independent limit — and needs to move
  to a shared store (Redis/Upstash) first.

---

## Go-live checklist

- [ ] `.env` fully filled in, `PAYLOAD_SECRET` freshly generated on the server
- [ ] `deploy/setup-ssl.sh` run, `https://dj-veys.de` serves valid TLS
- [ ] First admin user created at `/admin` (needs migrations to have run —
      step 4/6 of `deploy/deploy.sh`, see "CMS migrations" above)
- [ ] **Submit a real test enquiry through `/anfrage` and confirm it appears
      in `/admin` → Enquiries** — still the single most important pre-launch
      test (verified locally against a fresh DB — see "CMS migrations" above
      — but a real box can still differ), and cheap insurance either way
- [ ] `BOOKING_TRANSPORT=smtp` with all four `SMTP_*` vars set, and the mail
      stack actually running — with `console`, enquiries are captured in
      `/admin` but no notification goes out *and* personal data lands in the
      container log
- [ ] Deploy key added to the repo (Settings → Deploy keys) and the clone on
      the box uses the SSH remote — otherwise the deploy job's `git fetch`
      fails against this private repo
- [ ] GitHub Environment `production` created **with required reviewers** —
      without it, `environment: production` in the workflow is just a label
      and the "manual gate" does not actually gate anything
- [ ] `deploy/backup.sh` run at least once, and its `restore` path tested
      (see "Restoring a backup" above)
- [ ] Legal blockers from `CHECKLIST.md`'s "🔴 LAUNCH BLOKERLERİ" table
      resolved (Impressum address, USt-IdNr./Kleinunternehmer statement,
      Datenschutzerklärung legal review) — business-side, not this
      pipeline's job, but genuinely launch-blocking
- [ ] Lighthouse run against the live site (target 90+, per CHECKLIST.md A.3)
- [ ] Domain migration steps above completed in order, including the
      **Search Console Change of Address tool** — not just the 301s
- [ ] Google Business Profile site link updated (existing profile, not a new one)
- [ ] Instagram bio link updated to `dj-veys.de`
- [ ] Uptime monitoring pointed at `https://dj-veys.de/` (external, e.g.
      UptimeRobot/Better Uptime — nothing in this repo provides this)

---

## What this pipeline cannot verify without a real server

Honest list — all of the above was built and tested locally (production
`next build`, the standalone server end-to-end including the redirect-loop
fix, `docker compose config` validation of the compose file shape) but
**not** against an actual VPS:

- Whether `server-setup.sh` behaves correctly on an actual fresh Debian 13
  install (package names, `docker.list` repo line, `ufw`/`fail2ban` service
  names) — written against current Debian 13/Docker docs, not executed on
  real hardware.
- Real certbot issuance against real DNS (the bootstrap/swap dance in
  `deploy/setup-ssl.sh` was designed and reasoned through, not run against a
  live ACME challenge).
- Actual image size/pull time and container start time on the target VPS's
  actual CPU/disk/network.
- Whether netcup's specific VPS image has any quirks (custom kernel,
  pre-installed agents) that interact with `server-setup.sh`.
- End-to-end email delivery (moot until `ResendTransport` is implemented —
  see "Known issues").
- Real-world SQLite write throughput under actual production traffic
  (expected to be a non-issue at this project's scale — see "Why SQLite" —
  but "expected" is not "measured").
