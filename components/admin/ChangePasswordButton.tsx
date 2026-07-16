"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { AdminButton, AdminDialog, Field, InlineError, InlineSuccess, TextInput } from "./ui";

function apiErrorMessage(dict: ReturnType<typeof useLocale>["dict"], code: string): string {
  const t = dict.admin.account;
  switch (code) {
    case "wrong_current_password":
      return t.wrongCurrentPassword;
    case "weak_password":
      return t.weakPassword;
    default:
      return dict.admin.ui.genericError;
  }
}

/**
 * Available to every signed-in role (admin/editor/viewer alike) from the
 * header — this is a personal-account action, not a permission-gated
 * one. Keeps the current session alive on success (only every *other*
 * session is revoked), so unlike an admin-initiated reset, using this on
 * yourself can never lock you out.
 */
export function ChangePasswordButton() {
  const { dict } = useLocale();
  const t = dict.admin.account;
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function reset() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccess(false);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setError(t.passwordsDontMatch);
      return;
    }
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(apiErrorMessage(dict, data.error ?? ""));
        return;
      }
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          reset();
          setOpen(true);
        }}
        className="glass flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-mist-300 transition hover:text-mist-100"
      >
        <KeyRound className="h-3.5 w-3.5" aria-hidden />
        <span className="hidden sm:inline">{t.changePassword}</span>
      </button>

      <AdminDialog open={open} onClose={() => setOpen(false)} title={t.changePassword}>
        <form onSubmit={submit} className="flex flex-col gap-4">
          {success ? (
            <InlineSuccess>{t.changeSuccess}</InlineSuccess>
          ) : (
            <>
              <Field label={t.currentPassword} htmlFor="cp-current">
                <TextInput
                  id="cp-current"
                  type="password"
                  dir="ltr"
                  autoComplete="current-password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </Field>
              <Field label={t.newPassword} htmlFor="cp-new" hint={t.newPasswordHint}>
                <TextInput
                  id="cp-new"
                  type="password"
                  dir="ltr"
                  autoComplete="new-password"
                  minLength={12}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Field>
              <Field label={t.confirmPassword} htmlFor="cp-confirm">
                <TextInput
                  id="cp-confirm"
                  type="password"
                  dir="ltr"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Field>
              {error && <InlineError>{error}</InlineError>}
            </>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <AdminButton onClick={() => setOpen(false)}>{dict.admin.ui.cancel}</AdminButton>
            {!success && (
              <AdminButton variant="primary" type="submit" disabled={pending}>
                {pending ? dict.admin.ui.loading : t.changePassword}
              </AdminButton>
            )}
          </div>
        </form>
      </AdminDialog>
    </>
  );
}
