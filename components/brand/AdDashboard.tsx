import type { AdCampaign } from "@/data/types";
import { Section } from "./Section";
import { PLATFORM_LABEL, PLATFORM_COLOR } from "./platformMeta";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-mist-500">{label}</p>
      <p className="font-display text-lg font-semibold text-mist-100">{value}</p>
    </div>
  );
}

export function AdDashboard({ campaigns }: { campaigns: AdCampaign[] }) {
  return (
    <Section
      eyebrow="Advertising Dashboard"
      title="Paid campaign performance"
      illustrative
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {campaigns.map((campaign) => (
          <div key={campaign.name} className="glass-strong rounded-3xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-medium text-mist-100">{campaign.name}</h3>
              <span
                className="rounded-full px-2.5 py-0.5 text-[11px] font-medium text-white"
                style={{ backgroundColor: PLATFORM_COLOR[campaign.platform] }}
              >
                {PLATFORM_LABEL[campaign.platform]}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Stat label="Spend" value={campaign.spend} />
              <Stat label="Impressions" value={campaign.impressions} />
              <Stat label="Clicks" value={campaign.clicks} />
              <Stat label="CTR" value={campaign.ctr} />
              <Stat label="Conversions" value={campaign.conversions} />
              <Stat label="ROAS" value={campaign.roas} />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
