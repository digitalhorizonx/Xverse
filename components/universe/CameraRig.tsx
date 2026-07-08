"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import type { Group } from "three";

const HOME_POSITION = new Vector3(0, 4, 14);
const HOME_TARGET = new Vector3(0, 0, 0);

interface OrbitControlsLike {
  target: Vector3;
  update: () => void;
}

interface CameraRigProps {
  targetGroup: Group | null;
  active: boolean;
  controls: OrbitControlsLike | null;
  onArrive: () => void;
}

/**
 * Eases the camera toward the focused planet (tracking its orbit once
 * arrived) or back to the home view when nothing is focused. `onArrive`
 * fires once per focus, not every frame, so callers can trigger a
 * one-time transition (e.g. navigation) without re-firing while the
 * camera keeps tracking the still-orbiting planet.
 */
export function CameraRig({ targetGroup, active, controls, onArrive }: CameraRigProps) {
  const { camera } = useThree();
  const arrivedRef = useRef(false);
  const desiredCamPos = useRef(new Vector3());
  const desiredTarget = useRef(new Vector3());

  useEffect(() => {
    if (active) arrivedRef.current = false;
  }, [active]);

  useFrame((_, delta) => {
    const lerpFactor = Math.min(delta * 2.2, 1);

    if (active && targetGroup) {
      targetGroup.getWorldPosition(desiredTarget.current);
      const direction = desiredTarget.current.clone().normalize();
      desiredCamPos.current
        .copy(desiredTarget.current)
        .addScaledVector(direction, 3.4)
        .add(new Vector3(0, 1.3, 0));

      camera.position.lerp(desiredCamPos.current, lerpFactor);
      if (controls) controls.target.lerp(desiredTarget.current, lerpFactor);

      if (!arrivedRef.current && camera.position.distanceTo(desiredCamPos.current) < 0.12) {
        arrivedRef.current = true;
        onArrive();
      }
    } else {
      camera.position.lerp(HOME_POSITION, lerpFactor);
      if (controls) controls.target.lerp(HOME_TARGET, lerpFactor);
    }

    controls?.update();
  });

  return null;
}
