import { Sparkles } from "lucide-react";
import type { AiInsight } from "@/data/types";
import { Section } from "./Section";
import { cn } from "@/lib/utils";

const IMPACT_STYLE: Record<AiInsight["impact"], string> = {
  high: "text-coral-400 border-coral-500/30 bg-coral-500/10",
  medium: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  low: "text-teal-400 border-teal-500/30 bg-teal-500/10",
};

export function AiInsights({ insights }: { insights: AiInsight[] }) {
  return (
    <Section
      eyebrow="AI-Generated Marketing Strategy"
      title="AI recommendations"
      description="Xability's AI continuously reads performance data and surfaces what to do next."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {insights.map((insight) => (
          <div key={insight.id} className="glass-strong flex flex-col gap-3 rounded-3xl p-5">
            <div className="flex items-start justify-between gap-3">
              <Sparkles className="h-5 w-5 shrink-0 text-nebula-400" aria-hidden />
              <span
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                  IMPACT_STYLE[insight.impact],
                )}
              >
                {insight.impact} impact
              </span>
            </div>
            <h3 className="font-medium text-mist-100">{insight.title}</h3>
            <p className="text-sm text-mist-400">{insight.detail}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
