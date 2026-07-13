#!/usr/bin/env bash
# Online SQLite backup for the Xverse V2 database. Run on the VPS host —
# typically from cron (see docs/v2-operations.md).
#
#   ./backup-db.sh [environment]   # default: production
#
# Uses SQLite's backup API from inside the running container (safe while
# the app is writing, unlike copying a WAL-mode file), stages the snapshot
# in the data volume, copies it to the host, and rotates old copies.
set -euo pipefail

ENVIRONMENT="${1:-production}"
PRODUCT="xverse"
PROJECT="${PRODUCT}-${ENVIRONMENT}"
# Matches the HorizonX deployment standard layout on the VPS.
DEPLOY_DIR="${DEPLOY_DIR:-/opt/horizonx/products/${PRODUCT}/${ENVIRONMENT}}"
BACKUP_DIR="${BACKUP_DIR:-/opt/horizonx/backups/${PRODUCT}/${ENVIRONMENT}}"
KEEP_DAYS="${KEEP_DAYS:-14}"

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
SNAPSHOT="/data/backups/xverse-${STAMP}.db"

mkdir -p "${BACKUP_DIR}"
cd "${DEPLOY_DIR}"

compose() {
  docker compose -p "${PROJECT}" -f docker-compose.yml --env-file .env "$@"
}

# 1) Transaction-safe snapshot via better-sqlite3's backup API.
compose exec -T app node -e "
  const Database = require('better-sqlite3');
  const fs = require('node:fs');
  fs.mkdirSync('/data/backups', { recursive: true });
  const db = new Database(process.env.DATABASE_PATH || '/data/xverse.db', { readonly: true });
  db.backup('${SNAPSHOT}').then(() => {
    console.log('snapshot written: ${SNAPSHOT}');
    process.exit(0);
  }).catch((err) => { console.error(err); process.exit(1); });
"

# 2) Copy the snapshot out of the container to host storage.
compose cp "app:${SNAPSHOT}" "${BACKUP_DIR}/xverse-${STAMP}.db"

# 3) Remove the in-volume staging copy and rotate host backups.
compose exec -T app node -e "require('node:fs').rmSync('${SNAPSHOT}', { force: true })"
find "${BACKUP_DIR}" -name 'xverse-*.db' -mtime "+${KEEP_DAYS}" -delete

echo "backup complete: ${BACKUP_DIR}/xverse-${STAMP}.db"
