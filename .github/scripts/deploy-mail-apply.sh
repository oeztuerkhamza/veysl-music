#!/usr/bin/env bash
# Runs ON THE SERVER, fed to `ssh … 'bash -s'` by
# .github/workflows/deploy-mail.yml.
#
# Reconciles the self-hosted mail stack with the committed compose file, then
# proves the one thing that reconciliation is for: that the application can
# actually open a connection to the mailserver.
#
# Why this exists at all: `deploy/deploy.sh` deliberately does not touch the
# mail stack — it has its own lifecycle so a website deploy never restarts the
# mailbox. The consequence was that the mail stack had NO deployment path of
# any kind, so a fix to its compose file could only be applied by hand over
# SSH. That is exactly the gap that let a broken app→mailserver network sit
# unnoticed while three enquiries timed out.
#
# Scope is deliberately narrow. It recreates one service. It never runs `down`,
# never touches a volume, and never passes `-v`: the mailboxes live in
# ./docker-data and losing them would be unrecoverable.
set -uo pipefail

APP_DIR=${APP_DIR:-/opt/veysl/app}
APP_CONTAINER=${APP_CONTAINER:-veysl-app}
MAIL_CONTAINER=${MAIL_CONTAINER:-mailserver}
COMPOSE_FILE=deploy/mail/docker-compose.mail.yml
REF=${REF:-master}

section() { printf '\n==== %s ====\n' "$1"; }
die() { printf '\nFATAL: %s\n' "$1"; exit 1; }

cd "$APP_DIR" 2>/dev/null || die "$APP_DIR does not exist or is not readable by $(whoami)."

section "Bringing the checkout up to date ($REF)"
git fetch --prune origin || die "git fetch failed."
git checkout "$REF" || die "could not check out $REF."
# --ff-only so local edits on a production box surface loudly instead of being
# merged or clobbered. Untracked paths (deploy/mail/docker-data/) are unaffected.
git merge --ff-only "origin/$REF" || die "git merge --ff-only failed — there are local commits or edits in $APP_DIR. Resolve by hand."
git log --oneline -1

section "Validating the compose file before touching anything"
# Catches an interpolation or syntax error, and confirms the external network
# and volume names resolve, while the stack is still untouched.
docker compose -f "$COMPOSE_FILE" config -q || die "compose file is invalid — nothing was changed."
echo "OK — compose file parses and its external network/volume resolve."

section "State before"
docker compose -f "$COMPOSE_FILE" ps || true

section "Applying: up -d $MAIL_CONTAINER"
# No `down`, no `-v`. Compose recreates only this service, and only because its
# network membership changed.
if ! docker compose -f "$COMPOSE_FILE" up -d "$MAIL_CONTAINER"; then
  echo
  echo "The apply failed. Current state:"
  docker compose -f "$COMPOSE_FILE" ps || true
  die "could not bring up $MAIL_CONTAINER. Mail may be down — check the output above."
fi

section "Waiting for the mailserver to accept connections again"
# docker-mailserver takes a few seconds to start Postfix and Dovecot. Without
# this the verification below would fail on timing rather than on the thing it
# means to test.
ready=no
for _ in $(seq 1 30); do
  if docker exec "$MAIL_CONTAINER" ss -lnt 2>/dev/null | grep -q ':587'; then
    ready=yes
    break
  fi
  sleep 2
done
if [ "$ready" = yes ]; then
  echo "OK — the mailserver is listening on 587 again."
else
  echo "WARNING: 587 is not listening yet after 60s. It may still be starting; re-run the mail doctor in a minute."
fi

section "Do the app and the mailserver now share a network?"
container_nets() {
  docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' "$1" 2>/dev/null
}
app_nets=$(container_nets "$APP_CONTAINER")
mail_nets=$(container_nets "$MAIL_CONTAINER")
echo "app  ($APP_CONTAINER):  ${app_nets:-(unknown)}"
echo "mail ($MAIL_CONTAINER): ${mail_nets:-(unknown)}"
shared=""
for n in $app_nets; do
  for m in $mail_nets; do
    [ "$n" = "$m" ] && shared="$shared $n"
  done
done
if [ -n "$shared" ]; then
  echo "RESULT: shared network(s) —$shared"
else
  echo "RESULT: still NO shared network. The alias in $COMPOSE_FILE did not take effect."
fi

section "The decisive check: app → mailserver on the port enquiry mail uses"
env_dump=$(docker exec "$APP_CONTAINER" printenv 2>/dev/null)
value_of() { printf '%s\n' "$env_dump" | sed -n "s/^$1=//p" | head -1; }
smtp_host=$(value_of SMTP_HOST)
smtp_port=$(value_of SMTP_PORT)
smtp_port=${smtp_port:-587}

if [ -z "$smtp_host" ]; then
  echo "SMTP_HOST is unset — nothing to test."
else
  if docker exec "$APP_CONTAINER" node -e '
      const net = require("net");
      const [host, port] = process.argv.slice(1);
      const socket = net.createConnection({ host, port: Number(port) });
      socket.setTimeout(8000);
      socket.on("connect", () => { console.log(`CONNECTED to ${host}:${port}`); socket.destroy(); process.exit(0); });
      socket.on("timeout", () => { console.log(`TIMEOUT connecting to ${host}:${port}`); process.exit(1); });
      socket.on("error", (err) => { console.log(`ERROR ${err.code} connecting to ${host}:${port}`); process.exit(1); });
    ' "$smtp_host" "$smtp_port" 2>&1; then
    echo "RESULT: FIXED — the app can now reach the mailserver."
  else
    echo "RESULT: STILL BROKEN — the app cannot reach $smtp_host:$smtp_port."
  fi
fi

section "Credentials (connection + login, sends no mail)"
# Only meaningful once the connection works. This is where a wrong SMTP_PASS
# finally becomes visible as EAUTH/535 instead of hiding behind a timeout.
# Secret-shaped lines are scrubbed: this output goes into a CI log.
docker exec "$APP_CONTAINER" node scripts/mail-test.mjs --verify-only 2>&1 \
  | sed -E \
      -e 's/[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/…@\1/g' \
      -e 's/^([[:space:]]*(SMTP_PASS|RESEND_API_KEY)[[:space:]]*=).*/\1 (redacted by CI)/' \
  | tail -30

section "Done"
