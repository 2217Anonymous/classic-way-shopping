"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { listBrands } from "@/services/brands";
import { listCategories } from "@/services/categories";
import { cn } from "@/lib/utils";
import type { ApiBrand } from "@/services/types";
import type { Category } from "@/types";

export default function ShopSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");
  const activeBrand = searchParams.get("brand");

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<ApiBrand[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const items = await listCategories();
        if (!cancelled) setCategories(items);
      } catch {
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setLoadingCategories(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const items = await listBrands();
        if (!cancelled) setBrands(items.filter((b) => b.is_active));
      } catch {
        if (!cancelled) setBrands([]);
      } finally {
        if (!cancelled) setLoadingBrands(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const buildFilterHref = (updates: { category?: string | null; brand?: string | null }) => {
    const params = new URLSearchParams(searchParams.toString());
    if ("category" in updates) {
      if (updates.category) params.set("category", updates.category);
      else params.delete("category");
    }
    if ("brand" in updates) {
      if (updates.brand) params.set("brand", updates.brand);
      else params.delete("brand");
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const totalItems = categories.reduce((sum, c) => sum + c.itemCount, 0);

  return (
    <aside className={cn("space-y-6", className)}>
      <div className="border border-bb-border rounded-xl bg-white p-5">
        <h4 className="text-base font-semibold text-bb-text mb-4 pb-3 border-b border-bb-border">
          Categories
        </h4>
        {loadingCategories && categories.length === 0 ? (
          <p className="text-sm text-bb-muted">Loading categories...</p>
        ) : (
          <ul className="space-y-2">
            <li>
              <Link
                href={buildFilterHref({ category: null })}
                className={cn(
                  "flex items-center justify-between text-sm py-1.5 hover:text-bb-primary transition-colors",
                  !activeCategory && "text-bb-primary font-medium"
                )}
              >
                <span>All Products</span>
                <span className="text-bb-muted text-xs">({totalItems})</span>
              </Link>
            </li>
            {categories.length === 0 ? (
              <li className="text-sm text-bb-muted py-1">No categories yet.</li>
            ) : (
              categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={buildFilterHref({ category: cat.slug })}
                    className={cn(
                      "flex items-center justify-between text-sm py-1.5 hover:text-bb-primary transition-colors",
                      activeCategory === cat.slug && "text-bb-primary font-medium"
                    )}
                  >
                    <span>{cat.name}</span>
                    <span className="text-bb-muted text-xs">({cat.itemCount})</span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      <div className="border border-bb-border rounded-xl bg-white p-5">
        <h4 className="text-base font-semibold text-bb-text mb-4 pb-3 border-b border-bb-border">
          Brands
        </h4>
        {loadingBrands && brands.length === 0 ? (
          <p className="text-sm text-bb-muted">Loading brands...</p>
        ) : brands.length === 0 ? (
          <p className="text-sm text-bb-muted">No brands yet.</p>
        ) : (
          <ul className="space-y-2">
            <li>
              <Link
                href={buildFilterHref({ brand: null })}
                className={cn(
                  "flex items-center justify-between text-sm py-1.5 hover:text-bb-primary transition-colors",
                  !activeBrand && "text-bb-primary font-medium"
                )}
              >
                <span>All Brands</span>
              </Link>
            </li>
            {brands.map((brand) => (
              <li key={brand.id}>
                <Link
                  href={buildFilterHref({ brand: brand.slug })}
                  className={cn(
                    "flex items-center justify-between text-sm py-1.5 hover:text-bb-primary transition-colors",
                    activeBrand === brand.slug && "text-bb-primary font-medium"
                  )}
                >
                  <span>{brand.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border border-bb-border rounded-xl bg-white p-5">
        <h4 className="text-base font-semibold text-bb-text mb-4 pb-3 border-b border-bb-border">
          Price
        </h4>
        <p className="text-sm text-bb-muted mb-3">Price range: ₹1 — ₹5,000</p>
        <div className="h-1.5 rounded-full bg-bb-soft relative">
          <div className="absolute inset-y-0 left-[10%] right-[30%] bg-bb-primary rounded-full" />
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-bb-muted">
          <span>₹1</span>
          <span>₹5,000</span>
        </div>
      </div>
    </aside>
  );
}
