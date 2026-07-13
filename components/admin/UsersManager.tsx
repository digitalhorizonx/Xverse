"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRound, Plus, UserCheck, UserX } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Role } from "@/db/schema";
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
} from "./ui";

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

const ERROR_KEYS: Record<string, "errorEmailTaken" | "errorSelf" | "errorLastAdmin" | "errorPasswordPolicy"> = {
  email_taken: "errorEmailTaken",
  self_change: "errorSelf",
  last_admin: "errorLastAdmin",
  password_policy: "errorPasswordPolicy",
};

export function UsersManager({ currentUserId }: { currentUserId: string }) {
  const { dict } = useLocale();
  const t = dict.admin.users;
  const [rows, setRows] = useState<UserRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<{ email: string; password: string } | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState<UserRow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const roleLabel: Record<Role, string> = {
    admin: dict.admin.roleAdmin,
    editor: dict.admin.roleEditor,
    viewer: dict.admin.roleViewer,
  };

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/users");
    if (response.ok) {
      const data = await response.json();
      setRows(data.users);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function fail(code: string | undefined) {
    const key = code ? ERROR_KEYS[code] : undefined;
    setError(key ? t[key] : dict.admin.ui.genericError);
    setNotice(null);
  }

  async function patchUser(id: string, patch: Record<string, unknown>) {
    setError(null);
    const response = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!response.ok) {
      fail((await response.json().catch(() => ({})))?.error);
      return false;
    }
    setNotice(t.updatedOk);
    await load();
    return true;
  }

  async function resetPassword(row: UserRow) {
    setError(null);
    const response = await fetch(`/api/admin/users/${row.id}/reset-password`, { method: "POST" });
    if (!response.ok) {
      fail((await response.json().catch(() => ({})))?.error);
      return;
    }
    const data = await response.json();
    setTempPassword({ email: row.email, password: data.temporaryPassword });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <AdminButton variant="primary" onClick={() => setCreateOpen(true)}>
          <Plus className="h-3.5 w-3.5" aria-hidden /> {t.newUser}
        </AdminButton>
      </div>

      {error && <InlineError>{error}</InlineError>}
      {notice && !error && <InlineSuccess>{notice}</InlineSuccess>}

      <AdminCard className="overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-start text-sm">
          <thead>
            <tr className="border-b border-white/5 text-[11px] uppercase tracking-wide text-mist-500">
              <th className="px-5 py-3 text-start font-medium">{t.name}</th>
              <th className="px-5 py-3 text-start font-medium">{t.email}</th>
              <th className="px-5 py-3 text-start font-medium">{t.role}</th>
              <th className="px-5 py-3 text-start font-medium">{t.status}</th>
              <th className="px-5 py-3 text-start font-medium">{dict.admin.ui.actions}</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((row) => {
              const isSelf = row.id === currentUserId;
              return (
                <tr key={row.id} className="border-b border-white/5 last:border-0">
                  <td className="px-5 py-3.5 font-medium text-mist-100">
                    {row.name}
                    {isSelf && <span className="ms-2 text-[10px] uppercase text-mist-500">({t.you})</span>}
                  </td>
                  <td className="px-5 py-3.5 text-mist-300">{row.email}</td>
                  <td className="px-5 py-3.5">
                    <Select
                      aria-label={t.role}
                      value={row.role}
                      disabled={isSelf}
                      onChange={(event) => void patchUser(row.id, { role: event.target.value })}
                      className="h-9 w-32 rounded-lg text-xs"
                    >
                      {(["admin", "editor", "viewer"] as const).map((role) => (
                        <option key={role} value={role}>
                          {roleLabel[role]}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge tone={row.active ? "positive" : "warning"}>{row.active ? t.active : t.inactive}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      <AdminButton className="min-h-[34px] px-3 text-[11px]" onClick={() => void resetPassword(row)}>
                        <KeyRound className="h-3 w-3" aria-hidden /> {t.resetPassword}
                      </AdminButton>
                      {row.active ? (
                        <AdminButton
                          variant="danger"
                          disabled={isSelf}
                          className="min-h-[34px] px-3 text-[11px]"
                          onClick={() => setConfirmDeactivate(row)}
                        >
                          <UserX className="h-3 w-3" aria-hidden /> {t.deactivate}
                        </AdminButton>
                      ) : (
                        <AdminButton
                          className="min-h-[34px] px-3 text-[11px]"
                          onClick={() => void patchUser(row.id, { active: true })}
                        >
                          <UserCheck className="h-3 w-3" aria-hidden /> {t.activate}
                        </AdminButton>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows === null && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-xs text-mist-500">
                  {dict.admin.ui.loading}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </AdminCard>

      <CreateUserDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          setNotice(t.createdOk);
          void load();
        }}
        onError={fail}
      />

      {/* Destructive action → explicit confirmation */}
      <AdminDialog
        open={confirmDeactivate !== null}
        onClose={() => setConfirmDeactivate(null)}
        title={t.deactivateConfirmTitle}
      >
        <p className="text-sm text-mist-400">{t.deactivateConfirmBody}</p>
        <div className="mt-5 flex justify-end gap-2">
          <AdminButton onClick={() => setConfirmDeactivate(null)}>{dict.admin.ui.cancel}</AdminButton>
          <AdminButton
            variant="danger"
            onClick={async () => {
              const row = confirmDeactivate;
              setConfirmDeactivate(null);
              if (row) await patchUser(row.id, { active: false });
            }}
          >
            {t.deactivate}
          </AdminButton>
        </div>
      </AdminDialog>

      {/* Temp password, shown exactly once */}
      <AdminDialog open={tempPassword !== null} onClose={() => setTempPassword(null)} title={t.tempPassword}>
        {tempPassword && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-mist-400">{tempPassword.email}</p>
            <code dir="ltr" className="glass block select-all rounded-xl px-4 py-3 text-center font-mono text-sm text-mist-100">
              {tempPassword.password}
            </code>
            <p className="text-xs text-mist-500">{t.tempPasswordNote}</p>
            <div className="flex justify-end">
              <AdminButton variant="primary" onClick={() => setTempPassword(null)}>
                {dict.admin.ui.close}
              </AdminButton>
            </div>
          </div>
        )}
      </AdminDialog>
    </div>
  );
}

function CreateUserDialog({
  open,
  onClose,
  onCreated,
  onError,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  onError: (code: string | undefined) => void;
}) {
  const { dict } = useLocale();
  const t = dict.admin.users;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("editor");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role, password }),
      });
      if (!response.ok) {
        onError((await response.json().catch(() => ({})))?.error);
        return;
      }
      setName("");
      setEmail("");
      setPassword("");
      setRole("editor");
      onCreated();
    } finally {
      setPending(false);
    }
  }

  const roleLabel: Record<Role, string> = {
    admin: dict.admin.roleAdmin,
    editor: dict.admin.roleEditor,
    viewer: dict.admin.roleViewer,
  };

  return (
    <AdminDialog open={open} onClose={onClose} title={t.createTitle}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label={t.name} htmlFor="nu-name">
          <TextInput id="nu-name" required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label={t.email} htmlFor="nu-email">
          <TextInput id="nu-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label={t.role} htmlFor="nu-role">
          <Select id="nu-role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
            {(["admin", "editor", "viewer"] as const).map((value) => (
              <option key={value} value={value}>
                {roleLabel[value]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t.initialPassword} htmlFor="nu-password" hint={t.passwordHint}>
          <TextInput
            id="nu-password"
            type="password"
            required
            minLength={12}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
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
