"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";

export function UniverseLoading() {
  const { dict } = useLocale();

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin-slow rounded-full border-2 border-nebula-400/30 border-t-nebula-400" />
        <p className="text-sm text-mist-400">{dict.loading.universe}</p>
      </div>
    </div>
  );
}
