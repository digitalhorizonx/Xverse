# Xverse V2 — Phase 5: V1 Content Migration

Migrates the V1 static content (`data/products.ts`, `data/showcases.ts`,
`data/brands.ts`) into the Phase 3 content model and repoints every public
route at the database. The public site is visually and behaviorally
unchanged — this is a data-source cutover, not a redesign.

## What actually moved

V1's content had three shapes, and the Phase 3 schema already had a home
for two of them without any change:

| V1 shape | Count | Destination | Notes |
| --- | --- | --- | --- |
| `ProductPlanet` (`data/products.ts`) | 5 | `cms_products` | Already migrated in Phase 3 (`seedProductsIfEmpty`) — unaffected by this PR. |
| `ProductShowcase` (`data/showcases.ts`) | 5 | `showcases`, `type = "template"` | One row per product's own showcase page. `SHOWCASE_TYPES` already reserved `"template"` for exactly this in Phase 3. `heroTagline`/`heroDescription` → `titleEn/Ar` + `summaryEn/Ar`; everything else (stats, capabilities, sections, sample businesses, and the product-specific demo payloads) → `blocksEn`/`blocksAr`, validated by the same `blocksSchema` the admin editor already uses. |
| `Brand` (`data/brands.ts`) | 5 (all Xability) | `showcases`, `type = "demo-brand"` or `"verified-client"` | Name/description/story → real columns; everything else (social posts, reels, calendar, reports, analytics, ad performance, AI insights, gallery, colors, logo mark, industry, tags) → `blocksEn`. |

No new tables, no schema migration. `industries` and `tags` (empty since
Phase 3) are seeded from the 5 brands' unique `industry` / `tags` values,
and each brand row is linked to them (`industryId` / `tagIds`) — this is
the "Industries" and "Tags" inventory item; it isn't load-bearing for
public rendering (the public brand-explorer search/filter reads the raw
strings stored in `blocksEn`, exactly as V1 did), but it means the admin
catalog isn't empty and future admin edits have real taxonomy to attach to.

## Migration run (first boot after this PR)

```
Records migrated:
  showcase pages (type=template): 5 created, 0 skipped
  demo brands:                    5 created, 0 skipped
  industries:                     5 created  (coffee-shop, medical-clinic, restaurant, fashion-brand, car-dealer)
  tags:                          16 created  (union of all 5 brands' tag lists)
  conflicts:                      0
Media linked or deduplicated:     0 — see "Known limitations" below.
```

Every created row gets one `content_versions` snapshot with reason
`migration:v1`, so the admin History tab shows where the row came from.

## Idempotency & conflict detection

`migrateV1ContentIfNeeded()` (`lib/content/migrateV1Content.ts`) runs at
every server boot, right after `seedProductsIfEmpty()`:

- Looked up by slug (the same uniqueness the DB already enforces). If a
  row exists, it is **never touched** — admin edits made after the first
  migration are permanent, and re-running the migration (every redeploy)
  or rolling back to a pre-Phase-5 build and forward again is always safe.
- If a slug already exists but with an unexpected `productId` or `type`,
  it's recorded as a **conflict** and logged (`console.warn`) instead of
  silently overwritten or silently ignored — see
  `lib/content/migrateV1Content.test.ts`'s conflict-detection test for the
  exact behavior.
- Nothing is ever deleted.

Verified live (not just in tests): booted twice against the same
database — first boot logs the created-row summary, second boot is a
silent no-op, and an admin edit made in between survives the second boot
untouched.

## Public rendering cutover

`lib/content/publicContent.ts` reads only `status = "published"` (and, for
products, `active = true`) rows and reshapes them back into the *exact*
V1 TypeScript interfaces (`data/types.ts`) — every existing component
(`ShowcaseShell`, `BrandHero`, `WorldShowcaseSection`, `BrandExplorer`,
the 3D `UniverseScene`…) renders unmodified; only the import at the top of
each page/component changed:

- `app/page.tsx`, `app/showcase/page.tsx`, `app/showcase/[slug]/page.tsx`,
  `app/[product]/page.tsx`, `app/[product]/[brand]/page.tsx`,
  `app/sitemap.ts`, `components/nav/ProductSwitcher.tsx`,
  `components/showcase/CTAFooter.tsx` — swapped the static `@/data/*`
  import for the equivalent `lib/content/publicContent.ts` read.
