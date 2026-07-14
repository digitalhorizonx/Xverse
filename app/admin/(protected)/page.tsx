import Link from "next/link";
import { desc, gte, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { auditLog, sessions, users } from "@/db/schema";
import { getAuth } from "@/lib/auth/session";
import { getDict } from "@/lib/i18n/server";
import { AdminCard, PageHeader } from "@/components/admin/ui";

export default function AdminDashboardPage() {
  const { dict, locale } = getDict();
  const auth = getAuth();
  const db = getDb();

  const userCount = db.select({ count: sql<number>`count(*)` }).from(users).get()?.count ?? 0;
  const sessionCount =
    db
      .select({ count: sql<number>`count(*)` })
      .from(sessions)
      .where(gte(sessions.expiresAt, new Date()))
      .get()?.count ?? 0;
  const auditCount =
    db
      .select({ count: sql<number>`count(*)` })
      .from(auditLog)
      .where(gte(auditLog.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)))
      .get()?.count ?? 0;
  const recent = db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(8).all();

  const stats = [
    { label: dict.admin.dashboard.teamMembers, value: userCount },
    { label: dict.admin.dashboard.activeSessions, value: sessionCount },
    { label: dict.admin.dashboard.auditEvents7d, value: auditCount },
  ];

  return (
    <div>
      <PageHeader
        title={dict.admin.dashboardTitle}
        subtitle={`${dict.admin.dashboard.welcome}, ${auth?.user.name ?? ""}`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <AdminCard key={stat.label}>
            <p className="font-display text-3xl font-semibold text-mist-100">{stat.value}</p>
            <p className="mt-1 text-xs text-mist-500">{stat.label}</p>
          </AdminCard>
        ))}
      </div>

      <AdminCard className="mt-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-mist-100">
            {dict.admin.dashboard.recentActivity}
          </h2>
          <Link href="/admin/audit" className="text-xs font-medium text-nebula-300 hover:text-nebula-400">
            {dict.admin.dashboard.viewAuditLog}
          </Link>
        </div>
        <ul className="flex flex-col gap-2.5">
          {recent.map((entry) => (
            <li key={entry.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-xs">
              <span className="font-mono text-mist-500" suppressHydrationWarning>
                {entry.createdAt.toLocaleString(locale === "ar" ? "ar" : "en-GB", { dateStyle: "short", timeStyle: "short" })}
              </span>
              <span className="font-medium text-mist-200">{entry.action}</span>
              <span className="text-mist-500">{entry.actorEmail}</span>
            </li>
          ))}
          {recent.length === 0 && <li className="text-xs text-mist-500">—</li>}
        </ul>
      </AdminCard>
    </div>
  );
}
