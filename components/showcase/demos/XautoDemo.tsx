"use client";

import { useState } from "react";
import { Car, CheckCircle2, ChevronRight, Gauge, CalendarCheck } from "lucide-react";
import { ShowcaseIcon } from "../icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { fmt } from "@/lib/i18n/config";
import type { AutoService, VehicleListing } from "@/data/types";

// Theme tokens, not fixed hex — the chips re-tune for light mode.
const STATUS_CLASSES: Record<VehicleListing["status"], string> = {
  available: "bg-teal-500/15 text-teal-300",
  reserved: "bg-white/10 text-mist-400",
  "in-inspection": "bg-amber-500/15 text-amber-300",
};

/**
 * The XAuto marketplace demo: filterable vehicle listings, a working
 * service-booking stepper, and the dealer/customer dashboard duality —
 * all local-state interactions.
 */
export function XautoDemo({ vehicles, services, accent }: { vehicles: VehicleListing[]; services: AutoService[]; accent: string }) {
  const { dict } = useLocale();
  const labels = dict.demos.xauto;
  const [filter, setFilter] = useState<"all" | VehicleListing["status"]>("all");
  const [bookingStep, setBookingStep] = useState(0);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const statusLabels: Record<VehicleListing["status"], string> = {
    available: labels.statusAvailable,
    reserved: labels.statusReserved,
    "in-inspection": labels.statusInInspection,
  };
  const bookingSteps = [labels.stepChooseService, labels.stepPickTime, labels.stepConfirmed];

  const visible = vehicles.filter((v) => filter === "all" || v.status === filter);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
      {/* Marketplace */}
      <div className="lg:col-span-3">
        <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label={labels.filtersAria}>
          {(["all", "available", "reserved", "in-inspection"] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              onClick={() => setFilter(key)}
              className={`min-h-[36px] rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                filter === key ? "text-white" : "glass text-mist-400 hover:text-mist-200"
              }`}
              style={filter === key ? { backgroundColor: `${accent}33`, boxShadow: `inset 0 0 0 1px ${accent}66` } : undefined}
            >
              {key === "all" ? labels.allVehicles : statusLabels[key]}
            </button>
          ))}
        </div>

        <ul className="flex flex-col gap-3">
          {visible.map((vehicle) => (
            <li key={vehicle.id} className="glass-strong flex items-center gap-4 rounded-3xl p-4 transition hover:border-white/20">
              <span className="flex h-14 w-20 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: `${vehicle.color}1c` }}>
                <Car className="h-7 w-7" style={{ color: vehicle.color }} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-sm font-semibold text-mist-100">
                  {vehicle.name} <span className="font-normal text-mist-500">· {vehicle.year}</span>
                </span>
                <span className="mt-0.5 flex items-center gap-3 text-[11px] text-mist-500">
                  <span className="flex items-center gap-1"><Gauge className="h-3 w-3" aria-hidden />{vehicle.mileage}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide ${STATUS_CLASSES[vehicle.status]}`}>
                    {statusLabels[vehicle.status]}
                  </span>
                </span>
              </span>
              <span className="text-end">
                <span className="block font-display text-sm font-semibold text-mist-100">{vehicle.price}</span>
                <span className="text-[10px] text-mist-500">{labels.inclInspection}</span>
              </span>
            </li>
          ))}
          {visible.length === 0 && (
            <li className="glass rounded-3xl p-6 text-center text-sm text-mist-500">{labels.emptyState}</li>
          )}
        </ul>
      </div>

      {/* Service booking */}
      <div className="lg:col-span-2">
        <div className="glass-strong rounded-3xl p-6">
          <h3 className="font-display text-lg font-semibold text-mist-100">{labels.bookService}</h3>
          <ol className="mt-4 flex flex-wrap items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-mist-500">
            {bookingSteps.map((step, index) => (
              <li key={step} className="flex items-center gap-1">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] ${
                    index <= bookingStep ? "text-[#04110d]" : "bg-white/10 text-mist-400"
                  }`}
                  style={index <= bookingStep ? { backgroundColor: accent } : undefined}
                >
                  {index + 1}
                </span>
                <span className={index <= bookingStep ? "text-mist-200" : undefined}>{step}</span>
                {index < bookingSteps.length - 1 && <ChevronRight className="h-3 w-3" aria-hidden />}
              </li>
            ))}
          </ol>

          <div className="mt-5">
            {bookingStep === 0 && (
              <ul className="flex flex-col gap-2">
                {services.map((service) => (
                  <li key={service.name}>
                    <button
                      type="button"
                      onClick={() => { setSelectedService(service.name); setBookingStep(1); }}
                      className="flex w-full items-start gap-3 rounded-2xl bg-white/[0.04] p-3.5 text-start transition hover:bg-white/[0.08]"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}22` }}>
                        <ShowcaseIcon name={service.icon} className="h-[18px] w-[18px]" color={accent} />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-mist-100">{service.name}</span>
                        <span className="block text-xs text-mist-400">{service.description}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {bookingStep === 1 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-mist-400">
                  <span className="text-mist-200">{selectedService}</span> — {labels.chooseSlot}
                </p>
                {labels.slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setBookingStep(2)}
                    className="flex min-h-[44px] items-center justify-between rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-mist-200 transition hover:bg-white/[0.08]"
                  >
                    {slot}
                    <ChevronRight className="h-4 w-4 text-mist-500" aria-hidden />
                  </button>
                ))}
                <button type="button" onClick={() => setBookingStep(0)} className="mt-1 self-start text-xs text-mist-500 transition hover:text-mist-300">
                  ← {labels.backToServices}
                </button>
              </div>
            )}

            {bookingStep === 2 && (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CalendarCheck className="h-10 w-10" style={{ color: accent }} aria-hidden />
                <p className="font-display text-sm font-semibold text-mist-100">{labels.booked}</p>
                <p className="max-w-[220px] text-xs text-mist-400">
                  {fmt(labels.bookedBody, { service: selectedService ?? "" })}
                </p>
                <button
                  type="button"
                  onClick={() => { setBookingStep(0); setSelectedService(null); }}
                  className="glass min-h-[40px] rounded-full px-4 py-2 text-xs font-medium text-mist-300 transition hover:text-white"
                >
                  {labels.bookAnother}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Dealer vs customer dashboard duality — one toggle, two realities. */
export function XautoDashboards({ accent }: { accent: string }) {
  const { dict } = useLocale();
  const labels = dict.demos.xauto;
  const [view, setView] = useState<"dealer" | "customer">("dealer");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label={labels.dashboardsAria}>
        {(["dealer", "customer"] as const).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={view === key}
            onClick={() => setView(key)}
            className={`min-h-[40px] rounded-full px-5 py-2 text-xs font-semibold transition ${
              view === key ? "text-white" : "glass text-mist-400 hover:text-mist-200"
            }`}
            style={view === key ? { backgroundColor: `${accent}33`, boxShadow: `inset 0 0 0 1px ${accent}66` } : undefined}
          >
            {key === "dealer" ? labels.dealerDashboard : labels.customerDashboard}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(view === "dealer" ? labels.dealerStats : labels.customerStats).map((stat) => (
          <div key={stat.label} className="glass-strong rounded-3xl p-5 text-center">
            <p className="font-display text-2xl font-semibold text-mist-100">{stat.value}</p>
            <p className="mt-1 text-[11px] text-mist-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-mist-500">
        <CheckCircle2 className="h-3.5 w-3.5" style={{ color: accent }} aria-hidden />
        {labels.lensNote}
      </p>
    </div>
  );
}
