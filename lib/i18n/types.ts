import type { en } from "./dictionaries/en";

/** Every UI string the app renders — shape derived from the English
 * dictionary so a missing translation is a type error, not a runtime
 * fallback surprise. */
export type BaseDictionary = typeof en;

/** Localized replacements for showcase content that is authored in English
 * inside data/showcases.ts. Arrays must match the data arrays in length
 * and order; record keys are the stable ids from the data. */
export interface ShowcaseOverride {
  heroTagline: string;
  heroDescription: string;
  /** Stat labels (values often stay numeric/universal); same order as data. */
  stats: { label: string; value?: string }[];
  capabilities: { title: string; description: string }[];
  /** Section-nav labels keyed by section id. */
  sections: Record<string, string>;
  businesses: Record<string, { industry: string; summary: string; highlights: string[] }>;
  autoServices?: { name: string; description: string }[];
  aiAgents?: { name: string; role: string; description: string }[];
  chatScript?: { text: string }[];
  aiWorkflows?: { name: string; trigger: string; steps: string[]; outcome: string }[];
}

export interface Dictionary extends BaseDictionary {
  /** Localized product tagline/description keyed by product id. English
   * omits these — data/products.ts is already the English source. */
  products?: Record<string, { tagline: string; description: string }>;
  /** Localized showcase content keyed by showcase slug. */
  showcases?: Record<string, ShowcaseOverride>;
}
