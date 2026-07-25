import { Suspense } from "react";
import ProductPageClient from "@/components/product/ProductPageClient";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <Suspense fallback={<div className="py-20 text-center text-bb-muted">Loading product...</div>}>
      <ProductPageClient slug={slug} />
    </Suspense>
  );
}
