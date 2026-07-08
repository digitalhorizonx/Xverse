import type { Brand } from "./types";

// All entries below are DEMO BRANDS — illustrative, concept businesses used
// to show what Xability delivers. They are not real clients. Every page
// that renders this data must carry a visible "Demo Brand" / "Sample
// Experience" / "Illustrative Analytics" label — see
// components/brand/DemoBadge.tsx. `active: false` hides a brand from
// listings without deleting its data; flip a brand's `type` to "verified"
// and swap in real content when a client story is ready to replace it.

export const BRANDS: Brand[] = [
  {
    id: "amber-oak-coffee",
    name: "Amber & Oak Coffee Co.",
    slug: "amber-oak-coffee",
    type: "demo",
    product: "xability",
    industry: "Coffee Shop",
    logoMark: "AO",
    colors: { primary: "#b5651d", secondary: "#3e2723", accent: "#f4c95d" },
    coverVisual: "warm-espresso-morning-light",
    description:
      "A neighborhood specialty coffee shop turning first-time visitors into regulars through consistent, story-driven social content.",
    brandStory:
      "Amber & Oak opened as a single corner counter roasting small-batch beans. Before Xability, its social presence was sporadic — a photo here, a story there, no strategy. Xability built a consistent content engine around its actual differentiator: the roast story, the barista craft, the neighborhood regulars.",
    transformationStage: {
      label: "Scaling consistent presence",
      scorePercent: 72,
      description:
        "From irregular posting to a fully planned content calendar, active community engagement, and its first paid acquisition campaigns.",
    },
    digitalTransformationScore: 72,
    servicesUsed: [
      "AI Content Strategy",
      "Social Publishing",
      "Brand Voice Training",
      "Paid Ads Management",
      "Analytics & Reporting",
    ],
    socialPosts: [
      {
        id: "aoc-post-1",
        platform: "instagram",
        format: "post",
        caption:
          "New single-origin from the Huila region just hit the bar. Bright, jammy, a little floral — exactly the kind of cup we roast for. ☕️ #AmberAndOak",
        visualPrompt: "Close-up pour-over shot, warm morning light through the front window, steam rising",
        likes: 412,
        comments: 28,
        shares: 14,
        postedAt: "2026-06-03",
      },
      {
        id: "aoc-post-2",
        platform: "facebook",
        format: "post",
        caption:
          "Meet Dana — five years behind our bar, and the reason half our regulars know their order before they say it. This is who Amber & Oak actually is.",
        visualPrompt: "Candid portrait of barista mid-pour, genuine smile, shop interior softly blurred behind",
        likes: 289,
        comments: 41,
        shares: 22,
        postedAt: "2026-06-10",
      },
      {
        id: "aoc-post-3",
        platform: "instagram",
        format: "story",
        caption: "Today's latte art poll: leaf or heart? Vote and get 10% off your next visit.",
        visualPrompt: "Split-screen latte art comparison, playful poll sticker overlay",
        likes: 176,
        comments: 33,
        shares: 9,
        postedAt: "2026-06-14",
      },
    ],
    reels: [
      {
        id: "aoc-reel-1",
        platform: "tiktok",
        format: "reel",
        caption: "60 seconds of what actually happens before we open at 6:30am.",
        visualPrompt: "Fast-cut morning prep montage — grinding beans, dialing in espresso, unlocking doors",
        likes: 3400,
        comments: 112,
        shares: 268,
        postedAt: "2026-06-06",
      },
      {
        id: "aoc-reel-2",
        platform: "instagram",
        format: "reel",
        caption: "How we cup-test every new bag before it goes on the shelf.",
        visualPrompt: "Overhead shot of cupping bowls, slow-motion slurp, tasting notes written on a chalkboard",
        likes: 2150,
        comments: 87,
        shares: 190,
        postedAt: "2026-06-18",
      },
    ],
    contentCalendar: [
      { date: "2026-07-01", platform: "instagram", title: "New roast announcement", status: "scheduled" },
      { date: "2026-07-03", platform: "tiktok", title: "Latte art tutorial reel", status: "scheduled" },
      { date: "2026-07-08", platform: "facebook", title: "Regulars spotlight: the Tuesday book club", status: "in-review" },
      { date: "2026-07-12", platform: "instagram", title: "Behind the roast: sourcing trip recap", status: "scheduled" },
      { date: "2026-07-19", platform: "instagram", title: "Summer iced menu launch", status: "scheduled" },
    ],
    reports: [
      {
        period: "weekly",
        label: "Week of Jun 9–15, 2026",
        highlights: [
          "Barista spotlight post drove the highest engagement rate of the quarter.",
          "Story poll format lifted story completion rate by 18%.",
        ],
        metrics: [
          { label: "Reach", value: "18.4K", change: "+12%" },
          { label: "Engagement rate", value: "6.1%", change: "+0.8pt" },
          { label: "New followers", value: "212", change: "+34" },
        ],
      },
      {
        period: "monthly",
        label: "June 2026",
        highlights: [
          "First paid campaign (local awareness) launched, CAC came in 22% under target.",
          "Reel format now outperforms static posts 3:1 on reach.",
          "Foot traffic from Instagram bio link up 41% month-over-month.",
        ],
        metrics: [
          { label: "Total reach", value: "76.2K", change: "+28%" },
          { label: "Followers", value: "4,910", change: "+890" },
          { label: "Website clicks", value: "1,340", change: "+41%" },
        ],
      },
    ],
    analytics: {
      followers: "4,910",
      followerGrowth: "+22% (90 days)",
      engagementRate: "6.1%",
      reach: "76.2K / month",
      topPost: "Barista spotlight — 289 likes, 41 comments",
    },
    adPerformance: [
      {
        name: "Local Awareness — 3mi radius",
        platform: "instagram",
        spend: "$420",
        impressions: "58,200",
        clicks: "1,120",
        ctr: "1.9%",
        conversions: "146 store visits",
        roas: "4.1x",
      },
      {
        name: "New Menu Retargeting",
        platform: "facebook",
        spend: "$180",
        impressions: "21,400",
        clicks: "410",
        ctr: "1.9%",
        conversions: "62 orders",
        roas: "3.4x",
      },
    ],
    aiInsights: [
      {
        id: "aoc-insight-1",
        title: "Post between 6:45–8:15am for 2.3x normal reach",
        detail:
          "Your audience is overwhelmingly commuters. Content published in the pre-work window consistently outperforms afternoon posts.",
        impact: "high",
      },
      {
        id: "aoc-insight-2",
        title: "People content outperforms product content 2:1",
        detail:
          "Barista and regular-customer stories drive more saves and shares than pure product shots — lean further into the people behind the counter.",
        impact: "high",
      },
      {
        id: "aoc-insight-3",
        title: "Add a Sunday slow-morning series",
        detail:
          "Weekend engagement dips 30% versus weekdays. A recurring low-key Sunday format could recapture that audience.",
        impact: "medium",
      },
    ],
    gallery: [
      { id: "aoc-g1", caption: "Before: inconsistent posting, no visual identity", kind: "before" },
      { id: "aoc-g2", caption: "After: cohesive warm-toned grid, recognizable at a glance", kind: "after" },
      { id: "aoc-g3", caption: "Concept: seasonal menu launch campaign", kind: "concept" },
    ],
    tags: ["coffee", "local-business", "food-and-beverage", "community"],
    featured: true,
    active: true,
  },
  {
    id: "clarity-family-clinic",
    name: "Clarity Family Clinic",
    slug: "clarity-family-clinic",
    type: "demo",
    product: "xability",
    industry: "Medical Clinic",
    logoMark: "CF",
    colors: { primary: "#0f766e", secondary: "#134e4a", accent: "#5eead4" },
    coverVisual: "calm-clinical-teal-daylight",
    description:
      "A family medicine practice using patient-education content and appointment-driven campaigns to grow a trusted local reputation.",
    brandStory:
      "Clarity Family Clinic had strong in-person trust but almost no online footprint — patients found it by word of mouth or not at all. Xability built a compliant, educational content program that answers the questions patients already have, paired with local visibility campaigns.",
    transformationStage: {
      label: "Building trusted authority",
      scorePercent: 65,
      description:
        "Educational content is establishing the clinic as a credible local resource, with appointment-booking campaigns now in active testing.",
    },
    digitalTransformationScore: 65,
    servicesUsed: [
      "AI Content Strategy",
      "Social Publishing",
      "Patient Education Content",
      "Local Ads Management",
      "Analytics & Reporting",
    ],
    socialPosts: [
      {
        id: "cfc-post-1",
        platform: "facebook",
        format: "post",
        caption:
          "5 things your body is telling you before a check-up feels \"necessary.\" A quick guide from Dr. Amara Osei.",
        visualPrompt: "Clean infographic-style card, calm teal palette, friendly iconography, no clinical imagery",
        likes: 198,
        comments: 22,
        shares: 47,
        postedAt: "2026-06-02",
      },
      {
        id: "cfc-post-2",
        platform: "instagram",
        format: "post",
        caption:
          "Same-week appointments now available for new patients. Family medicine, done without the wait.",
        visualPrompt: "Bright, welcoming reception area photo, warm natural light, no patients visible for privacy",
        likes: 134,
        comments: 9,
        shares: 18,
        postedAt: "2026-06-11",
      },
      {
        id: "cfc-post-3",
        platform: "linkedin",
        format: "post",
        caption:
          "Clarity Family Clinic is proud to welcome Dr. Malik Reyes, board-certified in internal medicine, to the practice.",
        visualPrompt: "Professional headshot-style announcement graphic with clinic branding",
        likes: 61,
        comments: 7,
        shares: 12,
        postedAt: "2026-06-20",
      },
    ],
    reels: [
      {
        id: "cfc-reel-1",
        platform: "instagram",
        format: "reel",
        caption: "60 seconds on what actually happens at an annual physical (and why it matters).",
        visualPrompt: "Friendly explainer with on-screen captions, calm studio setting, doctor speaking to camera",
        likes: 890,
        comments: 34,
        shares: 76,
        postedAt: "2026-06-08",
      },
      {
        id: "cfc-reel-2",
        platform: "tiktok",
        format: "reel",
        caption: "\"Should I go to urgent care or the ER?\" — a simple decision guide.",
        visualPrompt: "Text-on-screen decision tree animation with voiceover",
        likes: 1620,
        comments: 58,
        shares: 210,
        postedAt: "2026-06-22",
      },
    ],
    contentCalendar: [
      { date: "2026-07-02", platform: "facebook", title: "Seasonal allergy guide", status: "scheduled" },
      { date: "2026-07-07", platform: "instagram", title: "New patient onboarding walkthrough", status: "scheduled" },
      { date: "2026-07-14", platform: "linkedin", title: "Community health fair recap", status: "in-review" },
      { date: "2026-07-21", platform: "instagram", title: "Back-to-school physicals reminder", status: "scheduled" },
    ],
    reports: [
      {
        period: "weekly",
        label: "Week of Jun 16–22, 2026",
        highlights: [
          "Urgent-care-vs-ER reel became the clinic's best-performing piece of content to date.",
          "Appointment-request clicks from Instagram bio up 26%.",
        ],
        metrics: [
          { label: "Reach", value: "9.8K", change: "+19%" },
          { label: "Engagement rate", value: "4.4%", change: "+1.1pt" },
          { label: "Appointment clicks", value: "58", change: "+12" },
        ],
      },
      {
        period: "monthly",
        label: "June 2026",
        highlights: [
          "Patient-education format now drives 3x the shares of promotional posts.",
          "Local awareness campaign lowered cost-per-appointment-request by 31%.",
        ],
        metrics: [
          { label: "Total reach", value: "38.6K", change: "+22%" },
          { label: "Followers", value: "1,860", change: "+240" },
          { label: "Appointment requests", value: "94", change: "+31%" },
        ],
      },
    ],
    analytics: {
      followers: "1,860",
      followerGrowth: "+15% (90 days)",
      engagementRate: "4.4%",
      reach: "38.6K / month",
      topPost: "ER vs. urgent care reel — 1,620 likes, 210 shares",
    },
    adPerformance: [
      {
        name: "New Patient Local Awareness",
        platform: "facebook",
        spend: "$310",
        impressions: "44,100",
        clicks: "780",
        ctr: "1.8%",
        conversions: "37 appointment requests",
        roas: "n/a (service business)",
      },
    ],
    aiInsights: [
      {
        id: "cfc-insight-1",
        title: "Educational \"decision guide\" reels drive 3x shares",
        detail:
          "Content answering a specific, practical question (\"should I...\") consistently outperforms general wellness tips.",
        impact: "high",
      },
      {
        id: "cfc-insight-2",
        title: "Add provider-introduction content for new hires",
        detail:
          "Posts introducing a named provider outperform generic clinic posts on trust-related engagement (comments, saves).",
        impact: "medium",
      },
      {
        id: "cfc-insight-3",
        title: "LinkedIn is under-leveraged for referral partnerships",
        detail:
          "Low posting frequency on LinkedIn is leaving local provider-referral relationships unbuilt — a light monthly cadence could open a new patient channel.",
        impact: "medium",
      },
    ],
    gallery: [
      { id: "cfc-g1", caption: "Before: no consistent visual identity, mixed stock photography", kind: "before" },
      { id: "cfc-g2", caption: "After: calm, consistent teal system patients recognize", kind: "after" },
      { id: "cfc-g3", caption: "Concept: new patient onboarding campaign", kind: "concept" },
    ],
    tags: ["healthcare", "local-business", "trust", "education"],
    featured: false,
    active: true,
  },
  {
    id: "sable-and-salt",
    name: "Sable & Salt Kitchen",
    slug: "sable-and-salt",
    type: "demo",
    product: "xability",
    industry: "Restaurant",
    logoMark: "SS",
    colors: { primary: "#7c2d12", secondary: "#1c1917", accent: "#facc15" },
    coverVisual: "moody-dinner-service-candlelight",
    description:
      "A chef-driven neighborhood restaurant filling reservations through appetite-driving content and a disciplined weekly cadence.",
    brandStory:
      "Sable & Salt had the food and the reviews, but an inconsistent, low-quality social presence undersold both. Xability rebuilt the visual identity around the plating and the open kitchen, then built a content system the chef's small team could actually sustain.",
    transformationStage: {
      label: "Converting attention to reservations",
      scorePercent: 81,
      description:
        "A mature content engine and paid reservation campaigns are now the restaurant's top booking channel, ahead of walk-ins.",
    },
    digitalTransformationScore: 81,
    servicesUsed: [
      "AI Content Strategy",
      "Social Publishing",
      "Reservation Campaign Management",
      "Paid Ads Management",
      "Analytics & Reporting",
      "AI-Generated Captions",
    ],
    socialPosts: [
      {
        id: "sas-post-1",
        platform: "instagram",
        format: "post",
        caption:
          "Tonight's special: pan-seared scallops, charred corn purée, brown butter. Reservations closing fast for Friday.",
        visualPrompt: "Overhead plating shot, dramatic low-key lighting, single candle in frame",
        likes: 612,
        comments: 38,
        shares: 44,
        postedAt: "2026-06-05",
      },
      {
        id: "sas-post-2",
        platform: "instagram",
        format: "post",
        caption: "The pass at 8pm on a Saturday. Controlled chaos, plated perfectly.",
        visualPrompt: "Wide shot of the open kitchen pass mid-service, motion blur on hands, focused chef expression",
        likes: 780,
        comments: 51,
        shares: 63,
        postedAt: "2026-06-13",
      },
      {
        id: "sas-post-3",
        platform: "facebook",
        format: "post",
        caption: "New summer tasting menu drops next week. Five courses, one story.",
        visualPrompt: "Flat-lay of the five-course tasting menu components, editorial food styling",
        likes: 340,
        comments: 19,
        shares: 27,
        postedAt: "2026-06-24",
      },
    ],
    reels: [
      {
        id: "sas-reel-1",
        platform: "instagram",
        format: "reel",
        caption: "From dock to plate: today's catch in under 60 seconds.",
        visualPrompt: "Fast-cut sourcing-to-service montage with upbeat sound",
        likes: 4900,
        comments: 142,
        shares: 510,
        postedAt: "2026-06-09",
      },
      {
        id: "sas-reel-2",
        platform: "tiktok",
        format: "reel",
        caption: "Watch our chef plate the dish that's been fully booked for two weeks straight.",
        visualPrompt: "Slow-motion plating close-up with satisfying ASMR-style audio",
        likes: 6200,
        comments: 201,
        shares: 890,
        postedAt: "2026-06-27",
      },
    ],
    contentCalendar: [
      { date: "2026-07-01", platform: "instagram", title: "Summer tasting menu reveal", status: "scheduled" },
      { date: "2026-07-04", platform: "instagram", title: "Holiday weekend reservation push", status: "scheduled" },
      { date: "2026-07-10", platform: "tiktok", title: "Behind the pass: Saturday service reel", status: "scheduled" },
      { date: "2026-07-17", platform: "facebook", title: "Guest spotlight: regular of the month", status: "in-review" },
      { date: "2026-07-25", platform: "instagram", title: "New dessert course teaser", status: "scheduled" },
    ],
    reports: [
      {
        period: "weekly",
        label: "Week of Jun 23–29, 2026",
        highlights: [
          "Plating reel became the account's highest-performing post ever (6,200 likes).",
          "Friday/Saturday reservations fully booked 9 days in advance for the first time.",
        ],
        metrics: [
          { label: "Reach", value: "112K", change: "+64%" },
          { label: "Engagement rate", value: "8.9%", change: "+2.1pt" },
          { label: "Reservation clicks", value: "410", change: "+58%" },
        ],
      },
      {
        period: "monthly",
        label: "June 2026",
        highlights: [
          "Social-driven reservations overtook walk-ins as the top booking source.",
          "Reel-first strategy tripled average reach versus static-post-only months.",
          "Weekend campaign ROAS held above 5x for the third consecutive month.",
        ],
        metrics: [
          { label: "Total reach", value: "398K", change: "+51%" },
          { label: "Followers", value: "22,400", change: "+3,100" },
          { label: "Reservations from social", value: "612", change: "+38%" },
        ],
      },
    ],
    analytics: {
      followers: "22,400",
      followerGrowth: "+34% (90 days)",
      engagementRate: "8.9%",
      reach: "398K / month",
      topPost: "Chef plating reel — 6,200 likes, 890 shares",
    },
    adPerformance: [
      {
        name: "Weekend Reservation Push",
        platform: "instagram",
        spend: "$860",
        impressions: "142,000",
        clicks: "3,900",
        ctr: "2.7%",
        conversions: "218 reservations",
        roas: "5.3x",
      },
      {
        name: "Tasting Menu Launch",
        platform: "facebook",
        spend: "$310",
        impressions: "38,500",
        clicks: "960",
        ctr: "2.5%",
        conversions: "74 reservations",
        roas: "4.6x",
      },
    ],
    aiInsights: [
      {
        id: "sas-insight-1",
        title: "Plating reels outperform every other format 4:1",
        detail:
          "Slow-motion plating close-ups consistently drive the highest reach and shares — prioritize this format in the weekly mix.",
        impact: "high",
      },
      {
        id: "sas-insight-2",
        title: "Thursday 5pm posting window maximizes weekend bookings",
        detail:
          "Content published Thursday afternoon captures the highest share of weekend reservation intent before the Friday rush.",
        impact: "high",
      },
      {
        id: "sas-insight-3",
        title: "Guest-spotlight content is an untapped retention lever",
        detail:
          "Early tests show regulars-featuring posts drive strong saves and repeat-visit signals — worth a dedicated monthly slot.",
        impact: "medium",
      },
    ],
    gallery: [
      { id: "sas-g1", caption: "Before: dim, inconsistent phone photos", kind: "before" },
      { id: "sas-g2", caption: "After: editorial-grade plating photography system", kind: "after" },
      { id: "sas-g3", caption: "Concept: summer tasting menu campaign", kind: "concept" },
    ],
    tags: ["restaurant", "hospitality", "food-and-beverage", "reservations"],
    featured: true,
    active: true,
  },
  {
    id: "lucent-studio",
    name: "Lucent Studio",
    slug: "lucent-studio",
    type: "demo",
    product: "xability",
    industry: "Fashion Brand",
    logoMark: "LS",
    colors: { primary: "#111827", secondary: "#f5f5f4", accent: "#e11d48" },
    coverVisual: "editorial-monochrome-studio-light",
    description:
      "An independent apparel label turning a small, loyal following into a scalable direct-to-consumer brand through editorial content and drops.",
    brandStory:
      "Lucent Studio started as a founder's personal Instagram. Growth stalled once demand outpaced what one person could photograph, write, and post. Xability layered on a repeatable drop-launch content system and paid strategy without losing the brand's distinct editorial voice.",
    transformationStage: {
      label: "Scaling drop-based growth",
      scorePercent: 88,
      description:
        "A repeatable launch playbook now drives predictable demand spikes, with paid and organic working in tandem for every drop.",
    },
    digitalTransformationScore: 88,
    servicesUsed: [
      "AI Content Strategy",
      "Social Publishing",
      "Drop Launch Campaigns",
      "Paid Ads Management",
      "Influencer Seeding Coordination",
      "Analytics & Reporting",
    ],
    socialPosts: [
      {
        id: "ls-post-1",
        platform: "instagram",
        format: "post",
        caption:
          "The Fall Capsule drops Friday at 10am. Six pieces, one silhouette language. Set your reminder.",
        visualPrompt: "High-contrast monochrome studio shot, single model, minimal set, strong shadow play",
        likes: 2140,
        comments: 96,
        shares: 188,
        postedAt: "2026-06-04",
      },
      {
        id: "ls-post-2",
        platform: "instagram",
        format: "post",
        caption: "Sold out in 40 minutes. Restock notifications are open — link in bio.",
        visualPrompt: "Close-up fabric texture and stitching detail shot, editorial styling",
        likes: 1780,
        comments: 143,
        shares: 92,
        postedAt: "2026-06-12",
      },
      {
        id: "ls-post-3",
        platform: "tiktok",
        format: "post",
        caption: "How we source the fabric for every Lucent piece — from mill to garment.",
        visualPrompt: "Documentary-style behind-the-scenes photo series, natural warehouse light",
        likes: 3020,
        comments: 118,
        shares: 240,
        postedAt: "2026-06-21",
      },
    ],
    reels: [
      {
        id: "ls-reel-1",
        platform: "instagram",
        format: "reel",
        caption: "The full Fall Capsule lookbook in 30 seconds.",
        visualPrompt: "Quick-cut lookbook reel, consistent monochrome grading, single studio backdrop",
        likes: 8900,
        comments: 310,
        shares: 1240,
        postedAt: "2026-06-05",
      },
      {
        id: "ls-reel-2",
        platform: "tiktok",
        format: "reel",
        caption: "Styling one piece three ways — how versatile can a single jacket really be?",
        visualPrompt: "Three quick outfit-change transitions, same model, same jacket, different styling",
        likes: 12400,
        comments: 402,
        shares: 2100,
        postedAt: "2026-06-19",
      },
    ],
    contentCalendar: [
      { date: "2026-07-02", platform: "instagram", title: "Restock teaser", status: "scheduled" },
      { date: "2026-07-04", platform: "tiktok", title: "Styling series part 4", status: "scheduled" },
      { date: "2026-07-11", platform: "instagram", title: "Winter capsule sneak peek", status: "in-review" },
      { date: "2026-07-18", platform: "instagram", title: "Founder Q&A story series", status: "scheduled" },
      { date: "2026-07-25", platform: "instagram", title: "Winter Capsule drop", status: "scheduled" },
    ],
    reports: [
      {
        period: "weekly",
        label: "Week of Jun 16–22, 2026",
        highlights: [
          "Styling-series reel became the brand's best performer to date (12.4K likes).",
          "Restock waitlist grew by 2,800 signups in a single week.",
        ],
        metrics: [
          { label: "Reach", value: "284K", change: "+72%" },
          { label: "Engagement rate", value: "9.6%", change: "+1.4pt" },
          { label: "Waitlist signups", value: "2,800", change: "+96%" },
        ],
      },
      {
        period: "monthly",
        label: "June 2026",
        highlights: [
          "Fall Capsule sold out in under an hour across two drops.",
          "Paid + organic drop strategy lifted revenue-per-drop by 64% year-over-year.",
          "Influencer seeding program contributed 18% of drop-day traffic.",
        ],
        metrics: [
          { label: "Total reach", value: "1.4M", change: "+58%" },
          { label: "Followers", value: "61,200", change: "+8,900" },
          { label: "Drop-day revenue", value: "$48,200", change: "+64%" },
        ],
      },
    ],
    analytics: {
      followers: "61,200",
      followerGrowth: "+17% (90 days)",
      engagementRate: "9.6%",
      reach: "1.4M / month",
      topPost: "Styling series reel — 12,400 likes, 2,100 shares",
    },
    adPerformance: [
      {
        name: "Fall Capsule Drop — Retargeting",
        platform: "instagram",
        spend: "$1,900",
        impressions: "610,000",
        clicks: "18,400",
        ctr: "3.0%",
        conversions: "1,120 orders",
        roas: "6.8x",
      },
      {
        name: "Waitlist Growth Campaign",
        platform: "tiktok",
        spend: "$740",
        impressions: "290,000",
        clicks: "9,100",
        ctr: "3.1%",
        conversions: "2,800 signups",
        roas: "n/a (list growth)",
      },
    ],
    aiInsights: [
      {
        id: "ls-insight-1",
        title: "\"One piece styled 3 ways\" is the brand's highest-converting reel format",
        detail:
          "This format consistently drives both reach and waitlist signups — it's now the standing template for every drop cycle.",
        impact: "high",
      },
      {
        id: "ls-insight-2",
        title: "Waitlist teasers 5 days before drop maximize sell-through",
        detail:
          "Drops preceded by a 5-day teaser sequence sell through 22% faster than drops announced same-day.",
        impact: "high",
      },
      {
        id: "ls-insight-3",
        title: "TikTok audience skews younger — adjust influencer seeding mix",
        detail:
          "TikTok engagement trends toward an 18–24 audience versus Instagram's 25–34 — seeding could be split more deliberately by platform.",
        impact: "medium",
      },
    ],
    gallery: [
      { id: "ls-g1", caption: "Before: inconsistent phone photography, no drop cadence", kind: "before" },
      { id: "ls-g2", caption: "After: consistent editorial monochrome identity", kind: "after" },
      { id: "ls-g3", caption: "Concept: Winter Capsule campaign direction", kind: "concept" },
    ],
    tags: ["fashion", "dtc", "ecommerce", "brand-building"],
    featured: true,
    active: true,
  },
  {
    id: "apex-motors",
    name: "Apex Motors",
    slug: "apex-motors",
    type: "demo",
    product: "xability",
    industry: "Car Dealer",
    logoMark: "AM",
    colors: { primary: "#1e293b", secondary: "#0f172a", accent: "#f97316" },
    coverVisual: "showroom-chrome-golden-hour",
    description:
      "A multi-brand dealership generating qualified test-drive leads through inventory-driven content and hyper-local paid campaigns.",
    brandStory:
      "Apex Motors relied almost entirely on lot traffic and classified listings. Xability built a content and paid system that treats every vehicle arrival as a content opportunity, driving qualified leads straight into the sales team's pipeline.",
    transformationStage: {
      label: "Lead-generation engine live",
      scorePercent: 58,
      description:
        "Inventory-driven content and local lead campaigns are now running consistently, with the sales team actively working social-sourced leads.",
    },
    digitalTransformationScore: 58,
    servicesUsed: [
      "AI Content Strategy",
      "Social Publishing",
      "Inventory-Driven Content Automation",
      "Local Lead-Gen Ads",
      "Analytics & Reporting",
    ],
    socialPosts: [
      {
        id: "am-post-1",
        platform: "facebook",
        format: "post",
        caption:
          "Just arrived: 2024 certified pre-owned SUV, one owner, full service history. Message us for a same-day test drive.",
        visualPrompt: "Clean showroom photo of the vehicle, golden hour lighting through showroom glass",
        likes: 88,
        comments: 14,
        shares: 21,
        postedAt: "2026-06-07",
      },
      {
        id: "am-post-2",
        platform: "instagram",
        format: "post",
        caption: "Detail shot Friday: the stitching on this interior is a whole mood.",
        visualPrompt: "Macro shot of leather seat stitching, warm interior lighting",
        likes: 145,
        comments: 8,
        shares: 6,
        postedAt: "2026-06-14",
      },
      {
        id: "am-post-3",
        platform: "facebook",
        format: "post",
        caption: "Trade-in event this weekend — get a real appraisal in 15 minutes, no appointment needed.",
        visualPrompt: "Wide showroom lot shot, clear signage, inviting daylight",
        likes: 102,
        comments: 19,
        shares: 34,
        postedAt: "2026-06-22",
      },
    ],
    reels: [
      {
        id: "am-reel-1",
        platform: "instagram",
        format: "reel",
        caption: "Full walkaround of this week's featured trade-in — every angle, no surprises.",
        visualPrompt: "Smooth 360-degree walkaround video, showroom floor, clean audio narration",
        likes: 640,
        comments: 22,
        shares: 58,
        postedAt: "2026-06-10",
      },
      {
        id: "am-reel-2",
        platform: "tiktok",
        format: "reel",
        caption: "3 questions to ask before you buy a used SUV — from our own service manager.",
        visualPrompt: "Talking-head explainer with on-screen text callouts, service bay in background",
        likes: 1980,
        comments: 74,
        shares: 260,
        postedAt: "2026-06-25",
      },
    ],
    contentCalendar: [
      { date: "2026-07-01", platform: "facebook", title: "New arrival: certified sedan", status: "scheduled" },
      { date: "2026-07-05", platform: "instagram", title: "Independence Day showroom hours", status: "scheduled" },
      { date: "2026-07-09", platform: "tiktok", title: "Financing myths, debunked", status: "in-review" },
      { date: "2026-07-16", platform: "facebook", title: "Trade-in appraisal event", status: "scheduled" },
    ],
    reports: [
      {
        period: "weekly",
        label: "Week of Jun 23–29, 2026",
        highlights: [
          "Service-manager explainer reel drove the week's highest lead-form completion rate.",
          "Trade-in event post generated 34 direct messages.",
        ],
        metrics: [
          { label: "Reach", value: "14.2K", change: "+9%" },
          { label: "Engagement rate", value: "2.8%", change: "+0.3pt" },
          { label: "Leads generated", value: "27", change: "+6" },
        ],
      },
      {
        period: "monthly",
        label: "June 2026",
        highlights: [
          "Inventory-driven posting cut time-to-first-content per vehicle from 3 days to same-day.",
          "Local lead-gen campaign cost-per-lead down 19% versus classifieds spend.",
        ],
        metrics: [
          { label: "Total reach", value: "58.9K", change: "+16%" },
          { label: "Followers", value: "3,120", change: "+310" },
          { label: "Qualified leads", value: "112", change: "+24%" },
        ],
      },
    ],
    analytics: {
      followers: "3,120",
      followerGrowth: "+11% (90 days)",
      engagementRate: "2.8%",
      reach: "58.9K / month",
      topPost: "Trade-in event post — 102 likes, 34 shares",
    },
    adPerformance: [
      {
        name: "Local Lead-Gen — 25mi radius",
        platform: "facebook",
        spend: "$540",
        impressions: "71,000",
        clicks: "1,340",
        ctr: "1.9%",
        conversions: "58 test-drive leads",
        roas: "n/a (service business)",
      },
    ],
    aiInsights: [
      {
        id: "am-insight-1",
        title: "Full-walkaround reels outperform static listing photos 2.4x",
        detail:
          "Vehicles posted with a walkaround reel generate meaningfully more inbound messages than the same vehicle posted as a static photo set.",
        impact: "high",
      },
      {
        id: "am-insight-2",
        title: "Trust-building explainer content lowers lead-form drop-off",
        detail:
          "Posts answering a specific buyer concern (financing, trade-in value) convert to lead-form completions at a higher rate than inventory-only posts.",
        impact: "medium",
      },
      {
        id: "am-insight-3",
        title: "Same-day posting on arrival captures peak search intent",
        detail:
          "Vehicles posted within hours of arriving on the lot get disproportionately more engagement than those posted after a multi-day delay.",
        impact: "medium",
      },
    ],
    gallery: [
      { id: "am-g1", caption: "Before: classifieds-only, no social presence", kind: "before" },
      { id: "am-g2", caption: "After: consistent inventory content system", kind: "after" },
      { id: "am-g3", caption: "Concept: trade-in event campaign", kind: "concept" },
    ],
    tags: ["automotive", "local-business", "lead-generation"],
    featured: false,
    active: true,
  },
];

export function getActiveBrands() {
  return BRANDS.filter((brand) => brand.active);
}

export function getBrandsByProduct(product: string) {
  return getActiveBrands().filter((brand) => brand.product === product);
}

export function getFeaturedBrands() {
  return getActiveBrands().filter((brand) => brand.featured);
}

export function getBrandBySlug(product: string, slug: string) {
  return BRANDS.find(
    (brand) => brand.active && brand.product === product && brand.slug === slug,
  );
}
