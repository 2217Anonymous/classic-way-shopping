"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Container from "@/components/ui/Container";
import { useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated } from "@/store/slices/authSlice";
import { cancelOrder, listOrders } from "@/services/orders";
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
  return "bg-amber-50 text-amber-800 border-amber-200";
}

function money(value: number | string) {
  return formatPrice(Number(value));
}

export default function MyOrdersPageContent() {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authStatus = useAppSelector((state) => state.auth.status);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listOrders();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authStatus === "idle" || authStatus === "loading") return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    void loadOrders();
  }, [authStatus, isAuthenticated, loadOrders, router]);

  const onCancel = async (order: ApiOrder) => {
    const reason = window.prompt(
      `Cancel order #${order.order_number}? Optionally enter a reason:`,
      ""
    );
    if (reason === null) return;
    setActionError(null);
    setCancellingId(order.id);
    try {
      const updated = await cancelOrder(order.id, reason.trim() || undefined);
      setOrders((prev) => prev.map((item) => (item.id === order.id ? updated : item)));
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Unable to cancel order";
      setActionError(message);
    } finally {
      setCancellingId(null);
    }
  };

  if (authStatus === "idle" || authStatus === "loading" || !isAuthenticated) {
    return (
      <>
        <Breadcrumb title="My Orders" items={[{ label: "My Orders" }]} />
        <Container className="pb-16">
          <p className="text-center text-bb-muted py-16">Loading...</p>
        </Container>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title="My Orders" items={[{ label: "My Orders" }]} />
      <Container className="pb-16">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-bb-text">My Orders</h1>
            <p className="text-sm text-bb-muted mt-1">
              View order history and cancel eligible orders.
            </p>
          </div>
          <Link href="/track-order" className="text-sm text-bb-primary hover:underline">
            Track an order
          </Link>
        </div>

        {actionError && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {actionError}
          </div>
        )}

        {loading ? (
          <p className="text-center text-bb-muted py-16">Loading orders...</p>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 mb-4">{error}</p>
            <button type="button" className="bb-btn bb-btn-1" onClick={() => void loadOrders()}>
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 border border-bb-border rounded-xl bg-white">
            <i className="ri-shopping-bag-3-line text-4xl text-bb-muted mb-3" />
            <p className="text-bb-text font-medium mb-1">No orders yet</p>
            <p className="text-sm text-bb-muted mb-6">When you place an order, it will show up here.</p>
            <Link href="/shop" className="bb-btn bb-btn-1">
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-bb-border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-left">
                <thead className="bg-bb-soft">
                  <tr className="border-b border-bb-border text-xs uppercase tracking-wide text-bb-muted">
                    <th className="px-5 py-4 font-semibold">Order</th>
                    <th className="px-5 py-4 font-semibold">Products</th>
                    <th className="px-5 py-4 font-semibold">Date</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Payment</th>
                    <th className="px-5 py-4 font-semibold text-right">Total</th>
                    <th className="px-5 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bb-border">
                  {orders.map((order) => {
                    const canCancel = CANCELLABLE.has(order.status.toLowerCase());
                    return (
                      <tr key={order.id} className="align-top transition-colors hover:bg-bb-soft/40">
                        <td className="px-5 py-5">
                          <p className="font-semibold text-bb-text whitespace-nowrap">
                            #{order.order_number}
                          </p>
                          <p className="mt-1 text-xs text-bb-muted">
                            {order.items.length} {order.items.length === 1 ? "item" : "items"}
                          </p>
                        </td>
                        <td className="px-5 py-5">
                          <div className="space-y-3">
                            {order.items.map((item) => {
                              const productContent = (
                                <>
                                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-bb-border bg-bb-soft">
                                    <Image
                                      src={mediaUrl(item.product_image)}
                                      alt={item.name}
                                      fill
                                      sizes="56px"
                                      className="object-cover"
                                    />
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block max-w-[260px] truncate text-sm font-medium text-bb-text">
                                      {item.name}
                                    </span>
                                    <span className="mt-1 block text-xs text-bb-muted">
                                      Qty: {item.quantity} · {money(item.unit_price)} each
                                    </span>
                                  </span>
                                </>
                              );
                              return item.product_slug ? (
                                <Link
                                  key={item.id}
                                  href={`/product/${item.product_slug}`}
                                  className="flex items-center gap-3 hover:text-bb-primary"
                                >
                                  {productContent}
                                </Link>
                              ) : (
                                <div key={item.id} className="flex items-center gap-3">
                                  {productContent}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-5 py-5 text-sm text-bb-muted whitespace-nowrap">
                          <p>{new Date(order.created_at).toLocaleDateString()}</p>
                          <p className="mt-1 text-xs">
                            {new Date(order.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </td>
                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusClass(order.status)}`}
                          >
                            {order.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-5 py-5 text-sm capitalize text-bb-text">
                          {order.payment_method}
                        </td>
                        <td className="px-5 py-5 text-right font-semibold text-bb-text whitespace-nowrap">
                          {money(order.total)}
                        </td>
                        <td className="px-5 py-5">
                          <div className="flex flex-col items-end gap-2">
                            <Link
                              href={`/track-order?order=${encodeURIComponent(order.order_number)}`}
                              className="inline-flex min-w-[110px] items-center justify-center rounded-md border border-bb-border px-3 py-2 text-sm transition-colors hover:border-bb-primary hover:text-bb-primary"
                            >
                              <i className="ri-truck-line mr-1.5" />
                              Track
                            </Link>
                            {canCancel && (
                              <button
                                type="button"
                                className="inline-flex min-w-[110px] items-center justify-center rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60"
                                disabled={cancellingId === order.id}
                                onClick={() => void onCancel(order)}
                              >
                                {cancellingId === order.id ? "Cancelling..." : "Cancel"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="border-t border-bb-border bg-bb-soft px-5 py-3 text-xs text-bb-muted">
              Showing {orders.length} {orders.length === 1 ? "order" : "orders"}
            </div>
          </div>
        )}
      </Container>
    </>
  );
}
