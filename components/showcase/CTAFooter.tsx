import Link from "next/link";
import { ArrowRight, Orbit } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { getPrimaryCtas } from "@/lib/cta";
import { getDict } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n/config";
import { getPublicProducts } from "@/lib/content/publicContent";
import type { ProductPlanet } from "@/data/types";

/**
 * The consistent closing block for every showcase: primary conversion
 * CTAs, cross-navigation to every other product's showcase, and a way
 * back to the universe. No showcase ends in a dead end.
 */
export function CTAFooter({ product }: { product: ProductPlanet }) {
  const { dict, locale } = getDict();
  const others = getPublicProducts(locale).filter((p) => p.id !== product.id);
  const primaryCtas = getPrimaryCtas(dict);

  return (
    <section id="cta" className="mx-auto max-w-6xl px-5 pb-28 pt-8 sm:px-8">
      <div
        className="glass-strong flex flex-col items-center gap-6 rounded-[2rem] px-6 py-14 text-center"
        style={{ boxShadow: `0 0 0 1px ${product.color}2e, 0 0 80px -30px ${product.color}66` }}
      >
        <h2 className="font-display text-3xl font-semibold text-mist-100 sm:text-4xl">
          {dict.cta.launchTitlePre} <span className="text-gradient">{dict.cta.launchTitleHighlight}</span>
        </h2>
        <p className="max-w-xl text-mist-400">{fmt(dict.cta.launchBody, { product: product.name })}</p>

        <div className="flex w-full flex-col items-stretch justify-center gap-3 min-[400px]:w-auto min-[400px]:flex-row min-[400px]:items-center min-[400px]:flex-wrap">
          {primaryCtas.map((cta, index) => (
            <ButtonLink key={cta.label} href={cta.href} external={cta.external} variant={index === 0 ? "primary" : "secondary"}>
              {cta.label} <ArrowRight className="h-4 w-4" aria-hidden />
            </ButtonLink>
          ))}
          {product.status === "live" && (
            <ButtonLink href={product.ctaUrl} external variant="secondary">
              {dict.cta.startWithXability}
            </ButtonLink>
          )}
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center gap-5">
        <span className="text-xs font-medium uppercase tracking-[0.3em] text-mist-500">
          {dict.cta.exploreAnother}
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {others.map((other) => (
            <Link
              key={other.id}
              href={`/showcase/${other.showcaseSlug}`}
              className="glass flex min-h-[44px] items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-mist-300 transition hover:border-white/25 hover:text-white"
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: other.color }} aria-hidden />
              {other.name}
            </Link>
          ))}
          <Link
            href="/"
            className="glass flex min-h-[44px] items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-mist-300 transition hover:border-white/25 hover:text-white"
          >
            <Orbit className="h-3.5 w-3.5" aria-hidden />
            {dict.common.returnToUniverse}
          </Link>
        </div>
      </div>
    </section>
  );
}
