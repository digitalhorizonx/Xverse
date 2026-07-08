import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  eyebrow: string;
  title: string;
  description?: string;
  illustrative?: boolean;
  children: ReactNode;
  className?: string;
}

export function Section({ eyebrow, title, description, illustrative, children, className }: SectionProps) {
  return (
    <section className={cn("mx-auto w-full max-w-6xl px-6 py-10 sm:px-8", className)}>
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-nebula-400">{eyebrow}</span>
          {illustrative && (
            <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-mist-500">
              Illustrative Analytics
            </span>
          )}
        </div>
        <h2 className="font-display text-2xl font-semibold text-mist-100 sm:text-3xl">{title}</h2>
        {description && <p className="max-w-2xl text-sm text-mist-400">{description}</p>}
      </div>
      {children}
    </section>
  );
}
