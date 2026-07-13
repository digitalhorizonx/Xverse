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
backup API via the running container), copies it to
`/opt/horizonx/backups/xverse/<env>/`, and rotates after 14 days.

Nightly cron on the VPS:

```cron
17 3 * * * /opt/horizonx/products/xverse/production/backup-db.sh production >> /var/log/xverse-backup.log 2>&1
```

Run it manually before any risky change (it is also the required step
before content migrations in later phases).

## Restore

1. Stop the app: `docker compose -p xverse-production -f docker-compose.yml --env-file .env down`
2. Copy the chosen snapshot into the volume:
   `docker run --rm -v xverse-production_xverse-data:/data -v /opt/horizonx/backups/xverse/production:/b alpine sh -c "cp /b/xverse-<STAMP>.db /data/xverse.db && rm -f /data/xverse.db-wal /data/xverse.db-shm && chown 1001:1001 /data/xverse.db"`
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
