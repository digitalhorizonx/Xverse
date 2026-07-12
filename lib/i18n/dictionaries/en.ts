// English dictionary — the source-of-truth shape for every UI string in
// Xverse. The Arabic dictionary must provide every key defined here (the
// Dictionary type in ../types.ts is derived from this object), plus
// optional `products` / `showcases` content overrides for data that is
// authored in English inside data/*.ts.

export const en = {
  meta: {
    title: "Xverse — The HorizonX Digital Universe",
    template: "%s | Xverse by HorizonX",
    description:
      "Xverse is the HorizonX Digital Universe — explore immersive demo brands, dashboards, and digital transformation journeys across the entire HorizonX product ecosystem.",
    ogDescription:
      "Enter the HorizonX Digital Universe — explore demo brands, dashboards, and digital transformation journeys across the HorizonX ecosystem.",
    showcaseIndexTitle: "Showcase — every HorizonX product, demonstrated",
    showcaseIndexDescription:
      "The HorizonX showroom: complete interactive demonstrations of Xability, XSites, XApps, XAuto, and the AI Platform.",
    showcaseTitle: "{product} Showcase — {tagline}",
  },

  common: {
    skipToContent: "Skip to content",
    live: "Live",
    comingSoon: "Coming Soon",
    preview: "Preview",
    comingSoonPreview: "Coming Soon — Preview",
    demoBusiness: "Demo Business",
    demoDisclaimer: "Demo Brand · Sample Experience · Illustrative Analytics",
    demoDataNote:
      "All businesses, metrics, and results shown are illustrative demo content — not verified client outcomes.",
    returnToUniverse: "Return to Universe",
    enterShowcase: "Enter showcase",
    soon: "soon",
  },

  header: {
    byHorizonX: "by HorizonX",
    home: "Xverse home",
    productNav: "Product showcases",
    showcases: "Showcases",
    switchToLight: "Switch to light mode",
    switchToDark: "Switch to dark mode",
    otherLanguage: "العربية",
    switchLanguage: "التبديل إلى العربية",
  },

  cta: {
    bookDemo: "Book a demo",
    talkToSales: "Talk to sales",
    startWithXability: "Start with Xability",
    launchTitlePre: "Launch this for",
    launchTitleHighlight: "your business",
    launchBody:
      "Everything in this showcase is what HorizonX delivers. Bring {product} to your brand — or talk it through with us first.",
    exploreAnother: "Explore another product",
  },

  home: {
    badge: "HorizonX Digital Universe",
    titlePre: "Enter the",
    titleHighlight: "HorizonX Universe",
    description:
      "One digital universe. Every HorizonX product, showcased as a living world — demo brands, dashboards, and the full digital transformation journey, explorable in 3D.",
    descriptionShort:
      "Every HorizonX product, showcased as a living world you can explore in 3D.",
    exploreShowcases: "Explore the showcases",
    hintTap: "Tap a planet to explore",
    hintClickDrag: "Click a planet to explore · Drag to look around",
    hintScroll: "Scroll to travel",
    entering: "Entering the Xverse",
    universeLabel: "Interactive 3D universe of HorizonX products",
    constellationEyebrow: "The Constellation",
    constellationTitle: "One universe. Five products.",
    constellationBody:
      "Each world in the universe is a HorizonX product — one live today, four entering orbit soon.",
    finalTitlePre: "Ready to",
    finalTitleHighlight: "enter the universe?",
    finalBody:
      "Start with Xability — the live world — or wander the demo brands to see the full transformation journey in action.",
    exploreAllShowcases: "Explore all showcases",
    fallbackNote:
      "The interactive 3D universe is simplified on this device. Explore each product below.",
  },

  hud: {
    core: "HorizonX Core",
    inOrbit: "In orbit · HorizonX Core",
    approaching: "Approaching · {name}",
    warpJump: "Warp jump · {name}",
    entering: "Entering the Xverse",
    location: "Current location",
  },

  loading: {
    universe: "Charting the universe…",
    page: "Loading the universe…",
  },

  errors: {
    notFoundEyebrow: "Lost in space",
    notFoundTitle: "This world doesn't exist — yet.",
    notFoundBody:
      "The coordinates you followed don't map to anywhere in the HorizonX Universe. Head back to the Core and pick a new destination.",
    errorEyebrow: "Signal lost",
    errorTitle: "Something broke orbit.",
    errorBody:
      "An unexpected error interrupted this transmission. You can try re-establishing the connection.",
    tryAgain: "Try again",
  },

  breadcrumbs: {
    ariaLabel: "Breadcrumb",
    universe: "Universe",
    showcase: "Showcase",
  },

  sectionNav: {
    ariaLabel: "Showcase sections",
  },

  showcaseIndex: {
    eyebrow: "The HorizonX Showroom",
    title: "Every product, fully demonstrated",
    body: "Not brochures — working demonstrations. Enter any product to explore what its customers actually receive.",
    searchLabel: "Search products",
    searchPlaceholder: "Search products, industries, capabilities…",
    industryLabel: "Filter by industry",
    allIndustries: "All industries",
    noResults: "No products match your search.",
    clearFilters: "Clear search & filters",
    returnCardTitle: "Return to Universe",
    returnCardBody: "Fly the 3D constellation instead.",
  },

  showcase: {
    whatYouGet: "What You Get",
    capabilitiesTitle: "Everything {product} delivers",
    examplesEyebrow: "Example Businesses",
    examplesTitle: "How real businesses use it",
    examplesBody:
      "Fictional demo businesses, realistic transformations — this is the shape of what we deliver.",
    backToShowcase: "Back to the {product} showcase",
  },

  // Brand-world chrome (the deep Xability demo worlds under /[product]/[brand]).
  brandWorlds: {
    sampleWorlds: "Sample Worlds",
    exploreWorlds: "Explore {product} demo worlds in 3D",
    searchPlaceholder: "Search {product} demo brands…",
    searchLabel: "Search demo brands",
    industryFilter: "Industry filter",
    allIndustries: "All industries",
    noResults: "No demo brands match your search.",
    noResultsHint: "Try a different term or clear the industry filter.",
    demoBadge: "Demo Brand · Sample Experience",
    demoShort: "Demo",
    transformationScore: "Transformation score",
    conceptNote: "{brand} is a concept business — not a real {product} client",
    couldBuild: "This is what {product} could build for your business.",
    readyBody: "Ready to start your own digital transformation journey?",
    demoBrandMeta: "{brand} — Demo Brand",
  },

  // Per-showcase section headings (the SectionHeading blocks around demos).
  sections: {
    xability: {
      portal: {
        eyebrow: "Customer Portal",
        title: "Run your brand from one portal",
        description:
          "Try it: submit a request, approve or reject it, publish — and watch history and credits update live.",
      },
    },
    xsite: {
      templates: {
        eyebrow: "Live Previews",
        title: "Real templates, live in the browser",
        description:
          "Switch businesses, flip dark mode, and preview mobile — the theming and responsiveness you get, demonstrated.",
      },
    },
    xapps: {
      apps: {
        eyebrow: "Live App Demos",
        title: "Tap through the apps we ship",
        description:
          "Three demo businesses, one phone. Switch screens, fire a push notification, and pull the network plug.",
      },
    },
    xauto: {
      marketplace: {
        eyebrow: "Marketplace Demo",
        title: "Meridian Motors, running on XAuto",
        description:
          "Filter live listings and book a service bay — the marketplace and workshop working together.",
      },
      dashboards: {
        eyebrow: "Dashboards",
        title: "One system, two dashboards",
        description: "",
      },
    },
    ai: {
      agent: {
        eyebrow: "Agent Demo",
        title: "Watch an agent resolve a claim",
        description:
          "A real conversation pattern: intake, verification, action, confirmation — played live.",
      },
      workflows: {
        eyebrow: "Workflows",
        title: "Trigger → steps → outcome",
        description:
          "Pick a workflow and run it — every step lights up as the automation executes.",
      },
    },
  },

  demos: {
    portal: {
      heading: "Content requests",
      credits: "{count} credits",
      newRequest: "New request",
      approve: "Approve",
      reject: "Reject",
      publish: "Publish",
      requestEdits: "Request edits",
      revise: "Revise & resubmit",
      history: "History",
      usageHeading: "This month's usage",
      usageLine: "{used} of {total} monthly content credits used.",
      statusInReview: "In review",
      statusApproved: "Approved",
      statusRejected: "Rejected",
      statusPublished: "Published",
      logSubmitted: "New request submitted: “{title}” (−1 credit)",
      logApproved: "“{title}” approved",
      logRejected: "“{title}” rejected — the team will revise",
      logPublished: "“{title}” published to all channels",
      logSentBack: "“{title}” sent back for edits",
      justNow: "just now",
      seedHistory1: "“Post — weekend brunch launch” published to Instagram + Facebook",
      seedHistory1Time: "2d ago",
      seedHistory2: "“Reel — latte art in 15 seconds” approved by you",
      seedHistory2Time: "1d ago",
      seedRequest1: "Post — weekend brunch launch",
      seedRequest2: "Reel — latte art in 15 seconds",
      ideas: [
        { title: "Reel — new seasonal menu", kind: "Reel" },
        { title: "Story — behind the counter", kind: "Story" },
        { title: "Post — customer spotlight", kind: "Post" },
        { title: "Carousel — before & after", kind: "Carousel" },
      ],
      kindPost: "Post",
      kindReel: "Reel",
    },
    xsite: {
      templatesAria: "Website templates",
      lightMode: "Light mode",
      darkMode: "Dark mode",
      desktop: "Desktop",
      mobile: "Mobile",
      cmsNote: "Fully managed via the CMS.",
      kindBusiness: "business",
      kindCorporate: "corporate",
      kindEcommerce: "ecommerce",
      kindLanding: "landing",
    },
    xapps: {
      appsAria: "App demos",
      screensAria: "App screens",
      offlineBanner: "Offline — showing cached data",
      sendPushTitle: "Send a push notification",
      sendPushBody: "Behavior-driven messaging, delivered to the lock screen.",
      goOffline: "Go offline",
      backOnline: "Back online",
      offlineNote: "The app keeps working from cache when the network drops.",
      footnote:
        "Every demo is a real interaction — screens, tabs, notifications, and offline behavior are the same building blocks your app ships with, including App Store and Google Play delivery.",
    },
    xauto: {
      filtersAria: "Vehicle filters",
      allVehicles: "All vehicles",
      statusAvailable: "Available",
      statusReserved: "Reserved",
      statusInInspection: "In inspection",
      inclInspection: "incl. inspection report",
      emptyState: "No vehicles in this state right now.",
      bookService: "Book a service",
      stepChooseService: "Choose service",
      stepPickTime: "Pick a time",
      stepConfirmed: "Confirmed",
      chooseSlot: "choose a slot:",
      slots: ["Tomorrow · 09:00", "Tomorrow · 13:30", "Thursday · 10:15"],
      backToServices: "Back to services",
      booked: "Booked — bay 3 reserved",
      bookedBody: "{service}. Confirmation sent; the dealer dashboard updated instantly.",
      bookAnother: "Book another",
      dashboardsAria: "Dashboard view",
      dealerDashboard: "Dealer dashboard",
      customerDashboard: "Customer dashboard",
      dealerStats: [
        { label: "Vehicles in stock", value: "42" },
        { label: "Bays booked today", value: "9 / 12" },
        { label: "Open inspections", value: "4" },
        { label: "Month revenue", value: "$214k" },
      ],
      customerStats: [
        { label: "My vehicle health", value: "92%" },
        { label: "Next service", value: "Thu 10:15" },
        { label: "Open requests", value: "1" },
        { label: "Service records", value: "12" },
      ],
      lensNote: "Same system, two lenses — the dealer runs operations, the customer sees clarity.",
    },
    ai: {
      chatHeader: "Keystone Assurance — Claims Agent",
      online: "Online · responds instantly",
      pressPlay: "Press play to watch the agent handle a real claim.",
      play: "Play conversation",
      playing: "Playing…",
      replay: "Replay conversation",
      workflowsAria: "Automation workflows",
      trigger: "Trigger:",
      run: "Run workflow",
      running: "Running…",
      runAgain: "Run again",
    },
  },
};
