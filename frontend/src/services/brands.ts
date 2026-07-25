import { apiRequest } from "@/lib/api";
import type { ApiBrand } from "./types";

export async function listBrands(): Promise<ApiBrand[]> {
  return apiRequest<ApiBrand[]>("/brands");
}
