import type { ContentCalendarItem } from "@/data/types";
import { Section } from "./Section";

const STAGES: { status: ContentCalendarItem["status"]; label: string; hint: string }[] = [
  { status: "in-review", label: "In Review", hint: "Drafted, awaiting client sign-off" },
  { status: "scheduled", label: "Scheduled", hint: "Approved, queued to publish" },
  { status: "published", label: "Published", hint: "Live on the brand's channels" },
];

export function ApprovalWorkflow({ items }: { items: ContentCalendarItem[] }) {
  return (
    <Section
      eyebrow="Approval Workflow"
      title="From draft to published"
      description="Every piece of content moves through the same review pipeline before it goes live."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STAGES.map((stage) => {
          const stageItems = items.filter((item) => item.status === stage.status);
          return (
            <div key={stage.status} className="glass-strong flex flex-col gap-3 rounded-3xl p-5">
              <div>
                <h3 className="font-medium text-mist-100">{stage.label}</h3>
                <p className="text-xs text-mist-500">{stage.hint}</p>
              </div>
              <div className="flex flex-col gap-2">
                {stageItems.length === 0 ? (
                  <p className="text-xs text-mist-500">Nothing here right now.</p>
                ) : (
                  stageItems.map((item) => (
                    <div
                      key={`${item.date}-${item.title}`}
                      className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-xs text-mist-300"
                    >
                      <p className="font-medium text-mist-200">{item.title}</p>
                      <p className="text-mist-500">{item.date}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
