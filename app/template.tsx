import type { ReactNode } from "react";

/**
 * Remounted by the app router on every navigation, so the .page-enter
 * animation (defined in globals.css, gated behind
 * prefers-reduced-motion: no-preference) gives every route change a
 * consistent, subtle rise-in — cheap, universal page transitions.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
