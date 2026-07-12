"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { useRouter } from "next/navigation";
import { dirFor, LOCALE_COOKIE, type Locale } from "./config";
import { getDictionary } from "./dictionaries";
import type { Dictionary } from "./types";

interface LocaleContextValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  dict: Dictionary;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * Client bridge for the server-decided locale: the server renders the
 * right language from the cookie, this provider hands the same locale +
 * dictionary to client components, and setLocale writes the cookie and
 * re-renders the tree server-side — so both worlds always agree.
 */
export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const router = useRouter();

  const setLocale = useCallback(
    (next: Locale) => {
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      // lang/dir flip immediately so the switch feels instant while the
      // server re-render is in flight.
      document.documentElement.lang = next;
      document.documentElement.dir = dirFor(next);
      router.refresh();
    },
    [router],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, dir: dirFor(locale), dict: getDictionary(locale), setLocale }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}
