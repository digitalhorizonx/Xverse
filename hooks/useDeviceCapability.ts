"use client";

import { useEffect, useState } from "react";

export type DeviceCapability = "checking" | "capable" | "limited";

/**
 * Cheap heuristic for whether this device should get the full 3D universe
 * scene. We don't try to be precise — false positives just mean a low-end
 * device gets the (fully-featured) 2D fallback, which is an acceptable
 * trade-off for keeping the experience smooth everywhere. Checks, in
 * order: WebGL2 availability, CPU core count, and device memory (where
 * exposed by the browser).
 */
export function useDeviceCapability(): DeviceCapability {
  const [capability, setCapability] = useState<DeviceCapability>("checking");

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      if (!gl) {
        setCapability("limited");
        return;
      }

      const cores = navigator.hardwareConcurrency ?? 4;
      const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;

      setCapability(cores < 4 || memory < 4 ? "limited" : "capable");
    } catch {
      setCapability("limited");
    }
  }, []);

  return capability;
}
