#!/usr/bin/env bash
# Laeuft auf dem Server, gestartet von .github/workflows/deploy-praxis-cms.yml.
#
# Erwartet vom Workflow:
#   /tmp/praxis-cms-src.tgz        — tools/praxis-cms aus diesem Repo
#   /opt/veysl/praxis-cms/.env     — GitHub-OAuth-Daten aus den Secrets
#
# Unberuehrt bleibt data/: dort liegen der Deploy-Key des Servers fuer das
# Praxis-Repo, die Arbeitskopie und der zuletzt gebaute Commit.

set -euo pipefail

DIR=/opt/veysl/praxis-cms
SRC=/tmp/praxis-cms-src.tgz
SITE_DIR=/opt/veysl/sites/praxis-gueltekin

[ -f "$SRC" ] || { echo "FEHLER: $SRC fehlt — der Upload-Schritt ist nicht gelaufen."; exit 1; }
cd "$DIR"

for var in GITHUB_CLIENT_ID GITHUB_CLIENT_SECRET ALLOWED_ORIGIN; do
  grep -qE "^${var}=.+" .env || { echo "FEHLER: In .env fehlt ein Wert fuer $var."; exit 1; }
done

echo "== Quellstand entpacken =="
tar -xzf "$SRC" -C "$DIR"
rm -f "$SRC"
mkdir -p data "$SITE_DIR"

echo
echo "== Deploy-Key fuer das Praxis-Repo =="
if [ ! -f data/deploy_key ]; then
  if command -v ssh-keygen >/dev/null; then
    ssh-keygen -q -t ed25519 -N '' -C 'praxis-builder@dj-veys' -f data/deploy_key
  else
    docker run --rm -v "$DIR/data:/data" alpine:3 sh -c \
      "apk add -q openssh-keygen && ssh-keygen -q -t ed25519 -N '' -C 'praxis-builder@dj-veys' -f /data/deploy_key"
  fi
  echo "Neu erzeugt."
else
  echo "Vorhanden, wird weiterverwendet."
fi
chmod 600 data/deploy_key

echo
echo "== Netzwerk der Website =="
SITE_NETWORK="$(docker inspect veysl-nginx -f '{{range $k, $v := .NetworkSettings.Networks}}{{$k}}{{"\n"}}{{end}}' 2>/dev/null | grep -m1 . || true)"
[ -n "$SITE_NETWORK" ] || { echo "FEHLER: Container veysl-nginx nicht gefunden — laeuft die Website?"; exit 1; }
echo "$SITE_NETWORK"
export SITE_NETWORK

echo
echo "== Container bauen und starten =="
docker compose build --quiet
docker compose up -d
sleep 8

echo
echo "== Letzte Logzeilen =="
docker compose logs --tail 15 --no-color

echo
echo "== Pruefung =="
ok=1
for c in praxis-cms-oauth praxis-builder; do
  status="$(docker inspect -f '{{.State.Status}}' "$c" 2>/dev/null || echo weg)"
  echo "$c: $status"
  [ "$status" = running ] || ok=0
done

# Die Anmeldung zeigt das E-Mail-Formular (200, sobald CMS_USERS gesetzt ist)
# oder leitet direkt zu GitHub weiter (302, nur GitHub-Login). Geprueft mit
# Node im Container selbst: BusyBox-wget (Alpine) kennt --max-redirect nicht
# und lieferte deshalb beim ersten Deploy ein falsches "antwortet nicht".
if docker exec praxis-cms-oauth node -e "fetch('http://127.0.0.1:8787/oauth/auth',{redirect:'manual'}).then(async r=>process.exit((r.status===302&&/github\.com\/login\/oauth/.test(r.headers.get('location')||''))||(r.status===200&&/action=\"\/oauth\/login\"/.test(await r.text()))?0:1),()=>process.exit(1))"; then
  echo "OAuth-Bruecke: antwortet (Anmeldeformular oder 302 zu GitHub)"
else
  echo "OAuth-Bruecke: antwortet NICHT wie erwartet"
  ok=0
fi

# Von aussen, ueber nginx und TLS. Geht erst, wenn die Website mit der
# /oauth/-Regel deployt ist (eigener Workflow) — daher nur ein Hinweis.
if command -v curl >/dev/null; then
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 https://www.praxis-gueltekin.de/oauth/auth || true)"
  if [ "$code" = 302 ] || [ "$code" = 200 ]; then
    echo "Ueber nginx: OK (https://www.praxis-gueltekin.de/oauth/auth → $code)"
  else
    echo "Ueber nginx: noch nicht erreichbar (HTTP $code — Website-Deploy mit der /oauth/-Regel abwarten)"
  fi
fi

echo
if docker exec praxis-builder sh -c 'GIT_SSH_COMMAND="ssh -i /data/deploy_key -o IdentitiesOnly=yes -o BatchMode=yes -o UserKnownHostsFile=/app/github_known_hosts" git ls-remote git@github.com:oeztuerkhamza/praxis-gueltekin.git HEAD' >/dev/null 2>&1; then
  echo "DEPLOY-KEY: FREIGEGEBEN"
else
  echo "DEPLOY-KEY: NOCH NICHT FREIGEGEBEN"
  echo "Diesen oeffentlichen Schluessel im Praxis-Repo eintragen:"
  echo "  GitHub → oeztuerkhamza/praxis-gueltekin → Settings → Deploy keys → Add deploy key"
  echo "  Titel: dj-veys-server   ·   'Allow write access' NICHT ankreuzen"
fi
echo "PUBLIC KEY: $(cat data/deploy_key.pub)"

echo
if [ "$ok" = 1 ]; then echo "RESULT: RUNNING"; else echo "RESULT: NOT RUNNING"; exit 1; fi
