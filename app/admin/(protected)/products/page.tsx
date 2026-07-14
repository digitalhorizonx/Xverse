import { getDict } from "@/lib/i18n/server";
import { PageHeader } from "@/components/admin/ui";
import { ProductsManager } from "@/components/admin/content/ProductsManager";

export default function AdminProductsPage() {
  const { dict } = getDict();
  return (
    <div>
      <PageHeader title={dict.admin.content.productsTitle} subtitle={dict.admin.content.productsSubtitle} />
      <ProductsManager />
    </div>
  );
}
