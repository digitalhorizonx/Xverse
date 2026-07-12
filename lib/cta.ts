// Central CTA destinations — every showcase and page links through these,
// so there is exactly one place to retarget when funnels change and no
// page can drift into a dead link.

export const HORIZONX_START_URL = "https://horizonx.site/app?auth=signup";
export const TALK_TO_SALES_URL =
  "mailto:digital.horizonx.tek@gmail.com?subject=HorizonX%20—%20Project%20inquiry";
export const XABILITY_LIVE_URL = "https://xability.horizonx.site";

export interface CtaLink {
  label: string;
  href: string;
  external?: boolean;
}

export const PRIMARY_CTAS: CtaLink[] = [
  { label: "Book a demo", href: HORIZONX_START_URL, external: true },
  { label: "Talk to sales", href: TALK_TO_SALES_URL, external: true },
];
