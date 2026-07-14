import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getDict } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n/config";
import {
  getPublicBrandsByProduct,
  getPublicProductByShowcaseSlug,
  getPublicShowcaseBySlug,
} from "@/lib/content/publicContent";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  CapabilitiesSection,
  SampleBusinessesSection,
  ShowcaseShell,
} from "@/components/showcase/ShowcaseShell";
import { WorldShowcaseSection } from "@/components/product/WorldShowcaseSection";
import { BrandExplorer } from "@/components/product/BrandExplorer";
import { PortalSimulator } from "@/components/showcase/demos/PortalSimulator";
import { XsiteDemo } from "@/components/showcase/demos/XsiteDemo";
import { XappsDemo } from "@/components/showcase/demos/XappsDemo";
import { XautoDemo, XautoDashboards } from "@/components/showcase/demos/XautoDemo";
import { AiChatDemo, AiWorkflowsDemo } from "@/components/showcase/demos/AiDemo";

interface ShowcasePageProps {
  params: { slug: string };
}

// Legacy/product-id spellings people may guess → canonical showcase slugs.
const SLUG_ALIASES: Record<string, string> = {
  xapp: "xapps",
  xai: "ai",
  xauto: "xauto",
};

export function generateMetadata({ params }: ShowcasePageProps): Metadata {
  const { dict, locale } = getDict();
  const product = getPublicProductByShowcaseSlug(params.slug, locale);
  const showcase = getPublicShowcaseBySlug(params.slug, locale);
  // Thrown here (not only in the page body) so the 404 status is decided
  // before app/loading.tsx starts streaming a 200 shell.
  if (!product || !showcase) notFound();
  return {
    title: fmt(dict.meta.showcaseTitle, { product: product.name, tagline: showcase.heroTagline }),
    description: showcase.heroDescription,
  };
}

export default function ShowcasePage({ params }: ShowcasePageProps) {
  const alias = SLUG_ALIASES[params.slug];
  if (alias && alias !== params.slug) {
    redirect(`/showcase/${alias}`);
  }

  const { locale } = getDict();
  const product = getPublicProductByShowcaseSlug(params.slug, locale);
  const showcase = getPublicShowcaseBySlug(params.slug, locale);
  if (!product || !showcase) {
    notFound();
  }

  return (
    <ShowcaseShell product={product} showcase={showcase}>
      {product.id === "xability" && <XabilitySections product={product} showcase={showcase} />}
      {product.id === "xsite" && <XsiteSections product={product} showcase={showcase} />}
      {product.id === "xapp" && <XappsSections product={product} showcase={showcase} />}
      {product.id === "xauto" && <XautoSections product={product} showcase={showcase} />}
      {product.id === "xai" && <AiSections product={product} showcase={showcase} />}
    </ShowcaseShell>
  );
}

type SectionProps = {
  product: NonNullable<ReturnType<typeof getPublicProductByShowcaseSlug>>;
  showcase: NonNullable<ReturnType<typeof getPublicShowcaseBySlug>>;
};

function XabilitySections({ product, showcase }: SectionProps) {
  const { locale, dict } = getDict();
  const brands = getPublicBrandsByProduct(product.id);
  return (
    <>
      <section id="worlds" className="scroll-mt-28 pt-6">
        {/* Always-present h2 for this section: the 3D worlds block below
            (which carries the visible h2) unmounts on low-capability /
            reduced-motion clients, and heading order must survive that. */}
        <h2 className="sr-only">
          {showcase.sections.find((section) => section.id === "worlds")?.label ?? product.name}
        </h2>
        <WorldShowcaseSection product={product} brands={brands} />
        <div className="mx-auto max-w-6xl px-5 pt-12 sm:px-8">
          <BrandExplorer brands={brands} productName={product.name} />
        </div>
      </section>

      <section id="portal" className="mx-auto max-w-6xl scroll-mt-28 px-5 py-16 sm:px-8 sm:py-20">
        <SectionHeading
          eyebrow={dict.sections.xability.portal.eyebrow}
          title={dict.sections.xability.portal.title}
          description={dict.sections.xability.portal.description}
          accentColor={product.accentColor}
        />
        {/* Keyed by locale: the simulator seeds its request/history state
            with localized strings, so a language switch must remount it. */}
        <PortalSimulator key={locale} accent={product.color} />
      </section>

      <CapabilitiesSection product={product} showcase={showcase} />
    </>
  );
}

