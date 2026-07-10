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
import { UniverseHUD } from "./UniverseHUD";

interface ControlsLike {
  target: Vector3;
  update: () => void;
}

export function UniverseScene({ scrollRef }: { scrollRef?: MutableRefObject<number> }) {
  const router = useRouter();
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [controls, setControls] = useState<ControlsLike | null>(null);
  const planetRefs = useRef<Map<string, Group>>(new Map());

  const focusedPlanet = useMemo(
    () => PRODUCTS.find((product) => product.id === focusedId) ?? null,
    [focusedId],
  );

  function handleSelect(id: string) {
    setFocusedId(id);
  }

  function handleReturn() {
    setFocusedId(null);
  }

  function handleArrive() {
    if (focusedPlanet?.status === "live") {
      router.push(`/${focusedPlanet.id}`);
    }
  }

  return (
    <div className="relative h-full w-full">
      {/* No opaque clear color: the canvas stays transparent so the nebula
          backdrop behind it becomes the scene's sky. */}
      <Canvas
        camera={{ position: [0, 11.5, 24], fov: 50 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.35} />
        <Starfield />
        <Core showLabel={!focusedId} />

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
          targetGroup={focusedId ? (planetRefs.current.get(focusedId) ?? null) : null}
          active={Boolean(focusedId)}
          controls={controls}
          onArrive={handleArrive}
          scrollRef={scrollRef}
        />

        <OrbitControls
          ref={(instance) => setControls(instance as unknown as ControlsLike | null)}
          enablePan={false}
          // Wheel must scroll the page (the scroll journey IS the zoom);
          // drag still gives a temporary look-around that eases back.
          enableZoom={false}
          enabled={!focusedId}
          // While traveling to/focused on a planet, the camera sits much
          // closer than the home-view minDistance allows — without
          // relaxing it here, update() clamps the camera back out every
          // frame and fights CameraRig's lerp, so it never arrives.
          minDistance={focusedId ? 1.5 : 5}
          maxDistance={30}
        />

        <EffectComposer multisampling={0}>
          <Bloom intensity={0.9} luminanceThreshold={0.18} luminanceSmoothing={0.9} mipmapBlur />
          <Vignette eskil={false} offset={0.18} darkness={0.78} />
        </EffectComposer>
      </Canvas>

      <UniverseHUD focusedPlanet={focusedPlanet} onReturn={handleReturn} />
    </div>
  );
}
