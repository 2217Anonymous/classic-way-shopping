"use client";

import Link from "next/link";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Container from "@/components/ui/Container";
import ProductCard from "@/components/product/ProductCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectWishlistItems, removeFromWishlist, clearWishlist } from "@/store/slices/wishlistSlice";

export default function WishlistPageContent() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectWishlistItems);

  return (
    <>
      <Breadcrumb title="Wishlist" items={[{ label: "Wishlist" }]} />
      <Container className="pb-16">
        {items.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-bb-border rounded-xl">
            <i className="ri-heart-line text-5xl text-bb-muted mb-4" />
            <p className="text-bb-muted mb-4">Your wishlist is empty.</p>
            <Link href="/shop/left-sidebar-col-3" className="bb-btn bb-btn-1">
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-6">
              <button type="button" onClick={() => dispatch(clearWishlist())} className="bb-btn bb-btn-2 text-sm">
                Clear Wishlist
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {items.map((product) => (
                <div key={product.id} className="relative">
                  <ProductCard product={product} />
                  <button
                    type="button"
                    onClick={() => dispatch(removeFromWishlist(product.id))}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-bb-danger hover:bg-bb-danger hover:text-white transition-colors z-10"
                    aria-label="Remove from wishlist"
                  >
                    <i className="ri-close-line" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </Container>
    </>
  );
}
