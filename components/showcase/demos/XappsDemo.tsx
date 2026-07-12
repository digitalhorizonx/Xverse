"use client";

import { useEffect, useState } from "react";
import { Bell, WifiOff } from "lucide-react";
import { PhoneFrame } from "../frames";
import { ShowcaseIcon } from "../icons";
import type { AppDemo } from "@/data/types";

/**
 * Live app demos in a phone frame: switch businesses, tap through real
 * screens, fire a push notification, and toggle offline mode — the
 * platform capabilities demonstrated as interactions, not bullet points.
 */
export function XappsDemo({ demos }: { demos: AppDemo[] }) {
  const [activeAppId, setActiveAppId] = useState(demos[0]?.id);
  const app = demos.find((d) => d.id === activeAppId) ?? demos[0];

  const [screenId, setScreenId] = useState(app?.screens[0]?.id);
  const [showPush, setShowPush] = useState(false);
  const [offline, setOffline] = useState(false);

  // Reset to the first screen when switching apps.
  useEffect(() => {
    setScreenId(app?.screens[0]?.id);
    setOffline(false);
  }, [app]);

  useEffect(() => {
    if (!showPush) return;
    const timer = setTimeout(() => setShowPush(false), 3200);
    return () => clearTimeout(timer);
  }, [showPush]);

  if (!app) return null;
  const screen = app.screens.find((s) => s.id === screenId) ?? app.screens[0];

  return (
    <div className="flex flex-col items-center gap-6">
      {/* App switcher */}
      <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label="App demos">
        {demos.map((demo) => (
          <button
            key={demo.id}
            type="button"
            role="tab"
            aria-selected={demo.id === app.id}
            onClick={() => setActiveAppId(demo.id)}
            className={`rounded-full px-4 py-2 text-xs font-medium transition ${
              demo.id === app.id ? "text-white" : "glass text-mist-400 hover:text-mist-200"
            }`}
            style={demo.id === app.id ? { backgroundColor: `${demo.color}33`, boxShadow: `inset 0 0 0 1px ${demo.color}66` } : undefined}
          >
            {demo.businessName}
            <span className="ms-1.5 text-[10px] uppercase tracking-wide opacity-60">{demo.category}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:gap-12">
        {/* Phone */}
        <div className="relative">
          <PhoneFrame>
            <div className="relative flex h-[430px] flex-col">
              {/* Push notification */}
              <div
                aria-live="polite"
                className={`absolute inset-x-3 top-1 z-20 transition-all duration-500 ${
                  showPush ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0"
                }`}
              >
                <div className="glass-strong flex items-start gap-2.5 rounded-2xl p-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-display text-[10px] font-bold text-[#fff]" style={{ backgroundColor: app.color }}>
                    {app.businessName.slice(0, 2).toUpperCase()}
                  </span>
                  <span>
                    <span className="block text-[11px] font-semibold text-mist-100">{app.pushNotification.title}</span>
                    <span className="block text-[10px] leading-snug text-mist-400">{app.pushNotification.body}</span>
                  </span>
                </div>
              </div>

              {/* Offline banner */}
              {offline && (
                <div className="flex items-center justify-center gap-1.5 bg-white/5 py-1.5 text-[10px] font-medium text-mist-400">
                  <WifiOff className="h-3 w-3" aria-hidden /> Offline — showing cached data
                </div>
              )}

              {/* Screen content */}
              <div className={`flex-1 overflow-hidden px-4 pt-3 transition ${offline ? "opacity-75 saturate-50" : ""}`}>
                <h4 className="font-display text-base font-semibold text-mist-100">{screen.title}</h4>
                <ul className="mt-3 flex flex-col gap-2">
                  {screen.items.map((item) => (
                    <li key={item.primary} className="flex items-center gap-3 rounded-2xl bg-white/[0.05] p-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${app.color}22` }}>
                        <ShowcaseIcon name={item.icon} className="h-4 w-4" color={app.color} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-mist-100">{item.primary}</span>
                        {item.secondary && <span className="block truncate text-[10px] text-mist-500">{item.secondary}</span>}
                      </span>
                      {item.trailing && <span className="text-[10px] font-semibold text-mist-300">{item.trailing}</span>}
                    </li>
                  ))}
                </ul>
                {screen.cta && (
                  <span
                    className="mt-3 block rounded-full py-2.5 text-center text-xs font-semibold text-[#fff]"
                    style={{ backgroundColor: app.color }}
                  >
                    {screen.cta}
                  </span>
                )}
              </div>

              {/* Tab bar */}
              <div className="flex border-t border-white/5 bg-white/[0.02]" role="tablist" aria-label="App screens">
                {app.screens.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={s.id === screen.id}
                    onClick={() => setScreenId(s.id)}
                    className={`flex-1 py-3 text-[10px] font-medium transition ${
                      s.id === screen.id ? "text-white" : "text-mist-500 hover:text-mist-300"
                    }`}
                    style={s.id === screen.id ? { color: app.color } : undefined}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </PhoneFrame>
        </div>

        {/* Capability triggers */}
        <div className="flex max-w-xs flex-col gap-3">
          <button
            type="button"
            onClick={() => setShowPush(true)}
            className="glass-strong flex items-start gap-3 rounded-3xl p-5 text-left transition hover:border-white/25"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: `${app.color}22` }}>
              <Bell className="h-5 w-5" style={{ color: app.color }} aria-hidden />
            </span>
            <span>
              <span className="block font-display text-sm font-semibold text-mist-100">Send a push notification</span>
              <span className="block text-xs text-mist-400">Behavior-driven messaging, delivered to the lock screen.</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setOffline((v) => !v)}
            aria-pressed={offline}
            className="glass-strong flex items-start gap-3 rounded-3xl p-5 text-left transition hover:border-white/25"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: `${app.color}22` }}>
              <WifiOff className="h-5 w-5" style={{ color: app.color }} aria-hidden />
            </span>
            <span>
              <span className="block font-display text-sm font-semibold text-mist-100">
                {offline ? "Back online" : "Go offline"}
              </span>
              <span className="block text-xs text-mist-400">The app keeps working from cache when the network drops.</span>
            </span>
          </button>
          <p className="px-2 text-[11px] leading-relaxed text-mist-500">
            Every demo is a real interaction — screens, tabs, notifications, and offline behavior are
            the same building blocks your app ships with, including App Store and Google Play delivery.
          </p>
        </div>
      </div>
    </div>
  );
}
