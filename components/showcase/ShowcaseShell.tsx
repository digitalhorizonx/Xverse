import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/nav/SiteHeader";
import { ArrivalOverlay } from "@/components/fx/ArrivalOverlay";
import { Reveal } from "@/components/fx/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPrimaryCtas } from "@/lib/cta";
import { getDict } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n/config";
import { onAccent } from "@/lib/color";
import type { ProductPlanet, ProductShowcase } from "@/data/types";
import { Breadcrumbs } from "./Breadcrumbs";
import { SectionNav } from "./SectionNav";
import { EmblemImage } from "./EmblemImage";
import { CTAFooter } from "./CTAFooter";
import { ShowcaseIcon } from "./icons";

interface ShowcaseShellProps {
  /** Already localized (see lib/i18n/localize.ts). */
  product: ProductPlanet;
  showcase: ProductShowcase;
  children: ReactNode;
}

/**
 * The frame every product showcase lives in: header, breadcrumbs, branded
 * hero with the product's universe emblem, sticky section nav, the
 * product-specific demo sections (children), then the shared closing CTA
 * block. One shell = one consistent experience across all products.
 */
export function ShowcaseShell({ product, showcase, children }: ShowcaseShellProps) {
  const { dict } = getDict();
  const isLive = product.status === "live";

  return (
    <main id="main-content" className="min-h-screen bg-ink-950">
      <ArrivalOverlay />
      <SiteHeader currentProductId={product.id} />

      <div className="mx-auto max-w-6xl px-5 pt-5 sm:px-8">
        <Breadcrumbs
          crumbs={[
            { label: dict.breadcrumbs.universe, href: "/" },
            { label: dict.breadcrumbs.showcase, href: "/showcase" },
            { label: product.name },
          ]}
        />
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(60% 55% at 50% 0%, ${product.color}1f, transparent 70%)` }}
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-5 px-5 pb-14 pt-10 text-center sm:gap-6 sm:px-8 sm:pt-16">
          <EmblemImage planet={product} size={96} className="sm:h-[112px] sm:w-[112px]" />
          <div className="flex flex-wrap items-center justify-center gap-3">
            <h1 className="font-display text-3xl font-semibold text-mist-100 sm:text-5xl">{product.name}</h1>
            <span
              className={`rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] ${
                isLive ? "bg-white/10 text-mist-200" : "bg-white/5 text-mist-400"
              }`}
            >
              {isLive ? dict.common.live : dict.common.comingSoonPreview}
            </span>
          </div>
          <p className="font-display text-lg text-mist-200 sm:text-2xl">{showcase.heroTagline}</p>
          <p className="max-w-2xl text-balance text-sm text-mist-400 sm:text-base">{showcase.heroDescription}</p>

          <div className="flex w-full flex-col items-stretch justify-center gap-3 pt-1 min-[400px]:w-auto min-[400px]:flex-row min-[400px]:items-center">
            {getPrimaryCtas(dict).map((cta, index) => (
              <ButtonLink key={cta.label} href={cta.href} external={cta.external} variant={index === 0 ? "primary" : "secondary"}>
                {cta.label} <ArrowRight className="h-4 w-4" aria-hidden />
              </ButtonLink>
            ))}
          </div>

          <dl className="mt-4 grid w-full max-w-3xl grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-4">
            {showcase.stats.map((stat) => (
              <div key={stat.label} className="glass rounded-2xl px-4 py-4">
                <dt className="text-[10px] font-medium uppercase tracking-wider text-mist-500">{stat.label}</dt>
                <dd className="mt-1 font-display text-sm font-semibold text-mist-100">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <SectionNav sections={showcase.sections} accentColor={product.color} />

      {children}

      <CTAFooter product={product} />
    </main>
  );
}

/** Shared "What You Get" capability grid, styled identically everywhere. */
export function CapabilitiesSection({ product, showcase }: { product: ProductPlanet; showcase: ProductShowcase }) {
  const { dict } = getDict();

  return (
    <section id="capabilities" className="mx-auto max-w-6xl scroll-mt-28 px-5 py-16 sm:px-8 sm:py-20">
      <SectionHeading
        eyebrow={dict.showcase.whatYouGet}
        title={fmt(dict.showcase.capabilitiesTitle, { product: product.name })}
        accentColor={product.accentColor}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {showcase.capabilities.map((capability, index) => (
          <Reveal key={capability.icon + capability.title} delay={index * 60}>
            <div className="glass-strong flex h-full flex-col gap-3 rounded-3xl p-6 transition hover:border-white/20">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${product.color}1f` }}
              >
                <ShowcaseIcon name={capability.icon} className="h-5 w-5" color={product.accentColor} />
              </span>
              <h3 className="font-display text-lg font-semibold text-mist-100">{capability.title}</h3>
              <p className="text-sm text-mist-400">{capability.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/** Shared realistic example-business strip. */
export function SampleBusinessesSection({ product, showcase, sectionId = "examples" }: { product: ProductPlanet; showcase: ProductShowcase; sectionId?: string }) {
  const { dict } = getDict();

  return (
    <section id={sectionId} className="mx-auto max-w-6xl scroll-mt-28 px-5 py-16 sm:px-8 sm:py-20">
      <SectionHeading
        eyebrow={dict.showcase.examplesEyebrow}
        title={dict.showcase.examplesTitle}
        description={dict.showcase.examplesBody}
        accentColor={product.accentColor}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {showcase.sampleBusinesses.map((business, index) => (
          <Reveal key={business.id} delay={index * 60}>
            <div
              className="glass-strong flex h-full flex-col gap-3 rounded-3xl p-6"
              style={{ boxShadow: `0 0 0 1px ${business.color}2e, 0 0 40px -16px ${business.color}55` }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-2xl font-display text-sm font-bold"
                  style={{ backgroundColor: business.color, color: onAccent(business.color) }}
                >
                  {business.logoMark}
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-mist-300">
                  {dict.common.demoBusiness}
                </span>
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-mist-100">{business.name}</h3>
                <p className="text-xs text-mist-500">{business.industry}</p>
              </div>
              <p className="text-sm text-mist-400">{business.summary}</p>
              <ul className="mt-auto flex flex-wrap gap-1.5 pt-2">
                {business.highlights.map((highlight) => (
                  <li key={highlight} className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-medium text-mist-300">
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Trust framing: demo data is always labeled as demo data. */}
      <p className="mt-8 text-center text-[11px] text-mist-500">{dict.common.demoDataNote}</p>
    </section>
  );
}
