// Structured content model for Xverse. Every product planet and demo/
// verified brand world renders from this data — nothing is hardcoded, so
// swapping a demo brand for a verified client story later is a data
// change, not a code change. This is the shape a future CMS integration
// would need to match.

export type HorizonXProductId = "xability" | "xsite" | "xapp" | "xai" | "xauto";

export interface ProductPlanet {
  id: HorizonXProductId;
  /** Route segment of this product's showcase: /showcase/<showcaseSlug>. */
  showcaseSlug: string;
  name: string;
  tagline: string;
  description: string;
  color: string;
  accentColor: string;
  status: "live" | "coming-soon";
  ctaLabel: string;
  ctaUrl: string;
  /** Relative orbit distance from the HorizonX Core, in scene units. */
  orbitRadius: number;
  /** Relative orbit speed multiplier. */
  orbitSpeed: number;
}

export type SocialPlatform = "instagram" | "facebook" | "tiktok" | "linkedin";

export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  format: "post" | "reel" | "story";
  caption: string;
  /** Text description of the visual — a stand-in until a real asset is generated. */
  visualPrompt: string;
  likes: number;
  comments: number;
  shares: number;
  postedAt: string;
}

export interface ContentCalendarItem {
  date: string;
  platform: SocialPlatform;
  title: string;
  status: "scheduled" | "published" | "in-review";
}

export interface ReportMetric {
  label: string;
  value: string;
  change?: string;
}

export interface Report {
  period: "weekly" | "monthly";
  label: string;
  highlights: string[];
  metrics: ReportMetric[];
}

export interface AdCampaign {
  name: string;
  platform: SocialPlatform;
  spend: string;
  impressions: string;
  clicks: string;
  ctr: string;
  conversions: string;
  roas: string;
}

export interface AnalyticsSnapshot {
  followers: string;
  followerGrowth: string;
  engagementRate: string;
  reach: string;
  topPost: string;
}

export interface AiInsight {
  id: string;
  title: string;
  detail: string;
  impact: "high" | "medium" | "low";
}

export interface TransformationStage {
  label: string;
  scorePercent: number;
  description: string;
}

export interface GalleryItem {
  id: string;
  caption: string;
  kind: "before" | "after" | "concept";
}

export interface PreviewPanel {
  title: string;
  description: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  type: "demo" | "verified";
  product: HorizonXProductId;
  industry: string;
  /** Single-letter/short mark used as a placeholder logo. */
  logoMark: string;
  colors: { primary: string; secondary: string; accent: string };
  coverVisual: string;
  description: string;
  brandStory: string;
  transformationStage: TransformationStage;
  digitalTransformationScore: number;
  servicesUsed: string[];
  socialPosts: SocialPost[];
  reels: SocialPost[];
  contentCalendar: ContentCalendarItem[];
  reports: Report[];
  analytics: AnalyticsSnapshot;
  adPerformance: AdCampaign[];
  aiInsights: AiInsight[];
  gallery: GalleryItem[];
  // Product-specific preview panels (XSites → websitePreview, XApps →
  // appPreview, XAuto → automationPreview, XAI → aiWorkflowPreview).
  // Optional — Xability demo brands don't populate these.
  websitePreview?: PreviewPanel;
  appPreview?: PreviewPanel;
  automationPreview?: PreviewPanel;
  aiWorkflowPreview?: PreviewPanel;
  tags: string[];
  featured: boolean;
  active: boolean;
}

// ---------------------------------------------------------------------------
// Showcase content model — each HorizonX product's dedicated interactive
// showcase ("mini website") under /showcase/<slug> renders entirely from
// this data. Adding a future product = new ProductShowcase entry, no new
// page code.
// ---------------------------------------------------------------------------

export interface ShowcaseStat {
  label: string;
  value: string;
}

export interface ShowcaseCapability {
  /** Key into the icon map in the showcase components. */
  icon: string;
  title: string;
  description: string;
}

export interface ShowcaseSection {
  id: string;
  label: string;
}

/** A realistic example business used inside a product's showcase. */
export interface SampleBusiness {
  id: string;
  name: string;
  industry: string;
  logoMark: string;
  color: string;
  accent: string;
  summary: string;
  highlights: string[];
}

// --- XSites: interactive website template previews -------------------------
export interface SiteTemplate {
  id: string;
  businessName: string;
  industry: string;
  kind: "business" | "landing" | "corporate" | "ecommerce";
  navLabels: string[];
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  palette: { primary: string; surface: string; accent: string };
  sections: string[];
  features: string[];
}

// --- XApps: phone-frame app demos ------------------------------------------
export interface AppScreen {
  id: string;
  label: string;
  title: string;
  /** Simple typed rows the phone renderer knows how to draw. */
  items: { icon: string; primary: string; secondary?: string; trailing?: string }[];
  cta?: string;
}

export interface AppDemo {
  id: string;
  businessName: string;
  category: string;
  color: string;
  screens: AppScreen[];
  pushNotification: { title: string; body: string };
}

// --- XAuto: marketplace / dealership demo -----------------------------------
export interface VehicleListing {
  id: string;
  name: string;
  year: number;
  price: string;
  mileage: string;
  status: "available" | "reserved" | "in-inspection";
  color: string;
}

export interface AutoService {
  icon: string;
  name: string;
  description: string;
}

// --- AI Platform: agents / chat / workflows ---------------------------------
export interface AiAgentProfile {
  name: string;
  role: string;
  description: string;
}

export interface ChatTurn {
  from: "customer" | "agent";
  text: string;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  trigger: string;
  steps: string[];
  outcome: string;
}

export interface ProductShowcase {
  productId: HorizonXProductId;
  /** Public route segment: /showcase/<slug>. */
  slug: string;
  heroTagline: string;
  heroDescription: string;
  stats: ShowcaseStat[];
  capabilities: ShowcaseCapability[];
  sections: ShowcaseSection[];
  sampleBusinesses: SampleBusiness[];
  // Product-specific demo payloads (only the relevant one is populated).
  siteTemplates?: SiteTemplate[];
  appDemos?: AppDemo[];
  vehicles?: VehicleListing[];
  autoServices?: AutoService[];
  aiAgents?: AiAgentProfile[];
  chatScript?: ChatTurn[];
  aiWorkflows?: AutomationWorkflow[];
}
