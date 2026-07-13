"use client";

import Link from "next/link";
import type { Brand } from "@/data/types";
import { DemoBadge } from "@/components/brand/DemoBadge";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { onAccent } from "@/lib/color";

export function BrandCard({ brand }: { brand: Brand }) {
  const { dict } = useLocale();

  return (
    <Link
      href={`/${brand.product}/${brand.slug}`}
      className="glass-strong group flex flex-col gap-4 rounded-3xl p-6 transition hover:border-white/20"
    >
      <div className="flex items-start justify-between gap-3">
        {/* onAccent picks white or near-black per brand color — always
            clears AA regardless of the palette. */}
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-semibold"
          style={{ backgroundColor: brand.colors.primary, color: onAccent(brand.colors.primary) }}
          aria-hidden
        >
          {brand.logoMark}
        </div>
        <DemoBadge label={dict.brandWorlds.demoShort} />
      </div>

      <div>
        <h3 className="font-display text-lg font-semibold text-mist-100 transition group-hover:text-white">
          {brand.name}
        </h3>
        <p className="text-xs uppercase tracking-wide text-mist-500">{brand.industry}</p>
      </div>

      <p className="text-sm text-mist-400">{brand.description}</p>

      <div className="mt-auto flex items-center justify-between text-xs text-mist-500">
        <span>{dict.brandWorlds.transformationScore}</span>
        <span className="font-medium text-mist-300">{brand.digitalTransformationScore}%</span>
      </div>
    </Link>
  );
}
