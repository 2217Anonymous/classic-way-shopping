import {
  BLOG_LAYOUTS,
  PRODUCT_LAYOUTS,
  SHOP_CONFIGS,
  type BlogLayoutConfig,
} from "@/lib/shopConfig";
import {
  DEFAULT_THEME,
  PAGE_VISIBILITY_OPTIONS,
  type ThemeConfig,
  type ThemePageVisibility,
} from "@/lib/themeOptions";
import type { ProductLayoutConfig, ShopConfig } from "@/types";

/** Central theme → routes / layout configs resolver. */

export function resolveShopPath(theme: ThemeConfig = DEFAULT_THEME): string {
  const slug = theme.shop_layout || DEFAULT_THEME.shop_layout;
  if (SHOP_CONFIGS[slug]) return `/shop/${slug}`;
  return `/shop/${DEFAULT_THEME.shop_layout}`;
}

export function resolveShopConfig(theme: ThemeConfig = DEFAULT_THEME): ShopConfig {
  const slug = theme.shop_layout || DEFAULT_THEME.shop_layout;
  return (
    SHOP_CONFIGS[slug] ??
    SHOP_CONFIGS[DEFAULT_THEME.shop_layout] ?? {
      sidebar: "none",
      columns: 4,
      title: "Shop",
    }
  );
}

export function resolveProductLayout(
  theme: ThemeConfig = DEFAULT_THEME
): ProductLayoutConfig {
  const layout = theme.product_layout || DEFAULT_THEME.product_layout;
  return PRODUCT_LAYOUTS[layout] ?? PRODUCT_LAYOUTS["full-width"] ?? { sidebar: "none" };
}

export function resolveBlogListPath(theme: ThemeConfig = DEFAULT_THEME): string {
  const layout = theme.blog_layout || DEFAULT_THEME.blog_layout;
  const listKey = layout.startsWith("detail-")
    ? layout.replace(/^detail-/, "")
    : layout;
  if (BLOG_LAYOUTS[listKey] && !BLOG_LAYOUTS[listKey].isDetail) {
    return `/blog/${listKey}`;
  }
  return "/blog/full-width";
}

export function resolveBlogLayout(
  theme: ThemeConfig = DEFAULT_THEME
): BlogLayoutConfig {
  const layout = theme.blog_layout || DEFAULT_THEME.blog_layout;
  return BLOG_LAYOUTS[layout] ?? BLOG_LAYOUTS["full-width"] ?? { sidebar: "none" };
}

export function resolveHomePath(theme: ThemeConfig = DEFAULT_THEME): string {
  return theme.home_theme === "fashion" ? "/demo-2" : "/";
}

export function isPageVisible(
  key: keyof ThemePageVisibility,
  theme: ThemeConfig = DEFAULT_THEME
): boolean {
  return theme.page_visibility?.[key] !== false;
}

export function visiblePageLinks(theme: ThemeConfig = DEFAULT_THEME) {
  return PAGE_VISIBILITY_OPTIONS.filter((p) => isPageVisible(p.key, theme));
}
