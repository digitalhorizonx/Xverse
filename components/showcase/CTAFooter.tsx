import Link from "next/link";
import { ArrowRight, Orbit } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { PRIMARY_CTAS } from "@/lib/cta";
import { PRODUCTS } from "@/data/products";
import type { ProductPlanet } from "@/data/types";

/**
 * The consistent closing block for every showcase: primary conversion
 * CTAs, cross-navigation to every other product's showcase, and a way
 * back to the universe. No showcase ends in a dead end.
 */
export function CTAFooter({ product }: { product: ProductPlanet }) {
  const others = PRODUCTS.filter((p) => p.id !== product.id);

  return (
    <section id="cta" className="mx-auto max-w-6xl px-6 pb-28 pt-8 sm:px-8">
      <div
        className="glass-strong flex flex-col items-center gap-6 rounded-[2rem] px-6 py-14 text-center"
        style={{ boxShadow: `0 0 0 1px ${product.color}2e, 0 0 80px -30px ${product.color}66` }}
      >
        <h2 className="font-display text-3xl font-semibold text-mist-100 sm:text-4xl">
          Launch this for <span className="text-gradient">your business</span>
        </h2>
        <p className="max-w-xl text-mist-400">
          Everything in this showcase is what HorizonX delivers. Bring {product.name} to your
          brand — or talk it through with us first.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {PRIMARY_CTAS.map((cta) => (
            <ButtonLink key={cta.label} href={cta.href} external={cta.external} variant={cta.label === "Book a demo" ? "primary" : "secondary"}>
              {cta.label} <ArrowRight className="h-4 w-4" aria-hidden />
            </ButtonLink>
          ))}
          {product.status === "live" && (
            <ButtonLink href={product.ctaUrl} external variant="secondary">
              {product.ctaLabel}
            </ButtonLink>
          )}
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center gap-5">
        <span className="text-xs font-medium uppercase tracking-[0.3em] text-mist-500">
          Explore another product
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {others.map((other) => (
            <Link
              key={other.id}
              href={`/showcase/${other.showcaseSlug}`}
              className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-mist-300 transition hover:border-white/25 hover:text-white"
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: other.color }} aria-hidden />
              {other.name}
            </Link>
          ))}
          <Link
            href="/"
            className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-mist-300 transition hover:border-white/25 hover:text-white"
          >
            <Orbit className="h-3.5 w-3.5" aria-hidden />
            Return to Universe
          </Link>
        </div>
      </div>
    </section>
  );
}
