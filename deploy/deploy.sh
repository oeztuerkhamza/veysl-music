#!/usr/bin/env bash
# dj-veys.de — deploy/update the running stack. Idempotent, safe to re-run;
# run this for every deploy after the very first one (which additionally
# needs deploy/setup-ssl.sh — see docs/DEPLOYMENT.md).
#
#   cd /opt/veysl/app && deploy/deploy.sh
#
# Steps: pull -> build -> migrate (if applicable) -> recreate -> health-check
# -> roll back automatically on failure.

set -euo pipefail
cd "$(dirname "$0")/.."

log() { printf '\n\033[1;32m==> %s\033[0m\n' "$1"; }
warn() { printf '\033[1;33m!! %s\033[0m\n' "$1" >&2; }
die() { printf '\033[1;31mxx %s\033[0m\n' "$1" >&2; exit 1; }

[ -f docker-compose.yml ] || die "Run this from the app directory (where docker-compose.yml lives)."
[ -f .env ] || die ".env not found — copy env.production.example to .env and fill in real values first."

# -----------------------------------------------------------------------------
log "1/6 — Pulling latest source"
# -----------------------------------------------------------------------------
if [ -d .git ]; then
  branch="$(git rev-parse --abbrev-ref HEAD)"
  git fetch --quiet origin
  # --ff-only: refuses to run if the server has local commits/edits that
  # would need a merge — surfaces that problem loudly instead of silently
  # creating a merge commit or clobbering something on a production box.
  git pull --ff-only origin "$branch" || die "git pull --ff-only failed — resolve manually (local changes on the server?) and re-run."
else
  warn "Not a git checkout — skipping pull (assuming source was synced another way, e.g. CI artifact/rsync)."
fi

# -----------------------------------------------------------------------------
log "2/6 — Snapshotting current image for rollback"
# -----------------------------------------------------------------------------
had_previous=0
if docker image inspect veysl-app:latest >/dev/null 2>&1; then
  docker tag veysl-app:latest veysl-app:previous
  had_previous=1
  echo "  Tagged current veysl-app:latest as veysl-app:previous."
else
  echo "  No existing image — this looks like the first deploy, nothing to snapshot."
fi

# -----------------------------------------------------------------------------
log "3/6 — Building app image"
# -----------------------------------------------------------------------------
docker compose build app

# -----------------------------------------------------------------------------
log "4/6 — Database migrations"
# -----------------------------------------------------------------------------
# `prodMigrations` is now wired in payload.config.mts (src/migrations/, one
# baseline migration covering every collection/global as of this commit) —
# see that file's own "Why this file is .mts" comment for the full story.
# `connect()` (@payloadcms/db-sqlite) auto-runs `prodMigrations` on every
# boot when NODE_ENV=production, so the app *would* self-heal a fresh DB even
# without this step — but running it explicitly here, before any app
# container starts, fails the deploy loudly and fast if a migration is bad,
# instead of finding out via a 500 on the first real enquiry.
#
# PAYLOAD_CONFIG_PATH is required: payload.config.mts isn't one of the two
# filenames Payload's own CLI auto-searches for (payload.config.js/.ts only),
# so every CLI invocation needs it set explicitly — see the config file's
# comment for why it's .mts at all (a real, verified `@payloadcms/
# richtext-lexical` + Node `require(esm-with-top-level-await)` incompatibility,
# not a Node-version issue — reproduced and fixed on both Node 22 and 24).
#
# Runs against the `builder` stage (full node_modules incl. the payload CLI),
# NOT the trimmed `output: standalone` runtime image — Next's file tracing
# does not preserve node_modules/.bin, so the CLI isn't reliably runnable
# from the `runner` stage.
#
# The --build-arg list is what makes this cheap instead of a second full
# build, and it is not optional. `docker compose build` above interpolates
# these from .env; a bare `docker build` knows nothing about .env, so without
# them the ARG values differ from the compose build, the layer cache misses,
# and `RUN npm run build` re-runs from scratch — this time with
# NEXT_PUBLIC_SITE_URL empty. Prerendering then dies on the first page that
# builds an absolute URL:
#
#   TypeError: Invalid URL   input: '/ablauf'   base: ''
#
# which reads like an application bug and is really a missing build arg.
# Keep this list in sync with docker-compose.yml's `build.args`.
# Read values OUT of .env rather than sourcing it. `. ./.env` executes the
# file as a shell script, which works right up until a value contains a shell
# metacharacter — and one always eventually does. Here it was
#
#   SMTP_FROM_EMAIL=DJ Veys <no-reply@dj-veys.de>
#
# where `<` is a redirection operator, so bash died with "syntax error near
# unexpected token `newline'" and took the whole deploy with it. A password
# containing `$`, `` ` `` or `&` would do the same, and sourcing would also
# execute anything an attacker got into that file. sed extracts exactly one
# named value and executes nothing.
env_value() {
  sed -n "s/^$1=//p" .env | head -n 1
}
docker build --target builder -t veysl-app:build-tools \
  --build-arg NEXT_PUBLIC_SITE_URL="$(env_value NEXT_PUBLIC_SITE_URL)" \
  --build-arg NEXT_PUBLIC_PLAUSIBLE_DOMAIN="$(env_value NEXT_PUBLIC_PLAUSIBLE_DOMAIN)" \
  --build-arg NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL="$(env_value NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL)" \
  --build-arg NEXT_PUBLIC_GA4_MEASUREMENT_ID="$(env_value NEXT_PUBLIC_GA4_MEASUREMENT_ID)" \
  --build-arg NEXT_PUBLIC_CLARITY_PROJECT_ID="$(env_value NEXT_PUBLIC_CLARITY_PROJECT_ID)" \
  . >/dev/null

