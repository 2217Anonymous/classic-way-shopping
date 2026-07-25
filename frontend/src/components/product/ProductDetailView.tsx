"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Product, ProductLayoutConfig } from "@/types";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Container from "@/components/ui/Container";
import Rating from "@/components/ui/Rating";
import QuantityInput from "@/components/ui/QuantityInput";
import ProductGrid from "@/components/product/ProductGrid";
import ShopSidebar from "@/components/shop/ShopSidebar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addItemToCart } from "@/store/slices/cartSlice";
import { toggleWishlistItem, selectIsInWishlist } from "@/store/slices/wishlistSlice";
import { toggleCompareItem } from "@/store/slices/compareSlice";
import { openCart } from "@/store/slices/uiSlice";
import { selectIsAuthenticated } from "@/store/slices/authSlice";
import { cn, formatPrice, getDiscountPercent } from "@/lib/utils";
import { getRelatedProducts } from "@/services/products";
import { createReview, listProductReviews, type ApiReview } from "@/services/reviews";

export default function ProductDetailView({
  product,
  layout,
}: {
  product: Product;
  layout: ProductLayoutConfig;
}) {
  const dispatch = useAppDispatch();
  const inWishlist = useAppSelector(selectIsInWishlist(product.id));
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [activeImage, setActiveImage] = useState(product.image);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] ?? "");
  const [activeTab, setActiveTab] = useState("description");
  const [openAccordion, setOpenAccordion] = useState<string | null>("description");
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  const tabs = useMemo(
    () => [
      { id: "description", label: "Description" },
      { id: "info", label: "Additional Info" },
      { id: "reviews", label: `Reviews (${reviews.length})` },
    ],
    [reviews.length]
  );

  useEffect(() => {
    setActiveImage(product.image);
    setSelectedSize(product.sizes?.[0] ?? "");
    setQuantity(1);
  }, [product]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [items, productReviews] = await Promise.all([
          getRelatedProducts(product.id),
          listProductReviews(product.id),
        ]);
        if (!cancelled) {
          setRelated(items);
          setReviews(productReviews);
        }
      } catch {
        if (!cancelled) {
          setRelated([]);
          setReviews([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [product.id]);

  const onSubmitReview = async (e: FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    setReviewMessage(null);
    if (!isAuthenticated) {
      setReviewError("Please log in to leave a review.");
      return;
    }
    const productId = Number(product.id);
    if (!Number.isFinite(productId)) {
      setReviewError("Invalid product.");
      return;
    }
    setSubmittingReview(true);
    try {
      await createReview({
        product_id: productId,
        rating: reviewRating,
        title: reviewTitle.trim() || null,
        body: reviewBody.trim() || null,
      });
      setReviewMessage("Thanks! Your review was submitted and will appear after approval.");
      setReviewTitle("");
      setReviewBody("");
      setReviewRating(5);
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "Could not submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const reviewsPanel = (
    <div className="space-y-4">
      {reviews.length === 0 ? (
        <p className="text-sm text-bb-muted">No approved reviews yet.</p>
      ) : (
        reviews.map((review) => (
          <div key={review.id} className="border border-bb-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Rating rating={review.rating} />
              <span className="text-sm font-medium">
                {review.customer_name || "Customer"}
              </span>
              {review.is_verified_purchase && (
                <span className="text-xs text-bb-accent">Verified purchase</span>
              )}
            </div>
            {review.title && (
              <p className="text-sm font-medium text-bb-text mb-1">{review.title}</p>
            )}
            {review.body && <p className="text-sm text-bb-muted">{review.body}</p>}
          </div>
        ))
      )}

      <form onSubmit={onSubmitReview} className="border border-bb-border rounded-lg p-4 space-y-3">
        <h4 className="text-sm font-semibold text-bb-text">Write a review</h4>
        {!isAuthenticated && (
          <p className="text-xs text-bb-muted">
            <Link href="/login" className="text-bb-primary hover:underline">
              Log in
            </Link>{" "}
            to submit a review.
          </p>
        )}
        {reviewError && <p className="text-xs text-red-600">{reviewError}</p>}
        {reviewMessage && <p className="text-xs text-green-700">{reviewMessage}</p>}
        <label className="block text-xs text-bb-muted">
          Rating
          <select
            value={reviewRating}
            onChange={(e) => setReviewRating(Number(e.target.value))}
            className="mt-1 w-full border border-bb-border rounded-md px-3 py-2 text-sm"
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} stars
              </option>
            ))}
          </select>
        </label>
        <input
          value={reviewTitle}
          onChange={(e) => setReviewTitle(e.target.value)}
          placeholder="Title (optional)"
          className="w-full border border-bb-border rounded-md px-3 py-2 text-sm outline-none focus:border-bb-primary"
        />
        <textarea
          value={reviewBody}
          onChange={(e) => setReviewBody(e.target.value)}
          rows={3}
          placeholder="Your review"
          className="w-full border border-bb-border rounded-md px-3 py-2 text-sm outline-none focus:border-bb-primary resize-none"
        />
        <button type="submit" className="bb-btn bb-btn-1" disabled={submittingReview}>
          {submittingReview ? "Submitting..." : "Submit review"}
        </button>
      </form>
    </div>
  );

  const sidebar = layout.sidebar ?? "none";
  const discount = getDiscountPercent(product.price, product.oldPrice);
  const images = [product.image, product.hoverImage].filter(Boolean) as string[];

  const handleAddToCart = () => {
    void dispatch(
      addItemToCart({ product, quantity, selectedSize: selectedSize || undefined })
    );
    dispatch(openCart());
  };

  const sidebarNode =
    sidebar !== "none" ? <ShopSidebar className="lg:sticky lg:top-24" /> : null;

  const tabContent = (
    <>
      {activeTab === "description" && (
        <p className="text-sm text-bb-muted leading-relaxed">{product.description}</p>
      )}
      {activeTab === "info" && (
        <ul className="text-sm text-bb-muted space-y-2">
          <li><strong className="text-bb-text">SKU:</strong> {product.sku ?? "N/A"}</li>
          <li><strong className="text-bb-text">Category:</strong> {product.category}</li>
          <li><strong className="text-bb-text">Unit:</strong> {product.unit}</li>
          <li><strong className="text-bb-text">Stock:</strong> {product.stock} available</li>
          {product.tags && (
            <li>
              <strong className="text-bb-text">Tags:</strong> {product.tags.join(", ")}
            </li>
          )}
        </ul>
      )}
      {activeTab === "reviews" && reviewsPanel}
    </>
  );

  const accordionContent = tabs.map((tab) => (
    <div key={tab.id} className="border border-bb-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpenAccordion(openAccordion === tab.id ? null : tab.id)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium bg-bb-soft hover:bg-bb-border/30 transition-colors"
      >
        {tab.label}
        <i className={openAccordion === tab.id ? "ri-subtract-line" : "ri-add-line"} />
      </button>
      {openAccordion === tab.id && (
        <div className="px-4 py-4 border-t border-bb-border">
          {tab.id === "description" && (
            <p className="text-sm text-bb-muted leading-relaxed">{product.description}</p>
          )}
          {tab.id === "info" && (
            <ul className="text-sm text-bb-muted space-y-2">
              <li><strong className="text-bb-text">SKU:</strong> {product.sku ?? "N/A"}</li>
              <li><strong className="text-bb-text">Category:</strong> {product.category}</li>
              <li><strong className="text-bb-text">Unit:</strong> {product.unit}</li>
            </ul>
          )}
          {tab.id === "reviews" && reviewsPanel}
        </div>
      )}
    </div>
  ));

  return (
    <>
      <Breadcrumb
        title={product.title}
        items={[
          { label: "Shop", href: "/shop/left-sidebar-col-3" },
          { label: product.category, href: `/shop/left-sidebar-col-3?category=${product.categorySlug}` },
          { label: product.title },
        ]}
      />

      <Container className="pb-16">
        <div
          className={cn(
            "grid gap-8 mb-16",
            sidebar === "none" ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-[280px_1fr]"
          )}
        >
          {sidebar === "left" && sidebarNode}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12">
            <div>
              <div className="relative aspect-square rounded-xl overflow-hidden bg-bb-soft border border-bb-border mb-4">
                <Image src={activeImage} alt={product.title} fill className="object-cover" sizes="50vw" priority />
                {product.flag && (
                  <span className="absolute top-4 left-4 text-xs font-medium text-white bg-bb-accent px-2 py-1 rounded">
                    {product.flag}
                  </span>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-3">
                  {images.map((img) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setActiveImage(img)}
                      className={cn(
                        "relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors",
                        activeImage === img ? "border-bb-primary" : "border-bb-border"
                      )}
                    >
                      <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Link
                href={`/shop/left-sidebar-col-3?category=${product.categorySlug}`}
                className="text-xs text-bb-muted hover:text-bb-primary uppercase tracking-wide"
              >
                {product.category}
              </Link>
              <h1 className="text-2xl md:text-3xl font-semibold text-bb-text mt-2 mb-3">{product.title}</h1>
              <div className="flex items-center gap-3 mb-4">
                <Rating rating={product.rating} />
                <span className="text-xs text-bb-muted">({product.rating} rating)</span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-semibold text-bb-primary">{formatPrice(product.price)}</span>
                {product.oldPrice && (
                  <>
                    <span className="text-bb-muted line-through">{formatPrice(product.oldPrice)}</span>
                    {discount > 0 && (
                      <span className="text-xs bg-bb-danger/10 text-bb-danger px-2 py-0.5 rounded">
                        -{discount}%
                      </span>
                    )}
                  </>
                )}
              </div>
              <p className="text-sm text-bb-muted mb-6">{product.description}</p>
              <p className="text-sm mb-4">
                <span className="text-bb-muted">Availability:</span>{" "}
                <span className={product.stock > 0 ? "text-bb-accent" : "text-bb-danger"}>
                  {product.stock > 0 ? `${product.stock} In Stock` : "Out of Stock"}
                </span>
              </p>

              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <span className="text-sm font-medium block mb-2">Size:</span>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "text-sm px-4 py-1.5 rounded border transition-colors",
                          selectedSize === size
                            ? "border-bb-primary bg-bb-primary text-white"
                            : "border-bb-border hover:border-bb-primary"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <QuantityInput value={quantity} onChange={setQuantity} max={product.stock} />
                <button type="button" onClick={handleAddToCart} className="bb-btn bb-btn-1 flex-1 sm:flex-none">
                  <i className="ri-shopping-bag-line" /> Add To Cart
                </button>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-bb-border">
                <button
                  type="button"
                  onClick={() => void dispatch(toggleWishlistItem(product))}
                  className={cn(
                    "text-sm flex items-center gap-1 hover:text-bb-primary transition-colors",
                    inWishlist && "text-bb-primary"
                  )}
                >
                  <i className={inWishlist ? "ri-heart-fill" : "ri-heart-line"} /> Wishlist
                </button>
                <button
                  type="button"
                  onClick={() => void dispatch(toggleCompareItem(product))}
                  className="text-sm flex items-center gap-1 hover:text-bb-primary transition-colors"
                >
                  <i className="ri-repeat-line" /> Compare
                </button>
              </div>
            </div>
          </div>

          {sidebar === "right" && sidebarNode}
        </div>

        <div className="mb-16">
          {layout.accordion ? (
            <div className="space-y-3 max-w-3xl">{accordionContent}</div>
          ) : (
            <>
              <div className="flex border-b border-bb-border mb-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                      activeTab === tab.id
                        ? "border-bb-primary text-bb-primary"
                        : "border-transparent text-bb-muted hover:text-bb-text"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="max-w-3xl">{tabContent}</div>
            </>
          )}
        </div>

        {related.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-6">Related Products</h3>
            <ProductGrid products={related} columns={4} />
          </div>
        )}
      </Container>
    </>
  );
}
