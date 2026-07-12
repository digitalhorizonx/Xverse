import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { getDict } from "@/lib/i18n/server";

export interface Crumb {
  label: ReactNode;
  href?: string;
}

/**
 * Universe → Showcase → Product → Example trail. Rendered on every level
 * below the universe so the visitor always knows where they are and can
 * step back up one level at a time.
 */
export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  const { dict } = getDict();
  return (
    <nav aria-label={dict.breadcrumbs.ariaLabel} className="flex flex-wrap items-center gap-1.5 text-xs text-mist-500">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <span key={index} className="flex items-center gap-1.5">
            {crumb.href && !isLast ? (
              <Link href={crumb.href} className="transition hover:text-mist-200">
                {crumb.label}
              </Link>
            ) : (
              <span aria-current={isLast ? "page" : undefined} className={isLast ? "text-mist-300" : undefined}>
                {crumb.label}
              </span>
            )}
            {!isLast && <ChevronRight className="h-3 w-3 text-mist-600" aria-hidden />}
          </span>
        );
      })}
    </nav>
  );
}
