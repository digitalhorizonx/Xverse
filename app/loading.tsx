export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin-slow rounded-full border-2 border-nebula-400/30 border-t-nebula-400" />
        <p className="text-sm text-mist-400">Loading the universe…</p>
      </div>
    </div>
  );
}
