import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { getDict } from "@/lib/i18n/server";
import { PageHeader } from "@/components/admin/ui";
import { UsersManager } from "@/components/admin/UsersManager";

export default function AdminUsersPage() {
  const { dict } = getDict();
  const auth = getAuth();
  // Page-level gate is UX; the API routes enforce the same permission.
  if (!auth || !hasPermission(auth.user.role, "users.manage")) {
    redirect("/admin");
  }

  return (
    <div>
      <PageHeader title={dict.admin.users.title} subtitle={dict.admin.users.subtitle} />
      <UsersManager currentUserId={auth.user.id} />
    </div>
  );
}
