"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Orbit, Search, X } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { ProductPlanet } from "@/data/types";
import { EmblemImage } from "./EmblemImage";

export interface ShowcaseCard {
  id: ProductPlanet["id"];
  slug: string;
  name: string;
  tagline: string;
  description: string;
  color: string;
  accentColor: string;
  status: "live" | "coming-soon";
  industries: string[];
  /** Everything searchable about this product, pre-joined server-side. */
  haystack: string;
}

/**
 * The showroom gallery with find-ability: free-text search plus an
 * industry filter over the demo businesses each product showcases. All
 * client-side — five products need no server round trip.
 */
export function ShowcaseExplorer({ cards }: { cards: ShowcaseCard[] }) {
  const { dict } = useLocale();
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState<string | null>(null);

  const industries = useMemo(() => {
    const all = new Set<string>();
    for (const card of cards) for (const item of card.industries) all.add(item);
    return [...all].sort((a, b) => a.localeCompare(b));
  }, [cards]);

  const visible = cards.filter((card) => {
    if (industry && !card.industries.includes(industry)) return false;
    const q = query.trim().toLowerCase();
    if (q && !card.haystack.toLowerCase().includes(q)) return false;
    return true;
  });

  const hasFilters = query.trim() !== "" || industry !== null;

  return (
    <div className="flex flex-col gap-6">
      {/* Search */}
      <div className="relative mx-auto w-full max-w-xl">
        <Search
          className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label={dict.showcaseIndex.searchLabel}
          placeholder={dict.showcaseIndex.searchPlaceholder}
          className="glass h-12 w-full rounded-full bg-transparent ps-11 pe-4 text-sm text-mist-100 placeholder:text-mist-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-nebula-400"
        />
      </div>

      {/* Industry filter */}
      <div
        role="group"
        aria-label={dict.showcaseIndex.industryLabel}
        className="flex flex-wrap items-center justify-center gap-2"
      >
        <button
          type="button"
          onClick={() => setIndustry(null)}
          aria-pressed={industry === null}
          className={`min-h-[36px] rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
            industry === null
              ? "bg-nebula-500/20 text-mist-100 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.5)]"
              : "glass text-mist-400 hover:text-mist-200"
          }`}
        >
          {dict.showcaseIndex.allIndustries}
        </button>
        {industries.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setIndustry(industry === item ? null : item)}
            aria-pressed={industry === item}
            className={`min-h-[36px] rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              industry === item
                ? "bg-nebula-500/20 text-mist-100 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.5)]"
                : "glass text-mist-400 hover:text-mist-200"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {visible.map((card) => (
          <Link
            key={card.id}
            href={`/showcase/${card.slug}`}
            className="glass-strong group flex h-full gap-5 rounded-[2rem] p-6 transition hover:-translate-y-1 hover:border-white/20"
            style={{ boxShadow: `0 0 0 1px ${card.color}2e, 0 0 56px -22px ${card.color}66` }}
          >
            <EmblemImage
              planet={{ id: card.id, color: card.color, accentColor: card.accentColor, name: card.name, status: card.status }}
              size={72}
              className="shrink-0 self-start"
            />
            <span className="flex min-w-0 flex-col gap-2">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-display text-xl font-semibold text-mist-100">{card.name}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-wider ${
                    card.status === "live" ? "bg-white/10 text-mist-200" : "bg-white/5 text-mist-500"
                  }`}
                >
                  {card.status === "live" ? dict.common.live : dict.common.preview}
                </span>
              </span>
              <span className="text-sm font-medium text-mist-300">{card.tagline}</span>
              <span className="text-sm text-mist-500">{card.description}</span>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-mist-200 transition-all group-hover:gap-2.5 group-hover:text-white">
                {dict.common.enterShowcase} <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </span>
          </Link>
        ))}

        {visible.length > 0 && (
          <Link
            href="/"
            className="glass group flex h-full min-h-[180px] flex-col items-center justify-center gap-3 rounded-[2rem] p-6 text-center transition hover:border-white/20"
          >
            <Orbit className="h-8 w-8 text-nebula-400 transition group-hover:rotate-45" aria-hidden />
            <span className="font-display text-lg font-semibold text-mist-100">
              {dict.showcaseIndex.returnCardTitle}
            </span>
            <span className="text-sm text-mist-500">{dict.showcaseIndex.returnCardBody}</span>
          </Link>
        )}
      </div>

      {/* Empty state with a way out — never a dead end. */}
      {visible.length === 0 && (
        <div className="glass mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-[2rem] px-6 py-12 text-center">
          <p className="text-sm text-mist-400">{dict.showcaseIndex.noResults}</p>
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setIndustry(null);
              }}
              className="glass flex min-h-[44px] items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold text-mist-200 transition hover:text-white"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
              {dict.showcaseIndex.clearFilters}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
