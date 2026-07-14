"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Orbit } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { LanguageSwitcher } from "@/components/nav/LanguageSwitcher";
import { ThemeToggle } from "@/components/nav/ThemeToggle";
import type { Role } from "@/db/schema";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

/**
 * Shared frame for every admin screen: identity, role badge, the same
 * global language/theme switches as the public site, and sign-out. The
 * full navigation shell lands in Phase 2 — this stays deliberately thin.
 */
export function AdminChrome({ user, children }: { user: AdminUser; children: React.ReactNode }) {
  const { dict } = useLocale();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const roleLabel: Record<Role, string> = {
    admin: dict.admin.roleAdmin,
    editor: dict.admin.roleEditor,
    viewer: dict.admin.roleViewer,
  };

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <div className="flex items-center gap-2">
            <span className="font-display text-sm font-semibold tracking-wide text-mist-100">
              {dict.admin.consoleName}
            </span>
            <span className="rounded-full bg-nebula-500/15 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-nebula-300">
              {roleLabel[user.role]}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="glass hidden h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-mist-300 transition hover:text-mist-100 sm:flex"
            >
              <Orbit className="h-3.5 w-3.5" aria-hidden />
              {dict.admin.backToSite}
            </Link>
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              type="button"
              onClick={signOut}
              disabled={signingOut}
              className="glass flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-mist-300 transition hover:text-mist-100 disabled:opacity-50"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              {dict.admin.signOut}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}
