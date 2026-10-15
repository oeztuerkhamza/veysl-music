#!/bin/sh
# Baut www.praxis-gueltekin.de neu, sobald sich auf GitHub etwas ändert.
#
# Fragt alle INTERVAL Sekunden den neuesten Commit von `master` ab (ein
# `git ls-remote`, ein paar hundert Bytes). Ist er neu: auschecken, bauen,
# prüfen und nach /out kopieren — das ist /opt/veysl/sites/praxis-gueltekin,
# von wo nginx die Seite ausliefert.
#
# Pull statt Push, mit Absicht: Das Praxis-Repo braucht so keinen Schlüssel
# für diesen Server. Umgekehrt hat der Server nur einen Deploy-Key mit
# Leserecht auf genau dieses eine Repo (GitHub → Settings → Deploy keys).
#
# Ein kaputter Build erreicht die Seite nie: kopiert wird erst nach erfolgreichem
# Build und Prüfung. Danach wird derselbe Commit nicht immer wieder gebaut,
# sondern erst der nächste.

set -u

REPO="${REPO:-git@github.com:oeztuerkhamza/praxis-gueltekin.git}"
BRANCH="${BRANCH:-master}"
INTERVAL="${INTERVAL:-60}"
KEY=/data/deploy_key
SRC=/data/src
OUT=/out

export GIT_SSH_COMMAND="ssh -i $KEY -o IdentitiesOnly=yes -o BatchMode=yes -o UserKnownHostsFile=/app/github_known_hosts -o StrictHostKeyChecking=yes"

log() { echo "$(date -u '+%Y-%m-%dT%H:%M:%SZ') $*"; }

build() {
  sha="$1"
  if [ ! -d "$SRC/.git" ]; then
    rm -rf "$SRC"
    git clone --quiet --branch "$BRANCH" "$REPO" "$SRC" || return 1
  fi
  cd "$SRC" || return 1
  git fetch --quiet origin "$BRANCH" && git reset --quiet --hard "$sha" && git clean -qfdx -e node_modules || return 1

  # npm ci nur, wenn sich die Abhängigkeiten geändert haben — sonst dauert
  # jede Textkorrektur eine Minute länger als nötig.
  lock="$(sha256sum package-lock.json | cut -d' ' -f1)"
  if [ "$lock" != "$(cat /data/lock-sha 2>/dev/null)" ] || [ ! -d node_modules ]; then
    log "Abhängigkeiten installieren"
    npm ci --omit=dev --ignore-scripts --no-audit --no-fund || return 1
    echo "$lock" > /data/lock-sha
  fi

  npm run build || return 1

  # Dieselben Mindestprüfungen wie die Deploy-Workflows im Praxis-Repo.
  [ -f dist/index.html ] && [ -f dist/sitemap.xml ] && [ -f dist/admin/index.html ] || { log "Build unvollständig"; return 1; }
  pages=$(find dist -name index.html | wc -l)
  [ "$pages" -ge 90 ] || { log "nur $pages Seiten gebaut, erwartet 90+"; return 1; }

  # --delete hält die Seite deckungsgleich mit dem Build (ein im Panel
  # gelöschter Artikel verschwindet auch online). Ausgenommen sind Dateien,
  # die nicht aus dem Build kommen: Zertifikats-Challenges und
  # Suchmaschinen-Verifizierungen.
  rsync -a --delete \
    --exclude='.well-known/' --exclude='google*.html' --exclude='BingSiteAuth.xml' \
    dist/ "$OUT/" || return 1
  log "Veröffentlicht: $sha ($pages Seiten)"
}

log "Builder läuft: $REPO ($BRANCH), alle ${INTERVAL}s"
while :; do
  date -u +%s > /data/heartbeat
  if [ ! -f "$KEY" ]; then
    log "Kein Deploy-Key unter $KEY — wartet."
  else
    remote="$(git ls-remote "$REPO" "refs/heads/$BRANCH" 2>/tmp/ls-remote.err | cut -f1)"
    if [ -z "$remote" ]; then
      log "GitHub nicht erreichbar oder Deploy-Key noch nicht freigegeben: $(tail -n1 /tmp/ls-remote.err)"
    elif [ "$remote" != "$(cat /data/built-sha 2>/dev/null)" ] && [ "$remote" != "$(cat /data/failed-sha 2>/dev/null)" ]; then
      log "Neuer Stand $remote — baue"
      if (build "$remote"); then
        echo "$remote" > /data/built-sha
        rm -f /data/failed-sha
      else
        echo "$remote" > /data/failed-sha
        log "Build von $remote fehlgeschlagen — die Seite bleibt auf dem vorigen Stand."
      fi
    fi
  fi
  sleep "$INTERVAL"
done
