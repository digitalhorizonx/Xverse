import type { ContentStatus, ShowcaseType } from "@/db/schema";
import type { Dictionary } from "@/lib/i18n/types";

export function statusLabel(dict: Dictionary, status: ContentStatus): string {
  const t = dict.admin.content;
  return {
    draft: t.statusDraft,
    in_review: t.statusInReview,
    approved: t.statusApproved,
    published: t.statusPublished,
    archived: t.statusArchived,
  }[status];
}

export function statusTone(status: ContentStatus): "neutral" | "positive" | "warning" | "accent" {
  return { draft: "neutral", in_review: "warning", approved: "accent", published: "positive", archived: "neutral" }[
    status
  ] as "neutral" | "positive" | "warning" | "accent";
}

export function typeLabel(dict: Dictionary, type: ShowcaseType): string {
  const t = dict.admin.content;
  return {
    "demo-brand": t.typeDemoBrand,
    "verified-client": t.typeVerifiedClient,
    concept: t.typeConcept,
    template: t.typeTemplate,
  }[type];
}
