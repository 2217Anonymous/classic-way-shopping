import { apiRequest } from "@/lib/api";
import type { ApiCompare } from "./types";

export async function getCompare(): Promise<ApiCompare> {
  return apiRequest<ApiCompare>("/compare");
}

export async function addCompareItem(productId: string): Promise<ApiCompare> {
  return apiRequest<ApiCompare>("/compare/items", {
    method: "POST",
    body: JSON.stringify({ product_id: productId }),
  });
}

export async function removeCompareItem(itemId: string): Promise<ApiCompare> {
  return apiRequest<ApiCompare>(`/compare/items/${itemId}`, {
    method: "DELETE",
  });
}
