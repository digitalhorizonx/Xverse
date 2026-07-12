import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getProduct } from "@/data/products";

interface ProductPageProps {
  params: { product: string };
}

/**
 * Legacy product URLs (/xability, /xsite, …) now live at
 * /showcase/<slug>. The five known ids get real 308s from
 * next.config.mjs; this page only backstops anything that slips through
 * and 404s the rest. Decided in generateMetadata so the status commits
 * before app/loading.tsx streams a 200 shell.
 */
export function generateMetadata({ params }: ProductPageProps): Metadata {
  const product = getProduct(params.product);
  if (!product) notFound();
  redirect(`/showcase/${product.showcaseSlug}`);
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = getProduct(params.product);
  if (!product) {
    notFound();
  }
  redirect(`/showcase/${product.showcaseSlug}`);
}
