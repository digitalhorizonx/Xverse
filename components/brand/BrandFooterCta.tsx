import Link from "next/link";
import type { Brand } from "@/data/types";
import type { ProductPlanet } from "@/data/types";

export function BrandFooterCta({ brand, product }: { brand: Brand; product: ProductPlanet }) {
  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-16 text-center sm:px-8">
      <div className="glass-strong rounded-4xl p-10">
        <p className="text-xs uppercase tracking-[0.25em] text-mist-500">
          {brand.name} is a concept business — not a real {product.name} client
        </p>
        <h2 className="mt-3 font-display text-2xl font-semibold text-mist-100 sm:text-3xl">
          This is what {product.name} could build for your business.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-mist-400">
          Ready to start your own digital transformation journey?
        </p>
        <Link
          href={product.ctaUrl}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-brand-gradient px-8 py-3.5 text-sm font-semibold text-ink-950 transition hover:opacity-90"
        >
          {product.ctaLabel}
        </Link>
      </div>
    </section>
  );
}