function XsiteSections({ product, showcase }: SectionProps) {
  const { dict } = getDict();
  return (
    <>
      <section id="templates" className="mx-auto max-w-6xl scroll-mt-28 px-5 py-16 sm:px-8 sm:py-20">
        <SectionHeading
          eyebrow={dict.sections.xsite.templates.eyebrow}
          title={dict.sections.xsite.templates.title}
          description={dict.sections.xsite.templates.description}
          accentColor={product.accentColor}
        />
        <XsiteDemo templates={showcase.siteTemplates ?? []} />
      </section>
      <SampleBusinessesSection product={product} showcase={showcase} />
      <CapabilitiesSection product={product} showcase={showcase} />
    </>
  );
}

function XappsSections({ product, showcase }: SectionProps) {
  const { dict } = getDict();
  return (
    <>
      <section id="apps" className="mx-auto max-w-6xl scroll-mt-28 px-5 py-16 sm:px-8 sm:py-20">
        <SectionHeading
          eyebrow={dict.sections.xapps.apps.eyebrow}
          title={dict.sections.xapps.apps.title}
          description={dict.sections.xapps.apps.description}
          accentColor={product.accentColor}
        />
        <XappsDemo demos={showcase.appDemos ?? []} />
      </section>
      <SampleBusinessesSection product={product} showcase={showcase} />
      <CapabilitiesSection product={product} showcase={showcase} />
    </>
  );
}

function XautoSections({ product, showcase }: SectionProps) {
  const { dict } = getDict();
  return (
    <>
      <section id="marketplace" className="mx-auto max-w-6xl scroll-mt-28 px-5 py-16 sm:px-8 sm:py-20">
        <SectionHeading
          eyebrow={dict.sections.xauto.marketplace.eyebrow}
          title={dict.sections.xauto.marketplace.title}
          description={dict.sections.xauto.marketplace.description}
          accentColor={product.accentColor}
        />
        <XautoDemo
          vehicles={showcase.vehicles ?? []}
          services={showcase.autoServices ?? []}
          accent={product.color}
        />
      </section>

      <section id="dashboards" className="mx-auto max-w-6xl scroll-mt-28 px-5 py-16 sm:px-8 sm:py-20">
        <SectionHeading
          eyebrow={dict.sections.xauto.dashboards.eyebrow}
          title={dict.sections.xauto.dashboards.title}
          accentColor={product.accentColor}
        />
        <XautoDashboards accent={product.color} />
      </section>

      <SampleBusinessesSection product={product} showcase={showcase} />
      <CapabilitiesSection product={product} showcase={showcase} />
    </>
  );
}

function AiSections({ product, showcase }: SectionProps) {
  const { dict } = getDict();
  return (
    <>
      <section id="agent" className="mx-auto max-w-6xl scroll-mt-28 px-5 py-16 sm:px-8 sm:py-20">
        <SectionHeading
          eyebrow={dict.sections.ai.agent.eyebrow}
          title={dict.sections.ai.agent.title}
          description={dict.sections.ai.agent.description}
          accentColor={product.accentColor}
        />
        <AiChatDemo
          script={showcase.chatScript ?? []}
          agents={showcase.aiAgents ?? []}
          accent={product.color}
        />
      </section>

      <section id="workflows" className="mx-auto max-w-6xl scroll-mt-28 px-5 py-16 sm:px-8 sm:py-20">
        <SectionHeading
          eyebrow={dict.sections.ai.workflows.eyebrow}
          title={dict.sections.ai.workflows.title}
          description={dict.sections.ai.workflows.description}
          accentColor={product.accentColor}
        />
        <AiWorkflowsDemo workflows={showcase.aiWorkflows ?? []} accent={product.color} />
      </section>

      <SampleBusinessesSection product={product} showcase={showcase} />
      <CapabilitiesSection product={product} showcase={showcase} />
    </>
  );
}
