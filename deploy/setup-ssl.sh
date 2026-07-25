#!/usr/bin/env bash
# veysl.de — one-time TLS certificate bootstrap.
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
# By default this only requests a cert for veysl.de + www.veysl.de — DNS for
# the legacy domain (veystunesofficial.de) may not be repointed at this VPS
# yet at initial launch, and certbot fails the ENTIRE request if any -d
# domain doesn't resolve here. Once that DNS is ready (see docs/DEPLOYMENT.md
# "Domain migration"), re-run with the legacy domains added — `--expand`
# updates the existing certificate in place, no downtime:
#   CERTBOT_EMAIL=<owner-email> \
#   CERTBOT_DOMAINS="veysl.de www.veysl.de veystunesofficial.de www.veystunesofficial.de" \
#   deploy/setup-ssl.sh

set -euo pipefail
cd "$(dirname "$0")/.."

: "${CERTBOT_EMAIL:?Set CERTBOT_EMAIL, e.g. CERTBOT_EMAIL=you@example.com deploy/setup-ssl.sh}"
CERTBOT_DOMAINS="${CERTBOT_DOMAINS:-veysl.de www.veysl.de}"
PRIMARY_DOMAIN="veysl.de"

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

docker compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  --non-interactive --agree-tos --expand \
  --email "$CERTBOT_EMAIL" \
  "${domain_args[@]}"

log "Switching nginx back to the real (TLS) config"
docker compose up -d --force-recreate nginx

log "Done — https://${PRIMARY_DOMAIN} should now serve over TLS."
echo "Verify: curl -I https://${PRIMARY_DOMAIN}/  (expect HTTP/2 200 — see docs/DEPLOYMENT.md 'Known issues' if you see a redirect loop instead)"
