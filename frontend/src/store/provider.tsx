"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "./index";
import { hydrateAuth } from "./slices/authSlice";
import { fetchCart, hydrateCart } from "./slices/cartSlice";
import { fetchWishlist, hydrateWishlist } from "./slices/wishlistSlice";
import { fetchCompare, hydrateCompare } from "./slices/compareSlice";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    const store = storeRef.current;
    if (!store) return;
    store.dispatch(hydrateCart());
    store.dispatch(hydrateWishlist());
    store.dispatch(hydrateCompare());
    store.dispatch(hydrateAuth()).then(() => {
      store.dispatch(fetchCart());
      store.dispatch(fetchWishlist());
      store.dispatch(fetchCompare());
    });
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
