"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import Rating from "@/components/ui/Rating";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addItemToCart } from "@/store/slices/cartSlice";
import { toggleWishlistItem, selectIsInWishlist } from "@/store/slices/wishlistSlice";
import { toggleCompareItem } from "@/store/slices/compareSlice";
import { openCart, openQuickView } from "@/store/slices/uiSlice";
import { cn } from "@/lib/utils";

export default function ProductCard({
  product,
  className,
  listView = false,
}: {
  product: Product;
  className?: string;
  listView?: boolean;
}) {
  const dispatch = useAppDispatch();
  const inWishlist = useAppSelector(selectIsInWishlist(product.id));

  const handleAddToCart = () => {
    void dispatch(addItemToCart({ product }));
    dispatch(openCart());
  };

  if (listView) {
    return (
      <div
        className={cn(
          "flex flex-col sm:flex-row gap-4 border border-bb-border rounded-xl p-4 bg-white hover:shadow-md transition-shadow",
          className
        )}
      >
        <Link
          href={`/product/${product.slug}`}
          className="relative w-full sm:w-40 h-40 shrink-0 rounded-lg overflow-hidden bg-bb-soft"
        >
          <Image src={product.image} alt={product.title} fill className="object-cover" sizes="160px" />
        </Link>
        <div className="flex-1 flex flex-col justify-center">
          <Link href={`/shop?category=${product.categorySlug}`} className="text-xs text-bb-muted hover:text-bb-primary">
            {product.category}
          </Link>
          <h4 className="text-base font-medium mt-1">
            <Link href={`/product/${product.slug}`} className="hover:text-bb-primary">
              {product.title}
            </Link>
          </h4>
          <Rating rating={product.rating} className="mt-1" />
          <p className="text-sm text-bb-muted mt-2 line-clamp-2">{product.description}</p>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-bb-primary font-semibold text-lg">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="text-bb-muted line-through text-sm">{formatPrice(product.oldPrice)}</span>
            )}
            <button type="button" onClick={handleAddToCart} className="bb-btn bb-btn-1 ml-auto text-sm py-2">
              <i className="ri-shopping-bag-line" /> Add
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative border border-bb-border rounded-xl bg-white overflow-hidden hover:shadow-lg transition-all duration-300",
        className
      )}
    >
      <div className="relative aspect-square bg-bb-soft overflow-hidden">
        {product.flag && (
          <span
            className={cn(
              "absolute top-3 left-3 z-10 text-xs font-medium text-white px-2 py-1 rounded",
              product.flag === "Hot" && "bg-bb-danger",
              product.flag === "Sale" && "bg-bb-warning",
              product.flag === "New" && "bg-bb-accent"
            )}
          >
            {product.flag}
          </span>
        )}
        <Link href={`/product/${product.slug}`} className="block relative w-full h-full">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover transition-opacity duration-300 group-hover:opacity-0"
            sizes="(max-width:768px) 50vw, 25vw"
          />
          {product.hoverImage && (
            <Image
              src={product.hoverImage}
              alt={product.title}
              fill
              className="object-cover absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              sizes="(max-width:768px) 50vw, 25vw"
            />
          )}
        </Link>
        <ul className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
          <li>
            <button
              type="button"
              title="Wishlist"
              onClick={() => void dispatch(toggleWishlistItem(product))}
              className={cn(
                "w-9 h-9 rounded-full bg-white shadow flex items-center justify-center hover:bg-bb-primary hover:text-white transition-colors",
                inWishlist && "bg-bb-primary text-white"
              )}
            >
              <i className={inWishlist ? "ri-heart-fill" : "ri-heart-line"} />
            </button>
          </li>
          <li>
            <button
              type="button"
              title="Quick View"
              onClick={() => dispatch(openQuickView(product))}
              className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center hover:bg-bb-primary hover:text-white transition-colors"
            >
              <i className="ri-eye-line" />
            </button>
          </li>
          <li>
            <button
              type="button"
              title="Compare"
              onClick={() => void dispatch(toggleCompareItem(product))}
              className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center hover:bg-bb-primary hover:text-white transition-colors"
            >
              <i className="ri-repeat-line" />
            </button>
          </li>
          <li>
            <button
              type="button"
              title="Add To Cart"
              onClick={handleAddToCart}
              className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center hover:bg-bb-primary hover:text-white transition-colors"
            >
              <i className="ri-shopping-bag-4-line" />
            </button>
          </li>
        </ul>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 mb-1">
          <Link
            href={`/shop?category=${product.categorySlug}`}
            className="text-xs text-bb-muted hover:text-bb-primary"
          >
            {product.category}
          </Link>
          <Rating rating={product.rating} />
        </div>
        <h4 className="text-sm font-medium leading-snug min-h-[40px]">
          <Link href={`/product/${product.slug}`} className="hover:text-bb-primary line-clamp-2">
            {product.title}
          </Link>
        </h4>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="text-bb-primary font-semibold">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="text-bb-muted line-through text-xs">{formatPrice(product.oldPrice)}</span>
            )}
          </div>
          <span className="text-xs text-bb-muted">{product.unit}</span>
        </div>
      </div>
    </div>
  );
}
