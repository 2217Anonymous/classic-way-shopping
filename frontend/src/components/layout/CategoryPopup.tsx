"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeCategory } from "@/store/slices/uiSlice";
import { listCategories } from "@/services/categories";
import { getFeatured } from "@/services/products";
import Rating from "@/components/ui/Rating";
import { cn, formatPrice } from "@/lib/utils";
import type { Category, Product } from "@/types";

const CATEGORY_COLORS = [
  "category-items-1",
  "category-items-2",
  "category-items-3",
  "category-items-4",
  "category-items-5",
  "category-items-6",
];

export default function CategoryPopup() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.ui.categoryOpen);
  const [categories, setCategories] = useState<Category[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cats, featured] = await Promise.all([
          listCategories(),
          getFeatured(6),
        ]);
        if (cancelled) return;
        setCategories(cats);
        setRelated(featured);
      } catch {
        if (!cancelled) {
          setCategories([]);
          setRelated([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const close = () => dispatch(closeCategory());

  return (
    <div className={cn("bb-category-sidebar", open && "active")}>
      <div className="bb-category-overlay" onClick={close} aria-hidden={!open} />
      <div
        className="category-sidebar"
        role="dialog"
        aria-modal={open}
        aria-label="Explore Categories"
        aria-hidden={!open}
      >
        <button
          type="button"
          className="bb-category-close"
          title="Close"
          aria-label="Close"
          onClick={close}
        />

        <div className="category-sidebar-inner">
          <div className="mb-6">
            <div className="sub-title">
              <h4>Explore Categories</h4>
            </div>
            {loading && categories.length === 0 ? (
              <p className="text-sm text-bb-muted py-4">Loading categories...</p>
            ) : categories.length === 0 ? (
              <p className="text-sm text-bb-muted py-4">No categories yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.slice(0, 12).map((cat, idx) => (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${cat.slug}`}
                    onClick={close}
                    className={cn(
                      "bb-category-box",
                      CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
                    )}
                  >
                    <div className="category-image">
                      <Image src={cat.image} alt={cat.name} width={65} height={65} />
                    </div>
                    <div className="category-sub-contact">
                      <h5>{cat.name}</h5>
                      <p>{String(cat.itemCount).padStart(2, "0")} items</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="sub-title">
              <h4>Related products</h4>
            </div>
            {related.length === 0 ? (
              <p className="text-sm text-bb-muted py-4">No products yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {related.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    onClick={close}
                    className="bb-category-cart"
                  >
                    <span className="pro-img">
                      <Image
                        src={product.image}
                        alt={product.title}
                        width={80}
                        height={80}
                      />
                    </span>
                    <div className="side-contact">
                      <h4>{product.title}</h4>
                      <Rating rating={product.rating} />
                      <div className="inner-price">
                        <span className="new-price">{formatPrice(product.price)}</span>
                        {product.oldPrice && (
                          <span className="old-price">{formatPrice(product.oldPrice)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
