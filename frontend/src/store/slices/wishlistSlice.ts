import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { mediaUrl } from "@/lib/api";
import * as wishlistApi from "@/services/wishlist";
import type { ApiWishlist } from "@/services/types";
import type { Product, ProductId } from "@/types";
import { sameId } from "@/types";
import { getAccessToken } from "@/services/auth";

const WISHLIST_KEY = "shopping_wishlist";

interface WishlistState {
  items: Product[];
  status: "idle" | "loading" | "succeeded" | "failed";
}

function loadLocal(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? (JSON.parse(raw) as Product[]) : [];
  } catch {
    return [];
  }
}

function persistLocal(items: Product[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
}

function mapWishlist(api: ApiWishlist): Product[] {
  return api.items.map((item) => ({
    id: item.product_id,
    slug: item.product_slug ?? `product-${item.product_id}`,
    title: item.product_name ?? `Product #${item.product_id}`,
    category: "Fashion",
    categorySlug: "fashion",
    price: item.product_price != null ? Number(item.product_price) : 0,
    rating: 4,
    image: mediaUrl(item.product_image),
    stock: 1,
    unit: "1 pc",
    description: item.product_name ?? "",
  }));
}

function isLoggedIn() {
  return !!getAccessToken();
}

export const hydrateWishlist = createAsyncThunk("wishlist/hydrate", async () => loadLocal());

export const fetchWishlist = createAsyncThunk("wishlist/fetch", async () => {
  if (!isLoggedIn()) return loadLocal();
  const data = await wishlistApi.getWishlist();
  return mapWishlist(data);
});

export const toggleWishlistItem = createAsyncThunk(
  "wishlist/toggle",
  async (product: Product, { getState, rejectWithValue }) => {
    const state = getState() as { wishlist: WishlistState };
    const exists = state.wishlist.items.some((item) => sameId(item.id, product.id));

    if (!isLoggedIn()) {
      return { local: true as const, product, exists };
    }

    const productId = Number(product.id);
    if (!Number.isFinite(productId)) {
      return { local: true as const, product, exists };
    }

    try {
      if (exists) {
        const current = await wishlistApi.getWishlist();
        const row = current.items.find((i) => i.product_id === productId);
        if (row) {
          const updated = await wishlistApi.removeWishlistItem(row.id);
          return { local: false as const, items: mapWishlist(updated) };
        }
        return { local: true as const, product, exists };
      }
      const updated = await wishlistApi.addWishlistItem(productId);
      return { local: false as const, items: mapWishlist(updated) };
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Wishlist update failed");
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: { items: [], status: "idle" } as WishlistState,
  reducers: {
    toggleWishlist: (state, action: PayloadAction<Product>) => {
      const index = state.items.findIndex((item) => sameId(item.id, action.payload.id));
      if (index >= 0) state.items.splice(index, 1);
      else state.items.push(action.payload);
      persistLocal(state.items);
    },
    removeFromWishlist: (state, action: PayloadAction<ProductId>) => {
      state.items = state.items.filter((item) => !sameId(item.id, action.payload));
      persistLocal(state.items);
    },
    clearWishlist: (state) => {
      state.items = [];
      persistLocal([]);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateWishlist.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload;
        persistLocal(action.payload);
        state.status = "succeeded";
      })
      .addCase(toggleWishlistItem.fulfilled, (state, action) => {
        if (action.payload.local) {
          const { product, exists } = action.payload;
          if (exists) {
            state.items = state.items.filter((item) => !sameId(item.id, product.id));
          } else {
            state.items.push(product);
          }
        } else {
          state.items = action.payload.items;
        }
        persistLocal(state.items);
      });
  },
});

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;

export const selectWishlistItems = (state: { wishlist: WishlistState }) => state.wishlist.items;
export const selectWishlistCount = (state: { wishlist: WishlistState }) =>
  state.wishlist.items.length;
export const selectIsInWishlist =
  (id: ProductId) => (state: { wishlist: WishlistState }) =>
    state.wishlist.items.some((item) => sameId(item.id, id));
