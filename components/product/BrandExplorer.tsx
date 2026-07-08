"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Brand } from "@/data/types";
import { BrandCard } from "./BrandCard";
import { cn } from "@/lib/utils";

export function BrandExplorer({ brands, productName }: { brands: Brand[]; productName: string }) {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState<string | null>(null);

  const industries = useMemo(
    () => Array.from(new Set(brands.map((brand) => brand.industry))).sort(),
    [brands],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return brands.filter((brand) => {
      const matchesIndustry = !industry || brand.industry === industry;
      const matchesQuery =
        !normalizedQuery ||
        brand.name.toLowerCase().includes(normalizedQuery) ||
        brand.industry.toLowerCase().includes(normalizedQuery) ||
        brand.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));
      return matchesIndustry && matchesQuery;
    });
  }, [brands, industry, query]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${productName} demo brands…`}
            aria-label="Search demo brands"
            className="glass w-full rounded-full py-2.5 ps-10 pe-4 text-sm text-mist-100 placeholder:text-mist-500 focus:outline-none focus:ring-2 focus:ring-nebula-400/50"
          />
        </div>

        <nav aria-label="Industry filter" className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIndustry(null)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition",
              industry === null
                ? "border-nebula-400/50 bg-nebula-500/15 text-mist-100"
                : "border-white/10 bg-white/[0.03] text-mist-400 hover:text-mist-200",
            )}
          >
            All industries
          </button>
          {industries.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setIndustry(option)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                industry === option
                  ? "border-nebula-400/50 bg-nebula-500/15 text-mist-100"
                  : "border-white/10 bg-white/[0.03] text-mist-400 hover:text-mist-200",
              )}
            >
              {option}
            </button>
          ))}
        </nav>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-strong rounded-3xl p-10 text-center">
          <p className="text-mist-300">No demo brands match your search.</p>
          <p className="mt-1 text-sm text-mist-500">Try a different term or clear the industry filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      )}
    </div>
  );
}
