import { getAuth } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { getDict } from "@/lib/i18n/server";
import { PageHeader } from "@/components/admin/ui";
import { MediaLibrary } from "@/components/admin/media/MediaLibrary";

export default function AdminMediaPage() {
  const { dict } = getDict();
  const auth = getAuth();
  return (
    <div>
      <PageHeader title={dict.admin.media.title} subtitle={dict.admin.media.subtitle} />
      <MediaLibrary
        capabilities={{
          canUpload: auth ? hasPermission(auth.user.role, "media.upload") : false,
          canDelete: auth ? hasPermission(auth.user.role, "media.delete") : false,
        }}
      />
    </div>
  );
}
