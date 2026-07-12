# Xverse Design Tokens

The single source of truth for Xverse's visual language. Tokens live as CSS
custom properties in `app/globals.css` (as `--color-*` RGB triples) and are
exposed to Tailwind via `tailwind.config.ts` (`rgb(var(--color-…) / <alpha>)`),
so every utility class is automatically theme-aware. **Never hardcode a hex
for UI chrome** — hex values are reserved for product/brand accents that must
stay identical in both themes.

## Themes

Two first-class themes, switched by `data-theme` on `<html>`:

| Mode | Role |
| --- | --- |
| `dark` (default) | The cinematic signature — deep-space ink, glass, glow. |
| `light` | A deliberately designed light surface — not an inversion. Higher-contrast text scale, muted accents re-tuned for light backgrounds. |

Selection order: stored choice in `localStorage["xverse-theme"]` → OS
`prefers-color-scheme` on first visit. A pre-paint inline script in
`app/layout.tsx` stamps the attribute before hydration (no flash);
`context/ThemeContext.tsx` owns runtime switching.

**The universe is always dark.** The 3D scene (starfield, orbits, bloom) is a
fixed-dark composition. In light mode the viewport wears the `.scene-dark`
class, which re-applies the dark token set to that subtree, plus
`.universe-window`, which gives it a dark backdrop — light chrome around a
window into space, by design.

## Color

### Surface scale — `ink`

Page and card backgrounds, darkest → lightest (dark values; the light theme
remaps every step):

| Token | Dark | Usage |
| --- | --- | --- |
| `ink-950` | `#020308` | Page background |
| `ink-900` | `#060812` | Scrollbar track, deep panels |
| `ink-800` | `#0b0f1e` | `glass-strong` card base |
| `ink-700` | `#12182c` | Default borders |
| `ink-600` / `ink-500` | `#1a223e` / `#252f58` | Scrollbar thumb, raised UI |

### Text scale — `mist`

`mist-100` (highest emphasis: headlines) → `mist-500` (lowest: captions,
eyebrows). In light mode the scale flips to dark-on-light values tuned for
WCAG AA on `ink-950`-light (`#fafbfd`).

### Brand accents (shared with Xability)

`teal` (300–600, primary brand), `amber` (300–600, warm accent), `coral`
(400–600, alerts/energy) — plus Xverse's own `nebula` violet (300–600) for
universe UI (HUD, focus rings, links). Light mode darkens every accent for
contrast on white.

### Product accent colors (theme-invariant hex)

| Product | `color` | `accentColor` |
| --- | --- | --- |
| Xability | `#20b8a4` | `#7fe4d6` |
| XSites | `#fb9645` | `#ffd9a0` |
| XApps | `#8b5cf6` | `#c4b5fd` |
| XAI | `#f96a4d` | `#ff8b73` |
| XAuto | `#38bdf8` | `#bae6fd` |

Defined once in `data/products.ts`; planets, emblems, showcase glows, demo
accents all read from there.

### `--color-white`

The "chrome tint" primitive behind `bg-white/[0.04]`, `border-white/10`, etc.
It flips to near-black in light mode, so all glass surfaces and hairlines
theme automatically. Use literal `text-[#fff]` only on top of product-accent
fills (which stay saturated in both themes).

## Typography

| Role | Stack |
| --- | --- |
| Body (`font-sans`) | Inter → Noto Sans Arabic → system |
| Display (`font-display`) | Sora → Inter → Noto Sans Arabic |

Noto Sans Arabic carries all Arabic text (Inter/Sora have no Arabic glyphs).
Hero: `text-[1.9rem]` at 320px → `text-6xl` at desktop. Eyebrows:
`text-xs uppercase tracking-[0.3em]`.

## Spacing, radius, elevation

- Page gutters: `px-5` mobile → `sm:px-8`; content max width `max-w-6xl`.
- Radii: pills `rounded-full`, cards `rounded-3xl`, feature cards
  `rounded-[2rem]`/`rounded-4xl` (2rem), phone frame `rounded-[2.4rem]`.
- Elevation: `glass` (4% white tint + blur + 10% hairline) and `glass-strong`
  (ink-800/70 + heavier blur) utilities; colored glow shadows
  (`shadow-glow*`, inline `0 0 0 1px {accent}2e, 0 0 48px -18px {accent}55`)
  instead of drop shadows.
- Touch targets: interactive chrome ≥ 36–44px (`min-h-[44px]` on primary
  actions).

## Motion

Tokenized keyframes in `tailwind.config.ts`: `fade-up`, `float`, `shimmer`,
`twinkle`, `spin-slow(er)`, `arrival-fade`, plus `pageEnter` route
transitions in `globals.css`. Everything is wrapped by the global
`prefers-reduced-motion` kill switch, and the 3D universe swaps to a static
grid via `useReducedMotion()` / `useDeviceCapability()`.

## Direction (RTL)

Arabic renders `dir="rtl"` from the server. Rules:

- Use logical utilities (`ps-`/`pe-`/`ms-`/`me-`/`start-`/`end-`,
  `text-start`) — never `pl-`/`ml-`/`left-` for content flow.
- Directional lucide icons (`arrow-right/left`, `chevron-right/left`) are
  mirrored globally in `globals.css` under `[dir="rtl"]`.

## i18n architecture

`lib/i18n/` — cookie-driven (`xverse-locale`), server-rendered. Dictionaries
in `lib/i18n/dictionaries/{en,ar}.ts` (the `Dictionary` type is derived from
`en`, so a missing Arabic key is a compile error). English data files stay
single-source; Arabic overrides for product/showcase content are keyed by
id/slug and merged via `lib/i18n/localize.ts`. Server components call
`getDict()`; client components call `useLocale()`.
