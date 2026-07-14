import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth/session";
import { AdminChrome } from "@/components/admin/AdminChrome";

/**
 * The server-side gate for every admin screen: no session → login. This
 * runs on the server for each request; client code never decides access.
 * (Route handlers under /api/admin do their own requirePermission checks —
 * this layout is UX, the API checks are the security boundary.)
 */
export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const auth = getAuth();
  if (!auth) {
    redirect("/admin/login");
  }

  return <AdminChrome user={auth.user}>{children}</AdminChrome>;
}
