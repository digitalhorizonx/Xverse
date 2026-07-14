"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  FolderOpen,
  Globe2,
  Image as ImageIcon,
  Languages,
  LayoutDashboard,
  Link2,
  LogOut,
  Megaphone,
  Menu,
  Orbit,
  Package,
  ScrollText,
  Settings,
  Sparkles,
  Star,
  Tags,
  Users,
  X,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { LanguageSwitcher } from "@/components/nav/LanguageSwitcher";
import { ThemeToggle } from "@/components/nav/ThemeToggle";
import { cn } from "@/lib/utils";
import type { Role } from "@/db/schema";
import type { Dictionary } from "@/lib/i18n/types";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface NavItem {
  href: string;
  label: (dict: Dictionary) => string;
  icon: typeof LayoutDashboard;
  /** Hidden entirely for roles that can never use it. */
  adminOnly?: boolean;
}

interface NavSection {
  label?: (dict: Dictionary) => string;
  items: NavItem[];
}

// All mission sections are present from day one — future phases fill in
// the placeholder pages, so the information architecture never shifts
// under the team's feet.
const NAV: NavSection[] = [
  {
    items: [{ href: "/admin", label: (d) => d.admin.nav.dashboard, icon: LayoutDashboard }],
  },
  {
    label: (d) => d.admin.nav.sectionContent,
    items: [
      { href: "/admin/products", label: (d) => d.admin.nav.products, icon: Package },
      { href: "/admin/showcases", label: (d) => d.admin.nav.showcases, icon: Sparkles },
      { href: "/admin/demo-brands", label: (d) => d.admin.nav.demoBrands, icon: FolderOpen },
      { href: "/admin/success-stories", label: (d) => d.admin.nav.successStories, icon: Star },
      { href: "/admin/industries", label: (d) => d.admin.nav.industries, icon: Globe2 },
      { href: "/admin/taxonomy", label: (d) => d.admin.nav.taxonomy, icon: Tags },
      { href: "/admin/media", label: (d) => d.admin.nav.media, icon: ImageIcon },
      { href: "/admin/translations", label: (d) => d.admin.nav.translations, icon: Languages },
    ],
  },
  {
    label: (d) => d.admin.nav.sectionSales,
    items: [
      { href: "/admin/leads", label: (d) => d.admin.nav.leads, icon: Megaphone },
      { href: "/admin/reports", label: (d) => d.admin.nav.reports, icon: BarChart3 },
      { href: "/admin/ctas", label: (d) => d.admin.nav.ctas, icon: Link2 },
    ],
  },
  {
    label: (d) => d.admin.nav.sectionSystem,
    items: [
      { href: "/admin/users", label: (d) => d.admin.nav.users, icon: Users, adminOnly: true },
      { href: "/admin/audit", label: (d) => d.admin.nav.auditLog, icon: ScrollText },
      { href: "/admin/settings", label: (d) => d.admin.nav.settings, icon: Settings, adminOnly: true },
    ],
  },
];

function NavLinks({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const { dict } = useLocale();
  const pathname = usePathname();

  return (
    <nav aria-label={dict.admin.consoleName} className="flex flex-col gap-5">
      {NAV.map((section, index) => {
        const items = section.items.filter((item) => !item.adminOnly || role === "admin");
        if (items.length === 0) return null;
        return (
          <div key={index}>
            {section.label && (
              <p className="mb-1.5 px-3 text-[10px] font-medium uppercase tracking-[0.2em] text-mist-500">
                {section.label(dict)}
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-[38px] items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition",
                        active
                          ? "bg-nebula-500/15 text-mist-100"
                          : "text-mist-400 hover:bg-white/[0.04] hover:text-mist-200",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden />
                      {item.label(dict)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

/**
 * The admin shell: header with identity + global switches, permanent
 * sidebar from lg up, slide-over drawer on smaller screens. Pure chrome —
 * access control happens server-side in the layout and API routes.
 */
export function AdminChrome({ user, children }: { user: AdminUser; children: React.ReactNode }) {
  const { dict } = useLocale();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
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
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label={menuOpen ? dict.admin.nav.closeMenu : dict.admin.nav.openMenu}
              aria-expanded={menuOpen}
              className="glass flex h-9 w-9 items-center justify-center rounded-full text-mist-300 lg:hidden"
            >
              {menuOpen ? <X className="h-4 w-4" aria-hidden /> : <Menu className="h-4 w-4" aria-hidden />}
            </button>
            <Link href="/admin" className="font-display text-sm font-semibold tracking-wide text-mist-100">
              {dict.admin.consoleName}
            </Link>
            <span className="rounded-full bg-nebula-500/15 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-nebula-300">
              {roleLabel[user.role]}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="glass hidden h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-mist-300 transition hover:text-mist-100 md:flex"
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
              <span className="hidden sm:inline">{dict.admin.signOut}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[96rem]">
        {/* Desktop sidebar */}
        <aside className="sticky top-[57px] hidden h-[calc(100svh-57px)] w-60 shrink-0 overflow-y-auto border-e border-white/5 p-4 lg:block">
          <NavLinks role={user.role} />
        </aside>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="fixed inset-0 z-30 lg:hidden">
            <div
              aria-hidden
              onClick={() => setMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <aside className="absolute inset-y-0 start-0 w-72 overflow-y-auto border-e border-white/10 bg-ink-950 p-4 pt-20">
              <NavLinks role={user.role} onNavigate={() => setMenuOpen(false)} />
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