# The volume is read off the running container rather than hardcoded. Compose
# prefixes volume names with the project directory, so the volume declared as
# `veysl-data` exists as `app_veysl-data` — and `docker run -v veysl-data:…`
# does not fail on the mismatch, it silently creates an empty volume. This
# step was therefore migrating a phantom database on every deploy and
# reporting success. The site still worked, because payload.config.mts runs
# `prodMigrations` at boot against the real one; all this step actually
# provided was false confidence.
data_volume="$(docker inspect veysl-app --format '{{range .Mounts}}{{if eq .Destination "/app/data"}}{{.Name}}{{end}}{{end}}' 2>/dev/null)"
[ -n "$data_volume" ] || die "Could not resolve the app's data volume from the running container."
docker volume inspect "$data_volume" >/dev/null 2>&1 || die "Resolved data volume '$data_volume' does not exist."

set +e
docker run --rm \
  --env-file .env \
  -e PAYLOAD_CONFIG_PATH=payload.config.mts \
  -v "$data_volume":/app/data \
  -w /app \
  veysl-app:build-tools \
  sh -c 'if [ -d src/migrations ]; then npx payload migrate; else echo "src/migrations/ not found — nothing to run (unexpected; it is committed to this repo)."; fi'
migrate_status=$?
set -e

if [ "$migrate_status" -ne 0 ]; then
  die "Migration step failed — aborting before touching the running app. Nothing was recreated."
fi

# -----------------------------------------------------------------------------
log "5/6 — Recreating containers"
# -----------------------------------------------------------------------------
docker compose up -d app

primary_cert="$(docker compose run --rm --entrypoint sh certbot -c \
  '[ -f /etc/letsencrypt/live/dj-veys.de/fullchain.pem ] && echo yes || echo no' 2>/dev/null || echo no)"
if [ "$primary_cert" = "yes" ]; then
  docker compose up -d nginx certbot
else
  warn "No TLS certificate yet for dj-veys.de — leaving nginx/certbot stopped."
  warn "Run 'CERTBOT_EMAIL=<you> deploy/setup-ssl.sh' once DNS points here, then re-run this script."
fi

# -----------------------------------------------------------------------------
log "6/6 — Health check"
# -----------------------------------------------------------------------------
healthy=0
for _ in $(seq 1 30); do
  status="$(docker inspect -f '{{.State.Health.Status}}' veysl-app 2>/dev/null || echo unknown)"
  if [ "$status" = "healthy" ]; then
    healthy=1
    break
  fi
  sleep 2
done

if [ "$healthy" -ne 1 ]; then
  warn "App did not become healthy within 60s."
  if [ "$had_previous" -eq 1 ]; then
    warn "Rolling back to the previous image."
    docker tag veysl-app:previous veysl-app:latest
    docker compose up -d --force-recreate --no-deps app
    die "Rolled back. Check 'docker compose logs app' for what broke before deploying again."
  else
    die "No previous image to roll back to (this was the first deploy). Check 'docker compose logs app'."
  fi
fi

# Config reload only — cheap, and covers the (rare) case where nginx.conf or
# redirects-legacy.conf changed in this pull. No downtime.
docker compose exec -T nginx nginx -s reload 2>/dev/null || true

log "Deploy complete. veysl-app is healthy."
docker compose ps
