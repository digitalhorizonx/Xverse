import type { ContentCalendarItem } from "@/data/types";
import { Section } from "./Section";
import { PLATFORM_LABEL, PLATFORM_COLOR } from "./platformMeta";

const STATUS_LABEL: Record<ContentCalendarItem["status"], string> = {
  scheduled: "Scheduled",
  published: "Published",
  "in-review": "In Review",
};

export function ContentCalendarSection({ items }: { items: ContentCalendarItem[] }) {
  return (
    <Section
      eyebrow="Content Calendar"
      title="This month's content calendar"
      description="Planned, in-review, and scheduled content — the same calendar the brand's team sees."
    >
      <div className="glass-strong overflow-hidden rounded-3xl">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-mist-500">
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Platform</th>
              <th className="px-5 py-3 font-medium">Title</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={`${item.date}-${item.title}`} className="border-b border-white/5 last:border-0">
                <td className="whitespace-nowrap px-5 py-3 text-mist-400">{item.date}</td>
                <td className="whitespace-nowrap px-5 py-3">
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
                    style={{ backgroundColor: PLATFORM_COLOR[item.platform] }}
                  >
                    {PLATFORM_LABEL[item.platform]}
                  </span>
                </td>
                <td className="px-5 py-3 text-mist-200">{item.title}</td>
                <td className="whitespace-nowrap px-5 py-3 text-mist-400">{STATUS_LABEL[item.status]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
