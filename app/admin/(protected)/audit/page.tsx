import { desc, like } from "drizzle-orm";
import Link from "next/link";
import { getDb } from "@/db";
import { auditLog } from "@/db/schema";
import { getDict } from "@/lib/i18n/server";
import { AdminCard, PageHeader } from "@/components/admin/ui";

const PAGE_SIZE = 50;

// Distinct top-level action families for the filter — kept static so the
// select is stable regardless of what's currently in the log.
const ACTION_FAMILIES = ["auth", "user", "content", "media", "leads", "settings"] as const;

export default function AdminAuditPage({
  searchParams,
}: {
  searchParams: { action?: string; page?: string };
}) {
  const { dict, locale } = getDict();
  const t = dict.admin.audit;
  const db = getDb();

  const family = ACTION_FAMILIES.find((value) => value === searchParams.action);
  const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);

  let query = db.select().from(auditLog).$dynamic();
  if (family) {
    query = query.where(like(auditLog.action, `${family}.%`));
  }
  const rows = query
    .orderBy(desc(auditLog.createdAt))
    .limit(PAGE_SIZE + 1)
    .offset((page - 1) * PAGE_SIZE)
    .all();
  const hasMore = rows.length > PAGE_SIZE;
  const visible = rows.slice(0, PAGE_SIZE);

  const buildHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (family) params.set("action", family);
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return `/admin/audit${qs ? `?${qs}` : ""}`;
  };

  return (
    <div>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      {/* GET form: filter state lives in the URL — shareable, no JS needed. */}
      <form method="GET" className="mb-4 flex flex-wrap items-center gap-2">
        <label htmlFor="audit-action" className="text-xs font-medium text-mist-300">
          {t.filterLabel}
        </label>
        <select
          id="audit-action"
          name="action"
          defaultValue={family ?? ""}
          className="glass h-10 rounded-xl bg-transparent px-3 text-xs text-mist-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-nebula-400"
        >
          <option value="">{t.allActions}</option>
          {ACTION_FAMILIES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="glass min-h-[40px] rounded-full px-4 text-xs font-semibold text-mist-200 transition hover:text-white"
        >
          {dict.admin.ui.search}
        </button>
      </form>

      <AdminCard className="overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-white/5 text-[11px] uppercase tracking-wide text-mist-500">
              <th className="px-5 py-3 text-start font-medium">{t.when}</th>
              <th className="px-5 py-3 text-start font-medium">{t.actor}</th>
              <th className="px-5 py-3 text-start font-medium">{t.action}</th>
              <th className="px-5 py-3 text-start font-medium">{t.entity}</th>
              <th className="px-5 py-3 text-start font-medium">{t.detail}</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((entry) => (
              <tr key={entry.id} className="border-b border-white/5 align-top last:border-0">
                <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-mist-400" suppressHydrationWarning>
                  {entry.createdAt.toLocaleString(locale === "ar" ? "ar" : "en-GB", {
                    dateStyle: "short",
                    timeStyle: "medium",
                  })}
                </td>
                <td className="px-5 py-3 text-xs text-mist-300">{entry.actorEmail ?? "—"}</td>
                <td className="px-5 py-3 text-xs font-medium text-mist-100">{entry.action}</td>
                <td className="px-5 py-3 text-xs text-mist-400">
                  {entry.entityType ? `${entry.entityType}${entry.entityId ? ` · ${entry.entityId.slice(0, 8)}` : ""}` : "—"}
                </td>
                <td className="max-w-[280px] px-5 py-3">
                  {entry.detail ? (
                    <code dir="ltr" className="block truncate font-mono text-[11px] text-mist-500">
                      {entry.detail}
                    </code>
                  ) : (
                    <span className="text-xs text-mist-500">—</span>
                  )}
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-xs text-mist-500">
                  {t.empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </AdminCard>

      <div className="mt-4 flex items-center justify-between">
        {page > 1 ? (
          <Link href={buildHref(page - 1)} className="glass min-h-[40px] rounded-full px-4 py-2.5 text-xs font-semibold text-mist-200 hover:text-white">
            {t.newer}
          </Link>
        ) : (
          <span />
        )}
        {hasMore && (
          <Link href={buildHref(page + 1)} className="glass min-h-[40px] rounded-full px-4 py-2.5 text-xs font-semibold text-mist-200 hover:text-white">
            {t.older}
          </Link>
        )}
      </div>
    </div>
  );
}
