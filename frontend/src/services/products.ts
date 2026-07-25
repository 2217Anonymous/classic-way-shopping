import { apiRequest, buildQuery } from "@/lib/api";
import { mapApiProduct } from "@/lib/mappers";
import type { Product } from "@/types";
import type { ApiProduct, ApiProductList, ProductListParams } from "./types";

export async function listProducts(params: ProductListParams = {}): Promise<{
  items: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}> {
  const data = await apiRequest<ApiProductList>(`/products${buildQuery(params)}`);
  return {
    ...data,
    items: data.items.map(mapApiProduct),
  };
}

export async function getProduct(id: number | string): Promise<Product> {
  const data = await apiRequest<ApiProduct>(`/products/${id}`);
  return mapApiProduct(data);
}

export async function getProductBySlug(slug: string): Promise<Product> {
  const data = await apiRequest<ApiProduct>(`/products/slug/${encodeURIComponent(slug)}`);
  return mapApiProduct(data);
}

export async function getFeatured(limit = 20): Promise<Product[]> {
  const data = await apiRequest<ApiProductList>(`/products/featured${buildQuery({ limit })}`);
  return data.items.map(mapApiProduct);
}

export async function getTrending(limit = 20): Promise<Product[]> {
  const data = await apiRequest<ApiProductList>(`/products/trending${buildQuery({ limit })}`);
  return data.items.map(mapApiProduct);
}

export async function getNewArrivals(limit = 20): Promise<Product[]> {
  const data = await apiRequest<ApiProductList>(`/products/new-arrivals${buildQuery({ limit })}`);
  return data.items.map(mapApiProduct);
}

export async function searchProducts(q: string, page = 1, limit = 20): Promise<{
  items: Product[];
  total: number;
}> {
  const data = await apiRequest<ApiProductList>(
    `/products/search${buildQuery({ q, page, limit })}`
  );
  return { items: data.items.map(mapApiProduct), total: data.total };
}

export async function getRelatedProducts(productId: number | string): Promise<Product[]> {
  const data = await apiRequest<ApiProduct[]>(`/products/${productId}/related`);
  return data.map(mapApiProduct);
}
