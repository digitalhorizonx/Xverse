import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Orbit } from "lucide-react";
import { SiteHeader } from "@/components/nav/SiteHeader";
import { Breadcrumbs } from "@/components/showcase/Breadcrumbs";
import { EmblemImage } from "@/components/showcase/EmblemImage";
import { Reveal } from "@/components/fx/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PRODUCTS } from "@/data/products";
import { getShowcaseByProductId } from "@/data/showcases";

export const metadata: Metadata = {
  title: "Showcase — every HorizonX product, demonstrated",
  description:
    "The HorizonX showroom: complete interactive demonstrations of Xability, XSites, XApps, XAuto, and the AI Platform.",
};

export default function ShowcaseIndexPage() {
  return (
    <main id="main-content" className="min-h-screen bg-ink-950">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-6 pt-5 sm:px-8">
        <Breadcrumbs crumbs={[{ label: "Universe", href: "/" }, { label: "Showcase" }]} />
      </div>

      <section className="mx-auto max-w-6xl px-6 pb-24 pt-12 sm:px-8">
        <SectionHeading
          eyebrow="The HorizonX Showroom"
          title="Every product, fully demonstrated"
          description="Not brochures — working demonstrations. Enter any product to explore what its customers actually receive."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PRODUCTS.map((product, index) => {
            const showcase = getShowcaseByProductId(product.id);
            const isLive = product.status === "live";
            return (
              <Reveal key={product.id} delay={index * 70}>
                <Link
                  href={`/showcase/${product.showcaseSlug}`}
                  className="glass-strong group flex h-full gap-5 rounded-[2rem] p-6 transition hover:-translate-y-1 hover:border-white/20"
                  style={{ boxShadow: `0 0 0 1px ${product.color}2e, 0 0 56px -22px ${product.color}66` }}
                >
                  <EmblemImage planet={product} size={72} className="shrink-0 self-start" />
                  <span className="flex min-w-0 flex-col gap-2">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-xl font-semibold text-mist-100">{product.name}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-wider ${isLive ? "bg-white/10 text-mist-200" : "bg-white/5 text-mist-500"}`}>
                        {isLive ? "Live" : "Preview"}
                      </span>
                    </span>
                    <span className="text-sm font-medium text-mist-300">{showcase?.heroTagline ?? product.tagline}</span>
                    <span className="text-sm text-mist-500">{product.description}</span>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-mist-200 transition-all group-hover:gap-2.5 group-hover:text-white">
                      Enter showcase <ArrowRight className="h-4 w-4" aria-hidden />
                    </span>
                  </span>
                </Link>
              </Reveal>
            );
          })}

          <Reveal delay={PRODUCTS.length * 70}>
            <Link
              href="/"
              className="glass group flex h-full min-h-[180px] flex-col items-center justify-center gap-3 rounded-[2rem] p-6 text-center transition hover:border-white/20"
            >
              <Orbit className="h-8 w-8 text-nebula-400 transition group-hover:rotate-45" aria-hidden />
              <span className="font-display text-lg font-semibold text-mist-100">Return to Universe</span>
              <span className="text-sm text-mist-500">Fly the 3D constellation instead.</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
