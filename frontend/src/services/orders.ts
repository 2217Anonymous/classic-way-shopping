import { apiRequest, buildQuery } from "@/lib/api";
import type { ApiOrder, ApiOrderTracking } from "./types";

export async function listOrders(status?: string): Promise<ApiOrder[]> {
  return apiRequest<ApiOrder[]>(`/orders${buildQuery({ status })}`);
}

export async function getOrder(orderId: number): Promise<ApiOrder> {
  return apiRequest<ApiOrder>(`/orders/${orderId}`);
}

export async function trackOrder(orderNumber: string): Promise<ApiOrderTracking> {
  return apiRequest<ApiOrderTracking>(
    `/orders/tracking/${encodeURIComponent(orderNumber)}`
  );
}

export async function cancelOrder(orderId: number, reason?: string): Promise<ApiOrder> {
  return apiRequest<ApiOrder>(`/orders/${orderId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason: reason ?? null }),
  });
}
