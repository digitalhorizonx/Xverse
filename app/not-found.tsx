import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-ink-950 px-6 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-nebula-400">Lost in space</p>
      <h1 className="font-display text-3xl font-semibold text-mist-100 sm:text-4xl">
        This world doesn&apos;t exist — yet.
      </h1>
      <p className="max-w-md text-mist-400">
        The coordinates you followed don&apos;t map to anywhere in the HorizonX
        Universe. Head back to the Core and pick a new destination.
      </p>
      <Link
        href="/"
        className="glass rounded-full px-6 py-3 text-sm font-medium text-mist-100 transition hover:border-nebula-400/40 hover:text-white"
      >
        Return to the Universe
      </Link>
    </main>
  );
}
