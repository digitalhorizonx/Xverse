import type { ProductShowcase } from "./types";

// Showcase content for every HorizonX product. All copy, demos, and sample
// businesses in /showcase/* render from here — see types.ts for the shape.
// Sample businesses are fictional but realistic, and every showcase is
// explicit that they are demonstrations.

export const SHOWCASES: ProductShowcase[] = [
  // --------------------------------------------------------------- Xability
  {
    productId: "xability",
    slug: "xability",
    heroTagline: "Everything a social media client receives — live",
    heroDescription:
      "Xability runs a brand's entire social presence: strategy, content, publishing, ads, and reporting. This showcase is the actual client experience — feeds, calendars, approvals, AI workflows, analytics, and the customer portal — populated with demo brands.",
    stats: [
      { label: "Posts shipped / month", value: "60+" },
      { label: "Avg. engagement lift", value: "3.2×" },
      { label: "Reporting cadence", value: "Weekly" },
      { label: "Approval turnaround", value: "< 24h" },
    ],
    capabilities: [
      { icon: "palette", title: "Brand system", description: "Logo, palette, and typography applied consistently across every post and platform." },
      { icon: "feed", title: "Social feeds", description: "Instagram grids, Facebook pages, reels, and stories — planned, produced, and published." },
      { icon: "calendar", title: "Content calendar", description: "Weekly and monthly plans with a publishing workflow and client approvals." },
      { icon: "sparkles", title: "AI workflow", description: "Captions, visuals, reels concepts, ideas, and reports generated and refined by AI." },
      { icon: "chart", title: "Analytics", description: "Reach, clicks, engagement, growth, and follower performance in live dashboards." },
      { icon: "portal", title: "Customer portal", description: "Request, approve, reject, edit, publish — with history, credits, and usage." },
    ],
    sections: [
      { id: "worlds", label: "Demo Brands" },
      { id: "portal", label: "Customer Portal" },
      { id: "capabilities", label: "What You Get" },
      { id: "cta", label: "Start" },
    ],
    sampleBusinesses: [
      { id: "coffee", name: "Amber & Oak Coffee Co.", industry: "Coffee Shop", logoMark: "AO", color: "#c46a35", accent: "#ffd9a0", summary: "Neighborhood roastery turned regional brand.", highlights: ["Full brand world", "Instagram-first strategy", "Weekly reporting"] },
      { id: "clinic", name: "Clarity Family Clinic", industry: "Medical Clinic", logoMark: "CF", color: "#20b8a4", accent: "#7fe4d6", summary: "Patient education content that builds trust.", highlights: ["Approval workflow", "Compliance-aware copy", "Local reach growth"] },
      { id: "restaurant", name: "Sable & Salt", industry: "Restaurant", logoMark: "SS", color: "#f96a4d", accent: "#ff8b73", summary: "Chef-led dining room with a waitlist.", highlights: ["Reels production", "Seasonal campaigns", "Booking funnel"] },
    ],
  },

  // ------------------------------------------------------------------ XSites
  {
    productId: "xsite",
    slug: "xsite",
    heroTagline: "AI-built websites that convert",
    heroDescription:
      "XSites designs, builds, and optimizes production websites — business sites, landing pages, corporate sites, and e-commerce — with SEO, lead generation, CMS, forms, analytics, hosting, and deployment handled end to end. Explore live template previews below.",
    stats: [
      { label: "Launch time", value: "Days, not months" },
      { label: "Lighthouse target", value: "95+" },
      { label: "Responsive", value: "Every breakpoint" },
      { label: "Hosting & SSL", value: "Included" },
    ],
    capabilities: [
      { icon: "layout", title: "Business & corporate sites", description: "Multi-page sites with CMS-managed content and on-brand design systems." },
      { icon: "target", title: "Landing pages", description: "Conversion-tuned pages with forms, lead capture, and A/B-ready sections." },
      { icon: "cart", title: "E-commerce", description: "Product catalogs, carts, and checkout flows built for speed." },
      { icon: "search", title: "SEO & analytics", description: "Technical SEO, structured data, and analytics wired in from day one." },
      { icon: "moon", title: "Dark mode & theming", description: "Light/dark themes from a single token system — try the toggle below." },
      { icon: "rocket", title: "Hosting & deployment", description: "CI/CD deployment, SSL, CDN, and monitoring — fully managed." },
    ],
    sections: [
      { id: "templates", label: "Live Previews" },
      { id: "examples", label: "Example Businesses" },
      { id: "capabilities", label: "What You Get" },
      { id: "cta", label: "Start" },
    ],
    sampleBusinesses: [
      { id: "realestate", name: "Northgate Realty", industry: "Real Estate", logoMark: "NR", color: "#fb9645", accent: "#ffd9a0", summary: "Property listings with search, map, and lead forms.", highlights: ["Listing CMS", "Lead-gen forms", "Local SEO"] },
      { id: "construction", name: "Atlas Build Group", industry: "Construction", logoMark: "AB", color: "#38bdf8", accent: "#bae6fd", summary: "Corporate site with project portfolio and RFP intake.", highlights: ["Project galleries", "RFP pipeline", "Careers pages"] },
      { id: "fashion", name: "Lucent Studio", industry: "Fashion Brand", logoMark: "LS", color: "#8b5cf6", accent: "#c4b5fd", summary: "E-commerce storefront with lookbooks and drops.", highlights: ["Storefront", "Drop campaigns", "Email capture"] },
    ],
    siteTemplates: [
      {
        id: "realty",
        businessName: "Northgate Realty",
        industry: "Real Estate",
        kind: "business",
        navLabels: ["Buy", "Sell", "Agents", "Insights", "Contact"],
        heroTitle: "Find the home that finds you back",
        heroSubtitle: "1,200+ curated listings across the metro — with agents who answer.",
        heroCta: "Browse listings",
        palette: { primary: "#fb9645", surface: "#12100c", accent: "#ffd9a0" },
        sections: ["Featured listings", "Neighborhood guides", "Agent directory", "Lead form"],
        features: ["Listing search + filters", "Map integration", "Lead capture", "Blog CMS"],
      },
      {
        id: "atlas",
        businessName: "Atlas Build Group",
        industry: "Construction",
        kind: "corporate",
        navLabels: ["Projects", "Services", "Safety", "About", "RFP"],
        heroTitle: "We build the skyline you commute past",
        heroSubtitle: "Commercial construction with a 98% on-schedule delivery record.",
        heroCta: "Submit an RFP",
        palette: { primary: "#38bdf8", surface: "#0a1016", accent: "#bae6fd" },
        sections: ["Project portfolio", "Capabilities", "Safety record", "RFP intake"],
        features: ["Portfolio CMS", "RFP pipeline", "Careers board", "Multi-language"],
      },
      {
        id: "lucent",
        businessName: "Lucent Studio",
        industry: "Fashion",
        kind: "ecommerce",
        navLabels: ["Shop", "Lookbook", "Drops", "Journal", "Cart"],
        heroTitle: "Drop 07 — Silhouettes in motion",
        heroSubtitle: "Limited run. Ships worldwide. Gone by Sunday.",
        heroCta: "Shop the drop",
        palette: { primary: "#8b5cf6", surface: "#0e0a16", accent: "#c4b5fd" },
        sections: ["Product grid", "Lookbook", "Drop countdown", "Checkout"],
        features: ["Cart & checkout", "Inventory sync", "Drop countdowns", "Email capture"],
      },
    ],
  },

  // ------------------------------------------------------------------ XApps
  {
    productId: "xapp",
    slug: "xapps",
    heroTagline: "Customer and business apps, shipped to the stores",
    heroDescription:
      "XApps designs and ships mobile and web apps — booking, ordering, healthcare, automotive — with push notifications, offline mode, PWA + native feel, and App Store / Google Play deployment. Tap through the live app demos below.",
    stats: [
      { label: "Platforms", value: "iOS · Android · PWA" },
      { label: "Store deployment", value: "Handled" },
      { label: "Push & offline", value: "Built in" },
      { label: "Idea → app", value: "Weeks" },
    ],
    capabilities: [
      { icon: "phone", title: "Customer apps", description: "Booking, ordering, and loyalty experiences your customers keep on their home screen." },
      { icon: "briefcase", title: "Business apps", description: "Internal tools, dashboards, and field apps that run your operations." },
      { icon: "bell", title: "Push notifications", description: "Behavior-driven messaging — try the demo notification below." },
      { icon: "wifi", title: "Offline mode", description: "Apps that keep working when the network doesn't." },
      { icon: "store", title: "Store deployment", description: "App Store and Google Play submission, review, and release management." },
      { icon: "zap", title: "Native feel", description: "PWA reach with native-quality interactions and performance." },
    ],
    sections: [
      { id: "apps", label: "Live App Demos" },
      { id: "examples", label: "Example Businesses" },
      { id: "capabilities", label: "What You Get" },
      { id: "cta", label: "Start" },
    ],
    sampleBusinesses: [
      { id: "dental", name: "BrightSmile Dental", industry: "Dental Clinic", logoMark: "BS", color: "#20b8a4", accent: "#7fe4d6", summary: "Patient booking app with reminders and records.", highlights: ["Appointment booking", "Visit reminders", "Treatment history"] },
      { id: "food", name: "Ember Kitchen", industry: "Restaurant", logoMark: "EK", color: "#f96a4d", accent: "#ff8b73", summary: "Food ordering with live prep tracking.", highlights: ["Menu & ordering", "Order tracking", "Loyalty points"] },
      { id: "garage", name: "TorqueWorks", industry: "Automotive Service", logoMark: "TW", color: "#38bdf8", accent: "#bae6fd", summary: "Service booking and vehicle health app.", highlights: ["Service booking", "Pickup scheduling", "Service history"] },
    ],
    appDemos: [
      {
        id: "dental",
        businessName: "BrightSmile Dental",
        category: "Healthcare · Booking",
        color: "#20b8a4",
        pushNotification: { title: "BrightSmile Dental", body: "Reminder: cleaning with Dr. Hana tomorrow at 10:30." },
        screens: [
          { id: "home", label: "Home", title: "Good morning, Maya", items: [
            { icon: "calendar", primary: "Next appointment", secondary: "Cleaning · Dr. Hana", trailing: "Tue 10:30" },
            { icon: "sparkles", primary: "Whitening offer", secondary: "20% off this month" },
            { icon: "file", primary: "Last visit summary", secondary: "X-ray + checkup" },
          ], cta: "Book appointment" },
          { id: "book", label: "Book", title: "Choose a slot", items: [
            { icon: "clock", primary: "Tue 10:30", secondary: "Dr. Hana", trailing: "Open" },
            { icon: "clock", primary: "Tue 14:00", secondary: "Dr. Omar", trailing: "Open" },
            { icon: "clock", primary: "Wed 09:15", secondary: "Dr. Hana", trailing: "Waitlist" },
          ], cta: "Confirm booking" },
          { id: "records", label: "Records", title: "Treatment history", items: [
            { icon: "check", primary: "Cleaning", secondary: "March 12", trailing: "Done" },
            { icon: "check", primary: "Filling — lower molar", secondary: "Jan 28", trailing: "Done" },
            { icon: "file", primary: "Panoramic X-ray", secondary: "Jan 28", trailing: "View" },
          ] },
        ],
      },
      {
        id: "food",
        businessName: "Ember Kitchen",
        category: "Food Ordering",
        color: "#f96a4d",
        pushNotification: { title: "Ember Kitchen", body: "Your order is out for delivery — 12 minutes away 🔥" },
        screens: [
          { id: "menu", label: "Menu", title: "Tonight's menu", items: [
            { icon: "flame", primary: "Charred short rib", secondary: "48h braise, ember glaze", trailing: "$24" },
            { icon: "flame", primary: "Smoked cauliflower", secondary: "Almond cream, chili oil", trailing: "$16" },
            { icon: "flame", primary: "Sourdough + bone butter", secondary: "House ferment", trailing: "$8" },
          ], cta: "Add to order" },
          { id: "track", label: "Track", title: "Order #1148", items: [
            { icon: "check", primary: "Confirmed", secondary: "7:42 PM", trailing: "✓" },
            { icon: "check", primary: "In the kitchen", secondary: "7:44 PM", trailing: "✓" },
            { icon: "clock", primary: "Out for delivery", secondary: "ETA 12 min", trailing: "…" },
          ] },
          { id: "loyalty", label: "Rewards", title: "Ember Club", items: [
            { icon: "star", primary: "740 points", secondary: "Free dessert at 800" },
            { icon: "gift", primary: "Birthday reward", secondary: "Unlocks next month" },
          ], cta: "Redeem points" },
        ],
      },
      {
        id: "garage",
        businessName: "TorqueWorks",
        category: "Automotive · Service",
        color: "#38bdf8",
        pushNotification: { title: "TorqueWorks", body: "Your car is ready for pickup. Invoice: $184.00." },
        screens: [
          { id: "car", label: "My Car", title: "Audi A4 · 2021", items: [
            { icon: "gauge", primary: "Health score", secondary: "Based on last inspection", trailing: "92%" },
            { icon: "droplet", primary: "Oil life", secondary: "Change due in ~2,400 km", trailing: "38%" },
            { icon: "disc", primary: "Brake pads", secondary: "Front pair", trailing: "OK" },
          ], cta: "Book service" },
          { id: "service", label: "Service", title: "Book a service", items: [
            { icon: "wrench", primary: "Full service", secondary: "Oil, filters, inspection", trailing: "$149" },
            { icon: "disc", primary: "Brake check", secondary: "Pads + discs + fluid", trailing: "$59" },
            { icon: "battery", primary: "Battery test", secondary: "Load + terminals", trailing: "Free" },
          ], cta: "Choose time" },
          { id: "history", label: "History", title: "Service history", items: [
            { icon: "check", primary: "Full service", secondary: "May 03 · 41,200 km", trailing: "$162" },
            { icon: "check", primary: "Tire rotation", secondary: "Feb 11 · 38,900 km", trailing: "$40" },
          ] },
        ],
      },
    ],
  },

  // ------------------------------------------------------------------ XAuto
  {
    productId: "xauto",
    slug: "xauto",
    heroTagline: "The operating system for automotive businesses",
    heroDescription:
      "XAuto runs marketplaces, dealerships, and service centers: vehicle listings, maintenance, appointments, insurance, inspection, parts, and service history — with dashboards for both the dealer and the customer. Explore the live marketplace demo.",
    stats: [
      { label: "Listing → sale", value: "Tracked end-to-end" },
      { label: "Service bays", value: "Scheduled automatically" },
      { label: "Dashboards", value: "Dealer + customer" },
      { label: "Inspections", value: "Digital reports" },
    ],
    capabilities: [
      { icon: "car", title: "Vehicle marketplace", description: "Listings with search, reservation, and inspection status." },
      { icon: "wrench", title: "Maintenance & services", description: "Service catalog, bay scheduling, and parts availability." },
      { icon: "calendar", title: "Appointments", description: "Customers book; the workshop calendar fills itself." },
      { icon: "shield", title: "Insurance & inspection", description: "Digital inspection reports and insurance handoff." },
      { icon: "history", title: "Service history", description: "Every vehicle's full record, owner-visible and dealer-verified." },
      { icon: "gauge", title: "Dual dashboards", description: "One operational view for dealers, one clean view for customers." },
    ],
    sections: [
      { id: "marketplace", label: "Marketplace Demo" },
      { id: "dashboards", label: "Dashboards" },
      { id: "examples", label: "Example Businesses" },
      { id: "capabilities", label: "What You Get" },
      { id: "cta", label: "Start" },
    ],
    sampleBusinesses: [
      { id: "dealer", name: "Meridian Motors", industry: "Car Dealership", logoMark: "MM", color: "#38bdf8", accent: "#bae6fd", summary: "Multi-brand dealer with service center.", highlights: ["Marketplace", "Service bays", "Trade-in flow"] },
      { id: "insurance", name: "Keystone Assurance", industry: "Insurance", logoMark: "KA", color: "#8b5cf6", accent: "#c4b5fd", summary: "Policy quotes wired into vehicle purchase.", highlights: ["Instant quotes", "Claims intake", "Inspection sync"] },
    ],
    vehicles: [
      { id: "v1", name: "BMW 330i M Sport", year: 2022, price: "$38,900", mileage: "24,300 km", status: "available", color: "#38bdf8" },
      { id: "v2", name: "Audi Q5 Quattro", year: 2021, price: "$41,200", mileage: "36,750 km", status: "reserved", color: "#8b5cf6" },
      { id: "v3", name: "Toyota Land Cruiser", year: 2020, price: "$54,000", mileage: "61,400 km", status: "available", color: "#f96a4d" },
      { id: "v4", name: "Mercedes C200 AMG Line", year: 2023, price: "$46,500", mileage: "12,100 km", status: "in-inspection", color: "#20b8a4" },
    ],
    autoServices: [
      { icon: "wrench", name: "Full service", description: "Oil, filters, fluids, and a 40-point inspection." },
      { icon: "shield", name: "Pre-purchase inspection", description: "Digital report with photos before you buy." },
      { icon: "disc", name: "Brakes & tires", description: "Pads, discs, alignment, and seasonal changeover." },
      { icon: "file", name: "Insurance & registration", description: "Quotes, paperwork, and renewals handled in-app." },
    ],
  },

  // ------------------------------------------------------------- AI Platform
  {
    productId: "xai",
    slug: "ai",
    heroTagline: "AI agents wired into your operations",
    heroDescription:
      "The HorizonX AI Platform embeds agents and automations inside a business: chatbots and voice, CRM and sales automation, marketing and customer-success workflows, internal AI, and reporting. Watch the agent conversation and trace a workflow below.",
    stats: [
      { label: "First response", value: "Instant, 24/7" },
      { label: "Workflows", value: "Trigger → outcome" },
      { label: "Channels", value: "Chat · Voice · Email" },
      { label: "Handoffs", value: "Human when it matters" },
    ],
    capabilities: [
      { icon: "bot", title: "AI agents & chatbots", description: "Customer-facing agents that resolve, route, and escalate correctly." },
      { icon: "mic", title: "Voice", description: "Phone agents that book, confirm, and answer with your policies." },
      { icon: "funnel", title: "Sales & CRM automation", description: "Leads scored, followed up, and moved through the pipeline automatically." },
      { icon: "megaphone", title: "Marketing automation", description: "Campaign triggers, audience syncs, and content pipelines." },
      { icon: "heart", title: "Customer success", description: "Onboarding sequences, health scores, and churn-risk alerts." },
      { icon: "brain", title: "Internal AI & reports", description: "Company knowledge, internal copilots, and automated reporting." },
    ],
    sections: [
      { id: "agent", label: "Agent Demo" },
      { id: "workflows", label: "Workflows" },
      { id: "examples", label: "Example Businesses" },
      { id: "capabilities", label: "What You Get" },
      { id: "cta", label: "Start" },
    ],
    sampleBusinesses: [
      { id: "insurance", name: "Keystone Assurance", industry: "Insurance", logoMark: "KA", color: "#8b5cf6", accent: "#c4b5fd", summary: "Claims intake agent + policy-renewal automation.", highlights: ["Claims chatbot", "Renewal workflows", "Agent handoff"] },
      { id: "production", name: "Northlight Productions", industry: "Production Company", logoMark: "NP", color: "#f96a4d", accent: "#ff8b73", summary: "Booking agent and project-status automations.", highlights: ["Inquiry triage", "Quote drafts", "Status updates"] },
      { id: "clinic", name: "Clarity Family Clinic", industry: "Medical Clinic", logoMark: "CF", color: "#20b8a4", accent: "#7fe4d6", summary: "Reception agent for scheduling and FAQs.", highlights: ["Appointment agent", "Reminder flows", "After-hours cover"] },
    ],
    aiAgents: [
      { name: "Reception Agent", role: "Front desk", description: "Answers, books, reschedules, and routes — around the clock." },
      { name: "Sales Agent", role: "Pipeline", description: "Qualifies leads, drafts follow-ups, and updates the CRM." },
      { name: "Success Agent", role: "Retention", description: "Monitors health scores and triggers save plays before churn." },
    ],
    chatScript: [
      { from: "customer", text: "Hi — my windshield got cracked this morning. What do I do?" },
      { from: "agent", text: "Sorry to hear that! I can open a glass claim for you right now. Is the car drivable, and do you have a photo of the damage?" },
      { from: "customer", text: "Drivable, yes. Uploading a photo now." },
      { from: "agent", text: "Got it — claim #GA-2214 opened. You're covered for same-day replacement. I found a slot today at 15:30 at AutoGlass Central. Book it?" },
      { from: "customer", text: "Yes please." },
      { from: "agent", text: "Booked ✓ You'll get a confirmation and a reminder an hour before. Anything else?" },
    ],
    aiWorkflows: [
      {
        id: "claims",
        name: "Claims intake",
        trigger: "Customer reports damage in chat",
        steps: ["Classify claim type", "Verify policy coverage", "Open claim in CRM", "Schedule repair slot", "Send confirmation"],
        outcome: "Claim opened + repair booked in under 2 minutes",
      },
      {
        id: "lead",
        name: "Lead follow-up",
        trigger: "New inquiry from website form",
        steps: ["Score the lead", "Draft personalized reply", "Book discovery call", "Create CRM record", "Notify sales owner"],
        outcome: "Every lead answered within 60 seconds",
      },
      {
        id: "renewal",
        name: "Policy renewal",
        trigger: "Policy expires in 30 days",
        steps: ["Generate renewal quote", "Send renewal sequence", "Answer questions via agent", "Escalate edge cases", "Confirm renewal"],
        outcome: "Renewals handled without manual chasing",
      },
    ],
  },
];

export function getShowcaseBySlug(slug: string) {
  return SHOWCASES.find((showcase) => showcase.slug === slug);
}

export function getShowcaseByProductId(productId: string) {
  return SHOWCASES.find((showcase) => showcase.productId === productId);
}
