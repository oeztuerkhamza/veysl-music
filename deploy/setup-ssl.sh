#!/usr/bin/env bash
# dj-veys.de — one-time TLS certificate bootstrap.
#
# Why this exists as a separate step from deploy.sh: nginx.conf's `server {
# listen 443 ssl; }` blocks reference a certificate file that doesn't exist
# yet on a fresh box, and nginx refuses to start AT ALL if a referenced cert
# file is missing (not just that one server block — the whole process).
# Certbot's webroot method, in turn, needs nginx already serving
# `/.well-known/acme-challenge/` on port 80 to prove domain ownership. This
# script breaks that chicken-and-egg loop: bring nginx up with the HTTP-only
# `nginx.bootstrap.conf`, get the certificate, then swap to the real
# `nginx.conf` (which deploy.sh/`docker compose up` uses from then on).
#
# Run once, from the app directory on the server, as the deploy user:
#   CERTBOT_EMAIL=<owner-email> deploy/setup-ssl.sh
#
# This requests a cert for dj-veys.de + www.dj-veys.de. That is the full list —
# there is no second, later run to add anything to it.
#
# DO NOT add veystunesofficial.de to CERTBOT_DOMAINS. Earlier revisions of this
# header told you to do exactly that once the legacy domain's DNS was
# repointed; that instruction is void. The old domain's registration was
# cancelled in July 2026, so it will never resolve to this VPS (see
# docs/DEPLOYMENT.md → "Domain migration"). Certbot fails the ENTIRE request if
# any single -d domain doesn't validate, so following the old instruction would
# not merely skip the legacy domain — it would fail to renew or issue the
# certificate for dj-veys.de itself, and each failed attempt counts against
# Let's Encrypt's rate limit.

set -euo pipefail
cd "$(dirname "$0")/.."

: "${CERTBOT_EMAIL:?Set CERTBOT_EMAIL, e.g. CERTBOT_EMAIL=you@example.com deploy/setup-ssl.sh}"
CERTBOT_DOMAINS="${CERTBOT_DOMAINS:-dj-veys.de www.dj-veys.de}"
PRIMARY_DOMAIN="dj-veys.de"

log() { printf '\n\033[1;32m==> %s\033[0m\n' "$1"; }

if [ ! -f docker-compose.yml ]; then
  echo "Run this from the app directory (where docker-compose.yml lives)." >&2
  exit 1
fi

already_issued=$(docker compose run --rm --entrypoint sh certbot -c \
  "[ -f /etc/letsencrypt/live/${PRIMARY_DOMAIN}/fullchain.pem ] && echo yes || echo no")

if [ "$already_issued" = "yes" ]; then
  log "Certificate for ${PRIMARY_DOMAIN} already exists."
  echo "  To add domains to it (e.g. the legacy domain once its DNS is ready), re-run with"
  echo "  CERTBOT_DOMAINS set to the full list you want — certbot --expand updates in place."
fi

log "Starting app + bootstrap (HTTP-only) nginx"
docker compose up -d app

override="$(mktemp)"
trap 'rm -f "$override"' EXIT
cat >"$override" <<'YAML'
services:
  nginx:
    volumes:
      - ./nginx/nginx.bootstrap.conf:/etc/nginx/nginx.conf:ro
      - certbot-www:/var/www/certbot:ro
YAML
docker compose -f docker-compose.yml -f "$override" up -d --force-recreate nginx

log "Requesting/expanding certificate for: ${CERTBOT_DOMAINS}"
domain_args=()
for d in $CERTBOT_DOMAINS; do
  domain_args+=(-d "$d")
done

# `--entrypoint certbot` is load-bearing, not tidiness. The compose service
# defines an entrypoint of `sh -c "…while :; do certbot renew…; sleep 12h…"` —
# the *renewal* loop. Without overriding it, the args below are passed to that
# `sh -c` script as positional parameters, which it never reads: the container
# dutifully starts the renewal loop and sleeps for twelve hours while this
# script waits for a certificate request that was never made. It looks exactly
# like a hung network call. (The `already_issued` probe above overrides the
# entrypoint for the same reason.)
docker compose run --rm --entrypoint certbot certbot certonly \
  --webroot -w /var/www/certbot \
  --non-interactive --agree-tos --expand \
  --email "$CERTBOT_EMAIL" \
  "${domain_args[@]}"

log "Switching nginx back to the real (TLS) config"
docker compose up -d --force-recreate nginx

# The renewal loop is a long-running service and has to be actually running,
# not merely defined. `setup-ssl.sh` only ever brought up `app` and `nginx`,
# so on a box provisioned solely through this script the certificate would
# quietly expire after 90 days and every page would start failing TLS — the
# kind of outage that arrives at 3am on a date nobody wrote down.
log "Starting the certbot renewal service"
docker compose up -d certbot

log "Done — https://${PRIMARY_DOMAIN} should now serve over TLS."
echo "Renewal: verify once with"
echo "  docker compose run --rm --entrypoint certbot certbot renew --dry-run"
echo "Verify: curl -I https://${PRIMARY_DOMAIN}/  (expect HTTP/2 200 — see docs/DEPLOYMENT.md 'Known issues' if you see a redirect loop instead)"
