import type { AnalyticsSnapshot } from "@/data/types";
import { Section } from "./Section";

export function AnalyticsDashboard({ analytics }: { analytics: AnalyticsSnapshot }) {
  const tiles: { label: string; value: string }[] = [
    { label: "Followers", value: analytics.followers },
    { label: "Follower growth", value: analytics.followerGrowth },
    { label: "Engagement rate", value: analytics.engagementRate },
    { label: "Reach", value: analytics.reach },
  ];

  return (
    <Section eyebrow="Analytics Dashboard" title="Where this brand stands today" illustrative>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="glass-strong rounded-3xl p-5">
            <p className="text-[11px] uppercase tracking-wide text-mist-500">{tile.label}</p>
            <p className="font-display text-2xl font-semibold text-mist-100">{tile.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-mist-400">
        Top performing post: <span className="text-mist-200">{analytics.topPost}</span>
      </p>
    </Section>
  );
}
