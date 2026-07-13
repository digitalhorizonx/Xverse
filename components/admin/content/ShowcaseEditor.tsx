"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, History, Save } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { ContentStatus, Industry, Showcase, ShowcaseType, Tag } from "@/db/schema";
import { SHOWCASE_TYPES } from "@/db/schema";
import {
  AdminButton,
  AdminCard,
  AdminDialog,
  Badge,
  Field,
  InlineError,
  InlineSuccess,
  Select,
  TextInput,
  inputClasses,
} from "../ui";
import { statusLabel, statusTone, typeLabel } from "./meta";

interface ProductOption {
  id: string;
  name: string;
}

interface Capabilities {
  canPublish: boolean;
}

type Tab = "basics" | "content" | "seo" | "blocks" | "history";

/** The editable subset of a showcase row. */
type FormState = Pick<
  Showcase,
  | "slug"
  | "productId"
  | "type"
  | "verified"
  | "featured"
  | "industryId"
  | "tagIds"
  | "titleEn"
  | "titleAr"
  | "summaryEn"
  | "summaryAr"
  | "storyEn"
  | "storyAr"
  | "seoTitleEn"
  | "seoTitleAr"
  | "seoDescriptionEn"
  | "seoDescriptionAr"
  | "blocksEn"
  | "blocksAr"
>;

function toForm(row: Showcase): FormState {
  return {
    slug: row.slug,
    productId: row.productId,
    type: row.type,
    verified: row.verified,
    featured: row.featured,
    industryId: row.industryId,
    tagIds: row.tagIds,
    titleEn: row.titleEn,
    titleAr: row.titleAr,
    summaryEn: row.summaryEn,
    summaryAr: row.summaryAr,
    storyEn: row.storyEn,
    storyAr: row.storyAr,
    seoTitleEn: row.seoTitleEn,
    seoTitleAr: row.seoTitleAr,
    seoDescriptionEn: row.seoDescriptionEn,
    seoDescriptionAr: row.seoDescriptionAr,
    blocksEn: row.blocksEn,
    blocksAr: row.blocksAr,
  };
}

interface VersionRow {
  id: number;
  reason: string;
  createdByEmail: string | null;
  createdAt: string;
}

