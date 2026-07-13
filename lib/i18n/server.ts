// Server-side only: next/headers throws if this module is ever pulled
// into a client bundle, which is exactly the guard we want.
import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config";
import { getDictionary } from "./dictionaries";

/**
 * The request's locale: an explicit cookie choice wins; otherwise the
 * browser's Accept-Language decides the very first visit (spec: detect
 * browser language on first visit only — once the visitor picks, the
 * cookie is the single source of truth).
 */
export function getLocale(): Locale {
  const cookie = cookies().get(LOCALE_COOKIE)?.value;
  if (isLocale(cookie)) return cookie;

  const acceptLanguage = headers().get("accept-language") ?? "";
  // First (= highest priority) language tag decides; "ar", "ar-SA", … → ar.
  const first = acceptLanguage.split(",")[0]?.trim().toLowerCase() ?? "";
  if (first.startsWith("ar")) return "ar";

  return DEFAULT_LOCALE;
}

export function getDict() {
  const locale = getLocale();
  return { locale, dict: getDictionary(locale) };
}
