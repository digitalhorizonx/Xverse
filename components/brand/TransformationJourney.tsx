import type { Brand } from "@/data/types";
import { Section } from "./Section";

export function TransformationJourney({ brand }: { brand: Brand }) {
  return (
    <Section
      eyebrow="Digital Transformation Journey"
      title={brand.transformationStage.label}
      description={brand.transformationStage.description}
    >
      <div className="glass-strong rounded-3xl p-6 sm:p-8">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-sm font-medium text-mist-300">Digital transformation score</span>
          <span className="font-display text-2xl font-semibold text-mist-100">
            {brand.digitalTransformationScore}%
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-brand-gradient"
            style={{ width: `${brand.digitalTransformationScore}%` }}
          />
        </div>
        <div className="mt-3 flex justify-between text-[11px] uppercase tracking-wide text-mist-500">
          <span>Getting started</span>
          <span>Fully transformed</span>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {brand.servicesUsed.map((service) => (
            <span
              key={service}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-mist-300"
            >
              {service}
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}
