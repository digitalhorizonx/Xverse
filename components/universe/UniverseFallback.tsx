import Link from "next/link";
import { PRODUCTS } from "@/data/products";

/**
 * Non-3D fallback for reduced-motion preference and low-capability
 * devices. Same information and the same click-to-explore affordance as
 * the 3D scene, just laid out as a static, fully accessible grid instead
 * of an interactive canvas.
 */
export function UniverseFallback() {
  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center gap-10 px-6 py-16">
      <div className="glass flex flex-col items-center gap-2 rounded-3xl px-8 py-6 text-center">
        <span className="text-xs uppercase tracking-[0.3em] text-nebula-400">HorizonX Core</span>
        <p className="max-w-sm text-sm text-mist-400">
          The interactive 3D universe is simplified on this device. Explore each product below.
        </p>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
        {PRODUCTS.map((product) => {
          const isLive = product.status === "live";
          const card = (
            <div
              className={`glass-strong flex h-full flex-col gap-2 rounded-3xl p-6 transition ${
                "hover:border-white/20"
              }`}
              style={{ boxShadow: isLive ? `0 0 0 1px ${product.color}33` : undefined }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-mist-100">{product.name}</h3>
                {!isLive && (
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-mist-400">
                    Coming Soon
                  </span>
                )}
              </div>
              <p className="text-sm text-mist-400">{product.tagline}</p>
              <p className="text-sm text-mist-500">{product.description}</p>
            </div>
          );

          return (
            <Link key={product.id} href={`/showcase/${product.showcaseSlug}`} className="block">
              {card}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
