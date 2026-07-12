import type { ReactNode } from "react";

/** Browser chrome around a website preview. */
export function BrowserFrame({ url, children, className }: { url: string; children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-white/10 bg-ink-900/80 shadow-2xl ${className ?? ""}`}>
      <div className="flex items-center gap-3 border-b border-white/5 bg-white/[0.03] px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[#f96a4d]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#fb9645]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#20b8a4]/70" />
        </span>
        <span className="flex-1 truncate rounded-full bg-white/5 px-3 py-1 text-center text-[10px] text-mist-500">
          {url}
        </span>
      </div>
      {children}
    </div>
  );
}

/** Phone chrome around an app preview. */
export function PhoneFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative mx-auto w-[280px] overflow-hidden rounded-[2.4rem] border border-white/15 bg-ink-900 shadow-2xl ${className ?? ""}`}
    >
      <div aria-hidden className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black/80" />
      <div className="pt-9">{children}</div>
      <div aria-hidden className="mx-auto mb-2 mt-3 h-1 w-24 rounded-full bg-white/20" />
    </div>
  );
}
