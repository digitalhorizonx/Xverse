import Link from "next/link";
import { PRODUCTS } from "@/data/products";
import { getDict } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

export function ProductSwitcher({ currentProductId }: { currentProductId?: string }) {
  const { dict } = getDict();

  return (
    <nav aria-label={dict.header.productNav} className="flex flex-wrap items-center gap-2">
      {PRODUCTS.map((product) => {
        const isCurrent = product.id === currentProductId;
        return (
          <Link
            key={product.id}
            href={`/showcase/${product.showcaseSlug}`}
            aria-current={isCurrent ? "page" : undefined}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
              isCurrent
                ? "border-nebula-400/50 bg-nebula-500/15 text-mist-100"
                : "border-white/10 bg-white/[0.03] text-mist-400 hover:border-white/20 hover:text-mist-200",
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: product.color }} aria-hidden />
            {product.name}
            {product.status === "coming-soon" && (
              <span className="text-[10px] uppercase tracking-wide text-mist-500">{dict.common.soon}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
