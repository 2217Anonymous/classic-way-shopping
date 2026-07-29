/** Theme option whitelists — keep in sync with backend theme_constants. */

export type HomeTheme = "grocery" | "fashion";
export type ShopCategory = "classic" | "banner" | "columns" | "list";

export type ThemePageVisibility = {
  about_us: boolean;
  contact_us: boolean;
  cart: boolean;
  checkout: boolean;
  compare: boolean;
  faq: boolean;
  login: boolean;
  register: boolean;
  wishlist: boolean;
  terms: boolean;
  track_order: boolean;
};

export type ThemeConfig = {
  id?: string;
  customer_id?: string | null;
  home_theme: HomeTheme;
  shop_category: ShopCategory;
  shop_layout: string;
  product_layout: string;
  blog_layout: string;
  page_visibility: ThemePageVisibility;
  theme_config?: Record<string, unknown> | null;
  is_default?: boolean;
  is_active?: boolean;
  source?: "default" | "customer" | string;
};

export const HOME_THEMES: { value: HomeTheme; label: string }[] = [
  { value: "grocery", label: "Grocery" },
  { value: "fashion", label: "Fashion" },
];

export const SHOP_CATEGORIES: { value: ShopCategory; label: string }[] = [
  { value: "classic", label: "Classic" },
  { value: "banner", label: "Banner" },
  { value: "columns", label: "Columns" },
  { value: "list", label: "List" },
];

export const SHOP_LAYOUTS_BY_CATEGORY: Record<
  ShopCategory,
  { value: string; label: string }[]
> = {
  classic: [
    { value: "left-sidebar-col-3", label: "Left sidebar 3 column" },
    { value: "left-sidebar-col-4", label: "Left sidebar 4 column" },
    { value: "right-sidebar-col-3", label: "Right sidebar 3 column" },
    { value: "right-sidebar-col-4", label: "Right sidebar 4 column" },
    { value: "full-width", label: "Full width 4 column" },
  ],
  banner: [
    { value: "banner-left-sidebar-col-3", label: "Left sidebar 3 column" },
    { value: "banner-left-sidebar-col-4", label: "Left sidebar 4 column" },
    { value: "banner-right-sidebar-col-3", label: "Right sidebar 3 column" },
    { value: "banner-right-sidebar-col-4", label: "Right sidebar 4 column" },
    { value: "banner-full-width", label: "Full width 4 column" },
  ],
  columns: [
    { value: "full-width-col-3", label: "3 Columns full width" },
    { value: "full-width-col-4", label: "4 Columns full width" },
    { value: "full-width-col-5", label: "5 Columns full width" },
    { value: "full-width-col-6", label: "6 Columns full width" },
    { value: "banner-full-width-col-3", label: "Banner 3 Columns" },
  ],
  list: [
    { value: "list-left-sidebar", label: "Shop left sidebar" },
    { value: "list-right-sidebar", label: "Shop right sidebar" },
    { value: "list-banner-left-sidebar", label: "Banner left sidebar" },
    { value: "list-banner-right-sidebar", label: "Banner right sidebar" },
    { value: "list-full-col-2", label: "Full width 2 columns" },
  ],
};

export const PRODUCT_LAYOUT_OPTIONS = [
  { value: "left-sidebar", label: "Product left sidebar" },
  { value: "right-sidebar", label: "Product right sidebar" },
  { value: "full-width", label: "Product full width" },
  { value: "accordion-left-sidebar", label: "Accordion left sidebar" },
  { value: "accordion-right-sidebar", label: "Accordion right sidebar" },
  { value: "accordion-full-width", label: "Accordion full width" },
];

export const BLOG_LAYOUT_OPTIONS = [
  { value: "left-sidebar", label: "Left Sidebar" },
  { value: "right-sidebar", label: "Right Sidebar" },
  { value: "full-width", label: "Full Width" },
  { value: "detail-left-sidebar", label: "Detail Left Sidebar" },
  { value: "detail-right-sidebar", label: "Detail Right Sidebar" },
  { value: "detail-full-width", label: "Detail Full Width" },
];

export const PAGE_VISIBILITY_OPTIONS: {
  key: keyof ThemePageVisibility;
  label: string;
  href: string;
}[] = [
  { key: "about_us", label: "About Us", href: "/about-us" },
  { key: "contact_us", label: "Contact Us", href: "/contact-us" },
  { key: "cart", label: "Cart", href: "/cart" },
  { key: "checkout", label: "Checkout", href: "/checkout" },
  { key: "compare", label: "Compare", href: "/compare" },
  { key: "faq", label: "FAQ", href: "/faq" },
  { key: "login", label: "Login", href: "/login" },
  { key: "register", label: "Register", href: "/register" },
  { key: "wishlist", label: "Wishlist", href: "/wishlist" },
  { key: "terms", label: "Terms", href: "/terms" },
  { key: "track_order", label: "Track Order", href: "/track-order" },
];

export const DEFAULT_PAGE_VISIBILITY: ThemePageVisibility = {
  about_us: true,
  contact_us: true,
  cart: true,
  checkout: true,
  compare: true,
  faq: true,
  login: true,
  register: true,
  wishlist: true,
  terms: true,
  track_order: true,
};

export const DEFAULT_THEME: ThemeConfig = {
  home_theme: "fashion",
  shop_category: "classic",
  shop_layout: "full-width",
  product_layout: "full-width",
  blog_layout: "full-width",
  page_visibility: { ...DEFAULT_PAGE_VISIBILITY },
  source: "default",
};
