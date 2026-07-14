import { asc, eq, ne, and } from "drizzle-orm";
import { getDb } from "@/db";
import { cmsProducts, industries, tags, type CmsProduct } from "@/db/schema";
import type { AuthContext } from "@/lib/auth/session";
import { ContentError } from "./showcases";

// Products / industries / tags — the small catalog entities around
// showcases. Products are edit-only sparingly: planets and routes hang off
// them, so create/delete are deliberate admin acts.

export function listProducts() {
  return getDb().select().from(cmsProducts).orderBy(asc(cmsProducts.order)).all();
}

export interface ProductPatch {
  name?: string;
  taglineEn?: string;
  taglineAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  color?: string;
  accentColor?: string;
  live?: boolean;
  ctaLabelEn?: string;
  ctaLabelAr?: string;
  ctaUrl?: string;
  active?: boolean;
  order?: number;
}

export function updateProduct(auth: AuthContext, id: string, patch: ProductPatch): CmsProduct {
  const db = getDb();
  const existing = db.select().from(cmsProducts).where(eq(cmsProducts.id, id)).get();
  if (!existing) throw new ContentError("not_found");
  db.update(cmsProducts)
    .set({ ...patch, updatedBy: auth.user.id, updatedAt: new Date() })
    .where(eq(cmsProducts.id, id))
    .run();
  return db.select().from(cmsProducts).where(eq(cmsProducts.id, id)).get()!;
}

export function createProduct(
  auth: AuthContext,
  input: {
    id: string;
    name: string;
    showcaseSlug: string;
    color: string;
    accentColor: string;
    orbitRadius: number;
    orbitSpeedPct: number;
    ctaUrl: string;
  },
): CmsProduct {
  const db = getDb();
  if (db.select({ id: cmsProducts.id }).from(cmsProducts).where(eq(cmsProducts.id, input.id)).get()) {
    throw new ContentError("slug_taken");
  }
  if (
    db
      .select({ id: cmsProducts.id })
      .from(cmsProducts)
      .where(eq(cmsProducts.showcaseSlug, input.showcaseSlug))
      .get()
  ) {
    throw new ContentError("slug_taken");
  }
  const now = new Date();
  const order = listProducts().length + 1;
  db.insert(cmsProducts)
    .values({
      ...input,
      taglineEn: "",
      taglineAr: "",
      descriptionEn: "",
      descriptionAr: "",
      ctaLabelEn: `Start with ${input.name}`,
      ctaLabelAr: `ابدأ مع ${input.name}`,
      live: false,
      active: false,
      order,
      createdAt: now,
      updatedAt: now,
      updatedBy: auth.user.id,
    })
    .run();
  return db.select().from(cmsProducts).where(eq(cmsProducts.id, input.id)).get()!;
}

// ---------------------------------------------------------------- industries

export function listIndustries() {
  return getDb().select().from(industries).orderBy(asc(industries.order), asc(industries.slug)).all();
}

export function upsertIndustry(
  input: { id?: string; slug: string; nameEn: string; nameAr: string; active?: boolean },
) {
  const db = getDb();
  const clash = db
    .select({ id: industries.id })
    .from(industries)
    .where(
      input.id
        ? and(eq(industries.slug, input.slug), ne(industries.id, input.id))
        : eq(industries.slug, input.slug),
    )
    .get();
  if (clash) throw new ContentError("slug_taken");

  if (input.id) {
    db.update(industries)
      .set({ slug: input.slug, nameEn: input.nameEn, nameAr: input.nameAr, active: input.active ?? true })
      .where(eq(industries.id, input.id))
      .run();
    return input.id;
  }
  const id = crypto.randomUUID();
  db.insert(industries)
    .values({ id, slug: input.slug, nameEn: input.nameEn, nameAr: input.nameAr, order: listIndustries().length + 1 })
    .run();
  return id;
}

export function deleteIndustry(id: string): void {
  getDb().delete(industries).where(eq(industries.id, id)).run();
}

// ---------------------------------------------------------------- tags

export function listTags() {
  return getDb().select().from(tags).orderBy(asc(tags.kind), asc(tags.slug)).all();
}

export function upsertTag(input: { id?: string; slug: string; kind: "category" | "tag"; nameEn: string; nameAr: string }) {
  const db = getDb();
  const clash = db
    .select({ id: tags.id })
    .from(tags)
    .where(input.id ? and(eq(tags.slug, input.slug), ne(tags.id, input.id)) : eq(tags.slug, input.slug))
    .get();
  if (clash) throw new ContentError("slug_taken");

  if (input.id) {
    db.update(tags)
      .set({ slug: input.slug, kind: input.kind, nameEn: input.nameEn, nameAr: input.nameAr })
      .where(eq(tags.id, input.id))
      .run();
    return input.id;
  }
  const id = crypto.randomUUID();
  db.insert(tags).values({ id, ...input }).run();
  return id;
}

export function deleteTag(id: string): void {
  getDb().delete(tags).where(eq(tags.id, id)).run();
}
