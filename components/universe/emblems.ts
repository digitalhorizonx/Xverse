"use client";

import { CanvasTexture, SRGBColorSpace } from "three";
import type { HorizonXProductId } from "@/data/types";
import { drawEmblemCanvas } from "./emblemCanvas";

/** three.js texture wrapper around the shared emblem painter — 3D scene
 * only; DOM consumers import drawEmblemCanvas directly. */
export function createEmblemTexture(
  id: HorizonXProductId,
  color: string,
  accentColor: string,
): CanvasTexture {
  const texture = new CanvasTexture(drawEmblemCanvas(id, color, accentColor));
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
