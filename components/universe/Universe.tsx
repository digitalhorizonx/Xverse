"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { UniverseCanvas } from "./UniverseCanvas";
import { UniverseFallback } from "./UniverseFallback";
import { UniverseLoading } from "./UniverseLoading";

const ENTRY_SESSION_KEY = "xverse:entered";

interface UniverseProps {
  /** Hero copy rendered inside the universe viewport (3D) or above the
   * static grid (fallback), so the headline always lives in the world. */
  hero?: ReactNode;
}

/**
 * Decides between the interactive 3D scene and the static fallback,
 * respecting `prefers-reduced-motion` and a cheap low-end-device check.
 * Renders a neutral loading state until that decision is made client-side,
 * so there's no layout flash between fallback and 3D.
 *
 * The 3D branch is a full-viewport scroll journey: a 300vh track pins the
 * canvas for three viewport-heights while scroll progress drives the
 * camera from a wide cinematic overview down into the orbital plane. On
 * the first visit of a session it opens with a warp-in entry sequence,
 * and the hero copy floats inside the viewport, fading out as the
 * journey begins.
 */
export function Universe({ hero }: UniverseProps) {
  const reducedMotion = useReducedMotion();
  const capability = useDeviceCapability();

  if (capability === "checking") {
    return <UniverseLoading />;
  }

  if (reducedMotion || capability === "limited") {
    return (
      <>
        {hero && <div className="relative px-6 pb-4 pt-24">{hero}</div>}
        <UniverseFallback />
      </>
    );
  }

  return <UniverseJourney hero={hero} />;
}

function UniverseJourney({ hero }: UniverseProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const scrollRef = useScrollProgress(trackRef);
  const [hintDismissed, setHintDismissed] = useState(false);

  // Once-per-session warp-in. This component only renders client-side
  // (after the capability check), so storage is available during the
  // initializer; try/catch covers private-mode storage denial.
  const [playEntry] = useState(() => {
    try {
      if (sessionStorage.getItem(ENTRY_SESSION_KEY)) return false;
      sessionStorage.setItem(ENTRY_SESSION_KEY, "1");
      return true;
    } catch {
      return false;
    }
  });
  const [entryDone, setEntryDone] = useState(!playEntry);

  useEffect(() => {
    function onScroll() {
      if (scrollRef.current > 0.04) {
        setHintDismissed(true);
      }
      // The hero melts away as the journey starts — driven directly on
      // the DOM node so scrolling never re-renders React.
      if (heroRef.current) {
        const opacity = Math.max(0, 1 - scrollRef.current * 5);
        heroRef.current.style.opacity = String(opacity);
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
        <UniverseCanvas
          scrollRef={scrollRef}
          playEntry={playEntry}
          onEntryComplete={() => setEntryDone(true)}
        />

        {/* Hero copy floats inside the viewport, fading in after the
            warp-in and melting away as the scroll journey begins. */}
        {hero && (
          <div
            ref={heroRef}
            className={`pointer-events-none absolute inset-x-0 top-16 z-10 px-6 transition-opacity duration-1000 sm:top-20 ${
              entryDone ? "opacity-100" : "opacity-0"
            }`}
          >
            {hero}
          </div>
        )}

        {/* Warp-in caption: rides on top of the entry sequence, gone once
            the camera settles. Not mounted at all when the entry is
            skipped (repeat visits in the same session). */}
        {playEntry && (
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 transition-opacity duration-700 ${
              entryDone ? "opacity-0" : "opacity-100"
            }`}
          >
            <span className="font-display text-sm font-semibold uppercase tracking-[0.5em] text-mist-200 sm:text-base">
              Entering the Xverse
            </span>
            <span className="h-px w-40 overflow-hidden bg-white/10">
              <span className="block h-full w-1/3 animate-shimmer bg-brand-gradient-text bg-[length:200%_auto]" />
            </span>
          </div>
        )}

        <div
          aria-hidden
          className={`pointer-events-none absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2.5 transition-opacity duration-700 ${
            hintDismissed || !entryDone ? "opacity-0" : "opacity-100"
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
