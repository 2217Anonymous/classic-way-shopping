"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Container from "@/components/ui/Container";
import OrderInvoice from "@/components/orders/OrderInvoice";
import { useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated } from "@/store/slices/authSlice";
import { cancelOrder, getOrder } from "@/services/orders";
import type { ApiOrder } from "@/services/types";
import { formatPrice } from "@/lib/utils";
import { ApiError, mediaUrl } from "@/lib/api";

const CANCELLABLE = new Set(["draft", "pending", "paid"]);

function statusClass(status: string) {
  const value = status.toLowerCase();
  if (value === "cancelled") return "bg-red-50 text-red-700 border-red-200";
  if (value === "delivered" || value === "completed") {
    return "bg-green-50 text-green-700 border-green-200";
  }
  if (value === "shipped" || value === "processing") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }
  if (value === "refunded" || value === "returned") {
    return "bg-orange-50 text-orange-700 border-orange-200";
  }
  return "bg-amber-50 text-amber-800 border-amber-200";
}

function statusLabel(value: string | null | undefined) {
  if (!value) return "Update";
  return value.replace(/_/g, " ");
}

function money(value: number | string) {
  return formatPrice(Number(value));
}

function paymentLabel(method: string) {
  if (method.toLowerCase() === "cod") return "Cash on Delivery";
  if (method.toLowerCase() === "razorpay") return "Razorpay";
  return method;
}

type Props = {
  orderId: string;
};

