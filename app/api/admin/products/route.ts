import { NextResponse } from "next/server";
import { z } from "zod";
import { adminRoute } from "@/lib/auth/adminRoute";
import { recordAudit } from "@/lib/auth/audit";
import { createProduct, listProducts } from "@/lib/content/catalog";
import { contentErrorResponse } from "@/lib/content/httpErrors";

export const GET = adminRoute("content.view", () => {
  return NextResponse.json({ products: listProducts() });
});

const createSchema = z.object({
  id: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/).min(2).max(40),
  name: z.string().trim().min(1).max(60),
  showcaseSlug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/).min(2).max(60),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  orbitRadius: z.number().int().min(3).max(40),
  orbitSpeedPct: z.number().int().min(10).max(200),
  ctaUrl: z.string().url().max(300),
});

// Creating a product adds a planet to the public universe once activated —
// deliberately an admin-only, settings-level act.
export const POST = adminRoute("settings.manage", async (request, auth) => {
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  try {
    const product = createProduct(auth, parsed.data);
    recordAudit({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "content.product_create",
      entityType: "product",
      entityId: product.id,
    });
    return NextResponse.json({ ok: true, product }, { status: 201 });
  } catch (error) {
    return contentErrorResponse(error) ?? Promise.reject(error);
  }
});
