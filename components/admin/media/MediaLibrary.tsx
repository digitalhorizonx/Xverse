"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileText, Film, Link2, Plus, RefreshCw, Trash2 } from "lucide-react";
import type { MediaKind } from "@/db/schema";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Dictionary } from "@/lib/i18n/types";
import {
  AdminButton,
  AdminCard,
  AdminDialog,
  Badge,
  EmptyState,
  Field,
  InlineError,
  InlineSuccess,
  Select,
  TextInput,
} from "../ui";

// Value copy of db/schema MEDIA_KINDS: the schema module must stay
// server-only (drizzle + better-sqlite3), so only its types cross over.
const KINDS: readonly MediaKind[] = ["image", "logo", "screenshot", "mockup", "video", "document"];

interface MediaItem {
  id: string;
  fileName: string;
  thumbFileName: string | null;
  originalName: string;
  mime: string;
  kind: MediaKind;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  altEn: string;
  altAr: string;
  createdAt: string;
}

interface UsageRef {
  entityType: string;
  entityId: string;
  label: string;
}

function kindLabel(dict: Dictionary, kind: MediaKind): string {
  const t = dict.admin.media;
  return {
    image: t.kindImage,
    logo: t.kindLogo,
    screenshot: t.kindScreenshot,
    mockup: t.kindMockup,
    video: t.kindVideo,
    document: t.kindDocument,
  }[kind];
}

function apiErrorMessage(dict: Dictionary, code: string): string {
  const t = dict.admin.media;
  switch (code) {
    case "too_large":
      return t.errorTooLarge;
    case "unsupported_type":
      return t.errorUnsupported;
    case "decode_failed":
      return t.errorDecode;
    case "in_use":
      return t.errorInUse;
    case "duplicate":
      return t.errorDuplicate;
    default:
      return dict.admin.ui.genericError;
  }
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Best default for an uploaded file — refined afterwards in the dialog. */
function inferKind(file: File): MediaKind {
  if (file.type.startsWith("video/")) return "video";
  if (file.type === "application/pdf") return "document";
  return "image";
}

function Preview({ item, large }: { item: MediaItem; large?: boolean }) {
  const { dict } = useLocale();
  const t = dict.admin.media;
  if (item.mime.startsWith("image/")) {
    const src = !large && item.thumbFileName ? `/media/${item.thumbFileName}` : `/media/${item.fileName}`;
    // eslint-disable-next-line @next/next/no-img-element -- served by our own immutable route; next/image would re-proxy it
    return <img src={src} alt={item.altEn || item.originalName} className="h-full w-full object-cover" loading="lazy" />;
  }
  const Icon = item.kind === "video" ? Film : FileText;
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-mist-500">
      <Icon className="h-8 w-8" aria-hidden />
      <span className="text-[10px] uppercase tracking-wide">{item.kind === "video" ? t.kindVideo : t.kindDocument}</span>
    </div>
  );
}

