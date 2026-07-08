import Link from "next/link";
import type { Brand } from "@/data/types";
import { DemoBadge } from "@/components/brand/DemoBadge";

export function BrandCard({ brand }: { brand: Brand }) {
  return (
    <Link
      href={`/${brand.product}/${brand.slug}`}
      className="glass-strong group flex flex-col gap-4 rounded-3xl p-6 transition hover:border-white/20"
    >
      <div className="flex items-start justify-between gap-3">
        {/* text-[#fff], not text-white: see BrandHero for why. */}
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-semibold text-[#fff]"
          style={{ backgroundColor: brand.colors.primary }}
          aria-hidden
        >
          {brand.logoMark}
        </div>
        <DemoBadge label="Demo" />
      </div>

      <div>
        <h3 className="font-display text-lg font-semibold text-mist-100 transition group-hover:text-white">
          {brand.name}
        </h3>
        <p className="text-xs uppercase tracking-wide text-mist-500">{brand.industry}</p>
      </div>

      <p className="text-sm text-mist-400">{brand.description}</p>

      <div className="mt-auto flex items-center justify-between text-xs text-mist-500">
        <span>Transformation score</span>
        <span className="font-medium text-mist-300">{brand.digitalTransformationScore}%</span>
      </div>
    </Link>
  );
}
