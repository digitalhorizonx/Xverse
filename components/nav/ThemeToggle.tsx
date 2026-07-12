"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/** Global light/dark switch. Icon shows the mode you'd switch TO. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { dict } = useLocale();
  // The server doesn't know the theme (it lives in localStorage), so the
  // icon renders after mount to avoid a hydration mismatch; the button
  // frame itself is stable.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const label = theme === "dark" ? dict.header.switchToLight : dict.header.switchToDark;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      // The server can't know the client theme (localStorage/OS), so the
      // label may legitimately differ on first paint.
      suppressHydrationWarning
      className="glass flex h-9 w-9 items-center justify-center rounded-full text-mist-300 transition hover:text-mist-100"
    >
      {mounted &&
        (theme === "dark" ? (
          <Sun className="h-4 w-4" aria-hidden />
        ) : (
          <Moon className="h-4 w-4" aria-hidden />
        ))}
    </button>
  );
}
