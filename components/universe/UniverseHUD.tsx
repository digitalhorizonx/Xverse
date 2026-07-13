"use client";

import { ArrowLeft } from "lucide-react";
import type { ProductPlanet } from "@/data/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface UniverseHUDProps {
  focusedPlanet: ProductPlanet | null;
  /** Cockpit status line, e.g. "In orbit · HorizonX Core". */
  status: string;
  onReturn: () => void;
}

function CornerBrackets() {
  const corner = "pointer-events-none absolute h-10 w-10 border-white/15";
  return (
    <>
      <span aria-hidden className={`${corner} left-3 top-3 rounded-tl-lg border-l border-t sm:left-5 sm:top-5`} />
      <span aria-hidden className={`${corner} right-3 top-3 rounded-tr-lg border-r border-t sm:right-5 sm:top-5`} />
      <span aria-hidden className={`${corner} bottom-3 left-3 rounded-bl-lg border-b border-l sm:bottom-5 sm:left-5`} />
      <span aria-hidden className={`${corner} bottom-3 right-3 rounded-br-lg border-b border-r sm:bottom-5 sm:right-5`} />
    </>
  );
}

export function UniverseHUD({ focusedPlanet, status, onReturn }: UniverseHUDProps) {
  const { dict } = useLocale();

  return (
    // pt clears the sticky site header once the viewport pins beneath it.
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 pt-16 sm:p-6 sm:pt-[4.25rem]">
      {/* Cockpit viewport framing. */}
      <CornerBrackets />

      <div className="flex items-start justify-between gap-3">
        {/* "You are here" location chip. */}
        <div
          className="glass pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-mist-300"
          aria-label={dict.hud.location}
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-nebula-400" />
          {focusedPlanet ? focusedPlanet.name : dict.hud.core}
        </div>

        {focusedPlanet && (
          <button
            type="button"
            onClick={onReturn}
            className="glass pointer-events-auto flex min-h-[44px] items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-mist-200 transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            {dict.common.returnToUniverse}
          </button>
        )}
      </div>

      {/* Every planet — live or coming soon — warps into its showcase on
          arrival, so no interruption panel is needed mid-journey. */}

      {/* Cockpit status readout — bottom-start, clear of the scroll hint. */}
      <div className="flex items-end justify-start ps-1 sm:ps-3" aria-live="polite">
        <span className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.3em] text-mist-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nebula-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nebula-400" />
          </span>
          {status}
        </span>
      </div>
    </div>
  );
}
