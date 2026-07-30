#!/usr/bin/env bash
# Runs ON THE SERVER, fed to `ssh … 'bash -s'` by .github/workflows/mail-doctor.yml.
# Collects the handful of facts that only a shell on the VPS can establish, and
# nothing else.
#
# The whole point of this file is the split it serves. `/api/health/mail`
# already answers everything the application can see about itself: which
# transport is configured, whether the credentials are complete, whether the
# mailserver accepts a login. It cannot answer the one question that decides
# whether a customer actually received their confirmation — whether Postfix,
# having accepted the message, then managed to deliver it. That lives in the
# queue, and the queue is here.
#
# ------------------------------------------------------------------------
# EVERYTHING THIS PRINTS ENDS UP IN A GITHUB ACTIONS LOG, which is a wider
# audience than a server log. Two rules follow, and both are enforced below
# rather than trusted:
#   1. No secret values. Not even partially — `scripts/mail-test.mjs` masks
#      SMTP_PASS as `ab****yz`, and four characters of a real password do not
#      belong in CI. Those lines are scrubbed, not relied upon.
#   2. No customer data. Application log lines are already redacted by
#      `redact()` in the route handlers, but a container built before that was
#      true would dump whole mail bodies, so every line goes through an
#      address/phone scrubber on the way out.
# ------------------------------------------------------------------------
#
# Optional input, passed as an environment assignment by the workflow (and
# validated there against a strict allowlist, so it cannot carry shell
# metacharacters): TEST_MAIL_TO — send one real test mail to this address.
set -uo pipefail

APP_DIR=${APP_DIR:-/opt/veysl/app}
APP_CONTAINER=${APP_CONTAINER:-veysl-app}
MAIL_CONTAINER=${MAIL_CONTAINER:-mailserver}

# Reduce any address to `…@domain` and any phone-shaped digit run to a
# placeholder. Applied to every command output that could contain either.
scrub() {
  sed -E \
    -e 's/[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/…@\1/g' \
    -e 's/\+?[0-9][0-9 ()\/-]{7,}[0-9]/(phone redacted)/g' \
    -e 's/^([[:space:]]*(SMTP_PASS|RESEND_API_KEY|MAIL_HEALTH_TOKEN|PAYLOAD_SECRET)[[:space:]]*=).*/\1 (redacted by CI)/'
}

section() { printf '\n==== %s ====\n' "$1"; }

cd "$APP_DIR" 2>/dev/null || {
  echo "FATAL: $APP_DIR does not exist or is not readable by $(whoami)."
  exit 1
}

section "Deployed commit"
# The first thing worth knowing when a fix "doesn't work": whether the fix is
# actually on the box. deploy/deploy.sh pulls before it builds, so this is the
# source the running image was built from.
git log --oneline -3 2>/dev/null || echo "(not a git checkout — source synced another way)"
git status --porcelain 2>/dev/null | head -5

section "Containers"
if ! docker ps --format '{{.Names}}\t{{.Status}}' 2>&1; then
  echo "FATAL: cannot talk to docker as $(whoami). Is this user in the docker group?"
  exit 1
fi

section "Mail configuration (verdicts only — never values)"
# One `docker exec printenv`, processed here. The dump itself is never echoed:
# it contains SMTP_PASS, PAYLOAD_SECRET and every other secret the app holds.
env_dump=$(docker exec "$APP_CONTAINER" printenv 2>/dev/null)
# Defined unconditionally so the reachability section further down can use it.
value_of() { printf '%s\n' "$env_dump" | sed -n "s/^$1=//p" | head -1; }

if [ -z "$env_dump" ]; then
  echo "(could not read the environment of container $APP_CONTAINER — is it running?)"
