"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { Group } from "three";

export function Core({ showLabel = true }: { showLabel?: boolean }) {
  const groupRef = useRef<Group>(null);
  const wireframeRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y += delta * 0.15;
      wireframeRef.current.rotation.x += delta * 0.05;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[1.4, 48, 48]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={1.4}
          roughness={0.25}
          metalness={0.4}
        />
      </mesh>
      <group ref={wireframeRef}>
        <mesh>
          <icosahedronGeometry args={[2.1, 1]} />
          <meshBasicMaterial color="#c4b5fd" wireframe transparent opacity={0.35} />
        </mesh>
      </group>
      <pointLight color="#a78bfa" intensity={12} distance={30} decay={2} />
      {showLabel && (
        <Html distanceFactor={14} position={[0, -2.4, 0]} center>
          <div className="pointer-events-none select-none whitespace-nowrap rounded-full bg-black/40 px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] text-white/80 backdrop-blur-sm">
            HorizonX Core
          </div>
        </Html>
      )}
    </group>
  );
}
