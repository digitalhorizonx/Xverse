import type { Metadata, Viewport } from "next";
import { Inter, Sora, Noto_Sans_Arabic } from "next/font/google";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/context/ThemeContext";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { getDict } from "@/lib/i18n/server";
import { dirFor } from "@/lib/i18n/config";
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

// Arabic glyph coverage: Inter/Sora carry no Arabic, so the stacks in
// tailwind.config.ts fall through to this for Arabic text in both body
// and display roles.
const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
});

export function generateMetadata(): Metadata {
  const { dict } = getDict();
  return {
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: SITE_URL,
    },
    title: {
      default: dict.meta.title,
      template: dict.meta.template,
    },
    description: dict.meta.description,
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
      title: dict.meta.title,
      description: dict.meta.ogDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.ogDescription,
    },
    robots: {
      index: ALLOW_INDEXING,
      follow: ALLOW_INDEXING,
    },
    icons: {
      icon: "/favicon.svg",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#020308",
  width: "device-width",
  initialScale: 1,
  // Safe-area padding (env(safe-area-inset-*)) only takes effect with
  // viewport-fit=cover on notched phones.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale, dict } = getDict();

  return (
    <html
      lang={locale}
      dir={dirFor(locale)}
      className={`${inter.variable} ${sora.variable} ${notoArabic.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Applies the theme before first paint — no flash of the wrong
            theme. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-ink-950 font-sans antialiased" suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-[100] focus:rounded-full focus:bg-nebula-400 focus:px-5 focus:py-2.5 focus:text-ink-950 focus:font-semibold"
        >
          {dict.common.skipToContent}
        </a>
        <LocaleProvider locale={locale}>
          <ThemeProvider>{children}</ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
