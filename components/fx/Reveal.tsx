"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/**
 * Scroll-reveal wrapper: children fade-and-rise once when they enter the
 * viewport. Respects prefers-reduced-motion (renders static). Used across
 * showcase sections so depth-on-scroll feels consistent everywhere.
 *
 * Content must never be lost to a missed observer callback (headless
 * capture, odd embedded viewports, IO quirks), so a safety timer force-
 * reveals a few seconds after mount — the animation is an enhancement,
 * not a gate.
 */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  // "instant" = revealed by the failsafe or reduced-motion: snap to
  // visible with no transition, so nothing is ever caught mid-fade.
  const [state, setState] = useState<"hidden" | "animated" | "instant">("hidden");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setState("instant");
      return;
    }
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setState((current) => (current === "hidden" ? "animated" : current));
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    const failSafe = window.setTimeout(
      () => setState((current) => (current === "hidden" ? "instant" : current)),
      2500,
    );
    return () => {
      observer.disconnect();
      window.clearTimeout(failSafe);
    };
  }, []);

  const shown = state !== "hidden";
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(24px)",
        transition:
          state === "instant"
            ? "none"
            : `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
