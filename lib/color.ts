/** Color helpers for theme-aware accent rendering. */

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  const n = parseInt(value.length === 3 ? value.replace(/./g, "$&$&") : value, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function channelLuminance(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

/**
 * White or near-black — whichever contrasts more with the given fill.
 * The worse of the two maxima across all colors is ~4.58:1 (at relative
 * luminance ≈ 0.18), so text colored this way always clears WCAG AA on
 * any accent fill. Used for initials/labels on brand-colored tiles.
 */
export function onAccent(hex: string): string {
  const luminance = relativeLuminance(hex);
  const whiteContrast = 1.05 / (luminance + 0.05);
  const blackContrast = (luminance + 0.05) / 0.05;
  return whiteContrast >= blackContrast ? "#ffffff" : "#000000";
}

/**
 * A dark, saturated variant of a pastel accent, readable as small text on
 * light surfaces (targets ≳4.5:1 on near-white). Used with the
 * `.eyebrow-accent` CSS-variable pair in globals.css so the light theme
 * gets a real computed color — a filter would fool the eye but not
 * contrast tooling.
 */
export function darkAccent(hex: string): string {
  const [r, g, b] = hexToRgb(hex).map((channel) => channel / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  if (delta > 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  // Fixed dark lightness + strong saturation: hue carries the brand.
  return `hsl(${h} 75% 26%)`;
}
