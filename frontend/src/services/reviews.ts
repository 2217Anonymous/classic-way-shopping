import { apiRequest } from "@/lib/api";

export type ApiReview = {
  id: number;
  product_id: number;
  customer_id: number;
  customer_name: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
};

export async function listProductReviews(productId: number | string): Promise<ApiReview[]> {
  return apiRequest<ApiReview[]>(`/products/${productId}/reviews`);
}

export async function createReview(payload: {
  product_id: number;
  rating: number;
  title?: string | null;
  body?: string | null;
}): Promise<ApiReview> {
  return apiRequest<ApiReview>("/reviews", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
