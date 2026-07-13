import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";

// Phase 1 schema: identity, sessions, abuse control, and the audit trail.
// Content tables land in Phase 3 — keeping this PR reviewable on the
// security surface alone.

export const ROLES = ["admin", "editor", "viewer"] as const;
export type Role = (typeof ROLES)[number];

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(), // crypto.randomUUID()
    email: text("email").notNull(),
    name: text("name").notNull(),
    role: text("role", { enum: ROLES }).notNull().default("viewer"),
    // scrypt output, self-describing format: scrypt$N$r$p$salt$hash (b64url)
    passwordHash: text("password_hash").notNull(),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => ({
    emailUnique: uniqueIndex("users_email_unique").on(table.email),
  }),
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(), // crypto.randomUUID()
    // HMAC-SHA256(token, SESSION_SECRET) — the raw token only ever lives
    // in the visitor's cookie, so a leaked database cannot mint sessions.
    tokenHash: text("token_hash").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    // Coarse client hints for the security page / audit review; no IPs.
    userAgent: text("user_agent"),
  },
  (table) => ({
    tokenUnique: uniqueIndex("sessions_token_hash_unique").on(table.tokenHash),
    byUser: index("sessions_user_idx").on(table.userId),
    byExpiry: index("sessions_expires_idx").on(table.expiresAt),
  }),
);

/** Failed/successful login attempts, for DB-backed rate limiting that
 * survives container restarts. Pruned opportunistically on write. */
export const loginAttempts = sqliteTable(
  "login_attempts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** Lowercased email attempted. */
    identifier: text("identifier").notNull(),
    /** SHA-256 of the client IP — enough to rate-limit, no raw PII at rest. */
    ipHash: text("ip_hash").notNull(),
    success: integer("success", { mode: "boolean" }).notNull(),
    attemptedAt: integer("attempted_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => ({
    byIdentifier: index("login_attempts_identifier_idx").on(table.identifier, table.attemptedAt),
    byIp: index("login_attempts_ip_idx").on(table.ipHash, table.attemptedAt),
  }),
);

export const auditLog = sqliteTable(
  "audit_log",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** Null for unauthenticated events (e.g. failed logins). */
    actorId: text("actor_id"),
    actorEmail: text("actor_email"),
    /** Dotted verb, e.g. "auth.login", "auth.login_failed", "user.bootstrap". */
    action: text("action").notNull(),
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    /** JSON blob of non-sensitive context. Never passwords/tokens. */
    detail: text("detail"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => ({
    byTime: index("audit_log_time_idx").on(table.createdAt),
    byActor: index("audit_log_actor_idx").on(table.actorId),
  }),
);

// ---------------------------------------------------------------------------
// Phase 3: content model. Bilingual-first (explicit En/Ar columns for the
// mandatory short fields), with zod-validated JSON "blocks" for the rich
// structured payloads (stats, capabilities, demos…) — see lib/content/blocks.ts.

export const SHOWCASE_TYPES = ["demo-brand", "verified-client", "concept", "template"] as const;
export type ShowcaseType = (typeof SHOWCASE_TYPES)[number];

export const CONTENT_STATUSES = ["draft", "in_review", "approved", "published", "archived"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const cmsProducts = sqliteTable(
  "cms_products",
  {
    /** Stable product id, e.g. "xability" — matches V1 data ids. */
    id: text("id").primaryKey(),
    /** Latin brand name (not localized by policy). */
    name: text("name").notNull(),
    showcaseSlug: text("showcase_slug").notNull(),
    taglineEn: text("tagline_en").notNull(),
    taglineAr: text("tagline_ar").notNull(),
    descriptionEn: text("description_en").notNull(),
    descriptionAr: text("description_ar").notNull(),
    color: text("color").notNull(),
    accentColor: text("accent_color").notNull(),
    live: integer("live", { mode: "boolean" }).notNull().default(false),
    ctaLabelEn: text("cta_label_en").notNull(),
    ctaLabelAr: text("cta_label_ar").notNull(),
    ctaUrl: text("cta_url").notNull(),
    orbitRadius: integer("orbit_radius").notNull(),
    /** Stored ×100 (SQLite integer): 0.82 → 82. */
    orbitSpeedPct: integer("orbit_speed_pct").notNull(),
    order: integer("sort_order").notNull().default(0),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    updatedBy: text("updated_by"),
  },
  (table) => ({
    slugUnique: uniqueIndex("cms_products_slug_unique").on(table.showcaseSlug),
  }),
);

export const industries = sqliteTable(
  "industries",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    nameEn: text("name_en").notNull(),
    nameAr: text("name_ar").notNull(),
    order: integer("sort_order").notNull().default(0),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
  },
  (table) => ({ slugUnique: uniqueIndex("industries_slug_unique").on(table.slug) }),
);

export const TAG_KINDS = ["category", "tag"] as const;

export const tags = sqliteTable(
  "tags",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    kind: text("kind", { enum: TAG_KINDS }).notNull().default("tag"),
    nameEn: text("name_en").notNull(),
    nameAr: text("name_ar").notNull(),
  },
  (table) => ({ slugUnique: uniqueIndex("tags_slug_unique").on(table.slug) }),
);

