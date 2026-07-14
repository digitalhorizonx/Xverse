import { and, asc, desc, eq, ne, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  contentVersions,
  showcases,
  CONTENT_STATUSES,
  type ContentStatus,
  type Showcase,
} from "@/db/schema";
import { hasPermission } from "@/lib/auth/permissions";
import type { AuthContext } from "@/lib/auth/session";
import { parseBlocks, parseBlocksAr } from "./blocks";

export class ContentError extends Error {
  constructor(
    public code:
      | "not_found"
      | "slug_taken"
      | "invalid_transition"
      | "forbidden_transition"
      | "missing_translations"
      | "invalid_blocks"
      | "published_delete",
    public detail?: string,
  ) {
    super(code);
  }
}

// ---------------------------------------------------------------- workflow

/** Legal state machine edges. Archived can be re-drafted; published can be
 * unpublished back to approved or archived. */
const TRANSITIONS: Record<ContentStatus, ContentStatus[]> = {
  draft: ["in_review", "archived"],
  in_review: ["draft", "approved", "archived"],
  approved: ["published", "draft", "archived"],
  published: ["approved", "archived"],
  archived: ["draft"],
};

/** Which transitions demand the publish permission (editors stop at
 * in_review; approving, publishing and unpublishing are gatekeeper acts). */
function needsPublishPermission(from: ContentStatus, to: ContentStatus): boolean {
  return to === "approved" || to === "published" || from === "published";
}

/** Publishing requires the mandatory bilingual fields. */
export function missingTranslations(row: Showcase): string[] {
  const missing: string[] = [];
  if (!row.titleEn.trim()) missing.push("titleEn");
  if (!row.titleAr.trim()) missing.push("titleAr");
  if (!row.summaryEn.trim()) missing.push("summaryEn");
  if (!row.summaryAr.trim()) missing.push("summaryAr");
  return missing;
}

// ---------------------------------------------------------------- queries

export function listShowcases(filter?: { productId?: string; status?: ContentStatus }) {
  const db = getDb();
  const conditions = [];
  if (filter?.productId) conditions.push(eq(showcases.productId, filter.productId));
  if (filter?.status) conditions.push(eq(showcases.status, filter.status));
  let query = db.select().from(showcases).$dynamic();
  if (conditions.length) query = query.where(and(...conditions));
  return query.orderBy(asc(showcases.order), asc(showcases.createdAt)).all();
}

export function getShowcase(id: string): Showcase {
  const row = getDb().select().from(showcases).where(eq(showcases.id, id)).get();
  if (!row) throw new ContentError("not_found");
  return row;
}

// ---------------------------------------------------------------- versioning

function snapshot(row: Showcase, auth: AuthContext, reason: string): void {
  const db = getDb();
  db.insert(contentVersions)
    .values({
      entityType: "showcase",
      entityId: row.id,
      reason,
      snapshot: JSON.stringify(row),
      createdBy: auth.user.id,
      createdByEmail: auth.user.email,
      createdAt: new Date(),
    })
    .run();
  // Retention: keep the latest 50 versions per entity.
  db.run(sql`
    DELETE FROM content_versions
    WHERE entity_type = 'showcase' AND entity_id = ${row.id}
      AND id NOT IN (
        SELECT id FROM content_versions
        WHERE entity_type = 'showcase' AND entity_id = ${row.id}
        ORDER BY created_at DESC, id DESC LIMIT 50
      )
  `);
}

export function listVersions(id: string) {
  return getDb()
    .select({
      id: contentVersions.id,
      reason: contentVersions.reason,
      createdByEmail: contentVersions.createdByEmail,
      createdAt: contentVersions.createdAt,
    })
    .from(contentVersions)
    .where(and(eq(contentVersions.entityType, "showcase"), eq(contentVersions.entityId, id)))
    .orderBy(desc(contentVersions.createdAt), desc(contentVersions.id))
    .limit(50)
    .all();
}

// ---------------------------------------------------------------- mutations

export interface ShowcasePatch {
  slug?: string;
  productId?: string;
  type?: Showcase["type"];
  verified?: boolean;
  featured?: boolean;
  industryId?: string | null;
  tagIds?: string;
  titleEn?: string;
  titleAr?: string;
  summaryEn?: string;
  summaryAr?: string;
  storyEn?: string;
  storyAr?: string;
  seoTitleEn?: string;
  seoTitleAr?: string;
  seoDescriptionEn?: string;
  seoDescriptionAr?: string;
  blocksEn?: string;
  blocksAr?: string;
}

function assertSlugFree(slug: string, exceptId?: string): void {
  const clash = getDb()
    .select({ id: showcases.id })
    .from(showcases)
    .where(exceptId ? and(eq(showcases.slug, slug), ne(showcases.id, exceptId)) : eq(showcases.slug, slug))
    .get();
  if (clash) throw new ContentError("slug_taken");
}

function validateBlocks(patch: ShowcasePatch): void {
  if (patch.blocksEn !== undefined) {
    const parsed = parseBlocks(patch.blocksEn);
    if (!parsed.ok) throw new ContentError("invalid_blocks", parsed.error);
  }
  if (patch.blocksAr !== undefined) {
    const parsed = parseBlocksAr(patch.blocksAr);
    if (!parsed.ok) throw new ContentError("invalid_blocks", parsed.error);
  }
}

