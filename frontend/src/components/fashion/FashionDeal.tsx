"use client";

import { useEffect, useState } from "react";
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
import { getTrending } from "@/services/products";
import type { Product } from "@/types";

const EMPTY = { days: 0, hours: 0, minutes: 0, seconds: 0 };

function getTimeLeft() {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const diff = end.getTime() - Date.now();
  if (diff <= 0) return EMPTY;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function FashionDeal() {
  const dispatch = useAppDispatch();
  const [timeLeft, setTimeLeft] = useState(EMPTY);
  const [deals, setDeals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeLeft(getTimeLeft());
    const t = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const items = await getTrending(4);
        if (!cancelled) setDeals(items);
      } catch {
        if (!cancelled) setDeals([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="section-deal padding-tb-50 bg-[#f8f8fb]">
      <Container>
        <SectionTitle
          title="Day of the"
          highlight="deal"
          subtitle="Don't wait. The time will never be just right."
          right={
            <div className="flex items-center gap-2" suppressHydrationWarning>
              {[
                [timeLeft.days, "Days"],
                [timeLeft.hours, "Hours"],
                [timeLeft.minutes, "Mins"],
                [timeLeft.seconds, "Secs"],
              ].map(([value, label], i) => (
                <div key={String(label)} className="flex items-center gap-2">
                  {i > 0 && <span className="text-bb-primary font-bold pb-5">:</span>}
                  <div className="flex flex-col items-center min-w-[56px]">
                    <span className="text-xl font-semibold text-bb-text bg-white rounded-lg px-3 py-2 border border-[#eee] tabular-nums">
                      {String(value).padStart(2, "0")}
                    </span>
                    <span className="text-xs text-[#777] mt-1 uppercase">{label}</span>
                  </div>
                </div>
              ))}
            </div>
          }
        />
        {loading ? (
          <p className="text-center text-bb-muted py-10">Loading deals...</p>
        ) : deals.length === 0 ? (
          <p className="text-center text-bb-muted py-10">No products yet</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {deals.map((p) => (
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
                    {p.stock > 0 && p.stock <= 5 && (
                      <span className="text-xs text-bb-primary ml-auto">{p.stock} Left</span>
                    )}
                    {p.stock === 0 && (
                      <span className="text-xs text-[#ff7070] ml-auto">Out Of Stock</span>
                    )}
                  </div>
                  {p.sizes && (
                    <div className="bb-pro-variation mt-3 !mb-0">
                      <ul>
                        {p.sizes.map((s, i) => (
                          <li key={s} className={cn(i === 0 && "active")}>
                            <span className="bb-opt-sz">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
