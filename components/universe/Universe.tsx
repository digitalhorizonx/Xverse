"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { UniverseCanvas } from "./UniverseCanvas";
import { UniverseFallback } from "./UniverseFallback";
import { UniverseLoading } from "./UniverseLoading";

/**
 * Decides between the interactive 3D scene and the static fallback,
 * respecting `prefers-reduced-motion` and a cheap low-end-device check.
 * Renders a neutral loading state until that decision is made client-side,
 * so there's no layout flash between fallback and 3D.
 *
 * The 3D branch is a scroll journey: a 300vh track pins the canvas for
 * three viewport-heights while scroll progress drives the camera from a
 * wide cinematic overview down into the orbital plane.
 */
export function Universe() {
  const reducedMotion = useReducedMotion();
  const capability = useDeviceCapability();

  if (capability === "checking") {
    return <UniverseLoading />;
  }

  if (reducedMotion || capability === "limited") {
    return <UniverseFallback />;
  }

  return <UniverseJourney />;
}

function UniverseJourney() {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollRef = useScrollProgress(trackRef);
  const [hintDismissed, setHintDismissed] = useState(false);

  useEffect(() => {
    function onScroll() {
      if (scrollRef.current > 0.04) {
        setHintDismissed(true);
        window.removeEventListener("scroll", onScroll);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollRef]);

  return (
    <div ref={trackRef} className="relative h-[300vh]">
      <div
        className="sticky top-0 h-screen w-full"
        onPointerDown={() => setHintDismissed(true)}
      >
        <UniverseCanvas scrollRef={scrollRef} />

        <div
          aria-hidden
          className={`pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2.5 transition-opacity duration-700 ${
            hintDismissed ? "opacity-0" : "opacity-100"
          }`}
        >
          <span className="whitespace-nowrap text-center text-xs text-mist-500">
            Click a planet to explore · Drag to look around
          </span>
          <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-mist-400">
            Scroll to travel
          </span>
          <span className="flex h-9 w-5 items-start justify-center rounded-full border border-white/20 p-1">
            <span className="h-2 w-1 animate-bounce rounded-full bg-white/60" />
          </span>
        </div>
      </div>
    </div>
  );
}
