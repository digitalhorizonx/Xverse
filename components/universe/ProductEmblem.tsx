"use client";

import { useEffect, useMemo } from "react";
import { Billboard } from "@react-three/drei";
import { AdditiveBlending } from "three";
import type { ProductPlanet } from "@/data/types";
import { createEmblemTexture } from "./emblems";

interface ProductEmblemProps {
  planet: Pick<ProductPlanet, "id" | "color" | "accentColor" | "status">;
  /** World-space diameter of the emblem badge. */
  size?: number;
  emphasized?: boolean;
}

/**
 * A product's glowing logo-badge in 3D: a camera-facing emblem plane
 * (additive, so its black canvas background vanishes) over a dark body
 * sphere for depth, wrapped in a soft halo shell. Replaces the old plain
 * colored ball as the visual identity of each planet.
 */
export function ProductEmblem({ planet, size = 2.1, emphasized = false }: ProductEmblemProps) {
  const isLive = planet.status === "live";

  const texture = useMemo(
    () => createEmblemTexture(planet.id, planet.color, planet.accentColor),
    [planet.id, planet.color, planet.accentColor],
  );
  useEffect(() => () => texture.dispose(), [texture]);

  const scale = emphasized ? 1.15 : 1;

  return (
    <group scale={scale}>
      {/* Dark body sphere: gives the badge physical presence so it reads
          as a world, not a flat sticker. Kept deliberately dim — the
          glyph is the star. */}
      <mesh>
        <sphereGeometry args={[size * 0.3, 32, 32]} />
        <meshStandardMaterial
          color="#0b1020"
          emissive={planet.color}
          emissiveIntensity={isLive ? 0.35 : 0.15}
          roughness={0.5}
          metalness={0.3}
          transparent
          opacity={isLive ? 0.85 : 0.5}
        />
      </mesh>

      {/* The emblem itself — always faces the viewer, floated toward the
          camera so the body sphere can never depth-hide the glyph. */}
      <Billboard>
        <mesh position={[0, 0, size * 0.38]}>
          <planeGeometry args={[size, size]} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={isLive ? 1 : 0.55}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </Billboard>

      {/* Soft halo shell for bloom to feed on. */}
      <mesh scale={emphasized ? 1.35 : 1.2}>
        <sphereGeometry args={[size * 0.42, 24, 24]} />
        <meshBasicMaterial
          color={planet.accentColor}
          transparent
          opacity={isLive ? 0.12 : 0.05}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
