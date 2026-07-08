import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BRANDS, getBrandBySlug } from "@/data/brands";
import { getProduct } from "@/data/products";
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

export function generateStaticParams() {
  return BRANDS.filter((brand) => brand.active).map((brand) => ({
    product: brand.product,
    brand: brand.slug,
  }));
}

export function generateMetadata({ params }: BrandPageProps): Metadata {
  const brand = getBrandBySlug(params.product, params.brand);
  if (!brand) return {};

  return {
    title: `${brand.name} — Demo Brand`,
    description: brand.description,
  };
}

export default function BrandPage({ params }: BrandPageProps) {
  const brand = getBrandBySlug(params.product, params.brand);
  const product = getProduct(params.product);

  if (!brand || !product) {
    notFound();
  }

  return (
    <main id="main-content" className="min-h-screen bg-ink-950">
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
