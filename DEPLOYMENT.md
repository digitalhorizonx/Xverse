# Deployment: Xverse on the HorizonX standard

Xverse follows the HorizonX deployment standard **defined and documented in
full in the Xability repo's `DEPLOYMENT.md`** (the reference
implementation, since Xability was the first HorizonX product onboarded).
This file only covers what's specific to onboarding and operating Xverse —
read the Xability doc first for the *why* behind the pattern.

## Xverse's place in the standard

| Thing | Value |
|---|---|
| Product slug | `xverse` |
| Staging domain | `xverse-staging.horizonx.site` |
| Production domain | `xverse.horizonx.site` |
| VPS product folder | `/opt/horizonx/products/xverse/{staging,production}/` |
| GitHub Environments | `xverse-staging`, `xverse-production` |
| GHCR image | `ghcr.io/digitalhorizonx/xverse` |

## What this repo ships (per the onboarding checklist)

- `Dockerfile`, `docker-compose.{dev,staging,prod}.yml`,
  `.env.{staging,production}.example` — adapted from Xability's, product
  slug swapped.
- `app/api/health` (liveness) and `app/api/health/ready` (readiness) —
  same response shape as Xability's, so the shared `smoke-test.sh` works
  unmodified.
- `.github/workflows/deploy.yml` and `rollback.yml` — copied verbatim
  (product-agnostic; `inputs.product` defaults to `xverse`).
- `.github/workflows/ci.yml`'s Docker Build job pattern.

## What this repo does **not** ship

The shared VPS toolkit (`/opt/horizonx/shared/{deploy,nginx,logrotate}/`)
is installed **once per VPS** and reused by every HorizonX product,
Xverse included — it is not duplicated per-repo. If the target VPS already
hosts Xability (or any other HorizonX product), that toolkit is already
installed; only steps 2–4 of Xability's "Onboarding a new HorizonX
product" section are needed:

1. Register DNS: `xverse-staging.horizonx.site`, `xverse.horizonx.site`.
2. `mkdir -p /opt/horizonx/products/xverse/{staging,production}`, copy in
   this repo's `docker-compose.<env>.yml` as `docker-compose.yml` and
   `.env.<env>.example` as `.env` (filled in with real values).
3. Render + install nginx config via
   `/opt/horizonx/shared/nginx/render.sh --product xverse ...` (pick an
   unused `--port` on that VPS).
4. Create the `xverse-staging` / `xverse-production` GitHub Environments
   with the same secrets checklist as every other product (`VPS_HOST`,
   `VPS_USER`, `VPS_SSH_KEY`, `HEALTH_URL`, plus the `NEXT_PUBLIC_*`
   variables).
5. Deploy via the Actions tab (`Deploy` workflow, `workflow_dispatch`
   only) — nothing here auto-deploys on push.

See the Xability repo's `DEPLOYMENT.md` and `RUNBOOK.md` for the full
architecture reference and step-by-step VPS provisioning playbook — both
apply to Xverse unchanged.
