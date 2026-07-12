import { notFound, redirect } from "next/navigation";
import { PRODUCTS, getProduct } from "@/data/products";

interface ProductPageProps {
  params: { product: string };
}

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ product: product.id }));
}

/**
 * Legacy product URLs (/xability, /xsite, …) now live at
 * /showcase/<slug> — redirect so old links, planets bookmarks, and
 * external references never dead-end. Brand worlds remain at
 * /[product]/[brand].
 */
export default function ProductPage({ params }: ProductPageProps) {
  const product = getProduct(params.product);
  if (!product) {
    notFound();
  }
  redirect(`/showcase/${product.showcaseSlug}`);
}