export default function OrderDetailPageContent({ orderId }: Props) {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authStatus = useAppSelector((state) => state.auth.status);
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrder(orderId);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load order");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (authStatus === "idle" || authStatus === "loading") return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    let active = true;
    (async () => {
      try {
        const data = await getOrder(orderId);
        if (!active) return;
        setOrder(data);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Unable to load order");
        setOrder(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [authStatus, isAuthenticated, orderId, router]);

  const onCancel = async () => {
    if (!order) return;
    const reason = window.prompt(
      `Cancel order #${order.order_number}? Optionally enter a reason:`,
      ""
    );
    if (reason === null) return;
    setActionError(null);
    setCancelling(true);
    try {
      const updated = await cancelOrder(order.id, reason.trim() || undefined);
      setOrder(updated);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Unable to cancel order";
      setActionError(message);
    } finally {
      setCancelling(false);
    }
  };

  const onPrintInvoice = () => {
    window.print();
  };

  if (authStatus === "idle" || authStatus === "loading" || !isAuthenticated) {
    return (
      <>
        <Breadcrumb
          title="Order Details"
          items={[{ label: "My Orders", href: "/orders" }, { label: "Order Details" }]}
        />
        <Container className="pb-16">
          <p className="text-center text-bb-muted py-16">Loading...</p>
        </Container>
      </>
    );
  }

  const canCancel = order ? CANCELLABLE.has(order.status.toLowerCase()) : false;
  const history = order?.status_history ?? [];

  return (
    <>
      <div className="no-print">
        <Breadcrumb
          title="Order Details"
          items={[
            { label: "My Orders", href: "/orders" },
            { label: order ? `#${order.order_number}` : "Order Details" },
          ]}
        />
      </div>

      <Container className="pb-16">
        {loading ? (
          <p className="no-print text-center text-bb-muted py-16">Loading order...</p>
        ) : error ? (
          <div className="no-print text-center py-16">
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button type="button" className="bb-btn bb-btn-1" onClick={() => void loadOrder()}>
                Try again
              </button>
              <Link href="/orders" className="bb-btn bb-btn-2">
                Back to orders
              </Link>
            </div>
          </div>
        ) : !order ? null : (
          <>
            <div className="no-print">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-bb-muted mb-1">
                    <Link href="/orders" className="hover:text-bb-primary">
                      ← My Orders
                    </Link>
                  </p>
                  <h1 className="text-2xl font-semibold text-bb-text">
                    Order #{order.order_number}
                  </h1>
                  <p className="mt-1 text-sm text-bb-muted">
                    Placed {new Date(order.created_at).toLocaleString()}
                    {order.updated_at && (
                      <> · Updated {new Date(order.updated_at).toLocaleString()}</>
                    )}
                  </p>
                  <span
                    className={`mt-3 inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusClass(order.status)}`}
                  >
                    {statusLabel(order.status)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md border border-bb-border px-3 py-2 text-sm hover:border-bb-primary hover:text-bb-primary"
                    onClick={onPrintInvoice}
                  >
                    <i className="ri-printer-line mr-1.5" />
                    Print
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md border border-bb-border px-3 py-2 text-sm hover:border-bb-primary hover:text-bb-primary"
                    onClick={onPrintInvoice}
                    title="Opens print dialog — choose Save as PDF to download"
                  >
                    <i className="ri-download-2-line mr-1.5" />
                    Download Invoice
                  </button>
                  <Link
                    href={`/track-order?order=${encodeURIComponent(order.order_number)}`}
                    className="inline-flex items-center rounded-md border border-bb-border px-3 py-2 text-sm hover:border-bb-primary hover:text-bb-primary"
                  >
                    <i className="ri-truck-line mr-1.5" />
                    Track
                  </Link>
                  {canCancel && (
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60"
                      disabled={cancelling}
                      onClick={() => void onCancel()}
                    >
                      {cancelling ? "Cancelling..." : "Cancel order"}
                    </button>
                  )}
                </div>
              </div>

              {actionError && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {actionError}
                </div>
              )}

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-6">
                  <section className="overflow-hidden rounded-xl border border-bb-border bg-white shadow-sm">
                    <div className="border-b border-bb-border bg-bb-soft px-5 py-3">
                      <h2 className="text-sm font-semibold text-bb-text">Items</h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[560px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-bb-border text-xs uppercase tracking-wide text-bb-muted">
                            <th className="px-5 py-3 font-semibold">Product</th>
                            <th className="px-5 py-3 font-semibold text-right">Qty</th>
                            <th className="px-5 py-3 font-semibold text-right">Price</th>
                            <th className="px-5 py-3 font-semibold text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-bb-border">
                          {order.items.map((item) => (
                            <tr key={item.id} className="hover:bg-bb-soft/40">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-bb-border bg-bb-soft">
                                    <Image
                                      src={mediaUrl(item.product_image)}
                                      alt={item.name}
                                      fill
                                      sizes="56px"
                                      className="object-cover"
                                    />
                                  </span>
                                  {item.product_slug ? (
                                    <Link
                                      href={`/product/${item.product_slug}`}
                                      className="font-medium text-bb-text hover:text-bb-primary"
                                    >
                                      {item.name}
                                    </Link>
                                  ) : (
                                    <span className="font-medium text-bb-text">{item.name}</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-5 py-4 text-right text-bb-muted">{item.quantity}</td>
                              <td className="px-5 py-4 text-right text-bb-muted">
                                {money(item.unit_price)}
                              </td>
                              <td className="px-5 py-4 text-right font-medium text-bb-text">
                                {money(item.line_total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section className="rounded-xl border border-bb-border bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-bb-text mb-4">Status timeline</h2>
                    {history.length === 0 ? (
                      <p className="text-sm text-bb-muted">No status updates yet.</p>
                    ) : (
                      <ol className="relative ml-2 space-y-4 border-l border-bb-border">
                        {history.map((row, idx) => {
                          const label = statusLabel(row.to_status ?? row.status);
                          const when = row.created_at
                            ? new Date(row.created_at).toLocaleString()
                            : null;
                          return (
                            <li key={`${label}-${idx}`} className="ml-4">
                              <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-bb-primary" />
                              <p className="text-sm font-medium capitalize text-bb-text">{label}</p>
                              {row.note && (
                                <p className="mt-0.5 text-xs text-bb-muted">{row.note}</p>
                              )}
                              {when && (
                                <p className="mt-0.5 text-xs text-bb-muted">{when}</p>
                              )}
                            </li>
                          );
                        })}
                      </ol>
                    )}
                  </section>
                </div>

                <aside className="space-y-6">
                  <section className="rounded-xl border border-bb-border bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-bb-text mb-3">Order summary</h2>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between gap-3">
                        <dt className="text-bb-muted">Subtotal</dt>
                        <dd className="text-bb-text">{money(order.subtotal)}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-bb-muted">Shipping</dt>
                        <dd className="text-bb-text">
                          {Number(order.shipping_amount) === 0
                            ? "Free"
                            : money(order.shipping_amount)}
                        </dd>
                      </div>
                      {Number(order.tax_amount) > 0 && (
                        <div className="flex justify-between gap-3">
                          <dt className="text-bb-muted">Tax</dt>
                          <dd className="text-bb-text">{money(order.tax_amount)}</dd>
                        </div>
                      )}
                      {Number(order.discount_amount) > 0 && (
                        <div className="flex justify-between gap-3">
                          <dt className="text-bb-muted">
                            Discount{order.coupon_code ? ` (${order.coupon_code})` : ""}
                          </dt>
                          <dd className="text-bb-text">−{money(order.discount_amount)}</dd>
                        </div>
                      )}
                      <div className="flex justify-between gap-3 border-t border-bb-border pt-2 font-semibold">
                        <dt className="text-bb-text">Total</dt>
                        <dd className="text-bb-text">{money(order.total)}</dd>
                      </div>
                    </dl>
                  </section>

                  <section className="rounded-xl border border-bb-border bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-bb-text mb-3">Payment</h2>
                    <p className="text-sm text-bb-text">{paymentLabel(order.payment_method)}</p>
                    <p className="mt-1 text-xs text-bb-muted capitalize">
                      Order status: {statusLabel(order.status)}
                    </p>
                  </section>

                  <section className="rounded-xl border border-bb-border bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-bb-text mb-3">Shipping details</h2>
                    <div className="space-y-1 text-sm text-bb-text">
                      <p className="font-medium">{order.shipping_name || "—"}</p>
                      {order.shipping_phone && <p>{order.shipping_phone}</p>}
                      {order.shipping_line1 && <p>{order.shipping_line1}</p>}
                      {order.shipping_line2 && <p>{order.shipping_line2}</p>}
                      <p>
                        {[order.shipping_city, order.shipping_state, order.shipping_postal_code]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </p>
                      {order.shipping_country && <p>{order.shipping_country}</p>}
                    </div>
                    {order.notes && (
                      <p className="mt-3 border-t border-bb-border pt-3 text-sm text-bb-muted">
                        <span className="font-medium text-bb-text">Notes:</span> {order.notes}
                      </p>
                    )}
                  </section>
                </aside>
              </div>
            </div>

            <OrderInvoice order={order} />
          </>
        )}
      </Container>
    </>
  );
}
