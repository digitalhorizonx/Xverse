import { notFound } from "next/navigation";
import { getAuth } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { listIndustries, listProducts, listTags } from "@/lib/content/catalog";
import { ContentError, getShowcase } from "@/lib/content/showcases";
import { ShowcaseEditor } from "@/components/admin/content/ShowcaseEditor";

export default function AdminShowcaseEditorPage({ params }: { params: { id: string } }) {
  const auth = getAuth();
  let showcase;
  try {
    showcase = getShowcase(params.id);
  } catch (error) {
    if (error instanceof ContentError && error.code === "not_found") notFound();
    throw error;
  }

  return (
    <ShowcaseEditor
      initial={showcase}
      products={listProducts().map((product) => ({ id: product.id, name: product.name }))}
      industries={listIndustries()}
      tags={listTags()}
      capabilities={{ canPublish: auth ? hasPermission(auth.user.role, "content.publish") : false }}
    />
  );
}
