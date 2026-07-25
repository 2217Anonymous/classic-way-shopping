"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addItemToCart } from "@/store/slices/cartSlice";
import { closeQuickView, openCart } from "@/store/slices/uiSlice";
import Rating from "@/components/ui/Rating";
import QuantityInput from "@/components/ui/QuantityInput";
import { cn, formatPrice } from "@/lib/utils";

export default function QuickViewModal() {
  const dispatch = useAppDispatch();
  const product = useAppSelector((state) => state.ui.quickViewProduct);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes?.[0]);
      setQuantity(1);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [product]);

  if (!product) return null;

  const sizes = product.sizes ?? [];
  const activeSize = selectedSize ?? sizes[0];

  const handleAddToCart = () => {
    void dispatch(addItemToCart({ product, quantity, selectedSize: activeSize }));
    dispatch(closeQuickView());
    dispatch(openCart());
  };

  const close = () => {
    dispatch(closeQuickView());
  };

  return (
    <div className="quickview-modal active" role="dialog" aria-modal aria-label="Quick view">
      <div className="quickview-overlay" onClick={close} aria-hidden />
      <div className="modal-dialog">
        <div className="modal-content">
          <button
            type="button"
            className="qty-close"
            aria-label="Close"
            title="Close"
            onClick={close}
          />
          <div className="modal-body">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-[-24px]">
              <div className="md:col-span-5 mb-6">
                <div className="single-pro-img single-pro-img-no-sidebar">
                  <div className="single-product-scroll">
                    <div className="single-slide zoom-image-hover">
                      <Image
                        className="img-responsive"
                        src={product.image}
                        alt={product.title}
                        width={500}
                        height={500}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-7 mb-6">
                <div className="quickview-pro-content">
                  <h5 className="bb-quick-title">
                    <Link href={`/product/${product.slug}`}>{product.title}</Link>
                  </h5>
                  <div className="bb-pro-rating">
                    <Rating rating={product.rating} />
                  </div>
                  <div className="bb-quickview-desc">{product.description}</div>
                  <div className="bb-quickview-price">
                    <span className="new-price">{formatPrice(product.price)}</span>
                    {product.oldPrice && (
                      <span className="old-price">{formatPrice(product.oldPrice)}</span>
                    )}
                  </div>
                  {sizes.length > 0 && (
                    <div className="bb-pro-variation">
                      <ul>
                        {sizes.map((size) => (
                          <li key={size} className={cn(activeSize === size && "active")}>
                            <button
                              type="button"
                              className="bb-opt-sz"
                              onClick={() => setSelectedSize(size)}
                            >
                              {size}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="bb-quickview-qty">
                    <QuantityInput value={quantity} onChange={setQuantity} />
                    <div className="bb-quickview-cart">
                      <button type="button" className="bb-btn-1" onClick={handleAddToCart}>
                        <i className="ri-shopping-bag-line" /> Add To Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
