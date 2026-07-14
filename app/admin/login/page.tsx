"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { LanguageSwitcher } from "@/components/nav/LanguageSwitcher";
import { ThemeToggle } from "@/components/nav/ThemeToggle";

export default function AdminLoginPage() {
  const { dict } = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        router.push("/admin");
        router.refresh();
        return;
      }
      if (response.status === 429) setError(dict.admin.errorRateLimited);
      else if (response.status === 401 || response.status === 400) setError(dict.admin.errorInvalid);
      else setError(dict.admin.errorGeneric);
    } catch {
      setError(dict.admin.errorGeneric);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-ink-950">
      <div className="flex items-center justify-end gap-2 p-4">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center px-5 pb-24">
        <form onSubmit={submit} className="glass-strong w-full max-w-sm rounded-3xl p-8">
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-nebula-500/15">
              <Lock className="h-5 w-5 text-nebula-300" aria-hidden />
            </span>
            <h1 className="font-display text-xl font-semibold text-mist-100">
              {dict.admin.loginTitle}
            </h1>
            <p className="text-xs text-mist-500">{dict.admin.loginSubtitle}</p>
          </div>

          <label className="block text-xs font-medium text-mist-300" htmlFor="admin-email">
            {dict.admin.email}
          </label>
          <input
            id="admin-email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="glass mt-1.5 h-11 w-full rounded-xl bg-transparent px-3.5 text-sm text-mist-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-nebula-400"
          />

          <label className="mt-4 block text-xs font-medium text-mist-300" htmlFor="admin-password">
            {dict.admin.password}
          </label>
          <input
            id="admin-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="glass mt-1.5 h-11 w-full rounded-xl bg-transparent px-3.5 text-sm text-mist-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-nebula-400"
          />

          {error && (
            <p role="alert" className="mt-4 rounded-xl bg-coral-500/10 px-3.5 py-2.5 text-xs text-coral-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-6 h-11 w-full rounded-full bg-nebula-600 text-sm font-semibold text-[#fff] transition hover:bg-nebula-500 disabled:opacity-60"
          >
            {pending ? dict.admin.signingIn : dict.admin.signIn}
          </button>
        </form>
      </div>
    </main>
  );
}
