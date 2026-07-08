"use client";

import dynamic from "next/dynamic";
import { UniverseLoading } from "./UniverseLoading";

// The 3D scene pulls in three.js + postprocessing — sizable, client-only
// dependencies. Loading it via next/dynamic with ssr:false keeps it out of
// the server bundle and off the critical path for first paint.
const UniverseScene = dynamic(() => import("./UniverseScene").then((mod) => mod.UniverseScene), {
  ssr: false,
  loading: () => <UniverseLoading />,
});

export function UniverseCanvas() {
  return (
    <div className="h-[70vh] min-h-[480px] w-full sm:h-[80vh]">
      <UniverseScene />
    </div>
  );
}
