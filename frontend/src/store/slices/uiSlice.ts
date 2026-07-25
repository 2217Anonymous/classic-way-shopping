import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "@/types";

interface UiState {
  cartOpen: boolean;
  categoryOpen: boolean;
  mobileMenuOpen: boolean;
  quickViewProduct: Product | null;
  newsletterOpen: boolean;
  searchQuery: string;
}

const initialState: UiState = {
  cartOpen: false,
  categoryOpen: false,
  mobileMenuOpen: false,
  quickViewProduct: null,
  newsletterOpen: false,
  searchQuery: "",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openCart: (state) => {
      state.cartOpen = true;
    },
    closeCart: (state) => {
      state.cartOpen = false;
    },
    toggleCart: (state) => {
      state.cartOpen = !state.cartOpen;
    },
    openCategory: (state) => {
      state.categoryOpen = true;
    },
    closeCategory: (state) => {
      state.categoryOpen = false;
    },
    toggleCategory: (state) => {
      state.categoryOpen = !state.categoryOpen;
    },
    openMobileMenu: (state) => {
      state.mobileMenuOpen = true;
    },
    closeMobileMenu: (state) => {
      state.mobileMenuOpen = false;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    openQuickView: (state, action: PayloadAction<Product>) => {
      state.quickViewProduct = action.payload;
    },
    closeQuickView: (state) => {
      state.quickViewProduct = null;
    },
    setNewsletterOpen: (state, action: PayloadAction<boolean>) => {
      state.newsletterOpen = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const {
  openCart,
  closeCart,
  toggleCart,
  openCategory,
  closeCategory,
  toggleCategory,
  openMobileMenu,
  closeMobileMenu,
  toggleMobileMenu,
  openQuickView,
  closeQuickView,
  setNewsletterOpen,
  setSearchQuery,
} = uiSlice.actions;

export default uiSlice.reducer;
