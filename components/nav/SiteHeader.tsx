import Link from "next/link";
import { ProductSwitcher } from "./ProductSwitcher";

export function SiteHeader({ currentProductId }: { currentProductId?: string }) {
  return (
    <div className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-3 sm:px-8">
        <Link href="/" className="font-display text-sm font-semibold tracking-wide text-mist-100">
          Xverse <span className="text-mist-500">by HorizonX</span>
        </Link>
        <ProductSwitcher currentProductId={currentProductId} />
      </div>
    </div>
  );
}
