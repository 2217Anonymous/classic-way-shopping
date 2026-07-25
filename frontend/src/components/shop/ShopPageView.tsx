"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import type { Product, ShopConfig } from "@/types";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Container from "@/components/ui/Container";
import ProductGrid from "@/components/product/ProductGrid";
import ShopSidebar from "./ShopSidebar";
import { cn } from "@/lib/utils";
import { listProducts } from "@/services/products";

type SortOption = "default" | "price-asc" | "price-desc" | "name";

function mapSort(sort: SortOption): string | undefined {
  switch (sort) {
    case "price-asc":
      return "price_asc";
    case "price-desc":
      return "price_desc";
    case "name":
      return "newest";
    default:
      return undefined;
  }
}

export default function ShopPageView({ config }: { config: ShopConfig }) {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const brand = searchParams.get("brand");
  const [sort, setSort] = useState<SortOption>("default");
  const [listView, setListView] = useState(config.view === "list");
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await listProducts({
          category: category ?? undefined,
          brand: brand ?? undefined,
          sort: mapSort(sort),
          limit: 48,
        });
        if (!cancelled) {
          setItems(result.items);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load products");
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [category, brand, sort]);

  const sidebar = config.sidebar ?? "left";
  const columns = config.columns ?? 4;
  const isListConfig = config.view === "list";
  const showListView = isListConfig || listView;

  const sidebarNode = sidebar !== "none" ? <ShopSidebar className="lg:sticky lg:top-24" /> : null;

  return (
    <>
      <Breadcrumb
        title={config.title ?? "Shop"}
        items={[{ label: "Shop" }]}
      />

      {config.banner && (
        <Container className="mb-8">
          <div className="relative h-48 md:h-64 rounded-xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&h=400&q=80"
              alt="Shop banner"
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <h2 className="text-2xl md:text-3xl font-semibold mb-2">Valaiyagam Fashion Deals</h2>
                <p className="text-sm md:text-base opacity-90">Premium T-shirts and apparel</p>
              </div>
            </div>
          </div>
        </Container>
      )}

      <Container className="pb-16">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-bb-border">
          <p className="text-sm text-bb-muted">
            {loading ? (
              "Loading products..."
            ) : (
              <>
                Showing <span className="text-bb-text font-medium">{items.length}</span> products
                {category && (
                  <>
                    {" "}
                    in <span className="text-bb-primary capitalize">{category.replace(/-/g, " ")}</span>
                  </>
                )}
                {brand && (
                  <>
                    {" "}
                    · brand <span className="text-bb-primary capitalize">{brand.replace(/-/g, " ")}</span>
                  </>
                )}
              </>
            )}
          </p>
          <div className="flex items-center gap-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="text-sm border border-bb-border rounded-md px-3 py-2 outline-none focus:border-bb-primary bg-white"
            >
              <option value="default">Default sorting</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
            {!isListConfig && (
              <div className="flex border border-bb-border rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setListView(false)}
                  className={cn(
                    "px-3 py-2 text-sm transition-colors",
                    !listView ? "bg-bb-primary text-white" : "bg-white text-bb-muted hover:text-bb-primary"
                  )}
                  aria-label="Grid view"
                >
                  <i className="ri-grid-fill" />
                </button>
                <button
                  type="button"
                  onClick={() => setListView(true)}
                  className={cn(
                    "px-3 py-2 text-sm transition-colors",
                    listView ? "bg-bb-primary text-white" : "bg-white text-bb-muted hover:text-bb-primary"
                  )}
                  aria-label="List view"
                >
                  <i className="ri-list-check" />
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 mb-4">{error}</p>
        )}

        <div
          className={cn(
            "grid gap-8",
            sidebar === "none" ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-[280px_1fr]"
          )}
        >
          {sidebar === "left" && sidebarNode}
          <div>
            {loading ? (
              <div className="text-center py-16 text-bb-muted">Loading products...</div>
            ) : items.length > 0 ? (
              <ProductGrid
                products={items}
                columns={columns}
                listView={showListView}
              />
            ) : (
              <div className="text-center py-16 border border-dashed border-bb-border rounded-xl">
                <i className="ri-shopping-basket-line text-4xl text-bb-muted mb-3" />
                <p className="text-bb-muted">No products yet</p>
              </div>
            )}
          </div>
          {sidebar === "right" && sidebarNode}
        </div>
      </Container>
    </>
  );
}
