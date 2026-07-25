import { apiRequest } from "@/lib/api";
import { mapApiCategory } from "@/lib/mappers";
import type { Category } from "@/types";
import type { ApiCategory } from "./types";

export async function listCategories(): Promise<Category[]> {
  const data = await apiRequest<ApiCategory[]>("/categories");
  return data.map(mapApiCategory);
}

export async function getCategory(slug: string): Promise<Category> {
  const data = await apiRequest<ApiCategory>(
    `/categories/${encodeURIComponent(slug)}`
  );
  return mapApiCategory(data);
}
