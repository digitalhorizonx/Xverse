import type { GalleryItem } from "@/data/types";
import { Section } from "./Section";
import { cn } from "@/lib/utils";

const KIND_LABEL: Record<GalleryItem["kind"], string> = {
  before: "Before",
  after: "After",
  concept: "Concept",
};

export function BeforeAfterGallery({ gallery }: { gallery: GalleryItem[] }) {
  return (
    <Section
      eyebrow="Before / After"
      title="The transformation, at a glance"
      description="Illustrative — representing the kind of change Xability drives, not a specific measured before/after."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {gallery.map((item) => (
          <div key={item.id} className="glass-strong flex flex-col gap-3 rounded-3xl p-5">
            <span
              className={cn(
                "w-fit rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide",
                item.kind === "before" && "bg-white/5 text-mist-400",
                item.kind === "after" && "bg-teal-500/10 text-teal-400",
                item.kind === "concept" && "bg-nebula-500/10 text-nebula-400",
              )}
            >
              {KIND_LABEL[item.kind]}
            </span>
            <div className="aspect-video rounded-2xl border border-dashed border-white/10 bg-white/[0.02]" />
            <p className="text-sm text-mist-400">{item.caption}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
