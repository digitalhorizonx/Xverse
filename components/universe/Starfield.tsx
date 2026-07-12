"use client";

import { Stars } from "@react-three/drei";

/** Background stars; count is the perf lever — phones get far fewer. */
export function Starfield({ count = 4000 }: { count?: number }) {
  return (
    <Stars radius={140} depth={60} count={count} factor={2.4} saturation={0} fade speed={0.4} />
  );
}
