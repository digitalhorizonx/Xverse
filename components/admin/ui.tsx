"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/LocaleProvider";

// The admin design-system primitives. Deliberately small: buttons,
// fields, badges, cards, dialogs, empty states — all on the V1 tokens so
// bilingual/RTL/light-dark support is inherited, not re-implemented.

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

const BUTTON_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-nebula-600 text-[#fff] hover:bg-nebula-500",
  secondary: "glass text-mist-200 hover:text-white hover:border-white/25",
  // Tokened coral: readable in both themes.
  danger: "bg-coral-500/15 text-coral-400 hover:bg-coral-500/25",
  ghost: "text-mist-300 hover:text-mist-100",
};

export function AdminButton({
  variant = "secondary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        BUTTON_CLASSES[variant],
        className,
      )}
    />
  );
}

export function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-xs font-medium text-mist-300">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-[11px] text-mist-500">{hint}</p>}
    </div>
  );
}

export const inputClasses =
  "glass h-11 w-full rounded-xl bg-transparent px-3.5 text-sm text-mist-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-nebula-400";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputClasses, props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(inputClasses, "appearance-none pe-8 [color-scheme:inherit]", props.className)}
    />
  );
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "positive" | "warning" | "accent"; children: ReactNode }) {
  const tones = {
    neutral: "bg-white/10 text-mist-300",
    positive: "bg-teal-500/15 text-teal-300",
    warning: "bg-amber-500/15 text-amber-300",
    accent: "bg-nebula-500/15 text-nebula-300",
  } as const;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide", tones[tone])}>
      {children}
    </span>
  );
}

export function AdminCard({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("glass-strong rounded-3xl p-6", className)}>{children}</div>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-semibold text-mist-100">{title}</h1>
        {subtitle && <p className="mt-1 max-w-xl text-sm text-mist-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="glass flex flex-col items-center gap-2 rounded-3xl px-6 py-16 text-center">
      <p className="font-display text-lg font-semibold text-mist-200">{title}</p>
      <p className="max-w-sm text-sm text-mist-500">{body}</p>
    </div>
  );
}

/**
 * Modal dialog on the native <dialog> element (focus trap + Escape for
 * free). Used for anything destructive — nothing destructive happens on a
 * single click in the admin.
 */
export function AdminDialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const { dict } = useLocale();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- backdrop click-to-close convenience; Escape + the Close button are the accessible paths
    <dialog
      ref={ref}
      onClose={(event) => {
        // React's synthetic close event bubbles (the native one doesn't) —
        // without this guard, a nested confirm dialog closing would close
        // its parent dialog too.
        if (event.target === ref.current) onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose(); // backdrop click
      }}
      className="w-full max-w-md rounded-3xl border border-white/10 bg-ink-900 p-0 text-mist-100 shadow-glow-nebula backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-mist-100">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={dict.admin.ui.close}
            className="glass flex h-8 w-8 items-center justify-center rounded-full text-mist-400 transition hover:text-mist-100"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

export function InlineError({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-xl bg-coral-500/10 px-3.5 py-2.5 text-xs text-coral-400">
      {children}
    </p>
  );
}

export function InlineSuccess({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="rounded-xl bg-teal-500/10 px-3.5 py-2.5 text-xs text-teal-300">
      {children}
    </p>
  );
}
