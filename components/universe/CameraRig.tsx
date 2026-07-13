"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { CatmullRomCurve3, Vector3 } from "three";
import type { Group, PerspectiveCamera } from "three";
import type { MutableRefObject } from "react";
import type { WarpFx } from "./WarpStreaks";

const HOME_TARGET = new Vector3(0, 0, 0);

// The scroll journey is a genuine 3D flight path, not a straight dolly:
// a spline that starts high above the system, banks right between the
// outer rings, crosses low over the inner system on the left, and
// settles at eye level near the core. Scroll progress moves the camera
// along the curve, so scrolling FEELS like flying through the universe.
const JOURNEY_PATH = new CatmullRomCurve3(
  [
    new Vector3(0, 26, 26),
    new Vector3(15, 8.5, 13.5),
    new Vector3(-13, 3.4, 11.5),
    new Vector3(0, 1.4, 8.4),
  ],
  false,
  "centripetal",
);
const JOURNEY_START = JOURNEY_PATH.getPoint(0);

// Warp-in entry: from deep space down to the start of the flight path.
const ENTRY_FROM = new Vector3(0, 30, 115);
const ENTRY_DURATION = 3.2;
const ENTRY_FOV = 74;

// Warp-jump exit: accelerate from the approach position through and past
// the focused planet, flash near the end, then hand off to navigation.
const WARP_DURATION = 1.3;
const WARP_FLASH_AT = 0.72;
const WARP_FOV = 80;
const BASE_FOV = 50;

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function easeInCubic(t: number) {
  return t ** 3;
}


export type RigPhase = "entry" | "journey" | "warp";

interface OrbitControlsLike {
  target: Vector3;
  update: () => void;
}

interface CameraRigProps {
  phase: RigPhase;
  targetGroup: Group | null;
  active: boolean;
  controls: OrbitControlsLike | null;
  onArrive: () => void;
  onEntryComplete: () => void;
  onWarpFlash: () => void;
  onWarpComplete: () => void;
  /** Written every frame; WarpStreaks reads it. */
  fxRef: MutableRefObject<WarpFx>;
  /** 0..1 page-scroll progress through the journey track (mutable ref —
   * read per frame, never triggers React renders). */
  scrollRef?: MutableRefObject<number>;
}

/**
 * One camera brain, four modes:
 * - entry: once-per-session warp-in from deep space to the overview
 * - journey (default): scroll-keyframed cinematic path drifting around
 *   the core
 * - focus (active + targetGroup): eases toward the focused planet and
 *   tracks its orbit; fires onArrive exactly once per focus
 * - warp: hyperspace acceleration through the focused planet; fires
 *   onWarpFlash near the end and onWarpComplete when done
 */
