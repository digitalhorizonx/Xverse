"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { Group } from "three";
import type { ProductPlanet } from "@/data/types";

interface PlanetProps {
  planet: ProductPlanet;
  angleOffset: number;
  isFocused: boolean;
  onSelect: (id: string) => void;
  registerRef: (id: string, group: Group | null) => void;
}

export function Planet({ planet, angleOffset, isFocused, onSelect, registerRef }: PlanetProps) {
  const orbitRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const isLive = planet.status === "live";

  useFrame((state, delta) => {
    if (!orbitRef.current) return;
    const speed = 0.06 * planet.orbitSpeed;
    orbitRef.current.rotation.y += delta * speed;
    void state;
  });

  return (
    <group ref={orbitRef} rotation={[0, angleOffset, 0]}>
      <group
        position={[planet.orbitRadius, 0, 0]}
        ref={(node) => registerRef(planet.id, node)}
      >
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
          scale={hovered || isFocused ? 1.15 : 1}
        >
          <sphereGeometry args={[0.62, 32, 32]} />
          <meshStandardMaterial
            color={planet.color}
            emissive={planet.color}
            emissiveIntensity={isLive ? 0.9 : 0.35}
            roughness={0.35}
            metalness={0.3}
            transparent
            opacity={isLive ? 1 : 0.55}
          />
        </mesh>

        <Html distanceFactor={12} position={[0, -1, 0]} center>
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
