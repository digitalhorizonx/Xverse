import { getAuth } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { getDict } from "@/lib/i18n/server";
import { PageHeader } from "@/components/admin/ui";
import { CatalogManager } from "@/components/admin/content/CatalogManager";

export default function AdminTaxonomyPage() {
  const { dict } = getDict();
  const auth = getAuth();
  return (
    <div>
      <PageHeader title={dict.admin.content.taxonomyTitle} subtitle={dict.admin.content.taxonomySubtitle} />
      <CatalogManager
        endpoint="tags"
        withKind
        canDelete={auth ? hasPermission(auth.user.role, "content.delete") : false}
        newLabel={dict.admin.content.newTag}
      />
    </div>
  );
}
