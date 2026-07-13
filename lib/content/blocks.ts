import { z } from "zod";

// Validation for the showcase "blocks" JSON — the rich structured payloads
// that power the interactive demo sections. The shapes mirror V1's
// data/types.ts (which Phase 5 migrates from). Each key is optional (a
// showcase uses only the blocks it needs) and unknown keys are preserved,
// so new block types can be introduced without a schema migration.

const stat = z.object({ label: z.string(), value: z.string() });

const capability = z.object({ icon: z.string(), title: z.string(), description: z.string() });

const section = z.object({ id: z.string(), label: z.string() });

const sampleBusiness = z.object({
  id: z.string(),
  name: z.string(),
  industry: z.string(),
  logoMark: z.string(),
  color: z.string(),
  accent: z.string(),
  summary: z.string(),
  highlights: z.array(z.string()),
});

const siteTemplate = z.object({
  id: z.string(),
  businessName: z.string(),
  industry: z.string(),
  kind: z.enum(["business", "corporate", "ecommerce", "landing"]),
  navLabels: z.array(z.string()),
  heroTitle: z.string(),
  heroSubtitle: z.string(),
  heroCta: z.string(),
  palette: z.object({ primary: z.string(), surface: z.string(), accent: z.string() }),
  sections: z.array(z.string()),
  features: z.array(z.string()),
});

const appScreenItem = z.object({
  icon: z.string(),
  primary: z.string(),
  secondary: z.string().optional(),
  trailing: z.string().optional(),
});

const appDemo = z.object({
  id: z.string(),
  businessName: z.string(),
  category: z.string(),
  color: z.string(),
  pushNotification: z.object({ title: z.string(), body: z.string() }),
  screens: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      title: z.string(),
      items: z.array(appScreenItem),
      cta: z.string().optional(),
    }),
  ),
});

const vehicle = z.object({
  id: z.string(),
  name: z.string(),
  year: z.number(),
  price: z.string(),
  mileage: z.string(),
  status: z.enum(["available", "reserved", "in-inspection"]),
  color: z.string(),
});

const autoService = z.object({ icon: z.string(), name: z.string(), description: z.string() });

const aiAgent = z.object({ name: z.string(), role: z.string(), description: z.string() });

const chatTurn = z.object({ from: z.enum(["customer", "agent"]), text: z.string() });

const aiWorkflow = z.object({
  id: z.string(),
  name: z.string(),
  trigger: z.string(),
  steps: z.array(z.string()),
  outcome: z.string(),
});

/** English blocks: full shapes. */
export const blocksSchema = z
  .object({
    stats: z.array(stat),
    capabilities: z.array(capability),
    sections: z.array(section),
    sampleBusinesses: z.array(sampleBusiness),
    siteTemplates: z.array(siteTemplate),
    appDemos: z.array(appDemo),
    vehicles: z.array(vehicle),
    autoServices: z.array(autoService),
    aiAgents: z.array(aiAgent),
    chatScript: z.array(chatTurn),
    aiWorkflows: z.array(aiWorkflow),
  })
  .partial()
  // Unknown top-level block types are allowed through untouched — the
  // model must stay extensible without migrations.
  .catchall(z.unknown());

/** Arabic blocks: sparse overrides — any subset of the same shapes, with
 * per-item partials (the V1-proven merge model: AR overrides EN by index
 * or id). Deep partial validation keeps this permissive but structured. */
export const blocksArSchema = z.record(z.string(), z.unknown());

export type Blocks = z.infer<typeof blocksSchema>;

export function parseBlocks(raw: string): { ok: true; value: Blocks } | { ok: false; error: string } {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, error: "invalid_json" };
  }
  const parsed = blocksSchema.safeParse(json);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: `${issue?.path.join(".") ?? ""}: ${issue?.message ?? "invalid"}` };
  }
  return { ok: true, value: parsed.data };
}

export function parseBlocksAr(raw: string): { ok: true; value: Record<string, unknown> } | { ok: false; error: string } {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, error: "invalid_json" };
  }
  const parsed = blocksArSchema.safeParse(json);
  if (!parsed.success) return { ok: false, error: "invalid_structure" };
  return { ok: true, value: parsed.data };
}
