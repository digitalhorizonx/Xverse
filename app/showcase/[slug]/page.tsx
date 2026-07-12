import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getProductByShowcaseSlug } from "@/data/products";
import { getShowcaseBySlug, SHOWCASES } from "@/data/showcases";
import { getBrandsByProduct } from "@/data/brands";
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

export function generateStaticParams() {
  return SHOWCASES.map((showcase) => ({ slug: showcase.slug }));
}

export function generateMetadata({ params }: ShowcasePageProps): Metadata {
  const product = getProductByShowcaseSlug(params.slug);
  const showcase = getShowcaseBySlug(params.slug);
  if (!product || !showcase) return {};
  return {
    title: `${product.name} Showcase — ${showcase.heroTagline}`,
    description: showcase.heroDescription,
  };
}

export default function ShowcasePage({ params }: ShowcasePageProps) {
  const alias = SLUG_ALIASES[params.slug];
  if (alias && alias !== params.slug) {
    redirect(`/showcase/${alias}`);
  }

  const product = getProductByShowcaseSlug(params.slug);
  const showcase = getShowcaseBySlug(params.slug);
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
  product: NonNullable<ReturnType<typeof getProductByShowcaseSlug>>;
  showcase: NonNullable<ReturnType<typeof getShowcaseBySlug>>;
};

function XabilitySections({ product, showcase }: SectionProps) {
  const brands = getBrandsByProduct(product.id);
  return (
    <>
      <section id="worlds" className="scroll-mt-28 pt-6">
        <WorldShowcaseSection product={product} brands={brands} />
        <div className="mx-auto max-w-6xl px-6 pt-12 sm:px-8">
          <BrandExplorer brands={brands} productName={product.name} />
        </div>
      </section>

      <section id="portal" className="mx-auto max-w-6xl scroll-mt-28 px-6 py-20 sm:px-8">
        <SectionHeading
          eyebrow="Customer Portal"
          title="Run your brand from one portal"
          description="Try it: submit a request, approve or reject it, publish — and watch history and credits update live."
          accentColor={product.accentColor}
        />
        <PortalSimulator accent={product.color} />
      </section>

      <CapabilitiesSection product={product} showcase={showcase} />
    </>
  );
}

function XsiteSections({ product, showcase }: SectionProps) {
  return (
    <>
      <section id="templates" className="mx-auto max-w-6xl scroll-mt-28 px-6 py-20 sm:px-8">
        <SectionHeading
          eyebrow="Live Previews"
          title="Real templates, live in the browser"
          description="Switch businesses, flip dark mode, and preview mobile — the theming and responsiveness you get, demonstrated."
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
  return (
    <>
      <section id="apps" className="mx-auto max-w-6xl scroll-mt-28 px-6 py-20 sm:px-8">
        <SectionHeading
          eyebrow="Live App Demos"
          title="Tap through the apps we ship"
          description="Three demo businesses, one phone. Switch screens, fire a push notification, and pull the network plug."
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
  return (
    <>
      <section id="marketplace" className="mx-auto max-w-6xl scroll-mt-28 px-6 py-20 sm:px-8">
        <SectionHeading
          eyebrow="Marketplace Demo"
          title="Meridian Motors, running on XAuto"
          description="Filter live listings and book a service bay — the marketplace and workshop working together."
          accentColor={product.accentColor}
        />
        <XautoDemo
          vehicles={showcase.vehicles ?? []}
          services={showcase.autoServices ?? []}
          accent={product.color}
        />
      </section>

      <section id="dashboards" className="mx-auto max-w-6xl scroll-mt-28 px-6 py-20 sm:px-8">
        <SectionHeading
          eyebrow="Dashboards"
          title="One system, two dashboards"
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
  return (
    <>
      <section id="agent" className="mx-auto max-w-6xl scroll-mt-28 px-6 py-20 sm:px-8">
        <SectionHeading
          eyebrow="Agent Demo"
          title="Watch an agent resolve a claim"
          description="A real conversation pattern: intake, verification, action, confirmation — played live."
          accentColor={product.accentColor}
        />
        <AiChatDemo
          script={showcase.chatScript ?? []}
          agents={showcase.aiAgents ?? []}
          accent={product.color}
        />
      </section>

      <section id="workflows" className="mx-auto max-w-6xl scroll-mt-28 px-6 py-20 sm:px-8">
        <SectionHeading
          eyebrow="Workflows"
          title="Trigger → steps → outcome"
          description="Pick a workflow and run it — every step lights up as the automation executes."
          accentColor={product.accentColor}
        />
        <AiWorkflowsDemo workflows={showcase.aiWorkflows ?? []} accent={product.color} />
      </section>

      <SampleBusinessesSection product={product} showcase={showcase} />
      <CapabilitiesSection product={product} showcase={showcase} />
    </>
  );
}
