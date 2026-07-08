"use client";

import { ArrowLeft } from "lucide-react";
import type { ProductPlanet } from "@/data/types";

interface UniverseHUDProps {
  focusedPlanet: ProductPlanet | null;
  isTraveling: boolean;
  onReturn: () => void;
}

export function UniverseHUD({ focusedPlanet, isTraveling, onReturn }: UniverseHUDProps) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="glass pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-mist-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-nebula-400" />
          {focusedPlanet ? focusedPlanet.name : "HorizonX Core"}
        </div>

        {focusedPlanet && (
          <button
            type="button"
            onClick={onReturn}
            className="glass pointer-events-auto flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-mist-200 transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Return to Universe
          </button>
        )}
      </div>

      {focusedPlanet && focusedPlanet.status === "coming-soon" && (
        <div className="glass-strong pointer-events-auto mx-auto flex max-w-sm flex-col items-center gap-3 rounded-3xl p-6 text-center">
          <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-mist-300">
            Coming Soon
          </span>
          <h3 className="font-display text-xl font-semibold text-mist-100">{focusedPlanet.name}</h3>
          <p className="text-sm text-mist-400">{focusedPlanet.description}</p>
        </div>
      )}

      <p
        className={`pointer-events-none text-center text-xs text-mist-500 transition-opacity ${
          focusedPlanet || isTraveling ? "opacity-0" : "opacity-100"
        }`}
      >
        Click a planet to explore · Drag to look around · Scroll to zoom
      </p>
    </div>
  );
}