export function MediaLibrary({ capabilities }: { capabilities: { canUpload: boolean; canDelete: boolean } }) {
  const { dict } = useLocale();
  const t = dict.admin.media;
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [kindFilter, setKindFilter] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (kindFilter) params.set("kind", kindFilter);
    if (query.trim()) params.set("q", query.trim());
    const response = await fetch(`/api/admin/media?${params}`);
    if (response.ok) {
      const data = await response.json();
      setItems(data.media);
    }
  }, [kindFilter, query]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("kind", inferKind(file));
      const response = await fetch("/api/admin/media", { method: "POST", body: form });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(apiErrorMessage(dict, data.error ?? ""));
        return;
      }
      await load();
      setSelected(data.media);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <TextInput
          aria-label={t.searchPlaceholder}
          placeholder={t.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
        <Select aria-label={t.kindLabel} value={kindFilter} onChange={(e) => setKindFilter(e.target.value)} className="w-auto min-w-[150px]">
          <option value="">{t.allKinds}</option>
          {KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {kindLabel(dict, kind)}
            </option>
          ))}
        </Select>
        {capabilities.canUpload && (
          <div className="ms-auto">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/mp4,video/webm,application/pdf"
              className="sr-only"
              id="media-upload-input"
              onChange={(e) => void handleUpload(e.target.files)}
            />
            <AdminButton variant="primary" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
              <Plus className="h-3.5 w-3.5" aria-hidden /> {uploading ? t.uploading : t.upload}
            </AdminButton>
          </div>
        )}
      </div>

      {error && <InlineError>{error}</InlineError>}

      {items !== null && items.length === 0 ? (
        <EmptyState title={kindFilter || query ? t.emptyFiltered : t.empty} body={t.subtitle} />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" data-testid="media-grid">
          {(items ?? []).map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setSelected(item)}
                className="glass group block w-full overflow-hidden rounded-2xl text-start transition hover:border-white/25 focus-visible:ring-2 focus-visible:ring-nebula-400"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-white/5">
                  <Preview item={item} />
                </div>
                <div className="flex flex-col gap-1 px-3 py-2.5">
                  <span dir="ltr" className="truncate text-xs font-medium text-mist-200">
                    {item.originalName}
                  </span>
                  <span className="flex items-center justify-between gap-2 text-[10px] text-mist-500">
                    <Badge tone={item.kind === "video" || item.kind === "document" ? "warning" : "neutral"}>
                      {kindLabel(dict, item.kind)}
                    </Badge>
                    <span dir="ltr">{formatSize(item.sizeBytes)}</span>
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <MediaDetailDialog
          item={selected}
          capabilities={capabilities}
          onClose={() => setSelected(null)}
          onChanged={async (next) => {
            await load();
            setSelected(next);
          }}
        />
      )}
    </div>
  );
}

