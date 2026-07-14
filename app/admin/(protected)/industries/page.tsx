import { getAuth } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { getDict } from "@/lib/i18n/server";
import { PageHeader } from "@/components/admin/ui";
import { CatalogManager } from "@/components/admin/content/CatalogManager";

export default function AdminIndustriesPage() {
  const { dict } = getDict();
  const auth = getAuth();
  return (
    <div>
      <PageHeader title={dict.admin.content.industriesTitle} subtitle={dict.admin.content.industriesSubtitle} />
      <CatalogManager
        endpoint="industries"
        withKind={false}
        canDelete={auth ? hasPermission(auth.user.role, "content.delete") : false}
        newLabel={dict.admin.content.newIndustry}
      />
    </div>
  );
}
