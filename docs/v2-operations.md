# Xverse V2 — Operations Runbook

V2 makes Xverse stateful: a SQLite database (and, from Phase 4, uploaded
media) lives on the `xverse-data` Docker volume at `/data`. Everything else
follows the existing HorizonX deployment standard unchanged.

## New environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_PATH` | no (default `/data/xverse.db` in the image) | SQLite file location |
| `SESSION_SECRET` | **yes** | 32+ char random pepper for admin session tokens. `openssl rand -base64 48`. Rotating it signs every admin out (harmless). |
| `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD` | first deploy only | Creates the first admin **only when the users table is empty**. Remove both after the first successful login. Password must be ≥ 12 chars. |

Set them in the deploy directory's `.env` on the VPS (templates:
`.env.production.example`, `.env.staging.example`).

## First deploy of V2

1. Add the new variables to `/opt/horizonx/products/xverse/production/.env`.
2. Copy the updated `docker-compose.yml` (adds the `xverse-data` volume).
3. Deploy normally (Actions → Deploy). On boot the container:
   - applies committed Drizzle migrations (`drizzle/`),
   - creates the bootstrap admin if the users table is empty.
4. Sign in at `https://xverse.horizonx.site/admin/login`.
5. Remove `ADMIN_BOOTSTRAP_*` from `.env`.

Startup fails loudly if `SESSION_SECRET` is missing when auth is exercised,
and if migrations cannot apply — the compose healthcheck keeps the previous
container's rollback path (`rollback.sh`) available as before.

## Backups

`scripts/backup-db.sh` takes a **transaction-safe online snapshot** (SQLite
backup API via the running container), copies it to `$BACKUP_DIR`, and
rotates after 14 days.

The script's documented default is the HorizonX shared path
(`/opt/horizonx/backups/xverse/<env>/`), but that top-level directory is
root-owned on the VPS and the deploy SSH user (a non-root account with no
passwordless sudo) cannot create it. Until an infra admin provisions
`/opt/horizonx/backups` with the right ownership, production backups are
written under the product directory the deploy user already owns instead,
via a `BACKUP_DIR` override:

```
BACKUP_DIR=/opt/horizonx/products/xverse/production/backups
```

Nightly cron on the VPS:

```cron
17 3 * * * BACKUP_DIR=/opt/horizonx/products/xverse/production/backups /opt/horizonx/products/xverse/production/backup-db.sh production >> /var/log/xverse-backup.log 2>&1
```

Run it manually before any risky change (it is also the required step
before content migrations in later phases). Once `/opt/horizonx/backups`
exists with correct ownership, drop the `BACKUP_DIR` override (or move the
existing snapshots over) to rejoin the shared HorizonX layout.

## Restore

1. Stop the app: `docker compose -p xverse-production -f docker-compose.yml --env-file .env down`
2. Copy the chosen snapshot into the volume (adjust the backup path if
   still using the `BACKUP_DIR` override above):
   `docker run --rm -v xverse-production_xverse-data:/data -v /opt/horizonx/products/xverse/production/backups:/b alpine sh -c "cp /b/xverse-<STAMP>.db /data/xverse.db && rm -f /data/xverse.db-wal /data/xverse.db-shm && chown 1001:1001 /data/xverse.db"`
3. Start the app again (`up -d`). Migrations re-apply idempotently.

## Schema migrations

- Generated with `npx drizzle-kit generate` during development, committed
  under `drizzle/`, and **applied automatically at container startup**
  (instrumentation). Never edit an applied migration; add a new one.
- Rollback = restore the pre-deploy DB backup + `rollback.sh` to the
  previous image tag. Forward-only migrations by policy.

## Health

`/api/health/ready` now verifies the database is reachable and returns 503
(`database: "error"`) if not — existing deploy verification picks this up
without changes.

## Content migration (Phase 5)

On every boot, right after the product-catalog seed, the server runs
`migrateV1ContentIfNeeded()` — it inserts the five product showcase pages
and the five Xability demo brands as published `showcases` rows if (and
only if) a row with that slug doesn't already exist. It never updates an
existing row, so it is safe to redeploy indefinitely and safe to run
before this admin content existed at all. See
`docs/v2-phase5-migration.md` for the full inventory, verification, and
rollback procedure. **Take a `backup-db.sh` snapshot before the first
deploy that includes this migration**, same as any schema change.
