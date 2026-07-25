import { apiRequest } from "@/lib/api";
import type {
  ApiCheckoutCreate,
  ApiCheckoutPreview,
  ApiOrder,
} from "./types";

export async function previewCheckout(
  payload: ApiCheckoutCreate
): Promise<ApiCheckoutPreview> {
  return apiRequest<ApiCheckoutPreview>("/checkout/preview", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function validateCheckout(
  payload: ApiCheckoutCreate
): Promise<ApiCheckoutPreview> {
  return apiRequest<ApiCheckoutPreview>("/checkout/validate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createOrder(payload: ApiCheckoutCreate): Promise<ApiOrder> {
  return apiRequest<ApiOrder>("/checkout/create-order", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
