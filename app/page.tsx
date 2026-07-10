import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Universe } from "@/components/universe/Universe";
import { ParallaxSky } from "@/components/fx/ParallaxSky";
import { PRODUCTS } from "@/data/products";

const hero = (
  <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
    <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-mist-300">
      HorizonX Digital Universe
    </span>

    <h1 className="font-display text-4xl font-semibold leading-tight text-mist-100 sm:text-6xl">
      Enter the <span className="text-gradient">HorizonX Universe</span>
    </h1>

    <p className="max-w-xl text-balance text-lg text-mist-400">
      One digital universe. Every HorizonX product, showcased as a living
      world — demo brands, dashboards, and the full digital transformation
      journey, explorable in 3D.
    </p>

    <p className="text-xs uppercase tracking-[0.2em] text-mist-500">
      Demo Brand · Sample Experience · Illustrative Analytics
    </p>
  </div>
);

export default function HomePage() {
  return (
    // overflow-x-clip (not overflow-hidden): a hidden overflow on this
    // ancestor would silently disable the sticky pinning inside the
    // scroll journey.
    <main id="main-content" className="relative min-h-screen overflow-x-clip bg-ink-950">
      {/* Viewport-locked sky with scroll parallax: the 3D canvas is
          transparent, so this nebula is the scene's backdrop at every
          scroll depth — and it drifts against the scroll for depth. */}
      <ParallaxSky />

      <div className="relative">
        {/* The universe IS the landing viewport — the hero floats inside
            it and the warp-in entry plays full-screen. */}
        <Universe hero={hero} />

        <section className="relative mx-auto max-w-6xl px-6 py-24">
          <div className="mb-12 flex flex-col items-center gap-3 text-center">
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-nebula-400">
              The Constellation
            </span>
            <h2 className="font-display text-3xl font-semibold text-mist-100 sm:text-4xl">
              One universe. Five products.
            </h2>
            <p className="max-w-lg text-mist-400">
              Each world in the universe is a HorizonX product — one live today,
              four entering orbit soon.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map((product) => {
              const isLive = product.status === "live";
              const card = (
                <div
                  className={`glass-strong group flex h-full flex-col gap-3 rounded-3xl p-6 transition ${
                    isLive ? "hover:-translate-y-1 hover:border-white/20" : "opacity-70"
                  }`}
                  style={{ boxShadow: `0 0 0 1px ${product.color}2e, 0 0 48px -18px ${product.color}55` }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="inline-flex h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: product.color, boxShadow: `0 0 12px ${product.color}` }}
                    />
                    {isLive ? (
                      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-mist-200">
                        Live
                      </span>
                    ) : (
                      <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-mist-500">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-xl font-semibold text-mist-100">{product.name}</h3>
                  <p className="text-sm font-medium text-mist-300">{product.tagline}</p>
                  <p className="text-sm text-mist-500">{product.description}</p>
                  {isLive && (
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-mist-200 transition group-hover:gap-2.5">
                      Explore the world <ArrowRight className="h-4 w-4" aria-hidden />
                    </span>
                  )}
                </div>
              );

              return isLive ? (
                <Link key={product.id} href={`/${product.id}`} className="block">
                  {card}
                </Link>
              ) : (
                <div key={product.id}>{card}</div>
              );
            })}
          </div>
        </section>

        <section className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 pb-32 pt-8 text-center">
          <h2 className="font-display text-3xl font-semibold text-mist-100 sm:text-5xl">
            Ready to <span className="text-gradient">enter the universe</span>?
          </h2>
          <p className="max-w-xl text-mist-400">
            Start with Xability — the live world — or wander the demo brands to
            see the full transformation journey in action.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://xability.horizonx.site"
              className="inline-flex items-center gap-2 rounded-full bg-nebula-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-nebula-400"
            >
              Start with Xability <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <Link
              href="/xability"
              className="glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-mist-200 transition hover:text-white"
            >
              Explore demo worlds
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
