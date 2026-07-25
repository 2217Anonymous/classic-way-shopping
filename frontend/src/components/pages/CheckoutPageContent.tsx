"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Container from "@/components/ui/Container";
import Rating from "@/components/ui/Rating";
import { getCartId } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { createOrder, previewCheckout } from "@/services/checkout";
import { applyCoupon } from "@/services/coupons";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearCart, clearCartRemote, selectCartItems, selectCartTotal } from "@/store/slices/cartSlice";
import { selectIsAuthenticated } from "@/store/slices/authSlice";

export default function CheckoutPageContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartTotal);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [couponOpen, setCouponOpen] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [previewTotal, setPreviewTotal] = useState<number | null>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "razorpay">("cod");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    line1: "",
    city: "",
    postalCode: "",
    country: "India",
    state: "",
  });

  const total =
    previewTotal != null
      ? previewTotal
      : Math.max(0, subtotal + shipping + taxAmount - discount);

  const summaryItems = useMemo(() => items, [items]);

  useEffect(() => {
    if (items.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const cartId = getCartId();
        const preview = await previewCheckout({
          cart_id: cartId ? Number(cartId) : null,
          coupon_code: coupon.trim() || null,
          payment_method: paymentMethod,
        });
        if (cancelled) return;
        setTaxAmount(Number(preview.tax_amount) || 0);
        setShipping(Number(preview.shipping_amount) || 0);
        setDiscount(Number(preview.discount_amount) || 0);
        setPreviewTotal(Number(preview.total) || 0);
      } catch {
        if (!cancelled) {
          setPreviewTotal(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [items.length, coupon, paymentMethod]);

  const onApplyCoupon = async (e: FormEvent) => {
    e.preventDefault();
    setCouponMessage(null);
    try {
      const cartId = getCartId();
      const result = await applyCoupon(coupon.trim(), cartId ? Number(cartId) : null);
      setDiscount(Number(result.discount_amount) || 0);
      setCouponMessage(result.message || "Coupon applied");
      try {
        const preview = await previewCheckout({
          cart_id: cartId ? Number(cartId) : null,
          coupon_code: coupon.trim() || null,
          payment_method: paymentMethod,
        });
        setTaxAmount(Number(preview.tax_amount) || 0);
        setShipping(Number(preview.shipping_amount) || 0);
        setDiscount(Number(preview.discount_amount) || Number(result.discount_amount) || 0);
        setPreviewTotal(Number(preview.total) || 0);
      } catch {
        setPreviewTotal(null);
      }
    } catch (err) {
      setDiscount(0);
      setCouponMessage(err instanceof Error ? err.message : "Invalid coupon");
    }
  };

  const onPlaceOrder = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    const fullName = `${form.firstName} ${form.lastName}`.trim();
    if (!fullName || !form.phone || !form.line1 || !form.city || !form.state || !form.postalCode) {
      setError("Please fill in all required billing fields.");
      return;
    }

    setSubmitting(true);
    try {
      const cartId = getCartId();
      const order = await createOrder({
        cart_id: cartId ? Number(cartId) : null,
        coupon_code: coupon.trim() || null,
        payment_method: paymentMethod,
        notes: notes || null,
        address: {
          full_name: fullName,
          phone: form.phone,
          line1: form.line1,
          city: form.city,
          state: form.state,
          postal_code: form.postalCode,
          country: form.country || "India",
        },
      });
      setOrderNumber(order.order_number);
      void dispatch(clearCartRemote());
      dispatch(clearCart());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (orderNumber) {
    return (
      <>
        <Breadcrumb title="Checkout" items={[{ label: "Checkout" }]} />
        <section className="section-checkout padding-tb-50">
          <Container>
            <div className="max-w-lg mx-auto text-center border border-bb-border rounded-xl p-10 bg-white">
              <i className="ri-checkbox-circle-line text-5xl text-bb-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Order placed successfully</h2>
              <p className="text-sm text-bb-muted mb-6">
                Your order number is <strong className="text-bb-text">{orderNumber}</strong>
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href={`/track-order?order=${encodeURIComponent(orderNumber)}`} className="bb-btn-2">
                  Track Order
                </Link>
                <button type="button" className="bb-btn-2" onClick={() => router.push("/")}>
                  Continue Shopping
                </button>
              </div>
            </div>
          </Container>
        </section>
      </>
    );
  }

  if (summaryItems.length === 0) {
    return (
      <>
        <Breadcrumb title="Checkout" items={[{ label: "Checkout" }]} />
        <section className="section-checkout padding-tb-50">
          <Container>
            <div className="text-center py-16 border border-dashed border-bb-border rounded-xl">
              <i className="ri-shopping-cart-line text-5xl text-bb-muted mb-4" />
              <p className="text-bb-muted mb-4">Your cart is empty. Add products before checkout.</p>
              <Link href="/shop/left-sidebar-col-3" className="bb-btn bb-btn-1">
                Continue Shopping
              </Link>
            </div>
          </Container>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title="Checkout" items={[{ label: "Checkout" }]} />

      <section className="section-checkout padding-tb-50">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-[-24px]">
            <div className="lg:col-span-4 mb-6">
              <div className="bb-checkout-sidebar">
                <div className="checkout-items">
                  <div className="sub-title">
                    <h4>summary</h4>
                  </div>
                  <div className="checkout-summary">
                    <ul>
                      <li>
                        <span className="left-item">sub-total</span>
                        <span>{formatPrice(subtotal)}</span>
                      </li>
                      <li>
                        <span className="left-item">Delivery Charges</span>
                        <span>{formatPrice(shipping)}</span>
                      </li>
                      <li>
                        <span className="left-item">Tax</span>
                        <span>{formatPrice(taxAmount)}</span>
                      </li>
                      <li>
                        <span className="left-item">Coupon Discount</span>
                        <span>
                          <button
                            type="button"
                            className="apply drop-coupon"
                            onClick={() => setCouponOpen((v) => !v)}
                          >
                            {discount > 0 ? `−${formatPrice(discount)}` : "Apply Coupon"}
                          </button>
                        </span>
                      </li>
                      {couponOpen && (
                        <li>
                          <div className="coupon-down-box">
                            <form onSubmit={onApplyCoupon}>
                              <input
                                className="bb-coupon"
                                type="text"
                                placeholder="Enter Your coupon Code"
                                value={coupon}
                                onChange={(e) => setCoupon(e.target.value)}
                                required
                              />
                              <button className="bb-btn-2" type="submit">
                                Apply
                              </button>
                            </form>
                            {couponMessage && (
                              <p className="text-xs mt-2 text-bb-muted">{couponMessage}</p>
                            )}
                          </div>
                        </li>
                      )}
                      <li>
                        <span className="left-item">Total</span>
                        <span>{formatPrice(total)}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bb-checkout-pro">
                    {summaryItems.map((product) => (
                      <div key={`${product.id}-${product.selectedSize ?? ""}`} className="pro-items">
                        <div className="image">
                          <Image
                            src={product.image}
                            alt={product.title}
                            width={100}
                            height={100}
                          />
                        </div>
                        <div className="items-contact">
                          <h4>
                            <Link href={`/product/${product.slug}`}>{product.title}</Link>
                          </h4>
                          <Rating rating={product.rating} />
                          <div className="inner-price">
                            <span className="new-price">{formatPrice(product.price)}</span>
                            {product.oldPrice != null && (
                              <span className="old-price">{formatPrice(product.oldPrice)}</span>
                            )}
                          </div>
                          <p className="text-xs text-bb-muted mt-1">
                            Qty: {product.quantity}
                            {product.selectedSize ? ` · Size: ${product.selectedSize}` : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="checkout-items">
                  <div className="sub-title">
                    <h4>Payment Method</h4>
                  </div>
                  <div className="checkout-method">
                    <div className="bb-del-option">
                      <div className="inner-del">
                        <div className="radio-itens">
                          <input
                            type="radio"
                            id="Cash1"
                            name="radio-itens"
                            checked={paymentMethod === "cod"}
                            onChange={() => setPaymentMethod("cod")}
                          />
                          <label htmlFor="Cash1">Cash On Delivery</label>
                        </div>
                      </div>
                      <div className="inner-del">
                        <div className="radio-itens">
                          <input
                            type="radio"
                            id="Razor1"
                            name="radio-itens"
                            checked={paymentMethod === "razorpay"}
                            onChange={() => setPaymentMethod("razorpay")}
                          />
                          <label htmlFor="Razor1">Razorpay</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="about-order">
                    <h5>Add Comments About Your Order</h5>
                    <textarea
                      name="payment-comment"
                      placeholder="Comments"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 mb-6">
              <div className="bb-checkout-contact">
                {!isAuthenticated && (
                  <>
                    <div className="main-title">
                      <h4>Returning Customer</h4>
                    </div>
                    <p className="mb-4 text-sm text-bb-muted">
                      Already have an account?{" "}
                      <Link href="/login" className="text-bb-primary hover:underline">
                        Login
                      </Link>{" "}
                      for a faster checkout.
                    </p>
                  </>
                )}

                <div className="main-title">
                  <h4>Billing Details</h4>
                </div>

                {error && (
                  <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="input-box-form">
                  <form onSubmit={onPlaceOrder}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                      <div className="input-item lg:pr-3">
                        <label>First Name *</label>
                        <input
                          type="text"
                          placeholder="Enter your First Name"
                          required
                          value={form.firstName}
                          onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                        />
                      </div>
                      <div className="input-item lg:pl-3">
                        <label>Last Name *</label>
                        <input
                          type="text"
                          placeholder="Enter your Last Name"
                          required
                          value={form.lastName}
                          onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                        />
                      </div>
                      <div className="input-item lg:col-span-2">
                        <label>Phone *</label>
                        <input
                          type="tel"
                          placeholder="Phone number"
                          required
                          value={form.phone}
                          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        />
                      </div>
                      <div className="input-item lg:col-span-2">
                        <label>Address *</label>
                        <input
                          type="text"
                          placeholder="Address Line 1"
                          required
                          value={form.line1}
                          onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
                        />
                      </div>
                      <div className="input-item lg:pr-3">
                        <label>City *</label>
                        <input
                          type="text"
                          placeholder="City"
                          required
                          value={form.city}
                          onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                        />
                      </div>
                      <div className="input-item lg:pl-3">
                        <label>Post Code *</label>
                        <input
                          type="text"
                          placeholder="Post Code"
                          required
                          value={form.postalCode}
                          onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
                        />
                      </div>
                      <div className="input-item lg:pr-3">
                        <label>Country *</label>
                        <input
                          type="text"
                          placeholder="Country"
                          required
                          value={form.country}
                          onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                        />
                      </div>
                      <div className="input-item lg:pl-3">
                        <label>Region State *</label>
                        <input
                          type="text"
                          placeholder="Region/State"
                          required
                          value={form.state}
                          onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                        />
                      </div>
                      <div className="lg:col-span-2">
                        <div className="input-button !mb-0">
                          <button type="submit" className="bb-btn-2" disabled={submitting}>
                            {submitting ? "Placing Order..." : "Place Order"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
