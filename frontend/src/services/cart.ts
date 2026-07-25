import { apiRequest, setCartId } from "@/lib/api";
import type { ApiCart } from "./types";

function rememberCart(cart: ApiCart): ApiCart {
  setCartId(cart.id);
  return cart;
}

export async function getCart(): Promise<ApiCart> {
  const cart = await apiRequest<ApiCart>("/cart");
  return rememberCart(cart);
}

export async function addCartItem(payload: {
  product_id: string;
  variant_id?: string | null;
  quantity?: number;
}): Promise<ApiCart> {
  const cart = await apiRequest<ApiCart>("/cart/items", {
    method: "POST",
    body: JSON.stringify({
      product_id: payload.product_id,
      variant_id: payload.variant_id ?? null,
      quantity: payload.quantity ?? 1,
    }),
  });
  return rememberCart(cart);
}

export async function updateCartItem(
  itemId: string,
  quantity: number
): Promise<ApiCart> {
  const cart = await apiRequest<ApiCart>(`/cart/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });
  return rememberCart(cart);
}

export async function removeCartItem(itemId: string): Promise<ApiCart> {
  const cart = await apiRequest<ApiCart>(`/cart/items/${itemId}`, {
    method: "DELETE",
  });
  return rememberCart(cart);
}

export async function clearCartApi(): Promise<ApiCart> {
  const cart = await apiRequest<ApiCart>("/cart", { method: "DELETE" });
  return rememberCart(cart);
}

export async function mergeCart(guestCartId?: string | null): Promise<ApiCart> {
  const cart = await apiRequest<ApiCart>("/cart/merge", {
    method: "POST",
    body: JSON.stringify({ guest_cart_id: guestCartId ?? null }),
  });
  return rememberCart(cart);
}
