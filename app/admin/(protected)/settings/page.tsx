import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { PlaceholderPage } from "@/components/admin/PlaceholderPage";

export default function Page() {
  const auth = getAuth();
  if (!auth || !hasPermission(auth.user.role, "settings.manage")) {
    redirect("/admin");
  }
  return <PlaceholderPage titleKey="settings" />;
}
