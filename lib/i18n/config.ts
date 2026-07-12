// Client-safe i18n primitives: locale ids, cookie name, and the tiny
// template formatter. Anything that touches next/headers lives in
// server.ts instead, so client components can import from here freely.

export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Cookie (not localStorage) so the server renders the right language on
 * every request — no flash of the wrong language, no hydration mismatch. */
export const LOCALE_COOKIE = "xverse-locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "en" || value === "ar";
}

export function dirFor(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** Minimal `{placeholder}` interpolation for dictionary strings. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}
