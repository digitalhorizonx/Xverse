"use client";

import { Stars } from "@react-three/drei";

export function Starfield() {
  return (
    <Stars radius={140} depth={60} count={4000} factor={2.4} saturation={0} fade speed={0.4} />
  );
}
