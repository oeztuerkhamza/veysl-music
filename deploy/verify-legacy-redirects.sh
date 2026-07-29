#!/usr/bin/env bash
# veystunesofficial.de -> dj-veys.de — post-migration verification.
#
# Run this AFTER Phase 3 of docs/DNS-RECORDS.md (legacy DNS repointed, TLS
# certificate expanded via deploy/setup-ssl.sh). It asserts, for every path in
# deploy/redirects-legacy.conf, that the old domain answers with a 301 to the
# exact new-site URL that file promises.
#
# Why a script rather than the "curl -I each path" line in docs/DEPLOYMENT.md:
# a domain migration fails silently. A half-working redirect set looks fine
# from a browser — you type the old domain, you land on the new site, done —
# while four of the six mapped paths quietly 404 or land on the catch-all. The
# only way to notice is to check every path, on both host forms, deliberately.
# That is exactly the kind of check nobody repeats by hand after the third
# time, so it lives here instead.
#
# Runs from anywhere, against the public internet — it does not need to run on
# the server and does not read any local config. Exit code is 0 only if every
# assertion passed, so it is safe to wire into a smoke-test or a cron canary.
#
#   deploy/verify-legacy-redirects.sh

set -uo pipefail

OLD_HOSTS=(veystunesofficial.de www.veystunesofficial.de)
NEW_ORIGIN="https://dj-veys.de"

pass=0
fail=0

ok()   { printf '  \033[1;32m✓\033[0m %s\n' "$1"; pass=$((pass + 1)); }
bad()  { printf '  \033[1;31m✗\033[0m %s\n' "$1"; fail=$((fail + 1)); }
head_() { printf '\n\033[1m%s\033[0m\n' "$1"; }

# One (old path -> expected new URL) pair per line. Mirrors the map in
# deploy/redirects-legacy.conf exactly — including both the trailing-slash and
# no-slash forms, which that file maps defensively because it is unknown which
# form was actually indexed. If you add a path there, add it here too.
CASES=$(cat <<'EOF'
/|/
/ueber-uns/|/epk
/ueber-uns|/epk
/kontakt/|/kontakt
/kontakt|/kontakt
/blog-hochzeitstipps/|/ratgeber
/blog-hochzeitstipps|/ratgeber
/impressum/|/impressum
/impressum|/impressum
/datenschutzerklaerung/|/datenschutz
/datenschutzerklaerung|/datenschutz
EOF
)

# The catch-all: any path the map does not name must still 301 to the homepage
# rather than 404, so no inbound link ever dead-ends. Uses a path that could
# not plausibly be added to the map later.
CATCH_ALL_PATH="/gibt-es-nicht-$$"

