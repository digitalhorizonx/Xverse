export function UniverseLoading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin-slow rounded-full border-2 border-nebula-400/30 border-t-nebula-400" />
        <p className="text-sm text-mist-400">Charting the universe…</p>
      </div>
    </div>
  );
}
