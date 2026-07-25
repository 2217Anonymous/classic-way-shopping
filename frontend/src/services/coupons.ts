import { apiRequest } from "@/lib/api";
import type { ApiCouponResult } from "./types";

export async function validateCoupon(code: string, subtotal: number): Promise<ApiCouponResult> {
  return apiRequest<ApiCouponResult>("/coupons/validate", {
    method: "POST",
    body: JSON.stringify({ code, subtotal }),
  });
}

export async function applyCoupon(
  code: string,
  cartId?: string | null
): Promise<ApiCouponResult> {
  return apiRequest<ApiCouponResult>("/coupons/apply", {
    method: "POST",
    body: JSON.stringify({ code, cart_id: cartId ?? null }),
  });
}

export async function removeCoupon(): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/coupons/remove", {
    method: "DELETE",
  });
}
