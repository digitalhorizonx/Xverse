"use client";

import { useEffect, useState } from "react";
import type { ShowcaseSection } from "@/data/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/**
 * Sticky in-page navigation for a showcase's sections, with scroll-spy
 * highlighting — the Stripe-docs pattern, so long showcases never feel
 * like a bottomless page.
 */
export function SectionNav({ sections, accentColor }: { sections: ShowcaseSection[]; accentColor: string }) {
  const { dict } = useLocale();
  const [activeId, setActiveId] = useState(sections[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    for (const section of sections) {
      const node = document.getElementById(section.id);
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="sticky top-[52px] z-30 border-b border-white/5 bg-ink-950/85 backdrop-blur-xl">
      <nav
        aria-label={dict.sectionNav.ariaLabel}
        className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-6 py-2 sm:px-8"
      >
        {sections.map((section) => {
          const isActive = section.id === activeId;
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                isActive ? "text-white" : "text-mist-400 hover:text-mist-200"
              }`}
              style={isActive ? { backgroundColor: `${accentColor}26`, boxShadow: `inset 0 0 0 1px ${accentColor}55` } : undefined}
            >
              {section.label}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
