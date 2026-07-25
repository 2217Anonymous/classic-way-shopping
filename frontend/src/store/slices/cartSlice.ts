import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GUEST_CART_KEY, getCartId, setCartId } from "@/lib/api";
import { mapApiCartToItems } from "@/lib/mappers";
import * as cartApi from "@/services/cart";
import type { CartItem, Product, ProductId } from "@/types";
import { sameId } from "@/types";

interface CartState {
  items: CartItem[];
  cartId: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

function loadGuestCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

function persistGuestCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

function loadCartId(): string | null {
  return getCartId();
}

const initialState: CartState = {
  items: [],
  cartId: null,
  status: "idle",
  error: null,
};

export const hydrateCart = createAsyncThunk("cart/hydrate", async () => {
  return {
    items: loadGuestCart(),
    cartId: loadCartId(),
  };
});

export const fetchCart = createAsyncThunk("cart/fetch", async (_, { getState }) => {
  const cart = await cartApi.getCart();
  const state = getState() as { cart: CartState };
  return {
    cart,
    items: mapApiCartToItems(cart, state.cart.items),
  };
});

export const addItemToCart = createAsyncThunk(
  "cart/addItem",
  async (
    payload: { product: Product; quantity?: number; selectedSize?: string },
    { getState }
  ) => {
    const { product, quantity = 1, selectedSize } = payload;
    const productId = String(product.id);

    if (!productId) {
      return {
        localOnly: true as const,
        product,
        quantity,
        selectedSize,
      };
    }

    try {
      const cart = await cartApi.addCartItem({
        product_id: productId,
        quantity,
      });
      const state = getState() as { cart: CartState };
      const known: CartItem[] = [
        ...state.cart.items,
        { ...product, quantity, selectedSize },
      ];
      return {
        localOnly: false as const,
        cart,
        items: mapApiCartToItems(cart, known),
      };
    } catch {
      // Offline / API unavailable — keep optimistic local cart
      return {
        localOnly: true as const,
        product,
        quantity,
        selectedSize,
      };
    }
  }
);

export const updateCartQty = createAsyncThunk(
  "cart/updateQty",
  async (
    payload: { id: ProductId; quantity: number; selectedSize?: string; cartItemId?: string },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as { cart: CartState };
    const item = state.cart.items.find(
      (i) => sameId(i.id, payload.id) && i.selectedSize === payload.selectedSize
    );
    const cartItemId = payload.cartItemId ?? item?.cartItemId;

    if (cartItemId == null) {
      return { localOnly: true as const, ...payload };
    }

    try {
      const cart = await cartApi.updateCartItem(cartItemId, Math.max(1, payload.quantity));
      return {
        localOnly: false as const,
        cart,
        items: mapApiCartToItems(cart, state.cart.items),
      };
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to update cart"
      );
    }
  }
);

export const removeCartItem = createAsyncThunk(
  "cart/removeItem",
  async (
    payload: { id: ProductId; selectedSize?: string; cartItemId?: string },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as { cart: CartState };
    const item = state.cart.items.find(
      (i) => sameId(i.id, payload.id) && i.selectedSize === payload.selectedSize
    );
    const cartItemId = payload.cartItemId ?? item?.cartItemId;

    if (cartItemId == null) {
      return { localOnly: true as const, ...payload };
    }

    try {
      const cart = await cartApi.removeCartItem(cartItemId);
      return {
        localOnly: false as const,
        cart,
        items: mapApiCartToItems(cart, state.cart.items),
      };
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to remove item"
      );
    }
  }
);

export const clearCartRemote = createAsyncThunk("cart/clearRemote", async () => {
  try {
    const cart = await cartApi.clearCartApi();
    return cart;
  } catch {
    return null;
  }
});

export const mergeGuestCart = createAsyncThunk(
  "cart/merge",
  async (_, { getState }) => {
    const guestId = getCartId();
    const cart = await cartApi.mergeCart(guestId || null);
    const state = getState() as { cart: CartState };
    return {
      cart,
      items: mapApiCartToItems(cart, state.cart.items),
    };
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<{ product: Product; quantity?: number; selectedSize?: string }>
    ) => {
      const { product, quantity = 1, selectedSize } = action.payload;
      const existing = state.items.find(
        (item) => sameId(item.id, product.id) && item.selectedSize === selectedSize
      );
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ ...product, quantity, selectedSize });
      }
      persistGuestCart(state.items);
    },
    removeFromCart: (
      state,
      action: PayloadAction<{ id: ProductId; selectedSize?: string }>
    ) => {
      state.items = state.items.filter(
        (item) =>
          !(sameId(item.id, action.payload.id) && item.selectedSize === action.payload.selectedSize)
      );
      persistGuestCart(state.items);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: ProductId; quantity: number; selectedSize?: string }>
    ) => {
      const item = state.items.find(
        (i) => sameId(i.id, action.payload.id) && i.selectedSize === action.payload.selectedSize
      );
      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
      }
      persistGuestCart(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      persistGuestCart([]);
    },
    setCartFromApi: (
      state,
      action: PayloadAction<{ cartId: string; items: CartItem[] }>
    ) => {
      state.cartId = action.payload.cartId;
      state.items = action.payload.items;
      setCartId(action.payload.cartId);
      persistGuestCart(action.payload.items);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.cartId = action.payload.cartId;
      })
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cartId = action.payload.cart.id;
        state.items = action.payload.items;
        persistGuestCart(action.payload.items);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to load cart";
      })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        if (action.payload.localOnly) {
          const { product, quantity, selectedSize } = action.payload;
          const existing = state.items.find(
            (item) => sameId(item.id, product.id) && item.selectedSize === selectedSize
          );
          if (existing) existing.quantity += quantity;
          else state.items.push({ ...product, quantity, selectedSize });
        } else {
          state.cartId = action.payload.cart.id;
          state.items = action.payload.items;
        }
        persistGuestCart(state.items);
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to add item";
      })
      .addCase(updateCartQty.fulfilled, (state, action) => {
        const payload = action.payload;
        if (payload.localOnly) {
          const item = state.items.find(
            (i) => sameId(i.id, payload.id) && i.selectedSize === payload.selectedSize
          );
          if (item) item.quantity = Math.max(1, payload.quantity);
        } else {
          state.cartId = payload.cart.id;
          state.items = payload.items;
        }
        persistGuestCart(state.items);
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        const payload = action.payload;
        if (payload.localOnly) {
          state.items = state.items.filter(
            (item) =>
              !(sameId(item.id, payload.id) && item.selectedSize === payload.selectedSize)
          );
        } else {
          state.cartId = payload.cart.id;
          state.items = payload.items;
        }
        persistGuestCart(state.items);
      })
      .addCase(clearCartRemote.fulfilled, (state) => {
        state.items = [];
        persistGuestCart([]);
        if (typeof window !== "undefined") {
          localStorage.removeItem(GUEST_CART_KEY);
        }
      })
      .addCase(mergeGuestCart.fulfilled, (state, action) => {
        state.cartId = action.payload.cart.id;
        state.items = action.payload.items;
        persistGuestCart(action.payload.items);
      });
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, setCartFromApi } =
  cartSlice.actions;
export default cartSlice.reducer;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
export const selectCartId = (state: { cart: CartState }) => state.cart.cartId;
export const selectCartStatus = (state: { cart: CartState }) => state.cart.status;
