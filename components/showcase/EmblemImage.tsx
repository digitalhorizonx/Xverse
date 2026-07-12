"use client";

import { useEffect, useState } from "react";
import { createEmblemTexture } from "@/components/universe/emblems";
import type { ProductPlanet } from "@/data/types";

/**
 * The product's universe emblem rendered as a DOM image — same canvas
 * glyph the 3D planets use, so branding is pixel-identical between the
 * universe and the showcase pages. Rendered client-side; a plain glow dot
 * placeholder holds layout until the canvas paints.
 */
export function EmblemImage({
  planet,
  size = 96,
  className,
}: {
  planet: Pick<ProductPlanet, "id" | "color" | "accentColor" | "name" | "status">;
  size?: number;
  className?: string;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const texture = createEmblemTexture(planet.id, planet.color, planet.accentColor);
    const canvas = texture.image as HTMLCanvasElement;
    setSrc(canvas.toDataURL("image/png"));
    texture.dispose();
  }, [planet.id, planet.color, planet.accentColor]);

  if (!src) {
    return (
      <span
        aria-hidden
        className={className}
        style={{
          width: size,
          height: size,
          display: "inline-block",
          borderRadius: "9999px",
          background: `radial-gradient(circle, ${planet.color}55, transparent 70%)`,
        }}
      />
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element -- data URL from a
       runtime canvas; next/image cannot optimize it. */
    <img
      src={src}
      alt={`${planet.name} emblem`}
      width={size}
      height={size}
      className={className}
      style={{ filter: `drop-shadow(0 0 ${size / 6}px ${planet.color}66)` }}
    />
  );
}