export const showcases = sqliteTable(
  "showcases",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    productId: text("product_id")
      .notNull()
      .references(() => cmsProducts.id),
    type: text("type", { enum: SHOWCASE_TYPES }).notNull().default("demo-brand"),
    status: text("status", { enum: CONTENT_STATUSES }).notNull().default("draft"),
    /** Verified = real client story approved for public claims. */
    verified: integer("verified", { mode: "boolean" }).notNull().default(false),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    order: integer("sort_order").notNull().default(0),
    industryId: text("industry_id").references(() => industries.id),
    /** Comma-separated tag ids — a join table is overkill at this scale. */
    tagIds: text("tag_ids").notNull().default(""),

    titleEn: text("title_en").notNull().default(""),
    titleAr: text("title_ar").notNull().default(""),
    summaryEn: text("summary_en").notNull().default(""),
    summaryAr: text("summary_ar").notNull().default(""),
    storyEn: text("story_en").notNull().default(""),
    storyAr: text("story_ar").notNull().default(""),

    seoTitleEn: text("seo_title_en").notNull().default(""),
    seoTitleAr: text("seo_title_ar").notNull().default(""),
    seoDescriptionEn: text("seo_description_en").notNull().default(""),
    seoDescriptionAr: text("seo_description_ar").notNull().default(""),

    /** JSON, validated by lib/content/blocks.ts (stats, capabilities,
     * sections, sample businesses, demos…). EN is the source; AR holds
     * sparse overrides merged at render time — same model V1 proved. */
    blocksEn: text("blocks_en").notNull().default("{}"),
    blocksAr: text("blocks_ar").notNull().default("{}"),

    createdBy: text("created_by"),
    updatedBy: text("updated_by"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
  },
  (table) => ({
    slugUnique: uniqueIndex("showcases_slug_unique").on(table.slug),
    byProduct: index("showcases_product_idx").on(table.productId),
    byStatus: index("showcases_status_idx").on(table.status),
  }),
);

export const MEDIA_KINDS = ["image", "logo", "screenshot", "mockup", "video", "document"] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

export const media = sqliteTable(
  "media",
  {
    id: text("id").primaryKey(),
    /** Content-hash filename on disk, e.g. "ab12…ef.webp" — never the
     * user-supplied name (that lives in originalName for display). */
    fileName: text("file_name").notNull(),
    thumbFileName: text("thumb_file_name"),
    originalName: text("original_name").notNull(),
    mime: text("mime").notNull(),
    kind: text("kind", { enum: MEDIA_KINDS }).notNull().default("image"),
    sizeBytes: integer("size_bytes").notNull(),
    width: integer("width"),
    height: integer("height"),
    altEn: text("alt_en").notNull().default(""),
    altAr: text("alt_ar").notNull().default(""),
    createdBy: text("created_by"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => ({
    fileUnique: uniqueIndex("media_file_unique").on(table.fileName),
    byKind: index("media_kind_idx").on(table.kind),
  }),
);

export type MediaRow = typeof media.$inferSelect;

/** Full snapshots on every save/transition — powers History + rollback. */
export const contentVersions = sqliteTable(
  "content_versions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    /** What produced this version, e.g. "update", "transition:published". */
    reason: text("reason").notNull(),
    snapshot: text("snapshot").notNull(),
    createdBy: text("created_by"),
    createdByEmail: text("created_by_email"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => ({
    byEntity: index("content_versions_entity_idx").on(table.entityType, table.entityId, table.createdAt),
  }),
);

export type CmsProduct = typeof cmsProducts.$inferSelect;
export type Showcase = typeof showcases.$inferSelect;
export type Industry = typeof industries.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type ContentVersion = typeof contentVersions.$inferSelect;

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
