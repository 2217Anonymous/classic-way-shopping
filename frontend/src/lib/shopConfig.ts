import type { ProductLayoutConfig, ShopConfig } from "@/types";

export type BlogLayoutConfig = {
  sidebar?: "left" | "right" | "none";
  isDetail?: boolean;
};

export const SHOP_CONFIGS: Record<string, ShopConfig> = {
  "left-sidebar-col-3": { sidebar: "left", columns: 3, title: "Shop Left Sidebar" },
  "left-sidebar-col-4": { sidebar: "left", columns: 4, title: "Shop Left Sidebar" },
  "right-sidebar-col-3": { sidebar: "right", columns: 3, title: "Shop Right Sidebar" },
  "right-sidebar-col-4": { sidebar: "right", columns: 4, title: "Shop Right Sidebar" },
  "full-width": { sidebar: "none", columns: 4, title: "Shop Full Width" },
  "banner-left-sidebar-col-3": { sidebar: "left", columns: 3, banner: true, title: "Shop Banner Left" },
  "banner-left-sidebar-col-4": { sidebar: "left", columns: 4, banner: true, title: "Shop Banner Left" },
  "banner-right-sidebar-col-3": { sidebar: "right", columns: 3, banner: true, title: "Shop Banner Right" },
  "banner-right-sidebar-col-4": { sidebar: "right", columns: 4, banner: true, title: "Shop Banner Right" },
  "banner-full-width": { sidebar: "none", columns: 4, banner: true, title: "Shop Banner Full Width" },
  "full-width-col-3": { sidebar: "none", columns: 3, title: "Shop Full Width" },
  "full-width-col-4": { sidebar: "none", columns: 4, title: "Shop Full Width" },
  "full-width-col-5": { sidebar: "none", columns: 5, title: "Shop Full Width" },
  "full-width-col-6": { sidebar: "none", columns: 6, title: "Shop Full Width" },
  "banner-full-width-col-3": { sidebar: "none", columns: 3, banner: true, title: "Shop Banner Full Width" },
  "list-left-sidebar": { sidebar: "left", columns: 2, view: "list", title: "Shop List View" },
  "list-right-sidebar": { sidebar: "right", columns: 2, view: "list", title: "Shop List View" },
  "list-banner-left-sidebar": { sidebar: "left", columns: 2, view: "list", banner: true, title: "Shop List Banner" },
  "list-banner-right-sidebar": { sidebar: "right", columns: 2, view: "list", banner: true, title: "Shop List Banner" },
  "list-full-col-2": { sidebar: "none", columns: 2, view: "list", title: "Shop List Full Width" },
};

export const PRODUCT_LAYOUTS: Record<string, ProductLayoutConfig> = {
  "left-sidebar": { sidebar: "left" },
  "right-sidebar": { sidebar: "right" },
  "full-width": { sidebar: "none" },
  "accordion-left-sidebar": { sidebar: "left", accordion: true },
  "accordion-right-sidebar": { sidebar: "right", accordion: true },
  "accordion-full-width": { sidebar: "none", accordion: true },
};

export const BLOG_LAYOUTS: Record<string, BlogLayoutConfig> = {
  "left-sidebar": { sidebar: "left" },
  "right-sidebar": { sidebar: "right" },
  "full-width": { sidebar: "none" },
  "detail-left-sidebar": { sidebar: "left", isDetail: true },
  "detail-right-sidebar": { sidebar: "right", isDetail: true },
  "detail-full-width": { sidebar: "none", isDetail: true },
};

export const DEFAULT_SHOP_SLUG = "left-sidebar-col-3";

export const BRAND = {
  name: "Valaiyagam",
  tagline: "Valaiyagam Fashion",
  description: "Premium T-shirts and fashion apparel from Valaiyagam.",
} as const;
