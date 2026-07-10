"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import type { Group } from "three";
import type { MutableRefObject } from "react";

const HOME_TARGET = new Vector3(0, 0, 0);

// Scroll keyframes for the unfocused "journey" camera: a high, distant
// cinematic overview that dollies down into the orbital plane as the page
// scrolls. {radius, height} pairs at progress 0 → 0.5 → 1.
const KEY_START = { radius: 24, height: 11.5 };
const KEY_MID = { radius: 14, height: 4 };
const KEY_END = { radius: 8.5, height: 1.3 };

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

function keyframe(progress: number) {
  if (progress < 0.5) {
    const t = smoothstep(progress / 0.5);
    return {
      radius: KEY_START.radius + (KEY_MID.radius - KEY_START.radius) * t,
      height: KEY_START.height + (KEY_MID.height - KEY_START.height) * t,
    };
  }
  const t = smoothstep((progress - 0.5) / 0.5);
  return {
    radius: KEY_MID.radius + (KEY_END.radius - KEY_MID.radius) * t,
    height: KEY_MID.height + (KEY_END.height - KEY_MID.height) * t,
  };
}

interface OrbitControlsLike {
  target: Vector3;
  update: () => void;
}

interface CameraRigProps {
  targetGroup: Group | null;
  active: boolean;
  controls: OrbitControlsLike | null;
  onArrive: () => void;
  /** 0..1 page-scroll progress through the journey track (mutable ref —
   * read per frame, never triggers React renders). */
  scrollRef?: MutableRefObject<number>;
}

/**
 * Eases the camera toward the focused planet (tracking its orbit once
 * arrived), or — when nothing is focused — along a scroll-driven cinematic
 * path that slowly drifts around the core. `onArrive` fires once per
 * focus, not every frame, so callers can trigger a one-time transition
 * (e.g. navigation) without re-firing while the camera keeps tracking the
 * still-orbiting planet.
 */
export function CameraRig({ targetGroup, active, controls, onArrive, scrollRef }: CameraRigProps) {
  const { camera } = useThree();
  const arrivedRef = useRef(false);
  const desiredCamPos = useRef(new Vector3());
  const desiredTarget = useRef(new Vector3());

  useEffect(() => {
    if (active) arrivedRef.current = false;
  }, [active]);

  useFrame((state, delta) => {
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
      const progress = scrollRef?.current ?? 0;
      const { radius, height } = keyframe(progress);
      // Slow ambient drift plus a scroll-linked sweep, so scrubbing the
      // page swings the viewpoint around the system rather than only
      // zooming in a straight line.
      const theta = state.clock.elapsedTime * 0.04 + progress * 0.9;
      desiredCamPos.current.set(Math.sin(theta) * radius, height, Math.cos(theta) * radius);

      camera.position.lerp(desiredCamPos.current, lerpFactor);
      if (controls) controls.target.lerp(HOME_TARGET, lerpFactor);
    }

    controls?.update();
  });

  return null;
}
