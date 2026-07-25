import { apiRequest } from "@/lib/api";

export type ApiReview = {
  id: string;
  product_id: string;
  customer_id: string;
  customer_name: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
};

export async function listProductReviews(productId: string): Promise<ApiReview[]> {
  return apiRequest<ApiReview[]>(`/products/${productId}/reviews`);
}

export async function createReview(payload: {
  product_id: string;
  rating: number;
  title?: string | null;
  body?: string | null;
}): Promise<ApiReview> {
  return apiRequest<ApiReview>("/reviews", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
