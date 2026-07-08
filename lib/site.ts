const PRODUCTION_SITE_URL = "https://xverse.horizonx.site";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? PRODUCTION_SITE_URL
).replace(/\/$/, "");

/**
 * Staging deploys set NEXT_PUBLIC_ALLOW_INDEXING=false so search engines
 * don't index a non-production copy of the site under its own URL.
 */
export const ALLOW_INDEXING = process.env.NEXT_PUBLIC_ALLOW_INDEXING !== "false";
