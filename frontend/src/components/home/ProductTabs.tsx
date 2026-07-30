"use client";

import { useEffect, useMemo, useState } from "react";
import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";
import ProductGrid from "@/components/product/ProductGrid";
import { cn } from "@/lib/utils";
import { getFeatured, getNewArrivals } from "@/services/products";
import type { Product } from "@/types";

const tabs = [
  { id: "all", label: "All" },
  { id: "featured", label: "Featured" },
  { id: "new", label: "New" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function ProductTabs() {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [feat, arrivals] = await Promise.all([
          getFeatured(12),
          getNewArrivals(12),
        ]);
        if (cancelled) return;
        setFeatured(feat);
        setNewArrivals(arrivals);
        const merged = [...arrivals];
        feat.forEach((p) => {
          if (!merged.some((m) => String(m.id) === String(p.id))) merged.push(p);
        });
        setAllProducts(merged);
      } catch {
        if (!cancelled) {
          setFeatured([]);
          setNewArrivals([]);
          setAllProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    switch (activeTab) {
      case "featured":
        return featured;
      case "new":
        return newArrivals;
      default:
        return allProducts;
    }
  }, [activeTab, allProducts, featured, newArrivals]);

  return (
    <section className="py-10 md:py-12">
      <Container>
        <SectionTitle
          title="New"
          highlight="Arrivals"
          subtitle="Fresh picks from Classic Way"
          right={
            <ul className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer",
                      activeTab === tab.id
                        ? "bg-bb-primary text-white border-bb-primary shadow-sm"
                        : "bg-white text-bb-text border-bb-border hover:border-bb-primary hover:text-bb-primary"
                    )}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          }
        />
        {loading ? (
          <p className="text-center text-bb-muted py-10">Loading products...</p>
        ) : filteredProducts.length > 0 ? (
          <ProductGrid products={filteredProducts} columns={4} />
        ) : (
          <p className="text-center text-bb-muted py-10">No products yet</p>
        )}
      </Container>
    </section>
  );
}
