"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import { AdditiveBlending, Color } from "three";
import type { Group } from "three";
import type { ProductPlanet } from "@/data/types";
import { ProductEmblem } from "./ProductEmblem";

interface PlanetProps {
  planet: ProductPlanet;
  angleOffset: number;
  isFocused: boolean;
  onSelect: (id: string) => void;
  registerRef: (id: string, group: Group | null) => void;
}

const TRAIL_POINTS = 48;
const TRAIL_ARC = 1.15; // radians of orbit the trail sweeps behind the planet

export function Planet({ planet, angleOffset, isFocused, onSelect, registerRef }: PlanetProps) {
  const orbitRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const isLive = planet.status === "live";

  // The planet sits at local +X and the orbit group spins +Y, so points the
  // planet just vacated appear (in the group's local frame) along +Z — the
  // trail arc therefore sweeps from angle 0 toward +Z, fading as it goes.
  const trail = useMemo(() => {
    const points: [number, number, number][] = [];
    const colors: Color[] = [];
    const head = new Color(planet.color);
    for (let i = 0; i < TRAIL_POINTS; i += 1) {
      const t = i / (TRAIL_POINTS - 1);
      const a = t * TRAIL_ARC;
      points.push([planet.orbitRadius * Math.cos(a), 0, planet.orbitRadius * Math.sin(a)]);
      // Additive blending treats black as invisible, so lerping the color
      // to black reads as an alpha fade without a custom shader.
      colors.push(head.clone().multiplyScalar((1 - t) ** 2));
    }
    return { points, colors };
  }, [planet.color, planet.orbitRadius]);

  useFrame((state, delta) => {
    if (!orbitRef.current) return;
    const speed = 0.06 * planet.orbitSpeed;
    orbitRef.current.rotation.y += delta * speed;
    void state;
  });

  return (
    <group ref={orbitRef} rotation={[0, angleOffset, 0]}>
      <Line
        points={trail.points}
        vertexColors={trail.colors}
        lineWidth={2}
        transparent
        opacity={isLive ? 0.9 : 0.45}
        blending={AdditiveBlending}
        depthWrite={false}
      />

      <group
        position={[planet.orbitRadius, 0, 0]}
        ref={(node) => registerRef(planet.id, node)}
      >
        {/* Invisible-but-raycastable hit target — generous, stable radius
            so the emblem's visual scale changes never affect
            clickability. (A visible={false} mesh would be skipped by the
            raycaster, so it renders with a fully transparent material
            instead.) */}
        <mesh
          onClick={(event) => {
            event.stopPropagation();
            onSelect(planet.id);
          }}
          onPointerOver={(event) => {
            event.stopPropagation();
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = "auto";
          }}
        >
          <sphereGeometry args={[1.25, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* The product's glowing logo-badge IS the planet. */}
        <ProductEmblem planet={planet} emphasized={hovered || isFocused} />

        <Html distanceFactor={12} position={[0, -1.35, 0]} center>
          <div
            className={`pointer-events-none select-none whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm transition-opacity ${
              hovered || isFocused ? "opacity-100" : "opacity-70"
            } ${isLive ? "bg-black/40 text-white" : "bg-black/30 text-white/60"}`}
          >
            {planet.name}
            {!isLive && <span className="ms-1.5 text-[10px] uppercase tracking-wide">· soon</span>}
          </div>
        </Html>
      </group>
    </group>
  );
}
