"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

/**
 * Tracks how far the viewport has scrolled through a tall "track" element,
 * as a 0..1 value. The value lives in a mutable ref (not state) because the
 * consumer is a three.js render loop reading it every frame — re-rendering
 * React on scroll would defeat the point.
 *
 * Progress 0 = track top at viewport top; 1 = track bottom at viewport
 * bottom (i.e. the sticky child inside is about to unpin).
 */
export function useScrollProgress(trackRef: RefObject<HTMLElement | null>) {
  const progressRef = useRef(0);

  useEffect(() => {
    let frame = 0;

    function measure() {
      frame = 0;
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) {
        progressRef.current = 0;
        return;
      }
      progressRef.current = Math.min(1, Math.max(0, -rect.top / scrollable));
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(measure);
    }

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [trackRef]);

  return progressRef;
}