function MediaDetailDialog({
  item,
  capabilities,
  onClose,
  onChanged,
}: {
  item: MediaItem;
  capabilities: { canUpload: boolean; canDelete: boolean };
  onClose: () => void;
  onChanged: (next: MediaItem | null) => Promise<void>;
}) {
  const { dict } = useLocale();
  const t = dict.admin.media;
  const [altEn, setAltEn] = useState(item.altEn);
  const [altAr, setAltAr] = useState(item.altAr);
  const [kind, setKind] = useState<MediaKind>(item.kind);
  const [usage, setUsage] = useState<UsageRef[] | null>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/admin/media/${item.id}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data) setUsage(data.usage);
      });
    return () => {
      cancelled = true;
    };
  }, [item.id]);

  async function saveMeta() {
    setPending(true);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/media/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ altEn, altAr, kind }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setNotice({ tone: "error", text: apiErrorMessage(dict, data.error ?? "") });
        return;
      }
      setNotice({ tone: "ok", text: t.saved });
      await onChanged(data.media);
    } finally {
      setPending(false);
    }
  }

  async function replaceFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setPending(true);
    setNotice(null);
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch(`/api/admin/media/${item.id}/replace`, { method: "POST", body: form });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setNotice({ tone: "error", text: apiErrorMessage(dict, data.error ?? "") });
        return;
      }
      setNotice({ tone: "ok", text: t.saved });
      await onChanged(data.media);
    } finally {
      setPending(false);
      if (replaceInputRef.current) replaceInputRef.current.value = "";
    }
  }

  async function remove() {
    setPending(true);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/media/${item.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setNotice({ tone: "error", text: apiErrorMessage(dict, data.error ?? "") });
        setConfirmDelete(false);
        return;
      }
      await onChanged(null);
      onClose();
    } finally {
      setPending(false);
    }
  }

  const url = `/media/${item.fileName}`;

  return (
    <AdminDialog open onClose={onClose} title={t.detailTitle}>
      <div className="flex flex-col gap-4" data-testid="media-detail">
        <div className="max-h-56 overflow-hidden rounded-2xl bg-white/5">
          <div className="aspect-[4/3] w-full">
            <Preview item={item} large />
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-mist-400">
          <dt className="text-mist-500">{t.size}</dt>
          <dd dir="ltr">{formatSize(item.sizeBytes)}</dd>
          {item.width && item.height && (
            <>
              <dt className="text-mist-500">{t.dimensions}</dt>
              <dd dir="ltr">
                {item.width} × {item.height}
              </dd>
            </>
          )}
        </dl>

        <div className="flex flex-wrap gap-2">
          <AdminButton
            className="min-h-[34px] px-3 text-[11px]"
            onClick={async () => {
              await navigator.clipboard.writeText(new URL(url, window.location.origin).toString());
              setNotice({ tone: "ok", text: t.copied });
            }}
          >
            <Link2 className="h-3 w-3" aria-hidden /> {t.copyUrl}
          </AdminButton>
          {capabilities.canUpload && (
            <>
              <input
                ref={replaceInputRef}
                type="file"
                accept="image/*,video/mp4,video/webm,application/pdf"
                className="sr-only"
                onChange={(e) => void replaceFile(e.target.files)}
              />
              <AdminButton className="min-h-[34px] px-3 text-[11px]" disabled={pending} onClick={() => replaceInputRef.current?.click()}>
                <RefreshCw className="h-3 w-3" aria-hidden /> {t.replace}
              </AdminButton>
            </>
          )}
          {capabilities.canDelete && (
            <AdminButton
              variant="danger"
              className="min-h-[34px] px-3 text-[11px]"
              disabled={pending}
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-3 w-3" aria-hidden /> {t.delete}
            </AdminButton>
          )}
        </div>
        <p className="text-[11px] text-mist-500">{t.replaceHint}</p>

        {notice &&
          (notice.tone === "ok" ? <InlineSuccess>{notice.text}</InlineSuccess> : <InlineError>{notice.text}</InlineError>)}

        <Field label={t.altEn} htmlFor="media-alt-en" hint={t.altHint}>
          <TextInput id="media-alt-en" dir="ltr" value={altEn} onChange={(e) => setAltEn(e.target.value)} />
        </Field>
        <Field label={t.altAr} htmlFor="media-alt-ar">
          <TextInput id="media-alt-ar" dir="rtl" value={altAr} onChange={(e) => setAltAr(e.target.value)} />
        </Field>
        <Field label={t.kindLabel} htmlFor="media-kind">
          <Select id="media-kind" value={kind} onChange={(e) => setKind(e.target.value as MediaKind)}>
            {KINDS.map((value) => (
              <option key={value} value={value}>
                {kindLabel(dict, value)}
              </option>
            ))}
          </Select>
        </Field>

        <div>
          <p className="text-xs font-medium text-mist-300">{t.usageTitle}</p>
          {usage === null ? (
            <p className="mt-1 text-[11px] text-mist-500">{dict.admin.ui.loading}</p>
          ) : usage.length === 0 ? (
            <p className="mt-1 text-[11px] text-mist-500">{t.usageNone}</p>
          ) : (
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {usage.map((ref) => (
                <li key={`${ref.entityType}-${ref.entityId}`}>
                  <Badge tone="accent">{ref.label}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-white/5 pt-4">
          <AdminButton onClick={onClose}>{dict.admin.ui.cancel}</AdminButton>
          {capabilities.canUpload && (
            <AdminButton variant="primary" disabled={pending} onClick={() => void saveMeta()}>
              {pending ? dict.admin.ui.loading : dict.admin.ui.save}
            </AdminButton>
          )}
        </div>
      </div>

      <AdminDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} title={t.deleteConfirmTitle}>
        <p className="text-sm text-mist-400">{t.deleteConfirmBody}</p>
        {usage && usage.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium text-mist-300">{t.usageTitle}</p>
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {usage.map((ref) => (
                <li key={`${ref.entityType}-${ref.entityId}`}>
                  <Badge tone="warning">{ref.label}</Badge>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <AdminButton onClick={() => setConfirmDelete(false)}>{dict.admin.ui.cancel}</AdminButton>
          <AdminButton variant="danger" disabled={pending} onClick={() => void remove()}>
            {t.delete}
          </AdminButton>
        </div>
      </AdminDialog>
    </AdminDialog>
  );
}
