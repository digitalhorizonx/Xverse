import { getAuth } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { listProducts } from "@/lib/content/catalog";
import { getDict } from "@/lib/i18n/server";
import { PageHeader } from "@/components/admin/ui";
import { ShowcasesList } from "@/components/admin/content/ShowcasesList";

export default function AdminShowcasesPage() {
  const { dict } = getDict();
  const auth = getAuth();
  const products = listProducts().map((product) => ({ id: product.id, name: product.name }));

  return (
    <div>
      <PageHeader title={dict.admin.content.showcasesTitle} subtitle={dict.admin.content.showcasesSubtitle} />
      <ShowcasesList
        products={products}
        capabilities={{ canDelete: auth ? hasPermission(auth.user.role, "content.delete") : false }}
      />
    </div>
  );
}
