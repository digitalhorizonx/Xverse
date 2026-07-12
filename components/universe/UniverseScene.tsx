"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import type { Group } from "three";
import type { Vector3 } from "three";
import type { MutableRefObject } from "react";
import { PRODUCTS } from "@/data/products";
import { Core } from "./Core";
import { Planet } from "./Planet";
import { OrbitRing } from "./OrbitRing";
import { Starfield } from "./Starfield";
import { CameraRig } from "./CameraRig";
import type { RigPhase } from "./CameraRig";
import { UniverseHUD } from "./UniverseHUD";
import { WarpStreaks } from "./WarpStreaks";
import type { WarpFx } from "./WarpStreaks";
import { ARRIVAL_STORAGE_KEY } from "@/components/fx/ArrivalOverlay";

interface ControlsLike {
  target: Vector3;
  update: () => void;
}

interface UniverseSceneProps {
  scrollRef?: MutableRefObject<number>;
  /** Play the once-per-session warp-in entry sequence. */
  playEntry?: boolean;
  onEntryComplete?: () => void;
}

export function UniverseScene({ scrollRef, playEntry = false, onEntryComplete }: UniverseSceneProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<RigPhase>(playEntry ? "entry" : "journey");
  const [flash, setFlash] = useState(false);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [controls, setControls] = useState<ControlsLike | null>(null);
  const planetRefs = useRef<Map<string, Group>>(new Map());
  const fxRef = useRef<WarpFx>({ intensity: 0 });

  const focusedPlanet = useMemo(
    () => PRODUCTS.find((product) => product.id === focusedId) ?? null,
    [focusedId],
  );

  function handleSelect(id: string) {
    if (phase !== "journey") return;
    setFocusedId(id);
  }

  function handleReturn() {
    setFocusedId(null);
  }

  function handleArrive() {
    // Every planet now leads somewhere: live or coming-soon, arrival
    // triggers the hyperspace exit into that product's showcase.
    setPhase("warp");
  }

  function handleWarpComplete() {
    if (!focusedPlanet) return;
    try {
      sessionStorage.setItem(ARRIVAL_STORAGE_KEY, focusedPlanet.id);
    } catch {
      // Storage can be unavailable (private mode) — the arrival fade is
      // cosmetic, navigation must happen regardless.
    }
    router.push(`/showcase/${focusedPlanet.showcaseSlug}`);
  }

  const status =
    phase === "entry"
      ? "ENTERING THE XVERSE"
      : phase === "warp"
        ? `WARP JUMP · ${focusedPlanet?.name ?? ""}`
        : focusedPlanet
          ? `APPROACHING · ${focusedPlanet.name}`
          : "IN ORBIT · HORIZONX CORE";

  return (
    <div className="relative h-full w-full">
      {/* No opaque clear color: the canvas stays transparent so the nebula
          backdrop behind it becomes the scene's sky. */}
      <Canvas
        camera={{ position: [0, 30, 115], fov: 50 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.35} />
        <Starfield />
        <Core showLabel={!focusedId && phase === "journey"} />
        <WarpStreaks fxRef={fxRef} />

        {PRODUCTS.map((planet, index) => (
          <group key={planet.id}>
            <OrbitRing radius={planet.orbitRadius} color={planet.color} />
            <Planet
              planet={planet}
              angleOffset={(index / PRODUCTS.length) * Math.PI * 2}
              isFocused={focusedId === planet.id}
              onSelect={handleSelect}
              registerRef={(id, group) => {
                if (group) planetRefs.current.set(id, group);
                else planetRefs.current.delete(id);
              }}
            />
          </group>
        ))}

        <CameraRig
          phase={phase}
          targetGroup={focusedId ? (planetRefs.current.get(focusedId) ?? null) : null}
          active={Boolean(focusedId)}
          controls={controls}
          onArrive={handleArrive}
          onEntryComplete={() => {
            setPhase("journey");
            onEntryComplete?.();
          }}
          onWarpFlash={() => setFlash(true)}
          onWarpComplete={handleWarpComplete}
          fxRef={fxRef}
          scrollRef={scrollRef}
        />

        <OrbitControls
          ref={(instance) => setControls(instance as unknown as ControlsLike | null)}
          enablePan={false}
          // Wheel must scroll the page (the scroll journey IS the zoom);
          // drag still gives a temporary look-around that eases back.
          enableZoom={false}
          enabled={!focusedId && phase === "journey"}
          // While traveling to/focused on a planet, the camera sits much
          // closer than the home-view minDistance allows — without
          // relaxing it here, update() clamps the camera back out every
          // frame and fights CameraRig's lerp, so it never arrives.
          minDistance={focusedId ? 1.5 : 5}
          maxDistance={130}
        />

        <EffectComposer multisampling={0}>
          <Bloom intensity={0.9} luminanceThreshold={0.18} luminanceSmoothing={0.9} mipmapBlur />
          <Vignette eskil={false} offset={0.18} darkness={0.78} />
        </EffectComposer>
      </Canvas>

      <UniverseHUD
        focusedPlanet={phase === "warp" ? null : focusedPlanet}
        status={status}
        onReturn={handleReturn}
      />

      {/* Warp white-out: covers the viewport just before navigation; the
          destination page's ArrivalOverlay picks up from here and fades
          back in, so the jump reads as one continuous move. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-20 bg-gradient-to-br from-white via-cyan-100 to-white transition-opacity duration-300 ${
          flash ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
