import type { ProductPlanet } from "./types";

export const PRODUCTS: ProductPlanet[] = [
  {
    id: "xability",
    name: "Xability",
    tagline: "AI Social Media Operations",
    description:
      "The AI marketing operating system that plans, creates, publishes and optimizes social media — strategy, content, ads, and reporting, all in one place.",
    color: "#20b8a4",
    accentColor: "#7fe4d6",
    status: "live",
    ctaLabel: "Start with Xability",
    ctaUrl: "https://xability.horizonx.site",
    orbitRadius: 6,
    orbitSpeed: 1,
  },
  {
    id: "xsite",
    name: "XSites",
    tagline: "AI-built websites",
    description:
      "Websites and landing pages generated, launched, and optimized by AI — from first draft to conversion-tuned production site.",
    color: "#fb9645",
    accentColor: "#ffd9a0",
    status: "coming-soon",
    ctaLabel: "Start with XSites",
    ctaUrl: "https://xsite.horizonx.site",
    orbitRadius: 9,
    orbitSpeed: 0.82,
  },
  {
    id: "xapp",
    name: "XApps",
    tagline: "AI-built apps",
    description:
      "Mobile and web apps scaffolded, built, and shipped with AI-assisted engineering — from idea to app-store-ready product.",
    color: "#8b5cf6",
    accentColor: "#c4b5fd",
    status: "coming-soon",
    ctaLabel: "Start with XApps",
    ctaUrl: "https://xapp.horizonx.site",
    orbitRadius: 12,
    orbitSpeed: 0.68,
  },
  {
    id: "xai",
    name: "XAI",
    tagline: "AI workflows & agents",
    description:
      "Custom AI agents and automations embedded directly into a business's operations — from customer support to internal ops.",
    color: "#f96a4d",
    accentColor: "#ff8b73",
    status: "coming-soon",
    ctaLabel: "Start with XAI",
    ctaUrl: "https://xai.horizonx.site",
    orbitRadius: 15,
    orbitSpeed: 0.55,
  },
  {
    id: "xauto",
    name: "XAuto",
    tagline: "Business process automation",
    description:
      "End-to-end automation for the operational backbone of a business — bookings, inventory, invoicing, and everything between.",
    color: "#38bdf8",
    accentColor: "#bae6fd",
    status: "coming-soon",
    ctaLabel: "Start with XAuto",
    ctaUrl: "https://xauto.horizonx.site",
    orbitRadius: 18,
    orbitSpeed: 0.45,
  },
];

export function getProduct(id: string) {
  return PRODUCTS.find((product) => product.id === id);
}
