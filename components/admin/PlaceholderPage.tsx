import { getDict } from "@/lib/i18n/server";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import type { Dictionary } from "@/lib/i18n/types";

/**
 * Placeholder for sections whose functionality lands in a later V2 phase.
 * The navigation ships complete from Phase 2 so the console's information
 * architecture never shifts under the team.
 */
export function PlaceholderPage({ titleKey }: { titleKey: keyof Dictionary["admin"]["nav"] }) {
  const { dict } = getDict();
  return (
    <div>
      <PageHeader title={dict.admin.nav[titleKey]} />
      <EmptyState title={dict.admin.ui.comingSoonTitle} body={dict.admin.ui.comingSoonBody} />
    </div>
  );
}
