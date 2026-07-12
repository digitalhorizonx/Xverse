interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "start";
  accentColor?: string;
}

/** Shared eyebrow + title + description block for every major section. */
export function SectionHeading({ eyebrow, title, description, align = "center", accentColor }: SectionHeadingProps) {
  const alignment = align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <div className={`mb-10 flex flex-col gap-3 ${alignment}`}>
      <span
        className="text-xs font-medium uppercase tracking-[0.3em]"
        style={{ color: accentColor ?? "rgb(167 139 250)" }}
      >
        {eyebrow}
      </span>
      <h2 className="font-display text-3xl font-semibold text-mist-100 sm:text-4xl">{title}</h2>
      {description && <p className="max-w-xl text-mist-400">{description}</p>}
    </div>
  );
}