else
  # Not secrets, and reading them is most of the diagnosis: a transport of
  # `console` explains total silence, and a host or port that is wrong explains
  # the rest.
  for var in BOOKING_TRANSPORT SMTP_HOST SMTP_PORT; do
    v=$(value_of "$var")
    if [ -n "$v" ]; then echo "$var = $v"; else echo "$var = (unset)"; fi
  done

  # Addresses: domain only. They are the owner's own addresses rather than
  # customer data, but the domain is all any check here needs.
  for var in BOOKING_NOTIFY_EMAIL SMTP_USER SMTP_FROM_EMAIL RESEND_FROM_EMAIL; do
    v=$(value_of "$var")
    # Trailing `>` stripped: these are written in the display-name form
    # (`DJ Veys <no-reply@dj-veys.de>`), so `${v##*@}` alone reported the domain
    # as `dj-veys.de>`.
    if [ -n "$v" ]; then
      domain=${v##*@}
      echo "$var = (set, domain ${domain%>})"
    else
      echo "$var = (unset)"
    fi
  done

  # Secrets: presence and length only. Length is deliberate — it is what
  # catches the documented trap that an unquoted `#` in a .env password ends
  # the line, silently truncating a value that looks correct in the file.
  for var in SMTP_PASS RESEND_API_KEY MAIL_HEALTH_TOKEN; do
    v=$(value_of "$var")
    if [ -n "$v" ]; then echo "$var = (set, ${#v} characters)"; else echo "$var = (unset)"; fi
  done
fi

section "Application mail log (last 48h, redacted)"
# Only the bracketed prefixes the routes emit. That excludes the
# ConsoleTransport dumps wholesale, and `scrub` handles anything that slips
# through from an older image.
docker logs "$APP_CONTAINER" --since 48h 2>&1 \
  | grep -E '^\[(anfrage|kontakt|mail|health/mail)\]' \
  | tail -40 \
  | scrub \
  || echo "(no matching log lines — either nothing was submitted, or this image predates the tagged logging)"

# ---------------------------------------------------------------------------
# Can the application reach the mailserver at all?
#
# This section exists because of a fault it found on the first run: three real
# enquiries logged `owner notification failed Connection timeout` while the
# mailserver was up, its queue empty, outbound port 25 open and every DNS
# record correct. Everything looked healthy from both ends and no mail was
# sent, because the two containers were not on a common network — so the app
# resolved SMTP_HOST over public DNS and tried to connect back into the host's
# published port from inside the Docker bridge. Credentials and DNS cannot
# explain that, and nothing else here would have shown it.
# ---------------------------------------------------------------------------
section "Does the app share a Docker network with the mailserver?"
container_nets() {
  docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' "$1" 2>/dev/null
}
app_nets=$(container_nets "$APP_CONTAINER")
mail_nets=$(container_nets "$MAIL_CONTAINER")
echo "app  ($APP_CONTAINER):  ${app_nets:-(unknown)}"
echo "mail ($MAIL_CONTAINER): ${mail_nets:-(not running / unknown)}"
shared=""
for n in $app_nets; do
  for m in $mail_nets; do
    [ "$n" = "$m" ] && shared="$shared $n"
  done
done
if [ -n "$shared" ]; then
  echo "VERDICT: shared network(s) —$shared"
elif [ -z "$mail_nets" ]; then
  echo "VERDICT: no mailserver container to compare against."
else
  echo "VERDICT: NO shared network between the app and the mailserver."
  echo "  The app must then resolve SMTP_HOST to the public IP and connect back"
  echo "  into this host's published port. That is hairpin routing, it commonly"
  echo "  times out, and the timeout is indistinguishable from a mailserver"
  echo "  being down. Fix: put the mailserver on the app's network with a"
  echo "  network alias of SMTP_HOST, so the name resolves internally and the"
  echo "  TLS certificate still matches (deploy/mail/docker-compose.mail.yml)."
fi

section "App → SMTP_HOST:SMTP_PORT (the exact connection an enquiry mail needs)"
smtp_host=$(value_of SMTP_HOST)
smtp_port=$(value_of SMTP_PORT)
smtp_port=${smtp_port:-587}
if [ -z "$smtp_host" ]; then
  echo "(SMTP_HOST is unset — nothing to test)"
else
  # Run from inside the app container, because that is the only vantage point
  # whose result matters. A TCP connect only — no credentials, no mail.
  if docker exec "$APP_CONTAINER" node -e '
      const net = require("net");
      const [host, port] = process.argv.slice(1);
      const socket = net.createConnection({ host, port: Number(port) });
      socket.setTimeout(8000);
      socket.on("connect", () => { console.log(`CONNECTED to ${host}:${port}`); socket.destroy(); process.exit(0); });
      socket.on("timeout", () => { console.log(`TIMEOUT connecting to ${host}:${port}`); process.exit(1); });
      socket.on("error", (err) => { console.log(`ERROR ${err.code} connecting to ${host}:${port}`); process.exit(1); });
    ' "$smtp_host" "$smtp_port" 2>&1; then
    echo "VERDICT: the app can reach the mailserver. Credentials are the next thing to check."
  else
    echo "VERDICT: the app CANNOT open a TCP connection to $smtp_host:$smtp_port."
    echo "  No mail can be sent, whatever the credentials say. This is the fault"
    echo "  behind '[anfrage] owner notification failed Connection timeout'."
  fi
fi

if [ -n "$mail_nets" ]; then
  section "Is the mailserver actually listening on 25/587/993?"
  docker exec "$MAIL_CONTAINER" ss -lntp 2>/dev/null | grep -E ':(25|587|993)\b' \
    || echo '(could not read listening sockets — ss may be absent from the image)'
fi

section "Transport self-test (connection + login, sends nothing)"
docker exec "$APP_CONTAINER" node scripts/mail-test.mjs --verify-only 2>&1 | scrub | tail -30
echo "(If this says MODULE_NOT_FOUND, the running image predates the commit that"
echo " copies scripts/ into it — deploy master and re-run.)"

if docker ps --format '{{.Names}}' | grep -qx "$MAIL_CONTAINER"; then
  section "Postfix queue — the check nothing outside this box can make"
  # Empty queue = delivered. Entries = accepted by our Postfix and then stuck,
  # which is what "the enquiry reached me but the couple never got their
  # confirmation" looks like from the inside.
  queue=$(docker exec "$MAIL_CONTAINER" postqueue -p 2>&1)
  printf '%s\n' "$queue" | scrub | tail -25
  if printf '%s\n' "$queue" | grep -q 'Mail queue is empty'; then
    echo "VERDICT: queue empty — nothing is stuck."
  else
    echo "VERDICT: the queue is NOT empty. Accepted mail is not being delivered."
  fi

  section "Outbound TCP/25 (prerequisite 1 in docs/MAIL-SELFHOSTED.md)"
  # Without this, the server can accept mail forever and deliver none of it to
  # gmail.com/gmx.de/web.de. netcup blocks it by default; unblocking is a
  # support ticket, not a config change.
  if docker exec "$MAIL_CONTAINER" timeout 10 nc -zv gmail-smtp-in.l.google.com 25 2>&1 | tail -3; then
    echo "VERDICT: outbound port 25 is open."
  else
    echo "VERDICT: outbound TCP/25 looks BLOCKED. No mail can reach an external recipient until the provider unblocks it."
  fi
else
  section "Self-hosted mail stack"
  echo "No container named '$MAIL_CONTAINER' is running — deploy/mail/docker-compose.mail.yml was never started."
  echo "With BOOKING_TRANSPORT=smtp pointing at this box, that alone explains every failed notification."
fi

if [ -n "${TEST_MAIL_TO:-}" ]; then
  section "Real test mail to $TEST_MAIL_TO"
  docker exec "$APP_CONTAINER" node scripts/mail-test.mjs --to "$TEST_MAIL_TO" 2>&1 | scrub | tail -40
  echo
  echo "Reminder: 'accepted' above means our own mailserver took the message."
  echo "Check the queue section again in a minute to see whether it actually left."
fi

section "Done"
