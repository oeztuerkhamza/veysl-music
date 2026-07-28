#!/usr/bin/env bash
# dj-veys.de — backup and restore for the two things that matter: the Payload
# SQLite database (real customer enquiries live here) and the `media/`
# uploads volume. Self-contained — runs disposable alpine containers against
# the named Docker volumes directly, so it needs nothing installed on the
# host beyond Docker itself (no local sqlite3 dependency, unlike reading the
# volume's host mountpoint path directly, which is more fragile/permission-
# sensitive across different Docker storage drivers).
#
# Usage:
#   deploy/backup.sh                          # take a backup now
#   deploy/backup.sh restore <db.db> <media.tar.gz>   # restore from backups
#   deploy/backup.sh list                     # list available backups
#
# Cron (as the deploy user, `crontab -e`) — see docs/DEPLOYMENT.md:
#   0 3 * * * /opt/veysl/app/deploy/backup.sh >> /opt/veysl/app/backups/backup.log 2>&1
#
# IMPORTANT — the DB backup uses SQLite's own `.backup` command, not a raw
# file copy. A raw `cp`/`tar` of a live SQLite file can grab it mid-write and
# produce a torn, unrestorable snapshot (worse under WAL mode, but not safe
# even without it) — `.backup` is SQLite's own API specifically for taking a
# consistent snapshot of a database that's actively being written to.

set -euo pipefail
cd "$(dirname "$0")/.."

BACKUP_DIR="${BACKUP_DIR:-$(pwd)/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
DB_VOLUME="${DB_VOLUME:-veysl-data}"
MEDIA_VOLUME="${MEDIA_VOLUME:-veysl-media}"
DB_FILENAME="${DB_FILENAME:-veysl-cms.db}"
# Small, always-available base image; sqlite/tar are installed on the fly in
# the throwaway container rather than requiring a custom prebuilt image.
TOOL_IMAGE="alpine:3.20"

log() { printf '\n\033[1;32m==> %s\033[0m\n' "$1"; }
die() { printf '\033[1;31mxx %s\033[0m\n' "$1" >&2; exit 1; }

mkdir -p "$BACKUP_DIR/db" "$BACKUP_DIR/media"

cmd="${1:-backup}"

