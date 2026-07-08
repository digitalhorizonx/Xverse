import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRODUCTS, getProduct } from "@/data/products";
import { getBrandsByProduct } from "@/data/brands";
import { ProductHero } from "@/components/product/ProductHero";
import { BrandCard } from "@/components/product/BrandCard";
import { ComingSoonProduct } from "@/components/product/ComingSoonProduct";

interface ProductPageProps {
  params: { product: string };
}

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ product: product.id }));
}

export function generateMetadata({ params }: ProductPageProps): Metadata {
  const product = getProduct(params.product);
  if (!product) return {};

  return {
    title: product.name,
    description: product.description,
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = getProduct(params.product);

  if (!product) {
    notFound();
  }

  const brands = getBrandsByProduct(product.id);

  return (
    <main id="main-content" className="min-h-screen bg-ink-950">
      <ProductHero product={product} />

      {product.status === "coming-soon" ? (
        <ComingSoonProduct product={product} />
      ) : (
        <section className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
          <h2 className="mb-6 font-display text-xl font-semibold text-mist-100">
            Demo brand worlds
          </h2>
          {brands.length === 0 ? (
            <p className="text-mist-400">No demo brands are published for {product.name} yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {brands.map((brand) => (
                <BrandCard key={brand.id} brand={brand} />
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