- `components/universe/{Universe,UniverseCanvas,UniverseScene,UniverseFallback}.tsx`
  are client components (the 3D scene can't read the database), so the
  already-localized product list is fetched once server-side in
  `app/page.tsx` and threaded down as a `products` prop.
- `lib/i18n/localize.ts` (`localizeProduct`/`localizeShowcase`) is now
  dead code — the AR/EN merge it did against the static dictionary
  happens natively in `publicContent.ts` against the DB's own bilingual
  columns instead. Left in place rather than deleted, to keep this diff
  focused; nothing imports it anymore.

**Fallback behavior**: a missing or unpublished product/showcase/brand
already returns `null` from `publicContent.ts`, and every call site
already called `notFound()` on a falsy result before this PR — so 404
behavior for "record doesn't exist" is preserved with zero new code.

## Draft/publication safety

Verified end-to-end (`lib/content/publicContent.test.ts` +
`scripts/qa-e2e.mjs` is the full 77-check V1 regression + a dedicated
Phase 5 Playwright script):

- Public routes read `status = "published"` only. Transitioning a
  migrated row to `draft` (or `archived`) makes its public route 404
  immediately and removes it from the brand explorer, while the admin API
  (`/api/admin/showcases/:id`) keeps showing it at every status — this is
  the "admin preview vs. public published" separation the mission asked
  for; it's the existing Phase 3 workflow gate, now proven against real
  migrated content instead of only hand-created test fixtures.
- Republishing instantly restores the public route (see the next
  section — there's no cache to invalidate).
- An admin edit to a migrated row's `titleEn` is what the public page
  renders on the very next request — the static V1 data files are no
  longer read by anything but the migration script itself.

## Cache & invalidation

**There is no cache.** Every route already renders dynamically (the
locale cookie forces this — a decision made back in the V1 polish pass),
so there was never a Next.js Data Cache or Full Route Cache in play here
to begin with. `publicContent.ts` issues direct, synchronous
`better-sqlite3` reads (WAL mode, sub-millisecond) on every request. A
published change is visible on the very next request, with nothing to
go stale and nothing to invalidate — the simplest cache strategy that
satisfies "predictable, no staleness" is no cache at all. (An earlier
draft of this layer used React's `cache()` for per-request de-duplication;
it was removed because the stable React release this project pins
doesn't export it outside Next's own bundling, which broke plain-Node
unit tests for no real benefit — SQLite reads are already cheap enough
that de-duplication isn't needed.)

## Before / after

Screenshots against the migrated, DB-backed production build:
`docs/qa/phase5/home-en.jpg`, `showcase-index-en.jpg`,
`showcase-xability-en.jpg`, `showcase-xability-ar-rtl.jpg`,
`brand-amber-oak-en.jpg`, `brand-amber-oak-mobile.jpg`. Pixel-identical to
the pre-Phase-5 V1 screenshots in `docs/qa/` — same components, same
tokens, same copy; only the data source changed.

## Routes preserved

| Route | Before | After |
| --- | --- | --- |
| `/` | static `PRODUCTS` import | `getPublicProducts("en"/"ar")` |
| `/showcase` | static | `getPublicProducts` + `getPublicShowcaseByProductId` |
| `/showcase/xability`, `/showcase/xsite`, `/showcase/xapps`, `/showcase/xauto`, `/showcase/ai` | static | `getPublicShowcaseBySlug` (type=template) |
| `/xability/<brand-slug>` (5 brands) | static | `getPublicBrandBySlug` (type=demo-brand) |
| `/showcase/xai` → `/showcase/ai`, `/showcase/xapp` → `/showcase/xapps`, `/xability` → `/showcase/xability`, etc. | 308 in `next.config.mjs` | unchanged, untouched by this PR |
| `/sitemap.xml` | static `PRODUCTS`/`getActiveBrands()` | `getPublicProducts`/`getPublicSitemapBrands` — same URLs (including the pre-existing `/…` non-canonical product-id quirk, intentionally not "fixed" here) |

Every route verified via the full V1 regression suite
(`scripts/qa-e2e.mjs`, 77/77) and the planet-warp suite
(`scripts/qa-planets.mjs`, 5/5) against both the dev server and the
production standalone build, plus a dedicated migration-specific
Playwright pass (11/11: inventory counts, draft/public separation,
admin-edit-is-what-renders, version history).

## Rollback

Because the migration only ever *adds* rows (never updates, never
deletes) and the schema didn't change, rollback has two independent,
composable levels:

1. **Code rollback** (revert this deploy): redeploy the previous image.
   The migrated rows stay in the database, inert — nothing reads them
   without this PR's code, and nothing in the previous code path touches
   the `showcases` table's new template/demo-brand rows. No data loss.
2. **Data rollback** (undo the migrated rows specifically): restore the
   `backup-db.sh` snapshot taken before this deploy
   (`docs/v2-operations.md` → Restore). Since the migration is additive-
   only, an even lighter option is to delete the ten rows by the slug list
   above directly (`DELETE FROM showcases WHERE slug IN (...)`) — safe
   specifically because nothing else references them yet (no leads, no
   analytics, no media in this phase).

Standard operational rollback (`rollback.sh` to the previous image tag)
continues to work unmodified.

## Known limitations

- **No binary media exists in V1 content.** Brand "logos" are a two-letter
  procedural glyph (`logoMark`) over a hex color, not an image file; the
  before/after gallery is caption-only (`kind: "before"|"after"|"concept"`,
  no image). There is nothing to link or deduplicate against the Phase 4
  Media Library in this migration — the media reference columns
  (`blocksEn.coverVisual`, gallery items) are free-form strings today and
  ready to hold a real `media:<id>` reference whenever an admin attaches
  one through the Media Library; the public renderer already treats every
  block field as optional and won't crash on one that's absent, but no
  component currently reads a media id, so there's no fallback path to
  exercise yet. This is a real limitation, not deferred scope creep —
  V1 simply never had real assets attached to this content.
- **Demo brand content stays English-only**, exactly as V1 rendered it
  (`lib/i18n/localize.ts` never had a brand override — see its file
  comment). Migration mirrors `titleEn`/`summaryEn`/`storyEn` into the
  `*Ar` columns so the publish gate is satisfied; this is not a real
  translation, and an admin who wants genuine Arabic brand content can
  now edit those fields directly (previously impossible — V1 had no admin
  at all).
- **SEO title/description columns are left blank** for migrated rows.
  V1 never had per-entity SEO overrides for these two route families —
  metadata was always computed inline from the name/tagline/description
  (`fmt(dict.meta.showcaseTitle, {...})`, `fmt(dict.brandWorlds.demoBrandMeta, {...})`).
  The pages still compute it exactly that way today, now from DB fields;
  the stored `seoTitleEn/Ar` / `seoDescriptionEn/Ar` columns are there for
  an admin to set an explicit override later without any code change, but
  populating them now would risk diverging from the byte-identical output
  this PR promises.
- Leads, first-party analytics, and CRM integration are explicitly out of
  scope for this PR (Phase 6).
