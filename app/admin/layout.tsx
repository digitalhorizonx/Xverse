import type { Metadata } from "next";

// Everything under /admin is an internal tool: never indexed, never in
// the sitemap (see app/robots.ts). Auth is enforced per-segment — the
// login page is public, app/admin/(protected)/* requires a session.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Xverse Admin",
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
