import { getAuth } from "@/lib/auth/session";
import { getDict } from "@/lib/i18n/server";

export default function AdminDashboardPage() {
  const { dict } = getDict();
  // Layout already guarantees a session; this is for display only.
  const auth = getAuth();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-mist-100">
        {dict.admin.dashboardTitle}
      </h1>

      <div className="glass-strong max-w-xl rounded-3xl p-6">
        <p className="text-sm text-mist-400">
          {dict.admin.signedInAs}{" "}
          <span className="font-semibold text-mist-100">{auth?.user.email}</span>
        </p>
        <p className="mt-4 text-sm leading-relaxed text-mist-400">{dict.admin.phase1Note}</p>
      </div>
    </div>
  );
}
