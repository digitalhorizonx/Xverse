"use client";

import { AdditiveBlending } from "three";

/**
 * A three-layer orbit ring: a crisp core line, a tight inner glow, and a
 * wide soft halo. All additive so overlapping rings and bloom compound
 * into a light-drawn look instead of muddying each other.
 */
export function OrbitRing({ radius, color }: { radius: number; color: string }) {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <ringGeometry args={[radius - 0.018, radius + 0.018, 256]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.5}
          side={2}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <ringGeometry args={[radius - 0.09, radius + 0.09, 256]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1}
          side={2}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <ringGeometry args={[radius - 0.32, radius + 0.32, 256]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.035}
          side={2}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
