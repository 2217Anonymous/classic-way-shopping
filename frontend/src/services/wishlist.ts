import { apiRequest } from "@/lib/api";
import type { ApiWishlist } from "./types";

export async function getWishlist(): Promise<ApiWishlist> {
  return apiRequest<ApiWishlist>("/wishlist");
}

export async function addWishlistItem(productId: number): Promise<ApiWishlist> {
  return apiRequest<ApiWishlist>("/wishlist/items", {
    method: "POST",
    body: JSON.stringify({ product_id: productId }),
  });
}

export async function removeWishlistItem(itemId: number): Promise<ApiWishlist> {
  return apiRequest<ApiWishlist>(`/wishlist/items/${itemId}`, {
    method: "DELETE",
  });
}
