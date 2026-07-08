import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Brand } from "@/data/types";
import type { ProductPlanet } from "@/data/types";
import { DemoBadge } from "./DemoBadge";

interface BrandHeroProps {
  brand: Brand;
  product: ProductPlanet;
}

export function BrandHero({ brand, product }: BrandHeroProps) {
  return (
    <header className="relative overflow-hidden border-b border-white/5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: `radial-gradient(circle at 20% 0%, ${brand.colors.primary}33, transparent 55%), radial-gradient(circle at 80% 100%, ${brand.colors.accent}26, transparent 55%)`,
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 pb-12 pt-8 sm:px-8">
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-xs text-mist-500">
          <Link href="/" className="flex items-center gap-1 transition hover:text-mist-300">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Universe
          </Link>
          <span>/</span>
          <Link href={`/${product.id}`} className="transition hover:text-mist-300">
            {product.name}
          </Link>
          <span>/</span>
          <span className="text-mist-300">{brand.name}</span>
        </nav>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-5">
            {/* text-[#fff], not text-white: the `white` token flips to
                near-black in light mode (for glass-panel contrast), which
                would go invisible against a dark brand.colors.primary. */}
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl text-xl font-semibold text-[#fff] shadow-glow-nebula sm:h-20 sm:w-20 sm:text-2xl"
              style={{ backgroundColor: brand.colors.primary }}
              aria-hidden
            >
              {brand.logoMark}
            </div>
            <div className="flex flex-col gap-3">
              <DemoBadge />
              <h1 className="font-display text-3xl font-semibold text-mist-100 sm:text-4xl">{brand.name}</h1>
              <p className="text-sm text-mist-400">
                {brand.industry} · Powered by {product.name}
              </p>
              <p className="max-w-2xl text-mist-300">{brand.description}</p>
            </div>
          </div>

          <Link
            href={product.ctaUrl}
            className="glass-strong inline-flex shrink-0 items-center justify-center rounded-full px-6 py-3 text-sm font-medium text-mist-100 transition hover:text-white"
          >
            {product.ctaLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
