import type { Report } from "@/data/types";
import { Section } from "./Section";

function ReportCard({ report }: { report: Report }) {
  return (
    <div className="glass-strong flex flex-col gap-4 rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-mist-100">{report.label}</h3>
        <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-mist-400">
          {report.period}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {report.metrics.map((metric) => (
          <div key={metric.label}>
            <p className="text-[11px] uppercase tracking-wide text-mist-500">{metric.label}</p>
            <p className="font-display text-lg font-semibold text-mist-100">{metric.value}</p>
            {metric.change && <p className="text-xs text-teal-400">{metric.change}</p>}
          </div>
        ))}
      </div>

      <ul className="flex flex-col gap-1.5 text-sm text-mist-400">
        {report.highlights.map((highlight) => (
          <li key={highlight} className="flex gap-2">
            <span className="text-nebula-400">•</span>
            {highlight}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ReportsSection({ reports }: { reports: Report[] }) {
  return (
    <Section
      eyebrow="Weekly & Monthly Reports"
      title="Reporting, without the spreadsheet"
      illustrative
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {reports.map((report) => (
          <ReportCard key={report.label} report={report} />
        ))}
      </div>
    </Section>
  );
}
