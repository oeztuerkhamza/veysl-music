#!/usr/bin/env bash
# Laeuft auf dem Server, gestartet von .github/workflows/deploy-watcher.yml.
#
# Erwartet, dass der Workflow vorher zwei Dateien hochgeladen hat:
#   /tmp/watcher-src.tgz  — der Quellstand aus tools/kleinanzeigen-watcher
#   .env                  — mit dem Bot-Token, aus dem GitHub-Secret
#
# Bewusst nicht enthalten: data/. Dort liegen watches.json (die Suchen) und
# state.json (welche Anzeigen schon gemeldet sind). Ein Deploy, der das
# ueberschreibt, wuerde die Suchen loeschen und beim naechsten Start die
# komplette erste Seite erneut verschicken.

set -euo pipefail

DIR=/opt/veysl/kleinanzeigen-watcher
SRC=/tmp/watcher-src.tgz

if [ ! -f "$SRC" ]; then
  echo "FEHLER: $SRC fehlt — der Upload-Schritt des Workflows ist nicht gelaufen."
  exit 1
fi

mkdir -p "$DIR/data"
cd "$DIR"

# Nicht nur "Datei vorhanden": eine .env mit `TELEGRAM_BOT_TOKEN=` und nichts
# dahinter ist nicht leer, aber genauso nutzlos — der Container startet und
# stirbt sofort wieder.
if ! grep -qE '^TELEGRAM_BOT_TOKEN=.+' .env; then
  echo "FEHLER: In .env steht kein Token-Wert. Ohne ihn kann der Watcher nichts senden."
  exit 1
fi

echo "== Quellstand entpacken =="
# Nur Code. data/ und .env stehen nicht im Archiv und bleiben unberuehrt.
tar -xzf "$SRC" -C "$DIR"
rm -f "$SRC"
find . -maxdepth 2 -type f -name '*.mjs' | sort

echo
echo "== Image bauen =="
docker compose build

echo
echo "== Erste Suche anlegen, falls noch keine da ist =="
if [ ! -f data/watches.json ]; then
  echo "Keine data/watches.json — der Watcher hat noch keine Suche."
  echo "Nach dem Deploy anlegen mit:"
  echo "  cd $DIR && docker compose run --rm watcher --add \"<URL>\""
else
  # -T und </dev/null sind hier nicht optional: dieses Skript kommt selbst ueber
  # stdin herein (ssh ... 'bash -s' < skript). `docker compose run` haengt sich
  # standardmaessig an stdin und verschluckt dabei den Rest des Skripts — der
  # Deploy endete dann stillschweigend genau hier, ohne den Container zu
  # starten, und meldete trotzdem Erfolg.
  docker compose run --rm -T watcher --list </dev/null || true
fi

echo
echo "== Container starten =="
docker compose up -d

# `up -d` meldet Erfolg, sobald der Container gestartet ist — nicht, ob er
# auch laeuft. Ein falscher Token laesst ihn sofort wieder sterben, und genau
# das soll dieser Deploy als Fehler melden statt als Erfolg.
sleep 8

STATUS=$(docker inspect -f '{{.State.Status}}' kleinanzeigen-watcher 2>/dev/null || echo 'weg')
RESTARTS=$(docker inspect -f '{{.RestartCount}}' kleinanzeigen-watcher 2>/dev/null || echo '?')

echo
echo "== Letzte Logzeilen =="
docker compose logs --tail 20 --no-color

echo
if [ "$STATUS" = 'running' ] && [ "${RESTARTS:-0}" -lt 2 ]; then
  echo "RESULT: RUNNING"
else
  echo "Status: $STATUS, Neustarts: $RESTARTS"
  echo "RESULT: NOT RUNNING"
  exit 1
fi
