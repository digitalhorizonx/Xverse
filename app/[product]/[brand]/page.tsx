import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBrandBySlug } from "@/data/brands";
import { getProduct } from "@/data/products";
import { getDict } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n/config";
import { SiteHeader } from "@/components/nav/SiteHeader";
import { Breadcrumbs } from "@/components/showcase/Breadcrumbs";
import { ArrivalOverlay } from "@/components/fx/ArrivalOverlay";
import { BrandHero } from "@/components/brand/BrandHero";
import { BrandStory } from "@/components/brand/BrandStory";
import { TransformationJourney } from "@/components/brand/TransformationJourney";
import { SocialFeed } from "@/components/brand/SocialFeed";
import { ContentCalendarSection } from "@/components/brand/ContentCalendar";
import { ApprovalWorkflow } from "@/components/brand/ApprovalWorkflow";
import { AiInsights } from "@/components/brand/AiInsights";
import { AdDashboard } from "@/components/brand/AdDashboard";
import { AnalyticsDashboard } from "@/components/brand/AnalyticsDashboard";
import { ReportsSection } from "@/components/brand/ReportsSection";
import { BeforeAfterGallery } from "@/components/brand/BeforeAfterGallery";
import { BrandFooterCta } from "@/components/brand/BrandFooterCta";

interface BrandPageProps {
  params: { product: string; brand: string };
}

// No generateStaticParams: every page renders per-request now that the
// locale cookie decides the language server-side.

export function generateMetadata({ params }: BrandPageProps): Metadata {
  const { dict } = getDict();
  const brand = getBrandBySlug(params.product, params.brand);
  // Thrown here so the 404 status commits before streaming begins.
  if (!brand) notFound();

  return {
    title: fmt(dict.brandWorlds.demoBrandMeta, { brand: brand.name }),
    description: brand.description,
  };
}

export default function BrandPage({ params }: BrandPageProps) {
  const { dict } = getDict();
  const brand = getBrandBySlug(params.product, params.brand);
  const product = getProduct(params.product);

  if (!brand || !product) {
    notFound();
  }

  return (
    <main id="main-content" className="min-h-screen bg-ink-950">
      <ArrivalOverlay />
      <SiteHeader currentProductId={product.id} />
      <div className="mx-auto max-w-6xl px-6 pt-5 sm:px-8">
        <Breadcrumbs
          crumbs={[
            { label: dict.breadcrumbs.universe, href: "/" },
            { label: dict.breadcrumbs.showcase, href: "/showcase" },
            { label: product.name, href: `/showcase/${product.showcaseSlug}` },
            { label: brand.name },
          ]}
        />
      </div>
      <BrandHero brand={brand} product={product} />
      <BrandStory brand={brand} />
      <TransformationJourney brand={brand} />
      <SocialFeed posts={brand.socialPosts} reels={brand.reels} />
      <ContentCalendarSection items={brand.contentCalendar} />
      <ApprovalWorkflow items={brand.contentCalendar} />
      <AiInsights insights={brand.aiInsights} />
      <AdDashboard campaigns={brand.adPerformance} />
      <AnalyticsDashboard analytics={brand.analytics} />
      <ReportsSection reports={brand.reports} />
      <BeforeAfterGallery gallery={brand.gallery} />
      <BrandFooterCta brand={brand} product={product} />
    </main>
  );
}
