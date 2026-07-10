"use client";

import { useEffect, useState } from "react";

export const ARRIVAL_STORAGE_KEY = "xverse:arrival";

/**
 * Completes the warp jump on the destination page: if the visitor just
 * warped here from the universe (flag set by UniverseScene right before
 * navigation), the page mounts under a white-out that fades away — the
 * second half of the hyperspace flash. Direct visits render nothing.
 */
export function ArrivalOverlay() {
  const [arriving, setArriving] = useState(false);

  useEffect(() => {
    let flagged = false;
    try {
      flagged = sessionStorage.getItem(ARRIVAL_STORAGE_KEY) !== null;
      if (flagged) sessionStorage.removeItem(ARRIVAL_STORAGE_KEY);
    } catch {
      return;
    }
    if (!flagged) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setArriving(true);
    const timer = setTimeout(() => setArriving(false), 950);
    return () => clearTimeout(timer);
  }, []);

  if (!arriving) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[70] animate-arrival-fade bg-gradient-to-br from-white via-cyan-100 to-white"
    />
  );
}