export function CameraRig({
  phase,
  targetGroup,
  active,
  controls,
  onArrive,
  onEntryComplete,
  onWarpFlash,
  onWarpComplete,
  fxRef,
  scrollRef,
}: CameraRigProps) {
  const { camera } = useThree();
  const arrivedRef = useRef(false);
  const desiredCamPos = useRef(new Vector3());
  const desiredTarget = useRef(new Vector3());
  const phaseStartRef = useRef<number | null>(null);
  const warpFromRef = useRef(new Vector3());
  const warpToRef = useRef(new Vector3());
  const warpCaptured = useRef(false);
  const warpFiredFlash = useRef(false);
  const warpFiredComplete = useRef(false);

  useEffect(() => {
    if (active) arrivedRef.current = false;
  }, [active]);

  // Reset per-phase bookkeeping whenever the phase changes.
  useEffect(() => {
    phaseStartRef.current = null;
    warpCaptured.current = false;
    warpFiredFlash.current = false;
    warpFiredComplete.current = false;
  }, [phase]);

  useFrame((state, delta) => {
    const cam = camera as PerspectiveCamera;
    const lerpFactor = Math.min(delta * 2.2, 1);
    if (phaseStartRef.current === null) phaseStartRef.current = state.clock.elapsedTime;
    const phaseT = state.clock.elapsedTime - phaseStartRef.current;

    if (phase === "entry") {
      const t = Math.min(phaseT / ENTRY_DURATION, 1);
      const eased = easeOutCubic(t);
      cam.position.lerpVectors(ENTRY_FROM, JOURNEY_START, eased);
      cam.fov = ENTRY_FOV + (BASE_FOV - ENTRY_FOV) * eased;
      cam.updateProjectionMatrix();
      if (controls) controls.target.copy(HOME_TARGET);
      cam.lookAt(HOME_TARGET);
      // Streaks: full blast at the start, gone by the time we settle.
      const ramp = Math.min(t / 0.08, 1);
      fxRef.current.intensity = ramp * (1 - eased);
      if (t >= 1) onEntryComplete();
      controls?.update();
      return;
    }

    if (phase === "warp" && targetGroup) {
      if (!warpCaptured.current) {
        // Capture endpoints once at warp start: from wherever the camera
        // is, through the planet, and well past it.
        warpCaptured.current = true;
        warpFromRef.current.copy(cam.position);
        targetGroup.getWorldPosition(desiredTarget.current);
        const direction = desiredTarget.current.clone().sub(cam.position).normalize();
        warpToRef.current.copy(desiredTarget.current).addScaledVector(direction, 14);
      }
      const t = Math.min(phaseT / WARP_DURATION, 1);
      const eased = easeInCubic(t);
      cam.position.lerpVectors(warpFromRef.current, warpToRef.current, eased);
      cam.fov = BASE_FOV + (WARP_FOV - BASE_FOV) * eased;
      cam.updateProjectionMatrix();
      targetGroup.getWorldPosition(desiredTarget.current);
      cam.lookAt(desiredTarget.current);
      fxRef.current.intensity = Math.min(1, t * 1.6);

      if (!warpFiredFlash.current && t >= WARP_FLASH_AT) {
        warpFiredFlash.current = true;
        onWarpFlash();
      }
      if (!warpFiredComplete.current && t >= 1) {
        warpFiredComplete.current = true;
        onWarpComplete();
      }
      return;
    }

    // journey / focus modes share the original behavior.
    fxRef.current.intensity = Math.max(0, fxRef.current.intensity - delta * 3);
    cam.fov += (BASE_FOV - cam.fov) * lerpFactor;
    cam.updateProjectionMatrix();

    if (active && targetGroup) {
      targetGroup.getWorldPosition(desiredTarget.current);
      const direction = desiredTarget.current.clone().normalize();
      desiredCamPos.current
        .copy(desiredTarget.current)
        .addScaledVector(direction, 3.4)
        .add(new Vector3(0, 1.3, 0));

      camera.position.lerp(desiredCamPos.current, lerpFactor);
      if (controls) controls.target.lerp(desiredTarget.current, lerpFactor);

      // 0.25 rather than a tighter epsilon: the approach is exponential,
      // so the last few centimeters take the longest and add nothing
      // visually — fire the arrival as soon as the framing is settled.
      if (!arrivedRef.current && camera.position.distanceTo(desiredCamPos.current) < 0.25) {
        arrivedRef.current = true;
        onArrive();
      }
    } else {
      const progress = scrollRef?.current ?? 0;
      // Fly the spline. A gentle time-based bob keeps the frame alive
      // while the visitor isn't scrolling, without fighting the path.
      JOURNEY_PATH.getPoint(smoothstep(progress), desiredCamPos.current);
      desiredCamPos.current.x += Math.sin(state.clock.elapsedTime * 0.35) * 0.5;
      desiredCamPos.current.y += Math.sin(state.clock.elapsedTime * 0.22) * 0.25;

      camera.position.lerp(desiredCamPos.current, lerpFactor);
      if (controls) controls.target.lerp(HOME_TARGET, lerpFactor);
    }

    controls?.update();
  });

  return null;
}
