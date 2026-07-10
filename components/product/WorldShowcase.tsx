"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import type { Group } from "three";
import type { Brand, ProductPlanet } from "@/data/types";
import { ProductEmblem } from "@/components/universe/ProductEmblem";

const PANEL_RADIUS = 7.2;
const PANEL_ARC = Math.PI / 5.2; // angular spacing between panels

interface WorldShowcaseProps {
  product: ProductPlanet;
  brands: Brand[];
}

/**
 * The product's world in 3D: its glowing emblem hangs in space while the
 * demo brand worlds float around it as glass panels on an arc. Drag (or
 * use the arrows) to rotate the arc; click a panel to enter that world.
 */
export function WorldShowcase({ product, brands }: WorldShowcaseProps) {
  const targetRotation = useRef(0);
  const dragState = useRef<{ startX: number; startRotation: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function stepTo(index: number) {
    // Clamped, not wrapped: wrapping would swing panels past 90° where
    // their DOM content renders mirrored.
    const clamped = Math.max(0, Math.min(brands.length - 1, index));
    setActiveIndex(clamped);
    targetRotation.current = -clamped * PANEL_ARC;
  }

  return (
    <div className="relative h-[72vh] min-h-[520px] w-full overflow-hidden rounded-3xl border border-white/10 bg-ink-900/40">
      <Canvas
        camera={{ position: [0, 0.4, 11.5], fov: 45 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
        onPointerDown={(event) => {
          dragState.current = {
            startX: event.clientX,
            startRotation: targetRotation.current,
          };
        }}
        onPointerMove={(event) => {
          if (!dragState.current) return;
          const delta = (event.clientX - dragState.current.startX) / 240;
          const min = -(brands.length - 1) * PANEL_ARC;
          targetRotation.current = Math.max(
            min - PANEL_ARC * 0.3,
            Math.min(PANEL_ARC * 0.3, dragState.current.startRotation + delta),
          );
        }}
        onPointerUp={() => {
          dragState.current = null;
          // Snap to the nearest panel so a card is always front & center.
          const nearest = Math.round(-targetRotation.current / PANEL_ARC);
          stepTo(nearest);
        }}
        onPointerLeave={() => {
          dragState.current = null;
        }}
      >
        <ambientLight intensity={0.5} />
        <Stars radius={80} depth={40} count={1600} factor={2} saturation={0} fade speed={0.3} />

        {/* The product's emblem presides over its worlds. */}
        <group position={[0, 1.9, -3]}>
          <ProductEmblem planet={product} size={2.6} emphasized />
          <pointLight color={product.accentColor} intensity={8} distance={20} decay={2} />
        </group>

        <PanelArc
          brands={brands}
          product={product}
          targetRotation={targetRotation}
          activeIndex={activeIndex}
        />

        <EffectComposer multisampling={0}>
          <Bloom intensity={0.7} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
        </EffectComposer>
      </Canvas>

      {/* Controls overlay — side arrows stay clear of the centered panel,
          and the whole layer sits above the Html panels' capped z-range. */}
      <div className="pointer-events-none absolute inset-0 z-[200]">
        <button
          type="button"
          aria-label="Previous world"
          onClick={() => stepTo(activeIndex - 1)}
          className="glass pointer-events-auto absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-mist-200 transition hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Next world"
          onClick={() => stepTo(activeIndex + 1)}
          className="glass pointer-events-auto absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-mist-200 transition hover:text-white"
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
        <span className="glass absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full px-4 py-2 text-[11px] font-medium uppercase tracking-[0.25em] text-mist-400">
          {activeIndex + 1} / {brands.length} · Drag to orbit
        </span>
      </div>
    </div>
  );
}

function PanelArc({
  brands,
  product,
  targetRotation,
  activeIndex,
}: {
  brands: Brand[];
  product: ProductPlanet;
  targetRotation: React.MutableRefObject<number>;
  activeIndex: number;
}) {
  const groupRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const current = groupRef.current.rotation.y;
    groupRef.current.rotation.y += (targetRotation.current - current) * Math.min(delta * 5, 1);
    // Gentle collective float.
    groupRef.current.position.y = -0.5 + Math.sin(state.clock.elapsedTime * 0.6) * 0.08;
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {brands.map((brand, index) => {
        const angle = index * PANEL_ARC;
        return (
          <group
            key={brand.id}
            // Panels stand on a ring facing inward toward the camera.
            rotation={[0, angle, 0]}
          >
            <group position={[0, 0, PANEL_RADIUS]} rotation={[0, 0, 0]}>
              <BrandPanel
                brand={brand}
                product={product}
                distance={Math.abs(index - activeIndex)}
              />
            </group>
          </group>
        );
      })}
    </group>
  );
}

function BrandPanel({
  brand,
  product,
  distance,
}: {
  brand: Brand;
  product: ProductPlanet;
  /** Steps away from the active panel — drives focus fade. */
  distance: number;
}) {
  const router = useRouter();
  const href = `/${product.id}/${brand.slug}`;
  const isActive = distance === 0;
  // Far panels sit at steep angles where DOM content degrades — fade
  // them out hard instead of letting mirrored/skewed text show.
  const focusClass = isActive
    ? "scale-100 opacity-100"
    : distance === 1
      ? "scale-[0.88] opacity-50"
      : "pointer-events-none scale-[0.8] opacity-10";

  return (
    <Html transform distanceFactor={3.1} center zIndexRange={[100, 0]}>
      <button
        type="button"
        onClick={() => router.push(href)}
        className={`glass-strong group block w-64 cursor-pointer rounded-3xl p-5 text-left transition duration-300 ${focusClass} hover:border-white/25`}
        style={{ boxShadow: `0 0 0 1px ${brand.colors.primary}33, 0 0 40px -12px ${brand.colors.primary}66` }}
      >
        <div className="mb-3 flex items-center justify-between">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-2xl font-display text-sm font-bold text-[#fff]"
            style={{ backgroundColor: brand.colors.primary }}
          >
            {brand.logoMark}
          </span>
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-mist-300">
            Demo Brand
          </span>
        </div>

        <h3 className="font-display text-lg font-semibold text-mist-100">{brand.name}</h3>
        <p className="text-xs text-mist-400">{brand.industry}</p>

        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wider text-mist-500">
            <span>Transformation</span>
            <span>{brand.digitalTransformationScore}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full"
              style={{
                width: `${brand.digitalTransformationScore}%`,
                backgroundColor: brand.colors.primary,
              }}
            />
          </div>
        </div>

        <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-mist-200 transition-all group-hover:gap-2.5 group-hover:text-white">
          Enter world <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </span>
      </button>
    </Html>
  );
}
