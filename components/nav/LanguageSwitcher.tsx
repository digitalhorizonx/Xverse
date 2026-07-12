"use client";

import { Languages } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/** Global EN ⇄ AR switch — label always shows the language you'd get. */
export function LanguageSwitcher() {
  const { locale, dict, setLocale } = useLocale();

  return (
    <button
      type="button"
      onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
      aria-label={dict.header.switchLanguage}
      title={dict.header.switchLanguage}
      className="glass flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-mist-300 transition hover:text-mist-100"
    >
      <Languages className="h-4 w-4" aria-hidden />
      {/* The other language's name, in that language — the universal
          switcher convention. */}
      <span lang={locale === "ar" ? "en" : "ar"}>{dict.header.otherLanguage}</span>
    </button>
  );
}
