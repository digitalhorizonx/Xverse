import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import { SITE_URL, ALLOW_INDEXING } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-cal",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  title: {
    default: "Xverse — The HorizonX Digital Universe",
    template: "%s | Xverse by HorizonX",
  },
  description:
    "Xverse is the HorizonX Digital Universe — explore immersive demo brands, dashboards, and digital transformation journeys across the entire HorizonX product ecosystem.",
  keywords: [
    "HorizonX",
    "Xverse",
    "digital transformation",
    "AI marketing platform",
    "digital universe",
    "Xability",
  ],
  authors: [{ name: "HorizonX" }],
  creator: "HorizonX",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Xverse by HorizonX",
    title: "Xverse — The HorizonX Digital Universe",
    description:
      "Enter the HorizonX Digital Universe — explore demo brands, dashboards, and digital transformation journeys across the HorizonX ecosystem.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Xverse — The HorizonX Digital Universe",
    description:
      "Enter the HorizonX Digital Universe — explore demo brands, dashboards, and digital transformation journeys.",
  },
  robots: {
    index: ALLOW_INDEXING,
    follow: ALLOW_INDEXING,
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#020308",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${inter.variable} ${sora.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-ink-950 font-sans antialiased" suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-[100] focus:rounded-full focus:bg-nebula-400 focus:px-5 focus:py-2.5 focus:text-ink-950 focus:font-semibold"
        >
          Skip to content
        </a>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