export function ShowcaseEditor({
  initial,
  products,
  industries,
  tags,
  capabilities,
}: {
  initial: Showcase;
  products: ProductOption[];
  industries: Industry[];
  tags: Tag[];
  capabilities: Capabilities;
}) {
  const { dict, locale } = useLocale();
  const t = dict.admin.content;
  const router = useRouter();

  const [row, setRow] = useState<Showcase>(initial);
  const [form, setForm] = useState<FormState>(() => toForm(initial));
  const [tab, setTab] = useState<Tab>("basics");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [versions, setVersions] = useState<VersionRow[] | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<VersionRow | null>(null);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(toForm(row)), [form, row]);

  // Unsaved-change warning on tab close / hard navigation.
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const missing = useMemo(() => {
    const list: string[] = [];
    if (!form.titleEn.trim()) list.push(`${t.fieldTitle} (EN)`);
    if (!form.titleAr.trim()) list.push(`${t.fieldTitle} (AR)`);
    if (!form.summaryEn.trim()) list.push(`${t.fieldSummary} (EN)`);
    if (!form.summaryAr.trim()) list.push(`${t.fieldSummary} (AR)`);
    return list;
  }, [form, t]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setNotice(null);
  }

  async function save(): Promise<boolean> {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/showcases/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(
          data?.error === "invalid_blocks"
            ? `${t.blocksError}: ${data?.detail ?? ""}`
            : data?.error === "slug_taken"
              ? t.slugLabel + " — " + dict.admin.ui.genericError
              : dict.admin.ui.genericError,
        );
        return false;
      }
      setRow(data.showcase);
      setForm(toForm(data.showcase));
      setNotice(t.saved);
      return true;
    } finally {
      setSaving(false);
    }
  }

  async function transition(to: ContentStatus) {
    // Never lose edits on a workflow step.
    if (dirty && !(await save())) return;
    setError(null);
    const response = await fetch(`/api/admin/showcases/${row.id}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (data?.error === "missing_translations") {
        setError(`${t.missingTranslationsWarning}: ${data?.detail ?? ""}`);
      } else if (data?.error === "forbidden_transition") {
        setError(t.transitionForbidden);
      } else {
        setError(dict.admin.ui.genericError);
      }
      return;
    }
    setRow(data.showcase);
    setForm(toForm(data.showcase));
    setNotice(t.saved);
    router.refresh();
  }

  async function loadVersions() {
    const response = await fetch(`/api/admin/showcases/${row.id}/versions`);
    if (response.ok) setVersions((await response.json()).versions);
  }

  async function restore(version: VersionRow) {
    const response = await fetch(`/api/admin/showcases/${row.id}/restore`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionId: version.id }),
    });
    if (!response.ok) {
      setError(dict.admin.ui.genericError);
      return;
    }
    const data = await response.json();
    setRow(data.showcase);
    setForm(toForm(data.showcase));
    setNotice(t.historyRestoredOk);
    await loadVersions();
  }

  const status = row.status as ContentStatus;
  const workflowButtons: { label: string; to: ContentStatus; gated?: boolean; danger?: boolean }[] = {
    draft: [{ label: t.submitForReview, to: "in_review" as ContentStatus }, { label: t.archiveAction, to: "archived" as ContentStatus, danger: true }],
    in_review: [
      { label: t.approve, to: "approved" as ContentStatus, gated: true },
      { label: t.backToDraft, to: "draft" as ContentStatus },
      { label: t.archiveAction, to: "archived" as ContentStatus, danger: true },
    ],
    approved: [
      { label: t.publish, to: "published" as ContentStatus, gated: true },
      { label: t.backToDraft, to: "draft" as ContentStatus },
      { label: t.archiveAction, to: "archived" as ContentStatus, danger: true },
    ],
    published: [
      { label: t.unpublish, to: "approved" as ContentStatus, gated: true },
      { label: t.archiveAction, to: "archived" as ContentStatus, gated: true, danger: true },
    ],
    archived: [{ label: t.redraft, to: "draft" as ContentStatus }],
  }[status];

  const tabs: { id: Tab; label: string }[] = [
    { id: "basics", label: t.tabBasics },
    { id: "content", label: t.tabContent },
    { id: "seo", label: t.tabSeo },
    { id: "blocks", label: t.tabBlocks },
    { id: "history", label: t.tabHistory },
  ];

  const bilingual = (
    labelText: string,
    keys: { en: keyof FormState; ar: keyof FormState },
    rowsCount?: number,
  ) => (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {(["en", "ar"] as const).map((lang) => {
        const key = keys[lang];
        const id = `f-${String(key)}`;
        const value = form[key] as string;
        return (
          <Field key={lang} label={`${labelText} — ${lang === "en" ? t.englishColumn : t.arabicColumn}`} htmlFor={id}>
            {rowsCount ? (
              <textarea
                id={id}
                dir={lang === "ar" ? "rtl" : "ltr"}
                rows={rowsCount}
                value={value}
                onChange={(e) => set(key, e.target.value as FormState[typeof key])}
                className={`${inputClasses} h-auto resize-y py-2.5 leading-relaxed`}
              />
            ) : (
              <TextInput
                id={id}
                dir={lang === "ar" ? "rtl" : "ltr"}
                value={value}
                onChange={(e) => set(key, e.target.value as FormState[typeof key])}
              />
            )}
          </Field>
        );
      })}
    </div>
  );

  const selectedTagIds = new Set(form.tagIds.split(",").filter(Boolean));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/showcases" className="inline-flex items-center gap-1.5 text-xs font-medium text-mist-400 hover:text-mist-100">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> {t.backToList}
        </Link>
        <div className="flex items-center gap-2">
          {dirty && <span className="text-[11px] text-amber-300">{t.unsavedWarning}</span>}
          <AdminButton variant="primary" disabled={saving || !dirty} onClick={() => void save()}>
            <Save className="h-3.5 w-3.5" aria-hidden /> {saving ? dict.admin.ui.loading : t.save}
          </AdminButton>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-xl font-semibold text-mist-100">
          {(locale === "ar" ? row.titleAr : row.titleEn) || row.titleEn || t.untitled}
        </h1>
        <Badge tone={statusTone(status)}>{statusLabel(dict, status)}</Badge>
        <span dir="ltr" className="font-mono text-xs text-mist-500">
          /{row.slug}
        </span>
      </div>

      {error && <InlineError>{error}</InlineError>}
      {notice && !error && <InlineSuccess>{notice}</InlineSuccess>}
      {missing.length > 0 && (
        <p className="rounded-xl bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-300">
          {t.missingTranslationsWarning} ({t.requiredForPublish}): {missing.join(" · ")}
        </p>
      )}

      {/* Workflow bar */}
      <AdminCard className="flex flex-wrap items-center justify-between gap-3 py-4">
        <div className="flex items-center gap-2 text-xs text-mist-400">
          <CheckCircle2 className="h-4 w-4 text-mist-500" aria-hidden />
          <span className="font-medium text-mist-200">{t.workflowTitle}:</span>
          {row.publishedAt ? (
            <span suppressHydrationWarning>
              {t.publishedAt} · {new Date(row.publishedAt).toLocaleString(locale === "ar" ? "ar" : "en-GB", { dateStyle: "medium", timeStyle: "short" })}
            </span>
          ) : (
            <span>{t.notPublished}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {workflowButtons.map((button) => {
            const blocked = button.gated && !capabilities.canPublish;
            if (blocked) return null;
            return (
              <AdminButton
                key={button.to + button.label}
                variant={button.danger ? "danger" : button.to === "published" ? "primary" : "secondary"}
                disabled={button.to === "published" && missing.length > 0}
                onClick={() => void transition(button.to)}
              >
                {button.label}
              </AdminButton>
            );
          })}
        </div>
      </AdminCard>

      {/* Tabs */}
      <div role="tablist" aria-label={t.showcasesTitle} className="flex flex-wrap gap-1.5">
        {tabs.map((entry) => (
          <button
            key={entry.id}
            role="tab"
            type="button"
            aria-selected={tab === entry.id}
            onClick={() => {
              setTab(entry.id);
              if (entry.id === "history" && versions === null) void loadVersions();
            }}
            className={`min-h-[38px] rounded-full px-4 text-xs font-semibold transition ${
              tab === entry.id ? "bg-nebula-500/20 text-mist-100" : "glass text-mist-400 hover:text-mist-200"
            }`}
          >
            {entry.id === "history" && <History className="me-1 inline h-3 w-3" aria-hidden />}
            {entry.label}
          </button>
        ))}
      </div>

      {tab === "basics" && (
        <AdminCard className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Field label={t.slugLabel} htmlFor="f-slug" hint={t.slugHint}>
              <TextInput id="f-slug" dir="ltr" value={form.slug} onChange={(e) => set("slug", e.target.value)} />
            </Field>
            <Field label={t.productLabel} htmlFor="f-product">
              <Select id="f-product" value={form.productId} onChange={(e) => set("productId", e.target.value)}>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t.typeLabel} htmlFor="f-type">
              <Select id="f-type" value={form.type} onChange={(e) => set("type", e.target.value as ShowcaseType)}>
                {SHOWCASE_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {typeLabel(dict, value)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Field label={t.fieldIndustry} htmlFor="f-industry">
              <Select
                id="f-industry"
                value={form.industryId ?? ""}
                onChange={(e) => set("industryId", e.target.value || null)}
              >
                <option value="">{t.noIndustry}</option>
                {industries.map((industry) => (
                  <option key={industry.id} value={industry.id}>
                    {locale === "ar" ? industry.nameAr : industry.nameEn}
                  </option>
                ))}
              </Select>
            </Field>
            <div>
              <p className="text-xs font-medium text-mist-300">{t.fieldTags}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const selected = selectedTagIds.has(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        const next = new Set(selectedTagIds);
                        if (selected) next.delete(tag.id);
                        else next.add(tag.id);
                        set("tagIds", [...next].join(","));
                      }}
                      className={`min-h-[34px] rounded-full px-3 text-xs font-medium transition ${
                        selected ? "bg-nebula-500/20 text-mist-100" : "glass text-mist-400 hover:text-mist-200"
                      }`}
                    >
                      {locale === "ar" ? tag.nameAr : tag.nameEn}
                    </button>
                  );
                })}
                {tags.length === 0 && <span className="text-xs text-mist-500">—</span>}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <label className="flex items-center gap-2.5 text-sm text-mist-200">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="h-4 w-4 accent-[#6d3cdb]"
              />
              {t.fieldFeatured}
            </label>
            <label className="flex items-center gap-2.5 text-sm text-mist-200">
              <input
                type="checkbox"
                checked={form.verified}
                onChange={(e) => set("verified", e.target.checked)}
                className="h-4 w-4 accent-[#6d3cdb]"
              />
              {t.fieldVerified}
            </label>
            <p className="max-w-xl text-[11px] text-mist-500">{t.verifiedHint}</p>
          </div>
        </AdminCard>
      )}

      {tab === "content" && (
        <AdminCard className="flex flex-col gap-6">
          {bilingual(t.fieldTitle, { en: "titleEn", ar: "titleAr" })}
          {bilingual(t.fieldSummary, { en: "summaryEn", ar: "summaryAr" }, 3)}
          {bilingual(t.fieldStory, { en: "storyEn", ar: "storyAr" }, 8)}
        </AdminCard>
      )}

      {tab === "seo" && (
        <AdminCard className="flex flex-col gap-6">
          {bilingual(t.fieldSeoTitle, { en: "seoTitleEn", ar: "seoTitleAr" })}
          {bilingual(t.fieldSeoDescription, { en: "seoDescriptionEn", ar: "seoDescriptionAr" }, 3)}
        </AdminCard>
      )}

      {tab === "blocks" && (
        <AdminCard className="flex flex-col gap-6">
          <Field label={t.blocksLabel} htmlFor="f-blocks-en" hint={t.blocksHint}>
            <textarea
              id="f-blocks-en"
              dir="ltr"
              rows={16}
              spellCheck={false}
              value={form.blocksEn}
              onChange={(e) => set("blocksEn", e.target.value)}
              className={`${inputClasses} h-auto resize-y py-2.5 font-mono text-xs leading-relaxed`}
            />
          </Field>
          <Field label={t.blocksArLabel} htmlFor="f-blocks-ar">
            <textarea
              id="f-blocks-ar"
              dir="ltr"
              rows={10}
              spellCheck={false}
              value={form.blocksAr}
              onChange={(e) => set("blocksAr", e.target.value)}
              className={`${inputClasses} h-auto resize-y py-2.5 font-mono text-xs leading-relaxed`}
            />
          </Field>
        </AdminCard>
      )}

      {tab === "history" && (
        <AdminCard className="p-0">
          <ul>
            {(versions ?? []).map((version) => (
              <li key={version.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-5 py-3 last:border-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-xs">
                  <span className="font-mono text-mist-500" suppressHydrationWarning>
                    {new Date(version.createdAt).toLocaleString(locale === "ar" ? "ar" : "en-GB", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                  <span className="font-medium text-mist-200">{version.reason}</span>
                  <span className="text-mist-500">
                    {t.historyBy} {version.createdByEmail ?? "—"}
                  </span>
                </div>
                <AdminButton className="min-h-[34px] px-3 text-[11px]" onClick={() => setConfirmRestore(version)}>
                  {t.historyRestore}
                </AdminButton>
              </li>
            ))}
            {versions !== null && versions.length === 0 && (
              <li className="px-5 py-10 text-center text-xs text-mist-500">{t.historyEmpty}</li>
            )}
            {versions === null && <li className="px-5 py-10 text-center text-xs text-mist-500">{dict.admin.ui.loading}</li>}
          </ul>
        </AdminCard>
      )}

      <AdminDialog open={confirmRestore !== null} onClose={() => setConfirmRestore(null)} title={t.historyRestore}>
        <p className="text-sm text-mist-400">
          {confirmRestore?.reason} ·{" "}
          {confirmRestore &&
            new Date(confirmRestore.createdAt).toLocaleString(locale === "ar" ? "ar" : "en-GB", { dateStyle: "medium", timeStyle: "short" })}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <AdminButton onClick={() => setConfirmRestore(null)}>{dict.admin.ui.cancel}</AdminButton>
          <AdminButton
            variant="primary"
            onClick={async () => {
              const version = confirmRestore;
              setConfirmRestore(null);
              if (version) await restore(version);
            }}
          >
            {dict.admin.ui.confirm}
          </AdminButton>
        </div>
      </AdminDialog>
    </div>
  );
}
