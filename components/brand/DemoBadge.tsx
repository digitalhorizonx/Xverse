"use client";

import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface DemoBadgeProps {
  label?: string;
  className?: string;
}

/**
 * Every demo brand surface must carry this — nothing here is real
 * customer data, and the UI should never let a visitor mistake it for
 * one. See data/brands.ts for the full policy note.
 */
export function DemoBadge({ label, className }: DemoBadgeProps) {
  const { dict } = useLocale();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-amber-300",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      {label ?? dict.brandWorlds.demoBadge}
    </span>
  );
}
