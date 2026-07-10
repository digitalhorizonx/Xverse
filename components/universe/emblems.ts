"use client";

import { CanvasTexture, SRGBColorSpace } from "three";
import type { HorizonXProductId } from "@/data/types";

const SIZE = 512;
const CENTER = SIZE / 2;

type Ctx = CanvasRenderingContext2D;

/**
 * Per-product glyph painters. Each draws its mark centered in a 512px
 * canvas — pure strokes on transparent black, so additive blending in the
 * scene turns them into glowing holograms and bloom does the rest.
 */
const GLYPHS: Record<HorizonXProductId, (ctx: Ctx) => void> = {
  // Xability — the X: two crossing light ribbons.
  xability(ctx) {
    const r = 96;
    ctx.beginPath();
    ctx.moveTo(CENTER - r, CENTER - r);
    ctx.lineTo(CENTER + r, CENTER + r);
    ctx.moveTo(CENTER + r, CENTER - r);
    ctx.lineTo(CENTER - r, CENTER + r);
    ctx.stroke();
  },

  // XSites — a browser window: frame, top bar, cursor spark.
  xsite(ctx) {
    const w = 190;
    const h = 150;
    const x = CENTER - w / 2;
    const y = CENTER - h / 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 22);
    ctx.moveTo(x, y + 44);
    ctx.lineTo(x + w, y + 44);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + 26, y + 22, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(CENTER + 34, CENTER + 30, 10, 0, Math.PI * 2);
    ctx.fill();
  },

  // XApps — rounded app tile with a 2×2 dot grid.
  xapp(ctx) {
    const s = 168;
    ctx.beginPath();
    ctx.roundRect(CENTER - s / 2, CENTER - s / 2, s, s, 38);
    ctx.stroke();
    const offset = 38;
    for (const dx of [-offset, offset]) {
      for (const dy of [-offset, offset]) {
        ctx.beginPath();
        ctx.arc(CENTER + dx, CENTER + dy, 14, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },

  // XAI — a neural node: center spark with branching synapses.
  xai(ctx) {
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, 26, 0, Math.PI * 2);
    ctx.fill();
    const arms = 6;
    for (let i = 0; i < arms; i += 1) {
      const angle = (i / arms) * Math.PI * 2 + Math.PI / 12;
      const inner = 44;
      const outer = 112;
      const x1 = CENTER + Math.cos(angle) * inner;
      const y1 = CENTER + Math.sin(angle) * inner;
      const x2 = CENTER + Math.cos(angle) * outer;
      const y2 = CENTER + Math.sin(angle) * outer;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x2, y2, 11, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  // XAuto — an infinity loop: continuous automation.
  xauto(ctx) {
    const loop = 62;
    ctx.beginPath();
    ctx.arc(CENTER - loop, CENTER, loop, 0, Math.PI * 2);
    ctx.arc(CENTER + loop, CENTER, loop, 0, Math.PI * 2);
    ctx.stroke();
  },
};

function paintPass(ctx: Ctx, color: string, lineWidth: number, blur: number, draw: (ctx: Ctx) => void) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  draw(ctx);
}

/**
 * Renders a product's glowing emblem — outer ring plus glyph — to a
 * CanvasTexture. Two passes per element: a heavy blurred stroke in the
 * product color for the glow body, then a thin near-white core so the
 * mark reads hot and crisp. Black background disappears under additive
 * blending in the scene.
 */
export function createEmblemTexture(
  id: HorizonXProductId,
  color: string,
  accentColor: string,
): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, SIZE, SIZE);

    const drawRing = (c: Ctx) => {
      c.beginPath();
      c.arc(CENTER, CENTER, 216, 0, Math.PI * 2);
      c.stroke();
    };

    // Ring: glow pass then hairline core.
    paintPass(ctx, color, 10, 28, drawRing);
    paintPass(ctx, accentColor, 3, 6, drawRing);

    // Glyph: thick glow pass then hot core.
    const glyph = GLYPHS[id];
    paintPass(ctx, color, 26, 32, glyph);
    paintPass(ctx, "#f8fdff", 8, 8, glyph);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
