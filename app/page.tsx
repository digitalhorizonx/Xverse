import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Universe } from "@/components/universe/Universe";
import { ParallaxSky } from "@/components/fx/ParallaxSky";
import { SiteHeader } from "@/components/nav/SiteHeader";
import { ButtonLink } from "@/components/ui/Button";
import { PRODUCTS } from "@/data/products";
import { getDict } from "@/lib/i18n/server";
import { localizeProduct } from "@/lib/i18n/localize";
import { TALK_TO_SALES_URL } from "@/lib/cta";

export default function HomePage() {
  const { dict } = getDict();

  // The hero is rendered twice by <Universe>: as a normal in-flow block
  // above the 3D window on phones (so copy never overlaps the scene) and
  // floating inside the viewport from md up. Copy length and type scale
  // adapt per breakpoint.
  const hero = (
    <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center md:gap-6">
      <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-mist-300 md:text-xs">
        {dict.home.badge}
      </span>

      <h1 className="font-display text-[1.9rem] font-semibold leading-tight text-mist-100 min-[400px]:text-4xl md:text-5xl lg:text-6xl">
        {dict.home.titlePre} <span className="text-gradient">{dict.home.titleHighlight}</span>
      </h1>

      <p className="max-w-xl text-balance text-base text-mist-400 md:hidden">
        {dict.home.descriptionShort}
      </p>
      <p className="hidden max-w-xl text-balance text-lg text-mist-400 md:block">
        {dict.home.description}
      </p>

      <div className="pointer-events-auto flex w-full flex-col items-stretch justify-center gap-3 px-2 min-[400px]:w-auto min-[400px]:flex-row min-[400px]:items-center min-[400px]:px-0">
        <ButtonLink href="/showcase" variant="primary">
          {dict.home.exploreShowcases} <ArrowRight className="h-4 w-4" aria-hidden />
        </ButtonLink>
        <ButtonLink href={TALK_TO_SALES_URL} variant="secondary" external>
          {dict.cta.bookDemo}
        </ButtonLink>
      </div>

      <p className="text-[10px] uppercase tracking-[0.2em] text-mist-500 md:text-xs">
        {dict.common.demoDisclaimer}
      </p>
    </div>
  );

  return (
    // overflow-x-clip (not overflow-hidden): a hidden overflow on this
    // ancestor would silently disable the sticky pinning inside the
    // scroll journey.
    <main id="main-content" className="relative min-h-screen overflow-x-clip bg-ink-950">
      <SiteHeader />

      {/* Viewport-locked sky with scroll parallax; theme-aware — the full
          nebula in dark, a faint texture wash in light. */}
      <ParallaxSky />

      <div className="relative">
        <Universe hero={hero} />

        <section className="relative mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
          <div className="mb-10 flex flex-col items-center gap-3 text-center sm:mb-12">
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-nebula-400">
              {dict.home.constellationEyebrow}
            </span>
            <h2 className="font-display text-3xl font-semibold text-mist-100 sm:text-4xl">
              {dict.home.constellationTitle}
            </h2>
            <p className="max-w-lg text-mist-400">{dict.home.constellationBody}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map((rawProduct) => {
              const product = localizeProduct(rawProduct, dict);
              const isLive = product.status === "live";
              return (
                <Link key={product.id} href={`/showcase/${product.showcaseSlug}`} className="block">
                  <div
                    className="glass-strong group flex h-full flex-col gap-3 rounded-3xl p-6 transition hover:-translate-y-1 hover:border-white/20"
                    style={{ boxShadow: `0 0 0 1px ${product.color}2e, 0 0 48px -18px ${product.color}55` }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="inline-flex h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: product.color, boxShadow: `0 0 12px ${product.color}` }}
                      />
                      {isLive ? (
                        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-mist-200">
                          {dict.common.live}
                        </span>
                      ) : (
                        <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-mist-500">
                          {dict.common.comingSoon}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-xl font-semibold text-mist-100">{product.name}</h3>
                    <p className="text-sm font-medium text-mist-300">{product.tagline}</p>
                    <p className="text-sm text-mist-500">{product.description}</p>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-mist-200 transition group-hover:gap-2.5">
                      {dict.common.enterShowcase} <ArrowRight className="h-4 w-4" aria-hidden />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-5 pb-28 pt-8 text-center sm:px-6 sm:pb-32">
          <h2 className="font-display text-3xl font-semibold text-mist-100 sm:text-5xl">
            {dict.home.finalTitlePre}{" "}
            <span className="text-gradient">{dict.home.finalTitleHighlight}</span>
          </h2>
          <p className="max-w-xl text-mist-400">{dict.home.finalBody}</p>
          <div className="flex w-full flex-col items-stretch justify-center gap-3 min-[400px]:w-auto min-[400px]:flex-row min-[400px]:items-center">
            <ButtonLink href="https://xability.horizonx.site" external variant="primary">
              {dict.cta.startWithXability} <ArrowRight className="h-4 w-4" aria-hidden />
            </ButtonLink>
            <ButtonLink href="/showcase" variant="secondary">
              {dict.home.exploreAllShowcases}
            </ButtonLink>
          </div>
        </section>
      </div>
    </main>
  );
}
