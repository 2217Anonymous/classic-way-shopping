import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { mediaUrl } from "@/lib/api";
import { getAccessToken } from "@/services/auth";
import * as compareApi from "@/services/compare";
import type { ApiCompare } from "@/services/types";
import type { Product, ProductId } from "@/types";
import { sameId } from "@/types";

const COMPARE_KEY = "shopping_compare";
const MAX_COMPARE = 4;

interface CompareState {
  items: Product[];
  status: "idle" | "loading" | "succeeded" | "failed";
}

function loadLocal(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COMPARE_KEY);
    return raw ? (JSON.parse(raw) as Product[]) : [];
  } catch {
    return [];
  }
}

function persistLocal(items: Product[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(COMPARE_KEY, JSON.stringify(items));
}

function mapCompare(api: ApiCompare): Product[] {
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

export const hydrateCompare = createAsyncThunk("compare/hydrate", async () => loadLocal());

export const fetchCompare = createAsyncThunk("compare/fetch", async () => {
  if (!isLoggedIn()) return loadLocal();
  const data = await compareApi.getCompare();
  return mapCompare(data);
});

export const toggleCompareItem = createAsyncThunk(
  "compare/toggle",
  async (product: Product, { getState, rejectWithValue }) => {
    const state = getState() as { compare: CompareState };
    const exists = state.compare.items.some((item) => sameId(item.id, product.id));

    if (!isLoggedIn()) {
      return { local: true as const, product, exists };
    }

    const productId = Number(product.id);
    if (!Number.isFinite(productId)) {
      return { local: true as const, product, exists };
    }

    try {
      if (exists) {
        const current = await compareApi.getCompare();
        const row = current.items.find((i) => i.product_id === productId);
        if (row) {
          const updated = await compareApi.removeCompareItem(row.id);
          return { local: false as const, items: mapCompare(updated) };
        }
        return { local: true as const, product, exists };
      }
      if (state.compare.items.length >= MAX_COMPARE) {
        return rejectWithValue("Compare list is full");
      }
      const updated = await compareApi.addCompareItem(productId);
      return { local: false as const, items: mapCompare(updated) };
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Compare update failed");
    }
  }
);

const compareSlice = createSlice({
  name: "compare",
  initialState: { items: [], status: "idle" } as CompareState,
  reducers: {
    toggleCompare: (state, action: PayloadAction<Product>) => {
      const index = state.items.findIndex((item) => sameId(item.id, action.payload.id));
      if (index >= 0) state.items.splice(index, 1);
      else if (state.items.length < MAX_COMPARE) state.items.push(action.payload);
      persistLocal(state.items);
    },
    removeFromCompare: (state, action: PayloadAction<ProductId>) => {
      state.items = state.items.filter((item) => !sameId(item.id, action.payload));
      persistLocal(state.items);
    },
    clearCompare: (state) => {
      state.items = [];
      persistLocal([]);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateCompare.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(fetchCompare.fulfilled, (state, action) => {
        state.items = action.payload;
        persistLocal(action.payload);
        state.status = "succeeded";
      })
      .addCase(toggleCompareItem.fulfilled, (state, action) => {
        if (action.payload.local) {
          const { product, exists } = action.payload;
          if (exists) {
            state.items = state.items.filter((item) => !sameId(item.id, product.id));
          } else if (state.items.length < MAX_COMPARE) {
            state.items.push(product);
          }
        } else {
          state.items = action.payload.items;
        }
        persistLocal(state.items);
      });
  },
});

export const { toggleCompare, removeFromCompare, clearCompare } = compareSlice.actions;
export default compareSlice.reducer;

export const selectCompareItems = (state: { compare: CompareState }) => state.compare.items;
export const selectCompareCount = (state: { compare: CompareState }) => state.compare.items.length;
