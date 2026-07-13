import type { ProductPlanet, ProductShowcase } from "@/data/types";
import type { Dictionary } from "./types";

// Data files (data/products.ts, data/showcases.ts) stay single-source in
// English; the Arabic dictionary carries keyed overrides. These helpers
// merge the two so pages render fully localized objects without the data
// model knowing about locales.

export function localizeProduct(product: ProductPlanet, dict: Dictionary): ProductPlanet {
  const override = dict.products?.[product.id];
  if (!override) return product;
  return { ...product, tagline: override.tagline, description: override.description };
}

export function localizeShowcase(showcase: ProductShowcase, dict: Dictionary): ProductShowcase {
  const override = dict.showcases?.[showcase.slug];
  if (!override) return showcase;

  return {
    ...showcase,
    heroTagline: override.heroTagline,
    heroDescription: override.heroDescription,
    stats: showcase.stats.map((stat, index) => ({
      label: override.stats[index]?.label ?? stat.label,
      value: override.stats[index]?.value ?? stat.value,
    })),
    capabilities: showcase.capabilities.map((capability, index) => ({
      ...capability,
      title: override.capabilities[index]?.title ?? capability.title,
      description: override.capabilities[index]?.description ?? capability.description,
    })),
    sections: showcase.sections.map((section) => ({
      ...section,
      label: override.sections[section.id] ?? section.label,
    })),
    sampleBusinesses: showcase.sampleBusinesses.map((business) => {
      const localized = override.businesses[business.id];
      if (!localized) return business;
      return {
        ...business,
        industry: localized.industry,
        summary: localized.summary,
        highlights: localized.highlights,
      };
    }),
    autoServices: showcase.autoServices?.map((service, index) => ({
      ...service,
      name: override.autoServices?.[index]?.name ?? service.name,
      description: override.autoServices?.[index]?.description ?? service.description,
    })),
    aiAgents: showcase.aiAgents?.map((agent, index) => ({
      ...agent,
      name: override.aiAgents?.[index]?.name ?? agent.name,
      role: override.aiAgents?.[index]?.role ?? agent.role,
      description: override.aiAgents?.[index]?.description ?? agent.description,
    })),
    chatScript: showcase.chatScript?.map((turn, index) => ({
      ...turn,
      text: override.chatScript?.[index]?.text ?? turn.text,
    })),
    aiWorkflows: showcase.aiWorkflows?.map((workflow, index) => {
      const localized = override.aiWorkflows?.[index];
      if (!localized) return workflow;
      return {
        ...workflow,
        name: localized.name,
        trigger: localized.trigger,
        steps: localized.steps,
        outcome: localized.outcome,
      };
    }),
  };
}
