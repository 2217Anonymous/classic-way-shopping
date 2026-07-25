"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addItemToCart,
  removeCartItem,
  selectCartItems,
  selectCartTotal,
  updateCartQty,
} from "@/store/slices/cartSlice";
import { closeCart } from "@/store/slices/uiSlice";
import Rating from "@/components/ui/Rating";
import { cn, formatPrice } from "@/lib/utils";
import { getTrending } from "@/services/products";
import type { Product } from "@/types";

export default function CartSidebar() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.ui.cartOpen);
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartTotal);
  const shippingHint = subtotal >= 999 ? 0 : 59;
  const total = subtotal + shippingHint;
  const [related, setRelated] = useState<Product | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const trending = await getTrending(1);
        if (!cancelled) setRelated(trending[0] ?? null);
      } catch {
        if (!cancelled) setRelated(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const close = () => dispatch(closeCart());

  return (
    <>
      <div
        className={cn("bb-side-cart-overlay", open && "active")}
        onClick={close}
        aria-hidden={!open}
      />
      <aside
        className={cn("bb-side-cart", open && "bb-open-cart")}
        role="dialog"
        aria-modal={open}
        aria-label="Shopping cart"
        aria-hidden={!open}
      >
        <div className="bb-side-cart-grid">
          <div className="bb-cart-related-col hidden md:flex">
            <div className="bb-top-contact">
              <div className="bb-cart-title">
                <h4>Related Items</h4>
              </div>
            </div>
            <div className="bb-cart-box cart-related bb-border-right">
              {related && (
                <div className="bb-deal-card mb-6">
                  <div className="bb-pro-box">
                    <div className="bb-pro-img">
                      {related.flag && (
                        <span className="flags">
                          <span>{related.flag}</span>
                        </span>
                      )}
                      <Link
                        href={`/product/${related.slug}`}
                        onClick={close}
                        className="block relative w-full aspect-square rounded-[15px] overflow-hidden bg-white border border-[#eee]"
                      >
                        <Image
                          src={related.image}
                          alt={related.title}
                          fill
                          className="object-cover"
                          sizes="280px"
                        />
                      </Link>
                    </div>
                    <div className="bb-pro-contact">
                      <div className="bb-pro-subtitle">
                        <Link
                          href={`/shop?category=${related.categorySlug}`}
                          onClick={close}
                          className="text-xs text-[#777] hover:text-bb-primary"
                        >
                          {related.category}
                        </Link>
                        <Rating rating={related.rating} />
                      </div>
                      <h4 className="bb-pro-title">
                        <Link href={`/product/${related.slug}`} onClick={close}>
                          {related.title}
                        </Link>
                      </h4>
                      <div className="bb-price">
                        <div className="inner-price">
                          <span className="new-price">{formatPrice(related.price)}</span>
                          {related.stock <= 5 && (
                            <span className="item-left">{related.stock} Left</span>
                          )}
                        </div>
                        <span className="last-items">{related.unit}</span>
                      </div>
                      <button
                        type="button"
                        className="bb-btn-2 mt-3 text-xs py-1.5 px-3"
                        onClick={() => {
                          void dispatch(addItemToCart({ product: related }));
                        }}
                      >
                        Add To Cart
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="bb-cart-banner">
                <div className="banner">
                  <Image
                    src="/hero/hero-2.png"
                    alt="cart-banner"
                    fill
                    className="object-cover"
                    sizes="300px"
                  />
                  <div className="detail">
                    <h4>Valaiyagam</h4>
                    <h3>Fashion</h3>
                    <Link href="/shop" onClick={close}>
                      Shop Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bb-inner-cart">
            <div className="bb-top-contact">
              <div className="bb-cart-title">
                <h4>My cart</h4>
                <button
                  type="button"
                  className="bb-cart-close"
                  title="Close Cart"
                  aria-label="Close cart"
                  onClick={close}
                />
              </div>
            </div>

            <div className="bb-cart-box item flex-1">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                  <i className="ri-shopping-cart-line text-5xl text-[#777] mb-3" />
                  <p className="text-sm text-[#686e7d] mb-4">Your cart is empty</p>
                  <Link href="/shop" onClick={close} className="bb-btn-2 text-sm">
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <ul className="bb-cart-items">
                  {items.map((item) => (
                    <li
                      key={`${item.id}-${item.selectedSize ?? "default"}`}
                      className="cart-sidebar-list"
                    >
                      <button
                        type="button"
                        className="cart-remove-item"
                        aria-label="Remove item"
                        onClick={() =>
                          void dispatch(
                            removeCartItem({
                              id: item.id,
                              selectedSize: item.selectedSize,
                              cartItemId: item.cartItemId,
                            })
                          )
                        }
                      >
                        <i className="ri-close-line" />
                      </button>
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={close}
                        className="bb-cart-pro-img"
                      >
                        <Image src={item.image} alt={item.title} width={85} height={85} />
                      </Link>
                      <div className="bb-cart-contact">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={close}
                          className="bb-cart-sub-title"
                        >
                          {item.title}
                        </Link>
                        <span className="cart-price">
                          <span className="new-price">{formatPrice(item.price)}</span>
                          {" x "}
                          {item.selectedSize || item.unit}
                        </span>
                        <div className="qty-plus-minus">
                          <button
                            type="button"
                            className="qty-btn"
                            aria-label="Decrease"
                            onClick={() =>
                              void dispatch(
                                updateCartQty({
                                  id: item.id,
                                  quantity: Math.max(1, item.quantity - 1),
                                  selectedSize: item.selectedSize,
                                  cartItemId: item.cartItemId,
                                })
                              )
                            }
                          >
                            −
                          </button>
                          <input
                            className="qty-input"
                            type="text"
                            readOnly
                            value={item.quantity}
                            aria-label="Quantity"
                          />
                          <button
                            type="button"
                            className="qty-btn"
                            aria-label="Increase"
                            onClick={() =>
                              void dispatch(
                                updateCartQty({
                                  id: item.id,
                                  quantity: item.quantity + 1,
                                  selectedSize: item.selectedSize,
                                  cartItemId: item.cartItemId,
                                })
                              )
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bb-bottom-cart">
              <div className="cart-sub-total">
                <table className="table cart-table">
                  <tbody>
                    <tr>
                      <td className="title">Sub-Total :</td>
                      <td className="price">{formatPrice(subtotal)}</td>
                    </tr>
                    <tr>
                      <td className="title">Shipping :</td>
                      <td className="price">
                        {shippingHint === 0 ? "Free" : formatPrice(shippingHint)}
                      </td>
                    </tr>
                    <tr>
                      <td className="title">Total :</td>
                      <td className="price">{formatPrice(total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="cart-btn">
                <Link href="/cart" onClick={close} className="bb-btn-1">
                  View Cart
                </Link>
                <Link href="/checkout" onClick={close} className="bb-btn-2">
                  Checkout
                </Link>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