export function createShowcase(auth: AuthContext, input: { slug: string; productId: string; type?: Showcase["type"] }): Showcase {
  assertSlugFree(input.slug);
  const db = getDb();
  const now = new Date();
  const maxOrder =
    db.select({ max: sql<number>`coalesce(max(sort_order), 0)` }).from(showcases).get()?.max ?? 0;
  const id = crypto.randomUUID();
  db.insert(showcases)
    .values({
      id,
      slug: input.slug,
      productId: input.productId,
      type: input.type ?? "demo-brand",
      status: "draft",
      order: maxOrder + 1,
      createdBy: auth.user.id,
      updatedBy: auth.user.id,
      createdAt: now,
      updatedAt: now,
    })
    .run();
  return getShowcase(id);
}

export function updateShowcase(auth: AuthContext, id: string, patch: ShowcasePatch): Showcase {
  const current = getShowcase(id);
  if (patch.slug) assertSlugFree(patch.slug, id);
  validateBlocks(patch);

  snapshot(current, auth, "update");
  getDb()
    .update(showcases)
    .set({ ...patch, updatedBy: auth.user.id, updatedAt: new Date() })
    .where(eq(showcases.id, id))
    .run();
  return getShowcase(id);
}

export function transitionShowcase(auth: AuthContext, id: string, to: ContentStatus): Showcase {
  if (!CONTENT_STATUSES.includes(to)) throw new ContentError("invalid_transition");
  const current = getShowcase(id);

  if (!TRANSITIONS[current.status].includes(to)) {
    throw new ContentError("invalid_transition", `${current.status} → ${to}`);
  }
  if (needsPublishPermission(current.status, to) && !hasPermission(auth.user.role, "content.publish")) {
    throw new ContentError("forbidden_transition");
  }
  if (to === "published") {
    const missing = missingTranslations(current);
    if (missing.length) throw new ContentError("missing_translations", missing.join(","));
  }

  snapshot(current, auth, `transition:${to}`);
  getDb()
    .update(showcases)
    .set({
      status: to,
      updatedBy: auth.user.id,
      updatedAt: new Date(),
      ...(to === "published" ? { publishedAt: new Date() } : {}),
    })
    .where(eq(showcases.id, id))
    .run();
  return getShowcase(id);
}

export function duplicateShowcase(auth: AuthContext, id: string): Showcase {
  const source = getShowcase(id);
  const db = getDb();
  const now = new Date();
  let slug = `${source.slug}-copy`;
  for (let n = 2; ; n++) {
    try {
      assertSlugFree(slug);
      break;
    } catch {
      slug = `${source.slug}-copy-${n}`;
    }
  }
  const newId = crypto.randomUUID();
  const maxOrder =
    db.select({ max: sql<number>`coalesce(max(sort_order), 0)` }).from(showcases).get()?.max ?? 0;
  db.insert(showcases)
    .values({
      ...source,
      id: newId,
      slug,
      status: "draft",
      featured: false,
      order: maxOrder + 1,
      publishedAt: null,
      createdBy: auth.user.id,
      updatedBy: auth.user.id,
      createdAt: now,
      updatedAt: now,
    })
    .run();
  return getShowcase(newId);
}

export function restoreShowcaseVersion(auth: AuthContext, id: string, versionId: number): Showcase {
  const db = getDb();
  const version = db
    .select()
    .from(contentVersions)
    .where(
      and(
        eq(contentVersions.id, versionId),
        eq(contentVersions.entityType, "showcase"),
        eq(contentVersions.entityId, id),
      ),
    )
    .get();
  if (!version) throw new ContentError("not_found");
  const current = getShowcase(id);
  const restored = JSON.parse(version.snapshot) as Showcase;

  snapshot(current, auth, `restore:${versionId}`);
  getDb()
    .update(showcases)
    .set({
      // Content fields only — identity, status, and timestamps stay put so
      // a rollback never silently republishes or un-publishes anything.
      type: restored.type,
      verified: restored.verified,
      industryId: restored.industryId,
      tagIds: restored.tagIds,
      titleEn: restored.titleEn,
      titleAr: restored.titleAr,
      summaryEn: restored.summaryEn,
      summaryAr: restored.summaryAr,
      storyEn: restored.storyEn,
      storyAr: restored.storyAr,
      seoTitleEn: restored.seoTitleEn,
      seoTitleAr: restored.seoTitleAr,
      seoDescriptionEn: restored.seoDescriptionEn,
      seoDescriptionAr: restored.seoDescriptionAr,
      blocksEn: restored.blocksEn,
      blocksAr: restored.blocksAr,
      updatedBy: auth.user.id,
      updatedAt: new Date(),
    })
    .where(eq(showcases.id, id))
    .run();
  return getShowcase(id);
}

export function reorderShowcases(auth: AuthContext, orderedIds: string[]): void {
  const db = getDb();
  db.transaction((tx) => {
    orderedIds.forEach((id, index) => {
      tx.update(showcases)
        .set({ order: index + 1, updatedBy: auth.user.id, updatedAt: new Date() })
        .where(eq(showcases.id, id))
        .run();
    });
  });
}

export function deleteShowcase(auth: AuthContext, id: string): Showcase {
  const current = getShowcase(id);
  // Published content must be unpublished/archived first — deletion of
  // live public content in one step is exactly the accident to prevent.
  if (current.status === "published") throw new ContentError("published_delete");
  snapshot(current, auth, "delete");
  getDb().delete(showcases).where(eq(showcases.id, id)).run();
  return current;
}
