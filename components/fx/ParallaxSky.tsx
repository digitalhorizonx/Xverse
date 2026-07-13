"use client";

import { useEffect, useRef } from "react";

/**
 * The page's viewport-locked sky, with scroll parallax: the nebula drifts
 * slowly against the scroll and the grid drifts slower still, so depth is
 * felt on every page section — not only inside the 3D canvas. Driven
 * directly on the DOM nodes (rAF-throttled), never re-renders React.
 */
export function ParallaxSky() {
  const nebulaRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    function apply() {
      frame = 0;
      const y = window.scrollY;
      if (nebulaRef.current) {
        nebulaRef.current.style.transform = `translate3d(0, ${y * -0.06}px, 0) scale(1.15)`;
      }
      if (gridRef.current) {
        gridRef.current.style.transform = `translate3d(0, ${y * -0.025}px, 0)`;
      }
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(apply);
    }

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <div
        ref={nebulaRef}
        aria-hidden
        className="sky-nebula fixed inset-0 scale-[1.15] bg-cover bg-center will-change-transform"
        style={{ backgroundImage: "url(/images/nebula.webp)" }}
      />
      <div
        ref={gridRef}
        aria-hidden
        className="sky-grid fixed inset-0 bg-grid-lines bg-[size:64px_64px] will-change-transform"
      />
    </>
  );
}
