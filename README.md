# Xverse

The HorizonX Digital Universe — a standalone Next.js 14 app that showcases
the entire HorizonX product ecosystem as an interactive, cinematic 3D
universe. At the center sits the HorizonX Core; around it orbit product
planets (Xability, XSites, XApps, XAI, XAuto), each holding demo brand
worlds that show what a business gets from that product — sample content,
dashboards, reports, and its digital transformation journey.

Xverse is **not** part of the Xability codebase. It is its own product,
repository, deployment, and content model, reusable across every HorizonX
product landing page via a single CTA ("Explore Xverse") that links to
<https://xverse.horizonx.site>.

## Quick start (local development)

```bash
npm install
cp .env.example .env
npm run dev          # or: make dev (runs it in Docker instead)
```

Other useful scripts:
```bash
npm run build         # production build
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm run test          # Vitest
```

## Architecture

- **Next.js 14 (App Router) + TypeScript + Tailwind** — same conventions as
  Xability, the first HorizonX product, for consistency across the
  ecosystem.
- **React Three Fiber + drei + Three.js** for the 3D universe scene,
  lazy-loaded and gated behind a `prefers-reduced-motion` / low-end-device
  fallback (see `hooks/useReducedMotion.ts`, added alongside the scene).
- **Data-driven content model** (`data/products.ts`, `data/brands.ts`) — no
  hardcoded brand pages. Every product planet and demo brand world renders
  through one dynamic route (`app/[product]/[brand]/page.tsx`) driven by
  this data, so swapping a demo brand for a verified client later is a data
  change, not a code change. See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the
  deployment side of "data-driven, easy to edit."

## Deployment

Xverse reuses the **HorizonX deployment standard**, defined in full in the
Xability repo's `DEPLOYMENT.md` (the reference implementation). This repo
ships the product-specific pieces of that standard: `Dockerfile`,
`docker-compose.{dev,staging,prod}.yml`, `.env.{staging,production}.example`,
health check routes, and `.github/workflows/{ci,deploy,rollback}.yml`. See
[`DEPLOYMENT.md`](./DEPLOYMENT.md) here for the short version scoped to
Xverse, or the Xability repo for the full architecture reference.

Nothing auto-deploys — `deploy.yml`/`rollback.yml` are `workflow_dispatch`
only.
