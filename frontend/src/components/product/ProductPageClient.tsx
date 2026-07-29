"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductDetailView from "@/components/product/ProductDetailView";
import { PRODUCT_LAYOUTS } from "@/lib/shopConfig";
import { resolveProductLayout } from "@/lib/themeResolver";
import { useAppSelector } from "@/store/hooks";
import { selectTheme } from "@/store/slices/themeSlice";
import { getProductBySlug } from "@/services/products";
import type { Product, ProductLayoutConfig } from "@/types";

export default function ProductPageClient({ slug }: { slug: string }) {
  const theme = useAppSelector(selectTheme);
  const layoutHint: ProductLayoutConfig | undefined = PRODUCT_LAYOUTS[slug];
  const layout = layoutHint ?? resolveProductLayout(theme);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setMissing(false);
      try {
        // Layout demo slugs (left-sidebar, etc.) fall through to a live product when available.
        const apiProduct = await getProductBySlug(slug);
        if (!cancelled) {
          setProduct(apiProduct);
          setMissing(false);
        }
      } catch {
        if (!cancelled) {
          setProduct(null);
          setMissing(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return <div className="py-20 text-center text-bb-muted">Loading product...</div>;
  }

  if (missing || !product) {
    return (
      <div className="py-20 text-center">
        <p className="text-bb-muted mb-4">Product not found.</p>
        <Link href="/shop" className="bb-btn bb-btn-1">
          Back to Shop
        </Link>
      </div>
    );
  }

  return <ProductDetailView product={product} layout={layout} />;
}
