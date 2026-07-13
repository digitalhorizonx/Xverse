import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  // Literal #fff, not text-white: the token flips dark in light mode, but
  // this button's violet fill stays dark in both themes. nebula-600 (not
  // 500) keeps the label at AA contrast.
  primary: "bg-nebula-600 text-[#fff] hover:bg-nebula-500",
  secondary: "glass text-mist-200 hover:text-white hover:border-white/25",
  ghost: "text-mist-300 hover:text-white",
};

interface ButtonLinkProps {
  href: string;
  children: ReactNode;
  variant?: Variant;
  external?: boolean;
  className?: string;
}

/**
 * The one button. Every CTA across Xverse renders through this so weight,
 * radius, and hover behavior stay identical on every screen.
 */
export function ButtonLink({ href, children, variant = "primary", external, className }: ButtonLinkProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition",
    VARIANT_CLASSES[variant],
    className,
  );

  if (external || href.startsWith("http") || href.startsWith("mailto:")) {
    return (
      <a href={href} className={classes} {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
