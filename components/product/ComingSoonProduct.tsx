import type { ProductPlanet } from "@/data/types";

export function ComingSoonProduct({ product }: { product: ProductPlanet }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center sm:px-8">
      <div className="glass-strong rounded-4xl p-10">
        <h2 className="font-display text-2xl font-semibold text-mist-100">
          {product.name} is still under construction
        </h2>
        <p className="mt-3 text-mist-400">
          This planet is being built as part of the HorizonX universe. In the
          meantime, explore Xability — the first HorizonX product, live
          today with 5 demo brand worlds.
        </p>
      </div>
    </div>
  );
}