check_redirect() {
  local url="$1" expected="$2" label="$3"
  local out status location

  # --max-time bounds a hung TLS handshake; no --location, the whole point is
  # to inspect the single hop rather than follow it.
  out=$(curl -s -o /dev/null -m 15 -w '%{http_code} %{redirect_url}' "$url" 2>/dev/null)
  status=${out%% *}
  location=${out#* }

  if [ "$status" != "301" ]; then
    bad "$label — expected 301, got ${status:-no response}"
    return
  fi
  if [ "$location" != "$expected" ]; then
    bad "$label — 301 went to ${location:-nowhere}, expected $expected"
    return
  fi
  ok "$label"
}

head_ "Per-path 301s (deploy/redirects-legacy.conf)"
for host in "${OLD_HOSTS[@]}"; do
  while IFS='|' read -r old_path new_path; do
    [ -n "$old_path" ] || continue
    check_redirect "https://$host$old_path" "$NEW_ORIGIN$new_path" "$host$old_path -> $new_path"
  done <<<"$CASES"
done

head_ "Catch-all (unmapped paths must reach the homepage, never 404)"
for host in "${OLD_HOSTS[@]}"; do
  check_redirect "https://$host$CATCH_ALL_PATH" "$NEW_ORIGIN/" "$host$CATCH_ALL_PATH -> /"
done

head_ "Query strings survive the hop"
# nginx's `map` keys on $uri, which excludes the query string; the server block
# re-appends it via $is_args$args. If that suffix is ever dropped, every
# campaign/UTM link pointing at the old domain loses its attribution on
# arrival — invisible in a status-code-only check.
for host in "${OLD_HOSTS[@]}"; do
  check_redirect "https://$host/kontakt/?utm_source=instagram" \
    "$NEW_ORIGIN/kontakt?utm_source=instagram" "$host/kontakt/?utm_source=… -> query preserved"
done

# --- DNS lookups -----------------------------------------------------------
# `dig` is the natural tool and is present on the server, but this script is
# also useful from a workstation, and Git Bash on Windows ships nslookup and
# no dig. That difference matters more than it looks: an absent lookup tool
# must never be indistinguishable from a clean result. "No AAAA found" is a
# PASS below, so a silently-failing lookup would report the single most
# consequential check as green on the machine least likely to have the tool.
# Hence: try dig, fall back to nslookup, and if neither exists say so and fail
# the check rather than guessing.
have() { command -v "$1" >/dev/null 2>&1; }

if have dig || have nslookup; then
  DNS_TOOL=$(have dig && echo dig || echo nslookup)
else
  DNS_TOOL=""
fi

# Emits one IPv6 address per line, nothing else.
lookup_aaaa() {
  local host="$1"
  case "$DNS_TOOL" in
    dig) dig +short AAAA "$host" 2>/dev/null | grep ':' ;;
    # Everything before the first `Name:` is the resolver's own banner —
    # including its address, which would otherwise be scraped as an answer.
    nslookup) nslookup -type=AAAA "$host" 2>/dev/null | sed -n '/^Name:/,$p' \
                | grep -oiE '([0-9a-f]{0,4}:){2,}[0-9a-f]{0,4}' ;;
  esac
}

lookup_mx() {
  local host="$1"
  case "$DNS_TOOL" in
    dig) dig +short MX "$host" 2>/dev/null | grep -v '^$' ;;
    nslookup) nslookup -type=MX "$host" 2>/dev/null | grep -i 'mail exchanger' ;;
  esac
}

head_ "No stale AAAA on the legacy domain"
# The VPS has no global IPv6 (docs/DNS-RECORDS.md). The old zone shipped AAAA
# records pointing at IONOS, and an AAAA that outlives the migration is the
# quietest possible failure: IPv6-capable clients try it FIRST and land on the
# dead old host, so they never see any of the 301s verified above. Googlebot
# crawls over IPv6, which makes this precisely the traffic the migration is for.
if [ -z "$DNS_TOOL" ]; then
  bad "neither dig nor nslookup found — cannot check for stale AAAA records (install dnsutils/bind-utils)"
else
  for host in "${OLD_HOSTS[@]}"; do
    aaaa=$(lookup_aaaa "$host")
    if [ -n "$aaaa" ]; then
      bad "$host still has an AAAA record ($(echo "$aaaa" | tr '\n' ' ' | sed 's/ $//')) — delete it, see docs/DNS-RECORDS.md Phase 3"
    else
      ok "$host has no AAAA"
    fi
  done
fi

head_ "Mail for the old domain is untouched"
# A/AAAA and MX are independent; this only catches the case where the zone was
# deleted and recreated rather than edited, which would silently stop mail to
# @veystunesofficial.de while every redirect above still passes.
if [ -z "$DNS_TOOL" ]; then
  bad "neither dig nor nslookup found — cannot check the legacy MX records"
else
  mx=$(lookup_mx veystunesofficial.de)
  if [ -n "$mx" ]; then
    ok "veystunesofficial.de still publishes MX"
  else
    bad "veystunesofficial.de publishes no MX — was the zone recreated instead of edited?"
  fi
fi

printf '\n\033[1m%d passed, %d failed\033[0m\n' "$pass" "$fail"
[ "$fail" -eq 0 ] || exit 1
