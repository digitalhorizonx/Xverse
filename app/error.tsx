"use client";

import { useEffect } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { dict } = useLocale();

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-ink-950 px-6 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-coral-500">{dict.errors.errorEyebrow}</p>
      <h1 className="font-display text-3xl font-semibold text-mist-100 sm:text-4xl">
        {dict.errors.errorTitle}
      </h1>
      <p className="max-w-md text-mist-400">{dict.errors.errorBody}</p>
      <button
        onClick={reset}
        className="glass rounded-full px-6 py-3 text-sm font-medium text-mist-100 transition hover:border-nebula-400/40 hover:text-white"
      >
        {dict.errors.tryAgain}
      </button>
    </main>
  );
}
