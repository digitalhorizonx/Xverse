import { Universe } from "@/components/universe/Universe";

export default function HomePage() {
  return (
    <main id="main-content" className="relative min-h-screen overflow-hidden bg-ink-950">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-radial-glow-nebula" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid-lines bg-[size:64px_64px] opacity-40"
      />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 pb-8 pt-20 text-center">
        <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-mist-300">
          HorizonX Digital Universe
        </span>

        <h1 className="font-display text-4xl font-semibold leading-tight text-mist-100 sm:text-6xl">
          Enter the <span className="text-gradient">HorizonX Universe</span>
        </h1>

        <p className="max-w-xl text-balance text-lg text-mist-400">
          One digital universe. Every HorizonX product, showcased as a living
          world — demo brands, dashboards, and the full digital
          transformation journey, explorable in 3D.
        </p>

        <p className="text-xs uppercase tracking-[0.2em] text-mist-500">
          Demo Brand · Sample Experience · Illustrative Analytics
        </p>
      </div>

      <div className="relative">
        <Universe />
      </div>
    </main>
  );
}
