"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, Color } from "three";
import type { Group, LineSegments, LineBasicMaterial } from "three";
import type { MutableRefObject } from "react";

export interface WarpFx {
  /** 0 = no warp, 1 = full hyperspace. Written by CameraRig every frame. */
  intensity: number;
}

const STREAK_COUNT = 340;

/**
 * Hyperspace star streaks: a tunnel of line segments kept glued to the
 * camera (position + orientation copied every frame) so streaks always
 * rush past the viewer along the view axis. Intensity drives opacity and
 * stretch; at 0 the whole group is hidden and costs nothing per frame
 * beyond the copy.
 */
export function WarpStreaks({ fxRef }: { fxRef: MutableRefObject<WarpFx> }) {
  const groupRef = useRef<Group>(null);
  const linesRef = useRef<LineSegments>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(STREAK_COUNT * 6);
    const colors = new Float32Array(STREAK_COUNT * 6);
    const head = new Color("#dbeafe");
    const tail = new Color("#22d3ee");
    for (let i = 0; i < STREAK_COUNT; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      // Annulus around the view axis — keep the very center clear so the
      // destination stays visible through the tunnel.
      const radius = 2.2 + Math.random() * 12;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = 6 - Math.random() * 60;
      const length = 3 + Math.random() * 6;
      positions.set([x, y, z, x, y, z - length], i * 6);
      colors.set([head.r, head.g, head.b, tail.r, tail.g, tail.b], i * 6);
    }
    return { positions, colors };
  }, []);

  useFrame(({ camera }) => {
    const intensity = fxRef.current.intensity;
    const group = groupRef.current;
    const lines = linesRef.current;
    if (!group || !lines) return;

    group.visible = intensity > 0.02;
    if (!group.visible) return;

    camera.getWorldPosition(group.position);
    group.quaternion.copy(camera.quaternion);
    // Stretching the tunnel along the view axis reads as acceleration.
    group.scale.set(1, 1, 1 + intensity * 2.5);
    (lines.material as LineBasicMaterial).opacity = Math.min(1, intensity * 1.2);
  });

  return (
    <group ref={groupRef} visible={false}>
      <lineSegments ref={linesRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[geometry.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[geometry.colors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}
