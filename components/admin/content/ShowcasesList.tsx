"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Copy, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { ContentStatus, Showcase, ShowcaseType } from "@/db/schema";
import { CONTENT_STATUSES, SHOWCASE_TYPES } from "@/db/schema";
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
} from "../ui";
import { statusLabel, statusTone, typeLabel } from "./meta";

interface ProductOption {
  id: string;
  name: string;
}

interface Capabilities {
  canDelete: boolean;
}

export function ShowcasesList({ products, capabilities }: { products: ProductOption[]; capabilities: Capabilities }) {
  const { dict, locale } = useLocale();
  const t = dict.admin.content;
  const [rows, setRows] = useState<Showcase[] | null>(null);
  const [productFilter, setProductFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ kind: "archive" | "delete"; row: Showcase } | null>(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (productFilter) params.set("product", productFilter);
    if (statusFilter) params.set("status", statusFilter);
    const response = await fetch(`/api/admin/showcases?${params}`);
    if (response.ok) setRows((await response.json()).showcases);
  }, [productFilter, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const productName = useMemo(() => new Map(products.map((p) => [p.id, p.name])), [products]);

  async function act(url: string, init?: RequestInit): Promise<boolean> {
    setError(null);
    const response = await fetch(url, init);
    if (!response.ok) {
      setError(dict.admin.ui.genericError);
      return false;
    }
    await load();
    return true;
  }

  async function move(row: Showcase, direction: -1 | 1) {
    if (!rows) return;
    const index = rows.findIndex((r) => r.id === row.id);
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const ids = rows.map((r) => r.id);
    [ids[index], ids[target]] = [ids[target]!, ids[index]!];
    await act("/api/admin/showcases/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Select aria-label={t.colProduct} value={productFilter} onChange={(e) => setProductFilter(e.target.value)} className="h-10 w-44 text-xs">
            <option value="">{t.allProducts}</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          <Select aria-label={t.colStatus} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 w-40 text-xs">
            <option value="">{t.allStatuses}</option>
            {CONTENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabel(dict, status)}
              </option>
            ))}
          </Select>
        </div>
        <AdminButton variant="primary" onClick={() => setCreateOpen(true)}>
          <Plus className="h-3.5 w-3.5" aria-hidden /> {t.newShowcase}
        </AdminButton>
      </div>

      {error && <InlineError>{error}</InlineError>}
      {notice && !error && <InlineSuccess>{notice}</InlineSuccess>}

      <AdminCard className="overflow-x-auto p-0">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-white/5 text-[11px] uppercase tracking-wide text-mist-500">
              <th className="w-20 px-4 py-3 text-start font-medium" aria-label="reorder" />
              <th className="px-4 py-3 text-start font-medium">{t.colTitle}</th>
              <th className="px-4 py-3 text-start font-medium">{t.colProduct}</th>
              <th className="px-4 py-3 text-start font-medium">{t.colType}</th>
              <th className="px-4 py-3 text-start font-medium">{t.colStatus}</th>
              <th className="px-4 py-3 text-start font-medium">{dict.admin.ui.actions}</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((row, index) => (
              <tr key={row.id} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      aria-label={t.moveUp}
                      disabled={index === 0}
                      onClick={() => void move(row, -1)}
                      className="glass flex h-7 w-7 items-center justify-center rounded-lg text-mist-400 hover:text-mist-100 disabled:opacity-30"
                    >
                      <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label={t.moveDown}
                      disabled={index === (rows?.length ?? 0) - 1}
                      onClick={() => void move(row, 1)}
                      className="glass flex h-7 w-7 items-center justify-center rounded-lg text-mist-400 hover:text-mist-100 disabled:opacity-30"
                    >
                      <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={t.featured}
                      aria-pressed={row.featured}
                      onClick={() => void act(`/api/admin/showcases/${row.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ featured: !row.featured }),
                      })}
                      className={row.featured ? "text-amber-300" : "text-mist-500 hover:text-mist-300"}
                    >
                      <Star className="h-4 w-4" fill={row.featured ? "currentColor" : "none"} aria-hidden />
                    </button>
                    <div className="min-w-0">
                      <Link href={`/admin/showcases/${row.id}`} className="block truncate font-medium text-mist-100 hover:text-nebula-300">
                        {(locale === "ar" ? row.titleAr : row.titleEn) || row.titleEn || t.untitled}
                      </Link>
                      <span dir="ltr" className="block font-mono text-[11px] text-mist-500">
                        /{row.slug}
                      </span>
                    </div>
                    {row.verified && <Badge tone="positive">{t.verified}</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-mist-300">{productName.get(row.productId) ?? row.productId}</td>
                <td className="px-4 py-3 text-xs text-mist-400">{typeLabel(dict, row.type as ShowcaseType)}</td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone(row.status as ContentStatus)}>{statusLabel(dict, row.status as ContentStatus)}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    <Link
                      href={`/admin/showcases/${row.id}`}
                      className="glass inline-flex min-h-[34px] items-center gap-1 rounded-full px-3 text-[11px] font-medium text-mist-300 hover:text-mist-100"
                    >
                      <Pencil className="h-3 w-3" aria-hidden /> {t.edit}
                    </Link>
                    <AdminButton className="min-h-[34px] px-3 text-[11px]" onClick={() => void act(`/api/admin/showcases/${row.id}/duplicate`, { method: "POST" })}>
                      <Copy className="h-3 w-3" aria-hidden /> {t.duplicate}
                    </AdminButton>
                    {row.status !== "archived" ? (
                      <AdminButton variant="danger" className="min-h-[34px] px-3 text-[11px]" onClick={() => setConfirmAction({ kind: "archive", row })}>
                        {t.archive}
                      </AdminButton>
                    ) : (
                      <>
                        <AdminButton
                          className="min-h-[34px] px-3 text-[11px]"
                          onClick={() => void act(`/api/admin/showcases/${row.id}/transition`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ to: "draft" }),
                          })}
                        >
                          {t.restore}
                        </AdminButton>
                        {capabilities.canDelete && (
                          <AdminButton variant="danger" className="min-h-[34px] px-3 text-[11px]" onClick={() => setConfirmAction({ kind: "delete", row })}>
                            <Trash2 className="h-3 w-3" aria-hidden /> {t.delete}
                          </AdminButton>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {rows !== null && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-xs text-mist-500">
                  {t.emptyList}
                </td>
              </tr>
            )}
            {rows === null && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-xs text-mist-500">
                  {dict.admin.ui.loading}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </AdminCard>

      <CreateShowcaseDialog
        open={createOpen}
        products={products}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          setNotice(t.saved);
          void load();
        }}
        onError={() => setError(dict.admin.ui.genericError)}
      />

      <AdminDialog
        open={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        title={confirmAction?.kind === "delete" ? t.deleteConfirmTitle : t.archiveConfirmTitle}
      >
        <p className="text-sm text-mist-400">
          {confirmAction?.kind === "delete" ? t.deleteConfirmBody : t.archiveConfirmBody}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <AdminButton onClick={() => setConfirmAction(null)}>{dict.admin.ui.cancel}</AdminButton>
          <AdminButton
            variant="danger"
            onClick={async () => {
              const action = confirmAction;
              setConfirmAction(null);
              if (!action) return;
              if (action.kind === "archive") {
                await act(`/api/admin/showcases/${action.row.id}/transition`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ to: "archived" }),
                });
              } else {
                await act(`/api/admin/showcases/${action.row.id}`, { method: "DELETE" });
              }
            }}
          >
            {confirmAction?.kind === "delete" ? t.delete : t.archive}
          </AdminButton>
        </div>
      </AdminDialog>
    </div>
  );
}

function CreateShowcaseDialog({
  open,
  products,
  onClose,
  onCreated,
  onError,
}: {
  open: boolean;
  products: ProductOption[];
  onClose: () => void;
  onCreated: () => void;
  onError: () => void;
}) {
  const { dict } = useLocale();
  const t = dict.admin.content;
  const [slug, setSlug] = useState("");
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [type, setType] = useState<ShowcaseType>("demo-brand");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      const response = await fetch("/api/admin/showcases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, productId, type }),
      });
      if (!response.ok) {
        onError();
        return;
      }
      setSlug("");
      onCreated();
    } finally {
      setPending(false);
    }
  }

  return (
    <AdminDialog open={open} onClose={onClose} title={t.newShowcase}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label={t.slugLabel} htmlFor="ns-slug" hint={t.slugHint}>
          <TextInput id="ns-slug" required dir="ltr" pattern="[a-z0-9]+(-[a-z0-9]+)*" value={slug} onChange={(e) => setSlug(e.target.value)} />
        </Field>
        <Field label={t.productLabel} htmlFor="ns-product">
          <Select id="ns-product" value={productId} onChange={(e) => setProductId(e.target.value)}>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t.typeLabel} htmlFor="ns-type">
          <Select id="ns-type" value={type} onChange={(e) => setType(e.target.value as ShowcaseType)}>
            {SHOWCASE_TYPES.map((value) => (
              <option key={value} value={value}>
                {typeLabel(dict, value)}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <AdminButton onClick={onClose}>{dict.admin.ui.cancel}</AdminButton>
          <AdminButton variant="primary" type="submit" disabled={pending || !productId}>
            {pending ? dict.admin.ui.loading : t.create}
          </AdminButton>
        </div>
      </form>
    </AdminDialog>
  );
}
