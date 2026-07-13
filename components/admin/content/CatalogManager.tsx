"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  AdminButton,
  AdminCard,
  AdminDialog,
  Badge,
  Field,
  InlineError,
  Select,
  TextInput,
} from "../ui";

interface Entry {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  kind?: "category" | "tag";
  active?: boolean;
}

/**
 * Shared CRUD list for the small catalog entities (industries, tags).
 * The `withKind` flag switches between the two shapes.
 */
export function CatalogManager({
  endpoint,
  withKind,
  canDelete,
  newLabel,
}: {
  endpoint: "industries" | "tags";
  withKind: boolean;
  canDelete: boolean;
  newLabel: string;
}) {
  const { dict, locale } = useLocale();
  const t = dict.admin.content;
  const [rows, setRows] = useState<Entry[] | null>(null);
  const [editing, setEditing] = useState<Entry | "new" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Entry | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const response = await fetch(`/api/admin/${endpoint}`);
    if (response.ok) {
      const data = await response.json();
      setRows(data[endpoint]);
    }
  }, [endpoint]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <AdminButton variant="primary" onClick={() => setEditing("new")}>
          <Plus className="h-3.5 w-3.5" aria-hidden /> {newLabel}
        </AdminButton>
      </div>
      {error && <InlineError>{error}</InlineError>}

      <AdminCard className="p-0">
        <ul>
          {(rows ?? []).map((entry) => (
            <li key={entry.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-5 py-3 last:border-0">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-medium text-mist-100">{locale === "ar" ? entry.nameAr : entry.nameEn}</span>
                <span className="text-xs text-mist-500">{locale === "ar" ? entry.nameEn : entry.nameAr}</span>
                <span dir="ltr" className="font-mono text-[11px] text-mist-500">
                  {entry.slug}
                </span>
                {withKind && entry.kind && (
                  <Badge tone={entry.kind === "category" ? "accent" : "neutral"}>
                    {entry.kind === "category" ? t.kindCategory : t.kindTag}
                  </Badge>
                )}
              </div>
              <div className="flex gap-1.5">
                <AdminButton className="min-h-[34px] px-3 text-[11px]" onClick={() => setEditing(entry)}>
                  <Pencil className="h-3 w-3" aria-hidden /> {t.edit}
                </AdminButton>
                {canDelete && (
                  <AdminButton variant="danger" className="min-h-[34px] px-3 text-[11px]" onClick={() => setConfirmDelete(entry)}>
                    <Trash2 className="h-3 w-3" aria-hidden /> {t.delete}
                  </AdminButton>
                )}
              </div>
            </li>
          ))}
          {rows !== null && rows.length === 0 && (
            <li className="px-5 py-10 text-center text-xs text-mist-500">—</li>
          )}
          {rows === null && <li className="px-5 py-10 text-center text-xs text-mist-500">{dict.admin.ui.loading}</li>}
        </ul>
      </AdminCard>

      {editing && (
        <EntryDialog
          endpoint={endpoint}
          withKind={withKind}
          entry={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void load();
          }}
          onError={() => setError(dict.admin.ui.genericError)}
        />
      )}

      <AdminDialog open={confirmDelete !== null} onClose={() => setConfirmDelete(null)} title={t.deleteEntryConfirmTitle}>
        <p className="text-sm text-mist-400">{t.deleteEntryConfirmBody}</p>
        <div className="mt-5 flex justify-end gap-2">
          <AdminButton onClick={() => setConfirmDelete(null)}>{dict.admin.ui.cancel}</AdminButton>
          <AdminButton
            variant="danger"
            onClick={async () => {
              const entry = confirmDelete;
              setConfirmDelete(null);
              if (!entry) return;
              const response = await fetch(`/api/admin/${endpoint}/${entry.id}`, { method: "DELETE" });
              if (!response.ok) setError(dict.admin.ui.genericError);
              await load();
            }}
          >
            {t.delete}
          </AdminButton>
        </div>
      </AdminDialog>
    </div>
  );
}

function EntryDialog({
  endpoint,
  withKind,
  entry,
  onClose,
  onSaved,
  onError,
}: {
  endpoint: string;
  withKind: boolean;
  entry: Entry | null;
  onClose: () => void;
  onSaved: () => void;
  onError: () => void;
}) {
  const { dict } = useLocale();
  const t = dict.admin.content;
  const [slug, setSlug] = useState(entry?.slug ?? "");
  const [nameEn, setNameEn] = useState(entry?.nameEn ?? "");
  const [nameAr, setNameAr] = useState(entry?.nameAr ?? "");
  const [kind, setKind] = useState<"category" | "tag">(entry?.kind ?? "tag");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      const response = await fetch(`/api/admin/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(entry ? { id: entry.id } : {}),
          slug,
          nameEn,
          nameAr,
          ...(withKind ? { kind } : {}),
        }),
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

  return (
    <AdminDialog open onClose={onClose} title={entry ? t.edit : t.create}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label={t.slugLabel} htmlFor="cat-slug">
          <TextInput id="cat-slug" required dir="ltr" pattern="[a-z0-9-]+" value={slug} onChange={(e) => setSlug(e.target.value)} />
        </Field>
        <Field label={t.nameEn} htmlFor="cat-en">
          <TextInput id="cat-en" required dir="ltr" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
        </Field>
        <Field label={t.nameAr} htmlFor="cat-ar">
          <TextInput id="cat-ar" required dir="rtl" value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
        </Field>
        {withKind && (
          <Field label={t.kindLabel} htmlFor="cat-kind">
            <Select id="cat-kind" value={kind} onChange={(e) => setKind(e.target.value as "category" | "tag")}>
              <option value="category">{t.kindCategory}</option>
              <option value="tag">{t.kindTag}</option>
            </Select>
          </Field>
        )}
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
