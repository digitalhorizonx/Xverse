import Link from "next/link";
import { getDict } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n/config";
import type { Brand } from "@/data/types";
import type { ProductPlanet } from "@/data/types";

export function BrandFooterCta({ brand, product }: { brand: Brand; product: ProductPlanet }) {
  const { dict } = getDict();
  const vars = { brand: brand.name, product: product.name };

  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-16 text-center sm:px-8">
      <div className="glass-strong rounded-4xl p-10">
        <p className="text-xs uppercase tracking-[0.25em] text-mist-500">
          {fmt(dict.brandWorlds.conceptNote, vars)}
        </p>
        <h2 className="mt-3 font-display text-2xl font-semibold text-mist-100 sm:text-3xl">
          {fmt(dict.brandWorlds.couldBuild, vars)}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-mist-400">{dict.brandWorlds.readyBody}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={product.ctaUrl}
            className="inline-flex items-center justify-center rounded-full bg-brand-gradient px-8 py-3.5 text-sm font-semibold text-ink-950 transition hover:opacity-90"
          >
            {dict.cta.startWithXability}
          </Link>
          <Link
            href={`/showcase/${product.showcaseSlug}`}
            className="glass inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-semibold text-mist-200 transition hover:text-white"
          >
            {fmt(dict.showcase.backToShowcase, vars)}
          </Link>
        </div>
      </div>
    </section>
  );
}
