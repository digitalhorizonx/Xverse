"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { CmsProduct } from "@/db/schema";
import {
  AdminButton,
  AdminCard,
  AdminDialog,
  Badge,
  Field,
  InlineError,
  InlineSuccess,
  TextInput,
  inputClasses,
} from "../ui";

export function ProductsManager() {
  const { dict, locale } = useLocale();
  const t = dict.admin.content;
  const [rows, setRows] = useState<CmsProduct[] | null>(null);
  const [editing, setEditing] = useState<CmsProduct | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/products");
    if (response.ok) setRows((await response.json()).products);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="flex flex-col gap-4">
      {error && <InlineError>{error}</InlineError>}
      {notice && !error && <InlineSuccess>{notice}</InlineSuccess>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {(rows ?? []).map((product) => (
          <AdminCard key={product.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className="inline-flex h-3 w-3 rounded-full"
                  style={{ backgroundColor: product.color, boxShadow: `0 0 10px ${product.color}` }}
                  aria-hidden
                />
                <span className="font-display text-lg font-semibold text-mist-100">{product.name}</span>
                <Badge tone={product.live ? "positive" : "neutral"}>
                  {product.live ? t.productLive : t.productComingSoon}
                </Badge>
                <Badge tone={product.active ? "accent" : "warning"}>
                  {product.active ? t.productActive : t.productHidden}
                </Badge>
              </div>
              <AdminButton className="min-h-[34px] px-3 text-[11px]" onClick={() => setEditing(product)}>
                <Pencil className="h-3 w-3" aria-hidden /> {t.edit}
              </AdminButton>
            </div>
            <p className="text-sm font-medium text-mist-300">
              {locale === "ar" ? product.taglineAr : product.taglineEn}
            </p>
            <p className="text-sm text-mist-500">
              {locale === "ar" ? product.descriptionAr : product.descriptionEn}
            </p>
          </AdminCard>
        ))}
      </div>

      {editing && (
        <ProductEditDialog
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setNotice(t.saved);
            void load();
          }}
          onError={() => setError(dict.admin.ui.genericError)}
        />
      )}
    </div>
  );
}

function ProductEditDialog({
  product,
  onClose,
  onSaved,
  onError,
}: {
  product: CmsProduct;
  onClose: () => void;
  onSaved: () => void;
  onError: () => void;
}) {
  const { dict } = useLocale();
  const t = dict.admin.content;
  const [form, setForm] = useState({
    taglineEn: product.taglineEn,
    taglineAr: product.taglineAr,
    descriptionEn: product.descriptionEn,
    descriptionAr: product.descriptionAr,
    ctaLabelEn: product.ctaLabelEn,
    ctaLabelAr: product.ctaLabelAr,
    ctaUrl: product.ctaUrl,
    live: product.live,
    active: product.active,
  });
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        onError();
        return;
      }
      onSaved();
    } finally {
      setPending(false);
    }
  }

  const textarea = (key: "descriptionEn" | "descriptionAr", label: string, rtl: boolean) => (
    <Field label={label} htmlFor={`p-${key}`}>
      <textarea
        id={`p-${key}`}
        dir={rtl ? "rtl" : "ltr"}
        rows={3}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className={`${inputClasses} h-auto resize-y py-2.5`}
      />
    </Field>
  );

  return (
    <AdminDialog open onClose={onClose} title={`${t.edit} — ${product.name}`}>
      <form onSubmit={submit} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pe-1">
        <Field label={`${t.fieldTagline} — EN`} htmlFor="p-taglineEn">
          <TextInput id="p-taglineEn" dir="ltr" value={form.taglineEn} onChange={(e) => setForm((f) => ({ ...f, taglineEn: e.target.value }))} />
        </Field>
        <Field label={`${t.fieldTagline} — AR`} htmlFor="p-taglineAr">
          <TextInput id="p-taglineAr" dir="rtl" value={form.taglineAr} onChange={(e) => setForm((f) => ({ ...f, taglineAr: e.target.value }))} />
        </Field>
        {textarea("descriptionEn", `${t.fieldDescription} — EN`, false)}
        {textarea("descriptionAr", `${t.fieldDescription} — AR`, true)}
        <Field label={`${t.fieldCtaLabel} — EN`} htmlFor="p-ctaEn">
          <TextInput id="p-ctaEn" dir="ltr" value={form.ctaLabelEn} onChange={(e) => setForm((f) => ({ ...f, ctaLabelEn: e.target.value }))} />
        </Field>
        <Field label={`${t.fieldCtaLabel} — AR`} htmlFor="p-ctaAr">
          <TextInput id="p-ctaAr" dir="rtl" value={form.ctaLabelAr} onChange={(e) => setForm((f) => ({ ...f, ctaLabelAr: e.target.value }))} />
        </Field>
        <Field label={t.fieldCtaUrl} htmlFor="p-ctaUrl">
          <TextInput id="p-ctaUrl" dir="ltr" type="url" value={form.ctaUrl} onChange={(e) => setForm((f) => ({ ...f, ctaUrl: e.target.value }))} />
        </Field>
        <label className="flex items-center gap-2.5 text-sm text-mist-200">
          <input type="checkbox" checked={form.live} onChange={(e) => setForm((f) => ({ ...f, live: e.target.checked }))} className="h-4 w-4 accent-[#6d3cdb]" />
          {t.productLive}
        </label>
        <label className="flex items-center gap-2.5 text-sm text-mist-200">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="h-4 w-4 accent-[#6d3cdb]" />
          {t.productActive}
        </label>
        <div className="flex justify-end gap-2 pt-1">
          <AdminButton onClick={onClose}>{dict.admin.ui.cancel}</AdminButton>
          <AdminButton variant="primary" type="submit" disabled={pending}>
            {pending ? dict.admin.ui.loading : dict.admin.ui.save}
          </AdminButton>
        </div>
      </form>
    </AdminDialog>
  );
}
