"use client";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";
import { UniverseCanvas } from "./UniverseCanvas";
import { UniverseFallback } from "./UniverseFallback";
import { UniverseLoading } from "./UniverseLoading";

/**
 * Decides between the interactive 3D scene and the static fallback,
 * respecting `prefers-reduced-motion` and a cheap low-end-device check.
 * Renders a neutral loading state until that decision is made client-side,
 * so there's no layout flash between fallback and 3D.
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

  return <UniverseCanvas />;
}
