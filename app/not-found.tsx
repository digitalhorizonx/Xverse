"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function NotFound() {
  const { dict } = useLocale();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-ink-950 px-6 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-nebula-400">{dict.errors.notFoundEyebrow}</p>
      <h1 className="font-display text-3xl font-semibold text-mist-100 sm:text-4xl">
        {dict.errors.notFoundTitle}
      </h1>
      <p className="max-w-md text-mist-400">{dict.errors.notFoundBody}</p>
      <Link
        href="/"
        className="glass rounded-full px-6 py-3 text-sm font-medium text-mist-100 transition hover:border-nebula-400/40 hover:text-white"
      >
        {dict.common.returnToUniverse}
      </Link>
    </main>
  );
}
