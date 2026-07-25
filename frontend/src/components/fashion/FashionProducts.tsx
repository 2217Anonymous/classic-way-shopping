"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";
import Rating from "@/components/ui/Rating";
import { useAppDispatch } from "@/store/hooks";
import { addItemToCart } from "@/store/slices/cartSlice";
import { openCart, openQuickView } from "@/store/slices/uiSlice";
import { toggleWishlistItem } from "@/store/slices/wishlistSlice";
import { cn, formatPrice } from "@/lib/utils";
import { getFeatured, getNewArrivals } from "@/services/products";
import type { Product } from "@/types";

const TABS = [
  { id: "all", label: "All" },
  { id: "featured", label: "Featured" },
  { id: "new", label: "New" },
] as const;

export default function FashionProducts() {
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [arrivals, feat] = await Promise.all([
          getNewArrivals(12),
          getFeatured(12),
        ]);
        if (cancelled) return;
        setProducts(arrivals);
        setFeatured(feat);
      } catch {
        if (!cancelled) {
          setProducts([]);
          setFeatured([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const items = useMemo(() => {
    if (tab === "featured") return featured;
    if (tab === "new") return products;
    const merged = [...products];
    featured.forEach((p) => {
      if (!merged.some((m) => String(m.id) === String(p.id))) merged.push(p);
    });
    return merged;
  }, [tab, products, featured]);

  return (
    <section className="section-product-tab padding-tb-50">
      <Container>
        <SectionTitle
          title="New"
          highlight="Arrivals"
          subtitle="Shop online for new arrivals and get free shipping!"
          right={
            <ul className="flex flex-wrap gap-2 justify-end">
              {TABS.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm border transition-colors",
                      tab === t.id
                        ? "bg-bb-primary text-white border-bb-primary"
                        : "bg-white text-bb-text border-[#eee] hover:border-bb-primary hover:text-bb-primary"
                    )}
                  >
                    {t.label}
                  </button>
                </li>
              ))}
            </ul>
          }
        />
        {loading ? (
          <p className="text-center text-bb-muted py-10">Loading products...</p>
        ) : items.length === 0 ? (
          <p className="text-center text-bb-muted py-10">No products yet</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {items.map((p) => (
              <div
                key={String(p.id)}
                className="group border border-[#eee] rounded-[20px] bg-white overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-square bg-[#f8f8fb]">
                  {p.flag && (
                    <span
                      className={cn(
                        "absolute top-3 left-3 z-10 text-xs text-white px-2 py-1 rounded",
                        p.flag === "Hot" && "bg-[#ff7070]",
                        p.flag === "Sale" && "bg-[#ff9f43]",
                        p.flag === "New" && "bg-bb-primary"
                      )}
                    >
                      {p.flag}
                    </span>
                  )}
                  <Link href={`/product/${p.slug}`} className="block relative w-full h-full">
                    <Image src={p.image} alt={p.title} fill className="object-contain p-4" sizes="25vw" />
                  </Link>
                  <ul className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <li>
                      <button
                        type="button"
                        className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center hover:bg-bb-primary hover:text-white"
                        onClick={() => void dispatch(toggleWishlistItem(p))}
                      >
                        <i className="ri-heart-line" />
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center hover:bg-bb-primary hover:text-white"
                        onClick={() => dispatch(openQuickView(p))}
                      >
                        <i className="ri-eye-line" />
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center hover:bg-bb-primary hover:text-white"
                        onClick={() => {
                          void dispatch(addItemToCart({ product: p }));
                          dispatch(openCart());
                        }}
                      >
                        <i className="ri-shopping-bag-4-line" />
                      </button>
                    </li>
                  </ul>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-[#777]">{p.category}</span>
                    <Rating rating={p.rating} />
                  </div>
                  <h4 className="text-sm font-medium mb-2">
                    <Link href={`/product/${p.slug}`} className="hover:text-bb-primary line-clamp-2">
                      {p.title}
                    </Link>
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-bb-text">{formatPrice(p.price)}</span>
                    {p.oldPrice && (
                      <span className="text-xs text-[#777] line-through">{formatPrice(p.oldPrice)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
