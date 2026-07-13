"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { fmt } from "@/lib/i18n/config";
import type { Brand, ProductPlanet } from "@/data/types";

// Same treatment as the universe scene: three.js stays out of the server
// bundle and off the critical path.
const WorldShowcase = dynamic(() => import("./WorldShowcase").then((mod) => mod.WorldShowcase), {
  ssr: false,
  loading: () => (
    <div className="flex h-[72vh] min-h-[520px] w-full items-center justify-center rounded-3xl border border-white/10 bg-ink-900/40">
      <div className="h-10 w-10 animate-spin-slow rounded-full border-2 border-nebula-400/30 border-t-nebula-400" />
    </div>
  ),
});

interface WorldShowcaseSectionProps {
  product: ProductPlanet;
  brands: Brand[];
}

/**
 * The 3D sample-worlds showcase, gated exactly like the homepage universe:
 * reduced-motion and low-capability visitors skip it entirely (the
 * accessible BrandExplorer grid below carries the same content), so the
 * 3D layer is purely additive.
 */
export function WorldShowcaseSection({ product, brands }: WorldShowcaseSectionProps) {
  const { dict } = useLocale();
  const reducedMotion = useReducedMotion();
  const capability = useDeviceCapability();

  if (reducedMotion || capability !== "capable" || brands.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-6xl px-6 pt-12 sm:px-8">
      <div className="mb-6 flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-[0.3em] text-nebula-400">
          {dict.brandWorlds.sampleWorlds}
        </span>
        <h2 className="font-display text-xl font-semibold text-mist-100">
          {fmt(dict.brandWorlds.exploreWorlds, { product: product.name })}
        </h2>
      </div>
      <WorldShowcase product={product} brands={brands} />
    </section>
  );
}
