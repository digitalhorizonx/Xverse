"use client";

import dynamic from "next/dynamic";
import type { MutableRefObject } from "react";
import type { ProductPlanet } from "@/data/types";
import { UniverseLoading } from "./UniverseLoading";

// The 3D scene pulls in three.js + postprocessing — sizable, client-only
// dependencies. Loading it via next/dynamic with ssr:false keeps it out of
// the server bundle and off the critical path for first paint.
const UniverseScene = dynamic(() => import("./UniverseScene").then((mod) => mod.UniverseScene), {
  ssr: false,
  loading: () => <UniverseLoading />,
});

interface UniverseCanvasProps {
  scrollRef?: MutableRefObject<number>;
  playEntry?: boolean;
  onEntryComplete?: () => void;
  products: ProductPlanet[];
}

export function UniverseCanvas({ scrollRef, playEntry, onEntryComplete, products }: UniverseCanvasProps) {
  return (
    <div className="h-full min-h-[480px] w-full">
      <UniverseScene scrollRef={scrollRef} playEntry={playEntry} onEntryComplete={onEntryComplete} products={products} />
    </div>
  );
}
