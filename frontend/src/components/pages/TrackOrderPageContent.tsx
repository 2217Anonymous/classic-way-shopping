"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Container from "@/components/ui/Container";
import { trackOrder } from "@/services/orders";
import type { ApiOrderTracking } from "@/services/types";

function statusLabel(value: string | null | undefined) {
  if (!value) return "Update";
  return value.replace(/_/g, " ");
}

export default function TrackOrderPageContent() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get("order") ?? "";
  const [orderId, setOrderId] = useState(initialOrder);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tracking, setTracking] = useState<ApiOrderTracking | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTracking(null);
    try {
      const result = await trackOrder(orderId.trim());
      setTracking(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to track order");
    } finally {
      setLoading(false);
    }
  };

  const history = tracking?.status_history ?? [];
  const shipmentEvents = tracking?.shipment_events ?? [];

  return (
    <>
      <Breadcrumb title="Track Order" items={[{ label: "Track Order" }]} />
      <Container className="pb-16">
        <div className="max-w-lg mx-auto border border-bb-border rounded-xl p-8 bg-white">
          <h2 className="text-xl font-semibold text-center mb-2">Track Your Order</h2>
          <p className="text-sm text-bb-muted text-center mb-6">
            Enter your order ID to see delivery status.
          </p>
          {tracking ? (
            <div className="py-2">
              <div className="text-center mb-6">
                <i className="ri-truck-line text-4xl text-bb-primary mb-3" />
                <p className="font-medium text-bb-text mb-1">Order #{tracking.order_number}</p>
                <p className="text-sm text-bb-muted">
                  Status:{" "}
                  <span className="text-bb-accent capitalize">
                    {statusLabel(tracking.status)}
                  </span>
                </p>
              </div>

              <div className="text-sm space-y-2 border-t border-bb-border pt-4">
                {tracking.shipping_city && (
                  <p>
                    <span className="text-bb-muted">Shipping city:</span> {tracking.shipping_city}
                  </p>
                )}
                <p>
                  <span className="text-bb-muted">Placed:</span>{" "}
                  {new Date(tracking.created_at).toLocaleString()}
                </p>
                {tracking.awb && (
                  <p>
                    <span className="text-bb-muted">AWB:</span>{" "}
                    <span className="font-medium text-bb-text">{tracking.awb}</span>
                  </p>
                )}
                {tracking.shipment_status && (
                  <p>
                    <span className="text-bb-muted">Shipment:</span>{" "}
                    <span className="capitalize">{statusLabel(tracking.shipment_status)}</span>
                  </p>
                )}
              </div>

              {history.length > 0 && (
                <div className="mt-6 border-t border-bb-border pt-4">
                  <h3 className="text-sm font-semibold text-bb-text mb-3">Status timeline</h3>
                  <ol className="relative border-l border-bb-border ml-2 space-y-4">
                    {history.map((row, idx) => {
                      const label = statusLabel(row.to_status ?? row.status);
                      const when = row.created_at
                        ? new Date(row.created_at).toLocaleString()
                        : null;
                      return (
                        <li key={`${label}-${idx}`} className="ml-4">
                          <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-bb-primary" />
                          <p className="text-sm font-medium text-bb-text capitalize">{label}</p>
                          {row.note && (
                            <p className="text-xs text-bb-muted mt-0.5">{row.note}</p>
                          )}
                          {when && (
                            <p className="text-xs text-bb-muted mt-0.5">{when}</p>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}

              {shipmentEvents.length > 0 && (
                <div className="mt-6 border-t border-bb-border pt-4">
                  <h3 className="text-sm font-semibold text-bb-text mb-3">Shipment events</h3>
                  <ul className="space-y-3">
                    {shipmentEvents.map((event, idx) => (
                      <li
                        key={`${event.status ?? "event"}-${idx}`}
                        className="text-sm border border-bb-border rounded-lg p-3"
                      >
                        <p className="font-medium text-bb-text capitalize">
                          {statusLabel(event.status ?? undefined)}
                        </p>
                        {event.description && (
                          <p className="text-xs text-bb-muted mt-1">{event.description}</p>
                        )}
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-bb-muted">
                          {event.location && <span>{event.location}</span>}
                          {event.occurred_at && (
                            <span>{new Date(event.occurred_at).toLocaleString()}</span>
                          )}
                          {event.source && <span className="capitalize">{event.source}</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="button"
                className="bb-btn bb-btn-2 mt-6 w-full"
                onClick={() => setTracking(null)}
              >
                Track another order
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
              <input
                required
                placeholder="Order ID"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full border border-bb-border rounded-md px-3 py-2.5 text-sm outline-none focus:border-bb-primary"
              />
              <input
                type="email"
                placeholder="Email Address (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-bb-border rounded-md px-3 py-2.5 text-sm outline-none focus:border-bb-primary"
              />
              <button type="submit" className="bb-btn bb-btn-1 w-full" disabled={loading}>
                {loading ? "Tracking..." : "Track Order"}
              </button>
            </form>
          )}
        </div>
      </Container>
    </>
  );
}
