"use client";

import { useState } from "react";
import { Moon, Sun, Monitor, Smartphone } from "lucide-react";
import { BrowserFrame } from "../frames";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { onAccent } from "@/lib/color";
import type { SiteTemplate } from "@/data/types";

/**
 * Live website previews: switch between realistic templates, flip dark /
 * light mode, and toggle desktop / mobile — demonstrating theming and
 * responsive delivery interactively rather than with screenshots.
 */
export function XsiteDemo({ templates }: { templates: SiteTemplate[] }) {
  const { dict } = useLocale();
  const labels = dict.demos.xsite;
  const kindLabels: Record<SiteTemplate["kind"], string> = {
    business: labels.kindBusiness,
    corporate: labels.kindCorporate,
    ecommerce: labels.kindEcommerce,
    landing: labels.kindLanding,
  };
  const [activeId, setActiveId] = useState(templates[0]?.id);
  const [dark, setDark] = useState(true);
  const [mobile, setMobile] = useState(false);

  const template = templates.find((t) => t.id === activeId) ?? templates[0];
  if (!template) return null;

  const surface = dark ? template.palette.surface : "#f7f7f5";
  const text = dark ? "#f2f3f7" : "#16181d";
  const subtext = dark ? "#9aa1af" : "#5c6470";
  const cardBg = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.045)";

  return (
    <div className="flex flex-col gap-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label={labels.templatesAria}>
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={t.id === template.id}
              onClick={() => setActiveId(t.id)}
              className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                t.id === template.id ? "text-white" : "glass text-mist-400 hover:text-mist-200"
              }`}
              style={t.id === template.id ? { backgroundColor: `${t.palette.primary}33`, boxShadow: `inset 0 0 0 1px ${t.palette.primary}66` } : undefined}
            >
              {t.businessName}
              {/* Own color tier, not opacity — translucent text can't
                  hold AA contrast. */}
              <span className="ms-1.5 text-[10px] uppercase tracking-wide text-mist-500">{kindLabels[t.kind]}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDark((v) => !v)}
            aria-pressed={!dark}
            className="glass flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium text-mist-300 transition hover:text-white"
          >
            {dark ? <Sun className="h-3.5 w-3.5" aria-hidden /> : <Moon className="h-3.5 w-3.5" aria-hidden />}
            {dark ? labels.lightMode : labels.darkMode}
          </button>
          <button
            type="button"
            onClick={() => setMobile((v) => !v)}
            aria-pressed={mobile}
            className="glass flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium text-mist-300 transition hover:text-white"
          >
            {mobile ? <Monitor className="h-3.5 w-3.5" aria-hidden /> : <Smartphone className="h-3.5 w-3.5" aria-hidden />}
            {mobile ? labels.desktop : labels.mobile}
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="flex justify-center">
        <BrowserFrame
          url={`https://${template.businessName.toLowerCase().replace(/[^a-z]+/g, "")}.com`}
          className={`w-full transition-all duration-500 ${mobile ? "max-w-sm" : "max-w-4xl"}`}
        >
          <div className="transition-colors duration-500" style={{ backgroundColor: surface, color: text }}>
            {/* Site nav */}
            <div className="flex items-center justify-between px-6 py-4">
              <span className="font-display text-sm font-bold" style={{ color: template.palette.primary }}>
                {template.businessName}
              </span>
              {!mobile && (
                <span className="flex gap-4 text-[11px]" style={{ color: subtext }}>
                  {template.navLabels.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </span>
              )}
              <span
                className="rounded-full px-3 py-1.5 text-[10px] font-semibold"
                style={{ backgroundColor: template.palette.primary, color: onAccent(template.palette.primary) }}
              >
                {template.heroCta}
              </span>
            </div>

            {/* Site hero */}
            <div className={`px-6 ${mobile ? "py-10 text-center" : "py-16 text-center"}`}>
              <h3 className={`font-display font-semibold leading-tight ${mobile ? "text-xl" : "text-3xl"}`}>
                {template.heroTitle}
              </h3>
              <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed" style={{ color: subtext }}>
                {template.heroSubtitle}
              </p>
              <span
                className="mt-5 inline-block rounded-full px-5 py-2 text-xs font-semibold"
                style={{ backgroundColor: template.palette.primary, color: onAccent(template.palette.primary) }}
              >
                {template.heroCta}
              </span>
            </div>

            {/* Section blocks */}
            <div className={`grid gap-3 px-6 pb-10 ${mobile ? "grid-cols-1" : "grid-cols-4"}`}>
              {template.sections.map((section) => (
                <div key={section} className="rounded-xl p-4" style={{ backgroundColor: cardBg }}>
                  <div className="mb-2 h-8 w-8 rounded-lg" style={{ backgroundColor: `${template.palette.primary}33` }} aria-hidden />
                  <p className="text-[11px] font-semibold">{section}</p>
                  <p className="mt-1 text-[10px] leading-relaxed" style={{ color: subtext }}>
                    {labels.cmsNote}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </BrowserFrame>
      </div>

      {/* Feature chips for the active template */}
      <div className="flex flex-wrap justify-center gap-2">
        {template.features.map((feature) => (
          <span key={feature} className="rounded-full bg-white/5 px-3 py-1.5 text-[11px] font-medium text-mist-300">
            {feature}
          </span>
        ))}
      </div>
    </div>
  );
}
