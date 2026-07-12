# V1 Polish — QA Evidence

Screenshots captured with Playwright/Chromium against the app during the
"Final Xverse V1 Polish" pass (mobile 375/390px @2x, desktop 1440px @2x).

## Before → after: the broken mobile hero

- `before-home-375.jpg` — the pre-polish mobile home: oversized headline and
  paragraph floating **over** the 3D core and planets, no header, no CTA in
  view. This is the layout the polish had to eliminate.
- `after-home-375.jpg` — the rebuilt mobile composition: global header
  (language + theme switches), badge, compact headline, short copy, both
  CTAs above the fold, demo-data disclaimer, then the universe in its own
  full-width window below. No text ever overlaps the scene.

## After: the new capabilities

- `after-home-1440.jpg` / `before-home-1440.jpg` — desktop keeps the
  cinematic floating-hero composition, now with CTAs and global header.
- `after-home-ar-375.jpg`, `after-home-ar-1440.jpg` — Arabic: full RTL
  layout, mirrored header/HUD/arrows, natural marketing Arabic.
- `after-home-light-375.jpg`, `after-home-light-1440.jpg` — light theme:
  deliberately designed light chrome around the always-dark universe
  window (`.scene-dark` / `.universe-window` treatment).
- `after-index-390.jpg` — showcase index with product search + industry
  filter.
- `after-xab-ar-390.jpg` — Arabic Xability showcase (localized stats,
  CTAs, breadcrumbs).
- `after-xsite-light-390.jpg` — light-theme product showcase.

## Automated matrix

`scripts/qa-e2e.mjs` (Playwright; `BASE_URL` env, defaults to
`http://localhost:3100`) runs the full matrix — final result **77/77
passed** locally against the dev server:

1. Every route renders 200 with a clean console and zero horizontal
   overflow (checked at 320–1440px); alias routes return real 308s;
   unknown showcase/brand slugs return real 404s.
2. Language switcher: EN ⇄ AR, `lang`/`dir` flip, cookie persistence
   across reloads, Accept-Language detection on first visit.
3. Theme switcher: OS preference on first visit, toggle, localStorage
   persistence, dark universe window preserved in light mode.
4. All five interactive demos exercised (portal request lifecycle, site
   template/theme/viewport toggles, push notification + offline mode,
   vehicle filters + booking stepper, agent chat + workflow runner).
5. CTA targets verified; every internal link crawled and 200-checked;
   showcase search/filter/no-results/clear behaviors.
6. `prefers-reduced-motion` renders the 2D fallback with no canvas.
7. Mobile hero: primary CTA above the fold at 390×844 and hero block
   strictly above the canvas.

## Planet → showcase mapping

`scripts/qa-planets.mjs` clicks each of the five planets in the real 3D
scene (via the canvas raycaster) and asserts the warp lands on the correct
showcase URL — **5/5 verified**. This test caught a real arrival bug: the
camera chased orbiting planets with an exponential lerp whose steady-state
lag exceeded the arrival threshold, so the warp never fired. Fixed by
freezing a focused planet's orbit and widening the threshold.

## Lighthouse (production build, mobile emulation)

| Route | Perf | A11y | Best Practices | SEO |
| --- | --- | --- | --- | --- |
| `/` | 91 | **100** | **100** | 66* |
| `/showcase` | 78–81 | **100** | **100** | 69* |
| `/showcase/xability` | 88 | **100** | **100** | 69* |
| `/showcase/xsite` | 89 | **100** | **100** | 69* |
| `/showcase/xapps` | 87 | **100** | **100** | 69* |
| `/showcase/xauto` | 87 | **100** | **100** | 69* |
| `/showcase/ai` | 88 | **100** | **100** | 69* |

\* SEO loses points only for `is-crawlable`: the local build ran with
`NEXT_PUBLIC_ALLOW_INDEXING=false` (deliberate noindex). Production reads
the repo variable.

Accessibility reached 100 through real fixes, audited in the light theme
(Lighthouse's default): AA-tuned light `mist`/accent token values,
`onAccent()` white-or-black selection for text on brand-colored fills,
per-theme eyebrow accent colors (`lib/color.ts` `darkAccent`), no
opacity-dimmed text, and heading-order guards for the gated 3D sections.
