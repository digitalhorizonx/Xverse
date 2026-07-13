import Link from "next/link";
import { getDict } from "@/lib/i18n/server";
import { ProductSwitcher } from "./ProductSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";

/**
 * The one global header: brand, product navigation (from md up — on
 * phones the Showcases link is the compact entry point), and the global
 * language + theme switches, present on every page.
 */
export function SiteHeader({ currentProductId }: { currentProductId?: string }) {
  const { dict } = getDict();

  return (
    <div className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
        <Link
          href="/"
          aria-label={dict.header.home}
          className="shrink-0 font-display text-sm font-semibold tracking-wide text-mist-100"
        >
          Xverse <span className="hidden text-mist-500 min-[400px]:inline">{dict.header.byHorizonX}</span>
        </Link>

        <div className="hidden md:block">
          <ProductSwitcher currentProductId={currentProductId} />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/showcase"
            className="glass flex h-9 items-center rounded-full px-3 text-xs font-semibold text-mist-300 transition hover:text-mist-100 md:hidden"
          >
            {dict.header.showcases}
          </Link>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
