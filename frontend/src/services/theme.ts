import { apiRequest } from "@/lib/api";
import type { ThemeConfig } from "@/lib/themeOptions";

export type ThemeApiResponse = ThemeConfig & {
  id: string;
  customer_id: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  source: string;
};

export type ThemeUpdatePayload = {
  home_theme: string;
  shop_category: string;
  shop_layout: string;
  product_layout: string;
  blog_layout: string;
  page_visibility: ThemeConfig["page_visibility"];
  theme_config?: Record<string, unknown> | null;
};

export async function fetchTheme(): Promise<ThemeApiResponse> {
  return apiRequest<ThemeApiResponse>("/theme");
}

export async function updateTheme(
  payload: ThemeUpdatePayload
): Promise<ThemeApiResponse> {
  return apiRequest<ThemeApiResponse>("/theme", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