case "$cmd" in
  backup)
    ts="$(date -u +%Y%m%dT%H%M%SZ)"
    db_out="veysl-cms-${ts}.db"
    media_out="veysl-media-${ts}.tar.gz"

    log "Backing up database ($DB_VOLUME/$DB_FILENAME -> $db_out)"
    docker run --rm \
      -v "${DB_VOLUME}:/data:ro" \
      -v "${BACKUP_DIR}/db:/backup" \
      "$TOOL_IMAGE" sh -c "
        set -e
        apk add --no-cache sqlite >/dev/null
        [ -f \"/data/${DB_FILENAME}\" ] || { echo 'no DB file found in volume yet — nothing to back up'; exit 0; }
        sqlite3 \"/data/${DB_FILENAME}\" \".backup '/backup/${db_out}'\"
      "
    if [ -f "${BACKUP_DIR}/db/${db_out}" ]; then
      gzip -f "${BACKUP_DIR}/db/${db_out}"
      echo "  -> ${BACKUP_DIR}/db/${db_out}.gz"
    fi

    log "Backing up media ($MEDIA_VOLUME -> $media_out)"
    docker run --rm \
      -v "${MEDIA_VOLUME}:/data:ro" \
      -v "${BACKUP_DIR}/media:/backup" \
      "$TOOL_IMAGE" sh -c "tar czf /backup/${media_out} -C /data . 2>/dev/null || true"
    echo "  -> ${BACKUP_DIR}/media/${media_out}"

    log "Applying retention (${RETENTION_DAYS} days)"
    find "${BACKUP_DIR}/db" -name 'veysl-cms-*.db.gz' -mtime "+${RETENTION_DAYS}" -print -delete
    find "${BACKUP_DIR}/media" -name 'veysl-media-*.tar.gz' -mtime "+${RETENTION_DAYS}" -print -delete

    log "Backup complete."
    ;;

  list)
    echo "Database backups (${BACKUP_DIR}/db):"
    ls -lh "${BACKUP_DIR}/db" 2>/dev/null || echo "  (none yet)"
    echo "Media backups (${BACKUP_DIR}/media):"
    ls -lh "${BACKUP_DIR}/media" 2>/dev/null || echo "  (none yet)"
    ;;

  restore)
    db_backup="${2:-}"
    media_backup="${3:-}"
    [ -n "$db_backup" ] && [ -n "$media_backup" ] || die "Usage: deploy/backup.sh restore <db-backup.db[.gz]> <media-backup.tar.gz>"
    [ -f "$db_backup" ] || die "DB backup not found: $db_backup"
    [ -f "$media_backup" ] || die "Media backup not found: $media_backup"

    # Restoring into the volumes the running app actually uses is the
    # destructive case and needs the app stopped. Restoring into scratch
    # volumes — which is how you rehearse a restore without an outage — is
    # not destructive and must not touch production. Without this
    # distinction the only way to test the restore path was to take the
    # site down, so in practice nobody tests it, and the first real
    # execution of this code is during an actual incident.
    is_live_restore=0
    if [ "$DB_VOLUME" = "veysl-data" ] || [ "$MEDIA_VOLUME" = "veysl-media" ]; then
      is_live_restore=1
    fi

    if [ "$is_live_restore" -eq 1 ]; then
      echo "This will OVERWRITE the LIVE database and media volumes with:"
    else
      echo "Restoring into scratch volumes (${DB_VOLUME} / ${MEDIA_VOLUME}) — the live site is untouched:"
    fi
    echo "  DB:    $db_backup"
    echo "  Media: $media_backup"

    # `BACKUP_ASSUME_YES=1` exists so the restore can be rehearsed from a
    # script or a cron-driven drill. It is deliberately an environment
    # variable rather than a flag: it should be an explicit, visible choice
    # at the call site, not something that slips into a copy-pasted command.
    if [ "${BACKUP_ASSUME_YES:-0}" = "1" ]; then
      echo "  BACKUP_ASSUME_YES=1 — proceeding without prompting."
    else
      read -r -p "Type 'yes' to continue: " confirm
      [ "$confirm" = "yes" ] || die "Aborted."
    fi

    if [ "$is_live_restore" -eq 1 ]; then
      log "Stopping app"
      docker compose stop app || true
    fi

    log "Restoring database"
    db_abs="$(cd "$(dirname "$db_backup")" && pwd)/$(basename "$db_backup")"
    restore_source="$db_abs"
    workdir="$(mktemp -d)"
    trap 'rm -rf "$workdir"' EXIT
    if [[ "$db_abs" == *.gz ]]; then
      gunzip -c "$db_abs" >"$workdir/restore.db"
      restore_source="$workdir/restore.db"
    fi
    docker run --rm \
      -v "${DB_VOLUME}:/data" \
      -v "$(dirname "$restore_source"):/restore:ro" \
      "$TOOL_IMAGE" sh -c "
        cp \"/restore/$(basename "$restore_source")\" \"/data/${DB_FILENAME}\"
        rm -f \"/data/${DB_FILENAME}-wal\" \"/data/${DB_FILENAME}-shm\"
      "

    log "Restoring media"
    media_abs="$(cd "$(dirname "$media_backup")" && pwd)/$(basename "$media_backup")"
    docker run --rm \
      -v "${MEDIA_VOLUME}:/data" \
      -v "$(dirname "$media_abs"):/restore:ro" \
      "$TOOL_IMAGE" sh -c "
        rm -rf /data/* /data/..?* /data/.[!.]* 2>/dev/null || true
        tar xzf \"/restore/$(basename "$media_abs")\" -C /data
      "

    if [ "$is_live_restore" -eq 1 ]; then
      log "Starting app"
      docker compose up -d app
      log "Restore complete. Verify: log into /admin and spot-check a few enquiries/media items."
    else
      log "Restore into scratch volumes complete — the live app was never stopped."
      echo "  Inspect with:"
      echo "    docker run --rm -v ${DB_VOLUME}:/data ${TOOL_IMAGE} sh -c 'apk add -q sqlite && sqlite3 /data/${DB_FILENAME} \".tables\"'"
      echo "  Then remove the scratch volumes:"
      echo "    docker volume rm ${DB_VOLUME} ${MEDIA_VOLUME}"
    fi
    ;;

  *)
    die "Unknown command '$cmd'. Usage: deploy/backup.sh [backup|list|restore <db> <media>]"
    ;;
esac
