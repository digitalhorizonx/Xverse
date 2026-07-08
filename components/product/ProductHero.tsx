import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ProductPlanet } from "@/data/types";

export function ProductHero({ product }: { product: ProductPlanet }) {
  return (
    <header className="relative overflow-hidden border-b border-white/5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background: `radial-gradient(circle at 30% 0%, ${product.color}33, transparent 55%)`,
        }}
      />
      <div className="relative mx-auto max-w-6xl px-6 pb-14 pt-8 sm:px-8">
        <Link href="/" className="mb-8 flex w-fit items-center gap-1.5 text-xs text-mist-500 transition hover:text-mist-300">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Return to Universe
        </Link>

        <span
          className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]"
          style={{ backgroundColor: `${product.color}22`, color: product.color }}
        >
          {product.status === "live" ? "Live" : "Coming Soon"}
        </span>

        <h1 className="font-display text-3xl font-semibold text-mist-100 sm:text-5xl">{product.name}</h1>
        <p className="mt-2 text-lg text-mist-400">{product.tagline}</p>
        <p className="mt-4 max-w-2xl text-mist-300">{product.description}</p>

        <Link
          href={product.ctaUrl}
          className="glass-strong mt-6 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium text-mist-100 transition hover:text-white"
        >
          {product.ctaLabel}
        </Link>
      </div>
    </header>
  );
}
